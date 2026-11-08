import { BaseSchema } from '@adonisjs/lucid/schema'
import { OperatorType } from '../../../app/models/utility/Enums.js'

export default class extends BaseSchema {
  protected tableName = 'accounting_journal_entry_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.timestamp('operation_date').notNullable()
      table.enum('operator', Object.values(OperatorType))
        .notNullable()
        .checkIn([OperatorType.DEBIT, OperatorType.CREDTI])
      table.double('value').notNullable()
      table.string('description').notNullable()
      table.string('accountPlanNumber').notNullable()

      table.integer('account_plan_year_id').notNullable().unsigned().references('account_plan_years.id')
      table.integer('account_plan_id').notNullable().unsigned().references('account_plans.id')

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