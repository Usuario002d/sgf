import { BaseSchema } from '@adonisjs/lucid/schema'
import { QuantificationType } from '../../../app/models/utility/Enums.js'

export default class extends BaseSchema {
  protected tableName = 'internal_request_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.enum('quantification', Object.values(QuantificationType))
        .notNullable()
        .checkIn([QuantificationType.L, QuantificationType.KG, QuantificationType.BOX])
      table.integer('quantity').notNullable()
      table.string('description').notNullable()
      table.timestamp('operation_date').notNullable()
      table.integer('unit_price').notNullable()
      table.integer('internal_request_id').notNullable().unsigned()
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