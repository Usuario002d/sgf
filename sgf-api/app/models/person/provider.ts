import { column } from '@adonisjs/lucid/orm'
import CreatableAbstractModel from '../utility/CreatableAbstractModel.js'



/*
* Model que representa um provedor 
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class Provider extends CreatableAbstractModel {

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

  @column()
  declare email: string

  @column()
  declare contact1: string

  @column()
  declare contact2: string


}