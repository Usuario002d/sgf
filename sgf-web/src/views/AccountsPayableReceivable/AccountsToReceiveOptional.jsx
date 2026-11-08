import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchAllAccountingJournal20, fetchAllAccountingJournalEntryAll, findAccountPlanBudjectEntriesByYear, fetchAllAccountingJournalEntry, createBillToReceiveAccountingJournal, fetchOpenAccount } from '../../services/accountService';
import Swal from 'sweetalert2';
import './style.css';
import { useNavigate } from "react-router-dom";
import { useHistory } from 'react-router-dom';
import { Modal, Form, Button, Badge, Card, Row, Col, Table } from 'react-bootstrap';
import { FaCreditCard, FaHandshake, FaSearch, FaRegStopCircle, FaUndo, FaMoneyCheck } from 'react-icons/fa'; // Importando ícones
import BankingOperations from './BankingOperations'; // Ajuste o caminho conforme sua estrutura
import BankingOperationsReports from './BankingOperationsReports'; // Ajuste o caminho conforme sua estrutura


const AccountsToReceiveOptional = () => {

    const [loading, setLoading] = useState(false);
    const [diaries, setDiaries] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [selectedDiary, setSelectedDiary] = useState(null);
    const [selectedDocumentId, setSelectedDocumentId] = useState(null);
    const [exchangeRate, setExchangeRate] = useState("1");
    const [generalDescription, setGeneralDescription] = useState("Cntas a Receber");
    const [tableData, setTableData] = useState([]); // Estado para armazenar os dados da tabela
    const [tableDataInfo, setTableDataInfo] = useState([]); // Estado para armazenar os dados da tabela
    const [accounts, setAccounts] = useState([]);
    const history = useHistory();
    const [accountsData, setAccountData] = useState([]);
    const [activeTab, setActiveTab] = useState(''); // Estado para controlar a aba ativa
    const [selectedOption, setSelectedOption] = useState(""); //Estado para controlar se option esta activa
    const [selectedDocument, setSelectedDocument] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showReportsModal, setShowReportsModal] = useState(false);

    const [operationRegister, setOperationRegister] = useState([]);


    const [namePersonCharge, setNamePersonCharge] = useState('');

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

    const [createOpenAccountDataSend, setCreateOpenAccountDataSend] = useState(null);



    //Outras variaveis - Ronaldo

    const MovimentosBancarios = () => {
        const [activeTab, setActiveTab] = useState("movimentos_bancarios");
        const [selectedOption, setSelectedOption] = useState("");
    }
    //const [selectedOption, setSelectedOption] = useState("");
    const [paymentType, setPaymentType] = useState("");
    const [paymentDocument, setPaymentDocument] = useState("");
    const [operationDate, setOperationDate] = useState("");



    // const handleInputChange = (index, field, value) => {
    //     const updatedRows = [...tableData];

    //     if (field === "DEBIT") {
    //         updatedRows[index].debit = value;
    //         if (index === 0) {
    //             updatedRows[index].credit = ""; // Apenas a primeira linha pode ter débito
    //         }
    //     } else if (field === "CREDIT") {
    //         updatedRows[index].credit = value;
    //         if (index !== 0) {
    //             updatedRows[index].debit = ""; // As linhas subsequentes só podem ter crédito
    //         }
    //     } else {
    //         updatedRows[index][field] = value;
    //     }

    //     setTableData(updatedRows);
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


    const handleAccountToPayCardClick = (request) => {
        setShowModal(true);
    };

    const handleOperationsCardClick = (request) => {
        setShowReportsModal(true);
    };


    const handlePaymentComplete = (paymentData) => {
        console.log('Pagamento concluído:', paymentData);
    };
    const removeRow = (index) => {
        setTableData(tableData.filter((_, i) => i !== index));
    };

    // Atualiza o estado para mostrar o segundo select
    const handleSelectChange = (event) => {
        setSelectedOption(event.target.value);
        setPaymentType(event.target.value);
    }


    // Estado para armazenar as linhas da tabela
    const [rows, setRows] = useState([
        { account: "", debit: "", credit: "", description: "" },
        { account: "", debit: "", credit: "", description: "" },
    ]);
    // const addRow = () => {
    //     console.log("Adicionando nova linha");

    //     // Se for a primeira linha, deve ser um débito
    //     const newRow = { account: "", debit: "", credit: "", description: "" };
    //     setTableData([...tableData, newRow]);
    // };

    const addRow = () => {
        console.log("Adicionando nova linha");

        // Adiciona uma nova linha vazia sem pressupor débito ou crédito
        const newRow = { account: "", debit: "", credit: "", description: "" };

        setTableData(prev => [...prev, newRow]);
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
    const diario = "Nº: 20";
    const open = "Contas a Receber";
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
                item.entry?.accountingJournalId === 3
            );

            console.log("Todas as Contas De Lançamentos Registradas", response);

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
            console.log("DADOS responsebase", response);

            setOperationRegister(agrupados);
        } catch (error) {
            console.error("Erro ao carregar os lançamentos:", error);
        } finally {
            setLoading(false);
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


        console.log("dados dad tabela", tableData)

        // Criando a estrutura de dados para envio
        // const tableDataToSend = tableData.map((row, index) => ({
        //     accountPlanNumber: row.account,
        //     value: index === 0 ? row.debit : row.credit,
        //     operator: index === 0 ? "DEBIT" : "CREDIT",
        //     description: row.description || "Contas a Receber",
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
                description: row.description || "",
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
            accountingJournalNumber: "20",
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

        // // Exibir mensagem de confirmação antes de enviar
        // Swal.fire({
        //     title: 'Confirmar envio?',
        //     text: 'Deseja realmente enviar os dados?',
        //     icon: 'warning',
        //     showCancelButton: true,
        //     confirmButtonColor: '#3085d6',
        //     cancelButtonColor: '#d33',
        //     confirmButtonText: 'Sim, enviar!',
        //     cancelButtonText: 'Cancelar'
        // }).then(async (result) => {
        //     if (result.isConfirmed) {
        //         try {
        //             await createBillToReceiveAccountingJournal(createOpenAccountData);

        //             Swal.fire({
        //                 icon: 'success',
        //                 title: 'Sucesso!',
        //                 text: 'Requisição feita com sucesso!',
        //                 confirmButtonText: 'Ok',
        //                 confirmButtonColor: '#28a745',
        //             }).then(() => {
        //                 setLoading(false);
        //                 window.location.reload();
        //             });

        //         } catch (error) {
        //             console.error(error);
        //             Swal.fire({
        //                 icon: 'error',
        //                 title: 'Erro!',
        //                 text: 'Erro ao registrar a abertura! Tente novamente.',
        //                 confirmButtonText: 'Ok',
        //                 confirmButtonColor: '#dc3545',
        //             }).then(() => {
        //                 setLoading(false);
        //             });
        //         }
        //     }
        // });
    };


    const submitRequest = async () => {
        try {
            await createBillToReceiveAccountingJournal(createOpenAccountDataSend);
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



    const loadDiariesWithDocuments = async () => {
        try {
            setLoading(true);
            const response = await fetchAllAccountingJournal20();
            console.log("Diários e Documentos Recebidos:", response);
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


    useEffect(() => {
        loadDiariesWithDocuments();
    }, []);
    // Carregar moedas quando o componente for montado
    useEffect(() => {
        loadCurrencies();
        loadOpenAccount();
        loadAccounts();
        loadAccountsFetchAllAccountingJournalEntry();
        loadJournalEntry();
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
                        Contas a Receber
                    </h5>
                    <small style={{ color: "#d1e7dd", fontSize: "0.85rem" }}>
                        Gestão de direitos a receber, cobranças e recebimentos de clientes
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
                                <FaMoneyCheck size={22} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <h6 className="mb-0 text-truncate" style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.98rem' }}>
                                        Lançamento de Contas a Receber
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
                                    Registo de cobranças, recebimentos de clientes e posições de crédito
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
                                    Consultar histórico analítico de faturas e recebimentos processados
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


            {/* Modal de Pagamento */}
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
                label={"Lançamentos de contas a receber"}
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
            />

        </div>
    );
};

export default AccountsToReceiveOptional;







