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
  fetchIncidentes,
  deleteIncidente,
  TIPOS_INCIDENTE,
  GRAVEDADES,
  ESTADOS_INCIDENTE,
} from "../../services/incidentes";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaShieldAlt,
  FaDownload,
  FaFileExcel,
  FaFilePdf,
  FaFilter,
  FaExclamationTriangle,
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function IncidenteListar() {
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    tipo: "",
    gravedad: "",
    estado: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Estados para modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIncidenteId, setSelectedIncidenteId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIncidente, setSelectedIncidente] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadIncidentes(currentPage, searchTerm, filters);
  }, [currentPage, searchTerm, filters]);

  const loadIncidentes = async (page, search = "", filterParams = {}) => {
    try {
      setLoading(true);
      const data = await fetchIncidentes(page, search, filterParams);
      setIncidentes(data.results);
      const total = Math.ceil(data.count / 10);
      setTotalPages(total);
    } catch (err) {
      console.error("Error cargando incidentes:", err);
      alert("Error al cargar los incidentes");
    } finally {
      setLoading(false);
    }
  };

  // Handlers para modales
  const handleShowDeleteModal = (id) => {
    setSelectedIncidenteId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedIncidenteId(null);
    setShowDeleteModal(false);
  };

  const handleShowDetailModal = (incidente) => {
    setSelectedIncidente(incidente);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedIncidente(null);
    setShowDetailModal(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteIncidente(selectedIncidenteId);
      loadIncidentes(currentPage, searchTerm, filters);
    } catch (err) {
      console.error("Error eliminando incidente:", err);
      alert("Error al eliminar el incidente");
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
      gravedad: "",
      estado: "",
    });
    setCurrentPage(1);
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      incidentes.map((incidente) => ({
        ID: incidente.id,
        Tipo: getTipoDisplay(incidente.tipo),
        Descripción: incidente.descripcion,
        Ubicación: incidente.ubicacion,
        Gravedad: getGravedadDisplay(incidente.gravedad),
        Estado: getEstadoDisplay(incidente.estado),
        "Fecha/Hora": new Date(incidente.fecha_hora).toLocaleString(),
        "Usuario Asignado": incidente.usuario_asignado
          ? `${incidente.usuario_asignado.nombre} ${incidente.usuario_asignado.apellidos}`
          : "No asignado",
        "Fecha Creación": new Date(incidente.created_at).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Incidentes");
    XLSX.writeFile(workbook, "incidentes-seguridad.xlsx");
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text("Reporte de Incidentes de Seguridad", 14, 15);

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 22);

    // Preparar datos para la tabla
    const tableData = incidentes.map((incidente) => [
      incidente.id,
      getTipoDisplay(incidente.tipo),
      incidente.descripcion.substring(0, 30) + "...",
      incidente.ubicacion,
      getGravedadDisplay(incidente.gravedad),
      getEstadoDisplay(incidente.estado),
      new Date(incidente.fecha_hora).toLocaleDateString(),
    ]);

    // Crear tabla usando autoTable
    autoTable(doc, {
      startY: 30,
      head: [
        [
          "ID",
          "Tipo",
          "Descripción",
          "Ubicación",
          "Gravedad",
          "Estado",
          "Fecha",
        ],
      ],
      body: tableData,
      styles: { fontSize: 7 },
      headStyles: {
        fillColor: [220, 53, 69],
        textColor: 255,
      },
    });

    doc.save("incidentes-seguridad.pdf");
  };

  // Funciones auxiliares para displays
  const getTipoDisplay = (tipo) => {
    const tipoObj = TIPOS_INCIDENTE.find((t) => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  };

  const getGravedadDisplay = (gravedad) => {
    const gravedadObj = GRAVEDADES.find((g) => g.value === gravedad);
    return gravedadObj ? gravedadObj.label : gravedad;
  };

  const getEstadoDisplay = (estado) => {
    const estadoObj = ESTADOS_INCIDENTE.find((e) => e.value === estado);
    return estadoObj ? estadoObj.label : estado;
  };

  // Funciones para badges
  const getTipoBadge = (tipo) => {
    const colors = {
      intrusion: "danger",
      vandalismo: "warning",
      robo: "dark",
      accidente: "info",
      incendio: "danger",
      fuga_agua: "primary",
      falla_electrica: "warning",
      mascota_suelta: "success",
      vehiculo_mal_estacionado: "secondary",
      ruido_excesivo: "light",
      sospechoso: "dark",
      otro: "secondary",
    };
    return (
      <Badge bg={colors[tipo] || "secondary"}>{getTipoDisplay(tipo)}</Badge>
    );
  };

  const getGravedadBadge = (gravedad) => {
    const colors = {
      baja: "success",
      media: "warning",
      alta: "danger",
      critica: "dark",
    };
    return (
      <Badge bg={colors[gravedad] || "secondary"}>
        {getGravedadDisplay(gravedad)}
      </Badge>
    );
  };

  const getEstadoBadge = (estado) => {
    const colors = {
      reportado: "secondary",
      investigando: "warning",
      resuelto: "success",
      cerrado: "dark",
    };
    return (
      <Badge bg={colors[estado] || "secondary"}>
        {getEstadoDisplay(estado)}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
          <FaShieldAlt className="me-2 text-danger" />
          Incidentes de Seguridad
        </h2>
        <Button
          onClick={() => navigate("/incidentes-seguridad/crear")}
          variant="danger"
        >
          <FaExclamationTriangle className="me-1" />
          Nuevo Incidente
        </Button>
      </div>

      {/* Barra de búsqueda, filtros y exportación */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <input
            type="text"
            placeholder="Buscar por descripción, ubicación..."
            className="form-control me-2"
            style={{ width: "300px" }}
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
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Tipo de Incidente</Form.Label>
                  <Form.Select
                    value={filters.tipo}
                    onChange={(e) => handleFilterChange("tipo", e.target.value)}
                  >
                    <option value="">Todos los tipos</option>
                    {TIPOS_INCIDENTE.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Gravedad</Form.Label>
                  <Form.Select
                    value={filters.gravedad}
                    onChange={(e) =>
                      handleFilterChange("gravedad", e.target.value)
                    }
                  >
                    <option value="">Todas las gravedades</option>
                    {GRAVEDADES.map((gravedad) => (
                      <option key={gravedad.value} value={gravedad.value}>
                        {gravedad.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={filters.estado}
                    onChange={(e) =>
                      handleFilterChange("estado", e.target.value)
                    }
                  >
                    <option value="">Todos los estados</option>
                    {ESTADOS_INCIDENTE.map((estado) => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
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
          <p>Cargando incidentes...</p>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Ubicación</th>
                <th>Gravedad</th>
                <th>Estado</th>
                <th>Fecha/Hora</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {incidentes.map((incidente) => (
                <tr key={incidente.id}>
                  <td>{incidente.id}</td>
                  <td>{getTipoBadge(incidente.tipo)}</td>
                  <td>
                    <strong>{incidente.descripcion}</strong>
                  </td>
                  <td>
                    <FaMapMarkerAlt className="me-1 text-muted" />
                    {incidente.ubicacion}
                  </td>
                  <td>{getGravedadBadge(incidente.gravedad)}</td>
                  <td>{getEstadoBadge(incidente.estado)}</td>
                  <td>
                    <FaCalendarAlt className="me-1 text-muted" />
                    {new Date(incidente.fecha_hora).toLocaleString()}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => handleShowDetailModal(incidente)}
                      className="me-1"
                      title="Ver detalles"
                    >
                      <FaEye />
                    </Button>

                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() =>
                        navigate(`/incidentes-seguridad/editar/${incidente.id}`)
                      }
                      className="me-1"
                      title="Editar"
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleShowDeleteModal(incidente.id)}
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
                {incidentes.length} incidentes
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
          ¿Estás seguro de que quieres eliminar este incidente de seguridad?
          Esta acción no se puede deshacer.
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
      {selectedIncidente && (
        <Modal
          show={showDetailModal}
          onHide={handleCloseDetailModal}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaShieldAlt className="me-2 text-danger" />
              Detalles del Incidente #{selectedIncidente.id}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>ID:</strong> {selectedIncidente.id}
                    </p>
                    <p>
                      <strong>Tipo:</strong>{" "}
                      {getTipoBadge(selectedIncidente.tipo)}
                    </p>
                    <p>
                      <strong>Gravedad:</strong>{" "}
                      {getGravedadBadge(selectedIncidente.gravedad)}
                    </p>
                    <p>
                      <strong>Estado:</strong>{" "}
                      {getEstadoBadge(selectedIncidente.estado)}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Ubicación:</strong> {selectedIncidente.ubicacion}
                    </p>
                    <p>
                      <strong>Fecha/Hora:</strong>{" "}
                      {new Date(selectedIncidente.fecha_hora).toLocaleString()}
                    </p>
                    <p>
                      <strong>Reportado:</strong>{" "}
                      {new Date(selectedIncidente.created_at).toLocaleString()}
                    </p>
                  </Col>
                </Row>

                <hr />

                <p>
                  <strong>Descripción:</strong>
                </p>
                <Card className="bg-light">
                  <Card.Body>{selectedIncidente.descripcion}</Card.Body>
                </Card>

                {selectedIncidente.usuario_asignado && (
                  <>
                    <hr />
                    <p>
                      <strong>Personal Asignado:</strong>
                    </p>
                    <div className="bg-light p-3 rounded">
                      <p>
                        <FaUser className="me-2" />
                        <strong>Nombre:</strong>{" "}
                        {selectedIncidente.usuario_asignado.nombre}{" "}
                        {selectedIncidente.usuario_asignado.apellidos}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {selectedIncidente.usuario_asignado.email}
                      </p>
                      <p>
                        <strong>Teléfono:</strong>{" "}
                        {selectedIncidente.usuario_asignado.telefono}
                      </p>
                      <p>
                        <strong>Cargo:</strong>{" "}
                        {selectedIncidente.usuario_asignado.tipo_display}
                      </p>
                    </div>
                  </>
                )}

                {selectedIncidente.confidence_score !== null && (
                  <>
                    <hr />
                    <p>
                      <strong>Confidence Score:</strong>{" "}
                      {selectedIncidente.confidence_score}
                    </p>
                  </>
                )}

                {(selectedIncidente.evidencia_foto ||
                  selectedIncidente.evidencia_video) && (
                  <>
                    <hr />
                    <p>
                      <strong>Evidencias:</strong>
                    </p>
                    <div className="d-flex gap-2">
                      {selectedIncidente.evidencia_foto && (
                        <Button variant="outline-primary" size="sm">
                          Ver Foto
                        </Button>
                      )}
                      {selectedIncidente.evidencia_video && (
                        <Button variant="outline-info" size="sm">
                          Ver Video
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDetailModal}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </DashboardLayout>
  );
}

export default IncidenteListar;
