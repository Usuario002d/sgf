import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'


/*
* Model que representa uma pessoa 
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class Person extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}