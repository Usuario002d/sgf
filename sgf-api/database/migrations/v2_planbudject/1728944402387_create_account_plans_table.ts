import { BaseSchema } from '@adonisjs/lucid/schema'
import { AccoutPlanClassType, AccoutPlanType, LifeclicleState, AccountPlanTypeWritableType as AccountPlanWritableType } from '../../../app/models/utility/Enums.js'

export default class extends BaseSchema {
  protected tableName = 'account_plans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('number').notNullable().unique()
      table.string('description').notNullable()
      table.enum('writable', Object.values(AccountPlanWritableType))
        .notNullable().checkIn([AccountPlanWritableType.MOVIMENT, AccountPlanWritableType.CONTROLL])
      table.enum('type', Object.values(AccoutPlanType))
        .notNullable().checkIn([AccoutPlanType.BUDJECT, AccoutPlanType.FINANCIAL])
      table.enum('class', Object.values(AccoutPlanClassType))
        .notNullable().checkIn(Object.keys(AccoutPlanClassType))

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