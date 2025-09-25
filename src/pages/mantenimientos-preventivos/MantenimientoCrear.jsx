import React, { useState, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
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
          <Form.Select
            name="responsable"
            value={form.responsable}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un usuario</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre} {u.apellidos}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Área Común</Form.Label>
          <Form.Select
            name="area_comun"
            value={form.area_comun}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un área común</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Categoría de Mantenimiento</Form.Label>
          <Form.Select
            name="categoria_mantenimiento"
            value={form.categoria_mantenimiento}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Form.Select>
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
