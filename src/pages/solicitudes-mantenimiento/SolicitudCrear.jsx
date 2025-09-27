import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { createSolicitudMantenimiento } from "../../services/solicitudes-mantenimiento";
import { fetchCategoriasMantenimientos } from "../../services/categorias-mantenimiento";
import { fetchAreasComunes } from "../../services/areas-comunes";
import { fetchUsers } from "../../services/users";
import { fetchUnidades } from "../../services/unidades";

function CrearSolicitud() {
const navigate = useNavigate();

const [form, setForm] = useState({
titulo: "",
descripcion: "",
prioridad: "",
estado: "",
fecha_reporte: "",
fecha_limite: "",
categoria_mantenimiento: null,
usuario_reporta: null,
area_comun: null,
unidad_habitacional: null,
});

const [saving, setSaving] = useState(false);
const [categorias, setCategorias] = useState([]);
const [areas, setAreas] = useState([]);
const [usuarios, setUsuarios] = useState([]);
const [unidades, setUnidades] = useState([]);
const [error, setError] = useState(null);

// Cargar listas
useEffect(() => {
const loadData = async () => {
try {
const [cats, areasData, users, units] = await Promise.all([
fetchCategoriasMantenimientos(),
fetchAreasComunes(),
fetchUsers(),
fetchUnidades(),
]);

    setCategorias(cats.results || cats);
    setAreas(areasData.results || areasData);
    setUsuarios(users.results || users);
    setUnidades(units.results || units);
  } catch (err) {
    console.error("Error cargando listas:", err);
    setError("No se pudieron cargar los datos necesarios.");
  }
};

loadData();


}, []);

// Inputs normales
const handleChange = (e) => {
const { name, value } = e.target;
setForm((prev) => ({ ...prev, [name]: value }));
};

// Selects
const handleSelectChange = (field) => (selected) => {
setForm((prev) => ({
...prev,
[field]: selected ? selected.value : null,
}));
};

// Guardar nueva solicitud
const handleSubmit = async (e) => {
e.preventDefault();
setSaving(true);
try {
await createSolicitudMantenimiento(form);
alert("Solicitud de mantenimiento creada correctamente");
navigate("/solicitud-mantenimiento");
} catch (err) {
console.error("Error creando solicitud:", err);
alert("No se pudo crear la solicitud de mantenimiento");
} finally {
setSaving(false);
}
};

return (

<DashboardLayout>
      <h2>Crear Solicitud de Mantenimiento</h2>

  {error && <Alert variant="danger">{error}</Alert>}

  <Form onSubmit={handleSubmit}>
    {/* Titulo */}
    <Form.Group className="mb-3">
      <Form.Label>Título</Form.Label>
      <Form.Control
        name="titulo"
        value={form.titulo}
        onChange={handleChange}
        required
      />
    </Form.Group>

    {/* Descripción */}
    <Form.Group className="mb-3">
      <Form.Label>Descripción</Form.Label>
      <Form.Control
        as="textarea"
        rows={3}
        name="descripcion"
        value={form.descripcion}
        onChange={handleChange}
        required
      />
    </Form.Group>

    {/* Prioridad */}
    <Form.Group className="mb-3">
      <Form.Label>Prioridad</Form.Label>
      <Form.Select
        name="prioridad"
        value={form.prioridad}
        onChange={handleChange}
        required
      >
        <option value="">Seleccione prioridad</option>
        <option value="baja">Baja</option>
        <option value="media">Media</option>
        <option value="alta">Alta</option>
      </Form.Select>
    </Form.Group>

    {/* Estado */}
    <Form.Group className="mb-3">
      <Form.Label>Estado</Form.Label>
      <Form.Select
        name="estado"
        value={form.estado}
        onChange={handleChange}
        required
      >
        <option value="">Seleccione estado</option>
        <option value="pendiente">Pendiente</option>
        <option value="en_progreso">En Progreso</option>
        <option value="finalizado">Finalizado</option>
      </Form.Select>
    </Form.Group>

    {/* Fechas */}
    <Form.Group className="mb-3">
      <Form.Label>Fecha Reporte</Form.Label>
      <Form.Control
        type="date"
        name="fecha_reporte"
        value={form.fecha_reporte}
        onChange={handleChange}
        required
      />
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Fecha Límite</Form.Label>
      <Form.Control
        type="date"
        name="fecha_limite"
        value={form.fecha_limite}
        onChange={handleChange}
        required
      />
    </Form.Group>

    {/* Categoria */}
    <Form.Group className="mb-3">
      <Form.Label>Categoría de Mantenimiento</Form.Label>
      <Select
        options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
        value={
          form.categoria_mantenimiento
            ? {
                value: form.categoria_mantenimiento,
                label:
                  categorias.find((c) => c.id === form.categoria_mantenimiento)
                    ?.nombre || "",
              }
            : null
        }
        onChange={handleSelectChange("categoria_mantenimiento")}
        placeholder="Seleccione una categoría..."
        isSearchable
      />
    </Form.Group>

    {/* Usuario Reporta */}
    <Form.Group className="mb-3">
      <Form.Label>Usuario que Reporta</Form.Label>
      <Select
        options={usuarios.map((u) => ({
          value: u.id,
          label: `${u.nombre} ${u.apellidos}`,
        }))}
        value={
          form.usuario_reporta
            ? {
                value: form.usuario_reporta,
                label:
                  usuarios.find((u) => u.id === form.usuario_reporta)?.nombre +
                    " " +
                    usuarios.find((u) => u.id === form.usuario_reporta)
                      ?.apellidos || "",
              }
            : null
        }
        onChange={handleSelectChange("usuario_reporta")}
        placeholder="Seleccione un usuario..."
        isSearchable
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
                label:
                  areas.find((a) => a.id === form.area_comun)?.nombre || "",
              }
            : null
        }
        onChange={handleSelectChange("area_comun")}
        placeholder="Seleccione un área común..."
        isSearchable
      />
    </Form.Group>

    {/* Unidad Habitacional */}
    <Form.Group className="mb-3">
      <Form.Label>Unidad Habitacional</Form.Label>
      <Select
        options={unidades.map((u) => ({ value: u.id, label: u.nombre }))}
        value={
          form.unidad_habitacional
            ? {
                value: form.unidad_habitacional,
                label:
                  unidades.find((u) => u.id === form.unidad_habitacional)
                    ?.nombre || "",
              }
            : null
        }
        onChange={handleSelectChange("unidad_habitacional")}
        placeholder="Seleccione una unidad..."
        isSearchable
      />
    </Form.Group>

    {/* Botones */}
    <Button type="submit" disabled={saving}>
      {saving ? "Guardando..." : "Crear"}
    </Button>{" "}
    <Button variant="secondary" onClick={() => navigate("/solicitud-mantenimiento")}>
      Cancelar
    </Button>
  </Form>
</DashboardLayout>


);
}

export default CrearSolicitud;