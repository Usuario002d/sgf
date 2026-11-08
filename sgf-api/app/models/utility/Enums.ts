
/*
* Enums usados no sistemas
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/

//Tipo de menu
export enum MenuType {
  ROOT = 'root',
  SUBMENU = 'sub_menu',
  ITEM = 'item',
}

//Ciclo de vida das entidades
export enum LifeclicleState {
  INACTIVE = 0,
  ACTIVE = 1,
  DELETED = 2,
}

//Operador de uma operacao financeiro/contabilistica
export enum OperatorType {
  DEBIT = 'DEBIT',
  CREDTI = 'CREDIT',
}

//Diz se uma conta e de controle ou movimento
export enum AccountPlanTypeWritableType {
  MOVIMENT = 'moviment',
  CONTROLL = 'controll',
}

//Representa o tipo de plano de contas
export enum AccoutPlanType {
  BUDJECT = 'budject',
  FINANCIAL = 'financial',
}

//Classe de planos de conta
export enum AccoutPlanClassType {
  A = 'A', //'X.0.0.0.00'
  B = 'B', //'X.X.0.0.00'
  C = 'C', //'X.X.X.0.00'
  D = 'D', //'X.X.X.X.00'
  E = 'E', //'X.X.X.X.XX'
}

/*
*Tipo de lancamento no plano de contas: Inicial, reforco, anulacao, redistribuicao
*/
export enum EntryEntryType {
  INITIAL = 'initial',
  INITIAL_ALLOCATION = 'initial_allocation',
  REINFORCEMENT = 'reinforcement',
  ANNULMENT = 'annulment',
  REDISTRIBUITION_REINFORCEMENT = 'redistribuition_reinforcement',
  REDISTRIBUITION_ANNULMENT = 'redistribuition_annulment',

  //Operacoes de lancamentos
  ENTRY_OPENING = 'entry_opening',
  ENTRY_BILLS_TO_RECEIVER = 'entry_bills_to_receiver',
  ENTRY_BILLS_TO_PAY = 'entry_bills_to_pay',
  ENTRY_BANK_IN = 'entry_bank_in',
  ENTRY_BANK_OUT = 'entry_bank_out',
  ENTRY_REGULARIZATION = 'entry_regularization',
  REDISTRIBUTION_REINFORCEMENT = "REDISTRIBUTION_REINFORCEMENT",
}

export enum FinancialEntryEntryType {
  //Operacoes de lancamentos
  ENTRY_OPENING = 'opening',
  ENTRY_RECEIVER = 'receiver',
  ENTRY_ENTRIES = 'in',
  ENTRY_OUT = 'out',
  ENTRY_REGULARIZATION = 'regularization',
}

//Representa a quantificao de um item, ou seja grandeza para medir a quantidade
export enum QuantificationType {
  KG = 'KG',
  L = 'L',
  BOX = 'CAIXA',
}