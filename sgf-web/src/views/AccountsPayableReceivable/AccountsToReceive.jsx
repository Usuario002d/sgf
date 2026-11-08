import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchAllAccountingJournal20, findAccountPlanBudjectEntriesByYear, fetchAllAccountingJournalEntry, createBillToReceiveAccountingJournal, fetchOpenAccount } from '../../services/accountService';
import Swal from 'sweetalert2';
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import './style.css';
import { useNavigate } from "react-router-dom";
import { useHistory } from 'react-router-dom';


const AccountsToReceive = () => {
    const [loading, setLoading] = useState(false);
    const [diaries, setDiaries] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [selectedDiary, setSelectedDiary] = useState(null);
    const [selectedDocumentId, setSelectedDocumentId] = useState(null);
    const [exchangeRate, setExchangeRate] = useState("");
    const [generalDescription, setGeneralDescription] = useState("Contas a Pagar");
    const [tableData, setTableData] = useState([]); // Estado para armazenar os dados da tabela
    const [tableDataInfo, setTableDataInfo] = useState([]); // Estado para armazenar os dados da tabela
    const [accounts, setAccounts] = useState([]);
    const history = useHistory();


    // Estado para armazenar as linhas da tabela
    const [rows, setRows] = useState([
        { account: "", debit: "", credit: "", description: "" },
        { account: "", debit: "", credit: "", description: "" },
    ]);
    const addRow = () => {
        setRows([...rows, { account: "", debit: "", credit: "", description: "" }]);
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
            const response = await fetchAllAccountingJournalEntry();
            console.log("Todas as Contas De Lancamentos Registadas ", response);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        const firstRow = rows[0];
        const secondRow = rows[1];
        const accountPlanNumber1 = firstRow.account;  // Conta financeira selecionada
        const accountPlanNumber2 = secondRow.account;  // Conta financeira selecionada

        const firstRowNumber = tableDataInfo[0];

        const sequence = firstRowNumber.sequence;

        console.log("Sequencia", firstRowNumber.sequence)
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
                description: row.description, // Descrição padrão
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
            items: tableData,
            journalDocumentNumber: String(sequence).trim(),
            paid: 0
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
            const lastDocument = accountsData[accountsData.length - 1]; // Pega o último item da lista accountsData
            const lastJournalDocumentNumber = lastDocument ? lastDocument.journalDocumentNumber : 0; // Se existir, pega o número do documento, senão 0

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
        <div className="container py-4">
            <style>
                {`
                .form-control {
                    border: 1px solid black !important;
                }
                `}
            </style>
            <div className="row">
                {/* Primeiro Card */}
                <h3 className="header text-center" style={{ fontWeight: "bold", backgroundColor: "#264f36", color: "white" }}>
                    Contas a Receber
                </h3>
                <div className="row justify-content-center">
                    {/* Primeiro Card */}
                    <div className="d-flex justify-content-center">
                        <button
                            className="btn-view-entries"
                            onClick={handleViewEntries}>
                            📜 Visualizar Lançamentos
                        </button>
                    </div>
                </div>


                <div className="col-md-6">
                    <div className="card mb-3">
                        <div className="card-body">
                            <h5 className="card-title"><strong>Contas A receber</strong></h5>
                            <div className="mb-3">
                                <label className="form-label text-black">Data</label>
                                <div className="d-flex gap-2">
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={data}
                                        onChange={(e) => setData(e.target.value)}
                                        disabled
                                        style={{ backgroundColor: "#cccccc", cursor: "not-allowed" }}
                                    />
                                    <select
                                        className="form-control border-black"
                                        placeholder="Selecioner o tipo de Moeda"
                                        value={selectedCurrency}
                                        onChange={(e) => setSelectedCurrency(e.target.value)}
                                        required
                                    >
                                        {currencies.length === 0 ? (
                                            <option value="MZN">MZN - Moeda Moçambicana</option> // Exibe o padrão se ainda não carregou
                                        ) : (
                                            <>
                                                {currencies.map((currency) => (
                                                    <option key={currency.code} value={currency.code}>
                                                        {currency.code} - {currency.name}
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                    </select>

                                    <input
                                        type="text"
                                        placeholder='Taxa de Câmbio'
                                        className="form-control"
                                        value={exchangeRate}
                                        onChange={(e) => setExchangeRate(e.target.value)}
                                    />

                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-black">Diário</label>
                                <div className="d-flex gap-2">
                                    <input
                                        className="form-control"
                                        value={diario}
                                        readOnly
                                        disabled
                                        style={{ backgroundColor: "#cccccc", cursor: "not-allowed" }}
                                    />
                                    <input
                                        className="form-control"
                                        value={open}
                                        readOnly
                                        disabled
                                        style={{ backgroundColor: "#cccccc", cursor: "not-allowed" }}
                                    />
                                    {/* <input
                                        type="text"
                                        placeholder='Descrição Geral'
                                        className="form-control"
                                        value={generalDescription}
                                        onChange={(e) => setGeneralDescription(e.target.value)}
                                        disabled
                                        style={{ backgroundColor: "#cccccc", cursor: "not-allowed" }}
                                    /> */}
                                </div>
                            </div>
                            <div>
                                <label className="form-label text-black">Documento</label>
                                <div className="d-flex gap-2">
                                    <select
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

                                    <input
                                        placeholder="Descrição"
                                        className="form-control"
                                        value={
                                            formOpen.documentDescription
                                        }
                                        readOnly
                                        disabled
                                        style={{ backgroundColor: "#cccccc", cursor: "not-allowed" }}
                                    />

                                    <button id="searchButton">
                                        🔍
                                    </button>

                                </div>
                                <button
                                    className="btn btn-primary mt-2"
                                    onClick={handleSubmit}
                                >
                                    Enviar Dados
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Segundo Card (Consolidado) */}
                <div className="col-md-6">
                    <div className="card border-dark mb-3">
                        <div className="card-body">
                            <div className="mb-4">
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>Diário</th>
                                            <th>Nº</th>
                                            <th>Documento</th>
                                            <th>Nº</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableDataInfo.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.diary}</td>
                                                <td>{row.sequence}</td>
                                                <td>{row.document}</td>
                                                <td>{row.sequence}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>

                        </div>
                    </div>

                </div>

            </div>

            {/* Tabelas */}
            <div className="row">
                <div className="col-md-7">
                    <div className="card border-dark mb-3">
                        <div className="card-body">
                            <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px', border: '1px solid #ddd' }}>
                                <div className="mb-4">
                                    <div className="mb-3">
                                        <Button variant="dark" onClick={addRow}>
                                            Adicionar Linha
                                        </Button>
                                    </div>
                                    <Table striped bordered hover className="custom-table">
                                        <thead>
                                            <tr>
                                                <th>Conta Financeira</th>
                                                <th>Débito</th>
                                                <th>Crédito</th>
                                                <th>Descrição</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <Form.Select
                                                            value={row.account}
                                                            onChange={(e) => handleChange(index, "account", e.target.value)}
                                                            className="custom-select small-select" // Classe personalizada para reduzir o tamanho
                                                            style={{ maxWidth: "150px", fontSize: "0.9em" }} // Inline styles para controle adicional
                                                        >
                                                            <option value="">Bancos</option>
                                                            {accounts
                                                                .filter(
                                                                    (account) =>
                                                                        account.accountPlan.type === "financial" &&
                                                                        account.accountPlan.writable === "moviment"
                                                                )
                                                                .map((account) => (
                                                                    <option key={account.id} value={account.accountPlan.number}>
                                                                        {account.accountPlan.number} - {account.accountPlan.description}
                                                                    </option>
                                                                ))}
                                                        </Form.Select>
                                                    </td>

                                                    <td>
                                                        <Form.Control
                                                            type="number"
                                                            value={row.debit}
                                                            onChange={(e) => handleChange(index, "DEBIT", e.target.value)}
                                                            disabled={row.credit}
                                                            className="custom-input"
                                                        />
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            type="number"
                                                            value={row.credit}
                                                            onChange={(e) => handleChange(index, "CREDIT", e.target.value)}
                                                            disabled={row.debit}
                                                            className="custom-input"
                                                        />
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            type="text"
                                                            value={row.description}
                                                            onChange={(e) =>
                                                                handleChange(index, "description", e.target.value)
                                                            }
                                                            className="custom-input"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-5">
                    <div className="card border-dark mb-3">
                        <div className="card-body">
                            <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px', border: '1px solid #ddd' }}>
                                <div className="mb-4">
                                    <Table striped bordered hover>
                                        <thead
                                            style={{
                                                backgroundColor: "#007BFF", color: "white",
                                                textAlign: 'center',
                                                position: "sticky",
                                                top: 0,
                                                zIndex: 2, // Garante que o cabeçalho fique sobre o conteúdo da tabela
                                            }}>
                                            <tr>
                                                <th>Conta</th>
                                                <th>Descrição</th>
                                                <th>Débito</th>
                                                <th>Crédito</th>
                                                <th>Saldo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {calculateSummary().map((summary, index) => (
                                                <tr key={index}>
                                                    <td>{summary.account}</td>
                                                    <td>{summary.description}</td>
                                                    <td>{summary.debit.toFixed(2)}</td>
                                                    <td>{summary.credit.toFixed(2)}</td>
                                                    <td>{summary.balance.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            {/* Linha de Resultado */}
                                            <tr>
                                                <td colSpan="2">Resultado</td>
                                                <td>
                                                    {calculateSummary().reduce((total, summary) => total + summary.debit, 0).toFixed(2)}
                                                </td>
                                                <td>
                                                    {calculateSummary().reduce((total, summary) => total + summary.credit, 0).toFixed(2)}
                                                </td>
                                                <td>
                                                    {calculateSummary().reduce((total, summary) => total + summary.balance, 0).toFixed(2)}
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


        </div>
    );
};

export default AccountsToReceive;







