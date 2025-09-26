import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  fetchMantenimientoPreventivo,
  updateMantenimientoPreventivo,
} from "../../services/mantenimiento-preventivo";
import { fetchCategoriasMantenimientos } from "../../services/categorias-mantenimiento";
import { fetchAreasComunes } from "../../services/areas-comunes";
import { fetchUsers } from "../../services/users";

function EditarMantenimiento() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);

  // Cargar datos existentes y listas para selects
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [mantenimiento, cats, areasData, users] = await Promise.all([
          fetchMantenimientoPreventivo(id),
          fetchCategoriasMantenimientos(),
          fetchAreasComunes(),
          fetchUsers(),
        ]);

        setCategorias(cats.results || cats);
        setAreas(areasData.results || areasData);
        setUsuarios(users.results || users);

        // Prellenar form con los valores actuales del mantenimiento
        setForm({
          descripcion: mantenimiento.descripcion || "",
          periodicidad_dias: mantenimiento.periodicidad_dias || "",
          responsable: mantenimiento.responsable || null,
          area_comun: mantenimiento.area_comun || null,
          categoria_mantenimiento: mantenimiento.categoria_mantenimiento || null,
        });
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("No se pudo cargar la información del mantenimiento.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Manejador para inputs normales
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Manejador para selects con react-select
  const handleSelectChange = (field) => (selected) => {
    setForm((prev) => ({
      ...prev,
      [field]: selected ? selected.value : null,
    }));
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMantenimientoPreventivo(id, form);
      alert("Mantenimiento preventivo actualizado correctamente");
      navigate("/mantenimientos-preventivos");
    } catch (err) {
      console.error("Error actualizando mantenimiento preventivo:", err);
      alert("No se pudo actualizar el mantenimiento preventivo");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return (
    <DashboardLayout>
      <Spinner animation="border" />
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <h2>Editar Mantenimiento Preventivo</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* Descripción */}
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Periodicidad */}
        <Form.Group className="mb-3">
          <Form.Label>Periodicidad (días)</Form.Label>
          <Form.Control
            type="number"
            name="periodicidad_dias"
            value={form.periodicidad_dias}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Responsable */}
        <Form.Group className="mb-3">
          <Form.Label>Responsable</Form.Label>
          <Select
            options={usuarios.map((u) => ({
              value: u.id,
              label: `${u.nombre} ${u.apellidos}`,
            }))}
            value={
              form.responsable
                ? {
                    value: form.responsable,
                    label:
                      usuarios.find((u) => u.id === form.responsable)?.nombre +
                      " " +
                      usuarios.find((u) => u.id === form.responsable)?.apellidos || "",
                  }
                : null
            }
            onChange={handleSelectChange("responsable")}
            placeholder="Seleccione un responsable..."
            isSearchable
            menuPlacement="auto"
          />
        </Form.Group>

        {/* Área Común */}
        <Form.Group className="mb-3">
          <Form.Label>Área Común</Form.Label>
          <Select
            options={areas.map((a) => ({ value: a.id, label: a.nombre }))}
            value={
              form.area_comun
                ? {
                    value: form.area_comun,
                    label: areas.find((a) => a.id === form.area_comun)?.nombre || "",
                  }
                : null
            }
            onChange={handleSelectChange("area_comun")}
            placeholder="Seleccione un área común..."
            isSearchable
            menuPlacement="auto"
          />
        </Form.Group>

        {/* Categoría */}
        <Form.Group className="mb-3">
          <Form.Label>Categoría de Mantenimiento</Form.Label>
          <Select
            options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
            value={
              form.categoria_mantenimiento
                ? {
                    value: form.categoria_mantenimiento,
                    label:
                      categorias.find((c) => c.id === form.categoria_mantenimiento)?.nombre || "",
                  }
                : null
            }
            onChange={handleSelectChange("categoria_mantenimiento")}
            placeholder="Seleccione una categoría..."
            isSearchable
            menuPlacement="auto"
          />
        </Form.Group>

        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>{" "}
        <Button
          variant="secondary"
          onClick={() => navigate("/mantenimientos-preventivos")}
        >
          Cancelar
        </Button>
      </Form>
    </DashboardLayout>
  );
}

export default EditarMantenimiento;
