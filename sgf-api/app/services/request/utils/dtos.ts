import { QuantificationType } from "../../../models/utility/Enums.js";

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

export interface InternalRequestItemDTO extends DomainDTO {
  quantification: QuantificationType
  quantity: number
  description: string
  operationDate: Date
  unitPrice: number
  internalRequestId: number | undefined
  internalRequestNumber: string
  orcamento: string,
  importancia: number,
  beneficiaryName:number
  financiamentoView: number,
  saldoExistente: number,
  availableAllocation: number
}

export interface InternalRequestDTO extends DomainDTO {
  requestNumber: string | undefined;
  requestorName: string
  requestorDepartment: string
  operationDate: Date
  initialAvailabilityAccountBuject: number | undefined;
  currentAccountBudjectBalance: number | undefined;
  finalAccountBujectBalance: number | undefined;
  totalRequestedValue: number | undefined;
  justification: string
  sectorBudject: string  //verba do sector
  chapterBudject: string  //capitulo da verba
  clauseBudject: string  //artigo da verba
  clauseNumberBudject: string  //numero do artigo da verba
  provideCode: string
  accountPlanBudjectNumber: string
  accountPlanFinancialNumber: string
  accountPlanFinancialAssociation: string
  items: InternalRequestItemDTO[]
  bank: string
  paid: boolean,
  documentNumber:string,
  document: string,
  transactionType: 'UNIQUE_BENEFICIARY' | 'MULTIPLE_BENEFICIARIES'
  conformance: 'PENDING_CONFORMANCE' | 'WITHOUT_CONFORMANCE' | 'CONFORMED',
}