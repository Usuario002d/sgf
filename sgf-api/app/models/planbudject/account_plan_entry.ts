import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import AccountPlanYear from './account_plan_year.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import AccountPlan from './account_plan.js'
import AccountPlanEntryEntry from './account_plan_entry_entry.js'
import MutableAbstractModel from '../utility/MutableAbstractModel.js'


/*
* Model que representa  saldos de planos de conta para um ano especifico
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccountPlanEntry extends MutableAbstractModel {

  @column()
  declare startPostingMonth: number

  @column()
  declare endPostingMonth: number

  @column()
  declare reservePercent: number

  @column()
  declare initialAllocation: number

  @column()
  declare finalAllocation: number

  @column()
  declare availableAllocation: number

  @column()
  declare accountPlanYearId: number

  @belongsTo(() => AccountPlanYear)
  declare accountPlanYear: BelongsTo<typeof AccountPlanYear>

  @column()
  declare accountPlanNumber: string

  @column({ columnName: 'account_plan_id' }) // <- aqui o nome certo da coluna no banco
  declare accountPlanId: number

  @belongsTo(() => AccountPlan)
  declare accountPlan: BelongsTo<typeof AccountPlan>

  @column()
  declare parentId: number

  @belongsTo(() => AccountPlanEntry)
  declare parent: BelongsTo<typeof AccountPlanEntry>

  @column()
  declare accountPlanfinancialId: number

  @belongsTo(() => AccountPlan)
  declare accountPlanfinancial: BelongsTo<typeof AccountPlan>

  @hasMany(() => AccountPlanEntryEntry, {
    foreignKey: 'entryId',
  })
  declare entriesEntry: HasMany<typeof AccountPlanEntryEntry>
}