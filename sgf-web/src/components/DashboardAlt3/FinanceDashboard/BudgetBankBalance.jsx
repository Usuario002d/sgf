import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { categoria: "Jan", Saldo_Orçamental: 7879468.6, Saldo_Bancário: 4189468.0 },
  { categoria: "Fev", Saldo_Orçamental: 3958364.0, Saldo_Bancário: 5098364.0 },
  { categoria: "Mar", Saldo_Orçamental: 1983696.5, Saldo_Bancário: 3469836.5 },
  { categoria: "Abr", Saldo_Orçamental: 989658.35, Saldo_Bancário: 2489658.35 },
  { categoria: "Mai", Saldo_Orçamental: 2260594.69, Saldo_Bancário: 3705946.69 },
  { categoria: "Jun", Saldo_Orçamental: 2646898.6, Saldo_Bancário: 4189468.0 },
  { categoria: "Jul", Saldo_Orçamental: 7835364.0, Saldo_Bancário: 5098364.0 },
  { categoria: "Ago", Saldo_Orçamental: 1983696.5, Saldo_Bancário: 3469836.5 },
  { categoria: "Set", Saldo_Orçamental: 988965.35, Saldo_Bancário: 2489658.35 },
  { categoria: "Out", Saldo_Orçamental: 2246059.69, Saldo_Bancário: 3705946.69 },
  { categoria: "Nov", Saldo_Orçamental: 988965.35, Saldo_Bancário: 2489658.35 },
  { categoria: "Dez", Saldo_Orçamental: 2059462.69, Saldo_Bancário: 3705946.69 },
];

const BudgetBankBalance = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div className="table-responsive">
        <table className="transparent-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Descrição</th>
              <th style={{ textAlign: "right" }}>Ano N (MZN)</th>
              <th style={{ textAlign: "right" }}>Ano N-1 (MZN)</th>
              <th style={{ textAlign: "right" }}>Variação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 500 }}>Saldo Orçamental</td>
              <td style={{ textAlign: "right", fontWeight: 600 }}>5.798.678,37</td>
              <td style={{ textAlign: "right", color: "#64748b" }}>3.452.980,37</td>
              <td style={{ textAlign: "right", fontWeight: 600, color: "#059669" }}>
                +67,93%
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 500 }}>Saldo Bancário</td>
              <td style={{ textAlign: "right", fontWeight: 600 }}>2.136.453,69</td>
              <td style={{ textAlign: "right", color: "#64748b" }}>2.469.536,90</td>
              <td style={{ textAlign: "right", fontWeight: 600, color: "#e11d48" }}>
                -13,49%
              </td>
            </tr>
            <tr style={{ backgroundColor: "#f8fafc" }}>
              <td style={{ fontWeight: 700, color: "#0f172a" }}>Diferencial Líquido</td>
              <td style={{ textAlign: "right", fontWeight: 700 }}>3.662.224,68</td>
              <td style={{ textAlign: "right", fontWeight: 700, color: "#475569" }}>
                983.443,47
              </td>
              <td style={{ textAlign: "right", fontWeight: 700, color: "#059669" }}>
                +272,39%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ width: "100%", height: 290 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 8 }}>
            <defs>
              <linearGradient id="colorOrc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e40af" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBank" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="Saldo_Orçamental"
              stroke="#1e40af"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOrc)"
              name="Saldo Orçamental"
            />
            <Area
              type="monotone"
              dataKey="Saldo_Bancário"
              stroke="#059669"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBank)"
              name="Saldo Bancário"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BudgetBankBalance;
