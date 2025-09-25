import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Modal } from "react-bootstrap";
import {
  fetchTareasMantenimientos,
  deleteTareaMantenimiento,
} from "../../services/tareas-mantenimiento";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { fetchSolicitudMantenimiento } from "../../services/solicitudes-mantenimiento";
import { fetchUser } from "../../services/users";

function Listar() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Estados para el modal
  const [usuario, setUsuario] = useState(null);
  const [solicitud, setSolicitud] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadTareas(currentPage);
  }, [currentPage]);

  const loadTareas = async (page) => {
    try {
      setLoading(true);
      const data = await fetchTareasMantenimientos(page);
      setTareas(data.results);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (err) {
      console.error("Error cargando tareas de mantenimientos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInformaciones = async (idSolicitud, idUsuario) => {
    try {
      const [dataSolicitud, dataUsuario] = await Promise.all([
        idSolicitud ? fetchSolicitudMantenimiento(idSolicitud) : Promise.resolve(null),
        idUsuario ? fetchUser(idUsuario) : Promise.resolve(null),
      ]);

      setSolicitud(dataSolicitud);
      setUsuario(dataUsuario);
      setShowModal(true);
    } catch (err) {
      console.error("Error cargando información:", err);
      alert("No se pudo cargar la información completa");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSolicitud(null);
    setUsuario(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro quieres eliminar esta tarea de mantenimiento?")) return;
    try {
      await deleteTareaMantenimiento(id);
      loadTareas(currentPage);
    } catch (err) {
      console.error("Error eliminando:", err);
      alert("Error al eliminar");
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Tareas de Mantenimientos</h2>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Fecha Asignación</th>
                <th>Fecha Límite</th>
                <th>Fecha Completado</th>
                <th>Costo Estimado</th>
                <th>Costo Real</th>
                <th>Estado</th>
                <th colSpan={3}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tareas.map((t) => (
                <tr key={t.id}>
                  <td>{t.descripcion}</td>
                  <td>{t.fecha_asignacion}</td>
                  <td>{t.fecha_limite}</td>
                  <td>{t.fecha_completado}</td>
                  <td>{t.costo_estimado}</td>
                  <td>{t.costo_real}</td>
                  <td>{t.estado}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() =>
                        handleViewInformaciones(
                          t.solicitud_mantenimiento,
                          t.usuario_asignado // ojo aquí, este es el usuario que trabaja
                        )
                      }
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
                    </Button>{" "}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(t.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                  <td>
                    {!t.usuario_asignado && (
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => navigate(`/tareas-mantenimiento/asignar/${t.id}`)}
                      >
                        Asignar Usuario
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

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

          <Modal show={showModal} onHide={handleCloseModal} backdrop={true} centered>
            <Modal.Header closeButton>
              <Modal.Title>Detalle</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                <strong>Usuario Asignado:</strong>{" "}
                {usuario
                  ? `${usuario.nombre || "No disponible"} ${usuario.apellido || ""}`
                  : "No asignado"}
              </p>
              <p>
                <strong>Título Solicitud:</strong>{" "}
                {solicitud ? solicitud.titulo || "No disponible" : "No disponible"}
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </DashboardLayout>
  );
}

export default Listar;
