import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from "recharts";

// Dados do gráfico com valores positivos e negativos
const data = [
  { name: "Banco A", Disponivel: 100000, Entradas: 50000, Saidas: 5000, Tesouraria: 20000 },
  { name: "Banco B", Disponivel: 120000, Entradas: 40000, Saidas: 10000, Tesouraria: 30000 },
  { name: "Banco C", Disponivel: 15000, Entradas: 6000, Saidas: 2000, Tesouraria: 4000 },
  { name: "Banco D", Disponivel: 20000, Entradas: 8000, Saidas: 3000, Tesouraria: -250000 },
  { name: "Global Ano N", Disponivel: 100000, Entradas: 150000, Saidas: 300000, Tesouraria: -10000 },
  { name: "Global Ano N-1", Disponivel: 120000, Entradas: 170000, Saidas: 350000, Tesouraria: -20000 },
];

const BarCharts = () => {
  return (
    <>
      <div style={styles.container}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
            <tr>
                <th colSpan={1} style={{ border: 'none' }}>#</th>
              </tr>
              <tr>
                <th style={{ border: 'none' }}>Descrição </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: 'none' }}>Disponível inicial</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>Entradas</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>Saídas</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>Tesouraria</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
            <tr>
                <th colSpan={1} style={{ border: 'none' }}>#</th>
              </tr>
              <tr>
                <th style={{ border: 'none' }}>Banco A</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
            <tr>
                <th colSpan={1} style={{ border: 'none' }}>#</th>
              </tr>
              <tr>
                <th style={{ border: 'none' }}>Banco B</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
            <tr>
                <th colSpan={1} style={{ border: 'none' }}>#</th>
              </tr>
              <tr>
                <th style={{ border: 'none' }}>Banco C</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
            <tr>
                <th colSpan={1} style={{ border: 'none' }}>#</th>
              </tr>
              <tr>
                <th style={{ border: 'none' }}>Banco D</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th colSpan={2} style={{ border: 'none' }}>Global</th>
              </tr>
              <tr>
                <th style={{ border: 'none' }}>Ano N</th>
                <th style={{ border: 'none' }}>Ano N-1</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: 'none' }}>.</td>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
                <td style={{ border: 'none' }}>.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th colSpan={1} style={{ border: 'none' }}>#</th>
              </tr>
              <tr>
                <th style={{ border: 'none' }}>Variação</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
              <tr>
                <td style={{ border: 'none' }}>.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ResponsiveContainer width="80%" height={400}>
        <BarChart
          data={data} // Dados do gráfico
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }} // Margens do gráfico
        >
          <CartesianGrid strokeDasharray="3 3" /> {/* Grelha de fundo com linhas tracejadas */}
          <XAxis dataKey="name" /> {/* Eixo X configurado para mostrar os nomes das categorias */}
          <YAxis
            domain={[-400000, 400000]} // Define o domínio (escala) do eixo Y
            tickCount={9} // Número de divisões no eixo Y
          />
          {/* Tooltip para exibir valores ao passar o mouse */}
          <Tooltip />
          <Legend />
          {/* Barras para cada tipo de dado */}
          <Bar
            dataKey="Disponivel"
            fill="#0065fc"
            name="Disponível inicial" // Nome exibido na legenda
          />
          <Bar
            dataKey="Entradas"
            fill="#fdae05"
            name="Entradas" // Nome exibido na legenda
          />
          <Bar
            dataKey="Saidas"
            fill="#3f4546"
            name="Saídas" // Nome exibido na legenda
          />
          <Bar
            dataKey="Tesouraria"
            fill="#fc5e03"
            name="Tesouraria" // Nome exibido na legenda
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

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
export default BarCharts;



