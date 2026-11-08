import db from "@adonisjs/lucid/services/db";
import { inject } from "@adonisjs/core";
import { BankDTO, ProviderDTO } from "./utils/dtos.js";
import Provider from "../../models/person/provider.js";
import Bank from "../../models/person/bank.js";

/*
* Servicos para Pessoas colectiva: Provedor, Bancos, Caixa e clientes
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
@inject()
export default class CollectivePersonService {

  public async createProvider(data: ProviderDTO) {

    const trx = await db.transaction()  // Start transaction
    try {
      const createdProvider = await new Provider().fill({
        accountPlanFinancialNumber: data.accountPlanFinancialNumber,
        name: data.name,
        description: data.description,
        nuit: data.nuit,
        nib: data.nib,
      }).useTransaction(trx).save();
      await trx.commit();
      return createdProvider;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  public async createBank(data: BankDTO) {

    const trx = await db.transaction()  // Start transaction
    try {
      const createdProvider = await new Bank().fill(
        {
          accountPlanFinancialNumber: data.accountPlanFinancialNumber,
          name: data.name,
          description: data.description,
          nuit: data.nuit,
          nib: data.nib,
        }

      ).useTransaction(trx).save();
      await trx.commit();
      return createdProvider;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  public async findAllProviders() {
    return (await Provider.all())
  }

  public async findById(id: number) {
    return await Provider.findOrFail(id);
  }

  public async findProviderByAccountFinancialNumber(accountPlanFinancialNumber: string) {
    return await Provider.query().where("accountPlanFinancialNumber", accountPlanFinancialNumber).firstOrFail();
  }

  public async findAllBanks() {
    return (await Bank.all())
  }

  public async findBankById(id: number) {
    return await Bank.findOrFail(id);
  }

  public async findBankByAccountFinancialNumber(accountPlanFinancialNumber: string) {
    return await Bank.query().where("accountPlanFinancialNumber", accountPlanFinancialNumber).firstOrFail();
  }
}