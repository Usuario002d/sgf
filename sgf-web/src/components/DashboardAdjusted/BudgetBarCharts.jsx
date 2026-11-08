import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import { PieChart, Pie, Cell } from "recharts";

const BudgetBarCharts = () => {
    const cardsData = [
        {
            title: "Global", anoN: "1,523,234.00", anoN_1: "2,583,234.00", variacao: "-41.03%",
        },
        {
            title: "Pessoal", anoN: "919,845.00", anoN_1: "819,845.00", variacao: "12.23%",
        },
        {
            title: "Bens e Serviços", anoN: "432,630.00", anoN_1: "832,630.00", variacao: "-48.05%",
        },
        {
            title: "Transferências Correntes", anoN: "104,280.00", anoN_1: "404,280.00", variacao: "-74.21%",
        },
        {
            title: "Exercícios Findos", anoN: "128,102.00", anoN_1: "328,102.00", variacao: "-60.95%",
        },
        { title: "Capital", anoN: "98,377.00", anoN_1: "38,377.00", variacao: "156.46%", },
    ];

    const chartData = [
        {
            name: "Global",
            anoN: 2583234,
            anoN_1: 1523234,
        },
        {
            name: "Capital",
            anoN: 98377,
            anoN_1: 38377,
        },
        {
            name: "Exercícios Findos",
            anoN: 328102,
            anoN_1: 128102,
        },
        {
            name: "Transferências Correntes",
            anoN: 104280,
            anoN_1: 404280,
        },

        {
            name: "Bens e Serviços",
            anoN: 432630,
            anoN_1: 832630,
        },

        {
            name: "Pessoal",
            anoN: 919845,
            anoN_1: 819845,
        },
    ];
    return (
        <div>
            <div>
                <h4 style={{ textAlign: "center", marginTop: "20px", color: "#000000", }}><strong>ORÇAMENTO ANUAL DA DESPESA</strong></h4>
                <div style={styles.tableWrapper}>
                    {cardsData.map((item, index) => (
                        <table key={index} style={styles.table}>
                            <thead>
                                <tr>
                                    <th colSpan={4} style={styles.tableHeader}>{item.title}</th>
                                </tr>
                                <tr>
                                    <th style={styles.th}>Ano</th>
                                    <th style={styles.th}></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={styles.td}>N</td>
                                    <td style={styles.td}>{item.anoN}</td>
                                </tr>
                                <tr>
                                    <td style={styles.td}>N-1</td>
                                    <td style={styles.td}>{item.anoN_1}</td>
                                </tr>
                                <tr>
                                    <td style={styles.td}>Variação %</td>
                                    <td style={styles.td}>{item.variacao}</td>
                                </tr>
                            </tbody>
                        </table>
                    ))}
                </div>
            </div>
            <ResponsiveContainer width="85%" height={400}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                    <XAxis
                        type="number"
                        ticks={[0, 500000, 1000000, 1500000, 2000000, 2500000, 3000000, 3500000, 4000000]}
                        tickFormatter={(value) => value.toLocaleString('pt-PT')}
                    />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip formatter={(value) => value.toLocaleString('pt-PT')} />
                    <Legend />
                    <Bar dataKey="anoN" fill="#3a484b" name="Ano N">
                        <LabelList dataKey="anoN" position="right" formatter={(value) => value.toLocaleString()} />
                    </Bar>
                    <Bar dataKey="anoN_1" fill="#ff7e05" name="Ano N-1">
                        <LabelList dataKey="anoN_1" position="right" formatter={(value) => value.toLocaleString()} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
const styles = {
    cardsContainer: {
        display: "flex",
        flexWrap: "wrap", // Permite que os itens se quebrem para a próxima linha, caso não caibam na linha actual
        gap: "16px", // Espaço entre os cartões
        justifyContent: "center",
    },
    card: {
        border: "none", // Remove bordas dos cartões para um visual mais limpo
        borderRadius: "8px", // Arredonda os cantos do cartão
        padding: "16px", // Adiciona um espaçamento interno (padding) ao redor do conteúdo do cartão
        width: "200px", // Define uma largura fixa para os cartões
        textAlign: "center",
        backgroundColor: "#f9f9f9", // Cor de fundo leve para os cartões
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Adiciona uma sombra sutil para dar profundidade aos cartões
    },
    container: {
        padding: "16px",
    },
    title: {
        textAlign: "center",
        fontSize: "20px",
        marginBottom: "16px",
        color: "#000000",
    },
    tableWrapper: {
        display: "flex", // Usa Flexbox para organizar as tabelas de forma flexível
        flexWrap: "wrap", // Permite que as tabelas se movam para uma nova linha se necessário
        gap: "16px", // Espaço entre as tabelas
        justifyContent: "center", // Centraliza as tabelas no container
    },
    table: {
        borderCollapse: "collapse",
        border: "none",
        width: "250px", // Define uma largura fixa para as tabelas
        backgroundColor: "#f9f9f9", // Cor de fundo leve para as tabelas
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Adiciona uma sombra sutil para dar profundidade à tabela
        borderRadius: "8px", // Arredonda os cantos da tabela
    },
    tableHeader: {
        fontWeight: "bold",
        fontSize: "16px",
        padding: "8px",
        textAlign: "center",
        backgroundColor: "#ffffff",
        color: "#000000",
        borderRadius: "8px 8px 0 0", // Arredonda os cantos superiores do cabeçalho
        border: "none", // Remove bordas do cabeçalho
    },
    th: {
        padding: "8px",
        textAlign: "left",
        fontWeight: "bold",
        fontSize: "14px",
        backgroundColor: "#f1f1f1",
        border: "none",
    },
    td: {
        padding: "8px",
        textAlign: "left",
        fontSize: "14px",
        border: "none",
    },
};
export default BudgetBarCharts;