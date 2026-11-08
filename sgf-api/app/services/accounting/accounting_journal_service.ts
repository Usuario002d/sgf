import AccountPlan from "../../models/planbudject/account_plan.js";
import AccountPlanYear from "../../models/planbudject/account_plan_year.js";
import { DateTime } from "luxon";
import { AccountingJounalEntryDTO, operatorType } from "./utils/dtos.js";
import AccountingJournalEntryValidator from "../../validators/accounting/accountingJournalEntryValidator.js";
import AccountingJournalEntry from "../../models/accounting/accounting_journal_entry.js";
import AccountingJournal from "../../models/accounting/accounting_journal.js";
import AccountingDocument from "../../models/accounting/accounting_document.js";
import AccountingJournalEntryItems from "../../models/accounting/accounting_journal_entry_items.js";
import { inject } from "@adonisjs/core";
import AccountPlanFinancialEntryService from "./account_plan_financial_entry_service.js";
import { EntryEntryType, OperatorType } from "../../models/utility/Enums.js";
import db from "@adonisjs/lucid/services/db";
import InternalRequest from "#models/request/internal_request";
import AccountPlanEntry from "#models/planbudject/account_plan_entry";
import { FetchFilters } from "./utils/FetchFilters.js";

@inject()
export default class AccountingJournalService {

    constructor(
        private accountPlanFinancialEntryService: AccountPlanFinancialEntryService
    ) { }

    public async resolveActivePlanYear(preferredYear?: number): Promise<AccountPlanYear> {
        const targetYear = preferredYear || new Date().getFullYear();
        const found = await AccountPlanYear.findBy('year', targetYear);
        if (found) {
            return found;
        }
        return await AccountPlanYear.query().orderBy('year', 'desc').firstOrFail();
    }

    public async openAccountingJournal(data: AccountingJounalEntryDTO) {
        await AccountingJournalEntryValidator.validateOnWithoutInternalRequest(data, AccountingJournal.OPENING);
        return await this.criateFinancialAccountingJournalWithoutinternalRequest(data, EntryEntryType.ENTRY_OPENING);
    }

    public async billToPayAccountingJournal(data: AccountingJounalEntryDTO) {
        await AccountingJournalEntryValidator.validateOnWithInternalRequest(data, AccountingJournal.BILLS_TO_PAY);
        return await this.criateFinancialAccountingJournalWithInternalRequest(data, EntryEntryType.ENTRY_BILLS_TO_PAY);
    }

    public async billToReceiveAccountingJournal(data: AccountingJounalEntryDTO) {
        await AccountingJournalEntryValidator.validateOnWithoutInternalRequest(data, AccountingJournal.BILLS_TO_RECEIVE);
        return await this.criateFinancialAccountingJournalWithoutinternalRequest(data, EntryEntryType.ENTRY_BILLS_TO_RECEIVER);
    }

    public async bankInAccountingJournal(data: AccountingJounalEntryDTO) {

        await AccountingJournalEntryValidator.validateOnWithoutInternalRequest(data, AccountingJournal.BANK_IN);

        return await this.criateFinancialAccountingJournalWithoutinternalRequest(data, EntryEntryType.ENTRY_BANK_IN);
    }

    public async bankOutAccountingJournal(data: AccountingJounalEntryDTO) {
        await AccountingJournalEntryValidator.validateOnWithInternalRequest(data, AccountingJournal.BANK_OUT);
        return await this.createFinancialAccountingJournalWithInternalRequestExit(data);
    }

    public async regulationAccountingJournal(data: AccountingJounalEntryDTO) {
        await AccountingJournalEntryValidator.validateOnWithInternalRequest(data, AccountingJournal.REGULARIZATION);
        return await this.criateFinancialAccountingJournalWithInternalRequest(data, EntryEntryType.ENTRY_REGULARIZATION);
    }

    public async criateFinancialAccountingJournalWithoutinternalRequest(data: AccountingJounalEntryDTO, entryEntryType: EntryEntryType) {
        const trx = await db.transaction();  // Start transaction
        try {
            const currentDate = new Date();
            const operationDate = DateTime.fromJSDate(data.operationDate);
            const currentPlanYear = await this.resolveActivePlanYear(currentDate.getFullYear());
            const journal = await AccountingJournal.findByOrFail('journalNumber', data.accountingJournalNumber);
            const document = await AccountingDocument.findByOrFail('documentNumber', data.accountingDocumentNumber);

            console.log("log", data)
            console.log("operationDate",)

            const createdAccountingEntry = await new AccountingJournalEntry()
                .fill({
                    operationDate: operationDate,
                    accountPlanYearId: currentPlanYear.id,
                    accountingJournalId: journal.id,
                    accountingDocumentId: document.id,
                }).useTransaction(trx).save();

            for (const itemData of data.items) {
                try {
                    const financial = await AccountPlan.findBy('number', itemData.accountPlanNumber);

                    if (!financial) {
                        throw new Error(`Plano de Contas com número ${itemData.accountPlanNumber} não encontrado.`);
                    }

                    // Buscar o registo atual no account_plan_entries
                    const planEntry = await AccountPlanEntry
                        .query()
                        .where('account_plan_id', financial.id)
                        .andWhere('account_plan_year_id', currentPlanYear.id)
                        .preload('accountPlan')
                        .first();


                    if (!planEntry) {
                        throw new Error(`Registo de entrada do plano de contas não encontrado para o plano ${itemData.accountPlanNumber}.`);
                    }

                    const accountNumber = planEntry.accountPlan.number;
                    const accStr = accountNumber.toString();

                    console.log("Cyhegoua te aqui", accountNumber)

                    let accountType = '';
                    if (accStr.startsWith('1') || accStr.startsWith('3') || accStr.startsWith('41')) {
                        accountType = 'ativo';
                    } else if (
                        accStr.startsWith('42') || accStr.startsWith('43') || accStr.startsWith('44') ||
                        accStr.startsWith('45') || accStr.startsWith('46') || accStr.startsWith('48') ||
                        accStr.startsWith('49') || accStr.startsWith('5')
                    ) {
                        accountType = 'passivo';
                    } else if (accStr.startsWith('6')) {
                        accountType = 'gasto';
                    } else if (accStr.startsWith('7')) {
                        accountType = 'ganho';
                    } else {
                        throw new Error(`Tipo de conta não identificado para o número: ${accountNumber}`);
                    }

                    // Aplicar lógica contábil
                    const valor = itemData.value / 2.5;

                    if (itemData.operator === OperatorType.DEBIT) {
                        if (accountType === 'ativo' || accountType === 'gasto') {
                            // Débito aumenta ativo/gasto
                            planEntry.finalAllocation += valor;
                            planEntry.availableAllocation += valor;
                        } else if (accountType === 'passivo' || accountType === 'ganho') {
                            // Débito diminui passivo/ganho
                            planEntry.finalAllocation -= valor;
                            planEntry.availableAllocation -= valor;
                        }
                    } else if (itemData.operator === OperatorType.CREDTI) {
                        if (accountType === 'ativo' || accountType === 'gasto') {
                            // Crédito diminui ativo/gasto
                            planEntry.finalAllocation -= valor;
                            planEntry.availableAllocation -= valor;
                        } else if (accountType === 'passivo' || accountType === 'ganho') {
                            // Crédito aumenta passivo/ganho
                            planEntry.finalAllocation += valor;
                            planEntry.availableAllocation += valor;
                        }
                    } else {
                        throw new Error(`Operador inválido: ${itemData.operator}. Esperado 'DEBIT' ou 'CREDIT'.`);
                    }

                    await planEntry.useTransaction(trx).save();


                    // Criar a entrada contábil
                    await new AccountingJournalEntryItems()
                        .fill({
                            operator: itemData.operator,
                            value: (itemData.value / 2.5),
                            description: itemData.description,
                            accountPlanNumber: itemData.accountPlanNumber,
                            accountPlanId: financial.id,
                            accountPlanYearId: currentPlanYear.id,
                            entryId: createdAccountingEntry.id,
                            operationDate: operationDate
                        })
                        .useTransaction(trx)
                        .save();

                } catch (error) {
                    console.log("Erro ao processar item:", itemData, error.message);
                    await trx.rollback();
                    throw error;
                }
            }


            console.log("879187298")

            await trx.commit();
            return createdAccountingEntry;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }


    // public async createFinancialAccountingJournalWithInternalRequestExit(data: AccountingJounalEntryDTO) {
    //     const trx = await db.transaction(); // Inicia a transação

    //     try {
    //         if (!data.tableDataBudject || !data.items || !data.internalRequestNumber) {
    //             throw new Error('Os campos tableDataBudject, items e internalRequestNumber são obrigatórios.');
    //         }
    //         const currentDate = new Date();
    //         const operationDate = DateTime.local(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    //         const currentPlanYear = await AccountPlanYear.findByOrFail('year', currentDate.getFullYear());
    //         const journal = await AccountingJournal.findByOrFail('journalNumber', data.accountingJournalNumber);
    //         const document = await AccountingDocument.findByOrFail('documentNumber', data.accountingDocumentNumber);


    //         const createdAccountingEntry = await new AccountingJournalEntry()
    //             .fill({
    //                 operationDate: operationDate,
    //                 accountPlanYearId: currentPlanYear.id,
    //                 accountingJournalId: journal.id,
    //                 accountingDocumentId: document.id,
    //                 // journalDocumentNumber: journalDocNumber,  // Adicionando o journalDocumentNumber
    //             }).useTransaction(trx).save();


    //         // Processar os itens de orçamento
    //         for (const budgetItem of data.tableDataBudject) {
    //             if (budgetItem.debit === undefined) {
    //                 throw new Error(`O valor de debit para o item de orçamento ${budgetItem.account} não está definido.`);
    //             }

    //             const accountPlan = await AccountPlan.query()
    //                 .useTransaction(trx)
    //                 .where('number', budgetItem.account)
    //                 .firstOrFail();

    //             const currentBalance = await this.getAccountPlanBalance(accountPlan.id);
    //             const newBalance = currentBalance - budgetItem.debit;

    //             await InternalRequest.query()
    //                 .useTransaction(trx)
    //                 .where('request_number', data.internalRequestNumber)
    //                 .update({
    //                     paidReq: true,
    //                     paid_status: "PAGO",
    //                     is_parcial: data.is_parcial,
    //                     payment_type: data.payment_type,
    //                     remaining_balance: data.remaining_balance
    //                 });

    //             await AccountPlanEntry.query()
    //                 .useTransaction(trx)
    //                 .where('account_plan_id', accountPlan.id)
    //                 .update({ available_allocation: newBalance });

    //         }

    //         // Processar os itens de lançamento
    //         for (const item of data.items) {
    //             const accountPlan = await AccountPlan.query()
    //                 .useTransaction(trx)
    //                 .where('number', item.accountPlanNumber)
    //                 .firstOrFail();

    //             const currentBalance = await this.getAccountPlanBalance(accountPlan.id);
    //             const operation = item.operator === 'debit' ? -item.value : item.value;
    //             const newBalance = currentBalance + operation;

    //             // Atualizar a requisição interna
    //             await AccountPlanEntry.query()
    //                 .useTransaction(trx)
    //                 .where('account_plan_id', accountPlan.id)
    //                 .update({ available_allocation: newBalance });

    //             await new AccountingJournalEntryItems()
    //                 .fill({
    //                     operator: item.operator,
    //                     value: item.value,
    //                     description: item.description,
    //                     accountPlanNumber: item.accountPlanNumber,
    //                     accountPlanId: item.id,
    //                     accountPlanYearId: item.id,
    //                     entryId: item.id,
    //                 })
    //                 .useTransaction(trx)
    //                 .save();

    //         }



    //         await trx.commit(); // Confirma a transação
    //     } catch (error) {
    //         await trx.rollback(); // Reverte a transação em caso de erro
    //         throw error;
    //     }
    // }

    // public async createFinancialAccountingJournalWithInternalRequestExit(data: AccountingJounalEntryDTO) {
    //     const trx = await db.transaction(); // Inicia a transação

    //     try {
    //         // Validações iniciais
    //         if (!data.tableDataBudject?.length) {
    //             throw new Error('Itens de orçamento (tableDataBudject) não informados.');
    //         }

    //         if (!data.items?.length) {
    //             throw new Error('Itens de lançamento (items) não informados.');
    //         }

    //         if (!data.internalRequestNumber) {
    //             throw new Error('Número da requisição interna não informado.');
    //         }

    //         // Definindo a data da operação
    //         const operationDate = DateTime.fromJSDate(new Date()).startOf('day');

    //         // Buscar registros relacionados
    //         const currentPlanYear = await AccountPlanYear.findByOrFail('year', operationDate.year);
    //         const journal = await AccountingJournal.findByOrFail('journalNumber', data.accountingJournalNumber);
    //         const document = await AccountingDocument.findByOrFail('documentNumber', data.accountingDocumentNumber);

    //         // Criar o lançamento contábil principal
    //         const createdAccountingEntry = await new AccountingJournalEntry()
    //             .fill({
    //                 operationDate,
    //                 accountPlanYearId: currentPlanYear.id,
    //                 accountingJournalId: journal.id,
    //                 accountingDocumentId: document.id,
    //             })
    //             .useTransaction(trx)
    //             .save();

    //         // Atualizar saldo dos itens de orçamento
    //         for (const budgetItem of data.tableDataBudject) {
    //             if (budgetItem.debit === undefined) {
    //                 throw new Error(`O valor de débito para a conta ${budgetItem.account} não está definido.`);
    //             }

    //             const accountPlan = await AccountPlan.query()
    //                 .useTransaction(trx)
    //                 .where('number', budgetItem.account)
    //                 .firstOrFail();

    //             const currentBalance = await this.getAccountPlanBalance(accountPlan.id);
    //             const newBalance = currentBalance - budgetItem.debit;

    //             // Atualiza o saldo da conta
    //             await AccountPlanEntry.query()
    //                 .useTransaction(trx)
    //                 .where('account_plan_id', accountPlan.id)
    //                 .update({ available_allocation: newBalance });

    //             // Atualiza a requisição interna (pode ser feita uma vez fora do loop se for genérica)
    //             await InternalRequest.query()
    //                 .useTransaction(trx)
    //                 .where('request_number', data.internalRequestNumber)
    //                 .update({
    //                     paidReq: true,
    //                     paid_status: "PAGO",
    //                     is_parcial: data.is_parcial,
    //                     payment_type: data.payment_type,
    //                     remaining_balance: data.remaining_balance
    //                 });
    //         }

    //         // Processar os itens de lançamento
    //         for (const item of data.items) {
    //             const accountPlan = await AccountPlan.query()
    //                 .useTransaction(trx)
    //                 .where('number', item.accountPlanNumber)
    //                 .firstOrFail();

    //             const currentBalance = await this.getAccountPlanBalance(accountPlan.id);
    //             const operation = item.operator === OperatorType.DEBIT ? -item.value : item.value;
    //             const newBalance = currentBalance + operation;

    //             // Atualiza o saldo da conta
    //             await AccountPlanEntry.query()
    //                 .useTransaction(trx)
    //                 .where('account_plan_id', accountPlan.id)
    //                 .update({ available_allocation: newBalance });

    //             // Cria o item de lançamento contábil
    //             await new AccountingJournalEntryItems()
    //                 .fill({
    //                     operator: item.operator,
    //                     value: item.value,
    //                     description: item.description,
    //                     accountPlanNumber: item.accountPlanNumber,
    //                     accountPlanId: accountPlan.id,
    //                     accountPlanYearId: currentPlanYear.id,
    //                     entryId: createdAccountingEntry.id,
    //                 })
    //                 .useTransaction(trx)
    //                 .save();
    //         }

    //         // Finaliza a transação
    //         await trx.commit();
    //     } catch (error) {
    //         await trx.rollback(); // Reverte tudo em caso de erro
    //         throw error;
    //     }
    // }

    // public async createFinancialAccountingJournalWithInternalRequestExit(data: AccountingJounalEntryDTO) {
    //     const trx = await db.transaction();

    //     try {
    //         if (!data.tableDataBudject?.length) {
    //             throw new Error('Itens de orçamento (tableDataBudject) não informados.');
    //         }

    //         if (!data.items?.length) {
    //             throw new Error('Itens de lançamento (items) não informados.');
    //         }

    //         if (!data.internalRequestNumber) {
    //             throw new Error('Número da requisição interna não informado.');
    //         }


    //         const requisition = await InternalRequest.query()
    //             .useTransaction(trx)
    //             .where('request_number', data.internalRequestNumber)
    //             .first();

    //         if (!requisition) {
    //             throw new Error('Requisição interna não encontrada.');
    //         }

    //         const operationDate = DateTime.fromJSDate(new Date()).startOf('day');

    //         const currentPlanYear = await AccountPlanYear.findByOrFail('year', operationDate.year);
    //         const journal = await AccountingJournal.findByOrFail('journalNumber', data.accountingJournalNumber);
    //         const document = await AccountingDocument.findByOrFail('documentNumber', data.accountingDocumentNumber);


    //         const existingEntry = await AccountingJournalEntry.query()
    //             .useTransaction(trx)
    //             .where('accounting_journal_id', journal.id)
    //             .andWhere('internal_request_id', requisition.id)
    //             .first();

    //         if (existingEntry) {
    //             throw new Error(`Já existe um lançamento contábil para esta combinação de diário (${journal.id}) e requisição (${requisition.id}).`);
    //         }

    //         const createdAccountingEntry = await new AccountingJournalEntry()
    //             .fill({
    //                 operationDate,
    //                 accountPlanYearId: currentPlanYear.id,
    //                 accountingJournalId: journal.id,
    //                 accountingDocumentId: document.id,
    //                 internalRequestId: requisition.id,
    //             })
    //             .useTransaction(trx)
    //             .save();

    //         for (const budgetItem of data.tableDataBudject) {
    //             if (budgetItem.debit === undefined) {
    //                 throw new Error(`O valor de débito para a conta ${budgetItem.account} não está definido.`);
    //             }

    //             const accountPlan = await AccountPlan.query()
    //                 .useTransaction(trx)
    //                 .where('number', budgetItem.account)
    //                 .firstOrFail();

    //             const currentBalanceS = await this.getAccountPlanBalanceBudject(accountPlan.id);
    //             const currentBalance = (currentBalanceS * 2.5);

    //             if (budgetItem.debit > currentBalance) {
    //                 throw new Error(`Saldo insuficiente na conta ${budgetItem.account}. Saldo disponível: ${currentBalance}, valor solicitado: ${budgetItem.debit}`);
    //             }

    //             const newBalances = currentBalance - budgetItem.debit;
    //             const newBalance = (newBalances / 2.5);

    //             await AccountPlanEntry.query()
    //                 .useTransaction(trx)
    //                 .where('account_plan_id', accountPlan.id)
    //                 .update({ final_allocation: newBalance });

    //             await InternalRequest.query()
    //                 .useTransaction(trx)
    //                 .where('request_number', data.internalRequestNumber)
    //                 .update({
    //                     paidReq: true,
    //                     paid_status: "PAGO",
    //                     is_parcial: data.is_parcial,
    //                     payment_type: data.payment_type,
    //                     remaining_balance: data.remaining_balance
    //                 });
    //         }

    //         for (const item of data.items) {
    //             const accountPlan = await AccountPlan.query()
    //                 .useTransaction(trx)
    //                 .where('number', item.accountPlanNumber)
    //                 .firstOrFail();

    //             const currentBalance = await this.getAccountPlanBalance(accountPlan.id);
    //             const isCredit = item.operator === OperatorType.CREDTI;

    //             if (isCredit && item.value > currentBalance) {
    //                 throw new Error(`Saldo insuficiente na conta ${item.accountPlanNumber}. Saldo disponível: ${currentBalance}, valor de débito: ${item.value}`);
    //             }

    //             const operation = isCredit ? -item.value : item.value;
    //             const newBalance = currentBalance + operation;

    //             await AccountPlanEntry.query()
    //                 .useTransaction(trx)
    //                 .where('account_plan_id', accountPlan.id)
    //                 .update({ available_allocation: (newBalance / 2.5) });

    //             await new AccountingJournalEntryItems()
    //                 .fill({
    //                     operator: item.operator,
    //                     value: item.value,
    //                     description: item.description,
    //                     accountPlanNumber: item.accountPlanNumber,
    //                     accountPlanId: accountPlan.id,
    //                     accountPlanYearId: currentPlanYear.id,
    //                     entryId: createdAccountingEntry.id,
    //                 })
    //                 .useTransaction(trx)
    //                 .save();
    //         }

    //         await trx.commit();
    //     } catch (error) {
    //         await trx.rollback();

    //         // Registro no log
    //         console.error('Erro ao criar lançamento contábil com requisição interna:', {
    //             mensagem: error.message,
    //             stack: error.stack,
    //             dadosEntrada: data
    //         });

    //         throw error; // Repassa o erro para o chamador
    //     }
    // }

    public async createFinancialAccountingJournalWithInternalRequestExit(data: AccountingJounalEntryDTO) {
        const trx = await db.transaction();

        try {
            if (!data.tableDataBudject?.length) {
                throw new Error('Itens de orçamento (tableDataBudject) não informados.');
            }

            if (!data.items?.length) {
                throw new Error('Itens de lançamento (items) não informados.');
            }

            if (!data.internalRequestNumber) {
                throw new Error('Número da requisição interna não informado.');
            }

            const requisition = await InternalRequest.query()
                .useTransaction(trx)
                .where('request_number', data.internalRequestNumber)
                .first();

            if (!requisition) {
                throw new Error('Requisição interna não encontrada.');
            }

            const operationDate = DateTime.fromJSDate(new Date()).startOf('day');
            const currentPlanYear = await this.resolveActivePlanYear(operationDate.year);
            const journal = await AccountingJournal.findByOrFail('journalNumber', data.accountingJournalNumber);
            const document = await AccountingDocument.findByOrFail('documentNumber', data.accountingDocumentNumber);

            const existingEntry = await AccountingJournalEntry.query()
                .useTransaction(trx)
                .where('accounting_journal_id', journal.id)
                .andWhere('internal_request_id', requisition.id)
                .first();

            if (existingEntry) {
                throw new Error(`Já existe um lançamento contábil para esta combinação de diário (${journal.id}) e requisição (${requisition.id}).`);
            }

            const createdAccountingEntry = await new AccountingJournalEntry()
                .fill({
                    operationDate,
                    accountPlanYearId: currentPlanYear.id,
                    accountingJournalId: journal.id,
                    accountingDocumentId: document.id,
                    internalRequestId: requisition.id,
                })
                .useTransaction(trx)
                .save();

            // Processar os itens de orçamento (tableDataBudject)

            for (const budgetItem of data.items) {
                if (budgetItem.operator === 'CREDIT') {

                    if (budgetItem.accountPlanId == null) {
                        throw new Error(`O ID da conta não foi definido para o item: ${JSON.stringify(budgetItem)}`);
                    }
                    // Buscar o saldo atual da conta (substitua por sua lógica real)

                    const currentBalance = await this.getAccountPlanBalanceBudject(budgetItem.accountPlanId);

                    console.log(`🔎 Conta ${budgetItem.accountPlanNumber} - Saldo atual: ${currentBalance}, Valor solicitado: ${budgetItem.value}`);

                    if (budgetItem.value > currentBalance) {
                        throw new Error(
                            `❌ Saldo insuficiente na conta ${budgetItem.accountPlanNumber}. ` +
                            `Saldo disponível: ${currentBalance}, valor solicitado: ${budgetItem.value}`
                        );
                    } else {
                        console.log(`✅ Conta ${budgetItem.accountPlanNumber} tem saldo suficiente.`);
                    }
                }
            }

            for (const budgetItem of data.tableDataBudject) {
                if (budgetItem.debit === undefined) {
                    throw new Error(`O valor de débito para a conta ${budgetItem.account} não está definido.`);
                }

                const accountPlan = await AccountPlan.query()
                    .useTransaction(trx)
                    .where('number', budgetItem.account)
                    .firstOrFail();

                const currentBalanceS = await this.getAccountPlanBalanceBudject(accountPlan.id);
                const currentBalance = (currentBalanceS * 2.5);

                console.log("✅ Saldo disponível:", currentBalance);
                console.log("✅ Valor solicitado (debit):", budgetItem.debit);
                console.log("✅ budgetItem", data);

                // if (budgetItem.debit > currentBalance) {
                //     throw new Error(`Saldo insuficiente na conta ${budgetItem.account}. Saldo disponível: ${currentBalance}, valor solicitado: ${budgetItem.debit}`);
                // }
                const newBalances = currentBalance - budgetItem.debit;
                const newBalance = (newBalances / 2.5);

                await AccountPlanEntry.query()
                    .useTransaction(trx)
                    .where('account_plan_id', accountPlan.id)
                    .update({ available_allocation: newBalance });

                await InternalRequest.query()
                    .useTransaction(trx)
                    .where('request_number', data.internalRequestNumber)
                    .update({
                        paidReq: true,
                        paid_status: "PAGO",
                        is_parcial: data.is_parcial,
                        payment_type: data.payment_type,
                        remaining_balance: data.remaining_balance
                    });
            }

            // Processar os itens contábeis (items)
            for (const item of data.items) {
                console.log("🔄 Processando item contábil:", item);

                const accountPlan = await AccountPlan.query()
                    .useTransaction(trx)
                    .where('number', item.accountPlanNumber)
                    .firstOrFail();

                const planEntry = await AccountPlanEntry.query()
                    .useTransaction(trx)
                    .where('account_plan_id', accountPlan.id)
                    .andWhere('account_plan_year_id', currentPlanYear.id)
                    .firstOrFail();

                await planEntry.load('accountPlan'); // Garantir carregamento do plano

                const accountNumber = planEntry.accountPlan.number;
                const accStr = accountNumber.toString();

                console.log("✅ Número da conta:", accountNumber);

                let accountType = '';
                if (accStr.startsWith('1') || accStr.startsWith('3') || accStr.startsWith('41')) {
                    accountType = 'ativo';
                } else if (
                    accStr.startsWith('42') || accStr.startsWith('43') || accStr.startsWith('44') ||
                    accStr.startsWith('45') || accStr.startsWith('46') || accStr.startsWith('48') ||
                    accStr.startsWith('49') || accStr.startsWith('5')
                ) {
                    accountType = 'passivo';
                } else if (accStr.startsWith('6')) {
                    accountType = 'gasto';
                } else if (accStr.startsWith('7')) {
                    accountType = 'ganho';
                } else {
                    throw new Error(`❌ Tipo de conta não identificado para o número: ${accountNumber}`);
                }

                const valor = item.value / 2.5;
                console.log(`📊 Aplicando lógica contábil: Tipo=${accountType}, Operador=${item.operator}, Valor=${valor}`);

                if (item.operator === OperatorType.DEBIT) {
                    if (accountType === 'ativo' || accountType === 'gasto') {
                        // Débito aumenta ativo/gasto
                        planEntry.finalAllocation += valor;
                        planEntry.availableAllocation += valor;
                    } else if (accountType === 'passivo' || accountType === 'ganho') {
                        // Débito diminui passivo/ganho
                        planEntry.finalAllocation -= valor;
                        planEntry.availableAllocation -= valor;
                    }
                } else if (item.operator === OperatorType.CREDTI) { // Corrigido typo
                    if (accountType === 'ativo' || accountType === 'gasto') {
                        // Crédito diminui ativo/gasto
                        planEntry.finalAllocation -= valor;
                        planEntry.availableAllocation -= valor;
                    } else if (accountType === 'passivo' || accountType === 'ganho') {
                        // Crédito aumenta passivo/ganho
                        planEntry.finalAllocation += valor;
                        planEntry.availableAllocation += valor;
                    }
                } else {
                    throw new Error(`❌ Operador inválido: ${item.operator}. Esperado 'DEBIT' ou 'CREDIT'.`);
                }

                await planEntry.useTransaction(trx).save();
                console.log("💾 planEntry atualizado com sucesso:", planEntry.id);

                // Criar item do lançamento contábil
                await new AccountingJournalEntryItems()
                    .fill({
                        operator: item.operator,
                        value: item.value / 2.5,
                        description: item.description,
                        accountPlanNumber: item.accountPlanNumber,
                        accountPlanId: accountPlan.id,
                        accountPlanYearId: currentPlanYear.id,
                        entryId: createdAccountingEntry.id,
                    })
                    .useTransaction(trx)
                    .save();

                console.log("✅ Item contábil salvo com sucesso");
            }

            await trx.commit();
            console.log("🎉 Lançamento contábil com requisição interna criado com sucesso.");

        } catch (error) {
            await trx.rollback();
            console.error('❌ Erro ao criar lançamento contábil com requisição interna:', {
                mensagem: error.message,
                stack: error.stack,
                dadosEntrada: data
            });
            throw error;
        }
    }


    // Função para obter o saldo atual da conta
    private async getAccountPlanBalance(accountPlanId: number): Promise<number> {
        const accountPlan = await db
            .from('account_plan_entries') // Usando a tabela de entradas do plano de contas
            .where('account_plan_id', accountPlanId)
            .select('available_allocation')
            .first();

        if (!accountPlan) {
            throw new Error(`Conta não encontrada com ID ${accountPlanId}`);
        }

        return (accountPlan.available_allocation * 2.5) || 0; // Retorna o saldo disponível
    }

    // Função para obter o saldo atual da conta
    private async getAccountPlanBalanceBudject(accountPlanId: number): Promise<number> {
        const accountPlan = await db
            .from('account_plan_entries') // Usando a tabela de entradas do plano de contas
            .where('account_plan_id', accountPlanId)
            .select('available_allocation')
            .first();

        if (!accountPlan) {
            throw new Error(`Conta não encontrada com ID ${accountPlanId}`);
        }

        return (accountPlan.available_allocation * 2.5) || 0; // Retorna o saldo disponível
    }

    // Função para atualizar o saldo da conta
    private async updateAccountPlanBalance(accountPlanId: number, newBalance: number, trx: any): Promise<void> {
        await trx('account_plan_entries') // Usando a transação para realizar a atualização
            .where('account_plan_id', accountPlanId)
            .update({ available_allocation: newBalance });
    }

    public async criateFinancialAccountingJournalWithInternalRequest(data: AccountingJounalEntryDTO, entryEntryType: EntryEntryType) {
        const trx = await db.transaction(); // Inicia a transação

        console.log("Criando a requisicao")

        try {
            const currentDate = new Date();
            const operationDate = DateTime.local(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1, // Meses são baseados em zero no JavaScript
                currentDate.getDate()
            );
            const currentPlanYear = await this.resolveActivePlanYear(currentDate.getFullYear());
            const journal = await AccountingJournal.findByOrFail('journalNumber', data.accountingJournalNumber);
            const document = await AccountingDocument.findByOrFail('documentNumber', data.accountingDocumentNumber);
            // const journalDocNumber = Number(data.journalDocumentNumber);
            const internalRequest = String(data.internalRequestNumber);
            const receivable = Boolean(data.receivable);
            const transactionType = String(data.transactionType);

            // Realiza a consulta SQL para obter o id da requisição interna
            const internalRequestIdQuery = await db
                .from('internal_requests')
                .where('request_number', internalRequest)
                .select('id')
                .first();  // .first() retorna apenas o primeiro resultado

            if (!internalRequestIdQuery) {
                throw new Error(`Nenhuma requisição encontrada com o número ${internalRequest}`);
            }

            const internalRequestId = internalRequestIdQuery.id; // Aqui você recebe o id da requisição
            console.log(`ID da requisição interna: ${internalRequestId}`);
            // console.log("journalDocNumber", journalDocNumber)

            // if (isNaN(journalDocNumber)) {
            //     throw new Error('journalDocumentNumber deve ser um número válido.');
            // }

            // Se a transação for "BancosSaida", verifica se já existe um lançamento de contas a pagar
            if (transactionType === "BancosSaida") {
                const query = db
                    .from('accounting_journal_entries')
                    .where('internal_request_id', internalRequestId)
                    .where('is_receivable', true) // Verifica se é um lançamento de contas a PAGAR

                // Imprime a consulta no console antes de executá-la
                console.log('Consulta SQL:', query.toSQL().sql);

                const existingPayableEntry = await query.first();

                if (!existingPayableEntry) {
                    throw new Error('Não existe um lançamento de contas a pagar para esta Requisição.');
                }
            } else {
                // Para outros tipos de transação, verifica se já existe um lançamento
                const existingEntry = await db
                    .from('accounting_journal_entries')
                    .where('internal_request_id', internalRequestId)
                    .first();

                console.log("ashdksahkd", journal.id)
                if (existingEntry) {
                    throw new Error('Já existe um lançamento para esta Requisição.');
                }
            }

            // Criação do lançamento contábil
            const createdAccountingEntry = await new AccountingJournalEntry()
                .fill({
                    operationDate: operationDate,
                    accountPlanYearId: currentPlanYear.id,
                    accountingJournalId: journal.id,
                    accountingDocumentId: document.id,
                    // journalDocumentNumber: journalDocNumber, // Adicionando o journalDocumentNumber
                    is_receivable: receivable,
                    internalRequestId: internalRequestId,
                })
                .useTransaction(trx)
                .save();

            if (data.receivable === true) {
                await trx
                    .query()
                    .from('internal_requests')
                    .where('request_number', internalRequest)
                    .update({ is_receivable: true });
            }
            // Verifica se `data.paid` é igual a 1 antes de atualizar o `internalRequest`
            if (data.paid === true) {
                await trx
                    .query()
                    .from('internal_requests')
                    .where('request_number', internalRequest)
                    .update({ paid: false });

                console.log("Pagou aqui")
            }

            // Processando os itens associados
            for (const itemData of data.items) {
                try {
                    // Buscando o plano de contas e o saldo final
                    const accountPlan = await AccountPlan.findByOrFail('number', itemData.accountPlanNumber);

                    console.log("accountPlanId", accountPlan.id)
                    const accountPlanEntry = await AccountPlanEntry.findByOrFail('account_plan_id', accountPlan.id);

                    // Pegando o saldo final anterior
                    const lastBalance = accountPlanEntry.finalAllocation || 0; // Se o saldo não existir, assume 0

                    // Calculando o novo saldo baseado no operador (+ ou -)
                    let balance = 0;
                    if (itemData.operator === OperatorType.CREDTI) {
                        balance = lastBalance + Number(itemData.value / 2.5); // Adicionando o valor
                    } else if (itemData.operator === OperatorType.DEBIT) {
                        balance = lastBalance - Number(itemData.value / 2.5); // Subtraindo o valor
                    } else {
                        throw new Error('Operador inválido. Esperado "+" ou "-".');
                    }

                    // Criando o lançamento contábil do item
                    await new AccountingJournalEntryItems()
                        .fill({
                            operator: itemData.operator,
                            value: itemData.value / 2.5,
                            description: itemData.description,
                            accountPlanNumber: itemData.accountPlanNumber,
                            accountPlanId: accountPlan.id,
                            accountPlanYearId: currentPlanYear.id,
                            entryId: createdAccountingEntry.id,
                            balance: balance, // Atribuindo o saldo calculado para o item
                            documentDescription: document.description
                        })
                        .useTransaction(trx)
                        .save();

                    console.log("salvou.....")

                    // Atualizando o saldo final na tabela do plano de contas (se necessário)
                    await db
                        .from('account_plan_entries')
                        .useTransaction(trx)
                        .where('account_plan_number', itemData.accountPlanNumber)
                        .update({ final_allocation: balance });

                    // Efectua os lançamentos e o cálculo dos saldos contabilísticos
                    await this.accountPlanFinancialEntryService.entryCrediteOrDebit(
                        {
                            accountPlanNumber: itemData.accountPlanNumber,
                            value: (itemData.value / 2.5),
                            entryEntryType: entryEntryType,
                            operator: itemData.operator,
                            operationDate: currentDate,
                        },
                        trx
                    );
                } catch (error) {
                    await trx.rollback();
                    throw error;
                }
            }

            await trx.commit();
            return createdAccountingEntry;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }


    public async fetchAllAccountingJournalEntry() {
        return await AccountingJournalEntry.query()
            .preload('internalRequest')
            .preload('accountPlanYear')
            .preload('accountingDocument')
            .preload('accountingJournal')
            .preload('entriesEntry', (entryQuery) => {
                entryQuery.preload('entry') // <-- Isso se entryId for uma relação
            });
    }


    public async fetchAllAccountingJournalEntryItems() {
        return await AccountingJournalEntryItems.query()
            .preload('accountPlanYear')      // Carrega a relação accountPlanYear
            .preload('accountPlan')          // Carrega a relação accountPlan
            .preload('entry', (entryQuery) => { // Carrega a relação entry com suas relações internas
                entryQuery
                    .preload('accountingJournal')  // Carrega a relação accountingJournal dentro de entry
                    .preload('accountingDocument') // Carrega a relação accountingDocument dentro de entry
                    .preload('internalRequest');   // Carrega a relação internalRequest dentro de entry, se existir
            })
            .exec();
    }


    public async fetchAllAccountingJournalEntryItemsByFilters(filters: FetchFilters) {
        console.log("Filtros recebidos:", filters);

        const query = AccountingJournalEntryItems.query()
            .preload('accountPlanYear')
            .preload('accountPlan')
            .preload('entry', (entryQuery) => {
                entryQuery
                    .preload('accountingJournal')
                    .preload('accountingDocument')
                    .preload('internalRequest');
            });

        if (filters.accountPlanId) {
            console.log("Inclui o accountPlanId:", filters.accountPlanId);
            query.where('account_plan_id', filters.accountPlanId);
        }

        // Tratamento de datas (ignorando hora)
        const startDate = filters.startDate ? new Date(filters.startDate).toISOString().slice(0, 10) : null;
        const endDate = filters.endDate ? new Date(filters.endDate).toISOString().slice(0, 10) : null;

        if (startDate && endDate) {
            query.whereHas('entry', (entryQuery) => {
                entryQuery.whereRaw('DATE(operation_date) BETWEEN ? AND ?', [startDate, endDate]);
            });
        } else if (startDate) {
            query.whereHas('entry', (entryQuery) => {
                entryQuery.whereRaw('DATE(operation_date) >= ?', [startDate]);
            });
        } else if (endDate) {
            query.whereHas('entry', (entryQuery) => {
                entryQuery.whereRaw('DATE(operation_date) <= ?', [endDate]);
            });
        }

        // Exibir a query SQL gerada
        console.log("Consulta SQL gerada:", query.toSQL());

        // Executar a consulta e imprimir os resultados
        const results = await query.exec();
        console.log("Resultados da consulta:", results);

        return results;
    }







    // public async fetchAllBalanceteByFiltersSearch(filters: FetchFilters) {
    //     const { startDate, endDate, accountPlanId } = filters;
    //     console.log("🕵️‍♂️ Filtros recebidos:", filters);

    //     const now = DateTime.now();  // Data atual para cálculo dos meses
    //     const start = startDate ? DateTime.fromISO(startDate) : now.startOf('month'); // Início do período ou mês atual
    //     const end = endDate ? DateTime.fromISO(endDate) : now.endOf('month'); // Fim do período ou mês atual

    //     // Calculando o mês anterior (para PA)
    //     const previousMonth = start.minus({ months: 1 }).startOf('month'); // Mês anterior ao período
    //     const previousMonthEnd = previousMonth.endOf('month');  // Fim do mês anterior

    //     const query = AccountingJournalEntryItems.query()
    //         .preload('accountPlan')
    //         .preload('entry');

    //     if (accountPlanId) {
    //         query.where('account_plan_id', accountPlanId);
    //     }

    //     const queryEntries = AccountPlanEntry.query()
    //     if (accountPlanId) {
    //         queryEntries.where('account_plan_id', accountPlanId);
    //     }

    //     const items = await query.exec();

    //     console.log("📄 Items encontrados:", items.length);

    //     const groupedByAccount = new Map<number, any>();

    //     items.forEach((item) => {
    //         const account = item.accountPlan;
    //         const date = item.entry?.operationDate;

    //         if (!groupedByAccount.has(account.id)) {
    //             groupedByAccount.set(account.id, {
    //                 conta: account.number,
    //                 descricao: account.description,
    //                 debitoPA: 0,
    //                 creditoPA: 0,
    //                 saldoPA: 0,
    //                 debitoP: 0,
    //                 creditoP: 0,
    //                 saldoP: 0,
    //                 debitoAC: 0,
    //                 creditoAC: 0,
    //                 saldoAC: 0,
    //                 saldoAtual: 0, // usado apenas internamente
    //                 items: [],
    //             });
    //         }

    //         const acc = groupedByAccount.get(account.id);
    //         const valor = Number(item.value);

    //         // Correção: normaliza o valor do operador para uppercase e compara diretamente
    //         const operator = item.operator?.toString().toUpperCase();
    //         const isDebit = operator === 'DEBIT';

    //         // Regras de período
    //         const isBeforePeriod = date >= previousMonth && date <= previousMonthEnd;
    //         const isInPeriod = date >= start && date <= end;
    //         const isAccumulated = date <= end;

    //         // Atualiza os totais por período
    //         if (isBeforePeriod) {
    //             isDebit ? acc.debitoPA += valor : acc.creditoPA += valor;
    //         }

    //         if (isInPeriod) {
    //             isDebit ? acc.debitoP += valor : acc.creditoP += valor;
    //         }

    //         if (isAccumulated) {
    //             isDebit ? acc.debitoAC += valor : acc.creditoAC += valor;
    //         }

    //         // Atualiza saldo atual da conta
    //         acc.saldoAtual += isDebit ? valor : -valor;

    //         // Adiciona o item com saldo atual
    //         acc.items.push({
    //             id: item.id,
    //             date,
    //             value: valor,
    //             operator: item.operator,
    //             description: item.description,
    //             documentDescription: item.documentDescription,
    //             saldo: acc.saldoAtual,
    //         });
    //     });

    //     // Calculando os saldos finais
    //     for (const acc of groupedByAccount.values()) {
    //         acc.saldoPA = acc.debitoPA - acc.creditoPA;
    //         acc.saldoP = acc.debitoP - acc.creditoP;
    //         acc.saldoAC = acc.debitoAC - acc.creditoAC;
    //     }

    //     const resultado = Array.from(groupedByAccount.values());

    //     console.log('📊 Resultado final do balancete agrupado:', resultado);

    //     return resultado;
    // }

    // public async fetchAllBalanceteByFiltersSearch(filters: FetchFilters) {
    //     const { startDate, endDate, accountPlanId } = filters;
    //     console.log("🕵️‍♂️ Filtros recebidos:", filters);

    //     const now = DateTime.now();
    //     const start = startDate ? DateTime.fromISO(startDate) : now.startOf('month');
    //     const end = endDate ? DateTime.fromISO(endDate) : now.endOf('month');

    //     const previousMonth = start.minus({ months: 1 }).startOf('month');
    //     const previousMonthEnd = previousMonth.endOf('month');

    //     // Consulta dos lançamentos
    //     const query = AccountingJournalEntryItems.query()
    //         .preload('accountPlan')
    //         .preload('entry');

    //     if (accountPlanId) {
    //         query.where('account_plan_id', accountPlanId);
    //     }

    //     const queryEntries = AccountPlanEntry.query();
    //     if (accountPlanId) {
    //         queryEntries.where('account_plan_id', accountPlanId);
    //     }

    //     const [items, entries] = await Promise.all([
    //         query.exec(),
    //         queryEntries.exec()
    //     ]);

    //     console.log("📄 Items encontrados:", items.length);

    //     // Mapear finalAllocation por account_plan_id
    //     const accountPlanFinalAllocationsMap = new Map<number, number>();
    //     entries.forEach(entry => {
    //         if (entry.accountPlanId !== undefined && entry.finalAllocation !== undefined) {
    //             // Salva apenas um finalAllocation por account_plan_id (último valor encontrado)
    //             accountPlanFinalAllocationsMap.set(entry.accountPlanId, Number(entry.finalAllocation));
    //         }
    //     });

    //     const groupedByAccount = new Map<number, any>();

    //     items.forEach((item) => {
    //         const account = item.accountPlan;
    //         const date = item.entry?.operationDate;

    //         if (!account || !date) return;

    //         if (!groupedByAccount.has(account.id)) {
    //             // Obter o finalAllocation da conta
    //             const finalAllocation = accountPlanFinalAllocationsMap.get(account.id) ?? 0;

    //             groupedByAccount.set(account.id, {
    //                 conta: account.number,
    //                 descricao: account.description,
    //                 debitoPA: 0,
    //                 creditoPA: 0,
    //                 saldoPA: 0,
    //                 debitoP: 0,
    //                 creditoP: 0,
    //                 saldoP: 0,
    //                 debitoAC: 0,
    //                 creditoAC: 0,
    //                 saldoAC: 0,
    //                 finalAllocation: finalAllocation,
    //                 items: [],
    //             });
    //         }

    //         // Adicione esta função no início do seu arquivo (ou em um utilitário)
    //         function parseDecimal(value: any): number {
    //             if (typeof value === 'number') return value; // Se já for número, retorna direto
    //             const strValue = String(value).trim();
    //             const normalizedValue = strValue.replace(/\./g, '').replace(',', '.'); // Remove pontos de milhar e substitui vírgula por ponto
    //             return parseFloat(normalizedValue) || 0; // Converte para float ou retorna 0 se falhar
    //         }

    //         console.log("itemitem", item)
    //         // No seu código, substitua TODAS as chamadas `Number()` por `parseDecimal()`:
    //         const acc = groupedByAccount.get(account.id);
    //         const valor = parseDecimal(item.value);
    //         const operator = item.operator?.toString().toUpperCase();
    //         const isDebit = operator === 'DEBIT';

    //         const isBeforePeriod = date >= previousMonth && date <= previousMonthEnd;
    //         const isInPeriod = date >= start && date <= end;
    //         const isAccumulated = date <= end;

    //         if (isBeforePeriod) {
    //             isDebit ? acc.debitoPA += valor : acc.creditoPA += valor;
    //         }

    //         if (isInPeriod) {
    //             isDebit ? acc.debitoP += valor : acc.creditoP += valor;
    //         }

    //         if (isAccumulated) {
    //             isDebit ? acc.debitoAC += valor : acc.creditoAC += valor;
    //         }

    //         // Adiciona o item com saldo fixo (finalAllocation da conta)
    //         acc.items.push({
    //             id: item.id,
    //             conta: account.number,
    //             date,
    //             value: valor,
    //             operator: item.operator,
    //             description: item.description,
    //             documentDescription: item.documentDescription,
    //             saldo: item.operation_balance,
    //         });
    //     });

    //     // Calcula os saldos finais
    //     for (const acc of groupedByAccount.values()) {
    //         acc.saldoPA = acc.debitoPA - acc.creditoPA;
    //         acc.saldoP = acc.debitoP - acc.creditoP;
    //         acc.saldoAC = acc.debitoAC - acc.creditoAC;
    //     }

    //     const resultado = Array.from(groupedByAccount.values());

    //     console.log('📊 Resultado final do balancete agrupado:', resultado);

    //     return resultado;
    // }


    public async fetchAllBalanceteByFiltersSearch(filters: FetchFilters) {
        const { startDate, endDate, accountPlanId } = filters;
        console.log("🕵️‍♂️ Filtros recebidos:", filters);

        const now = DateTime.now();
        const start = startDate ? DateTime.fromISO(startDate) : now.startOf('month');
        const end = endDate ? DateTime.fromISO(endDate) : now.endOf('month');

        // Alteração aqui: Definir o início do ano para o período anterior acumulado
        const startOfYear = start.startOf('year');
        const previousMonthEnd = start.minus({ months: 1 }).endOf('month');

        // Consulta dos lançamentos
        const query = AccountingJournalEntryItems.query()
            .preload('accountPlan')
            .preload('entry');

        if (accountPlanId) {
            query.where('account_plan_id', accountPlanId);
        }

        const queryEntries = AccountPlanEntry.query();
        if (accountPlanId) {
            queryEntries.where('account_plan_id', accountPlanId);
        }

        const [items, entries] = await Promise.all([
            query.exec(),
            queryEntries.exec()
        ]);

        console.log("📄 Items encontrados:", items.length);

        // Mapear finalAllocation por account_plan_id
        const accountPlanFinalAllocationsMap = new Map<number, number>();
        entries.forEach(entry => {
            if (entry.accountPlanId !== undefined && entry.finalAllocation !== undefined) {
                // Salva apenas um finalAllocation por account_plan_id (último valor encontrado)
                accountPlanFinalAllocationsMap.set(entry.accountPlanId, Number(entry.finalAllocation));
            }
        });

        const groupedByAccount = new Map<number, any>();

        items.forEach((item) => {
            const account = item.accountPlan;
            const date = item.entry?.operationDate;

            if (!account || !date) return;

            if (!groupedByAccount.has(account.id)) {
                // Obter o finalAllocation da conta
                const finalAllocation = accountPlanFinalAllocationsMap.get(account.id) ?? 0;

                groupedByAccount.set(account.id, {
                    conta: account.number,
                    descricao: account.description,
                    debitoPA: 0,
                    creditoPA: 0,
                    saldoPA: 0,
                    debitoP: 0,
                    creditoP: 0,
                    saldoP: 0,
                    debitoAC: 0,
                    creditoAC: 0,
                    saldoAC: 0,
                    finalAllocation: finalAllocation,
                    items: [],
                });
            }

            function parseDecimal(value: any): number {
                if (typeof value === 'number') return value; // Se já for número, retorna direto
                const strValue = String(value).trim();
                const normalizedValue = strValue.replace(/\./g, '').replace(',', '.'); // Remove pontos de milhar e substitui vírgula por ponto
                return parseFloat(normalizedValue) || 0; // Converte para float ou retorna 0 se falhar
            }

            console.log("itemitem", item)
            const acc = groupedByAccount.get(account.id);
            const valor = parseDecimal(item.value);
            const operator = item.operator?.toString().toUpperCase();
            const isDebit = operator === 'DEBIT';

            // Alteração aqui: Verificar se está no período acumulado (desde janeiro até mês anterior)
            const isBeforePeriod = date >= startOfYear && date <= previousMonthEnd;
            const isInPeriod = date >= start && date <= end;
            const isAccumulated = date <= end;

            if (isBeforePeriod) {
                isDebit ? acc.debitoPA += valor : acc.creditoPA += valor;
            }

            if (isInPeriod) {
                isDebit ? acc.debitoP += valor : acc.creditoP += valor;
            }

            if (isAccumulated) {
                isDebit ? acc.debitoAC += valor : acc.creditoAC += valor;
            }

            // Adiciona o item com saldo fixo (finalAllocation da conta)
            acc.items.push({
                id: item.id,
                conta: account.number,
                date,
                value: valor,
                operator: item.operator,
                description: item.description,
                documentDescription: item.documentDescription,
                saldo: item.operation_balance,
            });
        });

        // Calcula os saldos finais
        for (const acc of groupedByAccount.values()) {
            acc.saldoPA = acc.debitoPA - acc.creditoPA;
            acc.saldoP = acc.debitoP - acc.creditoP;
            acc.saldoAC = acc.debitoAC - acc.creditoAC;
        }

        const resultado = Array.from(groupedByAccount.values());

        console.log('📊 Resultado final do balancete agrupado:', resultado);

        return resultado;
    }

    // public async fetchGeneralFolioAccountByFilterData(filters: FetchFilters) {
    //     const { startDate, endDate } = filters;
    //     console.log("🕵️‍♂️ Filtros recebidos:", filters);

    //     const now = DateTime.now();
    //     const start = startDate ? DateTime.fromISO(startDate) : now.startOf('month');
    //     const end = endDate ? DateTime.fromISO(endDate) : now.endOf('month');

    //     const previousMonth = start.minus({ months: 1 }).startOf('month');
    //     const previousMonthEnd = previousMonth.endOf('month');

    //     const items = await AccountingJournalEntryItems.query()
    //         .preload('accountPlan', (query) => {
    //             query.where('final_allocation_type', 'General_Folio');
    //         })
    //         .preload('entry', (entryQuery) => {
    //             entryQuery.select(['id', 'operation_date']);
    //         })
    //         .exec();

    //     const recebimentos: any[] = [];
    //     const pagamentos: any[] = [];

    //     let saldoAnterior = 0;
    //     let recebTotal = 0;
    //     let pagTotal = 0;

    //     for (const item of items) {
    //         // Verifica se o accountPlan foi carregado e se ainda se encaixa no filtro (por segurança)
    //         if (!item.accountPlan || item.accountPlan.final_allocation_type !== 'General_Folio') continue;

    //         const operationDateISO = item.entry?.operationDate;
    //         if (!operationDateISO) continue;

    //         const date = DateTime.fromISO(operationDateISO.toString());
    //         const valor = Number(item.value);
    //         const isDebit = item.operator === OperatorType.DEBIT;
    //         console.log("isDebitisDebit", item.operator)
    //         const isReceivment = item.accountPlan.financial_type === 'recebimentos';
    //         const isPayment = item.accountPlan.financial_type === 'pagamentos';


    //         const isBeforePeriod = date >= previousMonth && date <= previousMonthEnd;
    //         const isInPeriod = date >= start && date <= end;

    //         if (isBeforePeriod) {
    //             saldoAnterior += isDebit ? valor : -valor;
    //         }

    //         if (isInPeriod) {
    //             const movimento = {
    //                 operationDate: date.toFormat('yyyy-MM-dd'),
    //                 value: valor,
    //                 description: item.description,
    //                 documentDescription: item.documentDescription,
    //                 accountPlan: item.accountPlan,
    //                 operator: item.operator
    //             };

    //             if (isDebit) {
    //                 recebTotal += valor;
    //                 recebimentos.push(movimento);
    //             } else {
    //                 pagTotal += valor;
    //                 pagamentos.push(movimento);
    //             }
    //         }
    //     }

    //     const saldoFinal = saldoAnterior + recebTotal - pagTotal;
    //     console.log("recebimentos", recebimentos)
    //     console.log("pagamentos", pagamentos)

    //     return {
    //         recebimentos,
    //         pagamentos,
    //         saldoAnterior,
    //         saldoFinal,
    //         totalRecebimentos: recebTotal,
    //         totalPagamentos: pagTotal
    //     };
    // }

    public async fetchGeneralFolioAccountByFilterData(filters: FetchFilters) {
        const { startDate, endDate } = filters;
        console.log("🕵️‍♂️ Filtros recebidos:", filters);

        const now = DateTime.now();
        const start = startDate ? DateTime.fromISO(startDate) : now.startOf('month');
        const end = endDate ? DateTime.fromISO(endDate) : now.endOf('month');

        const previousMonth = start.minus({ months: 1 }).startOf('month');
        const previousMonthEnd = previousMonth.endOf('month');

        const items = await AccountingJournalEntryItems.query()
        .preload('accountPlan', (query) => {
            query.where('final_allocation_type', 'General_Folio');
        })
        .preload('entry', (entryQuery) => {
            entryQuery.select(['id', 'operation_date', 'accounting_document_id'])
              .preload('accountingDocument', (docQuery) => {
                docQuery.select(['id', 'description']);
              });
        })
        .exec();
    

        const recebimentos: any[] = [];
        const pagamentos: any[] = [];

        let saldoAnterior = 0;
        let recebTotal = 0;
        let pagTotal = 0;

        for (const item of items) {
            if (!item.accountPlan || item.accountPlan.final_allocation_type !== 'General_Folio') continue;

            const operationDateISO = item.entry?.operationDate;
            if (!operationDateISO) continue;

            const date = DateTime.fromISO(operationDateISO.toString());
            const valor = Number(item.value);

            // ✅ Nova lógica
            const isDebit = item.operator === OperatorType.DEBIT; // RECEBIMENTO
            const isCredit = item.operator === OperatorType.CREDTI; // PAGAMENTO

            const isBeforePeriod = date >= previousMonth && date <= previousMonthEnd;
            const isInPeriod = date >= start && date <= end;

            if (isBeforePeriod) {
                saldoAnterior += isDebit ? valor : -valor;
            }

            if (isInPeriod) {
                const movimento = {
                    operationDate: date.toFormat('yyyy-MM-dd'),
                    value: valor,
                    description: item.description,
                    documentDescription: item.entry?.accountingDocument?.description || "—",
                    accountPlan: item.accountPlan,
                    operator: item.operator
                };

                if (isDebit) {
                    recebTotal += valor;
                    recebimentos.push(movimento);
                } else if (isCredit) {
                    pagTotal += valor;
                    pagamentos.push(movimento);
                }
            }
        }

        const saldoFinal = saldoAnterior + recebTotal - pagTotal;
        console.log("📥 Recebimentos:", recebimentos);
        console.log("📤 Pagamentos:", pagamentos);

        return {
            recebimentos,
            pagamentos,
            saldoAnterior,
            saldoFinal,
            totalRecebimentos: recebTotal,
            totalPagamentos: pagTotal
        };
    }


    public async fetchGeneralFolioAccountByYearAndMonthData(filters: FetchFilters) {
        const activePlanYear = await this.resolveActivePlanYear(filters.year ? Number(filters.year) : undefined);
        const now = DateTime.now();
        const year = activePlanYear.year;
        const month = Number(filters.month) || now.month;


        console.log("filtros Recebidos", filters)

        const currentPeriodStart = DateTime.local(year, month, 1).startOf('month');
        const currentPeriodEnd = currentPeriodStart.endOf('month');

        const currentYearStart = DateTime.local(year, 1, 1).startOf('day');
        const currentYearEnd = DateTime.local(year, 12, 31).endOf('day');

        const previousYearStart = currentYearStart.minus({ years: 1 });
        const previousYearEnd = currentYearEnd.minus({ years: 1 });

        const items = await AccountingJournalEntryItems.query()
            .preload('accountPlan', (query) => {
                query.where('final_allocation_type', 'General_Folio');
            })
            .preload('entry', (entryQuery) => {
                entryQuery.select(['id', 'operation_date']);
            })
            .exec();

        const recebimentos: any[] = [];
        const pagamentos: any[] = [];

        let recebAnoAtual = 0;
        let recebAnoAnterior = 0;
        let pagAnoAtual = 0;
        let pagAnoAnterior = 0;

        console.log('📥 Lançamentos encontrados:', items.length);

        for (const item of items) {
            if (!item.accountPlan || item.accountPlan.final_allocation_type !== 'General_Folio') continue;

            const operationDateISO = item.entry?.operationDate;
            if (!operationDateISO) continue;

            const date = DateTime.fromISO(operationDateISO.toString());
            const valor = Number(item.value);
            const isDebit = item.operator === OperatorType.DEBIT;
            const isCredit = item.operator === OperatorType.CREDTI;

            const movimento = {
                operationDate: date.toFormat('yyyy-MM-dd'),
                value: valor,
                description: item.description,
                documentDescription: item.documentDescription,
                accountPlan: item.accountPlan,
                operator: item.operator
            };

            console.log("Visibilidade de movimento", movimento)
            console.log("currentYearStart", currentYearStart)

            if (date >= currentYearStart && date <= currentYearEnd) {
                if (isDebit) recebAnoAtual += valor;
                if (isCredit) pagAnoAtual += valor;
            }

            if (date >= previousYearStart && date <= previousYearEnd) {
                if (isDebit) recebAnoAnterior += valor;
                if (isCredit) pagAnoAnterior += valor;
            }

            if (date >= currentPeriodStart && date <= currentPeriodEnd) {
                if (isDebit) recebimentos.push(movimento);
                if (isCredit) pagamentos.push(movimento);
            }
        }

        console.log("📦 Recebimentos do mês:", recebimentos);
        console.log("📦 Pagamentos do mês:", pagamentos);
        console.log("📊 Totais:", {
            recebAnoAtual,
            recebAnoAnterior,
            pagAnoAtual,
            pagAnoAnterior
        });

        return {
            recebimentos,
            pagamentos,
            totais: {
                recebAnoAtual,
                recebAnoAnterior,
                pagAnoAtual,
                pagAnoAnterior
            }
        };
    }



    public async fetchAllAccountingJournals() {
        return await AccountingJournal.query().preload('documents');

    }



    public async fetchAllAccountingJournalByJournalNumber(journalNumber: string) {
        return await AccountingJournal.query().where('journalNumber', journalNumber)
            .preload('documents')
            .first();
    }
}
