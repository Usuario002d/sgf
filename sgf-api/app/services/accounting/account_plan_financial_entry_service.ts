import AccountPlanYear from "../../models/planbudject/account_plan_year.js";
import AccountPlanEntryEntry from "../../models/planbudject/account_plan_entry_entry.js";
import { inject } from "@adonisjs/core";
import { TransactionClientContract } from "@adonisjs/lucid/types/database";
import { DateTime } from "luxon";
import { EntryEntryType, OperatorType } from "../../models/utility/Enums.js";
import AccountPlanEntryService from "../planbudject/account_plan_entry_service.js";
import AccountPlanEntry from "../../models/planbudject/account_plan_entry.js";

/*
* Serviços para o plano de contas financeiro
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
@inject()
export default class AccountPlanFinancialEntryService {

  constructor(
    private accountPlanEntryService: AccountPlanEntryService
  ) { }

  public async entryCrediteOrDebit(
    data: {
      accountPlanNumber: string, value: number, entryEntryType: EntryEntryType, operator: OperatorType, operationDate: Date
    }, trx: TransactionClientContract) {

    const currentDate = new Date();
    const operationDate = DateTime.local(data.operationDate.getFullYear(), data.operationDate.getMonth() + 1, data.operationDate.getDate())
    const currentPlanYear = (await AccountPlanYear.findBy('year', currentDate.getFullYear()))
      || (await AccountPlanYear.query().orderBy('year', 'desc').firstOrFail());

    // Encontrar a conta pela numeração
    let entry = await this.accountPlanEntryService.
      findAccountPlanEntriesByYearAndNumber(currentPlanYear.year, data.accountPlanNumber);
      console.log("Entry encontrada: ", entry);

      
    if (!entry) {
      throw Error("Entrada do plano de conta não encontrado no sistema com a conta " + data.accountPlanNumber);
    }

    // Verificar se a conta é do tipo 'financial' para passar por todo o processo sem validações
    if (entry.accountPlan?.type === 'financial') {
      // Para contas financeiras, executa a operação sem qualquer validação
      await new AccountPlanEntryEntry()
        .fill(
          {
            type: data.entryEntryType,
            operator: data.operator,
            postingMonth: currentDate.getMonth(),
            operationDate: operationDate,
            allocation: data.value,
            lastFinalAllocation: entry.finalAllocation,
            entryId: entry.id,
            accountPlanYearId: currentPlanYear.id,
          }).useTransaction(trx).save();

      // Atualiza o saldo da conta, independentemente de validações
      entry.finalAllocation = entry.finalAllocation + (data.operator === OperatorType.CREDTI ? data.value : -data.value);
      const updatedEntry = await entry.useTransaction(trx).save();

      // Atualiza as entradas pai, se necessário
      await this.accountPlanEntryService
        .updateParentsAccountPlanEntriesByChild(updatedEntry, data.value, data.operator === OperatorType.CREDTI, trx);

      return updatedEntry;
    }

    // Para contas não-financeiras, realiza as validações normais
    const isCredit = (data.operator === OperatorType.CREDTI);
    const entryfinalAllocation = isCredit ?
      entry.finalAllocation + data.value :
      entry.finalAllocation - data.value;

    if (entryfinalAllocation < 0) {
      throw Error(" Não pode efectuar a anulação, o valor da conta "
        + data.accountPlanNumber + " é insuficiente para anular " + data.value
        + ". O valor actual é " + entry.finalAllocation);
    }

    // Cria a entrada do plano de contas normalmente
    await new AccountPlanEntryEntry()
      .fill(
        {
          type: data.entryEntryType,
          operator: data.operator,
          postingMonth: currentDate.getMonth(),
          operationDate: operationDate,
          allocation: data.value,
          lastFinalAllocation: entry.finalAllocation,
          entryId: entry.id,
          accountPlanYearId: currentPlanYear.id,
        }).useTransaction(trx).save();

    // Atualiza o saldo da conta
    entry.finalAllocation = entryfinalAllocation;
    const updatedEntry = await entry.useTransaction(trx).save();

    // Atualiza as entradas pai
    await this.accountPlanEntryService
      .updateParentsAccountPlanEntriesByChild(updatedEntry, data.value, isCredit, trx);

    return updatedEntry;
  }
}
