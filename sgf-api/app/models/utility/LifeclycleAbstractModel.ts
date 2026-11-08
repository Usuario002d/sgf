import { column, scope } from '@adonisjs/lucid/orm'
import { LifeclicleState as LifeclycleState } from './Enums.js'
import MutableAbstractModel from './MutableAbstractModel.js'

/*
* Model abstracto que com atributos 'code e description'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class LifecycleAbstractModel extends MutableAbstractModel {

  @column()
  declare state: LifeclycleState.ACTIVE

  static active = scope((query) => {
    query.where('state', '=', LifeclycleState.ACTIVE)
  })

  static inactiveActive = scope((query) => {
    query.where('state', '=', LifeclycleState.INACTIVE)
  })

}