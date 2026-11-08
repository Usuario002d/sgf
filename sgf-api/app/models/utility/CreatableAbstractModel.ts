import {column } from '@adonisjs/lucid/orm'
import DomainAbstractModel from './DomainAbstractModel.js'
import { DateTime } from 'luxon'

/*
* Model abstracto que representa uma entidade criavel
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class CreatableAbstractModel extends DomainAbstractModel {

  @column()
  declare createdBy: Number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

}