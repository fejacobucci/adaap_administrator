import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import { authService } from '../services/apiService';
import { useToast } from '../contexts/ToastContext';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role === 'ADMIN') {
          navigate('/home');
        }
      } catch {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(email, password);
      if (response.success) {
        toast.success('Login realizado com sucesso!');
        navigate('/home');
      } else {
        setError(response.msg || 'Credenciais inválidas');
      }
    } catch (err) {
      setError(err.msg || 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Container className="login-container">
        <Card className="login-card">
          <Card.Body className="login-card-body">
            <div className="login-header">
              <div className="login-icon">
                <FaShieldAlt size={40} />
              </div>
              <h2>ADAAP Administrator</h2>
              <p>Painel Administrativo</p>
            </div>

            {error && (
              <Alert variant="danger" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3 input-group-custom">
                <div className="input-icon">
                  <FaEnvelope />
                </div>
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="input-with-icon"
                />
              </Form.Group>

              <Form.Group className="mb-4 input-group-custom">
                <div className="input-icon">
                  <FaLock />
                </div>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="input-with-icon"
                />
                <div
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </Form.Group>

              <Button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </Form>

            <div className="login-footer">
              <p>Acesso restrito a administradores</p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Login;
