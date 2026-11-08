import { column,hasMany, belongsTo } from '@adonisjs/lucid/orm'
import LifecycleAbstractModel from '../utility/LifeclycleAbstractModel.js'
import Diaries from '#models/daily/diaries'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'

/*
* Model que representa um diário
* Cipriano P. Sagene (ciprianosa@gmail.com)
*/
export default class Documents extends LifecycleAbstractModel {

  @column()
  declare number: string

  @column()
  declare description: string

  @column()
  declare diary_id: number
  
  @belongsTo(() => Diaries)
  declare diary: BelongsTo<typeof Diaries>
}