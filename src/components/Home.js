import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChartBar, FaUsers, FaDumbbell, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';
import { authService } from '../services/apiService';
import Dashboard from './frames/Dashboard';
import Users from './frames/Users';
import Exercises from './frames/Exercises';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = authService.getUser();
    if (!userData || userData.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    setUser(userData);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    { id: 'users', label: 'Usuários', icon: <FaUsers /> },
    { id: 'exercises', label: 'Exercícios', icon: <FaDumbbell /> }
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <Users />;
      case 'exercises':
        return <Exercises />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="home-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FaShieldAlt size={32} />
          </div>
          <h3>ADAAP Admin</h3>
          {user && <p className="admin-name">{user.fullName}</p>}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Sair</span>
          </button>
          <p className="footer-text">ADAAP Platform</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <h1 className="page-title">
            {menuItems.find(m => m.id === currentView)?.label || 'Dashboard'}
          </h1>
        </header>

        <div className="content-area">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default Home;
