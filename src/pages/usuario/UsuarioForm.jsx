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
    // solo creación:
    ci: "",
    password: "",
  });

  // edición: cambiar contraseña (opcional)
  const [changePwd, setChangePwd] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // si viene id, es edición

  useEffect(() => {
    if (id) {
      loadUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await fetchUser(id);
      setForm((prev) => ({
        ...prev,
        nombre: data.nombre || "",
        apellidos: data.apellidos || "",
        email: data.email || "",
        tipo: data.tipo || "",
        estado: data.estado || "",
        ci: data.ci || "",
        password: "", // nunca rellenamos password
      }));
      setChangePwd(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Error cargando usuario:", err);
      alert("No se pudo cargar el usuario");
      navigate("/usuarios");
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

    // Validaciones mínimas
    if (!id) {
      // Crear
      if (!form.password || !form.ci) {
        alert("CI y contraseña son obligatorios para crear un usuario.");
        return;
      }
    } else {
      // Editar con cambio de contraseña
      if (changePwd) {
        if (!newPassword) {
          alert("Ingrese la nueva contraseña.");
          return;
        }
        if (newPassword !== confirmPassword) {
          alert("La confirmación de contraseña no coincide.");
          return;
        }
      }
    }

    try {
      setSaving(true);

      if (id) {
        // UPDATE: enviar solo campos editables; email sigue read_only
        const payload = {
          nombre: form.nombre,
          apellidos: form.apellidos,
          tipo: form.tipo,
          estado: form.estado,
          // si quieres permitir cambiar CI en edición, descomenta:
          // ci: form.ci,
          ...(changePwd && newPassword ? { password: newPassword } : {}),
        };
        await updateUser(id, payload); // PATCH
      } else {
        // CREATE: backend exige password y ci
        const payload = {
          nombre: form.nombre,
          apellidos: form.apellidos,
          email: form.email,
          tipo: form.tipo,
          estado: form.estado,
          ci: form.ci,
          password: form.password,
        };
        await createUser(payload);
      }

      navigate("/usuarios");
    } catch (err) {
      console.error("Error guardando:", err);
      const data = err?.response?.data;

      if (data && typeof data === "object") {
        const msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
          .join("\n");
        alert(`Error guardando usuario:\n${msg}`);
      } else {
        alert("Error guardando usuario");
      }
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
        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              autoFocus
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
              disabled={!!id} // deshabilitado en edición (read_only en backend)
            />
          </Form.Group>

          {/* Campos para CREAR */}
          {!id && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>CI</Form.Label>
                <Form.Control
                  name="ci"
                  value={form.ci}
                  onChange={handleChange}
                  required
                  placeholder="Documento de identidad"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Mínimo recomendado 8 caracteres"
                />
              </Form.Group>
            </>
          )}

          {/* Opcional: cambio de contraseña en EDICIÓN */}
          {!!id && (
            <>
              <Form.Check
                className="form-switch mb-3"
                type="switch"
                id="changePwdSwitch"
                label="Cambiar contraseña"
                checked={changePwd}
                onChange={(e) => {
                  setChangePwd(e.target.checked);
                  if (!e.target.checked) {
                    setNewPassword("");
                    setConfirmPassword("");
                  }
                }}
              />

              {changePwd && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Nueva contraseña</Form.Label>
                    <Form.Control
                      name="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ingresa la nueva contraseña"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirmar contraseña</Form.Label>
                    <Form.Control
                      name="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      required
                      isInvalid={confirmPassword && newPassword !== confirmPassword}
                    />
                    <Form.Control.Feedback type="invalid">
                      Las contraseñas no coinciden.
                    </Form.Control.Feedback>
                  </Form.Group>
                </>
              )}
            </>
          )}

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

          <Form.Group className="mb-4">
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
          <Button
            variant="secondary"
            onClick={() => navigate("/usuarios")}
            disabled={saving}
          >
            Cancelar
          </Button>
        </Form>
      )}
    </DashboardLayout>
  );
}

export default UsuarioForm;
