import React, { useEffect, useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import {
  createUnidad,
  fetchUnidad,
  updateUnidad,
} from "../../services/unidades";
import { fetchCondominios } from "../../services/condominios";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate, useParams } from "react-router-dom";

const TIPO_CHOICES = [
  { value: "departamento", label: "Departamento" },
  { value: "casa", label: "Casa" },
  { value: "local", label: "Local" },
  { value: "oficina", label: "Oficina" },
];

const ESTADO_CHOICES = [
  { value: "ocupada", label: "Ocupada" },
  { value: "desocupada", label: "Desocupada" },
  { value: "en_construccion", label: "En construcción" },
];

export default function UnidadForm() {
  const [form, setForm] = useState({
    condominio: "",        // ID del condominio
    codigo: "",
    tipo: "",
    metros_cuadrados: "",
    estado: "",
  });
  const [condominios, setCondominios] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // cargar unidad
  const [saving, setSaving] = useState(false);   // guardando
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    loadCondominiosOptions();
    if (id) loadUnidad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCondominiosOptions = async () => {
    // Trae todas las páginas para el combo (hasta 50 por seguridad)
    try {
      let page = 1;
      let all = [];
      while (true) {
        const data = await fetchCondominios(page, "");
        all = all.concat(data.results || []);
        if (!data.next) break;
        page += 1;
        if (page > 50) break;
      }
      setCondominios(all);
    } catch (e) {
      console.error("No se pudieron cargar los condominios", e);
    }
  };

  const loadUnidad = async () => {
    try {
      setLoading(true);
      const data = await fetchUnidad(id);
      setForm({
        condominio: data.condominio?.id ?? data.condominio ?? "",
        codigo: data.codigo ?? "",
        tipo: data.tipo ?? "",
        metros_cuadrados: data.metros_cuadrados ?? "",
        estado: data.estado ?? "",
      });
    } catch (err) {
      console.error("Error cargando unidad:", err);
      alert("No se pudo cargar la unidad");
      navigate("/unidades");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  const validate = () => {
    const newErr = {};
    if (!String(form.condominio).trim()) newErr.condominio = "Seleccione un condominio";
    if (!form.codigo.trim()) newErr.codigo = "El código es obligatorio";
    if (!form.tipo) newErr.tipo = "Seleccione un tipo";
    if (!form.estado) newErr.estado = "Seleccione un estado";
    if (form.metros_cuadrados && isNaN(Number(form.metros_cuadrados))) {
      newErr.metros_cuadrados = "Debe ser numérico";
    }
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // DRF suele aceptar 'condominio' como ID entero
    const payload = {
      condominio: Number(form.condominio),
      codigo: form.codigo.trim(),
      tipo: form.tipo,
      metros_cuadrados:
        form.metros_cuadrados === "" ? null : String(form.metros_cuadrados),
      estado: form.estado,
    };

    try {
      setSaving(true);
      if (id) {
        await updateUnidad(id, payload);
      } else {
        await createUnidad(payload);
      }
      navigate("/unidades");
    } catch (err) {
      console.error("Error guardando unidad:", err);
      const backend = err?.response?.data;
      if (backend && typeof backend === "object") {
        const mapped = {};
        Object.entries(backend).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v.join(" ") : String(v);
        });
        setErrors((p) => ({ ...p, ...mapped }));
      } else {
        alert("Error guardando unidad");
      }
    } finally {
      setSaving(false);
    }
  };

  const isBusy = loading || saving;

  return (
    <DashboardLayout>
      <h2>{id ? "Editar Unidad Habitacional" : "Nueva Unidad Habitacional"}</h2>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3">
            <Form.Label>Condominio</Form.Label>
            <Form.Select
              name="condominio"
              value={form.condominio}
              onChange={handleChange}
              disabled={isBusy}
              isInvalid={!!errors.condominio}
              required
            >
              <option value="">Seleccione</option>
              {condominios.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.condominio}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Código</Form.Label>
            <Form.Control
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              disabled={isBusy}
              isInvalid={!!errors.codigo}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.codigo}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              disabled={isBusy}
              isInvalid={!!errors.tipo}
              required
            >
              <option value="">Seleccione</option>
              {TIPO_CHOICES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.tipo}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Metros²</Form.Label>
            <Form.Control
              name="metros_cuadrados"
              type="number"
              step="0.01"
              value={form.metros_cuadrados}
              onChange={handleChange}
              disabled={isBusy}
              isInvalid={!!errors.metros_cuadrados}
              placeholder="Ej: 85.5"
            />
            <Form.Control.Feedback type="invalid">
              {errors.metros_cuadrados}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              disabled={isBusy}
              isInvalid={!!errors.estado}
              required
            >
              <option value="">Seleccione</option>
              {ESTADO_CHOICES.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.estado}
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" disabled={isBusy}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>{" "}
          <Button
            variant="secondary"
            onClick={() => navigate("/unidades")}
            disabled={isBusy}
          >
            Cancelar
          </Button>
        </Form>
      )}
    </DashboardLayout>
  );
}
