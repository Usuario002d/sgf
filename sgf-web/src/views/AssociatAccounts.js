import React, { useState, useEffect } from "react";
import {
  findAccountPlanBudjectEntriesByYear,
  findAccountPlanAccountAssociateByYear,
  saveAssociateFinancialAccountWithBujectAccounts,
} from "services/accountService";
import Swal from "sweetalert2";
import Spinner from "../config/spinner/spinner";
import ViewAssociateAccounts from "./ViewAssociateAccounts";
import logoMz from "../assets/img/logoMz.png";
import templatePDF from "../views/BudgetChange/component/templatePDF";
import * as XLSX from "xlsx";
import { Modal, Button } from "react-bootstrap";
import {
  FaLink,
  FaPlusCircle,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaTrashAlt,
  FaCheckCircle,
  FaSitemap,
  FaTable,
} from "react-icons/fa";

const AssociatAccounts = () => {
  const [contaOrcamental, setContaOrcamental] = useState("");
  const [contaFinanceira, setContaFinanceira] = useState("");
  const [contaFinanceira1, setContaFinanceira1] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [contasOrcamentaisAssociadas, setContasOrcamentaisAssociadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contasAssociadas, setContasAssociadas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await findAccountPlanBudjectEntriesByYear();
      setAccounts(response || []);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const table = document.getElementById("tableBudjectMap");
    if (!table) return;
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(wb, ws, "Contas Associadas");
    XLSX.writeFile(wb, "contas_associadas.xlsx");
  };

  const exportToPDF = () => {
    const table = document.querySelector("#tableBudjectMap");
    if (!table) return;
    const rows = Array.from(table.querySelectorAll("tr"));

    const head = [["Conta Financeira", "Contas Orçamentais Associadas"]];
    const body = rows.slice(1).map((row) =>
      Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent.trim())
    );

    const savedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    const generatedBy = savedUserData.fullName || "Utilizador SGF";

    templatePDF({
      title: "Relatório de Contas Associadas",
      subtitle: "Mapeamento entre Contas Financeiras e Rubricas Orçamentais",
      tableContent: {
        head,
        body,
      },
      footerText: "Documento gerado automaticamente pelo SGF",
      logoImage: logoMz,
      generatedBy,
      filename: "contas_associadas.pdf",
    });
  };

  const loadAccountAssociate = async () => {
    try {
      setLoading(true);
      const response = await findAccountPlanAccountAssociateByYear();
      const filteredAccounts = (response || []).filter(
        (item) => item.budgetAssociations && item.budgetAssociations.length > 0
      );
      setContasAssociadas(filteredAccounts);
    } catch (error) {
      console.error("Erro nas contas associadas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setContaFinanceira("");
      setContaFinanceira1("");
      return;
    }
    const [number, ...descParts] = val.split(" - ");
    setContaFinanceira(number);
    setContaFinanceira1(val);
  };

  useEffect(() => {
    loadAccounts();
    loadAccountAssociate();
  }, []);

  const handleAddContaOrcamental = () => {
    if (contaOrcamental && !contasOrcamentaisAssociadas.includes(contaOrcamental)) {
      setContasOrcamentaisAssociadas([
        ...contasOrcamentaisAssociadas,
        contaOrcamental,
      ]);
      setContaOrcamental("");
    } else {
      Swal.fire({
        icon: "warning",
        title: "Aviso!",
        text: "Conta Orçamental já adicionada ou não seleccionada.",
      });
    }
  };

  const handleRemoveContaFinanceira = (conta) => {
    setContasOrcamentaisAssociadas(
      contasOrcamentaisAssociadas.filter((c) => c !== conta)
    );
  };

  const handleSubmit = async () => {
    if (!contaFinanceira) {
      Swal.fire({
        icon: "error",
        title: "Erro!",
        text: "Seleccione uma Conta Financeira!",
      });
      return;
    }

    if (contasOrcamentaisAssociadas.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Erro!",
        text: "Adicione pelo menos uma Conta Orçamental!",
      });
      return;
    }

    try {
      setLoading(true);
      const accountPlanBujectsNumber = contasOrcamentaisAssociadas.map((conta) => ({
        accountPlanBujectNumber: conta,
      }));

      const data = {
        accountPlanFinancialNumber: contaFinanceira,
        accountPlanBujectsNumber,
      };

      await saveAssociateFinancialAccountWithBujectAccounts(data);

      Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Contas associadas com sucesso!",
      });

      setContaOrcamental("");
      setContasOrcamentaisAssociadas([]);
      setContaFinanceira("");
      setContaFinanceira1("");
      setShowModal(false);
      loadAccountAssociate();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro!",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAssociadas = contasAssociadas.filter((assoc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const finMatch =
      assoc.financialAccount?.number?.toLowerCase().includes(q) ||
      assoc.financialAccount?.description?.toLowerCase().includes(q);
    const budMatch = assoc.budgetAssociations?.some(
      (b) =>
        b.budgetAccount?.number?.toLowerCase().includes(q) ||
        b.budgetAccount?.description?.toLowerCase().includes(q)
    );
    return finMatch || budMatch;
  });

  const totalBudgetLinks = contasAssociadas.reduce(
    (sum, item) => sum + (item.budgetAssociations?.length || 0),
    0
  );

  return (
    <div className="container-fluid py-2">
      <Spinner isLoading={loading} />

      {/* Cabeçalho Institucional Compacto com Indicadores Integrados */}
      <div className="sgf-page-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <h2 className="mb-0" style={{ fontSize: "1.1rem", fontWeight: 800 }}>
            Associação de Contas Financeiras e Orçamentais
          </h2>
          <span
            className="badge"
            style={{
              backgroundColor: "#eaf5ef",
              color: "#0f5132",
              border: "1px solid #a7d7be",
            }}
          >
            <FaSitemap className="me-1" /> {contasAssociadas.length} Contas Financeiras
          </span>
          <span
            className="badge"
            style={{
              backgroundColor: "#fef3c7",
              color: "#92400e",
              border: "1px solid #fde68a",
            }}
          >
            <FaLink className="me-1" /> {totalBudgetLinks} Rubricas Associadas
          </span>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowModal(true)}
          >
            <FaPlusCircle /> Nova Associação
          </button>
        </div>
      </div>

      {/* Tabela Principal Diretamente Visível e Paginada */}
      <div className="card">
        <div className="card-header flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <FaLink style={{ color: "#0f5132" }} />
            <span>Mapeamento de Contas Financeiras e Orçamentais</span>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Filtrar conta financeira ou orçamental..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ minWidth: "240px", height: "30px" }}
            />
            <button
              type="button"
              className="btn btn-sm btn-success"
              onClick={exportToExcel}
            >
              <FaFileExcel /> Excel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={exportToPDF}
            >
              <FaFilePdf /> PDF
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table id="tableBudjectMap" className="table table-hover mb-0">
              <colgroup>
                <col style={{ width: "38%" }} />
                <col style={{ width: "62%" }} />
              </colgroup>
              <thead className="sticky-top">
                <tr>
                  <th>Conta Financeira (Patrimonial / Tesouraria)</th>
                  <th>Contas Orçamentais Associadas</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssociadas.length > 0 ? (
                  filteredAssociadas.map((assoc, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              backgroundColor: "#eaf5ef",
                              color: "#0f5132",
                              border: "1px solid #a7d7be",
                              padding: "3px 9px",
                              borderRadius: "6px",
                              fontSize: "0.82rem",
                            }}
                          >
                            {assoc.financialAccount?.number}
                          </span>
                          <span style={{ fontWeight: 700, color: "#0f2922" }}>
                            {assoc.financialAccount?.description}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          {assoc.budgetAssociations.map((budget, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                backgroundColor: "#f8fbf9",
                                border: "1px solid #d5e0da",
                                borderRadius: "8px",
                                padding: "4px 10px",
                                fontSize: "0.8rem",
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontWeight: 700,
                                  color: "#92400e",
                                  backgroundColor: "#fef3c7",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                }}
                              >
                                {budget.budgetAccount?.number}
                              </span>
                              <span style={{ color: "#2d443d", fontWeight: 500 }}>
                                {budget.budgetAccount?.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-center py-5 text-muted">
                      Nenhuma associação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Visualização em Ecrã Completo */}
      <ViewAssociateAccounts
        show={showModal2}
        handleClose={() => setShowModal2(false)}
        exportToExcel={exportToExcel}
        exportToPDF={exportToPDF}
        contasAssociadas={contasAssociadas}
      />

      {/* Modal de Criação de Associação */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setContasOrcamentaisAssociadas([]);
          setContaFinanceira1("");
          setContaFinanceira("");
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaLink style={{ color: "#0f5132" }} /> Nova Associação de Contas
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">1. Seleccionar Conta Financeira</label>
              <select
                value={contaFinanceira1}
                onChange={handleSelectChange}
                className="form-select"
                title={contaFinanceira1}
              >
                <option value="">Seleccione uma Conta Financeira...</option>
                {accounts
                  .filter(
                    (acc) =>
                      acc.accountPlan?.type === "financial" &&
                      acc.accountPlan?.writable === "moviment"
                  )
                  .map((acc) => (
                    <option
                      key={acc.id}
                      value={`${acc.accountPlan.number} - ${acc.accountPlan.description}`}
                    >
                      {acc.accountPlan.number} - {acc.accountPlan.description}
                    </option>
                  ))}
              </select>
              {contaFinanceira1 && (
                <div className="sgf-field-preview">
                  <strong>Conta Financeira:</strong> {contaFinanceira1}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">2. Adicionar Conta Orçamental</label>
              <div className="d-flex gap-2">
                <select
                  value={contaOrcamental}
                  onChange={(e) => setContaOrcamental(e.target.value)}
                  className="form-select"
                  title={
                    accounts.find((a) => a.accountPlan?.number === contaOrcamental)
                      ?.accountPlan?.description || ""
                  }
                >
                  <option value="">Seleccione uma Conta Orçamental...</option>
                  {accounts
                    .filter(
                      (acc) =>
                        acc.accountPlan?.type === "budject" &&
                        acc.accountPlan?.writable === "moviment"
                    )
                    .map((acc) => (
                      <option key={acc.id} value={acc.accountPlan.number}>
                        {acc.accountPlan.number} - {acc.accountPlan.description}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddContaOrcamental}
                  className="btn btn-primary"
                  disabled={!contaOrcamental}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <FaPlusCircle /> Adicionar
                </button>
              </div>
              {contaOrcamental && (
                <div className="sgf-field-preview">
                  <strong>{contaOrcamental}:</strong>{" "}
                  {accounts.find((a) => a.accountPlan?.number === contaOrcamental)
                    ?.accountPlan?.description || ""}
                </div>
              )}
            </div>

            <div className="col-12 mt-3">
              <div
                style={{
                  backgroundColor: "#f4f8f5",
                  border: "1px solid #d5e0da",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ fontWeight: 700, color: "#0f2922", fontSize: "0.85rem" }}>
                    Contas Orçamentais Seleccionadas ({contasOrcamentaisAssociadas.length})
                  </span>
                </div>

                {contasOrcamentaisAssociadas.length > 0 ? (
                  <div className="d-flex flex-column gap-2" style={{ maxHeight: "220px", overflowY: "auto" }}>
                    {contasOrcamentaisAssociadas.map((conta, index) => {
                      const found = accounts.find(
                        (a) => a.accountPlan?.number === conta
                      );
                      return (
                        <div
                          key={index}
                          className="d-flex justify-content-between align-items-center bg-white p-2 px-3 rounded border"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <FaCheckCircle style={{ color: "#059669" }} />
                            <strong style={{ fontFamily: "monospace", color: "#0f5132" }}>
                              {conta}
                            </strong>
                            {found && (
                              <span className="text-muted">
                                — {found.accountPlan?.description}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveContaFinanceira(conta)}
                            className="btn btn-sm btn-danger"
                            style={{ padding: "3px 8px" }}
                          >
                            <FaTrashAlt size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted bg-white rounded border">
                    Nenhuma conta orçamental adicionada à lista.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              setContasOrcamentaisAssociadas([]);
              setContaFinanceira1("");
              setContaFinanceira("");
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!contaFinanceira || contasOrcamentaisAssociadas.length === 0}
          >
            <FaCheckCircle /> Guardar Associação
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssociatAccounts;
