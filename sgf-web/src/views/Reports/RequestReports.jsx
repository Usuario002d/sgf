import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import brasao from '../../assets/img/brasao.png';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { Card, Button, Form, DropdownButton, Dropdown, Modal } from 'react-bootstrap';
import { findAccountRequestWhitConformance,fetchAccountRequestValid, fetchSummationAccountEntriesEntry, fetchInitialAllocationsByParentId, findAccountPlanBudjectEntriesByYear, fetchAccountRequestWhitConformance, fetchOpenAccount, redistribuition } from '../../services/accountService';
import 'jspdf-autotable';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FaFileExcel, FaFilePdf, FaInfoCircle, FaTimes, FaExclamationCircle } from 'react-icons/fa';
import { FaMoneyBill, FaSearch } from "react-icons/fa";
import Spinner from '../../config/spinner/spinner';
import Swal from 'sweetalert2';
import templatePDF from '../BudgetChange/component/templatePDF'; // Caminho correto pro seu template
import templateExtractPDF from '../BudgetChange/component/templateExtactPDF'; // Caminho correto pro seu template

import logoMz from '../../assets/img/logoMz.png';

const RequestReports = () => {
    const [selectedReport, setSelectedReport] = useState("");
    const [accounts, setAccounts] = useState([]);
    const [internalRequests, setInternalRequests] = useState([]);
    const [valuesAccounts, setValuesAccounts] = useState([]);
    const [highlightSearch, setHighlightSearch] = useState(false);
    const [valueMovimentAccount, setvalueMovimentAccount] = useState([]);
    const [internalRequestsValid, setInternalRequestsValid] = useState([]);


    // let totalCapitalExpenses = 0;

    useEffect(() => {
        // Ativa o efeito se algum filtro for preenchido
        if (formData.accountPlanNumber || formData.startDate || formData.endDate) {
            setHighlightSearch(true);

            // Remove o destaque após 3 segundos
            const timer = setTimeout(() => setHighlightSearch(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [formData]);
    const [loading, setLoading] = useState(false); // Estado para gerenciar o carregamento
    const [parentAccounts, setParentAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(""); // Estado para a conta selecionada
    // const [currentExpenses, setCurrentExpenses] = useState({
    //     totalAvailableBudget: 0,
    //     totalUntilMonth: 0,
    //     totalDuringMonth: 0,
    //     totalAccumulated: 0,
    //     totalBalance: 0
    // });

    // const [capitalExpenses, setCapitalExpenses] = useState({
    //     totalAvailableBudget: 0,
    //     totalUntilMonth: 0,
    //     totalDuringMonth: 0,
    //     totalAccumulated: 0,
    //     totalBalance: 0
    // });
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

            const response = await fetch(`http://134.199.186.6:3333/sgf-api/internalrequest/financial-entries?accountPlanNumber=${accountPlanNumber}&startDate=${startDate}&endDate=${endDate}`);
            const data = await response.json();

            // Desestruturando os dados do backend
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

            // ➕ CALCULANDO valorAcumulado para cada request e adicionando valorComSaldo (valorAcumulado + saldoExistente)
            let acumulado = 0;
            const filteredRequestsWithAcumulado = [];

            filteredRequests.forEach(request => {
                const valor = parseFloat(request.totalAmount) || 0;
                const saldoExistente = parseFloat(request.saldoExistente) || 0;

                acumulado += valor;

                // Adiciona a request principal
                filteredRequestsWithAcumulado.push({
                    ...request,
                    valorAcumulado: acumulado,
                    valorComSaldo: acumulado
                });

                // Verifica se existe uma voidedRequest correspondente
                const voided = voidedRequests.find(vr => vr.internalRequestItemId === request.id);

                if (voided) {
                    const valorVoided = parseFloat(voided.total_amount_returned) || 0;
                    acumulado -= valorVoided; // Subtrai do acumulado

                    filteredRequestsWithAcumulado.push({
                        ...voided,
                        isVoided: true, // flag para diferenciar na UI
                        valorAcumulado: acumulado,
                        valorComSaldo: valor + saldoExistente, // valor negativo
                        totalAmount: acumulado
                    });
                }
            });

            console.log("voidReq", voidedRequests)
            console.log("voidReqss", filteredRequests)
            console.log("filteredRequestsWithAcumulado", filteredRequestsWithAcumulado)
            console.log("dotacao Final", parseFloat(finalAlloc).toFixed(2))

            // 🧮 Total de requisições
            // const totalRequisicoes = filteredRequestsWithAcumulado.reduce((sum, request) => {
            //     return sum + (parseFloat(request.totalAmount) || 0);
            // }, 0);


            const totalFiltered = filteredRequests.reduce((sum, request) => {
                return sum + (parseFloat(request.totalAmount) || 0);
            }, 0);


            // Primeiro, crie um Set com os ids de filteredRequests para lookup rápido
            const filteredIds = new Set(filteredRequests.map(r => r.id));

            // Agora some somente os valores de voidedRequests que tenham internalRequestItemId presente em filteredIds
            const totalVoidedFiltered = voidedRequests.reduce((sum, request) => {
                if (filteredIds.has(request.internalRequestItemId)) {
                    return sum + (parseFloat(request.totalAmountReturned) || 0);
                }
                return sum;
            }, 0);


            // const totalVoided = voidedRequests.reduce((sum, request) => {
            //     return sum + (parseFloat(request.totalAmountReturned) || 0);
            // }, 0);


            // const totalFiltered = filteredRequests.reduce((sum, request) => sum + (parseFloat(request.totalAmount) || 0, 0));
            // const totalVoided = voidedRequests.reduce((sum, request) => sum + (parseFloat(request.total_amount_returned) || 0, 0));
            const totalRequisicoes = totalFiltered - totalVoidedFiltered;

            console.log("saldos", totalFiltered)
            console.log("totalVoidedFiltered", totalVoidedFiltered)
            console.log("saldos3", totalRequisicoes)

            // 🔧 Aplicando os dados
            setEnitialAllocation(initialAllocation * factor);
            setInsertAllocation(totalInscricao * factor);
            setAnullment(totalAnulacao * factor);
            setRedistribuitionDataReinforcement(totalRedistribuicaoReforce * factor);
            setRedistribuitionDataAnnulment(totalRedistribuicaoAnull * factor);
            setFinalAllocation(parseFloat(finalAlloc).toFixed(2));
            setDisponivel(availableAllocation * factor);
            setModified(totalModified);
            setReserve(fivePercent);

            // ✅ Agora os requests têm o campo "valorAcumulado" e "valorComSaldo"
            setRequestsFilter(filteredRequestsWithAcumulado);
            setTotalRequisicoes(totalRequisicoes);




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






    const handleChangeData = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    // Função para lidar com a mudança de seleção
    const handleChangeBank = (event) => {
        setSelectedAccount(event.target.value);
    };
    const filteredAccounts = accounts.filter((account) =>
        selectedAccount ? account.accountPlan.number === selectedAccount : true
    );

    const [requests, setRequests] = useState([]); // Lista de requisições
    const [requestsFilter, setRequestsFilter] = useState([]); // Lista de requisições
    const [filter, setFilter] = useState('PENDING'); // Filtro atual: 'PENDING', 'APPROVED', ou 'REJECTED'
    const [previewUrl, setPreviewUrl] = useState(null); // URL do preview do PDF
    const [selectedRow, setSelectedRow] = useState(null); // Linha selecionada
    const [logoMzBase64, setLogoMzBase64] = useState('');
    const [totalRequisicoes, setTotalRequisicoes] = useState('');



    const [formData, setFormData] = useState({
        codigo: '',
        codSend: '',
        descricao: '',
        dotacaoInicial: '',
        reforco: '',
        anulaçãoReducao: '',
        transferir: ''
    });
    // Renderiza o título dinamicamente com base no relatório seleccionado
    const renderTitle = () => {
        if (!selectedReport || selectedReport === "Selecione Relatório") return null;
        return <h5 style={{ margin: "20px 0", textAlign: "center" }}>{selectedReport}</h5>;
    };


    useEffect(() => {
        // Carregar todas as requisições
        findAccountRequestWhitConformance()
            .then((data) => {
                setRequests(data);
            })
            .catch((error) => {
                console.error('Erro ao carregar requisições:', error);
            });
    }, []);

    // const filteredRequests = requests.filter((request) => {
    //     if (filter === 'PENDING') return request.conformance === 'PENDING_CONFORMANCE';
    //     if (filter === 'APPROVED') return request.conformance === 'CONFORMED';
    //     if (filter === 'REJECTED') return request.conformance === 'WITHOUT_CONFORMANCE';
    //     return true;
    // });


    const [currency, setCurrency] = useState('');
    const [accountPlan, setAccountPlan] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [stateFilter, setStateFilter] = useState('');
    const [conformanceFilter, setConformanceFilter] = useState('');

    const [initialAllocation, setEnitialAllocation] = useState('');
    const [insertAllocation, setInsertAllocation] = useState('');
    const [modified, setModified] = useState('');
    const [anullment, setAnullment] = useState('');
    const [finalAllocation, setFinalAllocation] = useState('');
    const [redistribuitionDataReinforcement, setRedistribuitionDataReinforcement] = useState('');
    const [redistribuitionDataAnnulment, setRedistribuitionDataAnnulment] = useState('');
    const [reserve, setReserve] = useState('');
    const [disponivel, setDisponivel] = useState(0); // Define um estado inicial



    // Função para filtrar as requisições
    const filteredRequests = requests.filter((request) => {
        const matchesState = stateFilter ? request.state.toString() === stateFilter : true;
        const matchesConformance = conformanceFilter ? request.conformance === conformanceFilter : true;
        return matchesState && matchesConformance;
    });


    const exportToPDFReq = () => {
        // 1. Título e subtítulo
        const title = "SEBADORA";
        const subtitle = "Lista das requisições";

        // 2. Cabeçalhos da tabela
        const headers = [
            ["Data", "Nº", "Fornecedor/ Beneficiário", "Nº Requisição Externa", "Nome do Requisitante", "Departamento", "Classificação Orçamental", "Valor", "Observações"]
        ];

        // 3. Pega dados da tabela com id="tableScroll"
        const tableElement = document.getElementById("tableScroll");

        let body = [];

        if (tableElement) {
            const rows = tableElement.getElementsByTagName("tr");
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName("td");
                if (cells.length >= 8) {
                    const rowData = [
                        cells[0].textContent.trim(),
                        cells[1].textContent.trim(),
                        cells[2].textContent.trim(),
                        cells[3].textContent.trim(),
                        cells[4].textContent.trim(),
                        cells[5].textContent.trim(),
                        cells[6].textContent.trim(),
                        cells[7].textContent.trim(),
                        cells[8].textContent.trim(),
                    ];
                    body.push(rowData);
                }
            }
        } else {
            console.warn("Elemento com ID 'tableScroll' não encontrado.");
        }

        // 4. Junta corpo com possíveis totais (se houver)
        const fullBody = [...body]; // Aqui pode incluir totais se quiser

        // 5. Dados do rodapé e metadados
        const footerText = "Documento gerado automaticamente";
        const logoImage = logoMz; // imagem base64 ou URL
        const savedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
        const generatedBy = savedUserData.fullName || "Usuário desconhecido";
        const filename = "relatorio_orcamento_anual_aprovado.pdf";

        // 6. Conteúdo da tabela no formato esperado pelo template
        const tableContent = {
            head: headers,
            body: fullBody
        };

        // 7. Geração do PDF via template
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


    // const exportToPDFData = () => {
    //     // Obter os filtros do formData
    //     const { accountPlanNumber, startDate, endDate } = formData;

    //     // Verificar se os filtros estão vazios
    //     if (!accountPlanNumber || !startDate || !endDate) {
    //         alert("swaalll não é possível imprimir PDF - pesquisa não feita");
    //         return; // Sai da função sem gerar o PDF
    //     }

    //     // 1. Informações básicas do documento
    //     const title = "SEBADORA";
    //     const subtitle = `Extrato da conta ${accountPlanNumber} no período de ${startDate} a ${endDate}`;
    //     const footerText = "Documento gerado automaticamente";
    //     const logoImage = logoMz;
    //     const savedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    //     const generatedBy = savedUserData.fullName || "Usuário desconhecido";
    //     const filename = `extrato_conta_${accountPlanNumber}_${startDate}_a_${endDate}.pdf`;

    //     // Restante do código permanece igual...
    //     const formatCurrency = (value) => {
    //         return new Intl.NumberFormat('pt-PT', {
    //             minimumFractionDigits: 2,
    //             maximumFractionDigits: 2,
    //         }).format(value);
    //     };

    //     // 2. Estrutura para armazenar todas as tabelas/seções
    //     const documentTables = [];

    //     // =============== SEÇÃO 1: FILTROS APLICADOS ===============
    //     // const filtersSection = {
    //     //     title: "FILTROS APLICADOS",
    //     //     headers: ["Parâmetro", "Valor"],
    //     //     rows: [
    //     //         ["Conta", accountPlanNumber],
    //     //         ["Data Início", startDate],
    //     //         ["Data Fim", endDate]
    //     //     ],
    //     //     columnStyles: {
    //     //         0: { fontStyle: 'bold' },
    //     //         1: { halign: 'left' }
    //     //     }
    //     // };
    //     // documentTables.push(filtersSection);

    //     // =============== SEÇÃO 2: ORÇAMENTO ANUAL ===============
    //     const budgetSection = {
    //         title: "ORÇAMENTO ANUAL",
    //         headers: ["Descrição", "Valor", "Histórico de Alterações", "Valor"],
    //         rows: [
    //             ["Dotação inicial", formatCurrency(initialAllocation), "Inscrição / Reforço", formatCurrency(insertAllocation)],
    //             ["Alterações", formatCurrency(Math.abs(modified)), "Anulação / Redução", formatCurrency(anullment)],
    //             ["Dotação final", formatCurrency(finalAllocation), "Redistribuição/Aumento", formatCurrency(redistribuitionDataReinforcement)],
    //             ["Disponível", formatCurrency(finalAllocation), "Redistribuição/diminuição", formatCurrency(redistribuitionDataAnnulment)]
    //         ],
    //         columnStyles: {
    //             1: { halign: 'right' },
    //             3: { halign: 'right' }
    //         }
    //     };
    //     documentTables.push(budgetSection);

    //     // =============== SEÇÃO 3: HISTÓRICO DE REQUISIÇÕES ===============
    //     const requisitionsSection = {
    //         title: "HISTÓRICO DE REQUISIÇÕES",
    //         headers: [
    //             "Data", "Nº", "Class. Orc.", "Fornecedor/Beneficiário",
    //             "Descrição", "Saldo Existente", "Valor", "Saldo"
    //         ],
    //         rows: [],
    //         columnStyles: {
    //             5: { halign: 'right' },
    //             6: { halign: 'right' },
    //             7: { halign: 'right' }
    //         }
    //     };

    //     // Coletar dados da tabela de requisições (HTML)
    //     const tableElement2 = document.getElementById('tableData3');
    //     if (tableElement2) {
    //         const rows = tableElement2.getElementsByTagName("tr");
    //         for (let i = 1; i < rows.length; i++) {
    //             const cells = rows[i].getElementsByTagName("td");
    //             if (cells.length >= 8) {
    //                 requisitionsSection.rows.push([
    //                     cells[0].textContent,
    //                     cells[1].textContent,
    //                     cells[2].textContent,
    //                     cells[3].textContent,
    //                     cells[4].textContent,
    //                     cells[5].textContent,
    //                     cells[6].textContent,
    //                     cells[7].textContent
    //                 ]);
    //             }
    //         }
    //     }
    //     documentTables.push(requisitionsSection);

    //     // =============== SEÇÃO 4: TOTAIS ===============
    //     const totalsSection = {
    //         title: "TOTAIS",
    //         headers: [],
    //         rows: [
    //             ["", "", "", "", "",
    //                 { content: formatCurrency(finalAllocation), styles: { fontStyle: 'bold', halign: 'right' } },
    //                 { content: formatCurrency(totalRequisicoes), styles: { fontStyle: 'bold', halign: 'right' } },
    //                 { content: formatCurrency(finalAllocation - totalRequisicoes), styles: { fontStyle: 'bold', halign: 'right' } }]
    //         ],
    //         columnStyles: {
    //             5: { fontStyle: 'bold', halign: 'right' },
    //             6: { fontStyle: 'bold', halign: 'right' },
    //             7: { fontStyle: 'bold', halign: 'right' }
    //         }
    //     };
    //     documentTables.push(totalsSection);

    //     // 3. Gerar PDF com tabelas separadas
    //     templateExtractPDF({
    //         title,
    //         subtitle,
    //         tables: documentTables,
    //         footerText,
    //         logoImage,
    //         generatedBy,
    //         filename
    //     });
    // };



    // Função principal com ambas as opções de exportação
    const exportToPDFData = (exportType = 'pdf') => {
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
                "Data", "Nº", "Class. Orc.", "Fornecedor/Beneficiário",
                "Descrição", "Saldo Existente", "Valor", "Saldo"
            ],
            rows: []
        };

        // Coletar dados da tabela de requisições (HTML)
        const tableElement2 = document.getElementById('tableData3');
        if (tableElement2) {
            const rows = tableElement2.getElementsByTagName("tr");
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName("td");
                if (cells.length >= 8) {
                    requisitionsSection.rows.push([
                        cells[0].textContent.trim(),
                        cells[1].textContent.trim(),
                        cells[2].textContent.trim(),
                        cells[3].textContent.trim(),
                        cells[4].textContent.trim(),
                        formatCurrency(parseFloat(cells[5].textContent.trim().replace(/[^\d,]/g, '').replace(',', '.')) || '0,00'),
                        formatCurrency(parseFloat(cells[6].textContent.trim().replace(/[^\d,]/g, '').replace(',', '.')) || '0,00'),
                        formatCurrency(parseFloat(cells[7].textContent.trim().replace(/[^\d,]/g, '').replace(',', '.')) || '0,00')
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
            exportToExcelD(documentTables, baseFilename);
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

    const exportToExcelD = (tables, filename) => {
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



    const exportToExcelReq = () => {
        const tableOriginal = document.getElementById("tableScroll");

        if (!tableOriginal) {
            console.error("Tabela não encontrada!");
            return;
        }

        // Criar um novo workbook e worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Requisições");

        // Definição dos headers personalizados
        const headers = [
            "Data", "Nº", "Fornecedor/ Beneficiário", "Nº Requisição Externa",
            "Nome do Requisitante", "Departamento", "Classificação Orçamental",
            "Valor", "Observações"
        ];
        const headerRow = worksheet.addRow(headers);

        // Aplicar estilo ao cabeçalho (fundo azul claro e negrito)
        headerRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true, color: { argb: "FFFFFFFF" } }; // Texto branco
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "#80827d" } // Azul escuro
            };
            cell.alignment = {
                horizontal: "left",
                vertical: "middle"
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
        });

        // Captura os dados da tabela, ignorando o cabeçalho original
        const rows = tableOriginal.querySelectorAll("tbody tr");
        rows.forEach(row => {
            const rowData = Array.from(row.children).map(cell => cell.innerText.trim());
            worksheet.addRow(rowData);
        });

        // Ajustar largura das colunas
        worksheet.columns = [
            { width: 10 }, // Data
            { width: 5 },  // Nº
            { width: 25 }, // Fornecedor/ Beneficiário
            { width: 20 }, // Nº Requisição Externa
            { width: 30 }, // Nome do Requisitante
            { width: 25 }, // Departamento
            { width: 25 }, // Classificação Orçamental
            { width: 20 },  // Valor
            { width: 20 }  // Observações
        ];

        // Criar e baixar o arquivo Excel
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            saveAs(blob, "Listagem_Requisições.xlsx");
        });
    };


    const exportToPDF = () => {
        // 1. Título e subtítulo
        const title = "SEBADORA";
        const subtitle = "Balancete de Execução Orçamental – Requisições";
        const table = document.querySelector('#BudjectOrc');
        const rows = Array.from(table.querySelectorAll('tr'));

        // 2. Cabeçalhos da tabela
        const headers = [
            ["Código", "Designação", "Dotação Disponível	", "Até ao Mês", "Durante o Mês", "Acumulado", "Saldo"]
        ];

        // 3. Dados da tabela principal
        const body = rows.slice(1).map(row =>
            Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.trim())
        );


        // 4. Totais formatados
        const totalRow = [
            "", "Total de Despesas Correntes:",
            formatNumber(totalCurrentExpenses * 2.5),
            formatNumber(currentExpenses.totalUntilMonth),
            formatNumber(currentExpenses.totalDuringMonth),
            formatNumber(currentExpenses.totalAccumulated),
            formatNumber((totalCurrentExpenses * 2.5) - currentExpenses.totalAccumulated)
        ];

        const totalRow2 = [
            "", "Total de Despesas de Capital:",
            formatNumber(totalCapitalExpenses * 2.5),
            formatNumber(capitalExpenses.totalUntilMonth),
            formatNumber(capitalExpenses.totalDuringMonth),
            formatNumber(capitalExpenses.totalAccumulated),
            formatNumber(capitalExpenses.totalBalance)
        ];
        const totalRow3 = [
            "", "Total Orçamento Global:",
            formatNumber((totalCurrentExpenses * 2.5) + (totalCapitalExpenses * 2.5)),
            formatNumber(totalOverall.totalUntilMonth),
            formatNumber(totalOverall.totalDuringMonth),
            formatNumber(totalOverall.totalAccumulated),
            formatNumber((totalCapitalExpenses * 2.5) + (totalCurrentExpenses * 2.5) - totalOverall.totalAccumulated)
        ];

        // 5. Junta corpo com os totais
        const fullBody = [...body, totalRow, totalRow2, totalRow3];

        // 6. Dados do rodapé e metadados
        const footerText = "Documento gerado automaticamente";
        const logoImage = logoMz; // imagem base64 ou URL
        const savedUserData = JSON.parse(localStorage.getItem("userData"));
        const generatedBy = savedUserData.fullName.toString();
        const filename = "sa.pdf";

        // 7. Conteúdo da tabela no formato esperado pelo template
        const tableContent = {
            head: headers,
            body: fullBody
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



    const exportToExcel = () => {
        // 1. Obter dados da tabela HTML
        const table = document.querySelector('#BudjectOrc');
        const rows = Array.from(table.querySelectorAll('tr'));

        // 2. Configurações básicas
        const title = "SEBADORA";
        const subtitle = "Balancete de Execução Orçamental – Requisições";
        const savedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
        const generatedBy = savedUserData.fullName || "Usuário desconhecido";
        const generationDate = new Date().toLocaleDateString('pt-PT');
        const filename = "Balancete_Orcamental_" + new Date().toISOString().split('T')[0];

        // 3. Função para formatar números (sem símbolo de moeda)
        const formatNumber = (value) => {
            return new Intl.NumberFormat('pt-PT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        };

        // 4. Preparar dados para a planilha
        const workbook = XLSX.utils.book_new();
        const worksheetData = [
            [title],
            [subtitle],
            [""],
            [`Gerado por: ${generatedBy} em ${generationDate}`],
            [""],
            ["Código", "Designação", "Dotação Disponível", "Até ao Mês", "Durante o Mês", "Acumulado", "Saldo"]
        ];

        // 5. Adicionar linhas da tabela principal
        rows.slice(1).forEach(row => {
            const rowData = Array.from(row.querySelectorAll('td')).map(cell => {
                const text = cell.textContent.trim();
                // Converter valores numéricos
                return text.match(/^\d+[,.]\d+$/) ?
                    parseFloat(text.replace(',', '.')) : text;
            });
            worksheetData.push(rowData);
        });

        const totalRow3 = [
            "", "Total Orçamento Global:",
            formatNumber((totalCurrentExpenses * 2.5) + totalMznDespesas),
            formatNumber(totalOverall.totalUntilMonth),
            formatNumber(totalOverall.totalDuringMonth),
            formatNumber(totalOverall.totalAccumulated),
            formatNumber((totalCapitalExpenses * 2.5) + totalMznDespesas - totalOverall.totalAccumulated)
        ];

        // 6. Adicionar linhas de totais
        worksheetData.push([
            "", "Total de Despesas Correntes:",
            (totalCurrentExpenses * 2.5),
            (currentExpenses.totalUntilMonth),
            (currentExpenses.totalDuringMonth),
            (currentExpenses.totalAccumulated),
            ((totalCurrentExpenses * 2.5) - currentExpenses.totalAccumulated)
        ]);

        worksheetData.push([
            "", "Total de Despesas de Capital:",
            (totalCapitalExpenses * 2.5),
            (capitalExpenses.totalUntilMonth),
            (capitalExpenses.totalDuringMonth),
            (capitalExpenses.totalAccumulated),
            (capitalExpenses.totalBalance)
        ]);



        worksheetData.push([
            "", "Total Orçamento Global:",
            ((totalCapitalExpenses * 2.5) + (totalCurrentExpenses * 2.5)),
            (totalOverall.totalUntilMonth),
            (totalOverall.totalDuringMonth),
            (totalOverall.totalAccumulated),
            ((totalCapitalExpenses * 2.5) + (totalCurrentExpenses * 2.5) - totalOverall.totalAccumulated)
        ]);


        // 7. Adicionar rodapé
        worksheetData.push([""]);
        worksheetData.push(["Documento gerado automaticamente"]);

        // 8. Criar planilha e configurar formatação
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Configurar largura das colunas
        worksheet['!cols'] = [
            { wch: 15 }, // Código
            { wch: 40 }, // Designação
            { wch: 18 }, // Dotação Disponível
            { wch: 15 }, // Até ao Mês
            { wch: 15 }, // Durante o Mês
            { wch: 15 }, // Acumulado
            { wch: 15 }  // Saldo
        ];

        // Aplicar estilos
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell_address = { c: C, r: R };
                const cell_ref = XLSX.utils.encode_cell(cell_address);
                const cell = worksheet[cell_ref];
                if (!cell) continue;

                // Estilo base
                cell.s = {
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } }
                    },
                    alignment: {
                        vertical: "center",
                        wrapText: true
                    }
                };

                // Cabeçalhos
                if (R === 5) {
                    cell.s.fill = { fgColor: { rgb: "4472C4" } }; // Azul
                    cell.s.font = { bold: true, color: { rgb: "FFFFFF" } };
                    cell.s.alignment = { horizontal: "center" };
                }

                // Título
                if (R === 0) {
                    cell.s.font = { bold: true, sz: 16, color: { rgb: "2F5597" } };
                    cell.s.alignment = { horizontal: "center" };
                }

                // Subtítulo
                if (R === 1) {
                    cell.s.font = { bold: true, italic: true };
                    cell.s.alignment = { horizontal: "center" };
                }

                // Linhas de totais
                if ([worksheetData.length - 5, worksheetData.length - 4, worksheetData.length - 3].includes(R)) {
                    cell.s.fill = { fgColor: { rgb: "F2F2F2" } };
                    cell.s.font = { bold: true };

                    // Formato numérico para valores
                    if (C >= 2 && cell.v !== "") {
                        cell.t = 'n'; // Tipo numérico
                        cell.z = '#,##0.00'; // Formato
                    }
                }
            }
        }

        // 9. Mesclar células do título
        worksheet['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Título
            { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }  // Subtítulo
        ];

        // 10. Gerar arquivo Excel
        XLSX.utils.book_append_sheet(workbook, worksheet, "Balancete");
        XLSX.writeFile(workbook, `${filename}.xlsx`, { bookType: 'xlsx', cellStyles: true });
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
    const generatePDFRows = (account, level = 0) => {
        const indentation = "  ".repeat(level); // Espaçamento para hierarquia
        const isParentAccount = account.children && account.children.length > 0;
        const finalAllocation = calculateFinalAllocationA(account);
        const usdValue = (finalAllocation * 2.5)?.toFixed(2) || 0; // Valor em USD
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
        let totalAmountForAccount = calculateTotalAllocation(account, internalRequestsValid);

        const accountNumber = account.accountPlan.number;

        const currentMonth = selectedMonth ? parseInt(selectedMonth) : new Date().getMonth() + 1;

        // Recalcular totalAmountForAccount para casos especiais
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

        // Recalcular valores mensais para contas específicas
        if (accountNumber === "1.0.0.0.00") {
            totalForCurrentMonth = calculateSiblingAllocationReq21ByDate(internalRequestsValid, currentMonth);
            totalUntilLastMonth = calculateSiblingAllocationReq21ByDate(internalRequestsValid, currentMonth - 1);
        } else if (accountNumber === "1.1.0.0.00") {
            totalForCurrentMonth = calculateSiblingAllocationReq2100ByDate(internalRequestsValid, currentMonth);
            totalUntilLastMonth = calculateSiblingAllocationReq2100ByDate(internalRequestsValid, currentMonth - 1);
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


    const loadAccountInternalRequest = async () => {
        try {
            setLoading(true);
            const response = await fetchAccountRequestWhitConformance();
            // const filteredParentAccounts = response.filter(account => account.accountPlan.type === 'budject');

            setInternalRequests(response);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
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
    

    const calculateSiblingAllocationReq2100ByDate = (internalRequests, month) => {
        let total = 0;

        internalRequests.forEach((req) => {
            const accountNumber = req.accountPlanBudject?.number;
            const startsWithPrefix = accountNumber?.startsWith("1.1.");

            const requestMonth = new Date(req.createdAt).getMonth() + 1; // Extrai o mês (1 a 12)

            if (startsWithPrefix && requestMonth === month) {
                total += parseFloat(req.totalAmount || 0);
            }
        });

        return total;
    };

    const calculateSiblingAllocationReq21ByDate = (internalRequests, month) => {
        let total = 0;

        const currentYear = new Date().getFullYear();


        internalRequests.forEach((req) => {
            const accountNumber = req.accountPlanBudject?.number;
            const startsWithPrefix = accountNumber?.startsWith("1.");

            const requestMonth = new Date(req.createdAt).getMonth() + 1; // Extrai o mês (1 a 12)

            if (startsWithPrefix && requestMonth === month) {
                total += parseFloat(req.totalAmount || 0);
            }
        });

        return total;
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

    ///####################################################################################
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

    useEffect(() => {
        loadAccounts();
        loadOpenAccount();
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

    const totalMznExpenses = totalCurrentContraValorData * 2.5;

    const totalDuedecimoData = totalMzn / 12;
    const totalCurrentContraValorDataDespesas = valuesAccounts
        .slice(7) // Garante que apenas os 7 primeiros elementos sejam usados
        .reduce((sum, account) => sum + (account.total_allocation || 0), 0);
    const totalMznDespesas = totalCurrentContraValorDataDespesas * 2.5;
    const totalDuedecimoDataDespesas = totalMznDespesas / 12;
    const total = totalCurrentContraValorData + totalCurrentContraValorDataDespesas;
    const totalMznF = total * 2.5;
    const totalDuedecimoF = totalMznF / 12;






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

    ////####################################################################################
    // Renderiza a tabela com base no relatório selecionado
    // 1. Função para calcular os totais consolidados
    const calculateConsolidatedTotalsSemDuplicacao = () => {
        // Inicializa com totalAvailableBudget = totalMzn (corrente) e totalMzn2 (capital)
        let currentExpenses = {
            totalAvailableBudget: totalCurrentExpenses * 2.5,
            totalUntilMonth: 0,
            totalDuringMonth: 0,
            totalAccumulated: 0,
            totalBalance: totalCurrentExpenses * 2.5 // Inicializa com o valor total, será ajustado depois
        };

        let capitalExpenses = {
            totalAvailableBudget: totalCapitalExpenses * 2.5,
            totalUntilMonth: 0,
            totalDuringMonth: 0,
            totalAccumulated: 0,
            totalBalance: totalCapitalExpenses * 2.5 // Inicializa com o valor total, será ajustado depois
        };

        const currentMonth = selectedMonth ? parseInt(selectedMonth) : new Date().getMonth() + 1;

        const processTopLevelAccountOnly = (account) => {
            if (account.parentAccount) return;

            const finalAllocation = calculateFinalAllocationA(account);
            const totalForCurrentMonth = calculateTotalAllocationByMonthFilter(account, internalRequestsValid, currentMonth);
            const totalUntilLastMonth = calculateTotalAllocationByMonthFilter(account, internalRequestsValid, currentMonth, true);
            const totalAccumulated = totalUntilLastMonth + totalForCurrentMonth;

            const isCorrente = account.accountPlan.number.startsWith('1.');
            const target = isCorrente ? currentExpenses : capitalExpenses;

            target.totalUntilMonth += totalUntilLastMonth;
            target.totalDuringMonth += totalForCurrentMonth;
            target.totalAccumulated += totalAccumulated;
            // Removemos o cálculo de balance aqui, será feito depois
        };

        organizedAccounts.forEach(processTopLevelAccountOnly);

        // Agora calcula os saldos finais
        currentExpenses.totalBalance = currentExpenses.totalAvailableBudget - currentExpenses.totalAccumulated;
        capitalExpenses.totalBalance = capitalExpenses.totalAvailableBudget - capitalExpenses.totalAccumulated;

        const totalOverall = {
            totalAvailableBudget: currentExpenses.totalAvailableBudget + capitalExpenses.totalAvailableBudget,
            totalUntilMonth: currentExpenses.totalUntilMonth + capitalExpenses.totalUntilMonth,
            totalDuringMonth: currentExpenses.totalDuringMonth + capitalExpenses.totalDuringMonth,
            totalAccumulated: currentExpenses.totalAccumulated + capitalExpenses.totalAccumulated,
            totalBalance: (currentExpenses.totalAvailableBudget + capitalExpenses.totalAvailableBudget) -
                (currentExpenses.totalAccumulated + capitalExpenses.totalAccumulated)
        };

        return { currentExpenses, capitalExpenses, totalOverall };
    };

    // Chamada:
    const { currentExpenses, capitalExpenses, totalOverall } = calculateConsolidatedTotalsSemDuplicacao();


    const renderTable = () => {
        switch (selectedReport) {
            case "Balancete de Execução Orçamental – Requisições":
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
                                    }}
                                >
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
                                        { label: "Até ao Mês", value: currentExpenses.totalUntilMonth, color: "#bdc3c7", icon: "↗" },
                                        { label: "Durante o Mês", value: currentExpenses.totalDuringMonth, color: "#e74c3c", icon: "↓" },
                                        { label: "Acumulado", value: currentExpenses.totalAccumulated, color: "#bdc3c7", icon: "↘" },
                                        {
                                            label: "Saldo",
                                            value: (totalCurrentExpenses * 2.5) - currentExpenses.totalAccumulated,
                                            color: ((totalCurrentExpenses * 2.5) - currentExpenses.totalAccumulated) >= 0 ? "#2ecc71" : "#e74c3c",
                                            icon: ((totalCurrentExpenses * 2.5) - currentExpenses.totalAccumulated) >= 0 ? "✓" : "✗",
                                            isTotal: true
                                        }
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
                                        { label: "Até ao Mês", value: capitalExpenses.totalUntilMonth, color: "#bdc3c7", icon: "↗" },
                                        { label: "Durante o Mês", value: capitalExpenses.totalDuringMonth, color: "#e74c3c", icon: "↓" },
                                        { label: "Acumulado", value: capitalExpenses.totalAccumulated, color: "#bdc3c7", icon: "↘" },
                                        { label: "Saldo", value: capitalExpenses.totalBalance, color: capitalExpenses.totalBalance >= 0 ? "#2ecc71" : "#e74c3c", icon: capitalExpenses.totalBalance >= 0 ? "✓" : "✗", isTotal: true }
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
                                        { label: "Dotação Disponível", value: (totalCapitalExpenses * 2.5) + (totalCurrentExpenses * 2.5), color: "#2ecc71", icon: "↑" },
                                        { label: "Até ao Mês", value: totalOverall.totalUntilMonth, color: "#bdc3c7", icon: "↗" },
                                        { label: "Durante o Mês", value: totalOverall.totalDuringMonth, color: "#e74c3c", icon: "↓" },
                                        { label: "Acumulado", value: totalOverall.totalAccumulated, color: "#bdc3c7", icon: "↘" },
                                        {
                                            label: "Saldo",
                                            value: (totalCapitalExpenses * 2.5) + (totalCurrentExpenses * 2.5) - totalOverall.totalAccumulated,
                                            color: ((totalCapitalExpenses * 2.5) + (totalCurrentExpenses * 2.5) - totalOverall.totalAccumulated) >= 0 ? "#2ecc71" : "#e74c3c",
                                            icon: ((totalCapitalExpenses * 2.5) + (totalCurrentExpenses * 2.5) - totalOverall.totalAccumulated) >= 0 ? "✓" : "✗",
                                            isTotal: true
                                        }
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
                        </div>
                    </div>
                );
            case "Extracto de Conta -Requisição de Fundos":
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
                                    onClick={() => exportToPDFData('excel')}
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
                            <table id="tableData3" className="table table-striped table-bordered table-hover">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Nº</th>
                                        <th>Class. Orc.</th>
                                        <th>Fornecedor/Beneficiário</th>
                                        <th>Descrição</th>
                                        <th>Saldo inicial existente</th>
                                        <th>Valor</th>
                                        <th>Saldo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requestsFilter && requestsFilter.length > 0 ? (() => {
                                        let acumulado = 0; // Inicializa o acumulador fora do map

                                        return requestsFilter.map((item, index) => {
                                            const totalAmount = parseFloat(item.totalAmount) || 0;
                                            const totalAmountVoided = parseFloat(item.totalAmountReturned) || 0;
                                            const saldoExistente = parseFloat(item.saldoExistente) || 0;
                                            const valorAcumulado = parseFloat(item.valorAcumulado) || 0;
                                            const saldoanterior = parseFloat(item.valorComSaldo) || 0;
                                            const isVoided = item.isVoided === true;

                                            const saldo2 = saldoanterior - totalAmountVoided;
                                            const saldo3 = saldo2 + totalAmountVoided;

                                            const saldoInicial = saldoExistente + valorAcumulado;

                                            return (
                                                <tr key={`${item.id}-${index}`}>
                                                    <td className={isVoided ? "text-danger" : ""}>
                                                        {isVoided
                                                            ? new Date(item.createdAt).toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                                            : (item.operationDate || 'N/D')
                                                        }
                                                    </td>                        <td className={isVoided ? "text-danger" : ""}>{item.internalRequest?.requestNumber || 'N/D'}</td>
                                                    <td className={isVoided ? "text-danger" : ""}>
                                                        {item.accountPlanBudject
                                                            ? `${item.accountPlanBudject.number} - ${item.accountPlanBudject.description || 'Sem descrição'}`
                                                            : 'N/A'}
                                                    </td>
                                                    <td className={isVoided ? "text-danger" : ""}>
                                                        {item.internalRequest?.accountPlanFinancial?.description ||
                                                            item.beneficiaryName?.description ||
                                                            'N/A'}
                                                    </td>
                                                    <td className={isVoided ? "text-danger" : ""}>{isVoided ? 'REQ ANULADA' : item.description || 'Sem justificativa'}</td>
                                                    <td className={isVoided ? "text-danger" : ""}>{isVoided ? (saldo2).toLocaleString('pt-MZ', { minimumFractionDigits: 2 }) : parseFloat(item.saldoInicial).toFixed(2)}</td>
                                                    <td className={isVoided ? "text-danger" : ""}>{isVoided ? `-${totalAmountVoided.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}` : totalAmount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}</td>
                                                    <td className={isVoided ? "text-danger" : ""}>{isVoided ? saldo3.toLocaleString('pt-MZ', { minimumFractionDigits: 2 }) : saldoExistente.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            );
                                        });
                                    })() : (
                                        <tr>
                                            <td colSpan="8" style={{ textAlign: "center", fontStyle: "italic", color: "gray" }}>
                                                {requestsFilter ? 'Dados não encontrados.' : 'Carregando dados...'}
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
            case "Listagem de Requisições":
                return (
                    <div className="premium-container">
                        {/* Formulário para Filtros */}
                        <div style={styles.container}>
                            <select
                                className="form-select border-black"
                                style={{ marginBottom: '10px', flex: 1 }}
                                onChange={(e) => setStateFilter(e.target.value)}
                                value={stateFilter}
                            >
                                <option value="">Selecione o Estado</option>
                                <option value="1">Emitidas</option>
                                <option value="0">Pendentes</option>
                            </select>

                            <select
                                className="form-select border-black"
                                style={{ marginBottom: '10px', flex: 1 }}
                                onChange={(e) => setConformanceFilter(e.target.value)}
                                value={conformanceFilter}
                            >
                                <option value="">Selecione a Conformidade</option>
                                <option value="CONFORMED">Aprovadas</option>
                                <option value="WITHOUT_CONFORMANCE">Anuladas</option>
                            </select>
                            {/* Botões para Exportação */}
                            <div className="mb-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                <button
                                    onClick={exportToExcelReq}
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
                                    onClick={exportToPDFReq}
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

                        {/* Tabela com ScrollView */}
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
                        >                            <table id='tableScroll' className="table table-striped table-bordered table-hover"
                        >
                                <thead>
                                    <tr>
                                        <th style={{ width: '150px', fontSize: '14px', textAlign: 'left' }}>Data</th>
                                        <th style={{ width: '30px', fontSize: '14x', textAlign: 'left' }}>Nº</th>
                                        <th style={{ width: '150px', fontSize: '14px', textAlign: 'left' }}>Fornecedor/ Beneficiário</th>
                                        <th style={{ width: '180px', fontSize: '14px', textAlign: 'left' }}>Nº Requisição Externa</th>
                                        <th style={{ width: '150px', fontSize: '14px', textAlign: 'left' }}>Nome do Requisitante</th>
                                        <th style={{ width: '120px', fontSize: '14px', textAlign: 'left' }}>Departamento</th>
                                        <th style={{ width: '200px', fontSize: '14px', textAlign: 'left' }}>Classificação Orçamental</th>
                                        <th style={{ width: '100px', fontSize: '14px', textAlign: 'left' }}>Valor</th>
                                        <th style={{ width: '150px', fontSize: '14px', textAlign: 'left' }}>Observações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map((request) => (
                                        <tr key={request.id}>
                                            <td style={{ fontSize: '14px', textAlign: 'left' }}>{request.operationDate}</td>
                                            <td style={{ fontSize: '14px', textAlign: 'left' }}>{request.sequence}</td>
                                            <td style={{ fontSize: '14px', textAlign: 'left' }}>{request.accountPlanFinancial?.description || 'N/A'}</td>
                                            <td style={{ fontSize: '14px', textAlign: 'left' }}>{request.requestNumber}</td>
                                            <td style={{ fontSize: '14px', textAlign: 'left' }}>{request.requestorName}</td>
                                            <td style={{ fontSize: '14px', textAlign: 'left' }}>{request.requestorDepartment}</td>
                                            <td style={{ fontSize: '14px', textAlign: 'left' }}>{`${request.sectorBudject} - ${request.chapterBudject} - ${request.clauseBudject}${request.clauseNumberBudject}`}</td>
                                            <td style={{ fontSize: '14px', textAlign: 'left' }}>{request.totalRequestedValue.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</td>
                                            <td style={{ fontSize: '14px', textAlign: 'left' }}>{request.justification || 'Sem observações'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Estatísticas */}
                        {/* Estatísticas Premium */}
                        <div style={{
                            background: 'linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)',
                            padding: '25px',
                            borderRadius: '12px',
                            margin: '0 auto 30px auto',
                            width: '100%',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                            color: 'white',
                            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                        }}>
                            <h4 style={{
                                marginBottom: '25px',
                                textAlign: 'center',
                                fontWeight: '600',
                                fontSize: '1.4rem',
                                letterSpacing: '0.5px',
                                color: '#fff',
                                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}>ESTATÍSTICAS</h4>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '15px'
                            }}>
                                {[
                                    { label: 'Emitidas', value: requests.filter(r => r.state === 1).length.toLocaleString(), color: '#4cd137' },
                                    { label: 'Aprovadas', value: requests.filter(r => r.conformance === 'CONFORMED').length.toLocaleString(), color: '#00a8ff' },
                                    { label: 'Pendentes', value: requests.filter(r => r.state === 0).length.toLocaleString(), color: '#fbc531' },
                                    { label: 'Anuladas', value: requests.filter(r => r.conformance === 'WITHOUT_CONFORMANCE').length.toLocaleString(), color: '#e84118' }
                                ].map((stat, index) => (
                                    <div key={index} style={{
                                        flex: '1',
                                        minWidth: '120px',
                                        textAlign: 'center',
                                        padding: '15px 10px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        backdropFilter: 'blur(5px)',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <p style={{
                                            margin: '0 0 5px 0',
                                            fontSize: '0.9rem',
                                            opacity: 0.9
                                        }}>{stat.label}</p>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '1.5rem',
                                            fontWeight: '600',
                                            color: stat.color
                                        }}>{stat.value}</p>
                                    </div>
                                ))}
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
                        <h3>RELATÓRIOS DAS REQUISIÇÕES</h3>
                        <p>Listagem Geral de Requisições, Balancetes Orçamentais e Extratos de Fundos</p>
                    </div>
                </div>
                <div className="header-action-area">
                    <select
                        value={selectedReport}
                        onChange={(e) => setSelectedReport(e.target.value)}
                        className="sgf-header-select"
                    >
                        <option value="">-- Selecione o Relatório --</option>
                        <option value="Listagem de Requisições">
                            Listagem de Requisições
                        </option>
                        <option value="Balancete de Execução Orçamental – Requisições">
                            Balancete de Execução Orçamental – Requisições
                        </option>
                        <option value="Extracto de Conta -Requisição de Fundos">
                            Extracto de Conta -Requisição de Fundos
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

export default RequestReports;
