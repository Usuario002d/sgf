import {column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import CodedAbstractModel from '../utility/CodedAbstractModel.js'
import Menu from './menu.js'

/*
* Model que representa uma 'Transação'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class Transaction extends CodedAbstractModel {

  @column()
  declare menuItemId: number | null

  @hasOne(() => Menu, {
    foreignKey: 'menuItemId',
  })
  declare menuItem: HasOne<typeof Menu>
}