import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Spinner,
  Modal,
  Card,
  Badge,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import {
  fetchNotificaciones,
  deleteNotificacion,
  marcarComoLeida,
  marcarComoEnviada,
  TIPOS_NOTIFICACION,
  PRIORIDADES,
} from "../../services/notificaciones";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaBell,
  FaDownload,
  FaFileExcel,
  FaFilePdf,
  FaEnvelope,
  FaEnvelopeOpen,
  FaFilter,
  FaCheckCircle,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function NotificacionListar() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    tipo: "",
    prioridad: "",
    enviada: "",
    leida: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Estados para modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotificacionId, setSelectedNotificacionId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotificacion, setSelectedNotificacion] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadNotificaciones(currentPage, searchTerm, filters);
  }, [currentPage, searchTerm, filters]);

  const loadNotificaciones = async (page, search = "", filterParams = {}) => {
    try {
      setLoading(true);
      const data = await fetchNotificaciones(page, search, filterParams);
      setNotificaciones(data.results);
      const total = Math.ceil(data.count / 10);
      setTotalPages(total);
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
      alert("Error al cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  };

  // Handlers para modales
  const handleShowDeleteModal = (id) => {
    setSelectedNotificacionId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedNotificacionId(null);
    setShowDeleteModal(false);
  };

  const handleShowDetailModal = (notificacion) => {
    setSelectedNotificacion(notificacion);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedNotificacion(null);
    setShowDetailModal(false);
  };

  const handleMarcarLeida = async (id) => {
    try {
      await marcarComoLeida(id);
      loadNotificaciones(currentPage, searchTerm, filters);
    } catch (err) {
      console.error("Error marcando como leída:", err);
      alert("Error al marcar como leída");
    }
  };

  const handleMarcarEnviada = async (id) => {
    try {
      await marcarComoEnviada(id);
      loadNotificaciones(currentPage, searchTerm, filters);
    } catch (err) {
      console.error("Error marcando como enviada:", err);
      alert("Error al marcar como enviada");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteNotificacion(selectedNotificacionId);
      loadNotificaciones(currentPage, searchTerm, filters);
    } catch (err) {
      console.error("Error eliminando notificación:", err);
      alert("Error al eliminar la notificación");
    } finally {
      handleCloseDeleteModal();
    }
  };

  // Filtros
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      tipo: "",
      prioridad: "",
      enviada: "",
      leida: "",
    });
    setCurrentPage(1);
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      notificaciones.map((notif) => ({
        ID: notif.id,
        Título: notif.titulo,
        Tipo: notif.tipo_display,
        Prioridad: notif.prioridad_display,
        Usuario: notif.usuario?.nombre
          ? `${notif.usuario.nombre} ${notif.usuario.apellidos}`
          : "N/A",
        Enviada: notif.enviada ? "Sí" : "No",
        Leída: notif.leida ? "Sí" : "No",
        "Fecha Envío": new Date(notif.fecha_envio).toLocaleDateString(),
        "Fecha Creación": new Date(notif.created_at).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Notificaciones");
    XLSX.writeFile(workbook, "notificaciones.xlsx");
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text("Reporte de Notificaciones", 14, 15);

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 22);

    // Preparar datos para la tabla
    const tableData = notificaciones.map((notif) => [
      notif.id,
      notif.titulo,
      notif.tipo_display,
      notif.prioridad_display,
      notif.enviada ? "Sí" : "No",
      notif.leida ? "Sí" : "No",
      new Date(notif.fecha_envio).toLocaleDateString(),
    ]);

    // Crear tabla usando autoTable
    autoTable(doc, {
      startY: 30,
      head: [
        ["ID", "Título", "Tipo", "Prioridad", "Enviada", "Leída", "Fecha"],
      ],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: {
        fillColor: [102, 16, 242],
        textColor: 255,
      },
    });

    doc.save("notificaciones.pdf");
  };

  // Funciones auxiliares para badges
  const getTipoBadge = (tipo) => {
    const colors = {
      mantenimiento: "warning",
      reserva: "info",
      pago: "success",
      seguridad: "danger",
      general: "secondary",
      emergencia: "dark",
      evento: "primary",
      sistema: "light",
    };
    return <Badge bg={colors[tipo] || "secondary"}>{tipo}</Badge>;
  };

  const getPrioridadBadge = (prioridad) => {
    const colors = {
      baja: "success",
      media: "warning",
      alta: "danger",
      urgente: "dark",
    };
    return <Badge bg={colors[prioridad] || "secondary"}>{prioridad}</Badge>;
  };

  const getEstadoBadge = (enviada, leida) => {
    if (leida) return <Badge bg="success">Leída</Badge>;
    if (enviada) return <Badge bg="info">Enviada</Badge>;
    return <Badge bg="secondary">Pendiente</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
          <FaBell className="me-2 text-warning" />
          Notificaciones
        </h2>
        <Button
          onClick={() => navigate("/notificaciones/crear")}
          variant="primary"
        >
          Nueva Notificación
        </Button>
      </div>

      {/* Barra de búsqueda, filtros y exportación */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <input
            type="text"
            placeholder="Buscar por título, mensaje..."
            className="form-control me-2"
            style={{ width: "600px" }}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          <Button
            variant="outline-secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="me-2"
          >
            <FaFilter className="me-1" />
            Filtros
          </Button>
        </div>

        <div>
          <Button
            variant="outline-success"
            onClick={exportToExcel}
            className="me-2"
          >
            <FaFileExcel className="me-1" /> Excel
          </Button>
          <Button variant="outline-danger" onClick={exportToPDF}>
            <FaFilePdf className="me-1" /> PDF
          </Button>
        </div>
      </div>

      {/* Filtros desplegables */}
      {showFilters && (
        <Card className="mb-3">
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Tipo</Form.Label>
                  <Form.Select
                    value={filters.tipo}
                    onChange={(e) => handleFilterChange("tipo", e.target.value)}
                  >
                    <option value="">Todos los tipos</option>
                    {TIPOS_NOTIFICACION.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Prioridad</Form.Label>
                  <Form.Select
                    value={filters.prioridad}
                    onChange={(e) =>
                      handleFilterChange("prioridad", e.target.value)
                    }
                  >
                    <option value="">Todas las prioridades</option>
                    {PRIORIDADES.map((prioridad) => (
                      <option key={prioridad.value} value={prioridad.value}>
                        {prioridad.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Estado Envío</Form.Label>
                  <Form.Select
                    value={filters.enviada}
                    onChange={(e) =>
                      handleFilterChange("enviada", e.target.value)
                    }
                  >
                    <option value="">Todos</option>
                    <option value="true">Enviadas</option>
                    <option value="false">No enviadas</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Estado Lectura</Form.Label>
                  <Form.Select
                    value={filters.leida}
                    onChange={(e) =>
                      handleFilterChange("leida", e.target.value)
                    }
                  >
                    <option value="">Todos</option>
                    <option value="true">Leídas</option>
                    <option value="false">No leídas</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="mt-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={clearFilters}
              >
                Limpiar Filtros
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Cargando notificaciones...</p>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Prioridad</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Fecha Envío</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {notificaciones.map((notif) => (
                <tr
                  key={notif.id}
                  className={!notif.leida ? "table-warning" : ""}
                >
                  <td>{notif.id}</td>
                  <td>
                    <strong>{notif.titulo}</strong>
                    {!notif.leida && <FaBell className="ms-1 text-warning" />}
                  </td>
                  <td>{getTipoBadge(notif.tipo)}</td>
                  <td>{getPrioridadBadge(notif.prioridad)}</td>
                  <td>
                    {notif.usuario
                      ? `${notif.usuario.nombre} ${notif.usuario.apellidos}`
                      : "Sistema"}
                  </td>
                  <td>{getEstadoBadge(notif.enviada, notif.leida)}</td>
                  <td>{new Date(notif.fecha_envio).toLocaleDateString()}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => handleShowDetailModal(notif)}
                      className="me-1"
                      title="Ver detalles"
                    >
                      <FaEye />
                    </Button>

                    {!notif.leida && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleMarcarLeida(notif.id)}
                        className="me-1"
                        title="Marcar como leída"
                      >
                        <FaEnvelopeOpen />
                      </Button>
                    )}

                    {!notif.enviada && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleMarcarEnviada(notif.id)}
                        className="me-1"
                        title="Marcar como enviada"
                      >
                        <FaEnvelope />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() =>
                        navigate(`/notificaciones/editar/${notif.id}`)
                      }
                      className="me-1"
                      title="Editar"
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleShowDeleteModal(notif.id)}
                      title="Eliminar"
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <span>
                Página {currentPage} de {totalPages} - Total:{" "}
                {notificaciones.length} notificaciones
              </span>
              <div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="me-2"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que quieres eliminar esta notificación? Esta acción
          no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Detalles */}
      {selectedNotificacion && (
        <Modal
          show={showDetailModal}
          onHide={handleCloseDetailModal}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaBell className="me-2 text-warning" />
              Detalles de Notificación
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Card>
              <Card.Body>
                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <strong>ID:</strong> {selectedNotificacion.id}
                    </p>
                    <p>
                      <strong>Título:</strong> {selectedNotificacion.titulo}
                    </p>
                    <p>
                      <strong>Tipo:</strong>{" "}
                      {getTipoBadge(selectedNotificacion.tipo)}
                    </p>
                    <p>
                      <strong>Prioridad:</strong>{" "}
                      {getPrioridadBadge(selectedNotificacion.prioridad)}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Estado:</strong>{" "}
                      {getEstadoBadge(
                        selectedNotificacion.enviada,
                        selectedNotificacion.leida
                      )}
                    </p>
                    <p>
                      <strong>Fecha Envío:</strong>{" "}
                      {new Date(
                        selectedNotificacion.fecha_envio
                      ).toLocaleString()}
                    </p>
                    <p>
                      <strong>Fecha Creación:</strong>{" "}
                      {new Date(
                        selectedNotificacion.created_at
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                <hr />

                <p>
                  <strong>Mensaje:</strong>
                </p>
                <Card className="bg-light">
                  <Card.Body>{selectedNotificacion.mensaje}</Card.Body>
                </Card>

                {selectedNotificacion.usuario && (
                  <>
                    <hr />
                    <p>
                      <strong>Información del Usuario:</strong>
                    </p>
                    <div className="bg-light p-3 rounded">
                      <p>
                        <strong>Nombre:</strong>{" "}
                        {selectedNotificacion.usuario.nombre}{" "}
                        {selectedNotificacion.usuario.apellidos}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {selectedNotificacion.usuario.email}
                      </p>
                      <p>
                        <strong>Teléfono:</strong>{" "}
                        {selectedNotificacion.usuario.telefono}
                      </p>
                      <p>
                        <strong>Tipo:</strong>{" "}
                        {selectedNotificacion.usuario.tipo_display}
                      </p>
                    </div>
                  </>
                )}

                {selectedNotificacion.unidad_habitacional && (
                  <>
                    <hr />
                    <p>
                      <strong>Unidad Habitacional:</strong>{" "}
                      {selectedNotificacion.unidad_habitacional}
                    </p>
                  </>
                )}
              </Card.Body>
            </Card>
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex gap-2">
              {!selectedNotificacion.leida && (
                <Button
                  variant="success"
                  onClick={() => {
                    handleMarcarLeida(selectedNotificacion.id);
                    handleCloseDetailModal();
                  }}
                >
                  <FaCheckCircle className="me-1" />
                  Marcar como Leída
                </Button>
              )}
              <Button variant="secondary" onClick={handleCloseDetailModal}>
                Cerrar
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </DashboardLayout>
  );
}

export default NotificacionListar;
