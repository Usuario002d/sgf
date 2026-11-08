import { column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AccountPlanYear from '../planbudject/account_plan_year.js'
import AccountPlan from '../planbudject/account_plan.js'
import InternalRequestItem from './internal_request_item.js'
import Provider from '../person/provider.js'
import LifecycleAbstractModel from '../utility/LifeclycleAbstractModel.js'
import InternalRequest from './internal_request.js'

export default class VoidedRequest extends LifecycleAbstractModel {
  @column()
  declare requestNumber: string

  @column()
  declare originalStatus: string

  @column()
  declare newStatus: string

  @column()
  declare justification: string | null

  @column()
  declare totalAmountReturned: number

  @column()
  declare internalRequestId: number

  @column()
  declare internalRequestItemId: number;

  @belongsTo(() => InternalRequest)
  declare internalRequest: BelongsTo<typeof InternalRequest>

  @column.dateTime({ autoCreate: true })
  declare voidedAt: DateTime
}