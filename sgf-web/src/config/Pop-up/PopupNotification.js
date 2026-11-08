import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css';
import './PopupNotification.css';

const PopupNotification = ({ show, message, type, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Fechar automaticamente após 5 segundos
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) {
    return null; // Não renderiza nada quando `show` é falso
  }

  const getAlertClass = () => {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-danger';
      case 'warning':
        return 'alert-warning';
      case 'info':
      default:
        return 'alert-info';
    }
  };

  return (
    <div
      className={`popup-notification alert ${getAlertClass()} alert-dismissible fade show`}
      role="alert"
    >
      <div className="d-flex align-items-center">
        <i
          className={`me-2 ${
            type === 'success' ? 'bi-check-circle-fill' :
            type === 'error' ? 'bi-exclamation-triangle-fill' :
            type === 'warning' ? 'bi-exclamation-circle-fill' : 
            'bi-info-circle-fill'
          }`}
        ></i>
        <span>{message}</span>
      </div>
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={onClose}
      ></button>
    </div>
  );
};

PopupNotification.propTypes = {
  show: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  onClose: PropTypes.func.isRequired,
};

PopupNotification.defaultProps = {
  type: 'info',
};

export default PopupNotification;
