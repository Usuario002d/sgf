import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import AccountingJournalService from "../../services/accounting/accounting_journal_service.js";
import AccountingJournalEntryValidator from "../../validators/accounting/accountingJournalEntryValidator.js";

/**
 * Gautchi Rogério Chambe
 */
@inject()
export default class AccountingJournalController {

  constructor(
    private accountingJournalService: AccountingJournalService
  ) { }

  async openAccountingJournal({ request, response }: HttpContext) {
    const data = await request.validateUsing(AccountingJournalEntryValidator.validateFields())

    try {
      return response.created(await this.accountingJournalService.openAccountingJournal(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorrer erro na execução do lancamento de abertura  das contas financeiras',
        error: error.message,
      });
    }
  }

  async billToPayAccountingJournal({ request, response }: HttpContext) {
    console.log("Iniciando processamento da requisição");
  
    try {
      // Validação dos dados
      const data = await request.validateUsing(AccountingJournalEntryValidator.validateFields());
      console.log("Dados validados com sucesso:", data);
  
      // Execução do serviço
      const result = await this.accountingJournalService.billToPayAccountingJournal(data);
  
      // Retorna resposta de sucesso
      return response.created(result);
  
    } catch (error) {
      // Log de erro detalhado
      console.error("Ocorreu um erro:", error);
  
      // Retorna resposta com erro interno
      return response.status(500).json({
        message: 'Ocorreu um erro na execução das despesas por pagar do plano de contas',
        error: error.message ?? 'Erro desconhecido',
      });
    }
  }
  

  async billToReceiveAccountingJournal({ request, response }: HttpContext) {
    const data = await request.validateUsing(AccountingJournalEntryValidator.validateFields())

    try {
      return response.created(await this.accountingJournalService.billToReceiveAccountingJournal(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorrer erro na execução das despesas por receber do plano de contas',
        error: error.message,
      });
    }
  }

  async bankInAccountingJournal({ request, response }: HttpContext) {
    const data = await request.validateUsing(AccountingJournalEntryValidator.validateFields())

    try {
      return response.created(await this.accountingJournalService.bankInAccountingJournal(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorrer erro na execução das despesas por receber do plano de contas',
        error: error.message,
      });
    }
  }

// app/controllers/accounting/accounting_journal_controller.ts

async bankOutAccountingJournal({ request, response }: HttpContext) {
  const data = await request.validateUsing(AccountingJournalEntryValidator.validateFields());

  try {
    const result = await this.accountingJournalService.bankOutAccountingJournal(data);
    return response.created(result);
  } catch (error) {
    console.error('Erro na execução do lançamento contábil:', error);

    return response.status(400).json({
      status: 'error',
      message: error.message ?? 'Erro inesperado ao processar o lançamento contábil',
    });
  }
}

  

  async regulationAccountingJournal({ request, response }: HttpContext) {
    const data = await request.validateUsing(AccountingJournalEntryValidator.validateFields())

    try {
      return response.created(await this.accountingJournalService.regulationAccountingJournal(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorrer erro na execução das despesas por receber do plano de contas',
        error: error.message,
      });
    }
  }


  async fetchAllAccountingJournalEntry({ response }: HttpContext) {
    return response.ok(await this.accountingJournalService.fetchAllAccountingJournalEntry());
  }

  async fetchAllAccountingJournalEntryItems({ response }: HttpContext) {
    const items = await this.accountingJournalService.fetchAllAccountingJournalEntryItems();
    return response.ok(items); // Retorna os itens carregados com as relações
  }

  async fetchAllAccountingJournalEntryItemsByFilters({ request, response }: HttpContext) {

    // const { startDate, endDate, accountPlanId } = request.qs();


    // const items = await this.accountingJournalService.fetchAllAccountingJournalEntryItemsByFilters({
    //   startDate,
    //   endDate,
    //   accountPlanId
    // });

    console.log("asdasdkasdj")

    const items = await this.accountingJournalService.fetchAllAccountingJournalEntryItemsByFilters();

    console.log("asdasdkasdj", items)
    return response.ok(items);
  }

  // async fetchAllAccountingJournalEntryItems({ response }: HttpContext) {
  //   const items = await this.accountingJournalService.fetchAllAccountingJournalEntryItems();
  //   return response.ok(items); // Retorna os itens carregados com as relações
  // }



  async fetchAllBalanceteByFilters({ request, response }: HttpContext) {

    const { startDate, endDate, accountPlanId } = request.qs();
    console.log("Meus Filtros",startDate, endDate, accountPlanId );

    const items = await this.accountingJournalService.fetchAllBalanceteByFiltersSearch({
      startDate,
      endDate,
      accountPlanId
    });

    return response.ok(items);
  }


  async fetchGeneralFolioAccountByYearAndMonth({ request, response }: HttpContext) {

    const { year, month} = request.qs();

    const items = await this.accountingJournalService.fetchGeneralFolioAccountByYearAndMonthData({
      year,
      month,
    });

    return response.ok(items);
  }



  async fetchGeneralFolioAccountByFilter({ request, response }: HttpContext) {

    const { startDate, endDate, accountPlanId } = request.qs();
    console.log("Meus Filtros", startDate, endDate, accountPlanId);

    const items = await this.accountingJournalService.fetchGeneralFolioAccountByFilterData({
      startDate,
      endDate,
      accountPlanId
    });

    console.log("asdasdaitems", items)

    return response.ok(items);
  }




  async findAllAccountingJournalEntry({ response }: HttpContext) {
    return response.ok(await this.accountingJournalService.fetchAllAccountingJournalEntry());
  }

  async fetchAllAccountingJournal({ response }: HttpContext) {
    return response.ok(await this.accountingJournalService.fetchAllAccountingJournals());
  }

  async fetchAllAccountingJournalByJournalNumber({ request, response }: HttpContext) {
    const journalNumber = request.param('number');
    return response.ok(await this.accountingJournalService.fetchAllAccountingJournalByJournalNumber(journalNumber));
  }
}