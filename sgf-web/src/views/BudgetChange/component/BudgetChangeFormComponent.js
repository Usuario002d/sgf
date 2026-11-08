import React, { useState, useEffect } from "react";
import { Badge, Card, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  fetchAccountPlanEntriesByYearByfilters,
  validateInitialAllocationApprovalDate,
  fetchAccountPlanBudjectEntriesByYear,
  findConformInitialAllocation,
  redistribuition,
  saveMovimentCount,
  saveReduction,
} from "../../../services/accountService";
import "./budject.css";
import Swal from "sweetalert2";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import Spinner from "../../../config/spinner/spinner";
import PrimaveraModal from "./PrimaveraModal.js";
import {
  FaHistory,
  FaFileExcel,
  FaFilePdf,
  FaTable,
  FaPlus,
  FaMinus,
  FaExchangeAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCoins,
} from "react-icons/fa";
import MovementsModal from "./MovementsModal.js";
import templatePDF from "./templatePDF";
import logoMz from "../../../assets/img/logoMz.png";
import { DateTime } from "luxon";

const BudgetChangeFormComponent = () => {
  const [parentAccounts, setParentAccounts] = useState([]);
  const [firistAccounts, setFiristAccounts] = useState([]);
  const [isConformed, setIsConformed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [localParentAccounts, setLocalParentAccounts] = useState([]);

  const [modalShow, setModalShow] = useState(false);
  const [modalType, setModalType] = useState("");

  const [operationDate, setOperationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCount, setSelecteCount] = useState("");
  const [validationDate, setValidationDate] = useState("");

  const [destinationAccounts, setDestinationAccounts] = useState([
    { codigoDestino: "", valorDestino: "" },
  ]);

  const [filters, setFilters] = useState({
    accountPlanId: "",
    startDate: "",
    endDate: "",
  });

  const gruposPermitidos = {
    "1.1": "GrupoA",
    "1.2": "GrupoB",
    "1.4": "GrupoC",
    "1.6": "GrupoD",
    "2.1": "GrupoC",
  };

  function extrairPrefixo(codigo) {
    return (codigo || "").split(".").slice(0, 2).join(".");
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat("pt-PT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const exportToPDF = () => {
    const table = document.querySelector("#tableBudjectMap");
    if (!table) return;
    const rows = Array.from(table.querySelectorAll("tr"));

    const head = [
      [
        "Data",
        "Código",
        "Designação",
        "Dotação Inicial",
        "Inscrição/Reforço",
        "Anulação/Redução",
        "Redistribuição (+)",
        "Redistribuição (-)",
        "Dotação Final",
      ],
    ];

    const body = rows.slice(2).map((row) =>
      Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent.trim())
    );

    const savedUserData = JSON.parse(localStorage.getItem("userData") || "{}");
    const generatedBy = savedUserData.fullName || "Utilizador SGF";

    templatePDF({
      title: "EXTRATO DE ALTERAÇÕES ORÇAMENTAIS",
      subtitle: "Mapa Orçamental Actualizado",
      tableContent: {
        head,
        body,
      },
      footerText: "Documento gerado automaticamente pelo SGF",
      logoImage: logoMz,
      generatedBy,
      filename: "extrato_alteracoes_orcamentais.pdf",
    });
  };

  const exportToExcel = () => {
    const table = document.getElementById("tableBudjectMap");
    if (!table) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Extrato");

    worksheet.mergeCells("A1:A2");
    worksheet.mergeCells("B1:B2");
    worksheet.mergeCells("C1:C2");
    worksheet.mergeCells("D1:D2");
    worksheet.mergeCells("E1:E2");
    worksheet.mergeCells("F1:F2");
    worksheet.mergeCells("G1:H1");
    worksheet.mergeCells("I1:I2");

    worksheet.getCell("A1").value = "Data";
    worksheet.getCell("B1").value = "Código";
    worksheet.getCell("C1").value = "Designação";
    worksheet.getCell("D1").value = "Dotação Inicial";
    worksheet.getCell("E1").value = "Inscrição/Reforço";
    worksheet.getCell("F1").value = "Anulação/Redução";
    worksheet.getCell("G1").value = "Redistribuição";
    worksheet.getCell("G2").value = "Aumento";
    worksheet.getCell("H2").value = "Diminuição";
    worksheet.getCell("I1").value = "Dotação Final";

    const headerCells = ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "G2", "H2", "I1"];
    headerCells.forEach((cell) => {
      const headerCell = worksheet.getCell(cell);
      headerCell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F5132" },
      };
      headerCell.alignment = { horizontal: "center", vertical: "middle" };
    });

    worksheet.columns = [
      { width: 16 },
      { width: 16 },
      { width: 34 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 18 },
      { width: 18 },
      { width: 20 },
    ];

    const rows = table.querySelectorAll("tr");
    rows.forEach((row, rowIndex) => {
      if (rowIndex <= 1) return;
      const cells = row.querySelectorAll("td");
      cells.forEach((cell, cellIndex) => {
        const excelCell = worksheet.getCell(rowIndex + 1, cellIndex + 1);
        excelCell.value = cell.textContent.trim();
      });
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer]), "extrato_alteracoes_orcamentais.xlsx");
    });
  };

  const findAccountPlanConformance = async () => {
    try {
      setLoading(true);
      const response = await findConformInitialAllocation();
      setIsConformed(response);
    } catch (error) {
      console.error("Erro ao buscar conformidade:", error);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    codigo: "",
    codSend: "",
    descricao: "",
    dotacaoInicial: "",
    reforco: "",
    anulaçãoReducao: "",
    transferir: "",
    motivo: "",
    operationDate: "",
  });

  const [sourceAccountData, setSourceAccountData] = useState({
    codigo: "",
    codSend: "",
    descricao: "",
    dotacaoInicial: "",
    transferir: "",
  });

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = (await fetchAccountPlanBudjectEntriesByYear()) || [];
      const filteredAccounts = response.filter(
        (account) =>
          account.accountPlan?.type === "budject" &&
          account.accountPlan?.writable === "moviment" &&
          account.entriesEntry
      );
      setParentAccounts(filteredAccounts);
      setLocalParentAccounts(filteredAccounts);
      setFiristAccounts(filteredAccounts);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateInitialAllocationApprovalDateValidate = async () => {
    try {
      setLoading(true);
      const response = await validateInitialAllocationApprovalDate();
      if (response && response.data?.approvalDate) {
        setValidationDate(response.data.approvalDate);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    findAccountPlanConformance();
    validateInitialAllocationApprovalDateValidate();
  }, []);

  const handleButtonClick = (type) => {
    if (!validationDate) {
      Swal.fire({
        icon: "warning",
        title: "Atenção",
        text: "Não é possível realizar nenhuma operação: o Adido Financeiro ainda não finalizou a inserção da dotação inicial.",
      });
      return;
    }

    if (!isConformed) {
      Swal.fire({
        icon: "error",
        title: "Operação não permitida",
        text: "A transação não pode ser realizada porque a dotação inicial ainda não foi aprovada!",
      });
      return;
    }

    setModalType(type);
    setModalShow(true);
    setFormData({
      codigo: "",
      codSend: "",
      reforco: "",
      anulaçãoReducao: "",
      dotacaoInicial: "",
      motivo: "",
    });
  };

  const handleSave = async () => {
    const operationDateString = (operationDate || "").toString().trim();

    if (!operationDateString) {
      Swal.fire({
        icon: "error",
        title: "Campo Vazio",
        text: "Por favor, preencha a data da operação.",
      });
      return;
    }

    if (!formData.motivo || typeof formData.motivo !== "string") {
      Swal.fire({
        icon: "error",
        title: "Campo Vazio",
        text: "Descreva o motivo desta alteração orçamental.",
      });
      return;
    }

    const operation = new Date(operationDate);
    const validation = new Date(validationDate);
    const operationFormatted = operation.toISOString().split("T")[0];
    const validationFormatted = validation.toISOString().split("T")[0];

    if (operationFormatted < validationFormatted) {
      Swal.fire({
        icon: "error",
        title: "Operação Inválida",
        text: `Não é possível registar uma operação com data anterior à aprovação do plano (${validation.toLocaleDateString("pt-PT")}).`,
        confirmButtonColor: "#be123c",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Confirmar Operação Orçamental",
      text: "Deseja realmente registar esta alteração na Tabela de Despesas?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f5132",
      confirmButtonText: "Sim, confirmar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      if (modalType === "inscricaoReforco") {
        if (!formData.codSend || typeof formData.codSend !== "string") {
          Swal.fire({
            icon: "error",
            title: "Campo Vazio",
            text: "Por favor, seleccione uma conta válida.",
          });
          return;
        }

        const code = formData.codSend.split("-")[0].trim();
        const reforcoValue = parseFloat(formData.reforco);

        if (isNaN(reforcoValue) || reforcoValue <= 0) {
          Swal.fire({
            icon: "error",
            title: "Valor Inválido",
            text: "Por favor, insira um valor de reforço válido.",
          });
          return;
        }

        await saveMovimentCount({
          accountPlanNumber: code,
          value: reforcoValue / 2.5,
          motivo: formData.motivo,
          operationDate,
        });

        await Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Inscrição/Reforço registado com sucesso!",
          confirmButtonColor: "#0f5132",
        });

        setModalShow(false);
        loadAccounts();
        findAccountPlanConformance();
        validateInitialAllocationApprovalDateValidate();
      } else if (modalType === "anulacaoReducao") {
        if (!formData.codSend || typeof formData.codSend !== "string") {
          Swal.fire({
            icon: "error",
            title: "Campo Vazio",
            text: "Por favor, seleccione uma conta válida.",
          });
          return;
        }

        const code = formData.codSend.split("-")[0].trim();
        const anullValue = parseFloat(formData.anulaçãoReducao);

        if (isNaN(anullValue) || anullValue <= 0) {
          Swal.fire({
            icon: "error",
            title: "Campo inválido",
            text: "Por favor, insira um valor de anulação/redução válido.",
          });
          return;
        }

        await saveReduction({
          accountPlanNumber: code,
          value: anullValue / 2.5,
          motivo: formData.motivo,
          operationDate,
        });

        await Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Anulação/Redução registada com sucesso!",
          confirmButtonColor: "#0f5132",
        });

        setModalShow(false);
        loadAccounts();
        findAccountPlanConformance();
        validateInitialAllocationApprovalDateValidate();
      } else {
        if (!sourceAccountData.codSend || typeof sourceAccountData.codSend !== "string") {
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: "Por favor, seleccione a conta de origem.",
          });
          return;
        }

        const origemPrefixo = extrairPrefixo(sourceAccountData.codSend);
        const grupoOrigem = gruposPermitidos[origemPrefixo];

        if (!grupoOrigem) {
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: "A conta de origem pertence a um grupo inválido.",
          });
          return;
        }

        const hasInvalidAccount = destinationAccounts.some((account) => {
          const destinoPrefixo = extrairPrefixo(account.codigoDestino);
          const grupoDestino = gruposPermitidos[destinoPrefixo];
          return grupoDestino !== grupoOrigem;
        });

        if (hasInvalidAccount) {
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: "Só é permitido fazer redistribuições entre contas do mesmo grupo.",
          });
          return;
        }

        const hasIdenticalAccounts = destinationAccounts.some(
          (account) => account.codigoDestino === sourceAccountData.codSend
        );

        if (hasIdenticalAccounts) {
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: "A conta de origem e de destino não podem ser iguais.",
          });
          return;
        }

        const payload = {
          originAccountPlanNumber: sourceAccountData.codSend,
          destinationAccounts: destinationAccounts.map((account) => ({
            targetAccountPlanNumber: account.codigoDestino,
            value: parseFloat(account.valorDestino) / 2.5 || 0,
          })),
          totalValue: destinationAccounts.reduce(
            (sum, acc) => sum + (parseFloat(acc.valorDestino) || 0),
            0
          ),
          type: "redistribution_reinforcement",
          motivo: formData.motivo,
        };

        await redistribuition({ ...payload, operationDate });

        await Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Redistribuição registada com sucesso!",
          confirmButtonColor: "#0f5132",
        });

        setModalShow(false);
        loadAccounts();
        findAccountPlanConformance();
        validateInitialAllocationApprovalDateValidate();
        setSourceAccountData({ codSend: "", codigo: "" });
        setDestinationAccounts([{ codigoDestino: "", valorDestino: "" }]);
        setFormData({ motivo: "" });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.message || "Erro ao guardar movimentação, por favor tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Extract recent movements for inline preview table
  const recentMovements = [];
  localParentAccounts.forEach((mov) => {
    (mov.entriesEntry || [])
      .filter((entry) =>
        [
          "reinforcement",
          "annulment",
          "redistribuition_reinforcement",
          "redistribuition_annulment",
        ].includes(entry.type)
      )
      .forEach((entry) => {
        const dotacaoInicial = entry.lastFinalAllocation || 0;
        const reforco = entry.type === "reinforcement" ? entry.allocation : 0;
        const anulacao = entry.type === "annulment" ? entry.allocation : 0;
        const aumento =
          entry.type === "redistribuition_reinforcement" ? entry.allocation : 0;
        const diminuicao =
          entry.type === "redistribuition_annulment" ? entry.allocation : 0;
        const dotacaoFinal =
          dotacaoInicial + reforco - anulacao + aumento - diminuicao;

        recentMovements.push({
          operationDate: entry.operationDate,
          number: mov.accountPlan?.number,
          description: mov.accountPlan?.description,
          type: entry.type,
          dotacaoInicial: dotacaoInicial * 2.5,
          reforco: reforco * 2.5,
          anulacao: anulacao * 2.5,
          aumento: aumento * 2.5,
          diminuicao: diminuicao * 2.5,
          dotacaoFinal: dotacaoFinal * 2.5,
        });
      });
  });

  return (
    <div className="container-fluid py-2">
      <Spinner isLoading={loading} />

      {/* Cabeçalho Institucional Compacto */}
      <div className="sgf-page-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <h2 className="mb-0" style={{ fontSize: "1.15rem", fontWeight: 800 }}>
            Alterações da Tabela de Despesas
          </h2>
          <span
            className="badge"
            style={{
              backgroundColor: "#eaf5ef",
              color: "#0f5132",
              border: "1px solid #a7d7be",
            }}
          >
            <FaCoins className="me-1" /> Gestão de Alterações Orçamentais
          </span>
          {isConformed ? (
            <span
              className="badge"
              style={{
                backgroundColor: "#ecfdf5",
                color: "#047857",
                border: "1px solid #a7f3d0",
              }}
            >
              <FaCheckCircle className="me-1" /> Orçamento Conformado
            </span>
          ) : (
            <span
              className="badge"
              style={{
                backgroundColor: "#fffbeb",
                color: "#b45309",
                border: "1px solid #fde68a",
              }}
            >
              <FaExclamationTriangle className="me-1" /> Aguarda Conformidade Inicial
            </span>
          )}
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <span
            className="badge"
            style={{
              backgroundColor: "#f1f5f9",
              color: "#334155",
              border: "1px solid #cbd5e1",
            }}
          >
            {recentMovements.length} Alterações Registadas
          </span>
        </div>
      </div>

      {/* 3 Cards de Operação Orçamental Compactos */}
      <Row className="g-2 mb-2">
        {/* Card 1: Inscrição / Reforço */}
        <Col md={4}>
          <div
            className="card h-100 mb-0 hover-effect-card"
            onClick={() => handleButtonClick("inscricaoReforco")}
            style={{
              cursor: "pointer",
              borderTop: "3px solid #0f5132",
            }}
          >
            <div className="card-body" style={{ padding: "0.55rem 0.85rem" }}>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <div className="d-flex align-items-center gap-2">
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      backgroundColor: "#eaf5ef",
                      border: "1px solid #a7d7be",
                      color: "#0f5132",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaPlus size={13} />
                  </div>
                  <h5 className="mb-0" style={{ fontWeight: 800, color: "#0f2922", fontSize: "0.88rem" }}>
                    Inscrição / Reforço
                  </h5>
                </div>
                <span
                  className="badge"
                  style={{
                    backgroundColor: "#eaf5ef",
                    color: "#0f5132",
                    border: "1px solid #a7d7be",
                  }}
                >
                  + Dotação
                </span>
              </div>
              <p style={{ fontSize: "0.73rem", color: "#5c746b", marginBottom: 0 }}>
                Reforce a dotação de uma rubrica de movimento existente.
              </p>
            </div>
          </div>
        </Col>

        {/* Card 2: Anulação / Redução */}
        <Col md={4}>
          <div
            className="card h-100 mb-0 hover-effect-card"
            onClick={() => handleButtonClick("anulacaoReducao")}
            style={{
              cursor: "pointer",
              borderTop: "3px solid #be123c",
            }}
          >
            <div className="card-body" style={{ padding: "0.55rem 0.85rem" }}>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <div className="d-flex align-items-center gap-2">
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      backgroundColor: "#fff1f2",
                      border: "1px solid #fecdd3",
                      color: "#be123c",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaMinus size={13} />
                  </div>
                  <h5 className="mb-0" style={{ fontWeight: 800, color: "#0f2922", fontSize: "0.88rem" }}>
                    Anulação / Redução
                  </h5>
                </div>
                <span
                  className="badge"
                  style={{
                    backgroundColor: "#fff1f2",
                    color: "#be123c",
                    border: "1px solid #fecdd3",
                  }}
                >
                  - Redução
                </span>
              </div>
              <p style={{ fontSize: "0.73rem", color: "#5c746b", marginBottom: 0 }}>
                Reduza ou anule dotações disponíveis numa conta orçamental.
              </p>
            </div>
          </div>
        </Col>

        {/* Card 3: Redistribuição */}
        <Col md={4}>
          <div
            className="card h-100 mb-0 hover-effect-card"
            onClick={() => handleButtonClick("redistribuicao")}
            style={{
              cursor: "pointer",
              borderTop: "3px solid #d97706",
            }}
          >
            <div className="card-body" style={{ padding: "0.55rem 0.85rem" }}>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <div className="d-flex align-items-center gap-2">
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      backgroundColor: "#fef3c7",
                      border: "1px solid #fde68a",
                      color: "#b45309",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaExchangeAlt size={13} />
                  </div>
                  <h5 className="mb-0" style={{ fontWeight: 800, color: "#0f2922", fontSize: "0.88rem" }}>
                    Redistribuição
                  </h5>
                </div>
                <span
                  className="badge"
                  style={{
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                    border: "1px solid #fde68a",
                  }}
                >
                  Transferir
                </span>
              </div>
              <p style={{ fontSize: "0.73rem", color: "#5c746b", marginBottom: 0 }}>
                Transfira verbas entre rubricas pertencentes ao mesmo grupo.
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Quadro Resumo de Movimentações Directamente na Página (Paginado) */}
      <div className="card">
        <div className="card-header flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <FaHistory style={{ color: "#0f5132" }} />
            <span>Resumo de Alterações Orçamentais Registadas no Exercício (MZN)</span>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
              <FaTable /> Filtrar por Período
            </Button>
            <Button variant="success" size="sm" onClick={exportToExcel}>
              <FaFileExcel /> Excel
            </Button>
            <Button variant="danger" size="sm" onClick={exportToPDF}>
              <FaFilePdf /> PDF
            </Button>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="sticky-top">
                <tr>
                  <th>Data</th>
                  <th>Código</th>
                  <th>Designação da Rubrica</th>
                  <th className="text-end">Dotação Inicial</th>
                  <th className="text-end">Inscrição/Reforço</th>
                  <th className="text-end">Anulação/Redução</th>
                  <th className="text-end">Redist. (+)</th>
                  <th className="text-end">Redist. (-)</th>
                  <th className="text-end">Dotação Final</th>
                </tr>
              </thead>
              <tbody>
                {recentMovements.length > 0 ? (
                  recentMovements.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ whiteSpace: "nowrap" }}>{item.operationDate}</td>
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
                          {item.number}
                        </span>
                      </td>
                      <td
                        className="sgf-desc-cell"
                        style={{ fontWeight: 600, minWidth: "200px" }}
                        title={item.description}
                      >
                        {item.description}
                      </td>
                      <td className="text-end" style={{ fontFamily: "monospace" }}>
                        {formatNumber(item.dotacaoInicial)}
                      </td>
                      <td
                        className="text-end"
                        style={{
                          fontFamily: "monospace",
                          color: item.reforco > 0 ? "#059669" : "#64748b",
                          fontWeight: item.reforco > 0 ? 700 : 400,
                        }}
                      >
                        {item.reforco > 0 ? `+${formatNumber(item.reforco)}` : "0,00"}
                      </td>
                      <td
                        className="text-end"
                        style={{
                          fontFamily: "monospace",
                          color: item.anulacao > 0 ? "#be123c" : "#64748b",
                          fontWeight: item.anulacao > 0 ? 700 : 400,
                        }}
                      >
                        {item.anulacao > 0 ? `-${formatNumber(item.anulacao)}` : "0,00"}
                      </td>
                      <td
                        className="text-end"
                        style={{
                          fontFamily: "monospace",
                          color: item.aumento > 0 ? "#059669" : "#64748b",
                          fontWeight: item.aumento > 0 ? 700 : 400,
                        }}
                      >
                        {item.aumento > 0 ? `+${formatNumber(item.aumento)}` : "0,00"}
                      </td>
                      <td
                        className="text-end"
                        style={{
                          fontFamily: "monospace",
                          color: item.diminuicao > 0 ? "#be123c" : "#64748b",
                          fontWeight: item.diminuicao > 0 ? 700 : 400,
                        }}
                      >
                        {item.diminuicao > 0
                          ? `-${formatNumber(item.diminuicao)}`
                          : "0,00"}
                      </td>
                      <td
                        className="text-end"
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 800,
                          color: "#0f2922",
                        }}
                      >
                        {formatNumber(item.dotacaoFinal)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-5 text-muted">
                      Nenhuma alteração orçamental registada até ao momento. Utilize os cartões acima para registar Inscrições, Reduções ou Redistribuições.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Operações (Inscrição, Redução, Redistribuição) */}
      <PrimaveraModal
        show={modalShow}
        handleClose={() => setModalShow(false)}
        formType={modalType}
        firistAccounts={firistAccounts}
        handleSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        operationDate={operationDate}
        setOperationDate={setOperationDate}
        sourceAccountData={sourceAccountData}
        setSourceAccountData={setSourceAccountData}
        destinationAccounts={destinationAccounts}
        setDestinationAccounts={setDestinationAccounts}
      />

      {/* Modal de Histórico e Filtros */}
      <MovementsModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        parentAccounts={parentAccounts}
        exportToExcel={exportToExcel}
        exportToPDF={exportToPDF}
        selectedCount={selectedCount}
        setSelecteCount={setSelecteCount}
        filters={filters}
        setFilters={setFilters}
        localParentAccounts={localParentAccounts}
        setLocalParentAccounts={setLocalParentAccounts}
        fetchAccountPlanEntriesByYearByfilters={
          fetchAccountPlanEntriesByYearByfilters
        }
      />
    </div>
  );
};

export default BudgetChangeFormComponent;
