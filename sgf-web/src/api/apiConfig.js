import config from '../../src/config/apiConfig.js'; 

const BASE_URL = `${config.BASE_URL}/sgf-api/planbudject`;

const BASE_URL_REQUISITION =  `${config.BASE_URL}/sgf-api`;

export const API_ENDPOINTS = {
  CREATE_ACCOUNT_PLAN: `${BASE_URL}/accountplan/createAccountPlan`,

  REGISTER_REQUISITION: `${BASE_URL_REQUISITION}/internalrequest/createInternalRequest`,

  FINDALL_ACCOUNT_PLAN: `${BASE_URL}/accountplan/findAllActiveAccountPlan`,

  CREATE_ACCOUNT_PLAN_ENTRY: `${BASE_URL}/createAccountPlanBudjectEntry`,

  REFORCE_ACCOUNT_PLAN_BUDJECT_ENTRY: `${BASE_URL}/reinforceAccountPlanEntry`,

  ANNULLMENT_REQUEST_ENTRY:  `${BASE_URL}/annullmentRequest`,

  ANULL_ACCOUNT_PLAN_BUDJECT_ENTRY: `${BASE_URL}/annulAccountPlanEntry`,

  REDISTRIBUITION_ACCOUNT_PLAN_BUDJECT_ENTRY: `${BASE_URL}/redistribuitioReinforcimentAccountPlanEntry`,

  CREATE_BUDJECT_ENTRY: `${BASE_URL}/initialAllocationAccountPlanEntry`,

  CORRECT_ACCOUNT_PLAN: `${BASE_URL}/correctAccountPlanEntryValueHandler`,

  UPDATE_ACCOUNT_PLAN:  `${BASE_URL}/accountplan/updateAccountPlan`,

  REMOVE_ACCOUNT_PLAN:  `${BASE_URL}/accountplan/removeAccountPlan`,
  
  ASSOSIATE_ACCOUNT: `${BASE_URL}/associateFinancialAccountWithBujectAccounts`,

  UPDATE_CONFORMANCE: `${BASE_URL_REQUISITION}/internalrequest/updateInternalRequestStatus`,

  REGISTER_OPEN: `${BASE_URL_REQUISITION}/accounting/openAccountingJournal`,

  BANK_IN_ACCOUNTING_JOURNAL: `${BASE_URL_REQUISITION}/accounting/bankInAccountingJournal`,

  BILL_TO_PAY_ACCOUNTING_JOURNAL: `${BASE_URL_REQUISITION}/accounting/billToPayAccountingJournal`,

  BILL_TO_RECEIVE_ACCOUTING_JOURNAL: `${BASE_URL_REQUISITION}/accounting/billToReceiveAccountingJournal`,

  BANK_OUT_ACCOUTING_JOURNAL: `${BASE_URL_REQUISITION}/accounting/bankOutAccountingJournal`,

  ACCOUNT_BUDJECT_CONFORMANCE: `${BASE_URL}/conformInitialAllocation`,

  ACCOUNT_BUDJECT_CONFORMANCE_MOVMENT: `${BASE_URL}/conformanceMovimentBudject`,

  REGULARIZATION_ACCOUTING_JOURNAL: `${BASE_URL_REQUISITION}/accounting/regulationAccountingJournal`,

  CREATE_USER: `${BASE_URL_REQUISITION}/user/createUser`,

  CREATE_PAYMENT_RECONCILIATION: `${BASE_URL}/reconciled-payments`,


  // Adicione outros endpoints aqui
};
