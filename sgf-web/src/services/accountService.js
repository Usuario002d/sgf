import { createAccountPlan,saveBankReconciliation, annullmentRequest, setConformInitialAllocation, setConformanceMovimentBudject, setBankInAccountingJournal, setBillToPayAccountingJournal, setBillToReceiveAccountingJournal, setBankOutAccountingJournal, setRegulationAccountingJournal, setOpenAccount, callUpdateAccountAPI, deleteAccountAPI, associateFinancialAccountWithBujectAccounts, setRequisitionCreate, saveMoviment, saveReductionAccount, saveredistribuition, createAccountPlanBudjectEntry, setAccountPlanEntry, setCreateUser } from '../api/accountApi';
import config from '../../src/config/apiConfig.js';
import { BASE_URL } from '../config/apiConfig';
import axios from 'axios';


import { fetchAccounts } from '../api/accountApi';

export const MIN_FISCAL_YEAR = 2026;

export const getActiveFiscalYear = () => {
  return 2026;
};

export const setActiveFiscalYearLocal = (year) => {
  localStorage.setItem('selectedFiscalYear', '2026');
  window.dispatchEvent(new CustomEvent('sgf-fiscal-year-changed', { detail: { year: 2026 } }));
};

export const fetchFiscalYearsOverview = async () => {
  try {
    const response = await fetch(`${BASE_URL}/sgf-api/planbudject/fiscalYearsOverview`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Erro ao carregar exercícios fiscais');
    const json = await response.json();
    return json?.value || json || [];
  } catch (error) {
    console.error('Erro ao buscar exercícios fiscais:', error);
    return [];
  }
};

export const syncActiveFiscalYearWithBackend = async (year, description) => {
  const parsedYear = Number(year);
  setActiveFiscalYearLocal(parsedYear);
  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/setActiveFiscalYear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ year: parsedYear, description }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Erro ao activar o exercício fiscal');
  }
  return await response.json();
};

export const transitionOrResetFiscalYear = async (payload) => {
  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/transitionFiscalYear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Erro ao processar transição/reset do exercício fiscal');
  }
  return await response.json();
};

export const fetchFiscalYearComparison = async (sourceYear, targetYear) => {
  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/compareFiscalYears/${sourceYear}/${targetYear}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Erro ao comparar exercícios fiscais');
  }
  const json = await response.json();
  return json?.value || json;
};


export const fetchUserMenus = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/sgf-api/menus?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar menus');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar menus:', error);
    return [];
  }
};





export const findDashboardData = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/sgf-api/dashboardData`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar dados do DashBoard');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados do DashBoard:', error);
    return [];
  }
};

export const findDashboardDataSecondSection = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/sgf-api/dashboardDataSecondSection`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar dados do DashBoard');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados do DashBoard:', error);
    return [];
  }
};

export const dashboardBudjectExecution = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/sgf-api/internalrequest/dashboardBudjectExecution`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar dados do DashBoard');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados do DashBoard:', error);
    return [];
  }
};


export const dashboardAccountToPayAndReceive = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/sgf-api/internalrequest/dashboardAccountToPayAndReceive`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar dados do DashBoard');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados do DashBoard:', error);
    return [];
  }
};




export const findDashboardBudject = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/sgf-api/dashboardBudject`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar dados do DashBoard');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados do DashBoard:', error);
    return [];
  }
};


// Back 
export const registerAccount = async (accountData) => {
  console.log("Forma Data", accountData)
  try {
    const result = await createAccountPlan(accountData);
    console.log('Account registered successfully:', result);
    return result;
  } catch (error) {
    console.error('Error registering account:', error);
    throw error;
  }
};

export const updateAccountAPI = async (accountData) => {
  console.log("Forma Update", accountData)
  try {
    const result = await callUpdateAccountAPI(accountData);
    console.log('Account updated successfully:', result);
    return result;
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
};

export const callDeleteAccountAPI = async (accountData) => {
  console.log("Forma Update", accountData)
  try {
    const result = await deleteAccountAPI(accountData);
    console.log('Account deleted successfully:', result);
    return result;
  } catch (error) {
    console.error('Error when deleted account:', error);
    throw error;
  }
};


export const saveMovimentCount = async (payload) => {
  try {
    const result = await saveMoviment(payload);
    console.log('Moviment registered successfully:', result);
    return result;
  } catch (error) {
    console.error('Error moviment account:', error);
    throw error;
  }
}

export const annullmentRequest0 = async (payload) => {
  try {
    const result = await annullmentRequest(payload);
    console.log('successfully:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}




export const saveReduction = async (payload) => {
  try {
    const result = await saveReductionAccount(payload);
    console.log('Moviment registered successfully:', result);
    return result;
  } catch (error) {
    console.error('Error moviment account:', error);
    throw error;
  }
}

export const saveAssociateFinancialAccountWithBujectAccounts = async (payload) => {
  try {
    const result = await associateFinancialAccountWithBujectAccounts(payload);
    console.log('Moviment registered successfully:', result);
    return result;
  } catch (error) {
    console.error('Error moviment account:', error);
    throw error;
  }
}



export const redistribuition = async (payload) => {
  try {
    const result = await saveredistribuition(payload);
    console.log('Moviment registered successfully:', result);
    return result;
  } catch (error) {
    // Propaga o erro com a mensagem da API
    console.error('Error moviment account:', error.message); // Aqui você exibe a mensagem do erro
    throw new Error(error.message); // Propaga a mensagem de erro para a camada superior
  }
}



export const callCreateAccountPlanBudjectEntry = async (accountData) => {
  try {
    const result = await createAccountPlanBudjectEntry(accountData);
    console.log('Account registered successfully:', result);
    return result;
  } catch (error) {
    console.error('Error registering account:', error);
    throw error;
  }
};

export const setCreateAccountPlanBudjectEntry = async (accountData) => {
  console.log("Meu Lancamento", accountData)
  try {
    const result = await setAccountPlanEntry(accountData);
    console.log('Account registered successfully:', result);
    return result;
  } catch (error) {
    console.error('Error registering account:', error);
    throw error;
  }
};

export const setUpdateInitialAllocation = async (accountData) => {
  console.log("Meu Lancamento", accountData);

  try {
    // Suponha que você está fazendo uma requisição POST para uma API
    const result = await axios.post(`${BASE_URL}/sgf-api/planbudject/correctAccountPlanEntryValueHandler`, accountData);

    // Verificando o resultado da resposta da API
    console.log('Account updated successfully:', result.data);
    
    return result.data; // ou outro campo dependendo da sua resposta da API
  } catch (error) {
    console.error('Error registering account:', error);
    throw error;
  }
};


export const setInitialAllocationApprovalDate = async (date) => {

  try {
    // Suponha que você está fazendo uma requisição POST para uma API
    const result = await axios.post(`${BASE_URL}/sgf-api/planbudject/updateInitialAllocationApprovalDate`, date);

    // Verificando o resultado da resposta da API
    console.log('Account updated successfully:', result.data);
    
    return result.data; // ou outro campo dependendo da sua resposta da API
  } catch (error) {
    console.error('Error registering account:', error);
    throw error;
  }
};




// REQUEST
export const requisitionCreate = async (accountData) => {
  console.log("Meu Lancamento", accountData)
  try {
    const result = await setRequisitionCreate(accountData);
    console.log('Requisition registered successfully:', result);
    return result;
  } catch (error) {
    console.error('Error Requisiting account:', error);
    throw error;
  }
};

export const createOpenAccount = async (accountData) => {
  console.log("Meu Lancamento", accountData)
  try {
    const result = await setOpenAccount(accountData);
    console.log('Open registered successfully:', result);
    return result;
  } catch (error) {
    console.error('Error Open account:', error);
    throw error;
  }
};

export const createBankInAccountingJournal = async (accountData) => {
  console.log("Meu Lancamento", accountData)
  try {
    const result = await setBankInAccountingJournal(accountData);
    console.log('Open registered successfully:', result);
    return result;
  } catch (error) {
    console.error('Error Open account:', error);
    throw error;
  }
};

export const createBillToPayAccountingJournal = async (accountData) => {
  console.log("Meu Lancamento", accountData)
  try {
    const result = await setBillToPayAccountingJournal(accountData);
    console.log('Open registered successfully:', result);
    return result;
  } catch (error) {
    console.error('Error Open account:', error);
    throw error;
  }
};

export const createBillToReceiveAccountingJournal = async (accountData) => {
  console.log("Meu Lancamento", accountData)
  try {
    const result = await setBillToReceiveAccountingJournal(accountData);
    console.log('Open registered successfully:', result);
    return result;
  } catch (error) {
    console.error('Error Open account:', error);
    throw error;
  }
};

export const createBankOutAccountingJournal = async (accountData) => {
  console.log("Meu Lancamento", accountData)
  try {
    const result = await setBankOutAccountingJournal(accountData);
    console.log('Open registered successfully:', result);
    return result;
  } catch (error) {
    // console.error('Error BanksExit account:', error);
    throw error;
  }
};

export const bankReconciliationService = async (reconciliationData) => {
  try {
    const result = await saveBankReconciliation(reconciliationData);
    console.log('Open registered successfully:', result);
    return result;
  } catch (error) {
    // console.error('Error BanksExit account:', error);
    throw error;
  }
};

export const conformInitialAllocation = async (data) => {
  console.log("Dados para a conformidade", data)
  try {
    const result = await setConformInitialAllocation(data);
    console.log('Conformidade atribuida com sucesso:', result);
    return result;
  } catch (error) {
    // console.error('Error BanksExit account:', error);
    throw error;
  }
};

export const conformanceMovimentBudject = async (data) => {
  console.log("Dados para a conformidade", data)
  try {
    const result = await setConformanceMovimentBudject(data);
    console.log('Conformidade atribuida com sucesso:', result);
    return result;
  } catch (error) {
    // console.error('Error BanksExit account:', error);
    throw error;
  }
};


export const createRegulationAccountingJournal = async (accountData) => {
  console.log("Meu Lancamento", accountData)
  try {
    const result = await setRegulationAccountingJournal(accountData);
    console.log('Open registered successfully:', result);
    return result;
  } catch (error) {
    console.error('Error Open account:', error);
    throw error;
  }
};


export const createUser = async (accountData) => {
  console.log("Meus Dados", accountData)
  try {
    const result = await setCreateUser(accountData);
    return result;
  } catch (error) {
    console.error("Erro ao criar o usuário:", error);
    throw error;
  }
};
// services/accountService.js
export const getRegisteredAccounts = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/accountplan/findAllAccountPlan`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar contas');
  }
  return await response.json();
};

export const fetchPermissions = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/menus/all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Carregar as Permissoes');
  }
  return await response.json();
};


export const fetchEntries = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/accountplan/findAllAccountPlan`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar contas');
  }
  return await response.json();
};

export const importInitialAllocationsFromExcel = async (payload) => {
  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/importInitialAllocationsFromExcel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload || {}),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Erro ao importar dotações do Excel');
  }
  return await response.json();
};

export const findAccountPlanBudjectEntriesByYear = async (yearOverride) => {
  const activeYear = yearOverride || getActiveFiscalYear();
  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/fetchAccountPlanEntriesByYear/${activeYear}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};

export const limparDados = async (id, yearOverride) => {
  const url = `${BASE_URL}/sgf-api/planbudject/clearInitialAllocation`;
  const activeYear = yearOverride || getActiveFiscalYear();
  // Prepara o corpo da requisição baseado no ID e Ano Fiscal Ativo
  const body = id ? { id, year: activeYear } : { year: activeYear };

  console.log("minha reusadiiasdna", id, activeYear)
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Adicione outros headers se necessário (como auth)
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao limpar os dados');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    throw error;
  }
};

export const findConformInitialAllocation = async (yearOverride) => {
  const activeYear = yearOverride || getActiveFiscalYear();
  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/findConformInitialAllocation?year=${activeYear}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar o Estado da conta');
  }

  const data = await response.json();
  return data.data; // Acessa o valor booleano (true/false) na propriedade 'data'
};






export const findAccountRequestWhitConformance = async () => {
  const url = `${BASE_URL}/sgf-api/internalrequest/findAllInternalRequest`;

  console.log(`curl -X GET '${url}' \\
  -H 'Content-Type: application/json'`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const contentType = response.headers.get('content-type');
    console.log("Status:", response.status);
    console.log("Content-Type:", contentType);

    if (!response.ok) {
      const text = await response.text();
      console.error("Resposta de erro:", text);
      throw new Error(`Erro ${response.status}`);
    }

    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error("Resposta não é JSON:", text);
      throw new Error('Resposta não é JSON!');
    }

    return await response.json();
  } catch (err) {
    console.error("Erro ao buscar contas:", err);
    throw err;
  }
};


export const feacthAccountRequestWhitConformance = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/internalrequest/feacthAllInternalRequest`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar contas');
  }
  return await response.json();
};




export const fetchAccountRequestWhitConformance = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/internalrequest/fetchAllInternalRequest`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar contas');
  }
  return await response.json();
};



export const fetchAccountRequestValid = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/internalrequest/fetchAllInternalRequestValid`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar contas');
  }
  return await response.json();
};



export const getBudgetAccounts = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/accountplan/findAllAccountPlanBudjectEntries`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar contas');
  }
  return await response.json();
};

export const fetchAccountPlanBudjectEntriesByYear = async (yearOverride) => {
  const activeYear = yearOverride || getActiveFiscalYear();
  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/fetchAccountPlanEntriesByYear/${activeYear}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};
export const fetchAccountPlanEntriesByYearByfilters = async (filters) => {
  const year = filters?.year || getActiveFiscalYear();

  console.log("filtros", filters)

  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/fetchAccountPlanEntriesByYearByfilters/${year}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filters),
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }

  return await response.json();
};




export const fetchInitialAllocationsByParentId = async (yearOverride) => {
  const activeYear = yearOverride || getActiveFiscalYear();
  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/fetchInitialAllocationsByParentId/${activeYear}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};



export const findAccountPlanAccountAssociateByYear = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/fetchFinancialAccountWithAssociations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar as Contas associadas');
  }
  return await response.json();
};

export const fetchAllAccountingJournalEntry = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/accounting/fetchAllAccountingJournalEntryItems`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};


export const fetchAllAccountingJournalEntryByFilters = async (filters) => {
  const queryParams = new URLSearchParams();

  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.accountPlanId !== undefined) queryParams.append('accountPlanId', filters.accountPlanId.toString());

  try {
    const response = await fetch(`${BASE_URL}/sgf-api/accounting/fetchAllAccountingJournalEntryItemsByFilters?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar os dados');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error; // Opcional, caso queira propagar o erro
  }
};


export const fetchGeneralFolioAccountByFilter = async (filters) => {
  const queryParams = new URLSearchParams();

  // Adiciona os filtros ao URL, caso estejam definidos
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.accountPlanId !== undefined) queryParams.append('accountPlanId', filters.accountPlanId.toString());

  try {
    // Construindo a URL com parâmetros de consulta
    const url = `${BASE_URL}/sgf-api/accounting/fetchGeneralFolioAccountByFilter?${queryParams.toString()}`;
    console.log('🛠️ URL gerada para a requisição:', url);

    // Realizando a requisição GET
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Se a resposta não for bem-sucedida, lança um erro
    if (!response.ok) {
      throw new Error('Erro ao buscar os dados');
    }

    // Retorna os dados em formato JSON
    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error; // Opcional, caso queira propagar o erro
  }
};


export const fetchGeneralFolioAccountByFilterByYearAndMonth = async (filters) => {
  const queryParams = new URLSearchParams();

  // Inclui ano e mês, se fornecidos
  if (filters.year) queryParams.append('year', filters.year.toString());
  if (filters.month) queryParams.append('month', filters.month.toString());

  // Se desejar manter algum outro filtro, adicione aqui (ex: accountPlanId)
  if (filters.accountPlanId !== undefined) {
    queryParams.append('accountPlanId', filters.accountPlanId.toString());
  }

  try {
    const url = `${BASE_URL}/sgf-api/accounting/fetchGeneralFolioAccountByYearAndMonth?${queryParams.toString()}`;
    console.log('🛠️ URL gerada para a requisição:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar os dados');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
};



export const fetchAllBalanceteByFiltersSearch = async (filters) => {
  const queryParams = new URLSearchParams();

  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.accountPlanId !== undefined) queryParams.append('accountPlanId', filters.accountPlanId.toString());

  try {
    const response = await fetch(`${BASE_URL}/sgf-api/accounting/fetchAllBalanceteByFilters?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar os dados');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error; 
  }
};







export const fetchAllAccountingJournalEntryAll = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/accounting/fetchAllAccountingJournalEntry`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};







export const findAllDiaries = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/findAllDiaries`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};

export const findAllDocuments = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/findAllDocuments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};

export const fetchAllAccountingJournal = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/accounting/fetchAllAccountingJournalByJournalNumber/00`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};

export const validateInitialAllocationApprovalDate = async (yearOverride) => {
  const activeYear = yearOverride || getActiveFiscalYear();
  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/validateInitialAllocationApprovalDate?year=${activeYear}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};


export const fetchAllAccountingJournalAll = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/accounting/fetchAllAccountingJournal`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};

export const fetchOpenAccount = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/accounting/fetchAllAccountingJournalByJournalNumber/00`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};

export const fetchAllAccountingJournal10 = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/accounting/fetchAllAccountingJournalByJournalNumber/10`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};

export const fetchAllAccountingJournal20 = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/accounting/fetchAllAccountingJournalByJournalNumber/20`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};


export const fetchAllAccountingJournal30 = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/accounting/fetchAllAccountingJournalByJournalNumber/30`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};


export const fetchAllAccountingJournal40 = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/accounting/fetchAllAccountingJournalByJournalNumber/40`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};


export const fetchAllAccountingJournal50 = async () => {
  const response = await fetch(`${BASE_URL}/sgf-api/accounting/fetchAllAccountingJournalByJournalNumber/50`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};


export const fetchSummationAccountEntriesEntry = async (yearOverride) => {
  const activeYear = yearOverride || getActiveFiscalYear();
  const response = await fetch(`${BASE_URL}/sgf-api/planbudject/fetchSummationAccountEntriesEntry?year=${activeYear}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar os Dados');
  }
  return await response.json();
};


export const fetchUserData = async () => {
  try {
    // Obter o token do localStorage
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("Token de autenticação não encontrado.");
    }

    // Fazer a requisição com o token
    const response = await fetch(`${BASE_URL}/sgf-api/user/getUser`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Adiciona o token ao cabeçalho
      },
    });

    // Verificar se a resposta é válida
    if (!response.ok) {
      throw new Error('Erro ao buscar os Dados');
    }

    // Retornar os dados da resposta
    return await response.json();
  } catch (error) {
    console.error('Erro ao fazer a requisição:', error);
    throw error; // Propaga o erro para quem chamou a função
  }
};
