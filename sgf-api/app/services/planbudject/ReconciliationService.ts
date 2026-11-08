// // app/services/reconciliation_service.ts

// import { inject } from '@adonisjs/core'
// import { DateTime } from 'luxon'
// import Reconciliation from '#models/planbudject/reconciliation'

// @inject()
// export default class ReconciliationService {
//   /**
//    * Cria uma reconciliação individual
//    */
//   async createReconciliation(payload: ReconciliationStoreDto) {
//     // Verifica duplicata
//     const existing = await Reconciliation.query()
//       .where('payment->>requestNumber', payload.payment.requestNumber)
//       .first()

//     if (existing) {
//       throw new Error('Já existe um pagamento com este número de requisição')
//     }

//     return await Reconciliation.create({
//       ...payload,
//       reconciledAt: DateTime.now(),
//     })
//   }

//   /**
//    * Cria múltiplas reconciliações
//    */
//   async batchCreateReconciliation(items: ReconciliationStoreDto[]) {
//     // Verifica duplicatas em lote
//     const requestNumbers = items.map((item) => item.payment.requestNumber)
//     const existingPayments = await Reconciliation.query()
//       .whereIn('payment->>requestNumber', requestNumbers)
//       .exec()

//     if (existingPayments.length > 0) {
//       throw new Error(
//         `Existem ${existingPayments.length} pagamentos já reconciliados`
//       )
//     }

//     return await Reconciliation.createMany(
//       items.map((item) => ({
//         ...item,
//         reconciledAt: DateTime.now(),
//       }))
//     )
//   }

//   /**
//    * Lista reconciliações com filtros
//    */
//   async listReconciliations(filters: any) {
//     const query = Reconciliation.query()

//     // Filtro por data
//     if (filters.startDate || filters.endDate) {
//       query.whereBetween('payment->>date', [
//         filters.startDate || '1970-01-01',
//         filters.endDate || DateTime.now().toISODate(),
//       ])
//     }

//     // Outros filtros
//     if (filters.status) {
//       query.where('status', filters.status)
//     }

//     if (filters.reconciled) {
//       query.where('reconciled', filters.reconciled === 'true')
//     }

//     return await query.orderBy('created_at', 'desc').exec()
//   }

//   /**
//    * Busca por número de requisição
//    */
//   async findByRequestNumber(requestNumber: string) {
//     return await Reconciliation.query()
//       .where('payment->>requestNumber', requestNumber)
//       .first()
//   }
// }