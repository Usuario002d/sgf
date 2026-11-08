import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchAllAccountingJournal50,getRegisteredAccounts,fetchAllAccountingJournalEntryAll, findAccountPlanBudjectEntriesByYear,fetchAccountRequestWhitConformance, fetchAllAccountingJournalEntry,createRegulationAccountingJournal, createBillToReceiveAccountingJournal, fetchOpenAccount } from '../../services/accountService';
import Swal from 'sweetalert2';
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import './style.css';
import { useNavigate } from "react-router-dom";
import { useHistory } from 'react-router-dom';


const Regularization = () => {
    const [loading, setLoading] = useState(false);
    const [diaries, setDiaries] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [selectedDiary, setSelectedDiary] = useState(null);
    const [selectedDocumentId, setSelectedDocumentId] = useState(null);
    const [exchangeRate, setExchangeRate] = useState("1");
    const [generalDescription, setGeneralDescription] = useState("Regularizações");
    const [tableData, setTableData] = useState([]); // Estado para armazenar os dados da tabela
    const [tableDataInfo, setTableDataInfo] = useState([]); // Estado para armazenar os dados da tabela
    const [accounts, setAccounts] = useState([]);
    const history = useHistory();
    const [requisition, setRequisition] = useState("");
    const [comprov, setComprov] = useState("");
    const [requests, setRequests] = useState([]);
    const [accountFinancial, setAccountFinancial] = useState([]);
    const [accountsData, setAccountData] = useState([]);


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
        const debitAccountFiltered = `${financialBankAccount[0].number} - ${financialBankAccount[0].description}`;
        const creditAccountFiltered = `${filteredRequest[0].internalRequest.accountPlanFinancial.number} - ${filteredRequest[0].internalRequest.accountPlanFinancial.description}`;
        const description = filteredRequest[0].description;
    
        // Cria os dados para a tabela
        const newTableData = [
            {
                account: debitAccountFiltered,  // Conta Financeira (Débito)
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
        console.log("newTableData", newTableData);
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
    const diario = "Nº: 50";
    const open = "Regularizações";
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
            const response = await fetchAllAccountingJournalEntry();
            console.log("Todas as Contas De Lancamentos Registadas ", response);
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
        console.log("Table data",tableData )
        const firstRow = tableData[0];
        const secondRow = tableData[1];
        const accountPlanNumber1 = firstRow.account;  // Conta financeira selecionada
        const accountPlanNumber2 = secondRow.account;  // Conta financeira selecionada

        const firstRowNumber = tableDataInfo[0];
        if (!firstRowNumber) {
            console.error("Erro: Não há dados em tableDataInfo[0].");
            Swal.fire({
                icon: 'error',
                title: 'Campo Vazio',
                text: 'Selecione um Docuumento e Tente novamente.',
            });
            return;
        }
        const sequence = firstRowNumber.sequence;

        console.log("Sequencia", firstRowNumber.sequence)
        // Filtrar os dados da conta selecionada
        const filteredAccount = accounts.filter(account => account.accountPlan.number === accountPlanNumber1);
        const fistrPosition = filteredAccount[0];
        const filteredAccount2 = accounts.filter(account => account.accountPlan.number === accountPlanNumber2);
        const secondPosition = filteredAccount2[0];

        const tableData1 = tableData.map((row, index) => {
            // Alternar entre as contas baseando-se na posição da linha (par/ímpar)
            const isEven = index % 2 === 0; // Verifica se a linha é par
            const accountData = isEven ? fistrPosition : secondPosition; // Alterna entre as contas

            const getAccountPlanNumber = row.account.split(' - ')[0];
            const getAccountPlan = accountFinancial.filter(account => account.number === getAccountPlanNumber);
            const getAccountPlanId = getAccountPlan[0].id;

            return {
                accountPlanNumber: getAccountPlanNumber.trim(), // Conta Financeira, agora só o número
                value: row.debit > 0 ? row.debit : row.credit > 0 ? row.credit : 0, // Valor de débito ou crédito
                operator: row.debit > 0 ? "DEBIT" : row.credit > 0 ? "CREDIT" : "", // Define operador
                description: "Regularizações", // Descrição padrão
                accountPlanYearId: 1, // ID do ano da conta
                accountPlanId: getAccountPlanId, // ID da conta
                operationDate: data, // Data da operação
            };
        });

        console.log("meus Items", tableData1)

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

        const createOpenAccountData = {
            operationDate: data,
            accountingJournalNumber: "50",
            accountingDocumentNumber: formOpen.documentNumber,
            exchangeRate: exchangeRate,
            generalDescription: generalDescription,
            items: tableData1,
            journalDocumentNumber: String(sequence).trim(),
            internalRequestNumber: requisition,
            paid: 0
        };

        console.log("Minha Requisicao", createOpenAccountData);

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
            await createRegulationAccountingJournal({
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
    }
    };

    const loadDiariesWithDocuments = async () => {
        try {
            setLoading(true);
            const response = await fetchAllAccountingJournal50();
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
            // Verifica o maior número de journalDocumentNumber no array
            const lastJournalDocumentNumber = accountsData.reduce((max, item) => {
                return item.journalDocumentNumber > max ? item.journalDocumentNumber : max;
            }, 1); // Inicia o valor máximo como 0

            // Incrementa o maior número encontrado
            const lastJournalDocumentNumberNumber = Number(lastJournalDocumentNumber);

            console.log("Ultimo Numero", accountsData)
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
                <h3 className="header text-center" style={{ fontWeight: "bold" }}>
                Regularizações
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

                <div className="row">
                <div className="col-md-2 mb-2">
            <label className="form-label text-black fw-bold fs-5">Requisição</label>
            <input
                value={requisition} // Valor do estado
                onChange={(e) => setRequisition(e.target.value)} // Atualiza o estado
                onBlur={handleBlur} // Executa ao perder o foco
                className="form-control"
                style={{ width: "100%" }}
                placeholder="Introduz o número da Requisição"
            />
        </div>

    <div className="col-md-3 mb-2">
    <label className="form-label text-black fw-bold fs-5">Comprovativo</label>
        <input
            value={comprov}
            className="form-control"
            style={{ width: "100%" }}
            placeholder="Introduz o número do Comprovativo"
        />
    </div>
</div>


                <div className="col-md-6">
                    <div className="card border-dark mb-3">
                        <div className="card-body">
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
    <thead 
    style={{ backgroundColor: "#007BFF", color: "white",
        textAlign: 'center',
         position: "sticky",
         top: 0,
         zIndex: 2, // Garante que o cabeçalho fique sobre o conteúdo da tabela
    }}>
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
                                    {tableData.map((row, index) => (
                                        <tr key={index}>
                                            <td>{row.account}</td>
                                            <td>{row.debit}</td>
                                            <td>{row.credit}</td>
                                            <td>{row.description}</td>
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
                                 {/* Renderizando a tabela */}
                                <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Conta</th>
                                        <th>Descrição</th>
                                        <th>Débito</th>
                                        <th>Crédito</th>
                                        <th>Saldo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Renderizando as linhas de dados */}
                                    {tableData.map((row, index) => (
                                        <tr key={index}>
                                            <td>{row.account}</td>
                                            <td>{row.description}</td>
                                            <td>{row.debit}</td>
                                            <td>{row.credit}</td>
                                            <td>{row.balance}</td>
                                        </tr>
                                    ))}

                                    {/* Linha de Resultado */}
                                    <tr>
                                        <td colSpan="2">Resultado</td>
                                        <td>{resultData.debit}</td>
                                        <td>{resultData.credit}</td>
                                        <td>{resultData.balance}</td>
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

export default Regularization;


