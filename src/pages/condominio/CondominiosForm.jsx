import React, { useEffect, useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import {
  createCondominio,
  fetchCondominio,
  updateCondominio,
} from "../../services/condominios";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate, useParams } from "react-router-dom";

function CondominioForm() {
  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // cargar registro cuando hay id
  const [saving, setSaving] = useState(false);   // guardando (crear/editar)
  const navigate = useNavigate();
  const { id } = useParams(); // si viene id, es edición

  useEffect(() => {
    if (id) loadCondominio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCondominio = async () => {
    try {
      setLoading(true);
      const data = await fetchCondominio(id);
      setForm({
        nombre: data.nombre || "",
        direccion: data.direccion || "",
        telefono: data.telefono || "",
        email: data.email || "",
      });
    } catch (err) {
      console.error("Error cargando condominio:", err);
      alert("No se pudo cargar el condominio");
      navigate("/condominios");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  // Validación básica en front para feedback rápido
  const validate = () => {
    const newErrors = {};
    const nombre = form.nombre?.trim();
    const email = form.email?.trim();
    const telefono = form.telefono?.trim();

    if (!nombre) newErrors.nombre = "El nombre es obligatorio";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Correo inválido";
    if (telefono && telefono.length > 20)
      newErrors.telefono = "Máximo 20 caracteres";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      nombre: form.nombre.trim(),
      direccion: form.direccion?.trim() || "",
      telefono: form.telefono?.trim() || "",
      email: form.email?.trim() || "",
    };

    try {
      setSaving(true);
      if (id) {
        await updateCondominio(id, payload); // PUT o PATCH según tu servicio
      } else {
        await createCondominio(payload);
      }
      navigate("/condominios");
    } catch (err) {
      console.error("Error guardando:", err);
      // Si DRF devuelve errores de validación por campo:
      const backend = err?.response?.data;
      if (backend && typeof backend === "object") {
        const mapped = {};
        Object.entries(backend).forEach(([k, v]) => {
          // v puede ser array de mensajes
          mapped[k] = Array.isArray(v) ? v.join(" ") : String(v);
        });
        setErrors((prev) => ({ ...prev, ...mapped }));
      } else {
        alert("Error guardando condominio");
      }
    } finally {
      setSaving(false);
    }
  };

  const isBusy = loading || saving;

  return (
    <DashboardLayout>
      <h2>{id ? "Editar Condominio" : "Nuevo Condominio"}</h2>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              maxLength={255}
              disabled={isBusy}
              isInvalid={!!errors.nombre}
              placeholder="Ej: Condominio Las Palmas"
              autoFocus
            />
            <Form.Control.Feedback type="invalid">
              {errors.nombre}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              disabled={isBusy}
              placeholder="Calle, número, ciudad"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              disabled={isBusy}
              isInvalid={!!errors.telefono}
              placeholder="+591 70000000"
              maxLength={20}
            />
            <Form.Control.Feedback type="invalid">
              {errors.telefono}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Correo</Form.Label>
            <Form.Control
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={isBusy}
              isInvalid={!!errors.email}
              placeholder="admin@ejemplo.com"
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" disabled={isBusy}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>{" "}
          <Button
            variant="secondary"
            onClick={() => navigate("/condominios")}
            disabled={isBusy}
          >
            Cancelar
          </Button>
        </Form>
      )}
    </DashboardLayout>
  );
}

export default CondominioForm;
