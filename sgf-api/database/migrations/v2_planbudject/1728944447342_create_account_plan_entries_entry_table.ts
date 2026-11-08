import { BaseSchema } from '@adonisjs/lucid/schema'
import { EntryEntryType, LifeclicleState, OperatorType } from '../../../app/models/utility/Enums.js'

export default class extends BaseSchema {
  protected tableName = 'account_plan_entries_entry'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.enum('type', Object.values(EntryEntryType))
        .notNullable()
        .checkIn([EntryEntryType.INITIAL,
        EntryEntryType.INITIAL_ALLOCATION,
        EntryEntryType.REINFORCEMENT,
        EntryEntryType.ANNULMENT,
        EntryEntryType.REDISTRIBUITION_REINFORCEMENT,
        EntryEntryType.REDISTRIBUITION_ANNULMENT,

        EntryEntryType.ENTRY_OPENING,
        EntryEntryType.ENTRY_BANK_IN,
        EntryEntryType.ENTRY_BANK_OUT,
        EntryEntryType.ENTRY_BILLS_TO_PAY,
        EntryEntryType.ENTRY_BILLS_TO_RECEIVER,
        EntryEntryType.ENTRY_REGULARIZATION,
        ])

      table.enum('operator', Object.values(OperatorType))
        .notNullable()
        .checkIn([OperatorType.DEBIT, OperatorType.CREDTI])
      table.double('allocation').notNullable()
      table.double('last_final_allocation').notNullable()
      table.integer('posting_month').notNullable()
      table.timestamp('posting_date').notNullable()
      table.timestamp('operation_date').notNullable()
      table.integer('entry_id').notNullable().unsigned()
        .references('account_plan_entries.id')
        .withKeyName('fk_entry_id')
      table.integer('target_entrie_entry_id').unsigned()
        .references('account_plan_entries_entry.id')
        .withKeyName('fk_target_entrie_entry_id')
      table.integer('account_plan_year_id').notNullable().unsigned()
        .references('account_plan_years.id')
        .withKeyName('fk_account_plan_year_id')

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