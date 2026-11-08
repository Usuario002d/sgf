import { column, hasMany } from '@adonisjs/lucid/orm'
import LifecycleAbstractModel from '../utility/LifeclycleAbstractModel.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Documents from '#models/documents/documents'

/*
* Model que representa um diário
* Cipriano P. Sagene (ciprianosa@gmail.com)
*/
export default class Diaries extends LifecycleAbstractModel {

  @column()
  declare number: string

  @column()
  declare description: string

  @hasMany(() => Documents)
  declare documents: HasMany<typeof Documents>
}

