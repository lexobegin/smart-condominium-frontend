import React, { useState, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import Select from "react-select";
import { createMantenimientoPreventivo } from "../../services/mantenimiento-preventivo";
import { fetchCategoriasMantenimientos } from "../../services/categorias-mantenimiento";
import { fetchAreasComunes } from "../../services/areas-comunes";
import { fetchUsers } from "../../services/users";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";

function CrearMantenimiento() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    descripcion: "",
    periodicidad_dias: "",
    responsable: "",
    area_comun: "",
    categoria_mantenimiento: "",
  });

  const [categorias, setCategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [cats, areasData, users] = await Promise.all([
          fetchCategoriasMantenimientos(),
          fetchAreasComunes(),
          fetchUsers(),
        ]);
        setCategorias(cats.results || cats);
        setAreas(areasData.results || areasData);
        setUsuarios(users.results || users);
      } catch (err) {
        console.error("Error cargando datos para crear mantenimiento:", err);
        alert("No se pudieron cargar los datos para el formulario.");
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createMantenimientoPreventivo(form);
      alert("Mantenimiento preventivo creado exitosamente");
      navigate("/mantenimientos-preventivos");
    } catch (err) {
      console.error("Error creando mantenimiento preventivo:", err);
      alert("No se pudo crear el mantenimiento preventivo");
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) return <DashboardLayout><Spinner animation="border" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h2>Crear Mantenimiento Preventivo</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            required
          />
        </Form.Group>

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

        <Form.Group className="mb-3">
          <Form.Label>Responsable</Form.Label>
          <Select
            options={usuarios.map((u) => ({
              value: u.id,
              label: `${u.nombre} ${u.apellidos}`,
            }))}
            value={
              usuarios.find((u) => u.id === form.responsable)
                ? {
                    value: form.responsable,
                    label: `${usuarios.find((u) => u.id === form.responsable).nombre} ${usuarios.find((u) => u.id === form.responsable).apellidos}`,
                  }
                : null
            }
            onChange={(selected) =>
              setForm((prev) => ({ ...prev, responsable: selected.value }))
            }
            placeholder="Seleccione un usuario..."
            isSearchable
            menuPlacement="auto"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Área Común</Form.Label>
          <Select
            options={areas.map((a) => ({ value: a.id, label: a.nombre }))}
            value={
              areas.find((a) => a.id === form.area_comun)
                ? { value: form.area_comun, label: areas.find((a) => a.id === form.area_comun).nombre }
                : null
            }
            onChange={(selected) =>
              setForm((prev) => ({ ...prev, area_comun: selected.value }))
            }
            placeholder="Seleccione un área común..."
            isSearchable
            menuPlacement="auto"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Categoría de Mantenimiento</Form.Label>
          <Select
            options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
            value={
              categorias.find((c) => c.id === form.categoria_mantenimiento)
                ? { value: form.categoria_mantenimiento, label: categorias.find((c) => c.id === form.categoria_mantenimiento).nombre }
                : null
            }
            onChange={(selected) =>
              setForm((prev) => ({ ...prev, categoria_mantenimiento: selected.value }))
            }
            placeholder="Seleccione una categoría..."
            isSearchable
            menuPlacement="auto"
          />
        </Form.Group>

        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Crear"}
        </Button>{" "}
        <Button variant="secondary" onClick={() => navigate("/mantenimientos-preventivos")}>
          Cancelar
        </Button>
      </Form>
    </DashboardLayout>
  );
}

export default CrearMantenimiento;
