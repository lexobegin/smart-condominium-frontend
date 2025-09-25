import React, { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import {
  fetchCategoriasMantenimientos,
  deleteCategoriaMantenimiento,
} from "../../services/categorias-mantenimiento";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {fetchCondominio} from "../../services/condominios";
import { Modal } from "react-bootstrap";

function Listar() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const [condominio, setCondominio] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadCategorias(currentPage);
  }, [currentPage]);

  const loadCategorias = async (page) => {
    try {
      setLoading(true);
      const data = await fetchCategoriasMantenimientos(page);
      setCategorias(data.results);
      const total = Math.ceil(data.count / 10);
      setTotalPages(total);
    } catch (err) {
      console.error("Error cargando áreas comunes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCondominio = async (id) => {
    try {
      const data = await fetchCondominio(id);
      setCondominio(data);
      setShowModal(true);
    } catch (err) {
      console.error("Error cargando condominio:", err);
      alert("No se pudo cargar el condominio");
    }
  };


  const handleDelete = async (id) => {
    if (
      !window.confirm("¿Estás seguro de que quieres eliminar esta categoria de mantenimiento?")
    )
      return;
    try {
      await deleteCategoriaMantenimiento(id);
      navigate("/categorias-mantenimiento");
    } catch (err) {
      console.error("Error eliminando:", err);
      alert("Error al eliminar");
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Categorias Mantenimiento</h2>
        <Button
          onClick={() => navigate("/categorias-mantenimiento/crear")}
          variant="success"
        >
          Nueva Categoria Mantenimiento
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
                <th>Descripcion</th>
                <th>Condominio</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria) => (
                <tr key={categoria.id}>
                  <td>{categoria.id}</td>
                  <td>{categoria.nombre}</td>
                  <td>{categoria.descripcion}</td>
                  <td>
                      <Button
                        size="sm"
                        variant="info"
                        onClick={() => handleViewCondominio(categoria.condominio)}
                      >
                        Ver Detalle
                      </Button>
                  </td>
                  {/* Modal de ver detalle */}
                    <Modal show={showModal} onHide={() => setShowModal(false)} backdrop={false} centered>
                    <Modal.Header closeButton>
                      <Modal.Title>Detalle Condominio</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      {condominio ? (
                        <>
                          <p><strong>Nombre:</strong> {condominio.nombre}</p>
                          <p><strong>Dirección:</strong> {condominio.direccion}</p>
                          <p><strong>Teléfono:</strong> {condominio.telefono}</p>
                          {/* Agrega más campos según tu modelo */}
                        </>
                      ) : (
                        <p>Cargando...</p>
                      )}
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cerrar
                      </Button>
                    </Modal.Footer>
                  </Modal>
                  <td>
                    <Button
                      size="sm"
                      onClick={() =>
                        navigate(`/categorias-mantenimiento/editar/${categoria.id}`)
                      }
                    >
                      Editar
                    </Button>{" "}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(categoria.id)}
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
        </>
      )}
    </DashboardLayout>
  );
}

export default Listar;
