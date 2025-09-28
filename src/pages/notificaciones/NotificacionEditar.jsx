import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner, Alert, Card } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchNotificacion,
  updateNotificacion,
  TIPOS_NOTIFICACION,
  PRIORIDADES,
} from "../../services/notificaciones";
import { listarUsers } from "../../services/users";
import { listarUnidades } from "../../services/unidades";
import DashboardLayout from "../../components/DashboardLayout";
import { FaBell, FaSave, FaTimes } from "react-icons/fa";

function NotificacionEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar datos en paralelo
      const [notificacionData, usuariosData, unidadesData] = await Promise.all([
        fetchNotificacion(id),
        listarUsers().catch(() => ({ results: [] })),
        listarUnidades().catch(() => ({ results: [] })),
      ]);

      console.log("Datos de notificación:", notificacionData);

      setForm({
        titulo: notificacionData.titulo || "",
        mensaje: notificacionData.mensaje || "",
        tipo: notificacionData.tipo || "general",
        prioridad: notificacionData.prioridad || "media",
        usuario: notificacionData.usuario?.id?.toString() || "",
        unidad_habitacional:
          notificacionData.unidad_habitacional?.id?.toString() || "",
        enviada: notificacionData.enviada || false,
        leida: notificacionData.leida || false,
      });

      setUsuarios(usuariosData.results || usuariosData || []);
      setUnidades(unidadesData.results || unidadesData || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos de la notificación");
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
      } else {
        // Si no hay usuario, asegurarse de que no se envíe el campo
        payload.usuario_id = null;
      }

      // Agregar unidad habitacional si está seleccionada
      if (form.unidad_habitacional) {
        payload.unidad_habitacional_id = parseInt(form.unidad_habitacional, 10);
      } else {
        // Si no hay unidad, asegurarse de que no se envíe el campo
        payload.unidad_habitacional_id = null;
      }

      console.log("Actualizando notificación:", payload);
      await updateNotificacion(id, payload);

      navigate("/notificaciones");
    } catch (err) {
      console.error("Error actualizando notificación:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Error al actualizar la notificación";
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
          <p>Cargando datos de la notificación...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex align-items-center mb-4">
        <FaBell className="me-2 text-warning" size={30} />
        <h2 className="mb-0">Editar Notificación</h2>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body className="bg-light">
          <small>
            <strong>ID de Notificación:</strong> {id} |
            <strong> Fecha de Creación:</strong>{" "}
            {new Date().toLocaleDateString()}
          </small>
        </Card.Body>
      </Card>

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
                required
                maxLength={200}
              />
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
              <Form.Label>Usuario Destinatario</Form.Label>
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
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Unidad Habitacional</Form.Label>
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
            onClick={() => navigate("/notificaciones")}
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

export default NotificacionEditar;
