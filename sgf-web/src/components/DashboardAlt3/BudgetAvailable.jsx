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

const BudgetAvailable = ({ budgetData }) => {
  const curr = budgetData?.currentYear || {};
  const prev = budgetData?.previousYear || {};

  const data = [
    {
      categoria: "Despesas c/ Pessoal",
      anoN: Number(curr.personnel || 0),
      anoN1: Number(prev.personnel || 0),
    },
    {
      categoria: "Bens e Serviços",
      anoN: Number(curr.goodsAndServices || 0),
      anoN1: Number(prev.goodsAndServices || 0),
    },
    {
      categoria: "Transf. Correntes",
      anoN: Number(curr.currentTransfers || 0),
      anoN1: Number(prev.currentTransfers || 0),
    },
    {
      categoria: "Exercícios Findos",
      anoN: Number(curr.pastExercises || 0),
      anoN1: Number(prev.pastExercises || 0),
    },
    {
      categoria: "Despesas de Capital",
      anoN: Number(curr.capitalExpenses || 0),
      anoN1: Number(prev.capitalExpenses || 0),
    },
  ];

  const calcularVariacao = (anoN, anoN1) => {
    if (!anoN1 || anoN1 === 0) {
      return anoN === 0 ? "0.00" : "100.00";
    }
    return (((anoN - anoN1) / Math.abs(anoN1)) * 100).toFixed(2);
  };

  const totalAnoN = data.reduce((acc, item) => acc + item.anoN, 0);
  const totalAnoN1 = data.reduce((acc, item) => acc + item.anoN1, 0);
  const variacaoGlobal = calcularVariacao(totalAnoN, totalAnoN1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div className="table-responsive">
        <table className="transparent-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Rubrica Orçamental</th>
              <th style={{ textAlign: "right" }}>Ano N (MZN)</th>
              <th style={{ textAlign: "right" }}>Ano N-1 (MZN)</th>
              <th style={{ textAlign: "right" }}>Variação</th>
            </tr>
          </thead>
          <tbody>
            {data.map((linha, idx) => {
              const v = calcularVariacao(linha.anoN, linha.anoN1);
              return (
                <tr key={idx}>
                  <td style={{ fontWeight: 500 }}>{linha.categoria}</td>
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
                      color: Number(v) >= 0 ? "#059669" : "#e11d48",
                    }}
                  >
                    {v}%
                  </td>
                </tr>
              );
            })}
            <tr style={{ backgroundColor: "#f8fafc" }}>
              <td style={{ fontWeight: 700, color: "#0f172a" }}>Total Global</td>
              <td style={{ textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                {formatVal(totalAnoN)}
              </td>
              <td style={{ textAlign: "right", fontWeight: 700, color: "#475569" }}>
                {formatVal(totalAnoN1)}
              </td>
              <td
                style={{
                  textAlign: "right",
                  fontWeight: 700,
                  color: Number(variacaoGlobal) >= 0 ? "#059669" : "#e11d48",
                }}
              >
                {variacaoGlobal}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ width: "100%", height: 290 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 24, left: 10, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={(v) =>
                v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v.toLocaleString("pt-PT")
              }
            />
            <YAxis
              dataKey="categoria"
              type="category"
              width={135}
              tick={{ fontSize: 12, fontWeight: 500, fill: "#334155" }}
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
            <Bar dataKey="anoN" fill="#1e40af" name="Exercício Actual (Ano N)" radius={[0, 4, 4, 0]} barSize={14} />
            <Bar dataKey="anoN1" fill="#94a3b8" name="Exercício Anterior (Ano N-1)" radius={[0, 4, 4, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BudgetAvailable;
