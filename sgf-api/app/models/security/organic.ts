import { column } from '@adonisjs/lucid/orm'
import CodedAbstractModel from '../utility/CodedAbstractModel.js'

/*
* Model que representa um 'Organico'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class Organic extends CodedAbstractModel {
    @column()
    declare name: string 
}