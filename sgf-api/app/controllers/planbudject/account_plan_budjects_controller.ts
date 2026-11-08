// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from "@adonisjs/core/http";
import AccountPlanBudjectService from "../../services/planbudject/account_plan_budject_service.js";
import AccountPlanEntryValidator from "../../validators/planbudject/accountPlanEntryValidator.js";
import AccountPlanYearValidator from "../../validators/planbudject/accountPlanYearValidator.js";
import { inject } from "@adonisjs/core";

@inject()
export default class AccountPlanBudjectsController {

  constructor(
    private accountPlanBudjectService: AccountPlanBudjectService
  ) { }

  public async createAccountPlanYear({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanYearValidator.validateFields())

    try {
      return response.created(await this.accountPlanBudjectService.createAccountPlanYear(data));
    } catch (error) {
      return response.status(500).json({
        message: 'Ocorreu um erro ao criar o plano orçamento',
        error: error.message,
      });
    }
  }

  // No seu AccountPlanBudjectsController.ts

  public async clearInitialAllocation({ request, response }: HttpContext) {
    const { id, year } = request.only(['id', 'year']);
    console.log("limpeza dos dados", id, year);

    try {
      await this.accountPlanBudjectService.clearAllInitialAllocations(year ? Number(year) : undefined);

      return response.status(200).json({ success: true });
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Erro ao limpar alocações',
        error: error.message
      });
    }
  }


  public async associateFinancialAccountWithBujectAccounts({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanEntryValidator.validateFieldsAssociateAccounts());

    try {
      return response.created(await this.accountPlanBudjectService.associateFinancialAccountWithBujectAccounts(data));
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao associa o plano de conta orçamental e o plano financeiro',
        error: error.message,
      });
    }
  }


  // Método de conformidade inicial para alocação
  public async conformInitialAllocation({ request, response }: HttpContext) {
    try {
      // Validação dos dados recebidos
      const data = await request.validateUsing(AccountPlanEntryValidator.validateFieldsWithConformance());

      console.log("conformInitialAllocation", data);
      // Chamando o serviço para processar a conformidade
      const result = await this.accountPlanBudjectService.conformInitialAllocation(data);

      // Retorna o resultado com status 200 em caso de sucesso
      return response.status(200).json(result);
    } catch (error) {
      // Retorna erro com status 500 em caso de falha
      return response.status(500).json({
        message: 'Ocorreu erro ao Dar Conformidade do Orcamento aprovado!',
        error: error.message,
      });
    }
  }

  public async createAccountPlanEntry({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanEntryValidator.validateFields());

    console.log("Dados recebido", data)

    try {
      return response.created(await this.accountPlanBudjectService.createAccountPlanEntry(data));
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao criar o plano e orçamento',
        error: error.message,
      });
    }
  }



  public async initialAllocationAccountPlanEntry({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanEntryValidator.validateFieldsReinforceOrAnnul());

    try {
      return response.created(await this.accountPlanBudjectService.initialAllocationAccountPlanEntry(data));
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao criar o plano e orçamento',
        error: error.message,
      });
    }
  }

  // Em seu controlador
  public async correctAccountPlanEntryValueHandler({ request, response }: HttpContext) {
    const data = await request.validateUsing(AccountPlanEntryValidator.validateData());
    console.log("meusdadosdsa", data)
    try {
      const updatedEntry = await this.accountPlanBudjectService.correctAccountPlanEntryValue(data);

      return response.status(200).json(updatedEntry);
    } catch (error) {
      return response.status(500).json({
        message: "Erro ao atualizar o plano de conta",
        error: error.message
      });
    }
  }

    // Em seu controlador
    public async updateInitialAllocationApprovalDate({ request, response }: HttpContext) {
      const data = await request.validateUsing(AccountPlanEntryValidator.validateDataBudjectTable());
      console.log("meusdadosdsa", data)
      try {
        const updatedEntry = await this.accountPlanBudjectService.setInitialAllocationApprovalDate(data);
  
        console.log("actualizou com sucesso", updatedEntry)
        return response.status(200).json(updatedEntry);

      } catch (error) {
        return response.status(500).json({
          message: "Erro ao atualizar o plano de conta",
          error: error.message
        });
      }
    }



    public async reinforceAccountPlanEntry({ request, response }: HttpContext) {
      const data = await request.validateUsing(AccountPlanEntryValidator.validateFieldsReinforceOrAnnul());
    
      try {
        return response.created(
          await this.accountPlanBudjectService.reinforceAccountPlanEntry(data)
        );
      } catch (error) {
        console.log(error);
    
        // Se for erro de validação da regra do valor, retorne 400 (Bad Request)
        if (error.message === "O valor não pode ser negativo ou zero.") {
          return response.status(400).json({
            message: error.message,
          });
        }
    
        // Para outros erros, retorna status 500 com mensagem genérica + mensagem do erro
        return response.status(500).json({
          message: 'Ocorreu um erro ao executar o reforço do plano e orçamento na conta ' + data.accountPlanNumber,
          error: error.message,
        });
      }
    }
    

  public async annulAccountPlanEntry({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanEntryValidator.validateFieldsReinforceOrAnnul());

    try {
      return response.created(await this.accountPlanBudjectService.annulAccountPlanEntry(data));
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao executar a anulação do plano e orçamento na conta ' + data.accountPlanNumber,
        error: error.message,
      });
    }
  }

  public async redistribuitioReinforcimentAccountPlanEntry({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanEntryValidator.validateFieldsRedistributeReinforcementOrAnnulment());

    console.log("Dados Recebidos", data)
    try {
      return response.created(await this.accountPlanBudjectService.redistribuitioReinforcimentAccountPlanEntry(data));
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao executar a redistribuicao do reforço do plano e orçamento na conta ' + data.originAccountPlanNumber,
        error: error.message,
      });
    }
  }

  public async redistributeAnnulmentAccountPlanEntry({ request, response }: HttpContext) {

    console.log("Dados Recebidosanull")

    const data = await request.validateUsing(AccountPlanEntryValidator.validateFieldsRedistributeReinforcementOrAnnulment());


    console.log("Dados Recebidosanull", data)

    try {
      return response.created(await this.accountPlanBudjectService.redistributeAnnulmentAccountPlanEntry(data));
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao executar a redistribuicao da anulação do plano e orçamento na conta ' + data.originAccountPlanNumber,
        error: error.message,
      });
    }
  }


  public async annullmentRequest({ request, response }: HttpContext) {

    const data = await request.validateUsing(AccountPlanEntryValidator.validateFieldsReinforceOrAnnul());

    try {
      return response.created(await this.accountPlanBudjectService.annullmentRequest(data));
    } catch (error) {
      console.log(error);
      return response.status(500).json({
        message: 'Ocorreu um erro ao executar o reforço do plano e orçamento na conta ' + data.accountPlanNumber,
        error: error.message,
      });
    }
  }


  public async findAllAccountPlanYear({ response }: HttpContext) {
    return response.ok(await this.accountPlanBudjectService.findAllAccountPlanYear());
  }

  public async findAccountPlanYearByYear({ request, response }: HttpContext) {
    const year = request.param('year');
    return response.ok(await this.accountPlanBudjectService.findAccountPlanYearByYear(year));
  }

  public async findAccountPlanEntriesByYear({ request, response }: HttpContext) {
    const year = request.param('year');
    return response.ok(await this.accountPlanBudjectService.findAllAccountPlanEntries(year));
  }

  public async findAccountPlanEntriesEntryByYear({ request, response }: HttpContext) {
    const year = request.param('year');
    return response.ok(await this.accountPlanBudjectService.findAllAccountPlanEntriesEntry(year));
  }

  public async fetchAccountPlanEntriesByYear({ request, response }: HttpContext) {
    const year = request.param('year');
    return response.ok(await this.accountPlanBudjectService.fetchAllAccountPlanEntries(year));
  }

  public async fetchAccountPlanEntriesByYearInitial({ request, response }: HttpContext) {
    const year = request.param('year');
    return response.ok(await this.accountPlanBudjectService.fetchAllAccountPlanEntriesInitial(year));
  }


  public async fetchInitialAllocationsByParentId({ request, response }: HttpContext) {
    const year = request.param('year');
    return response.ok(await this.accountPlanBudjectService.fetchInitialAllocationsByParentId(year));
  }


  public async fetchAccountPlanEntriesByYearAndNumber({ request, response }: HttpContext) {
    const year = request.param('year');
    const accountPlanNumber = request.param('accountPlanNumber');
    return response.ok(await this.accountPlanBudjectService.fetchAccountPlanEntriesByYearAndNumber(year, accountPlanNumber));
  }


  public async fetchAllFinancialAccountsAndAssociations({ params, response }: HttpContext) {

    try {
      const financialAccountsWithAssociations =
        await this.accountPlanBudjectService.findAllFinancialAccountsAndAssociatedBudgets();
      return response.ok(financialAccountsWithAssociations);
    } catch (error) {
      console.error(error);
      return response.status(500).json({
        message: 'Erro ao buscar todas as associações de contas financeiras.',
        error: error.message,
      });
    }
  }


  public async fetchSummationAccountEntriesEntry({ request, response }: HttpContext) {
    try {
      const year = request.input('year') ? Number(request.input('year')) : undefined;
      const financialAccountsWithAssociations =
        await this.accountPlanBudjectService.fetchSummationAccountEntriesEntry(year);
      return response.ok(financialAccountsWithAssociations);
    } catch (error) {
      console.error(error);
      return response.status(500).json({
        message: 'Erro as contas.',
        error: error.message,
      });
    }
  }


  public async findConformInitialAllocation({ request, response }: HttpContext) {
    console.log("enntriesChegou")
    try {
      const year = request.input('year') ? Number(request.input('year')) : undefined;
      const findConformInitialAllocationData =
        await this.accountPlanBudjectService.findConformInitialAllocation(year);

      // Retorna o valor booleano diretamente como resposta
      return response.ok({ data: findConformInitialAllocationData });
    } catch (error) {
      console.error(error);
      return response.status(500).json({
        message: 'Erro ao consultar as contas.',
        error: error.message,
      });
    }
  }





  public async validateInitialAllocationApprovalDate({ request, response }: HttpContext) {
    console.log("Entries Chegou");
    try {
        const year = request.input('year') ? Number(request.input('year')) : undefined;
        const findConformInitialAllocationData = await this.accountPlanBudjectService.validateInitialAllocationApprovalDate(year);

        if (!findConformInitialAllocationData.valid) {
            return response.ok({ data: false });
        }

        return response.ok({ data: findConformInitialAllocationData });
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            message: 'Erro ao consultar as contas.',
            error: error.message,
        });
    }
}



public async fetchAccountPlanEntriesByYearByfilters({ request, response, params }: HttpContext) {
  const year = params.year;

  const filters = request.only(['startDate', 'endDate', 'accountPlanId']);

  console.log('Requisição recebida com ano e filtros:', { year, filters });

  
  const result = await this.accountPlanBudjectService.fetchAllAccountPlanEntriesByfilters(year, filters);

  console.log("result set ", result)
  return response.ok(result);
}

public async fiscalYearsOverview({ response }: HttpContext) {
  try {
    const data = await this.accountPlanBudjectService.getFiscalYearsOverview();
    return response.ok(data);
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: 'Erro ao obter o resumo dos exercícios fiscais.',
      error: error.message,
    });
  }
}

public async setActiveFiscalYear({ request, response }: HttpContext) {
  try {
    const { year, description } = request.only(['year', 'description']);
    const result = await this.accountPlanBudjectService.setActiveFiscalYear(Number(year), description);
    return response.ok(result);
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: 'Erro ao definir o exercício fiscal ativo.',
      error: error.message,
    });
  }
}

public async transitionFiscalYear({ request, response }: HttpContext) {
  try {
    const payload = request.only([
      'targetYear',
      'sourceYear',
      'mode',
      'scope',
      'setAsActive',
      'observation',
    ]);
    const result = await this.accountPlanBudjectService.transitionOrResetFiscalYear(payload as any);
    return response.ok(result);
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: 'Erro ao processar a transição/abertura do exercício económico.',
      error: error.message,
    });
  }
}

public async compareFiscalYears({ params, response }: HttpContext) {
  try {
    const sourceYear = Number(params.sourceYear);
    const targetYear = Number(params.targetYear);
    const result = await this.accountPlanBudjectService.compareFiscalYears(sourceYear, targetYear);
    return response.ok(result);
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: 'Erro ao comparar exercícios fiscais.',
      error: error.message,
    });
  }
}




  public async importInitialAllocationsFromExcel({ request, response }: HttpContext) {
    try {
      const payload = request.only(['filePath', 'allocations', 'year']);
      const result = await this.accountPlanBudjectService.importInitialAllocationsFromExcel(payload);
      return response.status(200).json(result);
    } catch (error) {
      console.error("Erro ao importar alocações do Excel:", error);
      return response.status(500).json({
        success: false,
        message: 'Erro ao importar dotações do ficheiro Excel',
        error: error.message
      });
    }
  }

}
