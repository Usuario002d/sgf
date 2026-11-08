import { belongsTo, column } from '@adonisjs/lucid/orm'
import AccountPlan from './account_plan.js'
import MutableAbstractModel from '../utility/MutableAbstractModel.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

/*
* Model que representa as associações entre contas financeiras e orçamentárias
* Cipriano P. Sagene (ciprianosagene@gmail.com)
*/
export default class FinancialBudgetAssociations extends MutableAbstractModel {
  // Definindo a chave primária para a tabela
  @column({ isPrimary: true })
  declare id: number

  // Relação com a conta financeira
  @column()
  declare financial_account_id: number

  @belongsTo(() => AccountPlan, {
    foreignKey: 'financial_account_id', // Chave estrangeira para AccountPlan
  })
  declare financialAccount: BelongsTo<typeof AccountPlan>

  // Relação com a conta orçamentária
  @column()
  declare budget_account_id: number

  @belongsTo(() => AccountPlan, {
    foreignKey: 'budget_account_id', // Chave estrangeira para AccountPlan
  })
  declare budgetAccount: BelongsTo<typeof AccountPlan>
}
