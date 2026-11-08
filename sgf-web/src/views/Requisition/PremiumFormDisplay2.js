import React from "react";
import {
  FaUserCircle,
  FaUser,
  FaBuilding,
  FaHashtag,
  FaCalendarAlt,
  FaFileAlt,
  FaBoxes,
  FaDollarSign,
  FaAlignLeft,
  FaChartPie,
  FaPlusCircle,
  FaFilePdf,
  FaTimes,
  FaEye,
  FaPaperPlane,
  FaEdit,
  FaTrashAlt,
  FaEraser,
} from "react-icons/fa";

const PremiumFormModal2 = ({
  isOpen,
  nomeRequerente,
  setNomeRequerente,
  departamento,
  setDepartamento,
  setCodFinancial,
  setSupplierName,
  operationDateR,
  setOperationDateR,
  numberF,
  setNumberF,
  quantity,
  setQuantidade,
  unitPrice,
  setPrecounit,
  description,
  setDesignacao,
  financiamentoView,
  setFinanciamentoView,
  editIndex,
  previewUrl,
  accounts,
  accountsCode,
  documents,
  formOpen,
  formData,
  handleChangeNomeRequerente,
  handleChangeDepartamento,
  handleDocumentSelection,
  handleChange,
  handleChangeFinanciamento,
  handleAdicionarRequisicao,
  handleEditarRequisicao,
  handleRemoverRequisicao,
  handleSubmeterRequisicoes,
  handlePreview,
  beneficiaryName,
  requisicoesV,
  handleChangeBeneficiaryName,
  setPreviewUrl,
  newRequestNumber,
  setRequisicoes,
  setFormData,
}) => {
  if (!isOpen) return null;

  const formatCurrency = (val) =>
    Number(val || 0).toLocaleString("pt-PT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const limparCampos = () => {
    setNomeRequerente("");
    setDepartamento("");
    setCodFinancial("");
    setSupplierName("");
    setOperationDateR("");
    setNumberF("");
    setQuantidade("");
    setPrecounit("");
    setDesignacao("");
    setFinanciamentoView("");
    setRequisicoes([]);
    setFormData("");
  };

  const handleSave = async () => {
    const wasSuccessful = await handleSubmeterRequisicoes();
    if (wasSuccessful === true) {
      limparCampos();
    }
  };

  const listaItens = requisicoesV || [];
  const totalGeral = listaItens.reduce(
    (sum, item) => sum + Number(item.importancia || 0),
    0
  );

  const totaisPorConta = Object.entries(
    listaItens.reduce((totais, req) => {
      const conta = req.orcamento || "N/A";
      if (!totais[conta]) totais[conta] = 0;
      totais[conta] += Number(req.importancia || 0);
      return totais;
    }, {})
  );

  const selectedBudgetAcc = (accounts || []).find(
    (a) => a.accountPlan?.number === formData
  );

  return (
    <div className="sgf-req-workspace">
      {/* Card 1: Dados do Requerente e Comprovativo Geral */}
      <div className="card mb-2">
        <div className="card-header">
          <div className="d-flex align-items-center gap-2">
            <FaUserCircle style={{ color: "#0f5132" }} />
            <span>
              1. Identificação do Requerente e Documento (Múltiplos Beneficiários)
            </span>
            {newRequestNumber && (
              <span
                className="badge"
                style={{
                  backgroundColor: "#eaf5ef",
                  color: "#0f5132",
                  border: "1px solid #a7d7be",
                  fontFamily: "monospace",
                }}
              >
                Ref: {newRequestNumber}
              </span>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={limparCampos}
              className="btn btn-sm btn-secondary"
            >
              <FaEraser /> Limpar
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="btn btn-sm btn-info"
            >
              <FaEye /> Pré-visualizar PDF
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-sm btn-primary"
            >
              <FaPaperPlane /> Submeter Requisição
            </button>
          </div>
        </div>

        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-4">
              <label>
                <FaUserCircle className="me-1" style={{ color: "#0f5132" }} />
                Nome do Requerente
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Digite o nome completo do requerente..."
                value={nomeRequerente || ""}
                onChange={
                  handleChangeNomeRequerente ||
                  ((e) => setNomeRequerente(e.target.value))
                }
              />
            </div>

            <div className="col-md-3">
              <label>
                <FaBuilding className="me-1" style={{ color: "#0f5132" }} />
                Departamento Solicitante
              </label>
              <select
                className="form-select"
                value={departamento || ""}
                onChange={
                  handleChangeDepartamento ||
                  ((e) => setDepartamento(e.target.value))
                }
              >
                <option value="">Seleccionar Departamento...</option>
                <option value="financeiro">Departamento Financeiro</option>
                <option value="recursos_humanos">Recursos Humanos</option>
                <option value="tecnologia">Departamento de Tecnologia</option>
                <option value="marketing">Departamento de Marketing</option>
                <option value="vendas">Departamento de Vendas</option>
              </select>
            </div>

            <div className="col-md-2">
              <label>
                <FaCalendarAlt className="me-1" style={{ color: "#0f5132" }} />
                Data da Operação
              </label>
              <input
                type="date"
                className="form-control"
                value={operationDateR || ""}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setOperationDateR(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label>
                <FaFileAlt className="me-1" style={{ color: "#0f5132" }} />
                Documento
              </label>
              <select
                id="accountPlanNumber"
                name="accountPlanNumber"
                className="form-select"
                value={formOpen?.documentNumber || ""}
                onChange={handleDocumentSelection}
                disabled={documents?.length === 0}
              >
                <option value="">Seleccionar Doc...</option>
                {documents?.map((doc) => (
                  <option key={doc.id} value={doc.documentNumber}>
                    {doc.documentNumber} — {doc.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-1">
              <label>
                <FaHashtag className="me-1" style={{ color: "#0f5132" }} />
                Nº Doc.
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="Nº"
                value={numberF || ""}
                onChange={(e) => setNumberF(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Adicionar Item por Beneficiário e Rubrica (Tudo na Mesma Linha) */}
      <div className="card mb-2">
        <div className="card-header">
          <div className="d-flex align-items-center gap-2">
            <FaChartPie style={{ color: "#0f5132" }} />
            <span>2. Adicionar Item por Beneficiário e Classificação Orçamental</span>
          </div>
          {selectedBudgetAcc && (
            <span
              className="badge"
              style={{
                backgroundColor: "#fef3c7",
                color: "#92400e",
                border: "1px solid #fde68a",
              }}
            >
              Rubrica: {selectedBudgetAcc.accountPlan?.number} —{" "}
              {selectedBudgetAcc.accountPlan?.description} | Disponível:{" "}
              {formatCurrency(selectedBudgetAcc.availableAllocation)} MZN
            </span>
          )}
        </div>

        <div className="card-body">
          <form onSubmit={handleAdicionarRequisicao}>
            <div className="row g-2 align-items-end">
              <div className="col-md-3">
                <label>
                  <FaUser className="me-1" style={{ color: "#b45309" }} />
                  Beneficiário (Conta Financeira)
                </label>
                <select
                  className="form-select"
                  value={beneficiaryName || ""}
                  onChange={handleChangeBeneficiaryName}
                  required
                >
                  <option value="">Seleccionar Beneficiário...</option>
                  {accountsCode
                    ?.filter(
                      (account) =>
                        account.accountPlan?.type === "financial" &&
                        account.accountPlan?.writable === "moviment"
                    )
                    .map((account) => (
                      <option
                        key={account.id}
                        value={account.accountPlan.number}
                      >
                        {account.accountPlan.number} —{" "}
                        {account.accountPlan.description}
                      </option>
                    ))}
                </select>
              </div>

              <div className="col-md-3">
                <label>
                  <FaChartPie className="me-1" style={{ color: "#0f5132" }} />
                  Classificação Orçamental
                </label>
                <select
                  className="form-select"
                  value={formData || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar Rubrica...</option>
                  {accounts
                    ?.filter(
                      (account) =>
                        account.accountPlan?.type === "budject" &&
                        account.accountPlan?.writable === "moviment"
                    )
                    .map((account) => (
                      <option
                        key={account.id}
                        value={account.accountPlan.number}
                      >
                        {account.accountPlan.number} —{" "}
                        {account.accountPlan.description}
                      </option>
                    ))}
                </select>
              </div>

              <div className="col-md-2">
                <label>
                  <FaAlignLeft className="me-1" style={{ color: "#0f5132" }} />
                  Descrição do Item
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Descrição..."
                  value={description || ""}
                  title={description || ""}
                  onChange={(e) => setDesignacao(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-1">
                <label>
                  <FaBoxes className="me-1" style={{ color: "#0f5132" }} />
                  Qtd.
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="1"
                  value={quantity || ""}
                  onChange={(e) => setQuantidade(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-1">
                <label>
                  <FaDollarSign className="me-1" style={{ color: "#0f5132" }} />
                  Preço Unit.
                </label>
                <input
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="0.00"
                  value={unitPrice || ""}
                  onChange={(e) => setPrecounit(e.target.value)}
                  required
                />
              </div>

              <div className="d-none">
                <input
                  type="text"
                  value={financiamentoView || ""}
                  onChange={
                    handleChangeFinanciamento ||
                    ((e) => setFinanciamentoView(e.target.value))
                  }
                />
              </div>

              <div className="col-md-2">
                <button type="submit" className="btn btn-primary w-100">
                  <FaPlusCircle />{" "}
                  {editIndex !== null ? "Atualizar Item" : "Adicionar Item"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Row 3: Tabelas Lado a Lado */}
      <div className="row g-2">
        <div className="col-lg-7">
          <div className="card h-100 mb-0">
            <div className="card-header">
              <div className="d-flex align-items-center gap-2">
                <FaBoxes style={{ color: "#0f5132" }} />
                <span>Itens da Requisição ({listaItens.length})</span>
              </div>
              <span
                className="badge"
                style={{
                  backgroundColor: "#eaf5ef",
                  color: "#0f5132",
                  border: "1px solid #a7d7be",
                  fontFamily: "monospace",
                }}
              >
                Total Requisitado: {formatCurrency(totalGeral)} MZN
              </span>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Beneficiário</th>
                      <th>Doc / Nº</th>
                      <th>Rubrica</th>
                      <th>Descrição</th>
                      <th className="text-center">Qtd.</th>
                      <th className="text-end">Preço Unit.</th>
                      <th className="text-end">Valor Total</th>
                      <th className="text-center">Acções</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaItens.length > 0 ? (
                      listaItens.map((req, index) => (
                        <tr key={index}>
                          <td className="sgf-desc-cell">{req.beneficiaryName}</td>
                          <td style={{ whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                            {req.document} #{req.documentNumber}
                            <div style={{ color: "#64748b", fontSize: "0.7rem" }}>
                              {req.operationDateR}
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                fontFamily: "monospace",
                                fontWeight: 700,
                                backgroundColor: "#eaf5ef",
                                color: "#0f5132",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              {req.orcamento}
                            </span>
                          </td>
                          <td className="sgf-desc-cell">{req.description}</td>
                          <td className="text-center">{req.quantity}</td>
                          <td
                            className="text-end"
                            style={{ fontFamily: "monospace" }}
                          >
                            {formatCurrency(req.unitPrice)}
                          </td>
                          <td
                            className="text-end"
                            style={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              color: "#0f5132",
                            }}
                          >
                            {formatCurrency(req.importancia)}
                          </td>
                          <td className="text-center">
                            <div className="d-inline-flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditarRequisicao(req, index)}
                                className="btn btn-sm btn-warning"
                                title="Editar item"
                              >
                                <FaEdit />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoverRequisicao(index)}
                                className="btn btn-sm btn-danger"
                                title="Remover item"
                              >
                                <FaTrashAlt />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-3 text-muted">
                          Nenhum item adicionado. Preencha os campos acima e
                          clique em "Adicionar Item".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card h-100 mb-0">
            <div className="card-header">
              <div className="d-flex align-items-center gap-2">
                <FaChartPie style={{ color: "#b45309" }} />
                <span>Controlo de Disponibilidade Orçamental</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                {totaisPorConta.map(([conta, total]) => (
                  <span
                    key={conta}
                    className="badge"
                    style={{
                      backgroundColor: "#fef3c7",
                      color: "#92400e",
                      border: "1px solid #fde68a",
                      fontFamily: "monospace",
                    }}
                  >
                    {conta.split(" - ")[0]}: {formatCurrency(total)} MZN
                  </span>
                ))}
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Rubrica</th>
                      <th className="text-end">Dotação</th>
                      <th className="text-end">Saldo Antes</th>
                      <th className="text-end">Requisitado</th>
                      <th className="text-end">Saldo Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaItens.length > 0 ? (
                      (() => {
                        const requisicoesOrdenadas = [...listaItens].sort(
                          (a, b) =>
                            String(a.orcamento).localeCompare(String(b.orcamento))
                        );
                        const saldosPorOrcamento = {};
                        return requisicoesOrdenadas.map((req, index) => {
                          const orc = req.orcamento;
                          if (
                            !Object.prototype.hasOwnProperty.call(
                              saldosPorOrcamento,
                              orc
                            )
                          ) {
                            saldosPorOrcamento[orc] =
                              req.availableAllocation || 0;
                          }
                          const saldoExistente = saldosPorOrcamento[orc];
                          const importancia = req.importancia || 0;
                          const saldoFinal = saldoExistente - importancia;
                          saldosPorOrcamento[orc] = saldoFinal;

                          return (
                            <tr key={index}>
                              <td style={{ fontFamily: "monospace", fontWeight: 700 }}>
                                {orc}
                              </td>
                              <td
                                className="text-end"
                                style={{ fontFamily: "monospace" }}
                              >
                                {formatCurrency(req.finalAllocation || 0)}
                              </td>
                              <td
                                className="text-end"
                                style={{ fontFamily: "monospace" }}
                              >
                                {formatCurrency(saldoExistente)}
                              </td>
                              <td
                                className="text-end"
                                style={{
                                  fontFamily: "monospace",
                                  color: "#b45309",
                                  fontWeight: 600,
                                }}
                              >
                                {formatCurrency(importancia)}
                              </td>
                              <td
                                className="text-end"
                                style={{
                                  fontFamily: "monospace",
                                  fontWeight: 700,
                                  color:
                                    saldoFinal < 0 ? "#be123c" : "#0f5132",
                                }}
                              >
                                {formatCurrency(saldoFinal)}
                              </td>
                            </tr>
                          );
                        });
                      })()
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-3 text-muted">
                          Sem movimentos orçamentais simulados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Pré-visualização PDF */}
      {previewUrl && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(7, 25, 20, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2050,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              width: "92vw",
              maxWidth: "1280px",
              height: "90vh",
              background: "#ffffff",
              borderRadius: "12px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 45px rgba(0, 0, 0, 0.35)",
            }}
          >
            <div
              style={{
                padding: "0.75rem 1.25rem",
                background: "linear-gradient(135deg, #0f5132 0%, #0a3622 100%)",
                color: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <FaFilePdf size={18} />
                <strong style={{ fontSize: "0.95rem" }}>
                  Pré-visualização Oficial da Requisição de Fundos
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="btn btn-sm btn-secondary"
              >
                <FaTimes /> Fechar
              </button>
            </div>
            <div style={{ flex: 1, background: "#f1f5f9" }}>
              <iframe
                src={previewUrl}
                style={{ width: "100%", height: "100%", border: "none" }}
                title="Pré-visualização do Documento"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumFormModal2;
