import { column } from "@adonisjs/lucid/orm";
import CodedAbstractModel from "../utility/CodedAbstractModel.js";


/*
* Model que representa uma 'Aplicacao/sistema ou modulo'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class Applications extends CodedAbstractModel {

  /*
  * Define o tipo (SYSTEM ou MODULE)
  */
  @column()
  declare type: string 

}