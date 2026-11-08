import React from 'react';

const getTableRows = (tableIndex) => {
    const data = [
        ['Contas a pagar', 'Contas a receber', 'Diferenças'],
        ['Saldo Orçamental', 'Tesouraria', 'Diferenças'],
        ['Execução Orçamental', 'Saídas Financeiras', 'Diferenças'],
        ['Requisições Emitidas', 'Requisições Aprovadas', 'Requisições Anuladas', 'Diferenças'],
        ['Receitas Próprias', 'Despesas Pagas', 'Diferenças'],
        ['Variações Cambias Favoráveis', 'Variações Cambias Desfavoráveis', 'Diferenças'],
    ];
    return data[tableIndex];
};

const Analyze = () => {
    return (
        <div style={styles.container}>
            <div style={styles.tableWrapper}>
                {[...Array(6)].map((_, index) => (
                    <table key={index} style={styles.table}>
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
                                    <td style={styles.td}>{row}</td>
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
        padding: "16px",
    },
    title: {
        textAlign: "center",
        fontSize: "20px",
        marginBottom: "16px",
        color: "#000000",
    },
    tableWrapper: {
        display: "flex",
        justifyContent: "space-between", // Garante que as tabelas fiquem distribuídas igualmente
        gap: "16px",
        overflowX: "auto",
        width: "100%",
    },
    table: {
        borderCollapse: "separate",
        borderSpacing: "0",
        width: "calc(16.66% - 16px)", // Ajusta a largura para 6 tabelas lado a lado
        backgroundColor: "#f9f9f9",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        border: "2px",
        overflow: "hidden",
    },
    th: {
        padding: "10px",
        textAlign: "left",
        fontWeight: "bold",
        fontSize: "14px",
        color: "#030303",
        border: "none",
        whiteSpace: "nowrap",
        margin: "0",
    },
    td: {
        padding: "8px",
        textAlign: "left",
        fontSize: "14px",
        border: "none",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "250px",
    },
};

export default Analyze;
