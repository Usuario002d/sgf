import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { fetchAccountPlanEntriesByYearByfilters, findAccountPlanBudjectEntriesByYear, fetchAccountPlanBudjectEntriesByYear, fetchInitialAllocationsByParentId, fetchSummationAccountEntriesEntry, setCreateAccountPlanBudjectEntry } from '../../services/accountService';
import { Card, Button, Form, DropdownButton, Dropdown, Modal } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { DateTime } from 'luxon';
import './style.css';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import templatePDF from '../BudgetChange/component/templatePDF'; // Caminho correto pro seu template
import logoMz from '../../assets/img/logoMz.png';
import { FaMoneyBill, FaSearch } from "react-icons/fa";
import { FaFileExcel, FaFilePdf, FaInfoCircle, FaTimes, FaExclamationCircle } from 'react-icons/fa';



const PlanBudgetReport = () => {
  const [filter, setFilter] = useState('all'); // Estado para armazenar o filtro selecionado

  // Função para aplicar o filtro
  const applyFilter = (entryType) => {
    setFilter(entryType);
  };
  let totalContraValor = 0;

  const [selectedReport, setSelectedReport] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [accountsInitial, setAccountsInitial] = useState([]);
  const [loading, setLoading] = useState(false); // Estado para gerenciar o carregamento
  const [exchangeRate, setExchangeRate] = useState(2.5);
  const [parentAccounts, setParentAccounts] = useState([]);
  const [valuesAccounts, setValuesAccounts] = useState([]);
  const [filterCode, setFilterCode] = useState('');
  const [valueMovimentAccount, setvalueMovimentAccount] = useState([]);
  const [firistAccounts, setFiristAccounts] = useState([]);
  const [selectedAccountName, setSelectedAccountName] = useState('');
  const [localParentAccounts, setLocalParentAccounts] = useState(parentAccounts);
  const [avalueA, setAvalueA] = useState([]);
  const [avalueA1, setAvalueA1] = useState([]);
  const [avalueA4, setAvalueA4] = useState([]);
  const [avalueL4, setAvalueL4] = useState([]);
  const [avalueA5, setAvalueA5] = useState([]);
  const [avalueA7, setAvalueA7] = useState([]);
  const [avalueA8, setAvalueA8] = useState([]);
  const [avalueL, setAvalueL] = useState([]);
  const [avalueA3, setAvalueA3] = useState([]);
  const [filters, setFilters] = useState({
    accountPlanId: "",
    startDate: "",
    endDate: ""
  });
  const [accountSelected, setAccountSelected] = useState([]);
  const [accountSelectedGone, setAccountSelectedGone] = useState([]);
  const [showWithMovement, setShowWithMovement] = useState(true);
  const [showWithoutMovement, setShowWithoutMovement] = useState(true);

  const handleStartDateChange = (event) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      startDate: event.target.value
    }));
  };

  const handleEndDateChange = (event) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      endDate: event.target.value
    }));
  };

  const [showModal, setShowModal] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);
  const [showExtract, setShowExtract] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    codSend: '',
    descricao: '',
    dotacaoInicial: '',
    reforco: '',
    anulaçãoReducao: '',
    transferir: ''
  });

  const styles = {
    container: {
      display: 'flex',
      gap: '15px',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '12px 20px',
      background: 'linear-gradient(135deg, #f8faf9 0%, #ffffff 100%)',
      border: '1px solid #b7dec9',
      borderRadius: '10px',
      margin: '10px 0 16px 0',
      boxShadow: '0 2px 8px rgba(15, 81, 50, 0.08)'
    },
    excelButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#0f5132',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '9px 20px',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 6px rgba(15, 81, 50, 0.25)'
    },
    pdfButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#b45309',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '9px 20px',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 6px rgba(180, 83, 9, 0.25)'
    },
    icon: {
      fontSize: '18px',
      color: '#fff'
    }
  };


  const handleSearch = async () => {
    setLoading(true);


    if (!filters.accountPlanId) {
      setLoading(false);
      return Swal.fire({
        icon: 'error',
        title: 'Campo obrigatório',
        text: 'O plano de conta é obrigatório para a pesquisa.',
        confirmButtonText: 'OK'
      });
    }

    const hasStartDate = Boolean(filters.startDate);
    const hasEndDate = Boolean(filters.endDate);

    if (hasStartDate !== hasEndDate) {
      setLoading(false);
      return showAlert({
        icon: 'error',
        title: 'Datas incompletas',
        text: 'Você deve preencher ambas as datas ou nenhuma.',
        confirmButtonText: 'OK'
      });
    }

    if (hasStartDate && hasEndDate) {
      const startDate = filters.startDate ? DateTime.fromISO(filters.startDate) : null;
      const endDate = filters.endDate ? DateTime.fromISO(filters.endDate) : null;

      if (!startDate?.isValid || !endDate?.isValid) {
        setLoading(false);
        return showAlert({
          icon: 'error',
          title: 'Datas inválidas',
          text: 'Por favor, insira datas no formato correto (YYYY-MM-DD).',
          confirmButtonText: 'OK'
        });
      }

      if (startDate && endDate && startDate > endDate) {
        setLoading(false);
        return showAlert({
          icon: 'error',
          title: 'Datas inconsistentes',
          text: 'A data final não pode ser anterior à data inicial.',
          confirmButtonText: 'OK'
        });
      }
    }

    try {
      const response = await fetchAccountPlanEntriesByYearByfilters({
        ...filters,
        startDate: filters.startDate && DateTime.fromISO(filters.startDate).isValid
          ? DateTime.fromISO(filters.startDate).toISODate()
          : undefined,
        endDate: filters.endDate && DateTime.fromISO(filters.endDate).isValid
          ? DateTime.fromISO(filters.endDate).toISODate()
          : undefined
      });

      setLocalParentAccounts(response);

      setAccountSelected(accountSelectedGone)


      if (response.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Nenhum resultado',
          text: 'Não foram encontrados registros com os filtros aplicados.',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erro na consulta',
        text: 'Ocorreu um erro ao buscar os dados. Por favor, tente novamente.',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCodigoChangeExtract = (e) => {
    const selectedCodigo = e.target.value;
    const filteredAccounts = parentAccounts.filter(account =>
      account.accountPlan.number === selectedCodigo
    );

    setAccountSelectedGone(filteredAccounts)

    console.log("contafiltrada", filteredAccounts)

    if (filteredAccounts.length > 0) {
      setFilters(prevFilters => ({
        ...prevFilters,
        accountPlanId: filteredAccounts[0].accountPlan.id
      }));
    } else {
      setFilters(prevFilters => ({
        ...prevFilters,
        accountPlanId: null
      }));
    }
  };

  const exportToPDF12 = () => {
    // 1. Título e subtítulo
    const title = "PLANO E ORÇAMENTO ";
    const subtitle = "Tabela de Despesas";

    // 2. Cabeçalhos da tabela
    const headers = [
      ["Código", "Designação", "Dotação Inicial (USD)", "Dotação Inicial (MZN)", "Duodécimo (USD)"]
    ];

    // 3. Dados da tabela principal
    const body = organizedAccountsInitial.flatMap((account) =>
      generatePDFRows(account).map(row => row.map(cell => cell.toString().trim()))
    );

    // 4. Totais formatados
    const totalRow = [
      "", "Total de Despesas Correntes:",
      formatNumber(totalCurrentContraValorData),
      formatNumber(totalMzn),
      formatNumber(totalDuedecimoData)
    ];
    const totalRow2 = [
      "", "Total de Despesas de Capital:",
      formatNumber(totalCurrentContraValorDataDespesas),
      formatNumber(totalMznDespesas),
      formatNumber(totalDuedecimoDataDespesas)
    ];
    const totalRow3 = [
      "", "Total Orçamento Global:",
      formatNumber(total),
      formatNumber(totalMznF),
      formatNumber(totalDuedecimoF)
    ];

    // 5. Junta corpo com os totais
    const fullBody = [...body, totalRow, totalRow2, totalRow3];

    // 6. Dados do rodapé e metadados
    const footerText = "Documento gerado automaticamente";
    const logoImage = logoMz; // imagem base64 ou URL
    const savedUserData = JSON.parse(localStorage.getItem("userData"));
    const generatedBy = savedUserData.fullName.toString();
    const filename = "tabela_de_despesas.pdf";

    // 7. Conteúdo da tabela no formato esperado pelo template
    const tableContent = {
      head: headers,
      body: fullBody,
      columnStyles: {
        0: { halign: 'left' },   // Código
        1: { halign: 'left' },   // Designação
        2: { halign: 'right' },  // USD
        3: { halign: 'right' },  // MZN
        4: { halign: 'right' }   // Duodécimo
      }
    };

    // 8. Geração do PDF via template
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


  const exportToPDF122 = () => {
    // 1. Título e subtítulo
    const title = "PLANO E ORÇAMENTO ";
    const subtitle = "Orçamento Disponível";

    // 2. Cabeçalhos da tabela
    const headers = [
      ["Código", "Designação", "Dotação Inicial", "Dotação Final", "Orçamento Disponível"]
    ];

    // 3. Dados da tabela principal
    const body = [];
    const rows = document.querySelectorAll("#tableBudjectDisponivel tbody tr");

    rows.forEach(row => {
      const rowData = [];
      row.querySelectorAll("td").forEach(cell => {
        rowData.push(cell.textContent.trim());
      });
      body.push(rowData);
    });

    // 4. Totais formatados
    const totalRow = [
      "", "Total de Despesas Correntes:",
      formatNumber(totalMzn),
      formatNumber(totalCurrentExpensesDisponivel * 2.5),
      formatNumber((totalCurrentExpensesDisponivel * 2.5).toFixed(2))
    ];

    const totalRow2 = [
      "", "Total de Despesas de Capital:",
      formatNumber(totalCurrentContraValorDataDespesas * 2.5),
      formatNumber(totalCapitalExpensesDisponivel * 2.5),
      formatNumber((totalCapitalExpensesDisponivel * 2.5).toFixed(2))
    ];

    const totalRow3 = [
      "", "Total de Orçamento Global:",
      formatNumber(totalMzn + (totalCurrentContraValorDataDespesas * 2.5)),
      formatNumber(totalGlobalBudget2 * 2.5),
      formatNumber((totalGlobalBudget2 * 2.5).toFixed(2))
    ];

    // 5. Junta corpo com os totais
    const fullBody = [...body, totalRow, totalRow2, totalRow3];

    // 6. Dados do rodapé e metadados
    const footerText = "Documento gerado automaticamente";
    const logoImage = logoMz; // imagem base64 ou URL
    const savedUserData = JSON.parse(localStorage.getItem("userData"));
    const generatedBy = savedUserData?.fullName || "Usuário desconhecido";
    const filename = "relatorio_orcamento_disponivel.pdf";


    // 7. Conteúdo da tabela no formato esperado pelo template

    const columnStyles = {
      0: { halign: 'left' },
      1: { halign: 'left' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    };

    // 8. Geração do PDF via template
    // Passando tudo junto e correto
    templatePDF({
      title,
      subtitle,
      footerText,
      logoImage,
      generatedBy,
      filename,
      tableContent: {
        head: headers,
        body: fullBody,
        columnStyles,  // Alinhamentos por coluna
      },
    });
  };



  const exportToExcel1 = () => {
    const table = document.getElementById('tableBudjectDisponivel');
    if (!table) {
      console.error('Tabela não encontrada!');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Extrato');


    // Configurar cabeçalho
    worksheet.mergeCells('A1:A2');
    worksheet.mergeCells('B1:B2');
    worksheet.mergeCells('C1:C2');
    worksheet.mergeCells('D1:D2');
    worksheet.mergeCells('E1:E2');

    worksheet.getCell('A1').value = 'Código';
    worksheet.getCell('B1').value = 'Descrição';
    worksheet.getCell('C1').value = 'Dotação Inicial';
    worksheet.getCell('D1').value = 'Dotação Final';
    worksheet.getCell('E1').value = 'Orçamento Disponível';

    worksheet.columns = [
      { key: 'codigo', width: 10 },
      { key: 'descricao', width: 60 },
      { key: 'dotacaoInicial', width: 20 },
      { key: 'dotacaoFinal', width: 20 },
      { key: 'orcamentoDisponivel', width: 25 },
    ];

    // Estilizar cabeçalho
    const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1'];

    headerCells.forEach((cell) => {
      const headerCell = worksheet.getCell(cell);
      headerCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF333333' } };

      // Definir alinhamento baseado no nome da célula
      if (cell === 'A1' || cell === 'B1') {
        headerCell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else {
        headerCell.alignment = { horizontal: 'right', vertical: 'middle' };
      }
    });

    // Preencher dados da tabela HTML
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, rowIndex) => {
      if (rowIndex === 0) return;

      const cells = row.querySelectorAll('td');
      cells.forEach((cell, cellIndex) => {
        const cellValue = cell.textContent.trim();
        const excelCell = worksheet.getCell(rowIndex + 2, cellIndex + 1);
        excelCell.value = cellValue;
        excelCell.font = { color: { argb: 'FF000000' } };

        // Alinhamento condicional
        if (cellIndex === 0 || cellIndex === 1) { // Código e Descrição
          excelCell.alignment = { horizontal: 'left', vertical: 'middle' };
        } else { // Outras colunas
          excelCell.alignment = { horizontal: 'right', vertical: 'middle' };
        }
      });
    });

    // Adicionar Totais ao Excel
    const totalExpensesCapital = (totalCurrentContraValorDataDespesas * 2.5);
    const totalExpensesCurrent = (totalCurrentExpenses * 2.5);
    //const totalGlobalBudget = totalMzn + totalExpensesCapital; // Se precisar usar

    // Criar as linhas de totais
    const totalRows = [
      [
        '',
        'Total de Despesas Correntes',
        formatNumber(totalMzn),
        formatNumber(totalCurrentExpensesDisponivel * 2.5),
        formatNumber((totalCurrentExpensesDisponivel * 2.5).toFixed(2)),
      ],
      [
        '',
        'Total de Despesas de Capital',
        formatNumber(totalCurrentContraValorDataDespesas * 2.5),
        formatNumber((totalCapitalExpensesDisponivel * 2.5).toFixed(2)),
        //formatNumber(((totalCapitalExpenses * 2.5) * 0.05).toFixed(2)),
        formatNumber((totalCapitalExpensesDisponivel * 2.5).toFixed(2)),
      ],
      [
        '',
        'Total Orçamento Global',
        formatNumber(totalMzn + (totalCurrentContraValorDataDespesas * 2.5)),
        formatNumber((totalGlobalBudget2 * 2.5)),
        formatNumber((totalGlobalBudget2 * 2.5).toFixed(2))
      ]
    ];

    // Adicionar as linhas de totais ao Excel
    totalRows.forEach(row => worksheet.addRow(row));

    // **Aplicar o alinhamento correto**
    const lastThreeRows = worksheet.lastRow.number - (totalRows.length - 1);
    for (let i = lastThreeRows; i <= worksheet.lastRow.number; i++) {
      const row = worksheet.getRow(i);
      row.eachCell((cell, colNumber) => {
        if (colNumber > 2) { // Alinhar somente valores numéricos (evitar colunas de descrição)
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        }
      });
    }
    // Obter as últimas três linhas
    const lastThreeRowsStart = worksheet.lastRow.number - 2; // Linha inicial das últimas 3 linhas
    for (let i = lastThreeRowsStart; i <= worksheet.lastRow.number; i++) {
      const row = worksheet.getRow(i);
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '7e827f' } // Cor cinza claro
        };
      });
    }

    // Salvar o arquivo
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer]), 'Orçamento_Disponível.xlsx');
    });
  };

  const exportToPDF1 = () => {
    const table = document.querySelector('#accountsTable');
    const rows = Array.from(table.querySelectorAll('tr'));
    const title = "PLANO E ORÇAMENTO";
    const subtitle = "Mapa de Alterações Orçamentais";
    const footerText = "Documento gerado automaticamente";
    const logoImage = logoMz;

    const savedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    const generatedBy = savedUserData?.fullName?.toString() || "Utilizador desconhecido";
    const filename = "Mapa_de_Alterações.pdf";


    // Cabeçalhos
    const head = [
      ["Código", "Designação", "Dotação Inicial",
        "Inscrição/Reforço", "Anulação/Redução",
        "Redistribuição", "Redistribuição", "Dotação Final"]
    ];
    const subhead = [
      ["", "", "", "", "", "Aumento", "Diminuição", ""]
    ];
    const completeHead = [...head, ...subhead];

    // Corpo
    const body = rows.slice(1).map(row =>
      Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim())
    );

    if (body.length === 0) {
      alert("Sem dados na tabela para exportar.");
      return;
    }

    // Totais como linhas (para incluir no corpo da tabela)
    const totalRow = [
      "", "Total de Despesas Correntes",
      formatNumber(totalMzn),
      formatNumber(inscription1 * 2.5),
      formatNumber(annulment1 * 2.5),
      formatNumber(increase1 * 2.5),
      formatNumber(decrease1 * 2.5),
      formatNumber(
        totalMzn +
        inscription1 * 2.5 -
        annulment1 * 2.5 +
        increase1 * 2.5 -
        decrease1 * 2.5
      )
    ];

    const totalRow2 = [
      "", "Total de Despesas de Capital",
      formatNumber(totalMznDespesas),
      formatNumber(inscription112 * 2.5),
      formatNumber(annulment112 * 2.5),
      formatNumber(increase112 * 2.5),
      formatNumber(decrease112 * 2.5),
      formatNumber(
        totalMznDespesas +
        inscription112 * 2.5 -
        annulment112 * 2.5 +
        increase112 * 2.5 -
        decrease112 * 2.5
      )
    ];

    const totalRow3 = [
      "", "Total Orçamento Global",
      formatNumber(totalMznF),
      formatNumber(inscription112F * 2.5),
      formatNumber(annulment112F * 2.5),
      formatNumber(increase112F * 2.5),
      formatNumber(decrease112F * 2.5),
      formatNumber(
        totalMznF +
        inscription112F * 2.5 -
        annulment112F * 2.5 +
        increase112F * 2.5 -
        decrease112F * 2.5
      )
    ];

    // Corpo completo com os totais no final
    const fullBody = [...body, totalRow, totalRow2, totalRow3];

    const columnStyles = {
      0: { halign: 'left' },
      1: { halign: 'left' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
    };
    // Geração do PDF
    templatePDF({
      title,
      subtitle,
      footerText,
      logoImage,
      generatedBy,
      filename,
      tableContent: {
        head: completeHead,
        body: fullBody,
        columnStyles,  // <-- aqui você passa a configuração
      },
    });
  };



  const generatePDFRows = (account, level = 0) => {
    const indentation = "  ".repeat(level); // Espaçamento para hierarquia
    const isParentAccount = account.children && account.children.length > 0;
    const finalAllocation = calculateFinalAllocationA(account);
    const usdValue = (finalAllocation * exchangeRate)?.toFixed(2) || 0; // Valor em USD
    const totalDuoDecimo = (usdValue / 12).toFixed(2);

    // Adicionar linha da conta atual
    const row = [
      `${indentation}${account.accountPlan.number}`,
      `${indentation}${account.accountPlan.description}`,
      formatNumber(finalAllocation.toFixed(2)),
      formatNumber(usdValue),
      formatNumber(totalDuoDecimo),
      isParentAccount, // Informação extra para estilo
    ];

    // Adicionar linhas das contas filhas
    const childRows = (account.children || []).flatMap((childAccount) =>
      generatePDFRows(childAccount, level + 1)
    );

    return [row, ...childRows];
  };

  // const exportToExcelExtrato = () => {
  //   const ws = XLSX.utils.table_to_sheet(document.getElementById('tableBudjectMap'));  // Seleciona a tabela HTML
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "Extrato"); // Adiciona uma nova aba chamada "Extrato"
  //   XLSX.writeFile(wb, "extrato_conta.xlsx"); // Gera e baixa o arquivo Excel
  // };

  const exportToExcelExtrato = () => {
    const wb = new ExcelJS.Workbook();
    const worksheet = wb.addWorksheet("Tabela");

    let currentRow = 1; // Controla a linha atual na planilha

    // Adicionar a linha extra com código e descrição da conta pai
    if (parentAccounts && parentAccounts.length > 0) {
      worksheet.addRow([
        "",
        parentAccounts[0]?.accountPlan?.number || "",
        parentAccounts[0]?.accountPlan?.description || "",
        "",
        "",
        "",
        "",
      ]);
      worksheet.addRow([]); // Linha vazia para separação
      currentRow += 2; // Atualiza a linha atual
    }

    // Adicionar os títulos das colunas (headers)
    const headerRow = worksheet.addRow([
      "Data",
      "Dotação Inicial (USD)",
      "Inscrição/Reforço",
      "Anulação/Redução",
      "Aumento",
      "Diminuição",
      "Dotação Final",
    ]);

    // Definir largura de cada coluna
    worksheet.columns = [
      { key: "data", width: 15 },
      { key: "dotacao_inicial", width: 25 },
      { key: "inscricao_reforco", width: 20 },
      { key: "anulacao_reducao", width: 20 },
      { key: "aumento", width: 15 },
      { key: "diminuicao", width: 15 },
      { key: "dotacao_final", width: 20 },
    ];

    // Aplicar estilo ao cabeçalho (negrito, fundo cinza e alinhamento à direita para colunas 2+)
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "E0E0E0" }, // Cinza claro
      };
      cell.alignment = {
        horizontal: colNumber > 1 ? "right" : "left",
      };
    });

    // Pegar os dados da tabela HTML
    const table = document.getElementById("tableBudjectMap");
    if (!table) {
      alert("Tabela não encontrada!");
      return;
    }

    const rows = table.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const rowData = [];

      cells.forEach((cell, index) => {
        rowData.push(cell.innerText.trim());
      });

      // Adicionar linha ao Excel
      const newRow = worksheet.addRow(rowData);

      // Aplicar alinhamento à direita a partir da segunda coluna
      newRow.eachCell((cell, colNumber) => {
        cell.alignment = { horizontal: colNumber > 1 ? "right" : "left" };
      });
    });

    // Gerar e baixar o arquivo Excel
    wb.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "TabelaOrcamento.xlsx";
      link.click();
    });
  };

  const exportToPDFExtrato = () => {
    // 1. Título e subtítulo
    const title = "PLANO E ORÇAMENTO";
    const subtitle = "Extrato por Conta";

    // 2. Cabeçalhos da tabela
    const headers = [
      ["Data", "Dotação Inicial", "Inscrição/Reforço", "Anulação/Redução", "Redistribuição (Aumento)", "Redistribuição (Diminuição)", "Dotação Final"]
    ];

    // 3. Dados da tabela principal
    const body = [];
    const rows = document.querySelectorAll("#tableBudjectMap tbody tr");

    rows.forEach(row => {
      const rowData = [];
      row.querySelectorAll("td").forEach(cell => {
        rowData.push(cell.textContent.trim());
      });
      body.push(rowData);
    });

    // 4. Cálculo dos totais com base em localParentAccounts
    let totalInitialAmount = 0;
    let totalReinforcement = 0;
    let totalReduction = 0;
    let totalRedistributionUp = 0;
    let totalRedistributionDown = 0;
    let totalFinalAmount = 0;

    localParentAccounts.forEach(mov => {
      mov.entriesEntry
        .filter(entry =>
          ["reinforcement", "annulment", "redistribuition_reinforcement", "redistribuition_annulment"].includes(entry.type)
        )
        .forEach(entry => {
          const dotacaoInicial = entry.lastFinalAllocation || 0;
          let aumento = 0;
          let diminuicao = 0;

          if (entry.type === "reinforcement") {
            aumento = entry.allocation;
            totalReinforcement += aumento;
          } else if (entry.type === "annulment") {
            diminuicao = entry.allocation;
            totalReduction += diminuicao;
          } else if (entry.type === "redistribuition_reinforcement") {
            aumento = entry.allocation;
            totalRedistributionUp += aumento;
          } else if (entry.type === "redistribuition_annulment") {
            diminuicao = entry.allocation;
            totalRedistributionDown += diminuicao;
          }

          const dotacaoFinal = dotacaoInicial + aumento - diminuicao;

          totalInitialAmount += dotacaoInicial;
          totalFinalAmount += dotacaoFinal;
        });
    });

    // Multiplicando por 2.5 conforme utilizado na visualização da tabela
    totalReinforcement *= 2.5;
    // totalReduction *= 2.5;
    totalRedistributionUp *= 2.5;
    totalRedistributionDown *= 2.5;
    totalFinalAmount *= 2.5;

    // 5. Totais formatados
    const totalRow = [
      "", "Totais:",
      formatNumber(totalReinforcement),
      formatNumber(totalInitialAmount),
      formatNumber(totalRedistributionUp),
      formatNumber(totalRedistributionDown),
      "", "", "",
    ];

    // 6. Junta corpo com os totais
    const fullBody = [...body, totalRow];

    // 7. Dados do rodapé e metadados
    const footerText = "Documento gerado automaticamente";
    const logoImage = logoMz; // imagem base64 ou URL
    const savedUserData = JSON.parse(localStorage.getItem("userData"));
    const generatedBy = savedUserData?.fullName || "Usuário desconhecido";
    const filename = "extrato_por_conta.pdf";

    // 8. Conteúdo da tabela no formato esperado pelo template
    const columnStyles = {
      0: { halign: 'left' },
      1: { halign: 'left' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
      8: { halign: 'right' },
    };


    // 9. Geração do PDF via template
    // Passando tudo junto e correto
    templatePDF({
      title,
      subtitle,
      footerText,
      logoImage,
      generatedBy,
      filename,
      tableContent: {
        head: headers,
        body: fullBody,
        columnStyles,  // Alinhamentos por coluna
      },
    });
  };


  const exportToPDF = () => {
    const doc = new jsPDF();

    // Defina o título principal
    doc.setFontSize(16);
    doc.text('Extrato', 14, 20);

    // Informações adicionais
    doc.setFontSize(10);
    doc.text(`Número da Conta: ${selectedRow.number || ''}`, 14, 30);
    doc.text(`Descrição: ${selectedRow.description || ''}`, 14, 40);

    // Criar a tabela com autoTable
    doc.autoTable({
      html: '#tableBudjectMap', // Referencia o ID da tabela no HTML
      startY: 50, // Posição inicial da tabela
      theme: 'grid', // Estilo da tabela
      tableWidth: 'auto', // Ajusta automaticamente à largura disponível
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 }, // Data 
        1: { halign: 'center', cellWidth: 15 }, // Código
        2: { halign: 'center', cellWidth: 35 }, // Designação
        3: { halign: 'right', cellWidth: 20 }, // Dotação Inicial
        4: { halign: 'right', cellWidth: 20 }, // Inscrição/Reforço
        5: { halign: 'right', cellWidth: 20 }, // Anulação/Redução
        6: { halign: 'right', cellWidth: 25 }, // Redistribuição (Aumento)
        7: { halign: 'right', cellWidth: 25 }, // Redistribuição (Diminuição)
        8: { halign: 'right', cellWidth: 20 }, // Dotação Final
      },
      styles: {
        fontSize: 5, // Fonte ainda menor
        cellPadding: 1, // Padding das células muito reduzido
        font: 'helvetica', // Tipo de fonte
      },
      headStyles: {
        fillColor: [0, 0, 0], // Cor de fundo do cabeçalho
        textColor: [255, 255, 255],// Cor do texto do cabeçalho
        fontSize: 5, // Reduz tamanho da fonte do cabeçalho
        fontStyle: 'bold', // Negrito
        halign: 'center', // Centraliza o texto no cabeçalho
      },
      bodyStyles: {
        fontSize: 5, // Fonte menor no corpo
      },
      margin: { top: 50, left: 10, right: 10 }, // Reduz margens para ajustar melhor à página
      didDrawPage: (data) => {
        // Adiciona um rodapé em todas as páginas
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, 14, pageHeight - 10);
      },
    });

    // Salvar o PDF gerado
    doc.save('extrato_conta.pdf');
  };

  const handleRowClick = (accountNumber, accountDescription, isParentAccount) => {
    if (isParentAccount) {
      // Exibe o swal se a conta for pai
      Swal.fire({
        title: "Ação Inválida",
        text: "Selecione apenas uma conta de movimento.",
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return; // Impede que continue
    }

    console.log("Linha clicada:", accountNumber);

    setSelectedRow({
      number: accountNumber,
      description: accountDescription,
    });
    setShowModal(true); // Exibir o modal
  };

  const handleClose = () => {
    setShowModal(false); // Fechar o modal
    setSelectedRow(null); // Limpar os dados da linha selecionada
  };
  const printDetails = () => {
    console.log('Imprimindo detalhes:', selectedRow);
    // Lógica de impressão ou outra ação necessária
  };
  const closeModal = () => {
    setSelectedRow(null);
    setShowExtract(false);
  };

  const [searchQuery, setSearchQuery] = useState(""); // Estado para o termo de busca
  const [startDate, setStartDate] = useState(""); // Data início
  const [endDate, setEndDate] = useState(""); // Data fim
  const [codeFilter, setCodeFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const filterData = () => {
    return parentAccounts.filter((mov) => {
      const isWithinDateRange =
        startDate && endDate
          ? new Date(mov.date) >= new Date(startDate) && new Date(mov.date) <= new Date(endDate)
          : true;

      return (
        (searchQuery === "" || mov.code.includes(searchQuery)) && // Filtra por código
        (filterCode === "" || mov.accountPlan.number.includes(filterCode)) && // Filtra por código específico
        isWithinDateRange // Filtra por intervalo de datas apenas se ambas as datas forem preenchidas
      );
    });
  };

  const loadAccountsFiltered = async () => {
    try {
      const response = await fetchAccountPlanBudjectEntriesByYear();

      // Filtrando as contas que atendem aos critérios
      const filteredAccounts = response.filter(account =>
        account.accountPlan.type === 'budject' &&
        account.accountPlan.writable === 'moviment' && account.entriesEntry // "moviment" não estava no seu exemplo, usei "controll"
      );

      setLocalParentAccounts(filteredAccounts);
      setFiristAccounts(filteredAccounts);

      console.log("Contas filtradas:", filteredAccounts);
      console.log("Número total de contas filtradas:", filteredAccounts.length); // Mostra o tamanho do array filtrado
      console.log("Parente", parentAccounts);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
    }
  };

  const handleCodigoChange = (e) => {
    const selectedCodigo = e.target.value;

    // Certificando-se de que selectedCodigo e account.accountPlan.number são do mesmo tipo
    const selectedCodigoParsed = selectedCodigo ? parseInt(selectedCodigo) : null;

    const selectedAccount = firistAccounts.find(account => account.accountPlan.id === selectedCodigoParsed);

    if (selectedAccount) {
      setFormData({
        ...formData,
        codigo: selectedAccount.codigo,
        codSend: selectedAccount.accountPlan.number,
        descricao: selectedAccount.descricao,
        dotacaoInicial: selectedAccount.finalAllocation,
      });
    } else {
      setFormData({
        ...formData,
        codigo: selectedCodigo,
        descricao: '',
        dotacaoInicial: '',
      });
    }

    const selectedAccountNumber = selectedAccount.accountPlan.number; // Acessando o número da conta selecionada

    console.log("selectedAccountNumber", selectedAccountNumber);

    const dadosRelacionados = firistAccounts.filter(account => {
      console.log("Comparando:", account.accountPlan.number, "com", selectedAccountNumber); // Log para debug
      return account.accountPlan.number === selectedAccountNumber;
    });

    console.log("dadosRelacionados", firistAccounts)

    const codeDesc = selectedAccount.accountPlan.number + " " + "-" + " " + selectedAccount.accountPlan.description;

    setSelectedAccountName(codeDesc);
    setParentAccounts(dadosRelacionados);

  };


  useEffect(() => {
    setFilteredData(filterData());
    loadAccountsFiltered();
  }, [startDate, endDate, searchQuery]);

  // Função para calcular o total
  const calculateTotal = () => {
    return filterData().reduce((total, mov) => {
      return total + mov.entriesEntry.reduce((entryTotal, entry) => {
        const dotacaoFinal = Math.abs(
          (entry.lastFinalAllocation || 0) + (entry.type === "reinforcement" ? entry.allocation : 0) -
          (entry.type !== "reinforcement" ? entry.allocation : 0)
        );
        return entryTotal + dotacaoFinal;
      }, 0);
    }, 0).toFixed(2);
  };

  // Converte uma data do formato ISO (yyyy-mm-dd) para dd-mm-yyyy
  // Converte uma data do formato dd-mm-yyyy para ISO (yyyy-mm-dd)
  const formatToISODate = (date) => {
    if (!date) return '';

    console.log('Input Date:', date); // Exibe a entrada para diagnóstico

    // Particiona a entrada no formato dd-mm-yyyy
    const [day, month, year] = date.split('-');

    if (!day || !month || !year) {
      console.error('Date format is incorrect. Expected dd-mm-yyyy');
      return '';
    }

    // Converte para o formato ISO (yyyy-mm-dd)
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    console.log('Formatted ISO Date:', formattedDate); // Exibe o valor final
    return formattedDate;
  };

  // Converte uma data do formato ISO (yyyy-mm-dd) para dd-mm-yyyy para exibição
  const formatToDisplayDate = (date) => {
    if (!date) return '';

    // Particiona a entrada no formato ISO (yyyy-mm-dd)
    const [year, month, day] = date.split('-');

    if (!day || !month || !year) {
      console.error('Date format is incorrect. Expected yyyy-mm-dd');
      return '';
    }

    // Retorna no formato dd-mm-yyyy
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
  };

  const filterRows = (rows, searchQuery) => {
    const query = searchQuery.trim(); // Remove espaços em branco no começo e no final
    if (!query) return rows; // Se não houver busca, retorna todas as linhas

    const queryParts = query.split('.'); // Divide a string da busca em partes
    return rows.filter(row => {
      const codeParts = row.accountPlan.number.split('.'); // Divide o código da linha em partes
      // Verifica se as partes do código começam com as partes da busca
      return queryParts.every((part, index) => codeParts[index] && codeParts[index].startsWith(part));
    });
  };
  const renderFilteredAccountRows = () => {
    const filteredAccounts = filterRows(organizedAccounts, searchQuery);
    return filteredAccounts.map((account) => renderAccountRowsAvailable(account));
  };

  const ExcelJS = require('exceljs');

  const exportToExcel = () => {
    // Cria uma cópia temporária da tabela
    const table = document.getElementById('tableBudjectMap').cloneNode(true);

    // Remove a última coluna da cópia
    const rows = table.querySelectorAll('tr');
    rows.forEach((row) => {
      row.removeChild(row.lastElementChild);
    });

    // Usa a tabela modificada para gerar o Excel
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Contas' });
    XLSX.writeFile(wb, 'Mapa_de_Alteração_Orçamental.xlsx'); // Salva o arquivo Excel
  };

  const handleFilterChange = (event) => {
    setFilterCode(event.target.value);
  };

  const exportToExcel12 = () => {
    const table = document.getElementById('accountsTable');
    if (!table) {
      console.error('Tabela não encontrada!');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Extrato');

    // Configurar cabeçalho com mesclagem
    worksheet.mergeCells('A1:A2'); // Código
    worksheet.mergeCells('B1:B2'); // Designação
    worksheet.mergeCells('C1:C2'); // Dotação Inicial
    worksheet.mergeCells('D1:D2'); // Inscrição/Reforço
    worksheet.mergeCells('E1:E2'); // Anulação/Redução
    worksheet.mergeCells('F1:F2'); // Redistribuição (Aumento)
    worksheet.mergeCells('G1:G2'); // Redistribuição (Diminuição)
    worksheet.mergeCells('H1:H2'); // Dotação Final

    // Adicionar valores ao cabeçalho
    const headers = [
      { cell: 'A1', text: 'Código', align: 'left' },
      { cell: 'B1', text: 'Descrição', align: 'left' },
      { cell: 'C1', text: 'Dotação Inicial', align: 'right' },
      { cell: 'D1', text: 'Inscrição/Reforço', align: 'right' },
      { cell: 'E1', text: 'Anulação/Redução', align: 'right' },
      { cell: 'F1', text: 'Redistribuição(Aumento)', align: 'right' },
      { cell: 'G1', text: 'Redistribuição(Diminuição)', align: 'right' },
      { cell: 'H1', text: 'Dotação Final', align: 'right' }
    ];

    // Estilizar cabeçalho
    const headerCells = [
      'A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1'
    ];
    headers.forEach(({ cell, text, align }) => {
      const headerCell = worksheet.getCell(cell);
      headerCell.value = text;
      headerCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF333333' } }; // Cinza escuro
      headerCell.alignment = { horizontal: align, vertical: 'middle' };
    });

    // Ajustar largura das colunas
    worksheet.columns = [
      { width: 10 }, // Código
      { width: 60 }, // Designação
      { width: 20 }, // Dotação Inicial
      { width: 20 }, // Inscrição/Reforço
      { width: 20 }, // Anulação/Redução
      { width: 25 }, // Aumento
      { width: 25 }, // Diminuição
      { width: 20 }, // Dotação Final
    ];

    // Preencher dados da tabela HTML
    const rows = table.querySelectorAll('tr');
    rows.forEach((row, rowIndex) => {
      if (rowIndex === 0) return; // Ignorar o cabeçalho da tabela HTML

      const cells = row.querySelectorAll('td');
      let isParentAccount = row.classList.contains('parent-account'); // Ajuste conforme necessário

      // Verificar se a linha contém uma conta do tipo "parent"
      const parentAccountElement = row.querySelector('.parent-account'); // Ajuste conforme seu código para identificar contas "parent"
      if (parentAccountElement) {
        isParentAccount = true;
      }

      // Adicionar valores das células na planilha
      cells.forEach((cell, cellIndex) => {
        const cellValue = cell.textContent.trim(); // Valor da célula
        const excelCell = worksheet.getCell(rowIndex + 1, cellIndex + 1); // Começa após o cabeçalho mesclado
        excelCell.value = cellValue;

        // Estilos para as células de dados
        excelCell.font = { color: { argb: 'FF000000' } }; // Preto
        excelCell.alignment = { horizontal: 'left', vertical: 'middle' };

        // Pintar as contas do tipo parent de cinza para toda a linha
        if (isParentAccount) {
          // Aplicar cor de fundo para toda a linha
          excelCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }, // Cinza claro para contas parent
          };
        }
        // Definir alinhamento: colunas C a H devem ser alinhadas à direita
        if (cellIndex >= 2 && cellIndex <= 7) {
          excelCell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else {
          excelCell.alignment = { horizontal: 'left', vertical: 'middle' };
        }
      });

      // Se for uma conta do tipo "parent", aplicar a cor para a linha inteira
      if (isParentAccount) {
        for (let i = 1; i <= cells.length; i++) {
          const excelCell = worksheet.getCell(rowIndex + 2, i);
          excelCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }, // Cinza claro para a linha inteira
          };
        }
      }
    });

    // Função para adicionar totais
    const addTotalRow = (label, ...values) => {
      const row = worksheet.addRow([label, ...values]); // Ajuste aqui para começar na coluna A (primeira coluna)
      row.eachCell((cell, colNumber) => {
        if (colNumber === 2) {
          // Alinhar à esquerda a descrição (coluna B)
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        } else if (colNumber > 1) {
          // Alinhar à direita nas colunas de valores (C até H)
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.00'; // Formato numérico
        } else {
          // Alinhar à esquerda a primeira coluna
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        }
      });
    };

    // Adicionar totais de despesas correntes, despesas de capital e orçamento global
    const totalCorrente = totalMzn + inscription1 * 2.5 - annulment1 * 2.5 + increase1 * 2.5 - decrease1 * 2.5;
    const totalCapital = totalMznDespesas + inscription112 * 2.5 - annulment112 * 2.5 + increase112 - decrease112;
    const totalGlobal = totalMznF + inscription112F * 2.5 - annulment112F * 2.5 + increase112F * 2.5 - decrease112F * 2.5;

    addTotalRow(
      '',
      'Total Despesas Correntes',
      formatNumber(totalMzn),
      formatNumber(inscription1 * 2.5),
      formatNumber(annulment1 * 2.5),
      formatNumber(increase1 * 2.5),
      formatNumber(decrease1 * 2.5),
      formatNumber(totalCorrente),
    );

    addTotalRow(
      '',
      'Total Despesas de Capital',
      formatNumber(totalMznDespesas),
      formatNumber(inscription112 * 2.5),
      formatNumber(annulment112 * 2.5),
      formatNumber(increase112 * 2.5),
      formatNumber(decrease112 * 2.5),
      formatNumber(totalCapital),
    );

    addTotalRow(
      '',
      'Total Orçamento Global',
      formatNumber(totalMznF),
      formatNumber(inscription112F * 2.5),
      formatNumber(annulment112F * 2.5),
      formatNumber(increase112F * 2.5),
      formatNumber(decrease112F * 2.5),
      formatNumber(totalGlobal),
    );

    // Aplicar cor de fundo para as últimas três linhas
    const lastRowIndex = worksheet.rowCount; // Obtém o índice da última linha
    const lastThreeRows = [lastRowIndex - 2, lastRowIndex - 1, lastRowIndex]; // Últimas 3 linhas

    // Aplicar cor de fundo para as últimas 3 linhas
    lastThreeRows.forEach((rowIndex) => {
      const row = worksheet.getRow(rowIndex);
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '7e827f' }, // Cor para as últimas 3 linhas
        };
      });
    });

    // Salvar o arquivo
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer]), 'extrato_conta.xlsx');
    });
  };

  const exportToExcel2 = () => {
    // Cria uma cópia temporária da tabela
    const table = document.getElementById('extratoData').cloneNode(true);

    // Remove a última coluna da cópia
    const rows = table.querySelectorAll('tr');
    rows.forEach((row) => {
      row.removeChild(row.lastElementChild);
    });

    // Usa a tabela modificada para gerar o Excel
    const wb = XLSX.utils.table_to_book(table, { sheet: 'Contas' });
    XLSX.writeFile(wb, 'extratoData.xlsx'); // Salva o arquivo Excel
  };

  const exportToExcelWithStyles = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('tableDispo');

    // Adicionar os títulos das colunas
    worksheet.columns = [
      { header: 'Código', key: 'codigo', width: 10 },
      { header: 'Descrição', key: 'designacao', width: 60 },
      { header: 'Dotação Inicial (USD)', key: 'dotacao_usd', width: 20 },
      { header: 'Contra Valor (MZN)', key: 'contra_valor', width: 20 },
      { header: 'Duodécimo', key: 'duodecimo', width: 20 },
    ];

    // Função para renderizar as linhas de contas
    const renderAccountRowsToExcel = (account, level = 0) => {
      const indentation = ' '.repeat(level * 2);
      const isParentAccount = account.children && account.children.length > 0;

      // Calcula o total da alocação
      const finalAllocation = calculateFinalAllocationA(account);

      const usdValue = (finalAllocation)?.toFixed(2) || 0; // Valor em USD
      const totalContraValor = (finalAllocation * exchangeRate).toFixed(2);
      const totalDuoDecimo = (totalContraValor / 12).toFixed(2);

      // Adicionando a linha de dados à planilha
      const row = worksheet.addRow({
        codigo: `${account.accountPlan.number}`,
        designacao: `${account.accountPlan.description}`,
        dotacao_usd: formatNumber(usdValue),
        contra_valor: formatNumber(totalContraValor),
        duodecimo: formatNumber(totalDuoDecimo),
      });

      // Aplicar alinhamento individual para cada coluna do body
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1 || colNumber === 2) {
          cell.alignment = { horizontal: 'left' }; // Código e Designação alinhados à esquerda
        } else {
          cell.alignment = { horizontal: 'right' }; // Números alinhados à direita
        }

        // Aplicar bordas para todas as células
        cell.border = {
          top: { style: 'thin', color: { argb: '4d524e' } },
          left: { style: 'thin', color: { argb: '4d524e' } },
          bottom: { style: 'thin', color: { argb: '4d524e' } },
          right: { style: 'thin', color: { argb: '4d524e' } },
        };
      });

      // Cor de fundo cinza para as contas pais
      if (isParentAccount) {
        row.eachCell((cell) => {
          cell.style.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D3D3D3' }, // Cor cinza
          };
        });
      }

      // Recursão para filhos
      account.children?.forEach((childAccount) => renderAccountRowsToExcel(childAccount, level + 1));
    };

    // Iterando sobre as contas e exportando
    organizedAccounts.forEach((account) => renderAccountRowsToExcel(account));

    // Adicionando o Total de Despesas Correntes
    const totalCurrentRow = worksheet.addRow({
      codigo: '',
      designacao: 'Total de Despesas Correntes',
      dotacao_usd: formatNumber(totalCurrentContraValorData),
      contra_valor: formatNumber(totalMzn),
      duodecimo: formatNumber(totalDuedecimoData),
    });
    // Aplicar estilos e alinhamento
    totalCurrentRow.eachCell((cell, colNumber) => {
      if (colNumber === 1 || colNumber === 2) {
        cell.alignment = { horizontal: 'left' }; // Código e descrição à esquerda
      } else {
        cell.alignment = { horizontal: 'right' }; // Valores numéricos à direita
        cell.numFmt = '#,##0.00'; // Formato numérico
      }

      cell.border = {
        top: { style: 'thin', color: { argb: '4d524e' } },
        left: { style: 'thin', color: { argb: '4d524e' } },
        bottom: { style: 'thin', color: { argb: '4d524e' } },
        right: { style: 'thin', color: { argb: '4d524e' } },
      };

      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4d524e' } }; // Fundo preto
      cell.font = { color: { argb: 'FFFFFF' }, bold: true }; // Texto branco
    });

    // Adicionando o Total de Despesas de Capital
    const totalCapitalRow = worksheet.addRow({
      codigo: '',
      designacao: 'Total de Despesas de Capital',
      dotacao_usd: formatNumber(totalCurrentContraValorDataDespesas),
      contra_valor: formatNumber(totalMznDespesas),
      duodecimo: formatNumber(totalDuedecimoDataDespesas),
    });

    totalCapitalRow.eachCell((cell, colNumber) => {
      if (colNumber === 1 || colNumber === 2) {
        cell.alignment = { horizontal: 'left' };
      } else {
        cell.alignment = { horizontal: 'right' };
        cell.numFmt = '#,##0.00';
      }

      cell.border = {
        top: { style: 'thin', color: { argb: '4d524e' } },
        left: { style: 'thin', color: { argb: '4d524e' } },
        bottom: { style: 'thin', color: { argb: '4d524e' } },
        right: { style: 'thin', color: { argb: '4d524e' } },
      };

      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4d524e' } };
      cell.font = { color: { argb: 'FFFFFF' }, bold: true };
    });

    // Adicionando o Total de Despesas Global
    const totalGlobalRow = worksheet.addRow({
      codigo: '',
      designacao: 'Total Orçamento Global',
      dotacao_usd: formatNumber(total),
      contra_valor: formatNumber(totalMznF),
      duodecimo: formatNumber(totalDuedecimoF),
    });

    totalGlobalRow.eachCell((cell, colNumber) => {
      if (colNumber === 1 || colNumber === 2) {
        cell.alignment = { horizontal: 'left' };
      } else {
        cell.alignment = { horizontal: 'right' };
        cell.numFmt = '#,##0.00';
      }

      cell.border = {
        top: { style: 'thin', color: { argb: '4d524e' } },
        left: { style: 'thin', color: { argb: '4d524e' } },
        bottom: { style: 'thin', color: { argb: '4d524e' } },
        right: { style: 'thin', color: { argb: '4d524e' } },
      };

      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4d524e' } };
      cell.font = { color: { argb: 'FFFFFF' }, bold: true };
    });

    // Estilizando o cabeçalho da planilha
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      cell.style.font = { bold: true };

      // Alinhar os headers corretamente
      if (colNumber === 1 || colNumber === 2) {
        cell.style.alignment = { horizontal: 'left' }; // Código e Designação alinhados à esquerda
      } else {
        cell.style.alignment = { horizontal: 'right' }; // Restante alinhado à direita
      }

      cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4d524e' } }; // Cor de fundo do cabeçalho
      cell.style.border = {
        top: { style: 'thin', color: { argb: '4d524e' } },
        left: { style: 'thin', color: { argb: '4d524e' } },
        bottom: { style: 'thin', color: { argb: '4d524e' } },
        right: { style: 'thin', color: { argb: '4d524e' } },
      };
    });

    // Salvar o arquivo
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Orçamento_Anual_Aprovado.xlsx';
      link.click();
    });
  };

  // Renderiza o título dinamicamente com base no relatório seleccionado
  const renderTitle = () => {
    if (!selectedReport || selectedReport === "Selecione Relatório") return null;
    return <h5 style={{ margin: "20px 0", textAlign: "center" }}>{selectedReport}</h5>;
  };


  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await findAccountPlanBudjectEntriesByYear();
      console.log("Contas recebidas:", response);
      const filteredParentAccounts = response.filter(account => account.accountPlan.type === 'budject');
      const filteredParentAccountsPInitial = response.filter(account =>
        account.accountPlan.type === 'budject' &&
        account.entriesEntry.some(entry => entry.type === 'initial_allocation')
      );


      const filteredAccounts = response.filter(account =>
        account.accountPlan.type === 'budject' &&
        account.accountPlan.writable === 'moviment' // "moviment" não estava no seu exemplo, usei "controll"
      );

      const avalueA = response.filter(account => account.accountPlan.type === 'budject' && account.accountPlan.finalAllocationType === 'A');
      const avalueA1 = response.filter(account => account.accountPlan.type === 'budject' && account.accountPlan.finalAllocationType === 'A1');
      const avalueA4 = response.filter(account => account.accountPlan.type === 'budject' && account.accountPlan.finalAllocationType === 'A4');
      const avalueL4 = response.filter(account => account.accountPlan.type === 'budject' && account.accountPlan.finalAllocationType === 'L4');
      const avalueA5 = response.filter(account => account.accountPlan.type === 'budject' && account.accountPlan.finalAllocationType === 'A5');
      const avalueA7 = response.filter(account => account.accountPlan.type === 'budject' && account.accountPlan.finalAllocationType === 'A7');
      const avalueA8 = response.filter(account => account.accountPlan.type === 'budject' && account.accountPlan.finalAllocationType === 'A8');
      const avalueL5 = response.filter(account => account.accountPlan.type === 'budject' && account.accountPlan.finalAllocationType === 'L5');
      const avalueL6 = response.filter(account => account.accountPlan.type === 'budject' && account.accountPlan.finalAllocationType === 'L6');
      const avalueL = response.filter(account => account.accountPlan.type === 'budject' && account.accountPlan.finalAllocationType === 'L');
      const avalueA3 = response.filter(account => account.accountPlan.type === 'budject' && account.accountPlan.finalAllocationType === 'A3');

      const contaLaparit = response.filter(account => account.parentId === 420);
      const contaLaparitL1 = response.filter(account => account.parentId === 422);

      console.log("contaLaparit", contaLaparit)
      const totalInitialAllocation = contaLaparit.reduce((total, account) => {
        return total + (account.initialAllocation || 0);
      }, 0);

      const totalInitialAllocationL1 = contaLaparitL1.reduce((total, account) => {
        return total + (account.initialAllocation || 0);
      }, 0);
      console.log("Soma total de initialAllocation L:", totalInitialAllocation);
      console.log("Soma total de initialAllocation L1:", totalInitialAllocationL1);
      console.log("Total: ", totalInitialAllocationL1 + totalInitialAllocation);
      setAvalueA1(totalInitialAllocationL1 + totalInitialAllocation);

      setAvalueA(avalueA[0].finalAllocation + avalueL5[0].finalAllocation + avalueL6[0].finalAllocation + avalueA3[0].finalAllocation + avalueA4[0].finalAllocation + avalueL4[0].finalAllocation);
      // setAvalueA1(avalueA1[0].finalAllocation);
      setAvalueA4(avalueA4[0].finalAllocation);
      setAvalueL4(avalueL4[0].finalAllocation);
      setAvalueA5(avalueL5[0].finalAllocation + avalueL6[0].finalAllocation);
      setAvalueA7(avalueA7[0].finalAllocation);
      setAvalueA8(avalueA8[0].finalAllocation);
      setAvalueL(avalueL[0].finalAllocation);
      setAvalueA3(avalueA3[0].finalAllocation);




      console.log("filteredParentAccountsPInitial", filteredParentAccountsPInitial)
      setAccounts(filteredParentAccounts);
      setAccountsInitial(filteredParentAccounts)
      setParentAccounts(filteredAccounts)
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

      console.log("Filtradas:", response);

      setValuesAccounts(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummationAccountEntriesEntry1 = async () => {
    try {
      setLoading(true);  // Exibe o estado de carregamento enquanto os dados estão sendo processados.
      const response = await fetchSummationAccountEntriesEntry();
      console.log("fetchSummationAccountEntriesEntry1:", response);

      // Função para extrair o prefixo da conta
      const getPrefix = (account_number) => {
        const parts = account_number.split('.');
        // Retorna todos os elementos da conta, exceto o último (que é o sufixo)
        return parts.slice(0, parts.length - 1).join('.');
      };

      // Agrupar os dados por prefixo e calcular os totais por tipo de entrada
      const groupedData = response.reduce((acc, entry) => {
        const { account_number, entry_type, total_allocation } = entry;
        const prefix = getPrefix(account_number);  // Obtemos o prefixo da conta

        // Se ainda não existirem dados para o prefixo, cria-se a estrutura
        if (!acc[prefix]) {
          acc[prefix] = {
            reinforcement: 0,
            annulment: 0,
            redistribution_reinforcement: 0,
            redistribution_annulment: 0
          };
        }

        // Atualizando o valor total para o tipo de entrada correspondente
        switch (entry_type) {
          case 'reinforcement':
            acc[prefix].reinforcement += total_allocation;
            break;
          case 'annulment':
            acc[prefix].annulment += total_allocation;
            break;
          case 'redistribuition_reinforcement':
            acc[prefix].redistribution_reinforcement += total_allocation;
            break;
          case 'redistribuition_annulment':
            acc[prefix].redistribution_annulment += total_allocation;
            break;
          default:
            break;
        }

        return acc;
      }, {});

      // Exibir o resultado formatado como uma tabela
      const tableData = Object.keys(groupedData).map(prefix => {
        const { reinforcement, annulment, redistribution_reinforcement, redistribution_annulment } = groupedData[prefix];
        return {
          account_number: prefix,
          reinforcement,
          annulment,
          redistribution_reinforcement,
          redistribution_annulment
        };
      });

      console.table("DADOS DA TABELA __---__----__", tableData);  // Exibe a tabela no console
      setvalueMovimentAccount(tableData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);  // Oculta o estado de carregamento após o processamento
    }
  };

  const groupByPrefix = (data) => {
    const groupedData = {};

    data.forEach(item => {
      // Extrair o prefixo da 'account_number' (primeiras 4 partes)
      const prefix = item.account_number.split('.').slice(0, 4).join('.');

      // Se o prefixo já existir, soma o 'total_allocation'
      if (groupedData[prefix]) {
        groupedData[prefix].total_allocation += item.total_allocation;
      } else {
        // Caso contrário, cria um novo grupo com esse prefixo
        groupedData[prefix] = {
          account_number: prefix,
          total_allocation: item.total_allocation
        };
      }
    });

    // Converte o objeto agrupado em um array de resultados
    return Object.values(groupedData);
  };

  useEffect(() => {
    loadAccounts();
    loadAccountsInitial();
    fetchSummationAccountEntriesEntry1();
  }, []);

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
        parentAccounts.push(account);
      }
    });

    const organizeHierarchy = (account) => {
      if (account.children.length > 0) {
        account.children.forEach(child => organizeHierarchy(child));
      }
    };
    parentAccounts.forEach(account => organizeHierarchy(account));

    return parentAccounts;
  };


  const formatNumber = (value) => {
    // Certifica-se de que o valor seja um número flutuante e tem no mínimo duas casas decimais
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(parseFloat(value));
  };

  const organizedAccounts = organizeAccounts(accounts);
  const organizedAccountsInitial = organizeAccounts(accountsInitial);

  const calculateFinalAllocation = (account) => {
    let totalAllocation = 0;
    const finalAllocationType = account.accountPlan.finalAllocationType;

    const initialAllocationEntry = account.entriesEntry?.find(entry => entry.type === "initial_allocation");
    const initialAllocation = initialAllocationEntry ? initialAllocationEntry.allocation : 0;

    console.log(`Final Allocation Type: ${finalAllocationType}`); // Para depurar

    // Se for uma conta do tipo L ou qualquer tipo L1 a L9, soma os filhos dessa conta
    if (['L', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9'].includes(finalAllocationType)) {
      totalAllocation += calculateChildrenAllocation(account); // Somar alocações das contas filhas
    }
    else if (finalAllocationType === 'A') {
      totalAllocation = totalCurrentExpenses;
    }
    else if (finalAllocationType === 'L4') {
      totalAllocation = avalueL4;

    } else if (finalAllocationType === 'A1') {
      totalAllocation = avalueA1
    } else if (finalAllocationType === 'A2') {
      if (valuesAccounts.length >= 1) {
        totalAllocation = valuesAccounts[0].total_allocation;
        console.log("dados a usar nos calculos", valuesAccounts)
      } else {
        console.log("O array valuesAccounts não possui 1 elemento.");
        totalAllocation = 0; // Ou outro valor adequado
      }
    } else if (finalAllocationType === 'A3') {
      totalAllocation += calculateChildrenAllocationA2(account);
    } else if (finalAllocationType === 'A4') {
      // Encontrar as contas L2 e L3 (isso depende da sua estrutura de dados)
      const l2Account = accounts.find(acc => acc.accountPlan.finalAllocationType === 'L2');
      const l3Account = accounts.find(acc => acc.accountPlan.finalAllocationType === 'L3');

      // Calcular a alocação de cada uma
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
    console.log(`Total Allocation after final check: ${totalAllocation}`); // Para depurar
    return totalAllocation;
  };


  const calculateFinalAllocationDinamic = (account) => {
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
    else if (finalAllocationType === 'L') {
      const allocationTypes = ['L'];
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
          // totalAllocation += parseFloat(calculateChildrenAllocationFinallAlocation(account)).toFixed(2);
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


  const calculateAggregatedValues = (accounts) => {
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

      // Recursão para filhos
      if (account.children) {
        calculateAggregatedValues(account.children);
      }
    });
  };

  const calculateFinalAllocationA = (account) => {
    let totalAllocation = 0;
    const finalAllocationType = account.accountPlan.finalAllocationType;

    const initialAllocationEntry = account.entriesEntry?.find(entry => entry.type === "initial_allocation");
    const initialAllocation = initialAllocationEntry ? initialAllocationEntry.allocation : 0;

    console.log(`Final Allocation Type: ${finalAllocationType}`); // Para depurar

    // Se for uma conta do tipo L ou qualquer tipo L1 a L9, soma os filhos dessa conta
    if (['L', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9'].includes(finalAllocationType)) {
      totalAllocation += calculateChildrenAllocation(account); // Somar alocações das contas filhas
    } else if (finalAllocationType === 'A') {
      // Verificação para garantir que o array valuesAccounts tenha pelo menos 7 elementos
      const allocationTypes = ['L', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
      allocationTypes.forEach(type => {
        const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
        if (account) {
          totalAllocation += parseFloat(calculateChildrenAllocationFinallAlocation(account).toFixed(2));
        }
      });
      // if (valuesAccounts.length >= 7) {
      //   totalAllocation = valuesAccounts[0].total_allocation + valuesAccounts[1].total_allocation +
      //     valuesAccounts[2].total_allocation + valuesAccounts[3].total_allocation +
      //     valuesAccounts[4].total_allocation + valuesAccounts[5].total_allocation +
      //     valuesAccounts[6].total_allocation;
      // } else {
      //   console.log("O array valuesAccounts não possui 7 elementos.");
      //   totalAllocation = 0; // Ou outro valor adequado
      // }
    } else if (finalAllocationType === 'A1') {
      // Verificação para garantir que o array valuesAccounts tenha pelo menos 2 elementos
      // if (valuesAccounts.length >= 2) {
      //   const value1 = valuesAccounts[0].total_allocation;
      //   const value2 = valuesAccounts[1].total_allocation;
      //   totalAllocation = value1 + value2;

      //   console.log(`Valores individuais de A1: ${value1} + ${value2}`);
      //   console.log(`Total alocado para A1: ${totalAllocation}`);
      // } else {
      //   console.log("O array valuesAccounts não possui 2 elementos.");
      //   totalAllocation = 0; // Ou outro valor adequado
      // }
      const allocationTypes = ['L', 'L1'];
      allocationTypes.forEach(type => {
        const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
        if (account) {
          totalAllocation += calculateChildrenAllocationFinallAlocation(account);
        }
      });
    }
    else if (finalAllocationType === 'A2') {
      // Verificação para garantir que o array valuesAccounts tenha pelo menos 1 elemento
      if (valuesAccounts.length >= 1) {
        totalAllocation = valuesAccounts[0].total_allocation;
      } else {
        console.log("O array valuesAccounts não possui 1 elemento.");
        totalAllocation = 0; // Ou outro valor adequado
      }
    } else if (finalAllocationType === 'A3') {
      totalAllocation += calculateChildrenAllocationA2(account);
    } else if (finalAllocationType === 'A4') {
      // Verificação para garantir que o array valuesAccounts tenha pelo menos 4 elementos
      if (valuesAccounts.length >= 4) {
        totalAllocation = valuesAccounts[2].total_allocation + valuesAccounts[3].total_allocation;
      } else {
        console.log("O array valuesAccounts não possui 4 elementos.");
        totalAllocation = 0; // Ou outro valor adequado
      }
    } else if (finalAllocationType === 'A5') {
      // Verificação para garantir que o array valuesAccounts tenha pelo menos 6 elementos
      if (valuesAccounts.length >= 6) {
        totalAllocation = valuesAccounts[5].total_allocation + valuesAccounts[6].total_allocation;
      } else {
        console.log("O array valuesAccounts não possui 6 elementos.");
        totalAllocation = 0; // Ou outro valor adequado
      }
    } else if (finalAllocationType === 'A7' || finalAllocationType === 'A8') {
      // Verificação para garantir que o array valuesAccounts tenha pelo menos 8 elementos
      if (valuesAccounts.length >= 8) {
        totalAllocation =
          valuesAccounts[valuesAccounts.length - 1].total_allocation +
          valuesAccounts[valuesAccounts.length - 2].total_allocation +
          valuesAccounts[valuesAccounts.length - 3].total_allocation;

      } else {
        console.log("O array valuesAccounts não possui 8 elementos.");
        totalAllocation = 0; // Ou outro valor adequado
      }
    } else {
      // Para outras contas que não são do tipo L ou A2, soma a alocação inicial
      totalAllocation += initialAllocation || 0;
    }

    console.log(`Total Allocation after final check: ${totalAllocation}`); // Para depurar
    return totalAllocation;
  };

  const calculateChildrenAllocationA2 = (account) => {
    let total = 0;

    const processChildren = (children) => {
      if (children && Array.isArray(children)) {
        children.forEach(child => {
          // Se `entriesEntry` estiver vazio, verifica os filhos desse `child`
          if (!child.entriesEntry || child.entriesEntry.length === 0) {
            if (child.children && Array.isArray(child.children)) {
              processChildren(child.children); // Chamando recursivamente para processar netos
            }
          } else {
            // Caso `entriesEntry` tenha dados, soma as alocações normalmente
            const initialAllocationEntry = child.entriesEntry.find(entry => entry.type === "initial_allocation");
            const initialAllocation = initialAllocationEntry ? initialAllocationEntry.allocation : 0;
            total += initialAllocation;
          }
        });
      }
    };

    // Processa os filhos da conta
    processChildren(account.children);

    return total;
  };


  const calculateChildrenAllocation = (account) => {
    let total = 0;

    // Verifica se a conta tem filhos e soma os valores das alocações dos filhos
    if (account.children && Array.isArray(account.children)) {
      account.children.forEach(child => {
        const initialAllocationEntry = child.entriesEntry?.find(entry => entry.type === "initial_allocation");
        const initialAllocation = initialAllocationEntry ? initialAllocationEntry.allocation : 0;
        total += initialAllocation;
      });
    }

    return total;
  };

  const calculateChildrenAllocationFinallAlocation = (account) => {
    let total = 0;

    // Verifica se a conta tem filhos e soma os valores das alocações dos filhos
    if (account.children && Array.isArray(account.children)) {
      account.children.forEach(child => {
        const childAllocation = child.finalAllocation || 0;
        console.log(`Alocação do filho (número: ${child.accountPlan?.number || 'N/A'}): ${childAllocation}`);
        total += childAllocation;
      });
    }

    console.log(`Total da alocação dos filhos de ${account.accountPlan?.number || 'Conta desconhecida'}: ${total}`);
    return total;
  };


  //////////################################################ CONTAS FILTRADAS################################################ /////////

  const calculateSiblingAllocation = (accounts, types) => {
    let total = 0;
    accounts.forEach((account) => {
      const finalAllocationType = account.accountPlan.finalAllocationType;
      const finalAllocation = account.finalAllocation || 0;
      if (types.includes(finalAllocationType)) {
        // console.log(`Somando alocação da conta: ${account.accountPlan.number} (Tipo: ${finalAllocationType}, Valor: ${finalAllocation})`);
        total += finalAllocation;
      }
    });
    return total;
  };

  const calculateFinalAllocationTotal = (account, type) => {
    let totalAllocation = 0;

    if (type === 'AFF') {
      // Soma as alocações das contas A3, A2, L4, L5, L6, L2, L3, incluindo suas filhas
      const relevantAccounts = accounts.filter(acc =>
        ['A3', 'A2', 'L4', 'L5', 'L6', 'L2', 'L3'].includes(acc.accountPlan.finalAllocationType)
      );

      // Soma as alocações diretas e das filhas das contas relevantes
      relevantAccounts.forEach(accountItem => {
        totalAllocation += accountItem.children.reduce((acc, child) => {
          return acc + calculateFinalAllocation(child); // Soma recursiva das alocações das contas filhas
        }, 0);
      });

    } else if (type === 'AFC') {
      // Soma as alocações das contas L7, L8, L9, incluindo suas filhas
      const relevantAccounts = accounts.filter(acc =>
        ['L7', 'L8', 'L9'].includes(acc.accountPlan.finalAllocationType)
      );

      // Soma as alocações diretas e das filhas das contas relevantes
      relevantAccounts.forEach(accountItem => {
        totalAllocation += accountItem.children.reduce((acc, child) => {
          return acc + calculateFinalAllocation(child); // Soma recursiva das alocações das contas filhas
        }, 0);
      });

    } else {
      // Caso padrão para outros tipos, soma o valor direto da conta
      totalAllocation += account.finalAllocation || 0;
    }

    return totalAllocation;
  };


  const calculateFinalAllocationTotal2 = (account, type) => {
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
      // Caso padrão para outros tipos, soma o valor direto da conta
      totalAllocation += account.finalAllocation || 0;
    }

    return totalAllocation;
  };

  const totalCurrentExpenses = calculateFinalAllocationTotal(accounts, "AFF");
  const totalCapitalExpenses = calculateFinalAllocationTotal(accounts, "AFC");

  const totalCurrentExpensesDisponivel = calculateFinalAllocationTotal2(accounts, "AFF");
  const totalCapitalExpensesDisponivel = calculateFinalAllocationTotal2(accounts, "AFC");
  const totalGlobalBudget2 = totalCurrentExpensesDisponivel + totalCapitalExpensesDisponivel;

  const totalGlobalBudget = totalCurrentExpenses + totalCapitalExpenses;
  const totalCurrentContraValor = totalCurrentExpenses * 2.5;
  const totalCurrentDuodecimo = totalCurrentContraValor / 12;
  const totalCapitalContraValor = totalCapitalExpenses * 2.5;
  const totalCapitalDuodecimo = totalCapitalContraValor / 12;
  const totalGlobalContraValor = totalGlobalBudget * 2.5;
  const totalGlobalDuodecimo = totalGlobalContraValor / 12;
  const totalGlobalBudgetDuedecimo = totalGlobalBudget / 12;
  const totalCurrentContraValorData = valuesAccounts
    .slice(0, 7) // Garante que apenas os 7 primeiros elementos sejam usados
    .reduce((sum, account) => sum + (account.total_allocation || 0), 0);
  const totalMzn = totalCurrentContraValorData * 2.5;
  const totalDuedecimoData = totalMzn / 12;
  const totalCurrentContraValorDataDespesas = valuesAccounts
    .slice(7) // Garante que apenas os 7 primeiros elementos sejam usados
    .reduce((sum, account) => sum + (account.total_allocation || 0), 0);
  const totalMznDespesas = totalCurrentContraValorDataDespesas * 2.5;
  const totalDuedecimoDataDespesas = totalMznDespesas / 12;
  const total = totalCurrentContraValorData + totalCurrentContraValorDataDespesas;
  const totalMznF = total * 2.5;
  const totalDuedecimoF = totalMznF / 12;



  const renderAccountRowsAvailable = (account, level = 0) => {
    const indentation = ' '.repeat(level * 2);
    const isParentAccount = account.children && account.children.length > 0;

    // Cálculos existentes
    const finalAllocation = calculateFinalAllocationA(account).toFixed(2);
    const finalAllocationDinamic = calculateFinalAllocationDinamic(account);
    const availableBalance = ((finalAllocationDinamic * 2.5));

    // Verificar se a conta tem movimento
    const hasMovement = finalAllocationDinamic !== 0;

    // Aplicar filtros
    if ((!showWithMovement && hasMovement) || (!showWithoutMovement && !hasMovement)) {
        return null;
    }

    // Aplicar filtro por código
    if (filterCode && !account.accountPlan.number.includes(filterCode)) {
        return null;
    }

    return (
        <>
            <tr 
                key={account.accountPlan.number} 
                className={isParentAccount ? 'table-success' : ''} 
                style={{ 
                    backgroundColor: isParentAccount ? '#f0f0f0' : '',
                    opacity: hasMovement ? 1 : 0.7
                }}
            >
                <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                    {indentation}{account.accountPlan.number}
                </td>
                <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                    {indentation}{account.accountPlan.description}
                    {!hasMovement && <span style={{fontSize: '0.8em', color: '#999', marginLeft: '5px'}}>(sem movimento)</span>}
                </td>
                <td style={{ padding: '5px 10px', textAlign: 'right', color: 'black' }}>
                    {formatNumber((finalAllocation * 2.5)) || 0}
                </td>
                <td style={{ padding: '5px 10px', textAlign: 'right', color: 'black' }}>
                    {formatNumber(availableBalance) || 0}
                </td>
                <td style={{ padding: '5px 10px', textAlign: 'right', color: 'black' }}>
                    {formatNumber(availableBalance)}
                </td>
            </tr>

            {account.children.map((childAccount) => 
                renderAccountRowsAvailable(childAccount, level + 1)
            )}
        </>
    );
};
  //############################################################################################################################//
  // Função para calcular as alocações de cada tipo

  //##############################################################################################################
  let fixedValues11 = {
    "1.1.1.1_1.2.1.0": {
      inscription: 0,
      annulment: 0,
      increase: 0,
      decrease: 0
    }
  };
  let fixedValues111 = {
    "1.1.0.0.00": {
      inscription: 0,
      annulment: 0,
      increase: 0,
      decrease: 0
    }
  };

  let fixedValues116 = {
    "1.6.0.0.00": {
      inscription: 0,
      annulment: 0,
      increase: 0,
      decrease: 0
    }
  };
  let fixedValues1112 = {
    "1.1.2.0.00": {
      inscription: 0,
      annulment: 0,
      increase: 0,
      decrease: 0
    }
  };

  let fixedValues1112F = {
    "1.1.2.F.00": {
      inscription: 0,
      annulment: 0,
      increase: 0,
      decrease: 0
    }
  };

  valueMovimentAccount.forEach((record) => {

    const descricao = record.account_number;
    const reinforcement = record.reinforcement;
    const annulment = record.annulment;
    const redistributionReinforcement = record.redistribution_reinforcement;
    const redistributionAnnulment = record.redistribution_annulment;

    if (descricao === "1.1.1.1" || descricao === "1.2.1.0" || descricao === "1.1.2.1" || descricao === "1.2.2.0" || descricao === "1.6.1.0" || descricao === "1.6.2.0" || descricao === "1.4.0.0") {
      fixedValues11["1.1.1.1_1.2.1.0"].inscription += reinforcement;
      fixedValues11["1.1.1.1_1.2.1.0"].annulment += annulment;
      fixedValues11["1.1.1.1_1.2.1.0"].increase += redistributionReinforcement;
      fixedValues11["1.1.1.1_1.2.1.0"].decrease += redistributionAnnulment;
    }

    if (descricao === "1.1.1.1" || descricao === "1.1.2.1") {
      fixedValues111["1.1.0.0.00"].inscription += reinforcement;
      fixedValues111["1.1.0.0.00"].annulment += annulment;
      fixedValues111["1.1.0.0.00"].increase += redistributionReinforcement;
      fixedValues111["1.1.0.0.00"].decrease += redistributionAnnulment;
    }

    if (descricao === "1.6.1.0" || descricao === "1.6.2.0") {
      fixedValues116["1.6.0.0.00"].inscription += reinforcement;
      fixedValues116["1.6.0.0.00"].annulment += annulment;
      fixedValues116["1.6.0.0.00"].increase += redistributionReinforcement;
      fixedValues116["1.6.0.0.00"].decrease += redistributionAnnulment;
    }

    console.log("Valores de 1.6.0.0.00:");
    console.log("Inscription16:", inscription16);
    console.log("Annulment16:", annulment16);
    console.log("Increase16:", increase16);
    console.log("Decrease16:", decrease16);
    console.log("Dados Finais 1.6:", fixedValues116);

    if (descricao === "2.1.1.0" || descricao === "2.1.2.0" || descricao === "2.1.3.0") {
      fixedValues1112["1.1.2.0.00"].inscription += reinforcement;
      fixedValues1112["1.1.2.0.00"].annulment += annulment;
      fixedValues1112["1.1.2.0.00"].increase += redistributionReinforcement;
      fixedValues1112["1.1.2.0.00"].decrease += redistributionAnnulment;
    }

    if (descricao === "2.1.1.0" || descricao === "2.1.2.0" || descricao === "2.1.3.0" || descricao === "1.2.2.0" || descricao === "1.1.1.1" || descricao === "1.1.2.1" || descricao === "1.2.1.0" || descricao === "1.6.1.0" || descricao === "1.6.2.0" || descricao === "1.4.0.0") {
      fixedValues1112F["1.1.2.F.00"].inscription += reinforcement;
      fixedValues1112F["1.1.2.F.00"].annulment += annulment;
      fixedValues1112F["1.1.2.F.00"].increase += redistributionReinforcement;
      fixedValues1112F["1.1.2.F.00"].decrease += redistributionAnnulment;
    }
  });

  // Acessando os valores corretamente
  const inscription1 = fixedValues11["1.1.1.1_1.2.1.0"].inscription;
  const annulment1 = fixedValues11["1.1.1.1_1.2.1.0"].annulment;
  const increase1 = fixedValues11["1.1.1.1_1.2.1.0"].increase;
  const decrease1 = fixedValues11["1.1.1.1_1.2.1.0"].decrease;

  const inscription11 = fixedValues111["1.1.0.0.00"].inscription;
  const annulment11 = fixedValues111["1.1.0.0.00"].annulment;
  const increase11 = fixedValues111["1.1.0.0.00"].increase;
  const decrease11 = fixedValues111["1.1.0.0.00"].decrease;

  const inscription16 = fixedValues116["1.6.0.0.00"].inscription;
  const annulment16 = fixedValues116["1.6.0.0.00"].annulment;
  const increase16 = fixedValues116["1.6.0.0.00"].increase;
  const decrease16 = fixedValues116["1.6.0.0.00"].decrease;

  const inscription112 = fixedValues1112["1.1.2.0.00"].inscription;
  const annulment112 = fixedValues1112["1.1.2.0.00"].annulment;
  const increase112 = fixedValues1112["1.1.2.0.00"].increase;
  const decrease112 = fixedValues1112["1.1.2.0.00"].decrease;

  const inscription112F = fixedValues1112F["1.1.2.F.00"].inscription;
  const annulment112F = fixedValues1112F["1.1.2.F.00"].annulment;
  const increase112F = fixedValues1112F["1.1.2.F.00"].increase;
  const decrease112F = fixedValues1112F["1.1.2.F.00"].decrease;

  // Imprimindo os valores nos logs
  console.log("Inscription:", inscription1);
  console.log("Annulment:", annulment1);
  console.log("Increase:", increase1);
  console.log("Decrease:", decrease1);

  console.log("Inscription11:", inscription11);
  console.log("Annulment11:", annulment11);
  console.log("Increase11:", increase11);
  console.log("Decrease11:", decrease11);

  console.log("Dados Finais OK", fixedValues11)


  // Função para calcular os valores hierárquicos
  const calculateHierarchicalAllocations = (account, type) => {
    let allocation = 0;

    // Soma a alocação da conta atual
    account.entriesEntry.forEach((entry) => {
      if (entry.type === type) {
        allocation += entry.allocation || 0;
      }
    });

    // Soma as alocações dos filhos de forma recursiva
    if (account.children && account.children.length > 0) {
      account.children.forEach((childAccount) => {
        allocation += calculateHierarchicalAllocations(childAccount, type);
      });
    }

    return allocation;
  };


  const renderAccountRowsReport = (account, level = 0) => {
    const indentation = '\u00A0'.repeat(level * 2);
    const isParentAccount = account.children && account.children.length > 0;
    
    // Obter valores dos movimentos
    let inscription, annulment, increase, decrease;
    
    if (account.accountPlan.number === "1.0.0.0.00") {
      inscription = inscription1;
      annulment = annulment1;
      increase = increase1;
      decrease = decrease1;
    } else if (account.accountPlan.number === "1.1.0.0.00") {
      inscription = inscription11;
      annulment = annulment11;
      increase = increase11;
      decrease = decrease11;
    } else if (account.accountPlan.number === "1.6.0.0.00") {
      inscription = inscription16;
      annulment = annulment16;
      increase = increase16;
      decrease = decrease16;
    } else {
      inscription = account.simulatedValues?.inscription || calculateHierarchicalAllocations(account, "reinforcement");
      annulment = account.simulatedValues?.annulment || calculateHierarchicalAllocations(account, "annulment");
      increase = account.simulatedValues?.increase || calculateHierarchicalAllocations(account, "redistribuition_reinforcement");
      decrease = account.simulatedValues?.decrease || calculateHierarchicalAllocations(account, "redistribuition_annulment");
    }

    // Calcular dotação final
    const finalAllocation = calculateFinalAllocationA(account);
    let dotacaoFinal = ((finalAllocation + (inscription + increase) - (annulment + decrease)) * 2.5);

    if (account.accountPlan.number === '1.1.0.0.00') {
      const multiplicador = 2.5;
      const finalAllocationMultiplicada = finalAllocation * multiplicador;
      const inscriptionMultiplicada = inscription * multiplicador;
      const increaseMultiplicada = increase * multiplicador;
      const annulmentMultiplicada = annulment * multiplicador;
      const decreaseMultiplicada = decrease * multiplicador;

      dotacaoFinal = finalAllocationMultiplicada + inscriptionMultiplicada + increaseMultiplicada - (annulmentMultiplicada + decreaseMultiplicada);
    }

    totalContraValor = finalAllocation * exchangeRate;

    // Verificar se a conta tem movimento (considerando todos os tipos de movimentação)
    const hasMovement = finalAllocation !== 0 || inscription !== 0 || annulment !== 0 || increase !== 0 || decrease !== 0;

    // Aplicar filtros
    if ((!showWithMovement && hasMovement) || (!showWithoutMovement && !hasMovement)) {
        return null;
    }

    return (
        <>
            <tr
                key={account.accountPlan.number}
                className={`hover-row ${isParentAccount ? 'table-success' : ''}`}
                onClick={() => handleRowClick(account.accountPlan.number, account.accountPlan.description, isParentAccount)}
                style={{ 
                    cursor: isParentAccount ? "not-allowed" : "pointer",
                    opacity: hasMovement ? 1 : 0.7
                }}
            >
                <td style={{ textAlign: "left" }}>
                    {account.accountPlan.number}
                </td>
                <td style={{ textAlign: "left" }}>
                    {account.accountPlan.description}
                    {!hasMovement && <span style={{fontSize: '0.8em', color: '#999', marginLeft: '5px'}}>(sem movimento)</span>}
                </td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatNumber(totalContraValor.toFixed(2)) || 0}
                </td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatNumber((inscription * 2.5).toFixed(2)) || 0}
                </td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatNumber((annulment * 2.5).toFixed(2)) || 0}
                </td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatNumber((increase * 2.5).toFixed(2)) || 0}
                </td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatNumber((decrease * 2.5).toFixed(2)) || 0}
                </td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {formatNumber((dotacaoFinal))}
                </td>
            </tr>

            {account.children &&
                account.children.map((childAccount) =>
                    renderAccountRowsReport(childAccount, level + 1)
                )}
        </>
    );
};
  const renderAccountRows = (account, level = 0) => {
    const indentation = ' '.repeat(level * 2); // Indentação para o nível hierárquico
    const isParentAccount = account.children && account.children.length > 0;

    // Calcula o total da alocação
    const finalAllocation = calculateFinalAllocation(account);

    const usdValue = (finalAllocation * exchangeRate)?.toFixed(2) || 0; // Valor em USD
    const totalContraValor = finalAllocation * exchangeRate;
    const totalDuoDecimo = (usdValue / 12).toFixed(2);

    return (
      <>
        <tr key={account.accountPlan.number} className={isParentAccount ? 'table-success' : ''} style={{ backgroundColor: isParentAccount ? 'black' : '' }}>
          <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>{indentation}{account.accountPlan.number}</td>
          <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>{indentation}{account.accountPlan.description}</td>
          <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }} >{formatNumber(finalAllocation.toFixed(2)) || 0}</td>
          <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }} >{formatNumber(usdValue)}</td>
          <td style={{ padding: '5px 10px', textAlign: 'right', color: 'black' }}>{formatNumber(totalDuoDecimo)}</td>
        </tr>
        {account.children.map((childAccount) => renderAccountRows(childAccount, level + 1))}
      </>
    );
  };

  const renderAccountRowsA = (account, level = 0) => {
    const indentation = ' '.repeat(level * 2);
    const isParentAccount = account.children && account.children.length > 0;
    const finalAllocation = calculateFinalAllocation(account);

    // Verifica se a conta tem movimento (alocação final > 0)
    const hasMovement = finalAllocation > 0;

    // Aplicar filtros
    if ((!showWithMovement && hasMovement) || (!showWithoutMovement && !hasMovement)) {
      return null;
    }

    const usdValue = (finalAllocation * exchangeRate)?.toFixed(2) || 0;
    const totalContraValor = finalAllocation * exchangeRate;
    const totalDuoDecimo = (usdValue / 12).toFixed(2);

    return (
      <>
        <tr
          key={account.accountPlan.number}
          className={isParentAccount ? 'table-success' : ''}
          style={{
            backgroundColor: isParentAccount ? '#f0f0f0' : '',
            display: hasMovement ? '' : 'opacity: 0.7;'
          }}
        >
          <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
            {indentation}{account.accountPlan.number}
          </td>
          <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
            {indentation}{account.accountPlan.description}
            {!hasMovement && <span style={{ fontSize: '0.8em', color: '#999', marginLeft: '5px' }}>(sem movimento)</span>}
          </td>
          <td style={{ padding: '5px 10px', textAlign: 'right', color: 'black' }}>
            {formatNumber(finalAllocation.toFixed(2)) || 0}
          </td>
          <td style={{ padding: '5px 10px', textAlign: 'right', color: 'black' }}>
            {formatNumber(usdValue)}
          </td>
          <td style={{ padding: '5px 10px', textAlign: 'right', color: 'black' }}>
            {formatNumber(totalDuoDecimo)}
          </td>
        </tr>

        {account.children.map((childAccount) => renderAccountRowsA(childAccount, level + 1))}
      </>
    );
  };





  // Renderiza a tabela com base no relatório selecionado
  const renderTable = () => {
    switch (selectedReport) {
      case "Tabela de Despesas":
        return (
          <div className="premium-container">
            {/* Enhanced Button Group with Premium Styling */}

            <div style={styles.container}>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={showWithMovement}
                  onChange={(e) => setShowWithMovement(e.target.checked)}
                  id="filterWithMovement"
                />
                <label className="form-check-label" htmlFor="filterWithMovement">
                  Contas com movimento
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={showWithoutMovement}
                  onChange={(e) => setShowWithoutMovement(e.target.checked)}
                  id="filterWithoutMovement"
                />
                <label className="form-check-label" htmlFor="filterWithoutMovement">
                  Contas sem movimento
                </label>
              </div>
              <Button
                onClick={exportToExcelWithStyles}
                style={styles.excelButton}>
                <FaFileExcel style={styles.icon} />
                Exportar para Excel
              </Button>
              <Button
                onClick={exportToPDF12}
                style={styles.pdfButton}>
                <FaFilePdf style={styles.icon} />
                Exportar para PDF
              </Button>
            </div>

            {/* Premium Scrollable Table Container */}
            <div
              style={{
                maxHeight: '400px',
                overflowY: 'auto',
                borderRadius: '12px',
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                // Estilização personalizada do scroll
                scrollbarWidth: 'thin', // Para Firefox
                scrollbarColor: '#3a56d6 rgba(245, 245, 245, 0.2)', // Para Firefox
                '&::-webkit-scrollbar': {
                  width: '10px',
                  height: '10px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(245, 245, 245, 0.2)',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#3a56d6',
                  borderRadius: '10px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    background: '#2c42b5',
                  }
                }
              }}
            >
              <table id='tableDispo' className="table table-striped table-hover" style={{ width: '100%' }}>
                <thead
                  style={{
                    backgroundColor: '#f4f4f4', textAlign: 'center',
                    position: "sticky",
                    top: 0,
                    zIndex: 2, // Garante que o cabeçalho fique sobre o conteúdo da tabela
                  }}
                >
                  <tr>
                    <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center" }}>Código</th>
                    <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center" }}>Designação</th>
                    <th colSpan={2} style={{ textAlign: "center" }}>Dotação Inicial</th>
                    <th colSpan={1} style={{ textAlign: "center" }}>Duodécimo</th>
                  </tr>
                  <tr>
                    <th>USD</th>
                    <th>Contra Valor</th>
                    <th>Contra Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {organizedAccountsInitial.map((account) => renderAccountRowsA(account))}
                </tbody>
              </table>
            </div>

            {/* Premium Summary Cards */}
            <div className="premium-summary-container">
              {/* Total de Despesas Correntes */}
              <div className="premium-summary-card">
                <h3 className="premium-card-title">Total de Despesas Correntes</h3>
                <div className="premium-card-content">
                  <div className="premium-card-row">
                    <span>Contravalor:</span>
                    <strong>{formatNumber(totalCurrentContraValor)}</strong>
                  </div>
                  <div className="premium-card-row">
                    <span>Duodécimo:</span>
                    <strong>{formatNumber(totalCurrentDuodecimo)}</strong>
                  </div>
                  <div className="premium-card-row total-row">
                    <span>Total:</span>
                    <strong>{formatNumber(totalCurrentExpenses)}</strong>
                  </div>
                </div>
              </div>

              {/* Total de Despesas de Capital */}
              <div className="premium-summary-card accent-card">
                <h3 className="premium-card-title">Total de Despesas de Capital</h3>
                <div className="premium-card-content">
                  <div className="premium-card-row">
                    <span>Contravalor:</span>
                    <strong>{formatNumber(totalCapitalContraValor)}</strong>
                  </div>
                  <div className="premium-card-row">
                    <span>Duodécimo:</span>
                    <strong>{formatNumber(totalCapitalDuodecimo)}</strong>
                  </div>
                  <div className="premium-card-row total-row">
                    <span>Total:</span>
                    <strong>{formatNumber(totalCapitalExpenses)}</strong>
                  </div>
                </div>
              </div>

              {/* Total Orçamento Global */}
              <div className="premium-summary-card highlight-card">
                <h3 className="premium-card-title">Total Orçamento Global</h3>
                <div className="premium-card-content">
                  <div className="premium-card-row">
                    <span>Contravalor:</span>
                    <strong>{formatNumber(totalGlobalContraValor)}</strong>
                  </div>
                  <div className="premium-card-row">
                    <span>Duodécimo:</span>
                    <strong>{formatNumber(totalGlobalDuodecimo)}</strong>
                  </div>
                  <div className="premium-card-row total-row">
                    <span>Total:</span>
                    <strong>{formatNumber(totalGlobalBudget)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "Extrato":
        return (
          <div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: '24px',
              padding: '24px',
              margin: '10px auto',
              borderRadius: '12px',
              background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              {/* Lado esquerdo - Filtros e botões */}
              <div style={{
                flex: '1 1 600px',
                minWidth: '300px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                {/* Botões de exportação */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  <Button
                    variant="contained"
                    style={{
                      background: 'linear-gradient(145deg, #6c757d 0%, #495057 100%)',
                      color: '#fff',
                      padding: '12px 24px',
                      fontSize: '14px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                      textTransform: 'none',
                      minWidth: '200px',
                      border: 'none'
                    }}
                    onClick={exportToExcelExtrato}
                  >
                    <FaFileExcel style={{ marginRight: '8px' }} />
                    Exportar para Excel
                  </Button>

                  <Button
                    variant="contained"
                    style={{
                      background: 'linear-gradient(145deg, #007bff 0%, #0062cc 100%)',
                      color: '#fff',
                      padding: '12px 24px',
                      fontSize: '14px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                      textTransform: 'none',
                      minWidth: '200px',
                      border: 'none'
                    }}
                    onClick={exportToPDFExtrato}
                  >
                    <FaFilePdf style={{ marginRight: '8px' }} />
                    Exportar para PDF
                  </Button>
                </div>

                {/* Filtros */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  alignItems: 'center',
                }}>
                  <select
                    onChange={handleCodigoChangeExtract}
                    value={filters.accountPlanId ? parentAccounts.find(a => a.accountPlan.id === filters.accountPlanId)?.accountPlan.number || '' : ''}
                    style={{
                      minWidth: '220px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#fff',
                      fontSize: '14px',
                      flex: 1
                    }}
                  >
                    <option value="">Selecionar Conta</option>
                    {parentAccounts.map((acc, idx) => (
                      <option key={idx} value={acc.accountPlan.number}>
                        {acc.accountPlan.number} - {acc.accountPlan.description}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    placeholder="Data Início"
                    value={filters.startDate || ''}
                    onChange={handleStartDateChange}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#fff',
                      fontSize: '14px',
                      flex: 1,
                      minWidth: '150px'
                    }}
                  />

                  <span style={{ color: '#ccc' }}>até</span>

                  <input
                    type="date"
                    placeholder="Data Fim"
                    value={filters.endDate || ''}
                    onChange={handleEndDateChange}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: '#fff',
                      fontSize: '14px',
                      flex: 1,
                      minWidth: '150px'
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleSearch}
                    style={{
                      background: 'linear-gradient(145deg, #00d2ff 0%, #007bff 100%)',
                      color: '#fff',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '150px'
                    }}
                  >
                    <FaSearch size={18} style={{ marginRight: '8px' }} />
                    Filtrar
                  </button>

                  <Button
                    variant="outline-secondary"
                    size="sm"
                    style={{
                      color: '#fff',
                      borderColor: '#ccc',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      minWidth: '120px'
                    }}
                    onClick={() => {
                      setFilters({ accountPlanId: null, startDate: '', endDate: '' });
                      setLocalParentAccounts(parentAccounts);
                    }}
                  >
                    <FaTimes style={{ marginRight: 5 }} /> Limpar
                  </Button>
                </div>
              </div>

              {/* Lado direito - Total */}
              <div style={{
                flex: '0 1 350px',
                minWidth: '280px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(145deg, #22223b 0%, #1e1e3a 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{
                  color: '#00d2ff',
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>Total Geral</div>

                <div style={{
                  color: '#fff',
                  fontSize: '28px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {accountSelected[0]?.finalAllocation * 2.5 ?? 0}
                  <span style={{
                    fontSize: '16px',
                    background: 'rgba(0, 210, 255, 0.2)',
                    padding: '4px 8px',
                    borderRadius: '6px'
                  }}>
                    MZN
                  </span>
                </div>
              </div>
            </div>

            {/* Header with account info */}
            {parentAccounts.length > 0 && (
              <div style={{
                padding: '16px',
                background: 'linear-gradient(90deg, rgba(4, 24, 36, 0.93) 0%, rgba(0,123,255,0.15) 100%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#00d2ff',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'sticky',
                top: 0,
                zIndex: 3,
                backdropFilter: 'blur(4px)'
              }}>
                {accountSelected && accountSelected.length > 0 ? (
                  <>
                    <FaInfoCircle style={{ flexShrink: 0 }} />
                    <span>
                      {accountSelected[0].accountPlan.number} - {accountSelected[0].accountPlan.description}
                    </span>
                  </>
                ) : (
                  <>
                    <FaExclamationCircle style={{ flexShrink: 0 }} />
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Nenhum código selecionado
                    </span>
                  </>
                )}
              </div>
            )}
            {/* Scrollable Container for the Table */}
            <div
              style={{
                maxHeight: '400px',
                overflowY: 'auto',
                borderRadius: '12px',
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                background: 'linear-gradient(145deg, #22223b 0%, #1e1e3a 100%)',

                // Estilização personalizada do scroll
                scrollbarWidth: 'thin', // Para Firefox
                scrollbarColor: '#3a56d6 rgba(245, 245, 245, 0.2)', // Para Firefox
                '&::-webkit-scrollbar': {
                  width: '10px',
                  height: '10px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(245, 245, 245, 0.2)',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#3a56d6',
                  borderRadius: '10px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    background: '#2c42b5',
                  }
                }
              }}
            >


              {/* Premium Table */}
              <table
                id="tableBudjectMap"
                className="table table-striped table-bordered table-hover"
                style={{
                  width: '100%',
                  tableLayout: 'fixed',
                }}
              >
                <thead style={{
                  backgroundColor: '#f4f4f4', textAlign: 'center',
                  textAlign: 'center',
                  position: "sticky",
                  top: 0,
                  zIndex: 2, // Garante que o cabeçalho fique sobre o conteúdo da tabela
                }}>
                  <tr>
                    <th rowSpan={2} style={{ padding: '8px', fontWeight: 'bold', verticalAlign: 'middle' }}>Data</th>
                    <th rowSpan={2} style={{ padding: '8px', fontWeight: 'bold', verticalAlign: 'middle' }}>Dotação Inicial</th>
                    <th rowSpan={2} style={{ padding: '8px', fontWeight: 'bold', verticalAlign: 'middle' }}>Inscrição/Reforço</th>
                    <th rowSpan={2} style={{ padding: '8px', fontWeight: 'bold', verticalAlign: 'middle' }}>Anulação/Redução</th>
                    <th colSpan={2} style={{ padding: '8px', fontWeight: 'bold' }}>Redistribuição por Transferência por Verba</th>
                    <th rowSpan={2} style={{ padding: '8px', fontWeight: 'bold', verticalAlign: 'middle' }}>Dotação Final</th>
                  </tr>
                  <tr>
                    <th style={{ padding: '8px', fontWeight: 'bold' }}>Aumento</th>
                    <th style={{ padding: '8px', fontWeight: 'bold' }}>Diminuição</th>
                  </tr>
                </thead>
                <tbody
                  style={{ color: "black", fontWeight: "500" }}
                >
                  {localParentAccounts.map((mov, index) => (
                    <React.Fragment key={index}>
                      {mov.entriesEntry
                        .filter(entry =>
                          entry.type === "reinforcement" ||
                          entry.type === "annulment" ||
                          entry.type === "redistribuition_reinforcement" ||
                          entry.type === "redistribuition_annulment"
                        )
                        .map((entry, entryIndex) => {

                          let aumento = 0;
                          let diminuicao = 0;
                          if (entry.type === "redistribuition_reinforcement") {
                            aumento = entry.allocation;
                          } else if (entry.type === "redistribuition_annulment") {
                            diminuicao = entry.allocation;
                          } else {
                            aumento = entry.type === "reinforcement" ? entry.allocation : 0;
                            diminuicao = entry.type === "annulment" ? entry.allocation : 0;
                          }
                          let dotacaoInicial = entry.lastFinalAllocation || 0;
                          const dotacaoFinal = dotacaoInicial + aumento - diminuicao;
                          return (
                            <tr key={entryIndex}>
                              <td style={{ padding: '8px', textAlign: 'left' }}>
                                {(() => {
                                  const [day, month, year] = entry.operationDate.split('-');
                                  return `${day}/${month}/${year}`;
                                })()}
                              </td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber((dotacaoInicial * 2.5).toFixed(2))}</td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>
                                {entry.type === "reinforcement" ? formatNumber((aumento * 2.5).toFixed(2)) : formatNumber(0)}
                              </td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>
                                {entry.type === "annulment" ? formatNumber((diminuicao * 2.5).toFixed(2)) : formatNumber(0)}
                              </td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>
                                {entry.type === "redistribuition_reinforcement" ? formatNumber((aumento * 2.5).toFixed(2)) : formatNumber(0)}
                              </td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>
                                {entry.type === "redistribuition_annulment" ? formatNumber((diminuicao * 2.5).toFixed(2)) : formatNumber(0)}
                              </td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>{formatNumber((dotacaoFinal * 2.5).toFixed(2))}</td>
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div >
        );
      case "Mapa de Alterações da Tabela de Despesas":
        return (
          <div className="premium-container">
            {/* Enhanced Button Group with Premium Styling */}
            <div style={styles.container}>

            <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            checked={showWithMovement}
            onChange={(e) => setShowWithMovement(e.target.checked)}
            id="filterWithMovement"
          />
          <label className="form-check-label" htmlFor="filterWithMovement">
            Contas com movimento
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            checked={showWithoutMovement}
            onChange={(e) => setShowWithoutMovement(e.target.checked)}
            id="filterWithoutMovement"
          />
          <label className="form-check-label" htmlFor="filterWithoutMovement">
            Contas sem movimento
          </label>
        </div>

              <Button
                onClick={exportToExcel12}
                style={styles.excelButton}>
                <FaFileExcel style={styles.icon} />
                Exportar para Excel
              </Button>
              <Button
                onClick={exportToPDF1}
                style={styles.pdfButton}>
                <FaFilePdf style={styles.icon} />
                Exportar para PDF
              </Button>
            </div>

            <div
              style={{
                maxHeight: "400px", // Limite de altura da tabela com rolagem no corpo
                overflowY: "auto",  // Habilitar rolagem vertical para o corpo da tabela
              }}
            >

              <table
                id="accountsTable"
                responsive
                className="table"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed", // Garante layout uniforme das colunas
                  overflowY: "auto",  // Habilitar rolagem vertical para o corpo da tabela
                }}
              >
                <thead
                  style={{
                    backgroundColor: '#f4f4f4', textAlign: 'center',
                    position: "sticky",
                    top: 0,
                    zIndex: 2, // Garante que o cabeçalho fique sobre o conteúdo da tabela
                  }}
                >
                  <tr>
                    <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center" }}>
                      Código
                    </th>
                    <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center" }}>
                      Designação
                    </th>
                    <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center" }}>
                      Dotação Inicial
                    </th>
                    <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center" }}>
                      Inscrição/Reforço
                    </th>
                    <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center" }}>
                      Anulação/Redução
                    </th>
                    <th colSpan={2} style={{ textAlign: "center" }}>
                      Redistribuição
                    </th>
                    <th rowSpan={2} style={{ textAlign: "center" }}>
                      Dotação Final
                    </th>
                  </tr>
                  <tr>
                    <th>Aumento</th>
                    <th>Diminuição</th>
                  </tr>
                </thead>
                <tbody>{organizedAccounts.map((account) => renderAccountRowsReport(account))}</tbody>
              </table>

              <Dialog open={showModal} onClose={handleClose} fullWidth maxWidth="lg">
                <DialogTitle>
                  <span style={{ fontSize: '16px' }}>
                    Extrato Da Conta
                  </span>
                </DialogTitle>
                <DialogContent>
                  {selectedRow && (
                    <>
                      <div
                        style={{
                          maxHeight: '80vh',
                          overflowY: 'auto',
                          margin: '20px auto',
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                          padding: '10px',
                          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <div
                          style={{
                            marginBottom: '20px',
                            fontWeight: 'bold',
                            fontSize: '15px',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <span>EXTRATO</span>
                          <span>{selectedRow.number}</span>
                          <span>{selectedRow.description}</span>
                        </div>

                        <table
                          id="tableBudjectMapPdfExcell"
                          className="table table-striped table-bordered table-hover"
                          style={{
                            width: '100%',
                            tableLayout: 'fixed',
                          }}
                        >
                          <thead style={{
                            backgroundColor: '#f4f4f4', textAlign: 'center',
                            textAlign: 'center',
                            position: "sticky",
                            top: 0,
                            zIndex: 2, // Garante que o cabeçalho fique sobre o conteúdo da tabela
                          }}>
                            <tr>
                              <th style={{ padding: '8px', fontWeight: 'bold', fontSize: '14px' }}>Data</th>
                              <th style={{ padding: '8px', fontWeight: 'bold', fontSize: '14px' }}>Código</th>
                              <th style={{ padding: '8px', fontWeight: 'bold', fontSize: '14px' }}>Designação</th>
                              <th style={{ padding: '8px', fontWeight: 'bold', fontSize: '14px' }}>Dotação Inicial</th>
                              <th style={{ padding: '8px', fontWeight: 'bold', fontSize: '14px' }}>Inscrição/ Reforço</th>
                              <th style={{ padding: '8px', fontWeight: 'bold', fontSize: '14px' }}>Anulação/ Redução</th>
                              <th colSpan="2" style={{ padding: '8px', fontWeight: 'bold', fontSize: '14px' }}>Redistribuição</th>
                              <th style={{ padding: '8px', fontWeight: 'bold', fontSize: '14px' }}>Dotação Final</th>
                            </tr>
                            <tr>
                              <th colSpan="5" style={{ padding: '8px', fontWeight: 'bold', fontSize: '14px' }}></th>
                              <th style={{ padding: '8px', fontWeight: 'bold', fontSize: '14px' }}></th>
                              <th style={{ padding: '8px', fontWeight: 'bold', fontSize: '14px' }}>Aumento</th>
                              <th style={{ padding: '8px', fontWeight: 'bold', fontSize: '14px' }}>Diminuição</th>
                              <th style={{ padding: '8px', fontWeight: 'bold', fontSize: '14px' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {parentAccounts
                              .filter((mov) => mov.accountPlan.number === selectedRow.number)
                              .map((mov, index) => (
                                <React.Fragment key={index}>
                                  {mov.entriesEntry
                                    .filter(
                                      (entry) =>
                                        entry.type === 'initial_allocation' ||
                                        entry.type === 'reinforcement' ||
                                        entry.type === 'annulment' ||
                                        entry.type === 'redistribuition_reinforcement' ||
                                        entry.type === 'redistribuition_annulment'
                                    )
                                    .map((entry, entryIndex) => {
                                      let aumento = 0;
                                      let diminuicao = 0;

                                      // Verifica o tipo da entrada e ajusta aumento e diminuição
                                      if (entry.type === 'initial_allocation') {
                                        aumento = 0; // Não deve haver aumento para initial_allocation
                                        diminuicao = 0; // Não deve haver diminuição para initial_allocation
                                      } else if (entry.type === 'redistribuition_reinforcement') {
                                        aumento = entry.allocation; // Reforço de redistribuição
                                      } else if (entry.type === 'redistribuition_annulment') {
                                        diminuicao = entry.allocation; // Anulação de redistribuição
                                      } else {
                                        aumento = entry.type === 'reinforcement' ? entry.allocation : 0;
                                        diminuicao = entry.type === 'annulment' ? entry.allocation : 0;
                                      }

                                      let dotacaoInicial = entry.type === 'initial_allocation' ? entry.allocation : entry.lastFinalAllocation || 0;
                                      const dotacaoFinal = dotacaoInicial + aumento - diminuicao;
                                      return (
                                        <tr key={entryIndex} style={{ textAlign: 'right' }}>
                                          <td style={{ padding: '8px', fontSize: '14px' }}>{entry.operationDate}</td>
                                          <td style={{ padding: '8px', fontSize: '14px' }}>{mov.accountPlan.number}</td>
                                          <td style={{ padding: '8px', fontSize: '14px' }}>{mov.accountPlan.description}</td>
                                          <td style={{ padding: '8px', fontSize: '14px' }}>
                                            {entry.type === 'initial_allocation'
                                              ? formatNumber((dotacaoInicial * 2.5).toFixed(2))
                                              : 0
                                            }
                                          </td>
                                          <td style={{ padding: '8px', fontSize: '14px' }}>
                                            {entry.type === 'reinforcement' || entry.type === 'initial_allocation'
                                              ? formatNumber((aumento * 2.5).toFixed(2))
                                              : 0}
                                          </td>
                                          <td style={{ padding: '8px', fontSize: '14px' }}>
                                            {entry.type === 'annulment' ? formatNumber((diminuicao * 2.5).toFixed(2)) : 0}
                                          </td>
                                          <td style={{ padding: '8px', fontSize: '14px' }}>
                                            {entry.type === 'redistribuition_reinforcement' ? formatNumber((aumento * 2.5).toFixed(2)) : 0}
                                          </td>
                                          <td style={{ padding: '8px', fontSize: '14px' }}>
                                            {entry.type === 'redistribuition_annulment' ? formatNumber((diminuicao * 2.5).toFixed(2)) : 0}
                                          </td>
                                          <td style={{ padding: '8px', fontSize: '14px' }}>
                                            {formatNumber((dotacaoFinal * 2.5).toFixed(2))}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </React.Fragment>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="secondary">
                    Fechar
                  </Button>
                  <Button variant="contained" color="primary" onClick={exportToExcel}>
                    Exportar para Excel
                  </Button>
                  <Button variant="contained" color="primary" onClick={exportToPDF}>
                    Exportar para PDF
                  </Button>
                </DialogActions>
              </Dialog>

            </div>

            <div style={{
              marginTop: "10px",
              display: "flex",
              gap: "12px",
              justifyContent: "space-between",
              alignItems: "stretch",
              borderRadius: "10px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
            }}>
              {[
                {
                  title: "Total de Despesas Correntes",
                  color: "#00d2ff", // Azul neon
                  items: [
                    { label: "Dotação Inicial", value: totalMzn },
                    { label: "Inscrição/Reforço", value: inscription1 * 2.5 },
                    { label: "Anulação/Redução", value: annulment1 * 2.5 },
                    { label: "Redistribuição(Aumento)", value: increase1 * 2.5 },
                    { label: "Redistribuição(Diminuição)", value: decrease1 * 2.5 },
                    {
                      label: "Dotação Final",
                      value: (totalMzn) + (inscription1 * 2.5) - (annulment1 * 2.5) + (increase1 * 2.5) - (decrease1 * 2.5),
                      highlight: true
                    }
                  ]
                },
                {
                  title: "Total de Despesas de Capital",
                  color: "#ff6b6b", // Vermelho coral
                  items: [
                    { label: "Contravalor", value: totalMznDespesas },
                    { label: "Inscrição/Reforço", value: inscription112 * 2.5 },
                    { label: "Anulação/Redução", value: annulment112 * 2.5 },
                    { label: "Redistribuição(Aumento)", value: increase112 * 2.5 },
                    { label: "Redistribuição(Diminuição)", value: decrease112 * 2.5 },
                    {
                      label: "Dotação Final",
                      value: (totalMznDespesas) + (inscription112 * 2.5) - (annulment112 * 2.5) + (increase112 * 2.5) - (decrease112 * 2.5),
                      highlight: true
                    }
                  ]
                },
                {
                  title: "Total Orçamento Global",
                  color: "#6bff6b", // Verde neon
                  items: [
                    { label: "Contravalor", value: totalMznF },
                    { label: "Inscrição/Reforço", value: inscription112F * 2.5 },
                    { label: "Anulação/Redução", value: annulment112F * 2.5 },
                    { label: "Redistribuição(Aumento)", value: Math.round(increase112F * 2.5 * 100) / 100 },
                    { label: "Redistribuição(Diminuição)", value: decrease112F * 2.5 },
                    {
                      label: "Dotação Final",
                      value: (totalMznF) + (inscription112F * 2.5) - (annulment112F * 2.5) + (increase112F * 2.5) - (decrease112F * 2.5),
                      highlight: true
                    }
                  ]
                }
              ].map((card, index) => (
                <div key={index} style={{
                  flex: "1",
                  padding: "16px",
                  background: "linear-gradient(145deg, #22223b 0%, #1e1e3a 100%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  minWidth: "0",
                  borderTop: `3px solid ${card.color}`,
                  backdropFilter: "blur(2px)"
                }}>
                  <div style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: card.color,
                    marginBottom: "16px",
                    paddingBottom: "10px",
                    borderBottom: `1px solid ${card.color}30`,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    textShadow: `0 0 8px ${card.color}40`
                  }}>{card.title}</div>

                  <div style={{ display: "grid", gap: "12px" }}>
                    {card.items.map((item, i) => (
                      <div key={i} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        color: item.highlight ? "#ffffff" : "rgba(255,255,255,0.8)",
                        fontWeight: item.highlight ? "700" : "500",
                        background: item.highlight ? `linear-gradient(90deg, ${card.color}20 0%, transparent 100%)` : "transparent",
                        padding: item.highlight ? "10px 12px" : "6px 0",
                        borderRadius: "4px",
                        borderLeft: item.highlight ? `3px solid ${card.color}` : "none"
                      }}>
                        <span style={{
                          color: item.highlight ? card.color : "inherit",
                          textShadow: item.highlight ? `0 0 5px ${card.color}30` : "none"
                        }}>
                          {item.label}:
                        </span>
                        <strong style={{
                          color: item.highlight ? card.color : "#ffffff",
                          fontSize: item.highlight ? "15px" : "14px",
                          textShadow: item.highlight ? `0 0 8px ${card.color}50` : "none"
                        }}>
                          {formatNumber(item.value)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "Dotação Disponível":
        return (
          <div>
            {/* Contêiner flexível para organizar o botão e o campo de busca */}
            <div className="row" style={{
              display: 'flex',
              justifyContent: 'space-between', // Alinha o botão à esquerda e o input ao centro
              alignItems: 'center', // Alinha verticalmente
            }}>
              <div style={styles.container}>


                <Button
                  onClick={exportToExcel1}
                  style={styles.excelButton}>
                  <FaFileExcel style={styles.icon} />
                  Exportar para Excel
                </Button>
                <Button
                  onClick={exportToPDF122}
                  style={styles.pdfButton}>
                  <FaFilePdf style={styles.icon} />
                  Exportar para PDF
                </Button>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ marginRight: '10px', color: 'white', fontWeight: 'bold' }}>Filtrar por Orçamento Disponível:</label>
                  <input
                    type="text"
                    placeholder="Filtrar por Código"
                    value={filterCode}
                    onChange={(e) => setFilterCode(e.target.value)} // Atualiza o estado filterCode
                    style={{
                      marginRight: '10px',
                      width: '200px',
                      padding: '5px',
                      borderRadius: '4px',
                    }}
                  />
                </div>


                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="form-check" style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={showWithMovement}
                  onChange={(e) => setShowWithMovement(e.target.checked)}
                  id="filterWithMovement"
                  style={{ marginRight: '5px' }}
                />
                <label className="form-check-label" htmlFor="filterWithMovement" style={{ color: 'white' }}>
                  Com movimento
                </label>
              </div>
              
              <div className="form-check" style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={showWithoutMovement}
                  onChange={(e) => setShowWithoutMovement(e.target.checked)}
                  id="filterWithoutMovement"
                  style={{ marginRight: '5px' }}
                />
                <label className="form-check-label" htmlFor="filterWithoutMovement" style={{ color: 'white' }}>
                  Sem movimento
                </label>
              </div>
              </div>

              </div>



            </div>
            <div
              style={{
                maxHeight: '400px',
                overflowY: 'auto',
                borderRadius: '12px',
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                // Estilização personalizada do scroll
                scrollbarWidth: 'thin', // Para Firefox
                scrollbarColor: '#3a56d6 rgba(245, 245, 245, 0.2)', // Para Firefox
                '&::-webkit-scrollbar': {
                  width: '10px',
                  height: '10px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(245, 245, 245, 0.2)',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#3a56d6',
                  borderRadius: '10px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    background: '#2c42b5',
                  }
                }
              }}
            >
              <table id="tableBudjectDisponivel" className="table table-striped table-bordered table-hover">
                <thead
                  style={{
                    backgroundColor: '#f4f4f4', textAlign: 'center',
                    position: "sticky",
                    top: 0,
                    zIndex: 2, // Garante que o cabeçalho fique sobre o conteúdo da tabela
                  }}
                >
                  <tr>
                    <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center" }}>
                      Código
                    </th>
                    <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center" }}>
                      Designação
                    </th>
                    <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center" }}>
                      Dotação Inicial
                    </th>
                    <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center" }}>
                      Dotação Final
                    </th>
                    <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center" }}>
                      Dotação Disponível
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {renderFilteredAccountRows()}
                </tbody>
              </table>
            </div>

            <div style={{
              marginTop: "10px",
              display: "flex",
              gap: "12px",
              padding: "12px",
              justifyContent: "space-between",
              alignItems: "stretch",
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              borderRadius: "10px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
            }}>
              {[
                {
                  title: "Total de Despesas Correntes",
                  color: "#00d2ff", // Azul neon
                  items: [
                    { label: "Dotação Inicial", value: totalMzn },
                    { label: "Dotação Final", value: totalCurrentExpensesDisponivel * 2.5, highlight: true },
                    { label: "Dotação Disponivel", value: (totalCurrentExpensesDisponivel * 2.5), highlight: true }
                  ]
                },
                {
                  title: "Total de Despesas de Capital",
                  color: "#ff6b6b", // Vermelho coral
                  items: [
                    { label: "Dotação Inicial", value: totalCurrentContraValorDataDespesas * 2.5 },
                    { label: "Dotação Final", value: totalCapitalExpensesDisponivel * 2.5, highlight: true },
                    { label: "Dotação Disponivel", value: (totalCapitalExpensesDisponivel * 2.5), highlight: true }
                  ]
                },
                {
                  title: "Total Orçamento Global",
                  color: "#6bff6b", // Verde neon
                  items: [
                    { label: "Dotação Inicial", value: totalMzn + (totalCurrentContraValorDataDespesas * 2.5) },
                    { label: "Dotação Final", value: totalGlobalBudget2 * 2.5, highlight: true },
                    { label: "Dotação Disponivel", value: ((totalGlobalBudget2 * 2.5)), highlight: true }
                  ]
                }
              ].map((card, index) => (
                <div key={index} style={{
                  flex: "1",
                  padding: "16px",
                  background: "linear-gradient(145deg, #22223b 0%, #1e1e3a 100%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  minWidth: "0",
                  borderTop: `3px solid ${card.color}`,
                  backdropFilter: "blur(2px)"
                }}>
                  <div style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    color: card.color,
                    marginBottom: "16px",
                    paddingBottom: "10px",
                    borderBottom: `1px solid ${card.color}30`,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    textShadow: `0 0 8px ${card.color}40`
                  }}>{card.title}</div>

                  <div style={{ display: "grid", gap: "12px" }}>
                    {card.items.map((item, i) => (
                      <div key={i} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        color: item.highlight ? "#ffffff" : "rgba(255,255,255,0.8)",
                        fontWeight: item.highlight ? "700" : "500",
                        background: item.highlight ? `linear-gradient(90deg, ${card.color}20 0%, transparent 100%)` : "transparent",
                        padding: item.highlight ? "10px 12px" : "6px 0",
                        borderRadius: "4px",
                        borderLeft: item.highlight ? `3px solid ${card.color}` : "none"
                      }}>
                        <span style={{
                          color: item.highlight ? card.color : "inherit",
                          textShadow: item.highlight ? `0 0 5px ${card.color}30` : "none"
                        }}>
                          {item.label}:
                        </span>
                        <strong style={{
                          color: item.highlight ? card.color : "#ffffff",
                          fontSize: item.highlight ? "15px" : "14px",
                          textShadow: item.highlight ? `0 0 8px ${card.color}50` : "none"
                        }}>
                          {formatNumber(item.value)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid px-3 py-2">
      {/* Header Institucional SGF com Seletor Integrado */}
      <div className="sgf-header-box">
        <div className="header-title-area">
          <FaMoneyBill size={28} color="#ffffff" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }} />
          <div>
            <h3>RELATÓRIOS DE PLANO E ORÇAMENTO</h3>
            <p>Emissão de Balancetes, Tabelas de Despesas, Dotações Disponíveis e Extratos de Execução</p>
          </div>
        </div>
        <div className="header-action-area">
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="sgf-header-select"
          >
            <option value="">-- Selecione o Relatório --</option>
            <option value="Tabela de Despesas">Tabela de Despesas</option>
            <option value="Mapa de Alterações da Tabela de Despesas">Mapa de Alterações da Tabela de Despesas</option>
            <option value="Dotação Disponível">Dotação Disponível</option>
            <option value="Extrato">Extrato</option>
          </select>
        </div>
      </div>

      {/* Tabela dinâmica 100% de largura */}
      <div style={{ margin: "0 auto", width: "100%", padding: "0 4px" }}>{renderTable()}</div>

      {/* CSS */}
      <style jsx>{`

/* Premium Container */
.premium-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
}

/* Premium Button Group */
.premium-button-group {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}
.premium-button-group {
  display: flex;
  justify-content: center; /* Centraliza horizontalmente */
  gap: 20px; /* Espaço entre os botões */
  margin-top: 30px;
  flex-wrap: wrap; /* Permite quebra em telas menores */
}

.premium-button-group .premium-excel-btn,
.premium-button-group .premium-pdf-btn {
  background-color: #3a5bff; /* Azul CPR */
  color: white;
  font-weight: bold;
  border-radius: 8px;
  padding: 12px 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
}

.premium-button-group .premium-excel-btn:hover {
  background-color: #2a47d9;
  transform: translateY(-2px);
}

.premium-button-group .premium-pdf-btn {
  background-color: #ff5e3a;
}

.premium-button-group .premium-pdf-btn:hover {
  background-color: #e64a28;
  transform: translateY(-2px);
}

.premium-icon {
  font-size: 1.2rem;
}


.premium-excel-btn:hover, .premium-pdf-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

/* Premium Table Container */
.premium-table-container {
  max-height: 500px;
  overflow-y: auto;
  margin: 30px 0;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.premium-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.premium-table-header {
  position: sticky;
  top: 0;
  z-index: 10;
}


/* Premium Summary Cards - Versão Melhorada */
.premium-summary-container {
  display: flex;
  gap: 25px;
  margin-top: 20px;
}

.premium-summary-card {
  flex: 1;
  padding: 5px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  background: white;
  transition: all 0.3s ease;
  border-left: 1px solid rgba(0,0,0,0.05);
  border-right: 1px solid rgba(0,0,0,0.05);
}

.premium-summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}

.accent-card {
  border-top: 6px solid #3a5bff;
  background: linear-gradient(to bottom right, #f8faff, #ffffff);
}

.highlight-card {
  border-top: 6px solid #ff5e3a;
  background: linear-gradient(to bottom right, #fff9f8, #ffffff);
}

.premium-card-title {
  color: #1a2b6d;
  font-size: 1.2rem;
  border-bottom: 2px solid #f0f2ff;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.premium-card-content {
  display: flex;
  flex-direction: column;
}

.premium-card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
}

.premium-card-row span {
  color: #555;
  font-weight: 500;
}

.premium-card-row strong {
  color: #1a2b6d;
  font-weight: 700;
  font-size: 1rem;
}

.premium-card-row.total-row {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px dashed #e0e3ff;
  font-size: 1rem;
}

.premium-card-row.total-row span {
  color: #1a2b6d;
  font-weight: 600;
}

.premium-card-row.total-row strong {
  color: #ff5e3a;
  font-size: 1.15rem;
}

/* Melhorias de responsividade */
@media (max-width: 768px) {
  .premium-summary-container {
    flex-direction: column;
    gap: 20px;
  }
  
  .premium-summary-card {
    padding: 20px;
  }
  
  .premium-card-title {
    font-size: 1.15rem;
  }
}

`}</style>
    </div>


  );
};

export default PlanBudgetReport;
