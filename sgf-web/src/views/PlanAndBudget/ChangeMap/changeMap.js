import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Row, Col, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './styles.css'; // Import your custom styles
import { getRegisteredAccounts, fetchAccountPlanBudjectEntriesByYear, saveMovimentCount, saveReduction } from '../../../services/accountService';

const ChangeMap = () => {
  const [showExtract, setShowExtract] = useState(false);
  const [showMovements, setShowMovements] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [movementsData, setMovementsData] = useState([]);
  const [parentAccounts, setParentAccounts] = useState([]);
  const [newCount, setNewAccount] = useState([]);
  const [dates, setDates] = useState({
    dataInicio: '',
    dataFim: ''
  });

  const renderMovements = () => {
    if (selectedRow && Array.isArray(selectedRow.entriesEntry)) {
      return selectedRow.entriesEntry.map((movement, index) => {
        // Acessando os valores dentro de "movement"
        const accountPlanDescription = movement.accountPlanBudject?.description;
        const postingDate = movement.postingDate;
        const formattedDate = new Intl.DateTimeFormat('pt-PT').format(new Date(postingDate));
        const finalAllocation = selectedRow.finalAllocation;
        const initialAllocation = selectedRow.initialAllocation;

  
        // Imprime o movimento no console
        console.log(movement);
  
        return (
          <tr key={index} onClick={() => handleMovementRowClick(movement)} style={{ cursor: 'pointer' }}>
            <td>{formattedDate}</td> {/* Mostrando a data de postagem */}
            <td>1</td>
            <td>{accountPlanDescription}</td> {/* Mostrando a descrição do plano de contas */}
            <td>{finalAllocation}</td> {/* Mostrando o valor da alocação final */}
            <td>{initialAllocation}</td>
            <td>{finalAllocation}</td>
            <td>DOC006</td>
            <td>IPC006</td>
          </tr>
        );
      });
    } else {
      return <tr><td colSpan="6">Nenhum movimento encontrado.</td></tr>;
    }
  };
  
  
  

  // Data for table rendering
  const data = [
    {
      code: '001',
      description: 'Alteração 1',
      initialAllocation: 1000,
      inscription: 200,
      cancellation: 50,
      reallocationIncrease: 150,
      reallocationDecrease: 100,
    },
    {
      code: '002',
      description: 'Alteração 2',
      initialAllocation: 1500,
      inscription: 300,
      cancellation: 75,
      reallocationIncrease: 100,
      reallocationDecrease: 50,
    },
  ];

  const extracts = {
    '001': {
      title: 'AFRICAN TRACKING SECURITY SERVICES, LDA 10/09/2024 | Pág. 1/99',
      account: 'Extrato de Conta 111...89999 (01-01-2023 até 30-06-2023) Valores em MT',
      movements: [
        { date: '2023-01-01', diary: '00', description: 'Caixa - Abertura', debit: 38400.62, credit: 0, balance: 38400.62, docNum: 'DOC001', ipc: 'IPC001' },
        { date: '2023-01-31', diary: '10', description: 'VD-2301', debit: 200, credit: 0, balance: 38200.62, docNum: 'DOC002', ipc: 'IPC002' },
        { date: '2023-01-31', diary: '10', description: 'VD-2302', debit: 1000, credit: 0, balance: 37200.62, docNum: 'DOC003', ipc: 'IPC003' },
        // More movements...
      ],
    },
    '002': {
      title: 'AFRICAN TRACKING SECURITY SERVICES, LDA 10/09/2024 | Pág. 1/99',
      account: 'Extrato de Conta 222...99999 (01-01-2023 até 30-06-2023) Valores em MT',
      movements: [
        { date: '2023-02-01', diary: '00', description: 'Caixa - Abertura', debit: 24000.00, credit: 0, balance: 24000.00, docNum: 'DOC006', ipc: 'IPC006' },
        { date: '2023-02-28', diary: '10', description: 'VD-2401', debit: 300, credit: 0, balance: 23700.00, docNum: 'DOC007', ipc: 'IPC007' },
        // More movements...
      ],
    },
  };

  const loadAccounts = async () => {
    try {
      const response = await fetchAccountPlanBudjectEntriesByYear();

      // Filtering accounts based on the criteria
      const filteredAccounts = response.filter(account =>
        account.accountPlan.type === 'budject' 
      );

      // Updating state with the filtered accounts
      setParentAccounts(filteredAccounts);
      setNewAccount(filteredAccounts);

      console.log("Filtered accounts:", filteredAccounts);
      console.log("Number of filtered accounts:", filteredAccounts.length);
    } catch (error) {
      console.error("Error loading accounts:", error);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
  }, [parentAccounts]);

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setShowExtract(true);
  };

  const handleExtractClose = () => {
    setShowExtract(false);
  };

  const handleMovementsClose = () => {
    setShowMovements(false);
  };

  const handleMovementRowClick = (movement) => {
    setMovementsData(movement);
    setShowMovements(true);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDates(prevDates => ({ ...prevDates, [name]: value }));
  };
  const handleSearchByDate = () => {
    const { dataInicio, dataFim } = dates;
    
    if (!dataInicio && !dataFim) {
      // Se ambos os campos de data estiverem vazios, exibe uma lista vazia
      setMovimentacoes([]);
      return;
    }
    
    // Converte as datas para objetos Date
    const inicio = dataInicio ? new Date(dataInicio) : null;
    const fim = dataFim ? new Date(dataFim) : null;

    const movimentacoesFiltradas = movimentacoes.filter(movimentacao => {
      const dataMovimentacao = new Date(movimentacao.dataMovimentacao); // Ajuste de acordo com o seu campo de data real
      if (inicio && fim) {
        return dataMovimentacao >= inicio && dataMovimentacao <= fim;
      } else if (inicio) {
        return dataMovimentacao >= inicio;
      } else if (fim) {
        return dataMovimentacao <= fim;
      }
      return true;
    });

    setMovimentacoes(movimentacoesFiltradas);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Tabela de Alterações Orçamentais', 14, 16);
    autoTable(doc, {
      head: [['Código', 'Descrição', 'Dotação Inicial', 'Inscrição/Reforço', 'Anulação/Redução', 'Aumento', 'Diminuição']],
      body: data.map(row => [
        row.code,
        row.description,
        row.initialAllocation,
        row.inscription,
        row.cancellation,
        row.reallocationIncrease,
        row.reallocationDecrease,
      ]),
    });
    doc.save('tabela.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alterações');
    XLSX.writeFile(workbook, 'tabela.xlsx');
  };

  const printMovements = () => {
    const doc = new jsPDF();
    doc.text('Movimentos Diários', 14, 16);
    autoTable(doc, {
      head: [['Data', 'N.º Diário', 'Descrição', 'Débito', 'Crédito', 'Saldo']],
      body: movementsData.map(movement => [
        movement.date,
        movement.diary,
        movement.description,
        movement.debit.toFixed(2),
        movement.credit.toFixed(2),
        movement.balance.toFixed(2),
      ]),
    });
    doc.save('movimentos.pdf');
  };

  const printExtract = () => {
    // Verifique se `selectedRow` e `selectedRow.code` são válidos e se `extracts[selectedRow.code]` existe
    if (selectedRow && selectedRow.code && extracts[selectedRow.code]) {
      const { title, account, movements } = extracts[selectedRow.code];
      const doc = new jsPDF();
      doc.text(title, 14, 16);
      doc.text(account, 14, 26);
      autoTable(doc, {
        head: [['Data', 'N.º Diário', 'Descrição', 'Débito', 'Crédito', 'Saldo']],
        body: movements.map(movement => [
          movement.date,
          movement.diary,
          movement.description,
          movement.debit.toFixed(2),
          movement.credit.toFixed(2),
          movement.balance.toFixed(2),
        ]),
      });
      doc.save('extrato.pdf');
    } else {
      console.error("Extrato não encontrado para a linha selecionada.");
    }
  };
  

  return (
    <div className="container mt-4">
      <h3 className="header">Mapa de Alterações Orçamentais da Despesa</h3>
      



<Row className="align-items-center">
  <Col xs="auto">
  <Button variant="primary" onClick={exportToExcel} className="me-2">Exportar para Excel</Button>
  <Button variant="danger" onClick={exportToPDF}>Exportar para PDF</Button>
  </Col>

  {/* Filtros de Data */}
  <Col className="d-flex justify-content-end">
    <Row className="align-items-center">
      <Col>
        <Form.Group controlId="formDataInicio">
          <Form.Label className="text">Data Início</Form.Label>
          <Form.Control
            type="date"
            name="dataInicio"
            value={dates.dataInicio}
            onChange={handleDateChange}
          />
        </Form.Group>
      </Col>
      <Col>
        <Form.Group controlId="formDataFim">
          <Form.Label  className="text">Data Fim</Form.Label>
          <Form.Control
            type="date"
            name="dataFim"
            value={dates.dataFim}
            onChange={handleDateChange}
          />
        </Form.Group>
      </Col>
      <Col className="align-self-end">
        <Button onClick={handleSearchByDate} variant="primary">Pesquisar</Button>
      </Col>
    </Row>
  </Col>
</Row>


      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descrição</th>
            <th>Dotação Inicial</th>
            <th>Inscrição/Reforço</th>
            <th>Anulação/Redução</th>
            <th>Aumento</th>
            <th>Diminuição</th>
          </tr>
        </thead>
        <tbody>
          {parentAccounts.map((mov, index) => (
            mov.entriesEntry.map((entry, entryIndex) => (
              <tr key={entryIndex} onClick={() => handleRowClick(mov)} style={{ cursor: 'pointer' }}>
                <td>{mov.accountPlan.number}</td>
                <td>{mov.accountPlan.description}</td>
                <td>{entry.allocation}</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
              </tr>
            ))
          ))}
        </tbody>
      </Table>

{/* Modal for account extract */}
<Modal show={showExtract} onHide={handleExtractClose} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>Extrato da Conta</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedRow && (
      <>
        {/* Exibe as informações do selectedRow no console */}
        {console.log("selectedRow",selectedRow)}

     

      <h4>
  {extracts[selectedRow.code]
    ? extracts[selectedRow.code].title
    : "AFRICAN TRACKING SECURITY SERVICES"} 
  {selectedRow.accountPlanNumber} 
  {" | Pág. " + selectedRow.page}
</h4>

<h5>
  {extracts[selectedRow.code]
    ? extracts[selectedRow.code].account
    : "Extrato de Conta"}, 
  {selectedRow.accountPlanNumber} 
  {" (01-01-2023 até 30-06-2023) Valores em MT"}
</h5>   <Table striped bordered hover>
          <thead>
            <tr>
              <th>Data</th>
              <th>Diário</th>
              <th>Descrição</th>
              <th>Débito</th>
              <th>Crédito</th>
              <th>Saldo</th>
              <th>Doc.</th>
              <th>IPC</th>
            </tr>
          </thead>
          <tbody>
          {renderMovements()}
          </tbody>
        </Table>
      </>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleExtractClose}>Fechar</Button>
    <Button variant="primary" onClick={printExtract}>Imprimir Extrato</Button>
  </Modal.Footer>
</Modal>
      {/* Modal for movements */}
      <Modal show={showMovements} onHide={handleMovementsClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Movimentos Diários</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {movementsData && (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Diário</th>
                  <th>Descrição</th>
                  <th>Débito</th>
                  <th>Crédito</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{movementsData.date}</td>
                  <td>{movementsData.diary}</td>
                  <td>{movementsData.description}</td>
                  <td>{movementsData.debit}</td>
                  <td>{movementsData.credit}</td>
                  <td>{movementsData.balance}</td>
                </tr>
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleMovementsClose}>Fechar</Button>
          <Button variant="primary" onClick={printMovements}>Imprimir Movimentos</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ChangeMap;
