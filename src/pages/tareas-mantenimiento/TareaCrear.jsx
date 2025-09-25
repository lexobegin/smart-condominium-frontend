import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { createCategoriaMantenimiento } from "../../services/categorias-mantenimiento";
import { listarCondominios } from "../../services/condominios"; // Debes tener este servicio
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

function Crear() {
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
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
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createCategoriaMantenimiento(form);
      navigate("/categorias-mantenimiento");
    } catch (err) {
      console.error("Error al crear una categoria de mantenimiento:", err);
      alert("Ocurrió un error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <h2>Nueva Categoria de Mantenimiento</h2>
      <br />
      <Form onSubmit={handleSubmit} >
        {/* Línea 1: Nombre */}
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </Form.Group>
        {/* Línea 2: Descripción */}
          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              required
            />
          </Form.Group>

        {/* Línea 3:Condominio */}
          <Form.Group className="mb-3">
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

        <Button variant="primary" type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>{" "}
        <Button variant="secondary" onClick={() => navigate("/categorias-mantenimiento")}>
          Cancelar
        </Button>
      </Form>
    </DashboardLayout>
  );
}

export default Crear;
