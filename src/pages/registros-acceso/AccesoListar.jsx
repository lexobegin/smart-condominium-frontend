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
  fetchRegistrosAcceso,
  deleteRegistroAcceso,
  TIPOS_ACCESO,
  DIRECCIONES,
  METODOS_ACCESO,
} from "../../services/acceso";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaDoorOpen,
  FaDownload,
  FaFileExcel,
  FaFilePdf,
  FaFilter,
  FaUser,
  FaCar,
  FaWalking,
  FaSignInAlt,
  FaSignOutAlt,
  FaCamera,
  FaIdCard,
  FaCalendarAlt,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function AccesoListar() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    tipo: "",
    direccion: "",
    metodo: "",
    reconocimiento_exitoso: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Estados para modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRegistroId, setSelectedRegistroId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadRegistros(currentPage, searchTerm, filters);
  }, [currentPage, searchTerm, filters]);

  const loadRegistros = async (page, search = "", filterParams = {}) => {
    try {
      setLoading(true);
      const data = await fetchRegistrosAcceso(page, search, filterParams);
      setRegistros(data.results);
      const total = Math.ceil(data.count / 10);
      setTotalPages(total);
    } catch (err) {
      console.error("Error cargando registros de acceso:", err);
      alert("Error al cargar los registros de acceso");
    } finally {
      setLoading(false);
    }
  };

  // Handlers para modales
  const handleShowDeleteModal = (id) => {
    setSelectedRegistroId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedRegistroId(null);
    setShowDeleteModal(false);
  };

  const handleShowDetailModal = (registro) => {
    setSelectedRegistro(registro);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedRegistro(null);
    setShowDetailModal(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteRegistroAcceso(selectedRegistroId);
      loadRegistros(currentPage, searchTerm, filters);
    } catch (err) {
      console.error("Error eliminando registro:", err);
      alert("Error al eliminar el registro");
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
      direccion: "",
      metodo: "",
      reconocimiento_exitoso: "",
    });
    setCurrentPage(1);
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      registros.map((registro) => ({
        ID: registro.id,
        Usuario: registro.usuario
          ? `${registro.usuario.nombre} ${registro.usuario.apellidos}`
          : "No especificado",
        Unidad: registro.usuario?.unidades_habitacionales[0]?.codigo || "N/A",
        Tipo: getTipoDisplay(registro.tipo),
        Dirección: getDireccionDisplay(registro.direccion),
        Método: getMetodoDisplay(registro.metodo),
        "Fecha/Hora": new Date(registro.fecha_hora).toLocaleString(),
        "Reconocimiento Exitoso": registro.reconocimiento_exitoso ? "Sí" : "No",
        "Confidence Score": registro.confidence_score || "N/A",
        Vehículo: registro.vehiculo?.placa || "No aplica",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RegistrosAcceso");
    XLSX.writeFile(workbook, "registros-acceso.xlsx");
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text("Reporte de Registros de Acceso", 14, 15);

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 22);

    // Preparar datos para la tabla
    const tableData = registros.map((registro) => [
      registro.id,
      registro.usuario
        ? `${registro.usuario.nombre} ${registro.usuario.apellidos}`
        : "N/A",
      getTipoDisplay(registro.tipo),
      getDireccionDisplay(registro.direccion),
      getMetodoDisplay(registro.metodo),
      registro.reconocimiento_exitoso ? "Sí" : "No",
      new Date(registro.fecha_hora).toLocaleDateString(),
    ]);

    // Crear tabla usando autoTable
    autoTable(doc, {
      startY: 30,
      head: [
        ["ID", "Usuario", "Tipo", "Dirección", "Método", "Éxito", "Fecha"],
      ],
      body: tableData,
      styles: { fontSize: 7 },
      headStyles: {
        fillColor: [0, 123, 255],
        textColor: 255,
      },
    });

    doc.save("registros-acceso.pdf");
  };

  // Funciones auxiliares para displays
  const getTipoDisplay = (tipo) => {
    const tipoObj = TIPOS_ACCESO.find((t) => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  };

  const getDireccionDisplay = (direccion) => {
    const direccionObj = DIRECCIONES.find((d) => d.value === direccion);
    return direccionObj ? direccionObj.label : direccion;
  };

  const getMetodoDisplay = (metodo) => {
    const metodoObj = METODOS_ACCESO.find((m) => m.value === metodo);
    return metodoObj ? metodoObj.label : metodo;
  };

  // Funciones para badges
  const getTipoBadge = (tipo) => {
    return tipo === "vehicular" ? (
      <Badge bg="primary">
        <FaCar className="me-1" /> Vehicular
      </Badge>
    ) : (
      <Badge bg="secondary">
        <FaWalking className="me-1" /> Peatonal
      </Badge>
    );
  };

  const getDireccionBadge = (direccion) => {
    return direccion === "entrada" ? (
      <Badge bg="success">
        <FaSignInAlt className="me-1" /> Entrada
      </Badge>
    ) : (
      <Badge bg="warning">
        <FaSignOutAlt className="me-1" /> Salida
      </Badge>
    );
  };

  const getMetodoBadge = (metodo) => {
    const colors = {
      facial: "info",
      tarjeta: "primary",
      codigo: "secondary",
      manual: "light",
      placa: "dark",
    };
    return (
      <Badge bg={colors[metodo] || "secondary"}>
        {getMetodoDisplay(metodo)}
      </Badge>
    );
  };

  const getReconocimientoBadge = (exitoso, confidence) => {
    if (exitoso) {
      return (
        <Badge bg="success">
          Exitoso {confidence ? `(${(confidence * 100).toFixed(1)}%)` : ""}
        </Badge>
      );
    } else {
      return <Badge bg="danger">Fallido</Badge>;
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
          <FaDoorOpen className="me-2 text-primary" />
          Registros de Acceso
        </h2>
        <Button
          onClick={() => navigate("/registros-acceso/crear")}
          variant="primary"
        >
          Nuevo Registro
        </Button>
      </div>

      {/* Barra de búsqueda, filtros y exportación */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <input
            type="text"
            placeholder="Buscar por usuario, vehículo..."
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
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Tipo de Acceso</Form.Label>
                  <Form.Select
                    value={filters.tipo}
                    onChange={(e) => handleFilterChange("tipo", e.target.value)}
                  >
                    <option value="">Todos los tipos</option>
                    {TIPOS_ACCESO.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Dirección</Form.Label>
                  <Form.Select
                    value={filters.direccion}
                    onChange={(e) =>
                      handleFilterChange("direccion", e.target.value)
                    }
                  >
                    <option value="">Ambas direcciones</option>
                    {DIRECCIONES.map((direccion) => (
                      <option key={direccion.value} value={direccion.value}>
                        {direccion.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Método</Form.Label>
                  <Form.Select
                    value={filters.metodo}
                    onChange={(e) =>
                      handleFilterChange("metodo", e.target.value)
                    }
                  >
                    <option value="">Todos los métodos</option>
                    {METODOS_ACCESO.map((metodo) => (
                      <option key={metodo.value} value={metodo.value}>
                        {metodo.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Reconocimiento</Form.Label>
                  <Form.Select
                    value={filters.reconocimiento_exitoso}
                    onChange={(e) =>
                      handleFilterChange(
                        "reconocimiento_exitoso",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Todos</option>
                    <option value="true">Exitoso</option>
                    <option value="false">Fallido</option>
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
          <p>Cargando registros de acceso...</p>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Tipo</th>
                <th>Dirección</th>
                <th>Método</th>
                <th>Reconocimiento</th>
                <th>Fecha/Hora</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr key={registro.id}>
                  <td>{registro.id}</td>
                  <td>
                    {registro.usuario ? (
                      <>
                        <FaUser className="me-1 text-muted" />
                        <strong>
                          {registro.usuario.nombre} {registro.usuario.apellidos}
                        </strong>
                        <div>
                          <small className="text-muted">
                            {registro.usuario.unidades_habitacionales[0]
                              ?.codigo || "Sin unidad"}
                          </small>
                        </div>
                      </>
                    ) : (
                      <span className="text-muted">
                        Usuario no especificado
                      </span>
                    )}
                  </td>
                  <td>{getTipoBadge(registro.tipo)}</td>
                  <td>{getDireccionBadge(registro.direccion)}</td>
                  <td>{getMetodoBadge(registro.metodo)}</td>
                  <td>
                    {getReconocimientoBadge(
                      registro.reconocimiento_exitoso,
                      registro.confidence_score
                    )}
                  </td>
                  <td>
                    <FaCalendarAlt className="me-1 text-muted" />
                    {formatFecha(registro.fecha_hora)}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => handleShowDetailModal(registro)}
                      className="me-1"
                      title="Ver detalles"
                    >
                      <FaEye />
                    </Button>

                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() =>
                        navigate(`/registros-acceso/editar/${registro.id}`)
                      }
                      className="me-1"
                      title="Editar"
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleShowDeleteModal(registro.id)}
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
                Página {currentPage} de {totalPages} - Total: {registros.length}{" "}
                registros
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
          ¿Estás seguro de que quieres eliminar este registro de acceso? Esta
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

      {/* Modal de Detalles */}
      {selectedRegistro && (
        <Modal
          show={showDetailModal}
          onHide={handleCloseDetailModal}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaDoorOpen className="me-2 text-primary" />
              Detalles del Registro de Acceso
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>ID:</strong> {selectedRegistro.id}
                    </p>
                    <p>
                      <strong>Tipo:</strong>{" "}
                      {getTipoBadge(selectedRegistro.tipo)}
                    </p>
                    <p>
                      <strong>Dirección:</strong>{" "}
                      {getDireccionBadge(selectedRegistro.direccion)}
                    </p>
                    <p>
                      <strong>Método:</strong>{" "}
                      {getMetodoBadge(selectedRegistro.metodo)}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Reconocimiento:</strong>{" "}
                      {getReconocimientoBadge(
                        selectedRegistro.reconocimiento_exitoso,
                        selectedRegistro.confidence_score
                      )}
                    </p>
                    <p>
                      <strong>Fecha/Hora:</strong>{" "}
                      {formatFecha(selectedRegistro.fecha_hora)}
                    </p>
                    <p>
                      <strong>Registrado:</strong>{" "}
                      {formatFecha(selectedRegistro.created_at)}
                    </p>
                  </Col>
                </Row>

                <hr />

                {selectedRegistro.usuario && (
                  <>
                    <p>
                      <strong>Información del Usuario:</strong>
                    </p>
                    <div className="bg-light p-3 rounded">
                      <p>
                        <FaUser className="me-2" />
                        <strong>Nombre:</strong>{" "}
                        {selectedRegistro.usuario.nombre}{" "}
                        {selectedRegistro.usuario.apellidos}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedRegistro.usuario.email}
                      </p>
                      <p>
                        <strong>Teléfono:</strong>{" "}
                        {selectedRegistro.usuario.telefono}
                      </p>
                      <p>
                        <strong>Unidad:</strong>{" "}
                        {selectedRegistro.usuario.unidades_habitacionales[0]
                          ?.codigo || "N/A"}
                      </p>
                      <p>
                        <strong>Condominio:</strong>{" "}
                        {selectedRegistro.usuario.unidades_habitacionales[0]
                          ?.condominio_nombre || "N/A"}
                      </p>
                    </div>
                  </>
                )}

                {selectedRegistro.vehiculo && (
                  <>
                    <hr />
                    <p>
                      <strong>Información del Vehículo:</strong>
                    </p>
                    <div className="bg-light p-3 rounded">
                      <p>
                        <FaCar className="me-2" />
                        <strong>Placa:</strong>{" "}
                        {selectedRegistro.vehiculo.placa}
                      </p>
                      <p>
                        <strong>Marca:</strong>{" "}
                        {selectedRegistro.vehiculo.marca}
                      </p>
                      <p>
                        <strong>Modelo:</strong>{" "}
                        {selectedRegistro.vehiculo.modelo}
                      </p>
                      <p>
                        <strong>Color:</strong>{" "}
                        {selectedRegistro.vehiculo.color}
                      </p>
                    </div>
                  </>
                )}

                {selectedRegistro.foto_evidencia && (
                  <>
                    <hr />
                    <p>
                      <strong>Evidencia Fotográfica:</strong>
                    </p>
                    <div className="text-center">
                      <img
                        src={selectedRegistro.foto_evidencia}
                        alt="Evidencia de acceso"
                        className="img-fluid rounded"
                        style={{ maxHeight: "200px" }}
                      />
                    </div>
                  </>
                )}

                {selectedRegistro.confidence_score && (
                  <>
                    <hr />
                    <p>
                      <strong>Confidence Score:</strong>{" "}
                      {(selectedRegistro.confidence_score * 100).toFixed(2)}%
                    </p>
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

export default AccesoListar;
