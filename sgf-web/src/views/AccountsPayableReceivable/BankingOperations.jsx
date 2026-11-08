import React, { useState } from 'react';
import {
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaPrint,
  FaPlus,
  FaTrashAlt,
  FaArrowDown,
  FaArrowUp,
  FaUniversity
} from 'react-icons/fa';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { RotateSpinner } from 'react-spinners-kit';

const BankingOperations = ({
  show,
  onClose,
  onComplete,
  setTableData,
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
  formOpen = { documentNumber: '' },
  handleDocumentSelection,
  documents = [],
  validateOperations,
  operationDate,
  setOperationDate,
  submitRequest,
  label,
  namePersonCharge,
  setFormOpen
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
      ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} MZN`;
    });

  const contasDebito =
    (tableData || [])
      .filter((row) => row.debit > 0)
      .map(
        (row) =>
          `${row.account} : ${(Number(row.debit) || 0).toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })} MZN`
      )
      .join(' | ') || 'Conta não informada';

  const handleNext = async () => {
    try {
      const result = await validateOperations();
      if (result === false) {
        return;
      }
    } catch (error) {
      console.error('Erro na validação:', error);
    }

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsProcessing(true);
      const wasSuccessful = await submitRequest();
      if (!wasSuccessful) {
        setIsProcessing(false);
        return;
      }

      setTimeout(() => {
        setIsProcessing(false);
        setPaymentCompleted(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 2000);
      }, 1500);
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
    if (setTableData) setTableData([]);
    if (setOperationDate) setOperationDate('');
    if (setFormOpen) {
      setFormOpen((prev) => ({
        ...prev,
        documentNumber: ''
      }));
    }
    if (onClose) onClose();
  };

  const totalDebit = (tableData || []).reduce((t, row) => t + (Number(row.debit) || 0), 0);
  const totalCredit = (tableData || []).reduce((t, row) => t + (Number(row.credit) || 0), 0);
  const diff = totalDebit - totalCredit;

  return (
    <Modal show={show} onHide={handleCloseModal} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center" style={{ gap: '10px' }}>
          <FaUniversity style={{ color: '#0f5132' }} />
          <span>{label || 'Registo de Operação Financeira / Tesouraria'}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: '20px 24px' }}>
        {/* Stepper Institucional */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            backgroundColor: '#f8faf9',
            border: '1px solid #d8e2dc',
            borderRadius: '12px',
            padding: '14px 24px',
            marginBottom: '20px'
          }}
        >
          {[
            { step: 1, title: '1. Lançamento Contabilístico (Partidas)' },
            { step: 2, title: '2. Validação e Confirmação Oficial' }
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
                    fontSize: '0.88rem',
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

        {/* PASSO 1: Lançamento de Operações */}
        {currentStep === 1 && (
          <div>
            <div
              style={{
                backgroundColor: '#f4f8f5',
                border: '1px solid #cce3d6',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px'
              }}
            >
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <Form.Label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                    Data Contabilística
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={operationDate || ''}
                    onChange={(e) => setOperationDate && setOperationDate(e.target.value)}
                  />
                </div>
                <div className="col-md-5">
                  <Form.Label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                    Tipo de Documento
                  </Form.Label>
                  <Form.Control
                    as="select"
                    value={formOpen?.documentNumber || ''}
                    onChange={handleDocumentSelection}
                    disabled={!documents || documents.length === 0}
                  >
                    <option value="">-- Selecionar Documento --</option>
                    {(documents || []).map((doc) => (
                      <option key={doc.id} value={doc.documentNumber}>
                        {doc.documentNumber} - {doc.description}
                      </option>
                    ))}
                  </Form.Control>
                </div>
                <div className="col-md-3 d-flex justify-content-end">
                  <Button
                    variant="success"
                    onClick={addRow}
                    style={{
                      backgroundColor: '#0f5132',
                      borderColor: '#0f5132',
                      fontWeight: 600,
                      width: '100%'
                    }}
                  >
                    <FaPlus style={{ marginRight: '6px' }} /> Adicionar Linha
                  </Button>
                </div>
              </div>
            </div>

            <div className="sgf-table-container" style={{ maxHeight: '360px', overflowY: 'auto' }}>
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th style={{ width: '34%' }}>Conta Financeira</th>
                    <th style={{ width: '18%', textAlign: 'right' }}>Débito</th>
                    <th style={{ width: '18%', textAlign: 'right' }}>Crédito</th>
                    <th style={{ width: '20%' }}>Descrição</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Acção</th>
                  </tr>
                </thead>
                <tbody>
                  {(tableData || []).map((row, index) => (
                    <tr key={index}>
                      <td>
                        <Form.Select
                          value={row.account}
                          onChange={(e) => handleInputChange(index, 'account', e.target.value)}
                          className="form-control"
                        >
                          <option value="">Selecionar Conta</option>
                          {['ativo', 'passivo', 'gasto', 'ganho'].map((tipo) => {
                            const contasFiltradas = (accounts || []).filter((acc) => {
                              const num = acc.accountPlan?.number?.toString() || '';
                              if (
                                acc.accountPlan?.type !== 'financial' ||
                                acc.accountPlan?.writable !== 'moviment'
                              ) {
                                return false;
                              }
                              if (tipo === 'ativo')
                                return (
                                  num.startsWith('1') ||
                                  num.startsWith('3') ||
                                  num.startsWith('41')
                                );
                              if (tipo === 'passivo')
                                return ['42', '43', '44', '45', '46', '48', '49', '5'].some((p) =>
                                  num.startsWith(p)
                                );
                              if (tipo === 'gasto') return num.startsWith('6');
                              if (tipo === 'ganho') return num.startsWith('7');
                              return false;
                            });

                            if (contasFiltradas.length === 0) return null;

                            const labelMap = {
                              ativo: 'Contas do Ativo',
                              passivo: 'Contas do Passivo',
                              gasto: 'Contas de Gastos e Perdas',
                              ganho: 'Contas de Ganhos'
                            };

                            return (
                              <optgroup key={tipo} label={labelMap[tipo]}>
                                {contasFiltradas.map((acc) => (
                                  <option key={acc.id} value={acc.accountPlan.number}>
                                    {acc.accountPlan.number} - {acc.accountPlan.description}
                                  </option>
                                ))}
                              </optgroup>
                            );
                          })}
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={row.debit}
                          onChange={(e) =>
                            handleInputChange(index, 'debit', parseFloat(e.target.value) || 0)
                          }
                          disabled={row.credit > 0}
                          placeholder="0.00"
                          style={{ textAlign: 'right' }}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={row.credit}
                          onChange={(e) =>
                            handleInputChange(index, 'credit', parseFloat(e.target.value) || 0)
                          }
                          disabled={row.debit > 0}
                          placeholder="0.00"
                          style={{ textAlign: 'right' }}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          value={row.description}
                          onChange={(e) =>
                            handleInputChange(index, 'description', e.target.value)
                          }
                          placeholder="Descrição..."
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeRow(index)}
                          title="Remover linha"
                        >
                          <FaTrashAlt />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {(!tableData || tableData.length === 0) && (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-muted">
                        Clique em &ldquo;Adicionar Linha&rdquo; para inserir partidas contabilísticas.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: '#f4f8f5', fontWeight: 700 }}>
                    <td style={{ color: '#0f291e' }}>Totais da Partida</td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#b91c1c'
                      }}
                    >
                      {totalDebit.toFixed(2)}
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#0f5132'
                      }}
                    >
                      {totalCredit.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', color: '#64748b' }}>Diferença:</td>
                    <td
                      style={{
                        textAlign: 'center',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: Math.abs(diff) > 0.01 ? '#b91c1c' : '#0f5132'
                      }}
                    >
                      {diff.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </div>
        )}

        {/* PASSO 2: Validação e Confirmação */}
        {currentStep === 2 && (
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
                  A processar transação financeira...
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
                    Operação Realizada com Sucesso!
                  </h4>
                  <Button
                    variant="success"
                    onClick={() => {
                      const printContent = document.getElementById('comprovativo');
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
                  id="comprovativo"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #d8e2dc',
                    borderRadius: '12px',
                    padding: '20px'
                  }}
                >
                  <h6 style={{ fontWeight: 700, color: '#0f291e', marginBottom: '12px' }}>
                    Comprovativo de Lançamento Contabilístico
                  </h6>
                  <div className="row g-3 mb-3 pb-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <div className="col-md-4">
                      <small style={{ color: '#64748b' }}>Operador Responsável</small>
                      <div style={{ fontWeight: 700, color: '#0f291e' }}>
                        {namePersonCharge || 'Utilizador SGF'}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <small style={{ color: '#64748b' }}>Data do Documento</small>
                      <div style={{ fontWeight: 700, color: '#0f291e' }}>
                        {operationDate || new Date().toLocaleDateString()}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <small style={{ color: '#64748b' }}>Hora de Registo</small>
                      <div style={{ fontWeight: 700, color: '#0f291e' }}>
                        {new Date().toLocaleTimeString()}
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
                  Verificação Final Antes do Registo Oficial
                </h6>

                <div className="row g-3 mb-3 pb-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <div className="col-md-6">
                    <small style={{ color: '#64748b' }}>Operação Realizada Por</small>
                    <div style={{ fontWeight: 700, color: '#0f291e' }}>
                      {namePersonCharge || 'Utilizador SGF'}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <small style={{ color: '#64748b' }}>Data do Documento</small>
                    <div style={{ fontWeight: 700, color: '#0f5132' }}>
                      {operationDate || 'Não definida'}
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
                    padding: '12px 16px'
                  }}
                >
                  <Form.Check
                    type="checkbox"
                    id="confirmation"
                    checked={confirmation}
                    onChange={(e) => setConfirmation(e.target.checked)}
                    label="Confirmo que as informações de débito e crédito estão corretas."
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
              disabled={(currentStep === 2 && !confirmation) || isProcessing}
              style={{
                backgroundColor: '#0f5132',
                borderColor: '#0f5132',
                fontWeight: 600
              }}
            >
              {currentStep === 1 ? 'Validar Lançamento' : 'Confirmar e Submeter'}
              {currentStep === 1 && <FaArrowRight style={{ marginLeft: '6px' }} />}
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default BankingOperations;
