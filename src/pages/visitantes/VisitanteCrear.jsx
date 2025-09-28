import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner, Alert, Card } from "react-bootstrap";
import { createVisitante, MOTIVOS_VISITA } from "../../services/visitantes";
import { listarResidentes } from "../../services/users";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  FaUserFriends,
  FaSave,
  FaTimes,
  FaUser,
  FaHome,
  FaIdCard,
  FaPhone,
  FaCar,
} from "react-icons/fa";

function VisitanteCrear() {
  const [form, setForm] = useState({
    nombre: "",
    documento_identidad: "",
    telefono: "",
    motivo_visita: "visita_familiar",
    anfitrion: "",
    placa_vehiculo: "",
    fecha_entrada: new Date().toISOString().slice(0, 16),
  });

  const [residentes, setResidentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadResidentes();
  }, []);

  const loadResidentes = async () => {
    try {
      setLoading(true);
      // Asumimos que existe un servicio para listar residentes
      const residentesData = await listarResidentes().catch(() => ({
        results: [],
      }));
      setResidentes(residentesData.results || residentesData || []);
    } catch (err) {
      console.error("Error cargando residentes:", err);
      setError("Error al cargar la lista de residentes");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (!form.documento_identidad.trim()) {
      setError("El documento de identidad es obligatorio");
      return;
    }

    if (!form.anfitrion) {
      setError("Debe seleccionar un residente anfitrión");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        nombre: form.nombre.trim(),
        documento_identidad: form.documento_identidad.trim(),
        telefono: form.telefono.trim(),
        motivo_visita: form.motivo_visita,
        anfitrion_id: parseInt(form.anfitrion, 10),
        placa_vehiculo: form.placa_vehiculo.trim(),
        fecha_entrada: form.fecha_entrada,
      };

      console.log("Enviando visitante:", payload);
      await createVisitante(payload);

      navigate("/visitantes");
    } catch (err) {
      console.error("Error creando visitante:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Error al crear el visitante";
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
          <p>Cargando residentes...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex align-items-center mb-4">
        <FaUserFriends className="me-2 text-success" size={30} />
        <h2 className="mb-0">Registrar Nuevo Visitante</h2>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Línea 1: Información Personal */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <FaUser className="me-1" />
                Nombre Completo *
              </Form.Label>
              <Form.Control
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez García"
                required
                maxLength={100}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <FaIdCard className="me-1" />
                Documento de Identidad *
              </Form.Label>
              <Form.Control
                name="documento_identidad"
                value={form.documento_identidad}
                onChange={handleChange}
                placeholder="Ej: 12345678"
                required
                maxLength={20}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 2: Contacto y Motivo */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <FaPhone className="me-1" />
                Teléfono
              </Form.Label>
              <Form.Control
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ej: +34 600 123 456"
                maxLength={20}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Motivo de Visita *</Form.Label>
              <Form.Select
                name="motivo_visita"
                value={form.motivo_visita}
                onChange={handleChange}
                required
              >
                {MOTIVOS_VISITA.map((motivo) => (
                  <option key={motivo.value} value={motivo.value}>
                    {motivo.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 3: Anfitrión */}
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>
                <FaHome className="me-1" />
                Residente Anfitrión *
              </Form.Label>
              <Form.Select
                name="anfitrion"
                value={form.anfitrion}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un residente</option>
                {residentes.map((residente) => (
                  <option key={residente.id} value={residente.id}>
                    {residente.nombre} {residente.apellidos} -
                    {residente.unidades_habitacionales?.[0]?.codigo ||
                      "Sin unidad"}{" "}
                    -
                    {residente.unidades_habitacionales?.[0]
                      ?.condominio_nombre || "Sin condominio"}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Seleccione el residente que recibirá al visitante
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 4: Vehículo y Fecha */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <FaCar className="me-1" />
                Placa del Vehículo
              </Form.Label>
              <Form.Control
                name="placa_vehiculo"
                value={form.placa_vehiculo}
                onChange={handleChange}
                placeholder="Ej: ABC123"
                maxLength={15}
              />
              <Form.Text className="text-muted">
                Opcional - Solo si ingresa con vehículo
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Fecha y Hora de Entrada *</Form.Label>
              <Form.Control
                type="datetime-local"
                name="fecha_entrada"
                value={form.fecha_entrada}
                onChange={handleChange}
                required
              />
              <Form.Text className="text-muted">
                Fecha y hora del ingreso del visitante
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Botones de acción */}
        <div className="d-flex gap-2">
          <Button
            variant="success"
            type="submit"
            disabled={saving}
            className="d-flex align-items-center"
          >
            <FaSave className="me-2" />
            {saving ? "Registrando..." : "Registrar Visitante"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate("/visitantes")}
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
          <strong>Información Importante</strong>
        </Card.Header>
        <Card.Body>
          <ul className="mb-0">
            <li>
              El visitante quedará registrado como <strong>"En visita"</strong>{" "}
              hasta que se registre su salida
            </li>
            <li>
              El residente anfitrión será notificado del registro de su
              visitante
            </li>
            <li>
              La placa del vehículo es opcional pero recomendada para control de
              estacionamiento
            </li>
            <li>
              Puede registrar la salida del visitante desde la lista principal
            </li>
          </ul>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
}

export default VisitanteCrear;
