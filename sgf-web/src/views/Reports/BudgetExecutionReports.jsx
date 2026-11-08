import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from 'react-bootstrap';
import { fetchAllAccountingJournal20, fetchAccountRequestValid, fetchSummationAccountEntriesEntry, fetchInitialAllocationsByParentId, findAccountPlanBudjectEntriesByYear, fetchAccountRequestWhitConformance, fetchAllAccountingJournalEntryAll, createBillToReceiveAccountingJournal, fetchOpenAccount } from '../../services/accountService';
import brasao from '../../assets/img/brasao.png';
import * as XLSX from 'xlsx';
import jsPDF from "jspdf";
import "jspdf-autotable"
import Spinner from '../../config/spinner/spinner';
import { FaMoneyBill, FaSearch } from "react-icons/fa";
import Swal from 'sweetalert2';
import { FaFileExcel, FaFilePdf, FaInfoCircle, FaTimes, FaExclamationCircle } from 'react-icons/fa';
import templatePDF from '../BudgetChange/component/templatePDF'; // Caminho correto pro seu template
import logoMz from '../../assets/img/logoMz.png';
import templateExtractPDF from '../BudgetChange/component/templateExtactPDF'; // Caminho correto pro seu template

const BudgetExecutionReports = () => {
    const [selectedReport, setSelectedReport] = useState("");
    const [highlightSearch, setHighlightSearch] = useState(false);
    const [valueMovimentAccount, setvalueMovimentAccount] = useState([]);
    const [internalRequestsValid, setInternalRequestsValid] = useState([]);

    // Renderiza o título dinamicamente com base no relatório seleccionado
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

    const [accounts, setAccounts] = useState([]);
    const [requests, setRequests] = useState([]); // Lista de requisições
    const [loading, setLoading] = useState(false); // Estado para gerenciar o carregamento
    const [exchangeRate, setExchangeRate] = useState(2.5);
    const [parentAccounts, setParentAccounts] = useState([]);
    const [accountsData, setAccountData] = useState([]);
    const [diaries, setDiaries] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [tableData1, setTableData1] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(""); // Estado para a conta selecionada
    const [internalRequests, setInternalRequests] = useState([]);
    const [internalRequestsPaid, setInternalRequestsPaid] = useState([]);
    const [requestsFilter, setRequestsFilter] = useState([]); // Lista de requisições
    const [totalRequisicoes, setTotalRequisicoes] = useState('');
    const [saldoRequisicoes, setSaldoRequisicoes] = useState('');
    const [totalPagamentos, setTotalPagamentos] = useState('');
    const [saldoPagamentos, setSaldoPagamentos] = useState('');





    const [initialAllocation, setEnitialAllocation] = useState('');
    const [insertAllocation, setInsertAllocation] = useState('');
    const [modified, setModified] = useState('');
    const [anullment, setAnullment] = useState('');
    const [finalAllocation, setFinalAllocation] = useState('');
    const [redistribuitionDataReinforcement, setRedistribuitionDataReinforcement] = useState('');
    const [redistribuitionDataAnnulment, setRedistribuitionDataAnnulment] = useState('');
    const [reserve, setReserve] = useState('');
    const [code, setCode] = useState('');

    const [disponivel, setDisponivel] = useState(0); // Define um estado inicial
    const [valuesAccounts, setValuesAccounts] = useState([]);

    const [totalAvailableBudget, setTotalAvailableBudget] = useState(0);
    const [totalUntilMonth, setTotalUntilMonth] = useState(0);
    const [totalDuringMonth, setTotalDuringMonth] = useState(0);
    const [totalAccumulated, setTotalAccumulated] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);
    // let totalCurrentExpenses = 0;

    const [selectedMonth, setSelectedMonth] = useState('');
    const months = [
        { value: '01', label: 'Janeiro' },
        { value: '02', label: 'Fevereiro' },
        { value: '03', label: 'Março' },
        { value: '04', label: 'Abril' },
        { value: '05', label: 'Maio' },
        { value: '06', label: 'Junho' },
        { value: '07', label: 'Julho' },
        { value: '08', label: 'Agosto' },
        { value: '09', label: 'Setembro' },
        { value: '10', label: 'Outubro' },
        { value: '11', label: 'Novembro' },
        { value: '12', label: 'Dezembro' }
    ];

    const [currentExpenses, setCurrentExpenses] = useState({
        totalAvailableBudget: 0,
        totalUntilMonth: 0,
        totalDuringMonth: 0,
        totalAccumulated: 0,
        totalBalance: 0
    });

    // Estados para Total de Despesas de Capital
    const [capitalExpenses, setCapitalExpenses] = useState({
        totalAvailableBudget: 0,
        totalUntilMonth: 0,
        totalDuringMonth: 0,
        totalAccumulated: 0,
        totalBalance: 0
    });


    const handleChangeBank = (event) => {
        setSelectedAccount(event.target.value);
    };
    const filteredAccounts = accounts.filter((account) =>
        selectedAccount ? account.accountPlan.number === selectedAccount : true
    );




    const exportToPDFData = () => {
        // 1. Título e subtítulo
        const title = "Balancete de Execução Orçamental";
        const subtitle = "Balancete de Execução Orçamental – Pagamentos";
        const table = document.querySelector('#BudjectData');
        const rows = Array.from(table.querySelectorAll('tr'));

        // 2. Cabeçalhos da tabela corrigidos
        const headerRow1 = [
            { content: "Código", rowSpan: 2 },
            { content: "Designação", rowSpan: 2 },
            { content: "Dotação Disponível", rowSpan: 2 },
            { content: "Requisições Emitidas", colSpan: 4, styles: { halign: 'center' } },
            { content: "Despesas Pagas", colSpan: 4, styles: { halign: 'center' } }
        ];

        const headerRow2 = [
            "Até ao Mês", "Durante o Mês", "Acumulado", "Saldo",
            "Até ao Mês", "Durante o Mês", "Acumulado", "Saldo",
            "Até ao Mês", "Durante o Mês", "Acumulado", "Saldo"
        ];

        const headers = [headerRow1, headerRow2];

        // 3. Dados da tabela principal
        const body = rows.slice(1).map(row =>
            Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim())
        );

        // 4. Adicionar os totais como últimas linhas da tabela - CORRIGIDO
        const totals = [
            // Despesas Correntes - Requisições Emitidas e Despesas Pagas
            ["", "TOTAL DESPESAS CORRENTES",
                formatNumber(totalCurrentExpenses * 2.5),
                formatNumber(currentExpenses1.totalUntilMonth),
                formatNumber(currentExpenses1.totalDuringMonth),
                formatNumber(currentExpenses1.totalAccumulated),
                formatNumber((totalCurrentExpenses * 2.5) - currentExpenses1.totalAccumulated),
                formatNumber(currentExpenses1.totalUntilMonthPaid),
                formatNumber(currentExpenses1.totalDuringMonthPaid),
                formatNumber(currentExpenses1.totalAccumulatedPaid),
                formatNumber((totalCurrentExpenses * 2.5 - currentExpenses1.totalAccumulatedPaid))],

            // Despesas de Capital - Requisições Emitidas e Despesas Pagas
            ["", "TOTAL DESPESAS DE CAPITAL",
                formatNumber(totalCapitalExpenses * 2.5),
                formatNumber(capitalExpenses1.totalUntilMonth),
                formatNumber(capitalExpenses1.totalDuringMonth),
                formatNumber(capitalExpenses1.totalAccumulated),
                formatNumber(capitalExpenses1.totalBalance),
                formatNumber(capitalExpenses1.totalUntilMonthPaid),
                formatNumber(capitalExpenses1.totalDuringMonthPaid),
                formatNumber(capitalExpenses1.totalAccumulatedPaid),
                formatNumber(capitalExpenses1.totalBalancePaid)],

            // Orçamento Global - Requisições Emitidas e Despesas Pagas
            ["", "TOTAL ORÇAMENTO GLOBAL",
                formatNumber((totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5)),
                formatNumber(totalOverall1.totalUntilMonth),
                formatNumber(totalOverall1.totalDuringMonth),
                formatNumber(totalOverall1.totalAccumulated),
                formatNumber((totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5) - totalOverall1.totalAccumulated),
                formatNumber(totalOverall1.totalUntilMonthPaid),
                formatNumber(totalOverall1.totalDuringMonthPaid),
                formatNumber(totalOverall1.totalAccumulatedPaid),
                formatNumber(totalOverall1.totalBalancePaid)]
        ];

        // 5. Combinar corpo da tabela com totais
        const tableBodyWithTotals = [...body, ...totals];

        // 6. Estilos para as linhas de totais - ATUALIZADO
        const columnStyles = {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 'auto' },
            4: { cellWidth: 'auto' },
            5: { cellWidth: 'auto' },
            6: { cellWidth: 'auto' },
            7: { cellWidth: 'auto' },
            8: { cellWidth: 'auto' },
            9: { cellWidth: 'auto' },
            10: { cellWidth: 'auto' }
        };

        // Estilos específicos para as linhas de totais
        const totalRowsStyles = {
            // Aplica a todas as colunas das linhas de totais
            0: { fontStyle: 'bold', fillColor: [240, 240, 240] }, // Despesas Correntes
            1: { fontStyle: 'bold', fillColor: [240, 240, 240] }, // Despesas de Capital
            2: { fontStyle: 'bold', fillColor: [220, 230, 240] }  // Orçamento Global (azul claro)
        };

        // 7. Dados do rodapé e metadados
        const footerText = "Documento gerado automaticamente";
        const logoImage = logoMz;
        const savedUserData = JSON.parse(localStorage.getItem("userData"));
        const generatedBy = savedUserData.fullName.toString();
        const filename = "BalancetedeExecucaoOrçamental.pdf";

        // 8. Conteúdo da tabela no formato esperado pelo template
        const tableContent = {
            head: headers,
            body: tableBodyWithTotals,
            columnStyles: columnStyles,
            didDrawCell: (data) => {
                // Aplicar estilos para as linhas de totais
                const rowIndex = data.row.index;
                if (rowIndex >= body.length) {
                    const totalRowIndex = rowIndex - body.length;
                    const style = totalRowsStyles[totalRowIndex] || {};
                    data.cell.styles = {
                        ...data.cell.styles,
                        ...style
                    };
                }
            }
        };

        // 9. Geração do PDF via template
        templatePDF({
            title,
            subtitle,
            tableContent,
            footerText,
            logoImage,
            generatedBy,
            filename,
            selectedMonth
        });
    };



    const exportToExcelData = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Balancetes");

        // 1. Definir os cabeçalhos (mesma estrutura do PDF)
        const headerRow1 = [
            "Código",
            "Designação",
            "Dotação Disponível",
            "Requisições Emitidas", "", "", "",
            "Despesas Pagas", "", "", ""
        ];

        const headerRow2 = [
            "", "", "",
            "Até ao Mês", "Durante o Mês", "Acumulado", "Saldo",
            "Até ao Mês", "Durante o Mês", "Acumulado", "Saldo"
        ];

        // 2. Adicionar os cabeçalhos com estilo e mesclagem
        worksheet.addRow(headerRow1);
        worksheet.addRow(headerRow2);

        // Mesclar células para os cabeçalhos principais
        worksheet.mergeCells('D1:G1'); // Requisições Emitidas
        worksheet.mergeCells('H1:K1'); // Despesas Pagas

        // Aplicar estilos aos cabeçalhos
        [1, 2].forEach(rowNum => {
            const row = worksheet.getRow(rowNum);
            row.eachCell((cell, colNumber) => {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: rowNum === 1 ? "323232" : "555555" }
                };
                cell.font = {
                    bold: true,
                    color: { argb: "FFFFFF" }
                };
                cell.alignment = {
                    horizontal: colNumber <= 3 ? "left" : "center",
                    vertical: "middle",
                    wrapText: true
                };
                cell.border = {
                    top: { style: "thin", color: { argb: "000000" } },
                    left: { style: "thin", color: { argb: "000000" } },
                    bottom: { style: "thin", color: { argb: "000000" } },
                    right: { style: "thin", color: { argb: "000000" } }
                };
            });
        });

        // 3. Capturar e adicionar os dados da tabela HTML
        const table = document.getElementById("BudjectData");
        const rows = table.querySelectorAll("tbody tr");

        rows.forEach(row => {
            const rowData = [...row.cells].map(cell => cell.innerText);
            const newRow = worksheet.addRow(rowData);

            newRow.eachCell((cell, colNumber) => {
                cell.alignment = {
                    horizontal: colNumber <= 2 ? "left" : "right",
                    vertical: "middle"
                };
                cell.border = {
                    top: { style: "thin", color: { argb: "D3D3D3" } },
                    left: { style: "thin", color: { argb: "D3D3D3" } },
                    bottom: { style: "thin", color: { argb: "D3D3D3" } },
                    right: { style: "thin", color: { argb: "D3D3D3" } }
                };

                // Formatar números nas colunas numéricas (3-11)
                if (colNumber >= 3 && colNumber <= 11) {
                    const numValue = parseFloat(cell.text.replace(/[^\d,-]/g, '').replace(',', '.'));
                    if (!isNaN(numValue)) {
                        cell.numFmt = '#,##0.00;[Red]-#,##0.00';

                        // Destacar saldo negativo
                        if ((colNumber === 7 || colNumber === 11) && numValue < 0) {
                            cell.font = { color: { argb: "FF0000" }, bold: true };
                        }
                    }
                }
            });
        });

        // 4. Adicionar linha em branco como separador
        worksheet.addRow([]);

        // 5. Adicionar totais com formatação especial (mesma lógica do PDF)
        const totalStyles = [
            { // Despesas Correntes
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "F0F0F0" } },
                font: { bold: true, color: { argb: "000000" } }
            },
            { // Despesas de Capital
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "F0F0F0" } },
                font: { bold: true, color: { argb: "000000" } }
            },
            { // Orçamento Global
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "DCE6F1" } },
                font: { bold: true, color: { argb: "000000" } }
            }
        ];

        const totals = [
            // Despesas Correntes - Requisições Emitidas e Despesas Pagas
            ["", "TOTAL DESPESAS CORRENTES",
                formatNumber(totalCurrentExpenses * 2.5),
                formatNumber(currentExpenses1.totalUntilMonth),
                formatNumber(currentExpenses1.totalDuringMonth),
                formatNumber(currentExpenses1.totalAccumulated),
                formatNumber((totalCurrentExpenses * 2.5) - currentExpenses1.totalAccumulated),
                formatNumber(currentExpenses1.totalUntilMonthPaid),
                formatNumber(currentExpenses1.totalDuringMonthPaid),
                formatNumber(currentExpenses1.totalAccumulatedPaid),
                formatNumber((totalCurrentExpenses * 2.5 - currentExpenses1.totalAccumulatedPaid))],

            // Despesas de Capital - Requisições Emitidas e Despesas Pagas
            ["", "TOTAL DESPESAS DE CAPITAL",
                formatNumber(totalCapitalExpenses * 2.5),
                formatNumber(capitalExpenses1.totalUntilMonth),
                formatNumber(capitalExpenses1.totalDuringMonth),
                formatNumber(capitalExpenses1.totalAccumulated),
                formatNumber(capitalExpenses1.totalBalance),
                formatNumber(capitalExpenses1.totalUntilMonthPaid),
                formatNumber(capitalExpenses1.totalDuringMonthPaid),
                formatNumber(capitalExpenses1.totalAccumulatedPaid),
                formatNumber(capitalExpenses1.totalBalancePaid)],

            // Orçamento Global - Requisições Emitidas e Despesas Pagas
            ["", "TOTAL ORÇAMENTO GLOBAL",
                formatNumber((totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5)),
                formatNumber(totalOverall1.totalUntilMonth),
                formatNumber(totalOverall1.totalDuringMonth),
                formatNumber(totalOverall1.totalAccumulated),
                formatNumber((totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5) - totalOverall1.totalAccumulated),
                formatNumber(totalOverall1.totalUntilMonthPaid),
                formatNumber(totalOverall1.totalDuringMonthPaid),
                formatNumber(totalOverall1.totalAccumulatedPaid),
                formatNumber(totalOverall1.totalBalancePaid)]
        ];

        totals.forEach((rowData, index) => {
            const totalRow = worksheet.addRow(rowData);

            totalRow.eachCell((cell, colNumber) => {
                // Aplicar estilo base
                Object.assign(cell, totalStyles[index]);

                // Alinhamento
                cell.alignment = {
                    horizontal: colNumber <= 2 ? "left" : "right",
                    vertical: "middle"
                };

                // Bordas mais destacadas para totais
                cell.border = {
                    top: { style: "medium", color: { argb: "000000" } },
                    left: { style: "medium", color: { argb: "000000" } },
                    bottom: { style: "medium", color: { argb: "000000" } },
                    right: { style: "medium", color: { argb: "000000" } }
                };

                // Formatar números
                if (colNumber >= 3) {
                    cell.numFmt = '#,##0.00;[Red]-#,##0.00';

                    // Destacar saldos negativos
                    if ((colNumber === 7 || colNumber === 11) && cell.value < 0) {
                        cell.font = { ...cell.font, color: { argb: "FF0000" } };
                    }
                }
            });
        });

        // 6. Ajustar largura das colunas automaticamente
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const columnLength = cell.text ? cell.text.length : 0;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        });

        // 7. Congelar cabeçalhos e adicionar filtros
        worksheet.views = [
            { state: 'frozen', ySplit: 2 } // Congela as duas primeiras linhas
        ];
        worksheet.autoFilter = {
            from: { row: 2, column: 1 },
            to: { row: 2, column: headerRow2.length }
        };

        // 8. Salvar o arquivo
        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `Balancete_Execucao_Orcamental_${new Date().toISOString().slice(0, 10)}.xlsx`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(link.href), 100);
        });
    };



    const exportToPDF = () => {
        // 1. Título e subtítulo
        const title = "Balancete de Execução Orçamental";
        const subtitle = "Balancete de Execução Orçamental – Pagamentos";
        const table = document.querySelector('#BudjectOrc');
        const rows = Array.from(table.querySelectorAll('tr'));

        // 2. Cabeçalhos da tabela
        const headers = [
            ["Código", "Designação", "Dotação Disponível", "Até ao Mês", "Durante o Mês", "Acumulado", "Saldo"]
        ];

        // 3. Dados da tabela principal
        const body = rows.slice(1).map(row =>
            Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim())
        );

        // 4. Adicionar os totais como últimas linhas da tabela
        const totals = [
            // Despesas Correntes
            ["", "TOTAL DESPESAS CORRENTES",
                formatNumber(totalCurrentExpenses * 2.5),
                formatNumber(currentExpenses1.totalUntilMonthPaid),
                formatNumber(currentExpenses1.totalDuringMonthPaid),
                formatNumber(currentExpenses1.totalAccumulatedPaid),
                formatNumber((totalCurrentExpenses * 2.5) - currentExpenses1.totalAccumulatedPaid),
                ""],

            // Despesas de Capital
            ["", "TOTAL DESPESAS DE CAPITAL",
                formatNumber(totalCapitalExpenses * 2.5),
                formatNumber(capitalExpenses1.totalUntilMonthPaid),
                formatNumber(capitalExpenses1.totalDuringMonthPaid),
                formatNumber(capitalExpenses1.totalAccumulatedPaid),
                formatNumber(capitalExpenses1.totalBalancePaid),
                ""],

            // Orçamento Global
            ["", "TOTAL ORÇAMENTO GLOBAL",
                formatNumber((totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5)),
                formatNumber(totalOverall1.totalUntilMonthPaid),
                formatNumber(totalOverall1.totalDuringMonthPaid),
                formatNumber(totalOverall1.totalAccumulatedPaid),
                formatNumber((totalCurrentExpenses * 2.5) + totalCapitalExpenses * 2.5 - totalOverall1.totalAccumulatedPaid),
                ""]
        ];

        // 5. Combinar corpo da tabela com totais
        const tableBodyWithTotals = [...body, ...totals];

        // 6. Estilos para as linhas de totais
        const columnStyles = {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto', fontStyle: 'bold' },
            2: { cellWidth: 'auto', fontStyle: 'bold' },
            3: { cellWidth: 'auto', fontStyle: 'bold' },
            4: { cellWidth: 'auto', fontStyle: 'bold' },
            5: { cellWidth: 'auto', fontStyle: 'bold' },
            6: { cellWidth: 'auto', fontStyle: 'bold' },
            7: { cellWidth: 'auto' }
        };

        // Adicionar estilos específicos para as linhas de totais
        for (let i = body.length; i < tableBodyWithTotals.length; i++) {
            columnStyles[i] = {
                fontStyle: 'bold',
                fillColor: [240, 240, 240], // Cor de fundo cinza claro
                textColor: [0, 0, 0] // Cor do texto preto
            };
        }

        // 7. Dados do rodapé e metadados
        const footerText = "Documento gerado automaticamente";
        const logoImage = logoMz; // imagem base64 ou URL
        const savedUserData = JSON.parse(localStorage.getItem("userData"));
        const generatedBy = savedUserData.fullName.toString();
        const filename = "BalancetedeExecucaoOrçamental.pdf";

        // 8. Conteúdo da tabela no formato esperado pelo template
        const tableContent = {
            head: headers,
            body: tableBodyWithTotals,
            columnStyles: columnStyles
        };

        // 9. Geração do PDF via template
        templatePDF({
            title,
            subtitle,
            tableContent,
            footerText,
            logoImage,
            generatedBy,
            filename,
            selectedMonth
        });
    };



    const exportToExcel = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Balancetes");

        // 1. Definir os cabeçalhos
        const headers = [
            "Código", "Designação", "Dotação Disponível", "Até ao Mês",
            "Durante o Mês", "Acumulado", "Saldo"
        ];

        // 2. Adicionar os cabeçalhos com estilo
        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell, colNumber) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "323232" } // Cinza escuro
            };
            cell.font = {
                bold: true,
                color: { argb: "FFFFFF" } // Branco
            };
            cell.alignment = {
                horizontal: colNumber <= 2 ? "left" : "right",
                vertical: "middle"
            };
            cell.border = {
                top: { style: "thin", color: { argb: "000000" } },
                left: { style: "thin", color: { argb: "000000" } },
                bottom: { style: "thin", color: { argb: "000000" } },
                right: { style: "thin", color: { argb: "000000" } }
            };
        });

        // 3. Capturar e adicionar os dados da tabela HTML
        const table = document.getElementById("BudjectOrc");
        const rows = table.querySelectorAll("tbody tr");

        rows.forEach(row => {
            const rowData = [...row.cells].map(cell => cell.innerText);
            const newRow = worksheet.addRow(rowData);

            newRow.eachCell((cell, colNumber) => {
                cell.alignment = {
                    horizontal: colNumber <= 2 ? "left" : "right",
                    vertical: "middle"
                };
                cell.border = {
                    top: { style: "thin", color: { argb: "D3D3D3" } },
                    left: { style: "thin", color: { argb: "D3D3D3" } },
                    bottom: { style: "thin", color: { argb: "D3D3D3" } },
                    right: { style: "thin", color: { argb: "D3D3D3" } }
                };

                // Formatar números nas colunas 3-7
                if (colNumber >= 3 && colNumber <= 7) {
                    const numValue = parseFloat(cell.text.replace(/[^\d,-]/g, '').replace(',', '.'));
                    if (!isNaN(numValue)) {
                        cell.numFmt = '#,##0.00;[Red]-#,##0.00';

                        // Destacar saldo negativo
                        if (colNumber === 7 && numValue < 0) {
                            cell.font = { color: { argb: "FF0000" }, bold: true };
                        }
                    }
                }
            });
        });

        // 4. Adicionar linha em branco como separador
        worksheet.addRow([]);

        // 5. Adicionar totais com formatação especial
        const totalStyles = [
            { // Despesas Correntes
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "E6F2FF" } },
                font: { bold: true, color: { argb: "003366" } }
            },
            { // Despesas de Capital
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6E6" } },
                font: { bold: true, color: { argb: "660000" } }
            },
            { // Orçamento Global
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "E6FFE6" } },
                font: { bold: true, color: { argb: "006600" } }
            }
        ];

        const totals = [
            // Despesas Correntes
            ["", "TOTAL DESPESAS CORRENTES",
                formatNumber(totalCurrentExpenses * 2.5),
                formatNumber(currentExpenses1.totalUntilMonthPaid),
                formatNumber(currentExpenses1.totalDuringMonthPaid),
                formatNumber(currentExpenses1.totalAccumulatedPaid),
                formatNumber((totalCurrentExpenses * 2.5) - currentExpenses1.totalAccumulatedPaid),
                ""],

            // Despesas de Capital
            ["", "TOTAL DESPESAS DE CAPITAL",
                formatNumber(totalCapitalExpenses * 2.5),
                formatNumber(capitalExpenses1.totalUntilMonthPaid),
                formatNumber(capitalExpenses1.totalDuringMonthPaid),
                formatNumber(capitalExpenses1.totalAccumulatedPaid),
                formatNumber(capitalExpenses1.totalBalancePaid),
                ""],

            // Orçamento Global
            ["", "TOTAL ORÇAMENTO GLOBAL",
                formatNumber((totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5)),
                formatNumber(totalOverall1.totalUntilMonthPaid),
                formatNumber(totalOverall1.totalDuringMonthPaid),
                formatNumber(totalOverall1.totalAccumulatedPaid),
                formatNumber((totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5) - totalOverall1.totalAccumulatedPaid),
                ""]
        ];

        totals.forEach((rowData, index) => {
            const totalRow = worksheet.addRow(rowData);

            totalRow.eachCell((cell, colNumber) => {
                // Aplicar estilo base
                Object.assign(cell, totalStyles[index]);

                // Alinhamento
                cell.alignment = {
                    horizontal: colNumber <= 2 ? "left" : "right",
                    vertical: "middle"
                };

                // Bordas
                cell.border = {
                    top: { style: "medium", color: { argb: "000000" } },
                    left: { style: "medium", color: { argb: "000000" } },
                    bottom: { style: "medium", color: { argb: "000000" } },
                    right: { style: "medium", color: { argb: "000000" } }
                };

                // Formatar números
                if (colNumber >= 3 && colNumber <= 7) {
                    cell.numFmt = '#,##0.00;[Red]-#,##0.00';

                    // Destacar saldo negativo em vermelho
                    if (colNumber === 7 && rowData[6] < 0) {
                        cell.font = { ...cell.font, color: { argb: "FF0000" } };
                    }
                }
            });
        });

        // 6. Ajustar largura das colunas automaticamente
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const columnLength = cell.text ? cell.text.length : 0;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        });

        // 7. Congelar cabeçalhos e adicionar filtros
        worksheet.views = [
            { state: 'frozen', ySplit: 1 } // Congela a primeira linha
        ];
        worksheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: headers.length }
        };

        // 8. Salvar o arquivo
        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "Balancete_Execucao_Orcamental.xlsx";
            link.click();
            setTimeout(() => URL.revokeObjectURL(link.href), 100);
        });
    };

    const exportToPDFExtract = () => {
        const doc = new jsPDF();
        const tableElement = document.getElementById("tableData2");

        if (tableElement) {
            doc.text("Balancetes de Execução Orçamental – Pagamentos", 14, 10); // Título
            doc.autoTable({
                html: tableElement, // Gera a tabela diretamente do HTML
                startY: 20, // Define onde a tabela será desenhada
                styles: { fontSize: 8 }, // Estilo da tabela
            });
            doc.save("relatorio-ExtratoDiario.pdf"); // Salva o PDF
        }
    };

    const exportExtractToPDFData = (exportType = 'pdf') => {
        // Obter os filtros do formData
        const { accountPlanNumber, startDate, endDate } = formData;

        // Verificar se os filtros estão vazios
        if (!accountPlanNumber || !startDate || !endDate) {
            alert("Não é possível gerar o documento - pesquisa não realizada");
            return;
        }

        // 1. Informações básicas do documento
        const title = "SEBADORA";
        const subtitle = `Extrato da conta ${accountPlanNumber} no período de ${startDate} a ${endDate}`;
        const footerText = "Documento gerado automaticamente";
        const logoImage = logoMz;
        const savedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
        const generatedBy = savedUserData.fullName || "Usuário desconhecido";
        const baseFilename = `extrato_conta_${accountPlanNumber}_${startDate}_a_${endDate}`;

        // Função de formatação monetária SEM sufixo EUR
        const formatCurrency = (value) => {
            return new Intl.NumberFormat('pt-PT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        };

        // 2. Estrutura para armazenar todas as tabelas/seções
        const documentTables = [];

        // =============== SEÇÃO 1: ORÇAMENTO ANUAL ===============
        const budgetSection = {
            title: "ORÇAMENTO ANUAL",
            headers: ["Descrição", "Valor", "Histórico de Alterações", "Valor"],
            rows: [
                ["Dotação inicial", formatCurrency(initialAllocation), "Inscrição / Reforço", formatCurrency(insertAllocation)],
                ["Alterações", formatCurrency(Math.abs(modified)), "Anulação / Redução", formatCurrency(anullment)],
                ["Dotação final", formatCurrency(finalAllocation), "Redistribuição/Aumento", formatCurrency(redistribuitionDataReinforcement)],
                ["Disponível", formatCurrency(finalAllocation), "Redistribuição/diminuição", formatCurrency(redistribuitionDataAnnulment)]
            ]
        };
        documentTables.push(budgetSection);

        // =============== SEÇÃO 2: HISTÓRICO DE REQUISIÇÕES ===============
        const requisitionsSection = {
            title: "HISTÓRICO DE REQUISIÇÕES",
            headers: [
                "Data", "Documento", "Nº", "Descrição",
                "Débito", "Crédito", "Conta"
            ],
            rows: []
        };

        const tableElement2 = document.getElementById('tableData3');
        if (tableElement2) {
            const rows = tableElement2.getElementsByTagName("tr");
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName("td");
                if (cells.length >= 7) {
                    requisitionsSection.rows.push([
                        cells[0].textContent.trim(), // Data
                        cells[1].textContent.trim(), // Documento
                        cells[2].textContent.trim(), // Nº
                        cells[3].textContent.trim(), // Descrição
                        cells[4].textContent.trim(), // Débito
                        cells[5].textContent.trim(), // Crédito
                        cells[6].textContent.trim()  // Conta
                    ]);
                }
            }
        }

        documentTables.push(requisitionsSection);

        // =============== SEÇÃO 3: TOTAIS CONSOLIDADOS ===============
        const totalsSection = {
            title: "TOTAIS CONSOLIDADOS",
            headers: ["Descrição", "Valor"],
            rows: [
                ["Dotação Final", formatCurrency(finalAllocation)],
                ["Total de Requisições", formatCurrency(totalRequisicoes)],
                ["Saldo Disponível", formatCurrency(finalAllocation - totalRequisicoes)],
                ["", ""], // Linha vazia para espaçamento
                ["Percentagem Utilizada", `${((totalRequisicoes / finalAllocation) * 100).toFixed(2)}%`]
            ]
        };
        documentTables.push(totalsSection);

        // 3. Escolher o tipo de exportação
        if (exportType === 'excel') {
            exportExtractToExcel(documentTables, baseFilename);
        } else {
            // Gerar PDF
            templateExtractPDF({
                title,
                subtitle,
                tables: documentTables,
                footerText,
                logoImage,
                generatedBy,
                filename: `${baseFilename}.pdf`,
                tableStyles: {
                    'TOTAIS CONSOLIDADOS': {
                        fillColor: [240, 240, 240],
                        textColor: [0, 0, 0],
                        fontStyle: 'bold',
                        cellPadding: 5
                    },
                    totalsRow: {
                        fillColor: [220, 220, 220],
                        textColor: [0, 0, 0],
                        fontStyle: 'bold'
                    }
                }
            });
        }
    };


    const exportExtractToPDFData2 = (exportType = 'pdf') => {
        // Obter os filtros do formData
        const { accountPlanNumber, startDate, endDate } = formData;

        // Verificar se os filtros estão vazios
        if (!accountPlanNumber || !startDate || !endDate) {
            alert("Não é possível gerar o documento - pesquisa não realizada");
            return;
        }

        // 1. Informações básicas do documento
        const title = "SEBADORA";
        const subtitle = `Extrato da conta ${accountPlanNumber} no período de ${startDate} a ${endDate}`;
        const footerText = "Documento gerado automaticamente";
        const logoImage = logoMz;
        const savedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
        const generatedBy = savedUserData.fullName || "Usuário desconhecido";
        const baseFilename = `extrato_conta_${accountPlanNumber}_${startDate}_a_${endDate}`;

        // Função de formatação monetária SEM sufixo EUR
        const formatCurrency = (value) => {
            return new Intl.NumberFormat('pt-PT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        };

        // 2. Estrutura para armazenar todas as tabelas/seções
        const documentTables = [];

        // =============== SEÇÃO 1: ORÇAMENTO ANUAL ===============
        const budgetSection = {
            title: "ORÇAMENTO ANUAL",
            headers: ["Descrição", "Valor", "Histórico de Alterações", "Valor"],
            rows: [
                ["Dotação inicial", formatCurrency(initialAllocation), "Inscrição / Reforço", formatCurrency(insertAllocation)],
                ["Alterações", formatCurrency(Math.abs(modified)), "Anulação / Redução", formatCurrency(anullment)],
                ["Dotação final", formatCurrency(finalAllocation), "Redistribuição/Aumento", formatCurrency(redistribuitionDataReinforcement)],
                ["Disponível", formatCurrency(finalAllocation), "Redistribuição/diminuição", formatCurrency(redistribuitionDataAnnulment)]
            ]
        };
        documentTables.push(budgetSection);

        // =============== SEÇÃO 2: HISTÓRICO DE REQUISIÇÕES ===============
        const requisitionsSection = {
            title: "HISTÓRICO DE REQUISIÇÕES",
            headers: [
                "Data", "Nº", "Fornecedor", "Valor", "Saldo", "Estado", "Nº Requisição",
                "Documento", "Descrição	", "Valor", "Saldo"
            ],
            rows: []
        };

        // Preencher dados da tabela 3 (adaptado para a nova estrutura)
        const tableElement = document.getElementById('tableData5');
        if (tableElement) {
            const rows = tableElement.querySelectorAll("tbody tr");
            rows.forEach(row => {
                const cells = row.querySelectorAll("td");
                if (cells.length >= 7) {
                    requisitionsSection.rows.push([
                        cells[0].textContent.trim(), // Data Requisição
                        cells[1].textContent.trim(), // Nº Requisição
                        cells[2].textContent.trim(), // Nº Requisição
                        cells[3].textContent.trim(), // Valor Requisição
                        cells[4].textContent.trim(), // Nº Requisição
                        cells[5].textContent.trim(), // Data Pagamento (repetida por exemplo)
                        cells[6].textContent.trim(), // Nº Requisição (mesmo)
                        cells[7].textContent.trim(), // Documento
                        cells[8].textContent.trim(), // Descrição
                        cells[9].textContent.trim(), // Valor Pagamento
                        cells[9].textContent.trim(), // Valor Pagamento
                    ]);
                }
            });
        }

        documentTables.push(requisitionsSection);

        // =============== SEÇÃO 3: TOTAIS CONSOLIDADOS ===============
        const totalsSection = {
            title: "TOTAIS CONSOLIDADOS",
            headers: ["Descrição", "Valor"],
            rows: [
                ["Requisição de Fundos (Valor)", formatCurrency(totalRequisicoes)],
                ["Requisição de Fundos (Saldo)", formatCurrency(finalAllocation - totalRequisicoes)],
                ["", ""], // Linha vazia para espaçamento
                ["Pagamentos (Valor)", formatCurrency(totalPagamentos)],
                ["Pagamentos (Saldo)", formatCurrency(finalAllocation - totalPagamentos)],
            ]
        };

        documentTables.push(totalsSection);

        // 3. Escolher o tipo de exportação
        if (exportType === 'excel') {
            exportExtractToExcel(documentTables, baseFilename);
        } else {
            // Gerar PDF
            templateExtractPDF({
                title,
                subtitle,
                tables: documentTables,
                footerText,
                logoImage,
                generatedBy,
                filename: `${baseFilename}.pdf`,
                tableStyles: {
                    'TOTAIS CONSOLIDADOS': {
                        fillColor: [240, 240, 240],
                        textColor: [0, 0, 0],
                        fontStyle: 'bold',
                        cellPadding: 5
                    },
                    totalsRow: {
                        fillColor: [220, 220, 220],
                        textColor: [0, 0, 0],
                        fontStyle: 'bold'
                    }
                }
            });
        }
    };



    const exportExtractToExcel = (tables, filename) => {
        const workbook = XLSX.utils.book_new();

        const savedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
        const generatedBy = savedUserData.fullName || "Usuário desconhecido";
        const generationDate = new Date().toLocaleDateString('pt-PT');

        const generalInfo = [
            ["SEBADORA"],
            [""],
            [`Extrato da conta ${formData.accountPlanNumber} no período de ${formData.startDate} a ${formData.endDate}`],
            [""],
            [`Documento gerado automaticamente por: ${generatedBy} em ${generationDate}`],
            [""],
            [""]
        ];

        let currentRow = generalInfo.length;
        const worksheetData = [...generalInfo];
        const headerRowIndexes = []; // Guardar os índices das linhas de cabeçalho

        tables.forEach(table => {
            worksheetData.push([table.title]);
            currentRow++;

            if (table.headers && table.headers.length > 0) {
                worksheetData.push(table.headers);
                headerRowIndexes.push(currentRow); // Marcar como linha de cabeçalho
                currentRow++;
            }

            table.rows.forEach(row => {
                const simpleRow = row.map(cell =>
                    (typeof cell === 'object' && cell.content !== undefined) ? cell.content : cell
                );
                worksheetData.push(simpleRow);
                currentRow++;
            });

            worksheetData.push([""]);
            currentRow++;
        });

        worksheetData.push([""]);
        worksheetData.push(["Documento gerado automaticamente."]);

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Definir larguras das colunas de forma mais controlada
        const maxColWidths = worksheetData.reduce((acc, row) => {
            row.forEach((cell, idx) => {
                const cellLength = String(cell || "").length;
                // Limitar a largura máxima para evitar células muito grandes
                acc[idx] = Math.min(Math.max(acc[idx] || 10, cellLength + 2), 30); // Máximo de 30 caracteres
            });
            return acc;
        }, {});

        // Converter para array e garantir que todas as colunas tenham largura definida
        const maxCols = Math.max(...Object.keys(maxColWidths).map(Number)) + 1;
        worksheet["!cols"] = Array.from({ length: maxCols }, (_, i) => ({
            wch: maxColWidths[i] || 10
        }));

        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell_address = { c: C, r: R };
                const cell_ref = XLSX.utils.encode_cell(cell_address);
                const cell = worksheet[cell_ref];
                if (!cell) continue;

                // Estilo base para todas as células
                cell.s = {
                    font: {
                        sz: 12, // Tamanho de fonte 12
                        name: "Calibri"
                    },
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } },
                    },
                    alignment: {
                        vertical: "center",
                        horizontal: "left",
                        wrapText: true
                    }
                };

                // Estilo para cabeçalhos
                if (headerRowIndexes.includes(R)) {
                    cell.s.fill = {
                        patternType: "solid",
                        fgColor: { rgb: "4472C4" } // Azul corporativo
                    };
                    cell.s.font = {
                        bold: true,
                        color: { rgb: "FFFFFF" }, // Texto branco
                        sz: 12
                    };
                }

                // Estilo para o título SEBADORA
                if (R === 0 && C === 0) {
                    cell.s.font = {
                        bold: true,
                        sz: 14,
                        color: { rgb: "2F5597" }
                    };
                }

                // Estilo para informações de período
                if ((R === 2 && C === 0) || (R === 4 && C === 0)) {
                    cell.s.font = {
                        italic: true,
                        sz: 12
                    };
                }
            }
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, "Extrato");
        XLSX.writeFile(workbook, `${filename}.xlsx`, {
            bookType: 'xlsx',
            cellStyles: true,
            compression: true // Compactação para arquivos menores
        });
    };




    const handleClearFilters = () => {
        setFormData({
            accountPlanNumber: "",
            startDate: "",
            endDate: ""
        });

        setEnitialAllocation(0);
        setInsertAllocation(0);
        setModified(0);
        setAnullment(0);
        setFinalAllocation(0);
        setRedistribuitionDataReinforcement(0);
        setReserve(0);
        setRedistribuitionDataAnnulment(0);
        setRequestsFilter([]);
        setTotalRequisicoes(0);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Permitir apenas números e ponto no campo "value"
        if (name === "value" && !/^\d*\.?\d*$/.test(value)) {
            return;
        }

        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    }

    const exportToExcelReq = () => {
        // Cria uma cópia temporária da tabela
        const table = document.getElementById('BudjectReq').cloneNode(true);

        // Remove a última coluna da cópia
        const rows = table.querySelectorAll('tr');
        rows.forEach((row) => {
            row.removeChild(row.lastElementChild);
        });

        // Usa a tabela modificada para gerar o Excel
        const wb = XLSX.utils.table_to_book(table, { sheet: 'Contas' });
        XLSX.writeFile(wb, 'Balancetes_de_Execução_Orçamental_requisicoes.xlsx'); // Salva o arquivo Excel
    };


    const ExcelJS = require('exceljs');
    const exportToExcelWithStyles = () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Contas');

        // Adicionar os títulos das colunas
        worksheet.columns = [
            { header: 'Código', key: 'codigo', width: 20 },
            { header: 'Designação', key: 'designacao', width: 40 },
            { header: 'Dotação Inicial (USD)', key: 'dotacao_usd', width: 20 },
            { header: 'Contra Valor', key: 'contra_valor', width: 20 },
            { header: 'Duodécimo', key: 'duodecimo', width: 20 },
        ];

        // Função para renderizar as linhas de contas
        const renderAccountRowsToExcel = (account, level = 0) => {
            const indentation = ' '.repeat(level * 2);
            const isParentAccount = account.children && account.children.length > 0;

            // Calcula o total da alocação
            const finalAllocation = calculateFinalAllocation(account);

            const usdValue = (finalAllocation)?.toFixed(2) || 0; // Valor em USD
            const totalContraValor = finalAllocation * exchangeRate;
            const totalDuoDecimo = (usdValue / 12).toFixed(2);

            // Adicionando a linha de dados à planilha
            const row = worksheet.addRow({
                codigo: `${indentation}${account.accountPlan.number}`,
                designacao: `${indentation}${account.accountPlan.description}`,
                dotacao_usd: usdValue,
                contra_valor: totalContraValor,
                duodecimo: totalDuoDecimo,
            });

            // Adicionando bordas pretas às células
            row.eachCell((cell) => {
                cell.style.alignment = { horizontal: 'left' }; // Alinha texto à esquerda
                cell.style.border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } },
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
            if (account.children) {
                account.children.forEach((childAccount) =>
                    renderAccountRowsToExcel(childAccount, level + 1)
                );
            }
        };

        // Iterando sobre as contas e exportando
        organizedAccounts.forEach((account) => renderAccountRowsToExcel(account));
        // Adicionando o Total de Despesas Correntes
        worksheet.addRow({
            codigo: 'TOTAL',
            designacao: 'Total de Despesas Correntes',
            dotacao_usd: formatNumber(totalCurrentExpenses),
            contra_valor: formatNumber(totalCurrentContraValor),
            duodecimo: formatNumber(totalCurrentDuodecimo),
        }).eachCell((cell) => {
            cell.style.alignment = { horizontal: 'left' }; // Alinha texto à esquerda
            cell.style.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } },
            };
            cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '000000' } }; // Cor de fundo preta
            cell.style.font = { color: { argb: 'FFFFFF' }, bold: true }; // Texto branco
        });

        // Adicionando o Total de Despesas de Capital
        worksheet.addRow({
            codigo: 'TOTAL',
            designacao: 'Total de Despesas de Capital',
            dotacao_usd: formatNumber(totalCapitalExpenses),
            contra_valor: formatNumber(totalCapitalContraValor),
            duodecimo: formatNumber(totalCapitalDuodecimo),
        }).eachCell((cell) => {
            cell.style.alignment = { horizontal: 'left' }; // Alinha texto à esquerda
            cell.style.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } },
            };
            cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '000000' } }; // Cor de fundo preta
            cell.style.font = { color: { argb: 'FFFFFF' }, bold: true }; // Texto branco
        });

        // Adicionando o Total Orçamento Global
        worksheet.addRow({
            codigo: 'TOTAL',
            designacao: 'Total Orçamento Global',
            dotacao_usd: formatNumber(totalGlobalBudget),
            contra_valor: formatNumber(totalGlobalContraValor),
            duodecimo: formatNumber(totalGlobalDuodecimo),
        }).eachCell((cell) => {
            cell.style.alignment = { horizontal: 'left' }; // Alinha texto à esquerda
            cell.style.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } },
            };
            cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '000000' } }; // Cor de fundo preta
            cell.style.font = { color: { argb: 'FFFFFF' }, bold: true }; // Texto branco
        });


        // Estilizando o cabeçalho da planilha
        worksheet.getRow(1).eachCell((cell) => {
            cell.style.font = { bold: true };
            cell.style.alignment = { horizontal: 'center' };
            cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'B6D7A8' } }; // Cor de fundo do cabeçalho
            cell.style.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } },
            };
        });

        // Salvar o arquivo
        workbook.xlsx.writeBuffer().then((data) => {
            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'contas.xlsx';
            link.click();
        });
    };

    const handleSelectChange = (event) => {
        // Verifica se dados foram encontrados e mapeia para o novo formato
        const formattedData = accountsData.map((item) => ({
            diario: code,
            document: item.accountingDocument.documentNumber,
            number1: item ? item.journalDocumentNumber : "N/A" // Acessa o número do documento ou retorna "N/A" se não existir
        }));
        setTableData1(formattedData)
    };

    const handleChangeData = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSearch = async () => {
        setLoading(true);

        const { accountPlanNumber, startDate, endDate } = formData;
        let missingFields = [];
        if (!accountPlanNumber) missingFields.push('Conta de Movimento');
        if (!startDate) missingFields.push('Data de Início');
        if (!endDate) missingFields.push('Data de Fim');

        if (missingFields.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Campos Faltando',
                text: `Por favor, preencha os seguintes campos: ${missingFields.join(', ')}.`,
            });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `http://134.199.186.6:3333/sgf-api/internalrequest/financial-entries?accountPlanNumber=${accountPlanNumber}&startDate=${startDate}&endDate=${endDate}`
            );

            const data = await response.json();

            const {
                initialAllocation,
                totalInscricao,
                totalAnulacao,
                totalRedistribuicaoAnull,
                totalRedistribuicaoReforce,
                availableAllocation,
                filteredRequests,
                voidedRequests
            } = data;

            const factor = 2.5;

            const finalAlloc = (initialAllocation + totalInscricao - totalAnulacao + totalRedistribuicaoReforce - totalRedistribuicaoAnull) * factor;
            const fivePercent = finalAlloc * 0.05;
            const totalModified = (totalAnulacao + totalInscricao + totalRedistribuicaoReforce - totalRedistribuicaoAnull) * factor;

            // ➕ Cálculo acumulado e inclusão de requests anuladas
            let acumulado = 0;
            const filteredRequestsWithAcumulado = [];

            filteredRequests.forEach(request => {
                const valor = parseFloat(request.totalAmount) || 0;
                const saldoExistente = parseFloat(request.saldoExistente) || 0;

                acumulado += valor;

                // Request original
                filteredRequestsWithAcumulado.push({
                    ...request,
                    valorAcumulado: acumulado,
                    valorComSaldo: acumulado
                });

                // Verifica se há requisição anulada correspondente
                const voided = voidedRequests.find(vr => vr.internalRequestItemId === request.id);

                if (voided) {
                    const valorVoided = parseFloat(voided.totalAmountReturned || voided.total_amount_returned) || 0;
                    acumulado -= valorVoided;

                    filteredRequestsWithAcumulado.push({
                        ...voided,
                        isVoided: true,
                        valorAcumulado: acumulado,
                        valorComSaldo: valor - valorVoided + saldoExistente,
                        totalAmount: -valorVoided // Visivelmente negativo
                    });
                }
            });

            // 📊 Cálculo do total de valores sem contar anuladas
            const totalFiltered = filteredRequests.reduce((sum, request) => {
                return sum + (parseFloat(request.totalAmount) || 0);
            }, 0);
            
            const filteredRequestsPaid = filteredRequests.filter(req => {
                return req?.internalRequest?.paidReq === 1;
            });

            const totalFilteredPaid = filteredRequestsPaid.reduce((sum, request) => {
                return sum + (parseFloat(request.totalAmount) || 0);
            }, 0);

            // Soma apenas valores anulados que existem no conjunto filtrado
            const filteredIds = new Set(filteredRequests.map(r => r.id));
            const totalVoidedFiltered = voidedRequests.reduce((sum, request) => {
                if (filteredIds.has(request.internalRequestItemId)) {
                    return sum + (parseFloat(request.totalAmountReturned || request.total_amount_returned) || 0);
                }
                return sum;
            }, 0);

            const totalRequisicoes = totalFiltered - totalVoidedFiltered;
            const totalRequisicoesPagamentos = totalFiltered - totalVoidedFiltered;

            console.log("totalFilteredPaid", totalFilteredPaid)
            // console.log("internalRequestisVoided",internalRequest)

            // 🧮 Aplicação dos dados no estado
            setEnitialAllocation(initialAllocation * factor);
            setInsertAllocation(totalInscricao * factor);
            setAnullment(totalAnulacao * factor);
            setRedistribuitionDataReinforcement(totalRedistribuicaoReforce * factor);
            setRedistribuitionDataAnnulment(totalRedistribuicaoAnull * factor);
            setFinalAllocation(parseFloat(finalAlloc).toFixed(2));
            setDisponivel(availableAllocation * factor);
            setModified(totalModified);
            setReserve(fivePercent);
            setRequestsFilter(filteredRequestsWithAcumulado);
            setTotalRequisicoes(totalRequisicoes);
            setTotalPagamentos(totalFilteredPaid)


        } catch (error) {
            console.error("Erro ao buscar dados da API:", error);
            Swal.fire({
                icon: 'error',
                title: 'Erro de Conexão',
                text: 'Não foi possível obter os dados. Tente novamente mais tarde.',
            });
        }

        setLoading(false);
    };

    const fetchSummationAccountEntriesEntry1 = async () => {
        try {
            setLoading(true);  // Exibe o estado de carregamento enquanto os dados estão sendo processados.
            const response = await fetchSummationAccountEntriesEntry();

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
    const loadAccounts = async () => {
        try {
            setLoading(true);
            const response = await findAccountPlanBudjectEntriesByYear();
            const filteredParentAccounts = response.filter(account => account.accountPlan.type === 'budject');

            const filteredAccounts = response.filter(account =>
                account.accountPlan.type === 'budject' &&
                account.accountPlan.writable === 'moviment' // "moviment" não estava no seu exemplo, usei "controll"
            );

            setAccounts(filteredParentAccounts);
            setParentAccounts(filteredAccounts)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadAccountInternalRequest = async () => {
        try {
            setLoading(true);
            const response = await fetchAccountRequestWhitConformance();
            const filteredParentAccounts = response.filter(request => request.internalRequest.paidReq === 1);

            // const filteredParentAccountsAll = response.filter(request => request.internalRequest.paidReq);

            console.log("Jushghasas", response)

            setInternalRequests(response);
            setInternalRequestsPaid(filteredParentAccounts);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    const loadJournalEntry = async () => {
        try {
            setLoading(true);
            const response = await fetchAllAccountingJournalEntryAll();
            setAccountData(response)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadDiariesWithDocuments = async () => {
        try {
            setLoading(true);
            const response = await fetchAllAccountingJournal20();
            setDiaries(response);
            setDocuments(response.documents)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadOpenAccount = async () => {
        try {
            setLoading(true);
            const response = await fetchOpenAccount();
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
            setValuesAccounts(response);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAccounts();
        loadJournalEntry();
        loadDiariesWithDocuments();
        loadOpenAccount();
        handleSelectChange();
        loadAccountInternalRequest();
        loadAccountInternalRequestValid();
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
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true,
        }).format(value);
    };
    const organizedAccounts = organizeAccounts(accounts);

    const calculateFinalAllocation = (account) => {
        let totalAllocation = 0;
        const finalAllocationType = account.accountPlan.finalAllocationType;

        if (finalAllocationType === 'A') {
            totalAllocation += calculateSiblingAllocation(accounts, ['A2', 'A3', 'L2', 'L3', 'L4', 'L5', 'L6'])
        } else if (finalAllocationType === 'A1') {
            totalAllocation += calculateSiblingAllocation(accounts, ['A2', 'A3']);
        } else if (finalAllocationType === 'A2') {
            totalAllocation += account.finalAllocation
        } else if (finalAllocationType === 'A3') {
            totalAllocation += calculateSiblingAllocation(accounts, ['L1'])
        }
        else if (finalAllocationType === 'A4') {
            totalAllocation += calculateSiblingAllocation(accounts, ['L2', 'L3'])
        } else if (finalAllocationType === 'A5') {
            totalAllocation += calculateSiblingAllocation(accounts, ['L5', 'L6'])
        }
        else if (finalAllocationType === 'A7') {
            totalAllocation += calculateSiblingAllocation(accounts, ['A8'])
        } else if (finalAllocationType === 'A8') {
            totalAllocation += calculateSiblingAllocation(accounts, ['L7', 'L8', 'L9'])
        }
        else {
            totalAllocation += account.finalAllocation || 0;
        }
        return totalAllocation;
    };
    const calculateSiblingAllocation = (accounts, types) => {
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

    const calculateFinalAllocationTotal = (account, type) => {
        let totalAllocation = 0;

        if (type === 'AFF') {
            const allocationTypes = ['L', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
            allocationTypes.forEach(type => {
                const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
                if (account) {
                    totalAllocation += calculateChildrenAllocationFinallAlocationF(account);
                }
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


    const calculateChildrenAllocationFinallAlocationF = (account) => {
        let total = 0;

        // Verifica se a conta tem filhos e soma os valores das alocações dos filhos
        if (account.children && Array.isArray(account.children)) {
            account.children.forEach(child => {
                const childAllocation = child.finalAllocation || 0;
                total += childAllocation;
            });
        }
        return total;
    };


    const totalCurrentExpenses = calculateFinalAllocationTotal(accounts, "AFF");
    const totalCapitalExpenses = calculateFinalAllocationTotal(accounts, "AFC");
    const totalGlobalBudget = totalCurrentExpenses + totalCapitalExpenses;






    const totalCurrentContraValor = totalCurrentExpenses * 2.5;
    const totalCurrentDuodecimo = totalCurrentExpenses / 12;

    const totalCapitalContraValor = totalCapitalExpenses * 2.5;
    const totalCapitalDuodecimo = totalCapitalExpenses / 12;

    const totalGlobalContraValor = totalGlobalBudget * 2.5;
    const totalGlobalDuodecimo = totalGlobalBudget / 12;

    useEffect(() => {
        const calculateTotals = (groupAccounts) => {
            let availableBudget = 0;
            let untilMonth = 0;
            let duringMonth = 0;
            let accumulated = 0;
            let balance = 0;

            groupAccounts.forEach(account => {
                const finalAllocation = calculateFinalAllocation(account);
                let totalAmountForAccount = calculateTotalAllocation(account, internalRequestsPaid);

                if (account.accountPlan.number.startsWith("1.0.0.0.00")) {
                    totalAmountForAccount = calculateSiblingAllocationReq21(internalRequestsPaid);
                }

                if (account.accountPlan.number.startsWith("1.1.0.0.00")) {
                    totalAmountForAccount = calculateSiblingAllocationReq2100(internalRequestsPaid);
                }

                const untilMonthValue = parseFloat(totalAmountForAccount) || 0;
                const duringMonthValue = parseFloat(0) || 0;
                const accumulatedValue = untilMonthValue + duringMonthValue;

                const availableBudgetValue = parseFloat(finalAllocation * 2.5) || 0;
                const balanceValue = availableBudgetValue - accumulatedValue;

                availableBudget += availableBudgetValue;
                untilMonth += untilMonthValue;
                duringMonth += untilMonthValue;
                accumulated += accumulatedValue;
                balance += balanceValue;
            });

            return { totalAvailableBudget: availableBudget, totalUntilMonth: untilMonth, totalDuringMonth: duringMonth, totalAccumulated: accumulated, totalBalance: balance };
        };

        // Filtra as contas pelos grupos
        const currentExpenseAccounts = accounts.filter(account => calculateFinalAllocationTotal(account, "AFF"));
        const capitalExpenseAccounts = accounts.filter(account => calculateFinalAllocationTotal(account, "AFC"));

        // Calcula os totais por grupo
        setCurrentExpenses(calculateTotals(currentExpenseAccounts));
        setCapitalExpenses(calculateTotals(capitalExpenseAccounts));

    }, [accounts]);


    // Declaração das variáveis globais
    let globalA1 = 0;
    let globalA2 = 0;
    let globalA3 = 0;
    let globalA4 = 0;
    let globalA5 = 0;
    let globalA7 = 0;
    let globalA8 = 0;

    const calculateTotalAllocationByMonthFilter = (account, internalRequests, monthFilter = null, untilBeforeMonth = false) => {
        let totalAmountForAccount = 0;

        const currentYear = new Date().getFullYear();

        // Aplica o filtro de mês e ano, considerando se é para pegar até o mês anterior
        const filteredRequests = Array.isArray(internalRequests)
            ? internalRequests.filter(req => {
                const reqDate = new Date(req.createdAt);
                const reqMonth = reqDate.getMonth() + 1;
                const reqYear = reqDate.getFullYear();

                if (untilBeforeMonth && monthFilter) {
                    return reqMonth < monthFilter && reqYear === currentYear;
                }

                if (monthFilter) {
                    return reqMonth === monthFilter && reqYear === currentYear;
                }

                // Caso contrário, retorna tudo
                return true;
            })
            : [];

        const finalAllocationType = account.accountPlan.finalAllocationType;

        if (finalAllocationType === 'A') {
            totalAmountForAccount += calculateSiblingAllocationReq(accounts, ['A2', 'A3', 'L2', 'L3', 'L4', 'L5', 'L6'], filteredRequests);
        } else if (finalAllocationType === 'A1') {
            totalAmountForAccount += calculateSiblingAllocationReq(accounts, ['A2', 'A3'], filteredRequests);
        } else if (finalAllocationType === 'A2') {
            totalAmountForAccount += filteredRequests.totalAmount || 0;
        } else if (finalAllocationType === 'A3') {
            totalAmountForAccount += calculateSiblingAllocationReq(accounts, ['L1'], filteredRequests);
        } else if (finalAllocationType === 'A4') {
            totalAmountForAccount += calculateSiblingAllocationReq(accounts, ['L2', 'L3'], filteredRequests);
        } else if (finalAllocationType === 'A5') {
            totalAmountForAccount += calculateSiblingAllocationReq(accounts, ['L5', 'L6'], filteredRequests);
        } else if (finalAllocationType === 'A7') {
            totalAmountForAccount += calculateSiblingAllocationReq(accounts, ['A8'], filteredRequests);
        } else if (finalAllocationType === 'A8') {
            totalAmountForAccount += calculateSiblingAllocationReq(accounts, ['L7', 'L8', 'L9'], filteredRequests);
        } else {
            totalAmountForAccount += filteredRequests.totalAmount || 0;
        }

        // Soma as requisições da conta atual
        totalAmountForAccount += filteredRequests
            .filter((req) => req.accountPlanBudject?.number === account.accountPlan.number)
            .reduce((sum, req) => sum + parseFloat(req.totalAmount || 0), 0);

        // Soma as requisições das contas-filhas
        if (Array.isArray(account.children) && account.children.length > 0) {
            account.children.forEach((childAccount) => {
                totalAmountForAccount += calculateTotalAllocation(childAccount, filteredRequests, monthFilter);
            });
        }

        return totalAmountForAccount;
    };


    const renderAccountRowsAvailable = (() => {
        const renderedAccounts = new Set(); // Armazena os números das contas já renderizadas

        return function innerRender(account, level = 0) {
            const accountNumber = account.accountPlan.number;

            // Se a conta já foi renderizada, retorna null
            if (renderedAccounts.has(accountNumber)) {
                return null;
            }


            //////////////////////////////////
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

            let dotacaoFinal = 0;
            const finalAllocationRed = calculateFinalAllocationA(account);
            dotacaoFinal = ((finalAllocationRed + (inscription + increase) - (annulment + decrease)) * 2.5);
            /////////////////////////////////



            // Marca a conta como renderizada
            renderedAccounts.add(accountNumber);

            const indentation = ' '.repeat(level * 2);
            const isParentAccount = Array.isArray(account.children) && account.children.length > 0;

            const finalAllocation = calculateFinalAllocationDinamic(account);
            let totalAmountForAccount = calculateTotalAllocation(account, internalRequestsValid);

            const currentMonth = selectedMonth ? parseInt(selectedMonth) : new Date().getMonth() + 1;

            // Cálculos para requisições
            if (accountNumber === "1.0.0.0.00") {
                totalAmountForAccount = calculateSiblingAllocationReq21(internalRequestsValid, currentMonth);
            } else if (accountNumber === "1.1.0.0.00") {
                totalAmountForAccount = calculateSiblingAllocationReq2100(internalRequestsValid, currentMonth);
            }
            const untilMonth = parseFloat(totalAmountForAccount) || 0;
            const duringMonth = 0;
            const accumulated = untilMonth + duringMonth;

            let totalForCurrentMonth = calculateTotalAllocationByMonthFilter(account, internalRequestsValid, currentMonth);
            let totalUntilLastMonth = calculateTotalAllocationByMonthFilter(account, internalRequestsValid, currentMonth, true);

            const now = new Date();
            const currentYear = now.getFullYear();
            if (accountNumber === "1.0.0.0.00") {
                totalForCurrentMonth = calculateSiblingAllocationReq21ByDate(internalRequestsValid, currentMonth, currentYear, false);
                totalUntilLastMonth = calculateSiblingAllocationReq21ByDate(internalRequestsValid, currentMonth, currentYear, true);
            } else if (accountNumber === "1.1.0.0.00") {
                totalForCurrentMonth = calculateSiblingAllocationReq2100ByDate(internalRequestsValid, currentMonth, currentYear, false);
                totalUntilLastMonth = calculateSiblingAllocationReq2100ByDate(internalRequestsValid, currentMonth, currentYear, true);
            }

            const totalAccumulated = totalUntilLastMonth + totalForCurrentMonth;
            const availableBudget = parseFloat(dotacaoFinal) || 0;
            const balance = availableBudget - totalAccumulated;
            const executionPercentage = availableBudget > 0 ? (totalAccumulated / availableBudget) * 100 : 0;

            // Cálculos para requisições pagas
            let totalForCurrentMonthPaid = calculateTotalAllocationByMonthFilter(account, internalRequestsPaid, currentMonth);
            let totalUntilLastMonthPaid = calculateTotalAllocationByMonthFilter(account, internalRequestsPaid, currentMonth, true);

            if (accountNumber === "1.0.0.0.00") {
                totalForCurrentMonthPaid = calculateSiblingAllocationReq21ByDate(internalRequestsPaid, currentMonth, currentYear, false);
                totalUntilLastMonthPaid = calculateSiblingAllocationReq21ByDate(internalRequestsPaid, currentMonth, currentYear, true);
            } else if (accountNumber === "1.1.0.0.00") {
                totalForCurrentMonthPaid = calculateSiblingAllocationReq2100ByDate(internalRequestsPaid, currentMonth, currentYear, false);
                totalUntilLastMonthPaid = calculateSiblingAllocationReq2100ByDate(internalRequestsPaid, currentMonth, currentYear, true);
            }

            const totalAccumulatedPaid = totalUntilLastMonthPaid + totalForCurrentMonthPaid;
            const balancePaid = availableBudget - totalAccumulatedPaid;
            const executionPercentagePaid = availableBudget > 0 ? (totalAccumulatedPaid / availableBudget) * 100 : 0;

            return (
                <>
                    <tr
                        key={accountNumber}
                        className={isParentAccount ? 'table-success' : ''}
                        style={{ backgroundColor: isParentAccount ? '#f8f9fa' : '' }}
                    >
                        <td style={{ padding: '5px 10px', textAlign: 'left' }}>
                            {indentation}{accountNumber}
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'left' }}>
                            {indentation}{account.accountPlan.description}
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right' }}>
                            {formatNumber(availableBudget)}
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right' }}>
                            {formatNumber(totalUntilLastMonth)}
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right' }}>
                            {formatNumber(totalForCurrentMonth)}
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right' }}>
                            {formatNumber(totalAccumulated)}
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right' }}>
                            {formatNumber(balance)}
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right' }}>
                            {formatNumber(totalUntilLastMonthPaid)}
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right' }}>
                            {formatNumber(totalForCurrentMonthPaid)}
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right' }}>
                            {formatNumber(totalAccumulatedPaid)}
                        </td>
                        <td style={{ padding: '5px 10px', textAlign: 'right' }}>
                            {formatNumber(balancePaid)}
                        </td>
                    </tr>

                    {isParentAccount && account.children.map((childAccount) =>
                        innerRender(childAccount, level + 1)
                    )}
                </>
            );
        };
    })();




    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value || 0);
    };
    const formatCurrencyNoSuffix = (value) => {
        return new Intl.NumberFormat('pt-MZ', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value || 0);
    };


    // const renderControlMap = (() => {
    //     const renderedRequests = new Set();

    //     return function innerRenderControlMap(item, level = 0, allItems = []) {
    //         const internalRequest = item.internalRequest || {};
    //         const requestId = internalRequest.id || item.id;

    //         if (!requestId || renderedRequests.has(requestId)) {
    //             return null;
    //         }

    //         renderedRequests.add(requestId);

    //         // Encontrar todos os itens relacionados
    //         const relatedItems = allItems.filter(i =>
    //             i.internalRequest?.id === requestId || i.id === requestId
    //         );

    //         // Pegar o último item para obter o saldo existente
    //         const lastItem = relatedItems[relatedItems.length - 1] || item;
    //         const currentBalance = parseFloat(lastItem.saldoExistente) || 0;


    //         const initialBalance = parseFloat(internalRequest.totalRequestedValue) || 0;

    //         const hasPayments = Array.isArray(item.payments) && item.payments.length > 0;
    //         const paymentAmount = hasPayments ?
    //             item.payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0) : 0;

    //         // Informações do beneficiário
    //         const beneficiary = internalRequest.accountPlanFinancial?.description ||
    //             item.beneficiaryName?.description ||
    //             'N/A';


    //         const documentDescription = internalRequest.document ?
    //             getDocumentDescription(internalRequest.document) : 'N/A';

    //         return (
    //             <>
    //                 {/* Linha principal da requisição */}
    //                 <tr
    //                     key={`req-${requestId}`}
    //                     className={hasPayments ? 'table-info' : ''}
    //                 >
    //                     <td style={{ textAlign: 'center' }}>
    //                         {internalRequest.operationDate || item.operationDate || 'N/D'}
    //                     </td>
    //                     <td style={{ textAlign: 'center' }}>
    //                         {internalRequest.id || 'N/D'}
    //                     </td>
    //                     <td style={{ textAlign: 'left' }}>
    //                         {beneficiary}
    //                     </td>
    //                     <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
    //                         {formatCurrency(initialBalance)}
    //                     </td>
    //                     <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
    //                         {formatCurrency(currentBalance)}
    //                     </td>

    //                     {/* Seção de pagamentos */}
    //                     <td style={{ textAlign: 'center' }}>
    //                         {hasPayments ? item.payments[0]?.date : internalRequest.paymentDate || 'N/D'}
    //                     </td>
    //                     <td style={{ textAlign: 'center' }}>
    //                         {internalRequest.requestNumber || 'N/D'}
    //                     </td>
    //                     <td style={{ textAlign: 'center' }}>
    //                         {internalRequest.document || 'N/A'}
    //                     </td>
    //                     <td style={{ textAlign: 'left' }}>
    //                         {documentDescription}
    //                     </td>
    //                     <td style={{ textAlign: 'right', color: '#dc3545' }}>
    //                         {formatCurrency(paymentAmount)}
    //                     </td>
    //                     <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
    //                         {formatCurrency(currentBalance - paymentAmount)}
    //                     </td>
    //                 </tr>

    //                 {/* Linhas adicionais para pagamentos */}
    //                 {hasPayments && item.payments.slice(1).map((payment, index) => (
    //                     <tr
    //                         key={`pay-${requestId}-${index + 1}`}
    //                         style={{ backgroundColor: '#f8f9fa' }}
    //                     >
    //                         <td colSpan={5}></td>
    //                         <td style={{ textAlign: 'center' }}>
    //                             {payment.date || 'N/D'}
    //                         </td>
    //                         <td style={{ textAlign: 'center' }}>
    //                             {internalRequest.requestNumber || 'N/D'}
    //                         </td>
    //                         <td style={{ textAlign: 'center' }}>
    //                             {payment.documentNumber || internalRequest.document || 'N/A'}
    //                         </td>
    //                         <td style={{ textAlign: 'left' }}>
    //                             {payment.description || documentDescription}
    //                         </td>
    //                         <td style={{ textAlign: 'right', color: '#dc3545' }}>
    //                             {formatCurrency(parseFloat(payment.amount || 0))}
    //                         </td>
    //                         <td style={{ textAlign: 'right' }}>
    //                             {formatCurrency(currentBalance - paymentAmount - (parseFloat(payment.amount) || 0))}
    //                         </td>
    //                     </tr>
    //                 ))}
    //             </>
    //         );
    //     };
    // })();

    // Uso na tabela

    // const renderControlMap = (() => {
    //     const renderedRequests = new Set();

    //     return function innerRenderControlMap(item, level = 0, allItems = []) {
    //         const internalRequest = item.internalRequest || {};
    //         const requestId = internalRequest.id || item.id;

    //         if (!requestId || renderedRequests.has(requestId)) {
    //             return null;
    //         }

    //         renderedRequests.add(requestId);

    //         // Encontrar todos os itens relacionados
    //         const relatedItems = allItems.filter(i =>
    //             i.internalRequest?.id === requestId || i.id === requestId
    //         );

    //         const lastItem = relatedItems[relatedItems.length - 1] || item;
    //         const currentBalance = parseFloat(lastItem.saldoExistente) || 0;
    //         const initialBalance = parseFloat(internalRequest.totalRequestedValue) || 0;

    //         const hasPayments = Array.isArray(item.payments) && item.payments.length > 0;
    //         const paymentAmount = hasPayments
    //             ? item.payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0)
    //             : 0;

    //             console.log("items de pagamentos", item)

    //         const beneficiary = internalRequest.accountPlanFinancial?.description ||
    //             item.beneficiaryName?.description || 'N/A';

    //         const documentDescription = internalRequest.document
    //             ? getDocumentDescription(internalRequest.document)
    //             : 'N/A';

    //         const isVoided = item.isVoided === true;

    //         return (
    //             <>
    //                 {/* Linha principal da requisição */}
    //                 <tr
    //                     key={`req-${requestId}`}
    //                     className={
    //                         isVoided ? 'table-danger' : hasPayments ? 'table-info' : ''
    //                     }
    //                     style={isVoided ? { color: 'red' } : {}}
    //                 >

    //                     <td style={{ textAlign: 'center' }}>
    //                         {(item.createdAt || internalRequest.operationDate) &&
    //                             new Date(item.createdAt || internalRequest.operationDate).toLocaleDateString('pt-PT')}
    //                     </td>

    //                     <td className={isVoided ? "text-danger" : ""} style={{ textAlign: 'center' }}>
    //                         {internalRequest.id || 'N/D'}
    //                         {isVoided && (
    //                             <span style={{ color: 'red', fontSize: '12px', marginLeft: '4px' }}>
    //                                 (Anulada)
    //                             </span>
    //                         )}
    //                     </td>
    //                     <td className={isVoided ? "text-danger" : ""} style={{ textAlign: 'left' }}>
    //                         {beneficiary}
    //                     </td>
    //                     <td className={isVoided ? "text-danger" : ""} style={{ textAlign: 'right', fontWeight: 'bold' }}>
    //                         {formatCurrency(item.totalAmount) || formatCurrency(initialBalance)}
    //                     </td>
    //                     <td className={isVoided ? "text-danger" : ""} style={{ textAlign: 'right', fontWeight: 'bold' }}>
    //                         {isVoided ? formatCurrency(finalAllocation - item.valorAcumulado) : formatCurrency(finalAllocation - item.valorAcumulado)}
    //                     </td>

    //                     {/* Pagamentos */}
    //                     <td className={isVoided ? "text-danger" : ""} style={{ textAlign: 'center' }}>
    //                         {hasPayments ? item.payments[0]?.date : internalRequest.paymentDate || 'N/D'}
    //                     </td>
    //                     <td className={isVoided ? "text-danger" : ""} style={{ textAlign: 'center' }}>
    //                         {internalRequest.requestNumber || item.requestNumber}
    //                     </td>
    //                     <td className={isVoided ? "text-danger" : ""} style={{ textAlign: 'center' }}>
    //                         {internalRequest.document || 'N/A'}
    //                     </td>
    //                     <td style={{ textAlign: 'left' }}>
    //                         {documentDescription}
    //                     </td>
    //                     <td className={isVoided ? "text-danger" : ""} style={{ textAlign: 'right', color: '#dc3545' }}>
    //                         {formatCurrency(paymentAmount)}
    //                     </td>
    //                     <td className={isVoided ? "text-danger" : ""} style={{ textAlign: 'right', fontWeight: 'bold' }}>
    //                         {isVoided ? formatCurrency(item.valorComSaldo+(parseFloat(item.totalAmountReturned))) : formatCurrency(currentBalance - paymentAmount)}
    //                     </td>
    //                 </tr>

    //                 {/* Linhas adicionais para pagamentos */}
    //                 {hasPayments && item.payments.slice(1).map((payment, index) => (
    //                     <tr
    //                         key={`pay-${requestId}-${index + 1}`}
    //                         className={isVoided ? 'table-danger' : ''}
    //                         style={{
    //                             backgroundColor: '#f8f9fa',
    //                             ...(isVoided ? { textDecoration: 'line-through', color: '#a1a1a1' } : {})
    //                         }}
    //                     >
    //                         <td colSpan={5}></td>
    //                         <td style={{ textAlign: 'center' }}>
    //                             {payment.date || 'N/D'}
    //                         </td>
    //                         <td style={{ textAlign: 'center' }}>
    //                             {internalRequest.requestNumber || item.requestNumber}
    //                         </td>
    //                         <td style={{ textAlign: 'center' }}>
    //                             {payment.documentNumber || internalRequest.document || 'N/A'}
    //                         </td>
    //                         <td style={{ textAlign: 'left' }}>
    //                             {payment.description || documentDescription}
    //                         </td>
    //                         <td style={{ textAlign: 'right', color: '#dc3545' }}>
    //                             {formatCurrency(parseFloat(payment.amount || 0))}
    //                         </td>
    //                         <td style={{ textAlign: 'right' }}>
    //                             {formatCurrency(currentBalance - paymentAmount - (parseFloat(payment.amount) || 0))}
    //                         </td>
    //                     </tr>
    //                 ))}
    //             </>
    //         );
    //     };
    // })();

    const renderControlMap = (() => {
        const renderedRequests = new Set();
        let totalGeralAcumulado = 0; // Variável para acumular o total geral

        return function innerRenderControlMap(item, level = 0, allItems = []) {
            const internalRequest = item.internalRequest || {};
            const requestId = internalRequest.id || item.id;

            if (!requestId || renderedRequests.has(requestId)) {
                return null;
            }

            renderedRequests.add(requestId);

            // Encontrar todos os itens relacionados
            const relatedItems = allItems.filter(i =>
                i.internalRequest?.id === requestId || i.id === requestId
            );

            const lastItem = relatedItems[relatedItems.length - 1] || item;
            const currentBalance = parseFloat(lastItem.saldoExistente) || 0;
            const initialBalance = parseFloat(internalRequest.totalRequestedValue) || 0;

            // Considerar pago se paidReq = 1
            const isPaid = internalRequest.paidReq === 1;
            const hasPayments = isPaid;

            const paymentAmount = hasPayments
                ? parseFloat(item.totalAmount) || 0
                : 0;

            let acumuladoEstaRequisicao = 0;

            if (isPaid) {
                // Valor principal da requisição
                const valorRequisicao = parseFloat(item.totalAmount) || 0;
                acumuladoEstaRequisicao = valorRequisicao;
                totalGeralAcumulado += valorRequisicao;

                // Pagamentos adicionais
                const payments = item.payments || internalRequest.payments;
                if (Array.isArray(payments)) {
                    payments.forEach(payment => {
                        const valorPagamento = parseFloat(payment.amount) || 0;
                        acumuladoEstaRequisicao += valorPagamento;
                        totalGeralAcumulado += valorPagamento;
                    });
                }
            }

            const beneficiary = internalRequest.accountPlanFinancial?.description ||
                item.beneficiaryName?.description || 'N/A';

            const documentDescription = internalRequest.document
                ? getDocumentDescription(internalRequest.document)
                : 'N/A';

            const isVoided = item.isVoided === true;

            // Modificação aqui: Se for voided, mostra N/A na coluna de pagamentos
            const paymentDisplay = isVoided ? 'N/A' : formatCurrency(paymentAmount);

            return (
                <>
                    <tr
                        key={`req-${requestId}`}
                        className={isVoided ? 'table-danger' : hasPayments ? 'table-info' : ''}
                        style={isVoided ? { color: 'red' } : {}}
                    >
                        <td style={{ textAlign: 'center' }}>
                            {(item.createdAt || internalRequest.operationDate) &&
                                new Date(item.createdAt || internalRequest.operationDate).toLocaleDateString('pt-PT')}
                        </td>

                        <td className={isVoided ? "text-danger" : ""} style={{ textAlign: 'center' }}>
                            {internalRequest.id || 'N/D'}
                            {isVoided && (
                                <span style={{ color: 'red', fontSize: '12px', marginLeft: '4px' }}>
                                    (Anulada)
                                </span>
                            )}
                        </td>
                        <td className={isVoided ? "text-danger" : ""} style={{ textAlign: 'left' }}>
                            {beneficiary}
                        </td>
                        <td className={isVoided ? "text-danger" : ""} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            {formatCurrency(item.totalAmount) || formatCurrency(initialBalance)}
                        </td>
                        <td className={isVoided ? "text-danger" : ""} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            {isVoided ? formatCurrency(finalAllocation - item.valorAcumulado) : formatCurrency(finalAllocation - item.valorAcumulado)}
                        </td>

                        {/* Pagamentos */}

                        <td
                            className={isVoided ? "text-danger" : ""}
                            style={{
                                textAlign: 'center',
                                fontWeight: (hasPayments || !isVoided) ? 'bold' : 'normal',
                                color: isVoided
                                    ? '#dc3545' // Vermelho para anulado (herdado do className)
                                    : hasPayments
                                        ? '#28a745' // Verde para PAGO
                                        : '#8B0000' // Amarelo/Laranja para PENDENTE
                            }}
                        >
                            {isVoided
                                ? 'N/A'
                                : (hasPayments ? 'PAGO' : 'PENDENTE')}
                        </td>
                        <td className={isVoided ? "text-danger" : ""} style={{ textAlign: 'center' }}>
                            {isVoided ? 'N/A' : (internalRequest.requestNumber || item.requestNumber)}
                        </td>
                        <td className={isVoided ? "text-danger" : ""} style={{ textAlign: 'center' }}>
                            {isVoided ? 'N/A' : (internalRequest.document || 'N/A')}
                        </td>
                        <td style={{ textAlign: 'left' }}>
                            {isVoided ? 'N/A' : documentDescription}
                        </td>
                        <td className={isVoided ? "text-danger" : ""} style={{ textAlign: 'right', color: 'black', fontWeight: 'bold'  }}>
                            {isVoided ? 'N/A' : paymentDisplay}
                        </td>
                        <td
                            className={isVoided ? "text-danger" : ""}
                            style={{
                                textAlign: 'right',
                                fontWeight: 'bold',
                                color: isVoided
                                    ? '#dc3545' // Vermelho para anulado
                                    : (finalAllocation - totalGeralAcumulado) >= 0
                                        ? '#006400' // Verde escuro para positivo
                                        : '#dc3545' // Vermelho para negativo
                            }}
                        >
                            {formatCurrency(finalAllocation - totalGeralAcumulado)}
                        </td>
                    </tr>
                </>
            );
        };
    })();


    const renderAccountRowsAvailableFinal = (account, level = 0) => {
        const indentation = ' '.repeat(level * 2);
        const isParentAccount = Array.isArray(account.children) && account.children.length > 0;

        // Mapeia as requisições pagas pelo número da requisição
        const paidRequestsMap = {};
        internalRequestsPaid.forEach((paidRequest) => {
            paidRequestsMap[paidRequest.internalRequest.requestNumber] = paidRequest;
        });

        return (
            <>
                {internalRequests.map((request, index) => {
                    const paidRequest = paidRequestsMap[request.internalRequest.requestNumber] || {}; // Busca o pagamento correspondente

                    return (
                        <tr key={``}>
                            {/* Requisições de Fundos (não pagas) */}
                            <td style={{ padding: "5px 10px", textAlign: "left", color: "black" }}>
                                {indentation} {request.operationDate || "Data não disponível"}
                            </td>
                            <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                                {indentation} {request.internalRequest.requestNumber}
                            </td>
                            <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                                {/* {formatNumber(request.internalRequest.accountPlanFinancial.description) || 0} */}
                            </td>
                            <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                                {formatNumber(request.totalAmount) || 0}
                            </td>
                            <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                                {formatNumber(request.saldoExistente) || 0}
                            </td>

                            {/* Pagamentos Correspondentes */}
                            <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                                {paidRequest.internalRequest?.operationDate || "Data não disponível"}
                            </td>
                            <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                                {paidRequest.internalRequest?.requestNumber || "N/A"}
                            </td>
                            <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                                {'N/A'}
                            </td>
                            <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                                {paidRequest.internalRequest?.document || 0}
                            </td>
                            <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                                {paidRequest.description || "Sem descrição"}
                            </td>
                            <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                                {formatNumber(paidRequest.totalAmount) || 0}
                            </td>
                            <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                                {formatNumber(paidRequest.saldoExistente) || 0}
                            </td>
                        </tr>
                    );
                })}

                {/* Renderizar contas-filhas recursivamente */}
                {isParentAccount && account.children.map((childAccount) =>
                    renderAccountRowsAvailableFinal(childAccount, level + 1)
                )}
            </>
        );
    };

    const calculateAggregatedValuesRequests = (account) => {
        let accumulated = 0;
        let untilMonth = 0;
        let duringMonth = 0;

        // Se a conta tem filhos, agrega os valores dos filhos
        if (account.children && account.children.length > 0) {
            account.children.forEach((child) => {
                const childValues = calculateAggregatedValues(child);
                accumulated += childValues.accumulated;
                untilMonth += childValues.untilMonth;
                duringMonth += childValues.duringMonth;
            });
        }

        // Calcula os valores da conta atual
        const transactions = account.entriesEntry || []; // Ajuste 'entriesEntry' conforme necessário
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth(); // Mês atual (0 a 11)
        const currentYear = currentDate.getFullYear();

        // Calcular alocações até o mês atual
        const accountUntilMonth = transactions
            .filter((transaction) => new Date(transaction.createdAt) <= currentDate)
            .reduce((sum, transaction) => sum + transaction.allocation, 0);

        // Calcular alocações durante o mês atual
        const accountDuringMonth = transactions
            .filter((transaction) => {
                const transactionDate = new Date(transaction.createdAt);
                return (
                    transactionDate.getMonth() === currentMonth &&
                    transactionDate.getFullYear() === currentYear
                );
            })
            .reduce((sum, transaction) => sum + transaction.allocation, 0);

        // Alocação acumulada (todas as transações)
        const accountAccumulated = transactions.reduce(
            (sum, transaction) => sum + transaction.allocation,
            0
        );

        return {
            accumulated: accumulated + accountAccumulated,
            untilMonth: untilMonth + accountUntilMonth,
            duringMonth: duringMonth + accountDuringMonth,
        };
    };

    // Função para calcular os valores agregados
    const calculateAggregatedValues = (account) => {
        let accumulated = 0;
        let untilMonth = 0;
        let duringMonth = 0;

        // Se a conta tem filhos, agrega os valores dos filhos
        if (account.children && account.children.length > 0) {
            account.children.forEach((child) => {
                const childValues = calculateAggregatedValues(child);
                accumulated += childValues.accumulated;
                untilMonth += childValues.untilMonth;
                duringMonth += childValues.duringMonth;
            });
        }

        // Calcula os valores da conta atual
        const transactions = account.entriesEntry || []; // Ajuste 'entriesEntry' conforme necessário
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth(); // Mês atual (0 a 11)
        const currentYear = currentDate.getFullYear();

        // Calcular alocações até o mês atual
        const accountUntilMonth = transactions
            .filter((transaction) => new Date(transaction.createdAt) <= currentDate)
            .reduce((sum, transaction) => sum + transaction.allocation, 0);

        // Calcular alocações durante o mês atual
        const accountDuringMonth = transactions
            .filter((transaction) => {
                const transactionDate = new Date(transaction.createdAt);
                return (
                    transactionDate.getMonth() === currentMonth &&
                    transactionDate.getFullYear() === currentYear
                );
            })
            .reduce((sum, transaction) => sum + transaction.allocation, 0);

        // Alocação acumulada (todas as transações)
        const accountAccumulated = transactions.reduce(
            (sum, transaction) => sum + transaction.allocation,
            0
        );

        return {
            accumulated: accumulated + accountAccumulated,
            untilMonth: untilMonth + accountUntilMonth,
            duringMonth: duringMonth + accountDuringMonth,
        };
    };

    const calculateSiblingAllocationReq = (accounts, types, internalRequests) => {
        let total = 0;

        accounts.forEach((account) => {
            const finalAllocationType = account.accountPlan.finalAllocationType;


            // Filtra as requisições correspondentes à conta atual
            const accountRequests = internalRequests.filter((req) => req.accountPlanBudject?.number === account.accountPlan.number);

            // Verifica se há requisições válidas
            if (accountRequests.length > 0) {
                // Calcula a soma dos valores das requisições para a conta
                const totalAmountForAccount = accountRequests.reduce((sum, req) => sum + parseFloat(req.totalAmount || 0), 0);
                // Considera apenas os tipos relevantes de alocação
                if (types.includes(finalAllocationType)) {
                    total += totalAmountForAccount;
                }
            }

            // Inclui as alocações das contas-filhas
            if (Array.isArray(account.children) && account.children.length > 0) {
                total += calculateSiblingAllocationReq(account.children, types, internalRequests);
            }
        });

        return total;
    };

    const calculateSiblingAllocationReq21 = (internalRequests) => {
        let total = 0;
        // Itera sobre as requisições
        internalRequests.forEach((req) => {
            const accountNumber = req.accountPlanBudject?.number;
            const startsWithPrefix = accountNumber?.startsWith("1.");

            // Verifica se a conta começa com "1.1." ou é "1.1.0.0.00"
            if (startsWithPrefix) {
                total += parseFloat(req.totalAmount || 0);  // Soma diretamente o valor de totalAllocation
            }
        });

        return total;  // Retorna o total calculado
    };



    const calculateSiblingAllocationReq21ByDate = (internalRequests, month, year, includeUntilMonth = false) => {
        let total = 0;

        internalRequests.forEach((req, index) => {
            const accountNumber = req.accountPlanBudject?.number;
            const startsWithPrefix = accountNumber?.startsWith("1.");

            const createdAt = new Date(req.createdAt);
            const requestMonth = createdAt.getMonth() + 1;
            const requestYear = createdAt.getFullYear();

            if (!startsWithPrefix) return; // ignora se não começar com "1."

            if (requestYear !== year) return; // ignora se ano diferente do atual

            if (includeUntilMonth) {
                // soma tudo até o mês anterior ao selecionado
                if (requestMonth < month) {
                    total += parseFloat(req.totalAmount || 0);
                } else {
                }
            } else {
                // soma apenas o mês selecionado
                if (requestMonth === month) {
                    total += parseFloat(req.totalAmount || 0);
                } else {
                }
            }
        });

        return total;
    };


    const loadAccountInternalRequestValid = async () => {
        try {
            setLoading(true);
            const response = await fetchAccountRequestValid();
            // const filteredParentAccounts = response.filter(account => account.accountPlan.type === 'budject');
            setInternalRequestsValid(response);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };



    const calculateSiblingAllocationReq2100 = (internalRequests) => {
        let total = 0;
        // Itera sobre as requisições
        internalRequests.forEach((req) => {
            const accountNumber = req.accountPlanBudject?.number;
            const startsWithPrefix = accountNumber?.startsWith("1.1.");

            // Verifica se a conta começa com "1.1." ou é "1.1.0.0.00"
            if (startsWithPrefix) {
                total += parseFloat(req.totalAmount || 0);  // Soma diretamente o valor de totalAllocation
            }
        });

        return total;  // Retorna o total calculado
    };



    const calculateSiblingAllocationReq2100ByDate = (internalRequests, month, year, includeUntilMonth = false) => {
        let total = 0;

        internalRequests.forEach((req, index) => {
            const accountNumber = req.accountPlanBudject?.number;
            const startsWithPrefix = accountNumber?.startsWith("1.1.");

            if (!startsWithPrefix) return;

            const createdAt = new Date(req.createdAt);
            const requestMonth = createdAt.getMonth() + 1;
            const requestYear = createdAt.getFullYear();

            if (requestYear !== year) return;

            if (includeUntilMonth) {
                if (requestMonth < month) {
                    total += parseFloat(req.totalAmount || 0);
                } else {
                }
            } else {
                if (requestMonth === month) {
                    total += parseFloat(req.totalAmount || 0);
                } else {
                }
            }
        });

        return total;
    };


    const calculateTotalAllocation = (account, internalRequests) => {
        let totalAmountForAccount = 0;

        const finalAllocationType = account.accountPlan.finalAllocationType;

        if (finalAllocationType === 'A') {
            totalAmountForAccount += calculateSiblingAllocationReq(accounts, ['A2', 'A3', 'L2', 'L3', 'L4', 'L5', 'L6'], internalRequests);
        } else if (finalAllocationType === 'A1') {
            totalAmountForAccount += calculateSiblingAllocationReq(accounts, ['A2', 'A3'], internalRequests);
        } else if (finalAllocationType === 'A2') {
            totalAmountForAccount += internalRequests.totalAmount || 0;
        } else if (finalAllocationType === 'A3') {
            totalAmountForAccount += calculateSiblingAllocationReq(accounts, ['L1'], internalRequests);
        } else if (finalAllocationType === 'A4') {
            totalAmountForAccount += calculateSiblingAllocationReq(accounts, ['L2', 'L3'], internalRequests);
        } else if (finalAllocationType === 'A5') {
            totalAmountForAccount += calculateSiblingAllocationReq(accounts, ['L5', 'L6'], internalRequests);
        } else if (finalAllocationType === 'A7') {
            totalAmountForAccount += calculateSiblingAllocationReq(accounts, ['A8'], internalRequests);
        } else if (finalAllocationType === 'A8') {
            totalAmountForAccount += calculateSiblingAllocationReq(accounts, ['L7', 'L8', 'L9'], internalRequests);
        } else {
            totalAmountForAccount += internalRequests.totalAmount || 0;
        }

        // Soma as requisições da conta atual
        totalAmountForAccount += internalRequests
            .filter((req) => req.accountPlanBudject?.number === account.accountPlan.number)
            .reduce((sum, req) => sum + parseFloat(req.totalAmount || 0), 0);

        // Soma as requisições das contas-filhas
        if (Array.isArray(account.children) && account.children.length > 0) {
            account.children.forEach((childAccount) => {
                totalAmountForAccount += calculateTotalAllocation(childAccount, internalRequests);
            });
        }

        return totalAmountForAccount;
    };

    const calculateFinalAllocationA = (account) => {
        let totalAllocation = 0;
        const finalAllocationType = account.accountPlan.finalAllocationType;

        const initialAllocationEntry = account.entriesEntry?.find(entry => entry.type === "initial_allocation");
        const initialAllocation = initialAllocationEntry ? initialAllocationEntry.allocation : 0;


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
        } else if (finalAllocationType === 'A1') {
            // Verificação para garantir que o array valuesAccounts tenha pelo menos 2 elementos
            // if (valuesAccounts.length >= 2) {
            //     totalAllocation = valuesAccounts[0].total_allocation + valuesAccounts[1].total_allocation;
            // } else {
            //     totalAllocation = 0; // Ou outro valor adequado
            // }
            const allocationTypes = ['L', 'L1'];
            allocationTypes.forEach(type => {
                const account = accounts.find(acc => acc.accountPlan.finalAllocationType === type);
                if (account) {
                    totalAllocation += calculateChildrenAllocationFinallAlocation(account);
                }
            });
        } else if (finalAllocationType === 'A2') {
            // Verificação para garantir que o array valuesAccounts tenha pelo menos 1 elemento
            if (valuesAccounts.length >= 1) {
                totalAllocation = valuesAccounts[0].total_allocation;
            } else {
                totalAllocation = 0; // Ou outro valor adequado
            }
        } else if (finalAllocationType === 'A3') {
            totalAllocation += calculateChildrenAllocationA2(account);
        } else if (finalAllocationType === 'A4') {
            // Verificação para garantir que o array valuesAccounts tenha pelo menos 4 elementos
            if (valuesAccounts.length >= 4) {
                totalAllocation = valuesAccounts[2].total_allocation + valuesAccounts[3].total_allocation;
            } else {
                totalAllocation = 0; // Ou outro valor adequado
            }
        } else if (finalAllocationType === 'A5') {
            // Verificação para garantir que o array valuesAccounts tenha pelo menos 6 elementos
            if (valuesAccounts.length >= 6) {
                totalAllocation = valuesAccounts[5].total_allocation + valuesAccounts[6].total_allocation;
            } else {
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
                totalAllocation = 0; // Ou outro valor adequado
            }
        } else {
            // Para outras contas que não são do tipo L ou A2, soma a alocação inicial
            totalAllocation += initialAllocation || 0;
        }

        return totalAllocation;
    };


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

    // const calculateFinalAllocationDinamic = (account) => {
    //     let totalAllocation = 0;
    //     const finalAllocationType = account.accountPlan.finalAllocationType;

    //     if (finalAllocationType === 'A') {
    //         totalAllocation += calculateSiblingAllocation(accounts, ['A2', 'A3', 'L4', 'L5', 'L6']);

    //         const l2Account = accounts.find(acc => acc.accountPlan.finalAllocationType === 'L2');
    //         if (l2Account) {
    //             totalAllocation += calculateChildrenAllocationFinallAlocation(l2Account);
    //         }

    //         const l3Account = accounts.find(acc => acc.accountPlan.finalAllocationType === 'L3');
    //         if (l3Account) {
    //             totalAllocation += calculateChildrenAllocationFinallAlocation(l3Account);
    //         }
    //     } else if (finalAllocationType === 'L3') {
    //         totalAllocation += calculateChildrenAllocationFinallAlocation(account);
    //     }
    //     else if (finalAllocationType === 'L2') {
    //         totalAllocation += calculateChildrenAllocationFinallAlocation(account);
    //     } else if (finalAllocationType === 'A1') {
    //         let siblingAllocation = calculateSiblingAllocation(accounts, ['A2', 'A3']);
    //         // arredonda siblingAllocation para 2 casas e converte de volta para número
    //         siblingAllocation = parseFloat(siblingAllocation.toFixed(2));

    //         // soma e já arredonda totalAllocation para 2 casas
    //         totalAllocation += siblingAllocation;   
    //         totalAllocation = parseFloat(totalAllocation.toFixed(2));
    //     } else if (finalAllocationType === 'A2') {
    //         totalAllocation += account.finalAllocation || 0;
    //     } else if (finalAllocationType === 'A3') {
    //         totalAllocation += calculateSiblingAllocation(accounts, ['L1']);
    //     } else if (finalAllocationType === 'A4') {
    //         const l2Account = accounts.find(acc => acc.accountPlan.finalAllocationType === 'L2');
    //         if (l2Account) {
    //             totalAllocation += calculateChildrenAllocationFinallAlocation(l2Account);
    //         }

    //         const l3Account = accounts.find(acc => acc.accountPlan.finalAllocationType === 'L3');
    //         if (l3Account) {
    //             totalAllocation += calculateChildrenAllocationFinallAlocation(l3Account);
    //         }
    //     }
    //     else if (finalAllocationType === 'A5') {
    //         totalAllocation += calculateSiblingAllocation(accounts, ['L5', 'L6']);
    //     } else if (finalAllocationType === 'A7') {
    //         totalAllocation += calculateSiblingAllocation(accounts, ['A8']);
    //     } else if (finalAllocationType === 'A8') {
    //         totalAllocation += calculateSiblingAllocation(accounts, ['L7', 'L8', 'L9']);
    //     } else {
    //         totalAllocation += account.finalAllocation || 0;
    //     }

    //     return totalAllocation;
    // };


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

    const calculateChildrenAllocationFinallAlocationByType = (accounts, types) => {
        let total = 0;

        if (accounts.children && Array.isArray(account.children)) {
            accounts.children.forEach(child => {
                if (types.includes(child.finalAllocationType)) {
                    const childAllocation = child.finalAllocation || 0;
                    total += childAllocation;
                } else {
                }
            });
        } else {
        }
        return total;
    };

    const calculateChildrenAllocationFinallAlocation = (account) => {
        let total = 0;

        // Verifica se a conta tem filhos e soma os valores das alocações dos filhos
        if (account.children && Array.isArray(account.children)) {
            account.children.forEach(child => {
                const childAllocation = child.finalAllocation || 0;
                total += childAllocation;
            });
        }

        return total;
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



    const getDocumentDescription = (code) => {
        const documentMap = {
            101: 'Factura',
            102: 'Contrato',
            509: 'Outros',
            510: 'Pro-forma',
            // Adicione outros mapeamentos conforme necessário
        };

        return documentMap[code] || 'Outros';
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

    const renderAccountRows = (account, level = 0) => {
        const indentation = ' '.repeat(level * 2);
        const isParentAccount = Array.isArray(account.children) && account.children.length > 0;


        //////////////////////////////////
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

        let dotacaoFinal = 0;
        const finalAllocationRed = calculateFinalAllocationA(account);
        dotacaoFinal = ((finalAllocationRed + (inscription + increase) - (annulment + decrease)) * 2.5);
        /////////////////////////////////



        const finalAllocation = calculateFinalAllocationDinamic(account);
        let totalAmountForAccount = calculateTotalAllocation(account, internalRequestsPaid);

        const accountNumber = account.accountPlan.number;

        const currentMonth = selectedMonth ? parseInt(selectedMonth) : new Date().getMonth() + 1;

        // Recalcular totalAmountForAccount para casos especiais
        if (accountNumber === "1.0.0.0.00") {
            totalAmountForAccount = calculateSiblingAllocationReq21(internalRequestsPaid, currentMonth);
        } else if (accountNumber === "1.1.0.0.00") {
            totalAmountForAccount = calculateSiblingAllocationReq2100(internalRequestsPaid, currentMonth);
        }



        const untilMonth = parseFloat(totalAmountForAccount) || 0;
        const duringMonth = 0;
        const accumulated = untilMonth + duringMonth;

        let totalForCurrentMonth = calculateTotalAllocationByMonthFilter(account, internalRequestsPaid, currentMonth);
        let totalUntilLastMonth = calculateTotalAllocationByMonthFilter(account, internalRequestsPaid, currentMonth, true);

        const now = new Date();
        const currentYear = now.getFullYear();

        if (accountNumber === "1.0.0.0.00") {
            totalForCurrentMonth = calculateSiblingAllocationReq21ByDate(internalRequestsPaid, currentMonth, currentYear, false);
            totalUntilLastMonth = calculateSiblingAllocationReq21ByDate(internalRequestsPaid, currentMonth, currentYear, true);
        } else if (accountNumber === "1.1.0.0.00") {
            totalForCurrentMonth = calculateSiblingAllocationReq2100ByDate(internalRequestsPaid, currentMonth, currentYear, false);
            totalUntilLastMonth = calculateSiblingAllocationReq2100ByDate(internalRequestsPaid, currentMonth, currentYear, true);
        }

        const totalAccumulated = totalUntilLastMonth + totalForCurrentMonth;
        const availableBudget = parseFloat(dotacaoFinal) || 0;
        const balance = availableBudget - totalAccumulated;

        const percentage = availableBudget > 0 ? (accumulated / availableBudget) * 100 : 0;

        return (
            <>
                <tr
                    key={account.accountPlan.number}
                    className={isParentAccount ? 'table-success' : ''}
                    style={{ backgroundColor: isParentAccount ? 'black' : '' }}
                >
                    <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                        {indentation}{account.accountPlan.number}
                    </td>
                    <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                        {indentation}{account.accountPlan.description}
                    </td>
                    <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                        {formatNumber(availableBudget) || 0}
                    </td>
                    <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                        {formatNumber(totalUntilLastMonth) || 0}
                    </td>
                    <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                        {formatNumber(totalForCurrentMonth) || 0}
                    </td>
                    <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                        {formatNumber(totalAccumulated) || 0}
                    </td>
                    <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                        {formatNumber(balance) || 0}
                    </td>
                </tr>

                {isParentAccount && account.children.map((childAccount) =>
                    renderAccountRows(childAccount, level + 1)
                )}
            </>
        );
    };



    // 🔹 Total Geral = Despesas Correntes + Despesas de Capital
    const totalOverall = {
        totalAvailableBudget: currentExpenses.totalAvailableBudget + capitalExpenses.totalAvailableBudget,
        totalUntilMonth: currentExpenses.totalUntilMonth + capitalExpenses.totalUntilMonth,
        totalDuringMonth: currentExpenses.totalDuringMonth + capitalExpenses.totalDuringMonth,
        totalAccumulated: currentExpenses.totalAccumulated + capitalExpenses.totalAccumulated,
        totalBalance: currentExpenses.totalBalance + capitalExpenses.totalBalance
    };


    const renderAccountRowsRequests = (account, level = 0) => {
        const indentation = ' '.repeat(level * 2); // Indentação para o nível hierárquico
        const isParentAccount = account.children && account.children.length > 0;

        // Calcula o total da alocação
        const finalAllocation = calculateFinalAllocation(account);

        // Obtém os valores agregados
        const aggregatedValues = calculateAggregatedValues(account);

        const aggregatedValuesRequest = calculateAggregatedValuesRequests(account);


        return (
            <>
                <tr
                    key={account.accountPlan.number}
                    className={isParentAccount ? 'table-success' : ''}
                    style={{ backgroundColor: isParentAccount ? 'black' : '' }}
                >
                    <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                        {indentation}
                        {account.accountPlan.number}
                    </td>
                    <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                        {indentation}
                        {account.accountPlan.description}
                    </td>
                    <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                        {formatNumber(finalAllocation) || 0}
                    </td>
                    <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                        {formatNumber(aggregatedValuesRequest.untilMonth) || 0}
                    </td>
                    <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                        {formatNumber(aggregatedValues.duringMonth) || 0}
                    </td>
                    <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                        {formatNumber(aggregatedValues.accumulated) || 0}
                    </td>
                    <td style={{ padding: '5px 10px', textAlign: 'left', color: 'black' }}>
                        {formatNumber(finalAllocation) || 0}
                    </td>
                </tr>

                {account.children.map((childAccount) =>
                    renderAccountRows(childAccount, level + 1)
                )}
            </>
        );
    };




    const totalCurrentContraValorData = valuesAccounts
        .slice(0, 7)
        .reduce((sum, account) => sum + (account.total_allocation || 0), 0);
    const totalMzn = totalCurrentContraValorData * 2.5;
    const totalMznDinamic = totalCurrentContraValorData * 2.5;

    const totalCurrentContraValorDataDespesas = valuesAccounts
        .slice(7)
        .reduce((sum, account) => sum + (account.total_allocation || 0), 0);
    const totalMznDespesas = totalCurrentContraValorDataDespesas * 2.5;
    const total = totalCurrentContraValorData + totalCurrentContraValorDataDespesas;
    const totalMznF = total * 2.5;
    const [formData, setFormData] = useState({
        value: ""
    });

    const calculateConsolidatedTotalsSemDuplicacao = () => {
        let currentExpenses1 = {
            totalAvailableBudget: totalMzn,
            totalUntilMonth: 0,
            totalUntilMonthPaid: 0,
            totalDuringMonth: 0,
            totalDuringMonthPaid: 0,
            totalAccumulated: 0,
            totalAccumulatedPaid: 0,
            totalBalance: totalMzn,
            totalBalancePaid: totalMzn
        };
        let capitalExpenses1 = {
            totalAvailableBudget: totalCapitalExpenses * 2.5,
            totalUntilMonth: 0,
            totalUntilMonthPaid: 0,
            totalDuringMonth: 0,
            totalDuringMonthPaid: 0,
            totalAccumulated: 0,
            totalAccumulatedPaid: 0,
            totalBalance: totalCapitalExpenses * 2.5,
            totalBalancePaid: totalCapitalExpenses * 2.5
        };

        const currentMonth = selectedMonth ? parseInt(selectedMonth) : new Date().getMonth() + 1;

        const processTopLevelAccountOnly = (account) => {
            if (account.parentAccount) return;

            const isCorrente = account.accountPlan.number.startsWith('1.');
            const target = isCorrente ? currentExpenses1 : capitalExpenses1;

            // Totais gerais
            const totalUntilLastMonth = calculateTotalAllocationByMonthFilter(account, internalRequestsValid, currentMonth, true);
            const totalDuringMonth = calculateTotalAllocationByMonthFilter(account, internalRequestsValid, currentMonth);
            const totalAccumulated = totalUntilLastMonth + totalDuringMonth;

            // Totais pagos
            const totalUntilLastMonthPaid = calculateTotalAllocationByMonthFilter(account, internalRequestsPaid, currentMonth, true, true);
            const totalDuringMonthPaid = calculateTotalAllocationByMonthFilter(account, internalRequestsPaid, currentMonth, false, true);
            const totalAccumulatedPaid = totalUntilLastMonthPaid + totalDuringMonthPaid;

            target.totalUntilMonth += totalUntilLastMonth;
            target.totalUntilMonthPaid += totalUntilLastMonthPaid;
            target.totalDuringMonth += totalDuringMonth;
            target.totalDuringMonthPaid += totalDuringMonthPaid;
            target.totalAccumulated += totalAccumulated;
            target.totalAccumulatedPaid += totalAccumulatedPaid;
        };

        organizedAccounts.forEach(processTopLevelAccountOnly);

        currentExpenses1.totalBalance = currentExpenses1.totalAvailableBudget - currentExpenses1.totalAccumulated;
        currentExpenses1.totalBalancePaid = currentExpenses1.totalAvailableBudget - currentExpenses1.totalAccumulatedPaid;
        capitalExpenses1.totalBalance = capitalExpenses1.totalAvailableBudget - capitalExpenses1.totalAccumulated;
        capitalExpenses1.totalBalancePaid = capitalExpenses1.totalAvailableBudget - capitalExpenses1.totalAccumulatedPaid;

        const totalOverall1 = {
            totalAvailableBudget: currentExpenses1.totalAvailableBudget + capitalExpenses1.totalAvailableBudget,
            totalUntilMonth: currentExpenses1.totalUntilMonth + capitalExpenses1.totalUntilMonth,
            totalUntilMonthPaid: currentExpenses1.totalUntilMonthPaid + capitalExpenses1.totalUntilMonthPaid,
            totalDuringMonth: currentExpenses1.totalDuringMonth + capitalExpenses1.totalDuringMonth,
            totalDuringMonthPaid: currentExpenses1.totalDuringMonthPaid + capitalExpenses1.totalDuringMonthPaid,
            totalAccumulated: currentExpenses1.totalAccumulated + capitalExpenses1.totalAccumulated,
            totalAccumulatedPaid: currentExpenses1.totalAccumulatedPaid + capitalExpenses1.totalAccumulatedPaid,
            totalBalance: (currentExpenses1.totalAvailableBudget + capitalExpenses1.totalAvailableBudget) -
                (currentExpenses1.totalAccumulated + capitalExpenses1.totalAccumulated),
            totalBalancePaid: (currentExpenses1.totalAvailableBudget + capitalExpenses1.totalAvailableBudget) -
                (currentExpenses1.totalAccumulatedPaid + capitalExpenses1.totalAccumulatedPaid)
        };

        return { currentExpenses1, capitalExpenses1, totalOverall1 };
    };


    const { currentExpenses1, capitalExpenses1, totalOverall1 } = calculateConsolidatedTotalsSemDuplicacao();

    const limparCampos = () => {
        setEnitialAllocation(0);
        setInsertAllocation(0);
        setModified(0);
        setAnullment(0);
        setFinalAllocation(0);
        setRedistribuitionDataReinforcement(0);
        setRedistribuitionDataAnnulment(0);
        setRequestsFilter([]);

        setFormData((prevFormData) => ({
            ...prevFormData,
            accountPlanNumber: "",
            startDate: "",
            endDate: "",
        }));
    };

    // Renderiza a tabela com base no relatório selecionado
    const renderTable = () => {
        switch (selectedReport) {
            case "Balancete de Execução Orçamental – Pagamentos":
                return (
                    <div className="premium-container">
                        <div style={styles.container}>
                            {/* Filtro de Contas */}
                            <div style={{ flex: 2, minWidth: '300px' }}>
                                <select
                                    className='d-none'
                                    value={selectedAccount}
                                    onChange={handleChangeBank}
                                    style={{
                                        ...styles.select,
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        padding: '8px 12px',
                                        width: '100%'
                                    }}>
                                    <option value="">Todas as Contas</option>
                                    {accounts.map((account) => (
                                        <option key={account.id} value={account.accountPlan.number}>
                                            {account.accountPlan.number} - {account.accountPlan.description}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    style={{
                                        ...styles.select,
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        padding: '8px 12px',
                                        width: '100%'
                                    }}
                                >
                                    <option value="">Todos os Meses</option>
                                    {months.map((month, index) => (
                                        <option key={index} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>

                            </div>

                            {/* Filtro por Mês */}
                            <div >
                                <select
                                    className='d-none'
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    style={{
                                        ...styles.select,
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        padding: '8px 12px',
                                        width: '100%'
                                    }}
                                >
                                    <option value="">Todos os Meses</option>
                                    {months.map((month, index) => (
                                        <option key={index} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Botões de Exportação */}
                            <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                                <button
                                    onClick={exportToExcel}
                                    style={{
                                        ...styles.button,
                                        backgroundColor: '#1d6f42',
                                        color: 'white',
                                        minWidth: '120px'
                                    }}
                                >
                                    <FaFileExcel style={{ marginRight: '8px' }} />
                                    Excel
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    style={{
                                        ...styles.button,
                                        backgroundColor: '#e74a3b',
                                        color: 'white',
                                        minWidth: '120px'
                                    }}
                                >
                                    <FaFilePdf style={{ marginRight: '8px' }} />
                                    PDF
                                </button>
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
                            <table id='BudjectOrc' className="table table-striped table-bordered table-hover" style={{ width: '100%' }}>
                                <thead
                                    style={{
                                        backgroundColor: '#f4f4f4', textAlign: 'center',
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 2, // Garante que o cabeçalho fique sobre o conteúdo da tabela
                                    }}>
                                    <tr>
                                        <th style={{ verticalAlign: "middle", textAlign: "left" }}>Código</th>
                                        <th style={{ verticalAlign: "middle", textAlign: "left" }}>Designação</th>
                                        <th>Dotação Disponível</th>
                                        <th>Até ao Mês</th>
                                        <th>Durante o Mês</th>
                                        <th>Acumulado</th>
                                        <th>Saldo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {organizedAccounts.map((account) => renderAccountRows(account))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{
                            marginTop: "30px",
                            display: "flex",
                            gap: "30px",
                            padding: "0",
                            justifyContent: "space-between",
                            alignItems: "stretch",
                            borderRadius: "16px",
                            background: "transparent",
                            flexWrap: "wrap"
                        }}>
                            {/* Card de Despesas Correntes - Dark Premium */}
                            <div style={{
                                flex: "1",
                                minWidth: "300px",
                                padding: "25px",
                                background: "linear-gradient(145deg, #1e2a3a 0%, #121a25 100%)",
                                border: "1px solid rgba(255, 255, 255, 0.05)",
                                fontWeight: "600",
                                color: "#f8f9fa",
                                borderRadius: "16px",
                                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
                                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)",
                                cursor: "pointer",
                                position: "relative",
                                overflow: "hidden",
                                ":hover": {
                                    transform: "translateY(-8px)",
                                    boxShadow: "0 12px 40px rgba(41, 98, 255, 0.2)"
                                }
                            }}>
                                {/* Efeito de brilho sutil */}
                                <div style={{
                                    position: "absolute",
                                    top: "-50%",
                                    left: "-50%",
                                    width: "200%",
                                    height: "200%",
                                    background: "radial-gradient(circle, rgba(52, 152, 219, 0.1) 0%, transparent 70%)",
                                    opacity: "0",
                                    transition: "opacity 0.4s ease",
                                    ":hover": {
                                        opacity: "1"
                                    }
                                }}></div>

                                <div style={{
                                    fontSize: "20px",
                                    marginBottom: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    <div style={{
                                        width: "16px",
                                        height: "16px",
                                        background: "linear-gradient(135deg, #3498db 0%, #2c79c7 100%)",
                                        borderRadius: "4px",
                                        display: "inline-block",
                                        boxShadow: "0 0 10px rgba(52, 152, 219, 0.5)"
                                    }}></div>
                                    <strong style={{ color: "#eef2f5" }}>Total de Despesas Correntes</strong>
                                </div>

                                <div style={{
                                    marginTop: "20px",
                                    display: "grid",
                                    gap: "16px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    {[
                                        { label: "Dotação Disponível", value: (totalCurrentExpenses * 2.5), color: "#2ecc71", icon: "↑" },
                                        { label: "Até ao Mês", value: currentExpenses1.totalUntilMonthPaid, color: "#bdc3c7", icon: "↗" },
                                        { label: "Durante o Mês", value: currentExpenses1.totalDuringMonthPaid, color: "#e74c3c", icon: "↓" },
                                        { label: "Acumulado", value: currentExpenses1.totalAccumulatedPaid, color: "#bdc3c7", icon: "↘" },
                                        {
                                            label: "Saldo",
                                            value: (totalCurrentExpenses * 2.5) - currentExpenses1.totalAccumulatedPaid,
                                            color: ((totalCurrentExpenses * 2.5) - currentExpenses1.totalAccumulatedPaid) >= 0 ? "#2ecc71" : "#e74c3c",
                                            icon: ((totalCurrentExpenses * 2.5) - currentExpenses1.totalAccumulatedPaid) >= 0 ? "✓" : "✗",
                                            isTotal: true
                                        }].map((item, index) => (
                                            <div key={index} style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                paddingBottom: item.isTotal ? "0" : "10px",
                                                marginBottom: item.isTotal ? "0" : "6px",
                                                borderBottom: item.isTotal ? "none" : "1px solid rgba(255,255,255,0.05)"
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span style={{
                                                        fontSize: "14px",
                                                        color: "#95a5a6",
                                                        fontWeight: "500"
                                                    }}>{item.label}</span>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span style={{
                                                        fontSize: "14px",
                                                        color: item.color,
                                                        opacity: "0.8"
                                                    }}>{item.icon}</span>
                                                    <strong style={{
                                                        color: item.color,
                                                        fontSize: item.isTotal ? "18px" : "15px",
                                                        fontWeight: item.isTotal ? "700" : "600",
                                                        textShadow: item.isTotal ? `0 0 8px ${item.color}40` : "none"
                                                    }}>{formatNumber(item.value)}</strong>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Card de Despesas de Capital - Dark Premium */}
                            <div style={{
                                flex: "1",
                                minWidth: "300px",
                                padding: "25px",
                                background: "linear-gradient(145deg, #231a2a 0%, #16101e 100%)",
                                border: "1px solid rgba(255, 255, 255, 0.05)",
                                fontWeight: "600",
                                color: "#f8f9fa",
                                borderRadius: "16px",
                                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
                                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)",
                                cursor: "pointer",
                                position: "relative",
                                overflow: "hidden",
                                ":hover": {
                                    transform: "translateY(-8px)",
                                    boxShadow: "0 12px 40px rgba(155, 89, 182, 0.2)"
                                }
                            }}>
                                <div style={{
                                    position: "absolute",
                                    top: "-50%",
                                    left: "-50%",
                                    width: "200%",
                                    height: "200%",
                                    background: "radial-gradient(circle, rgba(155, 89, 182, 0.1) 0%, transparent 70%)",
                                    opacity: "0",
                                    transition: "opacity 0.4s ease",
                                    ":hover": {
                                        opacity: "1"
                                    }
                                }}></div>

                                <div style={{
                                    fontSize: "20px",
                                    marginBottom: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    <div style={{
                                        width: "16px",
                                        height: "16px",
                                        background: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
                                        borderRadius: "4px",
                                        display: "inline-block",
                                        boxShadow: "0 0 10px rgba(155, 89, 182, 0.5)"
                                    }}></div>
                                    <strong style={{ color: "#f3e9f7" }}>Total de Despesas de Capital</strong>
                                </div>

                                <div style={{
                                    marginTop: "20px",
                                    display: "grid",
                                    gap: "16px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    {[
                                        { label: "Dotação Disponível", value: totalCapitalExpenses * 2.5, color: "#2ecc71", icon: "↑" },
                                        { label: "Até ao Mês", value: capitalExpenses1.totalUntilMonthPaid, color: "#bdc3c7", icon: "↗" },
                                        { label: "Durante o Mês", value: capitalExpenses1.totalDuringMonthPaid, color: "#e74c3c", icon: "↓" },
                                        { label: "Acumulado", value: capitalExpenses1.totalAccumulatedPaid, color: "#bdc3c7", icon: "↘" },
                                        { label: "Saldo", value: capitalExpenses1.totalBalancePaid, color: capitalExpenses1.totalBalancePaid >= 0 ? "#2ecc71" : "#e74c3c", icon: capitalExpenses1.totalBalancePaid >= 0 ? "✓" : "✗", isTotal: true }
                                    ].map((item, index) => (
                                        <div key={index} style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            paddingBottom: item.isTotal ? "0" : "10px",
                                            marginBottom: item.isTotal ? "0" : "6px",
                                            borderBottom: item.isTotal ? "none" : "1px solid rgba(255,255,255,0.05)"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <span style={{
                                                    fontSize: "14px",
                                                    color: "#95a5a6",
                                                    fontWeight: "500"
                                                }}>{item.label}</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <span style={{
                                                    fontSize: "14px",
                                                    color: item.color,
                                                    opacity: "0.8"
                                                }}>{item.icon}</span>
                                                <strong style={{
                                                    color: item.color,
                                                    fontSize: item.isTotal ? "18px" : "15px",
                                                    fontWeight: item.isTotal ? "700" : "600",
                                                    textShadow: item.isTotal ? `0 0 8px ${item.color}40` : "none"
                                                }}>{formatNumber(item.value)}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card de Orçamento Global - Dark Premium */}
                            <div style={{
                                flex: "1",
                                minWidth: "300px",
                                padding: "25px",
                                background: "linear-gradient(145deg, #1a2a1e 0%, #101a12 100%)",
                                border: "1px solid rgba(255, 255, 255, 0.05)",
                                fontWeight: "600",
                                color: "#f8f9fa",
                                borderRadius: "16px",
                                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
                                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)",
                                cursor: "pointer",
                                position: "relative",
                                overflow: "hidden",
                                ":hover": {
                                    transform: "translateY(-8px)",
                                    boxShadow: "0 12px 40px rgba(46, 204, 113, 0.2)"
                                }
                            }}>
                                <div style={{
                                    position: "absolute",
                                    top: "-50%",
                                    left: "-50%",
                                    width: "200%",
                                    height: "200%",
                                    background: "radial-gradient(circle, rgba(46, 204, 113, 0.1) 0%, transparent 70%)",
                                    opacity: "0",
                                    transition: "opacity 0.4s ease",
                                    ":hover": {
                                        opacity: "1"
                                    }
                                }}></div>

                                <div style={{
                                    fontSize: "20px",
                                    marginBottom: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    <div style={{
                                        width: "16px",
                                        height: "16px",
                                        background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
                                        borderRadius: "4px",
                                        display: "inline-block",
                                        boxShadow: "0 0 10px rgba(46, 204, 113, 0.5)"
                                    }}></div>
                                    <strong style={{ color: "#e8f5e9" }}>Total Orçamento Global</strong>
                                </div>

                                <div style={{
                                    marginTop: "20px",
                                    display: "grid",
                                    gap: "16px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    {[
                                        { label: "Dotação Disponível", value: (totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5), color: "#2ecc71", icon: "↑" },
                                        { label: "Até ao Mês", value: totalOverall1.totalUntilMonthPaid, color: "#bdc3c7", icon: "↗" },
                                        { label: "Durante o Mês", value: totalOverall1.totalDuringMonthPaid, color: "#e74c3c", icon: "↓" },
                                        { label: "Acumulado", value: totalOverall1.totalAccumulatedPaid, color: "#bdc3c7", icon: "↘" },
                                        {
                                            label: "Saldo",
                                            value: (totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5) - totalOverall1.totalAccumulatedPaid,
                                            color: ((totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5) - totalOverall1.totalAccumulatedPaid) >= 0 ? "#2ecc71" : "#e74c3c",
                                            icon: ((totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5) - totalOverall1.totalAccumulatedPaid) >= 0 ? "✓" : "✗",
                                            isTotal: true
                                        }].map((item, index) => (
                                            <div key={index} style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                paddingBottom: item.isTotal ? "0" : "10px",
                                                marginBottom: item.isTotal ? "0" : "6px",
                                                borderBottom: item.isTotal ? "none" : "1px solid rgba(255,255,255,0.05)"
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span style={{
                                                        fontSize: "14px",
                                                        color: "#95a5a6",
                                                        fontWeight: "500"
                                                    }}>{item.label}</span>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <span style={{
                                                        fontSize: "14px",
                                                        color: item.color,
                                                        opacity: "0.8"
                                                    }}>{item.icon}</span>
                                                    <strong style={{
                                                        color: item.color,
                                                        fontSize: item.isTotal ? "18px" : "15px",
                                                        fontWeight: item.isTotal ? "700" : "600",
                                                        textShadow: item.isTotal ? `0 0 8px ${item.color}40` : "none"
                                                    }}>{formatNumber(item.value)}</strong>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "Balancete de Execução Orçamental – Requisições e Pagamentos":
                return (
                    <div className="premium-container">
                        <div style={{
                            ...styles.container,
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '10px',
                            justifyContent: 'space-between'
                        }}>

                            {/* Filtro de Contas */}
                            <div style={{ flex: 2, minWidth: '300px' }}>

                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    style={{
                                        ...styles.select,
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        padding: '8px 12px',
                                        width: '100%'
                                    }}
                                >
                                    <option value="">Todos os Meses</option>
                                    {months.map((month, index) => (
                                        <option key={index} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>

                            </div>


                            {/* Botões de Exportação */}
                            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                                <button
                                    onClick={() => exportToExcelData('excel')}
                                    style={{
                                        ...styles.button,
                                        backgroundColor: '#1d6f42',
                                        color: 'white',
                                        minWidth: '120px'
                                    }}
                                >
                                    <FaFileExcel style={{ marginRight: '8px' }} />
                                    Excel
                                </button>
                                <button
                                    onClick={() => exportToPDFData('pdf')}
                                    style={{
                                        ...styles.button,
                                        backgroundColor: '#e74a3b',
                                        color: 'white',
                                        minWidth: '120px'
                                    }}
                                >
                                    <FaFilePdf style={{ marginRight: '8px' }} />
                                    PDF
                                </button>
                            </div>


                            {/* CSS para animação */}
                            <style>
                                {`
                                @keyframes blinker {
                                    50% { opacity: 0.5; }
                                }
                                `}
                            </style>
                        </div>

                        <div style={{
                            maxHeight: "400px",
                            overflowY: "auto",
                            border: "1px solid #ddd",
                        }}>
                            <table
                                id="BudjectData"
                                className="table table-striped table-bordered table-hover">
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
                                            Dotação Disponível
                                        </th>
                                        <th colSpan={4} style={{ textAlign: "center" }}>
                                            Requisições Emitidas
                                        </th>
                                        <th colSpan={4} style={{ textAlign: "center" }}>
                                            Despesas Pagas
                                        </th>

                                    </tr>
                                    <tr>
                                        <th>Até ao Mês</th>
                                        <th>Durante o Mês</th>
                                        <th>Acumulado</th>
                                        <th>Saldo</th>
                                        <th>Até ao Mês</th>
                                        <th>Durante o Mês</th>
                                        <th>Acumulado</th>
                                        <th>Saldo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAccounts.map((account) => renderAccountRowsAvailable(account))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{
                            marginTop: "30px",
                            display: "flex",
                            gap: "30px",
                            padding: "0",
                            justifyContent: "space-between",
                            alignItems: "stretch",
                            borderRadius: "16px",
                            background: "transparent",
                            flexWrap: "wrap"
                        }}>
                            {/* Card de Despesas Correntes - Dark Premium */}
                            <div style={{
                                flex: "1",
                                minWidth: "300px",
                                background: "linear-gradient(145deg, #1e2a3a 0%, #121a25 100%)",
                                border: "1px solid rgba(255, 255, 255, 0.05)",
                                fontWeight: "600",
                                color: "#f8f9fa",
                                borderRadius: "16px",
                                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
                                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)",
                                cursor: "pointer",
                                position: "relative",
                                overflow: "hidden",
                                ":hover": {
                                    transform: "translateY(-8px)",
                                    boxShadow: "0 12px 40px rgba(41, 98, 255, 0.2)"
                                }
                            }}>
                                {/* Efeito de brilho sutil */}
                                <div style={{
                                    position: "absolute",
                                    top: "-50%",
                                    left: "-50%",
                                    width: "200%",
                                    height: "200%",
                                    background: "radial-gradient(circle, rgba(52, 152, 219, 0.1) 0%, transparent 70%)",
                                    opacity: "0",
                                    transition: "opacity 0.4s ease",
                                    ":hover": {
                                        opacity: "1"
                                    }
                                }}></div>

                                <div style={{
                                    fontSize: "18px",
                                    margin: "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    <div style={{
                                        width: "14px",
                                        height: "14px",
                                        background: "linear-gradient(135deg, #3498db 0%, #2c79c7 100%)",
                                        borderRadius: "4px",
                                        display: "inline-block",
                                        boxShadow: "0 0 10px rgba(52, 152, 219, 0.5)"
                                    }}></div>
                                    <strong style={{ color: "#eef2f5" }}>Total de Despesas Correntes</strong>
                                </div>

                                <div style={{
                                    fontSize: "16px",
                                    margin: "0 16px 12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    <div style={{
                                        width: "12px",
                                        height: "12px",
                                        background: "linear-gradient(135deg, #3498db 0%, #2c79c7 100%)",
                                        borderRadius: "3px",
                                        display: "inline-block",
                                        boxShadow: "0 0 8px rgba(52, 152, 219, 0.5)"
                                    }}></div>
                                    <strong style={{ color: "#eef2f5", fontSize: "15px" }}>Requisicoes emitidas</strong>
                                </div>

                                <div style={{
                                    margin: "0 16px 12px",
                                    display: "grid",
                                    gap: "12px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>

                                    {[
                                        { label: "Dotação Disponível", value: (totalCurrentExpenses * 2.5), color: "#2ecc71", icon: "↑" }, ,
                                        { label: "Até ao Mês", value: currentExpenses1.totalUntilMonth, color: "#bdc3c7", icon: "↗" },
                                        { label: "Durante o Mês", value: currentExpenses1.totalDuringMonth, color: "#e74c3c", icon: "↓" },
                                        { label: "Acumulado", value: currentExpenses1.totalAccumulated, color: "#bdc3c7", icon: "↘" },
                                        {
                                            label: "Saldo",
                                            value: (totalCurrentExpenses * 2.5) - currentExpenses1.totalAccumulated,
                                            color: ((totalCurrentExpenses * 2.5) - currentExpenses1.totalAccumulated) >= 0 ? "#2ecc71" : "#e74c3c",
                                            icon: ((totalCurrentExpenses * 2.5) - currentExpenses1.totalAccumulated) >= 0 ? "✓" : "✗",
                                            isTotal: true
                                        }].map((item, index) => (
                                            <div key={index} style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                paddingBottom: item.isTotal ? "0" : "8px",
                                                marginBottom: item.isTotal ? "0" : "4px",
                                                borderBottom: item.isTotal ? "none" : "1px solid rgba(255,255,255,0.05)"
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <span style={{
                                                        fontSize: "13px",
                                                        color: "#95a5a6",
                                                        fontWeight: "500"
                                                    }}>{item.label}</span>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <span style={{
                                                        fontSize: "13px",
                                                        color: item.color,
                                                        opacity: "0.8"
                                                    }}>{item.icon}</span>
                                                    <strong style={{
                                                        color: item.color,
                                                        fontSize: item.isTotal ? "16px" : "14px",
                                                        fontWeight: item.isTotal ? "700" : "600",
                                                        textShadow: item.isTotal ? `0 0 8px ${item.color}40` : "none"
                                                    }}>{formatNumber(item.value)}</strong>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                                <div style={{
                                    fontSize: "16px",
                                    margin: "16px 16px 12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    <div style={{
                                        width: "12px",
                                        height: "12px",
                                        background: "linear-gradient(135deg, #3498db 0%, #2c79c7 100%)",
                                        borderRadius: "3px",
                                        display: "inline-block",
                                        boxShadow: "0 0 8px rgba(52, 152, 219, 0.5)"
                                    }}></div>
                                    <strong style={{ color: "#eef2f5", fontSize: "15px" }}>Despesas pagas1</strong>
                                </div>

                                <div style={{
                                    margin: "0 16px 16px",
                                    display: "grid",
                                    gap: "12px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    {[

                                        { label: "Até ao Mês", value: currentExpenses1.totalUntilMonthPaid, color: "#bdc3c7", icon: "↗" },
                                        { label: "Durante o Mês", value: currentExpenses1.totalDuringMonthPaid, color: "#e74c3c", icon: "↓" },
                                        { label: "Acumulado", value: currentExpenses1.totalAccumulatedPaid, color: "#bdc3c7", icon: "↘" },
                                        { label: "Saldo", value: (totalCurrentExpenses * 2.5 - currentExpenses1.totalAccumulatedPaid), color: (totalCurrentExpenses * 2.5 - currentExpenses1.totalAccumulatedPaid) >= 0 ? "#2ecc71" : "#e74c3c", icon: (totalCurrentExpenses * 2.5 - currentExpenses1.totalAccumulatedPaid) >= 0 ? "✓" : "✗", isTotal: true }

                                    ].map((item, index) => (
                                        <div key={index} style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            paddingBottom: item.isTotal ? "0" : "8px",
                                            marginBottom: item.isTotal ? "0" : "4px",
                                            borderBottom: item.isTotal ? "none" : "1px solid rgba(255,255,255,0.05)"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{
                                                    fontSize: "13px",
                                                    color: "#95a5a6",
                                                    fontWeight: "500"
                                                }}>{item.label}</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{
                                                    fontSize: "13px",
                                                    color: item.color,
                                                    opacity: "0.8"
                                                }}>{item.icon}</span>
                                                <strong style={{
                                                    color: item.color,
                                                    fontSize: item.isTotal ? "16px" : "14px",
                                                    fontWeight: item.isTotal ? "700" : "600",
                                                    textShadow: item.isTotal ? `0 0 8px ${item.color}40` : "none"
                                                }}>{formatNumber(item.value)}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card de Despesas de Capital - Dark Premium */}
                            <div style={{
                                flex: "1",
                                minWidth: "300px",
                                background: "linear-gradient(145deg, #231a2a 0%, #16101e 100%)",
                                border: "1px solid rgba(255, 255, 255, 0.05)",
                                fontWeight: "600",
                                color: "#f8f9fa",
                                borderRadius: "16px",
                                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
                                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)",
                                cursor: "pointer",
                                position: "relative",
                                overflow: "hidden",
                                ":hover": {
                                    transform: "translateY(-8px)",
                                    boxShadow: "0 12px 40px rgba(155, 89, 182, 0.2)"
                                }
                            }}>
                                <div style={{
                                    position: "absolute",
                                    top: "-50%",
                                    left: "-50%",
                                    width: "200%",
                                    height: "200%",
                                    background: "radial-gradient(circle, rgba(155, 89, 182, 0.1) 0%, transparent 70%)",
                                    opacity: "0",
                                    transition: "opacity 0.4s ease",
                                    ":hover": {
                                        opacity: "1"
                                    }
                                }}></div>

                                <div style={{
                                    fontSize: "18px",
                                    margin: "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    <div style={{
                                        width: "14px",
                                        height: "14px",
                                        background: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
                                        borderRadius: "4px",
                                        display: "inline-block",
                                        boxShadow: "0 0 10px rgba(155, 89, 182, 0.5)"
                                    }}></div>
                                    <strong style={{ color: "#f3e9f7" }}>Total de Despesas de Capital</strong>
                                </div>

                                <div style={{
                                    fontSize: "16px",
                                    margin: "0 16px 12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    <div style={{
                                        width: "12px",
                                        height: "12px",
                                        background: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
                                        borderRadius: "3px",
                                        display: "inline-block",
                                        boxShadow: "0 0 8px rgba(155, 89, 182, 0.5)"
                                    }}></div>
                                    <strong style={{ color: "#f3e9f7", fontSize: "15px" }}>Requisicoes emitidas</strong>
                                </div>

                                <div style={{
                                    margin: "0 16px 12px",
                                    display: "grid",
                                    gap: "12px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    {[
                                        { label: "Dotação Disponível", value: totalCapitalExpenses * 2.5, color: "#2ecc71", icon: "↑" },
                                        { label: "Até ao Mês", value: capitalExpenses1.totalUntilMonth, color: "#bdc3c7", icon: "↗" },
                                        { label: "Durante o Mês", value: capitalExpenses1.totalDuringMonth, color: "#e74c3c", icon: "↓" },
                                        { label: "Acumulado", value: capitalExpenses1.totalAccumulated, color: "#bdc3c7", icon: "↘" },
                                        { label: "Saldo", value: capitalExpenses1.totalBalance, color: capitalExpenses1.totalBalance >= 0 ? "#2ecc71" : "#e74c3c", icon: capitalExpenses1.totalBalance >= 0 ? "✓" : "✗", isTotal: true }
                                    ].map((item, index) => (
                                        <div key={index} style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            paddingBottom: item.isTotal ? "0" : "8px",
                                            marginBottom: item.isTotal ? "0" : "4px",
                                            borderBottom: item.isTotal ? "none" : "1px solid rgba(255,255,255,0.05)"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{
                                                    fontSize: "13px",
                                                    color: "#95a5a6",
                                                    fontWeight: "500"
                                                }}>{item.label}</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{
                                                    fontSize: "13px",
                                                    color: item.color,
                                                    opacity: "0.8"
                                                }}>{item.icon}</span>
                                                <strong style={{
                                                    color: item.color,
                                                    fontSize: item.isTotal ? "16px" : "14px",
                                                    fontWeight: item.isTotal ? "700" : "600",
                                                    textShadow: item.isTotal ? `0 0 8px ${item.color}40` : "none"
                                                }}>{formatNumber(item.value)}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{
                                    fontSize: "16px",
                                    margin: "16px 16px 12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    <div style={{
                                        width: "12px",
                                        height: "12px",
                                        background: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
                                        borderRadius: "3px",
                                        display: "inline-block",
                                        boxShadow: "0 0 8px rgba(155, 89, 182, 0.5)"
                                    }}></div>
                                    <strong style={{ color: "#f3e9f7", fontSize: "15px" }}>Despesas pagas2</strong>
                                </div>

                                <div style={{
                                    margin: "0 16px 16px",
                                    display: "grid",
                                    gap: "12px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    {[
                                        { label: "Até ao Mês", value: capitalExpenses1.totalUntilMonthPaid, color: "#bdc3c7", icon: "↗" },
                                        { label: "Durante o Mês", value: capitalExpenses1.totalDuringMonthPaid, color: "#e74c3c", icon: "↓" },
                                        { label: "Acumulado", value: capitalExpenses1.totalAccumulatedPaid, color: "#bdc3c7", icon: "↘" },
                                        { label: "Saldo", value: capitalExpenses1.totalBalancePaid, color: capitalExpenses1.totalBalancePaid >= 0 ? "#2ecc71" : "#e74c3c", icon: capitalExpenses1.totalBalancePaid >= 0 ? "✓" : "✗", isTotal: true }
                                    ].map((item, index) => (
                                        <div key={index} style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            paddingBottom: item.isTotal ? "0" : "8px",
                                            marginBottom: item.isTotal ? "0" : "4px",
                                            borderBottom: item.isTotal ? "none" : "1px solid rgba(255,255,255,0.05)"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{
                                                    fontSize: "13px",
                                                    color: "#95a5a6",
                                                    fontWeight: "500"
                                                }}>{item.label}</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{
                                                    fontSize: "13px",
                                                    color: item.color,
                                                    opacity: "0.8"
                                                }}>{item.icon}</span>
                                                <strong style={{
                                                    color: item.color,
                                                    fontSize: item.isTotal ? "16px" : "14px",
                                                    fontWeight: item.isTotal ? "700" : "600",
                                                    textShadow: item.isTotal ? `0 0 8px ${item.color}40` : "none"
                                                }}>{formatNumber(item.value)}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card de Orçamento Global - Dark Premium */}
                            <div style={{
                                flex: "1",
                                minWidth: "300px",
                                background: "linear-gradient(145deg, #1a2a1e 0%, #101a12 100%)",
                                border: "1px solid rgba(255, 255, 255, 0.05)",
                                fontWeight: "600",
                                color: "#f8f9fa",
                                borderRadius: "16px",
                                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
                                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)",
                                cursor: "pointer",
                                position: "relative",
                                overflow: "hidden",
                                ":hover": {
                                    transform: "translateY(-8px)",
                                    boxShadow: "0 12px 40px rgba(46, 204, 113, 0.2)"
                                }
                            }}>
                                <div style={{
                                    position: "absolute",
                                    top: "-50%",
                                    left: "-50%",
                                    width: "200%",
                                    height: "200%",
                                    background: "radial-gradient(circle, rgba(46, 204, 113, 0.1) 0%, transparent 70%)",
                                    opacity: "0",
                                    transition: "opacity 0.4s ease",
                                    ":hover": {
                                        opacity: "1"
                                    }
                                }}></div>

                                <div style={{
                                    fontSize: "18px",
                                    margin: "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    <div style={{
                                        width: "14px",
                                        height: "14px",
                                        background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
                                        borderRadius: "4px",
                                        display: "inline-block",
                                        boxShadow: "0 0 10px rgba(46, 204, 113, 0.5)"
                                    }}></div>
                                    <strong style={{ color: "#e8f5e9" }}>Total Orçamento Global</strong>
                                </div>

                                <div style={{
                                    fontSize: "16px",
                                    margin: "0 16px 12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    <div style={{
                                        width: "12px",
                                        height: "12px",
                                        background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
                                        borderRadius: "3px",
                                        display: "inline-block",
                                        boxShadow: "0 0 8px rgba(46, 204, 113, 0.5)"
                                    }}></div>
                                    <strong style={{ color: "#e8f5e9", fontSize: "15px" }}>Requisicoes emitidas</strong>
                                </div>

                                <div style={{
                                    margin: "0 16px 12px",
                                    display: "grid",
                                    gap: "12px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    {[


                                        { label: "Dotação Disponível", value: (totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5), color: "#2ecc71", icon: "↑" },
                                        { label: "Até ao Mês", value: totalOverall1.totalUntilMonth, color: "#bdc3c7", icon: "↗" },
                                        { label: "Durante o Mês", value: totalOverall1.totalDuringMonth, color: "#e74c3c", icon: "↓" },
                                        { label: "Acumulado", value: totalOverall1.totalAccumulated, color: "#bdc3c7", icon: "↘" },
                                        {
                                            label: "Saldo",
                                            value: (totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5) - totalOverall1.totalAccumulated,
                                            color: ((totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5) - totalOverall1.totalAccumulated) >= 0 ? "#2ecc71" : "#e74c3c",
                                            icon: ((totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5) - totalOverall1.totalAccumulated) >= 0 ? "✓" : "✗",
                                            isTotal: true
                                        }].map((item, index) => (
                                            <div key={index} style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                paddingBottom: item.isTotal ? "0" : "8px",
                                                marginBottom: item.isTotal ? "0" : "4px",
                                                borderBottom: item.isTotal ? "none" : "1px solid rgba(255,255,255,0.05)"
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <span style={{
                                                        fontSize: "13px",
                                                        color: "#95a5a6",
                                                        fontWeight: "500"
                                                    }}>{item.label}</span>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <span style={{
                                                        fontSize: "13px",
                                                        color: item.color,
                                                        opacity: "0.8"
                                                    }}>{item.icon}</span>
                                                    <strong style={{
                                                        color: item.color,
                                                        fontSize: item.isTotal ? "16px" : "14px",
                                                        fontWeight: item.isTotal ? "700" : "600",
                                                        textShadow: item.isTotal ? `0 0 8px ${item.color}40` : "none"
                                                    }}>{formatNumber(item.value)}</strong>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                                <div style={{
                                    fontSize: "16px",
                                    margin: "16px 16px 12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    <div style={{
                                        width: "12px",
                                        height: "12px",
                                        background: "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)",
                                        borderRadius: "3px",
                                        display: "inline-block",
                                        boxShadow: "0 0 8px rgba(46, 204, 113, 0.5)"
                                    }}></div>
                                    <strong style={{ color: "#e8f5e9", fontSize: "15px" }}>Despesas pagas3</strong>
                                </div>

                                <div style={{
                                    margin: "0 16px 16px",
                                    display: "grid",
                                    gap: "12px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    {[
                                        { label: "Até ao Mês", value: totalOverall1.totalUntilMonthPaid, color: "#bdc3c7", icon: "↗" },
                                        { label: "Durante o Mês", value: totalOverall1.totalDuringMonthPaid, color: "#e74c3c", icon: "↓" },
                                        { label: "Acumulado", value: totalOverall1.totalAccumulatedPaid, color: "#bdc3c7", icon: "↘" },
                                        {
                                            label: "Saldo",
                                            value: (totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5) - totalOverall1.totalAccumulatedPaid,
                                            color: ((totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5) - totalOverall1.totalAccumulatedPaid) >= 0 ? "#2ecc71" : "#e74c3c",
                                            icon: ((totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5) - totalOverall1.totalAccumulatedPaid) >= 0 ? "✓" : "✗",
                                            isTotal: true
                                        }].map((item, index) => (
                                            <div key={index} style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                paddingBottom: item.isTotal ? "0" : "8px",
                                                marginBottom: item.isTotal ? "0" : "4px",
                                                borderBottom: item.isTotal ? "none" : "1px solid rgba(255,255,255,0.05)"
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <span style={{
                                                        fontSize: "13px",
                                                        color: "#95a5a6",
                                                        fontWeight: "500"
                                                    }}>{item.label}</span>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <span style={{
                                                        fontSize: "13px",
                                                        color: item.color,
                                                        opacity: "0.8"
                                                    }}>{item.icon}</span>
                                                    <strong style={{
                                                        color: item.color,
                                                        fontSize: item.isTotal ? "16px" : "14px",
                                                        fontWeight: item.isTotal ? "700" : "600",
                                                        textShadow: item.isTotal ? `0 0 8px ${item.color}40` : "none"
                                                    }}>{formatNumber(item.value)}</strong>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "Extracto de Contas - Pagamentos":
                return (
                    <div className="premium-container">
                        <div style={{
                            ...styles.container,
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '10px',
                            justifyContent: 'space-between'
                        }}>

                            {/* Seletor de Conta de Movimento */}
                            <select
                                id="accountPlanNumber"
                                name="accountPlanNumber"
                                className="form-control border-black"
                                value={formData.accountPlanNumber}
                                onChange={handleChange}
                                required
                                style={{ flex: 2, minWidth: '280px' }}
                            >
                                <option value="">Selecionar Conta de Movimento</option>
                                {accounts
                                    .filter(
                                        (account) =>
                                            account.accountPlan.type === "budject" &&
                                            account.accountPlan.writable === "moviment"
                                    )
                                    .map((account) => (
                                        <option key={account.id} value={account.accountPlan.number}>
                                            {account.accountPlan.number} - {account.accountPlan.description}
                                        </option>
                                    ))}
                            </select>

                            {/* Data de Início */}
                            <input
                                type="date"
                                className="form-control border-black"
                                name="startDate"
                                max={new Date().toISOString().split("T")[0]}
                                value={formData.startDate}
                                onChange={handleChangeData}
                                style={{ flex: 1, minWidth: '150px' }}
                            />

                            {/* Data de Fim */}
                            <input
                                type="date"
                                className="form-control border-black"
                                name="endDate"
                                max={new Date().toISOString().split("T")[0]}
                                value={formData.endDate}
                                onChange={handleChangeData}
                                style={{ flex: 1, minWidth: '150px' }}
                            />

                            {/* Botão Pesquisar com destaque se necessário */}
                            <div style={{ flexShrink: 0 }}>
                                <Button
                                    variant="success"
                                    onClick={handleSearch}
                                    style={{
                                        animation: highlightSearch ? 'blinker 1s linear infinite' : 'none'
                                    }}
                                >
                                    Pesquisar
                                </Button>
                            </div>

                            {/* Botão Limpar Filtros */}
                            <div style={{ flexShrink: 0 }}>
                                <Button variant="secondary" onClick={handleClearFilters}>
                                    Limpar
                                </Button>
                            </div>

                            {/* Botões de Exportação */}
                            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                                <button
                                    onClick={() => exportExtractToPDFData('excel')}
                                    style={{
                                        ...styles.button,
                                        backgroundColor: '#1d6f42',
                                        color: 'white',
                                        minWidth: '120px'
                                    }}
                                >
                                    <FaFileExcel style={{ marginRight: '8px' }} />
                                    Excel
                                </button>
                                <button
                                    onClick={() => exportExtractToPDFData('pdf')}
                                    style={{
                                        ...styles.button,
                                        backgroundColor: '#e74a3b',
                                        color: 'white',
                                        minWidth: '120px'
                                    }}
                                >
                                    <FaFilePdf style={{ marginRight: '8px' }} />
                                    PDF
                                </button>
                            </div>


                            {/* CSS para animação */}
                            <style>
                                {`
                                @keyframes blinker {
                                    50% { opacity: 0.5; }
                                }
                                `}
                            </style>
                        </div>

                        {/* Tabela com valores de Orçamento */}
                        <table id='tableData2' className="table table-striped table-bordered table-hover">
                            <thead>
                                <tr>
                                    <th>Orçamento Anual</th>
                                    <th>#</th>
                                    <th>Histórico de Alterações</th>
                                    <th>#</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="fw-bold">Dotação inicial</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('pt-PT', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(initialAllocation)}

                                            readOnly
                                        />
                                    </td>
                                    <td class="fw-bold">Inscrição / Reforço</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('pt-PT', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(insertAllocation)}
                                            readOnly
                                        />
                                    </td>                                </tr>
                                <tr>
                                    <td class="fw-bold">Alterações</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('pt-PT', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(Math.abs(modified))}
                                            readOnly
                                        />
                                    </td>

                                    <td class="fw-bold">Anulação / Redução</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('pt-PT', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(anullment)}
                                            readOnly
                                        />
                                    </td>                                 </tr>
                                <tr>
                                    <td class="fw-bold">Dotação final</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('pt-PT', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(finalAllocation)}
                                            readOnly
                                        />
                                    </td>
                                    <td class="fw-bold">Redistribuição/Aumento</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('pt-PT', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(redistribuitionDataReinforcement)}
                                            readOnly
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td class="fw-bold">Disponível</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('pt-PT', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(finalAllocation)}
                                            readOnly
                                        />
                                    </td>
                                    <td class="fw-bold">Redistribuição/diminuição</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('pt-PT', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }).format(redistribuitionDataAnnulment)}
                                            readOnly
                                        />
                                    </td>                              </tr>
                                <tr>

                                </tr>
                            </tbody>
                        </table>
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
                            {/* Tabela com dados de Diários */}
                            <table id='tableData3' className="table table-striped table-bordered table-hover">
                                <thead>
                                    <tr>
                                        <th>Data</th>

                                        <th>Documento</th>
                                        <th>Nº </th>
                                        <th>Descrição</th>
                                        <th>Débito</th>
                                        <th>Crédito</th>
                                        <th>Conta</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requestsFilter && requestsFilter.length > 0 ? (
                                        requestsFilter.map((item, index) => (
                                            <tr key={index}>
                                                <td className={`${item.isVoided ? "text-danger" : ""} fw-bold`}>{item.operationDate}</td>

                                                <td className={`${item.isVoided ? "text-danger" : ""} fw-bold`}>{getDocumentDescription(item.internalRequest?.document) || 'N/A'}</td>
                                                <td className={`${item.isVoided ? "text-danger" : ""} fw-bold`}>{item.internalRequest?.documentNumber || 'N/A'}</td>
                                                <td className={`${item.isVoided ? "text-danger" : ""} fw-bold`}>{item.internalRequest?.justification || 'Sem justificativa'}</td>



                                                <td className={`${item.isVoided ? "text-danger" : ""} fw-bold`}>{item.totalAmount?.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' }) || '0,00 MZN'}</td>
                                                <td className={`${item.isVoided ? "text-danger" : ""} fw-bold`}>0,00</td>

                                                <td className={`${item.isVoided ? "text-danger" : ""} fw-bold`}>
                                                    {item.accountPlanBudject
                                                        ? `${item.accountPlanBudject.number} - ${item.accountPlanBudject.description}`
                                                        : 'N/A'}
                                                </td>                                             </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: "center", fontStyle: "italic", color: "gray" }}>
                                                Dados não encontrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>
                        </div>

                        {/* Bloco Premium de Valores com Estilo Escuro e Gradiente */}
                        <div style={{
                            marginTop: "30px",
                            textAlign: "center",
                            padding: "30px",
                            borderRadius: "16px",
                            background: "linear-gradient(145deg, #1f1f1f, #2c2c2c)",
                            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.6)",
                            color: "#fff",
                            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                        }}>
                            <div style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "40px"
                            }}>
                                {/* Campo Valor Inicial */}
                                <div style={{ textAlign: "left" }}>
                                    <label style={{
                                        display: "block",
                                        fontWeight: "600",
                                        marginBottom: "10px",
                                        fontSize: "16px",
                                        color: "#ccc"
                                    }}>Saldo Existente:</label>
                                    <input
                                        type="text"
                                        value={new Intl.NumberFormat('pt-PT', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }).format(finalAllocation)}
                                        readOnly
                                        style={{
                                            backgroundColor: "#333",
                                            color: "#00ffcc",
                                            border: "none",
                                            borderRadius: "8px",
                                            padding: "10px 15px",
                                            fontSize: "16px",
                                            width: "200px",
                                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)"
                                        }}
                                    />
                                </div>

                                {/* Campo Valor Inicial */}
                                <div style={{ textAlign: "left" }}>
                                    <label style={{
                                        display: "block",
                                        fontWeight: "600",
                                        marginBottom: "10px",
                                        fontSize: "16px",
                                        color: "#ccc"
                                    }}>Valor Total da Requisicao:</label>
                                    <input
                                        type="text"
                                        value={new Intl.NumberFormat('pt-PT', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }).format(totalRequisicoes)}
                                        readOnly
                                        style={{
                                            backgroundColor: "#333",
                                            color: "#00ffcc",
                                            border: "none",
                                            borderRadius: "8px",
                                            padding: "10px 15px",
                                            fontSize: "16px",
                                            width: "200px",
                                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)"
                                        }}
                                    />
                                </div>

                                {/* Campo Valor Final */}
                                <div style={{ textAlign: "left" }}>
                                    <label style={{
                                        display: "block",
                                        fontWeight: "600",
                                        marginBottom: "10px",
                                        fontSize: "16px",
                                        color: "#ccc"
                                    }}>Saldo Final:</label>
                                    <input
                                        type="text"
                                        value={new Intl.NumberFormat('pt-PT', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }).format(finalAllocation - totalRequisicoes)}
                                        readOnly
                                        style={{
                                            backgroundColor: "#333",
                                            color: "#ffcc00",
                                            border: "none",
                                            borderRadius: "8px",
                                            padding: "10px 15px",
                                            fontSize: "16px",
                                            width: "200px",
                                            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)"
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "Mapa de Controlo Orçamental  ":
                return (
                    <div className="premium-container">
                        <div style={{
                            ...styles.container,
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '10px',
                            justifyContent: 'space-between'
                        }}>

                            {/* Seletor de Conta de Movimento */}
                            <select
                                id="accountPlanNumber"
                                name="accountPlanNumber"
                                className="form-control border-black"
                                value={formData.accountPlanNumber}
                                onChange={handleChange}
                                required
                                style={{ flex: 2, minWidth: '280px' }}
                            >
                                <option value="">Selecionar Conta de Movimento</option>
                                {accounts
                                    .filter(
                                        (account) =>
                                            account.accountPlan.type === "budject" &&
                                            account.accountPlan.writable === "moviment"
                                    )
                                    .map((account) => (
                                        <option key={account.id} value={account.accountPlan.number}>
                                            {account.accountPlan.number} - {account.accountPlan.description}
                                        </option>
                                    ))}
                            </select>

                            {/* Data de Início */}
                            <input
                                type="date"
                                className="form-control border-black"
                                name="startDate"
                                max={new Date().toISOString().split("T")[0]}
                                value={formData.startDate}
                                onChange={handleChangeData}
                                style={{ flex: 1, minWidth: '150px' }}
                            />

                            {/* Data de Fim */}
                            <input
                                type="date"
                                className="form-control border-black"
                                name="endDate"
                                max={new Date().toISOString().split("T")[0]}
                                value={formData.endDate}
                                onChange={handleChangeData}
                                style={{ flex: 1, minWidth: '150px' }}
                            />

                            {/* Botão Pesquisar com destaque se necessário */}
                            <div style={{ flexShrink: 0 }}>
                                <Button
                                    variant="success"
                                    onClick={handleSearch}
                                    style={{
                                        animation: highlightSearch ? 'blinker 1s linear infinite' : 'none'
                                    }}
                                >
                                    Pesquisar
                                </Button>
                            </div>

                            {/* Botão Limpar Filtros */}
                            <div style={{ flexShrink: 0 }}>
                                <Button variant="secondary" onClick={handleClearFilters}>
                                    Limpar
                                </Button>
                            </div>

                            {/* Botões de Exportação */}
                            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                                <button
                                    onClick={() => exportExtractToPDFData2('excel')}
                                    style={{
                                        ...styles.button,
                                        backgroundColor: '#1d6f42',
                                        color: 'white',
                                        minWidth: '120px'
                                    }}
                                >
                                    <FaFileExcel style={{ marginRight: '8px' }} />
                                    Excel
                                </button>
                                <button
                                    onClick={() => exportExtractToPDFData2('pdf')}
                                    style={{
                                        ...styles.button,
                                        backgroundColor: '#e74a3b',
                                        color: 'white',
                                        minWidth: '120px'
                                    }}
                                >
                                    <FaFilePdf style={{ marginRight: '8px' }} />
                                    PDF
                                </button>
                            </div>


                            {/* CSS para animação */}
                            <style>
                                {`
                            @keyframes blinker {
                                50% { opacity: 0.5; }
                            }
                            `}
                            </style>
                        </div>
                        {/* Tabela com valores de Orçamento */}
                        <table id='tableData2' className="table table-striped table-bordered table-hover">
                            <thead>
                                <tr>
                                    <th>Orçamento Anual</th>
                                    <th>Valor</th>
                                    <th>Histórico de Alterações</th>
                                    <th>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="fw-bold">Dotação inicial</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('pt-PT', {
                                                style: 'currency',
                                                currency: 'MZN',
                                            }).format(initialAllocation)}
                                            readOnly
                                        />
                                    </td>
                                    <td class="fw-bold">Inscrição / Reforço</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('pt-PT', {
                                                style: 'currency',
                                                currency: 'MZN',
                                            }).format(insertAllocation)}
                                            readOnly
                                        />
                                    </td>                                </tr>
                                <tr>
                                    <td class="fw-bold">Alterações</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('pt-PT', {
                                                style: 'currency',
                                                currency: 'MZN',
                                            }).format(modified)}
                                            readOnly
                                        />
                                    </td>
                                    <td class="fw-bold">Anulação / Redução</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('pt-PT', {
                                                style: 'currency',
                                                currency: 'MZN',
                                            }).format(anullment)}
                                            readOnly
                                        />
                                    </td>                                 </tr>
                                <tr>
                                    <td class="fw-bold">Dotação final</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('pt-PT', {
                                                style: 'currency',
                                                currency: 'MZN',
                                            }).format(finalAllocation)}
                                            readOnly
                                        />
                                    </td>
                                    <td class="fw-bold">Redistribuição/Aumento</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('pt-PT', {
                                                style: 'currency',
                                                currency: 'MZN',
                                            }).format(redistribuitionDataReinforcement)}
                                            readOnly
                                        />
                                    </td>

                                </tr>
                                <tr>
                                    <td class="fw-bold">Disponível</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('pt-PT', {
                                                style: 'currency',
                                                currency: 'MZN',
                                            }).format(finalAllocation)}
                                            readOnly
                                        />
                                    </td>
                                    <td class="fw-bold">Redistribuição/diminuição</td>
                                    <td>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('pt-PT', {
                                                style: 'currency',
                                                currency: 'MZN',
                                            }).format(redistribuitionDataAnnulment)}
                                            readOnly
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div style={{
                            maxHeight: "400px",
                            overflowY: "auto",
                            border: "1px solid #ddd",
                        }}>
                            <table
                                id='tableData5'
                                className="table table-striped table-bordered table-hover"
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "14px",
                                    tableLayout: "fixed", // Garante layout uniforme das colunas
                                }}
                            >
                                <colgroup>
                                    <col style={{ width: "9%" }} />
                                    <col style={{ width: "9%" }} />
                                    <col style={{ width: "13%" }} />
                                    <col style={{ width: "12%" }} />
                                    <col style={{ width: "10%" }} />
                                    <col style={{ width: "9%" }} />
                                    <col style={{ width: "9%" }} />
                                    <col style={{ width: "9%" }} />
                                    <col style={{ width: "10%" }} />
                                    <col style={{ width: "9%" }} />
                                    <col style={{ width: "9%" }} />
                                </colgroup>
                                <thead
                                    style={{
                                        backgroundColor: "#f4f4f4",
                                        textAlign: "center",
                                        paddingRight: "17px", // Compensa a rolagem
                                    }}
                                >
                                    <tr>
                                        <th colSpan={5} style={{ textAlign: "center" }}>
                                            Requisição de Fundos
                                        </th>
                                        <th colSpan={7} style={{ textAlign: "center" }}>
                                            Pagamentos
                                        </th>
                                    </tr>
                                    <tr>
                                        <th>Data</th>
                                        <th>Nº</th>
                                        <th>Fornecedor</th>
                                        <th>Valor</th>
                                        <th>Saldo</th>
                                        <th>Estado</th>
                                        <th>Nº Requisição</th>
                                        <th>Documento</th>
                                        <th>Descrição</th>
                                        <th>Valor</th>
                                        <th>Saldo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requestsFilter && requestsFilter.length > 0 ? (
                                        requestsFilter.map((request) => renderControlMap(request))
                                    ) : (
                                        <tr>
                                            <td colSpan="11" style={{ textAlign: "center", fontStyle: "italic", color: "gray" }}>
                                                {requestsFilter ? 'Nenhuma requisição encontrada.' : 'Carregando dados...'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Labels de Valor Inicial e Valor Final */}


                        <div
                            style={{
                                marginTop: "20px",
                                display: "flex",
                                gap: "20px",
                                padding: "20px",
                                backgroundColor: "#f9f9f9",
                                justifyContent: "space-between",
                                alignItems: "stretch",
                                borderRadius: "12px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            {/* Card de Requisição de Fundos com Gradiente Premium */}
                            <div
                                style={{
                                    flex: "1",
                                    padding: "25px",
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    borderRadius: "12px",
                                    color: "white",
                                    fontFamily: "'Segoe UI', sans-serif",
                                    boxShadow: "0 6px 15px rgba(102, 126, 234, 0.4)",
                                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                    border: "none",
                                    position: "relative",
                                    overflow: "hidden",
                                    minHeight: "180px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    ':hover': {
                                        transform: "translateY(-5px)",
                                        boxShadow: "0 12px 20px rgba(102, 126, 234, 0.5)"
                                    }
                                }}
                            >
                                <div style={{ position: "relative", zIndex: 2 }}>
                                    <h3 style={{
                                        marginBottom: "20px",
                                        fontSize: "1.4rem",
                                        fontWeight: 600,
                                        textShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                    }}>
                                        Requisição de Fundos
                                    </h3>
                                    <div style={{ fontSize: "1.1rem" }}>
                                        <div style={{ marginBottom: "12px" }}>
                                            Valor: <strong style={{
                                                fontSize: "1.3rem",
                                                textShadow: "0 1px 3px rgba(0,0,0,0.2)"
                                            }}>
                                                {formatCurrencyNoSuffix(totalRequisicoes)}
                                            </strong>
                                        </div>
                                        <div>
                                            Saldo: <strong style={{
                                                fontSize: "1.3rem",
                                                textShadow: "0 1px 3px rgba(0,0,0,0.2)"
                                            }}>
                                                {formatCurrencyNoSuffix(finalAllocation - totalRequisicoes)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    position: "absolute",
                                    top: "-50px",
                                    right: "-30px",
                                    width: "150px",
                                    height: "150px",
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.1)",
                                    zIndex: 1
                                }}></div>
                            </div>

                            {/* Card de Pagamentos com Gradiente Premium */}
                            <div
                                style={{
                                    flex: "1",
                                    padding: "25px",
                                    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                                    borderRadius: "12px",
                                    color: "white",
                                    fontFamily: "'Segoe UI', sans-serif",
                                    boxShadow: "0 6px 15px rgba(17, 153, 142, 0.4)",
                                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                    border: "none",
                                    position: "relative",
                                    overflow: "hidden",
                                    minHeight: "180px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div style={{ position: "relative", zIndex: 2 }}>
                                    <h3 style={{
                                        marginBottom: "20px",
                                        fontSize: "1.4rem",
                                        fontWeight: 600,
                                        textShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                    }}>
                                        Pagamentos
                                    </h3>
                                    <div style={{ fontSize: "1.1rem" }}>
                                        <div style={{ marginBottom: "12px" }}>
                                            Valor: <strong style={{
                                                fontSize: "1.3rem",
                                                textShadow: "0 1px 3px rgba(0,0,0,0.2)"
                                            }}>
                                                {formatCurrencyNoSuffix(totalPagamentos)}
                                            </strong>
                                        </div>
                                        <div>
                                            Saldo: <strong style={{
                                                fontSize: "1.3rem",
                                                textShadow: "0 1px 3px rgba(0,0,0,0.2)"
                                            }}>
                                                {formatCurrencyNoSuffix(finalAllocation - totalPagamentos)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    position: "absolute",
                                    bottom: "-70px",
                                    right: "-30px",
                                    width: "200px",
                                    height: "200px",
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.1)",
                                    zIndex: 1
                                }}></div>
                            </div>
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
                        <h3>RELATÓRIOS DE EXECUÇÃO ORÇAMENTAL</h3>
                        <p>Balancetes de Pagamentos, Requisições, Extratos de Contas e Controlo Orçamental</p>
                    </div>
                </div>
                <div className="header-action-area">
                    <select
                        value={selectedReport}
                        onChange={(e) => {
                            limparCampos();
                            setSelectedReport(e.target.value);
                        }}
                        className="sgf-header-select"
                    >
                        <option value="">-- Selecione o Relatório --</option>
                        <option value="Balancete de Execução Orçamental – Pagamentos">
                            Balancete de Execução Orçamental – Pagamentos
                        </option>
                        <option value="Balancete de Execução Orçamental – Requisições e Pagamentos">
                            Balancete de Execução Orçamental – Requisições e Pagamentos
                        </option>
                        <option value="Extracto de Contas - Pagamentos">
                            Extracto de Contas - Pagamentos
                        </option>
                        <option value="Mapa de Controlo Orçamental  ">
                            Mapa de Controlo Orçamental
                        </option>
                    </select>
                </div>
            </div>

            {/* Tabela dinâmica 100% de largura */}
            <div style={{ margin: "16px auto", width: "100%", padding: "0 4px" }}>{renderTable()}</div>
            <Spinner isLoading={loading} />
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

export default BudgetExecutionReports;
