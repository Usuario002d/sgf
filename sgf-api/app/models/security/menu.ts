import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm';
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations';
import Applications from './application.js';
import CodedAbstractModel from '../utility/CodedAbstractModel.js';
import User from './user.js';

/*
* Model que representa um 'Menu'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export default class Menu extends CodedAbstractModel {

  @column()
  declare type: string;

  @column()
  declare applicationId: number;

  @belongsTo(() => Applications)
  declare application: BelongsTo<typeof Applications>;

  @column()
  declare parentId: number | null;

  @belongsTo(() => Menu, {
    foreignKey: 'parentId',
  })
  declare parent: BelongsTo<typeof Menu>;

  @column()
  declare name: string;

  @column()
  declare path: string | null;

  @column()
  declare icon: string | null;

  @column()
  declare component: string | null;

  @column()
  declare layout: string | null;

  @column()
  declare visibility: boolean;

  @hasMany(() => Menu, {
    foreignKey: 'parentId',
  })
  declare children: HasMany<typeof Menu>;  // Aqui está o relacionamento de filhos corretamente

  @manyToMany(() => User, {
    pivotTable: 'menu_user', // nome da tabela pivot
  })
  declare users: ManyToMany<typeof User>;
}
