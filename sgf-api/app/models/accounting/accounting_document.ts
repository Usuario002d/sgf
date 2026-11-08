import { belongsTo, column } from '@adonisjs/lucid/orm'
import CreatableAbstractModel from '../utility/CreatableAbstractModel.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AccountingJournal from './accounting_journal.js'


/*
* Model que representa um documento contabilistico
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccountingDocument extends CreatableAbstractModel {

  @column()
  declare documentNumber: string

  @column()
  declare description: string

  @column()
  declare accountingJournalId: number

  @belongsTo(() => AccountingJournal)
  declare accountingJournal: BelongsTo<typeof AccountingJournal>
}