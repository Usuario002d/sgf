import React, { useState } from 'react';

const FormRegister = () => {
  const [tipoCadastro, setTipoCadastro] = useState('');

  const handleTipoChange = (e) => {
    setTipoCadastro(e.target.value);
  };

 // Para simular cadastro no sistema
  const submitCadastro = () => {
    alert('Cadastrado com sucesso!');
  };

  return (
    <>
      <div style={{ textAlign: 'center', }}>
        <h3><strong>Formulário De Cadastros</strong></h3>
      </div>
      <div style={styles.formContainer}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Tipo de Cadastro</label>
          <select style={styles.select} value={tipoCadastro} onChange={handleTipoChange}>
            <option value="">Selecione</option>
            <option value="cliente">Cliente</option>
            <option value="fornecedor">Fornecedor</option>
            <option value="funcionario">Funcionário</option>
            <option value="bancos">Bancos</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <div style={styles.scrollableForm}>
          <div style={styles.formGrid}>
            {/* Formulário do Fornecedor */}
            {tipoCadastro === 'fornecedor' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nome</label>
                  <input type="text" style={styles.input} required/>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nuit</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input type="email" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Telefone</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>País</label>
                  <select style={styles.select} required>
                    <option value="moz">Moçambique</option>
                    <option value="china">China</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Cidade/Província</label>
                  <input type="text" style={styles.input} required/>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nome da Empresa</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Termos de Pagamento</label>
                  <input type="text" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Banco</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tipo de Pagamento</label>
                  <select style={styles.select} required>
                    <option value="bank">Bancos</option>
                    <option value="bank">Cheques</option>
                    <option value="bank">Depósitos</option>
                    <option value="bank">Numerários</option>
                  </select>
                </div>
              </>
            )}

            {/* Formulário do Cliente */}
            {tipoCadastro === 'cliente' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nome</label>
                  <input type="text" style={styles.input} required/>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nuit</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Telefone</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Telefone 2</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input type="email" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>País</label>
                  <select style={styles.select} required>
                    <option value="moz">Moçambique</option>
                    <option value="china">China</option>
                    <option value="ras">Africa do Sul</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Cidade/Província</label>
                  <input type="text" style={styles.input} required/>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Endereço</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Número de Identificação</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Banco</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tipo de Pagamento</label>
                  <select style={styles.select} required>
                    <option value="bank">Transferências</option>
                    <option value="bank">Cheques</option>
                    <option value="bank">Depósitos</option>
                    <option value="bank">Numerários</option>
                  </select>
                </div>
              </>
            )}

            {/* Formulário do Funcionário */}
            {tipoCadastro === 'funcionario' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nome</label>
                  <input type="text" style={styles.input} required/>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Apelido</label>
                  <input type="text" style={styles.input} required/>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nuit</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input type="email" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Telefone</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>País</label>
                  <select style={styles.select} required>
                    <option value="moz">Moçambique</option>
                    <option value="china">China</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Cidade/Província</label>
                  <input type="text" style={styles.input} required/>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Endereço</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Estado Civil</label>
                  <select style={styles.select} required>
                    <option value="solteiro">Solteiro</option>
                    <option value="casado">Casado</option>
                    <option value="divorciado">Divorciado</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Cargo</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Departamento</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Data de Admissão</label>
                  <input type="date" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Salário</label>
                  <input type="number" style={styles.input} required />
                </div>
              </>
            )}

            {/* Formulário de Bancos */}
            {tipoCadastro === 'bancos' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nome</label>
                  <input type="text" style={styles.input} required/>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nuit</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input type="email" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Telefone</label>
                  <input type="text" style={styles.input} required />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>País</label>
                  <select style={styles.select} required>
                    <option value="moz">Moçambique</option>
                    <option value="china">China</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Cidade/Província</label>
                  <input type="text" style={styles.input} required/>
                </div>
              </>
            )}
          </div>
        </div>

        <button style={styles.submitButton} onClick={submitCadastro}>Cadastrar</button>
      </div>
    </>
  );
};

const styles = {
  formContainer: {
    margin: '20px auto',
    width: '60%',
  },
  scrollableForm: {
    maxHeight: '400px',
    overflowY: 'scroll',
    paddingRight: '10px',
  },
  formGroup: {
    marginBottom: '10px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // Para ter duas ou mais colunas
    gap: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box',
  },
  submitButton: {
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
};

export default FormRegister;


