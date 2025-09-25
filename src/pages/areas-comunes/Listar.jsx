import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Modal, Card } from "react-bootstrap";
import {
  fetchAreasComunes,
  deleteAreaComun,
} from "../../services/areas-comunes";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";

import {
  FaClock,
  FaUsers,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaHome,
  FaListAlt,
} from "react-icons/fa";

function Listar() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadAreas(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const loadAreas = async (page, search = "") => {
    try {
      setLoading(true);
      const data = await fetchAreasComunes(page, search);
      setAreas(data.results);
      const total = Math.ceil(data.count / 10);
      setTotalPages(total);
    } catch (err) {
      console.error("Error cargando áreas comunes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleShowDeleteModal = (id) => {
    setSelectedAreaId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedAreaId(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteAreaComun(selectedAreaId);
      loadAreas(currentPage, searchTerm); // Refrescar la lista
    } catch (err) {
      console.error("Error eliminando:", err);
      alert("Error al eliminar");
    } finally {
      handleCloseDeleteModal();
    }
  };

  const handleView = (area) => {
    setSelectedArea(area);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedArea(null);
  };

  /*const filteredAreas = areas.filter((a) =>
    `${a.nombre}`.toLowerCase().includes(searchTerm.toLowerCase())
  );*/

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

      <div className="mb-3">
        <input
          type="text"
          placeholder="Buscar por nombre, capacidad"
          className="form-control"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reiniciar a la página 1 al buscar
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
                <th>Id</th>
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
                  <td>{area.id}</td>
                  <td>{area.nombre}</td>
                  <td>{area.capacidad}</td>
                  <td>
                    {area.horario_apertura} - {area.horario_cierre}
                  </td>
                  <td>{area.precio_por_hora}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => handleView(area)}
                    >
                      Ver
                    </Button>{" "}
                    {/*<Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/areas-comunes/${area.id}`)}
                    >
                      Ver
                    </Button>*/}
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
                      onClick={() => handleShowDeleteModal(area.id)}
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
      {/* Modal de confirmación */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que quieres eliminar esta área común?
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

      {selectedArea && (
        <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              Detalles de Área Común: <strong>{selectedArea.nombre}</strong>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <p>
                  <FaListAlt className="me-2 text-primary" />{" "}
                  <strong>Descripción:</strong> {selectedArea.descripcion}
                </p>
                <hr />
                <p>
                  <FaUsers className="me-2 text-success" />{" "}
                  <strong>Capacidad:</strong> {selectedArea.capacidad}
                </p>
                <p>
                  <FaClock className="me-2 text-warning" />
                  <strong>Horario:</strong> {selectedArea.horario_apertura} -{" "}
                  {selectedArea.horario_cierre}
                </p>
                <hr />
                <p>
                  <FaMoneyBillWave className="me-2 text-info" />{" "}
                  <strong>Precio por hora:</strong> $
                  {selectedArea.precio_por_hora}
                </p>
                <p>
                  <FaListAlt className="me-2 text-secondary" />{" "}
                  <strong>Reglas de uso:</strong> {selectedArea.reglas_uso}
                </p>
                <hr />
                <p>
                  {selectedArea.requiere_aprobacion ? (
                    <>
                      <FaCheckCircle className="me-2 text-success" />{" "}
                      <strong>Requiere aprobación:</strong> Sí
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="me-2 text-danger" />{" "}
                      <strong>Requiere aprobación:</strong> No
                    </>
                  )}
                </p>
                {selectedArea.condominio?.nombre && (
                  <p>
                    <FaHome className="me-2 text-dark" />{" "}
                    <strong>Condominio:</strong>{" "}
                    {selectedArea.condominio.nombre}
                  </p>
                )}
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
