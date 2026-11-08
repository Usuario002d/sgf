// app/validators/reconciliation_validator.ts

import Reconciliation from '#models/planbudject/reconciliation'
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export default class ReconciliationValidator {
  // Schema para validação individual
  private static singleItemSchema = vine.object({
    payment: vine.object({
      id: vine.number(),
      requestNumber: vine.string(),
      date: vine.string().optional(),
      amount: vine.number().positive(),
      document: vine.string().nullable(),
      description: vine.string().optional(),
      referencia: vine.string(),
    }),
    transaction: vine.object({
      date: vine.string(),
      description: vine.string(),
      amount: vine.number().positive(),
      document: vine.string(),
      id: vine.string(),
    }),
    status: vine.enum(['matched', 'unmatched', 'pending', 'disputed']),
    reconciled: vine.boolean(),
  })

  // Schema para validação em lote
  private static batchSchema = vine.object({
    items: vine.array(this.singleItemSchema),
  })

  // Mensagens de erro personalizadas
  private static messagesLabels = {
    'required': 'O campo [{{ field }}] é obrigatório',
    'number.positive': 'O valor deve ser positivo',
    'payment.requestNumber.unique': 'Já existe um pagamento com este número de requisição',
    'enum': 'O valor do campo [{{ field }}] deve ser um dos: [{{ choices }}]',
    'items.minLength': 'Deve haver pelo menos um item para reconciliação',
  }

  // Configura as mensagens
  private static setMessages() {
    vine.messagesProvider = new SimpleMessagesProvider(this.messagesLabels)
  }

  // Validador para criação individual
  public static validateForCreate() {
    this.setMessages()
    return vine.compile(this.singleItemSchema)
  }

  // Validador para criação em lote
  public static validateForBatch() {
    this.setMessages()
    return vine.compile(this.batchSchema)
  }

  // Validação adicional no banco de dados (ATUALIZADO)
  public static async validateUniqueRequestNumber(requestNumber: string) {
    const existing = await Reconciliation.query()
      .where('payment_request_number', requestNumber) // Alterado para a nova coluna
      .first()

    if (existing) {
      throw new Error(
        this.messagesLabels['payment.requestNumber.unique'].replace('{{ field }}', 'requestNumber')
      )
    }
  }
}