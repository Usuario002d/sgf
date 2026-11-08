import React, { useState, useEffect } from 'react';
import {
  FaPrint,
  FaSearch,
  FaFilePdf,
  FaFileExcel,
  FaFilter,
  FaTrash,
  FaCheck,
  FaBan,
  FaArrowLeft
} from 'react-icons/fa';
import { MdOutlineDateRange } from 'react-icons/md';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';

const AnullmentOperationModal = ({ show, onClose, operations = [], label }) => {
  const [loading, setLoading] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [selectedOperations, setSelectedOperations] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    registryStatus: 'all'
  });

  useEffect(() => {
    setLoading(false);
  }, [operations]);

  const aplicarFiltros = () => {
    if (!filters.startDate || !filters.endDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Datas obrigatórias',
        text: 'Por favor, selecione as datas "De" e "Até".'
      });
      return;
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOperations([...operations]);
    } else {
      setSelectedOperations([]);
    }
  };

  const formatCurrency = (value) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(num);
  };

  const confirmCancelOperation = (operation) => {
    Swal.fire({
      title: 'Anular Operação',
      html: `Tem certeza que deseja anular a operação <b>${
        operation.requestNumber || ''
      }</b> no valor de <b>${formatCurrency(operation.totalRequestedValue)}</b>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b91c1c',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sim, anular!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        cancelOperation(operation);
      }
    });
  };

  const cancelOperation = (operation) => {
    setLoading(true);
    setTimeout(() => {
      Swal.fire({
        title: 'Operação Anulada!',
        text: `A operação ${operation.requestNumber || ''} foi anulada com sucesso.`,
        icon: 'success'
      });
      setLoading(false);
    }, 1000);
  };

  const confirmCancelSelected = () => {
    if (selectedOperations.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Nenhuma operação selecionada',
        text: 'Por favor, selecione pelo menos uma operação para anular.'
      });
      return;
    }

    const totalValue = selectedOperations.reduce(
      (sum, op) => sum + (Number(op.totalRequestedValue) || 0),
      0
    );

    Swal.fire({
      title: 'Anular Operações Selecionadas',
      html: `
        <div>
          <p>Tem certeza que deseja anular as <b>${selectedOperations.length}</b> operações selecionadas?</p>
          <p>Valor total: <b>${formatCurrency(totalValue)}</b></p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b91c1c',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sim, anular todas!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        cancelSelectedOperations();
      }
    });
  };

  const cancelSelectedOperations = () => {
    setLoading(true);
    setTimeout(() => {
      Swal.fire({
        title: 'Operações Anuladas!',
        text: `${selectedOperations.length} operações foram anuladas com sucesso.`,
        icon: 'success'
      });
      setSelectedOperations([]);
      setLoading(false);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0'
            }}
          >
            <FaCheck size={10} style={{ marginRight: '4px' }} /> Concluído
          </span>
        );
      case 'pending':
        return (
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a'
            }}
          >
            Pendente
          </span>
        );
      case 'rejected':
        return (
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca'
            }}
          >
            <FaBan size={10} style={{ marginRight: '4px' }} /> Recusado
          </span>
        );
      default:
        return (
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1'
            }}
          >
            Processando
          </span>
        );
    }
  };

  const handleCloseModal = () => {
    setSelectedOperation(null);
    if (onClose) onClose();
  };

  return (
    <Modal show={show} onHide={handleCloseModal} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center" style={{ gap: '10px' }}>
          <FaBan style={{ color: '#b91c1c' }} />
          <span>{label || 'Anulação e Estorno de Operações'}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: '20px 24px' }}>
        {selectedOperation ? (
          <div>
            <div
              className="d-flex justify-content-between align-items-center mb-3"
              style={{
                backgroundColor: '#f8faf9',
                border: '1px solid #d8e2dc',
                borderRadius: '10px',
                padding: '12px 16px'
              }}
            >
              <h6 style={{ margin: 0, fontWeight: 700, color: '#0f291e' }}>
                Detalhes da Operação Selecionada
              </h6>
              <div className="d-flex" style={{ gap: '8px' }}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setSelectedOperation(null)}
                >
                  <FaArrowLeft style={{ marginRight: '5px' }} /> Voltar
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handlePrint(selectedOperation)}
                >
                  <FaPrint style={{ marginRight: '5px' }} /> Imprimir
                </Button>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d8e2dc',
                borderRadius: '12px',
                padding: '20px'
              }}
            >
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <small style={{ color: '#64748b' }}>Data / Hora</small>
                  <div style={{ fontWeight: 700, color: '#0f291e' }}>
                    {selectedOperation.operationDate || '—'}
                  </div>
                </div>
                <div className="col-md-4">
                  <small style={{ color: '#64748b' }}>Referência</small>
                  <div style={{ fontWeight: 700, color: '#0f291e' }}>
                    {selectedOperation.requestNumber || '—'}
                  </div>
                </div>
                <div className="col-md-4">
                  <small style={{ color: '#64748b' }}>Valor</small>
                  <div
                    style={{
                      fontWeight: 800,
                      color: '#0f5132',
                      fontFamily: "'JetBrains Mono', monospace"
                    }}
                  >
                    {formatCurrency(selectedOperation.value)}
                  </div>
                </div>
              </div>

              {Array.isArray(selectedOperation.entries) && selectedOperation.entries.length > 0 && (
                <div className="sgf-table-container">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Conta</th>
                        <th>Designação</th>
                        <th style={{ textAlign: 'right' }}>Valor</th>
                        <th style={{ textAlign: 'center' }}>Natureza</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOperation.entries.map((entry, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className="sgf-code-badge">{entry.accountPlan?.number}</span>
                          </td>
                          <td>{entry.accountPlan?.description}</td>
                          <td
                            style={{
                              textAlign: 'right',
                              fontFamily: "'JetBrains Mono', monospace",
                              fontWeight: 600
                            }}
                          >
                            {formatCurrency(entry.value)}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 700 }}>
                            {entry.operator}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {selectedOperation.status === 'pending' && (
                <div className="mt-3 text-end">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => confirmCancelOperation(selectedOperation)}
                  >
                    <FaTrash style={{ marginRight: '5px' }} /> Anular Operação
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
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
                    <MdOutlineDateRange style={{ marginRight: '4px' }} /> De:
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <Form.Label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                    <MdOutlineDateRange style={{ marginRight: '4px' }} /> Até:
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <Form.Label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                    Estado
                  </Form.Label>
                  <Form.Control
                    as="select"
                    value={filters.registryStatus}
                    onChange={(e) => setFilters({ ...filters, registryStatus: e.target.value })}
                  >
                    <option value="all">Todas</option>
                    <option value="registered_only">Pendentes</option>
                    <option value="payables_registered_only">Registadas</option>
                    <option value="completed">Concluídas</option>
                    <option value="rejected">Recusadas</option>
                  </Form.Control>
                </div>
                <div className="col-md-3">
                  <Button
                    variant="success"
                    onClick={aplicarFiltros}
                    style={{
                      backgroundColor: '#0f5132',
                      borderColor: '#0f5132',
                      width: '100%',
                      fontWeight: 600
                    }}
                  >
                    <FaFilter style={{ marginRight: '5px' }} /> Aplicar Filtros
                  </Button>
                </div>
              </div>
            </div>

            {selectedOperations.length > 0 && (
              <div
                className="d-flex justify-content-between align-items-center mb-3"
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '10px 16px'
                }}
              >
                <span style={{ fontWeight: 600, color: '#991b1b', fontSize: '0.85rem' }}>
                  {selectedOperations.length} operação(ões) selecionada(s)
                </span>
                <Button variant="danger" size="sm" onClick={confirmCancelSelected}>
                  <FaTrash style={{ marginRight: '5px' }} /> Anular Selecionadas
                </Button>
              </div>
            )}

            <div className="sgf-table-container" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th style={{ width: '44px', textAlign: 'center' }}>
                      <Form.Check
                        type="checkbox"
                        checked={
                          selectedOperations.length === operations.length && operations.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Data / Hora</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                    <th style={{ textAlign: 'center' }}>Estado</th>
                    <th style={{ textAlign: 'center', width: '140px' }}>Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.map((op, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: 'center' }}>
                        <Form.Check
                          type="checkbox"
                          checked={selectedOperations.includes(op)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOperations([...selectedOperations, op]);
                            } else {
                              setSelectedOperations(
                                selectedOperations.filter((item) => item !== op)
                              );
                            }
                          }}
                        />
                      </td>
                      <td>{op.operationDate}</td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700
                        }}
                      >
                        {op.totalRequestedValue}
                      </td>
                      <td style={{ textAlign: 'center' }}>{getStatusBadge(op.status)}</td>
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
                          <FaSearch style={{ marginRight: '4px' }} /> Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {operations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        Nenhuma operação encontrada.
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
          Total: <strong>{operations.length}</strong> operações
        </span>
        <Button variant="outline-secondary" onClick={handleCloseModal}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AnullmentOperationModal;
