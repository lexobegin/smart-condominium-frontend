import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAreaComun } from "../../services/areas-comunes";
import DashboardLayout from "../../components/DashboardLayout";
import { Button, Card, Spinner, Row, Col } from "react-bootstrap";

function Ver() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArea();
  }, []);

  const loadArea = async () => {
    try {
      const data = await fetchAreaComun(id);
      setArea(data);
    } catch (err) {
      console.error("Error al cargar el área común:", err);
      alert("No se pudo cargar el área común.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner animation="border" />
      </DashboardLayout>
    );
  }

  if (!area) {
    return (
      <DashboardLayout>
        <p>No se encontró el área común.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h2>Detalles del Área Común</h2>
      <Card className="mt-3">
        <Card.Body>
          <Row className="mb-2">
            <Col md={4}>
              <strong>Nombre:</strong>
            </Col>
            <Col md={8}>{area.nombre}</Col>
          </Row>
          <Row className="mb-2">
            <Col md={4}>
              <strong>Descripción:</strong>
            </Col>
            <Col md={8}>{area.descripcion}</Col>
          </Row>
          <Row className="mb-2">
            <Col md={4}>
              <strong>Capacidad:</strong>
            </Col>
            <Col md={8}>{area.capacidad}</Col>
          </Row>
          <Row className="mb-2">
            <Col md={4}>
              <strong>Horario:</strong>
            </Col>
            <Col md={8}>
              {area.horario_apertura} - {area.horario_cierre}
            </Col>
          </Row>
          <Row className="mb-2">
            <Col md={4}>
              <strong>Precio por hora:</strong>
            </Col>
            <Col md={8}>${area.precio_por_hora}</Col>
          </Row>
          <Row className="mb-2">
            <Col md={4}>
              <strong>Reglas de uso:</strong>
            </Col>
            <Col md={8}>{area.reglas_uso}</Col>
          </Row>
          <Row className="mb-2">
            <Col md={4}>
              <strong>Requiere aprobación:</strong>
            </Col>
            <Col md={8}>{area.requiere_aprobacion ? "Sí" : "No"}</Col>
          </Row>
          <Row className="mb-2">
            <Col md={4}>
              <strong>Condominio:</strong>
            </Col>
            <Col md={8}>{area.condominio?.nombre}</Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="mt-3">
        <Button variant="secondary" onClick={() => navigate("/areas-comunes")}>
          Volver a la lista
        </Button>
      </div>
    </DashboardLayout>
  );
}

export default Ver;
