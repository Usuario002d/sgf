import React, { useState } from 'react';
import { FaPrint, FaSearch, FaFilter, FaArrowLeft, FaListAlt } from 'react-icons/fa';
import { MdOutlineDateRange } from 'react-icons/md';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';

const OperationsModal = ({ show, onClose, operations = [], label }) => {
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    registryStatus: 'all'
  });

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

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            Concluído
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
            Recusado
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
          <FaListAlt style={{ color: '#0f5132' }} />
          <span>{label || 'Consultar Operações'}</span>
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
                Detalhes da Operação
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
                  variant="success"
                  size="sm"
                  onClick={() => handlePrint(selectedOperation)}
                  style={{ backgroundColor: '#0f5132', borderColor: '#0f5132' }}
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
              {[
                { label: 'Data / Hora', value: formatDate(selectedOperation.createdAt) },
                { label: 'Número da Requisição', value: selectedOperation.requestNumber || '—' },
                {
                  label: 'Valor',
                  value: (
                    <span
                      style={{
                        color: '#0f5132',
                        fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace"
                      }}
                    >
                      {formatCurrency(selectedOperation.totalRequestedValue)}
                    </span>
                  )
                },
                { label: 'Conta / Destino', value: selectedOperation.account || '—' },
                { label: 'Estado', value: getStatusBadge(selectedOperation.status) },
                { label: 'Detalhes', value: selectedOperation.details || '—' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="d-flex justify-content-between align-items-center py-2"
                  style={{ borderBottom: idx < 5 ? '1px solid #f1f5f9' : 'none' }}
                >
                  <span style={{ fontWeight: 600, color: '#64748b', fontSize: '0.86rem' }}>
                    {item.label}:
                  </span>
                  <span style={{ fontWeight: 600, color: '#0f291e', fontSize: '0.88rem' }}>
                    {item.value}
                  </span>
                </div>
              ))}
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
                    Estado de Registo
                  </Form.Label>
                  <Form.Control
                    as="select"
                    value={filters.registryStatus}
                    onChange={(e) => setFilters({ ...filters, registryStatus: e.target.value })}
                  >
                    <option value="all">Todas</option>
                    <option value="registered_only">Pendentes</option>
                    <option value="payables_registered_only">Registadas</option>
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

            <div className="sgf-table-container" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Data / Hora</th>
                    <th>Nº Requisição</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                    <th>Conta</th>
                    <th style={{ textAlign: 'center' }}>Estado</th>
                    <th style={{ textAlign: 'center', width: '130px' }}>Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.map((op, index) => (
                    <tr key={index}>
                      <td>{formatDate(op.createdAt)}</td>
                      <td>
                        <span className="sgf-code-badge">{op.requestNumber}</span>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          color: '#0f5132'
                        }}
                      >
                        {formatCurrency(op.totalRequestedValue)}
                      </td>
                      <td>{op.account || '—'}</td>
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
                      <td colSpan={6} className="text-center py-4 text-muted">
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

export default OperationsModal;
