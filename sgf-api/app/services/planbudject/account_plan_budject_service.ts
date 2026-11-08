import db from "@adonisjs/lucid/services/db";
import AccountPlanYear from "../../models/planbudject/account_plan_year.js";
import AccountPlanEntry from "../../models/planbudject/account_plan_entry.js";
import AccountPlanEntryEntry from "../../models/planbudject/account_plan_entry_entry.js";
import AccountPlanYearValidator from "../../validators/planbudject/accountPlanYearValidator.js";
import AccountPlanEntryService from "./account_plan_entry_service.js";
import { AccountPlanYearDTO, AccountPlanEntryDTO } from "./utils/dtos.js";
import { inject } from "@adonisjs/core";
import FinancialBudgetAssociations from "#models/planbudject/financial_budget_associations";
import AccountPlan from "#models/planbudject/account_plan";
import { EntryEntryType, OperatorType } from "#models/utility/Enums";
import InternalRequest from "#models/request/internal_request";
import { DateTime } from "luxon";


/*
* Servicos para o plano de contas
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
@inject()
export default class AccountPlanBudjectService {

  constructor(
    private accountPlanEntryService: AccountPlanEntryService
  ) { }

  public async createAccountPlanYear(data: AccountPlanYearDTO) {
    await AccountPlanYearValidator.validateOnCreate(data);
    const accountPlanYear = new AccountPlanYear();
    accountPlanYear.fill({ year: data.year, description: data.description, })
    return await AccountPlanYear.create(accountPlanYear);
  }

  public async createAccountPlanEntry(data: AccountPlanEntryDTO) {
    return await this.accountPlanEntryService.createAccountPlanEntryTest(data);
  }

  public async associateFinancialAccountWithBujectAccounts(data: { accountPlanFinancialNumber: string, accountPlanBujectsNumber: { accountPlanBujectNumber: string }[] }) {
    return await this.accountPlanEntryService.associateFinancialAccountWithBujectAccounts(data);

  }

  public async conformInitialAllocation(data: { complianceStatus: string, descriptionCompliance: { accountPlanBujectNumber: string }[], userID: number }) {
    return await this.accountPlanEntryService.conformInitialAllocation(data);
  }

  public async 
  public async importInitialAllocationsFromExcel(data?: {
    filePath?: string;
    allocations?: Array<{
      code: string;
      description: string;
      valueUsd: number;
      contraValorMzn?: number;
    }>;
    year?: number;
  }) {
    return await this.accountPlanEntryService.importInitialAllocationsFromExcel(data);
  }

  public async initialAllocationAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
    return await this.accountPlanEntryService.initialAllocationAccountPlanEntry(data);
  }

  public async correctAccountPlanEntryValue(data: {
    accountPlanNumber: string,
    newValue: number,
    isInitialAllocation: boolean
  }) {
    return await this.accountPlanEntryService.correctAccountPlanEntryValue(data);
  }


  public async setInitialAllocationApprovalDate(data: {
    date: Date
  }) {
    return await this.accountPlanEntryService.setInitialAllocationApprovalDate(data);
  }


  public async reinforceAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
    return this.accountPlanEntryService.reinforceAccountPlanEntry(data);
  }

  public async annullmentRequest(data: { accountPlanNumber: string, value: number, operationDate: Date, requestNumber: string }) {
    return this.accountPlanEntryService.annullmentRequestEntry(data);
  }




  public async annulAccountPlanEntry(data: { accountPlanNumber: string, value: number, operationDate: Date }) {
    return this.accountPlanEntryService.annulAccountPlanEntry(data);
  }

  public async redistribuitioReinforcimentAccountPlanEntry(data: {
    destinationAccounts: {
      targetAccountPlanNumber: string,
      value: number
    }[],
    totalValue: number,
    type: string,
    motivo?: string,
    originAccountPlanNumber: string,
    operationDate: Date
  }) {
    return this.accountPlanEntryService.redistribuitioReinforcimentAccountPlanEntry(data);
  }


  public async redistributeAnnulmentAccountPlanEntry(data: { originAccountPlanNumber: string, value: number, targetAccountPlanNumber: string, operationDate: Date }) {
    return this.accountPlanEntryService.redistributeAnnulmentAccountPlanEntry(data);
  }

  /**------------------------------------------------------------------------*/
  /** Servicos de pesquisa de informacao relativa ao plano de contas */
  /**------------------------------------------------------------------------*/
  public async findAllAccountPlanYear() {
    return await AccountPlanYear.all();
  }

  public async findAccountPlanYearByYear(year: number) {
    const active = await this.accountPlanEntryService.resolveActivePlanYear(Number(year));
    return active;
  }

  public async findAllAccountPlanEntriesEntry(year: number) {
    const active = await this.accountPlanEntryService.resolveActivePlanYear(Number(year));
    return await AccountPlanEntryEntry.query()
      .whereHas('accountPlanYear', (builder) => {
        builder.where('year', active.year);
      })
      .preload('accountPlanYear')
      .preload('entry')
      .preload('targetEntrieEntry')
  }
  public async fetchAllAccountPlanEntriesInitial(year: number) {
    const active = await this.accountPlanEntryService.resolveActivePlanYear(Number(year));
    const query = AccountPlanEntryEntry.query()
      .where('type', EntryEntryType.INITIAL_ALLOCATION) // Filtra pelo tipo "Initial"
      .whereHas('accountPlanYear', (builder) => {
        builder.where('year', active.year); // Filtra pelo ano no relacionamento
      });

    // Imprime a consulta SQL nos logs
    console.log(query.toSQL().sql);

    // Executa a consulta
    return await query.exec();
  }


  public async findAllAccountPlanEntries(year: number) {
    const active = await this.accountPlanEntryService.resolveActivePlanYear(Number(year));
    return await AccountPlanEntry.query()
      .whereHas('accountPlanYear', (builder) => {
        builder.where('year', active.year);
      })
      .preload('accountPlan')
      .preload('accountPlanYear')
      .preload('accountPlanfinancial')
  }

  public async fetchAllAccountPlanEntries(year: number) {
    const active = await this.accountPlanEntryService.resolveActivePlanYear(Number(year));
    return await AccountPlanEntry.query()
      .whereHas('accountPlanYear', (builder) => {
        builder.where('year', active.year);
      })
      .preload('accountPlan')
      .preload('accountPlanYear')
      .preload('entriesEntry')
      .preload('accountPlanfinancial')
  }

  public async fetchAccountPlanEntriesByYearAndNumber(year: number, accountPlanNumber: number) {
    const active = await this.accountPlanEntryService.resolveActivePlanYear(Number(year));
    return await AccountPlanEntry.query()
      .whereHas('accountPlanYear', (builder) => {
        builder.where('year', active.year);
      }).whereHas('accountPlan', (builder) => {
        builder.where('number', accountPlanNumber);
      })
      .preload('accountPlan')
      .preload('accountPlanYear')
      .preload('accountPlanfinancial')
      .preload('entriesEntry')
  }

  public async fetchInitialAllocationsByParentId(year: number) {
    const active = await this.accountPlanEntryService.resolveActivePlanYear(Number(year));
    const query = AccountPlanEntryEntry.query()
      .select('account_plan_entries.parent_id')
      .sum('account_plan_entries_entry.allocation as total_allocation')  // Soma das alocações
      .join('account_plan_entries', 'account_plan_entries_entry.entry_id', '=', 'account_plan_entries.id')
      .join('account_plans', 'account_plan_entries.account_plan_id', '=', 'account_plans.id')
      .where('account_plan_entries_entry.type', EntryEntryType.INITIAL_ALLOCATION)  // Filtra por "INITIAL_ALLOCATION"
      .where('account_plan_entries_entry.account_plan_year_id', active.id)
      .where('account_plan_entries_entry.allocation', '!=', 0)  // Exclui alocações zero
      .where('account_plans.type', 'budject')  // Filtra por tipo "budject"
      .groupBy('account_plan_entries.parent_id')  // Agrupa por parent_id
      .orderBy('account_plan_entries.parent_id');  // Ordena por parent_id

    // Imprimir a consulta SQL no console
    console.log("Consulta SQL: ", query.toSQL());

    const allocations = await query;

    // Criando o array com base nos dados
    const resultArray = allocations.map(item => {
      return {
        parent_id: item.$extras.parent_id,
        total_allocation: item.$extras.total_allocation
      };
    });

    // Imprimir o array resultante
    console.log("Array de alocações: ", resultArray);

    return resultArray;
  }

  public async fetchSummationAccountEntriesEntry(year?: number) {
    const active = await this.accountPlanEntryService.resolveActivePlanYear(year);
    const query = AccountPlan.query()
      .select(
        'account_plans.number as account_number',
        'account_plan_entries_entry.type as entry_type'
      )
      .sum('account_plan_entries_entry.allocation as total_allocation')
      .join('account_plan_entries', 'account_plan_entries.account_plan_id', '=', 'account_plans.id')
      .join('account_plan_entries_entry', 'account_plan_entries.id', '=', 'account_plan_entries_entry.entry_id')
      .where('account_plan_entries.account_plan_year_id', active.id)
      .whereIn('account_plan_entries_entry.type', [
        'initial',
        'reinforcement',
        'annulment',
        'redistribuition_reinforcement',
        'redistribuition_annulment'
      ]) // Filtra pelos tipos desejados
      .groupBy('account_plans.number', 'account_plan_entries_entry.type')
      .havingRaw('SUM(account_plan_entries_entry.allocation) > 0')
      .orderBy('account_plans.number');

    const result = await query;

    const formattedResult = result.map(item => ({
      account_number: item.$extras.account_number,
      entry_type: item.$extras.entry_type,
      total_allocation: item.$extras.total_allocation,
    }));

    return formattedResult;
  }

  async clearSpecificInitialAllocation(id: number, year?: number) {
    const active = await this.accountPlanEntryService.resolveActivePlanYear(year);
    const query = AccountPlanEntry
      .query()
      .where('account_plan_id', id)
      .where('account_plan_year_id', active.id)
      .update({
        final_allocation: 0,
        initial_allocation: 0
      });

    await query;
  }

  async clearAllInitialAllocations(year?: number) {
    const trx = await db.transaction();
    try {
      const active = await this.accountPlanEntryService.resolveActivePlanYear(year);
      console.log("Iniciando limpeza total dos dados e conformidade do ano fiscal:", active.year);

      await AccountPlanEntryEntry
        .query({ client: trx })
        .where('account_plan_year_id', active.id)
        .update({ target_entrie_entry_id: null });

      await AccountPlanEntryEntry
        .query({ client: trx })
        .where('account_plan_year_id', active.id)
        .delete();

      await AccountPlanEntry
        .query({ client: trx })
        .where('account_plan_year_id', active.id)
        .update({
          final_allocation: 0,
          initial_allocation: 0,
          available_allocation: 0
        });

      await trx.commit();
      console.log("Limpeza total e remoção de conformidade concluída com sucesso para o exercício", active.year);
    } catch (error) {
      await trx.rollback();
      console.error("Erro ao limpar as alocações iniciais:", error);
      throw error;
    }
  }

  public async findAllFinancialAccountsAndAssociatedBudgets() {
    const financialAccountsWithAssociations = await AccountPlan.query()
      .whereExists(function (this: any) {
        this.from('financial_budget_associations')
          .whereRaw('financial_budget_associations.financial_account_id = account_plan.id')
      }.bind(AccountPlan.query()))

    const result = []

    for (const account of financialAccountsWithAssociations) {
      const associatedBudgets = await FinancialBudgetAssociations.query()
        .where('financial_account_id', account.id)
        .preload('budgetAccount')

      result.push({
        financialAccount: account,
        budgetAssociations: associatedBudgets
      })
    }

    return result
  }

  public async findConformInitialAllocation(year?: number) {
    const active = await this.accountPlanEntryService.resolveActivePlanYear(year);
    const entries = await AccountPlanEntryEntry
      .query()
      .where('type', 'initial_allocation')
      .where('account_plan_year_id', active.id)
      .where('complianceStatus', 'CONFORMANCE');

    return entries.length > 0;
  }

  public async validateInitialAllocationApprovalDate(year?: number) {
    try {
      const active = await this.accountPlanEntryService.resolveActivePlanYear(year);
      const totalInitialAllocation = await AccountPlanEntryEntry
        .query()
        .where('type', 'initial_allocation')
        .where('account_plan_year_id', active.id)
        .count('id as total');

      const totalWithApprovalDate = await AccountPlanEntryEntry
        .query()
        .where('account_plan_year_id', active.id)
        .whereNotNull('initial_allocation_approval_date')
        .count('id as total');

      const totalInitial = Number(totalInitialAllocation[0].$extras.total);
      const totalApproved = Number(totalWithApprovalDate[0].$extras.total);

      if (totalInitial > 0 && totalInitial === totalApproved) {
        const approvalDate = await AccountPlanEntryEntry
          .query()
          .select('initial_allocation_approval_date')
          .where('type', 'initial_allocation')
          .where('account_plan_year_id', active.id)
          .first();

        return { valid: true, approvalDate: approvalDate?.initialAllocationApprovalDate };
      } else {
        return { valid: false, approvalDate: null };
      }
    } catch (error) {
      throw new Error("Erro ao validar a data de aprovação da alocação inicial.");
    }
  }

  public async getFiscalYearsOverview() {
    const currentCalendarYear = new Date().getFullYear();
    const years = await AccountPlanYear.query()
      .where('year', 2026)
      .orderBy('year', 'desc');
    const overview = [];

    for (const y of years) {
      const entries = await AccountPlanEntry.query()
        .where('account_plan_year_id', y.id)
        .preload('accountPlan');

      let budgetInitialAllocation = 0;
      let budgetFinalAllocation = 0;
      let budgetAvailableBalance = 0;
      let financialFinalBalance = 0;
      let financialAvailableBalance = 0;

      for (const entry of entries) {
        const plan = entry.accountPlan;
        if (!plan) continue;
        const isLeaf = plan.writable === 'moviment';
        if (!isLeaf) continue;

        if (plan.type === 'budject') {
          budgetInitialAllocation += Number(entry.initialAllocation || 0);
          budgetFinalAllocation += Number(entry.finalAllocation || 0);
          budgetAvailableBalance += Number(entry.availableAllocation || 0);
        } else if (plan.type === 'financial') {
          financialFinalBalance += Number(entry.finalAllocation || 0);
          financialAvailableBalance += Number(entry.availableAllocation || 0);
        }
      }

      const conformedCountRes = await AccountPlanEntryEntry.query()
        .where('account_plan_year_id', y.id)
        .where('type', 'initial_allocation')
        .where('complianceStatus', 'CONFORMANCE')
        .count('id as total');
      const isConformed = Number(conformedCountRes?.[0]?.$extras?.total || 0) > 0;

      const movCountRes = await AccountPlanEntryEntry.query()
        .where('account_plan_year_id', y.id)
        .count('id as total');
      const movementsCount = Number(movCountRes?.[0]?.$extras?.total || 0);

      const reqCountRes = await InternalRequest.query()
        .where('accountPlanYearId', y.id)
        .count('id as total');
      const requestsCount = Number(reqCountRes?.[0]?.$extras?.total || 0);

      overview.push({
        id: y.id,
        year: y.year,
        description: (y.description || 'Exercício Económico 2026'),
        isLaunchYear: true,
        hasPreviousExercise: false,
        isActive: Number(y.state) === 2,
        state: y.state,
        totalAccounts: entries.length,
        budgetInitialAllocation: Number(budgetInitialAllocation.toFixed(2)),
        budgetFinalAllocation: Number(budgetFinalAllocation.toFixed(2)),
        budgetAvailableBalance: Number(budgetAvailableBalance.toFixed(2)),
        budgetExecutedAmount: Number(Math.max(0, budgetFinalAllocation - budgetAvailableBalance).toFixed(2)),
        financialFinalBalance: Number(financialFinalBalance.toFixed(2)),
        financialAvailableBalance: Number(financialAvailableBalance.toFixed(2)),
        isConformed,
        movementsCount,
        requestsCount,
      });
    }

    return overview;
  }

  public async setActiveFiscalYear(year: number, description?: string) {
    const targetYearNum = Number(year);
    if (!targetYearNum || targetYearNum < 2000 || targetYearNum > 2100) {
      throw new Error("Ano fiscal inválido.");
    }

    let planYear = await AccountPlanYear.findBy('year', targetYearNum);
    if (!planYear) {
      planYear = await AccountPlanYear.create({
        year: targetYearNum,
        description: description || `Exercício Económico e Plano Orçamental ${targetYearNum}`,
        state: 2,
      });
    }

    await this.accountPlanEntryService.ensureYearStructureInitialized(planYear);

    await AccountPlanYear.query().where('year', '!=', targetYearNum).update({ state: 1 });
    await AccountPlanYear.query().where('year', targetYearNum).update({
      state: 2,
      ...(description ? { description } : {}),
    });

    return {
      activeYear: targetYearNum,
      accountPlanYearId: planYear.id,
      description: planYear.description,
    };
  }

  public async transitionOrResetFiscalYear(data: {
    targetYear: number;
    sourceYear?: number;
    mode: 'CARRY_AVAILABLE_BALANCE' | 'CARRY_FINAL_ALLOCATION' | 'CARRY_INITIAL_ALLOCATION' | 'RESET_ZERO';
    scope?: 'BOTH' | 'BUDGET_ONLY' | 'FINANCIAL_ONLY';
    setAsActive?: boolean;
    observation?: string;
  }) {
    const targetYearNum = Number(data.targetYear);
    const sourceYearNum = Number(data.sourceYear || (targetYearNum - 1));
    const mode = data.mode || 'CARRY_AVAILABLE_BALANCE';
    const scope = data.scope || 'BOTH';
    const setAsActive = data.setAsActive !== undefined ? Boolean(data.setAsActive) : true;

    if (!targetYearNum || targetYearNum < 2025) {
      throw new Error("O ano fiscal mínimo suportado pelo sistema é 2025 (ano de lançamento).");
    }

    if (targetYearNum === 2025 && mode !== 'RESET_ZERO') {
      throw new Error("O exercício económico de 2025 é o ano de lançamento da aplicação e não possui exercício anterior para transporte de saldos.");
    }

    const trx = await db.transaction();
    try {
      let targetPlanYear = await AccountPlanYear.query({ client: trx }).where('year', targetYearNum).first();
      if (!targetPlanYear) {
        targetPlanYear = new AccountPlanYear();
        targetPlanYear.fill({
          year: targetYearNum,
          description: `Exercício Económico e Plano Orçamental ${targetYearNum}`,
          state: setAsActive ? 2 : 1,
        });
        await targetPlanYear.useTransaction(trx).save();
      }

      await this.accountPlanEntryService.ensureYearStructureInitialized(targetPlanYear, trx);

      let sourceEntriesMap = new Map<number, AccountPlanEntry>();
      if (mode !== 'RESET_ZERO') {
        const sourcePlanYear = await AccountPlanYear.query({ client: trx }).where('year', sourceYearNum).first();
        if (!sourcePlanYear) {
          throw new Error(`O exercício fiscal de origem (${sourceYearNum}) não foi encontrado.`);
        }
        const sourceEntries = await AccountPlanEntry.query({ client: trx })
          .where('account_plan_year_id', sourcePlanYear.id)
          .preload('accountPlan');
        for (const se of sourceEntries) {
          sourceEntriesMap.set(se.accountPlanId, se);
        }
      }

      // Limpar lançamentos de dotação/movimentos anteriores no ano de destino
      await AccountPlanEntryEntry.query({ client: trx })
        .where('account_plan_year_id', targetPlanYear.id)
        .delete();

      const targetEntries = await AccountPlanEntry.query({ client: trx })
        .where('account_plan_year_id', targetPlanYear.id)
        .preload('accountPlan');

      const childrenSet = new Set<number>();
      for (const te of targetEntries) {
        if (te.parentId) {
          childrenSet.add(te.parentId);
        }
      }

      const operationDate = DateTime.local(targetYearNum, 1, 1);
      let accountsUpdated = 0;
      let totalCarriedBudget = 0;
      let totalCarriedFinancial = 0;

      for (const targetEntry of targetEntries) {
        const plan = targetEntry.accountPlan;
        const isParent = childrenSet.has(targetEntry.id) || (plan && plan.writable === 'controll');

        if (isParent) {
          targetEntry.initialAllocation = 0;
          targetEntry.finalAllocation = 0;
          targetEntry.availableAllocation = 0;
          await targetEntry.useTransaction(trx).save();
          continue;
        }

        const isBudget = plan?.type === 'budject';
        const isFinancial = plan?.type === 'financial';

        const inScope =
          scope === 'BOTH' ||
          (scope === 'BUDGET_ONLY' && isBudget) ||
          (scope === 'FINANCIAL_ONLY' && isFinancial);

        let newAmount = 0;
        if (mode !== 'RESET_ZERO' && inScope) {
          const sourceEntry = sourceEntriesMap.get(targetEntry.accountPlanId);
          if (sourceEntry) {
            if (mode === 'CARRY_AVAILABLE_BALANCE') {
              const avail = Number(sourceEntry.availableAllocation || 0);
              const finalVal = Number(sourceEntry.finalAllocation || 0);
              // Para contas financeiras onde available_allocation não foi movimentado mas final_allocation tem saldo
              newAmount = avail > 0 ? avail : (isFinancial && finalVal > 0 ? finalVal : 0);
            } else if (mode === 'CARRY_FINAL_ALLOCATION') {
              newAmount = Number(sourceEntry.finalAllocation || 0);
            } else if (mode === 'CARRY_INITIAL_ALLOCATION') {
              newAmount = Number(sourceEntry.initialAllocation || 0);
            }
          }
        }

        newAmount = Number(Math.max(0, newAmount).toFixed(2));
        targetEntry.initialAllocation = newAmount;
        targetEntry.finalAllocation = newAmount;
        targetEntry.availableAllocation = newAmount;
        await targetEntry.useTransaction(trx).save();

        if (newAmount > 0) {
          accountsUpdated += 1;
          if (isBudget) totalCarriedBudget += newAmount;
          if (isFinancial) totalCarriedFinancial += newAmount;

          const entryEntry = new AccountPlanEntryEntry();
          entryEntry.fill({
            type: EntryEntryType.INITIAL_ALLOCATION,
            operator: OperatorType.CREDTI,
            postingMonth: 1,
            operationDate,
            allocation: newAmount,
            lastFinalAllocation: 0,
            entryId: targetEntry.id,
            accountPlanYearId: targetPlanYear.id,
            complianceStatus: 'Pending_conformaconce',
            descriptionMoviment:
              data.observation ||
              `Abertura do Exercício ${targetYearNum} (${mode === 'CARRY_AVAILABLE_BALANCE' ? `Transporte de Saldo Disponível de ${sourceYearNum}` : mode === 'CARRY_FINAL_ALLOCATION' ? `Transporte de Dotação Final de ${sourceYearNum}` : `Transporte de Dotação Inicial de ${sourceYearNum}`})`,
          });
          await entryEntry.useTransaction(trx).save();
        }
      }

      // Recalcular hierarquia de contas de controlo (classes e grupos pais)
      await this.accountPlanEntryService.recalculateParentEntriesForYear(targetPlanYear.id, trx);

      if (setAsActive) {
        await AccountPlanYear.query({ client: trx }).where('year', '!=', targetYearNum).update({ state: 1 });
        await AccountPlanYear.query({ client: trx }).where('year', targetYearNum).update({ state: 2 });
      }

      await trx.commit();

      return {
        success: true,
        targetYear: targetYearNum,
        sourceYear: mode === 'RESET_ZERO' ? null : sourceYearNum,
        mode,
        scope,
        accountsUpdated,
        totalCarriedBudget: Number(totalCarriedBudget.toFixed(2)),
        totalCarriedFinancial: Number(totalCarriedFinancial.toFixed(2)),
      };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  public async compareFiscalYears(sourceYear: number, targetYear: number) {
    const sourcePlanYear = await this.accountPlanEntryService.resolveActivePlanYear(Number(sourceYear));
    const targetPlanYear = await this.accountPlanEntryService.resolveActivePlanYear(Number(targetYear));

    const sourceEntries = await AccountPlanEntry.query()
      .where('account_plan_year_id', sourcePlanYear.id)
      .preload('accountPlan');

    const targetEntries = await AccountPlanEntry.query()
      .where('account_plan_year_id', targetPlanYear.id)
      .preload('accountPlan');

    const sourceMap = new Map<number, AccountPlanEntry>();
    for (const se of sourceEntries) {
      sourceMap.set(se.accountPlanId, se);
    }

    const comparison = [];
    for (const te of targetEntries) {
      const plan = te.accountPlan;
      if (!plan) continue;
      const se = sourceMap.get(te.accountPlanId);

      const sourceInitial = Number(se?.initialAllocation || 0);
      const sourceFinal = Number(se?.finalAllocation || 0);
      const sourceAvailable = Number(se?.availableAllocation || 0);
      const sourceExecuted = Number(Math.max(0, sourceFinal - sourceAvailable).toFixed(2));

      const targetInitial = Number(te.initialAllocation || 0);
      const targetFinal = Number(te.finalAllocation || 0);
      const targetAvailable = Number(te.availableAllocation || 0);

      comparison.push({
        accountPlanId: plan.id,
        number: plan.number,
        description: plan.description,
        type: plan.type,
        writable: plan.writable,
        class: plan.class,
        sourceInitial,
        sourceFinal,
        sourceAvailable,
        sourceExecuted,
        targetInitial,
        targetFinal,
        targetAvailable,
        deltaInitialVsFinal: Number((targetInitial - sourceFinal).toFixed(2)),
        deltaInitialVsAvailable: Number((targetInitial - sourceAvailable).toFixed(2)),
      });
    }

    return {
      sourceYear: sourcePlanYear.year,
      targetYear: targetPlanYear.year,
      accounts: comparison,
    };
  }


  public async fetchAllAccountPlanEntriesByfilters(
    year: number,
    filters: { startDate?: string | null; endDate?: string | null; accountPlanId?: string | null }
  ) {
    const active = await this.accountPlanEntryService.resolveActivePlanYear(Number(year));
    const now = DateTime.now();
  
    // Cria a query base com os relacionamentos
    const query = AccountPlanEntry.query()
      .whereHas('accountPlanYear', (builder) => {
        builder.where('year', active.year);
      })
      .preload('accountPlan')
      .preload('accountPlanYear')
      .preload('entriesEntry')
      .preload('accountPlanfinancial');
  
    // Aplica filtro de accountPlanId se existir
    if (filters.accountPlanId) {
      query.where('account_plan_id', filters.accountPlanId);
    }
  
    // Formata datas para considerar apenas YYYY-MM-DD
    const formatDateOnly = (dateTime: DateTime) => {
      return dateTime.toFormat('yyyy-MM-dd');
    };
  
    // Aplica filtro de data de início se existir
    if (filters.startDate) {
      const startDate = DateTime.fromISO(filters.startDate);
      if (startDate.isValid) {
        query.whereRaw('DATE(COALESCE(created_at, updated_at)) >= ?', [formatDateOnly(startDate)]);
      }
    } else {
      // Data padrão: início do mês atual
      query.whereRaw('DATE(COALESCE(created_at, updated_at)) >= ?', [formatDateOnly(now.startOf('month'))]);
    }
  
    // Aplica filtro de data de fim se existir
    if (filters.endDate) {
      const endDate = DateTime.fromISO(filters.endDate);
      if (endDate.isValid) {
        query.whereRaw('DATE(COALESCE(created_at, updated_at)) <= ?', [formatDateOnly(endDate)]);
      }
    } else {
      // Data padrão: fim do mês atual
      query.whereRaw('DATE(COALESCE(created_at, updated_at)) <= ?', [formatDateOnly(now.endOf('month'))]);
    }
  
    // Debug opcional da query
    console.debug(query.toQuery());
  
    return await query;
  }
  
}