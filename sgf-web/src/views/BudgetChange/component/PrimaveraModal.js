import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import {
  FaMoneyBillWave,
  FaExchangeAlt,
  FaTimes,
  FaPlus,
  FaMinus,
  FaCheckCircle,
  FaTrashAlt,
} from "react-icons/fa";

const PrimaveraModal = ({
  show,
  handleClose,
  formType,
  firistAccounts = [],
  handleSave,
  formData,
  setFormData,
  operationDate,
  setOperationDate,
  sourceAccountData,
  setSourceAccountData,
  destinationAccounts = [],
  setDestinationAccounts,
}) => {
  const [selectedAccountName, setSelectedAccountName] = useState("");

  if (!show) return null;

  const handleDateChange = (e) => {
    setOperationDate(e.target.value);
  };

  const handleCodigoChange = (e) => {
    const selectedCodigo = e.target.value;
    const selectedCodigoParsed = parseInt(selectedCodigo, 10);
    const selectedAccount = firistAccounts.find(
      (account) => account.accountPlan?.id === selectedCodigoParsed
    );

    if (selectedAccount) {
      setFormData({
        ...formData,
        codigo: selectedCodigo,
        codSend: selectedAccount.accountPlan.number,
        descricao: selectedAccount.accountPlan.description,
        dotacaoInicial: selectedAccount.finalAllocation,
      });
      setSelectedAccountName(
        `${selectedAccount.accountPlan.number} - ${selectedAccount.accountPlan.description}`
      );
    } else {
      setFormData({
        ...formData,
        codigo: selectedCodigo,
        codSend: "",
        descricao: "",
        dotacaoInicial: "",
      });
      setSelectedAccountName("");
    }
  };

  const handleSourceCodigoChange = (e) => {
    const selectedCodigo = e.target.value;
    const selectedAccount = firistAccounts.find(
      (account) => account.accountPlan?.id === parseInt(selectedCodigo, 10)
    );

    if (selectedAccount) {
      setSourceAccountData({
        ...sourceAccountData,
        codigo: selectedCodigo,
        codSend: selectedAccount.accountPlan.number,
        descricao: selectedAccount.accountPlan.description,
        dotacaoInicial: selectedAccount.finalAllocation,
        transferir: String(
          destinationAccounts.reduce(
            (sum, acc) => sum + (parseFloat(acc.valorDestino) || 0),
            0
          )
        ),
      });
    } else {
      setSourceAccountData({
        ...sourceAccountData,
        codigo: selectedCodigo,
        codSend: "",
        descricao: "",
        dotacaoInicial: "",
      });
    }
  };

  const handleDestinationCodigoChange = (e, index) => {
    const { value } = e.target;
    setDestinationAccounts((prevAccounts) =>
      prevAccounts.map((account, i) =>
        i === index ? { ...account, codigoDestino: value } : account
      )
    );
  };

  const handleValorDestinoChange = (e, index) => {
    const { value } = e.target;
    const updated = destinationAccounts.map((account, i) =>
      i === index ? { ...account, valorDestino: parseFloat(value) || 0 } : account
    );
    setDestinationAccounts(updated);
    const total = updated.reduce(
      (sum, acc) => sum + (parseFloat(acc.valorDestino) || 0),
      0
    );
    setSourceAccountData((prev) => ({
      ...prev,
      transferir: String(total),
    }));
  };

  const addDestinationAccount = () => {
    setDestinationAccounts([
      ...destinationAccounts,
      { codigoDestino: "", valorDestino: "" },
    ]);
  };

  const removeDestinationAccount = (index) => {
    if (destinationAccounts.length <= 1) return;
    const newDestinationAccounts = [...destinationAccounts];
    newDestinationAccounts.splice(index, 1);
    setDestinationAccounts(newDestinationAccounts);
  };

  const getCurrentDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getModalConfig = () => {
    switch (formType) {
      case "inscricaoReforco":
        return {
          title: "Inscrição / Reforço Orçamental",
          subtitle: "Adicionar dotação suplementar a uma rubrica de movimento",
          icon: <FaPlus style={{ color: "#0f5132" }} />,
          accent: "#0f5132",
          btnVariant: "primary",
        };
      case "anulacaoReducao":
        return {
          title: "Anulação / Redução Orçamental",
          subtitle: "Reduzir ou anular dotação disponível numa rubrica",
          icon: <FaMinus style={{ color: "#be123c" }} />,
          accent: "#be123c",
          btnVariant: "danger",
        };
      case "redistribuicao":
      default:
        return {
          title: "Redistribuição de Verbas Orçamentais",
          subtitle: "Transferir dotação entre rubricas pertencentes ao mesmo grupo",
          icon: <FaExchangeAlt style={{ color: "#b45309" }} />,
          accent: "#b45309",
          btnVariant: "warning",
        };
    }
  };

  const config = getModalConfig();

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size={formType === "redistribuicao" ? "xl" : "lg"}
      centered
      scrollable
    >
      <Modal.Header closeButton>
        <div>
          <Modal.Title>
            {config.icon} {config.title}
          </Modal.Title>
          <div style={{ fontSize: "0.8rem", color: "#5c746b", marginTop: "2px" }}>
            {config.subtitle}
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        {/* Linha da Data da Operação */}
        <div
          className="p-3 mb-4 rounded"
          style={{
            backgroundColor: "#f4f8f5",
            border: "1px solid #d5e0da",
          }}
        >
          <Row className="align-items-center g-3">
            <Col md={5}>
              <Form.Label className="mb-1">Data Oficial da Operação</Form.Label>
              <Form.Control
                type="date"
                name="dataInicio"
                value={operationDate}
                onChange={handleDateChange}
                max={getCurrentDate()}
              />
            </Col>
            <Col md={7}>
              <div style={{ fontSize: "0.82rem", color: "#2d443d" }}>
                <strong>Nota Contabilística:</strong> Os valores introduzidos neste formulário são expressos em{" "}
                <strong style={{ color: "#0f5132" }}>Meticais (MZN)</strong> e convertidos automaticamente à taxa oficial do plano.
              </div>
            </Col>
          </Row>
        </div>

        {formType === "inscricaoReforco" && (
          <Form>
            <Row className="g-3">
              <Col md={7}>
                <Form.Group controlId="formCodigo">
                  <Form.Label>Rubrica Orçamental a Reforçar</Form.Label>
                  <Form.Select
                    name="codigo"
                    value={formData.codigo || ""}
                    onChange={handleCodigoChange}
                    title={formData.descricao || ""}
                  >
                    <option value="">Seleccione uma conta orçamental...</option>
                    {firistAccounts.map((account) => (
                      <option key={account.id} value={account.accountPlan.id}>
                        {account.accountPlan.number} — {account.accountPlan.description}
                      </option>
                    ))}
                  </Form.Select>
                  {formData.descricao && (
                    <div className="sgf-field-preview">
                      <div>
                        <strong>Descrição Completa:</strong> {formData.codSend} — {formData.descricao}
                      </div>
                      {formData.dotacaoInicial !== undefined && formData.dotacaoInicial !== "" && (
                        <div className="mt-1" style={{ color: "#0f5132", fontWeight: 600 }}>
                          Dotação Actual: {Number(formData.dotacaoInicial || 0).toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col md={5}>
                <Form.Group controlId="formReforco">
                  <Form.Label>Valor do Reforço (MZN)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="reforco"
                    placeholder="0.00"
                    value={formData.reforco || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, reforco: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="formMotivo">
                  <Form.Label>Fundamentação / Motivo do Reforço</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="motivo"
                    placeholder="Descreva a justificação legal ou administrativa para este reforço..."
                    value={formData.motivo || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, motivo: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        )}

        {formType === "anulacaoReducao" && (
          <Form>
            <Row className="g-3">
              <Col md={7}>
                <Form.Group controlId="formCodigo">
                  <Form.Label>Rubrica Orçamental a Reduzir / Anular</Form.Label>
                  <Form.Select
                    name="codigo"
                    value={formData.codigo || ""}
                    onChange={handleCodigoChange}
                    title={formData.descricao || ""}
                  >
                    <option value="">Seleccione uma conta orçamental...</option>
                    {firistAccounts.map((account) => (
                      <option key={account.id} value={account.accountPlan.id}>
                        {account.accountPlan.number} — {account.accountPlan.description}
                      </option>
                    ))}
                  </Form.Select>
                  {formData.descricao && (
                    <div className="sgf-field-preview">
                      <div>
                        <strong>Descrição Completa:</strong> {formData.codSend} — {formData.descricao}
                      </div>
                      {formData.dotacaoInicial !== undefined && formData.dotacaoInicial !== "" && (
                        <div className="mt-1" style={{ color: "#be123c", fontWeight: 600 }}>
                          Dotação Actual: {Number(formData.dotacaoInicial || 0).toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col md={5}>
                <Form.Group controlId="formAnulacaoReducao">
                  <Form.Label>Valor da Anulação / Redução (MZN)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="anulaçãoReducao"
                    placeholder="0.00"
                    value={formData.anulaçãoReducao || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        anulaçãoReducao: parseFloat(e.target.value) || "",
                      })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group controlId="formMotivoAnulacao">
                  <Form.Label>Fundamentação / Motivo da Redução</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="motivo"
                    placeholder="Descreva a justificação para esta anulação/redução..."
                    value={formData.motivo || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, motivo: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        )}

        {formType === "redistribuicao" && (
          <Form>
            <Row className="g-3">
              {/* Coluna Esquerda: Conta de Origem */}
              <Col md={5}>
                <div
                  className="p-3 rounded h-100"
                  style={{
                    backgroundColor: "#fefaf0",
                    border: "1px solid #f3d08a",
                  }}
                >
                  <h6
                    style={{
                      fontWeight: 800,
                      color: "#92400e",
                      marginBottom: "10px",
                      textTransform: "uppercase",
                      fontSize: "0.78rem",
                    }}
                  >
                    1. Conta de Origem (Saída)
                  </h6>

                  <Form.Group controlId="formSourceCodigo" className="mb-3">
                    <Form.Label>Seleccionar Rubrica de Origem</Form.Label>
                    <Form.Select
                      name="codigo"
                      value={sourceAccountData.codigo || ""}
                      onChange={handleSourceCodigoChange}
                      title={sourceAccountData.descricao || ""}
                    >
                      <option value="">Seleccione um código...</option>
                      {firistAccounts.map((account) => (
                        <option key={account.id} value={account.accountPlan.id}>
                          {account.accountPlan.number} — {account.accountPlan.description}
                        </option>
                      ))}
                    </Form.Select>
                    {sourceAccountData.descricao && (
                      <div className="sgf-field-preview" style={{ borderLeftColor: "#b45309", backgroundColor: "#fffbeb" }}>
                        <div>
                          <strong>Descrição Completa:</strong> {sourceAccountData.codSend} — {sourceAccountData.descricao}
                        </div>
                        {sourceAccountData.dotacaoInicial !== undefined && sourceAccountData.dotacaoInicial !== "" && (
                          <div className="mt-1" style={{ color: "#92400e", fontWeight: 600 }}>
                            Dotação Disponível: {Number(sourceAccountData.dotacaoInicial || 0).toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group controlId="formSourceTransferir">
                    <Form.Label>Total a Transferir (MZN)</Form.Label>
                    <Form.Control
                      type="number"
                      name="transferir"
                      value={destinationAccounts.reduce(
                        (sum, account) => sum + parseFloat(account.valorDestino || 0),
                        0
                      )}
                      readOnly
                    />
                  </Form.Group>
                </div>
              </Col>

              {/* Coluna Direita: Contas de Destino */}
              <Col md={7}>
                <div
                  className="p-3 rounded h-100"
                  style={{
                    backgroundColor: "#f4f8f5",
                    border: "1px solid #d5e0da",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6
                      style={{
                        fontWeight: 800,
                        color: "#0f5132",
                        marginBottom: 0,
                        textTransform: "uppercase",
                        fontSize: "0.78rem",
                      }}
                    >
                      2. Contas de Destino (Entrada)
                    </h6>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={addDestinationAccount}
                    >
                      <FaPlus /> Adicionar Destino
                    </Button>
                  </div>

                  <div
                    className="d-flex flex-column gap-2"
                    style={{ maxHeight: "260px", overflowY: "auto" }}
                  >
                    {destinationAccounts.map((account, index) => {
                      const selectedDestObj = firistAccounts.find(
                        (acc) => acc.accountPlan?.number === account.codigoDestino
                      );
                      return (
                        <div
                          key={index}
                          className="p-2 px-3 bg-white rounded border"
                        >
                          <Row className="align-items-start g-2">
                            <Col md={7}>
                              <Form.Label className="mb-1">Conta Destino</Form.Label>
                              <Form.Select
                                value={account.codigoDestino || ""}
                                onChange={(e) =>
                                  handleDestinationCodigoChange(e, index)
                                }
                                title={selectedDestObj?.accountPlan?.description || ""}
                              >
                                <option value="">Seleccione destino...</option>
                                {firistAccounts.map((acc) => (
                                  <option
                                    key={acc.id}
                                    value={acc.accountPlan.number}
                                  >
                                    {acc.accountPlan.number} — {acc.accountPlan.description}
                                  </option>
                                ))}
                              </Form.Select>
                              {selectedDestObj?.accountPlan?.description && (
                                <div className="sgf-field-preview">
                                  <strong>{selectedDestObj.accountPlan.number}:</strong>{" "}
                                  {selectedDestObj.accountPlan.description}
                                </div>
                              )}
                            </Col>
                            <Col md={3}>
                              <Form.Label className="mb-1">Valor (MZN)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={account.valorDestino || ""}
                                onChange={(e) => handleValorDestinoChange(e, index)}
                              />
                            </Col>
                            <Col md={2} className="text-end" style={{ paddingTop: "21px" }}>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeDestinationAccount(index)}
                                disabled={destinationAccounts.length <= 1}
                                style={{ minHeight: "35px", width: "100%" }}
                              >
                                <FaTrashAlt />
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Col>

              <Col md={12}>
                <Form.Group controlId="formMotivoRedistribuicao">
                  <Form.Label>Fundamentação / Motivo da Redistribuição</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="motivo"
                    placeholder="Descreva o motivo desta redistribuição orçamental..."
                    value={formData.motivo || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, motivo: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          <FaTimes /> Cancelar
        </Button>
        <Button variant={config.btnVariant} onClick={handleSave}>
          <FaCheckCircle /> Guardar Movimentação
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PrimaveraModal;
