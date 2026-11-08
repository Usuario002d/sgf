import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { categoria: "Jan", Favoráveis: 3000000, Não_Favoráveis: 2000000 },
  { categoria: "Fev", Favoráveis: 2500000, Não_Favoráveis: 2800000 },
  { categoria: "Mar", Favoráveis: 3100000, Não_Favoráveis: 2600000 },
  { categoria: "Abr", Favoráveis: 2700000, Não_Favoráveis: 2900000 },
  { categoria: "Mai", Favoráveis: 3500000, Não_Favoráveis: 3300000 },
  { categoria: "Jun", Favoráveis: 3200000, Não_Favoráveis: 3400000 },
  { categoria: "Jul", Favoráveis: 3700000, Não_Favoráveis: 3100000 },
  { categoria: "Ago", Favoráveis: 2900000, Não_Favoráveis: 3000000 },
  { categoria: "Set", Favoráveis: 3100000, Não_Favoráveis: 2700000 },
  { categoria: "Out", Favoráveis: 3300000, Não_Favoráveis: 3600000 },
  { categoria: "Nov", Favoráveis: 2800000, Não_Favoráveis: 2600000 },
  { categoria: "Dez", Favoráveis: 3500000, Não_Favoráveis: 3200000 },
];

const ExchangeRateVariations = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div className="table-responsive">
        <table className="transparent-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Diferenças Cambiais</th>
              <th style={{ textAlign: "right" }}>Ano N (MZN)</th>
              <th style={{ textAlign: "right" }}>Ano N-1 (MZN)</th>
              <th style={{ textAlign: "right" }}>Variação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 500 }}>Diferenças Favoráveis</td>
              <td style={{ textAlign: "right", fontWeight: 600, color: "#059669" }}>
                5.798.678,37
              </td>
              <td style={{ textAlign: "right", color: "#64748b" }}>3.452.980,37</td>
              <td style={{ textAlign: "right", fontWeight: 600, color: "#059669" }}>
                +67,93%
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 500 }}>Diferenças Desfavoráveis</td>
              <td style={{ textAlign: "right", fontWeight: 600, color: "#e11d48" }}>
                2.136.453,69
              </td>
              <td style={{ textAlign: "right", color: "#64748b" }}>2.469.536,90</td>
              <td style={{ textAlign: "right", fontWeight: 600, color: "#059669" }}>
                -13,49%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ width: "100%", height: 270 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="categoria" tick={{ fontSize: 11, fill: "#475569" }} />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              formatter={(value) => [
                `${Number(value).toLocaleString("pt-PT", { minimumFractionDigits: 2 })} MZN`,
                "",
              ]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />
            <Line
              type="monotone"
              dataKey="Favoráveis"
              stroke="#059669"
              strokeWidth={2.2}
              dot={{ r: 3 }}
              name="Favoráveis"
            />
            <Line
              type="monotone"
              dataKey="Não_Favoráveis"
              stroke="#64748b"
              strokeWidth={2.2}
              dot={{ r: 3 }}
              name="Desfavoráveis"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExchangeRateVariations;
