import db from "@adonisjs/lucid/services/db";
import AccountPlan from "../../models/planbudject/account_plan.js";
import AccountPlanYear from "../../models/planbudject/account_plan_year.js";
import { AccoutPlanType, OperatorType } from "../../models/utility/Enums.js";
import { inject } from "@adonisjs/core";
import { InternalRequestDTO } from "./utils/dtos.js";
import AccountPlanEntry from "../../models/planbudject/account_plan_entry.js";
import InternalRequest from "../../models/request/internal_request.js";
import { DateTime } from "luxon";
import Provider from "../../models/person/provider.js";
import InternalRequestItem from "../../models/request/internal_request_item.js";
import InternalRequestValidator from "../../validators/request/internalRequestValidator.js";
import { TransactionClientContract } from "@adonisjs/lucid/types/database";
import VoidedRequest from "#models/request/VoidedRequest";
import AccountingJournalEntry from "#models/accounting/accounting_journal_entry";
import AccountingJournalEntryItems from "#models/accounting/accounting_journal_entry_items";
import { operatorType } from "#services/accounting/utils/dtos";

/*
* Servicos para requisicoes internas
* Gautchi R. Chambe (chambegautchi@gmail.com)
* Cipriano P. Sagene (ciprianosagene@gmail.com)
*/
@inject()
export default class InternalRequestService {

  public async resolveActivePlanYear(preferredYear?: number): Promise<AccountPlanYear> {
    if (preferredYear && Number(preferredYear) >= 2000) {
      const found = await AccountPlanYear.findBy('year', Number(preferredYear));
      if (found) {
        return found;
      }
    }
    const active = await AccountPlanYear.query().where('state', 2).first();
    if (active) {
      return active;
    }
    const fallback2025 = await AccountPlanYear.findBy('year', 2025);
    if (fallback2025) {
      return fallback2025;
    }
    return await AccountPlanYear.query().orderBy('year', 'desc').firstOrFail();
  }

  public async generateNextRequestNumber(accountPlanYear: AccountPlanYear) {
    const sequenceArry = await InternalRequest.query()
      .where('accountPlanYearId', accountPlanYear.id);
    const nextSequence = sequenceArry.length + 1;
    return nextSequence;
  }

  public async createInternalRequest(data: InternalRequestDTO) {
    console.log("Iniciando o registro da requisição interna...");

    // 1. Validação inicial
    await InternalRequestValidator.validateOnCreate(data);

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("A lista de itens está vazia ou mal formatada.");
    }
    // 3. Conversão da data de operação
    const currentDate = new Date();
    const parsedDate = new Date(data.operationDate);
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Data inválida fornecida para operationDate: ${data.operationDate}`);
    }

    const operationDate = DateTime.local(
      parsedDate.getFullYear(),
      parsedDate.getMonth() + 1,
      parsedDate.getDate()
    );

    console.log("dataItems", data)

    let beneficiary: { id: number } | undefined;
    try {
      beneficiary = await AccountPlan.findByOrFail({
        number: data.accountPlanFinancialNumber,
        type: AccoutPlanType.FINANCIAL,
      });
    } catch (err) {
      console.warn("Beneficiário não encontrado:", err.message);
    }

    let beneficiaryF2: { id: number } | undefined;

    for (const item of data.items) {
      if (item.beneficiaryName) {
        try {
          beneficiaryF2 = await AccountPlan.findByOrFail({
            number: item.beneficiaryName,
            type: AccoutPlanType.FINANCIAL,
          });
        } catch (err) {
          console.warn("Beneficiário não encontrado:", err.message);
        }
      }


      let isDuplicate = false;

      if (data.transactionType === 'UNIQUE_BENEFICIARY') {
        isDuplicate = await this.checkDuplicateDocumentRequest(
          data.document,
          data.documentNumber,
          beneficiary?.id!,
          data.operationDate
        );
      } else {
        isDuplicate = await this.checkDuplicateDocumentRequestForm2(
          data.document,
          data.documentNumber,
          beneficiaryF2?.id!,
          data.operationDate
        );
      }
      if (isDuplicate) {
        throw new Error(`Já existe uma requisição com os mesmos dados do fornecedor.`);
      }

    }
    // Verificar duplicação para cada item


    // 2. Cálculo do valor total dos itens
    let totalItemsValue = 0;
    for (const item of data.items) {
      if (!item.quantity || !item.unitPrice) {
        throw new Error(`Item inválido: ${JSON.stringify(item)}`);
      }
      totalItemsValue += item.quantity * item.unitPrice;
    }


    // 4. Início da transação
    const trx = await db.transaction();

    try {
      const currentPlanYear = await this.resolveActivePlanYear((data as any)?.year);
      const provider = await Provider.findByOrFail('accountPlanFinancialNumber', data.provideCode);

      // 5. Buscar plano financeiro (se fornecido)
      let accountPlanFinancial: { id: number } | undefined;
      try {
        accountPlanFinancial = await AccountPlan.findByOrFail({
          number: data.accountPlanFinancialNumber,
          type: AccoutPlanType.FINANCIAL,
        });
      } catch (err) {
        console.warn("Plano financeiro não encontrado:", data.accountPlanFinancialNumber);
      }

      const nextSequence = await this.generateNextRequestNumber(currentPlanYear);
      const paid = data.paid ?? 0;
      const formattedMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
      const formattedYear = currentDate.getFullYear();

      // 6. Criar requisição interna
      const internalRequest = await new InternalRequest()
        .fill({
          sequence: nextSequence,
          requestNumber: `${nextSequence}-${formattedMonth}${formattedYear}`,
          requestorName: data.requestorName,
          requestorDepartment: data.requestorDepartment,
          operationDate,
          totalRequestedValue: totalItemsValue,
          justification: data.justification,
          sectorBudject: data.sectorBudject,
          chapterBudject: data.chapterBudject,
          clauseBudject: data.clauseBudject,
          clauseNumberBudject: data.clauseNumberBudject,
          accountPlanYearId: currentPlanYear.id,
          accountPlanFinancialId: accountPlanFinancial?.id,
          providerId: provider.id,
          bankValue: data.bank,
          paidReq: paid,
          documentNumber: data.documentNumber,
          document: data.document,
          transactionType: data.transactionType,
        })
        .useTransaction(trx)
        .save();

      console.log("Requisição criada com sucesso:", internalRequest.requestNumber);

      // 7. Processamento dos itens
      for (const item of data.items) {
        // Busca orçamento
        const accountPlanBudject = await AccountPlan.findByOrFail({
          number: item.orcamento,
          type: AccoutPlanType.BUDJECT, // Corrigido nome da constante
        });

        // Beneficiário
        let beneficiary: { id: number } | undefined;
        if (item.beneficiaryName) {
          try {
            beneficiary = await AccountPlan.findByOrFail({
              number: item.beneficiaryName,
              type: AccoutPlanType.FINANCIAL,
            });
          } catch (err) {
            console.warn("Beneficiário não encontrado:", err.message);
          }
        }

        // Financiamento
        let financing: { id: number } | undefined;
        if (item.financiamentoView) {
          try {
            const number = item.financiamentoView.toString().split(" -")[0];
            financing = await AccountPlan.findByOrFail({
              number,
              type: AccoutPlanType.FINANCIAL,
            });
          } catch (err) {
            console.warn("Financiamento não encontrado:", err.message);
          }
        }

        // Entrada de orçamento por ano + número
        const entry = await this.findAccountPlanEntriesByYearAndNumber(
          currentPlanYear.year,
          item.orcamento
        );

        if (!entry) {
          throw new Error(`Plano de orçamento não encontrado para ID: ${item.orcamento}`);
        }

        // Entrada de alocação disponível (atual)
        const currentEntry = await AccountPlanEntry
          .query()
          .where('account_plan_id', accountPlanBudject.id)
          .where('account_plan_year_id', currentPlanYear.id)
          .useTransaction(trx)
          .firstOrFail();

        const valorOperacao = Number(item.importancia) || 0;
        console.log("🔢 valorOperacao:", valorOperacao.toFixed(2));

        const saldoInicial = Number(currentEntry.availableAllocation) || 0;
        console.log("💰 saldoInicial (availableAllocation):", saldoInicial.toFixed(2));

        const saldoInicialDinamicoP = Number(currentEntry.finalAllocation) || 0;
        console.log("📊 saldoInicialDinamicoP (finalAllocation):", saldoInicialDinamicoP.toFixed(2));

        const saldoInicialDinamico = Number((saldoInicialDinamicoP * 2.5).toFixed(2));
        console.log("📈 saldoInicialDinamico (finalAllocation x 2.5 x 100):", saldoInicialDinamico);

        const saldoAlocado = Number((saldoInicial * 2.5).toFixed(2));
        console.log("📦 saldoAlocado (availableAllocation x 2.5 x 100):", saldoAlocado);

        const necessario = Number((valorOperacao).toFixed(2));
        console.log("🧾 necessário (valorOperacao x 100):");

        const saldoExistente = Number((saldoAlocado - necessario).toFixed(2));
        console.log("✅ saldoExistente (saldoAlocado - necessário):", saldoExistente);

        if (saldoAlocado < necessario) {
          throw new Error(
            `Saldo insuficiente para item "${item.description}". Alocação disponível: ${(saldoAlocado / 100).toFixed(2)}, necessário: ${(necessario / 100).toFixed(2)}`
          );
        }

        console.log("saldoInicial:", saldoInicial);
        console.log("saldoExistente:", saldoExistente);

        // Salvar item da requisição
        await new InternalRequestItem()
          .fill({
            quantification: item.quantification,
            quantity: item.quantity,
            description: item.description,
            operationDate,
            unitPrice: item.unitPrice,
            internalRequestId: internalRequest.id,
            accountPlanBudjectId: accountPlanBudject.id,
            totalAmount: valorOperacao,
            beneficiaryNameId: beneficiary?.id,
            accountPlanFinancialAssociationId: financing?.id,
            saldoInicial: saldoInicialDinamico,
            saldoExistente: saldoExistente,
          })
          .useTransaction(trx)
          .save();

        // Atualizar a alocação disponível após salvar o item
        currentEntry.availableAllocation = saldoExistente / 2.5;
        await currentEntry.useTransaction(trx).save();

        // Atualiza entrada principal (se necessário)
        entry.availableAllocation = saldoExistente / 2.5;
        await entry.useTransaction(trx).save();
      }

      // 8. Finalização
      await trx.commit();
      console.log("Requisição interna registrada com sucesso.");
      return internalRequest;

    } catch (error) {
      await trx.rollback();
      console.error("Erro ao registrar a requisição interna:", error);
      throw error;
    }
  }

  private async checkDuplicateDocumentRequest(
    document: string,
    documentNumber: string,
    accountPlanFinancialId: number,
    operationDate: string | Date
  ): Promise<boolean> {
    // Formata a data recebida para YYYY-MM-DD
    const formattedOperationDate = this.formatDateToYYYYMMDD(operationDate);

    const existing = await InternalRequest.query()
      .where('document', document)
      .where('documentNumber', documentNumber)
      .where('account_plan_financial_id', accountPlanFinancialId)
      .whereRaw("DATE(operation_date) = ?", [formattedOperationDate])
      .first();

    return !!existing;
  }


  // Adicione esta nova função para o Form2
  private async checkDuplicateDocumentRequestForm2(
    document: string,
    documentNumber: string,
    accountPlanFinancialId: number,
    operationDate: string | Date
  ): Promise<boolean> {
    const formattedOperationDate = this.formatDateToYYYYMMDD(operationDate);

    const existing = await InternalRequest.query()
      .join('internal_request_items', 'internal_requests.id', 'internal_request_items.internal_request_id')
      .where('internal_requests.document', document)
      .where('internal_requests.documentNumber', documentNumber)
      .where(q => {
        q.where('internal_request_items.beneficiary_id', accountPlanFinancialId)
          .orWhere('internal_requests.account_plan_financial_id', accountPlanFinancialId)
      })
      .whereRaw("DATE(internal_requests.operation_date) = ?", [formattedOperationDate])
      .first();

    console.log('Resultado da verificação de duplicidade:', {
      document,
      documentNumber,
      accountPlanFinancialId,
      operationDate: formattedOperationDate,
      exists: !!existing
    });

    return !!existing;
  }

  // Função auxiliar para formatar qualquer data para YYYY-MM-DD
  private formatDateToYYYYMMDD(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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

  // public async createInternalRequest(data: InternalRequestDTO) {

  //   // Validação do campo 'bank' já ocorre no validador
  //   await InternalRequestValidator.validateOnCreate(data);

  //   let totalItemsValue = 0;
  //   // Corrigir o cálculo de totalItemsValue para garantir que a função assíncrona aguarde
  //   for (const itemData of data.items) {
  //     const itemValue = itemData.quantity * itemData.unitPrice;
  //     totalItemsValue += itemValue;
  //   }

  //   const currentDate = new Date();
  //   const operationDate = DateTime.local(data.operationDate.getFullYear(), data.operationDate.getMonth(), data.operationDate.getDate());
  //   console.log("Chegou11133333 ")

  //   let entry = await this.findAccountPlanEntriesByYearAndNumber(currentDate.getFullYear(), data.accountPlanBudjectNumber);

  //   if (!entry) {
  //     throw Error("Plano de conta com id informado não encontrado no sistema Id: " + data.accountPlanBudjectNumber);
  //   }
  //       console.log("Chegou111 ")


  //   const trx = await db.transaction(); // Start transaction
  //   try {
  //     const currentPlanYear = await AccountPlanYear.findByOrFail('year', currentDate.getFullYear());

  //     const provider = await Provider.findByOrFail('accountPlanFinancialNumber', data.provideCode);

  //     // const accountPlanBudject = await AccountPlan.findByOrFail(
  //     //   {
  //     //     'number': data.accountPlanBudjectNumber,
  //     //     'type': AccoutPlanType.BUDJECT
  //     //   }
  //     // );

  //     // Saldo da conta orcamental
  //     const accountPlanBudjectEntry = await AccountPlanEntry.findByOrFail({
  //       'accountPlanNumber': data.accountPlanBudjectNumber,
  //     });

  //     const accountPlanFinancial = await AccountPlan.findByOrFail(
  //       {
  //         'number': data.accountPlanFinancialNumber,
  //         'type': AccoutPlanType.FINANCIAL
  //       }
  //     );
  //     console.log("Chegou ", data.accountPlanFinancialAssociation)

  //     // const accountPlanFinancialAssociation = await AccountPlan.findByOrFail(
  //     //   {
  //     //     'number': data.accountPlanFinancialAssociation,
  //     //     'type': AccoutPlanType.FINANCIAL
  //     //   });


  //     console.log("Chegou111 ")

  //     const nextSequence = await this.generateNextRequestNumber(currentPlanYear);
  //     const paid = data.paid ?? 0;
  //     const createdInternalRequest = await new InternalRequest().fill({
  //       sequence: nextSequence,
  //       requestNumber: `${nextSequence}-${currentDate.getMonth()}${currentDate.getFullYear()}`,
  //       requestorName: data.requestorName,
  //       requestorDepartment: data.requestorDepartment,
  //       operationDate: operationDate,
  //       initialAvailabilityAccountBuject: accountPlanBudjectEntry.finalAllocation,
  //       currentAccountBudjectBalance: accountPlanBudjectEntry.finalAllocation,
  //       finalAccountBujectBalance: (accountPlanBudjectEntry.finalAllocation - (data.totalRequestedValue || 0)),
  //       totalRequestedValue: totalItemsValue,
  //       justification: data.justification,
  //       sectorBudject: data.sectorBudject,
  //       chapterBudject: data.chapterBudject,
  //       clauseBudject: data.clauseBudject,
  //       clauseNumberBudject: data.clauseNumberBudject,
  //       accountPlanYearId: currentPlanYear.id,
  //       providerId: provider.id,
  //       // accountPlanBudjectId: accountPlanBudject.id,
  //       accountPlanFinancialId: accountPlanFinancial.id,
  //       // accountPlanFinancialAssociationId: accountPlanFinancialAssociation.id,
  //       // Novo campo 'bank' sendo salvo
  //       bankValue: data.bank,  // Inclui o banco na requisição
  //       paid: paid
  //     }).useTransaction(trx).save();

  //     // Substituir o forEach por for...of para garantir que o item seja processado de forma assíncrona
  //     for (const itemData of data.items) {
  //       const accountPlanBudject = await AccountPlan.findByOrFail(
  //         {
  //           'number': itemData.orcamento,
  //           'type': AccoutPlanType.BUDJECT
  //         });
  //       try {
  //         await new InternalRequestItem().fill({
  //           quantification: itemData.quantification,
  //           quantity: itemData.quantity,
  //           description: itemData.description,
  //           operationDate: operationDate,
  //           unitPrice: itemData.unitPrice,
  //           internalRequestId: createdInternalRequest.id,
  //           accountPlanBudjectId: accountPlanBudject.id,

  //         }).useTransaction(trx).save();

  //         const round = (totalItemsValue / 2.5);

  //         let availableAllocation =
  //           (entry.availableAllocation - round);

  //         console.log(availableAllocation, entry.availableAllocation, round);

  //         // Atualiza o `availableAllocation` no entry
  //         entry.availableAllocation = availableAllocation;

  //         // Salva a entrada com a transação
  //         const updatedEntry = await entry.useTransaction(trx).save();

  //         await trx.commit();
  //         return updatedEntry;
  //       } catch (error) {
  //         await trx.rollback();
  //         throw error;
  //       }
  //     }

  //     await trx.commit();
  //     return createdInternalRequest;

  //   } catch (error) {
  //     await trx.rollback();
  //     throw error;
  //   }
  // }

  public async findAccountPlanEntriesByYearAndNumber(year: number, accountPlanNumber: string) {
    const activePlanYear = await this.resolveActivePlanYear(year);
    const entry = await AccountPlanEntry.query()
      .where('accountPlanNumber', accountPlanNumber)
      .whereHas('accountPlanYear', (accountPlanBudjectBuilder) => {
        accountPlanBudjectBuilder.where('year', activePlanYear.year);
      })
      .whereHas('accountPlan', (accountPlanBuilder) => {
        accountPlanBuilder.where('number', accountPlanNumber);
      })
      .first();

    // Carregar a relação 'accountPlan' explicitamente após a consulta
    if (entry) {
      await entry.load('accountPlan');

      // Acessar os atributos do accountPlan
      const accountPlan = entry.accountPlan;
      console.log(accountPlan.$attributes);
    }

    return entry;
  }

  // public async updateStatus(
  //   requestNumber: string,
  //   conformanceStatus: boolean,
  //   justification?: string
  // ) {
  //   try {
  //     const internalRequest = await InternalRequest.findByOrFail('requestNumber', requestNumber);

  //     // Mapeamento dos valores booleanos para os estados
  //     const statusMapping: Record<string, "CONFORMED" | "WITHOUT_CONFORMANCE"> = {
  //       true: "CONFORMED",
  //       false: "WITHOUT_CONFORMANCE",
  //     };

  //     const newStatus = statusMapping[String(conformanceStatus)];

  //     // Lógica de estorno quando o status muda para WITHOUT_CONFORMANCE
  //     if (newStatus === 'WITHOUT_CONFORMANCE') {

  //       const internalRequestItems = await InternalRequestItem.query()
  //         .where('internalRequestId', internalRequest.id);

  //       let totalAmountReturned = 0;

  //       for (const item of internalRequestItems) {

  //         const accountPlanBudget = await AccountPlanEntry.findByOrFail(
  //           'accountPlanId',
  //           item.accountPlanBudjectId
  //         );

  //         const amountToReturn = Number((item.totalAmount) / 2.5);
  //         totalAmountReturned += amountToReturn;

  //         // Estorna o valor para o orçamento disponível
  //         accountPlanBudget.availableAllocation = Number(accountPlanBudget.availableAllocation) + amountToReturn;

  //         await accountPlanBudget.save();
  //       }

  //       await VoidedRequest.create({
  //         requestNumber: internalRequest.requestNumber,
  //         originalStatus: internalRequest.conformance,
  //         newStatus: newStatus,
  //         justification: justification,
  //         totalAmountReturned: (totalAmountReturned * 2.5),
  //         internalRequestId: internalRequest.id
  //       });

  //     }

  //     // Atualiza o status e justificativa
  //     internalRequest.conformance = newStatus;

  //     if (justification !== undefined) {
  //       internalRequest.justification = justification;
  //     }

  //     await internalRequest.save();

  //     return internalRequest;

  //   } catch (error) {
  //     console.error('[updateStatus] Erro durante a atualização:', error);
  //     throw error;
  //   }
  // }



  // public async updateStatus(
  //   requestNumber: string,
  //   conformanceStatus: boolean,
  //   justification?: string
  // ) {
  //   try {
  //     const internalRequest = await InternalRequest.findByOrFail('requestNumber', requestNumber);
  
  //     // Mapeamento dos valores booleanos para os estados
  //     const statusMapping: Record<string, "CONFORMED" | "WITHOUT_CONFORMANCE"> = {
  //       true: "CONFORMED",
  //       false: "WITHOUT_CONFORMANCE",
  //     };
  
  //     const newStatus = statusMapping[String(conformanceStatus)];
  
  //     // Lógica de estorno quando o status muda para WITHOUT_CONFORMANCE
  //     if (newStatus === 'WITHOUT_CONFORMANCE') {
  
  //       const internalRequestItems = await InternalRequestItem.query()
  //         .where('internalRequestId', internalRequest.id);
  
  //       for (const item of internalRequestItems) {
  //         const accountPlanBudget = await AccountPlanEntry.findByOrFail(
  //           'accountPlanId',
  //           item.accountPlanBudjectId
  //         );
  
  //         const amountToReturn = Number(item.totalAmount) / 2.5;
  
  //         // Estorna o valor para o orçamento disponível
  //         accountPlanBudget.availableAllocation = Number(accountPlanBudget.availableAllocation) + amountToReturn;
  //         await accountPlanBudget.save();
  
  //         // Cria um VoidedRequest por item
  //         await VoidedRequest.create({
  //           requestNumber: internalRequest.requestNumber,
  //           originalStatus: internalRequest.conformance,
  //           newStatus: newStatus,
  //           justification: justification,
  //           totalAmountReturned: (amountToReturn * 2.5), // Reverte à forma original
  //           internalRequestId: internalRequest.id,
  //           internalRequestItemId: item.id // (Assumindo que você tenha esse campo)
  //         });
  //       }
  //     }
  
  //     // Atualiza o status e justificativa
  //     internalRequest.conformance = newStatus;
  
  //     if (justification !== undefined) {
  //       internalRequest.justification = justification;
  //     }
  
  //     await internalRequest.save();
  
  //     return internalRequest;
  
  //   } catch (error) {
  //     console.error('[updateStatus] Erro durante a atualização:', error);
  //     throw error;
  //   }
  // }
  

  public async updateStatus(
    requestNumber: string,
    conformanceStatus: boolean,
    justification?: string
  ) {
    try {
      const internalRequest = await InternalRequest.findByOrFail('requestNumber', requestNumber);
  
      const statusMapping: Record<string, 'CONFORMED' | 'WITHOUT_CONFORMANCE'> = {
        true: 'CONFORMED',
        false: 'WITHOUT_CONFORMANCE',
      };
  
      const newStatus = statusMapping[String(conformanceStatus)];
  
      if (newStatus === 'WITHOUT_CONFORMANCE') {
        const internalRequestItems = await InternalRequestItem
          .query()
          .where('internalRequestId', internalRequest.id);
  
        const voidedRequestsToCreate = [];
        const budgetsToUpdate = [];
  
        // Primeiro, verificamos se todos os dados necessários estão válidos
        for (const item of internalRequestItems) {
          if (!item.accountPlanBudjectId) {
            throw new Error(`Item ID ${item.id} não possui accountPlanBudjectId`);
          }
  
          const accountPlanBudget = await AccountPlanEntry.findBy('accountPlanId', item.accountPlanBudjectId);
  
          if (!accountPlanBudget) {
            throw new Error(`Nenhum AccountPlanEntry encontrado para ID ${item.accountPlanBudjectId}`);
          }
  
          const amountToReturn = Number(item.totalAmount) / 2.5;
  
          budgetsToUpdate.push({
            model: accountPlanBudget,
            newAvailable: Number(accountPlanBudget.availableAllocation) + amountToReturn,
          });
  
          voidedRequestsToCreate.push({
            requestNumber: internalRequest.requestNumber,
            originalStatus: internalRequest.conformance,
            newStatus,
            justification,
            totalAmountReturned: amountToReturn * 2.5,
            internalRequestId: internalRequest.id,
            internalRequestItemId: item.id,
          });
        }
  
        // Aplicamos as alterações somente após validação de todos os itens
        for (const budget of budgetsToUpdate) {
          budget.model.availableAllocation = budget.newAvailable;
          await budget.model.save();
        }
  
        for (const voided of voidedRequestsToCreate) {
          await VoidedRequest.create(voided);
        }
      }
  
      internalRequest.conformance = newStatus;
  
      if (justification !== undefined) {
        internalRequest.justification = justification;
      }
  
      await internalRequest.save();
  
      return internalRequest;
  
    } catch (error) {
      console.error('[updateStatus] Erro durante a atualização:', error.message);
      throw error;
    }
  }
  
  public async findAll() {
    return await InternalRequest.query()
      .preload('accountPlanBudject') // Preload do orçamento relacionado à requisição
      .preload('accountPlanFinancial') // Preload financeiro relacionado à requisição
      .preload('items', (query) => {
        query.preload('accountPlanBudject'); // Preload do orçamento relacionado aos itens
      }) // Preload dos itens e seus relacionamentos
      .orderBy('operationDate', 'desc'); // Ordenação por data de operação
  }

  public async feacthAll() {
    return await InternalRequest.query()
      .preload('accountPlanBudject') // Preload do orçamento
      .preload('accountPlanFinancial') // Preload financeiro
      .preload('items') // Preload dos itens relacionados
      .leftJoin('account_plans', 'account_plan.id', 'internal_requests.account_plan_id') // Junção à esquerda com o plano de contas
      .orderBy('operationDate', 'desc') // Ordenação por data
  }

  public async fetchAll() {
    const result = await InternalRequestItem.query()
      .preload('beneficiaryName')
      .preload('accountPlanFinancialAssociation')
      .preload('accountPlanBudject') // Carrega a relação
      .preload('internalRequest', (internalRequestQuery) => {
        internalRequestQuery
          .select([
            'id',
            'sequence',
            'request_number',
            'requestor_name',
            'requestor_department',
            'operation_date',
            'paidReq',
            'conformance',
            'total_requested_value',
            'bank_Value', // Inclua explicitamente o campo desejado
            'account_plan_budject_id',
            'account_plan_financial_id',
            'account_plan_financial_association_id',
            'transaction_type',
            'document',
            'documentNumber',
            'payment_type',
            'remaining_balance',
            'paidReq',
            'reconciliation_date',
            'is_reconciled'
          ])
          .preload('accountPlanFinancial') // Carrega a relação
          .preload('accountPlanFinancialAssociation')
      });

    return result;
  }

  public async fetchAllValid() {
    const result = await InternalRequestItem.query()
      .whereHas('internalRequest', (query) => {
        query.whereNot('conformance', 'WITHOUT_CONFORMANCE'); // ← Aqui está a diferença
      })
      .preload('beneficiaryName')
      .preload('accountPlanFinancialAssociation')
      .preload('accountPlanBudject')
      .preload('internalRequest', (internalRequestQuery) => {
        internalRequestQuery
          .select([
            'id',
            'sequence',
            'request_number',
            'requestor_name',
            'requestor_department',
            'operation_date',
            'paidReq',
            'conformance',
            'total_requested_value',
            'bank_Value',
            'account_plan_budject_id',
            'account_plan_financial_id',
            'account_plan_financial_association_id',
            'transaction_type',
            'document',
            'documentNumber',
            'payment_type',
            'remaining_balance'
          ])
          .preload('accountPlanFinancial')
          .preload('accountPlanFinancialAssociation');
      });
  
    return result;
  }
  

  public async findById(id: number) {
    return await InternalRequest.findOrFail(id);
  }

  public async findByRequestNumber(requestNumber: string) {
    return await InternalRequest.findByOrFail('requestNumber', requestNumber);
  }

  public async fetchDashboardData() {
    const activePlanYear = await this.resolveActivePlanYear();
    const currentYear = activePlanYear.year;
    const previousYear = currentYear - 1;

    const previousYearStart = DateTime.local(previousYear).startOf('year').toSQLDate();
    const previousYearEnd = DateTime.local(previousYear).endOf('year').toSQLDate();
    const currentYearStart = DateTime.local(currentYear).startOf('year').toSQLDate();
    const currentYearEnd = DateTime.local(currentYear).endOf('year').toSQLDate();

    if (!previousYearStart || !previousYearEnd || !currentYearStart || !currentYearEnd) {
      throw new Error('Falha ao gerar datas SQL para o filtro');
    }

    // Buscar todos os InternalRequests dos dois anos
    const data = await InternalRequest.query()
      .select(
        'id',
        'created_at',
        'operation_date',
        'total_requested_value',
        'bank_value',
        'account_plan_budject_id',
        'paidReq'
      )
      .where((query) => {
        query
          .whereBetween('created_at', [previousYearStart, previousYearEnd])
          .orWhereBetween('created_at', [currentYearStart, currentYearEnd]);
      });


    const summary = {
      currentYear: {
        requestsCount: 0,
        totalRequested: 0,
        totalRequestPaid: 0,  // Novo campo para somar os pagamentos
        totalBankValue: 0,
        totalBudget: 0,
        budgetBalance: 0
      },
      previousYear: {
        requestsCount: 0,
        totalRequested: 0,
        totalRequestPaid: 0,  // Novo campo para somar os pagamentos
        totalBankValue: 0,
        totalBudget: 0,
        budgetBalance: 0
      }
    };


    // Processar dados de requisições para contar e somar valores por ano
    for (const item of data) {

      const createdAtRaw = item.createdAt;
      if (!createdAtRaw) {
        continue;
      }

      const yearNum = createdAtRaw.year;
      const yearKey = yearNum === currentYear ? 'currentYear' : yearNum === previousYear ? 'previousYear' : null;

      if (!yearKey) {
        continue;
      }


      summary[yearKey].requestsCount += 1;
      summary[yearKey].totalRequested += Number(item.totalRequestedValue || 0);
      summary[yearKey].totalBankValue += Number(item.bankValue || 0);

      // Adiciona o valor pago se paidReq for verdadeiro
      if (item.paidReq) {
        summary[yearKey].totalRequestPaid += Number(item.totalRequestedValue || 0);
      }

    }

    // Função para buscar o orçamento somado para um dado ano
    async function getTotalBudgetForYear(year: number): Promise<number> {
      try {
        const allocationColumn = 'initial_allocation';
        const yearRecord = await AccountPlanYear.findBy('year', year);
        if (!yearRecord) {
          return 0;
        }
        const result = await AccountPlanEntry.query()
          .where('account_plan_year_id', yearRecord.id)
          .whereRaw(`CAST(SUBSTRING_INDEX(account_plan_number, '.', -1) AS UNSIGNED) > 0`)
          .sum(`${allocationColumn} as total`) as unknown as AccountPlanEntry[];


        const totalSum = Number(result?.[0]?.$extras?.total || 0);


        return totalSum;
      } catch (error) {
        console.error('Erro ao buscar orçamento:', error);
        return 0;
      }
    }

    // Buscar orçamentos para ambos os anos
    summary.currentYear.totalBudget = await getTotalBudgetForYear(currentYear);

    // Só busca orçamento do ano anterior se houver requisições nesse ano
    if (summary.previousYear.requestsCount > 0) {
      summary.previousYear.totalBudget = await getTotalBudgetForYear(previousYear);
    } else {
      summary.previousYear.totalBudget = 0;
    }

    // Calcular saldo orçamentário (orçamento - total solicitado)
    summary.currentYear.budgetBalance = summary.currentYear.totalBudget - summary.currentYear.totalRequestPaid;
    summary.previousYear.budgetBalance = summary.previousYear.totalBudget - summary.previousYear.totalRequestPaid;

    return summary;
  }


  public async fetchDashboardData2() {
    const activePlanYear = await this.resolveActivePlanYear();
    const currentYear = activePlanYear.year;
    const currentYearStart = DateTime.local(currentYear).startOf('year').toSQLDate();
    const currentYearEnd = DateTime.local(currentYear).endOf('year').toSQLDate();

    if (!currentYearStart || !currentYearEnd) {
      throw new Error('Falha ao gerar datas SQL para o filtro');
    }

    interface Category {
      name: string;
      prefix: string;
    }

    interface Categories {
      personnel: Category;
      goodsAndServices: Category;
      currentTransfers: Category;
      pastExercises: Category;
      capitalExpenses: Category;
      global: Category;
    }

    const categories: Categories = {
      personnel: { name: 'Despesas com o Pessoal', prefix: '1.1' },
      goodsAndServices: { name: 'Bens e Serviços', prefix: '1.2' },
      currentTransfers: { name: 'Transferências Correntes', prefix: '1.4' },
      pastExercises: { name: 'Exercícios Findos', prefix: '1.6' },
      capitalExpenses: { name: 'Despesas de Capital', prefix: '2.' },
      global: { name: 'Globais', prefix: 'TOTAL' }
    };

    type Summary = {
      personnel: number;
      goodsAndServices: number;
      currentTransfers: number;
      pastExercises: number;
      capitalExpenses: number;
      global: number;
    };

    const summary: Summary = {
      personnel: 0,
      goodsAndServices: 0,
      currentTransfers: 0,
      pastExercises: 0,
      capitalExpenses: 0,
      global: 0
    };

    const execution: Summary = {
      personnel: 0,
      goodsAndServices: 0,
      currentTransfers: 0,
      pastExercises: 0,
      capitalExpenses: 0,
      global: 0
    };

    const accountPlanEntries = await AccountPlanEntry.query()
      .select('id', 'account_plan_number', 'initial_allocation', 'final_allocation', 'created_at')
      .where('account_plan_year_id', activePlanYear.id);


    for (const entry of accountPlanEntries) {
      const accountPlanNumber = entry.accountPlanNumber;
      if (!accountPlanNumber) {
        continue;
      }

      const value = Number(entry.finalAllocation || entry.initialAllocation || 0);

      if (accountPlanNumber.startsWith(categories.personnel.prefix)) {
        summary.personnel += value;
      } else if (accountPlanNumber.startsWith(categories.goodsAndServices.prefix)) {
        summary.goodsAndServices += value;
      } else if (accountPlanNumber.startsWith(categories.currentTransfers.prefix)) {
        summary.currentTransfers += value;
      } else if (accountPlanNumber.startsWith(categories.pastExercises.prefix)) {
        summary.pastExercises += value;
      } else if (accountPlanNumber.startsWith(categories.capitalExpenses.prefix)) {
        summary.capitalExpenses += value;
      } else {
      }
    }

    // Buscar valores pagos por categoria com preload
    const paidRequests = await InternalRequestItem.query()
      .preload('accountPlanBudject') // <-- preload necessário
      .select('id', 'account_plan_budject_id', 'total_amount', 'created_at')
      .whereBetween('created_at', [currentYearStart, currentYearEnd]);

    for (const req of paidRequests) {
      const relatedBudget = req.accountPlanBudject;

      if (!relatedBudget || !relatedBudget.number) {
        continue;
      }

      const accountPlanNumber = relatedBudget.number;
      const paid = Number(req.totalAmount || 0);

      if (accountPlanNumber.startsWith(categories.personnel.prefix)) {
        execution.personnel += paid;
      } else if (accountPlanNumber.startsWith(categories.goodsAndServices.prefix)) {
        execution.goodsAndServices += paid;
      } else if (accountPlanNumber.startsWith(categories.currentTransfers.prefix)) {
        execution.currentTransfers += paid;
      } else if (accountPlanNumber.startsWith(categories.pastExercises.prefix)) {
        execution.pastExercises += paid;
      } else if (accountPlanNumber.startsWith(categories.capitalExpenses.prefix)) {
        execution.capitalExpenses += paid;
      }
    }

    // Calcular global
    summary.global = Object.values(summary).reduce((acc, val) => acc + val, 0) - summary.global;
    execution.global = Object.values(execution).reduce((acc, val) => acc + val, 0) - execution.global;

    // Calcular percentagens
    const percentage: Summary = {
      personnel: summary.personnel ? (execution.personnel / summary.personnel) * 100 : 0,
      goodsAndServices: summary.goodsAndServices ? (execution.goodsAndServices / summary.goodsAndServices) * 100 : 0,
      currentTransfers: summary.currentTransfers ? (execution.currentTransfers / summary.currentTransfers) * 100 : 0,
      pastExercises: summary.pastExercises ? (execution.pastExercises / summary.pastExercises) * 100 : 0,
      capitalExpenses: summary.capitalExpenses ? (execution.capitalExpenses / summary.capitalExpenses) * 100 : 0,
      global: summary.global ? (execution.global / summary.global) * 100 : 0
    };

    interface ReturnType {
      year: number;
      categories: Record<keyof Categories, string>;
      values: Summary;
      execution: Summary;
      percentage: Summary;
      _debug?: {
        totalEntriesProcessed: number;
        totalRequestsProcessed: number;
        queryPeriod: string;
      };
    }

    const result: ReturnType = {
      year: currentYear,
      categories: {
        personnel: categories.personnel.name,
        goodsAndServices: categories.goodsAndServices.name,
        currentTransfers: categories.currentTransfers.name,
        pastExercises: categories.pastExercises.name,
        capitalExpenses: categories.capitalExpenses.name,
        global: categories.global.name
      },
      values: summary,
      execution: execution,
      percentage: percentage,
      _debug: {
        totalEntriesProcessed: accountPlanEntries.length,
        totalRequestsProcessed: paidRequests.length,
        queryPeriod: `${currentYearStart} à ${currentYearEnd}`
      }
    };

    return result;
  }



  public async fetchBudget() {
    const activePlanYear = await this.resolveActivePlanYear();
    const currentYear = activePlanYear.year;
    const previousYear = currentYear - 1;

    // Definição das categorias
    const BaseCategories = {
      personnel: {
        name: 'Despesas com o Pessoal',
        prefixes: ['1.1.1.1.00', '1.1.2.1.00']
      },
      goodsAndServices: {
        name: 'Bens e Serviços',
        prefixes: ['1.2.1.0.00', '1.2.2.0.00']
      },
      currentTransfers: {
        name: 'Transferências Correntes',
        prefixes: ['1.4.0.0.00']
      },
      pastExercises: {
        name: 'Exercícios Findos',
        prefixes: ['1.6.1.0.00', '1.6.2.0.00']
      },
      capitalExpenses: {
        name: 'Despesas de Capital',
        prefixes: ['2.1.1.0.00', '2.1.2.0.00', '2.1.3.0.00']
      }
    };

    const Categories = {
      ...BaseCategories,
      global: {
        name: 'Globais',
        prefixes: Object.values(BaseCategories).flatMap(category => category.prefixes)
      }
    };

    const summary = {
      currentYear: {} as Record<string, number>,
      previousYear: {} as Record<string, number>
    };

    const years = [currentYear, previousYear];

    for (const year of years) {

      try {
        const entries = await AccountPlanEntry.query()
          .select(
            'account_plan_entries.final_allocation as finalAllocation',
            'account_plan_entries.initial_allocation as initialAllocation',
            'account_plans.number as planNumber',
            'account_plan_years.year as planYear'
          )
          .join('account_plans', 'account_plans.id', 'account_plan_entries.account_plan_id')
          .join('account_plan_years', 'account_plan_years.id', 'account_plan_entries.account_plan_year_id')
          .where('account_plan_years.year', year)
          .whereNotNull('account_plans.number');


        // Inicializa totais por categoria
        const yearKey = year === currentYear ? 'currentYear' : 'previousYear';
        summary[yearKey] = Object.keys(Categories).reduce((acc, key) => {
          acc[key] = 0;
          return acc;
        }, {} as Record<string, number>);

        for (const entry of entries) {
          const planNumber = (entry.$extras?.planNumber || '').toString().trim();

          const value = parseFloat(entry.$extras.finalAllocation) ||
            parseFloat(entry.$extras.initialAllocation) || 0;

          const roundedValue = parseFloat(value.toFixed(2));

          // Verifica todas as categorias sem break
          for (const [categoryKey, category] of Object.entries(Categories)) {
            if (category.prefixes.some(prefix => planNumber.startsWith(prefix))) {
              summary[yearKey][categoryKey] += roundedValue;
              // Não usamos break para permitir múltiplas classificações
            }
          }
        }

        // Arredonda os totais finais
        for (const key in summary[yearKey]) {
          summary[yearKey][key] = parseFloat(summary[yearKey][key].toFixed(2));
        }


      } catch (error) {
        summary[year === currentYear ? 'currentYear' : 'previousYear'] =
          Object.keys(Categories).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
      }
    }

    return summary;
  }

  public async dashboardBudjectExecutionData() {
    try {
      // Definir o período de 2 anos (ano atual ativo e ano anterior)
      const activePlanYear = await this.resolveActivePlanYear();
      const currentYear = activePlanYear.year;
      const previousYear = currentYear - 1;
      const startDate = `${previousYear}-01-01`;
      const endDate = `${currentYear}-12-31`;


      // Buscar requisições emitidas nos últimos 2 anos
      const emittedRequests = await InternalRequest.query()
        .where('createdAt', '>=', startDate)
        .andWhere('createdAt', '<=', endDate);

      // Buscar requisições pagas nos últimos 2 anos
      const paidRequests = await InternalRequest.query()
        .where('paidReq', 1)
        .andWhere('updatedAt', '>=', startDate)
        .andWhere('updatedAt', '<=', endDate);

      // Função para converter valor para número (removendo zeros à esquerda)
      const parseAllocationValue = (value: any): number => {
        if (typeof value === 'string') {
          // Remove zeros à esquerda e converte para número
          return parseFloat(value.replace(/^0+/, '')) || 0;
        }
        return Number(value) || 0;
      };

      // Função auxiliar para filtrar e somar totalAllocation por ano
      const sumAllocationByYear = (requests: InternalRequest[], year: number, dateField: 'createdAt' | 'updatedAt') => {
        const sum = requests.reduce((total, req) => {
          const dateValue = req[dateField];
          let yearToCompare: number;

          if (dateValue instanceof Date) {
            yearToCompare = dateValue.getFullYear();
          } else if (dateValue && typeof dateValue === 'object' && 'year' in dateValue) {
            yearToCompare = dateValue.year;
          } else if (typeof dateValue === 'string') {
            yearToCompare = new Date(dateValue).getFullYear();
          } else {
            return total;
          }

          if (yearToCompare === year) {
            const allocationValue = parseAllocationValue(req.totalRequestedValue);
            return total + allocationValue;
          }
          return total;
        }, 0);

        return sum;
      };

      // Função para somar o totalAllocation de todas as requisições
      const sumTotalAllocation = (requests: InternalRequest[]) => {
        return requests.reduce((total, req) => {
          const allocationValue = parseAllocationValue(req.totalRequestedValue);
          return total + allocationValue;
        }, 0);
      };

      // Processar os dados para o dashboard
      const result = {
        emittedRequests: {
          total: sumTotalAllocation(emittedRequests),
          currentYear: sumAllocationByYear(emittedRequests, currentYear, 'createdAt'),
          previousYear: sumAllocationByYear(emittedRequests, previousYear, 'createdAt'),
          data: emittedRequests
        },
        paidRequests: {
          total: sumTotalAllocation(paidRequests),
          currentYear: sumAllocationByYear(paidRequests, currentYear, 'updatedAt'),
          previousYear: sumAllocationByYear(paidRequests, previousYear, 'updatedAt'),
          data: paidRequests
        }
      };

      return {
        emittedRequests: {
          ...result.emittedRequests,
          total: result.emittedRequests.total,
          currentYear: result.emittedRequests.currentYear,
          previousYear: result.emittedRequests.previousYear
        },
        paidRequests: {
          ...result.paidRequests,
          total: result.paidRequests.total,
          currentYear: result.paidRequests.currentYear,
          previousYear: result.paidRequests.previousYear
        }
      };

    } catch (error) {
      console.error('Erro em dashboardBudjectExecutionData:', error);
      throw new Error(`Error fetching budget execution data: ${error.message}`);
    }
  }


  public async dashboardAccountToPayAndReceive() {
    console.log('Iniciando dashboardAccountToPayAndReceive...');
    try {
      // Definir o período de 2 anos (ano atual ativo e ano anterior)
      const activePlanYear = await this.resolveActivePlanYear();
      const currentYear = activePlanYear.year;
      const previousYear = currentYear - 1;
      const startDate = DateTime.fromObject({ year: previousYear, month: 1, day: 1 }).toSQLDate();
      const endDate = DateTime.fromObject({ year: currentYear, month: 12, day: 31 }).toSQLDate();

      console.log('Datas definidas:', { currentYear, previousYear, startDate, endDate });

      if (!startDate || !endDate) {
        throw new Error('Falha ao converter datas para o formato SQL');
      }

      // Buscar contas a receber (journal_id = 3)
      console.log('Buscando contas a receber...');
      const accountsToReceiveEntries = await AccountingJournalEntry.query()
        .where('accounting_journal_id', 3)
        .where('is_receivable', 1)
        .where('operation_date', '>=', startDate)
        .where('operation_date', '<=', endDate);

      console.log('Entradas a receber encontradas:', accountsToReceiveEntries.length);
      console.log('IDs das entradas a receber:', accountsToReceiveEntries.map(e => e.id));

      const receiveEntryIds = accountsToReceiveEntries.map(e => e.id);

      // Buscar contas a pagar (journal_id = 2)
      console.log('Buscando contas a pagar...');
      const accountsToPayEntries = await AccountingJournalEntry.query()
        .where('accounting_journal_id', 2)
        .where('operation_date', '>=', startDate)
        .where('operation_date', '<=', endDate);

      console.log('Entradas a pagar encontradas:', accountsToPayEntries.length);
      console.log('IDs das entradas a pagar:', accountsToPayEntries.map(e => e.id));

      const payEntryIds = accountsToPayEntries.map(e => e.id);

      // Buscar todos os itens relevantes
      console.log('Buscando itens de lançamentos...');
      const allItems = await AccountingJournalEntryItems.query()
        .where(q => {
          q.whereIn('entry_id', [...receiveEntryIds, ...payEntryIds])
           .where('operation_date', '>=', startDate)
           .where('operation_date', '<=', endDate);
        });

      console.log('Total de itens encontrados:', allItems.length);
      console.log('Exemplo de item:', allItems[0] ? {
        id: allItems[0].id,
        entry_id: allItems[0].entryId,
        operator: allItems[0].operator,
        value: allItems[0].value,
        operation_date: allItems[0].operationDate
      } : 'Nenhum item encontrado');

      // Separar itens de receber e pagar
      const receiveItems = allItems.filter(item => receiveEntryIds.includes(item.entryId));
      const payItems = allItems.filter(item => payEntryIds.includes(item.entryId));

      console.log('Itens a receber:', receiveItems.length);
      console.log('Itens a pagar:', payItems.length);

      // Função para processar os itens com logs detalhados
      const processItems = (items: AccountingJournalEntryItems[], type: string) => {
        console.log(`\nProcessando itens de ${type}...`);
        
        const totalDebits = new Map<number, number>();
        let currentYearDebits = 0;
        let previousYearDebits = 0;

        items.forEach(item => {
          console.log(`\nItem ${item.id}:`, {
            entry_id: item.entryId,
            operator: item.operator,
            value: item.value,
            operation_date: item.operationDate
          });

          if (item.operator === OperatorType.DEBIT.toUpperCase()) {
            const value = Number(item.value) || 0;
            const operationDate = item.operationDate;
            const year = operationDate.year;

            console.log('Processando débito:', { value, year });

            // Atualizar total (apenas um débito por entrada)
            if (!totalDebits.has(item.entryId)) {
              console.log(`Adicionando débito ao total para entrada ${item.entryId}`);
              totalDebits.set(item.entryId, value);
            } else {
              console.log(`Débito para entrada ${item.entryId} já foi contabilizado`);
            }
            
            // Atualizar anos (todos os débitos)
            if (year === currentYear) {
              console.log('Adicionando ao currentYear');
              currentYearDebits += value;
            } else if (year === previousYear) {
              console.log('Adicionando ao previousYear');
              previousYearDebits += value;
            }
          } else {
            console.log('Item não é débito - ignorando',item.operator );
          }
        });

        const result = {
          total: Array.from(totalDebits.values()).reduce((sum, val) => sum + val, 0),
          currentYear: currentYearDebits,
          previousYear: previousYearDebits
        };

        console.log(`Resultado para ${type}:`, result);
        return result;
      };

      // Processar os dados
      const receiveData = processItems(receiveItems, 'receber');
      const payData = processItems(payItems, 'pagar');

      // Resultado final
      const result = {
        accountsToReceive: {
          total: receiveData.total,
          currentYear: receiveData.currentYear,
          previousYear: receiveData.previousYear
        },
        accountsToPay: {
          total: payData.total,
          currentYear: payData.currentYear,
          previousYear: payData.previousYear
        }
      };

      console.log('\nResultado final:', JSON.stringify(result, null, 2));
      return result;

    } catch (error: any) {
      console.error('Erro em dashboardAccountToPayAndReceive:', error);
      throw new Error(`Error fetching accounts to pay/receive data: ${error.message}`);
    }
  }
}
