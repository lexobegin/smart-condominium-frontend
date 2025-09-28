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
  fetchVehiculos,
  deleteVehiculo,
  MARCAS_VEHICULOS,
  COLORES_VEHICULOS,
} from "../../services/vehiculos";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaCar,
  FaDownload,
  FaFileExcel,
  FaFilePdf,
  FaFilter,
  FaUser,
  FaIdCard,
  FaCheckCircle,
  FaTimesCircle,
  FaPalette,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function VehiculoListar() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    marca: "",
    color: "",
    autorizado: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Estados para modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehiculoId, setSelectedVehiculoId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadVehiculos(currentPage, searchTerm, filters);
  }, [currentPage, searchTerm, filters]);

  const loadVehiculos = async (page, search = "", filterParams = {}) => {
    try {
      setLoading(true);
      const data = await fetchVehiculos(page, search, filterParams);
      setVehiculos(data.results);
      const total = Math.ceil(data.count / 10);
      setTotalPages(total);
    } catch (err) {
      console.error("Error cargando vehículos:", err);
      alert("Error al cargar los vehículos");
    } finally {
      setLoading(false);
    }
  };

  // Handlers para modales
  const handleShowDeleteModal = (id) => {
    setSelectedVehiculoId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedVehiculoId(null);
    setShowDeleteModal(false);
  };

  const handleShowDetailModal = (vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedVehiculo(null);
    setShowDetailModal(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteVehiculo(selectedVehiculoId);
      loadVehiculos(currentPage, searchTerm, filters);
    } catch (err) {
      console.error("Error eliminando vehículo:", err);
      alert("Error al eliminar el vehículo");
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
      marca: "",
      color: "",
      autorizado: "",
    });
    setCurrentPage(1);
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      vehiculos.map((vehiculo) => ({
        ID: vehiculo.id,
        Placa: vehiculo.placa,
        Marca: getMarcaDisplay(vehiculo.marca),
        Modelo: vehiculo.modelo,
        Color: getColorDisplay(vehiculo.color),
        Propietario: vehiculo.usuario
          ? `${vehiculo.usuario.nombre} ${vehiculo.usuario.apellidos}`
          : "No especificado",
        Unidad: vehiculo.usuario?.unidades_habitacionales[0]?.codigo || "N/A",
        Autorizado: vehiculo.autorizado ? "Sí" : "No",
        "Fecha Registro": new Date(vehiculo.created_at).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vehículos");
    XLSX.writeFile(workbook, "vehiculos.xlsx");
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text("Reporte de Vehículos Registrados", 14, 15);

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 22);

    // Preparar datos para la tabla
    const tableData = vehiculos.map((vehiculo) => [
      vehiculo.id,
      vehiculo.placa,
      getMarcaDisplay(vehiculo.marca),
      vehiculo.modelo,
      getColorDisplay(vehiculo.color),
      vehiculo.autorizado ? "Sí" : "No",
      new Date(vehiculo.created_at).toLocaleDateString(),
    ]);

    // Crear tabla usando autoTable
    autoTable(doc, {
      startY: 30,
      head: [
        [
          "ID",
          "Placa",
          "Marca",
          "Modelo",
          "Color",
          "Autorizado",
          "Fecha Registro",
        ],
      ],
      body: tableData,
      styles: { fontSize: 7 },
      headStyles: {
        fillColor: [108, 117, 125],
        textColor: 255,
      },
    });

    doc.save("vehiculos.pdf");
  };

  // Funciones auxiliares para displays
  const getMarcaDisplay = (marca) => {
    const marcaObj = MARCAS_VEHICULOS.find((m) => m.value === marca);
    return marcaObj ? marcaObj.label : marca;
  };

  const getColorDisplay = (color) => {
    const colorObj = COLORES_VEHICULOS.find((c) => c.value === color);
    return colorObj ? colorObj.label : color;
  };

  // Funciones para badges
  const getMarcaBadge = (marca) => {
    return <Badge bg="primary">{getMarcaDisplay(marca)}</Badge>;
  };

  const getColorBadge = (color) => {
    const colorMap = {
      blanco: "light",
      negro: "dark",
      gris: "secondary",
      plateado: "light",
      azul: "primary",
      rojo: "danger",
      verde: "success",
      amarillo: "warning",
      naranja: "warning",
      marron: "secondary",
      beige: "light",
      dorado: "warning",
      otro: "secondary",
    };
    return (
      <Badge bg={colorMap[color] || "secondary"}>
        {getColorDisplay(color)}
      </Badge>
    );
  };

  const getAutorizadoBadge = (autorizado) => {
    return autorizado ? (
      <Badge bg="success">
        <FaCheckCircle className="me-1" /> Autorizado
      </Badge>
    ) : (
      <Badge bg="danger">
        <FaTimesCircle className="me-1" /> No Autorizado
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
          <FaCar className="me-2 text-dark" />
          Vehículos Registrados
        </h2>
        <Button onClick={() => navigate("/vehiculos/crear")} variant="dark">
          Nuevo Vehículo
        </Button>
      </div>

      {/* Barra de búsqueda, filtros y exportación */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <input
            type="text"
            placeholder="Buscar por placa, modelo, propietario..."
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
                  <Form.Label>Marca</Form.Label>
                  <Form.Select
                    value={filters.marca}
                    onChange={(e) =>
                      handleFilterChange("marca", e.target.value)
                    }
                  >
                    <option value="">Todas las marcas</option>
                    {MARCAS_VEHICULOS.map((marca) => (
                      <option key={marca.value} value={marca.value}>
                        {marca.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Color</Form.Label>
                  <Form.Select
                    value={filters.color}
                    onChange={(e) =>
                      handleFilterChange("color", e.target.value)
                    }
                  >
                    <option value="">Todos los colores</option>
                    {COLORES_VEHICULOS.map((color) => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Estado de Autorización</Form.Label>
                  <Form.Select
                    value={filters.autorizado}
                    onChange={(e) =>
                      handleFilterChange("autorizado", e.target.value)
                    }
                  >
                    <option value="">Todos</option>
                    <option value="true">Autorizados</option>
                    <option value="false">No autorizados</option>
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
          <p>Cargando vehículos...</p>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Color</th>
                <th>Propietario</th>
                <th>Unidad</th>
                <th>Autorizado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((vehiculo) => (
                <tr key={vehiculo.id}>
                  <td>{vehiculo.id}</td>
                  <td>
                    <strong>{vehiculo.placa}</strong>
                  </td>
                  <td>{getMarcaBadge(vehiculo.marca)}</td>
                  <td>{vehiculo.modelo}</td>
                  <td>{getColorBadge(vehiculo.color)}</td>
                  <td>
                    {vehiculo.usuario ? (
                      <>
                        <FaUser className="me-1 text-muted" />
                        {vehiculo.usuario.nombre} {vehiculo.usuario.apellidos}
                      </>
                    ) : (
                      <span className="text-muted">No especificado</span>
                    )}
                  </td>
                  <td>
                    {vehiculo.usuario?.unidades_habitacionales[0]?.codigo ||
                      "N/A"}
                  </td>
                  <td>{getAutorizadoBadge(vehiculo.autorizado)}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => handleShowDetailModal(vehiculo)}
                      className="me-1"
                      title="Ver detalles"
                    >
                      <FaEye />
                    </Button>

                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() =>
                        navigate(`/vehiculos/editar/${vehiculo.id}`)
                      }
                      className="me-1"
                      title="Editar"
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleShowDeleteModal(vehiculo.id)}
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
                Página {currentPage} de {totalPages} - Total: {vehiculos.length}{" "}
                vehículos
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
          ¿Estás seguro de que quieres eliminar este vehículo? Esta acción no se
          puede deshacer y afectará los registros de acceso vehicular.
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
      {selectedVehiculo && (
        <Modal
          show={showDetailModal}
          onHide={handleCloseDetailModal}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaCar className="me-2 text-dark" />
              Detalles del Vehículo: {selectedVehiculo.placa}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>ID:</strong> {selectedVehiculo.id}
                    </p>
                    <p>
                      <strong>Placa:</strong> {selectedVehiculo.placa}
                    </p>
                    <p>
                      <strong>Marca:</strong>{" "}
                      {getMarcaBadge(selectedVehiculo.marca)}
                    </p>
                    <p>
                      <strong>Modelo:</strong> {selectedVehiculo.modelo}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <FaPalette className="me-2" />
                      <strong>Color:</strong>{" "}
                      {getColorBadge(selectedVehiculo.color)}
                    </p>
                    <p>
                      <strong>Autorizado:</strong>{" "}
                      {getAutorizadoBadge(selectedVehiculo.autorizado)}
                    </p>
                    <p>
                      <strong>Registrado:</strong>{" "}
                      {new Date(selectedVehiculo.created_at).toLocaleString()}
                    </p>
                    <p>
                      <strong>Actualizado:</strong>{" "}
                      {new Date(selectedVehiculo.updated_at).toLocaleString()}
                    </p>
                  </Col>
                </Row>

                <hr />

                {selectedVehiculo.usuario && (
                  <>
                    <p>
                      <strong>Información del Propietario:</strong>
                    </p>
                    <div className="bg-light p-3 rounded">
                      <p>
                        <FaUser className="me-2" />
                        <strong>Nombre:</strong>{" "}
                        {selectedVehiculo.usuario.nombre}{" "}
                        {selectedVehiculo.usuario.apellidos}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedVehiculo.usuario.email}
                      </p>
                      <p>
                        <strong>Teléfono:</strong>{" "}
                        {selectedVehiculo.usuario.telefono}
                      </p>
                      <p>
                        <strong>Unidad:</strong>{" "}
                        {selectedVehiculo.usuario.unidades_habitacionales[0]
                          ?.codigo || "N/A"}
                      </p>
                      <p>
                        <strong>Condominio:</strong>{" "}
                        {selectedVehiculo.usuario.unidades_habitacionales[0]
                          ?.condominio_nombre || "N/A"}
                      </p>
                    </div>
                  </>
                )}

                {selectedVehiculo.datos_ocr && (
                  <>
                    <hr />
                    <p>
                      <strong>Datos OCR:</strong>
                    </p>
                    <Card className="bg-light">
                      <Card.Body>
                        <code>{selectedVehiculo.datos_ocr}</code>
                      </Card.Body>
                    </Card>
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

export default VehiculoListar;
