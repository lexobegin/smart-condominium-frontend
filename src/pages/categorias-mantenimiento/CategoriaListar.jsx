import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Modal } from "react-bootstrap";
import {
  fetchCategoriasMantenimientos,
  deleteCategoriaMantenimiento,
} from "../../services/categorias-mantenimiento";
import { fetchCondominio } from "../../services/condominios";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";

function Listar() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [condominio, setCondominio] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadCategorias(currentPage);
  }, [currentPage]);

  const loadCategorias = async (page) => {
    try {
      setLoading(true);
      const data = await fetchCategoriasMantenimientos(page);
      setCategorias(data.results);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (err) {
      console.error("Error cargando categorías:", err);
      alert("No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewCondominio = async (idCondominio) => {
    try {
      const data = await fetchCondominio(idCondominio);
      setCondominio(data);
      setShowModal(true);
    } catch (err) {
      console.error("Error cargando condominio:", err);
      alert("No se pudo cargar el condominio");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCondominio(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta categoría de mantenimiento?")) return;
    try {
      await deleteCategoriaMantenimiento(id);
      loadCategorias(currentPage); // Recarga la lista sin navegar
    } catch (err) {
      console.error("Error eliminando categoría:", err);
      alert("No se pudo eliminar la categoría.");
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Categorías de Mantenimiento</h2>
        <Button
          onClick={() => navigate("/categorias-mantenimiento/crear")}
          variant="success"
        >
          Nueva Categoría de Mantenimiento
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
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Condominio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td>{cat.nombre}</td>
                  <td>{cat.descripcion}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => handleViewCondominio(cat.condominio)}
                    >
                      Ver Detalle
                    </Button>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/categorias-mantenimiento/editar/${cat.id}`)}
                    >
                      Editar
                    </Button>{" "}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(cat.id)}
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

          {/* Modal para ver detalle del condominio */}
          <Modal
            show={showModal}
            onHide={handleCloseModal}
            backdrop={true} // permite cerrar al click fuera
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Detalle Condominio</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {condominio ? (
                <>
                  <p><strong>Nombre:</strong> {condominio.nombre}</p>
                  <p><strong>Dirección:</strong> {condominio.direccion}</p>
                  <p><strong>Teléfono:</strong> {condominio.telefono}</p>
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
