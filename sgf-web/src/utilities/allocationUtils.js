
export const calculateChildrenAllocation = (account) => {
  let total = 0;

  if (account.children && Array.isArray(account.children)) {
    account.children.forEach(child => {
      const initialAllocationEntry = child.entriesEntry?.find(entry => entry.type === "initial_allocation");
      const initialAllocation = initialAllocationEntry ? initialAllocationEntry.allocation : 0;
      total += initialAllocation;
    });
  }

  return total;
};

export const calculateChildrenAllocationA2 = (account) => {
  let total = 0;

  const processChildren = (children) => {
    if (children && Array.isArray(children)) {
      children.forEach(child => {
        if (!child.entriesEntry || child.entriesEntry.length === 0) {
          if (child.children && Array.isArray(child.children)) {
            processChildren(child.children);
          }
        } else {
          const initialAllocationEntry = child.entriesEntry.find(entry => entry.type === "initial_allocation");
          const initialAllocation = initialAllocationEntry ? initialAllocationEntry.allocation : 0;
          total += initialAllocation;
        }
      });
    }
  };

  processChildren(account.children);
  return total;
};

export const calculateFinalAllocationA = (account, valuesAccounts) => {
  let totalAllocation = 0;calculateFinalAllocationTotal
  const finalAllocationType = account.accountPlan.finalAllocationType;

  const initialAllocationEntry = account.entriesEntry?.find(entry => entry.type === "initial_allocation");
  const initialAllocation = initialAllocationEntry ? initialAllocationEntry.allocation : 0;

  if (['L', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9'].includes(finalAllocationType)) {
    totalAllocation += calculateChildrenAllocation(account);
  } else if (finalAllocationType === 'A') {
    if (valuesAccounts.length >= 7) {
      totalAllocation = valuesAccounts.slice(0, 7).reduce((acc, val) => acc + val.total_allocation, 0);
    } else {
      totalAllocation = 0;
    }
  } else if (finalAllocationType === 'A1') {
    if (valuesAccounts.length >= 2) {
      totalAllocation = valuesAccounts[0].total_allocation + valuesAccounts[1].total_allocation;
    } else {
      totalAllocation = 0;
    }
  } else if (finalAllocationType === 'A2') {
    totalAllocation = valuesAccounts[0]?.total_allocation || 0;
  } else if (finalAllocationType === 'A3') {
    totalAllocation += calculateChildrenAllocationA2(account);
  } else if (finalAllocationType === 'A4') {
    if (valuesAccounts.length >= 4) {
      totalAllocation = valuesAccounts[2].total_allocation + valuesAccounts[3].total_allocation;
    } else {
      totalAllocation = 0;
    }
  } else if (finalAllocationType === 'A5') {
    if (valuesAccounts.length >= 6) {
      totalAllocation = valuesAccounts[5].total_allocation + valuesAccounts[6].total_allocation;
    } else {
      totalAllocation = 0;
    }
  } else if (['A7', 'A8'].includes(finalAllocationType)) {
    if (valuesAccounts.length >= 8) {
      const len = valuesAccounts.length;
      totalAllocation = valuesAccounts[len - 1].total_allocation +
        valuesAccounts[len - 2].total_allocation +
        valuesAccounts[len - 3].total_allocation;
    } else {
      totalAllocation = 0;
    }
  } else {
    totalAllocation += initialAllocation || 0;
  }

  return totalAllocation;
};

export const calculateChildrenAllocationFinallAlocation = (account) => {
  let total = 0;

  if (account.children && Array.isArray(account.children)) {
    account.children.forEach(child => {
      const childAllocation = child.finalAllocation || 0;
      total += childAllocation;
    });
  }

  return total;
};

export const calculateFinalAllocationDinamic = (account,accounts) => {
  let totalAllocation = 0;
  const finalAllocationType = account.accountPlan.finalAllocationType;

  if (finalAllocationType === 'A') {
    const allocationTypes = ['L', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
    allocationTypes.forEach(type => {
      const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
      if (account) {
        totalAllocation += calculateChildrenAllocationFinallAlocation(account);
      }
    });
  }
  else if (finalAllocationType === 'L3') {
    totalAllocation += calculateChildrenAllocationFinallAlocation(account);
  }
  else if (finalAllocationType === 'L2') {
    totalAllocation += calculateChildrenAllocationFinallAlocation(account);
  } else if (finalAllocationType === 'A1') {
    const allocationTypes = ['L', 'L1'];
    allocationTypes.forEach(type => {
      const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
      if (account) {
        totalAllocation += calculateChildrenAllocationFinallAlocation(account);
      }
    });
  }
  else if (finalAllocationType === 'A2') {
    const allocationTypes = ['L'];
    allocationTypes.forEach(type => {
      const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
      if (account) {
        totalAllocation += calculateChildrenAllocationFinallAlocation(account);
      }
    });
  } else if (finalAllocationType === 'A3') {
    const allocationTypes = ['L1'];
    allocationTypes.forEach(type => {
      const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
      if (account) {
        totalAllocation += calculateChildrenAllocationFinallAlocation(account);
      }
    });
  }
  else if (finalAllocationType === 'L1') {
    const allocationTypes = ['L1'];
    allocationTypes.forEach(type => {
      const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
      if (account) {
        totalAllocation += calculateChildrenAllocationFinallAlocation(account);
      }
    });
  }
  else if (finalAllocationType === 'A4') {
    const allocationTypes = ['L2', 'L3'];
    allocationTypes.forEach(type => {
      const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
      if (account) {
        totalAllocation += calculateChildrenAllocationFinallAlocation(account);
      }
    });
  }
  else if (finalAllocationType === 'L4') {
    const allocationTypes = ['L4'];
    allocationTypes.forEach(type => {
      const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
      if (account) {
        totalAllocation += calculateChildrenAllocationFinallAlocation(account);
      }
    });
  }
  else if (finalAllocationType === 'L5') {
    const allocationTypes = ['L5'];
    allocationTypes.forEach(type => {
      const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
      if (account) {
        totalAllocation += calculateChildrenAllocationFinallAlocation(account);
      }
    });
  }
  else if (finalAllocationType === 'L6') {
    const allocationTypes = ['L6'];
    allocationTypes.forEach(type => {
      const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
      if (account) {
        totalAllocation += calculateChildrenAllocationFinallAlocation(account);
      }
    });
  }
  else if (finalAllocationType === 'A5') {
    const allocationTypes = ['L5', 'L6'];
    allocationTypes.forEach(type => {
      const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
      if (account) {
        totalAllocation += calculateChildrenAllocationFinallAlocation(account);
      }
    });
  } else if (finalAllocationType === 'A7') {
    const allocationTypes = ['L7', 'L8', 'L9'];
    allocationTypes.forEach(type => {
      const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
      if (account) {
        totalAllocation += calculateChildrenAllocationFinallAlocation(account);
      }
    });
  }
  else if (finalAllocationType === 'L8') {
    const allocationTypes = ['L8'];
    allocationTypes.forEach(type => {
      const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
      if (account) {
        totalAllocation += calculateChildrenAllocationFinallAlocation(account);
      }
    });
  }
  else if (finalAllocationType === 'L9') {
    const allocationTypes = ['L9'];
    allocationTypes.forEach(type => {
      const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
      if (account) {
        totalAllocation += calculateChildrenAllocationFinallAlocation(account);
      }
    });
  } else if (finalAllocationType === 'A8') {
    totalAllocation += calculateSiblingAllocation(accounts, ['L7', 'L8', 'L9']);
  } else {
    totalAllocation += account.finalAllocation || 0;
  }

  return totalAllocation;
};

export const calculateAggregatedValues = (accounts) => {
  accounts.forEach(account => {
    let dotacaoInicial = 0;
    let inscricao = 0;
    let anulacao = 0;
    let redistribuicaoAumento = 0;
    let redistribuicaoReducao = 0;

    if (account.entriesEntry) {
      account.entriesEntry.forEach(entry => {
        if (entry.type === "reinforcement") {
          inscricao += entry.allocation;
        } else if (entry.type === "annulment") {
          anulacao += entry.allocation;
        } else if (entry.type === "redistribuition_reinforcement") {
          redistribuicaoAumento += entry.allocation;
        } else if (entry.type === "redistribuition_annulment") {
          redistribuicaoReducao += entry.allocation;
        }
      });
    }

    const dotacaoFinal = dotacaoInicial + inscricao - anulacao + redistribuicaoAumento - redistribuicaoReducao;

    account.dotacaoInicial = dotacaoInicial;
    account.inscricao = inscricao;
    account.anulacao = anulacao;
    account.redistribuicaoAumento = redistribuicaoAumento;
    account.redistribuicaoReducao = redistribuicaoReducao;
    account.dotacaoFinal = dotacaoFinal;

    if (account.children) {
      calculateAggregatedValues(account.children);
    }
  });
};

export const calculateSiblingAllocation = (accounts, types) => {
  let total = 0;
  accounts.forEach((account) => {
    const finalAllocationType = account.accountPlan.finalAllocationType;
    const finalAllocation = account.finalAllocation || 0;
    if (types.includes(finalAllocationType)) {
      total += finalAllocation;
    }
  });
  return total;
};

export const calculateFinalAllocationTotal = (account, type,accounts) => {
  let totalAllocation = 0;

  if (type === 'AFF') {
    const relevantAccounts = accounts.filter(acc =>
      ['A3', 'A2', 'L4', 'L5', 'L6', 'L2', 'L3'].includes(acc.accountPlan.finalAllocationType)
    );

    relevantAccounts.forEach(accountItem => {
      totalAllocation += accountItem.children.reduce((acc, child) => {
        return acc + calculateFinalAllocation(child);
      }, 0);
    });

  } else if (type === 'AFC') {
    const relevantAccounts = accounts.filter(acc =>
      ['L7', 'L8', 'L9'].includes(acc.accountPlan.finalAllocationType)
    );

    relevantAccounts.forEach(accountItem => {
      totalAllocation += accountItem.children.reduce((acc, child) => {
        return acc + calculateFinalAllocation(child);
      }, 0);
    });

  } else {
    totalAllocation += account.finalAllocation || 0;
  }

  return totalAllocation;
};

export const calculateFinalAllocationTotal2 = (account, type,accounts) => {
  let totalAllocation = 0;

  if (type === 'AFF') {
    const allocationTypes = ['L', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
    allocationTypes.forEach(type => {
      const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
      if (account) {
        totalAllocation += calculateChildrenAllocationFinallAlocation(account);
      }
    });
  } else if (type === 'AFC') {
    const allocationTypes = ['L7', 'L8', 'L9'];
    allocationTypes.forEach(type => {
      const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
      if (account) {
        totalAllocation += calculateChildrenAllocationFinallAlocation(account);
      }
    });
  } else {
    totalAllocation += account.finalAllocation || 0;
  }

  return totalAllocation;
};

export const calculateFinalAllocation = (account,totalCurrentExpenses, accounts,valuesAccounts) => {
  let totalAllocation = 0;
  const finalAllocationType = account.accountPlan.finalAllocationType;

  const initialAllocationEntry = account.entriesEntry?.find(entry => entry.type === "initial_allocation");
  const initialAllocation = initialAllocationEntry ? initialAllocationEntry.allocation : 0;

  if (['L', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9'].includes(finalAllocationType)) {
    totalAllocation += calculateChildrenAllocation(account);
  }
  else if (finalAllocationType === 'A') {
    totalAllocation = totalCurrentExpenses;
  }
  else if (finalAllocationType === 'L4') {
    totalAllocation = avalueL4;
  } else if (finalAllocationType === 'A1') {
    totalAllocation = avalueA1;
  } else if (finalAllocationType === 'A2') {
    if (valuesAccounts.length >= 1) {
      totalAllocation = valuesAccounts[0].total_allocation;
    } else {
      totalAllocation = 0;
    }
  } else if (finalAllocationType === 'A3') {
    totalAllocation += calculateChildrenAllocationA2(account);
  } else if (finalAllocationType === 'A4') {
    const l2Account = accounts.find(acc => acc.accountPlan.finalAllocationType === 'L2');
    const l3Account = accounts.find(acc => acc.accountPlan.finalAllocationType === 'L3');
    const l2Allocation = l2Account ? calculateChildrenAllocation(l2Account) : 0;
    const l3Allocation = l3Account ? calculateChildrenAllocation(l3Account) : 0;
    totalAllocation = l2Allocation + l3Allocation;
  } else if (finalAllocationType === 'A5') {
    totalAllocation = avalueA5;
  } else if (finalAllocationType === 'A7' || finalAllocationType === 'A8') {
    totalAllocation = avalueA7;
  } else if (finalAllocationType === 'A8') {
    totalAllocation = avalueA8;
  } else {
    totalAllocation += initialAllocation || 0;
  }
  
  return totalAllocation;
};

export const groupByPrefix = (data) => {
  const groupedData = {};

  data.forEach(item => {
    const prefix = item.account_number.split('.').slice(0, 4).join('.');
    if (groupedData[prefix]) {
      groupedData[prefix].total_allocation += item.total_allocation;
    } else {
      groupedData[prefix] = {
        account_number: prefix,
        total_allocation: item.total_allocation
      };
    }
  });

  return Object.values(groupedData);
};


