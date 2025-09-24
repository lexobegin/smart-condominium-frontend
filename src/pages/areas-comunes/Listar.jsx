import React, { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import {
  fetchAreasComunes,
  deleteAreaComun,
} from "../../services/areas-comunes";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";

function Listar() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    loadAreas(currentPage);
  }, [currentPage]);

  const loadAreas = async (page) => {
    try {
      setLoading(true);
      const data = await fetchAreasComunes(page);
      setAreas(data.results);
      const total = Math.ceil(data.count / 10);
      setTotalPages(total);
    } catch (err) {
      console.error("Error cargando áreas comunes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("¿Estás seguro de que quieres eliminar esta área común?")
    )
      return;
    try {
      await deleteAreaComun(id);
      loadAreas(currentPage);
    } catch (err) {
      console.error("Error eliminando:", err);
      alert("Error al eliminar");
    }
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Áreas Comunes</h2>
        <Button
          onClick={() => navigate("/areas-comunes/crear")}
          variant="success"
        >
          Nueva Área Común
        </Button>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Capacidad</th>
                <th>Horario</th>
                <th>Precio/Hora </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area) => (
                <tr key={area.id}>
                  <td>{area.nombre}</td>
                  <td>{area.capacidad}</td>
                  <td>
                    {area.horario_apertura} - {area.horario_cierre}
                  </td>
                  <td>{area.precio_por_hora}</td>
                  <td>
                    <Button
                      size="sm"
                      onClick={() =>
                        navigate(`/areas-comunes/editar/${area.id}`)
                      }
                    >
                      Editar
                    </Button>{" "}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(area.id)}
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
