import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAreaComun, updateAreaComun } from "../../services/areas-comunes";
import { listarCondominios } from "../../services/condominios";
import DashboardLayout from "../../components/DashboardLayout";

function Editar() {
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
        condominio: area.condominio?.id || "", //aseguramos id
      });

      setCondominios(condoData.results || condoData);
    } catch (err) {
      console.error("Error cargando datos:", err);
      alert("Ocurrió un error al cargar los datos.");
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
    try {
      setSaving(true);

      const payload = {
        ...form,
        capacidad: parseInt(form.capacidad, 10),
        precio_por_hora: parseFloat(form.precio_por_hora),
        condominio_id: parseInt(form.condominio, 10),
      };

      delete payload.condominio; // eliminar campo no necesario

      await updateAreaComun(id, payload);
      navigate("/areas-comunes");
    } catch (err) {
      console.error("Error al actualizar área común:", err);
      console.error("Respuesta del backend:", err.response?.data);
      alert("Ocurrió un error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner animation="border" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h2>Editar Área Común</h2>
      <Form onSubmit={handleSubmit}>
        {/* Línea 1 */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
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
        {/* Línea 2 */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Capacidad</Form.Label>
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
              <Form.Label>Horario Apertura</Form.Label>
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
              <Form.Label>Horario Cierre</Form.Label>
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
        {/* Línea 3 */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Precio por hora</Form.Label>
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
        {/* Línea 4 */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Condominio</Form.Label>
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
        <Button variant="primary" type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>{" "}
        <Button variant="secondary" onClick={() => navigate("/areas-comunes")}>
          Cancelar
        </Button>
      </Form>
    </DashboardLayout>
  );
}

export default Editar;
