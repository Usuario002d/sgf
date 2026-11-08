import { column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import LifecycleAbstractModel from '../utility/LifeclycleAbstractModel.js'
import { DateTime } from 'luxon'
import AccountingJournalEntry from './accounting_journal_entry.js'
import AccountPlanYear from '../planbudject/account_plan_year.js'
import AccountPlan from '../planbudject/account_plan.js'
import { OperatorType } from '../utility/Enums.js'
import AccountingDocument from './accounting_document.js'

export default class AccountingJournalEntryItems extends LifecycleAbstractModel {
  @column.date({
    serialize: (value) => value?.toFormat('dd-MM-yyyy'),
  })
  declare operationDate: DateTime

  @column()
  declare operator: OperatorType

  @column()
  declare value: number

  @column()
  declare description: string

  @column({ columnName: 'documentDescription' })
  declare documentDescription: string

  @column({ columnName: 'operation_balance' })
  declare operation_balance: number

  @column()
  declare accountPlanNumber: string

  @column()
  declare accountPlanId: number

  @belongsTo(() => AccountPlan)
  declare accountPlan: BelongsTo<typeof AccountPlan>

  @column()
  declare accountPlanYearId: number

  @belongsTo(() => AccountPlanYear)
  declare accountPlanYear: BelongsTo<typeof AccountPlanYear>

  @column()
  declare entryId: number

  @column()
  declare balance: number

  
  @belongsTo(() => AccountingDocument, {
    foreignKey: 'accountingDocumentId',
  })
  declare accountingDocument: BelongsTo<typeof AccountingDocument>


  @belongsTo(() => AccountingJournalEntry, {
    foreignKey: 'entryId',
  })
  declare entry: BelongsTo<typeof AccountingJournalEntry>
}
