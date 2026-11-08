import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchOpenAccount, annullmentRequest0, createOpenAccount, findAccountRequestWhitConformance, getRegisteredAccounts, fetchAllAccountingJournalEntryAll, findAccountPlanBudjectEntriesByYear, fetchAccountRequestWhitConformance, fetchAllAccountingJournalEntry, createBankOutAccountingJournal, createBillToReceiveAccountingJournal } from '../../services/accountService';
import Swal from 'sweetalert2';

import { Modal, Form, Button, Badge, Card, Row, Col, Table } from 'react-bootstrap';

import './style.css';
import { useNavigate } from "react-router-dom";
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { FaCreditCard, FaHandshake, FaSearch, FaMoneyBillWave, FaUndo, FaMoneyCheck, FaExchangeAlt } from 'react-icons/fa'; // Importando ícones
import { generatePdf } from '../pdf/util/pdfUtils';  // Ajuste o caminho conforme necessário
import BankingOperations from './BankingOperations'; // Ajuste o caminho conforme sua estrutura

import BankingOperationsReports from './BankingOperationsReports'; // Ajuste o caminho conforme sua estrutura

import AnullmentOperationModal from './AnullmentOperationModal'; // Ajuste o caminho conforme sua estrutura



const Operations = () => {
    const [loading, setLoading] = useState(false);
    const [diaries, setDiaries] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [selectedDiary, setSelectedDiary] = useState(null);
    const [selectedDocumentId, setSelectedDocumentId] = useState(null);
    const [exchangeRate, setExchangeRate] = useState("1");
    const [generalDescription, setGeneralDescription] = useState("Abertura");
    const [tableData, setTableData] = useState([]); // Estado para armazenar os dados da tabela
    const [tableDataBudject, setTableDataBudject] = useState([]); // Estado para armazenar os dados da tabela
    const [tableDataInfo, setTableDataInfo] = useState([]); // Estado para armazenar os dados da tabela
    const [accounts, setAccounts] = useState([]);
    const history = useHistory();
    const [requisition, setRequisition] = useState("");
    const [comprov, setComprov] = useState("");
    const [requests, setRequests] = useState([]);
    const [requestsToPay, setRequestsToPay] = useState([]);
    const [accountFinancial, setAccountFinancial] = useState([]);
    const [financialTableData, setFinancialTableData] = useState([]);
    const [accountsData, setAccountData] = useState([]);
    const [filter, setFilter] = useState('CONFORMED'); // Filtro atual: 'PENDING', 'APPROVED', ou 'REJECTED'
    const [selectedRow, setSelectedRow] = useState(null); // Linha selecionada
    const [paymentType, setPaymentType] = useState(null); // Linha selecionada
    const [documentType, setDocumentType] = useState(null); // Linha selecionada
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [operationDate, setOperationDate] = useState("");
    const [createOpenAccountDataSend, setCreateOpenAccountDataSend] = useState(null);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const [namePersonCharge, setNamePersonCharge] = useState('');

    const [paymentDocument, setPaymentDocument] = useState("");
    const [saldo, setSaldo] = useState("");
    const [logoMzBase64, setLogoMzBase64] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null); // URL do preview do PDF

    const [documentSend, setDocumentSend] = useState("");
    const [isSubmitButtonVisible, setSubmitButtonVisible] = useState(true);
    const [isPaymentTypeVisible, setPaymentTypeVisible] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);


    const [operationRegister, setOperationRegister] = useState([]);
    const [showAnullmentOperationsModal, setShowAnullmentOperationsModal] = useState(false);

    useEffect(() => {
        const savedUserData = JSON.parse(localStorage.getItem("userData"));

        if (savedUserData && savedUserData.fullName) {
            const userFullName = savedUserData.fullName.toString();
            setNamePersonCharge(userFullName);
            console.log("savedUserData", userFullName);
        } else {
            console.log("Nenhum dado encontrado.");
        }
    }, []);

    //Adicionando renderizacao condicional
    const [activeTab, setActiveTab] = useState(''); // Estado para controlar a aba ativa
    //const [activeTab, setActiveTab] = useState(null); // para comecar com estado nulo
    const handlePaymentComplete = (paymentData) => {
        console.log('Pagamento concluído:', paymentData);
        // Aqui você pode adicionar a lógica para processar o pagamento
        // Ex: chamar uma API, atualizar estado, etc.
    };

    const handlePaymentCardClick = (request) => {
        setShowModal(true);
    };

    const loadDiariesWithDocuments = async () => {
        try {
            setLoading(true);
            const response = await fetchOpenAccount();
            console.log("Diários e Documentos Recebidos:", response);
            setDiaries(response);
            setDocuments(response.documents)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const submitRequest = async () => {
        try {
            await createOpenAccount(createOpenAccountDataSend);
            return true;
        } catch (error) {
            console.error("❌ Erro ao registrar a abertura:", error);
            await Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao registrar a abertura! Tente novamente.',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#dc3545',
            });
            return false;
        }
    };

    const [resultData, setResultData] = useState({
        debit: 0,
        credit: 0,
        balance: 0
    });

    const validateOperations = async () => {
        // Verifica se existe pelo menos uma linha
        if (tableData.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Por favor, adicione ao menos uma operação.',
            });
            return false;
        }

        if (!operationDate) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Por favor, selecione a data da operação.',
            }); return false;
        }

        // Calcula o total de débito e crédito
        const totalDebito = tableData.reduce((total, row) => total + (parseFloat(row.debit) || 0), 0);
        const totalCredito = tableData.reduce((total, row) => total + (parseFloat(row.credit) || 0), 0);

        // Validação: Débito deve ser igual ao Crédito
        if (totalDebito !== totalCredito) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: `O total de Débito (${totalDebito.toFixed(2)}) deve ser igual ao total de Crédito (${totalCredito.toFixed(2)}).`,
            });
            return false;
        }

        // Verifica se há contas duplicadas
        const accountSet = new Set();
        const hasDuplicateAccounts = tableData.some(row => {
            if (accountSet.has(row.account)) {
                return true;
            }
            accountSet.add(row.account);
            return false;
        });

        if (hasDuplicateAccounts) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Não é permitido ter duas operações com o mesmo número de conta.',
            });
            return false;
        }

        // Validação de campos obrigatórios em cada item (tableData)
        const missingItems = tableData.some(row =>
            !row.account
        );

        if (missingItems) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Todos os campos dos itens devem estar preenchidos corretamente.',
            });
            return false;
        }

        // Criando a estrutura de dados para envio
        // const tableDataToSend = tableData.map((row, index) => ({
        //     accountPlanNumber: row.account,
        //     value: index === 0 ? row.debit : row.credit,
        //     operator: index === 0 ? "DEBIT" : "CREDIT",
        //     description: row.description || "Bancos Entradas",
        //     accountPlanYearId: row.accountPlanYearId,
        //     accountPlanId: row.accountPlanId,
        //     operationDate: row.operationDate || data,
        // }));

        const tableDataToSend = tableData.map((row) => {
            const isDebit = !!row.debit && parseFloat(row.debit) > 0;
            const isCredit = !!row.credit && parseFloat(row.credit) > 0;

            return {
                accountPlanNumber: row.account,
                value: isDebit ? parseFloat(row.debit) : parseFloat(row.credit),
                operator: isDebit ? "DEBIT" : "CREDIT",
                description: row.description || "Contas a Receber",
                accountPlanYearId: row.accountPlanYearId,
                accountPlanId: row.accountPlanId,
                operationDate: row.operationDate || data,
            };
        });

        // Validação de campos obrigatórios gerais
        const missingFields = [];
        if (!selectedCurrency) missingFields.push("Moeda");
        if (!exchangeRate) missingFields.push("Taxa de Câmbio");
        if (!generalDescription) missingFields.push("Descrição Geral");
        if (!formOpen.documentNumber) missingFields.push("Numero do Documento")

        if (missingFields.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Erro ao enviar',
                text: `Os seguintes campos estão em falta: ${missingFields.join(", ")}`,
            });
            return false;
        }

        // Dados finais da requisição
        const createOpenAccountData = {
            operationDate: operationDate,
            accountingJournalNumber: "00",
            accountingDocumentNumber: formOpen.documentNumber,
            exchangeRate: exchangeRate,
            generalDescription: generalDescription,
            items: tableDataToSend,
            journalDocumentNumber: String("2").trim(),
            receivable: 0,
            transactionType: "",
            paid: 0
        };

        console.log("Minha Requisição", createOpenAccountData);
        setCreateOpenAccountDataSend(createOpenAccountData);
    };
    // Estado para armazenar as linhas da tabela
    const [rows, setRows] = useState([
        { account: "", debit: "", credit: "", description: "" },
        { account: "", debit: "", credit: "", description: "" },
    ]);
    // const addRow = () => {
    //     setRows([...rows, { account: "", debit: "", credit: "", description: "" }]);
    // };

    const handleBlur = () => {
        // Filtra a requisição
        const filteredRequest = requests.filter(account => account.internalRequest.requestNumber === requisition);

        // Verifica se não há requisição encontrada
        if (filteredRequest.length === 0) {
            // Exibe uma mensagem de erro com SweetAlert2
            Swal.fire({
                icon: 'error',
                title: 'Requisição não encontrada',
                text: 'Não foi possível localizar a requisição com o número fornecido.',
            });

            // Esvazia os dados da tabela
            setTableData([]);
            setResultData({
                debit: 0,
                credit: 0,
                balance: 0
            });

            return; // Interrompe a execução do código se a requisição não for encontrada
        }

        // Obtém os dados caso a requisição seja encontrada
        const debitAccount = filteredRequest[0].internalRequest.bankValue;
        const financialBankAccount = accountFinancial.filter(account => account.number === debitAccount);

        console.log("filteredRequest[0]", filteredRequest[0])
        const totalRequestedValue = filteredRequest[0].internalRequest.totalRequestedValue;
        // const debitAccountFiltered = `${financialBankAccount[0].number} - ${financialBankAccount[0].description}`;
        const creditAccountFiltered = `${filteredRequest[0].internalRequest.accountPlanFinancial.number} - ${filteredRequest[0].internalRequest.accountPlanFinancial.description}`;
        const budjectCreditAccountFiltered = `${filteredRequest[0].internalRequest.accountPlanBudject.number} - ${filteredRequest[0].internalRequest.accountPlanBudject.description}`;

        const description = filteredRequest[0].description;

        // Cria os dados para a tabela
        const newTableData = [
            {
                // account: debitAccountFiltered,  // Conta Financeira (Débito)

                debit: 0,                       // Débito
                credit: totalRequestedValue,  // Crédito
                description: description,       // Descrição
            },
            {
                account: creditAccountFiltered, // Conta Financeira (Crédito)
                debit: totalRequestedValue,     // Débito
                credit: 0,
                description: description,       // Descrição
            },
        ];

        const newTableDataFinancial = [
            {
                account: budjectCreditAccountFiltered,  // Conta Financeira (Débito)
                debit: totalRequestedValue,  // Crédito
                description: description,       // Descrição
            },
        ]

        // Calcula o total de Débito, Crédito e Saldo
        const totalDebit = newTableData.reduce((acc, row) => acc + row.debit, 0);
        const totalCredit = newTableData.reduce((acc, row) => acc + row.credit, 0);
        const totalBalance = totalCredit - totalDebit;

        // Atualiza o estado da tabela com os novos dados
        setTableData(newTableData);
        setFinancialTableData(newTableDataFinancial);
        setResultData({
            debit: totalDebit,
            credit: totalCredit,
            balance: totalBalance
        });


        console.log("newTableData", newTableData);
    };
    const handleRowDoubleClickAnull = (request) => {
        // Marcar a linha como selecionada
        setSelectedRequest(request);

        console.log("annullmentRequest0", request.requestNumber);

        // Exibir o SweetAlert de confirmação com campo de justificativa
        Swal.fire({
            title: 'Deseja anular esta operação?',
            text: `Requisição número: ${request.requestNumber}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, anular!',
            cancelButtonText: 'Não',
            preConfirm: () => {
                const motivo = Swal.getPopup().querySelector('#justificativa').value;
                if (!motivo) {
                    Swal.showValidationMessage('Por favor, informe o motivo da anulação!');
                }
                return motivo;
            },
            html: `
                <textarea id="justificativa" class="swal2-input" placeholder="Informe o motivo da anulação..." style="width: 100%; height: 100px;"></textarea>
            `,
        }).then(async (result) => {
            if (result.isConfirmed) {
                const motivo = result.value; // O motivo fornecido pelo usuário
                const formattedDate = new Date().toISOString().split('T')[0]; // Obtém a data no formato correto

                // Agora você pode salvar a movimentação com o motivo da anulação
                try {
                    await annullmentRequest0({
                        ...request,
                        operationDate: formattedDate, // Envia a data formatada
                        motivoAnulacao: motivo, // Inclua o motivo de anulação
                        accountPlanNumber: request.items[0].accountPlanBudject.number,
                        value: request.totalRequestedValue / 2.5,
                        requestNumber: request.requestNumber
                    });

                    console.log("annullmentRequest0", annullmentRequest0);


                    // Exibe mensagem de sucesso
                    Swal.fire({
                        icon: 'success',
                        title: 'Sucesso!',
                        text: 'Movimentação salva com sucesso!',
                        confirmButtonText: 'Ok',
                        confirmButtonColor: '#28a745', // Cor personalizada para sucesso
                    }).then((result) => {
                        if (result.isConfirmed) {
                            setLoading(false); // Desativa o carregamento após o sucesso
                            window.location.reload(); // Recarrega a página
                        }
                    });

                } catch (error) {
                    console.error(error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro ao salvar movimentação',
                        text: error.message || 'Ocorreu um erro ao tentar salvar a movimentação.',
                    });
                }
            }
        });
    };

    const calculateSummary = () => {
        const groupedAccounts = rows.reduce((acc, row) => {
            if (!row.account) return acc; // Ignorar linhas sem conta selecionada

            // Se a conta não estiver no acumulador, inicializa com zero para débito e crédito
            if (!acc[row.account]) {
                acc[row.account] = { description: "", debit: 0, credit: 0 };
            }

            // Atualiza a descrição da conta
            acc[row.account].description = accounts.find(
                (account) => account.accountPlan.number === row.account
            )?.accountPlan.description;

            // Atualiza o débito e crédito da conta
            acc[row.account].debit += parseFloat(row.debit) || 0;
            acc[row.account].credit += parseFloat(row.credit) || 0;

            return acc;
        }, {});

        const summary = Object.entries(groupedAccounts).map(([account, data]) => ({
            account,
            description: data.description,
            debit: data.debit,
            credit: data.credit,
            balance: data.debit - data.credit, // Saldo = Débito - Crédito
        }));

        return summary;
    };


    const [data, setData] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // Formato "YYYY-MM-DD"
    });
    const handleChange = (index, field, value) => {
        // Cria uma cópia do estado atual da tabela
        const updatedTableData = [...tableData];

        // Atualiza o valor específico na linha correspondente
        updatedTableData[index] = {
            ...updatedTableData[index],
            [field]: value,  // Atualiza o campo correspondente (account, debit, credit, description)
        };

        // Atualiza o estado com os dados modificados
        setTableData(updatedTableData);
    };


    const diario = "Nº: 00";
    const open = "Abertura";
    const [formOpen, setFormOpen] = useState({
        documentNumber: "",
        documentDescription: "",
        value: "",
    });
    const [currencies, setCurrencies] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState("MZN"); // Moeda Moçambicana como padrão

    // Função para carregar moedas de uma API
    const loadCurrencies = async () => {
        try {
            const response = await fetch("https://openexchangerates.org/api/currencies.json"); // Substitua com uma API de sua escolha
            const data = await response.json();
            const currencyList = Object.entries(data).map(([code, name]) => ({
                code,
                name,
            }));
            setCurrencies(currencyList);
        } catch (error) {
            console.error("Erro ao carregar moedas:", error);
        }
    };

    const loadJournalEntry = async () => {
        try {
            setLoading(true);
            const response = await fetchAllAccountingJournalEntryAll();
            console.log("Todas as Contas Journal:", response);
            setAccountData(response)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

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

    const loadAccountsFetchAllAccountingJournalEntry = async () => {
        try {
            setLoading(true);
            const responsebase = await fetchAllAccountingJournalEntry();

            if (!Array.isArray(responsebase)) {
                console.error("Erro: resposta não é um array", responsebase);
                return;
            }

            const response = responsebase.filter(item =>
                item.entry?.accountingJournalId === 1
            );

            console.log("Todas as Contas De Lançamentos Registradas", responsebase);

            const groupedByEntryId = new Map();

            for (const item of response) {
                const entry = item.entry; // assume que `entry` é único por item
                const entryId = entry.id;

                if (!groupedByEntryId.has(entryId)) {
                    groupedByEntryId.set(entryId, {
                        entryId,
                        operationDate: entry.operationDate,
                        operator: item.operator,
                        value: 0,
                        description: "",
                        accountPlanNumber: item.accountPlanNumber,
                        documentDescription: item.documentDescription,
                        accountPlanId: item.accountPlanId,
                        entries: []
                    });
                }

                const group = groupedByEntryId.get(entryId);
                group.value = parseFloat(item.value); // soma os valores
                group.description = (item.entry.accountingDocument.description || "") + " ";
                group.documentDescription = (item.description || "");
                group.documentSequence = String(entry.documentSequence || "").padStart(3, '0');
                group.entries.push(item);
            }

            const agrupados = Array.from(groupedByEntryId.values());
            console.log("DADOS AGRUPADOS", agrupados);

            setOperationRegister(agrupados);
        } catch (error) {
            console.error("Erro ao carregar os lançamentos:", error);
        } finally {
            setLoading(false);
        }
    };


    const loadAllRequests = async () => {
        try {
            setLoading(true);
            const response = await fetchAccountRequestWhitConformance();
            console.log("Minhas Requisiações ", response);
            setRequests(response)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };



    const loadAccountFinancial = async () => {
        try {
            setLoading(true);
            const response = await getRegisteredAccounts();
            console.log("Contas Financeiras ", response);
            setAccountFinancial(response)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };



    const handleSubmit = async () => {
        // Exibe ambas as tabelas dentro do SweetAlert
        Swal.fire({
            title: 'Deseja Realmente Realizar essa operacao?',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                // Chamando o método após a confirmação
                return handleConfirmation();
            },
        });
    };

    const handleOperationsCardClick = (request) => {
        setShowReportsModal(true);
    };

    const handleConfirmation = async () => {




        // Validação: O valor do débito não pode ser maior que o total de débito
        if (!paymentType) {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Por favor Selecione o Tipo de Pagamento.',
            });
            return;
        }
        // Mapeia os dados da tabela
        const tableData1 = tableData.map((row, index) => {
            const isEven = index % 2 === 0; // Verifica se a linha é par
            const getAccountPlanNumber = row.account.split(' - ')[0];
            const getAccountPlan = accountFinancial.filter(account => account.number === getAccountPlanNumber);
            const getAccountPlanId = getAccountPlan[0]?.id;

            return {
                accountPlanNumber: getAccountPlanNumber.trim(),
                value: row.debit > 0 ? row.debit : row.credit > 0 ? row.credit : 0,
                operator: row.debit > 0 ? "DEBIT" : row.credit > 0 ? "CREDIT" : "",
                description: "Contas a Receber",
                accountPlanYearId: 1,
                accountPlanId: getAccountPlanId,
                operationDate: data,

            };
        });

        console.log("meus Items", tableData1);
        console.log("Dados ppor validar", tableData1);
        console.log("contas", accounts);

        tableData1.slice(1).forEach(item => { // Usando slice(1) para ignorar o primeiro item
            const { accountPlanNumber } = item;

            // Procurando a conta com base no accountPlanNumber
            const conta = accounts.find(acc => acc.accountPlan.number === accountPlanNumber);

            if (!conta) {
                console.log(`Conta ${accountPlanNumber} não encontrada.`);
            } else if (conta.finalAllocation <= 0) {
                // Exibe um alerta para a conta com saldo insuficiente
                Swal.fire({
                    icon: 'warning',
                    title: `Conta ${accountPlanNumber} com saldo insuficiente`,
                    text: `O saldo da conta ${accountPlanNumber} é ${conta.finalAllocation}.`,
                    confirmButtonText: 'Entendido'
                });
            }
        });


        // Validação: Verifica se algum item possui accountPlanNumber vazio
        const invalidItems = tableData1.filter(item => !item.accountPlanNumber);
        if (invalidItems.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Todos os itens da tabela devem conter o campo "accountPlanNumber" preenchido.',
            });
            return;
        }

        // Verifica se a soma de débito e crédito é diferente de zero para cada item
        for (let row of tableData1) {
            const debit = row.operator === 'debit' ? row.value : 0;
            const credit = row.operator === 'credit' ? row.value : 0;
            console.log("Dados da Linha:", `Débito: ${debit}, Crédito: ${credit}`);
        }

        // Calcular o total acumulado de débitos e créditos
        const totalDebits = tableData1
            .filter(row => row.operator === 'debit')
            .reduce((acc, row) => acc + row.value, 0);

        const totalCredits = tableData1
            .filter(row => row.operator === 'credit')
            .reduce((acc, row) => acc + row.value, 0);

        console.log("Total Débito:", totalDebits);
        console.log("Total Crédito:", totalCredits);

        // Validação: O valor do débito não pode ser maior que o total de débito

        // Verificar a diferença
        const result = totalDebits - totalCredits;
        console.log("result", result);

        // Validação: O resultado não pode ser negativo
        if (result < 0) {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'O resultado não pode ser negativo.',
            });
            return;
        }

        // Se for pagamento único, resultado deve ser 0
        if (paymentType === "UNIQUE") {
            if (totalDebits > totalCredits) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: 'No pagamento único,O valor total de débito não pode ser maior que o valor total de crédito.',
                });
                return;
            }
        }

        // Se for pagamento parcial, resultado deve ser maior que 0
        // if (paymentType === "PARTIAL" && result == 0) {
        //     Swal.fire({
        //         icon: 'error',
        //         title: 'Saldo!',
        //         text: 'O saldo Deve ser Sempe igual a zero.',
        //     });
        //     return;
        // }

        // Validação de campos obrigatórios fora da tabela
        const missingFields = [];
        if (!selectedCurrency) missingFields.push("Moeda");
        if (!exchangeRate) missingFields.push("Taxa de Câmbio");
        if (!generalDescription) missingFields.push("Descrição Geral");
        if (!requisition) missingFields.push("Número Da Requisição");
        if (!tableData1 || tableData1.length === 0) {
            missingFields.push("Dados Do Fornecedor Em Falta");
        }

        if (missingFields.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Erro ao enviar',
                text: `Os seguintes campos estão em falta: ${missingFields.join(", ")}`,
            });
            return;
        }

        let parcelCount = tableData1.length;

        // Verifica o tipo de pagamento (único ou parcelado)
        let createOpenAccountData = {};
        console.log("Dados ppor validar", tableData1);

        if (paymentType === "partial") {
            // Se for pagamento parcial, divide o valor em parcelas
            createOpenAccountData = {
                operationDate: data,
                accountingJournalNumber: "00",
                accountingDocumentNumber: documentSend,
                exchangeRate: exchangeRate,
                generalDescription: generalDescription,
                items: tableData1.map((row, index) => ({
                    ...row,
                    value: row.value / parcelCount, // Divide o valor pelo número de parcelas
                    description: `Parcela ${index + 1}`, // Adiciona a descrição de parcela
                })),
                internalRequestNumber: requisition,
                paid: 0, // Defina como não pago ainda
                receivable: 1,
                transactionType: "BancosSaida",
                is_parcial: true, // Marca como pagamento parcial
                tableDataBudject,
                payment_type: paymentType,
                remaining_balance: saldo - tableData1[0].value
            };
        } else {
            // Pagamento único
            createOpenAccountData = {
                operationDate: data,
                accountingJournalNumber: "00",
                accountingDocumentNumber: documentSend,
                exchangeRate: exchangeRate,
                generalDescription: generalDescription,
                items: tableData1,
                internalRequestNumber: requisition,
                paid: 1,
                receivable: 1,
                transactionType: "BancosSaida",
                tableDataBudject,
                is_parcial: false,
                payment_type: paymentType,
                remaining_balance: saldo - tableData1[0].value
            };
        }

        console.log("Minha Requisicao", createOpenAccountData);

        const filteredRequest = requests.filter(account => account.internalRequest.requestNumber === requisition);

        const isConformed = filteredRequest.some(account => account.internalRequest.conformance === 'CONFORMED');
        const isPaid = filteredRequest.some(account => account.internalRequest.paid == 1);

        if (isPaid) {
            Swal.fire({
                icon: 'info',
                title: 'Atenção!',
                text: 'Esta requisição já foi paga.',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#007bff',
            }).then(() => {
                setLoading(false);
            });
        } else if (!isConformed) {
            Swal.fire({
                icon: 'warning',
                title: 'Aviso!',
                text: 'A requisição ainda não está conforme. Aguarde a aprovação do Administrador.',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#ffc107',
            }).then(() => {
                setLoading(false);
            });
        } else {
            console.log("createOpenAccountData", createOpenAccountData)
            try {
                await createBankOutAccountingJournal({
                    ...createOpenAccountData,
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'Operação feita com sucesso!',
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#28a745',
                }).then(() => {
                    setLoading(false);
                    window.location.reload();
                });
            } catch (error) {
                console.error(error.message);

                Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: error.message,
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#dc3545',
                }).then(() => {
                    setLoading(false);
                });
            }
        }
    };



    const loadOpenAccount = async () => {
        try {
            setLoading(true);
            const response = await fetchOpenAccount();
            console.log("Open Accpunt Recive:", response);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewEntries = () => {
        history.push("/admin/releaseReport");
    };
    // Componente de estilo para a tabela com hover
    const TableRow = styled.tr`
  cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      background-color: rgba(37, 99, 165, 0.2);  /* Cor de fundo ao passar o mouse */
      transform: scale(1.02);                    /* Aumenta o tamanho da linha ao passar o mouse */
      box-shadow: 0px 4px 15px rgba(37, 99, 165, 0.3); /* Sombra suave para dar destaque */
    }

    &:active {
      background-color: rgba(37, 99, 165, 0.3);  /* Cor mais intensa ao clicar */
      transform: scale(0.98);                    /* Leve efeito de "pressionar" */
      box-shadow: 0px 2px 5px rgba(37, 99, 165, 0.3); /* Efeito de sombra mais sutil ao clicar */
    }

    /* Linhas pares e ímpares com cores de fundo diferentes no hover */
    &:nth-child(even):hover {
      background-color: rgba(37, 99, 165, 0.3);  /* Cor mais forte para linhas pares */
    }

    &:nth-child(odd):hover {
      background-color: rgba(37, 99, 165, 0.4);  /* Cor mais forte para linhas ímpares */
    }
  `;

    const handleRowDoubleClick = (request) => {
        setSelectedRow(selectedRow === request.id ? null : request.id);
        setRequisition(request.requestNumber);
        setDocumentSend(request.document);
        setSelectedRequest(request);

        if (request.requestNumber) {
            const lastJournalDocumentNumber = accountsData.reduce((max, item) => {
                return item.journalDocumentNumber > max ? item.journalDocumentNumber : max;
            }, 1);

            const nextSequence = Number(lastJournalDocumentNumber) + 1;

            setFormOpen({
                ...formOpen,
                documentNumber: request.requestNumber,
                documentDescription: "selectedDoc.description",
            });

            setTableDataInfo((prevTableData) => {
                const updatedTableData = prevTableData.map((row) =>
                    row.sequence === nextSequence
                        ? {
                            ...row,
                            diary: diario,
                            sequence: nextSequence,
                            document: request.requestNumber,
                            description: "selectedDoc.description",
                            isPreloaded: true,
                        }
                        : row
                );

                if (!updatedTableData.some(row => row.sequence === nextSequence)) {
                    updatedTableData.push({
                        diary: diario,
                        sequence: nextSequence,
                        document: request.requestNumber,
                        description: "selectedDoc.description",
                        isPreloaded: true,
                    });
                }

                return updatedTableData;
            });
        }

        const filteredRequest = requests.filter(account => account.internalRequest.requestNumber === request.requestNumber);

        if (filteredRequest.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Requisição não encontrada',
                text: 'Não foi possível localizar a requisição com o número fornecido.',
            });

            setTableData([]);
            setResultData({
                debit: 0,
                credit: 0,
                balance: 0
            });

            return;
        }

        let creditAccount = '';
        let totalDebit = 0;


        filteredRequest.forEach((req) => {
            const totalAmount = parseFloat(req.totalAmount);
            const partialAmount = parseFloat(req.internalRequest.remainingBalance);

            if (!creditAccount && req.internalRequest.accountPlanFinancial) {
                creditAccount = `${req.internalRequest.accountPlanFinancial.number} - ${req.internalRequest.accountPlanFinancial.description}`;
            }

            if (req.internalRequest.paymentType === "PARTIAL") {
                setPaymentType("PARTIAL"); // Corrigido para atribuição

                totalDebit += partialAmount;

                setPaymentTypeVisible(true);

            } else {
                totalDebit += totalAmount;
            }
        });

        let newTableData = [];
        let totalCredit = 0;

        const selectedDoc = documents.find(doc => doc.documentNumber === filteredRequest[0].internalRequest.document);

        console.log("Descricao do Documento", selectedDoc)
        // const documentDescription =  
        if (creditAccount) {
            // Adicionando a conta como débito em vez de crédito
            newTableData.push({
                account: creditAccount,
                debit: totalDebit,
                credit: 0, // Valor de crédito zerado
                description: `${selectedDoc.description} - ${filteredRequest[0].internalRequest.documentNumber}`,
                isPreloaded: true,
            });
            totalCredit = totalDebit; // Ainda é possível rastrear o total de crédito
        }

        console.log("DADOS PARTILHADOS", filteredRequest);

        setSaldo(filteredRequest[0].totalAmount)

        if (filteredRequest.length > 0) { // Verifica se há elementos na lista
            const newTableDataFinancial = filteredRequest.map((req) => {
                // Determina o valor do débito com base no tipo de pagamento
                const debitValue = req.internalRequest.paymentType === "PARTIAL"
                    ? req.internalRequest.remainingBalance
                    : req.totalAmount;

                return {
                    account: req.accountPlanBudject.number, // Conta Financeira (Débito)
                    debit: debitValue, // Valor do débito
                    description: req.accountPlanBudject.description, // Descrição
                };
            });

            console.log("Nova tabela de dados financeiros:", newTableDataFinancial);
        }



        if (filteredRequest.length > 0) {
            const newTableDataFinancial = filteredRequest.map((req) => {
                // Determina o valor do débito com base no tipo de pagamento
                const debitValue = req.internalRequest.paymentType === "PARTIAL"
                    ? req.internalRequest.remainingBalance
                    : req.totalAmount;

                return {
                    account: req.accountPlanBudject.number, // Conta Financeira (Débito)
                    debit: debitValue, // Valor total (Débito)
                    description: req.accountPlanBudject.description, // Descrição
                };
            });

            console.log("Nova tabela de dados financeiros:", newTableDataFinancial);

            // Atualizando a tabela com os dados financeiros
            setTableDataBudject(newTableDataFinancial);
        }

        const totalBalance = totalCredit - totalDebit;

        setTableData(newTableData);
        setResultData({
            debit: 10,
            credit: totalCredit,
            balance: totalBalance
        });
    };




    // const addRow = () => {
    //     setTableData(prevData => {
    //         return [
    //             ...prevData,
    //             {
    //                 account: '',
    //                 debit: 0,
    //                 credit: 0,
    //                 description: '',
    //                 isPreloaded: false,
    //             }
    //         ];
    //     });
    // };

    const addRow = () => {
        console.log("Adicionando nova linha");

        // Adiciona uma nova linha vazia sem pressupor débito ou crédito
        const newRow = { account: "", debit: "", credit: "", description: "" };

        setTableData(prev => [...prev, newRow]);
    };


    // Função para manipular alterações de input
    // const handleInputChange = (index, field, value) => {
    //     const newTableData = [...tableData];
    //     newTableData[index][field] = value;

    //     // Se for a segunda linha ou posterior, atualiza o valor do débito com o valor do crédito da primeira linha
    //     if (index > 0) {
    //         const totalDebit = newTableData.reduce((acc, row) => acc + row.debit, 0);
    //         const firstRowCredit = newTableData[0].credit;
    //         const remainingDebit = firstRowCredit - totalDebit;

    //         // Atualiza os débitos das linhas subsequentes
    //         if (remainingDebit >= 0) {
    //             newTableData[index].debit = value;
    //         }
    //     }

    //     setTableData(newTableData);
    // };

    const handleInputChange = (index, field, value) => {
        const updatedRows = [...tableData];

        if (field === 'debit') {
            updatedRows[index].debit = value;
            if (value > 0) {
                updatedRows[index].credit = 0; // Zera crédito se débito for preenchido
            }
        } else if (field === 'credit') {
            updatedRows[index].credit = value;
            if (value > 0) {
                updatedRows[index].debit = 0; // Zera débito se crédito for preenchido
            }
        } else {
            updatedRows[index][field] = value;
        }

        setTableData(updatedRows);
    };

    // Função para remover uma linha
    const removeRow = (index) => {
        const newTableData = tableData.filter((_, i) => i !== index);
        setTableData(newTableData);
    };


    const handlePreview = (request) => {

        console.log("request", request)

        const currentDate = new Date().toISOString().split('T')[0];

        const items = request.items;
        const nomeRequerente = request.requestorName;
        const departamento = request.requestorDepartment;
        const orcamento = request.currentAccountBudjectBalance;
        const financiamento = request.finalAccountBujectBalance;
        const bank = 111;


        setData(currentDate);

        // Validação dos campos obrigatórios
        if (!nomeRequerente || !departamento || !orcamento || !financiamento || !items || !bank || items.length === 0) {
            let missingFields = [];

            console.log("ORcamento", orcamento)

            if (!nomeRequerente) missingFields.push("Nome do Requerente");
            if (!departamento) missingFields.push("Departamento");
            if (!orcamento) missingFields.push("Orçamento");
            if (!financiamento) missingFields.push("Financiamento");
            if (!items || items.length === 0) missingFields.push("Requisições");
            if (!bank || bank.length === 0) missingFields.push("Banco");


            // Exibe um alerta se algum campo estiver vazio
            Swal.fire({
                icon: 'warning',
                title: 'Campos obrigatórios não preenchidos',
                text: `Por favor, preencha os seguintes campos: ${missingFields.join(', ')}`,
                confirmButtonText: 'Ok',
                confirmButtonColor: '#FF5733', // Cor personalizada do botão
            }).then(() => {
                setLoading(false); // Desativa o carregamento após a mensagem
            });

            return; // Impede o envio se os campos não forem preenchidos
        }
        console.log("Request", createRequisitonAccount)

        const tabelaProdutos = items.map((req, index) => [
            (index + 1).toString(),
            req.description,
            `${req.unitPrice} MZN`,
            `${(req.quantity * req.unitPrice).toFixed(2)} MZN`, // Calculando o valor total baseado em quantity e unitPrice
        ]);

        const createRequisitonAccount = {
            nomeRequerente: nomeRequerente,
            departamentoRequerente: departamento,
            operationDate: currentDate,
            justification: "Teste de uma requisicao interna",
            sectorBudject: "Sector A",
            chapterBudject: "20A",
            clauseBudject: "10",
            clauseNumberBudject: "a",
            provideCode: "111",
            bank: bank,
            accountPlanBudjectNumber: orcamento,
            codigoFornecedor: request.accountPlanFinancial.number,
            nomeFornecedor: request.accountPlanFinancial.description,
            disponibilidadeInicial: request.initialAvailabilityAccountBuject,
            saldoExistente: (request.initialAvailabilityAccountBuject) - (request.totalRequestedValue),
            logoMzBase64: logoMzBase64,
            valorRequisicao: request.totalRequestedValue,
            tabelaProdutos: tabelaProdutos, // Adicionando a tabela de produtos ao objeto
            nomeEncarregado: request.requestorName,
            orcamento: orcamento,
            financiamento: financiamento,
            supplierName: request.accountPlanFinancial.description,
            justpificacao: request.justification,
            requestNumber: request.requestNumber,
            paymentType: paymentType

        };

        const total = request.totalRequestedValue;

        generatePdf(

            createRequisitonAccount,
            true,
            setPreviewUrl
        );
    };

    useEffect(() => {
        // Carregar todas as requisições
        findAccountRequestWhitConformance()
            .then((data) => {
                const filteredRequest = data.filter(dados => dados.isReceivable === 1);

                setRequestsToPay(filteredRequest);
                console.log("data", data);
            })
            .catch((error) => {
                console.error('Erro ao carregar requisições:', error);
            });
    }, []);

    useEffect(() => {
        if (filter === 'PAID') {
            setSubmitButtonVisible(false); // Mostra o botão
        } else if (filter === 'PAID') {
            setSubmitButtonVisible(true); // Esconde o botão
        } else if (filter === 'PARTIALLY_PAID') {
            setSubmitButtonVisible(true); // Esconde o botão
        }
    }, [filter]);

    useEffect(() => {
        loadDiariesWithDocuments();
        loadJournalEntry();
    }, []);

    useEffect(() => {
        loadAllRequests();
        loadAccountFinancial();
    }, []);

    // Carregar moedas quando o componente for montado
    useEffect(() => {
        loadCurrencies();
        loadOpenAccount();
        loadAccounts();
        loadAccountsFetchAllAccountingJournalEntry();
    }, []);
    const handleDiarySelection = (id) => {
        const diary = diaries.find((d) => d.id === id);
        setSelectedDiary(diary || null);
    };

    const handleDocumentSelection = (event) => {
        const selectedNumber = event.target.value; // Obtém o número do documento selecionado
        const selectedDoc = documents.find(doc => doc.documentNumber === selectedNumber);

        if (selectedDoc) {
            // Verificar a última sequência em accountsData
            const lastJournalDocumentNumber = accountsData.reduce((max, item) => {
                return item.journalDocumentNumber > max ? item.journalDocumentNumber : max;
            }, 1); // Inicia o valor máximo como 0

            // Incrementa o maior número encontrado      
            const lastJournalDocumentNumberNumber = Number(lastJournalDocumentNumber);

            const nextSequence = lastJournalDocumentNumberNumber + 1; // Gera o próximo número de sequência

            // Atualiza o estado do formulário
            setFormOpen({
                ...formOpen,
                documentNumber: selectedDoc.documentNumber,
                documentDescription: selectedDoc.description,
            });

            // Substitui ou atualiza a linha existente
            setTableDataInfo((prevTableData) => {
                // Verificar se a sequência já existe, se sim, substitui
                const updatedTableData = prevTableData.map((row) =>
                    row.sequence === nextSequence
                        ? {
                            ...row,
                            diary: diario,
                            sequence: nextSequence, // Sequência já gerada
                            document: selectedDoc.documentNumber,
                            description: selectedDoc.description,
                        }
                        : row
                );

                // Caso a sequência não exista, adiciona uma nova linha
                if (!updatedTableData.some(row => row.sequence === nextSequence)) {
                    updatedTableData.push({
                        diary: diario,
                        sequence: nextSequence,
                        document: selectedDoc.documentNumber,
                        description: selectedDoc.description,
                    });
                }

                return updatedTableData;
            });
        }
    };


    return (
        <div style={{ width: "100%", padding: "16px 24px" }}>
            <div className="sgf-header-box mb-3 d-flex align-items-center justify-content-between" style={{
                background: "linear-gradient(135deg, #0f5132 0%, #145a32 100%)",
                color: "#ffffff",
                padding: "12px 20px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(15, 81, 50, 0.15)"
            }}>
                <div>
                    <h5 className="mb-0" style={{ fontWeight: 700, letterSpacing: "0.5px", fontSize: "1.2rem", color: "#ffffff" }}>
                        Operações Diversas
                    </h5>
                    <small style={{ color: "#d1e7dd", fontSize: "0.85rem" }}>
                        Lançamentos extraordinários, aberturas de conta e acertos de tesouraria
                    </small>
                </div>
            </div>




            <Row className="mb-3 g-3">
                <Col md={4}>
                    <Card
                        className="h-100 shadow-sm sgf-action-card"
                        onClick={() => handlePaymentCardClick()}
                        role="button"
                        style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderLeft: '5px solid #0f5132',
                            borderRadius: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        <Card.Body className="d-flex align-items-center p-3">
                            <div
                                style={{
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '10px',
                                    backgroundColor: '#e8f5e9',
                                    color: '#0f5132',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '14px',
                                    flexShrink: 0
                                }}
                            >
                                <FaExchangeAlt size={20} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <h6 className="mb-0 text-truncate" style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.94rem' }}>
                                        Operações Diversas
                                    </h6>
                                    <span
                                        className="badge"
                                        style={{
                                            backgroundColor: '#e8f5e9',
                                            color: '#0f5132',
                                            border: '1px solid #b7dec9',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            padding: '3px 6px'
                                        }}
                                    >
                                        + Nova Operação
                                    </span>
                                </div>
                                <p className="mb-0 text-muted text-truncate" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    Lançamentos extraordinários, aberturas e acertos
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card
                        className="h-100 shadow-sm sgf-action-card"
                        onClick={() => handleOperationsCardClick()}
                        role="button"
                        style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderLeft: '5px solid #0284c7',
                            borderRadius: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        <Card.Body className="d-flex align-items-center p-3">
                            <div
                                style={{
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '10px',
                                    backgroundColor: '#e0f2fe',
                                    color: '#0284c7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '14px',
                                    flexShrink: 0
                                }}
                            >
                                <FaSearch size={18} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <h6 className="mb-0 text-truncate" style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.94rem' }}>
                                        Consultar Operações
                                    </h6>
                                    <span
                                        className="badge"
                                        style={{
                                            backgroundColor: '#f0f9ff',
                                            color: '#0284c7',
                                            border: '1px solid #bae6fd',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            padding: '3px 6px'
                                        }}
                                    >
                                        Histórico
                                    </span>
                                </div>
                                <p className="mb-0 text-muted text-truncate" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    Extrato analítico de operações diversas registadas
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card
                        className="h-100 shadow-sm sgf-action-card"
                        onClick={() => handleAnullmentOperationsCardClick()}
                        role="button"
                        style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderLeft: '5px solid #dc2626',
                            borderRadius: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        <Card.Body className="d-flex align-items-center p-3">
                            <div
                                style={{
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '10px',
                                    backgroundColor: '#fee2e2',
                                    color: '#dc2626',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '14px',
                                    flexShrink: 0
                                }}
                            >
                                <FaUndo size={18} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <h6 className="mb-0 text-truncate" style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.94rem' }}>
                                        Anulação de Operações
                                    </h6>
                                    <span
                                        className="badge"
                                        style={{
                                            backgroundColor: '#fef2f2',
                                            color: '#dc2626',
                                            border: '1px solid #fecaca',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            padding: '3px 6px'
                                        }}
                                    >
                                        Estorno
                                    </span>
                                </div>
                                <p className="mb-0 text-muted text-truncate" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    Cancelamento e estorno de operações extraordinárias
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>



            <div className="w-80 p-4 rounded shadow-md text-center">

                {activeTab === "movimentos_bancarios" &&
                    <div>
                        <div className="mt-4">
                            <h3 className="header text-center" style={{ fontWeight: "bold" }}>
                                Movimentos bancários
                            </h3>
                            <div className="card mt-4" style={{ backgroundColor: "transparent" }}>
                                <div className="card-body" style={{ backgroundColor: "transparent" }}>
                                    <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '1px' }}>
                                        <div className="mb-4">
                                            <div className="mb-3 d-flex justify-content-between align-items-center">
                                                <Button variant="dark" onClick={addRow}>
                                                    Adicionar operação
                                                </Button>
                                                <p className="mb-0">

                                                    <h5 style={{ fontWeight: "bold", textAlign: "left" }}>
                                                        Data
                                                    </h5>
                                                    <input type='date' style={{ height: "45px" }}></input>
                                                </p>
                                                <p className="mb-0">

                                                    <h5 style={{ fontWeight: "bold", textAlign: "left" }}>
                                                        Número
                                                    </h5>
                                                    <input type='number' style={{ height: "45px" }}></input>
                                                </p>
                                                <p className="mb-0">
                                                    {/* Data: <input type="date" required /> */}
                                                    <h5 style={{ fontWeight: "bold", textAlign: "left" }}>
                                                        Selecione um Documento
                                                    </h5>                                            <select
                                                        id="accountPlanNumber"
                                                        name="accountPlanNumber"
                                                        className="form-control border-black"
                                                        value={formOpen.documentNumber}
                                                        onChange={handleDocumentSelection}
                                                        required
                                                        disabled={documents.length === 0} // Desabilitar se não houver dados
                                                    >
                                                        <option value="">Selecionar Documento</option>
                                                        {documents
                                                            .map((document) => (
                                                                <option key={document.id} value={document.documentNumber}>
                                                                    {document.documentNumber} - {document.description}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </p>
                                            </div>


                                            <Table>
                                                <thead>
                                                    <tr>
                                                        <th>Conta Financeira</th>
                                                        <th>Débito</th>
                                                        <th>Crédito</th>
                                                        <th>Descrição</th>
                                                        <th>Acção</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tableData.map((row, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <Form.Select
                                                                    value={row.account}
                                                                    onChange={(e) => handleInputChange(index, 'account', e.target.value)}
                                                                    className="custom-select small-select"
                                                                    style={{ maxWidth: "150px", fontSize: "0.9em" }}
                                                                >
                                                                    <option value="">Selecionar Conta</option>
                                                                    {accounts
                                                                        .filter(
                                                                            (account) =>
                                                                                account.accountPlan.type === "financial" &&
                                                                                account.accountPlan.writable === "moviment")
                                                                        .map((account) => (
                                                                            <option key={account.id} value={account.accountPlan.number}>
                                                                                {account.accountPlan.number} - {account.accountPlan.description}
                                                                            </option>
                                                                        ))}
                                                                </Form.Select>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    value={row.debit}
                                                                    onChange={(e) => handleInputChange(index, 'debit', parseFloat(e.target.value) || 0)}
                                                                    placeholder="Débito"
                                                                    className="form-control"
                                                                    min="0"
                                                                    disabled={index !== 0} // Desabilita débito nas linhas após a primeira
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    value={row.credit}
                                                                    onChange={(e) => handleInputChange(index, 'credit', parseFloat(e.target.value) || 0)}
                                                                    placeholder="Crédito"
                                                                    className="form-control"
                                                                    min="0"
                                                                    disabled={index === 0} // Desabilita crédito na primeira linha
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    value={row.description}
                                                                    onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                                                                    placeholder="Descrição"
                                                                    className="form-control"
                                                                />
                                                            </td>
                                                            <td>
                                                                <Button variant="danger" size="sm" onClick={() => removeRow(index)}>
                                                                    Remover
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {/* Linha de totalização */}
                                                    <tr style={{ fontWeight: 'bold', color: 'white', backgroundColor: '#000000' }}>
                                                        <td>Total</td>
                                                        <td>{tableData.reduce((total, row) => total + (row.debit || 0), 0)}</td>
                                                        <td>{tableData.reduce((total, row) => total + (row.credit || 0), 0)}</td>
                                                        <td>Diferença</td>
                                                        <td>
                                                            {(
                                                                tableData.reduce((total, row) => total + (row.debit || 0), 0) -
                                                                tableData.reduce((total, row) => total + (row.credit || 0), 0)
                                                            ).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </Table>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-center">
                                <button
                                    className="btn btn-primary mt-2"
                                    onClick={handleSubmit}
                                >
                                    Registar
                                </button>
                            </div>

                        </div>
                    </div>
                }

            </div>
            <style>
                {`
                .form-control {
                    border: 1px solid black !important;
                }
                `}
            </style>

            {/* Modal de Pagamento */}
            {/* <BankingOperations
                show={showModal}
                onClose={() => setShowModal(false)}
                onComplete={handlePaymentComplete}
                requestData={null} // Passe dados adicionais se necessário
                filteredRequests={null}
                selectedRequest={null}
                tableData={tableData}
                handleRowDoubleClick={null}
                addRow={addRow}
                handleInputChange={handleInputChange}
                accounts={accounts}
                paymentType={null}
                documentType={null}
                setPaymentType={null}
                setDocumentType={null}
                isProcessing={null}
                paymentSuccess={null}
                setPaymentSuccess={null}
                setIsProcessing={null}
                handlePaymentConfirmation={null}
                removeRow={removeRow}
                formOpen={formOpen}
                handleDocumentSelection={handleDocumentSelection}
                documents={documents}
                validateOperations={validateOperations}
                setOperationDate={setOperationDate}
                operationDate={operationDate}
                submitRequest={submitRequest}
                namePersonCharge={namePersonCharge}
                setTableData={setTableData}
                setFormOpen={setFormOpen}
            /> */}

            <BankingOperations
                show={showModal}
                onClose={() => setShowModal(false)}
                onComplete={handlePaymentComplete}
                requestData={null} // Passe dados adicionais se necessário
                filteredRequests={null}
                selectedRequest={null}
                tableData={tableData}
                handleRowDoubleClick={null}
                addRow={addRow}
                handleInputChange={handleInputChange}
                accounts={accounts}
                paymentType={null}
                documentType={null}
                setPaymentType={null}
                setDocumentType={null}
                label={"Abertura"}
                isProcessing={null}
                paymentSuccess={null}
                setPaymentSuccess={null}
                setIsProcessing={null}
                handlePaymentConfirmation={null}
                removeRow={removeRow}
                formOpen={formOpen}
                handleDocumentSelection={handleDocumentSelection}
                documents={documents}
                validateOperations={validateOperations}
                setOperationDate={setOperationDate}
                operationDate={operationDate}
                submitRequest={submitRequest}
                namePersonCharge={namePersonCharge}
                setTableData={setTableData}
                setFormOpen={setFormOpen}
            />

            <BankingOperationsReports
                show={showReportsModal}
                onClose={() => setShowReportsModal(false)}
                operations={operationRegister}
                label={"Consultar Lançamentos (Contas a Receber)"}
                documents={["factura", "clientes", "outros devedores", "outras operacoes", "salarios", "outros"]}
                />

            <AnullmentOperationModal
                show={showAnullmentOperationsModal}
                onClose={() => setShowAnullmentOperationsModal(false)}
                operations={operationRegister}

            />
        </div>
    );
};

export default Operations;
