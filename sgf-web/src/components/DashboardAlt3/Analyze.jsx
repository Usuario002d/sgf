import React from 'react';

const getTableRows = (tableIndex) => {
    const data = [
        [
            ['Contas a pagar', 25464.36, 35994.00, '-299%'],
            ['Contas a receber', 35476.00, 3468.39, '91%'],
            ['Diferenças', 15258.64, 6155.00, '-51%']
        ],
        [
            ['Saldo Orçamental', 95826.36, 35994.00, '165%'],
            ['Tesouraria', 35746.00, 90468.39, '-60%'],
            ['Diferenças', 35746.00, 9468.39, '278%']
        ],
        [
            ['Execução Orçamental', 195464.36, 335994.00, '-42%'],
            ['Saídas Financeiras', 95746.00, 90468.39, '-6%'],
            ['Diferenças', 95746.00, 9468.39, '911%']
        ],
        [
            ['Requisições Emitidas', 195464.36, 85994.00, '-127%'],
            ['Requisições pagas', 75746.00, 90468.39, '-16'],
            ['Diferenças', 335746.00, 99468.39, '238%']
        ],
        [
            ['Receitas Próprias', 50400, 48600, '54%'],
            ['Despesas Pagas', 40200, 39500, '60%'],
            ['Diferenças', 10090, 79100, '-17%']
        ],
        [
            ['Variações Cambias Favoráveis', 63654, 35750, '-45%'],
            ['Variações Cambias Desfavoráveis', 28500, 7150, '-32%'],
            ['Diferenças', 28500, 7150, '65%']
        ],
    ];
    return data[tableIndex];
};

const Analyze = () => {
    return (
        <div style={styles.container}>
            <div style={styles.tableWrapper}>
                {[...Array(6)].map((_, index) => (
                    <table key={index} style={styles.table}>
                    <colgroup>
                      <col style={{ width: "42%" }} />
                      <col style={{ width: "23%" }} />
                      <col style={{ width: "23%" }} />
                      <col style={{ width: "12%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th style={styles.th}></th>
                        <th style={styles.th}>Ano N</th>
                        <th style={styles.th}>Ano N-1</th>
                        <th style={styles.th}>Variação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getTableRows(index).map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j} style={styles.td}>
                              <div style={styles.rect}>{cell}</div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>                  
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: "4px",
    },
    title: {
        textAlign: "center",
        fontSize: "20px",
        marginBottom: "16px",
        color: "#000000",
    },
    tableWrapper: {
        display: "flex",
        gap: "16px",
        overflowX: "auto",
        paddingBottom: "6px",
        width: "100%", // bom manter
      },
      table: {
        borderCollapse: "collapse",
        width: "650px", // Largura fixa
        backgroundColor: "#f9f9f9",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        overflow: "hidden",
        tableLayout: "fixed",
        flexShrink: 0, // <--- ESSENCIAL! Impede que a tabela encolha mesmo dentro de flex
      },
    th: {
        padding: "10px",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: "14px",
        color: "#030303",
        border: "1px solid #ddd",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    td: {
        padding: "8px",
        textAlign: "left",
        fontSize: "14px",
        border: "none",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        //maxWidth: "250px",
    },
    rect: {
        display: "block",        // ocupa toda a largura da célula
        width: "100%",           // garante que ocupe 100% da td
        padding: "6px 12px",
        borderRadius: "8px",
        backgroundColor: "#d3d3d3",
        textAlign: "center",
        color: "#000000",
        fontWeight: "bold",
        fontSize: "14px",
        boxSizing: "border-box", // importante para o padding não ultrapassar a largura
      }
};

export default Analyze;
