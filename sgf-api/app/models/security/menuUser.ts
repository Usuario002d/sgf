import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class MenuUser extends BaseSchema {
  protected tableName = 'menu_user'

  public async up() {
    this.createTable(this.tableName, (table) => {
      table.increments('id') // A chave primária da tabela pivot
      table.integer('menu_id').unsigned().references('menus.id').onDelete('CASCADE') // Chave estrangeira para o Menu
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE') // Chave estrangeira para o User
      table.timestamps(true) // Criação e atualização de registros
    })
  }

  public async down() {
    this.dropTable(this.tableName)
  }
}
