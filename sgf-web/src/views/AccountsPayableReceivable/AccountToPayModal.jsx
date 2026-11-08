import React, { useState } from 'react';
import {
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaPrint,
  FaArrowDown,
  FaArrowUp,
  FaFileInvoiceDollar
} from 'react-icons/fa';
import {
  MdDateRange,
  MdBusiness,
  MdPerson,
  MdOutlineRequestPage,
  MdAttachMoney,
  MdOutlineInbox
} from 'react-icons/md';
import { Button, Modal, Table, Form } from 'react-bootstrap';
import { FiAlertTriangle, FiPlusCircle, FiLock } from 'react-icons/fi';
import { RotateSpinner } from 'react-spinners-kit';

const AccountToPayModal = ({
  label,
  show,
  onClose,
  onComplete,
  filteredRequests = [],
  selectedRequest,
  tableData = [],
  handleRowDoubleClick,
  addRow,
  handleInputChange,
  accounts = [],
  paymentType,
  documentType,
  setPaymentType,
  setDocumentType,
  removeRow,
  handlePaymentConfirmation,
  validateAccountsToPay
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [confirmation, setConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const contasCredito = (tableData || [])
    .filter((row) => row.credit > 0)
    .map((row) => {
      const conta = (accounts || []).find((a) => a.accountPlan?.number === row.account);
      return `${row.account}${conta ? ` - ${conta.accountPlan.description}` : ''}: ${(
        Number(row.credit) || 0
      ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    });

  const contasDebito =
    (tableData || [])
      .filter((row) => row.debit > 0)
      .map(
        (row) =>
          `${row.account} : ${(Number(row.debit) || 0).toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })}`
      )
      .join(' | ') || 'Conta não informada';

  const handleNext = async () => {
    if (currentStep === 1 && !filteredRequests) {
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsProcessing(true);
      const wasSuccessful = await handlePaymentConfirmation();
      if (!wasSuccessful) {
        setCurrentStep(3);
        setIsProcessing(false);
        setPaymentCompleted(false);
        return;
      }
      setIsProcessing(false);
      setPaymentCompleted(true);
      setConfirmation(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCloseModal = () => {
    setCurrentStep(1);
    setPaymentCompleted(false);
    setConfirmation(false);
    if (onClose) onClose();
  };

  const totalDebit = (tableData || []).reduce((total, row) => total + (Number(row.debit) || 0), 0);
  const totalCredit = (tableData || []).reduce((total, row) => total + (Number(row.credit) || 0), 0);

  return (
    <Modal show={show} onHide={handleCloseModal} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center" style={{ gap: '10px' }}>
          <FaFileInvoiceDollar style={{ color: '#0f5132' }} />
          <span>{label || 'Processamento de Lançamento Contabilístico'}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: '20px 24px' }}>
        {/* Stepper Institucional */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8faf9',
            border: '1px solid #d8e2dc',
            borderRadius: '12px',
            padding: '14px 24px',
            marginBottom: '20px',
            position: 'relative'
          }}
        >
          {[
            { step: 1, title: '1. Seleção da Requisição' },
            { step: 2, title: '2. Partidas Contabilísticas' },
            { step: 3, title: '3. Revisão e Confirmação' }
          ].map((item) => {
            const active = currentStep === item.step;
            const completed = currentStep > item.step;
            return (
              <div
                key={item.step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: completed
                      ? '#0d6832'
                      : active
                      ? '#0f5132'
                      : '#e2e8f0',
                    color: completed || active ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  {completed ? <FaCheckCircle size={15} /> : item.step}
                </div>
                <span
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: active || completed ? 700 : 500,
                    color: active ? '#0f291e' : completed ? '#0d6832' : '#64748b'
                  }}
                >
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* PASSO 1: Seleção da Requisição */}
        {currentStep === 1 && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 style={{ margin: 0, fontWeight: 700, color: '#0f291e' }}>
                  Selecione a Requisição Conformada
                </h6>
                <small style={{ color: '#64748b' }}>
                  Clique num cartão abaixo para selecionar a requisição a contabilizar
                </small>
              </div>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: '#eaf5ef',
                  color: '#0f5132',
                  border: '1px solid #cce3d6'
                }}
              >
                {filteredRequests.length} Requisições Disponíveis
              </span>
            </div>

            {filteredRequests.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '240px',
                  color: '#64748b',
                  backgroundColor: '#f8faf9',
                  borderRadius: '12px',
                  border: '1px dashed #cbd5e1',
                  gap: '10px'
                }}
              >
                <MdOutlineInbox size={48} style={{ color: '#94a3b8' }} />
                <span style={{ fontWeight: 600 }}>Nenhuma requisição pendente encontrada</span>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
                  gap: '16px',
                  maxHeight: '420px',
                  overflowY: 'auto',
                  padding: '4px'
                }}
              >
                {filteredRequests.map((request) => {
                  const isSelected = selectedRequest?.id === request.id;
                  const isPaidPartial =
                    request.paidReq === 1 && request.paymentType === 'PARTIAL';
                  const isPaidFull = request.paidReq === 1 && request.paymentType !== 'PARTIAL';

                  return (
                    <div
                      key={request.id}
                      onClick={() => handleRowDoubleClick(request)}
                      style={{
                        backgroundColor: isSelected ? '#f4f9f6' : '#ffffff',
                        border: isSelected ? '2px solid #0f5132' : '1px solid #d8e2dc',
                        borderTop: `4px solid ${isSelected ? '#0f5132' : '#b45309'}`,
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        boxShadow: isSelected
                          ? '0 6px 16px rgba(15, 81, 50, 0.12)'
                          : '0 2px 6px rgba(15, 23, 42, 0.04)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div
                          className="d-flex align-items-center"
                          style={{ gap: '8px', fontWeight: 800, color: '#0f291e', fontSize: '1rem' }}
                        >
                          <MdOutlineRequestPage
                            size={20}
                            style={{ color: isSelected ? '#0f5132' : '#b45309' }}
                          />
                          <span>#{request.requestNumber}</span>
                        </div>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor: isPaidFull
                              ? '#ecfdf5'
                              : isPaidPartial
                              ? '#fef3c7'
                              : '#fef2f2',
                            color: isPaidFull
                              ? '#065f46'
                              : isPaidPartial
                              ? '#92400e'
                              : '#991b1b',
                            border: `1px solid ${
                              isPaidFull ? '#a7f3d0' : isPaidPartial ? '#fde68a' : '#fecaca'
                            }`
                          }}
                        >
                          {isPaidPartial
                            ? 'Parcialmente Pago'
                            : isPaidFull
                            ? 'Pago'
                            : 'Pendente'}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          fontSize: '0.82rem',
                          color: '#475569'
                        }}
                      >
                        <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                          <MdPerson size={16} style={{ color: '#64748b' }} />
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>
                            {request.requestorName || '—'}
                          </span>
                        </div>
                        <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                          <MdBusiness size={16} style={{ color: '#64748b' }} />
                          <span>{request.requestorDepartment || '—'}</span>
                        </div>
                        <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                          <MdDateRange size={16} style={{ color: '#64748b' }} />
                          <span>{request.operationDate || '—'}</span>
                        </div>
                      </div>

                      <div
                        style={{
                          paddingTop: '10px',
                          borderTop: '1px solid #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                          Valor Solicitado
                        </span>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            color: '#0f5132'
                          }}
                        >
                          {parseFloat(request.totalRequestedValue || '0').toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PASSO 2: Partidas Contabilísticas */}
        {currentStep === 2 && selectedRequest && (
          <div>
            <div
              className="d-flex flex-wrap justify-content-between align-items-center mb-3"
              style={{
                backgroundColor: '#f4f8f5',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid #cce3d6'
              }}
            >
              <div>
                <span style={{ fontSize: '0.84rem', color: '#475569' }}>
                  Requisição Selecionada: <strong>#{selectedRequest.requestNumber}</strong> —{' '}
                  {selectedRequest.requestorName}
                </span>
              </div>
              <div className="d-flex align-items-center" style={{ gap: '20px' }}>
                <span style={{ fontSize: '0.88rem', color: '#334155' }}>
                  Total Débito:{' '}
                  <strong
                    style={{
                      color: '#b91c1c',
                      fontFamily: "'JetBrains Mono', monospace"
                    }}
                  >
                    {totalDebit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </span>
                <span style={{ fontSize: '0.88rem', color: '#334155' }}>
                  Total Crédito:{' '}
                  <strong
                    style={{
                      color: '#0f5132',
                      fontFamily: "'JetBrains Mono', monospace"
                    }}
                  >
                    {totalCredit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </span>
              </div>
            </div>

            <div className="sgf-table-container" style={{ maxHeight: '340px', overflowY: 'auto' }}>
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Conta Financeira</th>
                    <th style={{ textAlign: 'right' }}>Débito</th>
                    <th style={{ textAlign: 'right' }}>Crédito</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {(tableData || []).map((row, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                          <FiLock style={{ color: '#0f5132', flexShrink: 0 }} />
                          <span className="sgf-code-badge">{row.account}</span>
                        </div>
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 600,
                          color: row.debit > 0 ? '#b91c1c' : '#64748b'
                        }}
                      >
                        {(Number(row.debit) || 0).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2
                        })}
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 600,
                          color: row.credit > 0 ? '#0f5132' : '#64748b'
                        }}
                      >
                        {(Number(row.credit) || 0).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2
                        })}
                      </td>
                      <td>{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {Math.abs(totalDebit - totalCredit) > 0.01 && (
              <div
                className="alert alert-warning mt-3 d-flex align-items-center"
                style={{ gap: '10px', borderRadius: '10px' }}
              >
                <FiAlertTriangle size={20} color="#92400e" />
                <span>Atenção: Os valores de débito e crédito não estão balanceados.</span>
              </div>
            )}
          </div>
        )}

        {/* PASSO 3: Confirmação e Comprovativo */}
        {currentStep === 3 && selectedRequest && (
          <div>
            {isProcessing ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '300px',
                  backgroundColor: '#f8faf9',
                  borderRadius: '14px',
                  border: '1px solid #d8e2dc',
                  gap: '16px'
                }}
              >
                <RotateSpinner size={60} color="#0f5132" loading={isProcessing} />
                <h5 style={{ margin: 0, fontWeight: 700, color: '#0f291e' }}>
                  A processar lançamento contabilístico...
                </h5>
              </div>
            ) : paymentCompleted ? (
              <div>
                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <FaCheckCircle size={44} color="#0d6832" style={{ marginBottom: '10px' }} />
                  <h4 style={{ fontWeight: 800, color: '#065f46', marginBottom: '12px' }}>
                    Operação Registada com Sucesso!
                  </h4>
                  <Button
                    variant="success"
                    onClick={() => {
                      const printContent = document.getElementById('comprovativo-premium');
                      if (!printContent) {
                        window.print();
                        return;
                      }
                      const originalContent = document.body.innerHTML;
                      document.body.innerHTML = printContent.innerHTML;
                      window.print();
                      document.body.innerHTML = originalContent;
                      window.location.reload();
                    }}
                    style={{ backgroundColor: '#0f5132', borderColor: '#0f5132', fontWeight: 600 }}
                  >
                    <FaPrint style={{ marginRight: '6px' }} /> Imprimir Comprovativo
                  </Button>
                </div>

                <div
                  id="comprovativo-premium"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d8e2dc',
                    borderRadius: '12px',
                    padding: '20px'
                  }}
                >
                  <div className="row g-3 mb-3 pb-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <div className="col-md-4">
                      <small style={{ color: '#64748b' }}>Número da Requisição</small>
                      <div style={{ fontWeight: 700, color: '#0f291e' }}>
                        #{selectedRequest.requestNumber}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <small style={{ color: '#64748b' }}>Solicitante</small>
                      <div style={{ fontWeight: 700, color: '#0f291e' }}>
                        {selectedRequest.requestorName}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <small style={{ color: '#64748b' }}>Departamento</small>
                      <div style={{ fontWeight: 700, color: '#0f291e' }}>
                        {selectedRequest.requestorDepartment}
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <div
                        style={{
                          backgroundColor: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderLeft: '4px solid #b91c1c',
                          borderRadius: '10px',
                          padding: '14px'
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#991b1b',
                            marginBottom: '4px'
                          }}
                        >
                          <FaArrowDown style={{ marginRight: '5px' }} /> CONTA DE DÉBITO
                        </div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{contasDebito}</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div
                        style={{
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          borderLeft: '4px solid #0f5132',
                          borderRadius: '10px',
                          padding: '14px'
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#065f46',
                            marginBottom: '4px'
                          }}
                        >
                          <FaArrowUp style={{ marginRight: '5px' }} /> CONTA DE CRÉDITO
                        </div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>
                          {contasCredito.length > 0
                            ? contasCredito.map((item, idx) => <div key={idx}>{item}</div>)
                            : 'Conta não informada'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d8e2dc',
                  borderRadius: '12px',
                  padding: '20px'
                }}
              >
                <h6 style={{ fontWeight: 700, color: '#0f291e', marginBottom: '14px' }}>
                  Resumo da Operação Antes de Confirmar
                </h6>

                <div className="row g-3 mb-3 pb-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <div className="col-md-4">
                    <small style={{ color: '#64748b' }}>Número da Requisição</small>
                    <div style={{ fontWeight: 700, color: '#0f5132' }}>
                      #{selectedRequest.requestNumber}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <small style={{ color: '#64748b' }}>Solicitante</small>
                    <div style={{ fontWeight: 700, color: '#0f291e' }}>
                      {selectedRequest.requestorName}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <small style={{ color: '#64748b' }}>Departamento</small>
                    <div style={{ fontWeight: 700, color: '#0f291e' }}>
                      {selectedRequest.requestorDepartment}
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <div
                      style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderLeft: '4px solid #b91c1c',
                        borderRadius: '10px',
                        padding: '14px'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#991b1b',
                          marginBottom: '4px'
                        }}
                      >
                        <FaArrowDown style={{ marginRight: '5px' }} /> CONTA DE DÉBITO
                      </div>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{contasDebito}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      style={{
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        borderLeft: '4px solid #0f5132',
                        borderRadius: '10px',
                        padding: '14px'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#065f46',
                          marginBottom: '4px'
                        }}
                      >
                        <FaArrowUp style={{ marginRight: '5px' }} /> CONTA DE CRÉDITO
                      </div>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>
                        {contasCredito.length > 0
                          ? contasCredito.map((item, idx) => <div key={idx}>{item}</div>)
                          : 'Conta não informada'}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#f8faf9',
                    border: '1px solid #d8e2dc',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Form.Check
                    type="checkbox"
                    id="confirmation-premium"
                    checked={confirmation}
                    onChange={(e) => setConfirmation(e.target.checked)}
                    label="Confirmo que as contas de débito/crédito e valores estão corretos para lançamento oficial."
                    style={{ fontWeight: 600, color: '#0f291e', margin: 0 }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between align-items-center">
        <Button
          variant="outline-secondary"
          onClick={handleBack}
          disabled={currentStep === 1 || isProcessing || paymentCompleted}
        >
          <FaArrowLeft style={{ marginRight: '6px' }} /> Voltar
        </Button>

        <div className="d-flex align-items-center" style={{ gap: '8px' }}>
          <Button variant="outline-secondary" onClick={handleCloseModal}>
            Fechar
          </Button>
          {!paymentCompleted && (
            <Button
              variant="success"
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !selectedRequest) ||
                (currentStep === 3 && !confirmation) ||
                isProcessing
              }
              style={{
                backgroundColor: '#0f5132',
                borderColor: '#0f5132',
                fontWeight: 600
              }}
            >
              {currentStep < 3
                ? 'Próximo Passo'
                : isProcessing
                ? 'A Processar...'
                : 'Confirmar Lançamento'}
              {currentStep < 3 && <FaArrowRight style={{ marginLeft: '6px' }} />}
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AccountToPayModal;
