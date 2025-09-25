import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Modal } from "react-bootstrap";
import {
  fetchSolicitudesMantenimientos,
  deleteSolicitudMantenimiento,
} from "../../services/solicitudes-mantenimiento"; // corregido nombre
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { fetchCategoriaMantenimiento } from "../../services/categorias-mantenimiento";
import { fetchAreaComun } from "../../services/areas-comunes";
import { fetchUser } from "../../services/users";
import { fetchUnidad } from "../../services/unidades"; // nuevo servicio

function Listar() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [areaComun, setAreaComun] = useState(null);
  const [unidadHabitacional, setUnidadHabitacional] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadSolicitudes(currentPage);
  }, [currentPage]);

  const loadSolicitudes = async (page) => {
    try {
      setLoading(true);
      const data = await fetchSolicitudesMantenimientos(page);
      setSolicitudes(data.results);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (err) {
      console.error("Error cargando solicitudes de mantenimientos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInformaciones = async (
    idCategoria,
    idUsuario,
    idAreaComun,
    idUnidadHabitacional
  ) => {
    try {
      const [dataCategoria, dataArea, dataUsuario, dataUnidad] =
        await Promise.all([
          idCategoria ? fetchCategoriaMantenimiento(idCategoria) : Promise.resolve(null),
          idAreaComun ? fetchAreaComun(idAreaComun) : Promise.resolve(null),
          idUsuario ? fetchUser(idUsuario) : Promise.resolve(null),
          idUnidadHabitacional ? fetchUnidad(idUnidadHabitacional) : Promise.resolve(null),
        ]);

      setCategoria(dataCategoria);
      setAreaComun(dataArea);
      setUsuario(dataUsuario);
      setUnidadHabitacional(dataUnidad);
      setShowModal(true);
    } catch (err) {
      console.error("Error cargando información:", err);
      alert("No se pudo cargar la información completa");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCategoria(null);
    setUsuario(null);
    setAreaComun(null);
    setUnidadHabitacional(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro quieres eliminar este mantenimiento preventivo?")) return;
    try {
      await deleteSolicitudMantenimiento(id);
      loadSolicitudes(currentPage);
    } catch (err) {
      console.error("Error eliminando:", err);
      alert("Error al eliminar");
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Solicitudes de Mantenimientos</h2>
        <Button
          onClick={() => navigate("/solicitud-mantenimiento/crear")}
          variant="success"
        >
          Nuevo Solicitud de Mantenimiento
        </Button>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Descripción</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Fecha Reporte</th>
                <th>Fecha Limite</th>
                <th colSpan={2}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => (
                <tr key={s.id}>
                  <td>{s.titulo}</td>
                  <td>{s.descripcion}</td>
                  <td>{s.prioridad}</td>
                  <td>{s.estado}</td>
                  <td>{s.fecha_reporte}</td>
                  <td>{s.fecha_limite}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() =>
                        handleViewInformaciones(
                          s.categoria_mantenimiento,
                          s.usuario_reporta,
                          s.area_comun,
                          s.unidad_habitacional
                        )
                      }
                    >
                      Ver Detalle
                    </Button>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      onClick={() =>
                        navigate(`/solicitud-mantenimiento/editar/${s.id}`)
                      }
                    >
                      Editar
                    </Button>{" "}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(s.id)}
                    >
                      Eliminar
                    </Button>
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
                <strong>Nombre del Usuario Reporta:</strong>{" "}
                {usuario ? `${usuario.nombre || "No disponible"} ${usuario.apellidos || ""}` : "No disponible"}
              </p>
              <p>
                <strong>Nombre Área Común:</strong>{" "}
                {areaComun ? areaComun.nombre || "No disponible" : "No disponible"}
              </p>
              <p>
                <strong>Nombre Categoría:</strong>{" "}
                {categoria ? categoria.nombre || "No disponible" : "No disponible"}
              </p>
              <p>
                <strong>Unidad Habitacional:</strong>{" "}
                {unidadHabitacional ? unidadHabitacional.nombre || "No disponible" : "No disponible"}
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
