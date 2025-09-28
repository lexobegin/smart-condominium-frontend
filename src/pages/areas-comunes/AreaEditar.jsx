import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAreaComun, updateAreaComun } from "../../services/areas-comunes";
import { listarCondominios } from "../../services/condominios";
import DashboardLayout from "../../components/DashboardLayout";
import { FaMapMarkerAlt, FaSave, FaTimes } from "react-icons/fa";

function AreaEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    capacidad: "",
    horario_apertura: "",
    horario_cierre: "",
    precio_por_hora: "",
    reglas_uso: "",
    requiere_aprobacion: false,
    condominio: "",
  });
  const [condominios, setCondominios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [area, condoData] = await Promise.all([
        fetchAreaComun(id),
        listarCondominios(),
      ]);

      console.log("Detalle Area:", area);
      setForm({
        nombre: area.nombre,
        descripcion: area.descripcion || "",
        capacidad: area.capacidad || "",
        horario_apertura: area.horario_apertura || "",
        horario_cierre: area.horario_cierre || "",
        precio_por_hora: area.precio_por_hora || "",
        reglas_uso: area.reglas_uso || "",
        requiere_aprobacion: area.requiere_aprobacion,
        condominio: area.condominio?.id || "",
      });
      setCondominios(condoData.results || condoData);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Ocurrió un error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    // Validar que capacidad y precio no sean negativos
    if (
      (name === "capacidad" || name === "precio_por_hora") &&
      parseFloat(newValue) < 0
    ) {
      newValue = "0";
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        capacidad: parseInt(form.capacidad, 10),
        precio_por_hora: parseFloat(form.precio_por_hora),
        condominio_id: parseInt(form.condominio, 10),
      };
      delete payload.condominio;

      console.log("Actualizando área común:", payload);
      await updateAreaComun(id, payload);
      navigate("/areas-comunes");
    } catch (err) {
      console.error("Error al actualizar área común:", err);
      console.error("Respuesta del backend:", err.response?.data);
      setError("Ocurrió un error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <Spinner animation="border" />
          <p>Cargando datos del área común...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex align-items-center mb-4">
        <FaMapMarkerAlt className="me-2 text-primary" size={30} />
        <h2 className="mb-0">Editar Área Común</h2>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Línea 1: Nombre y Descripción */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 2: Capacidad, Horario Apertura, Horario Cierre */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Capacidad *</Form.Label>
              <Form.Control
                name="capacidad"
                type="number"
                min={0}
                value={form.capacidad}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Horario Apertura *</Form.Label>
              <Form.Control
                name="horario_apertura"
                type="time"
                value={form.horario_apertura}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Horario Cierre *</Form.Label>
              <Form.Control
                name="horario_cierre"
                type="time"
                value={form.horario_cierre}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 3: Precio por Hora y Reglas de Uso */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Precio por hora *</Form.Label>
              <Form.Control
                name="precio_por_hora"
                type="number"
                step="0.01"
                min={0}
                value={form.precio_por_hora}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={8}>
            <Form.Group>
              <Form.Label>Reglas de uso</Form.Label>
              <Form.Control
                name="reglas_uso"
                value={form.reglas_uso}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 4: Requiere Aprobación y Condominio */}
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
          <Col md={6} className="d-flex align-items-center">
            <Form.Group>
              <Form.Check
                type="switch"
                id="requiere-aprobacion-switch"
                label="Requiere aprobación"
                name="requiere_aprobacion"
                checked={form.requiere_aprobacion}
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
            onClick={() => navigate("/areas-comunes")}
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

export default AreaEditar;
