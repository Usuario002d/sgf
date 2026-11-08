import { DateTime } from 'luxon'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import CreatableAbstractModel from '../utility/CreatableAbstractModel.js'
import InternalRequest from './internal_request.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AccountPlan from '#models/planbudject/account_plan'

export default class InternalRequestItem extends CreatableAbstractModel {
  @column()
  declare quantification: string // Tipo de quantificação

  @column()
  declare quantity: number

  @column()
  declare description: string

  @column.date({
    serialize: (value) => value?.toFormat('dd-MM-yyyy'), // Formato personalizado
  })
  declare operationDate: DateTime

  @column()
  declare unitPrice: number

  @column({ columnName: 'internal_request_id' })
  declare internalRequestId: number

  @column({ columnName: 'total_amount' })
  declare totalAmount: number

  @column({ columnName: 'saldoExistente' })
  declare saldoExistente: number

  @column({ columnName: 'saldoInicial' })
  declare saldoInicial: number

  @belongsTo(() => InternalRequest)
  declare internalRequest: BelongsTo<typeof InternalRequest>

  @column({ columnName: 'account_plan_budject_id' })
  declare accountPlanBudjectId: number | null; // Permitir valores nulos se necessário

  @belongsTo(() => AccountPlan, {
    foreignKey: 'accountPlanBudjectId', // O atributo que armazena a chave estrangeira
  })
  declare accountPlanBudject: BelongsTo<typeof AccountPlan>;

  @column({ columnName: 'beneficiary_id' })
  declare beneficiaryNameId: number

  @belongsTo(() => AccountPlan, {
    foreignKey: 'beneficiaryNameId', // Chave estrangeira no modelo atual
    localKey: 'id',                 // Chave primária no modelo relacionado
  })
  declare beneficiaryName: BelongsTo<typeof AccountPlan>

  @column({ columnName: 'account_plan_financial_association_id' })
  declare accountPlanFinancialAssociationId: number;

  @belongsTo(() => AccountPlan, { foreignKey: 'accountPlanFinancialAssociationId' })
  declare accountPlanFinancialAssociation: BelongsTo<typeof AccountPlan>;

}
