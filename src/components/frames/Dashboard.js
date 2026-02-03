import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { FaUsers, FaDumbbell, FaUserTie, FaMobileAlt, FaDesktop, FaChartLine, FaUserCheck, FaUserClock } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { dashboardService } from '../../services/apiService';
import { useToast } from '../../contexts/ToastContext';
import './Dashboard.css';

const COLORS = ['#9F9FF8', '#92BFFF', '#94B9B8', '#F178B6', '#B0E0E6'];

function Dashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalProfessionals: 0,
    totalExercises: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    mobileLogins: 0,
    webLogins: 0,
    usersByRole: [],
    usersByStatus: [],
    weeklyActivity: [],
    exercisesByCategory: []
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getMetrics();
      if (response.success) {
        setMetrics(response.data);
      }
    } catch (error) {
      toast.error('Erro ao carregar métricas');
      // Set mock data for development
      setMetrics({
        totalUsers: 156,
        totalStudents: 120,
        totalProfessionals: 36,
        totalExercises: 245,
        activeUsers: 142,
        suspendedUsers: 3,
        mobileLogins: 89,
        webLogins: 45,
        usersByRole: [
          { name: 'Alunos', value: 120, color: '#92BFFF' },
          { name: 'Personal', value: 25, color: '#94B9B8' },
          { name: 'Nutricionista', value: 8, color: '#F178B6' },
          { name: 'Fisioterapeuta', value: 3, color: '#9F9FF8' }
        ],
        usersByStatus: [
          { name: 'Ativos', value: 142, color: '#28a745' },
          { name: 'Inativos', value: 11, color: '#6c757d' },
          { name: 'Suspensos', value: 3, color: '#dc3545' }
        ],
        weeklyActivity: [
          { day: 'Seg', mobile: 45, web: 28 },
          { day: 'Ter', mobile: 52, web: 31 },
          { day: 'Qua', mobile: 48, web: 25 },
          { day: 'Qui', mobile: 61, web: 35 },
          { day: 'Sex', mobile: 55, web: 30 },
          { day: 'Sáb', mobile: 38, web: 15 },
          { day: 'Dom', mobile: 25, web: 8 }
        ],
        exercisesByCategory: [
          { category: 'Peito', count: 32 },
          { category: 'Costas', count: 28 },
          { category: 'Pernas', count: 45 },
          { category: 'Ombros', count: 22 },
          { category: 'Braços', count: 38 },
          { category: 'Core', count: 25 },
          { category: 'Cardio', count: 18 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spinner animation="border" variant="primary" />
        <p>Carregando métricas...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Metric Cards */}
      <Row className="metric-cards-row">
        <Col lg={3} md={6} className="mb-4">
          <Card className="metric-card metric-card-users">
            <Card.Body>
              <div className="metric-icon">
                <FaUsers />
              </div>
              <div className="metric-info">
                <h3>{metrics.totalUsers}</h3>
                <p>Total de Usuários</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="metric-card metric-card-students">
            <Card.Body>
              <div className="metric-icon">
                <FaUserCheck />
              </div>
              <div className="metric-info">
                <h3>{metrics.totalStudents}</h3>
                <p>Alunos</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="metric-card metric-card-professionals">
            <Card.Body>
              <div className="metric-icon">
                <FaUserTie />
              </div>
              <div className="metric-info">
                <h3>{metrics.totalProfessionals}</h3>
                <p>Profissionais</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="metric-card metric-card-exercises">
            <Card.Body>
              <div className="metric-icon">
                <FaDumbbell />
              </div>
              <div className="metric-info">
                <h3>{metrics.totalExercises}</h3>
                <p>Exercícios</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Access Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-4">
          <Card className="access-card">
            <Card.Body className="d-flex align-items-center">
              <div className="access-icon mobile">
                <FaMobileAlt />
              </div>
              <div className="access-info">
                <h4>{metrics.mobileLogins}</h4>
                <p>Acessos Mobile</p>
                <Badge bg="info">Esta semana</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="access-card">
            <Card.Body className="d-flex align-items-center">
              <div className="access-icon web">
                <FaDesktop />
              </div>
              <div className="access-info">
                <h4>{metrics.webLogins}</h4>
                <p>Acessos WebAdmin</p>
                <Badge bg="info">Esta semana</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="access-card">
            <Card.Body className="d-flex align-items-center">
              <div className="access-icon active">
                <FaUserCheck />
              </div>
              <div className="access-info">
                <h4>{metrics.activeUsers}</h4>
                <p>Usuários Ativos</p>
                <Badge bg="success">Online</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-4">
          <Card className="access-card">
            <Card.Body className="d-flex align-items-center">
              <div className="access-icon suspended">
                <FaUserClock />
              </div>
              <div className="access-info">
                <h4>{metrics.suspendedUsers}</h4>
                <p>Usuários Suspensos</p>
                <Badge bg="danger">Bloqueados</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        {/* Weekly Activity Chart */}
        <Col lg={8} className="mb-4">
          <Card className="chart-card">
            <Card.Header>
              <FaChartLine className="me-2" />
              Atividade Semanal
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="day" stroke="#6c757d" />
                  <YAxis stroke="#6c757d" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mobile"
                    stroke="#92BFFF"
                    strokeWidth={3}
                    dot={{ fill: '#92BFFF', strokeWidth: 2 }}
                    name="Mobile"
                  />
                  <Line
                    type="monotone"
                    dataKey="web"
                    stroke="#94B9B8"
                    strokeWidth={3}
                    dot={{ fill: '#94B9B8', strokeWidth: 2 }}
                    name="WebAdmin"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Users by Role Pie Chart */}
        <Col lg={4} className="mb-4">
          <Card className="chart-card">
            <Card.Header>
              <FaUsers className="me-2" />
              Usuários por Tipo
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.usersByRole}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {metrics.usersByRole.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {metrics.usersByRole.map((item, index) => (
                  <div key={index} className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: item.color || COLORS[index] }}></span>
                    <span className="legend-label">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Exercise Chart */}
      <Row>
        <Col lg={12}>
          <Card className="chart-card">
            <Card.Header>
              <FaDumbbell className="me-2" />
              Exercícios por Categoria
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.exercisesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="category" stroke="#6c757d" />
                  <YAxis stroke="#6c757d" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#92BFFF"
                    radius={[4, 4, 0, 0]}
                    name="Exercícios"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
