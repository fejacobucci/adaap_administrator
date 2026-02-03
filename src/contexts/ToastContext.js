import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <FaCheckCircle color="#28a745" />;
      case 'error': return <FaExclamationCircle color="#dc3545" />;
      case 'warning': return <FaExclamationTriangle color="#ffc107" />;
      default: return <FaInfoCircle color="#17a2b8" />;
    }
  };

  const getBackground = (type) => {
    switch (type) {
      case 'success': return '#d4edda';
      case 'error': return '#f8d7da';
      case 'warning': return '#fff3cd';
      default: return '#d1ecf1';
    }
  };

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <ToastContainer position="top-end" style={{ position: 'fixed', top: '70px', right: '20px', zIndex: 9999 }}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            onClose={() => removeToast(toast.id)}
            delay={toast.duration}
            autohide
            style={{ backgroundColor: getBackground(toast.type), border: 'none' }}
          >
            <Toast.Header closeButton>
              <span className="me-2">{getIcon(toast.type)}</span>
              <strong className="me-auto">
                {toast.type === 'success' ? 'Sucesso' :
                 toast.type === 'error' ? 'Erro' :
                 toast.type === 'warning' ? 'Atenção' : 'Informação'}
              </strong>
            </Toast.Header>
            <Toast.Body>{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};
