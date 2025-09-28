import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchCamara,
  updateCamara,
  TIPOS_CAMARA,
} from "../../services/camaras";
import { listarCondominios } from "../../services/condominios";
import DashboardLayout from "../../components/DashboardLayout";
import { FaVideo, FaSave, FaTimes } from "react-icons/fa";

function CamaraEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    ubicacion: "",
    url_stream: "",
    tipo_camara: "",
    esta_activa: true,
    condominio: "",
  });

  const [condominios, setCondominios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [camaraData, condominiosData] = await Promise.all([
        fetchCamara(id),
        listarCondominios(),
      ]);

      console.log("Datos de cámara:", camaraData);

      setForm({
        nombre: camaraData.nombre || "",
        ubicacion: camaraData.ubicacion || "",
        url_stream: camaraData.url_stream || "",
        tipo_camara: camaraData.tipo_camara || "",
        esta_activa:
          camaraData.esta_activa !== undefined ? camaraData.esta_activa : true,
        condominio: camaraData.condominio?.id?.toString() || "",
      });

      setCondominios(condominiosData.results || condominiosData);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos de la cámara");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.condominio) {
      setError("Debe seleccionar un condominio");
      return;
    }

    if (!form.tipo_camara) {
      setError("Debe seleccionar un tipo de cámara");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        condominio_id: parseInt(form.condominio, 10),
      };

      delete payload.condominio;

      console.log("Actualizando cámara:", payload);
      await updateCamara(id, payload);

      navigate("/camaras-seguridad");
    } catch (err) {
      console.error("Error actualizando cámara:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Error al actualizar la cámara";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <Spinner animation="border" />
          <p>Cargando datos de la cámara...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex align-items-center mb-4">
        <FaVideo className="me-2 text-primary" size={30} />
        <h2 className="mb-0">Editar Cámara de Seguridad</h2>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Línea 1: Nombre y Ubicación */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Nombre de la Cámara *</Form.Label>
              <Form.Control
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Ubicación Física *</Form.Label>
              <Form.Control
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                required
                maxLength={150}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 2: URL Stream y Tipo de Cámara */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>URL del Stream *</Form.Label>
              <Form.Control
                name="url_stream"
                value={form.url_stream}
                onChange={handleChange}
                required
                type="url"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Tipo de Cámara *</Form.Label>
              <Form.Select
                name="tipo_camara"
                value={form.tipo_camara}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un tipo</option>
                {TIPOS_CAMARA.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 3: Condominio y Estado */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Condominio *</Form.Label>
              <Form.Select
                name="condominio"
                value={form.condominio}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un condominio</option>
                {condominios.map((condo) => (
                  <option key={condo.id} value={condo.id}>
                    {condo.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6} className="d-flex align-items-end">
            <Form.Group className="w-100">
              <Form.Check
                type="switch"
                id="esta_activa"
                name="esta_activa"
                label="Cámara activa"
                checked={form.esta_activa}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Botones de acción */}
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            type="submit"
            disabled={saving}
            className="d-flex align-items-center"
          >
            <FaSave className="me-2" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate("/camaras-seguridad")}
            className="d-flex align-items-center"
          >
            <FaTimes className="me-2" />
            Cancelar
          </Button>
        </div>
      </Form>
    </DashboardLayout>
  );
}

export default CamaraEditar;
