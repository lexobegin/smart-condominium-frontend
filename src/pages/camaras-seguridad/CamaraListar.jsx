import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Modal, Card, Badge } from "react-bootstrap";
import { fetchCamaras, deleteCamara } from "../../services/camaras";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaVideo,
  FaDownload,
  FaFileExcel,
  FaFilePdf,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function CamaraListar() {
  const [camaras, setCamaras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCamaraId, setSelectedCamaraId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCamara, setSelectedCamara] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadCamaras(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const loadCamaras = async (page, search = "") => {
    try {
      setLoading(true);
      const data = await fetchCamaras(page, search);
      setCamaras(data.results);
      const total = Math.ceil(data.count / 10);
      setTotalPages(total);
    } catch (err) {
      console.error("Error cargando cámaras:", err);
      alert("Error al cargar las cámaras");
    } finally {
      setLoading(false);
    }
  };

  // Handlers para modales
  const handleShowDeleteModal = (id) => {
    setSelectedCamaraId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedCamaraId(null);
    setShowDeleteModal(false);
  };

  const handleShowDetailModal = (camara) => {
    setSelectedCamara(camara);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedCamara(null);
    setShowDetailModal(false);
  };

  const confirmDelete = async () => {
    try {
      await deleteCamara(selectedCamaraId);
      loadCamaras(currentPage, searchTerm);
    } catch (err) {
      console.error("Error eliminando cámara:", err);
      alert("Error al eliminar la cámara");
    } finally {
      handleCloseDeleteModal();
    }
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      camaras.map((camara) => ({
        ID: camara.id,
        Nombre: camara.nombre,
        Ubicación: camara.ubicacion,
        Tipo: camara.tipo_camara_display,
        Condominio: camara.condominio?.nombre,
        "URL Stream": camara.url_stream,
        Estado: camara.esta_activa ? "Activa" : "Inactiva",
        "Fecha Creación": new Date(camara.created_at).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cámaras");
    XLSX.writeFile(workbook, "camaras-seguridad.xlsx");
  };

  // Función exportToPDF corregida
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(16);
      doc.text("Reporte de Cámaras de Seguridad", 14, 15);

      // Fecha de generación
      doc.setFontSize(10);
      doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 22);

      // Preparar datos para la tabla
      const tableData = camaras.map((camara) => [
        camara.id,
        camara.nombre,
        camara.ubicacion,
        camara.tipo_camara_display,
        camara.esta_activa ? "Activa" : "Inactiva",
      ]);

      // Crear tabla usando autoTable
      autoTable(doc, {
        startY: 30,
        head: [["ID", "Nombre", "Ubicación", "Tipo", "Estado"]],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
        },
      });

      doc.save("camaras-seguridad.pdf");
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Error al generar el PDF");
    }
  };
  const getEstadoBadge = (estaActiva) => {
    return estaActiva ? (
      <Badge bg="success">Activa</Badge>
    ) : (
      <Badge bg="danger">Inactiva</Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Cámaras de Seguridad</h2>
        <Button
          onClick={() => navigate("/camaras-seguridad/crear")}
          variant="primary"
        >
          Nueva Cámara
        </Button>
      </div>

      {/* Barra de búsqueda y exportación */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          placeholder="Buscar por nombre, ubicación, tipo..."
          className="form-control me-2"
          style={{ width: "600px" }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        <div>
          <Button
            variant="outline-success"
            onClick={exportToExcel}
            className="me-2"
          >
            <FaFileExcel className="me-1" /> Excel
          </Button>
          <Button variant="outline-danger" onClick={exportToPDF}>
            <FaFilePdf className="me-1" /> PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Cargando cámaras...</p>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th>Tipo</th>
                <th>Condominio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {camaras.map((camara) => (
                <tr key={camara.id}>
                  <td>{camara.id}</td>
                  <td>
                    <strong>{camara.nombre}</strong>
                  </td>
                  <td>{camara.ubicacion}</td>
                  <td>{camara.tipo_camara_display}</td>
                  <td>{camara.condominio?.nombre}</td>
                  <td>{getEstadoBadge(camara.esta_activa)}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => handleShowDetailModal(camara)}
                      className="me-1"
                    >
                      <FaEye />
                    </Button>
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() =>
                        navigate(`/camaras-seguridad/editar/${camara.id}`)
                      }
                      className="me-1"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleShowDeleteModal(camara.id)}
                    >
                      <FaTrash />
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
                Página {currentPage} de {totalPages} - Total: {camaras.length}{" "}
                cámaras
              </span>
              <div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="me-2"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline-secondary"
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

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que quieres eliminar esta cámara de seguridad? Esta
          acción no se puede deshacer.
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

      {/* Modal de Detalles */}
      {selectedCamara && (
        <Modal
          show={showDetailModal}
          onHide={handleCloseDetailModal}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FaVideo className="me-2" />
              Detalles de Cámara: {selectedCamara.nombre}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Card>
              <Card.Body>
                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <strong>ID:</strong> {selectedCamara.id}
                    </p>
                    <p>
                      <strong>Nombre:</strong> {selectedCamara.nombre}
                    </p>
                    <p>
                      <strong>Ubicación:</strong> {selectedCamara.ubicacion}
                    </p>
                    <p>
                      <strong>Tipo:</strong>{" "}
                      {selectedCamara.tipo_camara_display}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Condominio:</strong>{" "}
                      {selectedCamara.condominio?.nombre}
                    </p>
                    <p>
                      <strong>Estado:</strong>{" "}
                      {getEstadoBadge(selectedCamara.esta_activa)}
                    </p>
                    <p>
                      <strong>Creación:</strong>{" "}
                      {new Date(selectedCamara.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <hr />
                <p>
                  <strong>URL Stream:</strong>
                </p>
                <code className="bg-light p-2 d-block rounded">
                  {selectedCamara.url_stream}
                </code>
                {selectedCamara.condominio && (
                  <>
                    <hr />
                    <p>
                      <strong>Información del Condominio:</strong>
                    </p>
                    <div className="bg-light p-3 rounded">
                      <p>
                        <strong>Dirección:</strong>{" "}
                        {selectedCamara.condominio.direccion}
                      </p>
                      <p>
                        <strong>Teléfono:</strong>{" "}
                        {selectedCamara.condominio.telefono}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {selectedCamara.condominio.email}
                      </p>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDetailModal}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </DashboardLayout>
  );
}

export default CamaraListar;
