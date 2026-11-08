import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accounting_journal_entries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamp('operation_date').notNullable()

      table.integer('account_plan_year_id').notNullable().unsigned()
        .references('account_plan_years.id')

      table.integer('accounting_journal_id').notNullable().unsigned()
        .references('accounting_journals.id')

      table.integer('accounting_document_id').notNullable().unsigned()
        .references('accounting_documents.id')

      table.integer('internal_request_id').nullable().unsigned()
        .references('internal_requests.id')

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