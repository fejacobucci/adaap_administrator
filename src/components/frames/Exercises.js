import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Row, Col, Card, Table, Button, Form, InputGroup, Spinner, Badge, Modal, Pagination, Alert } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaFilter, FaFileExcel, FaDownload, FaUpload, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { exerciseService } from '../../services/apiService';
import { useToast } from '../../contexts/ToastContext';
import './Exercises.css';

const CATEGORIES = [
  { value: '', label: 'Todas' },
  { value: 'CHEST', label: 'Peito' },
  { value: 'BACK', label: 'Costas' },
  { value: 'SHOULDERS', label: 'Ombros' },
  { value: 'ARMS', label: 'Braços' },
  { value: 'LEGS', label: 'Pernas' },
  { value: 'CORE', label: 'Core' },
  { value: 'CARDIO', label: 'Cardio' },
  { value: 'FUNCTIONAL', label: 'Funcional' },
  { value: 'STRETCHING', label: 'Alongamento' }
];

const DIFFICULTIES = [
  { value: '', label: 'Todas' },
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' }
];

const EQUIPMENT = [
  { value: 'BODYWEIGHT', label: 'Peso Corporal' },
  { value: 'DUMBBELL', label: 'Halteres' },
  { value: 'BARBELL', label: 'Barra' },
  { value: 'MACHINE', label: 'Máquina' },
  { value: 'CABLE', label: 'Cabo' },
  { value: 'KETTLEBELL', label: 'Kettlebell' },
  { value: 'RESISTANCE_BAND', label: 'Elástico' },
  { value: 'OTHER', label: 'Outro' }
];

function Exercises() {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Upload state
  const [uploadData, setUploadData] = useState([]);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [assignToPersonal, setAssignToPersonal] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'CHEST',
    difficulty: 'BEGINNER',
    equipment: 'BODYWEIGHT',
    instructions: '',
    videoUrl: '',
    muscleGroups: '',
    isGlobal: true
  });
  const [actionLoading, setActionLoading] = useState(false);

  const loadExercises = useCallback(async () => {
    setLoading(true);
    try {
      const response = await exerciseService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search,
        category: categoryFilter,
        difficulty: difficultyFilter,
        isGlobal: globalFilter
      });

      if (response.success) {
        setExercises(response.exercises);
        setPagination(prev => ({
          ...prev,
          total: response.total,
          totalPages: response.totalPages
        }));
      }
    } catch (error) {
      toast.error('Erro ao carregar exercícios');
      // Mock data
      setExercises([
        { id: '1', name: 'Supino Reto', category: 'CHEST', difficulty: 'INTERMEDIATE', equipment: 'BARBELL', isGlobal: true },
        { id: '2', name: 'Agachamento Livre', category: 'LEGS', difficulty: 'INTERMEDIATE', equipment: 'BARBELL', isGlobal: true },
        { id: '3', name: 'Flexão de Braços', category: 'CHEST', difficulty: 'BEGINNER', equipment: 'BODYWEIGHT', isGlobal: true },
        { id: '4', name: 'Remada Curvada', category: 'BACK', difficulty: 'INTERMEDIATE', equipment: 'BARBELL', isGlobal: true },
        { id: '5', name: 'Rosca Direta', category: 'ARMS', difficulty: 'BEGINNER', equipment: 'DUMBBELL', isGlobal: false, createdBy: { fullName: 'João Personal' } }
      ]);
      setPagination(prev => ({ ...prev, total: 5, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, categoryFilter, difficultyFilter, globalFilter, toast]);

  const loadProfessionals = async () => {
    try {
      const response = await exerciseService.getProfessionals();
      if (response.success) {
        setProfessionals(response.professionals);
      }
    } catch (error) {
      // Mock data
      setProfessionals([
        { id: 'p1', fullName: 'João Silva - Personal' },
        { id: 'p2', fullName: 'Maria Santos - Personal' },
        { id: 'p3', fullName: 'Pedro Costa - Personal' }
      ]);
    }
  };

  useEffect(() => {
    loadExercises();
    loadProfessionals();
  }, [loadExercises]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // Excel file handling
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Validate data
        const errors = [];
        const validData = data.map((row, index) => {
          const rowErrors = [];

          if (!row.nome && !row.name) {
            rowErrors.push('Nome é obrigatório');
          }

          if (!row.categoria && !row.category) {
            rowErrors.push('Categoria é obrigatória');
          } else {
            const cat = (row.categoria || row.category || '').toUpperCase();
            if (!CATEGORIES.find(c => c.value === cat)) {
              rowErrors.push(`Categoria inválida: ${cat}`);
            }
          }

          if (rowErrors.length > 0) {
            errors.push({ row: index + 2, errors: rowErrors });
          }

          return {
            name: row.nome || row.name || '',
            description: row.descricao || row.description || '',
            category: (row.categoria || row.category || 'CHEST').toUpperCase(),
            difficulty: (row.dificuldade || row.difficulty || 'BEGINNER').toUpperCase(),
            equipment: (row.equipamento || row.equipment || 'BODYWEIGHT').toUpperCase(),
            instructions: row.instrucoes || row.instructions || '',
            videoUrl: row.video || row.videoUrl || '',
            muscleGroups: row.musculos || row.muscleGroups || ''
          };
        });

        setUploadData(validData);
        setUploadErrors(errors);
      } catch (err) {
        toast.error('Erro ao ler arquivo Excel');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkUpload = async () => {
    if (uploadData.length === 0) {
      toast.warning('Nenhum dado para importar');
      return;
    }

    if (uploadErrors.length > 0) {
      toast.warning('Corrija os erros antes de importar');
      return;
    }

    setUploadLoading(true);
    try {
      const response = await exerciseService.bulkUpload(uploadData, assignToPersonal || null);
      if (response.success) {
        toast.success(`${response.imported} exercícios importados com sucesso!`);
        setShowUploadModal(false);
        setUploadData([]);
        setUploadErrors([]);
        setAssignToPersonal('');
        loadExercises();
      }
    } catch (error) {
      toast.error(error.msg || 'Erro ao importar exercícios');
    } finally {
      setUploadLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        nome: 'Exemplo Supino',
        descricao: 'Descrição do exercício',
        categoria: 'CHEST',
        dificuldade: 'INTERMEDIATE',
        equipamento: 'BARBELL',
        instrucoes: 'Passo a passo do exercício',
        video: 'https://youtube.com/...',
        musculos: 'Peitoral, Tríceps, Deltóide Anterior'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exercícios');
    XLSX.writeFile(workbook, 'template_exercicios.xlsx');
  };

  // CRUD operations
  const handleSaveExercise = async () => {
    if (!formData.name) {
      toast.warning('Nome é obrigatório');
      return;
    }

    setActionLoading(true);
    try {
      if (selectedExercise) {
        await exerciseService.update(selectedExercise.id, formData);
        toast.success('Exercício atualizado com sucesso');
      } else {
        await exerciseService.create(formData);
        toast.success('Exercício criado com sucesso');
      }
      setShowEditModal(false);
      resetForm();
      loadExercises();
    } catch (error) {
      toast.error(error.msg || 'Erro ao salvar exercício');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteExercise = async () => {
    if (!selectedExercise) return;

    setActionLoading(true);
    try {
      await exerciseService.delete(selectedExercise.id);
      toast.success('Exercício excluído com sucesso');
      setShowDeleteModal(false);
      setSelectedExercise(null);
      loadExercises();
    } catch (error) {
      toast.error(error.msg || 'Erro ao excluir exercício');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (exercise = null) => {
    if (exercise) {
      setSelectedExercise(exercise);
      setFormData({
        name: exercise.name,
        description: exercise.description || '',
        category: exercise.category,
        difficulty: exercise.difficulty,
        equipment: exercise.equipment,
        instructions: exercise.instructions || '',
        videoUrl: exercise.videoUrl || '',
        muscleGroups: exercise.muscleGroups || '',
        isGlobal: exercise.isGlobal
      });
    } else {
      resetForm();
    }
    setShowEditModal(true);
  };

  const resetForm = () => {
    setSelectedExercise(null);
    setFormData({
      name: '',
      description: '',
      category: 'CHEST',
      difficulty: 'BEGINNER',
      equipment: 'BODYWEIGHT',
      instructions: '',
      videoUrl: '',
      muscleGroups: '',
      isGlobal: true
    });
  };

  const getCategoryBadge = (category) => {
    const colors = {
      CHEST: '#F178B6', BACK: '#94B9B8', SHOULDERS: '#9F9FF8',
      ARMS: '#92BFFF', LEGS: '#FFB347', CORE: '#87CEEB',
      CARDIO: '#FF6B6B', FUNCTIONAL: '#98D8C8', STRETCHING: '#DDA0DD'
    };
    const labels = {
      CHEST: 'Peito', BACK: 'Costas', SHOULDERS: 'Ombros',
      ARMS: 'Braços', LEGS: 'Pernas', CORE: 'Core',
      CARDIO: 'Cardio', FUNCTIONAL: 'Funcional', STRETCHING: 'Alongamento'
    };
    return (
      <Badge style={{ backgroundColor: colors[category] || '#6c757d' }}>
        {labels[category] || category}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = { BEGINNER: 'success', INTERMEDIATE: 'warning', ADVANCED: 'danger' };
    const labels = { BEGINNER: 'Iniciante', INTERMEDIATE: 'Intermediário', ADVANCED: 'Avançado' };
    return <Badge bg={colors[difficulty] || 'secondary'}>{labels[difficulty] || difficulty}</Badge>;
  };

  return (
    <div className="exercises-container">
      {/* Action Buttons */}
      <Row className="mb-4">
        <Col>
          <div className="action-header">
            <Button variant="success" className="add-btn me-2" onClick={() => openEditModal()}>
              <FaPlus className="me-2" /> Novo Exercício
            </Button>
            <Button variant="primary" className="upload-btn" onClick={() => setShowUploadModal(true)}>
              <FaFileExcel className="me-2" /> Importar Excel
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filters Card */}
      <Card className="filters-card mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="align-items-end">
              <Col lg={3} md={6} className="mb-3 mb-lg-0">
                <Form.Label>Buscar</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Nome do exercício..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button type="submit" variant="primary" className="search-btn">
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Col>

              <Col lg={2} md={3} className="mb-3 mb-lg-0">
                <Form.Label><FaFilter className="me-1" /> Categoria</Form.Label>
                <Form.Select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </Form.Select>
              </Col>

              <Col lg={2} md={3} className="mb-3 mb-lg-0">
                <Form.Label><FaFilter className="me-1" /> Dificuldade</Form.Label>
                <Form.Select
                  value={difficultyFilter}
                  onChange={(e) => { setDifficultyFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                >
                  {DIFFICULTIES.map(diff => (
                    <option key={diff.value} value={diff.value}>{diff.label}</option>
                  ))}
                </Form.Select>
              </Col>

              <Col lg={2} md={6} className="mb-3 mb-lg-0">
                <Form.Label><FaFilter className="me-1" /> Tipo</Form.Label>
                <Form.Select
                  value={globalFilter}
                  onChange={(e) => { setGlobalFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                >
                  <option value="">Todos</option>
                  <option value="true">Globais</option>
                  <option value="false">Personalizados</option>
                </Form.Select>
              </Col>

              <Col lg={3} md={6}>
                <Button
                  variant="outline-secondary"
                  className="w-100 clear-btn"
                  onClick={() => {
                    setSearch('');
                    setCategoryFilter('');
                    setDifficultyFilter('');
                    setGlobalFilter('');
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                >
                  <FaTimes className="me-1" /> Limpar Filtros
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Exercises Table */}
      <Card className="exercises-table-card">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Carregando exercícios...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="exercises-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Categoria</th>
                      <th>Dificuldade</th>
                      <th>Equipamento</th>
                      <th>Tipo</th>
                      <th>Criador</th>
                      <th className="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exercises.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4 text-muted">
                          Nenhum exercício encontrado
                        </td>
                      </tr>
                    ) : (
                      exercises.map(exercise => (
                        <tr key={exercise.id}>
                          <td className="exercise-name">{exercise.name}</td>
                          <td>{getCategoryBadge(exercise.category)}</td>
                          <td>{getDifficultyBadge(exercise.difficulty)}</td>
                          <td>{EQUIPMENT.find(e => e.value === exercise.equipment)?.label || exercise.equipment}</td>
                          <td>
                            <Badge bg={exercise.isGlobal ? 'info' : 'secondary'}>
                              {exercise.isGlobal ? 'Global' : 'Personal'}
                            </Badge>
                          </td>
                          <td>{exercise.isGlobal ? 'Sistema' : exercise.createdBy?.fullName || '-'}</td>
                          <td>
                            <div className="action-buttons">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                title="Editar"
                                onClick={() => openEditModal(exercise)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                title="Excluir"
                                onClick={() => { setSelectedExercise(exercise); setShowDeleteModal(true); }}
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
                    Mostrando {exercises.length} de {pagination.total} exercícios
                  </span>
                  <Pagination className="mb-0">
                    <Pagination.First disabled={pagination.page === 1} onClick={() => handlePageChange(1)} />
                    <Pagination.Prev disabled={pagination.page === 1} onClick={() => handlePageChange(pagination.page - 1)} />
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      const pageNum = Math.max(1, pagination.page - 2) + i;
                      if (pageNum > pagination.totalPages) return null;
                      return (
                        <Pagination.Item
                          key={pageNum}
                          active={pagination.page === pageNum}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      );
                    })}
                    <Pagination.Next disabled={pagination.page === pagination.totalPages} onClick={() => handlePageChange(pagination.page + 1)} />
                    <Pagination.Last disabled={pagination.page === pagination.totalPages} onClick={() => handlePageChange(pagination.totalPages)} />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Excel Upload Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} size="lg" centered>
        <Modal.Header closeButton className="upload-modal-header">
          <Modal.Title><FaFileExcel className="me-2" /> Importar Exercícios via Excel</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Instructions */}
          <Alert variant="info" className="mb-4">
            <Alert.Heading><FaInfoCircle className="me-2" /> Como preparar seu arquivo Excel</Alert.Heading>
            <hr />
            <p className="mb-2">O arquivo Excel deve conter as seguintes colunas (cabeçalhos na primeira linha):</p>
            <ul className="mb-3">
              <li><strong>nome</strong> (obrigatório): Nome do exercício</li>
              <li><strong>descricao</strong>: Descrição detalhada</li>
              <li><strong>categoria</strong> (obrigatório): CHEST, BACK, SHOULDERS, ARMS, LEGS, CORE, CARDIO, FUNCTIONAL, STRETCHING</li>
              <li><strong>dificuldade</strong>: BEGINNER, INTERMEDIATE, ADVANCED (padrão: BEGINNER)</li>
              <li><strong>equipamento</strong>: BODYWEIGHT, DUMBBELL, BARBELL, MACHINE, CABLE, KETTLEBELL, RESISTANCE_BAND, OTHER</li>
              <li><strong>instrucoes</strong>: Passo a passo da execução</li>
              <li><strong>video</strong>: URL do vídeo demonstrativo</li>
              <li><strong>musculos</strong>: Grupos musculares trabalhados</li>
            </ul>
            <Button variant="outline-info" size="sm" onClick={downloadTemplate}>
              <FaDownload className="me-2" /> Baixar Template Excel
            </Button>
          </Alert>

          {/* File Upload */}
          <div className="upload-section mb-4">
            <Form.Label>Selecionar Arquivo</Form.Label>
            <InputGroup>
              <Form.Control
                type="file"
                accept=".xlsx,.xls"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
            </InputGroup>
          </div>

          {/* Assign to Personal */}
          <div className="assign-section mb-4">
            <Form.Label>Atribuir exercícios a um Personal (opcional)</Form.Label>
            <Form.Select
              value={assignToPersonal}
              onChange={(e) => setAssignToPersonal(e.target.value)}
            >
              <option value="">Exercícios Globais (Sistema)</option>
              {professionals.map(prof => (
                <option key={prof.id} value={prof.id}>{prof.fullName}</option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Se selecionado, todos os exercícios serão atribuídos ao personal escolhido
            </Form.Text>
          </div>

          {/* Validation Errors */}
          {uploadErrors.length > 0 && (
            <Alert variant="danger" className="mb-4">
              <Alert.Heading>Erros encontrados</Alert.Heading>
              <ul className="mb-0">
                {uploadErrors.map((err, i) => (
                  <li key={i}>Linha {err.row}: {err.errors.join(', ')}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Preview Data */}
          {uploadData.length > 0 && (
            <div className="preview-section">
              <h6 className="mb-3">
                <FaCheck className="text-success me-2" />
                {uploadData.length} exercícios prontos para importar
              </h6>
              <div className="table-responsive" style={{ maxHeight: '200px' }}>
                <Table size="sm" bordered>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Categoria</th>
                      <th>Dificuldade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadData.slice(0, 10).map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td>{item.difficulty}</td>
                      </tr>
                    ))}
                    {uploadData.length > 10 && (
                      <tr>
                        <td colSpan={3} className="text-center text-muted">
                          ... e mais {uploadData.length - 10} exercícios
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleBulkUpload}
            disabled={uploadLoading || uploadData.length === 0 || uploadErrors.length > 0}
          >
            {uploadLoading ? (
              <><Spinner animation="border" size="sm" className="me-2" /> Importando...</>
            ) : (
              <><FaUpload className="me-2" /> Importar {uploadData.length} Exercícios</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit/Create Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton className="edit-modal-header">
          <Modal.Title>{selectedExercise ? 'Editar Exercício' : 'Novo Exercício'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={8} className="mb-3">
                <Form.Label>Nome *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nome do exercício"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Tipo</Form.Label>
                <Form.Select
                  value={formData.isGlobal.toString()}
                  onChange={(e) => setFormData({ ...formData, isGlobal: e.target.value === 'true' })}
                >
                  <option value="true">Global</option>
                  <option value="false">Personalizado</option>
                </Form.Select>
              </Col>
            </Row>

            <Row>
              <Col md={4} className="mb-3">
                <Form.Label>Categoria *</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.filter(c => c.value).map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Dificuldade</Form.Label>
                <Form.Select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  {DIFFICULTIES.filter(d => d.value).map(diff => (
                    <option key={diff.value} value={diff.value}>{diff.label}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label>Equipamento</Form.Label>
                <Form.Select
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                >
                  {EQUIPMENT.map(eq => (
                    <option key={eq.value} value={eq.value}>{eq.label}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Descrição do exercício"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Instruções</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Passo a passo para execução do exercício"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>URL do Vídeo</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://youtube.com/..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Grupos Musculares</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Peitoral, Tríceps, Deltóide..."
                  value={formData.muscleGroups}
                  onChange={(e) => setFormData({ ...formData, muscleGroups: e.target.value })}
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveExercise} disabled={actionLoading}>
            {actionLoading ? <Spinner animation="border" size="sm" /> : 'Salvar'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="delete-modal-header">
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza que deseja excluir o exercício <strong>{selectedExercise?.name}</strong>?</p>
          <p className="text-danger mb-0">Esta ação não pode ser desfeita.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={actionLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteExercise} disabled={actionLoading}>
            {actionLoading ? <Spinner animation="border" size="sm" /> : 'Excluir'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Exercises;
