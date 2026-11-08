import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const formatVal = (val) =>
  Number(val || 0).toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const AccountsToPayReceive = ({ data }) => {
  if (!data) {
    return (
      <div style={{ padding: "24px", color: "#64748b", textAlign: "center" }}>
        A carregar obrigações e recebíveis...
      </div>
    );
  }

  const accountsToPay = data.accountsToPay || { currentYear: 0, previousYear: 0, total: 0 };
  const accountsToReceive = data.accountsToReceive || { currentYear: 0, previousYear: 0, total: 0 };

  const calcularVariacao = (anoN1, anoN) => {
    if (!anoN1 || anoN1 === 0) {
      return anoN === 0 ? "0.00" : "100.00";
    }
    const variacao = ((anoN - anoN1) / Math.abs(anoN1)) * 100;
    return variacao.toFixed(2);
  };

  const variacaoContasPagar = calcularVariacao(
    accountsToPay.previousYear,
    accountsToPay.currentYear
  );
  const variacaoContasReceber = calcularVariacao(
    accountsToReceive.previousYear,
    accountsToReceive.currentYear
  );

  const chartData = [
    {
      categoria: "Exercício Actual (Ano N)",
      Contas_Pagar: Number(accountsToPay.currentYear || 0),
      Contas_a_Receber: Number(accountsToReceive.currentYear || 0),
    },
    {
      categoria: "Exercício Anterior (Ano N-1)",
      Contas_Pagar: Number(accountsToPay.previousYear || 0),
      Contas_a_Receber: Number(accountsToReceive.previousYear || 0),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div className="table-responsive">
        <table className="transparent-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Natureza</th>
              <th style={{ textAlign: "right" }}>Ano N (MZN)</th>
              <th style={{ textAlign: "right" }}>Ano N-1 (MZN)</th>
              <th style={{ textAlign: "right" }}>Variação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 500 }}>Contas a Pagar</td>
              <td style={{ textAlign: "right", fontWeight: 600 }}>
                {formatVal(accountsToPay.currentYear)}
              </td>
              <td style={{ textAlign: "right", color: "#64748b" }}>
                {formatVal(accountsToPay.previousYear)}
              </td>
              <td style={{ textAlign: "right", fontWeight: 600, color: "#d97706" }}>
                {variacaoContasPagar}%
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 500 }}>Contas a Receber</td>
              <td style={{ textAlign: "right", fontWeight: 600 }}>
                {formatVal(accountsToReceive.currentYear)}
              </td>
              <td style={{ textAlign: "right", color: "#64748b" }}>
                {formatVal(accountsToReceive.previousYear)}
              </td>
              <td style={{ textAlign: "right", fontWeight: 600, color: "#059669" }}>
                {variacaoContasReceber}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ width: "100%", height: 270 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="categoria" tick={{ fontSize: 12, fill: "#334155" }} />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={(v) =>
                v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v.toLocaleString("pt-PT")
              }
            />
            <Tooltip
              formatter={(value) => [`${formatVal(value)} MZN`, ""]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />
            <Bar
              dataKey="Contas_Pagar"
              fill="#d97706"
              name="Contas a Pagar"
              radius={[6, 6, 0, 0]}
              barSize={38}
            />
            <Bar
              dataKey="Contas_a_Receber"
              fill="#1e40af"
              name="Contas a Receber"
              radius={[6, 6, 0, 0]}
              barSize={38}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AccountsToPayReceive;
