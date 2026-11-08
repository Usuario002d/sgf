import React, { useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';

// Dados de exemplo
const data = [
  { id: 11, name: 'Caixa' },
  { id: 111, name: 'Caixa' },
  { id: 12, name: 'Bancos' },
  { id: 121, name: 'Caixa' },
  { id: 111, name: 'Depósitos à ordem' },
  { id: 1211, name: 'Banco1' },
  { id: 1212, name: 'Banco 2' },
  { id: 1213, name: 'Banco 3' },
  { id: 1214, name: 'Banco 4' },
  { id: 123, name: 'Caixa' },
  { id: 1231, name: 'Depósitos à ordem' },
];

// Configuração das colunas
const columns = [
  {
    dataField: 'id',
    text: 'Conta',
    sort: true,
  },
  {
    dataField: 'name',
    text: 'Descrição',
    sort: true,
  },
  {
    dataField: 'option',
    text: 'Opções',
    isDummyField: true, // Campo fictício para customização
    formatter: (_, row) => (
      <div>
      <Button 
        variant="warning" 
        size="sm" 
        onClick={() => handleEdit(row.id)}
        className="me-2"
        style={{ backgroundColor: '#3455', color: '#333', borderColor:'#333' }}
      >
        Editar
      </Button>
      <Button 
        variant="danger" 
        size="sm" 
        onClick={() => handleDelete(row.id)}
        style={{ backgroundColor: '#3455', color: '#333', borderColor:'#333'}}
      >
        Remover
      </Button>
    </div>
    
    ),
  },
];

// Função para edição
const handleEdit = (id) => {
  alert(`Editado com sucesso: ${id}`);
};

// Função para exclcuir
const handleDelete = (id) => {
  alert(`Removida com sucesso: ${id}`);
};

const Tables = () => {
  const [filteredData, setFilteredData] = useState(data);
  const [searchText, setSearchText] = useState('');

  // Função para filtrar os dados
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    // Filtra os dados com base no valor do campo de busca
    const filtered = data.filter((row) =>
      Object.values(row).some(
        (val) => val.toString().toLowerCase().includes(value)
      )
    );
    setFilteredData(filtered);
  };

  return (
    <Container className="mt-5">
      <h2>Tabela</h2>
      <Row className="mb-3">
        <Col sm={4}>
          <Form.Group controlId="formSearch">
            <Form.Label></Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite para filtrar..."
              value={searchText}
              onChange={handleSearch}
              style={{ width: '227px', backgroundColor: '#3455'}}
            />
          </Form.Group>
        </Col>
      </Row>

      <BootstrapTable
        keyField="id"
        data={filteredData}
        columns={columns}
        pagination={paginationFactory()}
        striped
        hover
        condensed
      />
    </Container>
  );
};

export default Tables;

