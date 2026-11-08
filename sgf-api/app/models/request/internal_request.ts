import { column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AccountPlanYear from '../planbudject/account_plan_year.js'
import AccountPlan from '../planbudject/account_plan.js'
import InternalRequestItem from './internal_request_item.js'
import Provider from '../person/provider.js'
import LifecycleAbstractModel from '../utility/LifeclycleAbstractModel.js'


/*
* Model que representa uma requisicao interna
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class InternalRequest extends LifecycleAbstractModel {
  
  @column()
  declare id: number;

  @column()
  declare sequence: number;

  @column()
  declare requestNumber: string;

  @column()
  declare requestorName: string;

  @column()
  declare requestorDepartment: string;

  @column.date({
    serialize: (value) => value?.toFormat('dd-MM-yyyy'), // Formato personalizado
  })
  declare operationDate: DateTime;

  @column({ columnName: 'initial_availability_account_buject' })
  declare initialAvailabilityAccountBuject: number;

  @column({ columnName: 'current_account_budject_balance' })
  declare currentAccountBudjectBalance: number;

  @column({ columnName: 'final_account_buject_balance' })
  declare finalAccountBujectBalance: number;

  @column({ columnName: 'total_requested_value' })
  declare totalRequestedValue: number;

  @column()
  declare justification: string;

  @column({ columnName: 'sector_budject' })
  declare sectorBudject: string;

  @column({ columnName: 'chapter_budject' })
  declare chapterBudject: string;

  @column({ columnName: 'clause_budject' })
  declare clauseBudject: string;

  @column({ columnName: 'clause_number_budject' })
  declare clauseNumberBudject: string;

  @column({ columnName: 'account_plan_year_id' })
  declare accountPlanYearId: number;

  @belongsTo(() => AccountPlanYear)
  declare accountPlanYear: BelongsTo<typeof AccountPlanYear>;

  @column({ columnName: 'provider_id' })
  declare providerId: number;

  @belongsTo(() => Provider)
  declare provider: BelongsTo<typeof Provider>;

  @column({ columnName: 'bank_Value' }) // Correspondendo exatamente ao banco
  declare bankValue: string;

  @column({ columnName: 'account_plan_budject_id' })
  declare accountPlanBudjectId: number;

  @belongsTo(() => AccountPlan, { foreignKey: 'accountPlanBudjectId' })
  declare accountPlanBudject: BelongsTo<typeof AccountPlan>;

  @column({ columnName: 'account_plan_financial_id' })
  declare accountPlanFinancialId: number;

  @column({ columnName: 'document' })
  declare document: string;

  @column({ columnName: 'documentNumber' })
  declare documentNumber: string;

  @column({ columnName: 'transaction_type' })
  declare transactionType: string;

  @column({ columnName: 'is_receivable' })
  declare isReceivable: boolean;

  @belongsTo(() => AccountPlan, { foreignKey: 'accountPlanFinancialId' })
  declare accountPlanFinancial: BelongsTo<typeof AccountPlan>;

  @column({ columnName: 'is_parcial' })
  declare isParcial: boolean;

  @column({ columnName: 'account_plan_financial_association_id' })
  declare accountPlanFinancialAssociationId: number;

  @belongsTo(() => AccountPlan, { foreignKey: 'accountPlanFinancialAssociationId' })
  declare accountPlanFinancialAssociation: BelongsTo<typeof AccountPlan>;

  @hasMany(() => InternalRequestItem, { foreignKey: 'internalRequestId' })
  declare items: HasMany<typeof InternalRequestItem>;

  // New fields
  @column({ columnName: 'paidReq' })
  declare paidReq: boolean

  @column({ columnName: 'paid_status' })
  declare paidStatus: 'PENDENTE' | 'PAGO' | 'NAO_PAGO'

  @column()
  declare conformance: 'PENDING_CONFORMANCE' | 'WITHOUT_CONFORMANCE' | 'CONFORMED'

  @column({ columnName: 'payment_type' })
  declare paymentType: 'PARTIAL' | 'UNIQUE' | null;

  @column({ columnName: 'remaining_balance' })
  declare remainingBalance: number;

  @column({ columnName: 'isAnnulled' })
  declare isAnnulled: boolean;

  // Campos de reconciliação adicionados
  @column({ columnName: 'is_reconciled' })
  declare isReconciled: boolean;

  @column.date({
    serialize: (value) => value?.toFormat('dd-MM-yyyy HH:mm:ss'),
    columnName: 'reconciliation_date'
  })
  declare reconciliationDate: DateTime | null;
}