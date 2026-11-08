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

const formatted = (value) =>
  Number(value || 0).toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const GeneralFolio = ({ data }) => {
  if (!data) {
    return (
      <div style={{ padding: "24px", color: "#64748b", textAlign: "center" }}>
        A carregar movimentos do Fólio Geral...
      </div>
    );
  }

  const {
    recebAnoAtual = 0,
    recebAnoAnterior = 0,
    pagAnoAtual = 0,
    pagAnoAnterior = 0,
  } = data;

  const calcularVariacao = (anoN1, anoN) => {
    if (!anoN1 || anoN1 === 0) {
      return anoN === 0 ? "0.00" : "100.00";
    }
    const variacao = ((anoN - anoN1) / Math.abs(anoN1)) * 100;
    return variacao.toFixed(2);
  };

  const variacaoReceb = calcularVariacao(recebAnoAnterior, recebAnoAtual);
  const variacaoPag = calcularVariacao(pagAnoAnterior, pagAnoAtual);
  const saldoAtual = Number(recebAnoAtual) - Number(pagAnoAtual);
  const saldoAnterior = Number(recebAnoAnterior) - Number(pagAnoAnterior);

  const chartData = [
    {
      categoria: "Exercício Actual (Ano N)",
      Recebimentos: Number(recebAnoAtual || 0),
      Pagamentos: Number(pagAnoAtual || 0),
    },
    {
      categoria: "Exercício Anterior (Ano N-1)",
      Recebimentos: Number(recebAnoAnterior || 0),
      Pagamentos: Number(pagAnoAnterior || 0),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div className="table-responsive">
        <table className="transparent-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Movimento Financeiro</th>
              <th style={{ textAlign: "right" }}>Ano Actual (MZN)</th>
              <th style={{ textAlign: "right" }}>Ano Anterior (MZN)</th>
              <th style={{ textAlign: "right" }}>Variação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 500 }}>Recebimentos</td>
              <td style={{ textAlign: "right", fontWeight: 600, color: "#059669" }}>
                {formatted(recebAnoAtual)}
              </td>
              <td style={{ textAlign: "right", color: "#64748b" }}>
                {formatted(recebAnoAnterior)}
              </td>
              <td style={{ textAlign: "right", fontWeight: 600 }}>
                {variacaoReceb}%
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 500 }}>Pagamentos</td>
              <td style={{ textAlign: "right", fontWeight: 600, color: "#1e40af" }}>
                {formatted(pagAnoAtual)}
              </td>
              <td style={{ textAlign: "right", color: "#64748b" }}>
                {formatted(pagAnoAnterior)}
              </td>
              <td style={{ textAlign: "right", fontWeight: 600 }}>
                {variacaoPag}%
              </td>
            </tr>
            <tr style={{ backgroundColor: "#f8fafc" }}>
              <td style={{ fontWeight: 700, color: "#0f172a" }}>Saldo do Período</td>
              <td style={{ textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                {formatted(saldoAtual)}
              </td>
              <td style={{ textAlign: "right", fontWeight: 700, color: "#475569" }}>
                {formatted(saldoAnterior)}
              </td>
              <td style={{ textAlign: "right", fontWeight: 700 }}>
                {calcularVariacao(saldoAnterior, saldoAtual)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ width: "100%", height: 290 }}>
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
              formatter={(value) => [`${formatted(value)} MZN`, ""]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />
            <Bar
              dataKey="Recebimentos"
              fill="#059669"
              name="Recebimentos"
              radius={[6, 6, 0, 0]}
              barSize={38}
            />
            <Bar
              dataKey="Pagamentos"
              fill="#1e40af"
              name="Pagamentos"
              radius={[6, 6, 0, 0]}
              barSize={38}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GeneralFolio;
