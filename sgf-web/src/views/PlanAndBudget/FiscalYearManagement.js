import React, { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import {
  fetchFiscalYearsOverview,
  syncActiveFiscalYearWithBackend,
  transitionOrResetFiscalYear,
  fetchFiscalYearComparison,
  getActiveFiscalYear,
  MIN_FISCAL_YEAR,
} from "../../services/accountService";
import Spinner from "../../config/spinner/spinner";

const SAFE_MIN_YEAR = 2026;

const formatMZN = (val) =>
  new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(val || 0));

export default function FiscalYearManagement() {
  const [loading, setLoading] = useState(false);
  const [yearsOverview, setYearsOverview] = useState([]);
  const [activeYear, setActiveYear] = useState(() => getActiveFiscalYear());

  // Form de Transição / Reset Contabilístico
  const [sourceYear, setSourceYear] = useState(2026);
  const [targetYear, setTargetYear] = useState(2026);
  const [customNewYear, setCustomNewYear] = useState("");
  const [carryMode, setCarryMode] = useState("CARRY_AVAILABLE_BALANCE");
  const [scope, setScope] = useState("BOTH");
  const [setAsActiveAfter, setSetAsActiveAfter] = useState(true);
  const [observation, setObservation] = useState("");

  // Quadro Comparativo
  const [comparisonData, setComparisonData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState("budject");
  const [onlyWithValues, setOnlyWithValues] = useState(true);

  const currentCalendarYear = new Date().getFullYear();

  const loadAllData = async (preferredSource, preferredTarget) => {
    setLoading(true);
    try {
      const overview = await fetchFiscalYearsOverview();
      const filteredOverview = Array.isArray(overview)
        ? overview.filter((y) => Number(y.year) >= 2026 && Number(y.year) <= currentCalendarYear)
        : [];
      setYearsOverview(filteredOverview);

      const currentActive = getActiveFiscalYear();
      const safeActive = currentActive <= currentCalendarYear ? currentActive : currentCalendarYear;
      setActiveYear(safeActive);

      const src = preferredSource || (safeActive > 2026 ? safeActive - 1 : 2025);
      const tgt = preferredTarget || safeActive;

      const comp = await fetchFiscalYearComparison(src, tgt);
      setComparisonData(comp?.accounts || []);
    } catch (error) {
      console.error("Erro ao carregar gestão de exercício:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const current = getActiveFiscalYear();
    const safeCurrent = current <= currentCalendarYear ? current : currentCalendarYear;
    const defaultSource = safeCurrent > 2026 ? safeCurrent - 1 : 2025;
    const defaultTarget = safeCurrent;
    setSourceYear(defaultSource);
    setTargetYear(defaultTarget);
    loadAllData(defaultSource, defaultTarget);

    const handleYearChanged = (e) => {
      const newYr = Number(e?.detail?.year || getActiveFiscalYear());
      if (newYr <= currentCalendarYear) {
        setActiveYear(newYr);
        loadAllData(sourceYear, newYr);
      }
    };
    window.addEventListener("sgf-fiscal-year-changed", handleYearChanged);
    return () => window.removeEventListener("sgf-fiscal-year-changed", handleYearChanged);
  }, [currentCalendarYear]);

  const handleCompareChange = async (newSource, newTarget) => {
    setSourceYear(Number(newSource));
    setTargetYear(Number(newTarget));
    setLoading(true);
    try {
      const comp = await fetchFiscalYearComparison(Number(newSource), Number(newTarget));
      setComparisonData(comp?.accounts || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchActiveYear = async (yearToActivate) => {
    setLoading(true);
    try {
      await syncActiveFiscalYearWithBackend(Number(yearToActivate));
      setActiveYear(Number(yearToActivate));
      await loadAllData(sourceYear, Number(yearToActivate));
      Swal.fire({
        title: `Exercício Fiscal ${yearToActivate} Activo`,
        text: `O sistema está agora a operar no Exercício Económico de ${yearToActivate}. Todas as consultas, dotações e requisições refletem este ano.`,
        icon: "success",
        confirmButtonColor: "#0f5132",
      });
    } catch (error) {
      Swal.fire({
        title: "Erro",
        text: error.message || "Não foi possível alterar o exercício fiscal.",
        icon: "error",
        confirmButtonColor: "#0f5132",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteTransition = async (overrideMode, overrideTargetYear) => {
    const finalMode = overrideMode || carryMode;
    const finalTargetYear = Number(overrideTargetYear || customNewYear || targetYear);
    const finalSourceYear = Number(sourceYear);

    if (!finalTargetYear || finalTargetYear < 2026 || finalTargetYear > 2100) {
      Swal.fire("Atenção", "O ano fiscal de destino mínimo é 2026 (ano de lançamento).", "warning");
      return;
    }

    if (finalTargetYear === 2026 && finalMode !== "RESET_ZERO") {
      Swal.fire(
        "Exercício de Lançamento",
        "O exercício de 2026 é o ano de lançamento da aplicação e não possui exercício anterior para transição ou transporte de saldos.",
        "info"
      );
      return;
    }

    if (finalMode !== "RESET_ZERO" && finalTargetYear === finalSourceYear) {
      Swal.fire(
        "Atenção",
        "Para transportar saldos/resultados, o Exercício de Origem e o Exercício de Destino devem ser diferentes.",
        "warning"
      );
      return;
    }

    const modeLabels = {
      CARRY_AVAILABLE_BALANCE: `Transportar Saldo Disponível / Resultado de ${finalSourceYear} como Dotação Inicial de ${finalTargetYear}`,
      CARRY_FINAL_ALLOCATION: `Transportar Dotação Final Consolidada de ${finalSourceYear} como Dotação Inicial de ${finalTargetYear}`,
      CARRY_INITIAL_ALLOCATION: `Transportar Dotação Inicial Homóloga de ${finalSourceYear} para ${finalTargetYear}`,
      RESET_ZERO: `Resetar / Limpar Actividades e Dotações do Exercício ${finalTargetYear} (Iniciar a Zero)`,
    };

    const confirmResult = await Swal.fire({
      title: finalMode === "RESET_ZERO" ? `Resetar Exercício ${finalTargetYear}?` : `Transição de Exercício ${finalSourceYear} → ${finalTargetYear}`,
      html: `
        <div style="text-align:left; font-size:0.88rem; line-height:1.55; color:#1e293b;">
          <p style="margin-bottom:8px;"><strong>Operação Contabilística:</strong><br/>${modeLabels[finalMode]}</p>
          <p style="margin-bottom:8px;"><strong>Âmbito das Contas:</strong> ${
            scope === "BOTH"
              ? "Plano Orçamental e Plano Financeiro"
              : scope === "BUDGET_ONLY"
              ? "Apenas Contas Orçamentais"
              : "Apenas Contas Financeiras"
          }</p>
          <p style="margin-bottom:0; color:#b45309; font-weight:600;">
            Esta operação recalcula automaticamente os saldos de todas as contas de movimento e de controlo do exercício ${finalTargetYear}.
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: finalMode === "RESET_ZERO" ? "#be123c" : "#0f5132",
      cancelButtonColor: "#64748b",
      confirmButtonText: finalMode === "RESET_ZERO" ? "Sim, Resetar Exercício" : "Confirmar Transporte de Saldos",
      cancelButtonText: "Cancelar",
    });

    if (!confirmResult.isConfirmed) return;

    setLoading(true);
    try {
      const response = await transitionOrResetFiscalYear({
        targetYear: finalTargetYear,
        sourceYear: finalSourceYear,
        mode: finalMode,
        scope,
        setAsActive: setAsActiveAfter,
        observation:
          observation ||
          `${modeLabels[finalMode]} executado em ${new Date().toLocaleDateString("pt-PT")}`,
      });

      if (setAsActiveAfter) {
        await syncActiveFiscalYearWithBackend(finalTargetYear);
        setActiveYear(finalTargetYear);
      }

      setCustomNewYear("");
      setTargetYear(finalTargetYear);
      await loadAllData(finalSourceYear, finalTargetYear);

      Swal.fire({
        title: "Operação Concluída com Sucesso!",
        html: `
          <div style="text-align:left; font-size:0.88rem; line-height:1.5;">
            <div><strong>Exercício de Destino:</strong> ${finalTargetYear}</div>
            <div><strong>Contas Movimentadas:</strong> ${response.accountsUpdated || 0} contas</div>
            <div><strong>Dotação Orçamental Inicializada:</strong> ${formatMZN(response.totalCarriedBudget)} MZN</div>
            <div><strong>Saldo Financeiro Inicializado:</strong> ${formatMZN(response.totalCarriedFinancial)} MZN</div>
          </div>
        `,
        icon: "success",
        confirmButtonColor: "#0f5132",
      });
    } catch (error) {
      Swal.fire({
        title: "Erro na Operação",
        text: error.message || "Ocorreu um erro ao processar o exercício económico.",
        icon: "error",
        confirmButtonColor: "#0f5132",
      });
    } finally {
      setLoading(false);
    }
  };

  const activeYearSummary = useMemo(() => {
    return (
      yearsOverview.find((y) => Number(y.year) === Number(activeYear)) ||
      yearsOverview[0] || {
        year: activeYear,
        budgetInitialAllocation: 0,
        budgetFinalAllocation: 0,
        budgetAvailableBalance: 0,
        financialFinalBalance: 0,
        isConformed: false,
      }
    );
  }, [yearsOverview, activeYear]);

  const filteredComparison = useMemo(() => {
    return comparisonData.filter((row) => {
      if (accountTypeFilter !== "ALL" && row.type !== accountTypeFilter) {
        return false;
      }
      if (onlyWithValues) {
        const hasVal =
          row.sourceInitial > 0 ||
          row.sourceFinal > 0 ||
          row.sourceAvailable > 0 ||
          row.targetInitial > 0 ||
          row.targetFinal > 0 ||
          row.targetAvailable > 0;
        if (!hasVal) return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          String(row.number || "").toLowerCase().includes(q) ||
          String(row.description || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [comparisonData, accountTypeFilter, onlyWithValues, searchTerm]);

  return (
    <div className="container-fluid" style={{ paddingBottom: "28px" }}>
      <Spinner isLoading={loading} />

      {/* BARRA EXECUTIVA DO EXERCÍCIO EM CURSO */}
      <div
        className="card"
        style={{
          marginBottom: "12px",
          border: "1px solid #b7dec9",
          background: "linear-gradient(90deg, #0b221b 0%, #0f3d2e 60%, #14533c 100%)",
          color: "#ffffff",
          borderRadius: "10px",
        }}
      >
        <div
          className="card-body"
          style={{
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                backgroundColor: "rgba(217, 119, 6, 0.22)",
                border: "1px solid rgba(251, 191, 36, 0.55)",
                color: "#fde68a",
                fontWeight: 800,
                fontSize: "1.1rem",
              }}
            >
              Exercício {activeYear}
            </div>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
                Gestão de Exercício Económico, Abertura de Ano Fiscal & Transporte de Saldos
              </div>
              <div style={{ fontSize: "0.76rem", color: "#cbe3d6" }}>
                Princípios de Contabilidade Pública: Anualidade, Continuidade de Saldos, Transporte de Resultado como Dotação Inicial e Reset de Exercício
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#fde68a" }}>
              Mudar Exercício em Curso:
            </span>
            <select
              value={activeYear}
              onChange={(e) => handleSwitchActiveYear(Number(e.target.value))}
              style={{
                height: "34px",
                padding: "0 12px",
                borderRadius: "7px",
                border: "1px solid #fbbf24",
                backgroundColor: "#ffffff",
                color: "#0f2922",
                fontWeight: 800,
                fontSize: "0.82rem",
                cursor: "pointer",
              }}
            >
              {yearsOverview.map((y) => (
                <option key={y.year} value={y.year}>
                  Ano Fiscal {y.year} {y.isActive ? "(Em Exercício)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 KPIS DO EXERCÍCIO SELECIONADO */}
      <div className="row g-2" style={{ marginBottom: "12px" }}>
        <div className="col-md-3 col-sm-6">
          <div className="card" style={{ marginBottom: 0, borderLeft: "4px solid #0f5132" }}>
            <div className="card-body" style={{ padding: "10px 14px" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#5c746b" }}>
                Dotação Inicial ({activeYearSummary.year})
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f2922", marginTop: "2px" }}>
                {formatMZN(activeYearSummary.budgetInitialAllocation)} MZN
              </div>
              <div style={{ fontSize: "0.7rem", color: "#0f5132", fontWeight: 600 }}>
                {activeYearSummary.isConformed ? "Orçamento Conforme" : "Aberto para Dotação / Ajustes"}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card" style={{ marginBottom: 0, borderLeft: "4px solid #0284c7" }}>
            <div className="card-body" style={{ padding: "10px 14px" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#5c746b" }}>
                Dotação Final Atualizada ({activeYearSummary.year})
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f2922", marginTop: "2px" }}>
                {formatMZN(activeYearSummary.budgetFinalAllocation)} MZN
              </div>
              <div style={{ fontSize: "0.7rem", color: "#0284c7", fontWeight: 600 }}>
                {activeYearSummary.movementsCount || 0} lançamentos registados
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card" style={{ marginBottom: 0, borderLeft: "4px solid #d97706" }}>
            <div className="card-body" style={{ padding: "10px 14px" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#5c746b" }}>
                Saldo Orçamental Disponível ({activeYearSummary.year})
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#b45309", marginTop: "2px" }}>
                {formatMZN(activeYearSummary.budgetAvailableBalance)} MZN
              </div>
              <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>
                Resultado transitável para novo exercício
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card" style={{ marginBottom: 0, borderLeft: "4px solid #4f46e5" }}>
            <div className="card-body" style={{ padding: "10px 14px" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", color: "#5c746b" }}>
                Saldo de Contas Financeiras ({activeYearSummary.year})
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f2922", marginTop: "2px" }}>
                {formatMZN(activeYearSummary.financialFinalBalance)} MZN
              </div>
              <div style={{ fontSize: "0.7rem", color: "#4f46e5", fontWeight: 600 }}>
                {activeYearSummary.requestsCount || 0} requisições no exercício
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL DE TRANSIÇÃO DE ANO FISCAL, TRANSPORTE DE RESULTADOS E RESET */}
      <div className="row g-2" style={{ marginBottom: "12px" }}>
        <div className="col-lg-6">
          <div className="card" style={{ height: "100%", marginBottom: 0 }}>
            <div className="card-header">
              <div>
                <h5 className="card-title" style={{ marginBottom: "2px" }}>
                  Abertura de Novo Exercício & Transporte do Resultado Anterior
                </h5>
                <span className="card-category">
                  Transporte de saldos/resultados do ano anterior como Dotação Inicial ou Reset de actividades do novo ano
                </span>
              </div>
            </div>
            <div className="card-body" style={{ padding: "12px 16px" }}>
              {Number(targetYear) === 2026 && (
                <div className="alert alert-info py-2 px-3 mb-2" style={{ fontSize: "0.82rem", backgroundColor: "#e0f2fe", border: "1px solid #bae6fd", color: "#0369a1", borderRadius: "6px" }}>
                  <strong>🚀 Ano de Lançamento (2026):</strong> O exercício de 2026 é o ano de entrada em produção da aplicação e representa o ponto de partida do sistema. Não possui exercício anterior para transição ou transporte de saldos.
                </div>
              )}
              <div className="row g-2">
                <div className="col-sm-4">
                  <label className="form-label">Exercício Origem (Anterior)</label>
                  <select
                    className="form-select"
                    value={sourceYear}
                    onChange={(e) => handleCompareChange(e.target.value, targetYear)}
                    disabled={carryMode === "RESET_ZERO"}
                  >
                    {yearsOverview.filter(y => Number(y.year) < Number(targetYear)).length > 0 ? (
                      yearsOverview.filter(y => Number(y.year) < Number(targetYear)).map((y) => (
                        <option key={y.year} value={y.year}>
                          Exercício {y.year}
                        </option>
                      ))
                    ) : (
                      <option value="">Nenhum (Ano Inicial 2026)</option>
                    )}
                  </select>
                </div>

                <div className="col-sm-4">
                  <label className="form-label">Exercício Destino (Corrente/Novo)</label>
                  <select
                    className="form-select"
                    value={targetYear}
                    onChange={(e) => handleCompareChange(sourceYear, e.target.value)}
                  >
                    {yearsOverview.map((y) => (
                      <option key={y.year} value={y.year}>
                        Exercício {y.year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-sm-4">
                  <label className="form-label">Ou Criar Novo Ano</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Ex: 2028"
                    value={customNewYear}
                    onChange={(e) => setCustomNewYear(e.target.value)}
                  />
                </div>

                <div className="col-sm-7">
                  <label className="form-label">Regra Contabilística de Abertura / Transição</label>
                  <select
                    className="form-select"
                    value={carryMode}
                    onChange={(e) => setCarryMode(e.target.value)}
                  >
                    <option value="CARRY_AVAILABLE_BALANCE">
                      1. Transportar Saldo Disponível / Resultado Anterior como Dotação Inicial
                    </option>
                    <option value="CARRY_FINAL_ALLOCATION">
                      2. Transportar Dotação Final do Ano Anterior como Dotação Inicial
                    </option>
                    <option value="CARRY_INITIAL_ALLOCATION">
                      3. Transportar Dotação Inicial Homóloga do Ano Anterior
                    </option>
                    <option value="RESET_ZERO">
                      4. Resetar Actividades e Dotações do Novo Ano (Iniciar a Zero)
                    </option>
                  </select>
                </div>

                <div className="col-sm-5">
                  <label className="form-label">Âmbito do Plano de Contas</label>
                  <select
                    className="form-select"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                  >
                    <option value="BOTH">Orçamental + Financeiro (Completo)</option>
                    <option value="BUDGET_ONLY">Apenas Plano Orçamental</option>
                    <option value="FINANCIAL_ONLY">Apenas Plano Financeiro</option>
                  </select>
                </div>

                <div className="col-sm-12">
                  <label className="form-label">Observação / Termo de Abertura Contabilística</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Ex: Transporte de saldos do exercício ${sourceYear} para dotação inicial de ${customNewYear || targetYear}`}
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                  />
                </div>

                <div
                  className="col-sm-12"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "6px",
                    paddingTop: "8px",
                    borderTop: "1px solid #e2ece7",
                  }}
                >
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#1e293b",
                      cursor: "pointer",
                      marginBottom: 0,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={setAsActiveAfter}
                      onChange={(e) => setSetAsActiveAfter(e.target.checked)}
                    />
                    Activar automaticamente o Exercício {customNewYear || targetYear} após concluir
                  </label>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleExecuteTransition("RESET_ZERO", customNewYear || targetYear)}
                    >
                      Resetar Ano {customNewYear || targetYear} a Zero
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleExecuteTransition()}
                    >
                      Executar Transição ({sourceYear} → {customNewYear || targetYear})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QUADRO DE EXERCÍCIOS REGISTADOS */}
        <div className="col-lg-6">
          <div className="card" style={{ height: "100%", marginBottom: 0 }}>
            <div className="card-header">
              <div>
                <h5 className="card-title" style={{ marginBottom: "2px" }}>
                  Exercícios Económicos Registados no SGF
                </h5>
                <span className="card-category">
                  Selecione o ano fiscal em exercício ou inicialize/resete um novo ciclo anual
                </span>
              </div>
            </div>
            <div className="card-body" style={{ padding: "8px 12px" }}>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Ano</th>
                      <th className="text-end">Dotação Inicial</th>
                      <th className="text-end">Dotação Final</th>
                      <th className="text-end">Saldo Disponível</th>
                      <th className="text-center">Estado</th>
                      <th className="text-end">Acções</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearsOverview.map((item) => {
                      const isCurrent = Number(item.year) === Number(activeYear);
                      return (
                        <tr
                          key={item.year}
                          style={
                            isCurrent
                              ? { backgroundColor: "#eaf5ef", fontWeight: 700 }
                              : undefined
                          }
                        >
                          <td>
                            <span style={{ fontWeight: 800, color: "#0f2922" }}>
                              {item.year}
                            </span>
                            {Number(item.year) === 2026 && (
                              <span
                                style={{
                                  marginLeft: "6px",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontSize: "0.65rem",
                                  fontWeight: 700,
                                  backgroundColor: "#e0f2fe",
                                  color: "#0369a1",
                                  border: "1px solid #bae6fd",
                                }}
                              >
                                Lançamento SGF
                              </span>
                            )}
                            {isCurrent && (
                              <span
                                style={{
                                  marginLeft: "6px",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  backgroundColor: "#0f5132",
                                  color: "#ffffff",
                                  fontSize: "0.66rem",
                                  fontWeight: 700,
                                }}
                              >
                                EM EXERCÍCIO
                              </span>
                            )}
                          </td>
                          <td className="text-end">{formatMZN(item.budgetInitialAllocation)}</td>
                          <td className="text-end">{formatMZN(item.budgetFinalAllocation)}</td>
                          <td className="text-end" style={{ fontWeight: 700, color: "#0f5132" }}>
                            {formatMZN(item.budgetAvailableBalance)}
                          </td>
                          <td className="text-center">
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "999px",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                backgroundColor: item.isConformed ? "#dcfce7" : "#fef3c7",
                                color: item.isConformed ? "#166534" : "#92400e",
                              }}
                            >
                              {item.isConformed
                                ? "Conforme"
                                : item.budgetFinalAllocation > 0
                                ? "Em Curso"
                                : "Aberto (Zero)"}
                            </span>
                          </td>
                          <td className="text-end">
                            <div style={{ display: "inline-flex", gap: "4px" }}>
                              {!isCurrent && (
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: "2px 8px", fontSize: "0.72rem" }}
                                  onClick={() => handleSwitchActiveYear(item.year)}
                                >
                                  Seleccionar
                                </button>
                              )}
                              {Number(item.year) > 2026 ? (
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary btn-sm"
                                  style={{ padding: "2px 8px", fontSize: "0.72rem" }}
                                  onClick={() =>
                                    handleExecuteTransition("CARRY_AVAILABLE_BALANCE", item.year)
                                  }
                                  title={`Transportar saldo de ${sourceYear} para ${item.year}`}
                                >
                                  Transportar de {sourceYear}
                                </button>
                              ) : (
                                <span className="badge bg-light text-muted border" style={{ fontSize: "0.68rem" }}>
                                  Exercício Base
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DEMONSTRAÇÃO COMPARATIVA DE CONTAS (ANO ANTERIOR VS ANO EM EXERCÍCIO) */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div className="card-header">
          <div>
            <h5 className="card-title" style={{ marginBottom: "2px" }}>
              Demonstração Comparativa de Contas ({sourceYear} vs. {targetYear})
            </h5>
            <span className="card-category">
              Verificação analítica do transporte de saldos do exercício anterior ({sourceYear}) para a dotação inicial do exercício {targetYear}
            </span>
          </div>

          <div className="sgf-inline-toolbar">
            <input
              type="text"
              className="form-control"
              placeholder="Pesquisar código ou conta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "210px" }}
            />
            <select
              className="form-select"
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              style={{ width: "165px" }}
            >
              <option value="budject">Plano Orçamental</option>
              <option value="financial">Plano Financeiro</option>
              <option value="ALL">Todas as Contas</option>
            </select>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.76rem",
                fontWeight: 600,
                color: "#334155",
                marginBottom: 0,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={onlyWithValues}
                onChange={(e) => setOnlyWithValues(e.target.checked)}
              />
              Apenas contas com saldo
            </label>
          </div>
        </div>

        <div className="card-body" style={{ padding: "8px 12px" }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Designação da Conta</th>
                  <th>Tipo</th>
                  <th className="text-end">Dotação Final ({sourceYear})</th>
                  <th className="text-end">Saldo Disponível ({sourceYear})</th>
                  <th className="text-end">Dotação Inicial ({targetYear})</th>
                  <th className="text-end">Dotação Final ({targetYear})</th>
                  <th className="text-end">Saldo Disponível ({targetYear})</th>
                </tr>
              </thead>
              <tbody>
                {filteredComparison.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center" style={{ padding: "18px", color: "#64748b" }}>
                      Nenhuma conta encontrada com os filtros actuais. Desmarque &quot;Apenas contas com saldo&quot; para visualizar todas as 276 contas.
                    </td>
                  </tr>
                ) : (
                  filteredComparison.map((row) => {
                    const isControl = row.writable === "controll";
                    return (
                      <tr
                        key={row.accountPlanId}
                        style={
                          isControl
                            ? { backgroundColor: "#f4f8f6", fontWeight: 700 }
                            : undefined
                        }
                      >
                        <td style={{ fontWeight: 700, color: "#0f5132" }}>{row.number}</td>
                        <td>{row.description}</td>
                        <td>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: isControl ? "#e2e8f0" : "#eaf5ef",
                              color: isControl ? "#334155" : "#0f5132",
                              fontWeight: 700,
                            }}
                          >
                            {isControl ? "Controlo" : "Movimento"}
                          </span>
                        </td>
                        <td className="text-end">{formatMZN(row.sourceFinal)}</td>
                        <td className="text-end" style={{ color: "#b45309", fontWeight: 600 }}>
                          {formatMZN(row.sourceAvailable)}
                        </td>
                        <td className="text-end" style={{ color: "#0f5132", fontWeight: 700 }}>
                          {formatMZN(row.targetInitial)}
                        </td>
                        <td className="text-end">{formatMZN(row.targetFinal)}</td>
                        <td className="text-end" style={{ fontWeight: 700 }}>
                          {formatMZN(row.targetAvailable)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
