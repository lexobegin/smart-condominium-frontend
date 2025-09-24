import React, { useEffect, useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { fetchAreaComun, updateAreaComun } from "../../services/areas-comunes";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate, useParams } from "react-router-dom";

function Editar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const data = await fetchAreaComun(id);
      setForm({
        ...data,
        condominio_id: data.condominio.id,
      });
    } catch (err) {
      console.error("Error al cargar área común:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateAreaComun(id, form);
      navigate("/areas-comunes");
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Error al actualizar el área común");
    } finally {
      setSaving(false);
    }
  };

  if (!form)
    return (
      <DashboardLayout>
        <Spinner animation="border" />
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <h2>Editar Área Común</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </Form.Group>
        {/* Resto igual a Crear.jsx */}
        {/* Puedes reutilizar el mismo formulario si lo separas en un componente FormAreaComun */}
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>{" "}
        <Button variant="secondary" onClick={() => navigate("/areas-comunes")}>
          Cancelar
        </Button>
      </Form>
    </DashboardLayout>
  );
}

export default Editar;
