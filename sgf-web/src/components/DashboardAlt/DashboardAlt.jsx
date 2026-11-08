import React from "react";
import { Card, Typography, Grid, Container } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Dashboard from "views/Dashboard/Dashboard";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";


const DashboardAlt = () => {
  // Dados para o gráfico de barras
  const barData = [
    { name: "1.1.25", revenue: 70000, profit: 50000, income: 10000 },
    { name: "1.2.25", revenue: 75000, profit: 55000, income: 11000 },
    { name: "1.3.25", revenue: 72000, profit: 52000, income: 10500 },
    { name: "1.4.25", revenue: 73000, profit: 53000, income: 10800 },
  ];

  // Dados para os gráficos circulares
  const pieData = [
    { name: "Revenues", value: 72 },
    { name: "Food & Health", value: 8 },
    { name: "Coatings", value: 12 },
    { name: "Others", value: 8 },
  ];

  const pieColors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];



  // Componente para os KPIs
  const KpiCard = ({ title, value, vsLastPeriod, vsBudget }) => {
    return (
      <Card style={{ padding: "16px", margin: "8px", textAlign: "center" }}>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="h4">{value}</Typography>
        <Typography style={{ color: "green" }}>VS Last Period: {vsLastPeriod}</Typography>
        <Typography style={{ color: "blue" }}>VS Budget: {vsBudget}</Typography>
      </Card>
    );
  };

  return (
    <div>
      <Container style={{ maxWidth: "1600px", padding: "16px" }}>

        {/* Título para os KPIs */}
        <Typography variant="h5" style={{ marginBottom: "16px", textAlign: "center" }}>
        Indicadores Chave de Desempenho (KPIs)
        </Typography>
        <Grid container spacing={2}>
          {/* KPIs */}
          {[
            { title: "DECLARAÇÃO", value: "407.447", vsLastPeriod: "+14%", vsBudget: "+10%" },
            { title: "Lucro bruto", value: "228.642", vsLastPeriod: "+10%", vsBudget: "+8%" },
            { title: "Res. líquido", value: "11.748", vsLastPeriod: "-29%", vsBudget: "-41%" },
            { title: "EBITDA", value: "22.814", vsLastPeriod: "-16%", vsBudget: "-27%" },
            { title: "Dinheiro", value: "56.600", vsLastPeriod: "+51%", vsBudget: "+108%" },
            { title: "Dívida", value: "95.825", vsLastPeriod: "+14%", vsBudget: "+418%" },
          ].map((kpi, index) => (
            <Grid item xs={12} sm={6} md={2} key={index}>
              <KpiCard {...kpi} />
            </Grid>
          ))}

          {/* Gráfico de Barras */}
          <Grid item xs={12} md={6}>
            {/* Título para o gráfico de barras */}
            <Typography variant="h5" style={{ margin: "24px 0 16px", textAlign: "center" }}>
            Movimentos Mensais
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
                <Bar dataKey="profit" fill="#82ca9d" />
                <Bar dataKey="income" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Grid>

          {/* Gráficos de Pizza */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" style={{ marginBottom: "8px", textAlign: "center" }}>
            Estrutura de receita
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="h6" style={{ marginBottom: "8px", textAlign: "center" }}>
              Estrutura Opex
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
        {/* KPIs */}
        <Typography variant="h5" style={{ marginBottom: "16px", textAlign: "center" }}>
        Rentabilidade e Eficiência
        </Typography>
        <Grid container spacing={2}>
          {[
            { title: "Margem Bruta", value: "56%", vsLastPeriod: "-2%", vsBudget: "-1%" },
            { title: "Margem Líquida", value: "3%", vsLastPeriod: "-2%", vsBudget: "-2%" },
            { title: "Margem EBITDA", value: "6%", vsLastPeriod: "-2%", vsBudget: "-3%" },
            { title: "Retorno activos", value: "5%", vsLastPeriod: "-3%", vsBudget: "-3%" },
            { title: "Retorno patrimônio", value: "14%", vsLastPeriod: "-12%", vsBudget: "-23%" },
            { title: "Capital de trabalho", value: "64.894", vsLastPeriod: "+14%", vsBudget: "+209%" },
          ].map((kpi, index) => (
            <Grid item xs={12} sm={6} md={2} key={index}>
              <Card style={{ padding: "16px", textAlign: "center" }}>
                <Typography variant="h6">{kpi.title}</Typography>
                <Typography variant="h4">{kpi.value}</Typography>
                <Typography style={{ color: "red" }}>VS Last Period: {kpi.vsLastPeriod}</Typography>
                <Typography style={{ color: "blue" }}>VS Budget: {kpi.vsBudget}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
        {/* Financial Summary */}
        <Typography variant="h5" style={{ marginTop: "24px" , textAlign: "center"  }}>
        Resumo Financeiro
        </Typography>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          <Table style={{ marginTop: "16px", width: "100%" }}>
            <thead>
              <tr>
                <th colSpan={1}>DECLARAÇÃO</th>
                <th colSpan={3}>ACUMULADO DO ANO</th>
                <th colSpan={3}>PREVISÃO PARA O ANO COMPLETO</th>
              </tr>
              <tr>
                <th>DEMONSTRAÇÃO DE RESULTADOS</th>
                <th>Actual</th>
                <th>Último período</th>
                <th>Orçamento</th>
                <th>Actual + FC</th>
                <th>Último período</th>
                <th>Orçamento</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Receitas</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Lucro bruto</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Resultado líquido</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>EBITDA</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </Table>

          <Table style={{ marginTop: "16px", width: "100%" }}>
            <thead>
              <tr>
                <th>BALANÇO</th>
                <th>Actual</th>
                <th>Último período</th>
                <th>Orçamento</th>
                <th>Actual + FC</th>
                <th>Último período</th>
                <th>Orçamento</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Activos</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Dívida</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Passivos</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Equidade</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </Table>

          <Table style={{ marginTop: "16px", width: "100%" }}>
            <thead>
              <tr>
                <th>DEMONSTRAÇÃO DE FLUXO DE CAIXA</th>
                <th>Actual</th>
                <th>Último período</th>
                <th>Orçamento</th>
                <th>Actual + FC</th>
                <th>Último período</th>
                <th>Orçamento</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Operando CF</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Investindo CF</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Financiamento CF</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>Total CF</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </Table>
        </div>
        {/* Gráficos de Barras 
      <Typography variant="h5" style={{ marginTop: "24px", textAlign: "center" }}>
        Visuals - Actuals
      </Typography>
      <ResponsiveContainer width="100%" height={400} style={{ marginTop: "16px" }}>
        <BarChart data={barData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Actual" fill="#e25720" />
          <Bar dataKey="Last Period" fill="#d5e21e" />
          <Bar dataKey="Budget" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
      */}
      </Container>

    </div>
  );
};

export default DashboardAlt;
