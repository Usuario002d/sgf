import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ToastNotification = ({ show, message, type, onClose }) => {
  return (
    <>
      {show && (
        <div className={`toast align-items-center text-white ${type === 'error' ? 'bg-danger' : 'bg-success'} border-0`} role="alert" aria-live="assertive" aria-atomic="true">
          <div className="d-flex">
            <div className="toast-body">
              {message}
            </div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Close" onClick={onClose}></button>
          </div>
        </div>
      )}
    </>
  );
};

export default ToastNotification;
