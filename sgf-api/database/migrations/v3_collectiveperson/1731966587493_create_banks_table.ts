import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'banks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('account_plan_financial_number').notNullable()
      table.string('name').notNullable()
      table.string('description').notNullable()
      table.string('nuit').notNullable()
      table.string('nib').notNullable()
      table.string('email').nullable()
      table.string('contact1').nullable()
      table.string('contact2').nullable()

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
    }
  }
}