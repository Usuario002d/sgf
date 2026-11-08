import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import { PieChart, Pie, Cell } from "recharts";


export const ExecutionBudgetDataCharts = () => {
    //Titulos das Tabelas
    const tableTitles = [
        "Global",
        "Pessoal",
        "Bens e Serviços",
        "Transferências Correntes",
        "Exercícios Findos",
        "Capital",
    ];
    // Dados para os gráficos circulares
    const COLORS = ["#FF8042", "#0088FE"];

    const dataCharts = [
        { name: "Globais", saldo: 65, exec: 35 },
        { name: "Pessoal", saldo: 60, exec: 40 },
        { name: "Bens e Serviços", saldo: 70, exec: 30 },
        { name: "Transferências Correntes", saldo: 65, exec: 35 },
        { name: "Exercícios Findos", saldo: 80, exec: 20 },
        { name: "Capital", saldo: 65, exec: 35 },
    ];
    return (
        <div>
            <div style={styles.container}>
                <h4 style={styles.title}><strong>EXECUÇÃO ORÇAMENTAL DA DESPESA</strong></h4>
                <div style={styles.tableWrapper}>
                    {tableTitles.map((title, index) => (
                        <table key={index} style={styles.table}>
                            <thead>
                                <tr>
                                    <th colSpan={4} style={styles.tableHeader}>{title}</th>
                                </tr>
                                <tr>
                                    <th style={{ border: 'none' }}>Ano</th>
                                    <th style={{ border: 'none' }}>Valor</th>
                                    <th style={{ border: 'none' }}>Saldo</th>
                                    <th style={{ border: 'none' }}>% Exec.</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ border: 'none' }}>N</td>
                                    <td style={{ border: 'none' }}></td>
                                    <td style={{ border: 'none' }}></td>
                                    <td style={{ border: 'none' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ border: 'none' }}>N-1</td>
                                    <td style={{ border: 'none' }}></td>
                                    <td style={{ border: 'none' }}></td>
                                    <td style={{ border: 'none' }}></td>
                                </tr>
                            </tbody>
                        </table>
                    ))}
                </div>
            </div>
            <div style={{ padding: '10px', color: '#fff' }}>
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: "20px",
                        padding: "20px",
                        borderRadius: "10px",
                        color: 'black',
                    }}
                >
                    {dataCharts.map((chart, index) => (
                        <div
                            key={index}
                            style={{
                                width: "30%",
                                maxWidth: "250px",
                                textAlign: "center",
                                margin: "10px 0",
                                backgroundColor: "#ffffff",
                                borderRadius: "8px",
                                padding: "10px",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            }}
                        >
                            <p><strong>{chart.name}</strong></p>
                            <PieChart width={220} height={220}>
                                <Pie
                                    data={[
                                        { name: "Saldo", value: chart.saldo },
                                        { name: "Execução", value: chart.exec },
                                    ]}
                                    cx="55%"
                                    cy="55%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    labelLine={false}
                                    label={({ name, value }) => `${value}%`}
                                >
                                    <Cell key={`cell-0`} fill={COLORS[0]} />
                                    <Cell key={`cell-1`} fill={COLORS[1]} />
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
const styles = {
    container: {
      display: 'flex',
      justifyContent: 'flex-start', // Mantém as tabelas alinhadas à esquerda
      gap: '5px', // Espaçamento reduzido entre as tabelas
    },
    tableWrapper: {
      flex: '0 0 auto', // Impede que o tamanho do wrapper se ajuste automaticamente
      width: '200px', // Largura fixa para as tabelas
      border: '1px solid #ccc',
      padding: '5px', // Reduz o preenchimento interno
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '16px', // Aumenta o tamanho da fonte
    },
    th: {
      padding: '6px', // Aumenta o espaço interno
      textAlign: 'center',
      border: '1px solid #ddd',
      color: '#000', // Torna o texto preto
      fontWeight: 'bold', // Destaca o texto
    },
    td: {
      padding: '6px', // Aumenta o espaço interno
      textAlign: 'center',
      border: '1px solid #ddd',
      color: '#000', // Torna o texto preto
    },
  };
export default ExecutionBudgetDataCharts;