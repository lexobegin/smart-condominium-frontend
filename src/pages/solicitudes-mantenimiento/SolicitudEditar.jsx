import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Alert, Row, Col } from "react-bootstrap";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  createSolicitudMantenimiento,
  fetchSolicitudMantenimiento,
  updateSolicitudMantenimiento,
} from "../../services/solicitudes-mantenimiento";
import { fetchCategoriasMantenimientos } from "../../services/categorias-mantenimiento";
import { fetchAreasComunes } from "../../services/areas-comunes";
import { fetchUsers } from "../../services/users";
import { fetchUnidades } from "../../services/unidades";

function FormularioSolicitud() {
  const navigate = useNavigate();
  const { id } = useParams(); // Si existe id, es edición
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [readonly, setReadonly] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "",
    estado: "pendiente",
    fecha_reporte: new Date().toISOString(),
    fecha_completado: "",
    fecha_limite: "",
    categoria_mantenimiento: null,
    usuario_reporta: null,
    creador_tipo: "",
    ubicacion_tipo: "",
    area_comun: null,
    unidad_habitacional: null,
  });

  const [categorias, setCategorias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [unidades, setUnidades] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
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

        const currentUser = JSON.parse(localStorage.getItem("currentUser"));

        if (id) {
          // Edición
          const solicitud = await fetchSolicitudMantenimiento(id);
          setForm({
            ...form,
            ...solicitud,
            creador_tipo: solicitud.creador_tipo || currentUser.tipo,
          });
          if (solicitud.estado === "completado") setReadonly(true);
        } else {
          // Creación
          setForm((prev) => ({
            ...prev,
            creador_tipo: currentUser.tipo,
          }));
        }
      } catch (err) {
        console.error(err);
        setError("Error cargando datos.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

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
      if (id) {
        await updateSolicitudMantenimiento(id, form);
      } else {
        await createSolicitudMantenimiento(form);
      }
      navigate("/solicitudes-mantenimientos");
    } catch (err) {
      console.error(err);
      setError("Error guardando la solicitud.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner animation="border" />;

  const selectedCategoria = categorias.find(c => c.id === form.categoria_mantenimiento);
  const selectedUsuario = usuarios.find(u => u.id === form.usuario_reporta);
  const selectedArea = areas.find(a => a.id === form.area_comun);
  const selectedUnidad = unidades.find(u => u.id === form.unidad_habitacional);

  return (
    <DashboardLayout>
      <h2>{id ? "Editar" : "Crear"} Solicitud de Mantenimiento</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {readonly && (
        <Alert variant="warning">
          Esta solicitud ya fue completada. Solo puede verse en modo lectura.
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Título */}
        <Form.Group className="mb-3">
          <Form.Label>Título</Form.Label>
          <Form.Control
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            required
            readOnly={readonly}
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
            readOnly={readonly}
          />
        </Form.Group>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Prioridad</Form.Label>
              <Form.Select
                name="prioridad"
                value={form.prioridad}
                onChange={handleChange}
                required
                disabled={readonly}
              >
                <option value="">Seleccione prioridad</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Estado</Form.Label>
              <Form.Control
                value={form.estado}
                readOnly
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Fecha Reporte</Form.Label>
              <Form.Control
                type="text"
                value={new Date(form.fecha_reporte).toLocaleString()}
                readOnly
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Fecha Límite</Form.Label>
              <Form.Control
                type="date"
                name="fecha_limite"
                value={form.fecha_limite}
                onChange={handleChange}
                required
                readOnly={readonly}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Fecha Completado</Form.Label>
              <Form.Control
                type="text"
                value={form.fecha_completado ? new Date(form.fecha_completado).toLocaleString() : "No completado"}
                readOnly
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Ubicación */}
        <Form.Group className="mb-3">
          <Form.Label>Tipo de Ubicación</Form.Label>
          <Form.Control
            value={form.ubicacion_tipo === "area_comun" ? "Área Común" : form.ubicacion_tipo === "unidad_habitacional" ? "Unidad Habitacional" : ""}
            readOnly
          />
        </Form.Group>

        {form.ubicacion_tipo === "area_comun" && (
          <Form.Group className="mb-3">
            <Form.Label>Área Común</Form.Label>
            <Form.Control value={selectedArea?.nombre || ""} readOnly />
          </Form.Group>
        )}

        {form.ubicacion_tipo === "unidad_habitacional" && (
          <Form.Group className="mb-3">
            <Form.Label>Unidad Habitacional</Form.Label>
            <Form.Control value={selectedUnidad?.nombre || ""} readOnly />
          </Form.Group>
        )}

        {/* Categoría */}
        <Form.Group className="mb-3">
          <Form.Label>Categoría de Mantenimiento</Form.Label>
          <Form.Control value={selectedCategoria?.nombre || ""} readOnly />
        </Form.Group>

        {/* Usuario que Reporta */}
        <Form.Group className="mb-3">
          <Form.Label>Usuario que Reporta</Form.Label>
          <Form.Control
            value={selectedUsuario ? `${selectedUsuario.nombre} ${selectedUsuario.apellidos}` : ""}
            readOnly
          />
        </Form.Group>

        {/* Creador Tipo */}
        <Form.Group className="mb-3">
          <Form.Label>Creador Tipo</Form.Label>
          <Form.Control value={form.creador_tipo} readOnly />
        </Form.Group>

        {!readonly && (
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        )}
        <Button variant="secondary" className="ms-2" onClick={() => navigate("/solicitudes-mantenimientos")}>
          Cancelar
        </Button>
      </Form>
    </DashboardLayout>
  );
}

export default FormularioSolicitud;
