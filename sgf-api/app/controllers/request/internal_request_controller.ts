import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import InternalRequestService from "../../services/request/internal_request_service.js";
import InternalRequestValidator from "../../validators/request/internalRequestValidator.js";
import { DateTime } from "luxon";
import AccountPlanEntry from "#models/planbudject/account_plan_entry";
import AccountPlanEntryEntry from "#models/planbudject/account_plan_entry_entry";
import InternalRequest from "#models/request/internal_request";
import InternalRequestItem from "#models/request/internal_request_item";
import VoidedRequest from "#models/request/VoidedRequest";

/**
 * Gautchi Rogério Chambe
 */
@inject()
export default class InternalRequestController {

  constructor(
    private internalRequestService: InternalRequestService
  ) { }

  async createInternalRequest({ request, response }: HttpContext) {
    const data = await request.validateUsing(InternalRequestValidator.validateFields());

    try {
      const result = await this.internalRequestService.createInternalRequest(data);

      console.log('✅ Requisição interna criada com sucesso:', {
        requisicao: result,
        dataHora: new Date().toISOString()
      });

      return response.created(result);
    } catch (error) {
      console.error('❌ Erro ao criar requisição interna:', {
        erro: error.message,
        stack: error.stack,
        payload: data,
        dataHora: new Date().toISOString()
      });

      // Tratamento específico para erro de duplicação
      if (error.message.includes('Já existe uma requisição com os mesmos dados')) {
        return response.status(409).json({
          message: error.message,
          code: 'DUPLICATE_REQUEST',
          error: true
        });
      }

      // Tratamento para erros de validação/negócio
      if (error.message.includes('Saldo insuficiente') || 
          error.message.includes('Item inválido') ||
          error.message.includes('Data inválida') ||
          error.message.includes('lista de itens está vazia')) {
        return response.status(400).json({
          message: error.message,
          code: 'VALIDATION_ERROR',
          error: true
        });
      }

      // Erro genérico (fallback)
      return response.status(500).json({
        message: 'Ocorreu um erro inesperado ao criar a requisição interna',
        code: 'INTERNAL_ERROR',
        error: true,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }


  async updateInternalRequestStatus({ request, response }: HttpContext) {
    const { requestNumber, conformanceStatus, justification } = request.body();

    if (!requestNumber || typeof conformanceStatus !== 'boolean') {
      return response.badRequest({
        message: 'Número da requisição ou status de conformidade inválidos.',
      });
    }

    try {
      const updatedRequest = await this.internalRequestService.updateStatus(requestNumber, conformanceStatus, justification); // Passar `justification`
      return response.ok({
        message: 'Status da requisição atualizado com sucesso.',
        data: updatedRequest,
      });
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao atualizar o status da requisição.',
        error: error.message,
      });
    }
  }

  async findAllInternalRequest({ response }: HttpContext) {
    return response.ok(await this.internalRequestService.findAll());
  }

  async feacthAllInternalRequest({ response }: HttpContext) {
    return response.ok(await this.internalRequestService.feacthAll());
  }


  async fetchAllInternalRequest({ response }: HttpContext) {
    return response.ok(await this.internalRequestService.fetchAll());
  }

  async fetchAllInternalRequestValid({ response }: HttpContext) {
    return response.ok(await this.internalRequestService.fetchAllValid());
  }

  async findInternalRequestByRequestNumber({ request, response }: HttpContext) {
    const number = request.param('number');
    return response.ok(await this.internalRequestService.findByRequestNumber(number));
  }

  async dashboardAvailableRequests({ request, response }: HttpContext) {
    return response.ok(await this.internalRequestService.findDashboardAvailableRequests(number));
  }

  async dashboardBudjectExecution({ request, response }: HttpContext) {
    return response.ok(await this.internalRequestService.dashboardBudjectExecutionData());
  }

  async dashboardAccountToPayAndReceive({ request, response }: HttpContext) {
    return response.ok(await this.internalRequestService.dashboardAccountToPayAndReceive());
  }

  // public async getFinancialEntries({ request, response }: HttpContext) {
  //   try {
  //     console.log("getFinancialEntries - Início da requisição");
  
  //     const { accountPlanNumber, startDate: startDateStr, endDate: endDateStr } = request.only([
  //       "accountPlanNumber",
  //       "startDate",
  //       "endDate"
  //     ]);
  
  //     console.log("Parâmetros recebidos:", { accountPlanNumber, startDateStr, endDateStr });
  
  //     if (!accountPlanNumber || !startDateStr || !endDateStr) {
  //       console.warn("Parâmetros obrigatórios ausentes");
  //       return response.badRequest({ message: "Parâmetros obrigatórios ausentes." });
  //     }
  
  //     const startDate = DateTime.fromISO(startDateStr);
  //     const endDate = DateTime.fromISO(endDateStr);
  
  //     if (!startDate.isValid || !endDate.isValid) {
  //       console.warn("Datas inválidas recebidas", { startDateStr, endDateStr });
  //       return response.badRequest({ message: "Datas inválidas." });
  //     }
  
  //     console.log(`Datas convertidas - startDate: ${startDate.toISO()}, endDate: ${endDate.toISO()}`);
  
  //     // Consulta AccountPlanEntryEntry com preload e filtros por data
  //     const accountEntries = await AccountPlanEntryEntry.query()
  //       .whereHas('entry', (builder) => {
  //         builder.where('accountPlanNumber', accountPlanNumber);
  //       })
  //       .preload('entry')
  //       .preload('targetEntrieEntry')
  //       .whereRaw('DATE(created_at) BETWEEN ? AND ?', [
  //         startDate.toFormat('yyyy-MM-dd'),
  //         endDate.toFormat('yyyy-MM-dd'),
  //       ]);
  
  //     console.log(`Entradas encontradas em AccountPlanEntryEntry: ${accountEntries.length}`);
  
  //     // Consulta InternalRequestItem com preload e filtros por data
  //     const internalRequests = await InternalRequestItem.query()
  //       .whereHas('accountPlanBudject', (builder) => {
  //         builder.where('number', accountPlanNumber);
  //       })
  //       .preload('accountPlanBudject')
  //       .preload('beneficiaryName')
  //       .preload('internalRequest', (irBuilder) => {
  //         irBuilder.preload('accountPlanFinancial'); // preload aninhado
  //       })
  //       .whereRaw('DATE(created_at) BETWEEN ? AND ?', [
  //         startDate.toFormat('yyyy-MM-dd'),
  //         endDate.toFormat('yyyy-MM-dd'),
  //       ]);
  
  //     console.log(`Solicitações internas encontradas: ${internalRequests.length}`);
  
  //     // Inicializa acumuladores
  //     let initialAllocation = 0;
  //     let totalInscricao = 0;
  //     let totalAnulacao = 0;
  //     let totalRedistribuicaoAnull = 0;
  //     let totalRedistribuicaoReforce = 0;
  //     let availableAllocation = 0;
  
  //     // Processa accountEntries
  //     for (const entry of accountEntries) {
  //       const value = entry.allocation || 0;
  
  //       if (entry.type === "initial_allocation") {
  //         initialAllocation += value;
  //       }
  //       if (entry.type === "reinforcement") {
  //         totalInscricao += value;
  //       }
  //       if (entry.type === "annulment") {
  //         totalAnulacao += value;
  //       }
  //       if (entry.type === "redistribuition_annulment") {
  //         totalRedistribuicaoAnull += value;
  //       }
  //       if (entry.type === "redistribuition_reinforcement") {
  //         totalRedistribuicaoReforce += value;
  //       }
  //     }
  
  //     console.log("Totais acumulados:", {
  //       initialAllocation,
  //       totalInscricao,
  //       totalAnulacao,
  //       totalRedistribuicaoAnull,
  //       totalRedistribuicaoReforce
  //     });
  
  //     // Aplica filtros adicionais se necessário
  //     const filteredRequests = internalRequests;
  
  //     // Cálculo do saldo disponível
  //     availableAllocation =
  //       initialAllocation +
  //       totalInscricao -
  //       totalAnulacao -
  //       totalRedistribuicaoAnull +
  //       totalRedistribuicaoReforce;
  
  //     console.log(`Available Allocation calculada: ${availableAllocation}`);
  
  //     // Extrai os request_numbers das internalRequests
  //     const requestNumbers = filteredRequests
  //       .map(req => req.internalRequest?.requestNumber)
  //       .filter((number): number is string => Boolean(number)); // filtra nulos/undefined
  
  //     console.log("Request numbers extraídos:", requestNumbers);
  
  //     // Busca os voided_requests com base nos request_numbers
  //     let voidedRequests: InstanceType<typeof VoidedRequest>[] = [];
  //     if (requestNumbers.length > 0) {

  //       voidedRequests = await VoidedRequest.query()
  //       .whereIn('requestNumber', requestNumbers);
  
  //       console.log(`Voided requests encontrados: ${voidedRequests.length}`);
  //     }
  
  //     // Retorna os dados financeiros completos
  //     console.log("Retornando resposta com dados financeiros");
  
  //     return response.ok({
  //       initialAllocation,
  //       totalInscricao,
  //       totalAnulacao,
  //       totalRedistribuicaoAnull,
  //       totalRedistribuicaoReforce,
  //       availableAllocation,
  //       filteredRequests,
  //       voidedRequests
  //     });
  
  //   } catch (error: any) {
  //     console.error("Erro em getFinancialEntries:", error);
  //     return response.internalServerError({
  //       message: "Erro ao buscar dados financeiros",
  //       detail: error.message,
  //     });
  //   }
  // }
  
  public async getFinancialEntries({ request, response }: HttpContext) {
    try {
      console.log("getFinancialEntries - Início da requisição");
  
      const { accountPlanNumber, startDate: startDateStr, endDate: endDateStr } = request.only([
        "accountPlanNumber",
        "startDate",
        "endDate"
      ]);
  
      console.log("Parâmetros recebidos:", { accountPlanNumber, startDateStr, endDateStr });
  
      if (!accountPlanNumber || !startDateStr || !endDateStr) {
        console.warn("Parâmetros obrigatórios ausentes");
        return response.badRequest({ message: "Parâmetros obrigatórios ausentes." });
      }
  
      const startDate = DateTime.fromISO(startDateStr);
      const endDate = DateTime.fromISO(endDateStr);
  
      if (!startDate.isValid || !endDate.isValid) {
        console.warn("Datas inválidas recebidas", { startDateStr, endDateStr });
        return response.badRequest({ message: "Datas inválidas." });
      }
  
      console.log(`Datas convertidas - startDate: ${startDate.toISO()}, endDate: ${endDate.toISO()}`);
  
      // Primeiro busca o range de datas existente para esta conta
      const dateRange = await AccountPlanEntryEntry.query()
        .whereHas('entry', (builder) => {
          builder.where('accountPlanNumber', accountPlanNumber);
        })
        .select('created_at')
        .orderBy('created_at', 'asc')
        .first()
        .then(firstEntry => {
          return AccountPlanEntryEntry.query()
            .whereHas('entry', (builder) => {
              builder.where('accountPlanNumber', accountPlanNumber);
            })
            .select('created_at')
            .orderBy('created_at', 'desc')
            .first()
            .then(lastEntry => ({
              minDate: firstEntry?.$extras.created_at ? DateTime.fromJSDate(firstEntry.$extras.created_at) : null,
              maxDate: lastEntry?.$extras.created_at ? DateTime.fromJSDate(lastEntry.$extras.created_at) : null
            }));
        });
  
      console.log('Range de datas encontrado:', {
        minDate: dateRange.minDate?.toISO(),
        maxDate: dateRange.maxDate?.toISO()
      });
  
      // Consulta AccountPlanEntryEntry com preload
      let accountEntriesQuery = AccountPlanEntryEntry.query()
        .whereHas('entry', (builder) => {
          builder.where('accountPlanNumber', accountPlanNumber);
        })
        .preload('entry')
        .preload('targetEntrieEntry');
  
      // Aplica filtro de datas apenas se as datas solicitadas estiverem dentro do range existente
      if (dateRange.minDate && dateRange.maxDate && 
          startDate >= dateRange.minDate && endDate <= dateRange.maxDate) {
        console.log('Aplicando filtro de datas para accountEntries');
        accountEntriesQuery = accountEntriesQuery.whereRaw('DATE(created_at) BETWEEN ? AND ?', [
          startDate.toFormat('yyyy-MM-dd'),
          endDate.toFormat('yyyy-MM-dd'),
        ]);
      } else {
        console.log('Ignorando filtro de datas para accountEntries - trazendo todos os registros');
      }
  
      const accountEntries = await accountEntriesQuery;
  
      console.log(`Entradas encontradas em AccountPlanEntryEntry: ${accountEntries.length}`);
  
      // Consulta InternalRequestItem com preload e filtros por data (mantido como estava)
      const internalRequests = await InternalRequestItem.query()
        .whereHas('accountPlanBudject', (builder) => {
          builder.where('number', accountPlanNumber);
        })
        .preload('accountPlanBudject')
        .preload('beneficiaryName')
        .preload('internalRequest', (irBuilder) => {
          irBuilder.preload('accountPlanFinancial'); // preload aninhado
        })
        .whereRaw('DATE(created_at) BETWEEN ? AND ?', [
          startDate.toFormat('yyyy-MM-dd'),
          endDate.toFormat('yyyy-MM-dd'),
        ]);
  
      console.log(`Solicitações internas encontradas: ${internalRequests.length}`);
  
      // Inicializa acumuladores
      let initialAllocation = 0;
      let totalInscricao = 0;
      let totalAnulacao = 0;
      let totalRedistribuicaoAnull = 0;
      let totalRedistribuicaoReforce = 0;
      let availableAllocation = 0;
  
      // Processa accountEntries
      for (const entry of accountEntries) {
        const value = entry.allocation || 0;
  
        if (entry.type === "initial_allocation") {
          initialAllocation += value;
        }
        if (entry.type === "reinforcement") {
          totalInscricao += value;
        }
        if (entry.type === "annulment") {
          totalAnulacao += value;
        }
        if (entry.type === "redistribuition_annulment") {
          totalRedistribuicaoAnull += value;
        }
        if (entry.type === "redistribuition_reinforcement") {
          totalRedistribuicaoReforce += value;
        }
      }
  
      console.log("Totais acumulados:", {
        initialAllocation,
        totalInscricao,
        totalAnulacao,
        totalRedistribuicaoAnull,
        totalRedistribuicaoReforce
      });
  
      // Aplica filtros adicionais se necessário
      const filteredRequests = internalRequests;
  
      // Cálculo do saldo disponível
      availableAllocation =
        initialAllocation +
        totalInscricao -
        totalAnulacao -
        totalRedistribuicaoAnull +
        totalRedistribuicaoReforce;
  
      console.log(`Available Allocation calculada: ${availableAllocation}`);
  
      // Extrai os request_numbers das internalRequests
      const requestNumbers = filteredRequests
        .map(req => req.internalRequest?.requestNumber)
        .filter((number): number is string => Boolean(number)); // filtra nulos/undefined
  
      console.log("Request numbers extraídos:", requestNumbers);
  
      // Busca os voided_requests com base nos request_numbers
      let voidedRequests: InstanceType<typeof VoidedRequest>[] = [];
      if (requestNumbers.length > 0) {
        voidedRequests = await VoidedRequest.query()
          .whereIn('requestNumber', requestNumbers);
  
        console.log(`Voided requests encontrados: ${voidedRequests.length}`);
      }
  
      // Retorna os dados financeiros completos
      console.log("Retornando resposta com dados financeiros");
  
      return response.ok({
        initialAllocation,
        totalInscricao,
        totalAnulacao,
        totalRedistribuicaoAnull,
        totalRedistribuicaoReforce,
        availableAllocation,
        filteredRequests,
        voidedRequests
      });
  
    } catch (error: any) {
      console.error("Erro em getFinancialEntries:", error);
      return response.internalServerError({
        message: "Erro ao buscar dados financeiros",
        detail: error.message,
      });
    }
  }

}