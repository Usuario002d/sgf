import { column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import LifecycleAbstractModel from '../utility/LifeclycleAbstractModel.js'
import AccountingDocument from './accounting_document.js'

/*
* Model que representa um diario contabilistico
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccountingJournal extends LifecycleAbstractModel {

  public static OPENING = '00';
  public static BILLS_TO_PAY = '10';
  public static BILLS_TO_RECEIVE = '20';
  public static BANK_IN = '30';
  public static BANK_OUT = '40';
  public static REGULARIZATION = '50';

  @column()
  declare journalNumber: string

  @column()
  declare description: string

  @hasMany(() => AccountingDocument, {
    foreignKey: 'accountingJournalId'
  })
  declare documents: HasMany<typeof AccountingDocument>
}