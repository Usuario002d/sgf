import React, { useState, useEffect } from 'react';
import {
  FaPrint,
  FaFilter,
  FaUndo,
  FaArrowLeft,
  FaEye,
  FaFileInvoiceDollar
} from 'react-icons/fa';
import { MdOutlineDateRange } from 'react-icons/md';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';

const BankingOperationsReports = ({ label, show, onClose, operations = [], documents = [] }) => {
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    document: ''
  });
  const [filteredOperations, setFilteredOperations] = useState([]);

  const getDocumentsByLabel = (lbl) => {
    switch (lbl) {
      case 'Consultar Lançamentos (Contas a Receber)':
        return [
          'factura',
          'clientes',
          'outros devedores',
          'outras operacoes',
          'salarios',
          'outros'
        ];
      case 'Consultar Lançamentos (Contas a Pagar)':
        return ['factura', 'clientes', 'outros devedores'];
      case 'Consultar Lançamentos (Bancos Entradas)':
        return [
          'Receita A',
          'Receita B',
          'Receita C',
          'Receita D',
          'Receita E',
          'Receita F',
          'Clientes',
          'Outros devedores',
          'Tesouro',
          'Diferenças cambiais favoráveis',
          'Juros',
          'Outras operações'
        ];
      default:
        return [];
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) throw new Error('Data vazia');
    let date;
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        date = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
      } else {
        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    } else if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) {
      throw new Error(`Formato de data inválido: ${dateStr}`);
    }
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const aplicarFiltros = () => {
    if (!filters.startDate || !filters.endDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Datas obrigatórias',
        text: 'Por favor, selecione as datas "De" e "Até".'
      });
      return;
    }

    const normalizeText = (text) =>
      text
        ?.toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, ' ')
        .trim();

    try {
      const start = formatDate(filters.startDate);
      const end = formatDate(filters.endDate);

      const resultado = (operations || []).filter((op) => {
        try {
          const opDate = formatDate(op.operationDate);
          const dentroIntervalo = opDate >= start && opDate <= end;

          let documentoOk = true;
          if (filters.document && filters.document.trim() !== '') {
            documentoOk =
              normalizeText(op.description) === normalizeText(filters.document);
          }

          return dentroIntervalo && documentoOk;
        } catch (err) {
          return false;
        }
      });

      if (resultado.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Nenhum dado encontrado',
          text: 'Não existem operações no intervalo selecionado.'
        });
      }

      setFilteredOperations(resultado);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao aplicar filtros',
        text: err.message
      });
    }
  };

  const limparFiltros = () => {
    setFilters({ startDate: '', endDate: '', document: '' });
    setFilteredOperations(operations || []);
  };

  useEffect(() => {
    setFilteredOperations(operations || []);
  }, [operations]);

  const handlePrint = () => {
    window.print();
  };

  const formatMoney = (value) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const handleCloseModal = () => {
    setSelectedOperation(null);
    if (onClose) onClose();
  };

  const availableDocs = getDocumentsByLabel(label);

  return (
    <Modal show={show} onHide={handleCloseModal} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center" style={{ gap: '10px' }}>
          <FaFileInvoiceDollar style={{ color: '#0f5132' }} />
          <span>{label || 'Consultar Lançamentos Contabilísticos'}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: '20px 24px' }}>
        {selectedOperation ? (
          <div>
            <div
              className="d-flex flex-wrap justify-content-between align-items-center mb-3"
              style={{
                backgroundColor: '#f4f8f5',
                padding: '14px 18px',
                borderRadius: '10px',
                border: '1px solid #cce3d6',
                borderLeft: '4px solid #0f5132',
                gap: '12px'
              }}
            >
              <div>
                <h6 style={{ margin: 0, fontWeight: 700, color: '#0f291e' }}>
                  Detalhes do Lançamento #{selectedOperation.documentSequence || 'N/D'}
                </h6>
                <small style={{ color: '#475569' }}>
                  Data: <strong>{selectedOperation.operationDate}</strong> • Documento:{' '}
                  <strong>{selectedOperation.description || 'N/D'}</strong>
                </small>
              </div>
              <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setSelectedOperation(null)}
                >
                  <FaArrowLeft style={{ marginRight: '5px' }} /> Voltar à Lista
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handlePrint(selectedOperation)}
                  style={{ backgroundColor: '#0f5132', borderColor: '#0f5132' }}
                >
                  <FaPrint style={{ marginRight: '5px' }} /> Imprimir
                </Button>
              </div>
            </div>

            <div className="sgf-table-container">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo de Documento</th>
                    <th>Nº Sequência</th>
                    <th>Descrição</th>
                    <th style={{ textAlign: 'right' }}>Débito</th>
                    <th style={{ textAlign: 'right' }}>Crédito</th>
                    <th>Conta</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOperation.entries || []).map((entry, i) => {
                    const isDebit = entry.operator === 'DEBIT';
                    return (
                      <tr key={i}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {selectedOperation.operationDate}
                        </td>
                        <td>{selectedOperation.description || 'N/D'}</td>
                        <td>
                          <span className="sgf-code-badge">
                            {selectedOperation.documentSequence}
                          </span>
                        </td>
                        <td>{selectedOperation.documentDescription}</td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 600,
                            color: isDebit ? '#b91c1c' : '#64748b'
                          }}
                        >
                          {isDebit ? formatMoney(entry.value * 2.5) : '—'}
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 600,
                            color: !isDebit ? '#0f5132' : '#64748b'
                          }}
                        >
                          {!isDebit ? formatMoney(entry.value * 2.5) : '—'}
                        </td>
                        <td>
                          <span className="sgf-code-badge">
                            {entry.accountPlan?.number || '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: '#f4f8f5', fontWeight: 700 }}>
                    <td colSpan={4} style={{ textAlign: 'right', color: '#0f291e' }}>
                      Totais do Movimento:
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#b91c1c'
                      }}
                    >
                      {formatMoney(
                        (selectedOperation.entries || [])
                          .filter((e) => e.operator === 'DEBIT')
                          .reduce((sum, e) => sum + e.value * 2.5, 0)
                      )}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#0f5132'
                      }}
                    >
                      {formatMoney(
                        (selectedOperation.entries || [])
                          .filter((e) => e.operator === 'CREDIT')
                          .reduce((sum, e) => sum + e.value * 2.5, 0)
                      )}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </div>
        ) : (
          <>
            {/* Barra de Filtros Institucional */}
            <div
              style={{
                backgroundColor: '#f8faf9',
                border: '1px solid #d8e2dc',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px'
              }}
            >
              <div className="row g-3 align-items-end">
                <div className="col-md-3">
                  <Form.Label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                    <MdOutlineDateRange style={{ marginRight: '4px' }} /> Data Inicial (De)
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <Form.Label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                    <MdOutlineDateRange style={{ marginRight: '4px' }} /> Data Final (Até)
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <Form.Label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                    Tipo de Documento (Opcional)
                  </Form.Label>
                  <Form.Control
                    as="select"
                    value={filters.document}
                    onChange={(e) => setFilters({ ...filters, document: e.target.value })}
                    disabled={availableDocs.length === 0}
                  >
                    <option value="">-- Todos os Documentos --</option>
                    {availableDocs.map((doc, index) => (
                      <option key={index} value={doc}>
                        {doc}
                      </option>
                    ))}
                  </Form.Control>
                </div>
                <div className="col-md-3 d-flex" style={{ gap: '8px' }}>
                  <Button
                    variant="success"
                    onClick={aplicarFiltros}
                    style={{
                      backgroundColor: '#0f5132',
                      borderColor: '#0f5132',
                      flex: 1,
                      fontWeight: 600
                    }}
                  >
                    <FaFilter style={{ marginRight: '5px' }} /> Filtrar
                  </Button>
                  <Button variant="outline-secondary" onClick={limparFiltros} title="Limpar filtros">
                    <FaUndo />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabela de Operações */}
            <div
              className="sgf-table-container"
              style={{ maxHeight: '55vh', overflowY: 'auto' }}
            >
              <Table id="requestCompliance" hover className="mb-0">
                <thead>
                  <tr>
                    <th>Data da Operação</th>
                    <th>Tipo de Documento</th>
                    <th>Nº Sequência</th>
                    <th style={{ textAlign: 'right' }}>Valor Total (C. Valor)</th>
                    <th style={{ textAlign: 'center', width: '130px' }}>Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOperations.map((op, index) => (
                    <tr key={index}>
                      <td style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {op.operationDate}
                      </td>
                      <td>{op.description || 'N/D'}</td>
                      <td>
                        <span className="sgf-code-badge">{op.documentSequence}</span>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          color: '#0f291e'
                        }}
                      >
                        {formatMoney((op.value || 0) * 2.5)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => setSelectedOperation(op)}
                          style={{
                            fontSize: '0.76rem',
                            padding: '4px 10px',
                            borderColor: '#0f5132',
                            color: '#0f5132'
                          }}
                        >
                          <FaEye style={{ marginRight: '4px' }} /> Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredOperations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        Nenhuma operação contabilística encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between align-items-center">
        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
          Total de registos listados: <strong>{filteredOperations.length}</strong>
        </span>
        <Button variant="outline-secondary" onClick={handleCloseModal}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BankingOperationsReports;
