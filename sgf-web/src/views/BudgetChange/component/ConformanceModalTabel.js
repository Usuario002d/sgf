import React from 'react';
import {
  FaFileInvoiceDollar,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt
} from 'react-icons/fa';
import { Button, Table, Modal } from 'react-bootstrap';

const ConformanceModalTable = ({
  show,
  organizedAccounts,
  handleClose,
  renderAccountRows,
  isConformed,
  exportToExcel,
  exportToPDF,
  handleConformityValidation
}) => {
  const handlePrint = () => {
    const printElement = document.getElementById('custom-modal-content');
    if (!printElement) {
      window.print();
      return;
    }
    const printContent = printElement.cloneNode(true);
    const originalContent = document.body.innerHTML;
    const buttons = printContent.querySelectorAll('.no-print');
    buttons.forEach((el) => el.remove());

    document.body.innerHTML = '';
    document.body.appendChild(printContent);
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center" style={{ gap: '10px' }}>
          <FaFileInvoiceDollar style={{ color: '#0f5132' }} />
          <span>Mapa Orçamental — Revisão de Conformidade</span>
          <span
            style={{
              marginLeft: '10px',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: isConformed ? '#ecfdf5' : '#fef3c7',
              color: isConformed ? '#065f46' : '#92400e',
              border: `1px solid ${isConformed ? '#a7f3d0' : '#fde68a'}`
            }}
          >
            {isConformed ? (
              <>
                <FaCheckCircle style={{ marginRight: '5px' }} />
                CONFORME
              </>
            ) : (
              <>
                <FaExclamationTriangle style={{ marginRight: '5px' }} />
                PENDENTE
              </>
            )}
          </span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body id="custom-modal-content" style={{ padding: '20px 24px' }}>
        <div
          className="no-print d-flex flex-wrap justify-content-between align-items-center mb-3"
          style={{
            gap: '12px',
            backgroundColor: '#f8faf9',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid #d8e2dc'
          }}
        >
          <div style={{ fontSize: '0.84rem', color: '#475569' }}>
            Verifique as dotações iniciais, contravalores e duodécimos antes de validar a conformidade oficial.
          </div>
          <div className="d-flex flex-wrap align-items-center" style={{ gap: '8px' }}>
            <Button
              variant="success"
              size="sm"
              onClick={() => handleConformityValidation()}
              disabled={isConformed}
              style={{
                backgroundColor: isConformed ? '#94a3b8' : '#0f5132',
                borderColor: isConformed ? '#94a3b8' : '#0f5132',
                fontWeight: 600
              }}
            >
              <FaShieldAlt style={{ marginRight: '6px' }} />
              {isConformed ? 'Conformidade Já Validada' : 'Validar Conformidade da Folha'}
            </Button>
            <Button variant="outline-success" size="sm" onClick={exportToExcel}>
              <FaFileExcel style={{ marginRight: '5px' }} /> Excel
            </Button>
            <Button variant="outline-danger" size="sm" onClick={exportToPDF}>
              <FaFilePdf style={{ marginRight: '5px' }} /> PDF
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={handlePrint}>
              <FaPrint style={{ marginRight: '5px' }} /> Imprimir
            </Button>
          </div>
        </div>

        <div
          style={{
            maxHeight: '62vh',
            overflowY: 'auto',
            border: '1px solid #d8e2dc',
            borderRadius: '10px'
          }}
        >
          <Table id="tableBudjectMapModal" hover className="mb-0">
            <thead>
              <tr>
                <th rowSpan={2} style={{ verticalAlign: 'middle', width: '16%' }}>
                  Código
                </th>
                <th rowSpan={2} style={{ verticalAlign: 'middle', width: '42%' }}>
                  Designação da Rubrica Orçamental
                </th>
                <th
                  colSpan={2}
                  style={{
                    textAlign: 'center',
                    borderBottom: '1px solid #d8e2dc',
                    backgroundColor: '#eef5f1',
                    color: '#0f5132'
                  }}
                >
                  Dotação Inicial Aprovada
                </th>
                <th
                  colSpan={1}
                  style={{
                    textAlign: 'center',
                    borderBottom: '1px solid #d8e2dc',
                    backgroundColor: '#fef9ee',
                    color: '#92400e'
                  }}
                >
                  Duodécimo Mensal
                </th>
              </tr>
              <tr>
                <th style={{ textAlign: 'right', width: '14%' }}>USD</th>
                <th style={{ textAlign: 'right', width: '14%' }}>Contra Valor</th>
                <th style={{ textAlign: 'right', width: '14%' }}>Contra Valor</th>
              </tr>
            </thead>
            <tbody>
              {organizedAccounts &&
                organizedAccounts.map((account) => renderAccountRows(account))}
            </tbody>
          </Table>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConformanceModalTable;
