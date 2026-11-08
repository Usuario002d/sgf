import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accounting_documents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('document_number').notNullable()
      table.string('description').notNullable()
      table.integer('accounting_journal_id').notNullable().unsigned()
        .references('accounting_journals.id')

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