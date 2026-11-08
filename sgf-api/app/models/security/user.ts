import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { column, beforeSave, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import AccessProfile from './accessprofile.js'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Organic from './organic.js'
import LifecycleAbstractModel from '../utility/LifeclycleAbstractModel.js'
import Menu from './menu.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

/*
* Model que representa um 'Utilizador'
*/
export default class user extends compose(LifecycleAbstractModel, AuthFinder) {

  currentAccessToken?: AccessToken;

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare organicId: number

  @belongsTo(() => Organic)
  declare organic: BelongsTo<typeof Organic>

  @column({ columnName: 'isActive' })
  declare isActive: boolean

  @column({ columnName: 'isTech' })
  declare isTech: boolean

  @column({ columnName: 'isAdmin' })
  declare isAdmin: boolean

  @column({ columnName: 'isSuperAdmin' })
  declare isSuperAdmin: boolean

  @column({ columnName: 'permissions' })
  declare permissions: any | null

  @column()
  declare accessProfileId: number

  @belongsTo(() => AccessProfile)
  declare accessProfile: BelongsTo<typeof AccessProfile>

  @beforeSave()
  static async hashPassword(user: user) {
    if (user.$dirty.password) {
      // Se necessário, descomente a linha abaixo para realizar a criptografia da senha
      // user.password = await hash.make(user.password)
    }
  }

  static accessTokens = DbAccessTokensProvider.forModel(user)

  // Relacionamento many-to-many com Menu
  @manyToMany(() => Menu, {
    pivotTable: 'menu_user', // nome da tabela pivot
  })
  declare menus: ManyToMany<typeof Menu>
}
