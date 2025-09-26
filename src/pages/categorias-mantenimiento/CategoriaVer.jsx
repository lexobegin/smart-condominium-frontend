import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchCategoriasMantenimientos,
  deleteCategoriaMantenimiento,
} from "../../services/categorias-mantenimiento";
import DashboardLayout from "../../components/DashboardLayout";
import { Button, Card, Spinner, Table, Modal } from "react-bootstrap";
import { FaListAlt, FaFileAlt } from "react-icons/fa";

function Listar() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);

  const loadCategorias = async (page, search = "") => {
    try {
      setLoading(true);
      const data = await fetchCategoriasMantenimientos(page, search);
      setCategorias(data.results);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (err) {
      console.error("Error cargando categorías:", err);
      alert("No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategorias(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  // Modal handlers - eliminar
  const handleShowDeleteModal = (id) => {
    setSelectedCategoriaId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedCategoriaId(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteCategoriaMantenimiento(selectedCategoriaId);
      loadCategorias(currentPage, searchTerm);
    } catch (err) {
      console.error("Error eliminando categoría:", err);
      alert("No se pudo eliminar la categoría.");
    } finally {
      handleCloseDeleteModal();
    }
  };

  // Modal handlers - ver detalle
  const handleView = (categoria) => {
    setSelectedCategoria(categoria);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategoria(null);
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Categorías de Mantenimiento</h2>
        <Button
          onClick={() => navigate("/categorias-mantenimiento/crear")}
          variant="success"
        >
          Nueva Categoría
        </Button>
      </div>

      {/* Buscador */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Buscar por nombre o descripción"
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
                <th>Nombre</th>
                <th>Descripción</th>
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
                      className="me-2"
                      onClick={() => handleView(cat)}
                    >
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        navigate(`/categorias-mantenimiento/editar/${cat.id}`)
                      }
                    >
                      Editar
                    </Button>{" "}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleShowDeleteModal(cat.id)}
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
        </>
      )}

      {/* Modal confirmación eliminar */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que quieres eliminar esta categoría de mantenimiento?
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
      {selectedCategoria && (
        <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              Detalles de Categoría:{" "}
              <strong>{selectedCategoria.nombre}</strong>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <p>
                  <FaListAlt className="me-2 text-primary" />{" "}
                  <strong>ID:</strong> {selectedCategoria.id}
                </p>
                <p>
                  <FaFileAlt className="me-2 text-secondary" />{" "}
                  <strong>Descripción:</strong> {selectedCategoria.descripcion}
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
    </DashboardLayout>
  );
}

export default Listar;
