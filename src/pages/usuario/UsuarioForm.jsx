import React, { useState, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { createUser, fetchUser, updateUser } from "../../services/users";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate, useParams } from "react-router-dom";

function UsuarioForm() {
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    tipo: "",
    estado: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // si viene id, es edición

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await fetchUser(id);
      setForm({
        nombre: data.nombre,
        apellidos: data.apellidos,
        email: data.email,
        tipo: data.tipo,
        estado: data.estado,
      });
    } catch (err) {
      console.error("Error cargando usuario:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (id) {
        await updateUser(id, form);
      } else {
        await createUser(form);
      }
      navigate("/usuarios");
    } catch (err) {
      console.error("Error guardando:", err);
      alert("Error salvando usuario");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <h2>{id ? "Editar Usuario" : "Nuevo Usuario"}</h2>
      {loading ? (
        <Spinner animation="border" />
      ) : (
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
          <Form.Group className="mb-3">
            <Form.Label>Apellidos</Form.Label>
            <Form.Control
              name="apellidos"
              value={form.apellidos}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione</option>
              <option value="residente">Residente</option>
              <option value="administrador">Administrador</option>
              <option value="seguridad">Seguridad</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="propietario">Propietario</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="pendiente">Pendiente</option>
            </Form.Select>
          </Form.Group>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>{" "}
          <Button variant="secondary" onClick={() => navigate("/usuarios")}>
            Cancelar
          </Button>
        </Form>
      )}
    </DashboardLayout>
  );
}

export default UsuarioForm;
