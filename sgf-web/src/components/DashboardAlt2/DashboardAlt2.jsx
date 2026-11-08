import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Legend, Tooltip } from "chart.js";
import { PieChart, Pie, Cell } from "recharts";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col, Table, Container } from "react-bootstrap";


ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip);

function DashboardAlt2() {

    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1px',
            flexWrap: 'wrap',
        },
        tableWrapper: {
            flex: 1,
            minWidth: '300px', // Ajuste o tamanho mínimo de cada tabela
            maxWidth: '600px', // Ajuste o tamanho máximo de cada tabela
            overflow: 'auto', // Permite rolar se a tabela for maior que o espaço disponível
            border: '1px solid #ccc',
            padding: '10px',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
        },
        th: {
            padding: '8px',
            textAlign: 'left',
            border: '1px solid #ddd',
        },
        td: {
            padding: '8px',
            textAlign: 'left',
            border: '1px solid #ddd',
        },
    };

    // Dados para os gráficos
    const chartData = {
        labels: ["Ano N", "Ano N-1"],
        datasets: [
            {
                label: "Despesas com Pessoal",
                data: [819845, 919845],
                backgroundColor: "rgba(8, 103, 245, 0.6)",
            },
            {
                label: "Bens e Serviços",
                data: [432630, 832630],
                backgroundColor: "rgba(243, 126, 8, 0.6)",
            },
            {
                label: "Transferências Correntes",
                data: [104280, 404280],
                backgroundColor: "rgba(0, 167, 22, 0.6)",
            },
            {
                label: "Exercícios Findos",
                data: [128102, 328102],
                backgroundColor: "rgba(175, 137, 49, 0.6)",
            },
            {
                label: "Despesas de Capital",
                data: [387377, 987377],
                backgroundColor: "rgba(72, 200, 218, 0.6)",
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: "bottom" },
        },
    };

    // Dados para os gráficos circulares
    const COLORS = ["#FF8042", "#0088FE"];

    const dataCharts = [
        { name: "Despesas com Pessoal", saldo: 60, exec: 40 },
        { name: "Bens e Serviços", saldo: 70, exec: 30 },
        { name: "Transferências Correntes", saldo: 50, exec: 50 },
        { name: "Exercícios Findos", saldo: 80, exec: 20 },
        { name: "Despesas de Capital", saldo: 65, exec: 35 },
        { name: "Gastos Globais", saldo: 65, exec: 35 },
    ];

    // Dados para os gráfico de barras (positivo/negativo)
    const data = [
        { name: "Banco A", DisponivelInicial: 10000, Entradas: 20000, Saidas: 15000, Tesouraria: -5000 },
        { name: "Banco B", DisponivelInicial: 20000, Entradas: 30000, Saidas: 25000, Tesouraria: 10000 },
        { name: "Banco C", DisponivelInicial: 15000, Entradas: 25000, Saidas: 20000, Tesouraria: 5000 },
        { name: "Banco D", DisponivelInicial: 10000, Entradas: 15000, Saidas: 20000, Tesouraria: -5000 },
        { name: "Global", DisponivelInicial: 50000, Entradas: 90000, Saidas: 80000, Tesouraria: 10000 },
        { name: "Anterior", DisponivelInicial: 30000, Entradas: 60000, Saidas: 50000, Tesouraria: 10000 },
    ];

    return (
        <>
            <div style={{ padding: "20px" }}>
                <h3 style={{ textAlign: "center" }}>Orçamento Anual</h3>
                {/* Gráficos */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between", // Espaçamento entre os gráficos
                        alignItems: "center",
                        flexWrap: "nowrap", // Mantém todos os gráficos na mesma linha
                        overflowX: "auto", // Permite rolagem horizontal caso necessário
                    }}
                >
                    <div style={{ width: "23%" }}>

                    </div>
                    <div style={{ width: "23%" }}>
                        <h3 style={{ textAlign: "center" }}>Dotação Inicial</h3>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                    <div style={{ width: "23%" }}>
                        <h3 style={{ textAlign: "center" }}>Dotação Final</h3>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                    <div style={{ width: "23%" }}>
                        <h3 style={{ textAlign: "center" }}>Reservas</h3>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                    <div style={{ width: "23%" }}>
                        <h3 style={{ textAlign: "center" }}>Orçamento Disponível</h3>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>
            <div style={styles.container}>
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                            </tr>
                            <tr>
                                <th>Designação</th>

                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Despesas com o Pessoal</td>
                            </tr>
                            <tr>
                                <td>Bens e Serviços</td>
                            </tr>
                            <tr>
                                <td>Transferências Correntes</td>
                            </tr>
                            <tr>
                                <td>Exercícios Findos</td>
                            </tr>
                            <tr>
                                <td>Despesas de Capital</td>
                            </tr>
                            <tr>
                                <td>Total</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th colSpan={3}>Dotação Inicial</th>
                            </tr>
                            <tr>
                                <th>Ano N</th>
                                <th>Ano N-1</th>
                                <th>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th colSpan={3}>Dotação Final</th>
                            </tr>
                            <tr>
                                <th>Ano N</th>
                                <th>Ano N-1</th>
                                <th>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th colSpan={3}>Reservas</th>
                            </tr>
                            <tr>
                                <th>Ano N</th>
                                <th>Ano N-1</th>
                                <th>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th colSpan={3}>Orçamento Disponível </th>
                            </tr>
                            <tr>
                                <th>Ano N</th>
                                <th>Ano N-1</th>
                                <th>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div style={{ padding: '10px', color: '#fff' }}>
                <h5 style={{ textAlign: "center", color: "#333" }}>Execução Orçamental % - Janeiro</h5>
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
            <div style={styles.container}>
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                            </tr>
                            <tr>
                                <th>Descrição</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Despesas com o Pessoal</td>
                            </tr>
                            <tr>
                                <td>Bens e Serviços</td>
                            </tr>
                            <tr>
                                <td>Transferências Correntes</td>
                            </tr>
                            <tr>
                                <td>Exercícios Findos</td>
                            </tr>
                            <tr>
                                <td>Despesas de Capital</td>
                            </tr>
                            <tr>
                                <td>Gastos Globais </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th colSpan={3}>Ano N</th>
                            </tr>
                            <tr>
                                <th>Execução </th>
                                <th>Saldo</th>
                                <th>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th colSpan={3}>Ano N-1</th>
                            </tr>
                            <tr>
                                <th>Execução </th>
                                <th>Saldo</th>
                                <th>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                            <tr>
                                <td>#</td>
                                <td>#</td>
                                <td>#</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div style={{ padding: '10px', color: '#fff' }}>
                <h5 style={{ textAlign: "center", color: "#333" }}>Fluxos Financeiros</h5>
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
                </div>
            </div>
            <div>
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>Descrição</th>
                                <th>Banco A</th>
                                <th>Banco B</th>
                                <th>Banco C</th>
                                <th>Banco D</th>
                                <th>Banco E</th>
                                <th>Global</th>
                                <th>Global Anterior</th>
                                <th>Variação</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Disponível inicial</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Entradas</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Saídas</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Tesouraria</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default DashboardAlt2;
