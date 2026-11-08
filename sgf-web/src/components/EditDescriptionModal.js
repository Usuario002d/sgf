import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditDescriptionModal = ({ show, account, onClose, onSave }) => {
  const [description, setDescription] = useState(account?.description || '');

  useEffect(() => {
    setDescription(account?.description || '');
  }, [account]);

  const handleSave = () => {
    onSave({ ...account, description });
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Descrição</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave}>Salvar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditDescriptionModal;
