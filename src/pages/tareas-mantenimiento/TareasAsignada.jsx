import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Modal, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  fetchTareasMantenimientos,
  deleteTareaMantenimiento,
} from "../../services/tareas-mantenimiento";
import { fetchSolicitudMantenimiento } from "../../services/solicitudes-mantenimiento";
import { fetchUser } from "../../services/users";
import { fetchCategoriaMantenimiento } from "../../services/categorias-mantenimiento";
import { fetchAreaComun } from "../../services/areas-comunes";
import { fetchUnidad } from "../../services/unidades";

function Listar() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Modal detalle
  const [detalle, setDetalle] = useState({
    tarea: null,
    usuario: null,
    solicitud: null,
    categoria: null,
    areaComun: null,
    unidadHabitacional: null,
  });
  const [showModal, setShowModal] = useState(false);

  // Modal eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTareaId, setSelectedTareaId] = useState(null);

  const loadTareas = async (page, search = "") => {
    try {
      setLoading(true);
      const data = await fetchTareasMantenimientos(page, search);

      // Traer títulos de solicitudes para cada tarea
      const tareasConSolicitud = await Promise.all(
        data.results.map(async (t) => {
          let solicitudData = null;
          try {
            if (t.solicitud_mantenimiento) {
              solicitudData = await fetchSolicitudMantenimiento(t.solicitud_mantenimiento);
            }
          } catch (err) {
            console.error("Error cargando solicitud:", err);
          }
          return { ...t, solicitudData };
        })
      );

      setTareas(tareasConSolicitud);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (err) {
      console.error("Error cargando tareas de mantenimientos:", err);
      alert("No se pudieron cargar las tareas de mantenimiento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTareas(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleViewInformaciones = async (tarea) => {
    try {
      const [dataUsuario, dataSolicitud] = await Promise.all([
        tarea.usuario_asignado ? fetchUser(tarea.usuario_asignado) : Promise.resolve(null),
        tarea.solicitud_mantenimiento ? fetchSolicitudMantenimiento(tarea.solicitud_mantenimiento) : Promise.resolve(null),
      ]);

      const [categoria, area, unidad] = await Promise.all([
        dataSolicitud?.categoria_mantenimiento ? fetchCategoriaMantenimiento(dataSolicitud.categoria_mantenimiento) : Promise.resolve(null),
        dataSolicitud?.area_comun ? fetchAreaComun(dataSolicitud.area_comun) : Promise.resolve(null),
        dataSolicitud?.unidad_habitacional ? fetchUnidad(dataSolicitud.unidad_habitacional) : Promise.resolve(null),
      ]);

      setDetalle({
        tarea,
        usuario: dataUsuario,
        solicitud: dataSolicitud,
        categoria,
        areaComun: area,
        unidadHabitacional: unidad,
      });

      setShowModal(true);
    } catch (err) {
      console.error("Error cargando información de detalle:", err);
      alert("No se pudo cargar la información completa");
    }
  };

  const handleCloseModal = () => {
    setDetalle({
      tarea: null,
      usuario: null,
      solicitud: null,
      categoria: null,
      areaComun: null,
      unidadHabitacional: null,
    });
    setShowModal(false);
  };

  // Modal eliminar
  const handleShowDeleteModal = (id) => {
    setSelectedTareaId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedTareaId(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteTareaMantenimiento(selectedTareaId);
      loadTareas(currentPage, searchTerm);
    } catch (err) {
      console.error("Error eliminando:", err);
      alert("Error al eliminar la tarea de mantenimiento");
    } finally {
      handleCloseDeleteModal();
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Tareas de Mantenimiento</h2>
        <Button variant="success" onClick={() => navigate("/tareas-mantenimiento/crear")}>
          Asignar Tareas de Mantenimiento
        </Button>
      </div>

      {/* Buscador */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Buscar por descripción, estado..."
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
                <th>Título Solicitud</th>
                <th>Descripción Tarea</th>
                <th>Fecha Asignación</th>
                <th>Fecha Límite</th>
                <th>Fecha Completado</th>
                <th>Estado</th>
                <th colSpan={3}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tareas.map((t) => (
                <tr key={t.id}>
                  <td>{t.solicitudData?.titulo || "N/A"}</td>
                  <td>{t.descripcion}</td>
                  <td>{t.fecha_asignacion}</td>
                  <td>{t.fecha_limite}</td>
                  <td>{t.fecha_completado || "No completado"}</td>
                  <td>{t.estado}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => handleViewInformaciones(t)}
                    >
                      Ver Detalle
                    </Button>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/tareas-mantenimiento/editar/${t.id}`)}
                    >
                      Editar
                    </Button>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleShowDeleteModal(t.id)}
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
              <span>
                Página {currentPage} de {totalPages}
              </span>
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
          <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Detalle de la Tarea</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {detalle.tarea && (
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <p><strong>Descripción Tarea:</strong> {detalle.tarea.descripcion}</p>
                    <p><strong>Fecha Asignación:</strong> {detalle.tarea.fecha_asignacion}</p>
                    <p><strong>Fecha Límite:</strong> {detalle.tarea.fecha_limite}</p>
                    <p><strong>Fecha Completado:</strong> {detalle.tarea.fecha_completado || "No completado"}</p>
                    <p><strong>Estado:</strong> {detalle.tarea.estado}</p>
                    <p><strong>Costo Estimado:</strong> {detalle.tarea.costo_estimado}</p>
                    <p><strong>Costo Real:</strong> {detalle.tarea.costo_real}</p>
                    <hr />
                    <p><strong>Título Solicitud:</strong> {detalle.solicitud?.titulo || "N/A"}</p>
                    <p><strong>Descripción Solicitud:</strong> {detalle.solicitud?.descripcion || "N/A"}</p>
                    <p><strong>Estado Solicitud:</strong> {detalle.solicitud?.estado || "N/A"}</p>
                    <p><strong>Usuario que reporta:</strong> {detalle.usuario ? `${detalle.usuario.nombre} ${detalle.usuario.apellido}` : "N/A"}</p>
                    <p><strong>Categoría:</strong> {detalle.categoria?.nombre || "N/A"}</p>
                    <p><strong>Área Común:</strong> {detalle.areaComun?.nombre || "N/A"}</p>
                    <p><strong>Unidad Habitacional:</strong> {detalle.unidadHabitacional?.nombre || "N/A"}</p>
                  </Card.Body>
                </Card>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>Cerrar</Button>
            </Modal.Footer>
          </Modal>

          {/* Modal eliminar */}
          <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Confirmar Eliminación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              ¿Estás seguro de que quieres eliminar esta tarea de mantenimiento?
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
        </>
      )}
    </DashboardLayout>
  );
}

export default Listar;
