import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Modal } from "react-bootstrap";
import {
  fetchMantenimientosPreventivos,
  deleteMantenimientoPreventivo,
} from "../../services/mantenimiento-preventivo";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { fetchCategoriaMantenimiento } from "../../services/categorias-mantenimiento";
import { fetchAreaComun } from "../../services/areas-comunes";
import { fetchUser } from "../../services/users";

function Listar() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [areaComun, setAreaComun] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadMantenimientos(currentPage);
  }, [currentPage]);

  const loadMantenimientos = async (page) => {
    try {
      setLoading(true);
      const data = await fetchMantenimientosPreventivos(page);
      setMantenimientos(data.results);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (err) {
      console.error("Error cargando mantenimientos preventivos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInformaciones = async (idCategoria, idUsuario, idAreaComun) => {
    if (!idCategoria || !idUsuario || !idAreaComun) {
      alert("Faltan datos para mostrar la información");
      return;
    }

    try {
      const [dataCategoria, dataArea, dataUsuario] = await Promise.all([
        fetchCategoriaMantenimiento(idCategoria),
        fetchAreaComun(idAreaComun),
        fetchUser(idUsuario),
      ]);

      setCategoria(dataCategoria);
      setAreaComun(dataArea);
      setUsuario(dataUsuario);
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro quieres eliminar este mantenimiento preventivo?")) return;
    try {
      await deleteMantenimientoPreventivo(id);
      loadMantenimientos(currentPage);
    } catch (err) {
      console.error("Error eliminando:", err);
      alert("Error al eliminar");
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Mantenimientos Preventivos</h2>
        <Button
          onClick={() => navigate("/mantenimiento-preventivo/crear")}
          variant="success"
        >
          Nuevo Mantenimiento Preventivo
        </Button>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Periodicidad</th>
                <th>Última Ejecución</th>
                <th>Próxima Ejecución</th>
                <th>Informaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mantenimientos.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.descripcion}</td>
                  <td>{m.periodicidad_dias}</td>
                  <td>{m.ultima_ejecucion}</td>
                  <td>{m.proxima_ejecucion}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() =>
                        handleViewInformaciones(
                          m.categoria_mantenimiento,
                          m.responsable,
                          m.area_comun
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
                        navigate(`/mantenimiento-preventivo/editar/${m.id}`)
                      }
                    >
                      Editar
                    </Button>{" "}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(m.id)}
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
              {categoria && usuario && areaComun ? (
                <>
                  <p><strong>Nombre del Responsable:</strong> {usuario.nombre} {usuario.apellidos}</p>
                  <p><strong>Nombre Area Comun:</strong> {areaComun.nombre}</p>
                  <p><strong>Nombre Categoria:</strong> {categoria.nombre}</p>
                </>
              ) : (
                <p>Cargando...</p>
              )}
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
