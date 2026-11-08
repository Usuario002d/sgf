import React, { useEffect, useState } from 'react';
import { findAccountPlanBudjectEntriesByYear } from '../services/accountService';
import PopupNotification from '../config/Pop-up/PopupNotification';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import 'datatables.net-bs4';
import './styles.css';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const OrcamnetalAllocationReport = () => {
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });
  const [accounts, setAccounts] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(5); // Taxa de câmbio padrão
  const [showTable, setShowTable] = useState(false); // Controle para exibir/ocultar tabela
  const [viewingInitial, setViewingInitial] = useState(true); // Controla se está exibindo inicial ou final

  // Carregar contas da API
  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await findAccountPlanBudjectEntriesByYear();
      console.log("Contas recebidas:", response);
      setAccounts(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    // Calcula os totais para cada conta
    organizedAccounts.forEach(account => calculateTotals(account));
  }, [accounts]);

  useEffect(() => {
    if (accounts.length > 0) {
      // Inicialize o DataTable somente após a tabela ser renderizada
      setTimeout(() => {
        $('#accountsTable').DataTable({
          ordering: false,
          paging: true,
          searching: true,
          info: true,
        });
      }, 0); // Usa timeout de 0 para garantir que o DataTable só seja inicializado após o render
    }
  }, [accounts]);

  const organizeAccounts = (accounts) => {
    const accountMap = {};
    const parentAccounts = [];

    // Criar um mapa de contas
    accounts.forEach(account => {
        account.children = []; // Inicializa a lista de filhos
        accountMap[account.id] = account; // Mapeia contas pelo ID
    });

    // Organizar contas em hierarquia
    accounts.forEach(account => {
        if (account.parentId) {
            const parentAccount = accountMap[account.parentId];
            if (parentAccount) {
                parentAccount.children.push(account); // Adiciona como filho
            }
        } else {
            parentAccounts.push(account); // É uma conta mãe
        }
    });

    // Função recursiva para garantir que todas as contas sejam organizadas
    const organizeHierarchy = (account) => {
        if (account.children.length > 0) {
            account.children.forEach(child => organizeHierarchy(child)); // Organiza recursivamente os filhos
        }
    };

    // Organiza a hierarquia para cada conta mãe
    parentAccounts.forEach(account => organizeHierarchy(account));

    return parentAccounts; // Retorna as contas mães
  };

  // Função para calcular os totais apenas dos filhos diretos da conta (não recursivo)
  function calculateTotals(account) {
    let totalInitialAllocation = account.initialAllocation || 0; // Garantir valor default
    let totalFinalAllocation = account.finalAllocation || 0; // Garantir valor default

    // Se houver filhos, soma seus totais diretamente (sem somar netos)
    account.children.forEach(child => {
        const childTotals = calculateTotals(child); // Calcular recursivamente apenas para filhos diretos
        totalInitialAllocation += childTotals.initial; // Somar os totais dos filhos diretos
        totalFinalAllocation += childTotals.final;
    });

    // Armazena os totais na conta
    account.totalInitialAllocation = totalInitialAllocation;
    account.totalFinalAllocation = totalFinalAllocation;

    return {
        initial: totalInitialAllocation,
        final: totalFinalAllocation,
    };
  }

  // Função para calcular o total em USD para uma conta, agora somando apenas os filhos diretos
  const calculateTotalUSD = (account) => {
    return account.children.reduce((total, child) => {
      // Somar apenas a alocação final das contas filhos diretas
      return total + (child.finalAllocation || 0);
    }, 0);
  };

  // Calcular total de contra valor com base na taxa de câmbio
  const calculateTotalContraValor = (account) => {
    return (account.totalInitialAllocation || 0) * exchangeRate;
  };

  const handleClosePopup = () => {
    setPopup({ show: false, message: '', type: '' });
  };

  const renderAccountRows = (account, level = 0) => {
    const indentation = ' '.repeat(level * 2); // Indentação para mostrar o nível hierárquico
    const isParentAccount = account.children.length > 0; // Verifica se é uma conta mãe
    const totalUSD = calculateTotalUSD(account); // Calculando o total em USD
    const allocationValue = viewingInitial ? account.initialAllocation : account.finalAllocation; // Alterna entre initialAllocation e finalAllocation
    const usdValue = (allocationValue * exchangeRate)?.toFixed(2) || 0; // Calculando o valor em USD (convertido para MZN)
  
    return (
      <>
        <tr key={account.accountPlan.number} className={isParentAccount ? 'table-success' : ''}>
          <td>{indentation}{account.accountPlan.number}</td>
          <td>{indentation}{account.accountPlan.description}</td>
          <td className="text-right">{allocationValue?.toFixed(2) || 0}</td>
          <td className="text-right">{usdValue}</td> {/* Exibindo o valor USD convertido para MZN */}
          <td className="text-right">{calculateTotalContraValor(account).toFixed(2) || 0}</td>
        </tr>
        {/* Renderiza as contas filhas de forma recursiva */}
        {account.children.map((childAccount) => renderAccountRows(childAccount, level + 1))}
      </>
    );
  };

  const organizedAccounts = organizeAccounts(accounts);

  // Função para exportar como Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.table_to_sheet(document.getElementById('accountsTable'));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dotação Orçamental');
    XLSX.writeFile(wb, 'dotacao_orcamental.xlsx');
  };

  // Função para exportar como PDF
  const exportToPDF = () => {
    const input = document.getElementById('accountsTable');
    html2canvas(input, {
      scale: 2, // Aumenta a resolução para uma melhor qualidade
      useCORS: true, // Garante que recursos externos sejam carregados corretamente
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // PDF no formato retrato
  
      const pdfWidth = pdf.internal.pageSize.getWidth(); // Largura da página PDF
      const pdfHeight = pdf.internal.pageSize.getHeight(); // Altura da página PDF
      const imgWidth = pdfWidth - 20; // Margem de 10 mm nas laterais
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Proporção da altura com base na largura
  
      let heightLeft = imgHeight; // Altura restante para renderizar
      let position = 10; // Margem inicial
  
      // Adiciona a imagem em partes no PDF
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20; // Desconta a altura usada na primeira página
  
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 20; // Define a posição para a próxima página
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20; // Calcula a altura restante
      }
  
      // Salva o PDF
      pdf.save('dotacao_orcamental.pdf');
    });
  };
  
  

  return (
    <div className="container mt-5">
      <h3 className="header text-center mb-4 font-weight-bold">Dotação Orçamental</h3>

      {/* Botões para alternar entre Dotação Inicial e Final */}
      <div className="mb-4 text-center">
      <button
        className={`btn ${viewingInitial ? 'btn-secondary active' : 'btn-light'} mr-3`}  // Alterado com estilo condicional
        onClick={() => { setViewingInitial(true); setShowTable(true); }}
      >
        Dotação Inicial
      </button>
      <button
        className={`btn ${!viewingInitial ? 'btn-dark active' : 'btn-light'}`}  // Alterado com estilo condicional
        onClick={() => { setViewingInitial(false); setShowTable(true); }}
      >
        Dotação Final
      </button>
    </div>
      {/* A tabela e os botões de exportação só ficam visíveis após clicar em um dos botões */}
      {showTable && (
        <div>
          <div className="mb-4 text-center">
            <button className="btn btn-success mr-3" onClick={exportToExcel}>Exportar para Excel</button>
            <button className="btn btn-danger" onClick={exportToPDF}>Exportar para PDF</button>
          </div>

          <table
  id="accountsTable"
  className="table table-striped table-bordered"
  style={{
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    tableLayout: 'fixed',
  }}
>
  <thead style={{ backgroundColor: '#f4f4f4', textAlign: 'center' }}>
    <tr>
      <th style={{ padding: '10px', fontWeight: 'bold' }}>Conta</th>
      <th style={{ padding: '10px', fontWeight: 'bold' }}>Descrição</th>
      <th className="text-right" style={{ padding: '10px', fontWeight: 'bold' }}>Dotação</th>
      <th className="text-right" style={{ padding: '10px', fontWeight: 'bold' }}>USD</th>
      <th className="text-right" style={{ padding: '10px', fontWeight: 'bold' }}>Contra Valor</th>
    </tr>
  </thead>
  <tbody style={{ textAlign: 'right' }}>
    {organizedAccounts.map(account => renderAccountRows(account))}
  </tbody>
</table>

        </div>
      )}

      {/* Carregamento e mensagens de erro */}
      {popup.show && <PopupNotification message={popup.message} type={popup.type} onClose={handleClosePopup} />}
    </div>
  );
};

export default OrcamnetalAllocationReport;
