import db from "@adonisjs/lucid/services/db";
import AccountPlan from "../../models/planbudject/account_plan.js";
import AccountPlanYear from "../../models/planbudject/account_plan_year.js";
import AccountPlanEntry from "../../models/planbudject/account_plan_entry.js";
import AccountPlanEntryEntry from "../../models/planbudject/account_plan_entry_entry.js";
import { EntryEntryType, OperatorType } from "../../models/utility/Enums.js";
import AccountPlanEntryValidator from "../../validators/planbudject/accountPlanEntryValidator.js";
import { AccountPlanEntryDTO as AccountPlanEntryDTO } from "./utils/dtos.js";
import { TransactionClientContract } from "@adonisjs/lucid/types/database";
import { DateTime } from "luxon";
import InternalRequest from "#models/request/internal_request";
import { captureRejectionSymbol } from "events";
import xlsx from "xlsx";

export default class AccountPlanEntryService {

    public async resolveActivePlanYear(preferredYear?: number): Promise<AccountPlanYear> {
        let found: AccountPlanYear | null = null;
        if (preferredYear && Number(preferredYear) >= 2000) {
            found = await AccountPlanYear.findBy('year', Number(preferredYear));
            if (!found) {
                found = await AccountPlanYear.create({
                    year: Number(preferredYear),
                    description: `Exercício Económico e Plano Orçamental ${Number(preferredYear)}`,
                });
            }
        } else {
            found = await AccountPlanYear.query().where('state', 2).first();
            if (!found) {
                found = await AccountPlanYear.findBy('year', 2026);
            }
            if (!found) {
                found = await AccountPlanYear.query().orderBy('year', 'desc').firstOrFail();
            }
        }
        await this.ensureYearStructureInitialized(found);
        return found;
    }

    public async ensureYearStructureInitialized(targetPlanYear: AccountPlanYear, trx?: TransactionClientContract) {
        const query = trx ? AccountPlanEntry.query({ client: trx }) : AccountPlanEntry.query();
        const existingCountResult = await query
            .where('account_plan_year_id', targetPlanYear.id)
            .count('id as total');
        const existingCount = Number(existingCountResult?.[0]?.$extras?.total || 0);
        if (existingCount > 0) {
            return;
        }

        // Encontrar ano de referência com estrutura completa (ex: 2025)
        const refYear = await AccountPlanYear.findBy('year', 2025) || await AccountPlanYear.query().orderBy('id', 'asc').first();
        if (!refYear || refYear.id === targetPlanYear.id) {
            return;
        }

        const refEntriesQuery = trx ? AccountPlanEntry.query({ client: trx }) : AccountPlanEntry.query();
        const refEntries = await refEntriesQuery
            .where('account_plan_year_id', refYear.id)
            .orderBy('id', 'asc');

        if (refEntries.length === 0) {
            return;
        }

        const oldEntryIdToNewEntryId = new Map<number, number>();
        const createdEntriesWithOldParent: Array<{ newEntry: AccountPlanEntry; oldParentId: number | null }> = [];

        for (const refEntry of refEntries) {
            const newEntry = new AccountPlanEntry();
            newEntry.fill({
                startPostingMonth: refEntry.startPostingMonth || 1,
                endPostingMonth: refEntry.endPostingMonth || 12,
                reservePercent: refEntry.reservePercent || 0,
                initialAllocation: 0,
                finalAllocation: 0,
                availableAllocation: 0,
                accountPlanYearId: targetPlanYear.id,
                accountPlanId: refEntry.accountPlanId,
                accountPlanNumber: refEntry.accountPlanNumber,
                accountPlanfinancialId: refEntry.accountPlanfinancialId,
                parentId: undefined,
            });
            if (trx) {
                await newEntry.useTransaction(trx).save();
            } else {
                await newEntry.save();
            }
            oldEntryIdToNewEntryId.set(refEntry.id, newEntry.id);
            createdEntriesWithOldParent.push({
                newEntry,
                oldParentId: refEntry.parentId || null,
            });
        }

        for (const item of createdEntriesWithOldParent) {
            if (item.oldParentId && oldEntryIdToNewEntryId.has(item.oldParentId)) {
                item.newEntry.parentId = oldEntryIdToNewEntryId.get(item.oldParentId)!;
                if (trx) {
                    await item.newEntry.useTransaction(trx).save();
                } else {
                    await item.newEntry.save();
                }
            }
        }
    }

    public async recalculateParentEntriesForYear(yearId: number, trx?: TransactionClientContract) {
        const entriesQuery = trx ? AccountPlanEntry.query({ client: trx }) : AccountPlanEntry.query();
        const entries = await entriesQuery
            .where('account_plan_year_id', yearId)
            .preload('accountPlan');

        const childrenMap = new Map<number, AccountPlanEntry[]>();
        for (const entry of entries) {
            if (entry.parentId) {
                const arr = childrenMap.get(entry.parentId) || [];
                arr.push(entry);
                childrenMap.set(entry.parentId, arr);
            }
        }

        const computeTotals = (entry: AccountPlanEntry): { init: number; final: number; avail: number } => {
            const children = childrenMap.get(entry.id) || [];
            if (children.length === 0) {
                return {
                    init: Number(entry.initialAllocation || 0),
                    final: Number(entry.finalAllocation || 0),
                    avail: Number(entry.availableAllocation || 0),
                };
            }
            let sumInit = 0;
            let sumFinal = 0;
            let sumAvail = 0;
            for (const child of children) {
                const childTotals = computeTotals(child);
                sumInit += childTotals.init;
                sumFinal += childTotals.final;
                sumAvail += childTotals.avail;
            }
            entry.initialAllocation = Number(sumInit.toFixed(2));
            entry.finalAllocation = Number(sumFinal.toFixed(2));
            entry.availableAllocation = Number(sumAvail.toFixed(2));
            return {
                init: entry.initialAllocation,
                final: entry.finalAllocation,
                avail: Number(sumAvail.toFixed(2)),
            };
        };

        const roots = entries.filter((e) => !e.parentId || !entries.some((p) => p.id === e.parentId));
        for (const root of roots) {
            computeTotals(root);
        }

        for (const entry of entries) {
            if ((childrenMap.get(entry.id) || []).length > 0) {
                if (trx) {
                    await entry.useTransaction(trx).save();
                } else {
                    await entry.save();
                }
            }
        }
    }

    public async createAccountPlanEntry(data: AccountPlanEntryDTO, accountPlan: AccountPlan, trx: TransactionClientContract) {

        await AccountPlanEntryValidator.validateOnCreate(data);
        const currentDate = new Date();

        const parsedDate = new Date(); // Converte string para Date
        if (isNaN(parsedDate.getTime())) {
            throw new Error("Data inválida fornecida para operationDate: " + data.operationDate);
        }

        const operationDate = DateTime.local(
            parsedDate.getFullYear(),
            parsedDate.getMonth() + 1, // Ajusta o mês
            parsedDate.getDate()
        );
        const currentPlanYear = await this.resolveActivePlanYear(currentDate.getFullYear());
        const parentEntry = await AccountPlanEntry.findBy('accountPlanNumber', data.parentAccountPlanNumber);

        if (!parentEntry) {
            throw Error("Entrada do Plano de conta de controle não encontrado no sistema para a conta " + data.accountPlanNumber);
        }

        const createdEntry = await new AccountPlanEntry().fill({
            accountPlanNumber: data.accountPlanNumber,
            startPostingMonth: data.startPostingMonth,
            endPostingMonth: data.endPostingMonth,
            reservePercent: 0,
            initialAllocation: data.initialAllocation,
            finalAllocation: data.initialAllocation,
            accountPlanYearId: currentPlanYear.id,
            accountPlanId: accountPlan.id,
            parentId: parentEntry.id,
        }).useTransaction(trx).save();

        const createdCreditEntryEntry = await new AccountPlanEntryEntry()
            .fill(
                {
                    type: EntryEntryType.INITIAL,
                    operator: OperatorType.CREDTI,
                    postingMonth: currentDate.getMonth(),
                    operationDate: operationDate,
                    allocation: data.initialAllocation,
                    lastFinalAllocation: 0,
                    entryId: createdEntry.id,
                    accountPlanYearId: currentPlanYear.id,
                }).useTransaction(trx).save();

        return createdCreditEntryEntry;
    }
    public async associateFinancialAccountWithBujectAccounts(data: { accountPlanFinancialNumber: string, accountPlanBujectsNumber: { accountPlanBujectNumber: string }[] }) {
        // Validar os dados de associação
        await AccountPlanEntryValidator.validateOnAssociate(data);

        // Buscar a conta financeira pelo número
        const foundAccountPlanFinancial = await AccountPlan.findByOrFail('number', data.accountPlanFinancialNumber);

        // Iniciar transação
        const trx = await db.transaction();

        try {
            // Loop para associar cada conta orçamentária
            for (const budjectAccount of data.accountPlanBujectsNumber) {
                // Garantir que o número do orçamento seja utilizado
                const budjectAccountPlan = await AccountPlan.findByOrFail('number', budjectAccount.accountPlanBujectNumber);

                // Verificar se a conta orçamentária já está associada a uma conta financeira
                const existingAssociation = await trx
                    .from('financial_budget_associations')
                    .where('budget_account_id', budjectAccountPlan.id)
                    .first();

                if (existingAssociation) {
                    throw new Error(`A conta orçamentária ${budjectAccount.accountPlanBujectNumber} já está associada a uma conta financeira.`);
                }

                // Registrar a associação na tabela 'financial_budget_associations' dentro da transação
                await trx
                    .table('financial_budget_associations')
                    .insert({
                        financial_account_id: foundAccountPlanFinancial.id,
                        budget_account_id: budjectAccountPlan.id,
                    });
            }

            // Commit da transação
            await trx.commit();
            return data;

        } catch (error) {
            // Reverter transação em caso de erro
            await trx.rollback();
            throw error;
        }
    }

    public async createAccountPlanEntryTest(data: AccountPlanEntryDTO) {

        await AccountPlanEntryValidator.validateOnCreate(data);

        const currentDate = new Date();
        const operationDate = DateTime.local(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
        const trx = await db.transaction()  // Start transaction
        try {
            const currentPlanbudject = await this.resolveActivePlanYear(currentDate.getFullYear());
            const accountPlan = await AccountPlan.findByOrFail('number', data.accountPlanNumber);

            const createdEntry = await new AccountPlanEntry().fill({
                startPostingMonth: data.startPostingMonth,
                endPostingMonth: data.endPostingMonth,
                reservePercent: 0,
                initialAllocation: data.initialAllocation,
                finalAllocation: data.initialAllocation,
                accountPlanYearId: currentPlanbudject.id,
                accountPlanId: accountPlan.id
            }).useTransaction(trx).save();

            const createdCreditEntryEntry = await new AccountPlanEntryEntry()
                .fill(
                    {
                        type: EntryEntryType.INITIAL,
                        operator: OperatorType.CREDTI,
                        postingMonth: currentDate.getMonth(),
                        operationDate: operationDate,
                        allocation: data.initialAllocation,
                        lastFinalAllocation: 0,
                        entryId: createdEntry.id,
                        accountPlanYearId: currentPlanbudject.id,
                    }).useTransaction(trx).save();

            await trx.commit();
            return createdCreditEntryEntry;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }


    public async initialAllocationAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date, year?: number }) {
        const activeYear = await this.resolveActivePlanYear(data.year);
        const entry = await this.findAccountPlanEntriesByYearAndNumber(activeYear.year, data.accountPlanNumber);

        if (entry && entry.finalAllocation !== 0) {
            throw Error("A dotacao inicial ja foi carregada para o plano de conta " + entry.finalAllocation);
        }

        return this.reinforceOrAnnulmentAccountPlanEntry(data, true, true);
    }
    public async conformInitialAllocation(data: any) {
        const trx = await db.transaction(); // Inicia a transação para garantir a atomicidade

        console.log("Dados recebidos para atualização:", data);

        try {
            const activeYear = await this.resolveActivePlanYear(data?.year);
            // Verificar se já existe conformidade para o 'type' específico no ano fiscal ativo
            const existingEntry = await AccountPlanEntryEntry
                .query()
                .where('type', 'initial_allocation')
                .andWhere('account_plan_year_id', activeYear.id)
                .andWhere('complianceStatus', 'CONFORMANCE')
                .first();


            if (existingEntry) {
                console.log("Tem dados já conformados", existingEntry);
                // Se já existe uma conformidade CONFORMANCE, lança um erro para interromper o processo
                throw new Error('A conformidade já está definida como CONFORMANCE para este exercício fiscal.');
            }
            // Preparar a consulta para a atualização
            const query = AccountPlanEntryEntry
                .query()
                .where('type', 'initial_allocation')
                .andWhere('account_plan_year_id', activeYear.id)
                .update({
                    complianceStatus: 'CONFORMANCE',
                    descriptionCompliance: data.observation,
                    approvedBy: data.userId,
                    complianceDate: new Date() // Data e hora atual
                });


            // Obter a consulta gerada com knexQuery()
            const sql = query.knexQuery.toString();
            console.log("Consulta gerada para execução:", sql);

            // Executar a consulta
            const updatedEntries = await query;

            console.log("Número de entradas atualizadas:", updatedEntries);

            if (updatedEntries.length > 0) {  // Verifica se há registros atualizados
                // Comitar a transação
                await trx.commit();
                return { message: `Conformidade de alocação inicial foi atualizada com sucesso em ${updatedEntries} entradas.` };
            } else {
                // Não há registros atualizados
                await trx.rollback();
                return { message: 'Nenhuma entrada foi atualizada. Verifique os critérios da consulta.' };
            }
        } catch (error) {
            // Se algo falhar, reverte a transação
            await trx.rollback();
            console.error("Erro durante a atualização:", error);
            throw new Error(`Erro ao atualizar a conformidade de alocação inicial: ${error.message}`);
        }
    }

    public async reinforceAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
        return this.reinforceOrAnnulmentAccountPlanEntry(data, true, false);
    }

    public async annullmentRequestEntry(data: { accountPlanNumber: string, value: number, operationDate: Date, requestNumber: string }) {
        return this.annullmentRequestEntryPaid(data, true, false);
    }

    public async annulAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
        return this.reinforceOrAnnulmentAccountPlanEntry(data, false, false);
    }

    public async redistribuitioReinforcimentAccountPlanEntry(data: {
        destinationAccounts: {
            targetAccountPlanNumber: string,
            value: number
        }[],
        totalValue: number,
        type: string,
        motivo?: string,
        originAccountPlanNumber: string,
        operationDate: Date
    }) {
        return this.redistributeReinforeOrAnnulmentAccountPlanEntry(data, true);
    }


    public async redistributeAnnulmentAccountPlanEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string, operationDate: Date }) {
        return this.redistributeReinforeOrAnnulmentAccountPlanEntry(data, false);
    }

    private async reinforceOrAnnulmentAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }, isReinforce: boolean, isInitialAlocation: boolean) {

        // Validate input value
        if (data.value <= 0) {
            throw new Error("O valor não pode ser negativo ou zero.");
        }

        const currentDate = new Date();
        // const operationDate = DateTime.local(data.operationDate.getFullYear(), data.operationDate.getMonth(), data.operationDate.getDate());
        const parsedDate = new Date(data.operationDate); // Converte string para Date
        if (isNaN(parsedDate.getTime())) {
            throw new Error("Data inválida fornecida para operationDate: " + data.operationDate);
        }

        const operationDate = DateTime.local(
            parsedDate.getFullYear(),
            parsedDate.getMonth() + 1, // Ajusta o mês
            parsedDate.getDate()
        );
        console.log("Data Local", operationDate)
        const trx = await db.transaction()  // Start transaction
        try {

            const currentPlanYear = await this.resolveActivePlanYear((data as any)?.year);

            let entry = await this.findAccountPlanEntriesByYearAndNumber(currentPlanYear.year, data.accountPlanNumber);

            if (!entry) {
                throw Error("Plano de conta não encontrado no sistema com a conta " + data.accountPlanNumber);
            }

            let entryEntryType;
            let entryEntryOperator;
            let entryfinalAllocation;
            let availableAllocation;

            if (isReinforce) {
                entryEntryType = isInitialAlocation ? EntryEntryType.INITIAL_ALLOCATION : EntryEntryType.REINFORCEMENT;
                entryEntryOperator = OperatorType.CREDTI;
                entryfinalAllocation = entry.finalAllocation + data.value;

                // const saldoExistente = Number(entry.finalAllocation) - Number(entry.finalAllocation * 0.05)
                const saldoExistente = Number(entry.finalAllocation);
                const saldoAposReforco = entryfinalAllocation;
                const resultAddAvaliaveAllocation = saldoAposReforco - saldoExistente;

                // const percent = entryfinalAllocation * 0.05;
                const availableAllocationNumber = Number(entry.availableAllocation);
                availableAllocation = availableAllocationNumber + resultAddAvaliaveAllocation


            } else {
                // Anulação
                entryEntryType = EntryEntryType.ANNULMENT;
                entryEntryOperator = OperatorType.DEBIT;
                entryfinalAllocation = entry.finalAllocation - data.value;

                // Cálculo do saldo existente e novo saldo após a anulação
                // const saldoExistente = Number(entry.finalAllocation) - Number(entry.finalAllocation * 0.05);
                // const saldoAposAnulacao = entryfinalAllocation - (entryfinalAllocation * 0.05);
                // const resultReduceAvailableAllocation = saldoExistente - saldoAposAnulacao;

                // const availableAllocationNumber = Number(entry.availableAllocation);
                // availableAllocation = availableAllocationNumber - resultReduceAvailableAllocation;
                availableAllocation = entryfinalAllocation;

                console.log("entryfinalAllocation antes do cálculo:", entryfinalAllocation);
                // console.log("saldoExistente", saldoExistente);
                // console.log("saldoAposAnulacao:", saldoAposAnulacao);
                // console.log("resultAddAvaliaveAllocation", resultReduceAvailableAllocation);
                // console.log("availableAllocationNumber:", availableAllocationNumber);
                console.log("availableAllocation:", availableAllocation);

                if (entryfinalAllocation < 0) {
                    throw Error(" Não pode efectuar a anulação, o valor da conta "
                        + data.accountPlanNumber + " é insuficiente para anular " + data.value
                        + ". O valor actual é " + entry.finalAllocation)
                }
            }

            await new AccountPlanEntryEntry()
                .fill(
                    {
                        type: entryEntryType,
                        operator: entryEntryOperator,
                        postingMonth: currentDate.getMonth(),
                        operationDate: operationDate,
                        allocation: data.value,
                        lastFinalAllocation: entry.finalAllocation,
                        entryId: entry.id,
                        accountPlanYearId: currentPlanYear.id,
                    }).useTransaction(trx).save();

            entry.finalAllocation = entryfinalAllocation
            entry.availableAllocation = availableAllocation
            if (isInitialAlocation === true) {
                entry.initialAllocation = entryfinalAllocation
            }

            console.log("dados", availableAllocation, entryfinalAllocation)
            const updatedEntry = await entry.useTransaction(trx)
                .save();

            await this.updateParentsAccountPlanEntriesByChildOther(updatedEntry, data.value, isReinforce, isInitialAlocation, trx);

            await trx.commit();
            return updatedEntry;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }


    private async annullmentRequestEntryPaid(data: {
        accountPlanNumber: string,
        value: number,
        operationDate: Date,
        requestNumber: string
    }, isReinforce: boolean, isInitialAlocation: boolean) {

        // Validate input value
        if (data.value <= 0) {
            throw new Error("O valor não pode ser negativo ou zero.");
        }

        const currentDate = new Date();
        const parsedDate = new Date(data.operationDate);

        if (isNaN(parsedDate.getTime())) {
            throw new Error("Data inválida fornecida para operationDate: " + data.operationDate);
        }

        const operationDate = DateTime.local(
            parsedDate.getFullYear(),
            parsedDate.getMonth() + 1,
            parsedDate.getDate()
        );

        console.log("Data Local", operationDate);
        const trx = await db.transaction();  // Start transaction

        try {
            if (!data.requestNumber) {
                throw new Error('requestNumber não pode ser vazio');
            }

            const currentPlanYear = await this.resolveActivePlanYear((data as any)?.year);
            let entry = await this.findAccountPlanEntriesByYearAndNumber(currentPlanYear.year, data.accountPlanNumber);

            if (!entry) {
                throw Error("Plano de conta não encontrado no sistema com a conta " + data.accountPlanNumber);
            }

            let entryEntryType;
            let entryEntryOperator;
            let entryfinalAllocation;
            let availableAllocation;

            if (isReinforce) {
                // Reinforcement operation
                entryEntryType = isInitialAlocation ? EntryEntryType.INITIAL_ALLOCATION : EntryEntryType.REINFORCEMENT;
                entryEntryOperator = OperatorType.CREDTI;
                entryfinalAllocation = entry.finalAllocation + data.value;
                availableAllocation = Number(entryfinalAllocation);
            } else {
                // Annulment operation
                entryEntryType = EntryEntryType.ANNULMENT;
                entryEntryOperator = OperatorType.DEBIT;
                entryfinalAllocation = entry.finalAllocation - data.value;
                availableAllocation = Number(entryfinalAllocation);

                console.log("entryfinalAllocation:", entryfinalAllocation);
                console.log("availableAllocation:", availableAllocation);

                // Validate if the account has sufficient balance
                if (entryfinalAllocation < 0) {
                    throw Error("Não pode efectuar a anulação, o valor da conta "
                        + data.accountPlanNumber + " é insuficiente para anular " + data.value
                        + ". O valor actual é " + entry.finalAllocation);
                }
            }

            // Create account plan entry
            await new AccountPlanEntryEntry()
                .fill({
                    type: entryEntryType,
                    operator: entryEntryOperator,
                    postingMonth: currentDate.getMonth(),
                    operationDate: operationDate,
                    allocation: data.value,
                    lastFinalAllocation: entry.finalAllocation,
                    entryId: entry.id,
                    accountPlanYearId: currentPlanYear.id,
                }).useTransaction(trx).save();

            // Update internal request status
            const updatedEntries = await InternalRequest
                .query()
                .where('requestNumber', data.requestNumber)
                .update({
                    isAnnulled: true
                });

            console.log("Número de entradas atualizadas:", updatedEntries);

            // Update account balances
            entry.finalAllocation = entryfinalAllocation;
            entry.availableAllocation = availableAllocation;

            console.log("dados", availableAllocation, entryfinalAllocation);
            const updatedEntry = await entry.useTransaction(trx).save();

            // Update parent accounts
            await this.updateParentsAccountPlanEntriesByChild(updatedEntry, data.value, isReinforce, trx);

            await trx.commit();
            return updatedEntry;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }




    public async redistributeReinforeOrAnnulmentAccountPlanEntry(data: {
        originAccountPlanNumber: string,
        value: number,
        destinationAccounts: {
            targetAccountPlanNumber: string,
            value: number
        }[],
        operationDate: Date,
        motivo: string
    }, isRedistributeReinforcement: boolean) {

        console.log("Data", data)
        if (!data.operationDate) {
            throw new Error("A data de operação é obrigatória e não pode ser nula ou indefinida.");
        }

        // Validate input values
        if (data.value <= 0) {
            throw new Error("O valor principal não pode ser negativo ou zero.");
        }

        for (const destination of data.destinationAccounts) {
            if (destination.value <= 0) {
                throw new Error(`O valor não pode ser negativo ou zero.`);
            }
        }

        const currentDate = new Date();
        const operationDate = DateTime.local(data.operationDate.getFullYear(), data.operationDate.getMonth() + 1, data.operationDate.getDate());
        const trx = await db.transaction();  // Start transaction

        try {
            if (!data.destinationAccounts || data.destinationAccounts.length === 0) {
                throw Error("Deve haver pelo menos uma conta de destino.");
            }

            const currentPlanbudject = await this.resolveActivePlanYear((data as any)?.year);

            let originEntry = await this.findAccountPlanEntriesByYearAndNumber(currentPlanbudject.year, data.originAccountPlanNumber);
            if (!originEntry) {
                throw Error("Plano de conta não encontrado no sistema com a conta " + data.originAccountPlanNumber);
            }

            // Verificar se todas as contas de destino existem
            for (const destination of data.destinationAccounts) {
                let targetEntry = await this.findAccountPlanEntriesByYearAndNumber(currentPlanbudject.year, destination.targetAccountPlanNumber);
                if (!targetEntry) {
                    throw Error("Plano de conta não encontrado no sistema com a conta " + destination.targetAccountPlanNumber);
                }
            }

            for (const destination of data.destinationAccounts) {
                let originEntryEntryType, originEntryEntryOperator, originEntryfinalAllocation;
                let targetEntryEntryType, targetEntryEntryOperator;
                let targetEntryfinalAllocation: number;

                const valueToTransfer = destination.value;

                // Certifique-se de que targetEntry é carregado corretamente
                const targetEntry = await this.findAccountPlanEntriesByYearAndNumber(currentPlanbudject.year, destination.targetAccountPlanNumber);
                if (!targetEntry) {
                    throw new Error("A conta de destino não foi encontrada para o número: " + destination.targetAccountPlanNumber);
                }

                if (isRedistributeReinforcement) {
                    // Para a origem
                    originEntryEntryType = EntryEntryType.REDISTRIBUITION_ANNULMENT;
                    originEntryEntryOperator = OperatorType.DEBIT;
                    originEntryfinalAllocation = originEntry.finalAllocation - valueToTransfer;

                    const availableAllocationOrigemNumber = Number(originEntry.availableAllocation);
                    originEntry.availableAllocation = availableAllocationOrigemNumber - valueToTransfer;

                    // Verifica se a conta origem tem saldo suficiente
                    if (originEntryfinalAllocation < 0) {
                        throw new Error(
                            "Valor superior ao orçamento disponível na conta de origem."
                        );
                    }

                    // Para o destino
                    targetEntryEntryType = EntryEntryType.REDISTRIBUITION_REINFORCEMENT;
                    targetEntryEntryOperator = OperatorType.CREDTI;
                    targetEntryfinalAllocation = targetEntry.finalAllocation + valueToTransfer;

                    const availableAllocationDestinoNumber = Number(targetEntry.availableAllocation);
                    targetEntry.availableAllocation = availableAllocationDestinoNumber + valueToTransfer;
                } else {
                    // Para a origem
                    originEntryEntryType = EntryEntryType.REDISTRIBUITION_ANNULMENT;
                    originEntryEntryOperator = OperatorType.DEBIT;
                    originEntryfinalAllocation = originEntry.finalAllocation - valueToTransfer;

                    const availableAllocationOrigemNumber = Number(originEntry.availableAllocation);
                    originEntry.availableAllocation = availableAllocationOrigemNumber - valueToTransfer;

                    // Para o destino
                    targetEntryEntryType = EntryEntryType.REDISTRIBUITION_REINFORCEMENT;
                    targetEntryEntryOperator = OperatorType.CREDTI;
                    targetEntryfinalAllocation = targetEntry.finalAllocation + valueToTransfer;

                    const availableAllocationDestinoNumber = Number(targetEntry.availableAllocation);
                    targetEntry.availableAllocation = availableAllocationDestinoNumber + valueToTransfer;

                    if (originEntryfinalAllocation < 0) {
                        throw Error("Não pode efectuar a redistribuição da anulação para a conta " + data.originAccountPlanNumber + ", no valor de "
                            + valueToTransfer + ". O valor actual é " + originEntry.finalAllocation);
                    }
                }

                // Criação da entrada para origem e destino
                const createdOriginEntryEntry = await new AccountPlanEntryEntry().fill({
                    type: originEntryEntryType,
                    operator: originEntryEntryOperator,
                    postingMonth: currentDate.getMonth(),
                    operationDate: operationDate,
                    allocation: valueToTransfer,
                    lastFinalAllocation: originEntry.finalAllocation,
                    entryId: originEntry.id,
                    accountPlanYearId: currentPlanbudject.id,
                    descriptionMoviment: data.motivo,
                }).useTransaction(trx).save();

                const createdTargetEntryEntry = await createdOriginEntryEntry.related('targetEntrieEntry').create({
                    type: targetEntryEntryType,
                    operator: targetEntryEntryOperator,
                    postingMonth: currentDate.getMonth(),
                    operationDate: operationDate,
                    allocation: valueToTransfer,
                    lastFinalAllocation: targetEntry.finalAllocation,
                    entryId: targetEntry.id,
                    accountPlanYearId: currentPlanbudject.id,
                    target_entrie_entry_id: createdOriginEntryEntry.id,
                    descriptionMoviment: data.motivo,
                });

                // Atualizar os saldos finais
                originEntry.finalAllocation = originEntryfinalAllocation;
                targetEntry.finalAllocation = targetEntryfinalAllocation;

                await createdOriginEntryEntry.useTransaction(trx).save();
                await createdTargetEntryEntry.useTransaction(trx).save();

                await originEntry.useTransaction(trx).save();
                await targetEntry.useTransaction(trx).save();

                if (originEntry.id != targetEntry.id) {
                    await this.updateParentsAccountPlanEntriesByChild(originEntry, valueToTransfer, false, trx);
                    await this.updateParentsAccountPlanEntriesByChild(targetEntry, valueToTransfer, true, trx);
                }
            }

            await trx.commit();
            return { status: 'success' };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }


    public async updateParentsAccountPlanEntriesByChildOther(
        child: AccountPlanEntry,
        value: number,
        isCredit: boolean,
        isInitialAlocation: boolean,
        trx: TransactionClientContract
    ) {
        const parentId = child.parentId;

        console.log("[DEBUG] data.newValue: Recebido Para Actualizar ", value);

        if (!parentId) {
            console.log(`[⛔] child.id=${child.id} não tem parentId. Encerrando propagação.`);
            return;
        }

        const parent = await AccountPlanEntry.query({ client: trx })
            .where('id', parentId)
            .first();

        if (!parent) {
            console.log(`[⚠️] Pai com ID=${parentId} não encontrado.`);
            return;
        }

        // Atualiza a alocação final do pai com base no tipo de operação
        if (isInitialAlocation) {
            // Para alocação inicial, atualizamos ambos initial e final
            parent.initialAllocation = isCredit
                ? Number(parent.initialAllocation) + value
                : Number(parent.initialAllocation) - value;

            parent.finalAllocation = isCredit
                ? Number(parent.finalAllocation) + value
                : Number(parent.finalAllocation) - value;
        } else {
            // Para operações normais, atualizamos apenas o final
            parent.finalAllocation = isCredit
                ? Number(parent.finalAllocation) + value
                : Number(parent.finalAllocation) - value;
        }

        // Log para debug
        console.log(`[🔁] Atualizando pai ID=${parent.id} para child.id=${child.id}`);
        console.log(`[📊] Valores atualizados:`);
        console.log(`- initialAllocation: ${parent.initialAllocation}`);
        console.log(`- finalAllocation: ${parent.finalAllocation}`);
        console.log(`[📊] Operação: ${isCredit ? '+' : '-'} ${value}`);

        try {
            // Salva o pai com uso da transação
            await parent.useTransaction(trx).save();
            console.log(`[💾] Pai ID=${parent.id} salvo com sucesso.`);

            // Chamada recursiva para o próximo nível da hierarquia
            await this.updateParentsAccountPlanEntriesByChildOther(
                parent,
                value,
                isCredit,
                isInitialAlocation,
                trx
            );
        } catch (error) {
            console.error(`[❌] Erro ao atualizar pai ID=${parent.id}:`, error);
            throw error;
        }
    }


    public async updateParentsAccountPlanEntriesByChild(
        child: AccountPlanEntry,
        value: number,
        isCredit: boolean,
        trx: TransactionClientContract
    ) {
        const parentId = child.parentId;

        console.log("[DEBUG] data.newValue: Recebido Para Actualizar ", value);


        if (!parentId) {
            console.log(`[⛔] child.id=${child.id} não tem parentId. Encerrando propagação.`);
            return;
        }

        const parent = await AccountPlanEntry.query().where('id', parentId).first();

        if (!parent) {
            console.log(`[⚠️] Pai com ID=${parentId} não encontrado.`);
            return;
        }

        const previousFinalAllocation = parent.finalAllocation;

        // Atualiza a alocação final do pai com base no tipo de operação
        parent.finalAllocation = isCredit
            ? previousFinalAllocation + value
            : previousFinalAllocation - value;

        // Log para debug
        console.log(`[🔁] Atualizando pai ID=${parent.id} para child.id=${child.id}`);
        console.log(`[📊] finalAllocation anterior: ${previousFinalAllocation}`);
        console.log(`[📊] Operação: ${isCredit ? '+' : '-'} ${value}`);
        console.log(`[📊] finalAllocation atualizado: ${parent.finalAllocation}`);

        // Salva o pai com uso da transação
        await parent.useTransaction(trx).save();
        console.log(`[💾] Pai ID=${parent.id} salvo com sucesso.`);

        // Chamada recursiva para o próximo nível da hierarquia
        await this.updateParentsAccountPlanEntriesByChild(parent, value, isCredit, trx);
    }


    public async updateParentsAccountPlanEntriesByChildNew(
        child: AccountPlanEntry,
        value: number,
        lastValue: number,
        isCredit: boolean,
        trx: TransactionClientContract
    ) {
        const parentId = child.parentId;

        console.log("[DEBUG] data.newValue: Recebido Para Actualizar ", value);


        if (!parentId) {
            console.log(`[⛔] child.id=${child.id} não tem parentId. Encerrando propagação.`);
            return;
        }

        const parent = await AccountPlanEntry.query().where('id', parentId).first();

        if (!parent) {
            console.log(`[⚠️] Pai com ID=${parentId} não encontrado.`);
            return;
        }

        const previousFinalAllocation = parent.finalAllocation;

        // Atualiza a alocação final do pai com base no tipo de operação
        parent.finalAllocation = isCredit
            ? previousFinalAllocation - lastValue + value
            : previousFinalAllocation + value - lastValue;

        parent.initialAllocation = isCredit
            ? previousFinalAllocation - lastValue + value
            : previousFinalAllocation + value - lastValue;

        // Log para debug
        console.log(`[🔁] Atualizando pai ID=${parent.id} para child.id=${child.id}`);
        console.log(`[📊] finalAllocation anterior: ${previousFinalAllocation}`);
        console.log(`[📊] Operação: ${isCredit ? '+' : '-'} ${value}`);
        console.log(`[📊] finalAllocation atualizado: ${parent.finalAllocation}`);

        // Salva o pai com uso da transação
        await parent.useTransaction(trx).save();
        console.log(`[💾] Pai ID=${parent.id} salvo com sucesso.`);

        // Chamada recursiva para o próximo nível da hierarquia
        await this.updateParentsAccountPlanEntriesByChildNew(parent, value, lastValue, isCredit, trx);
    }



    public async findParentsAccountPlanEntriesByChild(child: AccountPlanEntry, parents: AccountPlanEntry[]) {
        const parentId = child.parentId;
        if (parentId) {
            const parent = await AccountPlanEntry.query().where('id', parentId).first();
            if (parent) {
                parents.fill(parent);
                await this.findParentsAccountPlanEntriesByChild(parent, parents)
            } else {
                return
            };
        }
        return parents;
    }


    public async findAccountPlanEntriesByYearAndNumber(year: number, accountPlanNumber: string) {
        const activePlanYear = await this.resolveActivePlanYear(year);
        console.log("accountPlanNumberaccountPlanNumber", activePlanYear.year, accountPlanNumber);

        // Exibir a consulta SQL gerada
        const query = AccountPlanEntry.query()
            .where('accountPlanNumber', accountPlanNumber)
            .whereHas('accountPlanYear', (accountPlanBudjectBuilder) => {
                accountPlanBudjectBuilder.where('year', activePlanYear.year);
            })
            .whereHas('accountPlan', (accountPlanBuilder) => {
                accountPlanBuilder.where('number', accountPlanNumber);
            });

        console.log("SQL gerada:", query.toSQL());

        const entry = await query.first();

        console.log("accountPlanNumberaccountPlanNumberentry", entry);

        // Carregar a relação 'accountPlan' explicitamente após a consulta
        if (entry) {
            await entry.load('accountPlan');

            // Acessar os atributos do accountPlan
            const accountPlan = entry.accountPlan;
            console.log("Atributos do accountPlan:", accountPlan.$attributes);
        }

        return entry;
    }


    public async findAccountPlanEntriesEntryByYearAndAccountId(year: number, entryId: number) {
        const activePlanYear = await this.resolveActivePlanYear(year);
        const entriesEntry = await AccountPlanEntryEntry.query()
            .where('entry_id', entryId)
            .where('type', "initial_allocation")
            .whereHas('accountPlanYear', (accountPlanBudjectBuilder) => {
                accountPlanBudjectBuilder.where('year', activePlanYear.year);
            })
            .first();

        return entriesEntry;
    }



    // public async findAccountPlanEntriesByYearAndNumber(year: number, accountPlanNumber: string) {
    //     return await AccountPlanEntry.query().where('accountPlanNumber', accountPlanNumber)
    //         .whereHas('accountPlanYear', (accountPlanBudjectBuilder) => {
    //             accountPlanBudjectBuilder.where('year', year);
    //         }).whereHas('accountPlan', (accountPlanBuilder) => {
    //             accountPlanBuilder.where('number', accountPlanNumber);
    //         }).first()
    // }


    public async correctAccountPlanEntryValue(data: {
        accountPlanNumber: string,
        newValue: number,
        isInitialAllocation: boolean
    }) {
        console.log("[1] Iniciando correctAccountPlanEntryValue - Dados recebidos:", JSON.stringify(data, null, 2));

        if (data.newValue < 0) {
            throw new Error("O valor não pode ser negativo.");
        }

        // Validação básica do formato de entrada
        if (typeof data.accountPlanNumber !== 'string' || typeof data.newValue !== 'number' || typeof data.isInitialAllocation !== 'boolean') {
            console.error("[ERRO] Formato inválido nos dados recebidos.");
            throw new Error("Dados de entrada inválidos. Esperado: { accountPlanNumber: string, newValue: number, isInitialAllocation: boolean }");
        }

        console.log("[2] Criando timestamp atual...");
        const currentDate = new Date();
        console.log("[3] Data atual:", currentDate.toISOString());

        const trx = await db.transaction();
        console.log("[4] Transação iniciada");

        try {
            const activePlanYear = await this.resolveActivePlanYear((data as any)?.year);
            console.log("[5] Buscando entrada do plano de conta para o ano:", activePlanYear.year, "e conta:", data.accountPlanNumber);

            const entry = await this.findAccountPlanEntriesByYearAndNumber(
                activePlanYear.year,
                data.accountPlanNumber
            );

            if (!entry) {
                throw new Error("Plano de conta não encontrado para o número fornecido.");
            }

            const isCredit = data.newValue > entry.finalAllocation;
            console.log("[DEBUG] isCredit: ", isCredit);
            console.log("[DEBUG] data.newValue: novo ", data.newValue);

            console.log("[DEBUG] data.newValue: anterior ", entry.finalAllocation);

            const entriesEntry = await this.findAccountPlanEntriesEntryByYearAndAccountId(
                activePlanYear.year,
                entry.id
            );

            console.log("entry.id", entry.id);



            console.log("[6] Resultado da busca:", entry ? "Encontrado" : "Não encontrado");
            if (!entry) {
                const errorMsg = `Plano de conta não encontrado com a conta: ${data.accountPlanNumber}`;
                console.error("[7] ERRO:", errorMsg);
                throw new Error(errorMsg);
            }

            console.log("[8] Calculando valores corrigidos...");
            const correctedFinalAllocation = data.newValue;
            // const correctedAvailableAllocation = correctedFinalAllocation - (correctedFinalAllocation * 0.05);
            console.log("[9] Valores calculados:", {
                finalAllocation: correctedFinalAllocation,
                availableAllocation: correctedFinalAllocation
            });

            console.log("[10] Atualizando valores... isInitialAllocation:", data.isInitialAllocation);
            if (data.isInitialAllocation) {
                console.log("[11] Atualizando initialAllocation para:", correctedFinalAllocation);
                entry.initialAllocation = correctedFinalAllocation;
            }

            console.log("[12] Atualizando finalAllocation e availableAllocation");
            const lastValue = entry.finalAllocation;
            entry.finalAllocation = correctedFinalAllocation;
            // entry.availableAllocation = correctedAvailableAllocation;
            entry.availableAllocation = correctedFinalAllocation;


            console.log("[13] Salvando entrada atualizada...");
            const updatedEntry = await entry.useTransaction(trx).save();
            console.log("[14] Entrada atualizada com sucesso:", JSON.stringify(updatedEntry, null, 2));

            if (data.newValue === lastValue) {
                return updatedEntry;
            }


            if (!entriesEntry) {
                throw new Error("Entrada não encontrada para o número fornecido.");
            }
            entriesEntry.allocation = correctedFinalAllocation;
            const updatedEntriesEntry = await entriesEntry.useTransaction(trx).save();
            console.log("[✅ ATUALIZAÇÃO SUCESSO] Entrada atualizada:", updatedEntriesEntry.toJSON(), correctedFinalAllocation);


            console.log("[15] Propagando atualização para contas pais...");

            if (data.newValue === 0) {
                await this.updateParentsAccountPlanEntriesByChildNew(updatedEntry, lastValue, lastValue, false, trx);
                await trx.commit();
                return updatedEntry;
            }

            await this.updateParentsAccountPlanEntriesByChildNew(updatedEntry, data.newValue, lastValue, isCredit, trx);
            console.log("[16] Atualização dos pais concluída");

            console.log("[17] Efetuando commit da transação...");
            await trx.commit();
            console.log("[18] Transação commitada com sucesso");

            return updatedEntry;
        } catch (error) {
            console.error("[ERRO CRÍTICO] Detalhes do erro:", {
                message: error.message,
                stack: error.stack,
                data: JSON.stringify(data, null, 2)
            });

            console.log("[ROLLBACK] Iniciando rollback da transação...");
            await trx.rollback();
            console.log("[ROLLBACK COMPLETO] Transação revertida");

            throw error;
        } finally {
            console.log("[FINALIZAÇÃO] Processo concluído (com ou sem erros)");
        }
    }


    public async setInitialAllocationApprovalDate(data: { date: Date }) {

        if (!(data.date instanceof Date)) {
            console.error("[ERRO] Formato inválido para data recebida.");
            throw new Error("Data inválida. Esperado: { date: Date }");
        }
        const trx = await db.transaction();

        try {
            const activePlanYear = await this.resolveActivePlanYear((data as any)?.year);
            const entries = await AccountPlanEntryEntry
                .query({ client: trx })
                .where('type', 'initial_allocation')
                .where('account_plan_year_id', activePlanYear.id);

            if (entries.length === 0) {
                throw new Error("Nenhuma entrada do tipo 'initial_allocation' encontrada para o exercício selecionado.");
            }
            const updatedCount = await AccountPlanEntryEntry
                .query({ client: trx })
                .where('type', 'initial_allocation')
                .where('account_plan_year_id', activePlanYear.id)
                .update({
                    initialAllocationApprovalDate: data.date
                });
            console.log("[6] Registros atualizados:", updatedCount);
            await trx.commit();
            console.log("[8] Transação commitada com sucesso");
            return {
                success: true,
                updatedCount
            };
        } catch (error) {
            console.error("[ERRO CRÍTICO] Detalhes do erro:", {
                message: error.message,
                stack: error.stack,
                data: JSON.stringify(data, null, 2)
            });

            console.log("[ROLLBACK] Iniciando rollback da transação...");
            await trx.rollback();
            console.log("[ROLLBACK COMPLETO] Transação revertida");

            throw error;
        } finally {
            console.log("[FINALIZAÇÃO] Processo concluído (com ou sem erros)");
        }
    }

    public async importInitialAllocationsFromExcel(options?: {
        filePath?: string;
        allocations?: Array<{
            code: string;
            description: string;
            valueUsd: number;
            contraValorMzn?: number;
        }>;
        year?: number;
    }) {
        const targetPath = options?.filePath || 'D:\\Projectos\\SGF\\1-PLANO E ORCAMENTO.xlsx';

        const normalizeDesc = (str?: string): string => {
            if (!str) return '';
            let s = str
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            s = s.replace(/\bretroativos\b/g, 'retroactivos');
            s = s.replace(/\bbibliotecario\b/g, 'bibliografico');
            s = s.replace(/\buso gera\b/g, 'uso geral');
            s = s.replace(/\badminstrativo\b/g, 'administrativo');
            s = s.replace(/\bpremiacao\b/g, 'premiacoes');
            return s;
        };

        const prefixMatchScore = (codeA?: string, codeB?: string): number => {
            if (!codeA || !codeB) return 0;
            const partsA = codeA.split('.');
            const partsB = codeB.split('.');
            let score = 0;
            for (let i = 0; i < Math.min(partsA.length, partsB.length); i++) {
                if (partsA[i] === partsB[i]) score++;
                else break;
            }
            return score;
        };

        let rawAllocations = options?.allocations;
        let detectedSheetName = 'ORCAMENTO ANUAL';

        if (!rawAllocations || rawAllocations.length === 0) {
            const xlsxLib: any = (xlsx as any).default || xlsx;
            const workbook = xlsxLib.readFile(targetPath);
            const sheetName =
                workbook.SheetNames.find((s: string) => s.trim().toUpperCase() === 'ORCAMENTO ANUAL') ||
                workbook.SheetNames.find((s: string) => s.trim().toUpperCase() === 'ORCAMENTO DISPONIVEL') ||
                workbook.SheetNames.find((s: string) => s.trim().toUpperCase() === 'TABELA DE DESPESAS') ||
                workbook.SheetNames[0];
            detectedSheetName = sheetName;
            const worksheet = workbook.Sheets[sheetName];
            const data: any[][] = xlsxLib.utils.sheet_to_json(worksheet, { header: 1 });

            let headerRowIdx = -1;
            let colCode = 0;
            let colDesc = 1;
            let colMzn = -1;
            let colUsd = -1;

            for (let i = 0; i < Math.min(15, data.length); i++) {
                const row = data[i];
                if (!row) continue;
                const rowStr = row.map((c: any) => String(c || '').toLowerCase()).join(' ');
                if (
                    rowStr.includes('código') ||
                    rowStr.includes('codigo') ||
                    rowStr.includes('designação') ||
                    rowStr.includes('designacao')
                ) {
                    headerRowIdx = i;
                    row.forEach((cell: any, idx: number) => {
                        const c = String(cell || '').toLowerCase();
                        if (c.includes('código') || c.includes('codigo')) colCode = idx;
                        else if (c.includes('designação') || c.includes('designacao') || c.includes('rubrica')) colDesc = idx;
                        else if (c.includes('usd') || c.includes('dólar') || c.includes('dolar')) {
                            if (colUsd === -1) colUsd = idx;
                        } else if ((c.includes('mzn') || c.includes('contra') || c.includes('meticais')) && !c.includes('duod')) {
                            if (colMzn === -1) colMzn = idx;
                        }
                    });

                    // Check sub-header row (e.g. Row 6 in 1-PLANO E ORCAMENTO.xlsx: [null, null, 'USD', 'Contra Valor', 'Contra Valor'])
                    const nextRow = data[i + 1];
                    if (nextRow) {
                        const nextRowStr = nextRow.map((c: any) => String(c || '').toLowerCase()).join(' ');
                        if (nextRowStr.includes('usd') || nextRowStr.includes('contra') || nextRowStr.includes('mzn')) {
                            nextRow.forEach((cell: any, idx: number) => {
                                const c = String(cell || '').toLowerCase();
                                const parentHeader = String(row[idx] || '').toLowerCase();
                                if (parentHeader.includes('duod')) return;
                                if ((c.includes('usd') || c.includes('dólar') || c.includes('dolar')) && colUsd === -1) {
                                    colUsd = idx;
                                } else if ((c.includes('mzn') || c.includes('contra') || c.includes('meticais')) && colMzn === -1) {
                                    colMzn = idx;
                                }
                            });
                            headerRowIdx = i + 1;
                        }
                    }
                    break;
                }
            }

            const parseNum = (val: any): number => {
                if (typeof val === 'number') return val;
                if (!val) return 0;
                const clean = String(val).replace(/,/g, '').replace(/\s/g, '').trim();
                return parseFloat(clean) || 0;
            };

            const startIdx = headerRowIdx >= 0 ? headerRowIdx + 1 : 7;
            rawAllocations = [];

            for (let i = startIdx; i < data.length; i++) {
                const row = data[i];
                if (!row || row.length === 0) continue;
                const code = row[colCode] ? String(row[colCode]).trim() : '';
                const desc = row[colDesc] ? String(row[colDesc]).trim() : '';

                if (
                    desc &&
                    (desc.toLowerCase().includes('total') ||
                        desc.includes('CÂMBIO') ||
                        desc === 'Designação' ||
                        desc.includes('Orçamento Disponível'))
                ) {
                    continue;
                }

                let valMzn = 0;
                let valUsd = 0;

                if (colUsd >= 0 && row[colUsd] !== undefined) {
                    valUsd = parseNum(row[colUsd]);
                    valMzn = colMzn >= 0 && row[colMzn] !== undefined ? parseNum(row[colMzn]) : valUsd * 2.5;
                } else if (colMzn >= 0 && row[colMzn] !== undefined) {
                    valMzn = parseNum(row[colMzn]);
                    valUsd = valMzn / 2.5;
                } else {
                    valMzn = parseNum(row[2]);
                    valUsd = valMzn / 2.5;
                }

                if (code || desc) {
                    rawAllocations.push({
                        code,
                        description: desc,
                        valueUsd: Number(valUsd.toFixed(2)),
                        contraValorMzn: Number(valMzn.toFixed(2)),
                    });
                }
            }
        }

        const trx = await db.transaction();
        try {
            const activeYear = await this.resolveActivePlanYear(options?.year);

            // Bloquear importação caso a Dotação Orçamental Inicial já tenha sido validada ou conformada
            const validatedOrConformedEntry = await AccountPlanEntryEntry.query({ client: trx })
                .where('type', EntryEntryType.INITIAL_ALLOCATION)
                .where('account_plan_year_id', activeYear.id)
                .where((query) => {
                    query
                        .whereNotNull('initial_allocation_approval_date')
                        .orWhere('compliance_status', 'CONFORMANCE');
                })
                .first();

            if (validatedOrConformedEntry) {
                throw new Error(
                    'Operação não permitida: A Tabela de Despesas — Dotação Orçamental Inicial já foi validada e finalizada para este exercício, não sendo possível carregar novo ficheiro Excel.'
                );
            }

            // Clean up any old junk accounts if present
            const junkPlans = await AccountPlan.query({ client: trx })
                .whereIn('number', [
                    'REPÚBLICA DE MOÇAMBIQUE',
                    'NOME DA INSTITUIÇÃO',
                    'Departamento Financeiro',
                    'Orçamento Disponível -Janeiro 2024',
                ]);
            if (junkPlans.length > 0) {
                const junkIds = junkPlans.map((p) => p.id);
                await AccountPlanEntry.query({ client: trx }).whereIn('account_plan_id', junkIds).delete();
                await AccountPlan.query({ client: trx }).whereIn('id', junkIds).delete();
            }

            // Reset all initial allocations for this year
            await AccountPlanEntryEntry.query({ client: trx })
                .where('type', EntryEntryType.INITIAL_ALLOCATION)
                .where('account_plan_year_id', activeYear.id)
                .delete();

            await AccountPlanEntry.query({ client: trx })
                .where('account_plan_year_id', activeYear.id)
                .update({
                    initial_allocation: 0,
                    final_allocation: 0,
                    available_allocation: 0,
                });

            // Load all budget accounts and entries for active year
            const allEntries = await AccountPlanEntry.query({ client: trx })
                .where('account_plan_year_id', activeYear.id)
                .preload('accountPlan');

            const leafEntries: AccountPlanEntry[] = [];
            const controlEntries: AccountPlanEntry[] = [];

            for (const entry of allEntries) {
                if (entry.accountPlan?.type !== 'budject') continue;
                if (entry.accountPlan?.writable === 'moviment') {
                    leafEntries.push(entry);
                } else {
                    controlEntries.push(entry);
                }
            }

            // Map leaves by normalized description
            const leavesByNormDesc = new Map<string, AccountPlanEntry[]>();
            for (const leaf of leafEntries) {
                const k = normalizeDesc(leaf.accountPlan?.description);
                if (!leavesByNormDesc.has(k)) leavesByNormDesc.set(k, []);
                leavesByNormDesc.get(k)!.push(leaf);
            }

            // Map controls by normalized description
            const controlsByNormDesc = new Map<string, AccountPlanEntry[]>();
            for (const ctrl of controlEntries) {
                const k = normalizeDesc(ctrl.accountPlan?.description);
                if (!controlsByNormDesc.has(k)) controlsByNormDesc.set(k, []);
                controlsByNormDesc.get(k)!.push(ctrl);
            }

            const controlsByCode = new Map<string, AccountPlanEntry>();
            for (const ctrl of controlEntries) {
                controlsByCode.set(ctrl.accountPlanNumber, ctrl);
            }

            const leavesByCode = new Map<string, AccountPlanEntry>();
            for (const leaf of leafEntries) {
                leavesByCode.set(leaf.accountPlanNumber, leaf);
            }

            let leafCount = 0;
            let controlCount = 0;
            let sumLeafUsd = 0;

            for (const item of rawAllocations) {
                const code = item.code ? String(item.code).trim() : '';
                const desc = item.description ? String(item.description).trim() : '';
                const valUsd = Number(item.valueUsd || 0);
                const norm = normalizeDesc(desc);

                // 1. Financial logic: Check if this row is a superior/control account
                const isControlByCode = code ? controlsByCode.has(code) : false;
                const isControlByDesc = controlsByNormDesc.has(norm) && !leavesByNormDesc.has(norm);
                const isControlByFormat = code.endsWith('.00');

                if (isControlByCode || isControlByDesc || isControlByFormat) {
                    // Contas superiores nao recebem valor directamente do Excel.
                    // Sao calculadas pela soma das suas contas filhas.
                    controlCount++;
                    continue;
                }

                // 2. Match leaf account primarily by DESIGNATION
                let matchedLeaf: AccountPlanEntry | null = null;
                const candidateLeaves = leavesByNormDesc.get(norm);

                if (candidateLeaves && candidateLeaves.length === 1) {
                    matchedLeaf = candidateLeaves[0];
                } else if (candidateLeaves && candidateLeaves.length > 1) {
                    // Disambiguate by matching code prefix similarity
                    let bestScore = -1;
                    let bestCand: AccountPlanEntry = candidateLeaves[0];
                    for (const cand of candidateLeaves) {
                        if (cand.accountPlanNumber === code) {
                            bestCand = cand;
                            break;
                        }
                        const score = prefixMatchScore(code, cand.accountPlanNumber);
                        if (score > bestScore) {
                            bestScore = score;
                            bestCand = cand;
                        }
                    }
                    matchedLeaf = bestCand;
                } else if (code && leavesByCode.has(code)) {
                    // Fallback to code match if designation didn't match directly
                    matchedLeaf = leavesByCode.get(code)!;
                }

                if (matchedLeaf) {
                    leafCount++;
                    sumLeafUsd += valUsd;

                    matchedLeaf.initialAllocation = valUsd;
                    matchedLeaf.finalAllocation = valUsd;
                    matchedLeaf.availableAllocation = valUsd;
                    await matchedLeaf.useTransaction(trx).save();

                    if (valUsd > 0) {
                        await new AccountPlanEntryEntry()
                            .fill({
                                type: EntryEntryType.INITIAL_ALLOCATION,
                                operator: OperatorType.CREDTI,
                                postingMonth: 1,
                                operationDate: DateTime.local(),
                                allocation: valUsd,
                                lastFinalAllocation: 0,
                                entryId: matchedLeaf.id,
                                accountPlanYearId: activeYear.id,
                            })
                            .useTransaction(trx)
                            .save();
                    }
                }
            }

            // 3. Hierarchical bottom-up calculation for all superior / control accounts
            await this.recalculateParentEntriesForYear(activeYear.id, trx);

            await trx.commit();

            return {
                success: true,
                message: `Dotação Inicial importada com sucesso para o exercício fiscal ${activeYear.year}!`,
                year: activeYear.year,
                sheetUsed: detectedSheetName,
                totalAccounts: rawAllocations.length,
                leafCount,
                controlCount,
                totalUsd: Number(sumLeafUsd.toFixed(2)),
                totalMzn: Number((sumLeafUsd * 2.5).toFixed(2)),
                totalDuodecimo: Number(((sumLeafUsd * 2.5) / 12).toFixed(2)),
            };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
}
