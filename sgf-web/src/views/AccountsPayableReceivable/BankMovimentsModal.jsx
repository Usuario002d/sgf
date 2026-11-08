import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaCreditCard, FaExchangeAlt, FaCheckCircle, FaArrowRight, FaCcVisa, FaPrint } from 'react-icons/fa';
import { MdDateRange, MdBusiness, MdPerson, MdOutlineRequestPage, MdAccountBalance, MdReceipt, MdAttachMoney } from 'react-icons/md';
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import { FiTrash2, FiAlertTriangle, FiPlusCircle, FiLock, FiDollarSign, FiRefreshCw, FiClock, FiX } from 'react-icons/fi';
import { RotateSpinner } from "react-spinners-kit";
import VisaIcon from '@mui/icons-material/CreditCard'; // Usando um ícone genérico para representar o cartão

const AccountToPayModal = ({ show, onClose, onComplete, filteredRequests, selectedRequest, tableData, handleRowDoubleClick, addRow, handleInputChange, accounts, paymentType, documentType, setPaymentType, setDocumentType, removeRow }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [accountDetails, setAccountDetails] = useState({
    accountNumber: '',
    bank: '',
    amount: '',
    cardType: '',
    cardNumber: '',
    expiryDate: ''
  });
  const [confirmation, setConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Vamos extrair as contas
  const contasCredito = tableData
    .filter(row => row.credit > 0)
    .map(row => {
      const conta = accounts.find(a => a.accountPlan.number === row.account);
      return `${row.account}${conta ? ` - ${conta.accountPlan.description}` : ''}: ${row.credit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} MZN`;
    });

  const contasDebito = tableData
    .filter(row => row.debit > 0)
    .map(row => `${row.account} : ${row.debit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} MZN`)
    .join(' | ') || 'Conta não informada';
  const handleNext = () => {
    console.log("dados da tabela", tableData)
    const imbalance = Math.abs(
      tableData.reduce((total, row) => total + (row.debit || 0), 0) -
      tableData.reduce((total, row) => total + (row.credit || 0), 0)
    );
    if (tableData.length === 0 || imbalance > 0.01) {
      Swal.fire({
        icon: 'error',
        title: 'Não é possível avançar',
        html: tableData.length === 0
          ? 'Você precisa adicionar pelo menos um banco.'
          : 'Os valores de débito e crédito não estão balanceados.',
        confirmButtonColor: '#3498db'
      });
      return; // Impede a navegação
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsProcessing(true);

      setTimeout(() => {
        setIsProcessing(false);
        setPaymentCompleted(true);

        // Complete payment after showing success
        setTimeout(() => {
          onComplete();
          // onClose();
          // Reset states for next use
          setIsProcessing(false);
          setPaymentCompleted(true);
        }, 2000);
      }, 5000);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const paymentMethods = [
    { id: 'debito', name: 'Débito Direto', icon: <MdAccountBalance size={30} />, color: 'linear-gradient(135deg, #4a6bff 0%, #3a52d1 100%)' },
    { id: 'credito', name: 'Cartão Crédito', icon: <FaCreditCard size={30} />, color: 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)' },
    { id: 'transferencia', name: 'Transferência', icon: <FaExchangeAlt size={30} />, color: 'linear-gradient(135deg, #20c997 0%, #099268 100%)' },
    { id: 'dinheiro', name: 'Dinheiro', icon: <FaMoneyBillWave size={30} />, color: 'linear-gradient(135deg, #f59f00 0%, #f76707 100%)' }
  ];

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        width: '95vw',
        maxWidth: '1440px',
        maxHeight: '90vh',
        height: 'auto',
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        color: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '30px',
        boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'white'
      }}>
        {/* Header Premium */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          padding: '20px 25px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #1a2a6c,rgb(5, 0, 0),rgb(21, 44, 18))',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          '::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #00d2ff, #3a7bd5)',
            animation: 'progress 2.5s infinite linear'
          }
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(5px)'
            }}>
              <FiDollarSign style={{
                color: 'white',
                fontSize: '24px',
                animation: 'pulse 2s infinite alternate'
              }} />
            </div>

            <div>
              <h2 style={{
                margin: 0,
                color: 'white',
                fontWeight: '700',
                fontSize: '22px',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FiRefreshCw style={{
                  animation: 'spin 3s linear infinite',
                  opacity: 0.7
                }} />
                Processamento de Pagamento
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '5px'
              }}>
                <FiClock style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }} />
                <span style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '14px',
                  fontWeight: '300'
                }}>
                  Transação em andamento
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)',
              transform: isHovered ? 'rotate(90deg)' : 'none',
              background: isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
            }}
          >
            <FiX />
          </button>

          {/* Adicione estas animações no seu CSS global */}
          <style jsx>{`
    @keyframes progress {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(1.1); opacity: 1; }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}</style>
        </div>

        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '30px',
          position: 'relative'
        }}>
          {[1, 2, 3, 4].map((step) => (
            <div key={step} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: currentStep >= step ? '#f25704' : '#333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '5px',
                boxShadow: currentStep >= step ? '0 0 10px rgba(242, 87, 4, 0.7)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {currentStep > step ? (
                  <FaCheckCircle size={20} color="white" />
                ) : (
                  <span style={{ color: 'white', fontWeight: 'bold' }}>{step}</span>
                )}
              </div>
              <span style={{
                fontSize: '12px',
                color: currentStep >= step ? 'white' : '#aaa',
                fontWeight: currentStep >= step ? 'bold' : 'normal'
              }}>
                {step === 1 ? 'Operação' : step === 2 ? 'Pagamento' : step === 3 ? 'Operações' : 'Confirmação'}
              </span>
            </div>
          ))}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '15%',
            right: '15%',
            height: '2px',
            backgroundColor: '#333',
            zIndex: 1
          }}>
            <div style={{
              width: currentStep === 1 ? '0%' : currentStep === 2 ? '33%' : currentStep === 3 ? '66%' : '100%',
              height: '100%',
              backgroundColor: '#f25704',
              transition: 'all 0.5s ease'
            }}></div>
          </div>
        </div>

        <div style={{ minHeight: '300px' }}>

          {currentStep === 1 && (
            <div style={{
              flex: 1,
              padding: '15px',
              backgroundColor: '#16213e',
              borderRadius: '10px',
              height: "520px"
            }}>

              <div className="mb-4 d-flex justify-content-between align-items-center">
                <Button
                  variant="primary"
                  onClick={addRow}
                  style={{
                    fontWeight: '600',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(52, 152, 219, 0.4)',
                    backgroundColor: '#3498db',
                    border: 'none'
                  }}>
                  <FiPlusCircle style={{ marginRight: '8px' }} /> Adicionar Bancos
                </Button>

                <div style={{
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '1.2rem',
                    color: 'white'
                  }}>
                    Total Débito: <strong style={{ color: '#e74c3c' }}>
                      {tableData.reduce((total, row) => total + (row.debit || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </span>
                  <span style={{
                    fontSize: '1.2rem',
                    color: 'white'
                  }}>
                    Total Crédito: <strong style={{ color: '#27ae60' }}>
                      {tableData.reduce((total, row) => total + (row.credit || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </span>
                </div>
              </div>

              <div style={{
                maxHeight: '300px',
                border: '1px solid #d4af37',
                borderRadius: '12px', /* Bordas arredondadas no container */
                overflowY: 'auto',
                /* Estilização personalizada da scrollbar */
                scrollbarWidth: 'thin', /* Para Firefox */
                scrollbarColor: '#d4af37 rgba(255, 245, 240, 0.3)', /* Para Firefox */
                '&::-webkit-scrollbar': {
                  width: '6px', /* Largura fina */
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255, 245, 240, 0.2)', /* Fundo quase transparente */
                  borderRadius: '10px',
                  margin: '4px 0'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'linear-gradient(45deg, #d4af37, #f1c40f)', /* Gradiente dourado */
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)', /* Borda sutil */
                  backgroundClip: 'padding-box'
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'linear-gradient(45deg, #f1c40f, #d4af37)', /* Efeito hover invertido */
                  transform: 'scale(1.05)'
                },
                '&::-webkit-scrollbar-corner': {
                  background: 'transparent' /* Para o canto inferior direito */
                }
              }}>
                {/* Efeito de brilho floral */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffd700\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                  opacity: 0.3,
                  pointerEvents: 'none',
                  zIndex: 0
                }}></div>

                <table className="table table-hover mb-0" style={{
                  position: 'relative',
                  zIndex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)'
                }}>
                  <thead style={{
                    position: 'sticky',
                    top: 0,
                    background: 'linear-gradient(135deg, #8e44ad 0%, #2980b9 100%)',
                    color: 'white',
                    zIndex: 2,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    borderBottom: '2px solid #d4af37' // Linha dourada
                  }}>
                    <tr>
                      <th style={{ padding: '15px', fontWeight: '600', letterSpacing: '0.5px' }}>Conta Financeira</th>
                      <th style={{ padding: '15px', fontWeight: '600', letterSpacing: '0.5px' }}>Débito</th>
                      <th style={{ padding: '15px', fontWeight: '600', letterSpacing: '0.5px' }}>Crédito</th>
                      <th style={{ padding: '15px', fontWeight: '600', letterSpacing: '0.5px' }}>Descrição</th>
                      <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', letterSpacing: '0.5px' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => {
                      const isPreloaded = row.isPreloaded;
                      const isFirstRow = index === 0;
                      const rowColor = isPreloaded ? 'rgba(249, 249, 249, 0.8)' : 'rgba(255, 255, 255, 0.8)';

                      return (
                        <tr key={index} style={{
                          backgroundColor: rowColor,
                          borderBottom: '1px solid rgba(210, 180, 140, 0.3)', // Linha dourada suave
                          transition: 'all 0.3s ease',
                          ':hover': {
                            backgroundColor: 'rgba(245, 245, 245, 0.9)',
                            boxShadow: '0 2px 8px rgba(210, 180, 140, 0.2)'
                          }
                        }}>
                          <td style={{ padding: '12px 15px', borderRight: '1px solid rgba(210, 180, 140, 0.2)' }}>
                            {isPreloaded ? (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#333'
                              }}>
                                <FiLock style={{ flexShrink: 0, color: '#8e44ad' }} />
                                <span>{row.account}</span>
                              </div>
                            ) : (
                              <Form.Select
                                value={row.account}
                                onChange={(e) => handleInputChange(index, 'account', e.target.value)}
                                className="form-select-sm"
                                style={{
                                  maxWidth: "280px",
                                  fontSize: "0.95em",
                                  borderColor: 'rgba(210, 180, 140, 0.5)',
                                  borderRadius: '6px',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                }}
                              >
                                <option value="">Selecionar Conta</option>
                                {accounts
                                  .filter(
                                    (account) =>
                                      account.accountPlan.type === "financial" &&
                                      account.accountPlan.writable === "moviment" &&
                                      account.accountPlan.financialType === "BANK" || account.accountPlan.financialType === "recebimentos" || account.accountPlan.financialType === "pagamentos"
                                  )
                                  .map((account) => (
                                    <option key={account.id} value={account.accountPlan.number}>
                                      {account.accountPlan.number} - {account.accountPlan.description}
                                    </option>
                                  ))}
                              </Form.Select>
                            )}
                          </td>
                          <td style={{ padding: '12px 15px', borderRight: '1px solid rgba(210, 180, 140, 0.2)' }}>
                            <input
                              type="number"
                              value={row.debit}
                              onChange={(e) =>
                                handleInputChange(index, 'debit', parseFloat(e.target.value) || 0)
                              }
                              placeholder="0,00"
                              className="form-control form-control-sm"
                              min="0"
                              readOnly={!isFirstRow}
                              style={{
                                textAlign: 'right',
                                fontWeight: isFirstRow ? '600' : '400',
                                color: isFirstRow ? '#e74c3c' : 'inherit',
                                borderColor: 'rgba(210, 180, 140, 0.3)',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)'
                              }}
                            />
                          </td>
                          <td style={{ padding: '12px 15px', borderRight: '1px solid rgba(210, 180, 140, 0.2)' }}>
                            <input
                              type="number"
                              value={row.credit}
                              onChange={(e) =>
                                handleInputChange(index, 'credit', parseFloat(e.target.value) || 0)
                              }
                              placeholder="0,00"
                              className="form-control form-control-sm"
                              min="0"
                              disabled={isPreloaded}
                              style={{
                                textAlign: 'right',
                                color: '#27ae60',
                                borderColor: 'rgba(210, 180, 140, 0.3)',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)'
                              }}
                            />
                          </td>
                          <td style={{ padding: '12px 15px', borderRight: '1px solid rgba(210, 180, 140, 0.2)' }}>
                            <input
                              type="text"
                              value={row.description}
                              onChange={(e) =>
                                handleInputChange(index, 'description', e.target.value)
                              }
                              placeholder={isPreloaded ? "Descrição fixa" : "Insira a descrição"}
                              className="form-control form-control-sm"
                              disabled={isPreloaded}
                              style={{
                                backgroundColor: isPreloaded ? 'rgba(240, 240, 240, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                                borderColor: 'rgba(210, 180, 140, 0.3)'
                              }}
                            />
                          </td>
                          <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                            {!isPreloaded && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeRow(index)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '5px',
                                  borderColor: '#e74c3c',
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                  transition: 'all 0.3s ease',
                                  ':hover': {
                                    backgroundColor: '#e74c3c',
                                    color: 'white',
                                    transform: 'scale(1.05)'
                                  }
                                }}
                              >
                                <FiTrash2 size={16} />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className='d-none' style={{
                    position: 'sticky',
                    bottom: 0,
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    zIndex: 1,
                    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
                    borderTop: '2px solid #d4af37' // Linha dourada
                  }}>
                    <tr>
                      <td style={{ padding: '15px' }}>Total</td>
                      <td style={{
                        padding: '15px',
                        color: '#e74c3c',
                        textAlign: 'right'
                      }}>
                        {tableData.reduce((total, row) => total + (row.debit || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{
                        padding: '15px',
                        color: '#27ae60',
                        textAlign: 'right'
                      }}>
                        {tableData.reduce((total, row) => total + (row.credit || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '15px' }}>Diferença</td>
                      <td style={{
                        padding: '15px',
                        color: Math.abs(
                          tableData.reduce((total, row) => total + (row.debit || 0), 0) -
                          tableData.reduce((total, row) => total + (row.credit || 0), 0)
                        ) > 0.01 ? '#e74c3c' : '#27ae60',
                        textAlign: 'right'
                      }}>
                        {(
                          tableData.reduce((total, row) => total + (row.debit || 0), 0) -
                          tableData.reduce((total, row) => total + (row.credit || 0), 0)
                        ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {Math.abs(
                tableData.reduce((total, row) => total + (row.debit || 0), 0) -
                tableData.reduce((total, row) => total + (row.credit || 0), 0)
              ) > 0.01 && (
                  <div className="alert alert-warning mt-3" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderRadius: '8px',
                    padding: '12px',
                    fontWeight: '600',
                    backgroundColor: '#fff3cd'
                  }}>
                    <FiAlertTriangle size={24} color="#856404" />
                    <span>Atenção: Os valores de débito e crédito não estão balanceados.</span>
                  </div>
                )}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              {selectedRequest ? (
                <>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>

                    {/* Primeiro card - Requisição Selecionada */}
                    <div style={{
                      flex: 1,
                      padding: '20px',
                      backgroundColor: '#16213e',
                      borderRadius: '10px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}>
                      <h3 style={{
                        marginBottom: '20px',
                        color: '#ff8c00',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <MdOutlineRequestPage size={24} /> Requisição Selecionada
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                          <p style={{ margin: '5px 0', fontSize: '14px', color: '#fff' }}>
                            <strong>Número:</strong> {selectedRequest.requestNumber}
                          </p>
                          <p style={{ margin: '5px 0', fontSize: '14px', color: '#fff' }}>
                            <strong>Solicitante:</strong> {selectedRequest.requestorName}
                          </p>
                        </div>
                        <div>
                          <p style={{ margin: '5px 0', fontSize: '14px', color: '#fff' }}>
                            <strong>Departamento:</strong> {selectedRequest.requestorDepartment}
                          </p>
                          <p style={{ margin: '5px 0', fontSize: '14px', color: '#fff' }}>
                            <strong>Valor Total:</strong> {selectedRequest.totalRequestedValue?.toFixed(2) || '0.00'} MZN
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Segundo card - Detalhes do Pagamento */}
                    <div style={{
                      flex: 1,
                      padding: '20px',
                      backgroundColor: '#16213e',
                      borderRadius: '10px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}>
                      <h3 style={{
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#ff8c00'
                      }}>
                        <MdReceipt size={24} /> Detalhes do Pagamento
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Tipo de Pagamento</label>
                          <select
                            value={paymentType}
                            onChange={(e) => setPaymentType(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #333',
                              backgroundColor: '#1a1a2e',
                              color: '#fff'
                            }}
                          >
                            <option value="">Selecione o tipo</option>
                            <option value="parcial">Parcial</option>
                            <option value="unico">Único</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Tipo de Documento</label>
                          <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #333',
                              backgroundColor: '#1a1a2e',
                              color: '#fff'
                            }}
                          >
                            <option value="">Selecione o documento</option>
                            <option value="cheque">Cheque</option>
                            <option value="factura">Fatura</option>
                            <option value="recibo">Recibo</option>
                          </select>
                        </div>
                      </div>
                    </div>

                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
                  <p>Nenhuma requisição selecionada. Volte ao passo anterior e selecione uma requisição.</p>
                </div>
              )}
            </div>
          )}


          {currentStep === 4 && selectedRequest && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '25px',
              marginBottom: '30px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
              color: '#333',
              maxWidth: '1000px',
              margin: '0 auto',
              border: '1px solid #eee',
              height: '500px',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: '#f25704 #f0f0f0'
            }}>
              {isProcessing ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '300px',
                  backgroundColor: '#f7f7f7',
                  borderRadius: '10px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  padding: '20px',
                  width: '350px',
                  margin: '0 auto', // Isso garante que o componente fique centralizado na tela
                }}>
                  <FaCcVisa style={{ fontSize: 50, color: '#0071b8' }} />
                  <RotateSpinner size={60} color="#f25704" loading={isProcessing} />
                  <p style={{
                    marginTop: '20px',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333',
                  }}>
                    Processando pagamento...
                  </p>
                  <p style={{
                    marginTop: '10px',
                    fontSize: '14px',
                    color: '#888',
                  }}>
                    Usando Visa/MasterCard
                  </p>
                </div>
              ) : paymentCompleted ? (
                <div>
                  {/* Mensagem de sucesso com botão de impressão */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(46, 213, 115, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      border: '2px solid #2ed573'
                    }}>
                      <FaCheckCircle size={40} color="#2ed573" />
                    </div>
                    <h3 style={{ color: '#2ed573', marginBottom: '15px' }}>Pagamento realizado com sucesso!</h3>

                    {/* Botão de impressão */}
                    <button
                      onClick={() => {
                        const printContent = document.getElementById('comprovativo');  // ID do recibo
                        const originalContent = document.body.innerHTML;

                        document.body.innerHTML = printContent.innerHTML; // Substitui o conteúdo da página pelo recibo

                        window.print();

                        document.body.innerHTML = originalContent; // Restaura o conteúdo original após a impressão
                        window.location.reload(); // Opcional: recarregar a página para garantir que o estado esteja correto
                      }}
                      style={{
                        backgroundColor: '#f25704',
                        color: 'white',
                        border: 'none',
                        padding: '12px 25px',
                        borderRadius: '5px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '10px',
                        transition: 'all 0.3s ease',
                        ':hover': {
                          backgroundColor: '#e04c00',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <FaPrint /> Imprimir Comprovativo
                    </button>
                  </div>

                  {/* Recibo completo - TODO O CONTEÚDO ORIGINAL */}
                  <div id="comprovativo" style={{
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    padding: '25px',
                    marginBottom: '30px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    color: '#333',
                    border: '1px solid #eee'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px',
                      borderBottom: '1px solid #eee',
                      paddingBottom: '15px'
                    }}>
                      <h3 style={{ margin: 0, color: '#f25704' }}>Comprovativo de Pagamento</h3>
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png"
                        alt="Mastercard"
                        style={{ height: '30px' }}
                      />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        fontWeight: 'bold'
                      }}>
                        <span>Número da Requisição:</span>
                        <span>{selectedRequest.requestNumber}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}>
                        <span>Solicitante:</span>
                        <span>{selectedRequest.requestorName}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}>
                        <span>Departamento:</span>
                        <span>{selectedRequest.requestorDepartment}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}>
                        <span>Tipo de Pagamento:</span>
                        <span>{paymentType === 'parcial' ? 'Parcial' : 'Único'}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}>
                        <span>Tipo de Documento:</span>
                        <span>{documentType === 'cheque' ? 'Cheque' : documentType === 'factura' ? 'Fatura' : 'Recibo'}</span>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#f9f9f9',
                      borderRadius: '8px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}>
                        <span>Total a Pagar:</span>
                        <span style={{ color: '#f25704' }}>
                          {selectedRequest.totalRequestedValue?.toFixed(2) || '0.00'} MZN
                        </span>
                      </div>
                    </div>
                    <div style={{ marginBottom: '25px' }}>
                      <div style={{
                        background: 'linear-gradient(to right, rgba(255,245,240,0.1), rgba(255,245,240,0.3))',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 8px rgba(210, 180, 140, 0.1)'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '20px'
                        }}>
                          {/* Conta de Débito */}
                          <div style={{
                            background: 'linear-gradient(135deg, rgba(142, 68, 173, 0.15), rgba(41, 128, 185, 0.15))',
                            borderLeft: '4px solid #d4af37',
                            borderRadius: '8px',
                            padding: '15px',
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#2c3e50',
                            animation: 'pulse 2s infinite alternate'
                          }}>
                            <div style={{ marginBottom: '8px', color: 'black' }}>Conta de Débito:</div>
                            <div style={{
                              color: '#e74c3c',
                              fontWeight: '700',
                              fontSize: '16px',
                              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}>{contasDebito}</div>
                          </div>

                          {/* Conta de Crédito */}
                          <div style={{
                            background: 'linear-gradient(to right, rgba(255,255,255,0.8), rgba(230, 250, 240, 0.7))',
                            borderLeft: '4px solid #2ecc71',
                            borderRadius: '8px',
                            padding: '15px',
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#2c3e50'
                          }}>
                            <div style={{ marginBottom: '8px', color: 'black' }}>
                              <i className="fas fa-arrow-circle-down" style={{ marginRight: '5px' }}></i>Conta de Crédito:
                            </div>
                            <div style={{
                              color: '#27ae60',
                              fontWeight: '700',
                              fontSize: '16px',
                              backgroundColor: 'rgba(46, 204, 113, 0.1)',
                              padding: '5px 10px',
                              borderRadius: '5px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                {contasCredito.length > 0 ? (
                                  contasCredito.map((item, index) => (
                                    <div key={index} style={{ wordBreak: 'break-word' }}>
                                      {item}
                                    </div>
                                  ))
                                ) : (
                                  <div>Conta não informada</div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Conta de Pagamento */}
                          <div style={{
                            background: 'linear-gradient(to right, rgba(245, 245, 220, 0.4), rgba(240, 255, 240, 0.4))',
                            borderLeft: '4px solid #f39c12',
                            borderRadius: '8px',
                            padding: '15px',
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#2c3e50'
                          }}>
                            <div style={{ marginBottom: '8px', color: 'black' }}>Conta de Pagamento:</div>
                            <div style={{
                              fontWeight: '700',
                              fontSize: '16px',
                              backgroundColor: 'rgba(243, 156, 18, 0.1)',
                              padding: '5px 10px',
                              borderRadius: '5px'
                            }}>
                              {'---'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <style jsx>{`
              @keyframes pulse {
                0% { transform: scale(1); box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
                100% { transform: scale(1.01); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
              }
            `}</style>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#777'
                    }}>
                      <span>Data: {new Date().toLocaleDateString()}</span>
                      <span>Hora: {new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Seu conteúdo original quando não está processando nem completou */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    padding: '25px',
                    marginBottom: '30px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    color: '#333',
                    border: '1px solid #eee'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px',
                      borderBottom: '1px solid #eee',
                      paddingBottom: '15px'
                    }}>
                      <h3 style={{ margin: 0, color: '#f25704' }}>Comprovativo de Pagamento</h3>
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png"
                        alt="Mastercard"
                        style={{ height: '30px' }}
                      />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        fontWeight: 'bold'
                      }}>
                        <span>Número da Requisição:</span>
                        <span>{selectedRequest.requestNumber}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}>
                        <span>Solicitante:</span>
                        <span>{selectedRequest.requestorName}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}>
                        <span>Departamento:</span>
                        <span>{selectedRequest.requestorDepartment}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}>
                        <span>Tipo de Pagamento:</span>
                        <span>{paymentType === 'parcial' ? 'Parcial' : 'Único'}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}>
                        <span>Tipo de Documento:</span>
                        <span>{documentType === 'cheque' ? 'Cheque' : documentType === 'factura' ? 'Fatura' : 'Recibo'}</span>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#f9f9f9',
                      borderRadius: '8px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 'bold',
                        fontSize: '18px'
                      }}>
                        <span>Total a Pagar:</span>
                        <span style={{ color: '#f25704' }}>
                          {selectedRequest.totalRequestedValue?.toFixed(2) || '0.00'} MZN
                        </span>
                      </div>
                    </div>
                    <div style={{ marginBottom: '25px' }}>
                      <div style={{
                        background: 'linear-gradient(to right, rgba(255,245,240,0.1), rgba(255,245,240,0.3))',
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 2px 8px rgba(210, 180, 140, 0.1)'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '20px'
                        }}>
                          {/* Conta de Débito */}
                          <div style={{
                            background: 'linear-gradient(135deg, rgba(142, 68, 173, 0.15), rgba(41, 128, 185, 0.15))',
                            borderLeft: '4px solid #d4af37',
                            borderRadius: '8px',
                            padding: '15px',
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#2c3e50',
                            animation: 'pulse 2s infinite alternate'
                          }}>
                            <div style={{ marginBottom: '8px', color: 'black' }}>Conta de Débito:</div>
                            <div style={{
                              color: '#e74c3c',
                              fontWeight: '700',
                              fontSize: '16px',
                              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}>{contasDebito}</div>
                          </div>

                          {/* Conta de Crédito */}
                          <div style={{
                            background: 'linear-gradient(to right, rgba(255,255,255,0.8), rgba(230, 250, 240, 0.7))',
                            borderLeft: '4px solid #2ecc71',
                            borderRadius: '8px',
                            padding: '15px',
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#2c3e50'
                          }}>
                            <div style={{ marginBottom: '8px', color: 'black' }}>
                              <i className="fas fa-arrow-circle-down" style={{ marginRight: '5px' }}></i>Conta de Crédito:
                            </div>
                            <div style={{
                              color: '#27ae60',
                              fontWeight: '700',
                              fontSize: '16px',
                              backgroundColor: 'rgba(46, 204, 113, 0.1)',
                              padding: '5px 10px',
                              borderRadius: '5px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                {contasCredito.length > 0 ? (
                                  contasCredito.map((item, index) => (
                                    <div key={index} style={{ wordBreak: 'break-word' }}>
                                      {item}
                                    </div>
                                  ))
                                ) : (
                                  <div>Conta não informada</div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Conta de Pagamento */}
                          <div style={{
                            background: 'linear-gradient(to right, rgba(245, 245, 220, 0.4), rgba(240, 255, 240, 0.4))',
                            borderLeft: '4px solid #f39c12',
                            borderRadius: '8px',
                            padding: '15px',
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#2c3e50'
                          }}>
                            <div style={{ marginBottom: '8px', color: 'black' }}>Conta de Pagamento:</div>
                            <div style={{
                              fontWeight: '700',
                              fontSize: '16px',
                              backgroundColor: 'rgba(243, 156, 18, 0.1)',
                              padding: '5px 10px',
                              borderRadius: '5px'
                            }}>
                              {'---'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <style jsx>{`
              @keyframes pulse {
                0% { transform: scale(1); box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
                100% { transform: scale(1.01); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
              }
            `}</style>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#777'
                    }}>
                      <span>Data: {new Date().toLocaleDateString()}</span>
                      <span>Hora: {new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <input
                      type="checkbox"
                      id="confirmation"
                      checked={confirmation}
                      onChange={(e) => setConfirmation(e.target.checked)}
                      style={{ marginRight: '10px' }}
                    />
                    <label htmlFor="confirmation">Confirmo que as informações estão corretas</label>
                  </div>
                </>
              )}
            </div>
          )}


        </div>

        {/* Navigation Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '30px'
        }}>
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || isProcessing || paymentCompleted}
            style={{
              padding: '12px 25px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: currentStep === 1 ? '#333' : '#f25704',
              color: 'white',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 1 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            Voltar
          </button>
          <button
            onClick={handleNext}
            disabled={
              (currentStep === 2 && (!paymentType || !documentType)) ||
              (currentStep === 4 && !confirmation) ||
              isProcessing ||
              paymentCompleted}
            style={{
              padding: '12px 25px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(90deg, #f25704, #ff8c00)',
              color: 'white',
              cursor:
                (currentStep === 2 && (!paymentType || !documentType)) ||
                  (currentStep === 4 && !confirmation) ||
                  isProcessing ||
                  paymentCompleted
                  ? 'not-allowed' : 'pointer',
              opacity:
                (currentStep === 2 && (!paymentType || !documentType)) ||
                  (currentStep === 4 && !confirmation) ||
                  isProcessing ||
                  paymentCompleted
                  ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: 'bold'
            }}
          >
            {currentStep === 4 ? (isProcessing ? 'Processando...' : paymentCompleted ? 'Concluído' : 'Confirmar Pagamento') : 'Próximo'}
            {currentStep < 4 && !isProcessing && !paymentCompleted && <FaArrowRight />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountToPayModal;