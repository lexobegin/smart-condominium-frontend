import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
fetchSolicitudesMantenimientos,
deleteSolicitudMantenimiento,
} from "../../services/solicitudes-mantenimiento";
import { fetchCategoriaMantenimiento } from "../../services/categorias-mantenimiento";
import { fetchAreaComun } from "../../services/areas-comunes";
import { fetchUser } from "../../services/users";
import { fetchUnidad } from "../../services/unidades";
import DashboardLayout from "../../components/DashboardLayout";
import { Button, Card, Spinner, Table, Modal } from "react-bootstrap";
import { FaHouseUser, FaFolder, FaCalendarAlt, FaUser, FaBuilding, FaListAlt, FaClipboardList } from "react-icons/fa";

function Listar() {
const navigate = useNavigate();
const [solicitudes, setSolicitudes] = useState([]);
const [loading, setLoading] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [searchTerm, setSearchTerm] = useState("");

// Modals - eliminar
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedSolicitudId, setSelectedSolicitudId] = useState(null);

// Modal detalle
const [showModal, setShowModal] = useState(false);
const [detalle, setDetalle] = useState({
solicitud: null,
categoria: null,
usuario: null,
areaComun: null,
unidadHabitacional: null,
});

// Cargar solicitudes
const loadSolicitudes = async (page, search = "") => {
try {
setLoading(true);
const data = await fetchSolicitudesMantenimientos(page, search);
setSolicitudes(data.results);
setTotalPages(Math.ceil(data.count / 10));
} catch (err) {
console.error("Error cargando solicitudes de mantenimiento:", err);
alert("No se pudieron cargar las solicitudes de mantenimiento.");
} finally {
setLoading(false);
}
};

useEffect(() => {
loadSolicitudes(currentPage, searchTerm);
}, [currentPage, searchTerm]);

// Modal eliminar
const handleShowDeleteModal = (id) => {
setSelectedSolicitudId(id);
setShowDeleteModal(true);
};

const handleCloseDeleteModal = () => {
setSelectedSolicitudId(null);
setShowDeleteModal(false);
};

const confirmDelete = async () => {
try {
await deleteSolicitudMantenimiento(selectedSolicitudId);
loadSolicitudes(currentPage, searchTerm);
} catch (err) {
console.error("Error eliminando solicitud:", err);
alert("No se pudo eliminar la solicitud.");
} finally {
handleCloseDeleteModal();
}
};

// Modal detalle
const handleView = async (s) => {
try {
const [cat, area, user, unidad] = await Promise.all([
s.categoria_mantenimiento ? fetchCategoriaMantenimiento(s.categoria_mantenimiento) : Promise.resolve(null),
s.area_comun ? fetchAreaComun(s.area_comun) : Promise.resolve(null),
s.usuario_reporta ? fetchUser(s.usuario_reporta) : Promise.resolve(null),
s.unidad_habitacional ? fetchUnidad(s.unidad_habitacional) : Promise.resolve(null),
]);
setDetalle({ solicitud: s, categoria: cat, areaComun: area, usuario: user, unidadHabitacional: unidad });
setShowModal(true);
} catch (err) {
console.error("Error cargando detalle:", err);
alert("No se pudo cargar el detalle completo.");
}
};

const handleCloseModal = () => {
setShowModal(false);
setDetalle({ solicitud: null, categoria: null, usuario: null, areaComun: null, unidadHabitacional: null });
};

return (
<DashboardLayout>
<div className="d-flex justify-content-between align-items-center mb-3">
<h2>Solicitudes de Mantenimiento</h2>
<Button
onClick={() => navigate("/solicitud-mantenimiento/crear")}
variant="success"
>
Nueva Solicitud de Mantenimiento
</Button>
</div>

  {/* Buscador */}
  <div className="mb-3">
    <input
      type="text"
      placeholder="Buscar por título, prioridad, estado..."
      className="form-control"
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
      }}
    />
  </div>

  {loading ? (
    <Spinner animation="border" />
  ) : (
    <>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Título</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Fecha Reporte</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((s) => (
            <tr key={s.id}>
              <td>{s.titulo}</td>
              <td>{s.prioridad}</td>
              <td>{s.estado}</td>
              <td>{s.fecha_reporte}</td>
              <td>
                <Button className="me-2" size="sm" variant="info" onClick={() => handleView(s)}>
                  Ver Detalle
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate(`/solicitud-mantenimiento/editar/${s.id}`)}
                >
                  Editar
                </Button>{" "}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleShowDeleteModal(s.id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span>Página {currentPage} de {totalPages}</span>
          <div>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Anterior
            </Button>{" "}
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {showModal && (
        <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Detalle Solicitud</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <p><FaListAlt className="me-2 text-primary" /><strong>Título:</strong> {detalle.solicitud?.titulo || "N/A"}</p>
                <p><FaClipboardList className="me-2 text-secondary" /><strong>Descripción:</strong> {detalle.solicitud?.descripcion || "N/A"}</p>
                <p><FaUser className="me-2 text-success" /><strong>Usuario Reporta:</strong> {detalle.usuario ? `${detalle.usuario.nombre} ${detalle.usuario.apellidos}` : "No disponible"}</p>
                <p><FaCalendarAlt className="me-2 text-primary" /><strong>Fecha de Reporte:</strong> {detalle.solicitud?.fecha_reporte}</p>
                <p><FaCalendarAlt className="me-2 text-secondary" /><strong>Fecha de Reporte:</strong> {detalle.solicitud?.fecha_limite}</p>
                <p><FaCalendarAlt className="me-2 text-muted" /><strong>Fecha de Reporte:</strong> {detalle.solicitud?.fecha_completado}</p>
                <p><FaBuilding className="me-2 text-dark" /><strong>Área Común:</strong> {detalle.areaComun ? detalle.areaComun.nombre : "No disponible"}</p>
                <p><FaFolder className="me-2 text-info" /><strong>Categoría:</strong> {detalle.categoria ? detalle.categoria.nombre : "No disponible"}</p>
                <p><FaHouseUser className="me-2 text-white" /><strong>Unidad Habitacional:</strong> {detalle.unidadHabitacional ? detalle.unidadHabitacional.nombre : "No disponible"}</p>
              </Card.Body>
            </Card>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Volver a la lista
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Modal eliminar */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Seguro que quieres eliminar esta solicitud de mantenimiento?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>Cancelar</Button>
          <Button variant="danger" onClick={confirmDelete}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </>
  )}
</DashboardLayout>


);
}

export default Listar;