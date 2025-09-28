import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner, Alert, Card } from "react-bootstrap";
import {
  createIncidente,
  TIPOS_INCIDENTE,
  GRAVEDADES,
  ESTADOS_INCIDENTE,
} from "../../services/incidentes";
import { listarUsersSeguridad } from "../../services/users";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  FaShieldAlt,
  FaSave,
  FaTimes,
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";

function IncidenteCrear() {
  const [form, setForm] = useState({
    tipo: "mascota_suelta",
    descripcion: "",
    ubicacion: "",
    fecha_hora: new Date().toISOString().slice(0, 16),
    gravedad: "baja",
    estado: "reportado",
    usuario_asignado: "",
    confidence_score: "",
    evidencia_foto: null,
    evidencia_video: null,
  });

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosData = await listarUsersSeguridad().catch(() => ({
        results: [],
      }));
      // Filtrar usuarios de seguridad o mantenimiento
      const usuariosFiltrados = (usuariosData.results || usuariosData).filter(
        (usuario) =>
          usuario.tipo === "seguridad" || usuario.tipo === "mantenimiento"
      );
      setUsuarios(usuariosFiltrados);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setError("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setForm((prev) => ({
        ...prev,
        [name]: files[0] || null,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!form.descripcion.trim()) {
      setError("La descripción es obligatoria");
      return;
    }

    if (!form.ubicacion.trim()) {
      setError("La ubicación es obligatoria");
      return;
    }

    if (!form.fecha_hora) {
      setError("La fecha y hora son obligatorias");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Preparar FormData para soportar archivos
      const formData = new FormData();

      // Agregar campos de texto
      formData.append("tipo", form.tipo);
      formData.append("descripcion", form.descripcion.trim());
      formData.append("ubicacion", form.ubicacion.trim());
      formData.append("fecha_hora", form.fecha_hora);
      formData.append("gravedad", form.gravedad);
      formData.append("estado", form.estado);

      // Agregar usuario asignado si está seleccionado
      if (form.usuario_asignado) {
        formData.append("usuario_asignado_id", form.usuario_asignado);
      }

      // Agregar confidence score si existe
      if (form.confidence_score) {
        formData.append("confidence_score", parseFloat(form.confidence_score));
      }

      // Agregar archivos si existen
      if (form.evidencia_foto) {
        formData.append("evidencia_foto", form.evidencia_foto);
      }

      if (form.evidencia_video) {
        formData.append("evidencia_video", form.evidencia_video);
      }

      console.log("Enviando incidente:", Object.fromEntries(formData));
      await createIncidente(formData);

      navigate("/incidentes-seguridad");
    } catch (err) {
      console.error("Error creando incidente:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Error al crear el incidente";
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
          <p>Cargando datos...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex align-items-center mb-4">
        <FaShieldAlt className="me-2 text-danger" size={30} />
        <h2 className="mb-0">Nuevo Incidente de Seguridad</h2>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Línea 1: Tipo y Gravedad */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Tipo de Incidente *</Form.Label>
              <Form.Select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                required
              >
                {TIPOS_INCIDENTE.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Nivel de Gravedad *</Form.Label>
              <Form.Select
                name="gravedad"
                value={form.gravedad}
                onChange={handleChange}
                required
              >
                {GRAVEDADES.map((gravedad) => (
                  <option key={gravedad.value} value={gravedad.value}>
                    {gravedad.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 2: Descripción */}
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Descripción del Incidente *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Describa detalladamente lo ocurrido..."
                required
                maxLength={500}
              />
              <Form.Text className="text-muted">
                {form.descripcion.length}/500 caracteres
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 3: Ubicación y Fecha/Hora */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <FaMapMarkerAlt className="me-1" />
                Ubicación *
              </Form.Label>
              <Form.Control
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                placeholder="Ej: Piscina principal, Estacionamiento nivel 2, etc."
                required
                maxLength={200}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <FaCalendarAlt className="me-1" />
                Fecha y Hora del Incidente *
              </Form.Label>
              <Form.Control
                type="datetime-local"
                name="fecha_hora"
                value={form.fecha_hora}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 4: Estado y Usuario Asignado */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Estado del Incidente *</Form.Label>
              <Form.Select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                required
              >
                {ESTADOS_INCIDENTE.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <FaUser className="me-1" />
                Personal Asignado
              </Form.Label>
              <Form.Select
                name="usuario_asignado"
                value={form.usuario_asignado}
                onChange={handleChange}
              >
                <option value="">No asignar (investigación pendiente)</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellidos} - {usuario.tipo}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Asigne personal de seguridad o mantenimiento
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 5: Confidence Score */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Confidence Score (Opcional)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                max="1"
                name="confidence_score"
                value={form.confidence_score}
                onChange={handleChange}
                placeholder="0.00 - 1.00"
              />
              <Form.Text className="text-muted">
                Nivel de confianza en la detección automática (si aplica)
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 6: Evidencias */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Evidencia Fotográfica</Form.Label>
              <Form.Control
                type="file"
                name="evidencia_foto"
                accept="image/*"
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                Formatos: JPG, PNG, GIF (máx. 5MB)
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Evidencia de Video</Form.Label>
              <Form.Control
                type="file"
                name="evidencia_video"
                accept="video/*"
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                Formatos: MP4, AVI, MOV (máx. 50MB)
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Botones de acción */}
        <div className="d-flex gap-2">
          <Button
            variant="danger"
            type="submit"
            disabled={saving}
            className="d-flex align-items-center"
          >
            <FaSave className="me-2" />
            {saving ? "Registrando..." : "Registrar Incidente"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate("/incidentes-seguridad")}
            className="d-flex align-items-center"
          >
            <FaTimes className="me-2" />
            Cancelar
          </Button>
        </div>
      </Form>

      {/* Información adicional */}
      <Card className="mt-4">
        <Card.Header>
          <strong>Guía de Clasificación de Incidentes</strong>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>Niveles de Gravedad:</h6>
              <ul className="small mb-0">
                <li>
                  <strong>Baja:</strong> Incidentes menores sin riesgo inmediato
                </li>
                <li>
                  <strong>Media:</strong> Situaciones que requieren atención
                  pronta
                </li>
                <li>
                  <strong>Alta:</strong> Riesgo significativo para personas o
                  propiedad
                </li>
                <li>
                  <strong>Crítica:</strong> Emergencia que requiere acción
                  inmediata
                </li>
              </ul>
            </Col>
            <Col md={6}>
              <h6>Estados del Incidente:</h6>
              <ul className="small mb-0">
                <li>
                  <strong>Reportado:</strong> Incidente registrado, pendiente de
                  revisión
                </li>
                <li>
                  <strong>Investigando:</strong> En proceso de investigación
                </li>
                <li>
                  <strong>Resuelto:</strong> Situación solucionada
                </li>
                <li>
                  <strong>Cerrado:</strong> Caso finalizado con documentación
                  completa
                </li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
}

export default IncidenteCrear;
