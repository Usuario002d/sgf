import { BaseSchema } from '@adonisjs/lucid/schema'
import { LifeclicleState, MenuType } from '../../../app/models/utility/Enums.js'

export default class extends BaseSchema {
  protected tableName = 'menus'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('code', 4).notNullable().unique()
      table.string('description', 64).notNullable()
      table.string('type', 4).notNullable().checkIn([MenuType.ROOT, MenuType.SUBMENU, MenuType.ITEM])

      table.integer('application_id').notNullable().unsigned().references('applications.id')
      table.integer('parent_id').unsigned().references('menus.id')

      table.integer('state').notNullable().defaultTo(LifeclicleState.ACTIVE)
      table.timestamp('created_by')
      table.timestamp('created_at')
      table.timestamp('updated_by')
      table.timestamp('updated_at')
    })
  }

  async down() {
    const exists = await this.schema.hasTable(this.tableName)
    if (exists) {
      this.schema.dropTable(this.tableName)
    }  }
}