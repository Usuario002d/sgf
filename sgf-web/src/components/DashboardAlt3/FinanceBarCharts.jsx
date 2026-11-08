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

// Dados do gráfico com strings formatadas
const data = [
  { name: "Banco - Recepção em Dólares", Disponivel: "12.564,00", Entradas: "13.697,00", Saidas: "1.269,00", Tesouraria: "24.992,00" },
  { name: "Banco - Funcionamento", Disponivel: "15.223,00", Entradas: "16.356,00", Saidas: "3.928,00", Tesouraria: "27.651,00" },
  { name: "Banco - Receita Consular", Disponivel: "19.028,75", Entradas: "20.445,00", Saidas: "4.910,00", Tesouraria: "34.563,75" },
  { name: "Banco - Emolumento Consular", Disponivel: "24.727,11", Entradas: "40.343,00", Saidas: "254.698,00", Tesouraria: "-189.627,89" },
  { name: "Fólio Global Actual", Disponivel: "71.542,86", Entradas: "90.841,00", Saidas: "264.805,00", Tesouraria: "-102.421,14" },
  { name: "Fólio Global Anterior", Disponivel: "98.649,36", Entradas: "75.979,36", Saidas: "326.598,36", Tesouraria: "-151.969,64" },
  { name: "Variação", Disponivel: "-27.106,50", Entradas: "14.861,64", Saidas: "61.793,36", Tesouraria: "49.548,50" },
];

// Função para converter string formatada para número real
const parseFormattedNumber = (str) => {
  if (!str) return 0;
  return parseFloat(str.replace(/\./g, "").replace(",", "."));
};

// Função para formatar número para exibição no tooltip
const formatTooltip = (value) =>
  new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const BarCharts = () => {
  // Converter os dados com os valores numéricos temporariamente para o gráfico
  const chartData = data.map((item) => ({
    ...item,
    Disponivel: parseFormattedNumber(item.Disponivel),
    Entradas: parseFormattedNumber(item.Entradas),
    Saidas: parseFormattedNumber(item.Saidas),
    Tesouraria: parseFormattedNumber(item.Tesouraria),
  }));

  return (
    <>
      {/* Tabela lateral com strings formatadas */}
      <div style={styles.container}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead><tr><th style={{ border: "none" }}>Descrição</th></tr></thead>
            <tbody>
              <tr><td style={styles.td}>Saldo Inicial</td></tr>
              <tr><td style={styles.td}>Recebimentos</td></tr>
              <tr><td style={styles.td}>Pagamentos</td></tr>
              <tr><td style={styles.td}>Saldo Final</td></tr>
            </tbody>
          </table>
        </div>

        {data.map((item, index) => (
          <div key={index} style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>{item.name}</th></tr></thead>
              <tbody>
                <tr><td style={styles.td}>{item.Disponivel}</td></tr>
                <tr><td style={styles.td}>{item.Entradas}</td></tr>
                <tr><td style={styles.td}>{item.Saidas}</td></tr>
                <tr><td style={styles.td}>{item.Tesouraria}</td></tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ResponsiveContainer width="95%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 50, right: 20, left: 40, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name"
              tick={{ fontSize: 14, fill: '#000', fontWeight: 'bold' }}

            />
            <YAxis
              domain={[-200000, 400000]}
              tickFormatter={formatTooltip}
              tickCount={9}
              tick={{ fontSize: 14, fill: '#000', fontWeight: 'bold' }}
            />
            <Tooltip
              formatter={(value) => formatTooltip(value)}
              contentStyle={{ fontSize: 14, fill: '#000', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: 14, fontWeight: 'bold' }} />
            <Bar dataKey="Disponivel" fill="#0767f7" name="Disponível inicial"
            />
            <Bar dataKey="Entradas" fill="#fdae05" name="Entradas" />
            <Bar dataKey="Saidas" fill="#3f4546" name="Saídas" />
            <Bar dataKey="Tesouraria" fill="#fc5e03" name="Tesouraria" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "flex-start",
    gap: "2px",
    marginLeft: "50px",
  },
  tableWrapper: {
    flex: "0 0 auto",
    width: "200px",
    border: "1px solid #ccc",
    padding: "5px",
    backgroundColor: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "16px",
  },
  th: {
    padding: "6px",
    textAlign: "center",
    border: "1px solid #ddd",
    color: "#000",
    fontWeight: "bold",
    backgroundColor: "#ffffff",
  },
  td: {
    padding: "6px",
    textAlign: "left",
    border: "1px solid #ddd",
    color: "#000",
    backgroundColor: "#e0e0e0",
  },
};

export default BarCharts;
