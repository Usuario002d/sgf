import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'access_profile_transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('access_profile_id').notNullable().unsigned().references('access_profiles.id')
      table.integer('transaction_id').notNullable().unsigned().references('transactions.id')
      table.unique(['access_profile_id', 'transaction_id'],'profile_transaction')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
  const exists = await this.schema.hasTable(this.tableName)
    if (exists) {
      this.schema.dropTable(this.tableName)
    }
  }
}