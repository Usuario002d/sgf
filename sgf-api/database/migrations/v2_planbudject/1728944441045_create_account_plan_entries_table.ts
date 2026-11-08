import { BaseSchema } from '@adonisjs/lucid/schema'
import { LifeclicleState } from '../../../app/models/utility/Enums.js'

export default class extends BaseSchema {
  protected tableName = 'account_plan_entries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('account_plan_number').notNullable()
      table.integer('start_posting_month').notNullable()
      table.integer('end_posting_month').notNullable()

      table.integer('reserve_percent').notNullable().defaultTo(0)
      table.double('initial_allocation').notNullable()
      table.double
      ('final_allocation').notNullable()
     table.double('available_allocation').notNullable()

      table.integer('account_plan_year_id').notNullable().unsigned().references('account_plan_years.id')
      table.integer('account_plan_id').notNullable().unsigned().references('account_plans.id')
      table.integer('parent_id').unsigned().references('account_plan_entries.id')

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