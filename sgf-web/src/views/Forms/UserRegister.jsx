import React, { useState } from 'react';

const UserRegister = () => {
  const [activeTab, setActiveTab] = useState('dados');
  const [userData, setUserData] = useState({ name: '', email: '', password: '' });
  const [permissions, setPermissions] = useState({
    canEdit: false,
    canDelete: false,
    canView: false,
  });

  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setPermissions({ ...permissions, [name]: checked });
  };

  const handleSubmit = () => {
    // Função para submeter os dados
  };

  return (
    <div style={styles.formContainer}>
                <h3 className="header text-center" style={{ fontWeight: "bold", backgroundColor: "#264f36", color: "white" }}>
                Cadastro de Usuário</h3>
      <div>
        <button onClick={() => setActiveTab('dados')}>Dados do Usuário</button>
        <button onClick={() => setActiveTab('permissoes')}>Permissões</button>
        <p></p>
      </div>

      {activeTab === 'dados' && (
        <div style={styles.formGroup}>
          <form style={styles.formGroup}>
            <div style={styles.inlineGroup}>
              <label style={styles.inlineLabel}>Nome:</label>
              <input type="text" name="name" value={userData.name} onChange={handleUserDataChange} style={styles.input} />
            </div>
            <div style={styles.inlineGroup}>
              <label style={styles.inlineLabel}>E-mail:</label>
              <input type="email" name="email" value={userData.email} onChange={handleUserDataChange} style={styles.input} />
            </div>
            <div style={styles.inlineGroup}>
              <label style={styles.inlineLabel}>Telemóvel:</label>
              <input type="number" name="phone" onChange={handleUserDataChange} style={styles.input} />
            </div>
            <div style={styles.inlineGroup}>
              <label style={styles.inlineLabel}>Data de Nasc.:</label>
              <input type="date" name="birthDate" onChange={handleUserDataChange} style={styles.input} />
            </div>
          </form>

          <div style={styles.formGrid}>
            <div style={styles.inlineGroup}>
              <label style={styles.inlineLabel}>Perfil sug.:</label>
              <select name="profile" onChange={handleUserDataChange} style={styles.select}>
                <option value="">Selecione</option>
                <option value="financeiro">Financeiro</option>
                <option value="tecnico">Técnico</option>
              </select>
            </div>
            <div style={styles.inlineGroup}>
              <label style={styles.inlineLabel}>Idioma:</label>
              <select name="language" value={userData.language} onChange={handleUserDataChange} style={styles.select}>
                <option value="pt">Português</option>
                <option value="en">Inglês</option>
              </select>
            </div>
          </div>

          <div style={styles.checkboxGroup}>
            <label><input type="checkbox" name="active" onChange={handleUserDataChange} /> Activo</label>
            <label><input type="checkbox" name="tech" onChange={handleUserDataChange} /> Técnico</label>
            <label><input type="checkbox" name="admin" onChange={handleUserDataChange} /> Administrador</label>
            <label><input type="checkbox" name="superAdmin" onChange={handleUserDataChange} /> Super Administrador</label>
          </div>
          <form style={styles.formGroup}>
            <p><strong>Segurança </strong></p>
            <div style={styles.inlineGroup}>
              <label style={styles.inlineLabel}>Password:</label>
              <input type="password" name="password" onChange={handleUserDataChange} style={styles.input} />
            </div>
            <div style={styles.inlineGroup}>
              <label style={styles.inlineLabel}>Confirmação:</label>
              <input type="password" name="passwordConfirm" onChange={handleUserDataChange} style={styles.input} />
            </div>
          </form>
          <form style={styles.formGroup}>
            <p><strong>Segurança para Windows</strong></p>
            <div style={styles.inlineGroup}>
              <label style={styles.inlineLabel}>Login:</label>
              <input type="password" name="password" onChange={handleUserDataChange} style={styles.input} />
            </div>
          </form>
          <form style={styles.formGroup}>
            <p><strong>Segurança SQL</strong></p>
            <div style={styles.inlineGroup}>
              <label style={styles.inlineLabel}>Login:</label>
              <input type="password" name="password" onChange={handleUserDataChange} style={styles.input} />
            </div>
            <div style={styles.inlineGroup}>
              <label style={styles.inlineLabel}>Password:</label>
              <input type="password" name="passwordConfirm" onChange={handleUserDataChange} style={styles.input} />
            </div>
          </form>
          <div style={styles.checkboxGroup}>
            <label><input type="checkbox" name="active" onChange={handleUserDataChange} />Autenticação Windows</label>
          </div>
        </div>
      )}

      {activeTab === 'permissoes' && (
        <div style={styles.checkboxGroup}>
          <p></p>
          <label><input type="checkbox" name="planoOrcamento" onChange={handlePermissionChange} /> <strong>Plano e Orçamento</strong></label>
          <p></p>
          <label><input type="checkbox" name="requisoesFundos" onChange={handlePermissionChange} /> <strong>Requisições de Fundos</strong></label>
          <p></p>
          <label><input type="checkbox" name="contasReceberPagar" onChange={handlePermissionChange} /> <strong>Contas a Receber e a Pagar</strong></label>
          <p></p>
          <label><input type="checkbox" name="disponivel" onChange={handlePermissionChange} /> <strong>Disponível</strong></label>
          <p></p>
          <label><input type="checkbox" name="reconBancaria" onChange={handlePermissionChange} /> <strong>Reconciliações Bancarias</strong></label>
          <p></p>
          <label><input type="checkbox" name="relatoriosGlobais" onChange={handlePermissionChange} /> <strong>Relatórios Globais</strong></label>
          <p></p>
        </div>

      )}
      <div style={styles.formGroup}>
        <button onClick={handleSubmit}>Confirmar</button>
        <button onClick={handleSubmit}>Cancelar</button>
        <button onClick={handleSubmit}>Ajuda</button>
      </div>
    </div>
  );
};

const styles = {
  formContainer: {
    margin: '20px auto',
    width: '70%',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  inlineGroup: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  inlineLabel: {
    marginRight: '10px',
    width: '150px',
    textAlign: 'right',
  },
  input: {
    flex: 1,
    padding: '2px', // Altura dos inputs de texto
    boxSizing: 'border-box',
  },
  select: {
    flex: 1,
    padding: '3px', // Altura para os selects 
    boxSizing: 'border-box',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column', // Coloca os checkboxes um abaixo do outro
    alignItems: 'center',
    marginBottom: '10px',
  },
};


export default UserRegister;
