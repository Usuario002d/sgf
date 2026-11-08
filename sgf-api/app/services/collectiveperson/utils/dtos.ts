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


export interface ProviderDTO extends DomainDTO {
  nuit: string
  nib: string
  name: string
  description: string
  accountPlanFinancialNumber: string;
}

export interface BankDTO extends DomainDTO {
  nuit: string
  nib: string
  name: string
  description: string
  accountPlanFinancialNumber: string;
}