import {column } from '@adonisjs/lucid/orm'
import LifecycleAbstractModel from './LifeclycleAbstractModel.js'

/*
* Model abstracto que com atributos 'code e description'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class CodedAbstractModel extends LifecycleAbstractModel {

  @column()
  declare code: string 

  @column()
  declare description: string
}