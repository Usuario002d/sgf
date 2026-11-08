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

const MounthExecution = ({ data }) => {
  if (!data) {
    return (
      <div style={{ padding: "24px", color: "#64748b", textAlign: "center" }}>
        A carregar dados de execução...
      </div>
    );
  }

  const emitted = data.emittedRequests || { currentYear: 0, previousYear: 0 };
  const paid = data.paidRequests || { currentYear: 0, previousYear: 0 };

  const calcularVariacao = (anoN1, anoN) => {
    if (!anoN1 || anoN1 === 0) {
      return anoN === 0 ? "0.00" : "100.00";
    }
    const variacao = ((anoN - anoN1) / Math.abs(anoN1)) * 100;
    return variacao.toFixed(2);
  };

  const valoresTabela = [
    {
      descricao: "Requisições Emitidas",
      anoN: Number(emitted.currentYear || 0),
      anoN1: Number(emitted.previousYear || 0),
      variacao: calcularVariacao(emitted.previousYear, emitted.currentYear),
    },
    {
      descricao: "Execução Orçamental (Pagas)",
      anoN: Number(paid.currentYear || 0),
      anoN1: Number(paid.previousYear || 0),
      variacao: calcularVariacao(paid.previousYear, paid.currentYear),
    },
    {
      descricao: "Saldo por Liquidar",
      anoN: Number(emitted.currentYear || 0) - Number(paid.currentYear || 0),
      anoN1: Number(emitted.previousYear || 0) - Number(paid.previousYear || 0),
      variacao: calcularVariacao(
        Number(emitted.previousYear || 0) - Number(paid.previousYear || 0),
        Number(emitted.currentYear || 0) - Number(paid.currentYear || 0)
      ),
    },
  ];

  const chartData = [
    {
      categoria: "Exercício Actual (Ano N)",
      Requisições_Emitidas: Number(emitted.currentYear || 0),
      Execução_Orçamental: Number(paid.currentYear || 0),
    },
    {
      categoria: "Exercício Anterior (Ano N-1)",
      Requisições_Emitidas: Number(emitted.previousYear || 0),
      Execução_Orçamental: Number(paid.previousYear || 0),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div className="table-responsive">
        <table className="transparent-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Indicador</th>
              <th style={{ textAlign: "right" }}>Ano N (MZN)</th>
              <th style={{ textAlign: "right" }}>Ano N-1 (MZN)</th>
              <th style={{ textAlign: "right" }}>Variação</th>
            </tr>
          </thead>
          <tbody>
            {valoresTabela.map((linha, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: idx === 2 ? 700 : 500 }}>{linha.descricao}</td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>
                  {formatVal(linha.anoN)}
                </td>
                <td style={{ textAlign: "right", color: "#64748b" }}>
                  {formatVal(linha.anoN1)}
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 600,
                    color: Number(linha.variacao) >= 0 ? "#059669" : "#e11d48",
                  }}
                >
                  {linha.variacao}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ width: "100%", height: 290 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 12, right: 20, left: 10, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="categoria" tick={{ fontSize: 12, fontWeight: 500, fill: "#334155" }} />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={(value) =>
                value >= 1000000
                  ? `${(value / 1000000).toFixed(1)}M`
                  : value.toLocaleString("pt-PT")
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
              dataKey="Requisições_Emitidas"
              fill="#1e40af"
              name="Requisições Emitidas"
              radius={[6, 6, 0, 0]}
              barSize={38}
            />
            <Bar
              dataKey="Execução_Orçamental"
              fill="#059669"
              name="Execução Orçamental"
              radius={[6, 6, 0, 0]}
              barSize={38}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MounthExecution;
