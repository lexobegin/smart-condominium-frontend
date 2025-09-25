import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { createAreaComun } from "../../services/areas-comunes";
import { listarCondominios } from "../../services/condominios"; // Debes tener este servicio
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

function Crear() {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    capacidad: "",
    horario_apertura: "",
    horario_cierre: "",
    precio_por_hora: "",
    reglas_uso: "",
    requiere_aprobacion: true,
    condominio: "",
  });

  const [saving, setSaving] = useState(false);
  const [condominios, setCondominios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCondominios();
  }, []);

  const loadCondominios = async () => {
    try {
      const data = await listarCondominios(); // Debe retornar lista de condominios
      setCondominios(data.results || data); // Ajusta según el formato
    } catch (err) {
      console.error("Error cargando condominios:", err);
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

    setForm((prevForm) => ({
      ...prevForm,
      [name]: newValue,
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

      delete payload.condominio; // Eliminar campo no usado por el backend

      console.log("Payload final corregido:", payload);

      await createAreaComun(payload);
      navigate("/areas-comunes");
    } catch (err) {
      console.error("Error al crear área común:", err);
      console.error("Respuesta del backend:", err.response?.data);
      alert("Ocurrió un error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <h2>Nueva Área Común</h2>
      <Form onSubmit={handleSubmit}>
        {/* Línea 1: Nombre y Descripción */}
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
                required
              />
            </Form.Group>
          </Col>
        </Row>
        {/* Línea 2: Capacidad, Horario Apertura, Horario Cierre */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Capacidad</Form.Label>
              <Form.Control
                name="capacidad"
                type="number"
                min="0"
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
        {/* Línea 3: Precio por Hora y Reglas de Uso */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Precio por hora</Form.Label>
              <Form.Control
                name="precio_por_hora"
                type="number"
                step="0.01"
                min="0"
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
                required
              />
            </Form.Group>
          </Col>
        </Row>
        {/* Línea 4: Requiere Aprobación y Condominio */}
        <Row className="mb-4">
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
          <Col md={6} className="d-flex align-items-end">
            <Form.Group className="ms-2">
              <Form.Check
                type="switch"
                id="requiere_aprobacion"
                label="Requiere aprobación"
                name="requiere_aprobacion"
                checked={form.requiere_aprobacion}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>{" "}
        <Button variant="secondary" onClick={() => navigate("/areas-comunes")}>
          Cancelar
        </Button>
      </Form>
    </DashboardLayout>
  );
}

export default Crear;
