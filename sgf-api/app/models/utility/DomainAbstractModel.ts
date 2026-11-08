import { BaseModel, column } from '@adonisjs/lucid/orm'

/*
* Model abstracto que que representa um objecto com ID, chave primaria
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class DomainAbstractModel extends BaseModel {

  @column({ isPrimary: true })
  declare id: number
}