// app/controllers/reconciliations_controller.ts

import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import Reconciliation from '#models/planbudject/reconciliation'
// import ReconciliationService from '#services/planbudject/ReconciliationService'
import ReconciliationValidator from '#validators/planbudject/ReconciledPaymentValidator'
import User from "#models/security/user";
import InternalRequest from '#models/request/internal_request';


@inject()
export default class ReconciliationsController {
//   constructor(private reconciliationService: ReconciliationService) {}

  /**
   * Cria uma nova reconciliação individual
   */
  public async store({ request, response, auth }: HttpContext) {
    console.log("✅ [DEBUG] Entrou no método store");

    try {
        const allPayload = request.all();
        console.log("📥 [DEBUG] Dados recebidos no request.all():", allPayload);

        // Converter o objeto em array de payloads
        const payloads = Object.values(allPayload);
        console.log(`📊 [DEBUG] Processando ${payloads.length} itens`);

        const results = [];
        const validator = ReconciliationValidator.validateForCreate();
        
        for (const payload of payloads) {
            try {
                console.log("🔍 [DEBUG] Processando item:", payload);

                const validatedPayload = await validator.validate(payload);
                console.log("✅ [DEBUG] Payload validado com sucesso:", validatedPayload);

                const requestNumber = validatedPayload.payment.requestNumber;
                await ReconciliationValidator.validateUniqueRequestNumber(requestNumber);
                console.log("✅ [DEBUG] Unique requestNumber validado");

                // Transformar o payload para a estrutura de colunas
                const reconciliationData = {
                    payment_id: validatedPayload.payment.id,
                    payment_request_number: requestNumber,
                    payment_date: validatedPayload.payment.date,
                    payment_amount: validatedPayload.payment.amount,
                    payment_document: validatedPayload.payment.document,
                    payment_description: validatedPayload.payment.description,
                    payment_referencia: validatedPayload.payment.referencia,
                    
                    transaction_date: validatedPayload.transaction.date,
                    transaction_description: validatedPayload.transaction.description,
                    transaction_amount: validatedPayload.transaction.amount,
                    transaction_document: validatedPayload.transaction.document,
                    transaction_id: validatedPayload.transaction.id,
                    
                    status: validatedPayload.status,
                    reconciled: validatedPayload.reconciled,
                    reconciled_by_id: auth.user                };

                // Criar a reconciliação
                const reconciliation = await Reconciliation.create(reconciliationData);
                console.log("✅ [DEBUG] Reconciliation criado com sucesso:", reconciliation.id);

                // Atualizar a internal request correspondente
                const updatedRows = await InternalRequest.query()
                    .where('request_number', requestNumber)
                    .update({
                        is_reconciled: true,
                        reconciliation_status: 'RECONCILIADO',
                        reconciliation_date: new Date(),
                        paidReq: true,
                        paid_status: "PAGO"
                    });

                console.log(`✅ [DEBUG] Internal Request ${requestNumber} atualizada. Linhas afetadas: ${updatedRows}`);

                results.push({
                    success: true,
                    requestNumber,
                    reconciliationId: reconciliation.id
                });

            } catch (itemError) {
                console.error(`❌ [ERROR] Erro ao processar item ${payload.payment?.requestNumber || 'desconhecido'}:`, itemError);
                results.push({
                    success: false,
                    requestNumber: payload.payment?.requestNumber || 'desconhecido',
                    error: itemError.message
                });
            }
        }

        // Verificar se todos os itens foram processados com sucesso
        const allSuccess = results.every(result => result.success);
        
        return allSuccess 
            ? response.created({
                message: 'Todas as reconciliações foram criadas com sucesso',
                data: results
              })
            : response.status(207).json({ // 207 Multi-Status
                message: 'Algumas reconciliações não foram processadas',
                results,
                successCount: results.filter(r => r.success).length,
                errorCount: results.filter(r => !r.success).length
              });

    } catch (error) {
        console.error("❌ [ERROR] Ocorreu um erro no método store:", error);
        console.error("🪵 [STACK TRACE]", error.stack);

        return response.status(error.status || 500).json({
            error: error.message || "Erro desconhecido",
            details: error.messages || [],
        });
    }
}
  

}