import React from 'react';

export const FiscalYear = () => {
  return (
    <>
      <h3 style={{ textAlign: 'center' }} ><strong>Ano Fiscal</strong></h3>

      <div>
        <div
          className="form-container"
          style={{ width: '90%', display: 'flex', gap: '20px', margin: '0 auto' }}
        >
          <div className="column" style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ display: 'block', marginBottom: '5px' }}><strong>Restrições</strong></p>
            <label style={{ display: 'block', marginBottom: '5px' }}>Exercício</label>
            <input
              type="number"
              placeholder="YYYY"
              min="2024"
              max="3000"
              step="1"
              style={{ textAlign: 'left', display: 'block', width: '15%', marginBottom: '10px' }}
            />
            <label>Conta(s)</label>
            <select style={{ textAlign: 'left', display: 'block', width: '50%' }}>
              <option>Plano de Contas</option>
              <option>Acumulado de Contas</option>
              <option>Orçamento de Contas</option>
            </select>
          </div>
          <div className="column" style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ display: 'block', width: '10%', marginBottom: '10px' }}><strong>Análise</strong></p>
            <label>Início</label>
            <input
              type="number"
              style={{ display: 'block', width: '10%', marginBottom: '10px' }}
            />
            <label>Fim</label>
            <input
              type="number"
              style={{ display: 'block', width: '10%', marginBottom: '10px' }}
            />
            <select>
              <option>Período</option>
              <option>Acumulado</option>
              <option>Per. e Acum.</option>
              <option>Ant., Per. e Acum.</option>
              <option>Soma Saldos</option>
            </select>
          </div>
        </div>
      </div>
      {/* Espaçamento adicional entre formulário e tabela */}
      <div style={{ margin: '20px 0' }}>
        <button
          style={{
            display: 'block',
            margin: '10px auto',
            padding: '10px 20px',
            backgroundColor: '#3276bf',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          onClick={() => console.log('Actualizar clicado!')}
        >
          Actualizar
        </button>
      </div>
      <div>
        <table
          className="table table-striped table-bordered table-hover"
          style={{ marginTop: '20px', width: '90%', margin: '0 auto' }}
        >
          <thead>
            <tr>
              <th>Conta</th>
              <th>Descrição</th>
              <th>Débito</th>
              <th>Crédito</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default FiscalYear;
