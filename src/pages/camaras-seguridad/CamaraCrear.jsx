import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner, Alert } from "react-bootstrap";
import { createCamara, TIPOS_CAMARA } from "../../services/camaras";
import { listarCondominios } from "../../services/condominios";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { FaVideo, FaSave, FaTimes } from "react-icons/fa";

function CamaraCrear() {
  const [form, setForm] = useState({
    nombre: "",
    ubicacion: "",
    url_stream: "",
    tipo_camara: "",
    esta_activa: true,
    condominio: "",
  });

  const [condominios, setCondominios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadCondominios();
  }, []);

  const loadCondominios = async () => {
    try {
      setLoading(true);
      const data = await listarCondominios();
      setCondominios(data.results || data);
    } catch (err) {
      console.error("Error cargando condominios:", err);
      setError("Error al cargar los condominios");
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

    // Validaciones básicas
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

      // Eliminar campo no necesario para el backend
      delete payload.condominio;

      console.log("Enviando datos:", payload);
      await createCamara(payload);

      navigate("/camaras-seguridad");
    } catch (err) {
      console.error("Error creando cámara:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Error al crear la cámara";
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
          <p>Cargando condominios...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex align-items-center mb-4">
        <FaVideo className="me-2 text-primary" size={30} />
        <h2 className="mb-0">Nueva Cámara de Seguridad</h2>
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
                placeholder="Ej: Entrada Principal 1"
                required
                maxLength={100}
              />
              <Form.Text className="text-muted">
                Nombre descriptivo para identificar la cámara
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Ubicación Física *</Form.Label>
              <Form.Control
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                placeholder="Ej: Recepción Principal, Estacionamiento Nivel 1"
                required
                maxLength={150}
              />
              <Form.Text className="text-muted">
                Ubicación exacta dentro del condominio
              </Form.Text>
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
                placeholder="Ej: rtsp://servidor:puerto/stream"
                required
                type="url"
              />
              <Form.Text className="text-muted">
                URL RTSP o HTTP del stream de video
              </Form.Text>
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
              <Form.Text className="text-muted">
                La cámara estará operativa y monitoreando
              </Form.Text>
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
            {saving ? "Guardando..." : "Guardar Cámara"}
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

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-light rounded">
        <h6>Información sobre los tipos de cámara:</h6>
        <ul className="mb-0">
          <li>
            <strong>Entrada Principal:</strong> Control de acceso vehicular y
            peatonal
          </li>
          <li>
            <strong>Estacionamiento:</strong> Vigilancia de áreas de parking
          </li>
          <li>
            <strong>Áreas Comunes:</strong> Piscinas, jardines, gimnasios
          </li>
          <li>
            <strong>Ascensores:</strong> Monitoreo interno de elevadores
          </li>
          <li>
            <strong>Pasillos:</strong> Corredores y áreas de circulación
          </li>
          <li>
            <strong>Portería:</strong> Control de ingreso principal
          </li>
        </ul>
      </div>
    </DashboardLayout>
  );
}

export default CamaraCrear;
