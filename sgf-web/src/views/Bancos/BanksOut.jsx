import React, { useState } from 'react';
//import React from 'react'
import Table from 'react-bootstrap/Table';

const BanksOut = () => {
   
    return (
        <>
            
            <div><h3>Diários de Lançamento – </h3></div>
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
                <input placeholder='Requisição' />
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

export default BanksOut;