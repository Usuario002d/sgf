import {column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import CreatableAbstractModel from './CreatableAbstractModel.js'

/*
* Model abstracto que com atributos 'code e description'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class MutableAbstractModel extends CreatableAbstractModel {

  @column()
  declare updatedBy: Number

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}