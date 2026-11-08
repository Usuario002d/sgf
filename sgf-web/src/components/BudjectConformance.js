import React, { useEffect, useState } from 'react';
import {
  findAccountPlanBudjectEntriesByYear,
  validateInitialAllocationApprovalDate,
  fetchInitialAllocationsByParentId,
  findConformInitialAllocation,
  fetchAccountPlanBudjectEntriesByYear,
  conformInitialAllocation
} from '../services/accountService';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import { Button, Form, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import Spinner from '../config/spinner/spinner';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaChartLine,
  FaSyncAlt,
  FaShieldAlt,
  FaFileExcel,
  FaFilePdf,
  FaExpandAlt,
  FaSearch,
  FaLayerGroup,
  FaCoins,
  FaCalculator
} from 'react-icons/fa';
import ConformanceModalTabel from '../views/BudgetChange/component/ConformanceModalTabel.js';
import logoMz from '../assets/img/logoMz.png';
import templatePDF from '../views/BudgetChange/component/templatePDF';

const BudjectConformance = () => {
  const formatNumber = (value) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(num);
  };

  const [firistAccounts, setFiristAccounts] = useState([]);
  const [selectedAccountName, setSelectedAccountName] = useState('');
  const [isConformed, setIsConformed] = useState(false);
  const savedUserData = JSON.parse(localStorage.getItem('userData'));
  const [showModal, setShowModal] = useState(false);
  const [valuesAccounts, setValuesAccounts] = useState([]);
  const [finality, setFinality] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    accountPlanNumber: '',
    value: ''
  });

  const [exchangeRate] = useState(2.5);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [parentAccounts, setParentAccounts] = useState([]);
  const [avalueA, setAvalueA] = useState(0);
  const [avalueA1, setAvalueA1] = useState(0);
  const [avalueA4, setAvalueA4] = useState(0);
  const [avalueL4, setAvalueL4] = useState(0);
  const [avalueA5, setAvalueA5] = useState(0);
  const [avalueA7, setAvalueA7] = useState(0);
  const [avalueA8, setAvalueA8] = useState(0);
  const [avalueA3, setAvalueA3] = useState(0);

  const validateInitialAllocationApprovalDateValidate = async () => {
    try {
      setLoading(true);
      const response = await validateInitialAllocationApprovalDate();
      if (response && response.data && response.data.approvalDate) {
        setFinality(true);
      } else {
        setFinality(false);
      }
    } catch (error) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const exportToExcelExtrato = () => {
    const table = document.getElementById('tableBudjectMap');
    if (!table) return;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(wb, ws, 'Tabela');
    XLSX.writeFile(wb, 'TabelaOrcamento_Conformidade.xlsx');
  };

  const exportToPDFExtrato = () => {
    const table = document.querySelector('#tableBudjectMap');
    if (!table) return;
    const rows = Array.from(table.querySelectorAll('tbody tr'));

    const head = [
      [
        { content: 'Código', colSpan: 1 },
        { content: 'Designação', colSpan: 1 },
        { content: 'Dotação Inicial (MZN)', colSpan: 2 },
        { content: 'Duodécimo', colSpan: 1 }
      ],
      ['', '', 'USD', 'Contra Valor', 'Contra Valor']
    ];

    const body = rows.map((row) =>
      Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent.trim())
    );

    const title = 'Tabela de Despesas — Conformidade Orçamental';
    const subtitle = isConformed ? 'Estado: Orçamento Conforme' : 'Estado: Conformidade Pendente';
    const footerText = 'Documento gerado automaticamente pelo SGF';
    const logoImage = logoMz;
    const generatedBy = savedUserData?.username || 'Utilizador SGF';
    const filename = 'conformidadeDotacaoInicial.pdf';

    const totals = [
      [
        '',
        'Totais de Despesas Correntes',
        formatNumber(totalCurrentExpenses),
        formatNumber(totalCurrentContraValor),
        formatNumber(totalCurrentDuodecimo)
      ],
      [
        '',
        'Totais de Despesas de Capital',
        formatNumber(totalCapitalExpenses),
        formatNumber(totalCapitalContraValor),
        formatNumber(totalCapitalDuodecimo)
      ],
      [
        '',
        'Total Orçamento Global',
        formatNumber(totalGlobalBudget),
        formatNumber(totalGlobalContraValor),
        formatNumber(totalGlobalDuodecimo)
      ]
    ];

    const fullBody = [...body, ...totals];

    const tableContent = {
      head,
      body: fullBody,
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'left' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [15, 81, 50],
        textColor: [255, 255, 255],
        halign: 'center',
        fontStyle: 'bold'
      }
    };

    templatePDF({
      title,
      subtitle,
      tableContent,
      footerText,
      logoImage,
      generatedBy,
      filename
    });
  };

  const loadAccountsFiltered = async () => {
    try {
      const response = await fetchAccountPlanBudjectEntriesByYear();
      if (Array.isArray(response)) {
        const filteredAccounts = response.filter(
          (account) =>
            account.accountPlan?.type === 'budject' &&
            account.accountPlan?.writable === 'moviment' &&
            account.entriesEntry
        );
        setFiristAccounts(filteredAccounts);
      }
    } catch (error) {
      // ignore
    }
  };

  const findAccountPlanConformance = async () => {
    try {
      setLoading(true);
      const response = await findConformInitialAllocation();
      setIsConformed(Boolean(response));
    } catch (error) {
      console.error('Erro ao buscar conformidade:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await findAccountPlanBudjectEntriesByYear();
      if (!Array.isArray(response)) return;

      const filteredParentAccounts = response.filter(
        (account) => account.accountPlan?.type === 'budject'
      );
      setAccounts(filteredParentAccounts);

      const filteredAccounts = response.filter(
        (account) =>
          account.accountPlan?.type === 'budject' &&
          account.accountPlan?.writable === 'moviment'
      );

      const avalueAList = response.filter(
        (account) =>
          account.accountPlan?.type === 'budject' &&
          account.accountPlan?.finalAllocationType === 'A'
      );
      const avalueA4List = response.filter(
        (account) =>
          account.accountPlan?.type === 'budject' &&
          account.accountPlan?.finalAllocationType === 'A4'
      );
      const avalueL4List = response.filter(
        (account) =>
          account.accountPlan?.type === 'budject' &&
          account.accountPlan?.finalAllocationType === 'L4'
      );
      const avalueA7List = response.filter(
        (account) =>
          account.accountPlan?.type === 'budject' &&
          account.accountPlan?.finalAllocationType === 'A7'
      );
      const avalueA8List = response.filter(
        (account) =>
          account.accountPlan?.type === 'budject' &&
          account.accountPlan?.finalAllocationType === 'A8'
      );
      const avalueL5List = response.filter(
        (account) =>
          account.accountPlan?.type === 'budject' &&
          account.accountPlan?.finalAllocationType === 'L5'
      );
      const avalueL6List = response.filter(
        (account) =>
          account.accountPlan?.type === 'budject' &&
          account.accountPlan?.finalAllocationType === 'L6'
      );
      const avalueA3List = response.filter(
        (account) =>
          account.accountPlan?.type === 'budject' &&
          account.accountPlan?.finalAllocationType === 'A3'
      );

      const contaLaparit = response.filter((account) => account.parentId === 420);
      const contaLaparitL1 = response.filter((account) => account.parentId === 422);

      const totalInitialAllocation = contaLaparit.reduce(
        (total, account) => total + (account.initialAllocation || 0),
        0
      );
      const totalInitialAllocationL1 = contaLaparitL1.reduce(
        (total, account) => total + (account.initialAllocation || 0),
        0
      );

      setAvalueA1(totalInitialAllocationL1 + totalInitialAllocation);
      setAvalueA(
        (avalueAList[0]?.finalAllocation || 0) +
          (avalueL5List[0]?.finalAllocation || 0) +
          (avalueL6List[0]?.finalAllocation || 0) +
          (avalueA3List[0]?.finalAllocation || 0) +
          (avalueA4List[0]?.finalAllocation || 0) +
          (avalueL4List[0]?.finalAllocation || 0)
      );
      setAvalueA4(avalueA4List[0]?.finalAllocation || 0);
      setAvalueL4(avalueL4List[0]?.finalAllocation || 0);
      setAvalueA5(
        (avalueL5List[0]?.finalAllocation || 0) + (avalueL6List[0]?.finalAllocation || 0)
      );
      setAvalueA7(avalueA7List[0]?.finalAllocation || 0);
      setAvalueA8(avalueA8List[0]?.finalAllocation || 0);
      setAvalueA3(avalueA3List[0]?.finalAllocation || 0);

      setParentAccounts(filteredAccounts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccountsInitial = async () => {
    try {
      setLoading(true);
      const response = await fetchInitialAllocationsByParentId();
      if (Array.isArray(response)) {
        setValuesAccounts(response);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAllData = () => {
    loadAccounts();
    loadAccountsFiltered();
    findAccountPlanConformance();
    loadAccountsInitial();
    validateInitialAllocationApprovalDateValidate();
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const organizeAccounts = (accountsList) => {
    const accountMap = {};
    const roots = [];
    accountsList.forEach((account) => {
      account.children = [];
      accountMap[account.id] = account;
    });
    accountsList.forEach((account) => {
      if (account.parentId) {
        const parentAccount = accountMap[account.parentId];
        if (parentAccount) {
          parentAccount.children.push(account);
        }
      } else {
        roots.push(account);
      }
    });
    return roots;
  };

  const organizedAccounts = organizeAccounts(accounts);

  function calculateTotals(account) {
    let totalInitialAllocation = account.initialAllocation || 0;
    let totalFinalAllocation = account.finalAllocation || 0;

    account.children.forEach((child) => {
      const childTotals = calculateTotals(child);
      totalInitialAllocation += childTotals.initial;
      totalFinalAllocation += childTotals.final;
    });
    account.totalInitialAllocation = totalInitialAllocation;
    account.totalFinalAllocation = totalFinalAllocation;

    return {
      initial: totalInitialAllocation,
      final: totalFinalAllocation
    };
  }

  useEffect(() => {
    organizedAccounts.forEach((account) => calculateTotals(account));
  }, [accounts]);

  const calculateChildrenAllocation = (account) => {
    let total = 0;
    if (account.children && Array.isArray(account.children)) {
      account.children.forEach((child) => {
        const initialAllocationEntry = child.entriesEntry?.find(
          (entry) => entry.type === 'initial_allocation'
        );
        const initialAllocation = initialAllocationEntry ? initialAllocationEntry.allocation : 0;
        total += initialAllocation;
      });
    }
    return total;
  };

  const calculateChildrenAllocationA2 = (account) => {
    let total = 0;
    const processChildren = (children) => {
      if (children && Array.isArray(children)) {
        children.forEach((child) => {
          if (!child.entriesEntry || child.entriesEntry.length === 0) {
            if (child.children && Array.isArray(child.children)) {
              processChildren(child.children);
            }
          } else {
            const initialAllocationEntry = child.entriesEntry.find(
              (entry) => entry.type === 'initial_allocation'
            );
            const initialAllocation = initialAllocationEntry
              ? initialAllocationEntry.allocation
              : 0;
            total += initialAllocation;
          }
        });
      }
    };
    processChildren(account.children);
    return total;
  };

  const calculateFinalAllocation = (account) => {
    let totalAllocation = 0;
    const finalAllocationType = account.accountPlan?.finalAllocationType;

    const initialAllocationEntry = account.entriesEntry?.find(
      (entry) => entry.type === 'initial_allocation'
    );
    const initialAllocation = initialAllocationEntry ? initialAllocationEntry.allocation : 0;

    if (
      ['L', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9'].includes(finalAllocationType)
    ) {
      totalAllocation += calculateChildrenAllocation(account);
    } else if (finalAllocationType === 'A') {
      totalAllocation = totalCurrentExpenses;
    } else if (finalAllocationType === 'L4') {
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
      totalAllocation = avalueA4;
    } else if (finalAllocationType === 'A5') {
      totalAllocation = avalueA5;
    } else if (finalAllocationType === 'A7' || finalAllocationType === 'A8') {
      totalAllocation = avalueA7;
    } else {
      totalAllocation += initialAllocation || 0;
    }
    return totalAllocation;
  };

  const calculateFinalAllocationTotal = (accountsList, type) => {
    let totalAllocation = 0;
    if (type === 'AFF') {
      const relevantAccounts = accountsList.filter((acc) =>
        ['A3', 'A2', 'L4', 'L5', 'L6', 'L2', 'L3'].includes(acc.accountPlan?.finalAllocationType)
      );
      relevantAccounts.forEach((accountItem) => {
        totalAllocation += (accountItem.children || []).reduce((acc, child) => {
          return acc + calculateFinalAllocation(child);
        }, 0);
      });
    } else if (type === 'AFC') {
      const relevantAccounts = accountsList.filter((acc) =>
        ['L7', 'L8', 'L9'].includes(acc.accountPlan?.finalAllocationType)
      );
      relevantAccounts.forEach((accountItem) => {
        totalAllocation += (accountItem.children || []).reduce((acc, child) => {
          return acc + calculateFinalAllocation(child);
        }, 0);
      });
    } else {
      totalAllocation += accountsList.finalAllocation || 0;
    }
    return totalAllocation;
  };

  const totalCurrentExpenses = calculateFinalAllocationTotal(accounts, 'AFF');
  const totalCapitalExpenses = calculateFinalAllocationTotal(accounts, 'AFC');
  const totalGlobalBudget = totalCurrentExpenses + totalCapitalExpenses;
  const totalCurrentContraValor = totalCurrentExpenses * 2.5;
  const totalCurrentDuodecimo = totalCurrentContraValor / 12;
  const totalCapitalContraValor = totalCapitalExpenses * 2.5;
  const totalCapitalDuodecimo = totalCapitalContraValor / 12;
  const totalGlobalContraValor = totalGlobalBudget * 2.5;
  const totalGlobalDuodecimo = totalGlobalContraValor / 12;

  const handleConformityValidation = () => {
    if (!finality) {
      Swal.fire({
        title: 'Operação não permitida!',
        text: 'Este processo não pode ser conformado porque o Adido Financeiro ainda não finalizou o lançamento dos dados.',
        icon: 'warning'
      });
      return;
    }

    Swal.fire({
      title: 'Tem certeza que deseja validar o orçamento?',
      text: 'Esse processo irá validar todo orçamento inicial e aplicar conformidade oficial!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, validar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Informe o motivo da validação',
          input: 'textarea',
          inputPlaceholder: 'Digite o parecer / motivo da validação...',
          inputAttributes: {
            'aria-label': 'Motivo da validação'
          },
          showCancelButton: true,
          confirmButtonText: 'Confirmar Conformidade',
          cancelButtonText: 'Cancelar',
          preConfirm: (observacao) => {
            if (!observacao || observacao.trim() === '') {
              Swal.showValidationMessage('O motivo da validação é obrigatório!');
              return false;
            }
            return observacao.trim();
          }
        }).then(async (obsResult) => {
          if (obsResult.isConfirmed && obsResult.value) {
            try {
              setLoading(true);
              const data = {
                conformityType: 'initial_allocation',
                observation: obsResult.value,
                userId: savedUserData?.id
              };
              await conformInitialAllocation(data);
              Swal.fire('Conformidade Validada!', `Parecer: ${obsResult.value}`, 'success');
              refreshAllData();
            } catch (error) {
              Swal.fire({
                icon: 'error',
                title: 'Erro ao validar a conformidade',
                text: String(error)
              });
            } finally {
              setLoading(false);
            }
          }
        });
      }
    });
  };

  const matchesSearch = (account) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const selfMatch =
      String(account.accountPlan?.number || '')
        .toLowerCase()
        .includes(term) ||
      String(account.accountPlan?.description || '')
        .toLowerCase()
        .includes(term);
    if (selfMatch) return true;
    if (account.children && account.children.length > 0) {
      return account.children.some((child) => matchesSearch(child));
    }
    return false;
  };

  const renderAccountRows = (account, level = 0) => {
    if (!matchesSearch(account)) return null;

    const isParentAccount = account.children && account.children.length > 0;
    const finalAllocation = calculateFinalAllocation(account);
    const usdValue = Number((finalAllocation * exchangeRate)?.toFixed(2) || 0);
    const totalContraValor = finalAllocation * exchangeRate;
    const totalDuoDecimo = Number((usdValue / 12).toFixed(2));

    const handleRowClick = () => {
      Swal.fire({
        title: `Rubrica Orçamental: ${account.accountPlan?.number}`,
        html: `
          <div style="text-align:left; font-size:0.92rem; line-height:1.7;">
            <div><strong>Código:</strong> ${account.accountPlan?.number}</div>
            <div><strong>Designação:</strong> ${account.accountPlan?.description}</div>
            <div><strong>Tipo:</strong> ${isParentAccount ? 'Conta Agregadora (Parente)' : 'Conta de Movimento'}</div>
            <hr style="margin:8px 0;" />
            <div><strong>Dotação Inicial (USD):</strong> ${formatNumber(finalAllocation)}</div>
            <div><strong>Contra Valor:</strong> ${formatNumber(totalContraValor)}</div>
            <div><strong>Duodécimo Mensal:</strong> ${formatNumber(totalDuoDecimo)}</div>
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Fechar'
      });
    };

    return (
      <React.Fragment key={account.accountPlan?.number || account.id}>
        <tr
          className={isParentAccount ? 'sgf-row-parent' : ''}
          onDoubleClick={handleRowClick}
          style={{ cursor: 'pointer' }}
          title={account.accountPlan?.description || 'Duplo clique para ver detalhes da rubrica'}
        >
          <td style={{ paddingLeft: `${10 + level * 12}px`, whiteSpace: 'nowrap' }}>
            <span
              className="sgf-code-badge"
              style={{
                backgroundColor: isParentAccount ? '#eaf5ef' : '#f8fafc',
                color: isParentAccount ? '#0f5132' : '#334155',
                borderColor: isParentAccount ? '#cce3d6' : '#e2e8f0'
              }}
            >
              {account.accountPlan?.number}
            </span>
          </td>
          <td
            className="sgf-desc-cell"
            style={{
              paddingLeft: `${8 + level * 10}px`,
              fontWeight: isParentAccount ? 700 : 500,
              color: isParentAccount ? '#0f291e' : '#334155'
            }}
            title={account.accountPlan?.description}
          >
            {account.accountPlan?.description}
          </td>
          <td
            style={{
              textAlign: 'right',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: isParentAccount ? 700 : 500,
              whiteSpace: 'nowrap'
            }}
          >
            {finalAllocation ? formatNumber(finalAllocation) : '0.00'}
          </td>
          <td
            style={{
              textAlign: 'right',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: isParentAccount ? 700 : 500,
              whiteSpace: 'nowrap'
            }}
          >
            {formatNumber(usdValue)}
          </td>
          <td
            style={{
              textAlign: 'right',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: isParentAccount ? 700 : 500,
              whiteSpace: 'nowrap',
              color: isParentAccount ? '#92400e' : '#475569'
            }}
          >
            {formatNumber(totalDuoDecimo)}
          </td>
        </tr>

        {account.children &&
          account.children.map((childAccount) => renderAccountRows(childAccount, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="sgf-page-wrapper">
      {/* Banner Institucional de Cabeçalho e Ação de Conformidade */}
      <div
        className="sgf-page-header"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div>
          <div className="d-flex align-items-center" style={{ gap: '10px', marginBottom: '4px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                backgroundColor: isConformed ? '#ecfdf5' : '#fef3c7',
                color: isConformed ? '#065f46' : '#92400e',
                border: `1px solid ${isConformed ? '#a7f3d0' : '#fde68a'}`
              }}
            >
              {isConformed ? <FaCheckCircle /> : <FaExclamationTriangle />}
              {isConformed ? 'Orçamento Conforme' : 'Conformidade Pendente'}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: finality ? '#eef5f1' : '#f1f5f9',
                color: finality ? '#0f5132' : '#64748b',
                border: '1px solid #d8e2dc'
              }}
            >
              {finality ? 'Submetido pelo Adido Financeiro' : 'Aguardando Fecho do Adido'}
            </span>
          </div>
          <h2 className="sgf-page-title">Conformidade da Tabela de Despesas</h2>
          <p className="sgf-page-subtitle">
            Verificação institucional das dotações iniciais, contravalores e duodécimos do exercício económico ativo
          </p>
        </div>

        <div className="d-flex flex-wrap align-items-center" style={{ gap: '8px' }}>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={refreshAllData}
            title="Atualizar dados de conformidade"
          >
            <FaSyncAlt style={{ marginRight: '5px' }} />
            Atualizar
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={handleConformityValidation}
            disabled={isConformed}
            style={{
              backgroundColor: isConformed ? '#94a3b8' : '#0f5132',
              borderColor: isConformed ? '#94a3b8' : '#0f5132',
              fontWeight: 600
            }}
          >
            <FaShieldAlt style={{ marginRight: '6px' }} />
            {isConformed ? 'Conformidade Validada' : 'Validar Conformidade do Orçamento'}
          </Button>
        </div>
      </div>

      {/* 4 Cards Executivos Compactos de Resumo e Estado */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '8px',
          marginBottom: '8px'
        }}
      >
        {/* Card 1: Estado de Conformidade */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '10px',
            padding: '8px 12px',
            border: `1px solid ${isConformed ? '#a7f3d0' : '#fde68a'}`,
            borderTop: `3px solid ${isConformed ? '#0f5132' : '#b45309'}`,
            boxShadow: '0 2px 6px rgba(15, 41, 30, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#64748b'
                }}
              >
                Estado da Folha Orçamental
              </div>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: isConformed ? '#0f5132' : '#b45309',
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isConformed ? (
                  <>
                    <FaCheckCircle style={{ color: '#0d6832' }} />
                    CONFORME
                  </>
                ) : (
                  <>
                    <FaExclamationTriangle style={{ color: '#b45309' }} />
                    PENDENTE
                  </>
                )}
              </div>
            </div>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: isConformed ? '#eaf5ef' : '#fef3c7',
                color: isConformed ? '#0f5132' : '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.95rem'
              }}
            >
              <FaChartLine />
            </div>
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: '#475569',
              marginTop: '6px',
              paddingTop: '6px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>Câmbio: <strong>{exchangeRate.toFixed(2)}</strong></span>
            <span style={{ color: '#0f5132', fontWeight: 600 }}>Abrir Mapa →</span>
          </div>
        </div>

        {/* Card 2: Despesas Correntes */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '10px',
            padding: '10px 14px',
            border: '1px solid #d8e2dc',
            borderTop: '3px solid #0f5132',
            boxShadow: '0 2px 6px rgba(15, 41, 30, 0.05)'
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#64748b'
                }}
              >
                Despesas Correntes (USD)
              </div>
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#0f291e',
                  fontFamily: "'JetBrains Mono', monospace",
                  marginTop: '2px'
                }}
              >
                {formatNumber(totalCurrentExpenses)}
              </div>
            </div>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#eaf5ef',
                color: '#0f5132',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaLayerGroup />
            </div>
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: '#475569',
              marginTop: '6px',
              paddingTop: '6px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>C. Valor: <strong>{formatNumber(totalCurrentContraValor)}</strong></span>
            <span>Duod.: <strong>{formatNumber(totalCurrentDuodecimo)}</strong></span>
          </div>
        </div>

        {/* Card 3: Despesas de Capital */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '10px',
            padding: '10px 14px',
            border: '1px solid #d8e2dc',
            borderTop: '3px solid #146c43',
            boxShadow: '0 2px 6px rgba(15, 41, 30, 0.05)'
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#64748b'
                }}
              >
                Despesas de Capital (USD)
              </div>
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#0f291e',
                  fontFamily: "'JetBrains Mono', monospace",
                  marginTop: '2px'
                }}
              >
                {formatNumber(totalCapitalExpenses)}
              </div>
            </div>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#eaf5ef',
                color: '#146c43',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaCoins />
            </div>
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: '#475569',
              marginTop: '6px',
              paddingTop: '6px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>C. Valor: <strong>{formatNumber(totalCapitalContraValor)}</strong></span>
            <span>Duod.: <strong>{formatNumber(totalCapitalDuodecimo)}</strong></span>
          </div>
        </div>

        {/* Card 4: Orçamento Global */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '10px',
            padding: '10px 14px',
            border: '1px solid #fde68a',
            borderTop: '3px solid #b45309',
            boxShadow: '0 2px 6px rgba(15, 41, 30, 0.05)'
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#92400e'
                }}
              >
                Orçamento Global (USD)
              </div>
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#b45309',
                  fontFamily: "'JetBrains Mono', monospace",
                  marginTop: '2px'
                }}
              >
                {formatNumber(totalGlobalBudget)}
              </div>
            </div>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaCalculator />
            </div>
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: '#475569',
              marginTop: '6px',
              paddingTop: '6px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>C. Valor: <strong>{formatNumber(totalGlobalContraValor)}</strong></span>
            <span>Duod.: <strong>{formatNumber(totalGlobalDuodecimo)}</strong></span>
          </div>
        </div>
      </div>

      {/* Card Principal: Tabela Completa de Conformidade */}
      <div className="card">
        <div className="card-header flex-wrap gap-2">
          <div>
            <span style={{ fontWeight: 700, color: '#0f291e', fontSize: '0.88rem' }}>
              Mapa Geral de Dotações para Conformidade
            </span>
            <span style={{ color: '#64748b', fontSize: '0.74rem', marginLeft: '8px' }}>
              (Duplo clique numa rubrica para inspecionar detalhe)
            </span>
          </div>

          <div className="d-flex flex-wrap align-items-center" style={{ gap: '6px' }}>
            <div style={{ position: 'relative', minWidth: '230px' }}>
              <FaSearch
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '0.78rem'
                }}
              />
              <Form.Control
                type="text"
                placeholder="Pesquisar código ou rubrica..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '30px', height: '30px', fontSize: '0.78rem' }}
              />
            </div>

            <Button variant="success" size="sm" onClick={exportToExcelExtrato}>
              <FaFileExcel style={{ marginRight: '4px' }} /> Excel
            </Button>
            <Button variant="danger" size="sm" onClick={exportToPDFExtrato}>
              <FaFilePdf style={{ marginRight: '4px' }} /> PDF
            </Button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <Table id="tableBudjectMap" hover className="table mb-0">
            <thead>
              <tr>
                <th rowSpan={2} style={{ verticalAlign: 'middle', width: '16%' }}>
                  Código
                </th>
                <th rowSpan={2} style={{ verticalAlign: 'middle', width: '42%' }}>
                  Designação da Rubrica
                </th>
                <th
                  colSpan={2}
                  style={{
                    textAlign: 'center',
                    backgroundColor: '#eef5f1',
                    color: '#0f5132',
                    borderBottom: '1px solid #d8e2dc'
                  }}
                >
                  Dotação Inicial Aprovada
                </th>
                <th
                  colSpan={1}
                  style={{
                    textAlign: 'center',
                    backgroundColor: '#fef9ee',
                    color: '#92400e',
                    borderBottom: '1px solid #fde68a'
                  }}
                >
                  Duodécimo Mensal
                </th>
              </tr>
              <tr>
                <th style={{ textAlign: 'right', width: '14%' }}>USD</th>
                <th style={{ textAlign: 'right', width: '14%' }}>Contra Valor</th>
                <th style={{ textAlign: 'right', width: '14%' }}>Contra Valor</th>
              </tr>
            </thead>
            <tbody>
              {organizedAccounts.length > 0 ? (
                organizedAccounts.map((account) => renderAccountRows(account))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    Nenhuma rubrica orçamental encontrada para o exercício ativo.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f4f8f5', fontWeight: 700 }}>
                <td></td>
                <td style={{ color: '#0f5132' }}>Totais de Despesas Correntes</td>
                <td style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatNumber(totalCurrentExpenses)}
                </td>
                <td style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatNumber(totalCurrentContraValor)}
                </td>
                <td style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatNumber(totalCurrentDuodecimo)}
                </td>
              </tr>
              <tr style={{ backgroundColor: '#f4f8f5', fontWeight: 700 }}>
                <td></td>
                <td style={{ color: '#0f5132' }}>Totais de Despesas de Capital</td>
                <td style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatNumber(totalCapitalExpenses)}
                </td>
                <td style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatNumber(totalCapitalContraValor)}
                </td>
                <td style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatNumber(totalCapitalDuodecimo)}
                </td>
              </tr>
              <tr
                style={{
                  backgroundColor: '#fef9ee',
                  fontWeight: 800,
                  borderTop: '2px solid #fde68a'
                }}
              >
                <td></td>
                <td style={{ color: '#92400e' }}>Total Orçamento Global</td>
                <td
                  style={{
                    textAlign: 'right',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#92400e'
                  }}
                >
                  {formatNumber(totalGlobalBudget)}
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#92400e'
                  }}
                >
                  {formatNumber(totalGlobalContraValor)}
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#92400e'
                  }}
                >
                  {formatNumber(totalGlobalDuodecimo)}
                </td>
              </tr>
            </tfoot>
            </Table>
          </div>
        </div>
      </div>

      <Spinner isLoading={loading} />

      <ConformanceModalTabel
        show={showModal}
        handleClose={() => setShowModal(false)}
        organizedAccounts={organizedAccounts}
        renderAccountRows={renderAccountRows}
        isConformed={isConformed}
        exportToExcel={exportToExcelExtrato}
        exportToPDF={exportToPDFExtrato}
        handleConformityValidation={handleConformityValidation}
      />
    </div>
  );
};

export default BudjectConformance;
