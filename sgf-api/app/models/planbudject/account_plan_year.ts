import { column } from '@adonisjs/lucid/orm'
import CreatableAbstractModel from '../utility/CreatableAbstractModel.js'



/*
* Model que representa um ano contabilistico dos planos de contas
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccountPlanYear extends CreatableAbstractModel {

  @column()
  declare year: number

  @column()
  declare description: string

  @column()
  declare state: number

}