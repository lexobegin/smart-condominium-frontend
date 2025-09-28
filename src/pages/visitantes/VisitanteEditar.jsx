import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner, Alert, Card } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchVisitante,
  updateVisitante,
  MOTIVOS_VISITA,
} from "../../services/visitantes";
import { listarResidentes } from "../../services/users";
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

function VisitanteEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    documento_identidad: "",
    telefono: "",
    motivo_visita: "visita_familiar",
    anfitrion: "",
    placa_vehiculo: "",
    fecha_entrada: "",
  });

  const [residentes, setResidentes] = useState([]);
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
      const [visitanteData, residentesData] = await Promise.all([
        fetchVisitante(id),
        listarResidentes().catch(() => ({ results: [] })),
      ]);

      console.log("Datos del visitante:", visitanteData);

      // Formatear fecha para el input datetime-local
      const fechaEntrada = visitanteData.fecha_entrada
        ? new Date(visitanteData.fecha_entrada).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16);

      setForm({
        nombre: visitanteData.nombre || "",
        documento_identidad: visitanteData.documento_identidad || "",
        telefono: visitanteData.telefono || "",
        motivo_visita: visitanteData.motivo_visita || "visita_familiar",
        anfitrion: visitanteData.anfitrion?.id?.toString() || "",
        placa_vehiculo: visitanteData.placa_vehiculo || "",
        fecha_entrada: fechaEntrada,
      });

      setResidentes(residentesData.results || residentesData || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos del visitante");
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

      console.log("Actualizando visitante:", payload);
      await updateVisitante(id, payload);

      navigate("/visitantes");
    } catch (err) {
      console.error("Error actualizando visitante:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Error al actualizar el visitante";
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
          <p>Cargando datos del visitante...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex align-items-center mb-4">
        <FaUserFriends className="me-2 text-success" size={30} />
        <h2 className="mb-0">Editar Visitante</h2>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body className="bg-light">
          <small>
            <strong>ID del Visitante:</strong> {id} |
            <strong> Fecha de Registro:</strong>{" "}
            {new Date().toLocaleDateString()}
          </small>
        </Card.Body>
      </Card>

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
                maxLength={15}
              />
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
            {saving ? "Guardando..." : "Guardar Cambios"}
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
    </DashboardLayout>
  );
}

export default VisitanteEditar;
