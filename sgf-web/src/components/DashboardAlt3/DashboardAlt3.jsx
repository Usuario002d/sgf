import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import "./TableStyle.css";
import { Card, Typography, Box, Grid, LinearProgress } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import Filter from "./Filter";
import BudgetAvailable from "./BudgetAvailable";
import MounthExecution from "./FinanceDashboard/MounthExecution";
import BudgetBankBalance from "./FinanceDashboard/BudgetBankBalance";
import AccountsToPayReceive from "./FinanceDashboard/AccountsToPayReceive";
import ExchangeRateVariations from "./FinanceDashboard/ExchangeRateVariations";
import GeneralFolio from "./FinanceDashboard/GeneralFolio";
import {
  findDashboardData,
  fetchGeneralFolioAccountByFilterByYearAndMonth,
  dashboardAccountToPayAndReceive,
  dashboardBudjectExecution,
  findDashboardDataSecondSection,
  findDashboardBudject,
} from "../../services/accountService";

const premiumTheme = createTheme({
  palette: {
    primary: {
      main: "#1e40af",
    },
    secondary: {
      main: "#0f172a",
    },
    success: {
      main: "#059669",
    },
    error: {
      main: "#e11d48",
    },
    warning: {
      main: "#d97706",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
  },
});

const DashboardAlt3 = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardDataSecondSection, setDashboardDataSecondSection] = useState(null);
  const [budgectExecution, setBudgectExecution] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [generalFolio, setGeneralFolio] = useState(null);
  const [budgetData, setBudgetData] = useState(null);

  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(() => String(localStorage.getItem("selectedFiscalYear") || "2025"));

  const formatMoney = (value) => {
    return new Intl.NumberFormat("pt-PT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const colorMap = {
    personnel: "#1e40af",
    goodsAndServices: "#0284c7",
    currentTransfers: "#059669",
    pastExercises: "#d97706",
    capitalExpenses: "#4f46e5",
    global: "#0f172a",
  };

  function transformApiResponseToDataCharts(apiData) {
    if (!apiData || !apiData.categories) return [];
    return Object.keys(apiData.categories).map((key) => {
      const valorPrevisto = apiData.values?.[key] ?? 0;
      const valorExecutado = apiData.execution?.[key] ?? 0;

      let saldo = 0;
      let exec = 0;

      if (valorPrevisto > 0) {
        saldo = Number((((valorPrevisto - valorExecutado) / valorPrevisto) * 100).toFixed(2));
        exec = Number(((valorExecutado / valorPrevisto) * 100).toFixed(2));
      }

      return {
        name: apiData.categories[key],
        saldo: isNaN(saldo) ? 0 : Math.max(0, saldo),
        exec: isNaN(exec) ? 0 : Math.max(0, exec),
        valorPrevisto,
        valorExecutado,
        previsto: 100,
        color: colorMap[key] || "#1e40af",
      };
    });
  }

  const loadDashboardDataByYearAndMonth = async (selectedYear = year, selectedMonth = month) => {
    try {
      const response = await fetchGeneralFolioAccountByFilterByYearAndMonth({
        year: selectedYear,
        month: selectedMonth,
      });
      if (response && response.totais) {
        setGeneralFolio(response.totais);
      }
    } catch (error) {
      console.error("Erro ao carregar Fólio Geral:", error);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchAllDashboardMetrics = async () => {
      setIsLoading(true);
      try {
        const [
          summaryRes,
          secondSecRes,
          budgetRes,
          execRes,
          payReceiveRes,
          folioRes,
        ] = await Promise.allSettled([
          findDashboardData(),
          findDashboardDataSecondSection(),
          findDashboardBudject(),
          dashboardBudjectExecution(),
          dashboardAccountToPayAndReceive(),
          fetchGeneralFolioAccountByFilterByYearAndMonth({ year, month }),
        ]);

        if (!mounted) return;

        if (summaryRes.status === "fulfilled") setDashboardData(summaryRes.value);
        if (secondSecRes.status === "fulfilled") {
          setDashboardDataSecondSection(transformApiResponseToDataCharts(secondSecRes.value));
        }
        if (budgetRes.status === "fulfilled") setBudgetData(budgetRes.value);
        if (execRes.status === "fulfilled") setBudgectExecution(execRes.value);
        if (payReceiveRes.status === "fulfilled") setAccountData(payReceiveRes.value);
        if (folioRes.status === "fulfilled" && folioRes.value?.totais) {
          setGeneralFolio(folioRes.value.totais);
        }
      } catch (err) {
        console.error("Erro ao carregar painel:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchAllDashboardMetrics();
    return () => {
      mounted = false;
    };
  }, []);

  const handleFilterChange = (filterValues) => {
    if (filterValues && typeof filterValues === "object") {
      const nextMonth = filterValues.month || month;
      const nextYear = filterValues.year || year;
      setMonth(nextMonth);
      setYear(nextYear);
      loadDashboardDataByYearAndMonth(nextYear, nextMonth);
    }
  };

  const calcularVariacao = (anoAnterior, anoAtual) => {
    const prev = Number(anoAnterior || 0);
    const curr = Number(anoAtual || 0);
    if (prev === 0) return curr === 0 ? "0.0%" : "+100.0%";
    const variacao = ((curr - prev) / Math.abs(prev)) * 100;
    const prefix = variacao > 0 ? "+" : "";
    return `${prefix}${variacao.toFixed(1)}%`;
  };

  const getTrend = (anoAnterior, anoAtual) => {
    if (Number(anoAtual) > Number(anoAnterior)) return "up";
    if (Number(anoAtual) < Number(anoAnterior)) return "down";
    return "equal";
  };

  const cards = dashboardData
    ? [
        {
          title: "Saldo Bancário",
          subtitle: "Disponibilidade em contas",
          accentColor: "#1e40af",
          bgSoft: "#eff6ff",
          icon: <AccountBalanceIcon fontSize="small" />,
          data: {
            anoN: formatMoney(dashboardData.currentYear?.totalBankValue),
            anoN1: formatMoney(dashboardData.previousYear?.totalBankValue),
            variacao: calcularVariacao(
              dashboardData.previousYear?.totalBankValue,
              dashboardData.currentYear?.totalBankValue
            ),
            trend: getTrend(
              dashboardData.previousYear?.totalBankValue,
              dashboardData.currentYear?.totalBankValue
            ),
          },
        },
        {
          title: "Orçamento Disponível",
          subtitle: "Dotação anual global",
          accentColor: "#0284c7",
          bgSoft: "#f0f9ff",
          icon: <AccountBalanceWalletIcon fontSize="small" />,
          data: {
            anoN: formatMoney(dashboardData.currentYear?.totalBudget),
            anoN1: formatMoney(dashboardData.previousYear?.totalBudget),
            variacao: calcularVariacao(
              dashboardData.previousYear?.totalBudget,
              dashboardData.currentYear?.totalBudget
            ),
            trend: getTrend(
              dashboardData.previousYear?.totalBudget,
              dashboardData.currentYear?.totalBudget
            ),
          },
        },
        {
          title: "Requisições Emitidas",
          subtitle: `${dashboardData.currentYear?.requestsCount || 0} requisições registadas`,
          accentColor: "#4f46e5",
          bgSoft: "#eef2ff",
          icon: <ShoppingCartIcon fontSize="small" />,
          data: {
            anoN: formatMoney(dashboardData.currentYear?.totalRequested),
            anoN1: formatMoney(dashboardData.previousYear?.totalRequested),
            variacao: calcularVariacao(
              dashboardData.previousYear?.totalRequested,
              dashboardData.currentYear?.totalRequested
            ),
            trend: getTrend(
              dashboardData.previousYear?.totalRequested,
              dashboardData.currentYear?.totalRequested
            ),
          },
        },
        {
          title: "Execução Orçamental",
          subtitle: "Total liquidado / pago",
          accentColor: "#059669",
          bgSoft: "#ecfdf5",
          icon: <BarChartIcon fontSize="small" />,
          data: {
            anoN: formatMoney(dashboardData.currentYear?.totalRequestPaid),
            anoN1: formatMoney(dashboardData.previousYear?.totalRequestPaid),
            variacao: calcularVariacao(
              dashboardData.previousYear?.totalRequestPaid,
              dashboardData.currentYear?.totalRequestPaid
            ),
            trend: getTrend(
              dashboardData.previousYear?.totalRequestPaid,
              dashboardData.currentYear?.totalRequestPaid
            ),
          },
        },
        {
          title: "Saldo Orçamental",
          subtitle: "Remanescente não executado",
          accentColor: "#0f172a",
          bgSoft: "#f1f5f9",
          icon: <AccountBalanceIcon fontSize="small" />,
          data: {
            anoN: formatMoney(dashboardData.currentYear?.budgetBalance),
            anoN1: formatMoney(dashboardData.previousYear?.budgetBalance),
            variacao: calcularVariacao(
              dashboardData.previousYear?.budgetBalance,
              dashboardData.currentYear?.budgetBalance
            ),
            trend: getTrend(
              dashboardData.previousYear?.budgetBalance,
              dashboardData.currentYear?.budgetBalance
            ),
          },
        },
      ]
    : [];

  const renderTrendBadge = (trend, variacao) => {
    const isUp = trend === "up";
    const isDown = trend === "down";
    const bg = isUp ? "#ecfdf5" : isDown ? "#fff1f2" : "#f1f5f9";
    const color = isUp ? "#059669" : isDown ? "#e11d48" : "#64748b";
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: "2px 8px",
          borderRadius: "9999px",
          backgroundColor: bg,
          color: color,
          fontSize: "11.5px",
          fontWeight: 700,
        }}
      >
        {isUp ? (
          <TrendingUpIcon style={{ fontSize: 14 }} />
        ) : isDown ? (
          <TrendingDownIcon style={{ fontSize: 14 }} />
        ) : (
          <EqualizerIcon style={{ fontSize: 14 }} />
        )}
        {variacao}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="65vh"
      >
        <Box
          width="100%"
          maxWidth={380}
          sx={{
            p: 3.5,
            backgroundColor: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#0f172a", mb: 1.5 }}
          >
            A sintetizar indicadores financeiros...
          </Typography>
          <LinearProgress
            sx={{
              height: 6,
              borderRadius: 999,
              backgroundColor: "#e2e8f0",
              "& .MuiLinearProgress-bar": { backgroundColor: "#1e40af" },
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={premiumTheme}>
      <div>
        {/* Executive Header & Filter Bar */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 3,
            p: 2.5,
            background: "linear-gradient(135deg, #ffffff 0%, #f1f8f4 65%, #fdf8ec 100%)",
            borderRadius: "16px",
            border: "1px solid #d5e0da",
            borderLeft: "5px solid #0f5132",
            boxShadow: "0 2px 8px rgba(15, 41, 34, 0.05)",
          }}
        >
          <div>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "#0f2922",
                fontSize: "1.18rem",
                letterSpacing: "-0.02em",
              }}
            >
              Visão Geral de Execução Financeira & Orçamental
            </Typography>
            <Typography variant="body2" sx={{ color: "#5c746b", fontSize: "0.82rem" }}>
              Indicadores consolidados de dotação, tesouraria, requisições e balancete (Valores expressos em MZN)
            </Typography>
          </div>

          <Filter onFilter={handleFilterChange} onChange={handleFilterChange} />
        </Box>

        {/* Row 1: 5 Executive KPI Summary Cards */}
        <Grid container spacing={2.25} sx={{ mb: 3 }}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <Card
                elevation={0}
                sx={{
                  p: 2.25,
                  height: "100%",
                  borderRadius: "16px",
                  background: "linear-gradient(180deg, #ffffff 0%, #fbfdfc 100%)",
                  border: "1px solid #d5e0da",
                  borderTop: `3px solid ${card.accentColor}`,
                  boxShadow: "0 2px 6px rgba(15, 41, 34, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 10px 22px -4px rgba(15, 41, 34, 0.1)",
                  },
                }}
              >
                <div>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={1.5}
                  >
                    <div>
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                        {card.subtitle}
                      </Typography>
                    </div>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        backgroundColor: card.bgSoft,
                        color: card.accentColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#0f172a",
                      letterSpacing: "-0.02em",
                      my: 1,
                    }}
                  >
                    {card.data.anoN}{" "}
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#64748b" }}>
                      MZN
                    </span>
                  </Typography>
                </div>

                <Box
                  sx={{
                    pt: 1.25,
                    mt: 1,
                    borderTop: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontSize: "0.74rem", color: "#64748b" }}>
                    Ano N-1: <strong style={{ color: "#334155" }}>{card.data.anoN1}</strong>
                  </Typography>
                  {renderTrendBadge(card.data.trend, card.data.variacao)}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Row 2: Execution Ratio by Budget Category (Donut Gauges) */}
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: "14px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            flexWrap="wrap"
            gap={1}
          >
            <div>
              <Typography
                sx={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}
              >
                Taxa de Execução por Categoria Orçamental
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>
                Proporção entre o saldo disponível e o montante executado no exercício activo
              </Typography>
            </div>
          </Box>

          <Grid container spacing={2}>
            {(dashboardDataSecondSection || []).map((chart, index) => {
              const saldo = Number(chart.saldo || 0);
              const exec = Number(chart.exec || 0);
              const isEmpty = saldo + exec === 0;

              return (
                <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                  <Box
                    sx={{
                      p: 1.75,
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      textAlign: "center",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "#1e293b",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {chart.name}
                    </Typography>

                    <Box sx={{ width: "100%", height: 135, position: "relative" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={
                              isEmpty
                                ? [{ name: "Sem Dotação", value: 100 }]
                                : [
                                    { name: "Executado", value: exec },
                                    { name: "Disponível", value: saldo },
                                  ]
                            }
                            cx="50%"
                            cy="50%"
                            innerRadius={38}
                            outerRadius={54}
                            paddingAngle={isEmpty ? 0 : 2}
                            dataKey="value"
                            stroke="none"
                          >
                            {isEmpty ? (
                              <Cell fill="#e2e8f0" />
                            ) : (
                              <>
                                <Cell key="exec" fill={chart.color} />
                                <Cell key="saldo" fill="#cbd5e1" />
                              </>
                            )}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, ""]} />
                        </PieChart>
                      </ResponsiveContainer>
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          textAlign: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.92rem",
                            fontWeight: 800,
                            color: "#0f172a",
                            lineHeight: 1,
                          }}
                        >
                          {exec.toFixed(0)}%
                        </Typography>
                        <Typography sx={{ fontSize: "0.65rem", color: "#64748b" }}>
                          Exec.
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      mt={1}
                      pt={1}
                      borderTop="1px solid #e2e8f0"
                    >
                      <span style={{ fontSize: "11px", color: "#475569", fontWeight: 600 }}>
                        Saldo: <strong style={{ color: "#0f172a" }}>{saldo}%</strong>
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: chart.color,
                          fontWeight: 700,
                        }}
                      >
                        Exec: {exec}%
                      </span>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Card>

        {/* Row 3: 6 Analytical Sections in Clean 2-Column Enterprise Grid */}
        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                height: "100%",
                borderRadius: "14px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
              }}
            >
              <Box mb={2}>
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                  Orçamento Disponível por Rubrica
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Comparativo entre o exercício actual (Ano N) e o exercício anterior (Ano N-1)
                </Typography>
              </Box>
              {budgetData && <BudgetAvailable budgetData={budgetData} />}
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                height: "100%",
                borderRadius: "14px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
              }}
            >
              <Box mb={2}>
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                  Fólio Geral — Fluxo de Tesouraria
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Volume acumulado de recebimentos e pagamentos registados no período
                </Typography>
              </Box>
              <GeneralFolio data={generalFolio} />
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                height: "100%",
                borderRadius: "14px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
              }}
            >
              <Box mb={2}>
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                  Execução Orçamental vs. Requisições Emitidas
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Rácio de liquidação de requisições de fundos face ao total requisitado
                </Typography>
              </Box>
              <MounthExecution data={budgectExecution} />
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                height: "100%",
                borderRadius: "14px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
              }}
            >
              <Box mb={2}>
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                  Evolução Mensal — Saldo Orçamental e Bancário
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Curva de liquidez bancária comparada à disponibilidade orçamental
                </Typography>
              </Box>
              <BudgetBankBalance />
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                height: "100%",
                borderRadius: "14px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
              }}
            >
              <Box mb={2}>
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                  Contas a Pagar e a Receber
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Balanço de obrigações a fornecedores e direitos a receber
                </Typography>
              </Box>
              <AccountsToPayReceive data={accountData} />
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                height: "100%",
                borderRadius: "14px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
              }}
            >
              <Box mb={2}>
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                  Variações Cambiais
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Impacto de diferenças cambiais favoráveis e desfavoráveis ao longo do exercício
                </Typography>
              </Box>
              <ExchangeRateVariations />
            </Card>
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
};

export default DashboardAlt3;
