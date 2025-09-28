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
  fetchVisitantes,
  deleteVisitante,
  registrarSalida,
  MOTIVOS_VISITA,
} from "../../services/visitantes";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaUserFriends,
  FaDownload,
  FaFileExcel,
  FaFilePdf,
  FaFilter,
  FaSignOutAlt,
  FaUser,
  FaHome,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaCar,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function VisitanteListar() {
  const [visitantes, setVisitantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    motivo: "",
    estado: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Estados para modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVisitanteId, setSelectedVisitanteId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVisitante, setSelectedVisitante] = useState(null);
  const [showSalidaModal, setShowSalidaModal] = useState(false);
  const [visitanteSalida, setVisitanteSalida] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadVisitantes(currentPage, searchTerm, filters);
  }, [currentPage, searchTerm, filters]);

  const loadVisitantes = async (page, search = "", filterParams = {}) => {
    try {
      setLoading(true);
      const data = await fetchVisitantes(page, search, filterParams);
      setVisitantes(data.results);
      const total = Math.ceil(data.count / 10);
      setTotalPages(total);
    } catch (err) {
      console.error("Error cargando visitantes:", err);
      alert("Error al cargar los visitantes");
    } finally {
      setLoading(false);
    }
  };

  // Handlers para modales
  const handleShowDeleteModal = (id) => {
    setSelectedVisitanteId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedVisitanteId(null);
    setShowDeleteModal(false);
  };

  const handleShowDetailModal = (visitante) => {
    setSelectedVisitante(visitante);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedVisitante(null);
    setShowDetailModal(false);
  };

  const handleShowSalidaModal = (visitante) => {
    setVisitanteSalida(visitante);
    setShowSalidaModal(true);
  };

  const handleCloseSalidaModal = () => {
    setVisitanteSalida(null);
    setShowSalidaModal(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteVisitante(selectedVisitanteId);
      loadVisitantes(currentPage, searchTerm, filters);
    } catch (err) {
      console.error("Error eliminando visitante:", err);
      alert("Error al eliminar el visitante");
    } finally {
      handleCloseDeleteModal();
    }
  };

  const handleRegistrarSalida = async () => {
    try {
      await registrarSalida(visitanteSalida.id);
      loadVisitantes(currentPage, searchTerm, filters);
      handleCloseSalidaModal();
    } catch (err) {
      console.error("Error registrando salida:", err);
      alert("Error al registrar la salida");
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
      motivo: "",
      estado: "",
    });
    setCurrentPage(1);
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      visitantes.map((visitante) => ({
        ID: visitante.id,
        Nombre: visitante.nombre,
        Documento: visitante.documento_identidad,
        Teléfono: visitante.telefono,
        Motivo: getMotivoDisplay(visitante.motivo_visita),
        Anfitrión: visitante.anfitrion
          ? `${visitante.anfitrion.nombre} ${visitante.anfitrion.apellidos}`
          : "No especificado",
        Unidad:
          visitante.anfitrion?.unidades_habitacionales[0]?.codigo || "N/A",
        "Fecha Entrada": new Date(visitante.fecha_entrada).toLocaleString(),
        "Fecha Salida": visitante.fecha_salida
          ? new Date(visitante.fecha_salida).toLocaleString()
          : "En visita",
        "Placa Vehículo": visitante.placa_vehiculo || "No registrada",
        Estado: visitante.fecha_salida ? "Salida registrada" : "En visita",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Visitantes");
    XLSX.writeFile(workbook, "visitantes.xlsx");
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text("Reporte de Visitantes", 14, 15);

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 22);

    // Preparar datos para la tabla
    const tableData = visitantes.map((visitante) => [
      visitante.id,
      visitante.nombre,
      visitante.documento_identidad,
      getMotivoDisplay(visitante.motivo_visita),
      visitante.anfitrion?.nombre || "N/A",
      visitante.fecha_salida ? "Salida" : "En visita",
      new Date(visitante.fecha_entrada).toLocaleDateString(),
    ]);

    // Crear tabla usando autoTable
    autoTable(doc, {
      startY: 30,
      head: [
        [
          "ID",
          "Nombre",
          "Documento",
          "Motivo",
          "Anfitrión",
          "Estado",
          "Fecha Entrada",
        ],
      ],
      body: tableData,
      styles: { fontSize: 7 },
      headStyles: {
        fillColor: [40, 167, 69],
        textColor: 255,
      },
    });

    doc.save("visitantes.pdf");
  };

  // Funciones auxiliares para displays
  const getMotivoDisplay = (motivo) => {
    const motivoObj = MOTIVOS_VISITA.find((m) => m.value === motivo);
    return motivoObj ? motivoObj.label : motivo;
  };

  // Funciones para badges
  const getMotivoBadge = (motivo) => {
    const colors = {
      visita_familiar: "primary",
      visita_amigo: "info",
      entrega_comida: "success",
      entrega_paquete: "warning",
      servicio_tecnico: "secondary",
      mantenimiento: "dark",
      limpieza: "light",
      reunion: "info",
      trabajo: "primary",
      otro: "secondary",
    };
    return (
      <Badge bg={colors[motivo] || "secondary"}>
        {getMotivoDisplay(motivo)}
      </Badge>
    );
  };

  const getEstadoBadge = (fechaSalida) => {
    return fechaSalida ? (
      <Badge bg="secondary">Salida registrada</Badge>
    ) : (
      <Badge bg="success">En visita</Badge>
    );
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
          <FaUserFriends className="me-2 text-success" />
          Control de Visitantes
        </h2>
        <Button onClick={() => navigate("/visitantes/crear")} variant="success">
          Nuevo Visitante
        </Button>
      </div>

      {/* Barra de búsqueda, filtros y exportación */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <input
            type="text"
            placeholder="Buscar por nombre, documento, teléfono..."
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
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Motivo de Visita</Form.Label>
                  <Form.Select
                    value={filters.motivo}
                    onChange={(e) =>
                      handleFilterChange("motivo", e.target.value)
                    }
                  >
                    <option value="">Todos los motivos</option>
                    {MOTIVOS_VISITA.map((motivo) => (
                      <option key={motivo.value} value={motivo.value}>
                        {motivo.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={filters.estado}
                    onChange={(e) =>
                      handleFilterChange("estado", e.target.value)
                    }
                  >
                    <option value="">Todos los estados</option>
                    <option value="activo">En visita</option>
                    <option value="salida">Salida registrada</option>
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
          <p>Cargando visitantes...</p>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Visitante</th>
                <th>Documento</th>
                <th>Motivo</th>
                <th>Anfitrión</th>
                <th>Unidad</th>
                <th>Fecha Entrada</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visitantes.map((visitante) => (
                <tr
                  key={visitante.id}
                  className={!visitante.fecha_salida ? "table-success" : ""}
                >
                  <td>{visitante.id}</td>
                  <td>
                    <strong>{visitante.nombre}</strong>
                    {visitante.telefono && (
                      <div>
                        <FaPhone className="me-1 text-muted" size={12} />
                        <small className="text-muted">
                          {visitante.telefono}
                        </small>
                      </div>
                    )}
                  </td>
                  <td>
                    <FaIdCard className="me-1 text-muted" />
                    {visitante.documento_identidad}
                  </td>
                  <td>{getMotivoBadge(visitante.motivo_visita)}</td>
                  <td>
                    {visitante.anfitrion
                      ? `${visitante.anfitrion.nombre} ${visitante.anfitrion.apellidos}`
                      : "No especificado"}
                  </td>
                  <td>
                    <FaHome className="me-1 text-muted" />
                    {visitante.anfitrion?.unidades_habitacionales[0]?.codigo ||
                      "N/A"}
                  </td>
                  <td>
                    <FaCalendarAlt className="me-1 text-muted" />
                    {formatFecha(visitante.fecha_entrada)}
                  </td>
                  <td>{getEstadoBadge(visitante.fecha_salida)}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => handleShowDetailModal(visitante)}
                      className="me-1"
                      title="Ver detalles"
                    >
                      <FaEye />
                    </Button>

                    {!visitante.fecha_salida && (
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => handleShowSalidaModal(visitante)}
                        className="me-1"
                        title="Registrar salida"
                      >
                        <FaSignOutAlt />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        navigate(`/visitantes/editar/${visitante.id}`)
                      }
                      className="me-1"
                      title="Editar"
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleShowDeleteModal(visitante.id)}
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
                {visitantes.length} visitantes
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
          ¿Estás seguro de que quieres eliminar este registro de visitante? Esta
          acción no se puede deshacer.
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

      {/* Modal de Registro de Salida */}
      {visitanteSalida && (
        <Modal show={showSalidaModal} onHide={handleCloseSalidaModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <FaSignOutAlt className="me-2 text-warning" />
              Registrar Salida
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              ¿Estás seguro de que quieres registrar la salida de{" "}
              <strong>{visitanteSalida.nombre}</strong>?
            </p>
            <div className="bg-light p-3 rounded">
              <p>
                <strong>Documento:</strong>{" "}
                {visitanteSalida.documento_identidad}
              </p>
              <p>
                <strong>Anfitrión:</strong> {visitanteSalida.anfitrion?.nombre}{" "}
                {visitanteSalida.anfitrion?.apellidos}
              </p>
              <p>
                <strong>Entrada:</strong>{" "}
                {formatFecha(visitanteSalida.fecha_entrada)}
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseSalidaModal}>
              Cancelar
            </Button>
            <Button variant="warning" onClick={handleRegistrarSalida}>
              <FaSignOutAlt className="me-1" />
              Registrar Salida
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Modal de Detalles */}
      {selectedVisitante && (
        <Modal
          show={showDetailModal}
          onHide={handleCloseDetailModal}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaUserFriends className="me-2 text-success" />
              Detalles del Visitante
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p>
                      <FaUser className="me-2" />
                      <strong>Nombre:</strong> {selectedVisitante.nombre}
                    </p>
                    <p>
                      <FaIdCard className="me-2" />
                      <strong>Documento:</strong>{" "}
                      {selectedVisitante.documento_identidad}
                    </p>
                    <p>
                      <FaPhone className="me-2" />
                      <strong>Teléfono:</strong>{" "}
                      {selectedVisitante.telefono || "No registrado"}
                    </p>
                    <p>
                      <strong>Motivo:</strong>{" "}
                      {getMotivoBadge(selectedVisitante.motivo_visita)}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <FaCalendarAlt className="me-2" />
                      <strong>Entrada:</strong>{" "}
                      {formatFecha(selectedVisitante.fecha_entrada)}
                    </p>
                    <p>
                      <FaSignOutAlt className="me-2" />
                      <strong>Salida:</strong>{" "}
                      {selectedVisitante.fecha_salida ? (
                        formatFecha(selectedVisitante.fecha_salida)
                      ) : (
                        <Badge bg="success">En visita</Badge>
                      )}
                    </p>
                    <p>
                      <FaCar className="me-2" />
                      <strong>Vehículo:</strong>{" "}
                      {selectedVisitante.placa_vehiculo || "No registrado"}
                    </p>
                    <p>
                      <strong>Estado:</strong>{" "}
                      {getEstadoBadge(selectedVisitante.fecha_salida)}
                    </p>
                  </Col>
                </Row>

                <hr />

                {selectedVisitante.anfitrion && (
                  <>
                    <p>
                      <strong>Información del Anfitrión:</strong>
                    </p>
                    <div className="bg-light p-3 rounded">
                      <p>
                        <strong>Nombre:</strong>{" "}
                        {selectedVisitante.anfitrion.nombre}{" "}
                        {selectedVisitante.anfitrion.apellidos}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {selectedVisitante.anfitrion.email}
                      </p>
                      <p>
                        <strong>Teléfono:</strong>{" "}
                        {selectedVisitante.anfitrion.telefono}
                      </p>
                      <p>
                        <strong>Unidad:</strong>{" "}
                        {selectedVisitante.anfitrion.unidades_habitacionales[0]
                          ?.codigo || "N/A"}
                      </p>
                      <p>
                        <strong>Condominio:</strong>{" "}
                        {selectedVisitante.anfitrion.unidades_habitacionales[0]
                          ?.condominio_nombre || "N/A"}
                      </p>
                    </div>
                  </>
                )}

                <hr />

                <p>
                  <strong>Información de Registro:</strong>
                </p>
                <div className="row">
                  <div className="col-md-6">
                    <small>
                      <strong>Creado:</strong>{" "}
                      {formatFecha(selectedVisitante.created_at)}
                    </small>
                  </div>
                  <div className="col-md-6">
                    <small>
                      <strong>Actualizado:</strong>{" "}
                      {formatFecha(selectedVisitante.updated_at)}
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Modal.Body>
          <Modal.Footer>
            {!selectedVisitante.fecha_salida && (
              <Button
                variant="warning"
                onClick={() => {
                  handleShowSalidaModal(selectedVisitante);
                  handleCloseDetailModal();
                }}
              >
                <FaSignOutAlt className="me-1" />
                Registrar Salida
              </Button>
            )}
            <Button variant="secondary" onClick={handleCloseDetailModal}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </DashboardLayout>
  );
}

export default VisitanteListar;
