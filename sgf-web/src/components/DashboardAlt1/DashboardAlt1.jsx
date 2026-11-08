import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
//import Table from 'react-bootstrap/Table';

// Dados dos gráficos 2024
const data2024 = [
    { name: "Despesas com o Pessoal", value: 38 },
    { name: "Bens e Serviços", value: 38 },
    { name: "Transferências Correntes", value: 9 },
    { name: "Exercícios Findos", value: 11 },
    { name: "Despesas de Capital", value: 3 },
];

// Dados dos gráficos 2023
const data2023 = [
    { name: "Despesas com o Pessoal", value: 24 },
    { name: "Bens e Serviços", value: 38 },
    { name: "Transferências Correntes", value: 19 },
    { name: "Exercícios Findos", value: 15 },
    { name: "Despesas de Capital", value: 5 },
];
// Dados dos cards
const dataCharts = [
    { name: "Pessoal", saldo: 51, exec: 49 },
    { name: "Bens e Serviços", saldo: 73, exec: 27 },
    { name: "Transferências", saldo: 81, exec: 19 },
    { name: "Exercícios Findos", saldo: 82, exec: 18 },
    { name: "Capital", saldo: 16, exec: 84 },
    { name: "Gastos Globais", saldo: 61, exec: 39 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF4500"];


// Estilos básicos dos cartões
const cardStyle = {
    backgroundColor: "#ffffff",
    padding: "20px",
    margin: "10px",
    borderRadius: "8px",
    width: "150px",
    textAlign: "left",
};

// Estilos em React inline styles
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
       // backgroundColor: '#b88333',
    },
    tableWrapper: {
        flex: 1,
        minWidth: '300px', // Ajuste o tamanho mínimo de cada tabela
        maxWidth: '600px', // Ajuste o tamanho máximo de cada tabela
        overflow: 'auto', // Permite rolar se a tabela for maior que o espaço disponível
        border: '1px solid #ccc',
        padding: '10px',
        //backgroundColor: '#b88333',

    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        //backgroundColor: '#b88333',
    },
    th: {
        padding: '8px',
        textAlign: 'left',
        border: '1px solid #ddd',
       // backgroundColor: '#b88333',
    },
    td: {
        padding: '8px',
        textAlign: 'left',
        border: '1px solid #ddd',
    },
};


const DashboardAlt1 = () => {
    return (
        <>
            <div style={{ display: 'flex', padding: '20px', color: 'black', width: '1800px' }}>
                <div style={{ padding: '20px', color: 'black'}}>
                    <h5 style={{ textAlign: "center" }}>Orçamento Anual</h5>
                    {/* Secção de cartões */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-around",
                           
                            padding: "20px",
                            flexWrap: "wrap",
                            color: 'black',
                            width: '100%'
                            
                        }}
                    >
                        <div style={cardStyle}>
                            <p>Orçamento Global Ano N</p>
                            <div style={{ fontSize: "17px", marginBottom: "10px",  }}>1,078,144.00 MT</div>
                        </div>
                        <div style={cardStyle}>
                            <p>Orçamento Global Ano N – 1</p>
                            <div style={{ fontSize: "17px", marginBottom: "10px" }}>2,138,144.00 MT</div>
                        </div>
                        <div style={cardStyle}>
                            <p>Variação %</p>
                            <div style={{ fontSize: "17px", marginBottom: "10px" }}>49.58 %</div>
                        </div>
                    </div>

                    {/* Secção de gráficos */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-around",
                            //backgroundColor: "#b88333",
                            marginTop: "20px",
                            flexWrap: "wrap",
                            color: 'black',
                            width: '100%'
                        }}>
                        {/* Gráfico de 2024 */}
                        <div style={{ textAlign: "center" }}>
                            <p><strong>Ano N</strong></p>
                            <PieChart width={400} height={400}>
                                <Pie
                                    data={data2024}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    label={({ name, value }) => `${name}: ${value}%`}
                                    outerRadius={50}
                                    fill="#4eddb2"
                                    dataKey="value"
                                    animationDuration={3000}
                                >
                                    {data2024.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </div>

                        {/* Gráfico de 2023 */}
                        <div style={{ textAlign: "center" }}>
                            <p><strong>Ano N-1</strong></p>
                            <PieChart width={400} height={400}>
                                <Pie
                                    data={data2023}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    label={({ name, value }) => `${name}: ${value}%`}
                                    outerRadius={50}
                                    fill="#4eddb2"
                                    dataKey="value"
                                    animationDuration={3000}
                                >
                                    {data2023.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </div>
                    </div>
                </div>

                {/* Cards */}
                <div style={{ padding: '20px', color: '#fff' }}>
                    <h5 style={{ textAlign: "center", color: "#333" }}>Execução Orçamental % - Janeiro</h5>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            gap: "20px",
                           // backgroundColor: "#b88333",
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
                                    maxWidth: "350px",
                                    textAlign: "center",
                                    margin: "10px 0",
                                    backgroundColor: "#ffffff",
                                    borderRadius: "8px",
                                    padding: "10px",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                                }}
                            >
                                <p><strong>{chart.name}</strong></p>
                                <PieChart width={200} height={200}>
                                    <Pie
                                        data={[
                                            { name: "Saldo", value: chart.saldo },
                                            { name: "Execução", value: chart.exec },
                                        ]}
                                        cx="50%"
                                        cy="50%"
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
            
            <div style={styles.container}>
                <div style={styles.tableWrapper}>
                    <p><strong>Controlo Financeiro -Janeiro</strong></p>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>F. Financeiros</th>
                                <th>Janeiro 2024</th>
                                <th>Janeiro 2023</th>
                                <th>Variação</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Disponível Inicial</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Entradas</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Saídas</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Tesouraria</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Contas a Pagar</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Contas a Receber</td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={styles.tableWrapper}>
                <p><strong>Controlo Orçamental- Janeiro</strong></p>
                    <table style={styles.table}>
                
                        <thead>
                            <tr>
                                <th>Orçamento</th>
                                <th>Janeiro 2024</th>
                                <th>Janeiro 2023</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Execução</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Saldo</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Grau de Execução</td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                    <p><strong></strong></p>
                    <p><strong>Requisições - Janeiro</strong></p>
                    <table style={styles.table}>
                   
                        <thead>
                            <tr>
                                <th>Requisições</th>
                                <th>Janeiro 2024</th>
                                <th>Janeiro 2023</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Requisições Emitidas</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Requisições Pagas</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Diferenças</td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={styles.tableWrapper}>
                <p><strong>Análises</strong></p>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>Orçamento</th>
                                <th>Janeiro 2024</th>
                                <th>Janeiro 2023</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Saldo Orçamental</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Tesouraria</td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>Variação </td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default DashboardAlt1;
