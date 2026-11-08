import { column } from '@adonisjs/lucid/orm'
import CreatableAbstractModel from '../utility/CreatableAbstractModel.js'



/*
* Model que representa um banco 
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class Bank extends CreatableAbstractModel {

  @column()
  declare accountPlanFinancialNumber: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare nuit: string

  @column()
  declare nib: string

}