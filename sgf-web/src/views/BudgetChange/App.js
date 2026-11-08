import React, { useState } from 'react';
import { Button, Form, Modal, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import { AuthProvider, AuthContext } from "./context/AuthContext";
import LoginPage from './LoginPage'; // Certifique-se de importar corretamente
import Dashboard from './Dashboard'; // Certifique-se de importar corretamente

// Componente para rotas privadas
const PrivateRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = React.useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

function App() {
  const [formVisible, setFormVisible] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    dotacaoInicial: '',
    reforco: '',
  });
  const [accountData, setAccountData] = useState({
    accountName: '',
    accountCode: '',
  });

  const handleButtonClick = (type) => {
    if (type === 'inscricaoReforco') {
      setFormVisible(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    console.log('Dados do formulário:', formData);
    // Adicione a lógica para salvar os dados aqui
    setFormVisible(false); // Esconde o formulário após salvar
  };

  const handlePopupInputChange = (e) => {
    const { name, value } = e.target;
    setAccountData({ ...accountData, [name]: value });
  };

  const handlePopupSave = () => {
    console.log('Dados da nova conta:', accountData);
    // Adicione a lógica para salvar a nova conta aqui
    setPopupVisible(false); // Esconde o pop-up após salvar
  };

  return (
    <AuthProvider>
      <Router>
        <Route path="/login" component={LoginPage} />
        <PrivateRoute path="/admin" component={Dashboard} />

        <Container className="mt-5">
          <h1>Gestão de Recursos</h1>
          <Row className="mb-3">
            <Col>
              <Button onClick={() => handleButtonClick('inscricaoReforco')} variant="primary">
                Inscrição/Reforço
              </Button>
            </Col>
            <Col>
              <Button variant="secondary">Anulação/Redução</Button>
            </Col>
            <Col>
              <Button variant="success">Redistribuição</Button>
            </Col>
          </Row>

          {formVisible && (
            <div className="mb-3">
              <h2>Formulário de Reforço</h2>
              <Form>
                <Form.Group controlId="formCodigo">
                  <Form.Label>Código</Form.Label>
                  <Form.Control
                    type="text"
                    name="codigo"
                    placeholder="Código"
                    value={formData.codigo}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group controlId="formDescricao">
                  <Form.Label>Descrição</Form.Label>
                  <Form.Control
                    type="text"
                    name="descricao"
                    placeholder="Descrição"
                    value={formData.descricao}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group controlId="formDotacaoInicial">
                  <Form.Label>Dotação Inicial</Form.Label>
                  <Form.Control
                    type="number"
                    name="dotacaoInicial"
                    placeholder="Dotação Inicial"
                    value={formData.dotacaoInicial}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group controlId="formReforco">
                  <Form.Label>Reforço</Form.Label>
                  <Form.Control
                    type="number"
                    name="reforco"
                    placeholder="Reforço"
                    value={formData.reforco}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Button variant="primary" onClick={handleSave}>
                  Salvar
                </Button>
                <Button variant="link" onClick={() => setPopupVisible(true)}>
                  Inscrição
                </Button>
              </Form>
            </div>
          )}

          <Modal show={popupVisible} onHide={() => setPopupVisible(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Adicionar Nova Conta</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="formAccountName">
                  <Form.Label>Nome da Conta</Form.Label>
                  <Form.Control
                    type="text"
                    name="accountName"
                    placeholder="Nome da Conta"
                    value={accountData.accountName}
                    onChange={handlePopupInputChange}
                  />
                </Form.Group>
                <Form.Group controlId="formAccountCode">
                  <Form.Label>Código da Conta</Form.Label>
                  <Form.Control
                    type="text"
                    name="accountCode"
                    placeholder="Código da Conta"
                    value={accountData.accountCode}
                    onChange={handlePopupInputChange}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setPopupVisible(false)}>
                Fechar
              </Button>
              <Button variant="primary" onClick={handlePopupSave}>
                Salvar Conta
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;
