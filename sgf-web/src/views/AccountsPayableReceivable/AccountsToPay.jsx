import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchAllAccountingJournal10, findAccountRequestWhitConformance, getRegisteredAccounts, fetchAllAccountingJournalEntryAll, findAccountPlanBudjectEntriesByYear, fetchAccountRequestWhitConformance, fetchAllAccountingJournalEntry, createBillToPayAccountingJournal, createBillToReceiveAccountingJournal, fetchOpenAccount } from '../../services/accountService';
import Swal from 'sweetalert2';
import { Modal, Form, Button, Badge, Card, Row, Col, Table } from 'react-bootstrap';
import { FaCreditCard, FaHandshake, FaSearch, FaRegStopCircle, FaUndo } from 'react-icons/fa'; // Importando ícones

import './style.css';
import { useNavigate } from "react-router-dom";
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { transparent } from 'material-ui/styles/colors';
import AccoutToPayModal from './AccountToPayModal'; // Ajuste o caminho conforme sua estrutura
import OperationsModal from './OperationsModal'; // Ajuste o caminho conforme sua estrutura
import Spinner from '../../config/spinner/spinner';
import BankingOperationsReports from './BankingOperationsReports'; // Ajuste o caminho conforme sua estrutura



const AccountsToPay = () => {

    const [loading, setLoading] = useState(false);
    const [diaries, setDiaries] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [selectedDiary, setSelectedDiary] = useState(null);
    const [selectedDocumentId, setSelectedDocumentId] = useState(null);
    const [exchangeRate, setExchangeRate] = useState("1");
    const [generalDescription, setGeneralDescription] = useState("Contas a Pagar");
    const [tableData, setTableData] = useState([]); // Estado para armazenar os dados da tabela
    const [tableDataInfo, setTableDataInfo] = useState([]); // Estado para armazenar os dados da tabela
    const [accounts, setAccounts] = useState([]);
    const [accountingJournalEntry, setAccountingJournalEntry] = useState([]);
    const history = useHistory();
    const [requisition, setRequisition] = useState("");
    const [comprov, setComprov] = useState("");
    const [requests, setRequests] = useState([]);
    const [accountFinancial, setAccountFinancial] = useState([]);
    const [accountsData, setAccountData] = useState([]);
    const [filter, setFilter] = useState('NOT_IN_JOURNAL'); // Filtro atual: 'PENDING', 'APPROVED', ou 'REJECTED'
    const [requestsToPay, setRequestsToPay] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null); // Linha selecionada
    const [documentSend, setDocumentSend] = useState("");
    const [isSubmitButtonVisible, setSubmitButtonVisible] = useState(true);
    const [showAccountToPayModal, setShowAccountToPayModal] = useState(false);
    const [showOperationModal, setShowOperationModal] = useState(false);
    const [operationRegister, setOperationRegister] = useState([]);


    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);


    const handleAccountToPayCardClick = (request) => {
        setShowAccountToPayModal(true);
    };

    const handleOperationsCardClick = (request) => {
        setShowOperationModal(true);
    };

    

    const handlePaymentComplete = (paymentData) => {
        // Aqui você pode adicionar a lógica para processar o pagamento
        // Ex: chamar uma API, atualizar estado, etc.
    };
    const [resultData, setResultData] = useState({
        debit: 0,
        credit: 0,
        balance: 0
    });

    // Estado para armazenar as linhas da tabela
    const [rows, setRows] = useState([
        { account: "", debit: "", credit: "", description: "" },
        { account: "", debit: "", credit: "", description: "" },
    ]);
    const addRow = () => {
        setRows([...rows, { account: "", debit: "", credit: "", description: "" }]);
    };

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
        const totalRequestedValue = filteredRequest[0].internalRequest.totalRequestedValue;
        // const debitAccountFiltered = `${financialBankAccount[0].number} - ${financialBankAccount[0].description}`;
        const creditAccountFiltered = `${filteredRequest[0].internalRequest.accountPlanFinancial.number} - ${filteredRequest[0].internalRequest.accountPlanFinancial.description}`;
        const description = filteredRequest[0].description;

        // Cria os dados para a tabela
        const newTableData = [
            {
                // account: debitAccountFiltered,  // Conta Financeira (Débito)
                debit: totalRequestedValue,     // Débito
                credit: 0,                      // Crédito
                description: description,       // Descrição
            },
            {
                account: creditAccountFiltered, // Conta Financeira (Crédito)
                debit: 0,                       // Débito
                credit: totalRequestedValue,    // Crédito
                description: description,       // Descrição
            },
        ];

        // Calcula o total de Débito, Crédito e Saldo
        const totalDebit = newTableData.reduce((acc, row) => acc + row.debit, 0);
        const totalCredit = newTableData.reduce((acc, row) => acc + row.credit, 0);
        const totalBalance = totalCredit - totalDebit;

        // Atualiza o estado da tabela com os novos dados
        setTableData(newTableData);
        setResultData({
            debit: totalDebit,
            credit: totalCredit,
            balance: totalBalance
        });
    };

    useEffect(() => {
        // Carregar todas as requisições
        findAccountRequestWhitConformance()
            .then((data) => {
                const requestWithConformance = data.filter(dados => dados.conformance === 'CONFORMED');

                setRequestsToPay(requestWithConformance);
            })
            .catch((error) => {
                console.error('Erro ao carregar requisições:', error);
            });
    }, []);

    // Filtrar requisições com base no filtro atual
    //  accountingJournalEntry;
    //     const filteredRequests = requestsToPay.filter((request) => {
    // return true;
    //     });





    const filteredRequests = requestsToPay.filter((request) => {
        if (filter === 'NOT_IN_JOURNAL') {
            const isInJournal = accountingJournalEntry.some((journalEntry) => journalEntry.entry.internalRequestId === request.id);
            // Retorna os requests que NÃO estão no accountingJournalEntry
            return !isInJournal;
        }

        if (filter === 'IN_JOURNAL') {
            const isInJournal = accountingJournalEntry.some((journalEntry) => journalEntry.entry.internalRequestId === request.id);
            // Retorna os requests que ESTÃO no accountingJournalEntry
            return isInJournal;
        }

        return true; // Exibe todos os requests por padrão
    });


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

    useEffect(() => {
        if (filter === 'NOT_IN_JOURNAL') {
            setSubmitButtonVisible(true); // Mostra o botão
        } else if (filter === 'IN_JOURNAL') {
            setSubmitButtonVisible(false); // Esconde o botão
        }
    }, [filter]);

    const [data, setData] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // Formato "YYYY-MM-DD"
    });
    const handleChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;

        // Lógica para limpar campos opostos
        if (field === "DEBIT" && value) {
            updatedRows[index].credit = "";
        } else if (field === "CREDIT" && value) {
            updatedRows[index].debit = "";
        }

        // Preenchimento automático na segunda conta
        if (index > 0 && field === "account" && value) {
            const previousRow = updatedRows[index - 1];

            if (previousRow.debit) {
                updatedRows[index].credit = previousRow.debit;
                updatedRows[index].description = `Transferência de ${previousRow.debit} para a conta ${value}`;
            } else if (previousRow.credit) {
                updatedRows[index].debit = previousRow.credit;
                updatedRows[index].description = `Transferência de ${previousRow.credit} para a conta ${value}`;
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Preenchimento Obrigatório",
                    text: "Por favor, insira um valor de débito ou crédito na linha anterior antes de selecionar a próxima conta.",
                    confirmButtonText: "Entendido",
                });
                updatedRows[index].account = ""; // Reseta a conta selecionada
            }
        }

        setRows(updatedRows);
    };
    const diario = "Nº: 10 - Contas a Pagar";
    const open = "Contas a Pagar";
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
            setAccountingJournalEntry(responsebase)

            const response = responsebase.filter(item =>
                item.entry?.accountingJournalId === 2
            );

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
                        documentSequence: entry.documentSequence,
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
            console.log("DADOS responsebase", responsebase);

            

            setOperationRegister(agrupados);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    const loadAllRequests = async () => {
        try {
            setLoading(true);
            const response = await fetchAccountRequestWhitConformance();
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
            setAccountFinancial(response)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async () => {
        if (tableData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Dados insuficientes!',
                text: 'A tabela está vazia. Adicione os dados antes de prosseguir.',
            });
            return;
        }

        // Tabela de dados financeiros (contas de débito/crédito)
        const tableHTML1 = `
        <table style="width: 100%; border: 2px solid black; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="border: 2px solid black; padding: 12px; text-align: center;">Conta Financeira</th>
                    <th style="border: 2px solid black; padding: 12px; text-align: center;">Débito</th>
                    <th style="border: 2px solid black; padding: 12px; text-align: center;">Crédito</th>
                    <th style="border: 2px solid black; padding: 12px; text-align: center;">Descrição</th>
                </tr>
            </thead>
            <tbody>
                ${tableData
                .map(
                    (row) => `
                            <tr>
                                <td style="border: 2px solid black; padding: 12px; text-align: center;">${row.account}</td>
                                <td style="border: 2px solid black; padding: 12px; text-align: center;">${row.debit}</td>
                                <td style="border: 2px solid black; padding: 12px; text-align: center;">${row.credit}</td>
                                <td style="border: 2px solid black; padding: 12px; text-align: center;">${row.description}</td>
                            </tr>
                        `
                )
                .join('')}
            </tbody>
        </table>
    `;

        // Tabela de dados adicionais (exemplo: diário, sequência, documento)
        const tableHTML2 = `
        <table style="width: 100%; border: 2px solid black; border-collapse: collapse; margin-top: 20px;">
            <thead>
                <tr>
                    <th style="border: 2px solid black; padding: 12px; text-align: center;">Diário</th>
                    <th style="border: 2px solid black; padding: 12px; text-align: center;">Nº</th>
                    <th style="border: 2px solid black; padding: 12px; text-align: center;">Requisiç Nº</th>
                    <th style="border: 2px solid black; padding: 12px; text-align: center;">Nº</th>
                </tr>
            </thead>
            <tbody>
                ${tableDataInfo
                .map(
                    (row, index) => `
                            <tr>
                                <td style="border: 2px solid black; padding: 12px; text-align: center;">${row.diary}</td>
                                <td style="border: 2px solid black; padding: 12px; text-align: center;">${row.sequence}</td>
                                <td style="border: 2px solid black; padding: 12px; text-align: center;">${row.document}</td>
                                <td style="border: 2px solid black; padding: 12px; text-align: center;">${row.sequence}</td>
                            </tr>
                        `
                )
                .join('')}
            </tbody>
        </table>
    `;

        // Exibe ambas as tabelas dentro do SweetAlert com largura ampliada
        Swal.fire({
            title: 'Confirmar Dados',
            html: `${tableHTML1} ${tableHTML2}`,
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'swal-custom-modal',  // Classe customizada para o modal
            },
            preConfirm: () => {
                // Chamando o método após a confirmação
                return handleConfirmation();
            },
        });

        // Adicionando o estilo customizado para a largura do modal
        const style = document.createElement('style');
        style.innerHTML = `
        .swal-custom-modal {
            width: 50% !important; /* Aumenta a largura do modal */
            max-width: 95% !important; /* Limita o tamanho máximo */
        }
    `;
        document.head.appendChild(style);
    };


    const handleConfirmation = async () => {
        const firstRow = tableData[0];
        const accountPlanNumber1 = firstRow.account;  // Conta financeira selecionada

        const firstRowNumber = tableDataInfo[0];
        if (!firstRowNumber) {
            console.error("Erro: Não há dados em tableDataInfo[0].");
            Swal.fire({
                icon: 'warning',
                title: 'Campo Vazio',
                text: 'Selecione um Docuumento e Tente novamente.',
            });
            return;
        }
        const sequence = firstRowNumber.sequence;

        // Filtrar os dados da conta selecionada

        const tableData1 = tableData.map((row, index) => {
            // Alternar entre as contas baseando-se na posição da linha (par/ímpar)
            const getAccountPlanNumber = row.account.split(' - ')[0];
            const getAccountPlan = accountFinancial.filter(account => account.number === getAccountPlanNumber);
            const getAccountPlanId = getAccountPlan[0].id;

            return {
                accountPlanNumber: getAccountPlanNumber.trim(), // Conta Financeira, agora só o número
                value: row.debit > 0 ? row.debit : row.credit > 0 ? row.credit : 0, // Valor de débito ou crédito
                operator: row.debit > 0 ? "DEBIT" : row.credit > 0 ? "CREDIT" : "", // Define operador
                description: row.description, // Descrição padrão
                accountPlanYearId: 1, // ID do ano da conta
                accountPlanId: getAccountPlanId, // ID da conta
                operationDate: data, // Data da operação
            };
        });

        if (!formOpen.documentNumber) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Por favor, selecione o número do documento antes de prosseguir.',
            });
            return;
        }

        const missingFields = [];
        if (!formOpen.documentNumber) missingFields.push("Número do Documento");
        if (!formOpen.documentDescription) missingFields.push("Descrição do Documento");
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
        const filteredRequestSend = requests.filter(account => account.internalRequest.document);

        const createOpenAccountData = {
            operationDate: data,
            accountingJournalNumber: "10",
            accountingDocumentNumber: documentSend,
            exchangeRate: exchangeRate,
            generalDescription: generalDescription,
            items: tableData1,
            journalDocumentNumber: String(sequence).trim(),
            internalRequestNumber: requisition,
            paid: 0,
            receivable: 1,
            transactionType: "Contas a Pagar"
        };

        const filteredRequest = requests.filter(account => account.internalRequest.requestNumber === requisition);

        // Verifica se o conformance da requisição está em um dos valores permitidos
        const isConformed = filteredRequest.some(account => account.internalRequest.conformance === 'CONFORMED');

        if (!isConformed) {
            // Exibe o pop-up informando que a requisição ainda não está conforme
            Swal.fire({
                icon: 'warning',
                title: 'Aviso!',
                text: 'A requisição ainda não está conforme. Aguarde a aprovação do Administrador.',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#ffc107', // Cor personalizada para aviso
            }).then(() => {
                setLoading(false); // Desativa o carregamento após o aviso
            });
        } else {
            try {
                // Registra a requisição
                await createBillToPayAccountingJournal({
                    ...createOpenAccountData,
                });
                // Exibe o pop-up de sucesso
                // Swal.fire({
                //     icon: 'success',
                //     title: 'Sucesso!',
                //     text: 'Requisição feita com sucesso!',
                //     confirmButtonText: 'Ok',
                //     confirmButtonColor: '#28a745', // Cor personalizada para sucesso
                // }).then(() => {
                //     setLoading(false); // Desativa o carregamento após o sucesso
                //     window.location.reload(); // Recarrega a página após 2 segundos
                // });
                return true;

            } catch (error) {
                console.error(error);

                // Exibe o pop-up de erro
                Swal.fire({
                    icon: 'error',
                    title: 'Erro!',
                    text: error.message,
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#dc3545', // Cor personalizada para erro
                }).then(() => {
                    setLoading(false); // Desativa o carregamento após o erro
                });
            }

            return false;
        }
    };

    const loadDiariesWithDocuments = async () => {
        try {
            setLoading(true);
            const response = await fetchAllAccountingJournal10();
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

    const handleViewEntries = () => {
        history.push("/admin/releaseReport");
    };


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


    const handleRowClick = (request) => {
        if (request.transactionType === 'MULTIPLE_BENEFICIARIES') {
            handleRowClickMultiBeneficiary(request);
        } else {
            handleRowClickUnicBeneficiary(request);
        }
    };  

    const handleRowClickUnicBeneficiary = (request) => {

        setSelectedRequest(request);

        console.log("requisicao selecionada", request)

        if (selectedRow !== request.id) {
            setSelectedRow(request.id); // Correção: não desmarca ao clicar 2 vezes na mesma linha
            setRequisition(request.requestNumber);
            setDocumentSend(request.document);

            if (request.requestNumber) {
                // Verificar a última sequência em accountsData
                const lastJournalDocumentNumber = accountsData.reduce((max, item) => {
                    return item.journalDocumentNumber > max ? item.journalDocumentNumber : max;
                }, 1);

                const lastJournalDocumentNumberNumber = Number(lastJournalDocumentNumber);
                const nextSequence = lastJournalDocumentNumberNumber + 1;

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
                            }
                            : row
                    );

                    if (!updatedTableData.some(row => row.sequence === nextSequence)) {
                        updatedTableData.push({
                            diary: diario,
                            sequence: nextSequence,
                            document: request.requestNumber,
                            description: "selectedDoc.description",
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

            let groupedData = {};
            let creditAccount = '';

            filteredRequest.forEach((req) => {
                const debitAccountFiltered = `${req.accountPlanFinancialAssociation.number} - ${req.accountPlanFinancialAssociation.description}`;
                const description = req.description;
                const totalAmount = parseFloat(req.totalAmount);

                if (!groupedData[debitAccountFiltered]) {
                    groupedData[debitAccountFiltered] = {
                        debit: 0,
                        credit: 0,
                        description: description,
                        account: debitAccountFiltered,
                    };
                }

                groupedData[debitAccountFiltered].debit += totalAmount;

                if (!creditAccount && req.internalRequest.accountPlanFinancial) {
                    creditAccount = `${req.internalRequest.accountPlanFinancial.number} - ${req.internalRequest.accountPlanFinancial.description}`;
                }
            });

            let newTableData = [];
            let totalDebit = 0;
            let totalCredit = 0;

            for (let key in groupedData) {
                const row = groupedData[key];
                newTableData.push({
                    account: row.account,
                    debit: row.debit,
                    credit: 0,
                    description: row.description,
                });

                totalDebit += row.debit;
            }

            if (creditAccount) {
                newTableData.push({
                    account: creditAccount,
                    debit: 0,
                    credit: totalDebit,
                    description: 'Conta a creditar',
                });
                totalCredit = totalDebit;
            }

            const totalBalance = totalCredit - totalDebit;

            setTableData(newTableData);

            console.log("newTableData", newTableData)
            setResultData({
                debit: totalDebit,
                credit: totalCredit,
                balance: totalBalance
            });
        }
    };

    const handleRowClickMultiBeneficiary = (request) => {
        setSelectedRequest(request);
    
        console.log("requisicao selecionada", request);
    
        if (selectedRow !== request.id) {
            setSelectedRow(request.id); // não desmarca ao clicar 2 vezes na mesma linha
            setRequisition(request.requestNumber);
            setDocumentSend(request.document);
    
            if (request.requestNumber) {
                // Verificar a última sequência em accountsData
                const lastJournalDocumentNumber = accountsData.reduce((max, item) => {
                    return item.journalDocumentNumber > max ? item.journalDocumentNumber : max;
                }, 1);
    
                const lastJournalDocumentNumberNumber = Number(lastJournalDocumentNumber);
                const nextSequence = lastJournalDocumentNumberNumber + 1;
    
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
                              }
                            : row
                    );
    
                    if (!updatedTableData.some(row => row.sequence === nextSequence)) {
                        updatedTableData.push({
                            diary: diario,
                            sequence: nextSequence,
                            document: request.requestNumber,
                            description: "selectedDoc.description",
                        });
                    }
    
                    return updatedTableData;
                });
            }
    
            const filteredRequest = requests.filter(
                account => account.internalRequest.requestNumber === request.requestNumber
            );
    
            console.log("requisicao filtrada", filteredRequest);
    
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
    
            let groupedData = {};
            let creditAccounts = {}; // <- permite múltiplas contas a creditar
    
            filteredRequest.forEach((req) => {
                const debitAccountFiltered = `${req.accountPlanFinancialAssociation.number} - ${req.accountPlanFinancialAssociation.description}`;
                const description = req.description;
                const totalAmount = parseFloat(req.totalAmount);
    
                // Agrupando débitos
                if (!groupedData[debitAccountFiltered]) {
                    groupedData[debitAccountFiltered] = {
                        debit: 0,
                        description: description,
                        account: debitAccountFiltered,
                    };
                }
                groupedData[debitAccountFiltered].debit += totalAmount;
    
                // Agrupando créditos
                if (req.beneficiaryName) {
                    const creditAccountKey = `${req.beneficiaryName.number} - ${req.beneficiaryName.description}`;
                    if (!creditAccounts[creditAccountKey]) {
                        creditAccounts[creditAccountKey] = {
                            credit: 0,
                            description: 'Conta a creditar',
                            account: creditAccountKey,
                        };
                    }
                    creditAccounts[creditAccountKey].credit += totalAmount;
                }
            });
    
            let newTableData = [];
            let totalDebit = 0;
            let totalCredit = 0;
    
            // Adicionar débitos na tabela
            for (let key in groupedData) {
                const row = groupedData[key];
                newTableData.push({
                    account: row.account,
                    debit: row.debit,
                    credit: 0,
                    description: row.description,
                });
                totalDebit += row.debit;
            }
    
            // Adicionar créditos na tabela
            for (let key in creditAccounts) {
                const row = creditAccounts[key];
                newTableData.push({
                    account: row.account,
                    debit: 0,
                    credit: row.credit,
                    description: row.description,
                });
                totalCredit += row.credit;
            }
    
            const totalBalance = totalCredit - totalDebit;
    
            setTableData(newTableData);
    
            console.log("newTableData", newTableData);
            setResultData({
                debit: totalDebit,
                credit: totalCredit,
                balance: totalBalance
            });
        }
    };

  


    const TableRow = styled.tr`
    cursor: pointer;
    transition: all 0.3s ease-in-out; /* Suavidade ao alterar estilos */
  
    /* Aplicar fundo ao passar o mouse */
    &:hover {
      background-color: rgba(37, 99, 165, 0.2) !important; /* Importante para sobrepor outros estilos */
    }
  
    /* Estilo ativo */
    &.active {
      background-color: #d1e7dd !important;
      color: #0f5132 !important;
      font-weight: 600;
    }
  `;

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
                        Contas a Pagar
                    </h5>
                    <small style={{ color: "#d1e7dd", fontSize: "0.85rem" }}>
                        Gestão de obrigações a liquidar, inscrições e pagamentos a fornecedores
                    </small>
                </div>
            </div>




            <Row className="mb-3 g-3">
                <Col md={6}>
                    <Card
                        className="h-100 shadow-sm sgf-action-card"
                        onClick={() => handleAccountToPayCardClick()}
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
                                    marginRight: '16px',
                                    flexShrink: 0
                                }}
                            >
                                <FaHandshake size={22} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <h6 className="mb-0 text-truncate" style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.98rem' }}>
                                        Lançamento de Contas a Pagar
                                    </h6>
                                    <span
                                        className="badge"
                                        style={{
                                            backgroundColor: '#e8f5e9',
                                            color: '#0f5132',
                                            border: '1px solid #b7dec9',
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            padding: '4px 8px'
                                        }}
                                    >
                                        + Novo Lançamento
                                    </span>
                                </div>
                                <p className="mb-0 text-muted text-truncate" style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                    Registo de liquidação de obrigações, pagamentos e partidas a fornecedores
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
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
                                    marginRight: '16px',
                                    flexShrink: 0
                                }}
                            >
                                <FaSearch size={20} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <h6 className="mb-0 text-truncate" style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.98rem' }}>
                                        Consultar Lançamentos
                                    </h6>
                                    <span
                                        className="badge"
                                        style={{
                                            backgroundColor: '#f0f9ff',
                                            color: '#0284c7',
                                            border: '1px solid #bae6fd',
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            padding: '4px 8px'
                                        }}
                                    >
                                        Histórico / Detalhado
                                    </span>
                                </div>
                                <p className="mb-0 text-muted text-truncate" style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                    Consultar histórico analítico de movimentos e operações de contas a pagar
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>
                {`
                .form-control {
                    border: 1px solid black !important;
                }
                `}
            </style>

            <Spinner isLoading={loading} />


            {/* Modal de Pagamento */}
            <AccoutToPayModal
                show={showAccountToPayModal}
                onClose={() => {
                    setShowAccountToPayModal(false);
                    loadCurrencies();
                    loadOpenAccount();
                    loadAccounts();
                    loadAccountsFetchAllAccountingJournalEntry();
                    loadDiariesWithDocuments();
                    loadJournalEntry();
                    loadAllRequests();
                    loadAccountFinancial();
                    findAccountRequestWhitConformance()
                }}

                onComplete={handlePaymentComplete}
                requestData={null} // Passe dados adicionais se necessário
                filteredRequests={filteredRequests}
                selectedRequest={selectedRequest}
                tableData={tableData}
                handleRowDoubleClick={handleRowClick}
                addRow={addRow}
                handleInputChange={null}
                accounts={accounts}
                paymentType={null}
                documentType={null}
                setPaymentType={null}
                setDocumentType={null}
                isProcessing={isProcessing}
                paymentSuccess={null}
                setPaymentSuccess={null}
                setIsProcessing={null}
                handlePaymentConfirmation={handleConfirmation}
                removeRow={null}
                label={"Lançamento de contas a pagar"}
            />

            {/* <OperationsModal
                show={showOperationModal}
                onClose={() => setShowOperationModal(false)}
                operations={requestsToPay}
                label={"Consultar Lançamentos"}
            /> */}

            <BankingOperationsReports
                show={showOperationModal}
                onClose={() => setShowOperationModal(false)}
                operations={operationRegister}
                label={"Consultar Lançamentos (Contas a Pagar)"}
            />

        </div>
    );
};

export default AccountsToPay;
