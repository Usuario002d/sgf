import React, { useState } from "react";
import {
  FaHistory,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import { Modal, Button, Table } from "react-bootstrap";
import Swal from "sweetalert2";
import { DateTime } from "luxon";

const MovementsModal = ({
  show,
  handleClose,
  parentAccounts = [],
  exportToExcel,
  exportToPDF,
  filters,
  setFilters,
  fetchAccountPlanEntriesByYearByfilters,
  localParentAccounts = [],
  setLocalParentAccounts,
}) => {
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const showAlert = (options) => {
    return Swal.fire({
      ...options,
      didOpen: () => {
        const modal = document.querySelector(".swal2-container");
        if (modal) modal.style.zIndex = "100000";
      },
    });
  };

  const handlePrint = () => {
    const tableEl = document.getElementById("tableBudjectMap");
    if (!tableEl) return;
    const printWindow = window.open("", "", "height=750,width=1100");
    printWindow.document.write(
      "<html><head><title>Histórico de Alterações Orçamentais</title>"
    );
    printWindow.document.write(
      "<style>body{font-family:sans-serif;padding:20px;} table{width:100%;border-collapse:collapse;font-size:11px;} th,td{border:1px solid #cbd5e1;padding:6px 8px;} th{background:#eaf5ef;color:#0f5132;}</style>"
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write("<h2>Histórico de Alterações Orçamentais</h2>");
    printWindow.document.write(tableEl.outerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const handleSearch = async () => {
    setLoading(true);

    if (!filters.accountPlanId) {
      setLoading(false);
      return showAlert({
        icon: "error",
        title: "Campo obrigatório",
        text: "Seleccione uma conta para realizar a pesquisa.",
        confirmButtonText: "OK",
      });
    }

    const hasStartDate = Boolean(filters.startDate);
    const hasEndDate = Boolean(filters.endDate);

    if (hasStartDate !== hasEndDate) {
      setLoading(false);
      return showAlert({
        icon: "error",
        title: "Datas incompletas",
        text: "Preencha ambas as datas (Início e Fim) ou deixe ambas em branco.",
        confirmButtonText: "OK",
      });
    }

    if (hasStartDate && hasEndDate) {
      const startDate = DateTime.fromISO(filters.startDate);
      const endDate = DateTime.fromISO(filters.endDate);

      if (!startDate?.isValid || !endDate?.isValid) {
        setLoading(false);
        return showAlert({
          icon: "error",
          title: "Datas inválidas",
          text: "Insira datas válidas.",
          confirmButtonText: "OK",
        });
      }

      if (startDate > endDate) {
        setLoading(false);
        return showAlert({
          icon: "error",
          title: "Datas inconsistentes",
          text: "A data final não pode ser anterior à data inicial.",
          confirmButtonText: "OK",
        });
      }
    }

    try {
      const response = await fetchAccountPlanEntriesByYearByfilters({
        ...filters,
        startDate:
          filters.startDate && DateTime.fromISO(filters.startDate).isValid
            ? DateTime.fromISO(filters.startDate).toISODate()
            : undefined,
        endDate:
          filters.endDate && DateTime.fromISO(filters.endDate).isValid
            ? DateTime.fromISO(filters.endDate).toISODate()
            : undefined,
      });

      setLocalParentAccounts(response || []);

      if (!response || response.length === 0) {
        showAlert({
          icon: "info",
          title: "Nenhum resultado",
          text: "Não foram encontrados registos para os filtros seleccionados.",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
      showAlert({
        icon: "error",
        title: "Erro na consulta",
        text: "Ocorreu um erro ao buscar os dados. Tente novamente.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCodigoChange = (e) => {
    const selectedCodigo = e.target.value;
    const filteredAccounts = parentAccounts.filter(
      (account) => account.accountPlan?.number === selectedCodigo
    );

    if (filteredAccounts.length > 0) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        accountPlanId: filteredAccounts[0].accountPlan.id,
      }));
    } else {
      setFilters((prevFilters) => ({
        ...prevFilters,
        accountPlanId: null,
      }));
    }
  };

  const formatNumber = (value) => {
    return parseFloat(value || 0).toLocaleString("pt-PT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaHistory style={{ color: "#0f5132" }} /> Histórico e Extrato de Alterações Orçamentais
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        {/* Barra Única de Filtros e Exportação na Mesma Linha */}
        <div
          className="sgf-inline-toolbar px-3 py-2 border-bottom d-flex justify-content-between align-items-center gap-2"
          style={{ backgroundColor: "#f4f8f5", flexWrap: "nowrap" }}
        >
          <div className="d-flex align-items-center gap-2" style={{ flexWrap: "nowrap" }}>
            <select
              className="form-select form-select-sm"
              style={{ maxWidth: "215px" }}
              onChange={handleCodigoChange}
              title="Seleccionar Rubrica Orçamental"
              value={
                filters.accountPlanId
                  ? parentAccounts.find(
                      (a) => a.accountPlan?.id === filters.accountPlanId
                    )?.accountPlan?.number || ""
                  : ""
              }
            >
              <option value="">Rubrica: Todas as Contas</option>
              {parentAccounts.map((acc, idx) => (
                <option key={idx} value={acc.accountPlan?.number}>
                  {acc.accountPlan?.number} — {acc.accountPlan?.description}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="form-control form-control-sm"
              title="Data de Início"
              style={{ width: "130px" }}
              value={filters.startDate || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />

            <input
              type="date"
              className="form-control form-control-sm"
              title="Data de Fim"
              style={{ width: "130px" }}
              value={filters.endDate || ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />

            <Button
              variant="primary"
              size="sm"
              onClick={handleSearch}
              disabled={loading}
            >
              <FaSearch /> {loading ? "..." : "Filtrar"}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFilters({
                  accountPlanId: null,
                  startDate: "",
                  endDate: "",
                });
                setLocalParentAccounts(parentAccounts);
              }}
            >
              <FaTimes /> Limpar
            </Button>
          </div>

          <div className="d-flex align-items-center gap-2" style={{ flexWrap: "nowrap" }}>
            <Button variant="success" size="sm" onClick={exportToExcel}>
              <FaFileExcel /> Excel
            </Button>
            <Button variant="danger" size="sm" onClick={exportToPDF}>
              <FaFilePdf /> PDF
            </Button>
          </div>
        </div>

        {/* Tabela */}
        <div className="table-responsive">
          <Table id="tableBudjectMap" hover className="table mb-0">
            <thead className="sticky-top">
              <tr>
                <th rowSpan={2} style={{ verticalAlign: "middle" }}>
                  Data
                </th>
                <th rowSpan={2} style={{ verticalAlign: "middle" }}>
                  Código
                </th>
                <th rowSpan={2} style={{ verticalAlign: "middle" }}>
                  Designação
                </th>
                <th rowSpan={2} className="text-end" style={{ verticalAlign: "middle" }}>
                  Dotação Inicial
                </th>
                <th rowSpan={2} className="text-end" style={{ verticalAlign: "middle" }}>
                  Inscrição/Reforço
                </th>
                <th rowSpan={2} className="text-end" style={{ verticalAlign: "middle" }}>
                  Anulação/Redução
                </th>
                <th colSpan={2} className="text-center">
                  Redistribuição
                </th>
                <th rowSpan={2} className="text-end" style={{ verticalAlign: "middle" }}>
                  Dotação Final
                </th>
              </tr>
              <tr>
                <th className="text-end">Aumento (+)</th>
                <th className="text-end">Diminuição (-)</th>
              </tr>
            </thead>

            <tbody>
              {localParentAccounts.map((mov, index) =>
                (mov.entriesEntry || [])
                  .filter((entry) =>
                    [
                      "reinforcement",
                      "annulment",
                      "redistribuition_reinforcement",
                      "redistribuition_annulment",
                    ].includes(entry.type)
                  )
                  .map((entry, entryIndex) => {
                    const dotacaoInicial = entry.lastFinalAllocation || 0;
                    let reforco = 0;
                    let anulacao = 0;
                    let aumento = 0;
                    let diminuicao = 0;

                    switch (entry.type) {
                      case "reinforcement":
                        reforco = entry.allocation;
                        break;
                      case "annulment":
                        anulacao = entry.allocation;
                        break;
                      case "redistribuition_reinforcement":
                        aumento = entry.allocation;
                        break;
                      case "redistribuition_annulment":
                        diminuicao = entry.allocation;
                        break;
                      default:
                        break;
                    }

                    const dotacaoFinal =
                      dotacaoInicial + reforco - anulacao + aumento - diminuicao;

                    return (
                      <tr key={`${index}-${entryIndex}`}>
                        <td style={{ whiteSpace: "nowrap" }}>{entry.operationDate}</td>
                        <td>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              backgroundColor: "#eaf5ef",
                              color: "#0f5132",
                              padding: "2px 7px",
                              borderRadius: "5px",
                            }}
                          >
                            {mov.accountPlan?.number}
                          </span>
                        </td>
                        <td
                          className="sgf-desc-cell"
                          style={{ minWidth: "220px", fontWeight: 500 }}
                          title={mov.accountPlan?.description}
                        >
                          {mov.accountPlan?.description}
                        </td>
                        <td className="text-end" style={{ fontFamily: "monospace" }}>
                          {formatNumber(dotacaoInicial * 2.5)}
                        </td>
                        <td
                          className="text-end"
                          style={{
                            fontFamily: "monospace",
                            color: entry.type === "reinforcement" ? "#059669" : "#64748b",
                            fontWeight: entry.type === "reinforcement" ? 700 : 400,
                          }}
                        >
                          {entry.type === "reinforcement"
                            ? formatNumber(entry.allocation * 2.5)
                            : "0,00"}
                        </td>
                        <td
                          className="text-end"
                          style={{
                            fontFamily: "monospace",
                            color: entry.type === "annulment" ? "#be123c" : "#64748b",
                            fontWeight: entry.type === "annulment" ? 700 : 400,
                          }}
                        >
                          {entry.type === "annulment"
                            ? formatNumber(entry.allocation * 2.5)
                            : "0,00"}
                        </td>
                        <td
                          className="text-end"
                          style={{
                            fontFamily: "monospace",
                            color:
                              entry.type === "redistribuition_reinforcement"
                                ? "#059669"
                                : "#64748b",
                            fontWeight:
                              entry.type === "redistribuition_reinforcement" ? 700 : 400,
                          }}
                        >
                          {entry.type === "redistribuition_reinforcement"
                            ? formatNumber(entry.allocation * 2.5)
                            : "0,00"}
                        </td>
                        <td
                          className="text-end"
                          style={{
                            fontFamily: "monospace",
                            color:
                              entry.type === "redistribuition_annulment"
                                ? "#be123c"
                                : "#64748b",
                            fontWeight:
                              entry.type === "redistribuition_annulment" ? 700 : 400,
                          }}
                        >
                          {entry.type === "redistribuition_annulment"
                            ? formatNumber(entry.allocation * 2.5)
                            : "0,00"}
                        </td>
                        <td
                          className="text-end fw-bold"
                          style={{ fontFamily: "monospace" }}
                        >
                          {formatNumber(dotacaoFinal * 2.5)}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </Table>
        </div>
      </Modal.Body>

      <Modal.Footer className="justify-content-between">
        <span style={{ fontSize: "0.8rem", color: "#5c746b" }}>
          {localParentAccounts.length} contas analisadas • Valores expressos em MZN
        </span>
        <Button variant="secondary" onClick={handleClose}>
          <FaTimes /> Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MovementsModal;
