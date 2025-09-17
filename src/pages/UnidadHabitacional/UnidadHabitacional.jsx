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

  useEffect(() => {
    loadUnidades(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const loadUnidades = async (page, search) => {
    try {
      setLoading(true);
      const data = await fetchUnidades(page, search);
      setUnidades(data.results);
      const total = Math.ceil(data.count / 10); // PAGE_SIZE = 10
      setTotalPages(total);
    } catch (err) {
      console.error("Error cargando unidades:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (unidadId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta unidad?"))
      return;
    try {
      await deleteUnidad(unidadId);
      loadUnidades(currentPage);
    } catch (err) {
      console.error("Error eliminando unidad:", err);
      alert("Error al eliminar unidad");
    }
  };

  const filteredUnidades = unidades.filter((u) =>
    `${u.codigo} ${u.tipo}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {filteredUnidades.map((u) => (
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

export default UnidadHabitacional;
