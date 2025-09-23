import React, { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import { fetchUnidades, deleteUnidad } from "../../services/unidades";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";

function UnidadHabitacional() {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Carga cuando cambia la página
  useEffect(() => {
    loadUnidades(currentPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Al cambiar la búsqueda, resetea a página 1 (y se dispara la carga por el efecto de arriba)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadUnidades = async (page, search) => {
    try {
      setLoading(true);
      const data = await fetchUnidades(page, search);
      setUnidades(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 10)); // si tu PAGE_SIZE backend es 10
    } catch (err) {
      console.error("Error cargando unidades:", err);
      setUnidades([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (unidadId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta unidad?")) return;

    // Si esta era la última fila visible y no estamos en la primera página,
    // tras borrar retrocedemos de página para no quedarnos en una página vacía.
    const wasLastItemOnPage = unidades.length === 1;

    try {
      await deleteUnidad(unidadId);
      if (wasLastItemOnPage && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        loadUnidades(currentPage, searchTerm);
      }
    } catch (err) {
      console.error("Error eliminando unidad:", err);
      alert("Error al eliminar unidad");
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Unidades Habitacionales</h2>
        <Button variant="success" onClick={() => navigate("/unidades/nueva")}>
          Nueva Unidad
        </Button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Buscar por código o tipo"
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
                <th>Código</th>
                <th>Tipo</th>
                <th>Metros²</th>
                <th>Estado</th>
                <th>Condominio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {unidades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    No hay resultados.
                  </td>
                </tr>
              ) : (
                unidades.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.codigo}</td>
                    <td>{u.tipo}</td>
                    <td>{u.metros_cuadrados}</td>
                    <td>{u.estado}</td>
                    <td>{u.condominio?.nombre}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/unidades/editar/${u.id}`)}
                      >
                        Editar
                      </Button>{" "}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(u.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
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

export default UnidadHabitacional;
