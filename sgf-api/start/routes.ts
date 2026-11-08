/*
|--------------------------------------------------------------------------
| Routes file (SGF Enterprise API)
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { AuthController } from '../app/controllers/security/auth_controller.js';
import AccountPlansController from '../app/controllers/planbudject/account_plans_controller.js';
import AccountPlanBudjectsController from '../app/controllers/planbudject/account_plan_budjects_controller.js';
import InternalRequestController from '../app/controllers/request/internal_request_controller.js';
import CollectivePersonController from '../app/controllers/collectiveperson/collective_person_controller.js';
import AccountingJournalController from '../app/controllers/accounting/accounting_journal_controller.js';
import DiariesController from '#controllers/diaries/diariesController';
import DocumentController from '#controllers/document/documentController';
import UsersController from '#controllers/security/users_controller';
import MenuController from '#controllers/security/menu_controller';
import DashBoardController from '#controllers/security/dashboard_controller';
import ReconciliationsController from '#controllers/planbudject/ReconciliationsController';


router.group(() => {
  /*------------------------------------------------------------------------------------------*/
  /** Modulo de segurança **/
  /*------------------------------------------------------------------------------------------*/
  router.group(() => {
    router.group(() => {
      router.post('login', [AuthController, 'login']);
      router.post('logout', [AuthController, 'logout']).use(middleware.auth());
      router.post('isAuthenticated', [AuthController, 'isAuthenticated']);
      //  router.post('resetPassword', [AuthController, 'resetPassword']).use(middleware.auth());
    }).prefix("auth");
  }).prefix("security");
  /*------------------------------------------------------------------------------------------*/
  /** Modulo de plano e orçamento **/
  /*------------------------------------------------------------------------------------------*/
  router.group(() => {
    //Plano de contas
    router.group(() => {
      router.get('findAllAccountPlan', [AccountPlansController, 'findAllAccountPlan']);
      router.get('findAnyAccountPlan', [AccountPlansController, 'findAnyAccountPlan']);
      router.get('findAccountPlanByNumber/:number', [AccountPlansController, 'findAccountPlanByNumber']);
      router.get('findAnyAccountPlanByNumber', [AccountPlansController, 'findAnyAccountPlanByNumber']);
      router.post('createAccountPlan', [AccountPlansController, 'createAccountPlan']);
      router.post('removeAccountPlan', [AccountPlansController, 'removeAccountPlan']);
      router.post('updateAccountPlan', [AccountPlansController, 'updateAccountPlan']);
    }).prefix("accountplan");

    //Trazer diarios
    router.get('findAllDiaries', [DiariesController, 'findAllDiaries']);
    router.get('findAllDocuments', [DocumentController, 'findAllDiariesWithDocuments']);

    //Ano contabilistico especifico
    router.post('createAccountPlanYear', [AccountPlanBudjectsController, 'createAccountPlanYear']);
    router.post('findAllAccountPlanYear', [AccountPlanBudjectsController, 'findAllAccountPlanYear']);
    router.get('findAllAccountPlanYear', [AccountPlanBudjectsController, 'findAllAccountPlanYear']);
    router.post('findAccountPlanYearByYear/:year', [AccountPlanBudjectsController, 'findAccountPlanYearByYear']);
    router.get('fiscalYearsOverview', [AccountPlanBudjectsController, 'fiscalYearsOverview']);
    router.post('setActiveFiscalYear', [AccountPlanBudjectsController, 'setActiveFiscalYear']);
    router.post('transitionFiscalYear', [AccountPlanBudjectsController, 'transitionFiscalYear']);
    router.get('compareFiscalYears/:sourceYear/:targetYear', [AccountPlanBudjectsController, 'compareFiscalYears']);
    router.get('fetchFinancialAccountWithAssociations', [AccountPlanBudjectsController, 'fetchAllFinancialAccountsAndAssociations']);
    router.post('clearInitialAllocation', [AccountPlanBudjectsController, 'clearInitialAllocation']);
    router.post('importInitialAllocationsFromExcel', [AccountPlanBudjectsController, 'importInitialAllocationsFromExcel']);

    // Entradas/Saldos do plano do ano especifico - dotação
    router.post('findAccountPlanEntriesByYear/:year', [AccountPlanBudjectsController, 'findAccountPlanEntriesByYear']);
    router.post('fetchAccountPlanEntriesByYear/:year', [AccountPlanBudjectsController, 'fetchAccountPlanEntriesByYear']);
    router.post('fetchAccountPlanEntriesByYearInitial/:year', [AccountPlanBudjectsController, 'fetchAccountPlanEntriesByYearInitial']);
    router.post('fetchInitialAllocationsByParentId/:year', [AccountPlanBudjectsController, 'fetchInitialAllocationsByParentId']);
    router.post('fetchAccountPlanEntriesByYearAndNumber/:year/:accountPlanNumber', [AccountPlanBudjectsController, 'fetchAccountPlanEntriesByYearAndNumber']);

    router.get('fetchSummationAccountEntriesEntry', [AccountPlanBudjectsController, 'fetchSummationAccountEntriesEntry']);
    router.post('fetchAccountPlanEntriesByYearByfilters/:year', [AccountPlanBudjectsController, 'fetchAccountPlanEntriesByYearByfilters']);


    //Criacao do saldo do plano de contas [Ver com Cipriano por que estamos a disponibilizar este serviço??
    // pois criamos os saldos somente na criacao do plano de contas]
    router.post('createAccountPlanEntry', [AccountPlanBudjectsController, 'createAccountPlanEntry']);
    router.post('conformInitialAllocation', [AccountPlanBudjectsController, 'conformInitialAllocation']);


    router.get('findConformInitialAllocation', [AccountPlanBudjectsController, 'findConformInitialAllocation']);


    // Actualização a dotação do plano de contas (reforço, anulação, redistribuição reforço, redistribuição anulação)
    router.post('initialAllocationAccountPlanEntry', [AccountPlanBudjectsController, 'initialAllocationAccountPlanEntry']);
    router.post('reinforceAccountPlanEntry', [AccountPlanBudjectsController, 'reinforceAccountPlanEntry']);
    router.post('annulAccountPlanEntry', [AccountPlanBudjectsController, 'annulAccountPlanEntry']);
    router.post('redistribuitioReinforcimentAccountPlanEntry', [AccountPlanBudjectsController, 'redistribuitioReinforcimentAccountPlanEntry']);
    router.post('redistributeAnnulmentAccountPlanEntry', [AccountPlanBudjectsController, 'redistributeAnnulmentAccountPlanEntry']);
    router.post('associateFinancialAccountWithBujectAccounts', [AccountPlanBudjectsController, 'associateFinancialAccountWithBujectAccounts']);
    router.post('annullmentRequest', [AccountPlanBudjectsController, 'annullmentRequest']);
    router.post('correctAccountPlanEntryValueHandler', [AccountPlanBudjectsController, 'correctAccountPlanEntryValueHandler']);
    router.post('updateInitialAllocationApprovalDate', [AccountPlanBudjectsController, 'updateInitialAllocationApprovalDate']);

    router.get('validateInitialAllocationApprovalDate', [AccountPlanBudjectsController, 'validateInitialAllocationApprovalDate']);

    router.post('/reconciled-payments', [ReconciliationsController,'store']);

    
  }).prefix("planbudject");

  //Plano de contas
  router.group(() => {
    router.get('findAllInternalRequest', [InternalRequestController, 'findAllInternalRequest']);
    router.get('feacthAllInternalRequest', [InternalRequestController, 'feacthAllInternalRequest']);
    router.get('fetchAllInternalRequest', [InternalRequestController, 'fetchAllInternalRequest']);
    router.get('fetchAllInternalRequestValid', [InternalRequestController, 'fetchAllInternalRequestValid']);
    router.get('findInternalRequestByRequestNumber', [InternalRequestController, 'findInternalRequestByRequestNumber']);
    router.post('createInternalRequest', [InternalRequestController, 'createInternalRequest']);
    router.post('updateInternalRequestStatus', [InternalRequestController, 'updateInternalRequestStatus']);
    router.get('dashboardAvailableRequests', [InternalRequestController, 'dashboardAvailableRequests']);
    router.get('dashboardBudjectExecution', [InternalRequestController, 'dashboardBudjectExecution']);
    router.get('dashboardAccountToPayAndReceive', [InternalRequestController, 'dashboardAccountToPayAndReceive']);

    router.get('financial-entries', [InternalRequestController, 'getFinancialEntries']);

  }).prefix("internalrequest"); 


  router.group(() => {
    //Provedores
    router.group(() => {
      router.get('findAllProviders', [CollectivePersonController, 'findAllProviders']);
      router.get('findProviderByAccountFinancialNumber/:accountFinancialNumber', [CollectivePersonController, 'findProviderByAccountFinancialNumber']);
      router.post('createProvider', [CollectivePersonController, 'createProvider']);
    }).prefix("providers");

     //Bancos
     router.group(() => {
      router.get('findAllBanks', [CollectivePersonController, 'findAllBanks']);
      router.get('findBankByAccountFinancialNumber/:accountFinancialNumber', [CollectivePersonController, 'findBankByAccountFinancialNumber']);
      router.post('createBank', [CollectivePersonController, 'createBank']);
    }).prefix("banks");

  }).prefix("collectiveperson");

  router.group(() => {
    //Lancamentos
    router.get('fetchAllAccountingJournalEntry', [AccountingJournalController, 'fetchAllAccountingJournalEntry']);
    router.get('fetchAllAccountingJournal', [AccountingJournalController, 'fetchAllAccountingJournal']);
    router.get('fetchAllAccountingJournalByJournalNumber/:number', [AccountingJournalController, 'fetchAllAccountingJournalByJournalNumber']);

    router.get('fetchAllAccountingJournalEntryItems', [AccountingJournalController, 'fetchAllAccountingJournalEntryItems']);

    router.get('fetchAllAccountingJournalEntryItemsByFilters', [AccountingJournalController, 'fetchAllAccountingJournalEntryItemsByFilters']);
    router.get('fetchAllBalanceteByFilters', [AccountingJournalController, 'fetchAllBalanceteByFilters']);
    router.get('fetchGeneralFolioAccountByFilter', [AccountingJournalController, 'fetchGeneralFolioAccountByFilter']);
    router.get('fetchGeneralFolioAccountByYearAndMonth', [AccountingJournalController, 'fetchGeneralFolioAccountByYearAndMonth']);

    router.post('openAccountingJournal', [AccountingJournalController, 'openAccountingJournal']);
    router.post('bankInAccountingJournal', [AccountingJournalController, 'bankInAccountingJournal']);
    router.post('billToPayAccountingJournal', [AccountingJournalController, 'billToPayAccountingJournal']);
    router.post('billToReceiveAccountingJournal', [AccountingJournalController, 'billToReceiveAccountingJournal']);
    router.post('bankOutAccountingJournal', [AccountingJournalController, 'bankOutAccountingJournal']);
    router.post('regulationAccountingJournal', [AccountingJournalController, 'regulationAccountingJournal']);

  }).prefix("accounting");


  /*------------------------------------------------------------------------------------------*/
  /** Outros modulos  **/
  /*------------------------------------------------------------------------------------------*/
  router.get('/about', async () => {
    return 'This is the about page'
  })

  router.group(() => {
    router.post('createUser', [UsersController, 'createUser']);
    router.post('updateUser', [UsersController, 'updateUser']);
    router.get('getUser', [UsersController, 'getUser']);
  }).prefix("user");


  // Rota para buscar menus filtrados por permissões do usuário
  router.get('menus', [MenuController, 'getMenus']);
  // Rota para buscar todos os menus (sem filtragem)
  router.get('menus/all', [MenuController, 'getAllMenus']);

  router.get('dashboardData', [DashBoardController, 'dashboardData']);
  router.get('dashboardDataSecondSection', [DashBoardController, 'dashboardDataSecondSection']);
  router.get('dashboardBudject', [DashBoardController, 'dashboardBudject']);

  


}).prefix("sgf-api");