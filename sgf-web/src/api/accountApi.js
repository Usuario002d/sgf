import { API_ENDPOINTS } from './apiConfig';


// Função para corrigir o valor do plano de conta
export const correctAccountPlanEntryValue = async (accountPlanNumber, newValue, isInitialAllocation) => {
  const requestData = {
    accountPlanNumber,
    newValue,
    isInitialAllocation,
  };

  console.log("requestData", requestData)
  try {
    const response = await fetch(API_ENDPOINTS.CORRECT_ACCOUNT_PLAN, {
      method: 'POST', // Ou 'PUT', dependendo do seu endpoint
      headers: {
        'Content-Type': 'application/json',
        // Adicione outros cabeçalhos, se necessário (ex: autorização)
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error('Erro ao corrigir o plano de conta');
    }

    const data = await response.json();
    console.log('Plano de conta corrigido com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro ao corrigir plano de conta:', error);
    throw error;
  }
};

export const createAccountPlan = async (accountData) => {
  try {
    const response = await fetch(API_ENDPOINTS.CREATE_ACCOUNT_PLAN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      // Lê a resposta de erro no formato JSON
      const errorData = await response.json();

      // Acessa a mensagem de erro corretamente
      const errorMessage = errorData.message || 'Erro desconhecido';
      const errorDetail = errorData.error || 'Detalhes não encontrados';

      // Lança o erro com a mensagem específica
      throw new Error(`${errorMessage}: ${errorDetail}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to create account plan:', error);
    throw error;
  }
};


export const callUpdateAccountAPI = async (accountData) => {
  try {
    const response = await fetch(API_ENDPOINTS.UPDATE_ACCOUNT_PLAN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to update account plan:', error);
    throw error;
  }
};

export const deleteAccountAPI = async (accountData) => {
  try {
    const response = await fetch(API_ENDPOINTS.REMOVE_ACCOUNT_PLAN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    // Verifique se a resposta não está vazia
    const responseText = await response.text(); // Lê a resposta como texto

    // Verifica se a resposta tem algum conteúdo
    if (responseText) {
      return JSON.parse(responseText); // Faz o parse para JSON se houver conteúdo
    } else {
      return {}; // Retorna um objeto vazio ou algum valor padrão, caso a resposta esteja vazia
    }
  } catch (error) {
    console.error('Failed to update account plan:', error);
    throw error;
  }
};


export const setRequisitionCreate = async (accountData) => {
  console.log("accountData", accountData);
  try {
    const response = await fetch(API_ENDPOINTS.REGISTER_REQUISITION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    const result = await response.json(); // Sempre tentar parsear a resposta

    if (!response.ok) {
      // Se a resposta não estiver OK, usar os detalhes do erro do backend
      throw new Error(result.message || `Error: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('Failed to requisition account plan:', error.message);
    
    // Você pode acessar mais detalhes do erro se necessário
    // error.response?.data?.code para códigos específicos como 'DUPLICATE_REQUEST'

    // Lança um erro com a mensagem formatada para exibição na UI
    throw new Error(
      error.message || 'Ocorreu um erro ao criar a requisição. Por favor, tente novamente.'
    );
  }
};


export const setOpenAccount = async (accountData) => {
  try {
    const response = await fetch(API_ENDPOINTS.REGISTER_OPEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to Open account plan:', error);
    throw error;
  }
};


export const setBankInAccountingJournal = async (accountData) => {
  try {
    const response = await fetch(API_ENDPOINTS.BANK_IN_ACCOUNTING_JOURNAL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to setBankInAccountingJournal', error);
    throw error;
  }
};



export const setBillToPayAccountingJournal = async (accountData) => {
  try {
    const response = await fetch(API_ENDPOINTS.BILL_TO_PAY_ACCOUNTING_JOURNAL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      const errorData = await response.json(); // Obtém o JSON da resposta de erro
      throw new Error(errorData.error || 'Erro desconhecido'); // Aqui acessamos o campo 'error'
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Erro ao criar lançamento contábil:', error.message); // Aqui usamos 'error.message'
    throw error; // Lança o erro para o front-end tratar
  }
};


export const setBillToReceiveAccountingJournal = async (accountData) => {
  try {
    const response = await fetch(API_ENDPOINTS.BILL_TO_RECEIVE_ACCOUTING_JOURNAL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to setBillToReceiveAccountingJournal', error);
    console.error('Message:', error.message);
    console.error('Error Details:', error.errorDetails);  // Detalhes específicos da resposta
    console.error('Status code:', error.status);
    throw error;
  }
};


export const setBankOutAccountingJournal = async (accountData) => {
  try {
    const response = await fetch(API_ENDPOINTS.BANK_OUT_ACCOUTING_JOURNAL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      // Lê como texto primeiro e tenta converter para JSON se possível
      const errorText = await response.text();
      let errorData = {};
      try {
        errorData = errorText ? JSON.parse(errorText) : {};
      } catch (e) {
        console.warn('Erro ao converter erro para JSON:', e);
      }

      const errorMessage = errorData?.message || `Erro ${response.status}`;
      throw new Error(errorMessage);
    }

    // Para respostas válidas: trata como texto e depois parseia
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return data;

  } catch (error) {
    console.error('Failed to setBankOutAccountingJournal', error);
    throw error;
  }
};


export const saveBankReconciliation = async (reconciliationData) => {
  try {
    const response = await fetch(API_ENDPOINTS.CREATE_PAYMENT_RECONCILIATION, {  // Certifique-se que a URL está correta
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reconciliationData),
    });

    if (!response.ok) {
      // Se a API retornar erro, lançamos exceção para captura abaixo
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao salvar reconciliação');
    }

    // Retorna o corpo da resposta com os dados da reconciliação criada
    return await response.json();

  } catch (error) {
    // Pode tratar ou relançar o erro para o chamador lidar
    throw error;
  }
};




export const setConformInitialAllocation = async (data) => {
  try {
    const response = await fetch(API_ENDPOINTS.ACCOUNT_BUDJECT_CONFORMANCE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorResponse = await response.json();  // Pega o corpo da resposta de erro
      throw new Error(`Error: ${errorResponse.error}`);  // Acessa a chave 'error' no JSON
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to Set Conformance', error);
    console.error('Error Message:', error.message);  // Exibe a mensagem de erro que foi jogada
    throw error;
  }
};


export const setConformanceMovimentBudject = async (data) => {
  try {
    const response = await fetch(API_ENDPOINTS.ACCOUNT_BUDJECT_CONFORMANCE_MOVMENT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorResponse = await response.json();  // Pega o corpo da resposta de erro
      throw new Error(`Error: ${errorResponse.error}`);  // Acessa a chave 'error' no JSON
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to Set Conformance', error);
    console.error('Error Message:', error.message);  // Exibe a mensagem de erro que foi jogada
    throw error;
  }
};


export const setRegulationAccountingJournal = async (accountData) => {
  try {
    const response = await fetch(API_ENDPOINTS.REGULARIZATION_ACCOUTING_JOURNAL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to setRegulationAccountingJournal', error);
    throw error;
  }
};

export const setCreateUser = async (accountData) => {
  try {
    const response = await fetch(API_ENDPOINTS.CREATE_USER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to Create user', error);
    throw error;
  }
};


export const setAccountPlanEntry = async (accountData) => {
  try {
    const response = await fetch(API_ENDPOINTS.CREATE_BUDJECT_ENTRY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to create account plan:', error);
    throw error;
  }
};


export const saveMoviment = async (payload) => {
  try {
    const response = await fetch(API_ENDPOINTS.REFORCE_ACCOUNT_PLAN_BUDJECT_ENTRY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json(); // Muda de 'result' para 'data' para evitar confusão

    if (!response.ok) {
      // Extrai a mensagem de erro da resposta da API
      const errorMessage = data.message || `Erro: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('Falha ao criar plano de conta:', error);
    
    // Lança um novo erro com mensagem formatada
    throw new Error(
      error.message.includes('não pode ser negativo ou zero')
        ? error.message // Mantém a mensagem original para erros de validação
        : 'Ocorreu um erro ao processar sua solicitação. Tente novamente.'
    );
  }
}


export const annullmentRequest = async (payload) => {
  try {
    const response = await fetch(API_ENDPOINTS.ANNULLMENT_REQUEST_ENTRY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to create account plan:', error);
    throw error;
  }
}


export const associateFinancialAccountWithBujectAccounts = async (payload) => {
  try {
    const response = await fetch(API_ENDPOINTS.ASSOSIATE_ACCOUNT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    // Captura a resposta JSON
    const result = await response.json();

    // Aqui você pode acessar a resposta e imprimir a mensagem de erro
    if (result.error) {
      console.error('Erro:', result.error); // Imprime a mensagem de erro no console
      alert(result.error); // Exibe a mensagem de erro para o usuário
    } else {
      console.log('Resultado:', result.message); // Imprime a mensagem de sucesso no console
      alert(result.message); // Exibe a mensagem de sucesso para o usuário
    }

    return result;
  } catch (error) {
    // Captura erros de rede ou outros problemas de execução
    console.error('Falha ao associar plano de contas:', error.message);
    // alert('Ocorreu um erro ao associar o plano de conta.');
    throw error;
  }
}





export const saveReductionAccount = async (payload) => {
  try {
    const response = await fetch(API_ENDPOINTS.ANULL_ACCOUNT_PLAN_BUDJECT_ENTRY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      // Lança a mensagem retornada pelo servidor, se houver
      throw new Error(responseBody.error || responseBody.message || `Erro: ${response.status}`);
    }

    return responseBody;
  } catch (error) {
    console.error('Falha ao criar plano de conta:', error.message);
    throw error;
  }
};




export const saveredistribuition = async (payload) => {
  console.log("Payload Enviado", payload)
  try {
    const response = await fetch(API_ENDPOINTS.REDISTRIBUITION_ACCOUNT_PLAN_BUDJECT_ENTRY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorResponse = await response.json(); // Captura a resposta de erro
      throw new Error(errorResponse.error || `Error: ${response.status}`); // Usa o campo "error" se disponível
    }

    const result = await response.json();
    console.log("Resultado", result)
    return result;
  } catch (error) {
    console.error('Failed to create account plan:', error);
    throw error;
  }
}









export const createAccountPlanBudjectEntry = async (accountData) => {
  console.log("FORMATO PARA CRIAR DADOS", accountData)
  try {
    const response = await fetch(API_ENDPOINTS.CREATE_ACCOUNT_PLAN_ENTRY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to create account plan:', error);
    throw error;
  }
};



const updateRequestStatus = async (requestNumber, conformanceStatus, justification) => {
  try {
    const response = await fetch(API_ENDPOINTS.UPDATE_CONFORMANCE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestNumber,
        conformanceStatus,
        justification,
      }),
    });
    if (response.ok) {
      const updatedRequest = await response.json();
      return updatedRequest;
    } else {
      throw new Error('Failed to update status');
    }
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
};




export const fetchAccounts = async () => {
  try {
    const response = await fetch(`${API_ENDPOINTS.CREATE_ACCOUNT_PLAN}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const accounts = await response.json();
    return accounts;
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    throw error;
  }
};

