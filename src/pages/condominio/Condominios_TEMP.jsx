import React, { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import { fetchCondominios, deleteCondominio } from "../../services/condominios";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";

function Condominios() {
  const [condominios, setCondominios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadCondominios(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const loadCondominios = async (page, search) => {
    try {
      setLoading(true);
      const data = await fetchCondominios(page, search);
      setCondominios(data.results);
      const total = Math.ceil(data.count / 10); // PAGE_SIZE = 10
      setTotalPages(total);
    } catch (err) {
      console.error("Error cargando condominios:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (condominioId) => {
    if (
      !window.confirm("¿Estás seguro de que quieres eliminar este condominio?")
    )
      return;
    try {
      await deleteCondominio(condominioId);
      loadCondominios(currentPage);
    } catch (err) {
      console.error("Error eliminando condominio:", err);
      alert("Error al eliminar condominio");
    }
  };

  const filteredCondominios = condominios.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Condominios</h2>
        <Button
          variant="success"
          onClick={() => navigate("/condominios/nuevo")}
        >
          Nuevo Condominio
        </Button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Buscar por nombre"
          className="form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCondominios.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.nombre}</td>
                  <td>{c.direccion}</td>
                  <td>{c.telefono}</td>
                  <td>{c.email}</td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/condominios/editar/${c.id}`)}
                    >
                      Editar
                    </Button>{" "}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(c.id)}
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
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Anterior
                </Button>{" "}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
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

export default Condominios;
