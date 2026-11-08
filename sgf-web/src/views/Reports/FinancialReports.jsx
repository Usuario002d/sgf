import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import brasao from '../../assets/img/brasao.png';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Importando a funcionalidade de tabelas para jsPDF
import { Modal, Button } from 'react-bootstrap';
import { fetchAllAccountingJournalEntry, getRegisteredAccounts, findAccountPlanBudjectEntriesByYear, fetchGeneralFolioAccountByFilter, fetchAllAccountingJournalEntryByFilters, fetchAllBalanceteByFiltersSearch, fetchAccountRequestWhitConformance } from '../../services/accountService';
import Swal from 'sweetalert2';
import Spinner from "../../config/spinner/spinner.js";
import { saveAs } from 'file-saver';
import templatePDF from '../BudgetChange/component/templatePDF'; // Caminho correto pro seu template
import templateMultiTablePDF from '../BudgetChange/component/templateMultiTablePDF';
import logoMz from '../../assets/img/logoMz.png';
import autoTable from "jspdf-autotable";
import ExcelJS from 'exceljs';
import { DateTime } from 'luxon';


const FinancialReports = () => {
    const [selectedReport, setSelectedReport] = useState("");
    const [loading, setLoading] = useState(false);
    const [accountData, setAccountData] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [financialAccounts, setFinancialAccounts] = useState([]);
    const [showFormAndTable, setShowFormAndTable] = useState(true);
    // Renderiza o título dinamicamente com base no relatório seleccionado
    const [accountFilter, setAccountFilter] = useState([]);
    const [accountNumber, setAccountNumber] = useState('');

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const [accounts, setAccounts] = useState([]);
    const [bookBank, setBookBank] = useState([]);

    const [extractAccount, setExtractAccount] = useState('');
    const [extractAccountData, setExtractAccountData] = useState('');
    const [requests, setRequests] = useState([]);
    const [moviments, setMoviments] = useState([]);
    const [totalAmountRequests, setTotalAmountRequests] = useState([]);
    const [receb, setReceb] = useState([]);
    const [pag, setPag] = useState([]);
    const [generalFolio, setGeneralFolio] = useState([]);

    const [pagData, setPagData] = useState([]);
    const [recebData, setRecebData] = useState([]);
    const [geralData, setGeralData] = useState([]);
    const [generalFolioBook, setGeneralFolioBook] = useState([]);
    const [showWithMovement, setShowWithMovement] = useState(true);
    const [showWithoutMovement, setShowWithoutMovement] = useState(true);
    const [showOnlyMovableAccounts, setShowOnlyMovableAccounts] = useState(false);

    const [saldoAnterior, setSaldoAnterior] = useState(0);
    const [recebimentos, setRecebimentos] = useState(0);
    const [pagamentos, setPagamentos] = useState(0);
    const [saldoFinal, setSaldoFinal] = useState(0);
    const [availableBudgect, setAvailableBudgect] = useState(0);

    const [contaRecep, setContaRecep] = useState(0);
    const [contaPagamento, setContaPagamento] = useState(0);
    const [saldoInicial, setSaldoInicial] = useState(0);
    const [saldoInstituicao, setSaldoInstituicao] = useState(0);
    const [saldoBanco, setSaldoBanco] = useState(0);
    const [submitRequests, setSubmitRequests] = useState(0);
    const [totalAmountRequestsPaid, setTotalAmountRequestsPaid] = useState(0);
    const [totalAmountRequestsPaidReconciliated, setTotalAmountRequestsPaidReconciliated] = useState(0);

    const [contaRecepF, setContaRecepF] = useState(0);
    const [contaPagamentoF, setContaPagamentoF] = useState(0);
    const [saldoInicialF, setSaldoInicialF] = useState(0);
    const [saldoInstituicaoF, setSaldoInstituicaoF] = useState(0);
    const [saldoBancoF, setSaldoBancoF] = useState(0);


    const [filters, setFilters] = useState({});


    const renderTitle = () => {
        if (!selectedReport || selectedReport === "Selecione Relatório") return null;
        // return <h5 style={{ margin: "20px 0", textAlign: "center" }}>{selectedReport}</h5>;
    };

    const loadFinancialAccounts = async () => {
        try {
            setLoading(true);
            const response = await getRegisteredAccounts();
            const filteredParentAccounts = response.filter(account => account.writable === 'moviment' && account.type === 'financial');
            setFinancialAccounts(filteredParentAccounts);

            console.log("filteredParentAccounts", filteredParentAccounts);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFinancialAccounts();
        loadAllRequests()
        loadAccounts()
    }, []);

    const loadAccounts = async () => {
        try {
            setLoading(true);
            const response = await findAccountPlanBudjectEntriesByYear();
            const filteredParentAccounts = response.filter(account => account.accountPlan.type === 'financial');

            const filteredAccounts = response.filter(account =>
                account.accountPlan.type === 'financial' &&
                account.accountPlan.writable === 'moviment' // "moviment" não estava no seu exemplo, usei "controll"
            );

            setAccounts(filteredParentAccounts);
            // setParentAccounts(filteredAccounts)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadAllRequests = async () => {
        try {
            setLoading(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    const exportToPDFExtract3 = () => {
        const title = "Relatório Financeiro";
        const subtitle = "Mapa Demostrativo";

        const footerText = "Documento gerado automaticamente";
        const logoImage = logoMz; // imagem base64 ou URL
        const savedUserData = JSON.parse(localStorage.getItem("userData"));
        const generatedBy = savedUserData?.fullName || "Usuário desconhecido";
        const filename = "reconciliacao_bancaria.pdf";

        // ===== 1ª Tabela: Livro de Controlo Bancário =====
        const headers1 = [
            [
                { content: "Contas Bancárias", rowSpan: 2, styles: { halign: "center", valign: "middle", fillColor: [217, 217, 217] } },
                { content: "Livro de Controlo Bancário", colSpan: 4, styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Saldo no Fim do Mês", colSpan: 2, styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Diferença", rowSpan: 2, styles: { halign: "center", valign: "middle", fillColor: [217, 217, 217] } },
            ],
            [
                { content: "Saldo no Início do Mês", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Recebimentos Durante o Mês", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Pagamentos Durante o Mês", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Saldo no fim do Mês", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Livro de Controlo Bancário", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Extracto do Banco", styles: { halign: "center", fillColor: [217, 217, 217] } },
            ],
        ];

        const body1 = [
            [
                "Conta de Recepção em Dólares",
                formatMoney(recebData?.saldoInicial),
                formatMoney(recebData?.recebimentos),
                formatMoney(recebData?.pagamentos),
                formatMoney(recebData?.saldoFinal),
                formatMoney(geralData?.saldoInstituicao),
                formatMoney(geralData?.saldoBanco),
                formatMoney(
                    (geralData?.saldoInstituicao ?? 0) - (geralData?.saldoBanco ?? 0)
                ),
            ],
            [
                "Conta de Funcionamento",
                formatMoney(pagData?.saldoInicial),
                formatMoney(pagData?.recebimentos),
                formatMoney(pagData?.pagamentos),
                formatMoney(pagData?.saldoFinal),
                formatMoney(geralData?.saldoInstituicao),
                formatMoney(geralData?.saldoBanco),
                formatMoney(
                    (geralData?.saldoInstituicao ?? 0) - (geralData?.saldoBanco ?? 0)
                ),
            ],
            [
                "Fólio Geral",
                formatMoney(geralData?.saldoAnterior),
                formatMoney(geralData?.totalRecebimentos),
                formatMoney(geralData?.totalPagamentos),
                formatMoney(geralData?.saldoFinal),
                formatMoney(geralData?.saldoInstituicao),
                formatMoney(geralData?.saldoBanco),
                formatMoney(
                    (geralData?.saldoInstituicao ?? 0) - (geralData?.saldoBanco ?? 0)
                ),
            ],
        ];

        const columnStyles1 = {
            0: { halign: "left" },
            1: { halign: "right" },
            2: { halign: "right" },
            3: { halign: "right" },
            4: { halign: "right" },
            5: { halign: "right" },
            6: { halign: "right" },
            7: { halign: "right" },
        };

        // ===== 2ª Tabela: Pendentes no Banco =====
        const headers2 = [
            [
                { content: "Pendentes no Banco", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Total Disponível", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Total das Requisições Emitidas", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Total de Pagamentos", styles: { halign: "center", fillColor: [217, 217, 217] } },
            ],
        ];

        const body2 = [
            [
                "N/A",
                formatMoney(availableBudgect),
                formatMoney(totalAmountRequests),
                formatMoney(totalAmountRequestsPaid),
            ],
        ];

        const columnStyles2 = {
            0: { halign: "left" },
            1: { halign: "right" },
            2: { halign: "right" },
            3: { halign: "right" },
        };

        // ===== 3ª Tabela: Movimentos por Registar no Banco =====
        const headers3 = [
            [
                { content: "Designação por Conta Bancária", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Nº da Conta", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Descrição", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Valor", styles: { halign: "center", fillColor: [217, 217, 217] } },
            ],
        ];

        const body3 = [
            ["Conta Recepção", "", "", ""],
            ["Conta Funcionamento", "", "", ""],
        ];

        const columnStyles3 = {
            0: { halign: "left" },
            1: { halign: "center" },
            2: { halign: "left" },
            3: { halign: "right" },
        };

        // === GERAÇÃO DO PDF USANDO templatePDF ===
        templateMultiTablePDF({
            title,
            subtitle,
            footerText,
            logoImage,
            generatedBy,
            filename,
            // PASSANDO CADA TABELA COMO UM OBJETO DA LISTA
            tableContent: [
                {
                    head: headers1,
                    body: body1,
                    columnStyles: columnStyles1,
                },
                {
                    head: headers2,
                    body: body2,
                    columnStyles: columnStyles2,
                },
                {
                    head: headers3,
                    body: body3,
                    columnStyles: columnStyles3,
                },
            ],
        });
    };

    const exportToExcelExtract3 = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Mapa Demonstrativo");

        // 1. Título
        worksheet.mergeCells("A1:H1");
        worksheet.getCell("A1").value = "Relatório Financeiro";
        worksheet.getCell("A1").font = { size: 16, bold: true };
        worksheet.getCell("A1").alignment = { horizontal: "center" };

        worksheet.mergeCells("A2:H2");
        worksheet.getCell("A2").value = "Mapa Demostrativo";
        worksheet.getCell("A2").font = { size: 14, bold: true };
        worksheet.getCell("A2").alignment = { horizontal: "center" };

        worksheet.addRow([]);

        // ===== 1ª Tabela: Livro de Controlo Bancário =====
        worksheet.mergeCells("A4:H4");
        worksheet.getCell("A4").value = "Livro de Controlo Bancário";
        worksheet.getCell("A4").font = { bold: true };
        worksheet.getCell("A4").alignment = { horizontal: "center" };
        worksheet.getCell("A4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };

        worksheet.addRow([
            "Contas Bancárias",
            "Saldo no Início do Mês",
            "Recebimentos Durante o Mês",
            "Pagamentos Durante o Mês",
            "Saldo no fim do Mês",
            "Saldo Livro Controlo Bancário",
            "Extracto do Banco",
            "Diferença",
        ]);

        worksheet.getRow(5).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center" };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
        });

        const body1 = [
            [
                "Conta de Recepção em Dólares",
                formatMoney(recebData?.saldoInicial),
                formatMoney(recebData?.recebimentos),
                formatMoney(recebData?.pagamentos),
                formatMoney(recebData?.saldoFinal),
                formatMoney(geralData?.saldoInstituicao),
                formatMoney(geralData?.saldoBanco),
                formatMoney((geralData?.saldoInstituicao ?? 0) - (geralData?.saldoBanco ?? 0)),
            ],
            [
                "Conta de Funcionamento",
                formatMoney(pagData?.saldoInicial),
                formatMoney(pagData?.recebimentos),
                formatMoney(pagData?.pagamentos),
                formatMoney(pagData?.saldoFinal),
                formatMoney(geralData?.saldoInstituicao),
                formatMoney(geralData?.saldoBanco),
                formatMoney((geralData?.saldoInstituicao ?? 0) - (geralData?.saldoBanco ?? 0)),
            ],
            [
                "Fólio Geral",
                formatMoney(geralData?.saldoAnterior),
                formatMoney(geralData?.totalRecebimentos),
                formatMoney(geralData?.totalPagamentos),
                formatMoney(geralData?.saldoFinal),
                formatMoney(geralData?.saldoInstituicao),
                formatMoney(geralData?.saldoBanco),
                formatMoney((geralData?.saldoInstituicao ?? 0) - (geralData?.saldoBanco ?? 0)),
            ],
        ];

        body1.forEach(row => {
            worksheet.addRow(row);
        });

        worksheet.addRow([]); // espaço entre tabelas

        // ===== 2ª Tabela: Pendentes no Banco =====
        const pendentesRow = worksheet.lastRow.number + 1;

        worksheet.mergeCells(`A${pendentesRow}:D${pendentesRow}`);
        worksheet.getCell(`A${pendentesRow}`).value = "Pendentes no Banco";
        worksheet.getCell(`A${pendentesRow}`).font = { bold: true };
        worksheet.getCell(`A${pendentesRow}`).alignment = { horizontal: "center" };
        worksheet.getCell(`A${pendentesRow}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };

        worksheet.addRow([
            "Pendentes no Banco",
            "Total Disponível",
            "Total das Requisições Emitidas",
            "Total de Pagamentos",
        ]);

        worksheet.getRow(worksheet.lastRow.number).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center" };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
        });

        const body2 = [
            [
                "N/A",
                formatMoney(availableBudgect),
                formatMoney(totalAmountRequests),
                formatMoney(totalAmountRequestsPaid),
            ],
        ];

        body2.forEach(row => {
            worksheet.addRow(row);
        });

        worksheet.addRow([]); // espaço entre tabelas

        // ===== 3ª Tabela: Movimentos por Registar no Banco =====
        const movimentosRow = worksheet.lastRow.number + 1;

        worksheet.mergeCells(`A${movimentosRow}:D${movimentosRow}`);
        worksheet.getCell(`A${movimentosRow}`).value = "Movimentos por Registar no Banco";
        worksheet.getCell(`A${movimentosRow}`).font = { bold: true };
        worksheet.getCell(`A${movimentosRow}`).alignment = { horizontal: "center" };
        worksheet.getCell(`A${movimentosRow}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };

        worksheet.addRow([
            "Designação por Conta Bancária",
            "Nº da Conta",
            "Descrição",
            "Valor",
        ]);

        worksheet.getRow(worksheet.lastRow.number).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center" };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
        });

        const body3 = [
            ["Conta Recepção", "", "", ""],
            ["Conta Funcionamento", "", "", ""],
        ];

        body3.forEach(row => {
            worksheet.addRow(row);
        });

        // Estilo geral
        worksheet.columns.forEach((column, index) => {
            column.width = 22;
            if (index > 0) {
                column.alignment = { horizontal: "right" };
            } else {
                column.alignment = { horizontal: "left" };
            }
        });

        // Rodapé
        worksheet.addRow([]);
        worksheet.addRow(["Documento gerado automaticamente"]);

        // Geração do Excel
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "reconciliacao_bancaria.xlsx");
    };


    // const handleSearchBalancete = async () => {
    //     if (!accountNumber && (!startDate || !endDate)) {
    //         Swal.fire({
    //             icon: 'warning',
    //             title: 'Campos de Pesquisa Incompletos',
    //             text: 'Por favor, preencha tanto a data de início quanto a data de término para pesquisar.',
    //             confirmButtonText: 'OK',
    //         });
    //         return;
    //     }

    //     setLoading(true); // Inicia o spinner

    //     const accountPlan = financialAccounts.find(account => account.number === accountNumber);
    //     const accountPlanId = accountPlan?.id;

    //     // Monta os filtros a serem enviados para a API
    //     const filters = {
    //         startDate: startDate ? new Date(startDate).toISOString().split('T')[0] : undefined,
    //         endDate: endDate ? new Date(endDate).toISOString().split('T')[0] : undefined,
    //         accountPlanId: accountPlanId || undefined,
    //     };

    //     try {
    //         const response = await fetchAllBalanceteByFiltersSearch(filters);
    //         console.log("✅ Resultados da pesquisa:", response);
    //         setAccountData(response);

    //         console.log("filtros", filters)

    //         const allItems = response.flatMap(item => item.items || [])
    //             .filter(i => {
    //                 if (!i.date) return false; // ignora se não tem createdAt
    //                 const createdAtDate = new Date(i.date);

    //                 // se start e end existem, aplica o filtro entre eles
    //                 if (start && end) {
    //                     return createdAtDate >= start && createdAtDate <= end;
    //                 }
    //                 // se só start existe, filtra a partir dele
    //                 if (start) {
    //                     return createdAtDate >= start;
    //                 }
    //                 // se só end existe, filtra até ele
    //                 if (end) {
    //                     return createdAtDate <= end;
    //                 }
    //                 return true; // sem filtros, retorna todos
    //             });
    //             setExtractAccount(allItems);


    //         if (Array.isArray(response)) {
    //             const allItems = response.flatMap(item => item.items || []);
    //             console.log("Itens extraídos:", allItems);
    //             setGeneralFolioBook(allItems);
    //         } else {
    //             console.log("Nenhum item encontrado na resposta.");
    //             setExtractAccount([]);
    //         }
    //     } catch (error) {
    //         console.error("Erro ao buscar os dados:", error);
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Erro',
    //             text: 'Ocorreu um erro ao buscar os dados. Tente novamente.',
    //             confirmButtonText: 'OK',
    //         });
    //     } finally {
    //         setLoading(false); // Finaliza o spinner
    //     }
    // };


    const handleSearchBalancete = async () => {
        if (!accountNumber && (!startDate || !endDate)) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos de Pesquisa Incompletos',
                text: 'Por favor, preencha tanto a data de início quanto a data de término para pesquisar.',
                confirmButtonText: 'OK',
            });
            return;
        }

        setLoading(true); // Inicia o spinner

        const accountPlan = financialAccounts.find(account => account.number === accountNumber);
        const accountPlanId = accountPlan?.id;

        // Monta os filtros a serem enviados para a API
        const filters = {
            startDate: startDate ? new Date(startDate).toISOString().split('T')[0] : undefined,
            endDate: endDate ? new Date(endDate).toISOString().split('T')[0] : undefined,
            accountPlanId: accountPlanId || undefined,
        };

        try {
            const response = await fetchAllBalanceteByFiltersSearch(filters);
            console.log("✅ Resultados da pesquisa:", response);
            setAccountData(response);

            console.log("filtros", filters);

            // Corrigido: usando startDate e endDate em vez de start e end
            const allItems = response.flatMap(item => item.items || [])
                .filter(i => {
                    if (!i.date) return false;
                    const createdAtDate = new Date(i.date);
                    const start = startDate ? new Date(startDate) : null;
                    const end = endDate ? new Date(endDate) : null;

                    // se start e end existem, aplica o filtro entre eles
                    if (start && end) {
                        return createdAtDate >= start && createdAtDate <= end;
                    }
                    // se só start existe, filtra a partir dele
                    if (start) {
                        return createdAtDate >= start;
                    }
                    // se só end existe, filtra até ele
                    if (end) {
                        return createdAtDate <= end;
                    }
                    return true; // sem filtros, retorna todos
                });

            setExtractAccount(allItems);
            setExtractAccountData(allItems);

            if (Array.isArray(response)) {
                const allItems = response.flatMap(item => item.items || []);
                console.log("Itens extraídos:", allItems);
                setGeneralFolioBook(allItems);
            } else {
                console.log("Nenhum item encontrado na resposta.");
                setExtractAccount([]);
            }
        } catch (error) {
            console.error("Erro ao buscar os dados:", error);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Ocorreu um erro ao buscar os dados. Tente novamente.',
                confirmButtonText: 'OK',
            });
        } finally {
            setLoading(false); // Finaliza o spinner
        }
    };

    const organizeAccounts2 = (accounts) => {
        const accountMap = {};
        const parentAccounts = [];

        accounts.forEach(account => {
            account.children = [];
            accountMap[account.id] = account;
        });

        accounts.forEach(account => {
            if (account.parentId) {
                const parentAccount = accountMap[account.parentId];
                if (parentAccount) {
                    parentAccount.children.push(account);
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

    // Agora você pode usá-la:
    const organizedAccounts = organizeAccounts2(accounts);




    const totalValues = accountData.reduce(
        (totals, item) => {
            totals.debitoPA += item.debitoPA || 0;
            totals.creditoPA += item.creditoPA || 0;
            totals.saldoPA += item.saldoPA || 0;
            totals.debitoP += item.debitoP || 0;
            totals.creditoP += item.creditoP || 0;
            totals.saldoP += item.saldoP || 0;
            totals.debitoAC += item.debitoAC || 0;
            totals.creditoAC += item.creditoAC || 0;
            totals.saldoAC += item.saldoAC || 0;
            return totals;
        },
        {
            debitoPA: 0, creditoPA: 0, saldoPA: 0,
            debitoP: 0, creditoP: 0, saldoP: 0,
            debitoAC: 0, creditoAC: 0, saldoAC: 0,
        }
    );



    const formatMoney = (value) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const loadAndCalculateFinalAllocation = async () => {
        try {
            setLoading(true);
            // 1️⃣ Busca todas as budget entries
            const response = await findAccountPlanBudjectEntriesByYear();
            console.log("Contas recebidas:", response);
            const allBudgetAccounts = response.filter(acc => acc.accountPlan.type === 'budject');
            const totalAllocationValue = allBudgetAccounts.filter(count => count.accountPlan.finalAllocationType === 'A')
            console.log("totalAllocationValue:", totalAllocationValue);
            setAvailableBudgect(totalAllocationValue[0].finalAllocation)
        } catch (error) {
            console.error("Erro ao carregar e calcular:", error);
        } finally {
            setLoading(false);
        }
    };


    const loadAndCalculateFinalAllocationByDate = async () => {
        try {
            setLoading(true);

            // 1️⃣ Busca todas as budget entries
            const response = await findAccountPlanBudjectEntriesByYear();
            console.log("Contas recebidas:", response);

            // 2️⃣ Filtra por tipo 'budject'
            const allBudgetAccounts = response.filter(acc => acc.accountPlan.type === 'budject');

            // 3️⃣ Converte as datas para objetos Date
            const start = new Date(startDate);
            const end = new Date(endDate);

            // 4️⃣ Filtra com base na data e tipo de alocação
            const filteredByDateAndType = allBudgetAccounts.filter(count => {
                const entryDate = new Date(count.operationDate);
                return (
                    count.accountPlan.finalAllocationType === 'A' &&
                    entryDate >= start &&
                    entryDate <= end
                );
            });

            // 5️⃣ Soma o valor final da alocação
            const totalAllocation = filteredByDateAndType.reduce((sum, acc) => {
                return sum + parseFloat(acc.finalAllocation || 0);
            }, 0);

            console.log("Alocações filtradas:", filteredByDateAndType);
            console.log("Total da alocação no período:", totalAllocation);
            setAvailableBudgect(totalAllocation);
        } catch (error) {
            console.error("Erro ao filtrar e calcular por data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Função para organizar contas em árvore (hierarquia)
    const organizeAccounts = (accounts) => {
        const accountMap = {};
        const parentAccounts = [];

        accounts.forEach(account => {
            account.children = [];
            accountMap[account.id] = account;
        });

        accounts.forEach(account => {
            if (account.parentId && accountMap[account.parentId]) {
                accountMap[account.parentId].children.push(account);
            } else {
                parentAccounts.push(account);
            }
        });

        return parentAccounts;
    };

    // Função para calcular alocações de forma recursiva
    const calculateChildrenAllocationFinalAllocation = (account) => {
        let total = 0;

        if (account.children && Array.isArray(account.children)) {
            account.children.forEach(child => {
                const childAllocation = child.finalAllocation || 0;
                total += childAllocation;
                if (child.children && child.children.length > 0) {
                    total += calculateChildrenAllocationFinalAllocation(child);
                }
            });
        }
        return total;
    };

    const handleSearchExtract = () => {
        if (!accountNumber && (!startDate || !endDate)) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos de Pesquisa Incompletos',
                text: 'Por favor, preencha tanto a data de início quanto a data de término para pesquisar.',
                confirmButtonText: 'OK'
            });
            return;
        }

        let filtered = extractAccount; // Definindo filtered corretamente

        console.log("accountFilter", accountFilter);

        if (accountNumber && !startDate && !endDate) {
            console.log("Filtrando apenas por accountNumber");

            filtered = accountFilter.filter(account => {
                return account.accountPlan.number === accountNumber;
            });

        } else if (!accountNumber && startDate && endDate) {

            console.log("Filtrando por startDate e endDate");

            const start = new Date(startDate);
            const end = new Date(endDate);

            filtered = accountFilter.filter(account => {
                const accountDate = new Date(account.createdAt);
                return accountDate >= start && accountDate <= end;
            });

        } else if (accountNumber && startDate && endDate) {
            console.log("Filtrando por accountNumber, startDate e endDate");

            const start = new Date(startDate);
            const end = new Date(endDate);

            filtered = accountFilter.filter(account => {
                const accountDate = new Date(account.createdAt);

                const matchesAccountNumber = account.accountPlan.number === accountNumber;
                const matchesDateRange = accountDate >= start && accountDate <= end;

                return matchesAccountNumber && matchesDateRange;
            });
        } else if (!accountNumber && !startDate && !endDate) {
            console.log("Filtrando por accountNumber, startDate e endDate");

            const start = new Date(startDate);
            const end = new Date(endDate);

            filtered = accountFilter.filter(account => {
                return account;
            });
        }

    };


    const handleSearchGeneralFolio = async () => {
        if (!startDate || !endDate) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos de Pesquisa Incompletos',
                text: 'Por favor, preencha tanto a data de início quanto a data de término para pesquisar.',
                confirmButtonText: 'OK'
            });
            return;
        }

        setLoading(true); // Inicia o spinner

        const filters = {
            startDate: startDate,
            endDate: endDate
        };

        try {
            // Chama a API com os filtros de pesquisa
            const response = await fetchGeneralFolioAccountByFilter(filters);

            setReceb(response.recebimentos)
            setPag(response.pagamentos)
            setGeneralFolio(response)
            setGeralData(response);

            setLoading(false); // Finaliza o spinner
        } catch (error) {
            console.error("Erro ao buscar os dados:", error);
            setLoading(false); // Finaliza o spinner em caso de erro
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Ocorreu um erro ao buscar os dados. Tente novamente.',
                confirmButtonText: 'OK'
            });
        }
    };



    const handleSearchMoviments = async () => {
        if (!startDate || !endDate) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos de Pesquisa Incompletos',
                text: 'Por favor, preencha tanto a data de início quanto a data de término para pesquisar.',
                confirmButtonText: 'OK'
            });
            return;
        }

        setLoading(true); // Inicia o spinner

        const filters = {
            startDate: startDate,
            endDate: endDate
        };

        // const filters = {
        //     startDate: startDate ? new Date(startDate).toISOString().split('T')[0] : undefined,
        //     endDate: endDate ? new Date(endDate).toISOString().split('T')[0] : undefined,
        //     accountPlanId: accountPlanId || undefined,
        // };

        try {
            // Chama a API com os filtros de pesquisa
            const response = await fetchAllAccountingJournalEntryByFilters(filters);

            console.log("✅ Resultados da pesquisa:", response);

            const generalAccountFolio = response.filter(account => account.accountPlan.finalAllocationType === "General_Folio");

            const generalAccountFolioR = response.filter(account => account.accountPlan.finalAllocationType === "General_Folio" && account.accountPlan.financialType === "recebimentos" && account.operator === 'DEBIT');
            const generalAccountFolioP = response.filter(account => account.accountPlan.finalAllocationType === "General_Folio" && account.accountPlan.financialType === "pagamentos" && account.operator === 'CREDIT');


            console.log("generalAccountFolio", generalAccountFolio);
            setAccountFilter(response)
            setMoviments(generalAccountFolio)
            processMovimentsData(generalAccountFolio);
            setReceb(generalAccountFolioR)
            setPag(generalAccountFolioP)
            setGeneralFolio(generalAccountFolio)

            setLoading(false); // Finaliza o spinner
        } catch (error) {
            console.error("Erro ao buscar os dados:", error);
            setLoading(false); // Finaliza o spinner em caso de erro
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Ocorreu um erro ao buscar os dados. Tente novamente.',
                confirmButtonText: 'OK'
            });
        }
    };




    const handleClear = () => {
        setAccountNumber('');
        setStartDate('');
        setEndDate('');
        // processAccountData(extractAccount);
        setExtractAccountData([]);
        // Dispara o reload:
        setReloadTrigger(prev => prev + 1);
    };


    const exportToPDFGeneralFolio = () => {
        const title = "Relatório Financeiro";
        const subtitle = "Livro de Controlo do Folio Geral";

        const footerText = "Documento gerado automaticamente";
        const logoImage = logoMz;
        const savedUserData = JSON.parse(localStorage.getItem("userData"));
        const generatedBy = savedUserData?.fullName || "Usuário desconhecido";
        const filename = "resumo_movimentos.pdf";

        // --- Recebimentos --- direto da variável "receb"
        const recebHeaders = [
            [{ content: "Recebimentos", colSpan: 5, styles: { halign: "center", fillColor: [217, 217, 217] } }],
            ["Data", "Banco", "Documento", "Descrição", "Importância"]
        ];

        const recebBody = receb.map(movement => ([
            movement.operationDate,
            movement.accountPlan?.description || "—",
            movement.documentDescription,
            movement.description,
            parseFloat(movement.value * 2.5 || 0).toFixed(2)
        ]));

        const recebColumnStyles = {
            0: { halign: 'left' },
            1: { halign: 'left' },
            2: { halign: 'left' },
            3: { halign: 'left' },
            4: { halign: 'right' },
        };

        // --- Pagamentos --- direto da variável "pag"
        const pagHeaders = [
            [{ content: "Pagamentos", colSpan: 7, styles: { halign: "center", fillColor: [217, 217, 217] } }],
            ["Data", "Banco", "Documento", "Comprovativo Bancário", "A Favor de:", "Descrição", "Importância"]
        ];

        const pagBody = pag.map(movement => ([
            movement.operationDate,
            movement.accountPlan?.description || "—",
            movement.documentDescription,
            movement.bankReceipt || "—",
            movement.payee || "—",
            movement.description,
            parseFloat(movement.value || 0).toFixed(2)
        ]));

        const pagColumnStyles = {
            0: { halign: 'left' },
            1: { halign: 'left' },
            2: { halign: 'left' },
            3: { halign: 'left' },
            4: { halign: 'left' },
            5: { halign: 'left' },
            6: { halign: 'right' },
        };

        // --- Totais / Resumo --- direto da variável "generalFolio"
        const totaisHeaders = [
            [{ content: "Resumo Final", colSpan: 2, styles: { halign: "center", fillColor: [217, 217, 217] } }],
            ["Descrição", "Importância"]
        ];

        const totaisBody = [
            ["Saldo Anterior", (generalFolio?.saldoAnterior * 2.5 ?? 0).toLocaleString("pt-PT", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })],
            ["Recebimentos do Período", (generalFolio?.totalRecebimentos * 2.5 ?? 0).toLocaleString("pt-PT", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })],
            ["Pagamento do Período", (generalFolio?.totalPagamentos * 2.5 ?? 0).toLocaleString("pt-PT", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })],
            ["Saldo Final", (generalFolio?.saldoFinal * 2.5 ?? 0).toLocaleString("pt-PT", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })]
        ];


        const totaisColumnStyles = {
            0: { halign: 'left' },
            1: { halign: 'right' },
        };

        // --- Chamada do template para gerar o PDF
        templateMultiTablePDF({
            title,
            subtitle,
            footerText,
            logoImage,
            generatedBy,
            filename,
            tableContent: [
                {
                    head: recebHeaders,
                    body: recebBody,
                    columnStyles: recebColumnStyles
                },
                {
                    head: pagHeaders,
                    body: pagBody,
                    columnStyles: pagColumnStyles
                },
                {
                    head: totaisHeaders,
                    body: totaisBody,
                    columnStyles: totaisColumnStyles
                }
            ]
        });
    };


    const exportToExcelGeneralFolio = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Folio Geral");

        // 1. Título
        worksheet.mergeCells("A1:G1");
        worksheet.getCell("A1").value = "Relatório Financeiro";
        worksheet.getCell("A1").font = { size: 16, bold: true };
        worksheet.getCell("A1").alignment = { horizontal: "center" };

        worksheet.mergeCells("A2:G2");
        worksheet.getCell("A2").value = "Livro de Controlo do Folio Geral";
        worksheet.getCell("A2").font = { size: 14, bold: true };
        worksheet.getCell("A2").alignment = { horizontal: "center" };

        worksheet.addRow([]);

        // --- Recebimentos ---
        worksheet.mergeCells("A4:E4");
        worksheet.getCell("A4").value = "Recebimentos";
        worksheet.getCell("A4").font = { bold: true };
        worksheet.getCell("A4").alignment = { horizontal: "center" };
        worksheet.getCell("A4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };

        worksheet.addRow(["Data", "Banco", "Documento", "Descrição", "Importância"]);

        worksheet.getRow(5).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center" };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
        });

        receb.forEach(movement => {
            worksheet.addRow([
                movement.operationDate,
                movement.accountPlan?.description || "—",
                movement.documentDescription,
                movement.description,
                parseFloat(movement.value || 0).toFixed(2)
            ]);
        });

        worksheet.addRow([]); // espaço entre tabelas

        // --- Pagamentos ---
        const pagamentosStartRow = worksheet.lastRow.number + 1;

        worksheet.mergeCells(`A${pagamentosStartRow}:G${pagamentosStartRow}`);
        worksheet.getCell(`A${pagamentosStartRow}`).value = "Pagamentos";
        worksheet.getCell(`A${pagamentosStartRow}`).font = { bold: true };
        worksheet.getCell(`A${pagamentosStartRow}`).alignment = { horizontal: "center" };
        worksheet.getCell(`A${pagamentosStartRow}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };

        worksheet.addRow([
            "Data", "Banco", "Documento", "Comprovativo Bancário", "A Favor de:", "Descrição", "Importância"
        ]);

        worksheet.getRow(worksheet.lastRow.number).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center" };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
        });

        pag.forEach(movement => {
            worksheet.addRow([
                movement.operationDate,
                movement.accountPlan?.description || "—",
                movement.documentDescription,
                movement.bankReceipt || "—",
                movement.payee || "—",
                movement.description,
                parseFloat(movement.value || 0).toFixed(2)
            ]);
        });

        worksheet.addRow([]); // espaço entre tabelas

        // --- Resumo Final ---
        const resumoStartRow = worksheet.lastRow.number + 1;

        worksheet.mergeCells(`A${resumoStartRow}:B${resumoStartRow}`);
        worksheet.getCell(`A${resumoStartRow}`).value = "Resumo Final";
        worksheet.getCell(`A${resumoStartRow}`).font = { bold: true };
        worksheet.getCell(`A${resumoStartRow}`).alignment = { horizontal: "center" };
        worksheet.getCell(`A${resumoStartRow}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };

        worksheet.addRow(["Descrição", "Importância"]);

        worksheet.getRow(worksheet.lastRow.number).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center" };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
        });

        const totaisBody = [
            ["Saldo Anterior", (generalFolio?.saldoAnterior ?? 0).toLocaleString("pt-PT", { style: "currency", currency: "MZN" })],
            ["Recebimentos do Período", (generalFolio?.totalRecebimentos ?? 0).toLocaleString("pt-PT", { style: "currency", currency: "MZN" })],
            ["Pagamento do Período", (generalFolio?.totalPagamentos ?? 0).toLocaleString("pt-PT", { style: "currency", currency: "MZN" })],
            ["Saldo Final", (generalFolio?.saldoFinal ?? 0).toLocaleString("pt-PT", { style: "currency", currency: "MZN" })]
        ];

        totaisBody.forEach(row => {
            worksheet.addRow(row);
        });

        // --- Estilo geral das colunas ---
        worksheet.columns.forEach((column, index) => {
            column.width = 20;
            if (index === 4 || index === 6 || index === 1) {
                column.alignment = { horizontal: "right" };
            } else {
                column.alignment = { horizontal: "left" };
            }
        });

        // --- Rodapé ---
        worksheet.addRow([]);
        worksheet.addRow(["Documento gerado automaticamente"]);

        // --- Exporta o Excel ---
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "resumo_movimentos.xlsx");
    };



    const exportToExcelExtract = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Extrato de Contas");

        // 1. Título
        worksheet.mergeCells("A1:F1");
        worksheet.getCell("A1").value = "Relatório Financeiro";
        worksheet.getCell("A1").font = { size: 16, bold: true };
        worksheet.getCell("A1").alignment = { horizontal: "center" };

        worksheet.mergeCells("A2:F2");
        worksheet.getCell("A2").value = "Extrato de Contas";
        worksheet.getCell("A2").font = { size: 14, bold: true };
        worksheet.getCell("A2").alignment = { horizontal: "center" };

        worksheet.addRow([]);

        // 2. Cabeçalhos
        const headers = ["Data", "Documento", "Descrição", "Débito", "Crédito", "Saldo"];
        worksheet.addRow(headers);

        // Estilo dos cabeçalhos
        worksheet.getRow(4).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
        });

        // 3. Linha informativa "Saldos Anteriores"
        worksheet.mergeCells(`A5:F5`);
        worksheet.getCell("A5").value = "Saldos Anteriores (Débito, Crédito e Saldo)";
        worksheet.getCell("A5").font = { bold: true, color: { argb: "FF323232" } };
        worksheet.getCell("A5").alignment = { horizontal: "center" };

        // 4. Corpo da tabela
        const body = extractAccount.map((movement) => [
            movement.operationDate,
            "Factura",
            movement.description,
            movement.operator === "Débito" ? parseFloat(movement.value).toFixed(2) : "0.00",
            movement.operator === "Crédito" ? parseFloat(movement.value).toFixed(2) : "0.00",
            parseFloat(movement.balance).toFixed(2),
        ]);

        // 5. Adiciona corpo ao Excel
        body.forEach(rowData => {
            worksheet.addRow(rowData);
        });

        // 6. Ajustes de estilo para as colunas
        worksheet.columns.forEach((column, index) => {
            column.width = 20;
            if (index === 0 || index === 1) {
                column.alignment = { horizontal: "center" };
            } else if (index === 2) {
                column.alignment = { horizontal: "left" };
            } else {
                column.alignment = { horizontal: "right" };
            }
        });

        // 7. Rodapé
        worksheet.addRow([]);
        worksheet.addRow(["Documento gerado automaticamente"]);

        // 8. Geração e download do Excel
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "extrato_contabil.xlsx");
    };

    // const exportToPDFExtract = () => {
    //     const title = "Relatório Financeiro ";
    //     const subtitle = "Extrato de Contas"; // pode colocar um período, se quiser

    //     const headers = [
    //         ["Data", "Documento", "Descrição", "Débito", "Crédito", "Saldo"],
    //     ];

    //     // Corpo da tabela com os dados extraídos
    //     const body = extractAccount.map((movement) => [
    //         movement.operationDate,
    //         "Factura",
    //         movement.description,
    //         movement.operator === "Débito" ? parseFloat(movement.value).toFixed(2) : "0.00",
    //         movement.operator === "Crédito" ? parseFloat(movement.value).toFixed(2) : "0.00",
    //         parseFloat(movement.balance).toFixed(2),
    //     ]);

    //     // Linha informativa após o cabeçalho
    //     const saldosAnterioresRow = [
    //         {
    //             content: "Saldos Anteriores (Débito, Crédito e Saldo)", colSpan: 6, styles: {
    //                 halign: "center",
    //                 fontStyle: "bold",
    //                 textColor: [50, 50, 50],
    //                 fillColor: false, // sem fundo
    //                 lineWidth: 0, // sem bordas
    //             }
    //         },
    //     ];

    //     // Corpo final com a linha extra como primeira linha
    //     const fullBody = [saldosAnterioresRow, ...body];

    //     const columnStyles = {
    //         0: { halign: 'center' },
    //         1: { halign: 'center' },
    //         2: { halign: 'left' },
    //         3: { halign: 'right' },
    //         4: { halign: 'right' },
    //         5: { halign: 'right' },
    //     };

    //     const footerText = "Documento gerado automaticamente";
    //     const logoImage = logoMz; // imagem base64 ou URL
    //     const savedUserData = JSON.parse(localStorage.getItem("userData"));
    //     const generatedBy = savedUserData?.fullName || "Usuário desconhecido";
    //     const filename = "extrato_contabil.pdf";

    //     // Geração do PDF via templatePDF
    //     templatePDF({
    //         title,
    //         subtitle,
    //         footerText,
    //         logoImage,
    //         generatedBy,
    //         filename,
    //         tableContent: {
    //             head: headers,
    //             body: fullBody,
    //             columnStyles,
    //         },
    //     });
    // };


    const exportToPDFExtract = () => {
        if (!extractAccountData || extractAccountData.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Nenhum dado disponível",
                text: "Ajuste os filtros e tente novamente para exportar o relatório.",
                confirmButtonText: "OK",
                confirmButtonColor: "#4a6cf7"
            });
            return;
        }

        const title = "Relatório Financeiro";
        const subtitle = "Extrato de Contas";

        const headers = [
            ["Data", "Documento", "Descrição", "Débito", "Crédito", "Saldo"],
        ];

        // Agrupa movimentos por conta e calcula saldo acumulado
        const movimentosPorConta = {};
        extractAccountData.forEach(mov => {
            const conta = mov.conta.toString();
            if (!movimentosPorConta[conta]) {
                movimentosPorConta[conta] = [];
            }
            movimentosPorConta[conta].push(mov);
        });

        const body = [];

        Object.entries(movimentosPorConta).forEach(([conta, movimentos]) => {
            let saldoAcumulado = 0;

            const natureza =
                conta.startsWith('1') || conta.startsWith('3') || conta.startsWith('41') ? 'ativo' :
                    /^(42|43|44|45|46|48|49|5)/.test(conta) ? 'passivo' :
                        conta.startsWith('6') ? 'gasto' :
                            conta.startsWith('7') ? 'ganho' : 'normal';

            movimentos.forEach((movement) => {
                const isDebit = movement.operator?.toUpperCase() === "DEBIT";
                const isCredit = movement.operator?.toUpperCase() === "CREDIT";
                const valor = parseFloat(movement.value) || 0;

                const debito = isDebit ? valor * 2.5 : 0;
                const credito = isCredit ? valor * 2.5 : 0;

                const variacao = (natureza === 'passivo' || natureza === 'ganho')
                    ? credito - debito
                    : debito - credito;

                saldoAcumulado += variacao;

                const saldoSufixo = saldoAcumulado >= 0 ? 'D' : 'C';
                const saldoAbsoluto = Math.abs(saldoAcumulado) * 2.5;

                body.push([
                    DateTime.fromISO(movement.date).toFormat('dd/MM/yyyy'),
                    movement.document || "Factura",
                    movement.description || "Sem descrição",
                    formatCurrency(debito),
                    formatCurrency(credito),
                    `${formatCurrency(saldoAbsoluto)} ${saldoSufixo}`
                ]);
            });
        });

        // Totais no final
        const totalDebito = extractAccountData.reduce((sum, mov) =>
            sum + (mov.operator?.toUpperCase() === "DEBIT" ? parseFloat(mov.value) * 2.5 : 0), 0
        );
        const totalCredito = extractAccountData.reduce((sum, mov) =>
            sum + (mov.operator?.toUpperCase() === "CREDIT" ? parseFloat(mov.value) * 2.5 : 0), 0
        );
        const saldoTotal = totalDebito - totalCredito;
        const saldoSufixoTotal = saldoTotal >= 0 ? 'D' : 'C';
        const saldoAbsolutoTotal = Math.abs(saldoTotal);

        const totalRow = [
            { content: "Totais", colSpan: 3, styles: { halign: "right", fillColor: [211, 211, 211], fontStyle: "bold" } },
            { content: formatCurrency(totalDebito), styles: { halign: "right", fillColor: [211, 211, 211] } },
            { content: formatCurrency(totalCredito), styles: { halign: "right", fillColor: [211, 211, 211] } },
            {
                content: `${formatCurrency(saldoAbsolutoTotal)} ${saldoSufixoTotal}`,
                styles: {
                    halign: "right",
                    fillColor: [211, 211, 211],
                    textColor: saldoTotal < 0 ? [56, 142, 60] : saldoTotal > 0 ? [211, 47, 47] : [0, 0, 0],
                    fontStyle: "bold"
                }
            }
        ];

        const fullBody = [...body, totalRow];

        const columnStyles = {
            0: { halign: 'center' },
            1: { halign: 'center' },
            2: { halign: 'left' },
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right' },
        };

        const footerText = "Documento gerado automaticamente";
        const logoImage = logoMz; // imagem base64 ou URL
        const savedUserData = JSON.parse(localStorage.getItem("userData"));
        const generatedBy = savedUserData?.fullName || "Usuário desconhecido";
        const filename = "extrato_contabil.pdf";

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
                columnStyles,
            },
        });
    };


    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '-';
        return value.toLocaleString('pt-PT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };


    const exportToExcelBalancete = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Balancete Financeiro");

        // 1. Título
        worksheet.mergeCells("A1:K1");
        worksheet.getCell("A1").value = "Relatório Financeiro";
        worksheet.getCell("A1").font = { size: 16, bold: true };
        worksheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };

        worksheet.mergeCells("A2:K2");
        worksheet.getCell("A2").value = "Balancete Financeiro – Período Anterior, Período e Acumulado";
        worksheet.getCell("A2").font = { size: 14, bold: true };
        worksheet.getCell("A2").alignment = { horizontal: "center", vertical: "middle" };

        worksheet.addRow([]);

        // 2. Cabeçalhos (duas linhas)
        const headerRow1 = [
            "Conta",
            "Descrição",
            "Período Anterior", "", "",
            "Período", "", "",
            "Acumulado", "", ""
        ];
        const headerRow2 = [
            "", "",
            "Débito", "Crédito", "Saldo",
            "Débito", "Crédito", "Saldo",
            "Débito", "Crédito", "Saldo"
        ];

        worksheet.addRow(headerRow1);
        worksheet.addRow(headerRow2);

        // Estilo dos cabeçalhos
        worksheet.getRow(4).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
        });
        worksheet.getRow(5).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
        });

        // Mesclar células para os cabeçalhos de grupo
        worksheet.mergeCells("C4:E4");
        worksheet.mergeCells("F4:H4");
        worksheet.mergeCells("I4:K4");
        worksheet.mergeCells("A4:A5");
        worksheet.mergeCells("B4:B5");

        // 3. Dados da tabela principal
        const body = [];
        const rows = document.querySelectorAll("#balanceteFinanceiro tbody tr");

        rows.forEach(row => {
            const rowData = [];
            row.querySelectorAll("td").forEach(cell => {
                rowData.push(cell.textContent.trim());
            });
            body.push(rowData);
        });

        // 4. Adiciona dados ao Excel
        body.forEach(rowData => {
            worksheet.addRow(rowData);
        });

        // 5. Calcular totais (mesmo cálculo usado no HTML)
        const totals = calculateTotals();

        // 6. Adicionar linha de totais com colSpan
        const totalRow = worksheet.addRow([
            "Totais", "",
            formatMoney(totals.debitoPA * 2.5),
            formatMoney(totals.creditoPA * 2.5),
            formatSaldo(totals.debitoPA * 2.5, totals.creditoPA * 2.5),
            formatMoney(totals.debitoP * 2.5),
            formatMoney(totals.creditoP * 2.5),
            formatSaldo(totals.debitoP * 2.5, totals.creditoP * 2.5),
            formatMoney(totals.debitoAC * 2.5),
            formatMoney(totals.creditoAC * 2.5),
            formatSaldo(totals.debitoAC * 2.5, totals.creditoAC * 2.5)
        ]);

        // Mesclar "Totais" com a segunda coluna
        worksheet.mergeCells(`A${totalRow.number}:B${totalRow.number}`);

        // Aplicar estilo na linha de totais
        totalRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9EDF7" } }; // Azul claro
            cell.alignment = { horizontal: colNumber <= 2 ? "right" : "right", vertical: "middle" };
        });

        // 7. Ajustes de estilo
        worksheet.columns.forEach((column, index) => {
            column.width = 18;
            column.alignment = { horizontal: index < 2 ? "left" : "right" };
        });

        // 8. Rodapé
        worksheet.addRow([]);
        worksheet.addRow(["Documento gerado automaticamente"]);

        // 9. Geração e download do Excel
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "balancete_financeiro.xlsx");
    };



    const formatValue = (value) => (typeof value === 'number' ? value.toFixed(2) : '0.00');

    // const exportToPDFBalancete = () => {
    //     // 1. Título e subtítulo
    //     const title = "Relatório Financeiro";
    //     const subtitle = "Balancete Financeiro – Período Anterior, Período e Acumulado";

    //     // 2. Cabeçalhos da tabela (com dois níveis: grupos e subcolunas)
    //     const headers = [
    //         [
    //             { content: "Conta", rowSpan: 2, styles: { halign: "center", valign: "middle", fillColor: [217, 217, 217] } },
    //             { content: "Descrição", rowSpan: 2, styles: { halign: "center", valign: "middle", fillColor: [217, 217, 217] } },
    //             { content: "Período Anterior", colSpan: 3, styles: { halign: "center", fillColor: [217, 217, 217] } },
    //             { content: "Período", colSpan: 3, styles: { halign: "center", fillColor: [217, 217, 217] } },
    //             { content: "Acumulado", colSpan: 3, styles: { halign: "center", fillColor: [217, 217, 217] } },
    //         ],
    //         [
    //             { content: "Débito", styles: { halign: "center", fillColor: [217, 217, 217] } },
    //             { content: "Crédito", styles: { halign: "center", fillColor: [217, 217, 217] } },
    //             { content: "Saldo", styles: { halign: "center", fillColor: [217, 217, 217] } },
    //             { content: "Débito", styles: { halign: "center", fillColor: [217, 217, 217] } },
    //             { content: "Crédito", styles: { halign: "center", fillColor: [217, 217, 217] } },
    //             { content: "Saldo", styles: { halign: "center", fillColor: [217, 217, 217] } },
    //             { content: "Débito", styles: { halign: "center", fillColor: [217, 217, 217] } },
    //             { content: "Crédito", styles: { halign: "center", fillColor: [217, 217, 217] } },
    //             { content: "Saldo", styles: { halign: "center", fillColor: [217, 217, 217] } },
    //         ]
    //     ];

    //     // 3. Dados da tabela principal
    //     const body = [];
    //     const rows = document.querySelectorAll("#balanceteFinanceiro tbody tr");

    //     rows.forEach(row => {
    //         const rowData = [];
    //         row.querySelectorAll("td").forEach(cell => {
    //             rowData.push(cell.textContent.trim());
    //         });
    //         body.push(rowData);
    //     });

    //     // 4. Se tiver linhas de totais — você pode calcular e adicionar aqui se quiser:
    //     // const totalRow = [ ... ];
    //     const fullBody = [...body];  // Se não tiver total, só o body

    //     // 5. Dados do rodapé e metadados
    //     const footerText = "Documento gerado automaticamente";
    //     const logoImage = logoMz; // imagem base64 ou URL
    //     const savedUserData = JSON.parse(localStorage.getItem("userData"));
    //     const generatedBy = savedUserData?.fullName || "Usuário desconhecido";
    //     const filename = "balancete_financeiro.pdf";

    //     // 6. Alinhamento das colunas
    //     const columnStyles = {
    //         0: { halign: 'left' },   // Conta
    //         1: { halign: 'left' },   // Descrição
    //         2: { halign: 'right' },  // Débito PA
    //         3: { halign: 'right' },  // Crédito PA
    //         4: { halign: 'right' },  // Saldo PA
    //         5: { halign: 'right' },  // Débito P
    //         6: { halign: 'right' },  // Crédito P
    //         7: { halign: 'right' },  // Saldo P
    //         8: { halign: 'right' },  // Débito AC
    //         9: { halign: 'right' },  // Crédito AC
    //         10: { halign: 'right' }, // Saldo AC
    //     };

    //     // 7. Geração do PDF via template
    //     templatePDF({
    //         title,
    //         subtitle,
    //         footerText,
    //         logoImage,
    //         generatedBy,
    //         filename,
    //         tableContent: {
    //             head: headers,
    //             body: fullBody,
    //             columnStyles
    //         },
    //     });
    // };

    const exportToPDFBalancete = () => {
        // 1. Título e subtítulo
        const title = "Relatório Financeiro";
        const subtitle = "Balancete Financeiro – Período Anterior, Período e Acumulado";

        // 2. Cabeçalhos da tabela
        const headers = [
            [
                { content: "Conta", rowSpan: 2, styles: { halign: "center", valign: "middle", fillColor: [217, 217, 217] } },
                { content: "Descrição", rowSpan: 2, styles: { halign: "center", valign: "middle", fillColor: [217, 217, 217] } },
                { content: "Período Anterior", colSpan: 3, styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Período", colSpan: 3, styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Acumulado", colSpan: 3, styles: { halign: "center", fillColor: [217, 217, 217] } },
            ],
            [
                { content: "Débito", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Crédito", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Saldo", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Débito", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Crédito", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Saldo", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Débito", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Crédito", styles: { halign: "center", fillColor: [217, 217, 217] } },
                { content: "Saldo", styles: { halign: "center", fillColor: [217, 217, 217] } },
            ]
        ];

        // 3. Dados da tabela principal
        const body = [];
        const rows = document.querySelectorAll("#balanceteFinanceiro tbody tr");

        rows.forEach(row => {
            const rowData = [];
            row.querySelectorAll("td").forEach(cell => {
                rowData.push(cell.textContent.trim());
            });
            body.push(rowData);
        });

        // 4. Calcular totais (mesma lógica do seu tfoot)
        const totals = calculateTotals();
        const totalRow = [
            { content: "Totais", colSpan: 2, styles: { halign: "right", fillColor: [217, 237, 247], fontStyle: "bold" } },
            // Período Anterior
            { content: formatMoney(totals.debitoPA * 2.5), styles: { halign: "right", fillColor: [217, 237, 247] } },
            { content: formatMoney(totals.creditoPA * 2.5), styles: { halign: "right", fillColor: [217, 237, 247] } },
            { content: formatSaldo(totals.debitoPA * 2.5, totals.creditoPA * 2.5), styles: { halign: "right", fillColor: [217, 237, 247] } },
            // Período Atual
            { content: formatMoney(totals.debitoP * 2.5), styles: { halign: "right", fillColor: [217, 237, 247] } },
            { content: formatMoney(totals.creditoP * 2.5), styles: { halign: "right", fillColor: [217, 237, 247] } },
            { content: formatSaldo(totals.debitoP * 2.5, totals.creditoP * 2.5), styles: { halign: "right", fillColor: [217, 237, 247] } },
            // Acumulado
            { content: formatMoney(totals.debitoAC * 2.5), styles: { halign: "right", fillColor: [217, 237, 247] } },
            { content: formatMoney(totals.creditoAC * 2.5), styles: { halign: "right", fillColor: [217, 237, 247] } },
            { content: formatSaldo(totals.debitoAC * 2.5, totals.creditoAC * 2.5), styles: { halign: "right", fillColor: [217, 237, 247] } },
        ];

        // 5. Adicionar a linha de totais ao final do corpo
        const fullBody = [...body, totalRow];

        // 6. Dados do rodapé e metadados
        const footerText = "Documento gerado automaticamente";
        const logoImage = logoMz; // imagem base64 ou URL
        const savedUserData = JSON.parse(localStorage.getItem("userData"));
        const generatedBy = savedUserData?.fullName || "Usuário desconhecido";
        const filename = "balancete_financeiro.pdf";

        // 7. Alinhamento das colunas
        const columnStyles = {
            0: { halign: 'left' },   // Conta
            1: { halign: 'left' },   // Descrição
            2: { halign: 'right' },  // Débito PA
            3: { halign: 'right' },  // Crédito PA
            4: { halign: 'right' },  // Saldo PA
            5: { halign: 'right' },  // Débito P
            6: { halign: 'right' },  // Crédito P
            7: { halign: 'right' },  // Saldo P
            8: { halign: 'right' },  // Débito AC
            9: { halign: 'right' },  // Crédito AC
            10: { halign: 'right' }, // Saldo AC
        };

        // 8. Geração do PDF via template
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
                columnStyles
            },
        });
    };



    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchAllBalanceteByFiltersSearch(filters);
            console.log("Dados Por Apresnetar", data)
            setAccountData(data); // <- aqui você salva a resposta no estado
            if (Array.isArray(data)) {
                const allItems = data.flatMap(item => item.items || []);
                console.log("Itens extraídos:", allItems);
                setExtractAccount(allItems);
            } else {
                console.log("Nenhum item encontrado na resposta.");
                setExtractAccount([]);
            }
        };
        fetchData();
    }, [reloadTrigger]);

    useEffect(() => {
        const loadDiariesWithDocuments = async () => {
            try {
                setLoading(true);
                const response = await fetchAllAccountingJournalEntry();

                const generalAccountFolio = response.filter(account => account.accountPlan.finalAllocationType === "General_Folio");

                const generalAccountFolioR = response.filter(account => account.accountPlan.finalAllocationType === "General_Folio" && account.accountPlan.financialType === "recebimentos");
                const generalAccountFolioP = response.filter(account => account.accountPlan.finalAllocationType === "General_Folio" && account.accountPlan.financialType === "pagamentos");


                const bookBank = response.filter(
                    account => account.accountPlan.number.startsWith("12")
                );

                // console.log("Extracto de Contas", bookBank);


                // setBookBank(bookBank);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadDiariesWithDocuments();
    }, [reloadTrigger]); // agora escuta mudanças nesse estado

    const loadGeneralFolioAccount = async () => {
        try {
            setLoading(true);
            const response = await fetchGeneralFolioAccountByFilter(filters);
            console.log("fetchGeneralFolioAccountByFilter", response)
            setReceb(response.recebimentos)
            setPag(response.pagamentos)
            setGeneralFolio(response)

            //NOVAS REQUISICOES
            // 1. Calcula o primeiro e o último dia do mês atual
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            // Formata como "YYYY-MM-DD"
            const startDate = startOfMonth.toISOString().slice(0, 10);
            const endDate = endOfMonth.toISOString().slice(0, 10);
            console.log(`Período: ${startDate} até ${endDate}`);
            // 2. Busca todos os lançamentos e requisições
            const entriesResponse = await fetchAllAccountingJournalEntry();
            const requestsResponse = await fetchAccountRequestWhitConformance();
            // 3. Filtra por tipo de conta
            const entriesReceb = entriesResponse.filter(e => e.accountPlan.financialType === "recebimentos");
            const entriesPag = entriesResponse.filter(e => e.accountPlan.financialType === "pagamentos");
            // 4. Busca o folio geral usando o período do mês atual
            const geralFolio = await fetchGeneralFolioAccountByFilter({
                ...filters,      // outros filtros que você já usava
                startDate,
                endDate,
            });

            console.log("entriesReceb", entriesReceb);

            // 5. Processa os dados por conta para o mês atual
            const recebData = processAccountData(entriesReceb, startDate, endDate);
            const pagData = processAccountData(entriesPag, startDate, endDate);

            // Verifica e extrai accountPlan corretamente
            const getAccountPlanData = (data) => {
                if (!data) return { number: "N/A", description: "N/A" };

                // Se for um array, pega o primeiro item com accountPlan válido
                if (Array.isArray(data)) {
                    const itemWithAccountPlan = data.find(item => item?.accountPlan);
                    return itemWithAccountPlan?.accountPlan || { number: "N/A", description: "N/A" };
                }

                // Se for um objeto direto
                return data?.accountPlan || { number: "N/A", description: "N/A" };
            };

            // 6. Atualiza os estados com os resultados
            setRecebData({
                ...recebData,
                accountPlan: getAccountPlanData(entriesReceb)
            });

            setPagData({
                ...pagData,
                accountPlan: getAccountPlanData(entriesPag)
            });

            setGeralData(geralFolio);

            // Requisicoes
            const requestResponse = await fetchAccountRequestWhitConformance();
            const requestsPaidResponse = await fetchAccountRequestWhitConformance();
            const requestsPaid = requestsPaidResponse.filter(request => request.internalRequest.paidReq === 1);
            const requestsPaidReconciliation = requestsPaidResponse.filter(r => r.internalRequest.isReconciled === 0);

            console.log("Minhas Requisiações ", requestResponse);
            let total_requisicoes = 0;
            let total_requestsPaid = 0;
            let total_requestsPaid_reconciliated = 0;

            requestResponse.forEach(request => {
                total_requisicoes += parseFloat(request.totalAmount);
            });

            requestsPaid.forEach(request => {
                total_requestsPaid += parseFloat(request.totalAmount);
            });

            requestsPaidReconciliation.forEach(request => {
                total_requestsPaid_reconciliated += parseFloat(request.totalAmount);
            });

            console.log("Msdasdasd", total_requestsPaid, total_requisicoes);


            setTotalAmountRequestsPaid(total_requestsPaid)
            setTotalAmountRequests(total_requisicoes)
            setTotalAmountRequestsPaidReconciliated(total_requestsPaid_reconciliated)
            setRequests(requestResponse)

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadGeneralFolioAccount();
        loadAndCalculateFinalAllocation();
    }, [reloadTrigger]); // agora escuta mudanças nesse estado


    const handleClearDemonstrativeMap = () => {
        setStartDate('');
        setEndDate('');
        setSaldoInicial(0);
        setContaRecep(0);
        setContaPagamento(0);
        setSaldoFinal(0);
        setSaldoInstituicao(0);
        setSaldoBanco(0);
        setSubmitRequests(0);
        loadGeneralFolioAccount();
    };


    const processDemontrativeMapData = (entries, requests, startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // para incluir todo o dia final

        let saldoInicial = 0;
        let receb = 0;
        let pagam = 0;

        let extratoInstituicao = 0;
        let extratoBanco = 0;

        console.log("entradas", entries)

        entries.forEach(entry => {
            const entryDate = new Date(entry.createdAt);

            if (entryDate < start) {
                const valor = parseFloat(entry.value);
                if (entry.operator === "CREDIT") saldoInicial -= valor;
                else if (entry.operator === "DEBIT") saldoInicial += valor;
            }

            if (entryDate >= start && entryDate <= end) {
                const valor = parseFloat(entry.value);
                if (entry.operator === "DEBIT") receb += valor;
                else if (entry.operator === "CREDIT") pagam += valor;

                if (entry.institutionBalance) extratoInstituicao = parseFloat(entry.institutionBalance);
                if (entry.bankBalance) extratoBanco = parseFloat(entry.bankBalance);
            }
        });

        let total_requisicoes = 0;

        requests.forEach(request => {
            const reqDate = new Date(request.createdAt);
            if (reqDate >= start && reqDate <= end) {
                total_requisicoes += parseFloat(request.totalAmount);
            }
        });

        const saldoFinalCalculado = saldoInicial + receb - pagam;

        console.log("Kiklasjdkasdmkk",)
        setSaldoInicial(saldoInicial);
        setContaRecep(receb);
        setContaPagamento(pagam);
        setSaldoFinal(saldoFinalCalculado);
        setSaldoInstituicao(extratoInstituicao);
        setSaldoBanco(extratoBanco);
        setSubmitRequests(total_requisicoes);
    };

    // const calculateTotals = () => {
    //     const totals = {
    //         debitoPA: 0, creditoPA: 0, saldoPA: 0,
    //         debitoP: 0, creditoP: 0, saldoP: 0,
    //         debitoAC: 0, creditoAC: 0, saldoAC: 0,
    //     };

    //     accountData.forEach(data => {
    //         const accStr = data.conta.toString();
    //         let tipoConta = '';
    //         if (accStr.startsWith('1') || accStr.startsWith('3') || accStr.startsWith('41')) tipoConta = 'ativo';
    //         else if (
    //             accStr.startsWith('42') || accStr.startsWith('43') || accStr.startsWith('44') ||
    //             accStr.startsWith('45') || accStr.startsWith('46') || accStr.startsWith('48') ||
    //             accStr.startsWith('49') || accStr.startsWith('5')
    //         ) tipoConta = 'passivo';
    //         else if (accStr.startsWith('6')) tipoConta = 'gasto';
    //         else if (accStr.startsWith('7')) tipoConta = 'ganho';

    //         const calculaSaldo = (debito, credito) => {
    //             switch (tipoConta) {
    //                 case 'ativo':
    //                 case 'gasto':
    //                     return debito - credito;
    //                 case 'passivo':
    //                 case 'ganho':
    //                     return credito - debito;
    //                 default:
    //                     return debito - credito;
    //             }
    //         };

    //         totals.debitoPA += data.debitoPA || 0;
    //         totals.creditoPA += data.creditoPA || 0;
    //         totals.saldoPA += calculaSaldo(data.debitoPA || 0, data.creditoPA || 0);

    //         totals.debitoP += data.debitoP || 0;
    //         totals.creditoP += data.creditoP || 0;
    //         totals.saldoP += calculaSaldo(data.debitoP || 0, data.creditoP || 0);

    //         totals.debitoAC += data.debitoAC || 0;
    //         totals.creditoAC += data.creditoAC || 0;
    //         totals.saldoAC += calculaSaldo(data.debitoAC || 0, data.creditoAC || 0);
    //     });

    //     return totals;
    // };
    // Cálculo dos totais gerais
    const calculateTotals = () => {
        let totals = {
            debitoPA: 0,
            creditoPA: 0,
            debitoP: 0,
            creditoP: 0,
            debitoAC: 0,
            creditoAC: 0
        };

        organizedAccounts.forEach(account => {
            // Se estiver mostrando apenas contas de movimento, ignora pais não-movimento
            if (showOnlyMovableAccounts && account.accountPlan.writable !== 'moviment') return;

            const accountValues = calculateAccountWithDescendants(account);
            totals.debitoPA += accountValues.debitoPA;
            totals.creditoPA += accountValues.creditoPA;
            totals.debitoP += accountValues.debitoP;
            totals.creditoP += accountValues.creditoP;
            totals.debitoAC += accountValues.debitoAC;
            totals.creditoAC += accountValues.creditoAC;
        });

        return totals;
    };


    const hasMovementOrDescendantHasMovement = (account) => {
        // Se for conta de movimento, verifica se tem dados
        if (account.accountPlan.writable === 'moviment') {
            const matchingData = accountData.find(data => data.conta === account.accountPlan.number);
            return matchingData && Object.keys(matchingData).length > 0;
        }

        // Se não for conta de movimento, verifica descendentes
        if (account.children) {
            return account.children.some(child => hasMovementOrDescendantHasMovement(child));
        }

        return false;
    };

    const calculateAccountWithDescendants = (account) => {
        const matchingData = accountData.find(data => data.conta === account.accountPlan.number) || {};

        let result = {
            debitoPA: matchingData.debitoPA || 0,
            creditoPA: matchingData.creditoPA || 0,
            debitoP: matchingData.debitoP || 0,
            creditoP: matchingData.creditoP || 0,
            debitoAC: matchingData.debitoAC || 0,
            creditoAC: matchingData.creditoAC || 0
        };

        if (account.children && account.children.length > 0) {
            account.children.forEach(child => {
                // Se estiver mostrando apenas contas de movimento, ignora pais não-movimento
                if (showOnlyMovableAccounts && child.accountPlan.writable !== 'moviment') return;

                const childValues = calculateAccountWithDescendants(child);
                result.debitoPA += childValues.debitoPA;
                result.creditoPA += childValues.creditoPA;
                result.debitoP += childValues.debitoP;
                result.creditoP += childValues.creditoP;
                result.debitoAC += childValues.debitoAC;
                result.creditoAC += childValues.creditoAC;
            });
        }

        return result;
    };

    // Função para determinar o tipo de conta
    const getAccountType = (accountNumber) => {
        const accStr = accountNumber.toString();
        if (accStr.startsWith('1') || accStr.startsWith('3') || accStr.startsWith('41')) return 'ativo';
        if (
            accStr.startsWith('42') || accStr.startsWith('43') || accStr.startsWith('44') ||
            accStr.startsWith('45') || accStr.startsWith('46') || accStr.startsWith('48') ||
            accStr.startsWith('49') || accStr.startsWith('5')
        ) return 'passivo';
        if (accStr.startsWith('6')) return 'gasto';
        if (accStr.startsWith('7')) return 'ganho';
        return '';
    };

    // Função para calcular saldo conforme tipo de conta
    const calculateBalance = (debito, credito, accountNumber) => {
        const tipoConta = getAccountType(accountNumber);
        switch (tipoConta) {
            case 'ativo':
            case 'gasto':
                return debito - credito;
            case 'passivo':
            case 'ganho':
                return credito - debito;
            default:
                return debito - credito;
        }
    };

    // Função principal de renderização das linhas
    const renderAccountRows = (account, level = 0) => {
        const indentation = ''.repeat(level * 1);
        const isParentAccount = Array.isArray(account.children) && account.children.length > 0;
        const matchingData = accountData.find(data => data.conta === account.accountPlan.number) || {};
        const accountNumber = account.accountPlan.number;
        const isMovableAccount = account.accountPlan.writable === 'moviment';

        // Verifica se a conta ou descendentes têm movimentos
        const accountOrDescendantHasMovement = hasMovementOrDescendantHasMovement(account);
        const hasMovement = Object.keys(matchingData).length > 0;


        // Aplicar filtro de somente contas de movimento
        if (showOnlyMovableAccounts && !isMovableAccount) {
            return null;
        }



        // Aplicar filtros mantendo a hierarquia
        if (!showOnlyMovableAccounts) {
            if (showWithMovement && showWithoutMovement) {
                // Mostrar todas - não filtrar
            } else if (showWithMovement && !showWithoutMovement) {
                if (!accountOrDescendantHasMovement) return null;
            } else if (!showWithMovement && showWithoutMovement) {
                if (accountOrDescendantHasMovement) return null;
            } else {
                return null; // Ambos desmarcados
            }
        }

        // Obtém valores totais (próprios + descendentes)
        const totalValues = calculateAccountWithDescendants(account);
        const { debitoPA, creditoPA, debitoP, creditoP, debitoAC, creditoAC } = totalValues;

        // Calcula saldos
        const saldoPA = calculateBalance(debitoPA, creditoPA, accountNumber);
        const saldoP = calculateBalance(debitoP, creditoP, accountNumber);
        const saldoAC = calculateBalance(debitoAC, creditoAC, accountNumber);

        return (
            <>
                <tr
                    key={accountNumber}
                    className={`account-row ${isParentAccount ? 'table-success' : ''}`}
                    style={{
                        backgroundColor: isParentAccount ? '#f0f0f0' : '',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                        ...(Object.keys(matchingData).length === 0 && isParentAccount ? {
                            fontStyle: 'italic',
                            color: '#666'
                        } : {})
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e6f7ff'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = isParentAccount ? '#f0f0f0' : ''}
                    onClick={() => {
                        if (isParentAccount) {
                            Swal.fire({
                                icon: 'info',
                                title: 'Conta Resumida',
                                text: 'Esta é uma conta de agrupamento. Selecione uma conta detalhada para ver os movimentos.',
                                confirmButtonText: 'OK'
                            });
                        } else if (Object.keys(matchingData).length === 0) {
                            Swal.fire({
                                icon: 'info',
                                title: 'Atenção',
                                text: 'Esta conta não possui movimentos.',
                                confirmButtonText: 'OK'
                            });
                        } else {
                            handleRowClick(matchingData);
                        }
                    }}
                >
                    <td className="account-number" style={{ textAlign: 'left' }}>
                        {indentation}{accountNumber}
                        {Object.keys(matchingData).length === 0 && isParentAccount &&
                            <span style={{ fontSize: '0.8em', color: '#999' }}></span>}
                    </td>
                    <td className="account-description" style={{ textAlign: 'left' }}>
                        {indentation}{account.accountPlan.description || <span className="no-description">Sem descrição</span>}
                    </td>

                    {/* Período Anterior */}
                    <td className="numeric-cell">{formatMoney(debitoPA * 2.5)}</td>
                    <td className="numeric-cell">{formatMoney(creditoPA * 2.5)}</td>
                    <td className="numeric-cell" style={styleSaldo(saldoPA * 2.5)}>
                        {formatSaldo((debitoPA * 2.5), (creditoPA * 2.5))}
                    </td>

                    {/* Período Atual */}
                    <td className="numeric-cell">{formatMoney(debitoP * 2.5)}</td>
                    <td className="numeric-cell">{formatMoney(creditoP * 2.5)}</td>
                    <td className="numeric-cell" style={styleSaldo(saldoP * 2.5)}>
                        {formatSaldo((debitoP * 2.5), (creditoP * 2.5))}
                    </td>

                    {/* Acumulado */}
                    <td className="numeric-cell">{formatMoney(debitoAC * 2.5)}</td>
                    <td className="numeric-cell">{formatMoney(creditoAC * 2.5)}</td>
                    <td className="numeric-cell" style={styleSaldo(saldoAC * 2.5)}>
                        {formatSaldo((debitoAC * 2.5), (creditoAC * 2.5))}
                    </td>
                </tr>

                {isParentAccount &&
                    account.children.map((childAccount) =>
                        renderAccountRows(childAccount, level + 1)
                    )}
            </>
        );
    };



    const styleSaldo = (valor) => ({
        fontWeight: 'bold',
        color: valor >= 0 ? 'green' : 'red'
    });

    const formatSaldoDef = (valor) => {
        const absoluteValue = Math.abs(valor);
        if (valor === 0) return formatMoney(absoluteValue);
        const suffix = valor > 0 ? ' C' : ' D';
        return formatMoney(absoluteValue) + suffix;
    };

    const formatSaldo = (debito, credito) => {
        const saldo = debito - credito;
        const valorAbsoluto = Math.abs(saldo);
        const valorFormatado = formatMoney(valorAbsoluto); // Assumindo que formatMoney existe

        if (debito > credito) {
            return <span style={{ color: 'red', fontWeight: 'bold' }}>{valorFormatado} D</span>;
        } else if (credito > debito) {
            return <span style={{ color: 'green', fontWeight: 'bold' }}>{valorFormatado} C</span>;
        } else {
            return valorFormatado; // Saldo zerado (sem sufixo)
        }
    };


    // const renderAccountRows = (account, level = 0) => {
    //     const indentation = ''.repeat(level * 1);
    //     const isParentAccount = Array.isArray(account.children) && account.children.length > 0;

    //     // Buscar os valores correspondentes no accountData
    //     const matchingData = accountData.find(data => data.conta === account.accountPlan.number) || {};

    //     return (
    //         <>
    //             <tr
    //                 key={account.accountPlan.number}
    //                 className={isParentAccount ? 'table-success' : ''}
    //                 style={{ backgroundColor: isParentAccount ? '#f0f0f0' : '' }}
    //                 onClick={() => {
    //                     if (isParentAccount) {
    //                         Swal.fire({
    //                             icon: 'info',
    //                             title: 'Conta Resumida',
    //                             text: 'Esta é uma conta de agrupamento. Selecione uma conta detalhada para ver os movimentos.',
    //                             confirmButtonText: 'OK'
    //                         });
    //                     } else {
    //                         handleRowClick(matchingData);
    //                     }
    //                 }}
    //             >
    //                 <td className="account-number" style={{ textAlign: 'left' }}>
    //                     {indentation}{account.accountPlan.number}
    //                 </td>
    //                 <td className="account-description" style={{ textAlign: 'left' }}>
    //                     {indentation}{account.accountPlan.description || <span className="no-description">Sem descrição</span>}
    //                 </td>
    //                 <td className="numeric-cell">{formatMoney(matchingData.debitoPA || 0)}</td>
    //                 <td className="numeric-cell">{formatMoney(matchingData.creditoPA || 0)}</td>
    //                 <td className="numeric-cell">{formatMoney(matchingData.saldoPA || 0)}</td>
    //                 <td className="numeric-cell">{formatMoney(matchingData.debitoP || 0)}</td>
    //                 <td className="numeric-cell">{formatMoney(matchingData.creditoP || 0)}</td>
    //                 <td className="numeric-cell">{formatMoney(matchingData.saldoP || 0)}</td>
    //                 <td className="numeric-cell">{formatMoney(matchingData.debitoAC || 0)}</td>
    //                 <td className="numeric-cell">{formatMoney(matchingData.creditoAC || 0)}</td>
    //                 <td className="numeric-cell balance-cell">{formatMoney(matchingData.saldoAC || 0)}</td>
    //             </tr>

    //             {isParentAccount &&
    //                 account.children.map((childAccount) =>
    //                     renderAccountRows(childAccount, level + 1)
    //                 )}
    //         </>
    //     );
    // };


    // const handleSearchDemostrativeMap = async () => {
    //     try {
    //         setLoading(true);
    //         console.log("Selecioanado")
    //         // const entriesResponse = await fetchEntries(); // função para buscar os lançamentos
    //         const entriesResponse = await fetchAllAccountingJournalEntry(); // função para buscar os lançamentos
    //         const requestsResponse = await fetchAccountRequestWhitConformance();
    //         console.log("Selecioanado", entriesResponse, requestsResponse)

    //         const entriesResponseFilterReceb = entriesResponse.filter(account => account.accountPlan.financialType === "recebimentos");
    //         const entriesResponseFilterPag = entriesResponse.filter(account => account.accountPlan.financialType === "pagamentos");


    //         processDemontrativeMapData(entriesResponse, requestsResponse, startDate, endDate);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    const handleSearchDemostrativeMap = async () => {
        try {
            setLoading(true);
            console.log("Selecioanado")
            const entriesResponse = await fetchAllAccountingJournalEntry();
            const requestsResponse = await fetchAccountRequestWhitConformance();

            const entriesResponseFilterReceb = entriesResponse.filter(account => account.accountPlan.financialType === "recebimentos");
            const entriesResponseFilterPag = entriesResponse.filter(account => account.accountPlan.financialType === "pagamentos");
            const generalFolio = await fetchGeneralFolioAccountByFilter(filters);


            console.log("entriesResponseFilterReceb", entriesResponseFilterReceb, entriesResponseFilterReceb)

            // Processar dados para cada tipo de conta
            const recebData = processAccountData(entriesResponseFilterReceb, startDate, endDate);
            const pagData = processAccountData(entriesResponseFilterPag, startDate, endDate);
            const geralData = processDemontrativeMapData(entriesResponse, requestsResponse, startDate, endDate);

            handleSearchGeneralFolio();
            // Atualizar os estados com os dados processados
            setRecebData(recebData);
            setPagData(pagData);
            setGeralData(generalFolio);

            const start = new Date(startDate);
            const end = new Date(endDate);
            // Requisicoes

            // 6️⃣ Filtra requisições pelo período
            const requestsInPeriod = requestsResponse.filter(r => {
                const d = new Date(r.createdAt);
                return d >= start && d <= end;
            });

            // 7️⃣ Separa pagas e todas
            const requestsPaid = requestsInPeriod.filter(r => r.internalRequest.paidReq === 1);
            const requestsPaidReconciliation = requestsInPeriod.filter(r => r.internalRequest.isReconciled === 0);

            // 8️⃣ Soma totais
            const totalAmountRequests = requestsInPeriod.reduce((sum, r) => sum + parseFloat(r.totalAmount), 0);
            const totalAmountRequestsPaid = requestsPaid.reduce((sum, r) => sum + parseFloat(r.totalAmount), 0);
            const totalAmountRequestsPaidReconciliation = requestsPaidReconciliation.reduce((sum, r) => sum + parseFloat(r.totalAmount), 0);

            // 9️⃣ Atualiza estados de requisições
            setTotalAmountRequests(totalAmountRequests);
            setTotalAmountRequestsPaid(totalAmountRequestsPaid);
            setTotalAmountRequestsPaidReconciliated(totalAmountRequestsPaidReconciliation)

            loadAndCalculateFinalAllocationByDate();

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchBankControl = async () => {
        try {
            // ✅ Validação dos campos obrigatórios
            if (!accountNumber || !startDate || !endDate) {
                Swal.fire({
                    icon: "warning",
                    title: "Campos obrigatórios",
                    text: "Por favor, selecione uma conta e informe as datas de início e fim.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#0c5729"
                });
                return; // Para aqui se algum campo está vazio
            }

            setLoading(true);
            console.log("Buscando dados...");

            const entriesResponse = await fetchAllAccountingJournalEntry();

            // ✅ Aplica os filtros
            const filteredBookBank = entriesResponse.filter((account) => {
                // Verifica se o número da conta corresponde
                const isAccountMatch = account.accountPlan.number === accountNumber;

                // Verifica se a data está no intervalo
                const operationDate = new Date(account.operationDate.split("-").reverse().join("-")); // Converte para Date
                const isDateInRange =
                    operationDate >= new Date(startDate) &&
                    operationDate <= new Date(endDate);

                return isAccountMatch && isDateInRange;
            });

            if (filteredBookBank.length === 0) {
                Swal.fire({
                    icon: "info",
                    title: "Sem resultados",
                    text: "Nenhum movimento encontrado para os filtros aplicados.",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#0c5729"
                });
            }

            console.log("Extracto de Contas (filtrado):", filteredBookBank);

            setBookBank(filteredBookBank); // Atualiza os dados da tabela
            setGeneralFolioBook(); // Atualiza o folio geral (se necessário)

        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            Swal.fire({
                icon: "error",
                title: "Erro",
                text: "Ocorreu um erro ao buscar os dados. Tente novamente.",
                confirmButtonText: "OK",
                confirmButtonColor: "#e74c3c"
            });
        } finally {
            setLoading(false);
        }
    };



    const processAccountData = (entries, startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        let saldoInicial = 0;
        let receb = 0;
        let pagam = 0;

        entries.forEach(entry => {
            const entryDate = new Date(entry.createdAt);

            if (entryDate < start) {
                const valor = parseFloat(entry.value);
                if (entry.operator === "CREDIT") saldoInicial -= valor;
                else if (entry.operator === "DEBIT") saldoInicial += valor;
            }

            if (entryDate >= start && entryDate <= end) {
                const valor = parseFloat(entry.value);
                if (entry.operator === "DEBIT") receb += valor;
                else if (entry.operator === "CREDIT") pagam += valor;
            }
        });

        const saldoFinalCalculado = saldoInicial + receb - pagam;

        return {
            saldoInicial,
            recebimentos: receb,
            pagamentos: pagam,
            saldoFinal: saldoFinalCalculado
        };
    };




    const processDemontrativeMapDataF = (entries) => {
        const today = new Date();
        const currentMonth = today.getMonth(); // 0-11
        const currentYear = today.getFullYear();

        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        let saldoInicial = 0;
        let receb = 0;
        let pagam = 0;

        let extratoInstituicao = 0;
        let extratoBanco = 0;
        let totalDebito = 0;
        let totalCredito = 0;

        console.log("Antes das operacoes", entries)

        entries.forEach(entry => {
            const entryDate = new Date(entry.createdAt);
            const entryMonth = entryDate.getMonth();
            const entryYear = entryDate.getFullYear();

            // SALDO INICIAL até o fim do mês anterior
            if (entryYear < currentYear || (entryYear === previousYear && entryMonth <= previousMonth)) {
                console.log("SALDO INICIAL até o fim do mês anterior", entry)
                const valor = parseFloat(entry.value);

                if (entry.operator === "CREDIT") {
                    totalCredito += valor;
                    saldoInicial -= valor;
                } else if (entry.operator === "DEBIT") {
                    totalDebito += valor;
                    saldoInicial += valor;
                }

                console.log("total de Credito", totalCredito)
                console.log("total de Credito", totalDebito)

            }

            // RECEBIMENTOS e PAGAMENTOS do mês atual
            if (entryYear === currentYear && entryMonth === currentMonth) {
                if (entry.operator === "DEBIT") {
                    receb += parseFloat(entry.value);
                } else if (entry.operator === "CREDIT") {
                    pagam += parseFloat(entry.value);
                }


                console.log("pagamentos e recebimentos no mes avtual", receb, "  ", pagam)

                // Pegando os saldos do extrato da instituição e do banco
                if (entry.institutionBalance) {
                    extratoInstituicao = parseFloat(entry.institutionBalance);
                }

                if (entry.bankBalance) {
                    extratoBanco = parseFloat(entry.bankBalance);
                }
            }
        });

        const saldoFinalCalculado = saldoInicial + receb - pagam;

        // Logs para depuração
        console.log("🔍 === DEMONSTRATIVO MENSAL ===");
        console.log("Saldo Inicial:", saldoInicial.toFixed(2));
        console.log("Recebimentos Durante o Mês:", receb.toFixed(2));
        console.log("Pagamentos Durante o Mês:", pagam.toFixed(2));
        console.log("Saldo Final Calculado:", saldoFinalCalculado.toFixed(2));
        console.log("Saldo (Extrato da Instituição):", extratoInstituicao.toFixed(2));
        console.log("Saldo (Extrato do Banco):", extratoBanco.toFixed(2));
        console.log("Diferença (Final - Instituição):", (saldoFinalCalculado - extratoInstituicao).toFixed(2));

        // Atualizar estados
        setSaldoInicialF(saldoInicial);
        setContaRecepF(receb);
        setContaPagamentoF(pagam);
        // setSaldoFinalF(saldoFinalCalculado);
        setSaldoInstituicaoF(extratoInstituicao);
        setSaldoBancoF(extratoBanco);
    };

    const processMovimentsData = (entries) => {
        const today = new Date();
        const currentMonth = today.getMonth(); // Mês atual (0-11)
        const currentYear = today.getFullYear(); // Ano atual

        // Identificar o mês anterior
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1; // Se for janeiro (0), o mês anterior será dezembro (11)
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear; // Se for janeiro, o ano anterior

        // Inicializando as variáveis de saldo anterior, recebimentos e pagamentos
        let saldoAnt = 0;
        let receb = 0;
        let pagam = 0;

        // Calcular o saldo do mês anterior, recebimentos e pagamentos do mês atual
        entries.forEach(entry => {

            const entryMonth = new Date().getMonth();
            const entryYear = currentYear;

            console.log("previousMonth", previousMonth)
            console.log("entryMonth", entryMonth)
            console.log("previousYear", previousYear)
            console.log("entryYear", entryYear)


            if (previousMonth) {
                console.log("somando saldos anteriores...", previousMonth)
                if (entry.operator === "DEBIT") {
                    saldoAnt += parseFloat(entry.value);
                } else if (entry.operator === "CREDIT") {
                    saldoAnt -= parseFloat(entry.value);
                }
            }

            // Se a transação for do mês atual
            if (currentMonth) {

                // Somar débitos como recebimentos
                if (entry.operator === "DEBIT") {
                    receb += parseFloat(entry.value);
                }

                // Somar créditos como pagamentos
                else if (entry.operator === "CREDIT") {
                    pagam += parseFloat(entry.value);
                }

                console.log("somando saldos receb...", receb)
                console.log("somando saldos receb...", pagam)

            }
        });

        // Atualizar o estado com os valores calculados
        setSaldoAnterior(saldoAnt);
        setRecebimentos(receb);
        setPagamentos(pagam);
        setSaldoFinal(saldoAnt + receb - pagam);
    };







    // Filtro ao selecionar o número da conta
    const filteredAccounts = accountNumber
        ? organizedAccounts.filter(acc => acc.accountPlan.number.startsWith(accountNumber))
        : organizedAccounts;

    const handleRowClick = (account) => {
        console.log("conta selecionada", account)
        setSelectedAccount(account);
        setShowModal(true);
    };

    // Renderiza a tabela com base no relatório selecionado
    const renderTable = () => {
        switch (selectedReport) {
            case "Demonstração de Resultados":
                return (
                    {}
                );
            case "Balanço Patrimonial":
                return (
                    <div>
                        <div className="form-container" style={{ width: '90%', display: 'flex', gap: '20px', margin: '0 auto' }}>
                            <div className="column" style={{ flex: 1 }}>
                                <select className="form-select border-black" style={{ marginBottom: '10px', width: '100%' }}>
                                    <option value="">Plano de Contas</option>
                                    <option value="101">Conta Corrente</option>
                                    <option value="102">Conta Poupança</option>
                                    <option value="103">Conta de Investimento</option>
                                </select>
                            </div>
                            <div className="column" style={{ flex: 1 }}>
                                <input type="date" className="form-control border-black" style={{ marginBottom: '10px', width: '100%' }} />
                            </div>
                            <div className="column" style={{ flex: 1 }}>
                                <input type="date" className="form-control border-black" style={{ marginBottom: '10px', width: '100%' }} />
                            </div>
                        </div>

                        {/* Botões para Exportação */}
                        <div className="mb-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                            <Button variant="secondary" onClick={exportToExcelExtract}>
                                <i className="bi bi-file-earmark-excel" style={{ marginRight: '5px' }}></i>
                                Exportar para Excel
                            </Button>
                            <Button variant="primary" onClick={exportToPDFExtract}>
                                <i className="bi bi-file-earmark-pdf" style={{ marginRight: '5px' }}></i>
                                Exportar para PDF
                            </Button>
                        </div>
                        <table className="table table-striped table-bordered table-hover">
                            <thead>
                                <tr>
                                    <th style={{ width: '25%', textAlign: 'center' }}>ACTIVO</th>
                                    <th style={{ width: '25%', textAlign: 'center' }}>Ano N</th>
                                    <th style={{ width: '25%', textAlign: 'center' }}>Ano N-1</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ width: '25%', textAlign: 'center' }}>ACTIVO NÃO CORRENTE </td>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%', textAlign: 'center' }}>Activos tangíveis</td>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%', textAlign: 'center' }}>Activos intangíveis</td>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%', textAlign: 'center' }}></td>
                                    <td style={{ width: '25%' }}>0,00 </td>
                                    <td style={{ width: '25%' }}>0,00 </td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%', textAlign: 'center' }}>ACTIVOS CORRENTES</td>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%', textAlign: 'center' }}>Clientes</td>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%', textAlign: 'center' }}>Devedores</td>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%', textAlign: 'center' }}>Acréscimos e diferimentos</td>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%', textAlign: 'center' }}>Caixa e bancos</td>
                                    <td style={{ width: '25%' }}>0,00 </td>
                                    <td style={{ width: '25%' }}>0,00 </td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}>0,00</td>
                                    <td style={{ width: '25%' }}>0,00</td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%', textAlign: 'center' }}>Total do activo</td>
                                    <td style={{ width: '25%' }}>0,00 </td>
                                    <td style={{ width: '25%' }}>0,00 </td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%' }}>SITUAÇÃO LIQUIDA</td>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%' }}>Resultados</td>
                                    <td style={{ width: '25%' }}>0,00</td>
                                    <td style={{ width: '25%' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}>0,00</td>
                                    <td style={{ width: '25%' }}>0,00</td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%' }}>PASSIVO</td>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%' }}>Fornecedores</td>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%' }}>Empréstimos Obtidos</td>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%' }}>Estado</td>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%' }}>Credores</td>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%' }}>Acréscimos e diferimentos</td>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%' }}></td>
                                    <td style={{ width: '25%' }}>0,00</td>
                                    <td style={{ width: '25%' }}>0,00</td>
                                </tr>
                                <tr>
                                    <td style={{ width: '25%' }}>Total SL + Passivo</td>
                                    <td style={{ width: '25%' }}>0,00 </td>
                                    <td style={{ width: '25%' }}>0,00 </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            case "Fluxo de Caixa":
                return (
                    {}
                );
            case "Balancete Financeiro – Periodo":
                return (
                    {}
                );
            case "Balancete Financeiro – Acumulado":
                return (
                    {}
                );

            case "Balancete Financeiro – Período Anterior, Período e Acumulado":
                return (
                    <div className="luxury-container"
                        style={{
                            maxHeight: "800px",  // Altura máxima para o scroll
                            padding: "10px",
                            width: "100%", margin: "0 auto"
                        }}>
                        {/* Search Form */}
                        <div className="luxury-form-container">
                            <div className="form-row" style={{ display: 'flex', flexWrap: 'nowrap', gap: '8px', alignItems: 'center' }}>
                                <div className="form-column d-none">
                                    <select
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        className="luxury-select"
                                        style={{ minWidth: '180px' }}
                                    >
                                        <option value="">Conta Financeira</option>
                                        {financialAccounts.map((account) => (
                                            <option key={account.id} value={account.number}>
                                                {account.number} - {account.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-column" style={{ minWidth: 'fit-content', marginRight: '0' }}>
                                    <label className="luxury-checkbox-label" style={{ whiteSpace: 'nowrap' }}>
                                        <input
                                            type="checkbox"
                                            checked={showWithMovement}
                                            onChange={(e) => setShowWithMovement(e.target.checked)}
                                            className="luxury-checkbox"
                                        />
                                        <span style={{ fontWeight: 'bold', color: '#000' }}>Com movimento</span>
                                    </label>
                                </div>

                                <div className="form-column" style={{ minWidth: 'fit-content', marginRight: '0' }}>
                                    <label className="luxury-checkbox-label" style={{ whiteSpace: 'nowrap' }}>
                                        <input
                                            type="checkbox"
                                            checked={showWithoutMovement}
                                            onChange={(e) => setShowWithoutMovement(e.target.checked)}
                                            className="luxury-checkbox"
                                        />
                                        <span style={{ fontWeight: 'bold', color: '#000' }}>Sem movimento</span>
                                    </label>
                                </div>

                                <div className="form-column d-none">
                                    <label className="luxury-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={showOnlyMovableAccounts}
                                            onChange={(e) => setShowOnlyMovableAccounts(e.target.checked)}
                                            className="luxury-checkbox"
                                        />
                                        <span>Somente contas de movimento</span>
                                    </label>
                                </div>

                                <div className="form-column" style={{ minWidth: '150px' }}>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="luxury-date-input"
                                        style={{ padding: '8px 12px' }}
                                    />
                                </div>

                                <div className="form-column" style={{ minWidth: '150px' }}>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="luxury-date-input"
                                        style={{ padding: '8px 12px' }}
                                    />
                                </div>

                                <div className="form-column" style={{ minWidth: 'fit-content' }}>
                                    <button onClick={handleSearchBalancete} className="luxury-search-btn" style={{ padding: '8px 15px' }}>
                                        <i className="bi bi-search"></i> Pesquisar
                                    </button>
                                </div>

                                <div className="form-column" style={{ minWidth: 'fit-content' }}>
                                    <button onClick={handleClear} className="luxury-clear-btn" style={{ padding: '8px 15px' }}>
                                        <i className="bi bi-eraser"></i> Limpar
                                    </button>
                                </div>

                                {accountData.length > 0 && (
                                    <>
                                        <div className="form-column" style={{ minWidth: 'fit-content' }}>
                                            <button className="luxury-excel-btn" onClick={exportToExcelBalancete} style={{ padding: '8px 15px' }}>
                                                <i className="bi bi-file-earmark-excel-fill"></i> Excel
                                            </button>
                                        </div>
                                        <div className="form-column" style={{ minWidth: 'fit-content' }}>
                                            <button className="luxury-pdf-btn" onClick={exportToPDFBalancete} style={{ padding: '8px 15px' }}>
                                                <i className="bi bi-file-earmark-pdf-fill"></i> PDF
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {loading && (
                            <div className="luxury-spinner-container">
                                <div className="luxury-spinner"></div>
                                <span className="loading-text">Carregando dados...</span>
                            </div>
                        )}

                        {/* Data Display */}
                        <div>
                            {accountData.length > 0 ? (
                                <div
                                    style={{
                                        overflowY: 'auto',
                                        maxWidth: '100%',
                                        height: '520px',
                                        position: 'relative',
                                    }}
                                >
                                    <table id="balanceteFinanceiro" className="table table-striped table-bordered" style={{ minWidth: '1000px' }}>
                                        <thead>
                                            <tr
                                                style={{
                                                    position: 'sticky',
                                                    top: 0,
                                                    backgroundColor: '#ffffff',
                                                    zIndex: 5,
                                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                }}
                                            >
                                                <th rowSpan={2} className="align-middle">Conta</th>
                                                <th rowSpan={2} className="align-middle">Descrição</th>
                                                <th colSpan={3} className="text-center">Período Anterior</th>
                                                <th colSpan={3} className="text-center">Período</th>
                                                <th colSpan={3} className="text-center">Acumulado</th>
                                            </tr>
                                            <tr
                                                style={{
                                                    position: 'sticky',
                                                    top: 38, // ajuste conforme altura da linha acima
                                                    backgroundColor: '#ffffff',
                                                    zIndex: 5,
                                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                }}
                                            >
                                                <th>Débito</th>
                                                <th>Crédito</th>
                                                <th>Saldo</th>
                                                <th>Débito</th>
                                                <th>Crédito</th>
                                                <th>Saldo</th>
                                                <th>Débito</th>
                                                <th>Crédito</th>
                                                <th>Saldo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {organizedAccounts.map((account) => renderAccountRows(account))}
                                        </tbody>
                                        <tfoot>
                                            {(() => {
                                                const totals = calculateTotals();
                                                return (
                                                    <tr style={{
                                                        backgroundColor: '#d9edf7',
                                                        fontWeight: 'bold',
                                                        position: 'sticky',
                                                        bottom: 0,
                                                        zIndex: 1
                                                    }}>
                                                        <td colSpan={2} style={{ textAlign: 'right' }}>Totais</td>

                                                        {/* Período Anterior */}
                                                        <td className="numeric-cell">{formatMoney(totals.debitoPA * 2.5)}</td>
                                                        <td className="numeric-cell">{formatMoney(totals.creditoPA * 2.5)}</td>
                                                        <td className="numeric-cell" >
                                                            {formatSaldo(((totals.debitoPA) * 2.5), ((totals.creditoPA) * 2.5))}
                                                        </td>

                                                        {/* Período Atual */}
                                                        <td className="numeric-cell">{formatMoney(totals.debitoP * 2.5)}</td>
                                                        <td className="numeric-cell">{formatMoney(totals.creditoP * 2.5)}</td>
                                                        <td className="numeric-cell" >
                                                            {formatSaldo(((totals.debitoP) * 2.5), ((totals.creditoP) * 2.5))}
                                                        </td>

                                                        {/* Acumulado */}
                                                        <td className="numeric-cell">{formatMoney(totals.debitoAC * 2.5)}</td>
                                                        <td className="numeric-cell">{formatMoney(totals.creditoAC * 2.5)}</td>
                                                        <td className="numeric-cell">
                                                            {formatSaldo((totals.debitoAC * 2.5), (totals.creditoAC * 2.5))}
                                                        </td>
                                                    </tr>
                                                );
                                            })()}
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="luxury-no-data">
                                    <i className="bi bi-database-exclamation"></i>
                                    <h3>Nenhum dado disponível</h3>
                                    <p>Por favor, selecione os critérios de pesquisa e clique em "Pesquisar"</p>
                                </div>
                            )}
                        </div>


                        {/* Account Details Modal */}
                        {showModal && selectedAccount && (
                            <div className="luxury-modal-overlay">
                                <div className="luxury-modal-container">
                                    <div className="luxury-modal-header">
                                        <h3>
                                            <i className="bi bi-journal-text"></i> Detalhes da Conta {selectedAccount.conta} - {selectedAccount.description}
                                        </h3>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="luxury-modal-close"
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </div>
                                    <div className="luxury-modal-body">
                                        <div >
                                            <table className="table table-striped table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        <th colSpan={8}>
                                                            Extrato de Conta {selectedAccount.conta} ({selectedAccount.descricao}) (30-06-2025)
                                                        </th>
                                                    </tr>
                                                    <tr style={{ backgroundColor: '#e0e0e0' }}>
                                                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Data</th>
                                                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Documento</th>
                                                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Descrição</th>
                                                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Débito</th>
                                                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Crédito</th>
                                                        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Saldo</th>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan={6} className="previous-balance" style={{ padding: '8px', border: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
                                                            <strong>{selectedAccount.conta} - {selectedAccount.descricao}</strong> Saldos anteriores (Débito, Crédito e Saldo): {formatMoney(0)}, {formatMoney(0)}, {formatMoney(0)}
                                                        </td>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {selectedAccount.items && selectedAccount.items.length > 0 ? (() => {
                                                        const accStr = selectedAccount.conta.toString();
                                                        let tipoConta = '';

                                                        if (accStr.startsWith('1') || accStr.startsWith('3') || accStr.startsWith('41')) tipoConta = 'ativo';
                                                        else if (
                                                            accStr.startsWith('42') || accStr.startsWith('43') || accStr.startsWith('44') ||
                                                            accStr.startsWith('45') || accStr.startsWith('46') || accStr.startsWith('48') ||
                                                            accStr.startsWith('49') || accStr.startsWith('5')
                                                        ) tipoConta = 'passivo';
                                                        else if (accStr.startsWith('6')) tipoConta = 'gasto';
                                                        else if (accStr.startsWith('7')) tipoConta = 'ganho';

                                                        let saldoAcumulado = 0;

                                                        const filteredItems = selectedAccount.items.filter(movement => {
                                                            const movementDate = new Date(movement.date).toISOString().split('T')[0];
                                                            if (startDate && movementDate < startDate) return false;
                                                            if (endDate && movementDate > endDate) return false;
                                                            return true;
                                                        });

                                                        return filteredItems.length > 0 ? filteredItems.map((movement, index) => {
                                                            const isDebit = movement.operator === "DEBIT";
                                                            const isCredit = movement.operator === "CREDIT";
                                                            const value = parseFloat((movement.value) || 0);
                                                            const debito = isDebit ? value : 0;
                                                            const credito = isCredit ? value : 0;

                                                            switch (tipoConta) {
                                                                case 'ativo':
                                                                case 'gasto':
                                                                    saldoAcumulado += debito - credito;
                                                                    break;
                                                                case 'passivo':
                                                                case 'ganho':
                                                                    saldoAcumulado += credito - debito;
                                                                    break;
                                                                default:
                                                                    saldoAcumulado += debito - credito;
                                                                    break;
                                                            }

                                                            const saldoSufixo = saldoAcumulado >= 0 ? 'D' : 'C';
                                                            const saldoAbsoluto = Math.abs(saldoAcumulado);

                                                            return (
                                                                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                                                        {DateTime.fromISO(movement.date).toFormat('yyyy-MM-dd')}
                                                                    </td>
                                                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                                                        20.{String(index + 1).padStart(3, '0')} {movement.documentDescription || "Factura"}
                                                                    </td>
                                                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                                                        {movement.description || "Sem descrição"}
                                                                    </td>
                                                                    <td style={{
                                                                        padding: '8px',
                                                                        border: '1px solid #ddd',
                                                                        fontWeight: isDebit ? 'bold' : 'normal',
                                                                        color: isDebit ? '#d32f2f' : 'inherit',
                                                                        textAlign: 'right'
                                                                    }}>
                                                                        {isDebit ? formatMoney(value * 2.5) : '0,00'}
                                                                    </td>
                                                                    <td style={{
                                                                        padding: '8px',
                                                                        border: '1px solid #ddd',
                                                                        fontWeight: isCredit ? 'bold' : 'normal',
                                                                        color: isCredit ? '#388e3c' : 'inherit',
                                                                        textAlign: 'right'
                                                                    }}>
                                                                        {isCredit ? formatMoney(value * 2.5) : '0,00'}
                                                                    </td>
                                                                    <td style={{
                                                                        padding: '8px',
                                                                        border: '1px solid #ddd',
                                                                        fontWeight: 'bold',
                                                                        color: saldoAcumulado < 0 ? '#388e3c' : '#d32f2f',
                                                                        textAlign: 'right'
                                                                    }}>
                                                                        {formatMoney(saldoAbsoluto * 2.5)} {saldoSufixo}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }) : (
                                                            <tr>
                                                                <td colSpan={6} className="no-movements" style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
                                                                    Nenhum movimento encontrado para o período selecionado
                                                                </td>
                                                            </tr>
                                                        );
                                                    })() : (
                                                        <tr>
                                                            <td colSpan={6} className="no-movements" style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>
                                                                Nenhum movimento encontrado para esta conta
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>


                                                <tfoot>
                                                    <tr style={{ height: '20px', backgroundColor: '#ffffff' }}>
                                                        <td colSpan={6} style={{ border: 'none' }}></td>
                                                    </tr>

                                                    {/* Determinar o tipo de conta como no body */}
                                                    {(() => {
                                                        const accStr = selectedAccount.conta.toString();
                                                        let tipoConta = '';

                                                        if (accStr.startsWith('1') || accStr.startsWith('3') || accStr.startsWith('41')) tipoConta = 'ativo';
                                                        else if (
                                                            accStr.startsWith('42') || accStr.startsWith('43') || accStr.startsWith('44') ||
                                                            accStr.startsWith('45') || accStr.startsWith('46') || accStr.startsWith('48') ||
                                                            accStr.startsWith('49') || accStr.startsWith('5')
                                                        ) tipoConta = 'passivo';
                                                        else if (accStr.startsWith('6')) tipoConta = 'gasto';
                                                        else if (accStr.startsWith('7')) tipoConta = 'ganho';

                                                        // Calcular saldo considerando a natureza da conta
                                                        const calcularSaldo = (debito, credito) => {
                                                            switch (tipoConta) {
                                                                case 'ativo':
                                                                case 'gasto':
                                                                    return debito - credito;
                                                                case 'passivo':
                                                                case 'ganho':
                                                                    return credito - debito;
                                                                default:
                                                                    return debito - credito;
                                                            }
                                                        };

                                                        const saldoP = calcularSaldo(selectedAccount.debitoP * 2.5, selectedAccount.creditoP * 2.5);
                                                        const saldoPA = calcularSaldo(selectedAccount.debitoPA * 2.5, selectedAccount.creditoPA * 2.5);
                                                        const saldoAC = calcularSaldo(selectedAccount.debitoAC * 2.5, selectedAccount.creditoAC * 2.5);

                                                        return (
                                                            <>
                                                                {/* Total do Período */}
                                                                <tr style={{ borderTop: '2px solid black' }}>
                                                                    <td colSpan={2} style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                                                                        {selectedAccount.descricao}
                                                                    </td>
                                                                    <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Total Período:</td>
                                                                    <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(selectedAccount.debitoP * 2.5)}</td>
                                                                    <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(selectedAccount.creditoP * 2.5)}</td>
                                                                    <td style={{
                                                                        padding: '8px',
                                                                        border: '1px solid #ddd',
                                                                        textAlign: 'right',
                                                                        fontWeight: 'bold',
                                                                        color: saldoP < 0 ? '#d32f2f' : '#388e3c'
                                                                    }}>
                                                                        {formatSaldo(selectedAccount.debitoP * 2.5, selectedAccount.creditoP * 2.5)}
                                                                    </td>
                                                                </tr>

                                                                {/* Total Acumulado */}
                                                                <tr style={{ borderTop: '1px solid black' }}>
                                                                    <td colSpan={2}></td>
                                                                    <td style={{ padding: '8px', fontWeight: 'bold' }}>Total Acumulado:</td>
                                                                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(selectedAccount.debitoAC * 2.5)}</td>
                                                                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(selectedAccount.creditoAC * 2.5)}</td>
                                                                    <td style={{
                                                                        padding: '8px',
                                                                        textAlign: 'right',
                                                                        fontWeight: 'bold',
                                                                        color: saldoAC < 0 ? '#d32f2f' : '#388e3c'
                                                                    }}>
                                                                        {formatSaldo(selectedAccount.debitoAC * 2.5, selectedAccount.creditoAC * 2.5)}
                                                                    </td>
                                                                </tr>

                                                                {/* Total Geral Período */}
                                                                <tr style={{ borderTop: '1px solid black', backgroundColor: '#f0f0f0' }}>
                                                                    <td colSpan={3} style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Total Geral Período</td>
                                                                    <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', color: '#d32f2f', textAlign: 'right' }}>{formatMoney(selectedAccount.debitoP * 2.5)}</td>
                                                                    <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', color: '#388e3c', textAlign: 'right' }}>{formatMoney(selectedAccount.creditoP * 2.5)}</td>
                                                                    <td style={{
                                                                        padding: '8px',
                                                                        border: '1px solid #ddd',
                                                                        fontWeight: 'bold',
                                                                        color: saldoP < 0 ? '#d32f2f' : '#388e3c',
                                                                        textAlign: 'right'
                                                                    }}>
                                                                        {formatSaldo(selectedAccount.debitoP * 2.5, selectedAccount.creditoP * 2.5)}
                                                                    </td>
                                                                </tr>

                                                                {/* Total Geral Anterior */}
                                                                <tr style={{ backgroundColor: '#f0f0f0' }}>
                                                                    <td colSpan={3} style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Total Geral Anterior</td>
                                                                    <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', color: '#d32f2f', textAlign: 'right' }}>{formatMoney(selectedAccount.debitoPA * 2.5)}</td>
                                                                    <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', color: '#388e3c', textAlign: 'right' }}>{formatMoney(selectedAccount.creditoPA * 2.5)}</td>
                                                                    <td style={{
                                                                        padding: '8px',
                                                                        border: '1px solid #ddd',
                                                                        fontWeight: 'bold',
                                                                        color: saldoPA < 0 ? '#d32f2f' : '#388e3c',
                                                                        textAlign: 'right'
                                                                    }}>
                                                                        {formatSaldo(selectedAccount.debitoPA * 2.5, selectedAccount.creditoPA * 2.5)}
                                                                    </td>
                                                                </tr>

                                                                {/* Total Geral Acumulado */}
                                                                <tr style={{ borderBottom: '2px solid black', backgroundColor: '#f0f0f0' }}>
                                                                    <td colSpan={3} style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Total Geral Acumulado</td>
                                                                    <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', color: '#d32f2f', textAlign: 'right' }}>{formatMoney(selectedAccount.debitoAC * 2.5)}</td>
                                                                    <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', color: '#388e3c', textAlign: 'right' }}>{formatMoney(selectedAccount.creditoAC * 2.5)}</td>
                                                                    <td style={{
                                                                        padding: '8px',
                                                                        textAlign: 'right'
                                                                    }}>
                                                                        {formatSaldo(selectedAccount.debitoAC * 2.5, selectedAccount.creditoAC * 2.5)}
                                                                    </td>
                                                                </tr>
                                                            </>
                                                        );
                                                    })()}
                                                </tfoot>
                                            </table>


                                        </div>
                                    </div>
                                    <div className="luxury-modal-footer">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="luxury-modal-close-btn"
                                        >
                                            <i className="bi bi-check-circle"></i> Fechar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case "Extrato de contas":
                return (
                    <div className="luxury-container"
                        style={{
                            maxHeight: "800px",  // Altura máxima para o scroll
                            padding: "10px",
                            width: "100%", margin: "0 auto"
                        }}>
                        {/* Search Form */}
                        <div className="luxury-form-container">
                            <div className="form-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', alignItems: 'center' }}>
                                <div className="form-column">
                                    <select
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        className="luxury-select"
                                    >
                                        <option value="">Conta Financeira</option>
                                        {financialAccounts.map((account) => (
                                            <option key={account.id} value={account.number}>
                                                {account.number} - {account.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-column">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="luxury-date-input"
                                    />
                                </div>
                                <div className="form-column">
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="luxury-date-input"
                                    />
                                </div>
                                <div className="form-column">
                                    <button onClick={handleSearchBalancete} className="luxury-search-btn">
                                        <i className="bi bi-search"></i> Pesquisar
                                    </button>
                                </div>
                                <div className="form-column">
                                    <button onClick={handleClear} className="luxury-clear-btn">
                                        <i className="bi bi-eraser"></i> Limpar
                                    </button>
                                </div>

                                {/* Export Buttons */}
                                {accountData.length > 0 && (
                                    <>
                                        <div className="form-column">
                                            <button className="luxury-excel-btn" onClick={exportToExcelExtract}>
                                                <i className="bi bi-file-earmark-excel-fill"></i> Excel
                                            </button>
                                        </div>
                                        <div className="form-column">
                                            <button className="luxury-pdf-btn" onClick={exportToPDFExtract}>
                                                <i className="bi bi-file-earmark-pdf-fill"></i> PDF
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                        </div>

                        <div style={{
                            overflowY: 'auto',
                            maxWidth: '100%',
                            height: "420px",
                            scrollbarWidth: 'thin', // Para Firefox
                            scrollbarColor: '#4a6cf7 rgba(245, 247, 250, 0.2)', // Para Firefox
                            '&::-webkit-scrollbar': {
                                width: '10px',
                                height: '10px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'rgba(245, 247, 250, 0.2)',
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#4a6cf7',
                                borderRadius: '10px',
                                border: '2px solid rgba(245, 247, 250, 0.2)',
                                '&:hover': {
                                    background: '#3a5bd9',
                                }
                            }
                        }}>
                            <table className="table table-striped table-bordered table-hover" style={{ padding: '2px' }}>
                                <thead>
                                    <tr style={{ padding: '2px' }}>
                                        <th style={{ padding: '2px' }}>Data da contabilidade</th>
                                        <th style={{ padding: '2px' }}>Documento</th>
                                        <th style={{ padding: '2px' }}>Descrição</th>
                                        <th style={{ padding: '2px' }}>Débito</th>
                                        <th style={{ padding: '2px' }}>Crédito</th>
                                        <th style={{ padding: '2px' }}>Saldo</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {extractAccountData && extractAccountData.length > 0 ? (
                                        (() => {
                                            const movimentosPorConta = {};

                                            extractAccountData.forEach(mov => {
                                                const conta = mov.conta.toString();
                                                if (!movimentosPorConta[conta]) {
                                                    movimentosPorConta[conta] = [];
                                                }
                                                movimentosPorConta[conta].push(mov);
                                            });

                                            return Object.entries(movimentosPorConta).flatMap(([conta, movimentos]) => {
                                                let saldoAcumulado = 0;

                                                const natureza =
                                                    conta.startsWith('1') || conta.startsWith('3') || conta.startsWith('41') ? 'ativo' :
                                                        /^(42|43|44|45|46|48|49|5)/.test(conta) ? 'passivo' :
                                                            conta.startsWith('6') ? 'gasto' :
                                                                conta.startsWith('7') ? 'ganho' : 'normal';

                                                return movimentos.map((movement, index) => {
                                                    const isDebit = movement.operator?.toUpperCase() === "DEBIT";
                                                    const isCredit = movement.operator?.toUpperCase() === "CREDIT";
                                                    const valor = parseFloat(movement.value) || 0;

                                                    const debito = isDebit ? valor : 0;
                                                    const credito = isCredit ? valor : 0;

                                                    const variacao = (natureza === 'passivo' || natureza === 'ganho')
                                                        ? credito - debito
                                                        : debito - credito;

                                                    saldoAcumulado += variacao;

                                                    const saldoSufixo = saldoAcumulado >= 0 ? 'D' : 'C';
                                                    const saldoAbsoluto = Math.abs(saldoAcumulado);

                                                    return (
                                                        <tr key={`${conta}-${index}`} style={{ padding: '2px' }}>
                                                            <td style={{ padding: '2px' }}>{DateTime.fromISO(movement.date).toFormat('dd/MM/yyyy')}</td>
                                                            <td style={{ padding: '2px' }}>{movement.document || 'Factura'}</td>
                                                            <td style={{ padding: '2px' }}>{movement.description || 'Sem descrição'}</td>
                                                            <td style={{
                                                                fontWeight: isDebit ? 'bold' : 'normal',
                                                                color: isDebit ? '#d32f2f' : 'inherit',
                                                                textAlign: 'right',
                                                                padding: '2px'
                                                            }}>
                                                                {formatCurrency(debito * 2.5)}
                                                            </td>
                                                            <td style={{
                                                                fontWeight: isCredit ? 'bold' : 'normal',
                                                                color: isCredit ? '#388e3c' : 'inherit',
                                                                textAlign: 'right',
                                                                padding: '2px'
                                                            }}>
                                                                {formatCurrency(credito * 2.5)}
                                                            </td>
                                                            <td style={{
                                                                fontWeight: 'bold',
                                                                color: saldoAcumulado < 0 ? '#388e3c' : saldoAcumulado > 0 ? '#d32f2f' : 'inherit',
                                                                textAlign: 'right',
                                                                padding: '2px'
                                                            }}>
                                                                {formatCurrency(saldoAbsoluto * 2.5)} {saldoSufixo}
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                            });
                                        })()
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: '#888',
                                                padding: '10px'
                                            }}>
                                                🚨 Sem dados disponíveis. <br />

                                                Selecione os Filtros
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                                <tfoot>
                                    {extractAccountData && extractAccountData.length > 0 && (() => {
                                        const totalDebito = extractAccountData.reduce((sum, mov) =>
                                            sum + (mov.operator?.toUpperCase() === "DEBIT" ? parseFloat(mov.value) * 2.5 : 0), 0
                                        );
                                        const totalCredito = extractAccountData.reduce((sum, mov) =>
                                            sum + (mov.operator?.toUpperCase() === "CREDIT" ? parseFloat(mov.value) * 2.5 : 0), 0
                                        );
                                        const saldoTotal = totalDebito - totalCredito;

                                        const saldoSufixo = saldoTotal >= 0 ? 'D' : 'C';
                                        const saldoAbsoluto = Math.abs(saldoTotal);

                                        return (
                                            <tr>
                                                <td colSpan={3} style={{
                                                    textAlign: 'right',
                                                    fontWeight: 'bold',
                                                    padding: '2px',
                                                    backgroundColor: '#d3d3d3',
                                                    position: 'sticky',
                                                    bottom: 0,
                                                    zIndex: 2,
                                                    borderTop: '2px solid #999',
                                                }}>
                                                    Totais:
                                                </td>
                                                <td style={{
                                                    textAlign: 'right',
                                                    fontWeight: 'bold',
                                                    padding: '2px',
                                                    backgroundColor: '#d3d3d3',
                                                    position: 'sticky',
                                                    bottom: 0,
                                                    zIndex: 2,
                                                    borderTop: '2px solid #999',
                                                }}>
                                                    {formatCurrency(totalDebito)}
                                                </td>
                                                <td style={{
                                                    textAlign: 'right',
                                                    fontWeight: 'bold',
                                                    padding: '2px',
                                                    backgroundColor: '#d3d3d3',
                                                    position: 'sticky',
                                                    bottom: 0,
                                                    zIndex: 2,
                                                    borderTop: '2px solid #999',
                                                }}>
                                                    {formatCurrency(totalCredito)}
                                                </td>
                                                <td style={{
                                                    textAlign: 'right',
                                                    fontWeight: 'bold',
                                                    color: saldoTotal < 0 ? '#d32f2f' : saldoTotal > 0 ? '#388e3c' : 'inherit',
                                                    padding: '2px',
                                                    backgroundColor: '#d3d3d3',
                                                    position: 'sticky',
                                                    bottom: 0,
                                                    zIndex: 2,
                                                    borderTop: '2px solid #999',
                                                }}>
                                                    {formatCurrency(saldoAbsoluto)} {saldoSufixo}
                                                </td>
                                            </tr>
                                        );
                                    })()}
                                </tfoot>
                            </table>


                        </div>

                        {/* <div style={{
                            display: 'flex',
                            gap: '20px',
                            padding: '16px',
                            background: '#f8fafc',
                            borderRadius: '8px'
                        }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, color: '#64748b' }}>Total Período</p>
                                <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 'bold' }}>0,00</p>
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, color: '#64748b' }}>Total Acumulado</p>
                                <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 'bold' }}>0,00</p>
                            </div>
                        </div> */}
                    </div>
                );

            case "Livro de Controlo do Folio Geral":
                return (
                    <div className="luxury-container"
                        style={{
                            maxHeight: "800px",  // Altura máxima para o scroll
                            padding: "10px",
                            width: "100%", margin: "0 auto"
                        }}>
                        {/* Search Form */}
                        <div className="luxury-form-container">
                            <div className="form-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                                <div className="form-column">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="luxury-date-input"
                                    />
                                </div>
                                <div className="form-column">
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="luxury-date-input"
                                    />
                                </div>
                                <div className="form-column">
                                    <button onClick={handleSearchGeneralFolio} className="luxury-search-btn">
                                        <i className="bi bi-search"></i> Pesquisar
                                    </button>
                                </div>
                                <div className="form-column">
                                    <button onClick={handleClear} className="luxury-clear-btn">
                                        <i className="bi bi-eraser"></i> Limpar
                                    </button>
                                </div>

                                {/* Export Buttons */}
                                {accountData.length > 0 && (
                                    <>
                                        <div className="form-column">
                                            <button className="luxury-excel-btn" onClick={exportToExcelGeneralFolio}>
                                                <i className="bi bi-file-earmark-excel-fill"></i> Excel
                                            </button>
                                        </div>
                                        <div className="form-column">
                                            <button className="luxury-pdf-btn" onClick={exportToPDFGeneralFolio}>
                                                <i className="bi bi-file-earmark-pdf-fill"></i> PDF
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                        </div>

                        {/* Spinner de carregamento personalizado */}
                        {loading && (
                            <div
                                style={{
                                    position: "absolute", // Posiciona sobre a tabela
                                    top: "50%", // Centraliza verticalmente
                                    left: "50%", // Centraliza horizontalmente
                                    transform: "translate(-50%, -50%)", // Ajuste final para centralizar completamente
                                    zIndex: 1000, // Garante que o spinner fique acima da tabela
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: "100%",
                                    height: "100%",
                                }}
                            >
                                <Spinner isLoading={loading} />
                            </div>
                        )}

                        <div
                            style={{
                                maxHeight: "520px",
                                overflowY: "auto",
                                marginTop: "20px",
                                paddingRight: "10px"
                            }}
                            className="scroll-area"
                        >

                            <div
                                style={{
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    marginTop: "20px",
                                    paddingRight: "10px"
                                }}
                                className="scroll-area"
                            >
                                {/* Tabela de Recebimentos */}
                                <table className="table table-striped table-bordered table-hover" style={{ padding: '2px' }}>
                                    <thead>
                                        <tr style={{ padding: '2px' }}>
                                            <th colSpan={5} style={{ textAlign: "center", padding: '2px' }}>
                                                Recebimentos
                                            </th>
                                        </tr>
                                        <tr style={{ padding: '2px' }}>
                                            <th style={{ padding: '2px' }}>Data</th>
                                            <th style={{ padding: '2px' }}>Banco</th>
                                            <th style={{ padding: '2px' }}>Documento</th>
                                            <th style={{ padding: '2px' }}>Descrição</th>
                                            <th style={{ padding: '2px' }}>Importância</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receb.length > 0 ? (
                                            receb.map((movement, index) => (
                                                <tr key={index} style={{ padding: '2px' }}>
                                                    <td style={{ padding: '2px' }}>{movement.operationDate}</td>
                                                    <td style={{ padding: '2px' }}>
                                                        {movement.accountPlan
                                                            ? `${movement.accountPlan.number} - ${movement.accountPlan.description}`
                                                            : "—"}
                                                    </td>                                                    <td style={{ padding: '2px' }}>{movement.documentDescription}</td>
                                                    <td style={{ padding: '2px' }}>{movement.description}</td>
                                                    <td style={{ padding: '2px' }}>{parseFloat(movement.value * 2.5 || 0).toFixed(2)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr style={{ padding: '2px' }}>
                                                <td colSpan={5} className="text-center text-muted" style={{ padding: '2px' }}>
                                                    Dados indisponíveis
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Tabela de Pagamentos */}
                            <div
                                style={{
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    marginTop: "20px",
                                    paddingRight: "10px"
                                }}
                                className="scroll-area"
                            >
                                <table className="table table-striped table-bordered table-hover" style={{ padding: '2px' }}>
                                    <thead>
                                        <tr style={{ padding: '2px' }}>
                                            <th colSpan={8} style={{ textAlign: "center", padding: '2px' }}>
                                                Pagamentos
                                            </th>
                                        </tr>
                                        <tr style={{ padding: '2px' }}>
                                            <th style={{ padding: '2px' }}>Data</th>
                                            <th style={{ padding: '2px' }}>Banco</th>
                                            <th style={{ padding: '2px' }}>Documento</th>
                                            <th style={{ padding: '2px' }}>Comprovativo Bancário</th>
                                            <th style={{ padding: '2px' }}>A Favor de:</th>
                                            <th style={{ padding: '2px' }}>Descrição</th>
                                            <th style={{ padding: '2px' }}>Importância</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pag.length > 0 ? (
                                            pag.map((movement, index) => (
                                                <tr key={index} style={{ padding: '2px' }}>
                                                    <td style={{ padding: '2px' }}>{movement.operationDate}</td>
                                                    <td style={{ padding: '2px' }}>
                                                        {movement.accountPlan
                                                            ? `${movement.accountPlan.number} - ${movement.accountPlan.description} `
                                                            : "—"}
                                                    </td>                                                    <td style={{ padding: '2px' }}>{movement.documentDescription}</td>
                                                    <td style={{ padding: '2px' }}>{movement.bankReceipt || "—"}</td>
                                                    <td style={{ padding: '2px' }}>{movement.payee || "—"}</td>
                                                    <td style={{ padding: '2px' }}>{movement.description}</td>
                                                    <td style={{ padding: '2px' }}>{parseFloat(movement.value * 2.5 || 0).toFixed(2)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr style={{ padding: '2px' }}>
                                                <td colSpan={8} className="text-center text-muted" style={{ padding: '2px' }}>
                                                    Dados indisponíveis
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ width: "585px", marginLeft: "auto" }}>
                                <table
                                    className="table table-striped table-bordered table-hover"
                                    style={{ width: "100%", tableLayout: "fixed", padding: '2px' }}
                                >
                                    <thead>
                                        <tr style={{ padding: '2px' }}>
                                            <th style={{ width: "70%", textAlign: "left", padding: '2px 2px 2px 100px' }}>Descrição</th>
                                            <th style={{ width: "30%", padding: '2px' }}>Importância</th>
                                        </tr>
                                    </thead>
                                    {generalFolio && (
                                        <tbody>
                                            <tr style={{ padding: '2px' }}>
                                                <td style={{ textAlign: "left", padding: '2px 2px 2px 100px' }}>Saldo Anterior</td>
                                                <td style={{ padding: '2px' }}>
                                                    {(generalFolio.saldoAnterior * 2.5 ?? 0).toLocaleString("pt-PT", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                            </tr>
                                            <tr style={{ padding: '2px' }}>
                                                <td style={{ textAlign: "left", padding: '2px 2px 2px 100px' }}>Recebimentos do Período</td>
                                                <td style={{ padding: '2px' }}>
                                                    {(generalFolio.totalRecebimentos * 2.5 ?? 0).toLocaleString("pt-PT", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                            </tr>
                                            <tr style={{ padding: '2px' }}>
                                                <td style={{ textAlign: "left", padding: '2px 2px 2px 100px' }}>Pagamento do Período</td>
                                                <td style={{ padding: '2px' }}>
                                                    {(generalFolio.totalPagamentos * 2.5 ?? 0).toLocaleString("pt-PT", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                            </tr>
                                            <tr style={{ padding: '2px' }}>
                                                <td style={{ textAlign: "left", padding: '2px 2px 2px 100px' }}>Saldo Final</td>
                                                <td style={{ padding: '2px' }}>
                                                    {(generalFolio.saldoFinal * 2.5 ?? 0).toLocaleString("pt-PT", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </td>
                                            </tr>
                                        </tbody>
                                    )}
                                </table>
                            </div>

                        </div>

                    </div >
                );


            case "Mapa Demonstrativo":
                return (
                    <div className="luxury-container"
                        style={{
                            maxHeight: "800px",  // Altura máxima para o scroll
                            padding: "10px",
                            width: "100%", margin: "0 auto"
                        }}>
                        {/* Search Form */}
                        <div className="luxury-form-container">
                            <div className="form-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                                <div className="form-column">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="luxury-date-input"
                                    />
                                </div>
                                <div className="form-column">
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="luxury-date-input"
                                    />
                                </div>
                                <div className="form-column">
                                    <button onClick={handleSearchDemostrativeMap} className="luxury-search-btn">
                                        <i className="bi bi-search"></i> Pesquisar
                                    </button>
                                </div>
                                <div className="form-column">
                                    <button onClick={handleClearDemonstrativeMap} className="luxury-clear-btn">
                                        <i className="bi bi-eraser"></i> Limpar
                                    </button>
                                </div>

                                {/* Export Buttons */}
                                {accountData.length > 0 && (
                                    <>
                                        <div className="form-column">
                                            <button className="luxury-excel-btn" onClick={exportToExcelExtract3}>
                                                <i className="bi bi-file-earmark-excel-fill"></i> Excel
                                            </button>
                                        </div>
                                        <div className="form-column">
                                            <button className="luxury-pdf-btn" onClick={exportToPDFExtract3}>
                                                <i className="bi bi-file-earmark-pdf-fill"></i> PDF
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* // Na renderização da tabela: */}
                        <table className="table table-striped table-bordered table-hover" style={{ padding: '2px' }}>
                            <thead>
                                <tr style={{ padding: '2px' }}>
                                    <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center", width: "30%", padding: '2px' }}>
                                        Contas Bancárias
                                    </th>
                                    <th colSpan={4} style={{ textAlign: "center", padding: '2px' }}>
                                        Livro de Controlo Bancário
                                    </th>
                                    <th colSpan={2} style={{ textAlign: "center", padding: '2px' }}>
                                        Saldo no Fim do Mês
                                    </th>
                                    <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center", padding: '2px' }}>
                                        Diferença
                                    </th>
                                </tr>
                                <tr style={{ padding: '2px' }}>
                                    <th style={{ padding: '2px' }}>Saldo no Início do Mês</th>
                                    <th style={{ padding: '2px' }}>Recebimentos Durante o Mês</th>
                                    <th style={{ padding: '2px' }}>Pagamentos Durante o Mês</th>
                                    <th style={{ padding: '2px' }}>Saldo no fim do Mês</th>
                                    <th style={{ padding: '2px' }}>Livro de Controlo Bancário</th>
                                    <th style={{ padding: '2px' }}>Extracto do Banco</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ padding: '2px' }}>
                                    <td style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>Conta de Recepção em Dólares</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(recebData?.saldoInicial * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(recebData?.recebimentos * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(recebData?.pagamentos * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(recebData?.saldoFinal * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(geralData?.saldoInstituicao * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(geralData?.saldoBanco * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(/* calcular diferença */)}</td>
                                </tr>
                                <tr style={{ padding: '2px' }}>
                                    <td style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>Conta de Funcionamento</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(pagData?.saldoInicial * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(pagData?.recebimentos * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(pagData?.pagamentos * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(pagData?.saldoFinal * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(geralData?.saldoInstituicao * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(geralData?.saldoBanco * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(/* calcular diferença */)}</td>
                                </tr>
                                <tr style={{ padding: '2px' }}>
                                    <td style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>Fólio Geral</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(geralData?.saldoAnterior * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(geralData?.totalRecebimentos * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(geralData?.totalPagamentos * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(geralData?.saldoFinal * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(geralData?.saldoInstituicao * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(geralData?.saldoBanco * 2.5)}</td>
                                    <td style={{ padding: '2px' }}>{formatMoney(/* calcular diferença */)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style={{ width: "980px", marginRight: "auto" }}>
                            <table className="table table-striped table-bordered table-hover" style={{ width: "100%", tableLayout: "fixed", padding: '2px' }}>
                                <thead>
                                    <tr style={{ padding: '2px' }}>
                                        <th style={{ width: "47%", padding: '2px' }}>Pendentes no Banco</th>
                                        <th style={{ width: "18%", padding: '2px' }}>Total Disponível</th>
                                        <th style={{ width: "18%", padding: '2px' }}>Total das Requisições Emitidas</th>
                                        <th style={{ width: "18%", padding: '2px' }}>Total de Pagamentos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ padding: '2px' }}>
                                        <td style={{ padding: '2px' }}>{formatMoney(totalAmountRequestsPaidReconciliated)}</td>
                                        <td style={{ padding: '2px' }}>{formatMoney(availableBudgect)}</td>
                                        <td style={{ padding: '2px' }}>{formatMoney(totalAmountRequests)}</td>
                                        <td style={{ padding: '2px' }}>{formatMoney(totalAmountRequestsPaid)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style={{ width: "980px", marginRight: "auto" }}>
                            <h5 style={{ textAlign: "left", fontWeight: 'bold', margin: '2px 0', padding: '2px' }}>Movimentos por Registar no Banco (Detalhes)</h5>
                            <table className="table table-striped table-bordered table-hover" style={{ width: "100%", tableLayout: "fixed", padding: '2px' }}>
                                <thead>
                                    <tr style={{ padding: '2px' }}>
                                        <th style={{ width: "47%", padding: '2px' }}>Designação por Conta Bancária</th>
                                        <th style={{ width: "18%", padding: '2px' }}>Nº da Conta</th>
                                        <th style={{ width: "18%", padding: '2px' }}>Descrição</th>
                                        <th style={{ width: "18%", padding: '2px' }}>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ padding: '2px' }}>
                                        <td style={{ textAlign: "left", padding: '2px 2px 2px 120px' }}>Conta Recepção</td>
                                        <td style={{ padding: '2px' }}>{recebData.accountPlan?.number || "N/A"}</td>
                                        <td style={{ padding: '2px' }}>{recebData.accountPlan?.description || "N/A"}</td>
                                        <td style={{ padding: '2px' }}>{formatMoney(totalAmountRequestsPaidReconciliated - (totalAmountRequestsPaidReconciliated*0.05))}</td>
                                    </tr>
                                    <tr style={{ padding: '2px' }}>
                                        <td style={{ textAlign: "left", padding: '2px 2px 2px 120px' }}>Conta Funcionamento</td>
                                        <td style={{ padding: '2px' }}>{pagData.accountPlan?.number || "N/A"}</td>
                                        <td style={{ padding: '2px' }}>{pagData.accountPlan?.description || "N/A"}</td>
                                        <td style={{ padding: '2px' }}>{formatMoney((totalAmountRequestsPaidReconciliated*0.05))}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div style={{ textAlign: "left", padding: '2px 2px 2px 680px' }}><h4 style={{ margin: '2px 0', padding: '2px' }}>Total:</h4></div>
                        </div>
                    </div>
                );

            case "Mapa de Reconciliação Bancária":
                return (

                    <div className="luxury-container"
                        style={{
                            maxHeight: "800px",  // Altura máxima para o scroll
                            padding: "10px",
                            width: "100%", margin: "0 auto"
                        }}>
                        {/* Search Form */}
                        <div className="luxury-form-container">
                            <div className="form-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                                <div className="form-column">
                                    <select
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        className="luxury-select"
                                    >
                                        <option value="">Conta Financeira</option>
                                        {financialAccounts.map((account) => (
                                            <option key={account.id} value={account.number}>
                                                {account.number} - {account.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-column">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="luxury-date-input"
                                    />
                                </div>
                                <div className="form-column">
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="luxury-date-input"
                                    />
                                </div>
                                <div className="form-column">
                                    <button onClick={handleSearchDemostrativeMap} className="luxury-search-btn">
                                        <i className="bi bi-search"></i> Pesquisar
                                    </button>
                                </div>
                                <div className="form-column">
                                    <button onClick={handleClearDemonstrativeMap} className="luxury-clear-btn">
                                        <i className="bi bi-eraser"></i> Limpar
                                    </button>
                                </div>

                                {/* Export Buttons */}
                                {accountData.length > 0 && (
                                    <>
                                        <div className="form-column">
                                            <button className="luxury-excel-btn" onClick={exportToExcelExtract}>
                                                <i className="bi bi-file-earmark-excel-fill"></i> Excel
                                            </button>
                                        </div>
                                        <div className="form-column">
                                            <button className="luxury-pdf-btn" onClick={exportToPDFExtract}>
                                                <i className="bi bi-file-earmark-pdf-fill"></i> PDF
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>


                        <table className="table table-striped table-bordered table-hover" style={{ padding: '2px' }}>
                            <thead>
                                <tr style={{ padding: '2px' }}>
                                    <th colSpan={3} style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>
                                        Registos na INSTITUIÇÃO não lançados no Banco
                                    </th>
                                    <th colSpan={3} style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>
                                        Registos no BANCO não lançados na contabilidade
                                    </th>
                                </tr>
                                <tr style={{ padding: '2px' }}>
                                    <th style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>Descrição</th>
                                    <th style={{ padding: '2px' }}>Débito</th>
                                    <th style={{ padding: '2px' }}>Crédito</th>
                                    <th style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>Descrição</th>
                                    <th style={{ padding: '2px' }}>Débito</th>
                                    <th style={{ padding: '2px' }}>Crédito</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ padding: '2px' }}>
                                    <td style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>Transferência de Salário</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>0,00</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>125.000,00</td>
                                    <td style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>Pagamento de Fatura de Serviços</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>32.500,00</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>0,00</td>
                                </tr>
                                <tr style={{ padding: '2px' }}>
                                    <td style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>Reembolso de Despesas</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>0,00</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>18.750,00</td>
                                    <td style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>Depósito de Caixa</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>0,00</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>42.300,00</td>
                                </tr>
                                <tr style={{ padding: '2px' }}>
                                    <td style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>Pagamento de Fornecedor</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>87.000,00</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>0,00</td>
                                    <td style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>Transferência de Investimento</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>0,00</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>150.000,00</td>
                                </tr>
                                <tr style={{ padding: '2px' }}>
                                    <td style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>Despesa com Equipamentos</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>23.400,00</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>0,00</td>
                                    <td style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>Pagamento de Empréstimo</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>28.900,00</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>0,00</td>
                                </tr>
                                <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa', padding: '2px' }}>
                                    <td style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>SOMA</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>110.400,00</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>143.750,00</td>
                                    <td style={{ textAlign: "left", padding: '2px 2px 2px 150px' }}>SOMA</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>61.400,00</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>192.300,00</td>
                                </tr>
                                <tr style={{ fontWeight: 'bold', backgroundColor: '#e9ecef', padding: '2px' }}>
                                    <td colSpan={2} style={{ textAlign: "right", padding: '2px 20px 2px 2px' }}>Diferença a Conciliar:</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>33.350,00</td>
                                    <td colSpan={2} style={{ textAlign: "right", padding: '2px 20px 2px 2px' }}>Diferença a Conciliar:</td>
                                    <td style={{ textAlign: "right", padding: '2px' }}>130.900,00</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="form-container" style={{ width: '100%', display: 'flex', gap: '20px', margin: '0 auto' }}>
                            <div className="column" style={{ flex: 1, textAlign: 'left' }}>
                                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '10px 0' }}>
                                    <span>Saldo CORRIGIDO:</span>
                                    <input type="number" style={{ width: "150px", paddingRight: "150px" }} />
                                </p>
                                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '10px 0' }}>
                                    <span>Diferença na Reconciliação:</span>
                                    <input type="number" style={{ width: "150px" }} />
                                </p>
                            </div>
                            <div className="column" style={{ flex: 1, textAlign: 'right' }}>
                            </div>
                            <div className="column" style={{ flex: 1, textAlign: 'right' }}>
                                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '10px 0' }}>
                                    <span>Saldo CORRIGIDO:</span>
                                    <input type="number" style={{ margin: "10px", width: "150px" }} />
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case "Livro de Controlo da Conta Bancária":
                return (
                    <div className="luxury-container"
                        style={{
                            maxHeight: "800px",  // Altura máxima para o scroll
                            padding: "10px",
                            width: "100%", margin: "0 auto"
                        }}>
                        {/* Search Form */}
                        <div className="luxury-form-container">
                            <div className="form-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                                <div className="form-column">
                                    <select
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        className="luxury-select"
                                    >
                                        <option value="">Conta Financeira</option>
                                        {financialAccounts.map((account) => (
                                            <option key={account.id} value={account.number}>
                                                {account.number} - {account.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-column">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="luxury-date-input"
                                    />
                                </div>
                                <div className="form-column">
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="luxury-date-input"
                                    />
                                </div>
                                <div className="form-column">
                                    <button onClick={handleSearchBankControl} className="luxury-search-btn">
                                        <i className="bi bi-search"></i> Pesquisar
                                    </button>
                                </div>
                                <div className="form-column">
                                    <button onClick={handleClearDemonstrativeMap} className="luxury-clear-btn">
                                        <i className="bi bi-eraser"></i> Limpar
                                    </button>
                                </div>

                                {/* Export Buttons */}
                                {accountData.length > 0 && (
                                    <>
                                        <div className="form-column">
                                            <button className="luxury-excel-btn" onClick={exportToExcelExtract}>
                                                <i className="bi bi-file-earmark-excel-fill"></i> Excel
                                            </button>
                                        </div>
                                        <div className="form-column">
                                            <button className="luxury-pdf-btn" onClick={exportToPDFExtract}>
                                                <i className="bi bi-file-earmark-pdf-fill"></i> PDF
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <table
                            className="table table-striped table-bordered table-hover"
                            style={{ padding: "2px" }}
                        >
                            <thead>
                                <tr style={{ padding: "2px" }}>
                                    <th colSpan={3} style={{ textAlign: "center", padding: "2px" }}>
                                        Recebimentos
                                    </th>
                                    <th colSpan={3} style={{ textAlign: "center", padding: "2px" }}>
                                        Pagamentos
                                    </th>
                                    <th rowSpan={2} style={{ textAlign: "center", padding: "2px" }}>
                                        Importância
                                    </th>
                                    <th rowSpan={2} style={{ textAlign: "center", padding: "2px" }}>
                                        Saldo
                                    </th>
                                    <th rowSpan={2} style={{ textAlign: "center", padding: "2px" }}>
                                        Observações
                                    </th>
                                </tr>
                                <tr style={{ padding: "2px" }}>
                                    <th style={{ padding: "2px" }}>Data</th>
                                    <th style={{ padding: "2px" }}>Designação</th>
                                    <th style={{ padding: "2px" }}>Importância</th>
                                    <th style={{ padding: "2px" }}>Documento</th>
                                    <th style={{ padding: "2px" }}>Comprovativo Bancário</th>
                                    <th style={{ padding: "2px" }}>A Favor de:</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    // ✅ Aplica filtros por conta e datas
                                    const filteredData = bookBank.filter((mov) => {
                                        const contaOk = mov.accountPlan?.number === accountNumber;
                                        const dataMov = new Date(mov.operationDate.split("-").reverse().join("-")); // dd-mm-yyyy -> yyyy-mm-dd
                                        const start = new Date(startDate);
                                        const end = new Date(endDate);

                                        const dataOk = dataMov >= start && dataMov <= end;

                                        return contaOk && dataOk;
                                    });

                                    // ✅ Caso não tenha resultados
                                    if (filteredData.length === 0) {
                                        return (
                                            <tr>
                                                <td
                                                    colSpan={9}
                                                    style={{
                                                        textAlign: "center",
                                                        fontStyle: "italic",
                                                        color: "#888",
                                                        padding: "10px",
                                                    }}
                                                >
                                                    Dados indisponíveis para os filtros selecionados.
                                                </td>
                                            </tr>
                                        );
                                    }

                                    // ✅ Agrupa movimentos por conta
                                    const movimentosPorConta = {};
                                    filteredData.forEach((mov) => {
                                        const conta = mov.accountPlan?.number?.toString() || "desconhecida";
                                        if (!movimentosPorConta[conta]) {
                                            movimentosPorConta[conta] = [];
                                        }
                                        movimentosPorConta[conta].push(mov);
                                    });

                                    // ✅ Renderiza linhas
                                    return Object.entries(movimentosPorConta).flatMap(([conta, movimentos]) => {
                                        let saldoAcumulado = 0;

                                        const linhasConta = movimentos.map((movement, index) => {
                                            const isDebit = movement.operator?.toUpperCase() === "DEBIT";
                                            const isCredit = movement.operator?.toUpperCase() === "CREDIT";
                                            const valor = parseFloat(movement.value) || 0;

                                            // ✅ Atualiza saldo (assumindo ativo: débito +, crédito -)
                                            saldoAcumulado += isDebit ? valor : -valor;

                                            return (
                                                <tr
                                                    key={`${conta}-${index}`}
                                                    onClick={() => handleRowClick(movement)}
                                                    className="luxury-table-row"
                                                    style={{ padding: "2px" }}
                                                >
                                                    {/* ✅ Recebimentos */}
                                                    {isDebit ? (
                                                        <>
                                                            <td style={{ padding: "2px" }}>{movement.operationDate}</td>
                                                            <td style={{ padding: "2px" }}>{movement.description}</td>
                                                            <td
                                                                style={{
                                                                    padding: "2px",
                                                                    color: "green",
                                                                    fontWeight: "bold",
                                                                }}
                                                            >
                                                                {formatCurrency(valor)}
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td colSpan={3} style={{ padding: "2px" }}></td>
                                                        </>
                                                    )}

                                                    {/* ✅ Pagamentos */}
                                                    {isCredit ? (
                                                        <>
                                                            <td style={{ padding: "2px" }}>
                                                                {movement.entry?.accountingDocument?.description || (
                                                                    <span className="no-description">Sem descrição</span>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: "2px" }}>Comprovativo X</td>
                                                            <td style={{ padding: "2px" }}>A Favor de Y</td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td colSpan={3} style={{ padding: "2px" }}></td>
                                                        </>
                                                    )}

                                                    {/* ✅ Importância */}
                                                    <td
                                                        style={{
                                                            padding: "2px",
                                                            color: isDebit ? "green" : "red",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {formatCurrency(valor)}
                                                    </td>

                                                    {/* ✅ Saldo */}
                                                    <td
                                                        style={{
                                                            padding: "2px",
                                                            color: saldoAcumulado >= 0 ? "green" : "red",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {formatCurrency(saldoAcumulado)}
                                                    </td>

                                                    {/* ✅ Observações */}
                                                    <td style={{ padding: "2px" }}>
                                                        {movement.observations || "—"}
                                                    </td>
                                                </tr>
                                            );
                                        });

                                        // ✅ Linha com saldo inicial
                                        return [
                                            <tr key={`saldo-inicial-${conta}`} style={{ padding: "2px" }}>
                                                <td
                                                    colSpan={9}
                                                    style={{
                                                        textAlign: "center",
                                                        backgroundColor: "#0c5729",
                                                        fontWeight: "bold",
                                                        color: "#fff",
                                                        padding: "2px",
                                                    }}
                                                >
                                                    Saldo Inicial da Conta {conta}: 0,00 MT
                                                </td>
                                            </tr>,
                                            ...linhasConta,
                                        ];
                                    });
                                })()}
                            </tbody>
                        </table>



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
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V6C21 4.34315 19.6569 3 18 3H6C4.34315 3 3 4.34315 3 6Z" stroke="#ffffff" strokeWidth="2" />
                        <path d="M3 10H21" stroke="#ffffff" strokeWidth="2" />
                        <path d="M8 14H16" stroke="#ffffff" strokeWidth="2" />
                        <path d="M8 18H12" stroke="#ffffff" strokeWidth="2" />
                    </svg>
                    <div>
                        <h3>RELATÓRIOS FINANCEIROS</h3>
                        <p>Balancetes Financeiros, Extratos de Contas, Livro de Folio e Mapas Demonstrativos</p>
                    </div>
                </div>
                <div className="header-action-area">
                    <select
                        value={selectedReport}
                        onChange={(e) => {
                            handleClear();
                            setSelectedReport(e.target.value);
                        }}
                        className="sgf-header-select"
                    >
                        <option disabled selected style={{ color: "#a0aec0" }} value="">-- Selecione o Relatório --</option>
                        <option value="Balancete Financeiro – Período Anterior, Período e Acumulado">
                            Balancete Financeiro – Período Anterior, Período e Acumulado
                        </option>
                        <option value="Extrato de contas">Extrato de contas</option>
                        <option value="Livro de Controlo do Folio Geral">Livro de Controlo do Folio Geral</option>
                        <option value="Mapa Demonstrativo">Mapa Demonstrativo</option>
                        <option value="Livro de Controlo da Conta Bancária">Livro de Controlo da Conta Bancária</option>
                        <option value="Mapa de Reconciliação Bancária">Mapa de Reconciliação Bancária</option>
                    </select>
                </div>
            </div>

            {/* Título dinâmico */}
            {renderTitle()}

            {/* Container da tabela - 100% de largura com boa gestão de espaço */}
            <div style={{
                width: "100%",
                boxSizing: "border-box",
                margin: "16px auto",
                padding: "0 4px",
                overflowX: "auto"
            }}>
                {renderTable()}
            </div>
            {/* CSS */}
            <style jsx>{`

                /* Luxury Green Styles */
:root {
    --emerald: #2ecc71;
    --jade: #00b16a;
    --malachite: #0bda51;
    --forest: #228b22;
    --mint: #98ff98;
    --honeydew: #f0fff0;
    --dark-green: #006400;
    --teal: #008080;
    --gold: #ffd700;
}

.luxury-container {
    font-family: 'Montserrat', sans-serif;
    color: #333;
    max-width: 100%;
    margin: 20px auto;
    padding: 25px;
    background: linear-gradient(135deg, #f8faf9 0%, #ffffff 100%); border: 1px solid #b7dec9;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(46, 204, 113, 0.2);
    border: 1px solid rgba(0, 177, 106, 0.2);
}
.luxury-form-container {
    background: white;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(8, 19, 14, 0.2);
}

.form-row {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 5px;
}

.form-column {
    flex: 0 0 auto;
}

.luxury-select, .luxury-date-input {
    padding: 8px 12px;
    border: 1px solid var(--jade);
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.2s;
    background-color: var(--honeydew);
    color: var(--dark-green);
    height: 36px;
}

.luxury-checkbox-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
}

.luxury-checkbox {
    margin: 0;
}

.luxury-search-btn, .luxury-clear-btn, 
.luxury-excel-btn, .luxury-pdf-btn {
    padding: 8px 15px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 14px;
    height: 36px;
    white-space: nowrap;
}

/* Restante do CSS permanece igual */

.luxury-spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    gap: 20px;
}

.luxury-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid var(--mint);
    border-top: 5px solid var(--jade);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-text {
    font-size: 18px;
    color: var(--forest);
    font-weight: 500;
}

.luxury-export-buttons {
    display: flex;
    justify-content: center;
    gap: 3px;
    margin-bottom: 30px;
}

.luxury-excel-btn, .luxury-pdf-btn {
    padding: 12px 30px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 15px;
}

.luxury-excel-btn {
    background: linear-gradient(to right, #2e7d32, #4caf50);
    color: white;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}

.luxury-excel-btn:hover {
    background: linear-gradient(to right, #1b5e20, #2e7d32);
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(46, 125, 50, 0.4);
}

.luxury-pdf-btn {
    background: linear-gradient(to right, #c62828, #ef5350);
    color: white;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}

.luxury-pdf-btn:hover {
    background: linear-gradient(to right, #b71c1c, #c62828);
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(198, 40, 40, 0.4);
}

.luxury-data-container {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 5px 25px rgba(0, 100, 0, 0.1);
    border: 1px solid rgba(0, 177, 106, 0.3);
}

.luxury-no-data {
    padding: 60px 20px;
    text-align: center;
    color: var(--teal);
    background: linear-gradient(135deg, #f8fff8 0%, #e8f5e9 100%);
}

.luxury-no-data i {
    font-size: 60px;
    margin-bottom: 20px;
    color: var(--jade);
    opacity: 0.7;
}

.luxury-no-data h3 {
    font-weight: 600;
    margin-bottom: 15px;
    color: var(--forest);
    font-size: 24px;
}

.luxury-no-data p {
    font-size: 16px;
    color: var(--teal);
}

.luxury-table-wrapper {
    max-height: 700px;
    overflow-y: auto;
}

.luxury-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

.luxury-table-header th {
    background: linear-gradient(to right, var(--forest), var(--teal));
    color: white;
    padding: 15px 20px;
    text-align: left;
    position: sticky;
    top: 0;
    z-index: 10;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: none;
}

.luxury-table-subheader th {
    background: linear-gradient(to right, var(--mint), #c8e6c9);
    color: var(--dark-green);
    padding: 12px 20px;
    font-weight: 600;
    border: none;
}

.luxury-table-row {
    transition: all 0.3s;
    border-bottom: 1px solid rgba(0, 177, 106, 0.1);
}

.luxury-table-row:hover {
    background-color: var(--honeydew);
    transform: scale(1.005);
    box-shadow: 0 2px 10px rgba(0, 177, 106, 0.1);
}

.luxury-table-row td {
    padding: 14px 20px;
    border-bottom: 1px solid rgba(0, 177, 106, 0.1);
}

.account-number {
    font-weight: 600;
    color: var(--teal);
}

.account-description {
    color: #333;
    font-weight: 500;
}

.no-description {
    color: #95a5a6;
    font-style: italic;
}

.numeric-cell {
    text-align: right;
    font-family: 'Roboto Mono', monospace;
    color: #2c3e50;
    font-weight: 500;
}

.balance-cell {
    font-weight: 700;
    color: var(--forest);
}

/* Modal Styles */
.luxury-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(3, 8, 3, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
    backdrop-filter: blur(5px);
}

.luxury-modal-container {
    background: white;
    border-radius: 15px;
    width: 85%;
    max-width: 1500px;
    max-height: 110vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 15px 50px rgba(0, 80, 0, 0.3);
    overflow: hidden;
    border: 2px solid var(--jade);
}

.luxury-modal-header {
    padding: 25px;
    border-bottom: 1px solid rgba(0, 177, 106, 0.3);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(to right, var(--forest), var(--teal));
    color: white;
}

.luxury-modal-header h3 {
    margin: 0;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 22px;
}

.luxury-modal-close {
    background: none;
    border: none;
    font-size: 28px;
    color: white;
    cursor: pointer;
    transition: all 0.3s;
    opacity: 0.8;
}

.luxury-modal-close:hover {
    opacity: 1;
    transform: rotate(90deg);
}

.luxury-modal-body {
    padding: 0;
    overflow-y: auto;
    background: linear-gradient(135deg, #f8fff8 0%, #f1f8e9 100%);
}

.luxury-modal-table-container {
    max-height: 65vh;
    overflow-y: auto;
}

.luxury-modal-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

.luxury-modal-table th {
    background: linear-gradient(to right, var(--jade), var(--malachite));
    color: white;
    padding: 15px 20px;
    text-align: left;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 10;
    border: none;
}

.luxury-modal-table td {
    padding: 12px 20px;
    border-bottom: 1px solid rgba(0, 177, 106, 0.1);
    background-color: white;
}

.previous-balance-row th {
    background: linear-gradient(to right, #ffeb3b, #ffc107);
    color: var(--dark-green);
    text-align: center;
    font-weight: 700;
    font-size: 16px;
}

.no-movements {
    text-align: center;
    padding: 40px;
    color: var(--teal);
    font-style: italic;
    font-size: 18px;
    background-color: rgba(152, 255, 152, 0.2);
}

.luxury-modal-footer {
    padding: 20px;
    border-top: 1px solid rgba(0, 177, 106, 0.3);
    display: flex;
    justify-content: flex-end;
    background: white;
}

.luxury-modal-close-btn {
    padding: 12px 30px;
    background: linear-gradient(to right, var(--jade), var(--emerald));
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 16px;
}

.luxury-modal-close-btn:hover {
    background: linear-gradient(to right, var(--forest), var(--jade));
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 177, 106, 0.3);
}

/* Responsive adjustments */
@media (max-width: 1200px) {
    .form-row {
        gap: 15px;
    }
    
    .luxury-modal-container {
        width: 95%;
    }
}

@media (max-width: 768px) {
    .luxury-container {
        padding: 15px;
    }
    
    .form-row {
        flex-direction: column;
    }
    
    .form-column {
        width: 100%;
    }
    
    .luxury-export-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .luxury-table-header th,
    .luxury-table-subheader th {
        padding: 12px 15px;
        font-size: 14px;
    }

    .luxury-checkbox-label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    margin-right: 10px;
}

.luxury-checkbox {
    width: 16px;
    height: 16px;
    cursor: pointer;
}
    
    .luxury-table-row td {
        padding: 10px 15px;
    }
}
              
              `}</style>
        </div>
    );
};

export default FinancialReports;