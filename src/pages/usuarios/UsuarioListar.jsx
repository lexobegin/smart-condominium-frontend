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
  Alert,
} from "react-bootstrap";
import {
  fetchUsuarios,
  deleteUsuario,
  registrarRostroUsuario,
  TIPOS_USUARIO,
  GENEROS,
  ESTADOS_USUARIO,
} from "../../services/usuarios";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaUser,
  FaDownload,
  FaFileExcel,
  FaFilePdf,
  FaFilter,
  FaCamera,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaHome,
  FaCheckCircle,
  FaTimesCircle,
  FaUserShield,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import RegistroFacialModal from "../../components/RegistroFacialModal";

function UsuarioListar() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    tipo: "",
    genero: "",
    estado: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Estados para modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [showRegistroFacialModal, setShowRegistroFacialModal] = useState(false);
  const [usuarioRegistroFacial, setUsuarioRegistroFacial] = useState(null);
  const [registroFacialLoading, setRegistroFacialLoading] = useState(false);
  const [registroFacialMessage, setRegistroFacialMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadUsuarios(currentPage, searchTerm, filters);
  }, [currentPage, searchTerm, filters]);

  const loadUsuarios = async (page, search = "", filterParams = {}) => {
    try {
      setLoading(true);
      const data = await fetchUsuarios(page, search, filterParams);
      setUsuarios(data.results);
      const total = Math.ceil(data.count / 10);
      setTotalPages(total);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      alert("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  // Handlers para modales
  const handleShowDeleteModal = (id) => {
    setSelectedUsuarioId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedUsuarioId(null);
    setShowDeleteModal(false);
  };

  const handleShowDetailModal = (usuario) => {
    setSelectedUsuario(usuario);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedUsuario(null);
    setShowDetailModal(false);
  };

  const handleShowRegistroFacialModal = (usuario) => {
    setUsuarioRegistroFacial(usuario);
    setShowRegistroFacialModal(true);
    setRegistroFacialMessage("");
  };

  const handleCloseRegistroFacialModal = () => {
    setUsuarioRegistroFacial(null);
    setShowRegistroFacialModal(false);
    setRegistroFacialMessage("");
  };

  const confirmDelete = async () => {
    try {
      await deleteUsuario(selectedUsuarioId);
      loadUsuarios(currentPage, searchTerm, filters);
    } catch (err) {
      console.error("Error eliminando usuario:", err);
      alert("Error al eliminar el usuario");
    } finally {
      handleCloseDeleteModal();
    }
  };

  // Función para registrar rostro
  const handleRegistrarRostro = async (imagenBase64) => {
    if (!usuarioRegistroFacial) return;

    try {
      setRegistroFacialLoading(true);
      setRegistroFacialMessage("");

      const resultado = await registrarRostroUsuario(
        usuarioRegistroFacial.id,
        imagenBase64
      );

      setRegistroFacialMessage({
        type: "success",
        text: resultado.message || "Rostro registrado exitosamente",
      });

      // Recargar datos del usuario
      loadUsuarios(currentPage, searchTerm, filters);

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        handleCloseRegistroFacialModal();
      }, 2000);
    } catch (err) {
      console.error("Error registrando rostro:", err);
      setRegistroFacialMessage({
        type: "danger",
        text: err.response?.data?.error || "Error al registrar el rostro",
      });
    } finally {
      setRegistroFacialLoading(false);
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
      genero: "",
      estado: "",
    });
    setCurrentPage(1);
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      usuarios.map((usuario) => ({
        ID: usuario.id,
        Nombre: usuario.nombre,
        Apellidos: usuario.apellidos,
        CI: usuario.ci,
        Email: usuario.email,
        Teléfono: usuario.telefono,
        Tipo: getTipoDisplay(usuario.tipo),
        Género: getGeneroDisplay(usuario.genero),
        Estado: getEstadoDisplay(usuario.estado),
        Unidad: usuario.unidades_habitacionales[0]?.codigo || "N/A",
        Condominio:
          usuario.unidades_habitacionales[0]?.condominio_nombre || "N/A",
        "Rostro Registrado": usuario.datos_faciales ? "Sí" : "No",
        "Fecha Registro": new Date(usuario.fecha_registro).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
    XLSX.writeFile(workbook, "usuarios.xlsx");
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text("Reporte de Usuarios", 14, 15);

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 22);

    // Preparar datos para la tabla
    const tableData = usuarios.map((usuario) => [
      usuario.id,
      `${usuario.nombre} ${usuario.apellidos}`,
      usuario.ci,
      getTipoDisplay(usuario.tipo),
      getEstadoDisplay(usuario.estado),
      usuario.unidades_habitacionales[0]?.codigo || "N/A",
      usuario.datos_faciales ? "Sí" : "No",
    ]);

    // Crear tabla usando autoTable
    autoTable(doc, {
      startY: 30,
      head: [["ID", "Nombre", "CI", "Tipo", "Estado", "Unidad", "Rostro"]],
      body: tableData,
      styles: { fontSize: 7 },
      headStyles: {
        fillColor: [111, 66, 193],
        textColor: 255,
      },
    });

    doc.save("usuarios.pdf");
  };

  // Funciones auxiliares para displays
  const getTipoDisplay = (tipo) => {
    const tipoObj = TIPOS_USUARIO.find((t) => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  };

  const getGeneroDisplay = (genero) => {
    const generoObj = GENEROS.find((g) => g.value === genero);
    return generoObj ? generoObj.label : genero;
  };

  const getEstadoDisplay = (estado) => {
    const estadoObj = ESTADOS_USUARIO.find((e) => e.value === estado);
    return estadoObj ? estadoObj.label : estado;
  };

  // Funciones para badges
  const getTipoBadge = (tipo) => {
    const colors = {
      residente: "primary",
      administrador: "danger",
      seguridad: "warning",
      mantenimiento: "info",
      portero: "secondary",
    };
    return (
      <Badge bg={colors[tipo] || "secondary"}>{getTipoDisplay(tipo)}</Badge>
    );
  };

  const getGeneroBadge = (genero) => {
    return genero === "M" ? (
      <Badge bg="info">Masculino</Badge>
    ) : genero === "F" ? (
      <Badge bg="pink" text="dark">
        Femenino
      </Badge>
    ) : (
      <Badge bg="light" text="dark">
        Otro
      </Badge>
    );
  };

  const getEstadoBadge = (estado) => {
    const colors = {
      activo: "success",
      inactivo: "secondary",
      suspendido: "danger",
    };
    return (
      <Badge bg={colors[estado] || "secondary"}>
        {getEstadoDisplay(estado)}
      </Badge>
    );
  };

  const getRostroBadge = (datosFaciales) => {
    return datosFaciales ? (
      <Badge bg="success">
        <FaCheckCircle className="me-1" /> Registrado
      </Badge>
    ) : (
      <Badge bg="warning">
        <FaTimesCircle className="me-1" /> Pendiente
      </Badge>
    );
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>
          <FaUser className="me-2 text-purple" />
          Gestión de Usuarios
        </h2>
        <Button onClick={() => navigate("/usuarios/crear")} variant="primary">
          Nuevo Usuario
        </Button>
      </div>

      {/* Barra de búsqueda, filtros y exportación */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <input
            type="text"
            placeholder="Buscar por nombre, email, CI..."
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
                  <Form.Label>Tipo de Usuario</Form.Label>
                  <Form.Select
                    value={filters.tipo}
                    onChange={(e) => handleFilterChange("tipo", e.target.value)}
                  >
                    <option value="">Todos los tipos</option>
                    {TIPOS_USUARIO.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Género</Form.Label>
                  <Form.Select
                    value={filters.genero}
                    onChange={(e) =>
                      handleFilterChange("genero", e.target.value)
                    }
                  >
                    <option value="">Todos los géneros</option>
                    {GENEROS.map((genero) => (
                      <option key={genero.value} value={genero.value}>
                        {genero.label}
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
                    {ESTADOS_USUARIO.map((estado) => (
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
          <p>Cargando usuarios...</p>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>CI</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Unidad</th>
                <th>Rostro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>
                    <strong>
                      {usuario.nombre} {usuario.apellidos}
                    </strong>
                    <div>
                      <FaEnvelope className="me-1 text-muted" size={12} />
                      <small className="text-muted">{usuario.email}</small>
                    </div>
                    {usuario.telefono && (
                      <div>
                        <FaPhone className="me-1 text-muted" size={12} />
                        <small className="text-muted">{usuario.telefono}</small>
                      </div>
                    )}
                  </td>
                  <td>
                    <FaIdCard className="me-1 text-muted" />
                    {usuario.ci}
                  </td>
                  <td>{getTipoBadge(usuario.tipo)}</td>
                  <td>{getEstadoBadge(usuario.estado)}</td>
                  <td>
                    <FaHome className="me-1 text-muted" />
                    {usuario.unidades_habitacionales[0]?.codigo || "N/A"}
                  </td>
                  <td>{getRostroBadge(usuario.datos_faciales)}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => handleShowDetailModal(usuario)}
                      className="me-1 mb-1"
                      title="Ver detalles"
                    >
                      <FaEye />
                    </Button>

                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleShowRegistroFacialModal(usuario)}
                      className="me-1 mb-1"
                      title="Registrar rostro"
                      disabled={!!usuario.datos_faciales}
                    >
                      <FaCamera />
                    </Button>

                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                      className="me-1 mb-1"
                      title="Editar"
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleShowDeleteModal(usuario.id)}
                      title="Eliminar"
                      className="mb-1"
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
                Página {currentPage} de {totalPages} - Total: {usuarios.length}{" "}
                usuarios
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
          ¿Estás seguro de que quieres eliminar este usuario? Esta acción no se
          puede deshacer y afectará todos los registros asociados.
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

      {/* Modal de Registro Facial */}
      {usuarioRegistroFacial && (
        <RegistroFacialModal
          show={showRegistroFacialModal}
          onHide={handleCloseRegistroFacialModal}
          usuario={usuarioRegistroFacial}
          onRegistrarRostro={handleRegistrarRostro}
          loading={registroFacialLoading}
          message={registroFacialMessage}
        />
      )}

      {/* Modal de Detalles */}
      {selectedUsuario && (
        <Modal
          show={showDetailModal}
          onHide={handleCloseDetailModal}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaUser className="me-2 text-purple" />
              Detalles del Usuario: {selectedUsuario.nombre}{" "}
              {selectedUsuario.apellidos}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>ID:</strong> {selectedUsuario.id}
                    </p>
                    <p>
                      <strong>Nombre:</strong> {selectedUsuario.nombre}{" "}
                      {selectedUsuario.apellidos}
                    </p>
                    <p>
                      <strong>CI:</strong> {selectedUsuario.ci}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedUsuario.email}
                    </p>
                    <p>
                      <strong>Teléfono:</strong>{" "}
                      {selectedUsuario.telefono || "No registrado"}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Tipo:</strong>{" "}
                      {getTipoBadge(selectedUsuario.tipo)}
                    </p>
                    <p>
                      <strong>Género:</strong>{" "}
                      {getGeneroBadge(selectedUsuario.genero)}
                    </p>
                    <p>
                      <strong>Estado:</strong>{" "}
                      {getEstadoBadge(selectedUsuario.estado)}
                    </p>
                    <p>
                      <strong>Rostro:</strong>{" "}
                      {getRostroBadge(selectedUsuario.datos_faciales)}
                    </p>
                    <p>
                      <strong>Registro:</strong>{" "}
                      {formatFecha(selectedUsuario.fecha_registro)}
                    </p>
                  </Col>
                </Row>

                <hr />

                {selectedUsuario.unidades_habitacionales.length > 0 && (
                  <>
                    <p>
                      <strong>Unidades Habitacionales:</strong>
                    </p>
                    <div className="bg-light p-3 rounded">
                      {selectedUsuario.unidades_habitacionales.map(
                        (unidad, index) => (
                          <div
                            key={unidad.id}
                            className={index > 0 ? "mt-2" : ""}
                          >
                            <p>
                              <strong>Código:</strong> {unidad.codigo}
                            </p>
                            <p>
                              <strong>Tipo:</strong> {unidad.tipo_display}
                            </p>
                            <p>
                              <strong>Estado:</strong> {unidad.estado_display}
                            </p>
                            <p>
                              <strong>Condominio:</strong>{" "}
                              {unidad.condominio_nombre}
                            </p>
                            <p>
                              <strong>Metros Cuadrados:</strong>{" "}
                              {unidad.metros_cuadrados}m²
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}

                {selectedUsuario.datos_faciales && (
                  <>
                    <hr />
                    <p>
                      <strong>Información de Reconocimiento Facial:</strong>
                    </p>
                    <Card className="bg-light">
                      <Card.Body>
                        <p>
                          <strong>Backend:</strong>{" "}
                          {JSON.parse(selectedUsuario.datos_faciales).backend}
                        </p>
                        <p>
                          <strong>Fecha Registro:</strong>{" "}
                          {
                            JSON.parse(selectedUsuario.datos_faciales)
                              .fecha_registro
                          }
                        </p>
                        <p>
                          <strong>Características Extraídas:</strong>{" "}
                          {JSON.parse(selectedUsuario.datos_faciales).embedding
                            ?.length || "N/A"}
                        </p>
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

export default UsuarioListar;
