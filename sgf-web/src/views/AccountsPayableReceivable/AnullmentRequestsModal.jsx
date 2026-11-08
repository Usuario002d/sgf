import React, { useState, useEffect } from 'react';
import { FaTimes, FaPrint, FaSearch, FaFilePdf, FaFileExcel, FaFilter, FaChevronUp, FaTrash, FaCheck, FaBan } from 'react-icons/fa';
import { MdOutlineDateRange } from 'react-icons/md';
import Swal from 'sweetalert2';

const AnullmentRequestsModal = ({ show, onClose, operations }) => {
  const [loading, setLoading] = useState(true);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [selectedOperations, setSelectedOperations] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    registryStatus: 'all'
  });

  useEffect(() => {

    console.log("dados encontrados", operations)
    if (operations.length > 0) {
      setLoading(false);
    }
  }, [operations]);

  const aplicarFiltros = () => {
    if (!filters.startDate || !filters.endDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Datas obrigatórias',
        text: 'Por favor, selecione as datas "De" e "Até".',
      });
      return;
    }
    console.log("Filtros aplicados:", filters);
  };

  const handleOperationSelect = (operation) => {
    if (selectedOperations.some(op => op.entryId === operation.entryId)) {
      setSelectedOperations(selectedOperations.filter(op => op.entryId !== operation.entryId));
    } else {
      setSelectedOperations([...selectedOperations, operation]);
    }
  };

  const confirmCancelOperation = (operation) => {
    Swal.fire({
      title: 'Anular Operação',
      html: `Tem certeza que deseja anular a operação <b>${operation.requestNumber}</b> no valor de <b>${formatCurrency(operation.totalRequestedValue)}</b>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, anular!',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#fff',
      backdrop: 'rgba(0,0,0,0.8)'
    }).then((result) => {
      if (result.isConfirmed) {
        cancelOperation(operation);
      }
    });
  };

  const cancelOperation = (operation) => {
    // Simulação de chamada API para anular operação
    setLoading(true);
    setTimeout(() => {
      Swal.fire({
        title: 'Operação Anulada!',
        text: `A operação ${operation.requestNumber} foi anulada com sucesso.`,
        icon: 'success',
        background: '#1e293b',
        color: '#fff'
      });
      setLoading(false);
      // Aqui você atualizaria a lista de operações após a anulação
    }, 1500);
  };

  const confirmCancelSelected = () => {
    if (selectedOperations.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Nenhuma operação selecionada',
        text: 'Por favor, selecione pelo menos uma operação para anular.',
      });
      return;
    }

    const totalValue = selectedOperations.reduce((sum, op) => sum + op.totalRequestedValue, 0);

    Swal.fire({
      title: 'Anular Operações Selecionadas',
      html: `
        <div>
          <p>Tem certeza que deseja anular as <b>${selectedOperations.length}</b> operações selecionadas?</p>
          <p>Valor total: <b>${formatCurrency(totalValue)}</b></p>
          <ul style="text-align: left; max-height: 200px; overflow-y: auto; margin: 10px 0; padding-left: 20px;">
            ${selectedOperations.map(op => `<li>${op.requestNumber} - ${formatCurrency(op.totalRequestedValue)}</li>`).join('')}
          </ul>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, anular todas!',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#fff',
      width: '600px'
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
        icon: 'success',
        background: '#1e293b',
        color: '#fff'
      });
      setSelectedOperations([]);
      setLoading(false);
    }, 2000);
  };

  const handlePrint = (operation) => {
    Swal.fire({
      title: 'Gerar Comprovante',
      text: `Preparando comprovante para a operação ${operation.requestNumber}...`,
      timer: 1500,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {
        window.print();
      }
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString) => {
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-PT', options);
  };

  const getStatusBadge = (status) => {
    const baseStyle = {
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px"
    };

    switch (status) {
      case 'completed':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: "rgba(40, 167, 69, 0.1)",
            color: "#28a745",
            border: "1px solid rgba(40, 167, 69, 0.3)"
          }}>
            <FaCheck size={10} /> Concluído
          </span>
        );
      case 'pending':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: "rgba(255, 193, 7, 0.1)",
            color: "#ffc107",
            border: "1px solid rgba(255, 193, 7, 0.3)"
          }}>
            Pendente
          </span>
        );
      case 'rejected':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: "rgba(220, 53, 69, 0.1)",
            color: "#dc3545",
            border: "1px solid rgba(220, 53, 69, 0.3)"
          }}>
            <FaBan size={10} /> Recusado
          </span>
        );
      default:
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: "rgba(108, 117, 125, 0.1)",
            color: "#6c757d",
            border: "1px solid rgba(108, 117, 125, 0.3)"
          }}>
            Processando
          </span>
        );
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="operations-modal-overlay">
        <div className="operations-modal-container">
          {/* Modal Header */}
          <div className="modal-header">
            <h2>
              <FaSearch className="icon" />
              Operações Bancárias Premium
            </h2>
            <button className="close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>

          <div >
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando operações...</p>
              </div>
            ) : selectedOperation ? (
              <div className="operation-detail-view">
                {/* Cabeçalho */}
                <div className="detail-header">
                  <h3>Detalhes da Operação</h3>
                  <div className="action-buttons">
                    <button
                      className="export-btn"
                      onClick={() => {
                        Swal.fire({
                          title: 'Exportar como PDF',
                          text: 'Gerando arquivo PDF...',
                          timer: 1500,
                          timerProgressBar: true,
                          didOpen: () => Swal.showLoading(),
                          background: '#1e293b',
                          color: '#fff'
                        });
                      }}
                    >
                      <FaFilePdf /> PDF
                    </button>
                    <button
                      className="print-btn"
                      onClick={() => handlePrint(selectedOperation)}
                    >
                      <FaPrint /> Imprimir
                    </button>
                  </div>
                </div>



                 
                <div className="operations-table-container">
                  <table
                    className="operations-table"
                    style={{ width: '100%', borderCollapse: 'collapse', fontWeight: 'bold', color: '#000', fontSize: '0.96rem' }}
                  >
                        <thead>
                          <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ccc' }}>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Data</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Operador</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Descrição</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Conta</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOperation.entries?.map((entry, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                              <td style={{ padding: '8px', color: '#000', fontWeight: 'bold' }}>{entry.operationDate}</td>
                              <td style={{
                                padding: '8px',
                                color: entry.operator === 'DEBIT' ? '#28a745' : '#dc3545',
                                fontWeight: 'bold'
                              }}>
                                {entry.operator}
                              </td>
                              <td style={{ padding: '8px', color: '#000', fontWeight: 'bold' }}>Bancos Saidas</td>
                              <td style={{ padding: '8px', color: '#000', fontWeight: 'bold' }}>{entry.accountPlanNumber}</td>
                              <td style={{ padding: '8px', color: '#000', fontWeight: 'bold' }}>{entry.value*2.5}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>




                  {/* <div className="detail-row">
                    <div className="detail-label">Conta/Destino:</div>
                    <div className="detail-value">{selectedOperation.account}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Status:</div>
                    <div className="detail-value">{getStatusBadge(selectedOperation.status)}</div>
                  </div>
                  <div className="detail-row full-width">
                    <div className="detail-label">Detalhes:</div>
                    <div className="detail-value" style={{ marginTop: '8px' }}>
                      {selectedOperation.details || 'Nenhum detalhe adicional disponível.'}
                    </div>
                  </div> */}

                  {selectedOperation.status === 'pending' && (
                    <div className="detail-row" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
                      <button
                        className="cancel-btn"
                        onClick={() => confirmCancelOperation(selectedOperation)}
                      >
                        <FaTrash /> Anular Operação
                      </button>
                    </div>
                  )}

                {/* Botão voltar */}
                <div className="back-button-container">
                  <button
                    className="back-btn"
                    onClick={() => setSelectedOperation(null)}
                  >
                    Voltar à lista
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Filtros */}
                <div className="filters-section">
                  <div className="filter-group">
                    <label><MdOutlineDateRange /> De:</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value*2.5 })}
                    />
                  </div>
                  <div className="filter-group">
                    <label><MdOutlineDateRange /> Até:</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value*2.5 })}
                    />
                  </div>
                  <div className="filter-group">
                    <label>Status:</label>
                    <select
                      value={filters.registryStatus}
                      onChange={(e) => setFilters({ ...filters, registryStatus: e.target.value*2.5 })}
                    >
                      <option value="all">Todas</option>
                      <option value="registered_only">Pendentes</option>
                      <option value="payables_registered_only">Registradas</option>
                      <option value="completed">Concluídas</option>
                      <option value="rejected">Recusadas</option>
                    </select>
                  </div>
                  <button
                    className="apply-filters-btn"
                    onClick={aplicarFiltros}
                  >
                    <FaFilter /> Aplicar Filtros
                  </button>
                </div>

                {/* Ações em lote */}
                {selectedOperations.length > 0 && (
                  <div className="batch-actions">
                    <span className="selected-count">
                      {selectedOperations.length} operação(ões) selecionada(s)
                    </span>
                    <button
                      className="cancel-selected-btn"
                      onClick={confirmCancelSelected}
                    >
                      <FaTrash /> Anular Selecionadas
                    </button>
                  </div>
                )}

                {/* Tabela */}
                <div className="operations-table-container">
                  <table
                    className="operations-table"
                    style={{ width: '100%', borderCollapse: 'collapse', fontWeight: 'bold', color: '#000', fontSize: '0.96rem' }}
                  >
                    <thead>
                      <tr>
                        <th style={{ width: '40px', backgroundColor: '#f4f4f4', padding: '8px', borderBottom: '2px solid #ccc' }}></th>
                        <th style={{ backgroundColor: '#f4f4f4', padding: '8px', borderBottom: '2px solid #ccc' }}>Data/Hora</th>
                        <th style={{ backgroundColor: '#f4f4f4', padding: '8px', borderBottom: '2px solid #ccc' }}>Sequência</th>
                        <th style={{ backgroundColor: '#f4f4f4', padding: '8px', borderBottom: '2px solid #ccc' }}>Valor</th>
                        <th style={{ backgroundColor: '#f4f4f4', padding: '8px', borderBottom: '2px solid #ccc' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {operations.map((op, index) => (
                        <tr key={index}>
                          <td style={{ padding: '8px', borderBottom: '1px solid #e0e0e0' }}>
                            <input
                              type="checkbox"
                              checked={selectedOperations.some(selected => selected.entryId === op.entryId)}
                              onChange={() => handleOperationSelect(op)}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #e0e0e0' }}>{op.operationDate}</td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #e0e0e0' }}>{op.documentSequence}</td>
                          <td
                            style={{
                              padding: '8px',
                              borderBottom: '1px solid #e0e0e0',
                              color: op.value >= 0 ? 'green' : 'red',
                            }}
                          >
                            {formatCurrency(op.value*2.5)}
                          </td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #e0e0e0' }}>
                            <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="view-detail-btn"
                                onClick={() => setSelectedOperation(op)}
                                style={{ fontWeight: 'bold', cursor: 'pointer' }}
                              >
                                <FaSearch /> Detalhes
                              </button>
                              {op.status === 'pending' && (
                                <button
                                  className="cancel-btn"
                                  onClick={() => confirmCancelOperation(op)}
                                  style={{ fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <div className="footer-info">
              Mostrando {operations.length} operações
              {selectedOperations.length > 0 && (
                <span className="selected-info">
                  • {selectedOperations.length} selecionadas
                </span>
              )}
            </div>
            <div className="footer-actions">
              <button
                className="export-all-btn"
                disabled={operations.length === 0}
              >
                <FaFileExcel /> Exportar Tudo
              </button>
              <button
                className="close-modal-btn"
                onClick={onClose}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div >

      {/* CSS */}
      < style jsx > {`
        /* Estilos base */
        .operations-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        .operations-modal-container {
          width: 90%;
          max-width: 1200px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* Header */
        .modal-header {
          padding: 20px 25px;
          background: linear-gradient(to right, #141e30, #243b55);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-header h2 {
          margin: 0;
          color: #fff;
          font-size: 1.5rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-header .icon {
          color: #4fc3f7;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.2s;
          padding: 5px;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          transform: rotate(90deg);
        }

        /* Content */
        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          color: #e0e0e0;
        }

        /* Filtros */
        .filters-section {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          padding: 15px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 150px;
          flex: 1;
        }

        .filter-group label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .filter-group input,
        .filter-group select {
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: #fff;
          font-size: 0.9rem;
        }

        .apply-filters-btn {
          align-self: flex-end;
          padding: 8px 16px;
          background: linear-gradient(to right, #4a6bff, #6a11cb);
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s;
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .apply-filters-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(106, 17, 203, 0.3);
        }

        /* Ações em lote */
        .batch-actions {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
          padding: 10px 15px;
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.3);
          border-radius: 6px;
        }

        .selected-count {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }

        .cancel-selected-btn {
          padding: 8px 16px;
          background: rgba(220, 53, 69, 0.2);
          border: 1px solid rgba(220, 53, 69, 0.3);
          border-radius: 4px;
          color: #dc3545;
          cursor: pointer;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .cancel-selected-btn:hover {
          background: rgba(220, 53, 69, 0.3);
        }

        /* Tabela */
        .operations-table-container {
          overflow-x: auto;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .operations-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .operations-table th {
          background: linear-gradient(to right, #141e30, #243b55);
          color: #fff;
          padding: 12px 15px;
          text-align: left;
          font-weight: 500;
          position: sticky;
          top: 0;
        }

        .operations-table td {
          padding: 12px 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .operations-table tr:last-child td {
          border-bottom: none;
        }

        .operations-table tr:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .positive {
          color: #4caf50;
          font-weight: 500;
        }

        .negative {
          color: #f44336;
          font-weight: 500;
        }

        /* Status badges */
        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge.completed {
          background: rgba(76, 175, 80, 0.15);
          color: #4caf50;
          border: 1px solid rgba(76, 175, 80, 0.3);
        }

        .status-badge.pending {
          background: rgba(255, 193, 7, 0.15);
          color: #ffc107;
          border: 1px solid rgba(255, 193, 7, 0.3);
        }

        .status-badge.rejected {
          background: rgba(244, 67, 54, 0.15);
          color: #f44336;
          border: 1px solid rgba(244, 67, 54, 0.3);
        }

        /* Botões de ação */
        .view-detail-btn {
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(9, 20, 26, 0.3);
          border-radius: 4px;
          color:rgb(7, 30, 41);
          cursor: pointer;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
        }

        .view-detail-btn:hover {
          background: rgba(79, 195, 247, 0.2);
          transform: translateY(-1px);
        }

        .cancel-btn {
          padding: 6px 12px;
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.3);
          border-radius: 4px;
          color: #dc3545;
          cursor: pointer;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          background: rgba(220, 53, 69, 0.2);
          transform: translateY(-1px);
        }

        /* Detalhe da operação */
        .operation-detail-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .detail-header h3 {
          margin: 0;
          color: #fff;
          font-size: 1.3rem;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .export-btn {
          padding: 8px 12px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: #e0e0e0;
          cursor: pointer;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
        }

        .export-btn:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .print-btn {
          padding: 8px 12px;
          background: linear-gradient(to right, #4a6bff, #6a11cb);
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
        }

        .print-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(106, 17, 203, 0.3);
        }

        .operation-detail-card {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .detail-row {
          display: flex;
          margin-bottom: 15px;
        }

        .detail-row.full-width {
          flex-direction: column;
        }

        .detail-label {
          width: 150px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
            font-weight: bold;

        }

        .detail-value {
          flex: 1;
          color: #fff;
          font-size: 0.95rem;
            font-weight: bold;

        }

        .back-button-container {
          display: flex;
          justify-content: flex-end;
        }

        .back-btn {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: #e0e0e0;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* Loading */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
          height: 200px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top-color: #4fc3f7;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Footer */
        .modal-footer {
          padding: 15px 25px;
          background: linear-gradient(to right, #141e30, #243b55);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-info {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
        }

        .selected-info {
          color: #4fc3f7;
          margin-left: 8px;
        }

        .footer-actions {
          display: flex;
          gap: 10px;
        }

        .export-all-btn {
          padding: 8px 16px;
          background: rgba(46, 125, 50, 0.2);
          border: 1px solid rgba(76, 175, 80, 0.3);
          border-radius: 4px;
          color: #4caf50;
          cursor: pointer;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
        }

        .export-all-btn:hover:not(:disabled) {
          background: rgba(46, 125, 50, 0.3);
        }

        .export-all-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .close-modal-btn {
          padding: 8px 16px;
          background: rgba(244, 67, 54, 0.2);
          border: 1px solid rgba(244, 67, 54, 0.3);
          border-radius: 4px;
          color: #f44336;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .close-modal-btn:hover {
          background: rgba(244, 67, 54, 0.3);
        }

        /* Animações */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default AnullmentRequestsModal;