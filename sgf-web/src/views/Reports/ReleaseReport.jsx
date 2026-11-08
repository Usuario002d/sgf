import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchAllAccountingJournal20, findAccountPlanBudjectEntriesByYear, fetchAllAccountingJournalEntry, fetchAllAccountingJournalEntryAll, createBillToReceiveAccountingJournal, fetchOpenAccount } from '../../services/accountService';
import Swal from 'sweetalert2';
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import './style.css';
import { useHistory } from 'react-router-dom';

const ReleaseReport = () => {
    const [loading, setLoading] = useState(false);
    const [diaries, setDiaries] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [selectedDiary, setSelectedDiary] = useState(null);
    const [exchangeRate, setExchangeRate] = useState("");
    const [generalDescription, setGeneralDescription] = useState("CONTAS A RECEBER");
    const [tableData, setTableData] = useState([]); // Estado para armazenar os dados da tabela
    const [accounts, setAccounts] = useState([]);
    const [accountsData, setAccountData] = useState([]);
    const [selectedOption, setSelectedOption] = useState(""); // Estado para o select
    const [tableData1, setTableData1] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [fillSecondTable, setFillSecondTable] = useState([]);
    const [summary, setSummary] = useState([]); // Dados calculados para a segunda tabela
    const [showModal, setShowModal] = useState(false); // Declaração do estado showModal



    const handleSelectChange = (event) => {
        setSelectedOption(event.target.value);

        const selectedValue = event.target.value;

        // Divide o valor selecionado em código e descrição
        const [code, description] = selectedValue.split("-");

        // Filtra os dados com base na descrição
        const filtered = accountsData.filter((item) => item.accountingJournal.description === description);

        console.log("Selecionado:", selectedValue);
        console.log("Filtrou:", filtered);

        setFilteredData(filtered);

        // Verifica se dados foram encontrados e mapeia para o novo formato
        const formattedData = filtered.map((item) => ({
            diario: code,
            document: item.accountingDocument.documentNumber,
            number1: item ? item.journalDocumentNumber : "N/A" // Acessa o número do documento ou retorna "N/A" se não existir
        }));

        console.log("Form Data", formattedData);

        setTableData1(formattedData)
    };


    const handleRowClick = (index, rowData) => {
        setSelectedRow(index); // Define a linha selecionada
        console.log('Dados da linha clicada:', rowData); // Exibe os dados da linha clicada no console

        const tableData2 = tableData1;

        console.log("Dados Criados", rowData.number1);

        const filteredAccount = filteredData.filter(account => account.journalDocumentNumber === rowData.number1);

        console.log("filtrados", filteredAccount)

        setFillSecondTable(filteredAccount)
    };
    // Estado para armazenar as linhas da tabela
    const [rows, setRows] = useState([
        { account: "", debit: "", credit: "", description: "" },
        { account: "", debit: "", credit: "", description: "" },
    ]);
    const addRow = () => {
        setRows([...rows, { account: "", debit: "", credit: "", description: "" }]);
    };
    const updateRows = (newRows) => {
        setRows(newRows);
    };
    // Cálculo dos valores da segunda tabela
    const calculateSummary = () => {
        const groupedAccounts = rows.reduce((acc, row) => {
            if (!row.account) return acc;

            if (!acc[row.account]) {
                acc[row.account] = { description: "", debit: 0, credit: 0 };
            }

            acc[row.account].description = accounts.find(
                (account) => account.accountPlan.number === row.account
            )?.accountPlan.description;

            acc[row.account].debit += parseFloat(row.debit) || 0;
            acc[row.account].credit += parseFloat(row.credit) || 0;

            return acc;
        }, {});

        return Object.entries(groupedAccounts).map(([account, data]) => ({
            account,
            description: data.description,
            debit: data.debit,
            credit: data.credit,
            balance: data.debit - data.credit,
        }));
    };

    // Sincronização entre as tabelas
    useEffect(() => {
        const updatedSummary = calculateSummary();
        setSummary(updatedSummary);
    }, [rows]);

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


    const loadJournalEntry = async () => {
        try {
            setLoading(true);
            const response = await fetchAllAccountingJournalEntryAll();
            console.log("Tpodas as Contas Journal:", response);
            setAccountData(response)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };





    const loadAccountsFetchAllAccountingJournalEntry = async () => {
        try {
            setLoading(true);
            const response = await fetchAllAccountingJournalEntry();
            console.log("Todas as Contas De Lancamentos Registadas ", response);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJournalEntry();
    }, []);
    const handleSubmit = async () => {
        const firstRow = rows[0];
        const secondRow = rows[1];
        const accountPlanNumber1 = firstRow.account;  // Conta financeira selecionada
        const accountPlanNumber2 = secondRow.account;  // Conta financeira selecionada

        // Filtrar os dados da conta selecionada
        const filteredAccount = accounts.filter(account => account.accountPlan.number === accountPlanNumber1);
        const fistrPosition = filteredAccount[0];
        const filteredAccount2 = accounts.filter(account => account.accountPlan.number === accountPlanNumber2);
        const secondPosition = filteredAccount2[0];

        const tableData = rows.map((row, index) => {
            // Alternar entre as contas baseando-se na posição da linha (par/ímpar)
            const isEven = index % 2 === 0; // Verifica se a linha é par
            const accountData = isEven ? fistrPosition : secondPosition; // Alterna entre as contas

            return {
                accountPlanNumber: row.account, // Conta Financeira
                value: row.debit > 0 ? row.debit : row.credit > 0 ? row.credit : 0, // Valor de débito ou crédito
                operator: row.debit > 0 ? "DEBIT" : row.credit > 0 ? "CREDIT" : "", // Define operador
                description: "Contas a Receber", // Descrição padrão
                accountPlanYearId: accountData.accountPlanYearId, // ID do ano da conta
                accountPlanId: accountData.accountPlan.id, // ID da conta
                operationDate: data, // Data da operação
            };
        });

        console.log("meus Items", tableData)

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

        if (missingFields.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Erro ao enviar',
                text: `Os seguintes campos estão em falta: ${missingFields.join(", ")}`,
            });
            return;
        }

        const createOpenAccountData = {
            operationDate: data,
            accountingJournalNumber: "20",
            accountingDocumentNumber: formOpen.documentNumber,
            exchangeRate: exchangeRate,
            generalDescription: generalDescription,
            items: tableData
        };

        console.log("Minha Requisicao", createOpenAccountData);

        try {
            // Registra a requisição
            await createBillToReceiveAccountingJournal({
                ...createOpenAccountData,
            });
            // Exibe o pop-up de sucesso
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Requisição feita com sucesso!',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#28a745', // Cor personalizada para sucesso
            }).then(() => {
                setLoading(false); // Desativa o carregamento após o sucesso
                window.location.reload(); // Recarrega a página após 2 segundos
            });

        } catch (error) {
            console.error(error);

            // Exibe o pop-up de erro
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Erro ao registar a Abertura! Tente novamente.',
                confirmButtonText: 'Ok',
                confirmButtonColor: '#dc3545', // Cor personalizada para erro
            }).then(() => {
                setLoading(false); // Desativa o carregamento após o erro
            });
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
        // const history = useHistory(); // Hook useHistory() para obter a instância de history
        // history.push("/lancamentos");
        // setShowModal(true);
        return;
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
    }, []);
    const handleDiarySelection = (id) => {
        const diary = diaries.find((d) => d.id === id);
        setSelectedDiary(diary || null);
    };

    const handleDocumentSelection = (event) => {
        const selectedNumber = event.target.value; // Obtem o número do documento selecionado
        const selectedDoc = documents.find(doc => doc.documentNumber === selectedNumber);

        if (selectedDoc) {
            setFormOpen({
                ...formOpen,
                documentNumber: selectedDoc.documentNumber,
                documentDescription: selectedDoc.description,
            });

            // Adiciona os dados na tabela
            setTableData((prevTableData) => [
                ...prevTableData,
                {
                    diary: diario,
                    sequence: prevTableData.length + 1, // Gera sequência iniciando em 1
                    document: selectedDoc.documentNumber,
                    description: selectedDoc.description,
                },
            ]);
        }
    };

    return (
        <div className="container-fluid px-3 py-2">
            {/* Header Institucional SGF com Seletor Integrado e Ação */}
            <div className="sgf-header-box">
                <div className="header-title-area">
                    <span style={{ fontSize: "28px" }}>📋</span>
                    <div>
                        <h3>RELATÓRIO DE LANÇAMENTOS</h3>
                        <p>Controlo, Consulta de Diários, Documentos e Lançamentos Contabilísticos</p>
                    </div>
                </div>
                <div className="header-action-area">
                    <select
                        value={selectedOption}
                        onChange={handleSelectChange}
                        className="sgf-header-select"
                        style={{ minWidth: "220px" }}
                    >
                        <option value="">-- Selecione o Diário --</option>
                        <option value="00-Abertura">00 - Abertura</option>
                        <option value="10-Contas a Pagar">10 - Contas a Pagar</option>
                        <option value="20-Contas a Receber">20 - Contas a Receber</option>
                        <option value="30-Bancos Entradas">30 - Bancos Entradas</option>
                        <option value="40-Bancos Saídas">40 - Bancos Saídas</option>
                        <option value="50-Regularizações">50 - Regularizações</option>
                    </select>
                    <button
                        className="btn-view-entries"
                        onClick={handleViewEntries}
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                    >
                        📜 Novo Lançamento
                    </button>
                </div>
            </div>

            {/* Tabela de Diários Ocupando Largura Total */}
            <div className="row mb-3">
                <div className="col-12">
                    <div className="card shadow-sm border-0" style={{ border: "1px solid #b7dec9 !important", borderRadius: "10px" }}>
                        <div className="card-body p-2">
                            <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                <table className="table table-hover table-sm mb-0 report-table">
                                    <thead>
                                        <tr>
                                            <th>Diário</th>
                                            <th>Nº Registo</th>
                                            <th>Documento</th>
                                            <th>Nº Documento</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData1.length > 0 ? (
                                            tableData1.map((row, index) => (
                                                <tr
                                                    key={index}
                                                    onClick={() => handleRowClick(index, row)}
                                                    className={`table-row ${selectedRow === index ? 'active' : ''}`}
                                                >
                                                    <td style={{ fontWeight: "600", color: "#0f5132" }}>{row.diario}</td>
                                                    <td>{row.number1}</td>
                                                    <td>{row.document}</td>
                                                    <td>{row.number1}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center text-muted py-3">
                                                    Selecione um diário acima para carregar os lançamentos.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabelas de Detalhe e Resumo */}
            <div className="row">
                <div className="col-lg-7 mb-3">
                    <div className="card shadow-sm border-0" style={{ border: "1px solid #b7dec9 !important", borderRadius: "10px" }}>
                        <div className="card-header bg-white py-2 px-3 d-flex justify-content-between align-items-center" style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <strong style={{ color: "#0f5132", fontSize: "14px" }}>Detalhes do Lançamento</strong>
                            <Button 
                                variant="outline-success" 
                                size="sm" 
                                onClick={addRow}
                                style={{ fontWeight: "600", borderRadius: "6px" }}
                            >
                                + Adicionar Linha
                            </Button>
                        </div>
                        <div className="card-body p-2">
                            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                                <Table striped hover size="sm" className="mb-0 report-table">
                                    <thead>
                                        <tr>
                                            <th>Conta Financeira</th>
                                            <th>Débito</th>
                                            <th>Crédito</th>
                                            <th>Descrição</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fillSecondTable.length > 0 ? (
                                            fillSecondTable.map((entry) => {
                                                return entry.entriesEntry.map((item, index) => (
                                                    <tr key={item.id}>
                                                        <td style={{ fontWeight: "600" }}>{item.accountPlanNumber}</td>
                                                        <td className="text-end">{item.operator === 'DEBIT' ? Number(item.value).toLocaleString('pt-MZ', { minimumFractionDigits: 2 }) : '-'}</td>
                                                        <td className="text-end">{item.operator === 'CREDIT' ? Number(item.value).toLocaleString('pt-MZ', { minimumFractionDigits: 2 }) : '-'}</td>
                                                        <td>{item.description}</td>
                                                    </tr>
                                                ));
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center text-muted py-4">
                                                    Clique num lançamento acima para visualizar os movimentos detalhados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5 mb-3">
                    <div className="card shadow-sm border-0" style={{ border: "1px solid #b7dec9 !important", borderRadius: "10px" }}>
                        <div className="card-header bg-white py-2 px-3" style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <strong style={{ color: "#0f5132", fontSize: "14px" }}>Resumo por Conta e Saldo</strong>
                        </div>
                        <div className="card-body p-2">
                            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                                <Table striped hover size="sm" className="mb-0 report-table">
                                    <thead>
                                        <tr>
                                            <th>Conta</th>
                                            <th>Descrição</th>
                                            <th className="text-end">Débito</th>
                                            <th className="text-end">Crédito</th>
                                            <th className="text-end">Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ fontWeight: "600" }}>{item.account}</td>
                                                <td>{item.description}</td>
                                                <td className="text-end">{item.debit.toFixed(2)}</td>
                                                <td className="text-end">{item.credit.toFixed(2)}</td>
                                                <td className="text-end" style={{ fontWeight: "600", color: item.balance < 0 ? "#dc3545" : "#0f5132" }}>
                                                    {item.balance.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Totais */}
                                        <tr style={{ background: "#f8faf9", fontWeight: "700" }}>
                                            <td colSpan="2" style={{ color: "#0f5132" }}>Resultado Total</td>
                                            <td className="text-end">
                                                {summary.reduce((total, item) => total + item.debit, 0).toFixed(2)}
                                            </td>
                                            <td className="text-end">
                                                {summary.reduce((total, item) => total + item.credit, 0).toFixed(2)}
                                            </td>
                                            <td className="text-end" style={{ color: summary.reduce((total, item) => total + item.balance, 0) < 0 ? "#dc3545" : "#0f5132" }}>
                                                {summary.reduce((total, item) => total + item.balance, 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReleaseReport;