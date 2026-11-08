import { OperatorType } from "../../../models/utility/Enums.js";

/*
* Interfaces que representam todos 'DTO' do modulo plano e orcamento'
* Estes DTO provem das requests Externas para a API
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
interface DomainDTO {
  id: number | undefined;
  createtBy: number | undefined;
  updatedBy: number | null | undefined;
  createdAt: Date | undefined;
  updatedAt: Date | null | undefined;
}

export interface AccountingJournalDTO extends DomainDTO {
  journalNumber: number
  description: string
}

export interface AccountingDocumentlDTO extends DomainDTO {
  documentNumber: number
  description: string
}

export interface AccountingJounalItemDTO extends DomainDTO {
  operationDate: Date,
  operator: OperatorType,
  value: number,
  description: string,
  accountPlanNumber: string,
  accountPlanId: number | undefined,
  accountPlanYearId: number | undefined,
  entryId: number | undefined,
}

export interface AccountingJounalItemOrcamentoDTO extends DomainDTO {
  account: number,
  description: string,
  debit: number | undefined,
}

export interface AccountingJounalEntryDTO extends DomainDTO {
  operationDate: Date,
  accountPlanYearId: number | undefined,
  accountingJournalNumber: string,
  accountingJournalId: number | undefined,
  accountingDocumentNumber: string,
  accountingDocumentId: number | undefined,
  internalRequestNumber: string | undefined,
  internalRequestId: number | undefined,
  journalDocumentNumber: string,
  paid: boolean,
  conformance: 'PENDING_CONFORMANCE' | 'WITHOUT_CONFORMANCE' | 'CONFORMED',
  items: AccountingJounalItemDTO[],
  receivable: boolean,
  transactionType: string,
  tableDataBudject: AccountingJounalItemOrcamentoDTO[],
  is_parcial: boolean,
  payment_type: string,
  remaining_balance: number
}

export enum operatorType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}