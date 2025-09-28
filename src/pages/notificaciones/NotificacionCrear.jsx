import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner, Alert, Card } from "react-bootstrap";
import {
  createNotificacion,
  TIPOS_NOTIFICACION,
  PRIORIDADES,
} from "../../services/notificaciones";
import { listarUsers } from "../../services/users"; // Asumiendo que tienes este servicio
import { listarUnidades } from "../../services/unidades"; // Asumiendo que tienes este servicio
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { FaBell, FaSave, FaTimes, FaUser, FaHome } from "react-icons/fa";

function NotificacionCrear() {
  const [form, setForm] = useState({
    titulo: "",
    mensaje: "",
    tipo: "general",
    prioridad: "media",
    usuario: "",
    unidad_habitacional: "",
    enviada: false,
    leida: false,
  });

  const [usuarios, setUsuarios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadDatos();
  }, []);

  const loadDatos = async () => {
    try {
      setLoading(true);
      // Cargar usuarios y unidades en paralelo
      const [usuariosData, unidadesData] = await Promise.all([
        listarUsers().catch(() => ({ results: [] })), // Fallback si falla
        listarUnidades().catch(() => ({ results: [] })), // Fallback si falla
      ]);

      setUsuarios(usuariosData.results || usuariosData || []);
      setUnidades(unidadesData.results || unidadesData || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos necesarios");
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

    // Validaciones
    if (!form.titulo.trim()) {
      setError("El título es obligatorio");
      return;
    }

    if (!form.mensaje.trim()) {
      setError("El mensaje es obligatorio");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        titulo: form.titulo.trim(),
        mensaje: form.mensaje.trim(),
        tipo: form.tipo,
        prioridad: form.prioridad,
        enviada: form.enviada,
        leida: form.leida,
      };

      // Agregar usuario si está seleccionado
      if (form.usuario) {
        payload.usuario_id = parseInt(form.usuario, 10);
      }

      // Agregar unidad habitacional si está seleccionada
      if (form.unidad_habitacional) {
        payload.unidad_habitacional_id = parseInt(form.unidad_habitacional, 10);
      }

      console.log("Enviando notificación:", payload);
      await createNotificacion(payload);

      navigate("/notificaciones");
    } catch (err) {
      console.error("Error creando notificación:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Error al crear la notificación";
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
        <FaBell className="me-2 text-warning" size={30} />
        <h2 className="mb-0">Nueva Notificación</h2>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Línea 1: Título */}
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Título *</Form.Label>
              <Form.Control
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Ej: Mantenimiento programado, Pago pendiente, etc."
                required
                maxLength={200}
              />
              <Form.Text className="text-muted">
                Título claro y descriptivo de la notificación
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 2: Mensaje */}
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Mensaje *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="mensaje"
                value={form.mensaje}
                onChange={handleChange}
                placeholder="Escriba el contenido detallado de la notificación..."
                required
                maxLength={1000}
              />
              <Form.Text className="text-muted">
                {form.mensaje.length}/1000 caracteres
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 3: Tipo y Prioridad */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Tipo de Notificación *</Form.Label>
              <Form.Select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                required
              >
                {TIPOS_NOTIFICACION.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Prioridad *</Form.Label>
              <Form.Select
                name="prioridad"
                value={form.prioridad}
                onChange={handleChange}
                required
              >
                {PRIORIDADES.map((prioridad) => (
                  <option key={prioridad.value} value={prioridad.value}>
                    {prioridad.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 4: Destinatario y Unidad */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <FaUser className="me-1" />
                Usuario Destinatario
              </Form.Label>
              <Form.Select
                name="usuario"
                value={form.usuario}
                onChange={handleChange}
              >
                <option value="">
                  Todos los usuarios (Notificación general)
                </option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellidos} - {usuario.tipo}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Dejar vacío para enviar a todos los usuarios
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <FaHome className="me-1" />
                Unidad Habitacional
              </Form.Label>
              <Form.Select
                name="unidad_habitacional"
                value={form.unidad_habitacional}
                onChange={handleChange}
              >
                <option value="">Todas las unidades</option>
                {unidades.map((unidad) => (
                  <option key={unidad.id} value={unidad.id}>
                    {unidad.codigo} - {unidad.tipo || "Sin torre"}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Especifique una unidad específica si es necesario
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 5: Estados */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Check
                type="switch"
                id="enviada"
                name="enviada"
                label="Marcar como enviada"
                checked={form.enviada}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                La notificación aparecerá como enviada inmediatamente
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Check
                type="switch"
                id="leida"
                name="leida"
                label="Marcar como leída"
                checked={form.leida}
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                La notificación aparecerá como leída inmediatamente
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
            {saving ? "Creando..." : "Crear Notificación"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate("/notificaciones")}
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
          <strong>Guía de Tipos y Prioridades</strong>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>Tipos de Notificación:</h6>
              <ul className="small mb-0">
                <li>
                  <strong>Mantenimiento:</strong> Reparaciones, limpieza,
                  mejoras
                </li>
                <li>
                  <strong>Reserva:</strong> Áreas comunes, estacionamientos
                </li>
                <li>
                  <strong>Pago:</strong> Cuotas, multas, servicios
                </li>
                <li>
                  <strong>Seguridad:</strong> Incidentes, recomendaciones
                </li>
                <li>
                  <strong>Emergencia:</strong> Situaciones críticas urgentes
                </li>
                <li>
                  <strong>Evento:</strong> Reuniones, actividades sociales
                </li>
              </ul>
            </Col>
            <Col md={6}>
              <h6>Niveles de Prioridad:</h6>
              <ul className="small mb-0">
                <li>
                  <strong>Baja:</strong> Información general, recordatorios
                </li>
                <li>
                  <strong>Media:</strong> Avisos importantes, fechas límite
                </li>
                <li>
                  <strong>Alta:</strong> Situaciones que requieren atención
                  inmediata
                </li>
                <li>
                  <strong>Urgente:</strong> Emergencias, problemas críticos
                </li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
}

export default NotificacionCrear;
