import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import Login from './components/Login';
import Home from './components/Home';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  const user = localStorage.getItem('adminUser');

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  try {
    const userData = JSON.parse(user);
    if (userData.role !== 'ADMIN') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      return <Navigate to="/" replace />;
    }
  } catch {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default App;
