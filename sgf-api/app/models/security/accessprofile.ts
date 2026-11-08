import { manyToMany } from '@adonisjs/lucid/orm'
import Transaction from './transaction.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import CodedAbstractModel from '../utility/CodedAbstractModel.js'

/*
* Model que representa um 'Perfil de utilizador'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class AccessProfile extends CodedAbstractModel {

  /** tabela associativa do perfil e transacao (access_profile_transactionsccccc) */
  @manyToMany(() => Transaction, {
    pivotTable: 'access_profile_transactions',
    localKey: 'id',
    pivotForeignKey: 'access_profile_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'transaction_id',
    pivotTimestamps: true
  })
  declare transactions: ManyToMany<typeof Transaction>
}