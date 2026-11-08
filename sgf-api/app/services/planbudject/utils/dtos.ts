import { AccountPlanTypeWritableType, AccoutPlanType, AccoutPlanClassType } from "../../../models/utility/Enums.js";

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

export interface AccountPlanDTO extends DomainDTO {
  number: string;
  description: string;
  writable: AccountPlanTypeWritableType;
  type: AccoutPlanType;
  class: AccoutPlanClassType;
  parentId: number | null | undefined
  parentAccountPlanNumber: string
  accountPlanfinancialId: number | null | undefined
  accountPlanfinancialNumber: string
}

export interface AccountPlanYearDTO extends DomainDTO {
  year: number;
  description: string;
}

export interface AccountPlanEntryDTO extends DomainDTO {
  accountPlanNumber: string,
  startPostingMonth: number,
  endPostingMonth: number,
  reservePercent: number | undefined,
  initialAllocation: number,
  finalAllocation: number | undefined,
  accountPlanYearId: number | undefined
  accountPlanId: number | undefined,
  parentId: number | undefined,
  parentAccountPlanNumber: string,
  operationDate: Date,
  requestNumber: number
}