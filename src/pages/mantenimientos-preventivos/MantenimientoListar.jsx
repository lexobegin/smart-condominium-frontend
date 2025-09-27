import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchMantenimientosPreventivos,
  deleteMantenimientoPreventivo,
} from "../../services/mantenimiento-preventivo";
import {
  fetchCategoriaMantenimiento,
} from "../../services/categorias-mantenimiento";
import { fetchAreaComun } from "../../services/areas-comunes";
import { fetchUser } from "../../services/users";
import DashboardLayout from "../../components/DashboardLayout";
import { Button, Card, Spinner, Table, Modal } from "react-bootstrap";
import { FaListAlt, FaFileAlt } from "react-icons/fa";

function Listar() {
  const navigate = useNavigate();
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMantenimientoId, setSelectedMantenimientoId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [detalle, setDetalle] = useState({
    categoria: null,
    usuario: null,
    areaComun: null,
  });

  // Cargar mantenimientos con búsqueda y paginación
  const loadMantenimientos = async (page, search = "") => {
    try {
      setLoading(true);
      const data = await fetchMantenimientosPreventivos(page, search);
      setMantenimientos(data.results);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (err) {
      console.error("Error cargando mantenimientos preventivos:", err);
      alert("No se pudieron cargar los mantenimientos preventivos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMantenimientos(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  // Modal handlers - eliminar
  const handleShowDeleteModal = (id) => {
    setSelectedMantenimientoId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedMantenimientoId(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteMantenimientoPreventivo(selectedMantenimientoId);
      loadMantenimientos(currentPage, searchTerm);
    } catch (err) {
      console.error("Error eliminando mantenimiento preventivo:", err);
      alert("No se pudo eliminar el mantenimiento preventivo.");
    } finally {
      handleCloseDeleteModal();
    }
  };

  // Modal handlers - ver detalle
  const handleView = async (m) => {
    try {
      const [cat, area, user] = await Promise.all([
        fetchCategoriaMantenimiento(m.categoria_mantenimiento),
        fetchAreaComun(m.area_comun),
        fetchUser(m.responsable),
      ]);
      setDetalle({ categoria: cat, areaComun: area, usuario: user });
      setShowModal(true);
    } catch (err) {
      console.error("Error cargando detalle:", err);
      alert("No se pudo cargar el detalle completo.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDetalle({ categoria: null, usuario: null, areaComun: null });
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

      {/* Buscador */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Buscar por descripción"
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
                <th>ID</th>
                <th>Descripción</th>
                <th>Periodicidad</th>
                <th>Última Ejecución</th>
                <th>Próxima Ejecución</th>
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
                    <Button className="me-2" size="sm" variant="info" onClick={() => handleView(m)}>
                      Ver Detalle
                    </Button>
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
                      onClick={() => handleShowDeleteModal(m.id)}
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

          {/* Modal de confirmación */}
          <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Confirmar Eliminación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              ¿Estás seguro de que quieres eliminar este mantenimiento preventivo?
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

          {/* Modal detalle */}
          {detalle.categoria && detalle.usuario && detalle.areaComun && (
            <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
              <Modal.Header closeButton>
                <Modal.Title>Detalle Mantenimiento Preventivo</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <p>
                      <FaListAlt className="me-2 text-primary" />
                      <strong>ID Mantenimiento:</strong> {detalle.categoria.id}
                    </p>
                    <p>
                      <FaFileAlt className="me-2 text-secondary" />
                      <strong>Descripción Categoría:</strong> {detalle.categoria.descripcion}
                    </p>
                    <p>
                      <strong>Responsable:</strong> {detalle.usuario.nombre} {detalle.usuario.apellidos}
                    </p>
                    <p>
                      <strong>Área Común:</strong> {detalle.areaComun.nombre}
                    </p>
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
        </>
      )}
    </DashboardLayout>
  );
}

export default Listar;
