import { BaseSchema } from '@adonisjs/lucid/schema'
import { LifeclicleState } from '../../../app/models/utility/Enums.js'

export default class extends BaseSchema {
  protected tableName = 'internal_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('sequence').notNullable()
      table.string('request_number').notNullable()
      table.string('requestor_name').notNullable()
      table.string('requestor_department').notNullable()
      table.timestamp('operation_date').notNullable()

      table.integer('initial_availability_account_buject').notNullable()
      table.integer('current_account_budject_balance').notNullable()
      table.integer('final_account_buject_balance').notNullable()
      table.integer('total_requested_value').notNullable()

      table.string('justification').notNullable()
      table.string('sector_budject').notNullable()
      table.string('chapter_budject').notNullable()
      table.string('clause_budject').notNullable()
      table.string('clause_number_budject').notNullable()

      table.integer('account_plan_year_id').notNullable().unsigned()
        .references('account_plan_years.id')
        .withKeyName('fk1_account_plan_year_id')

      table.integer('provider_id').notNullable().unsigned()
        .references('providers.id')
        .withKeyName('fk2_provider_id')

      table.integer('account_plan_budject_id').notNullable().unsigned()
        .references('account_plans.id')
        .withKeyName('fk3_account_plan_budject_id')

      table.integer('account_plan_financial_id').notNullable().unsigned()
        .references('account_plans.id')
        .withKeyName('fk4_account_plan_financial_id')

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
    }
  }
}