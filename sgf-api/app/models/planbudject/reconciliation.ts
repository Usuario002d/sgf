// app/models/reconciliation.ts

import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from "#models/security/user";

export default class Reconciliation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Campos de payment (agora como colunas separadas)
  @column({ columnName: 'payment_id' })
  declare paymentId: number

  @column({ columnName: 'payment_request_number' })
  declare paymentRequestNumber: string

  @column({ columnName: 'payment_date' })
  declare paymentDate: string

  @column({ columnName: 'payment_amount' })
  declare paymentAmount: number

  @column({ columnName: 'payment_document' })
  declare paymentDocument: string

  @column({ columnName: 'payment_description' })
  declare paymentDescription?: string

  @column({ columnName: 'payment_referencia' })
  declare paymentReferencia: string

  // Campos de transaction
  @column({ columnName: 'transaction_date' })
  declare transactionDate: string

  @column({ columnName: 'transaction_description' })
  declare transactionDescription: string

  @column({ columnName: 'transaction_amount' })
  declare transactionAmount: number

  @column({ columnName: 'transaction_document' })
  declare transactionDocument: string

  @column({ columnName: 'transaction_id' })
  declare transactionId: string

  // Restante do modelo permanece igual
  @column()
  declare status: 'matched' | 'unmatched' | 'pending' | 'disputed'

  @column()
  declare reconciled: boolean

  @column.dateTime()
  declare reconciledAt: DateTime

  @column()
  declare reconciledById: number

  @belongsTo(() => User, { foreignKey: 'reconciledById' })
  declare reconciledBy: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}