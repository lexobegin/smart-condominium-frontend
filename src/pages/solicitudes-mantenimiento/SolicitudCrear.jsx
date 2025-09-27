import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
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
    fecha_limite: "",
    categoria_mantenimiento: null,
    usuario_reporta: null,
    ubicacion_tipo: "", 
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field) => (selected) => {
    setForm((prev) => ({ ...prev, [field]: selected ? selected.value : null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Capturar fecha y hora actuales y estado pendiente
      const usuarioSeleccionado = usuarios.find(u => u.id === form.usuario_reporta);
      const formToSend = {
        ...form,
        fecha_reporte: new Date().toISOString(),
        estado: "pendiente",
        creador_tipo: usuarioSeleccionado?.tipo || "Desconocido",
      };

      await createSolicitudMantenimiento(formToSend);
      navigate("/solicitudes-mantenimientos");
    } catch (err) {
      console.error("Error creando solicitud:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <h2>Crear Solicitud de Mantenimiento</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* Título */}
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
            rows={2}
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Prioridad y fecha liite */}
        <Row>
          <Col md={6}>
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
          </Col>
          <Col md={6}>
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
          </Col>
        </Row>

        {/* Selector de ubicación */}
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Ubicación</Form.Label>
              <Form.Select
                name="ubicacion_tipo"
                value={form.ubicacion_tipo}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione tipo</option>
                <option value="area_comun">Área Común</option>
                <option value="unidad_habitacional">Unidad Habitacional</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            {form.ubicacion_tipo === "area_comun" && (
              <Form.Group className="mb-3">
                <Form.Label>Área Común</Form.Label>
                <Select
                  options={areas.map((a) => ({ value: a.id, label: a.nombre }))}
                  value={
                    form.area_comun
                      ? { value: form.area_comun, label: areas.find((a) => a.id === form.area_comun)?.nombre || "" }
                      : null
                  }
                  onChange={handleSelectChange("area_comun")}
                  placeholder="Seleccione un área común..."
                  isSearchable
                />
              </Form.Group>
            )}

            {form.ubicacion_tipo === "unidad_habitacional" && (
              <Form.Group className="mb-3">
                <Form.Label>Unidad Habitacional</Form.Label>
                <Select
                  options={unidades.map((u) => ({ value: u.id, label: u.nombre }))}
                  value={
                    form.unidad_habitacional
                      ? { value: form.unidad_habitacional, label: unidades.find((u) => u.id === form.unidad_habitacional)?.nombre || "" }
                      : null
                  }
                  onChange={handleSelectChange("unidad_habitacional")}
                  placeholder="Seleccione una unidad..."
                  isSearchable
                />
              </Form.Group>
            )}
          </Col>
        </Row>


        {/* Categoría */}
        <Form.Group className="mb-3">
          <Form.Label>Categoría de Mantenimiento</Form.Label>
          <Select
            options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
            value={
              form.categoria_mantenimiento
                ? { value: form.categoria_mantenimiento, label: categorias.find((c) => c.id === form.categoria_mantenimiento)?.nombre || "" }
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
            options={usuarios.map((u) => ({ value: u.id, label: `${u.nombre} ${u.apellidos}` }))}
            value={
              form.usuario_reporta
                ? { value: form.usuario_reporta, label: `${usuarios.find((u) => u.id === form.usuario_reporta)?.nombre || ""} ${usuarios.find((u) => u.id === form.usuario_reporta)?.apellidos || ""}` }
                : null
            }
            onChange={handleSelectChange("usuario_reporta")}
            placeholder="Seleccione un usuario..."
            isSearchable
          />
        </Form.Group>

        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>{" "}
        <Button variant="secondary" onClick={() => navigate("/solicitudes-mantenimientos")}>
          Cancelar
        </Button>
      </Form>
    </DashboardLayout>
  );
}

export default CrearSolicitud;
