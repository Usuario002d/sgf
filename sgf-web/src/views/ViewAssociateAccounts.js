import React from "react";
import {
  FaHistory,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaTimes,
  FaLink,
} from "react-icons/fa";
import { Modal, Button, Table } from "react-bootstrap";

const ViewAssociateAccounts = ({
  show,
  handleClose,
  exportToExcel,
  exportToPDF,
  contasAssociadas = [],
}) => {
  if (!show) return null;

  const handlePrint = () => {
    const tableEl = document.getElementById("tableBudjectMapModal");
    if (!tableEl) return;
    const printWindow = window.open("", "", "height=700,width=1000");
    printWindow.document.write("<html><head><title>Contas Associadas</title>");
    printWindow.document.write(
      "<style>body{font-family:sans-serif;padding:20px;} table{width:100%;border-collapse:collapse;font-size:12px;} th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;} th{background:#eaf5ef;color:#0f5132;}</style>"
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write("<h2>Relatório de Contas Associadas</h2>");
    printWindow.document.write(tableEl.outerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaLink style={{ color: "#0f5132" }} /> Relatório Geral de Contas Associadas
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        <div
          className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom"
          style={{ backgroundColor: "#f4f8f5" }}
        >
          <span style={{ fontSize: "0.85rem", color: "#5c746b", fontWeight: 600 }}>
            Total de {contasAssociadas.length} contas financeiras mapeadas
          </span>
          <div className="d-flex gap-2">
            <Button variant="success" size="sm" onClick={exportToExcel}>
              <FaFileExcel /> Excel
            </Button>
            <Button variant="danger" size="sm" onClick={exportToPDF}>
              <FaFilePdf /> PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={handlePrint}>
              <FaPrint /> Imprimir
            </Button>
          </div>
        </div>

        <div className="table-responsive" style={{ maxHeight: "65vh" }}>
          <Table id="tableBudjectMapModal" hover className="mb-0">
            <colgroup>
              <col style={{ width: "40%" }} />
              <col style={{ width: "60%" }} />
            </colgroup>
            <thead className="sticky-top">
              <tr>
                <th>Conta Financeira</th>
                <th>Contas Orçamentais Vinculadas</th>
              </tr>
            </thead>
            <tbody>
              {contasAssociadas.map((assoc, index) => (
                <tr key={index}>
                  <td>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        backgroundColor: "#eaf5ef",
                        color: "#0f5132",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        marginRight: "8px",
                      }}
                    >
                      {assoc.financialAccount?.number}
                    </span>
                    <strong>{assoc.financialAccount?.description}</strong>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      {assoc.budgetAssociations.map((budget, idx) => (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: "#f8fbf9",
                            border: "1px solid #d5e0da",
                            borderRadius: "6px",
                            padding: "3px 9px",
                            fontSize: "0.8rem",
                          }}
                        >
                          <strong
                            style={{
                              fontFamily: "monospace",
                              color: "#b45309",
                              marginRight: "6px",
                            }}
                          >
                            {budget.budgetAccount?.number}
                          </strong>
                          {budget.budgetAccount?.description}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          <FaTimes /> Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewAssociateAccounts;
