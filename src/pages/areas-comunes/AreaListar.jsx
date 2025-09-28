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
  fetchAreasComunes,
  deleteAreaComun,
} from "../../services/areas-comunes";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaDownload,
  FaFileExcel,
  FaFilePdf,
  FaFilter,
  FaUsers,
  FaClock,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaHome,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function AreaListar() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    requiere_aprobacion: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Estados para modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadAreas(currentPage, searchTerm, filters);
  }, [currentPage, searchTerm, filters]);

  const loadAreas = async (page, search = "", filterParams = {}) => {
    try {
      setLoading(true);
      const data = await fetchAreasComunes(page, search, filterParams);
      setAreas(data.results);
      const total = Math.ceil(data.count / 10);
      setTotalPages(total);
    } catch (err) {
      console.error("Error cargando áreas comunes:", err);
      alert("Error al cargar las áreas comunes");
    } finally {
      setLoading(false);
    }
  };

  // Handlers para modales
  const handleShowDeleteModal = (id) => {
    setSelectedAreaId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedAreaId(null);
    setShowDeleteModal(false);
  };

  const handleShowDetailModal = (area) => {
    setSelectedArea(area);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedArea(null);
    setShowDetailModal(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteAreaComun(selectedAreaId);
      loadAreas(currentPage, searchTerm, filters);
    } catch (err) {
      console.error("Error eliminando área común:", err);
      alert("Error al eliminar el área común");
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
      requiere_aprobacion: "",
    });
    setCurrentPage(1);
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      areas.map((area) => ({
        ID: area.id,
        Nombre: area.nombre,
        Descripción: area.descripcion,
        Capacidad: area.capacidad,
        Horario: `${area.horario_apertura} - ${area.horario_cierre}`,
        "Precio por Hora": `$${parseFloat(area.precio_por_hora).toFixed(2)}`,
        Condominio: area.condominio?.nombre || "N/A",
        "Requiere Aprobación": area.requiere_aprobacion ? "Sí" : "No",
        "Reglas de Uso": area.reglas_uso,
        "Fecha Registro": new Date(area.created_at).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ÁreasComunes");
    XLSX.writeFile(workbook, "areas-comunes.xlsx");
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text("Reporte de Áreas Comunes", 14, 15);

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 22);

    // Preparar datos para la tabla
    const tableData = areas.map((area) => [
      area.id,
      area.nombre,
      area.capacidad,
      `${area.horario_apertura} - ${area.horario_cierre}`,
      `$${parseFloat(area.precio_por_hora).toFixed(2)}`,
      area.condominio?.nombre || "N/A",
      area.requiere_aprobacion ? "Sí" : "No",
    ]);

    // Crear tabla usando autoTable
    autoTable(doc, {
      startY: 30,
      head: [
        [
          "ID",
          "Nombre",
          "Capacidad",
          "Horario",
          "Precio/Hora",
          "Condominio",
          "Aprobación",
        ],
      ],
      body: tableData,
      styles: { fontSize: 7 },
      headStyles: {
        fillColor: [13, 110, 253],
        textColor: 255,
      },
    });

    doc.save("areas-comunes.pdf");
  };

  // Funciones para badges
  const getAprobacionBadge = (requiereAprobacion) => {
    return requiereAprobacion ? (
      <Badge bg="warning">
        <FaCheckCircle className="me-1" /> Requiere Aprobación
      </Badge>
    ) : (
      <Badge bg="success">
        <FaTimesCircle className="me-1" /> Libre Uso
      </Badge>
    );
  };

  const formatPrecio = (precio) => {
    return `$${parseFloat(precio).toFixed(2)}`;
  };

  const formatHorario = (apertura, cierre) => {
    return `${apertura} - ${cierre}`;
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
          <FaMapMarkerAlt className="me-2 text-primary" />
          Áreas Comunes
        </h2>
        <Button
          onClick={() => navigate("/areas-comunes/crear")}
          variant="primary"
        >
          Nueva Área Común
        </Button>
      </div>

      {/* Barra de búsqueda, filtros y exportación */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <input
            type="text"
            placeholder="Buscar por nombre, descripción..."
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
                  <Form.Label>Requiere Aprobación</Form.Label>
                  <Form.Select
                    value={filters.requiere_aprobacion}
                    onChange={(e) =>
                      handleFilterChange("requiere_aprobacion", e.target.value)
                    }
                  >
                    <option value="">Todos</option>
                    <option value="true">Requiere aprobación</option>
                    <option value="false">Libre uso</option>
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
          <p>Cargando áreas comunes...</p>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Capacidad</th>
                <th>Horario</th>
                <th>Precio/Hora</th>
                <th>Condominio</th>
                <th>Aprobación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area) => (
                <tr key={area.id}>
                  <td>{area.id}</td>
                  <td>
                    <strong>{area.nombre}</strong>
                    {area.descripcion && (
                      <div>
                        <small className="text-muted">
                          {area.descripcion.length > 50
                            ? `${area.descripcion.substring(0, 50)}...`
                            : area.descripcion}
                        </small>
                      </div>
                    )}
                  </td>
                  <td>
                    <FaUsers className="me-1 text-muted" />
                    {area.capacidad} personas
                  </td>
                  <td>
                    <FaClock className="me-1 text-muted" />
                    {formatHorario(area.horario_apertura, area.horario_cierre)}
                  </td>
                  <td>
                    <FaMoneyBillWave className="me-1 text-muted" />
                    {formatPrecio(area.precio_por_hora)}
                  </td>
                  <td>
                    <FaHome className="me-1 text-muted" />
                    {area.condominio?.nombre || "N/A"}
                  </td>
                  <td>{getAprobacionBadge(area.requiere_aprobacion)}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => handleShowDetailModal(area)}
                      className="me-1"
                      title="Ver detalles"
                    >
                      <FaEye />
                    </Button>

                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() =>
                        navigate(`/areas-comunes/editar/${area.id}`)
                      }
                      className="me-1"
                      title="Editar"
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleShowDeleteModal(area.id)}
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
                Página {currentPage} de {totalPages} - Total: {areas.length}{" "}
                áreas comunes
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
          ¿Estás seguro de que quieres eliminar esta área común? Esta acción no
          se puede deshacer y afectará las reservas asociadas.
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
      {selectedArea && (
        <Modal
          show={showDetailModal}
          onHide={handleCloseDetailModal}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaMapMarkerAlt className="me-2 text-primary" />
              Detalles del Área Común: {selectedArea.nombre}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>ID:</strong> {selectedArea.id}
                    </p>
                    <p>
                      <strong>Nombre:</strong> {selectedArea.nombre}
                    </p>
                    <p>
                      <strong>Capacidad:</strong> {selectedArea.capacidad}{" "}
                      personas
                    </p>
                    <p>
                      <strong>Horario:</strong>{" "}
                      {formatHorario(
                        selectedArea.horario_apertura,
                        selectedArea.horario_cierre
                      )}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Precio por Hora:</strong>{" "}
                      {formatPrecio(selectedArea.precio_por_hora)}
                    </p>
                    <p>
                      <strong>Aprobación:</strong>{" "}
                      {getAprobacionBadge(selectedArea.requiere_aprobacion)}
                    </p>
                    <p>
                      <strong>Registrado:</strong>{" "}
                      {new Date(selectedArea.created_at).toLocaleString()}
                    </p>
                    <p>
                      <strong>Actualizado:</strong>{" "}
                      {new Date(selectedArea.updated_at).toLocaleString()}
                    </p>
                  </Col>
                </Row>

                <hr />

                <p>
                  <strong>Descripción:</strong>
                </p>
                <Card className="bg-light">
                  <Card.Body>
                    {selectedArea.descripcion || "Sin descripción"}
                  </Card.Body>
                </Card>

                <hr />

                <p>
                  <strong>Reglas de Uso:</strong>
                </p>
                <Card className="bg-light">
                  <Card.Body>
                    {selectedArea.reglas_uso || "Sin reglas específicas"}
                  </Card.Body>
                </Card>

                {selectedArea.condominio && (
                  <>
                    <hr />
                    <p>
                      <strong>Información del Condominio:</strong>
                    </p>
                    <div className="bg-light p-3 rounded">
                      <p>
                        <strong>Nombre:</strong>{" "}
                        {selectedArea.condominio.nombre}
                      </p>
                      <p>
                        <strong>Dirección:</strong>{" "}
                        {selectedArea.condominio.direccion}
                      </p>
                      <p>
                        <strong>Teléfono:</strong>{" "}
                        {selectedArea.condominio.telefono}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedArea.condominio.email}
                      </p>
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

export default AreaListar;
