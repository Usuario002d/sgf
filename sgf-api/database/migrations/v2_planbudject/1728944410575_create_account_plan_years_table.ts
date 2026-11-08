import { BaseSchema } from '@adonisjs/lucid/schema'
import { LifeclicleState } from '../../../app/models/utility/Enums.js'

export default class extends BaseSchema {
  protected tableName = 'account_plan_years'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('year').notNullable().unique()
      table.string('description').notNullable()

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