import React, { useState } from 'react';
//import React from 'react'
import Table from 'react-bootstrap/Table';

const BanksIn = () => {
   /*  const [selectedOption, setSelectedOption] = useState("");

    const tableData = {
        receitas: [
            { id: 1, desc: "Receita A", valor: 100 },
        ],
        transferencias: [
            { id: 1, desc: "Transferência Tesouro", valor: 300 },
        ],
        depositos: [
            { id: 1, desc: "Depósito Tesouro", valor: 250 },
        ],
        diferenciasCambiais: [
            { id: 1, desc: "Diferença Cambial A", valor: 120 },
        ],
        anulacoes: [
            { id: 1, desc: "Anulação A", valor: 220 },
        ],
        devolucoes: [
            { id: 1, desc: "Devolução A", valor: 90 },
        ],
        outros: [
            { id: 1, desc: "Outro A", valor: 500 },
        ],
    };

    const handleSelection = (option) => {
        setSelectedOption(option);
    };

    const renderTables = () => {
        const data = tableData[selectedOption];
        if (!data) return null;

        return (
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                {Array(3).fill(null).map((_, index) => (
                    <table key={index} border="1" cellPadding="5" style={{ minWidth: '200px' }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Descrição</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row) => (
                                <tr key={row.id}>
                                    <td>{row.id}</td>
                                    <td>{row.desc}</td>
                                    <td>{row.valor}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ))}
            </div>
        );
    };
*/
    return (
        <>
            <div>
                <h3>Diários de Lançamento – Bancos Entradas</h3>
            </div>
            {/* 
            <div style={{ marginTop: '10px' }}>
                <select onChange={(e) => handleSelection(e.target.value)} style={{ minWidth: '150px' }}>
                    <optgroup label="Receitas">
                        <option value="receitas"></option>
                        <option value="receitas">A</option>
                        <option value="receitas">B</option>
                        <option value="receitas">C</option>
                    </optgroup>

                    <optgroup label="Transferências">
                        <option value="transferencias">Recebidas do tesouro</option>
                        <option value="transferencias">Entre contas</option>
                        <option value="transferencias">Juros</option>
                        <option value="transferencias">Outras</option>
                    </optgroup>

                    <optgroup label="Depósitos">
                        <option value="depositos">Recebidas do tesouro</option>
                        <option value="depositos">Entre contas</option>
                        <option value="depositos">Outras</option>
                    </optgroup>

                    <optgroup label="Outros diários">
                        <option value="diferenciasCambiais">Diferenças Cambiais</option>
                        <option value="anulacoes">Anulações</option>
                        <option value="devolucoes">Devoluções</option>
                        <option value="outros">Outros</option>
                    </optgroup>
                </select>
            </div>
            */}
            <p></p>
            {/* 
            <div>{renderTables()}</div>
            */}
            <div>
                <label>Data da Contabilidade</label>
                <input type='date' />
            </div>
            <p></p>
            <div>
                <label>Diário</label>
                <input placeholder='Nº' />
                <input placeholder='Descrição' />
            </div>
            <p></p>
            <div>
                <label>Nº </label>
                <input placeholder='Lançamento' />
            </div>
            <p></p>
            <div>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Divisas</th>
                            <th>Câmbio</th>
                            <th>C. Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td></td>
                            <td></td>
                            <td></td>

                        </tr>
                    </tbody>
                </Table>
            </div>
            <div>
                <h4>Divisas/C.V</h4>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>C.O</th>
                            <th>C.F</th>
                            <th>Débito</th>
                            <th>Crédito</th>
                            <th>Descrição</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>

                        </tr>
                        <tr>
                            <td>2</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>

                        </tr>
                        <tr>
                            <td>3</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>

                        </tr>
                    </tbody>
                </Table>
            </div>
            <div>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Divisas/C.V</th>
                            <th>Débito</th>
                            <th>Crédito</th>
                            <th>Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>C.O</td>
                            <td></td>
                            <td></td>
                            <td></td>

                        </tr>
                        <tr>
                            <td>C.F</td>
                            <td></td>
                            <td></td>
                            <td></td>

                        </tr>
                    </tbody>
                </Table>
            </div>

        </>
    );
};

export default BanksIn;
