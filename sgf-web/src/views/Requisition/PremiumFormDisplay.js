import React from "react";
import {
  FaUserCircle,
  FaUserTie,
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

const PremiumFormModal = ({
  isOpen,
  nomeRequerente,
  setNomeRequerente,
  departamento,
  setDepartamento,
  codFinancial,
  setCodFinancial,
  supplierName,
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
  requisicoes,
  editIndex,
  previewUrl,
  accounts,
  accountsCode,
  documents,
  formOpen,
  formData,
  handleChangeNomeRequerente,
  handleChangeDepartamento,
  handleChangeCodFinancial,
  handleDocumentSelection,
  handleChange,
  handleChangeFinanciamento,
  handleAdicionarRequisicao,
  handleEditarRequisicao,
  handleRemoverRequisicao,
  handleSubmeterRequisicoes,
  handlePreview,
  setPreviewUrl,
  newRequestNumber,
  setRequisicoes,
  setSupplierName,
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

  const totalGeral = (requisicoes || []).reduce(
    (sum, item) => sum + Number(item.importancia || 0),
    0
  );

  const totaisPorConta = Object.entries(
    (requisicoes || []).reduce((totais, req) => {
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
      {/* Card 1: Dados do Requerente, Beneficiário Único e Documento */}
      <div className="card mb-2">
        <div className="card-header">
          <div className="d-flex align-items-center gap-2">
            <FaUserCircle style={{ color: "#0f5132" }} />
            <span>
              1. Identificação do Requerente, Beneficiário Único e Comprovativo
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
              title="Limpar todos os campos do formulário"
            >
              <FaEraser /> Limpar
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="btn btn-sm btn-info"
              title="Pré-visualizar documento PDF da requisição"
            >
              <FaEye /> Pré-visualizar PDF
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-sm btn-primary"
              title="Submeter requisição de fundos"
            >
              <FaPaperPlane /> Submeter Requisição
            </button>
          </div>
        </div>

        <div className="card-body">
          <div className="row g-2 mb-2">
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
                title={
                  documents?.find(
                    (d) => d.documentNumber === formOpen?.documentNumber
                  )?.description || ""
                }
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

          <div className="row g-2">
            <div className="col-md-4">
              <label>
                <FaHashtag className="me-1" style={{ color: "#b45309" }} />
                Código do Beneficiário (Conta Financeira)
              </label>
              <select
                className="form-select"
                value={codFinancial || ""}
                onChange={
                  handleChangeCodFinancial ||
                  ((e) => setCodFinancial(e.target.value))
                }
                title={supplierName || ""}
              >
                <option value="">Seleccionar Conta do Beneficiário...</option>
                {accountsCode
                  ?.filter(
                    (account) =>
                      account.accountPlan?.type === "financial" &&
                      account.accountPlan?.writable === "moviment"
                  )
                  .map((account) => (
                    <option key={account.id} value={account.accountPlan.number}>
                      {account.accountPlan.number} —{" "}
                      {account.accountPlan.description}
                    </option>
                  ))}
              </select>
            </div>

            <div className="col-md-8">
              <label>
                <FaUserTie className="me-1" style={{ color: "#b45309" }} />
                Designação Oficial do Beneficiário / Fornecedor
              </label>
              <input
                type="text"
                className="form-control"
                value={supplierName || ""}
                title={supplierName || ""}
                placeholder="Preenchido automaticamente ao seleccionar o código do beneficiário"
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Adicionar Item de Despesa à Requisição (Tudo na Mesma Linha) */}
      <div className="card mb-2">
        <div className="card-header">
          <div className="d-flex align-items-center gap-2">
            <FaChartPie style={{ color: "#0f5132" }} />
            <span>2. Adicionar Item de Despesa à Requisição</span>
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
              <div className="col-md-4">
                <label>
                  <FaChartPie className="me-1" style={{ color: "#0f5132" }} />
                  Classificação Orçamental (Rubrica)
                </label>
                <select
                  className="form-select"
                  value={formData || ""}
                  onChange={handleChange}
                  required
                  title={selectedBudgetAcc?.accountPlan?.description || ""}
                >
                  <option value="">Seleccionar Rubrica Orçamental...</option>
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

              <div className="col-md-3">
                <label>
                  <FaAlignLeft className="me-1" style={{ color: "#0f5132" }} />
                  Descrição do Item / Bem / Serviço
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Aquisição de consumíveis de escritório"
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

              <div className="col-md-2">
                <label>
                  <FaDollarSign className="me-1" style={{ color: "#0f5132" }} />
                  Preço Unit. (MZN)
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

              {/* Conta Financeira Oculta (mantida para compatibilidade) */}
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

      {/* Row 3: Tabelas Lado a Lado (Itens da Requisição + Controlo Orçamental) */}
      <div className="row g-2">
        {/* Coluna Esquerda: Itens da Requisição */}
        <div className="col-lg-7">
          <div className="card h-100 mb-0">
            <div className="card-header">
              <div className="d-flex align-items-center gap-2">
                <FaBoxes style={{ color: "#0f5132" }} />
                <span>Itens da Requisição ({requisicoes?.length || 0})</span>
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
                      <th>Rubrica Orçamental</th>
                      <th>Descrição do Item</th>
                      <th className="text-center">Qtd.</th>
                      <th className="text-end">Preço Unit.</th>
                      <th className="text-end">Valor Total</th>
                      <th className="text-center">Acções</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requisicoes && requisicoes.length > 0 ? (
                      requisicoes.map((req, index) => (
                        <tr key={index}>
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
                                onClick={() => handleEditarRequisicao(index)}
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
                        <td colSpan={6} className="text-center py-3 text-muted">
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

        {/* Coluna Direita: Controlo de Disponibilidade Orçamental */}
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
                    {requisicoes && requisicoes.length > 0 ? (
                      (() => {
                        const saldosPorOrcamento = {};
                        return requisicoes.map((req, index) => {
                          const orcamentoAtual = req.orcamento;
                          if (
                            !Object.prototype.hasOwnProperty.call(
                              saldosPorOrcamento,
                              orcamentoAtual
                            )
                          ) {
                            saldosPorOrcamento[orcamentoAtual] =
                              req.availableAllocation || 0;
                          }
                          const saldoExistente =
                            saldosPorOrcamento[orcamentoAtual];
                          const saldoFinal =
                            saldoExistente - (req.importancia || 0);
                          saldosPorOrcamento[orcamentoAtual] = saldoFinal;

                          return (
                            <tr key={index}>
                              <td style={{ fontFamily: "monospace", fontWeight: 700 }}>
                                {req.orcamento}
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
                                {formatCurrency(req.importancia || 0)}
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

export default PremiumFormModal;
