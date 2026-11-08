// ErrorPopup.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ErrorPopup = ({ show, message, onClose }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Erro de Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {Array.isArray(message) ? (
          <ul>
            {message.map((msg, index) => (
              <li key={index}>{msg.message}</li>
            ))}
          </ul>
        ) : (
          <p>{message}</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorPopup;
