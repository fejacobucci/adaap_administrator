import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Button, Form, InputGroup, Spinner, Badge, Modal, Pagination } from 'react-bootstrap';
import { FaSearch, FaUserLock, FaUserCheck, FaTrash, FaKey, FaFilter, FaEye, FaTimes } from 'react-icons/fa';
import { userService } from '../../services/apiService';
import { useToast } from '../../contexts/ToastContext';
import './Users.css';

const ROLES = [
  { value: '', label: 'Todos' },
  { value: 'STUDENT', label: 'Aluno' },
  { value: 'PERSONAL', label: 'Personal' },
  { value: 'NUTRITIONIST', label: 'Nutricionista' },
  { value: 'PHYSIOTHERAPIST', label: 'Fisioterapeuta' },
  { value: 'ADMIN', label: 'Admin' }
];

const STATUS = [
  { value: '', label: 'Todos' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'INACTIVE', label: 'Inativo' },
  { value: 'SUSPENDED', label: 'Suspenso' }
];

function Users() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search,
        role: roleFilter,
        status: statusFilter
      });

      if (response.success) {
        setUsers(response.users);
        setPagination(prev => ({
          ...prev,
          total: response.total,
          totalPages: response.totalPages
        }));
      }
    } catch (error) {
      toast.error('Erro ao carregar usuários');
      // Mock data for development
      setUsers([
        { id: '1', fullName: 'João Silva', email: 'joao@email.com', phone: '11999998888', role: 'STUDENT', status: 'ACTIVE', createdAt: '2024-01-15' },
        { id: '2', fullName: 'Maria Santos', email: 'maria@email.com', phone: '11999997777', role: 'PERSONAL', status: 'ACTIVE', createdAt: '2024-02-20' },
        { id: '3', fullName: 'Pedro Costa', email: 'pedro@email.com', phone: '11999996666', role: 'STUDENT', status: 'SUSPENDED', createdAt: '2024-03-10' },
        { id: '4', fullName: 'Ana Oliveira', email: 'ana@email.com', phone: '11999995555', role: 'NUTRITIONIST', status: 'ACTIVE', createdAt: '2024-01-25' },
        { id: '5', fullName: 'Carlos Lima', email: 'carlos@email.com', phone: '11999994444', role: 'STUDENT', status: 'INACTIVE', createdAt: '2024-02-05' }
      ]);
      setPagination(prev => ({ ...prev, total: 5, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, roleFilter, statusFilter, toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadUsers();
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleBlockUser = async (user) => {
    setActionLoading(true);
    try {
      if (user.status === 'SUSPENDED') {
        await userService.unblockUser(user.id);
        toast.success('Usuário desbloqueado com sucesso');
      } else {
        await userService.blockUser(user.id);
        toast.success('Usuário bloqueado com sucesso');
      }
      loadUsers();
    } catch (error) {
      toast.error(error.msg || 'Erro ao alterar status do usuário');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await userService.deleteUser(selectedUser.id, false);
      toast.success('Usuário excluído com sucesso');
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      toast.error(error.msg || 'Erro ao excluir usuário');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await userService.resetPassword(selectedUser.id);
      toast.success('Email de reset de senha enviado com sucesso');
      setShowResetModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.msg || 'Erro ao resetar senha');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      STUDENT: 'primary',
      PERSONAL: 'success',
      NUTRITIONIST: 'warning',
      PHYSIOTHERAPIST: 'info',
      ADMIN: 'dark'
    };
    const labels = {
      STUDENT: 'Aluno',
      PERSONAL: 'Personal',
      NUTRITIONIST: 'Nutricionista',
      PHYSIOTHERAPIST: 'Fisio',
      ADMIN: 'Admin'
    };
    return <Badge bg={colors[role] || 'secondary'}>{labels[role] || role}</Badge>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      ACTIVE: 'success',
      INACTIVE: 'secondary',
      SUSPENDED: 'danger',
      PENDING_VERIFICATION: 'warning'
    };
    const labels = {
      ACTIVE: 'Ativo',
      INACTIVE: 'Inativo',
      SUSPENDED: 'Suspenso',
      PENDING_VERIFICATION: 'Pendente'
    };
    return <Badge bg={colors[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="users-container">
      {/* Filters Card */}
      <Card className="filters-card mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="align-items-end">
              <Col lg={4} md={6} className="mb-3 mb-lg-0">
                <Form.Label>Buscar</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Nome, email ou telefone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button type="submit" variant="primary" className="search-btn">
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Col>

              <Col lg={3} md={3} className="mb-3 mb-lg-0">
                <Form.Label><FaFilter className="me-1" /> Tipo</Form.Label>
                <Form.Select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </Form.Select>
              </Col>

              <Col lg={3} md={3} className="mb-3 mb-lg-0">
                <Form.Label><FaFilter className="me-1" /> Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                >
                  {STATUS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </Form.Select>
              </Col>

              <Col lg={2} md={12}>
                <Button
                  variant="outline-secondary"
                  className="w-100 clear-btn"
                  onClick={() => {
                    setSearch('');
                    setRoleFilter('');
                    setStatusFilter('');
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                >
                  <FaTimes className="me-1" /> Limpar
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card className="users-table-card">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Carregando usuários...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="users-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Telefone</th>
                      <th>Tipo</th>
                      <th>Status</th>
                      <th>Criado em</th>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4 text-muted">
                          Nenhum usuário encontrado
                        </td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.id}>
                          <td className="user-name">{user.fullName}</td>
                          <td>{user.email}</td>
                          <td>{user.phone}</td>
                          <td>{getRoleBadge(user.role)}</td>
                          <td>{getStatusBadge(user.status)}</td>
                          <td>{formatDate(user.createdAt)}</td>
                          <td>
                            <div className="action-buttons">
                              <Button
                                variant="outline-info"
                                size="sm"
                                title="Ver detalhes"
                                onClick={() => { setSelectedUser(user); setShowDetailsModal(true); }}
                              >
                                <FaEye />
                              </Button>

                              <Button
                                variant={user.status === 'SUSPENDED' ? 'outline-success' : 'outline-warning'}
                                size="sm"
                                title={user.status === 'SUSPENDED' ? 'Desbloquear' : 'Bloquear'}
                                onClick={() => handleBlockUser(user)}
                                disabled={actionLoading}
                              >
                                {user.status === 'SUSPENDED' ? <FaUserCheck /> : <FaUserLock />}
                              </Button>

                              <Button
                                variant="outline-primary"
                                size="sm"
                                title="Resetar senha"
                                onClick={() => { setSelectedUser(user); setShowResetModal(true); }}
                              >
                                <FaKey />
                              </Button>

                              <Button
                                variant="outline-danger"
                                size="sm"
                                title="Excluir"
                                onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <span className="text-muted">
                    Mostrando {users.length} de {pagination.total} usuários
                  </span>
                  <Pagination className="mb-0">
                    <Pagination.First
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(1)}
                    />
                    <Pagination.Prev
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    />
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={pagination.page === i + 1}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    />
                    <Pagination.Last
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.totalPages)}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
        <Modal.Header closeButton className="details-modal-header">
          <Modal.Title>Detalhes do Usuário</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="user-details">
              <Row>
                <Col md={6} className="mb-3">
                  <label>Nome</label>
                  <p>{selectedUser.fullName}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label>Email</label>
                  <p>{selectedUser.email}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label>Telefone</label>
                  <p>{selectedUser.phone}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label>Tipo</label>
                  <p>{getRoleBadge(selectedUser.role)}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label>Status</label>
                  <p>{getStatusBadge(selectedUser.status)}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label>Criado em</label>
                  <p>{formatDate(selectedUser.createdAt)}</p>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="delete-modal-header">
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza que deseja excluir o usuário <strong>{selectedUser?.fullName}</strong>?</p>
          <p className="text-danger mb-0">Esta ação não pode ser desfeita.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteUser} disabled={actionLoading}>
            {actionLoading ? <Spinner animation="border" size="sm" /> : 'Excluir'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reset Password Modal */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
        <Modal.Header closeButton className="reset-modal-header">
          <Modal.Title>Resetar Senha</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Deseja enviar um email de reset de senha para <strong>{selectedUser?.email}</strong>?</p>
          <p className="text-muted mb-0">O usuário receberá um email com instruções para criar uma nova senha.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetModal(false)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleResetPassword} disabled={actionLoading}>
            {actionLoading ? <Spinner animation="border" size="sm" /> : 'Enviar Email'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Users;
