import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner, Alert, Card } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchUsuario,
  updateUsuario,
  TIPOS_USUARIO,
  GENEROS,
  ESTADOS_USUARIO,
} from "../../services/usuarios";
import { listarCondominios } from "../../services/condominios";
import { listarUnidades } from "../../services/unidades";
import DashboardLayout from "../../components/DashboardLayout";
import {
  FaUser,
  FaSave,
  FaTimes,
  FaIdCard,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaVenusMars,
  FaHome,
} from "react-icons/fa";

function UsuarioEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    ci: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
    genero: "M",
    tipo: "residente",
    estado: "activo",
    condominio: "",
    unidad: "",
    password: "",
    confirmPassword: "",
  });

  const [condominios, setCondominios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [unidadesFiltradas, setUnidadesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    // Filtrar unidades cuando se selecciona un condominio
    if (form.condominio) {
      const filtered = unidades.filter(
        (unidad) => unidad.condominio?.id === parseInt(form.condominio)
      );
      setUnidadesFiltradas(filtered);
    } else {
      setUnidadesFiltradas([]);
    }
  }, [form.condominio, unidades]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar datos en paralelo
      const [usuarioData, condominiosData, unidadesData] = await Promise.all([
        fetchUsuario(id),
        listarCondominios().catch(() => ({ results: [] })),
        listarUnidades().catch(() => ({ results: [] })),
      ]);

      console.log("Datos del usuario:", usuarioData);

      // Determinar condominio basado en la unidad actual del usuario
      const unidadActual = usuarioData.unidades_habitacionales?.[0];
      const condominioActual = unidadActual?.condominio_nombre
        ? condominiosData.results?.find(
            (c) => c.nombre === unidadActual.condominio_nombre
          )?.id
        : "";

      setForm({
        nombre: usuarioData.nombre || "",
        apellidos: usuarioData.apellidos || "",
        ci: usuarioData.ci || "",
        email: usuarioData.email || "",
        telefono: usuarioData.telefono || "",
        fecha_nacimiento: usuarioData.fecha_nacimiento
          ? usuarioData.fecha_nacimiento.split("T")[0]
          : "",
        genero: usuarioData.genero || "M",
        tipo: usuarioData.tipo || "residente",
        estado: usuarioData.estado || "activo",
        condominio: condominioActual || "",
        unidad: unidadActual?.id || "",
        password: "",
        confirmPassword: "",
      });

      setCondominios(condominiosData.results || condominiosData || []);
      setUnidades(unidadesData.results || unidadesData || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos del usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validar formato de email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar formato de CI
  const isValidCI = (ci) => {
    return ci.length >= 6 && ci.length <= 12 && /^\d+$/.test(ci);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (!form.apellidos.trim()) {
      setError("Los apellidos son obligatorios");
      return;
    }

    if (!form.ci.trim()) {
      setError("El documento de identidad es obligatorio");
      return;
    }

    if (!isValidCI(form.ci)) {
      setError(
        "El documento de identidad debe contener solo números y tener entre 6 y 12 dígitos"
      );
      return;
    }

    if (!form.email.trim()) {
      setError("El email es obligatorio");
      return;
    }

    if (!isValidEmail(form.email)) {
      setError("El formato del email no es válido");
      return;
    }

    if (!form.fecha_nacimiento) {
      setError("La fecha de nacimiento es obligatoria");
      return;
    }

    // Validar contraseña si se está cambiando
    if (changePassword) {
      if (!form.password) {
        setError("La contraseña es obligatoria");
        return;
      }

      if (form.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        nombre: form.nombre.trim(),
        apellidos: form.apellidos.trim(),
        ci: form.ci.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        fecha_nacimiento: form.fecha_nacimiento,
        genero: form.genero,
        tipo: form.tipo,
        estado: form.estado,
      };

      // Agregar contraseña solo si se está cambiando
      if (changePassword && form.password) {
        payload.password = form.password;
      }

      // Manejar unidad habitacional para residentes
      if (form.tipo === "residente" && form.unidad) {
        payload.unidad_habitacional_id = parseInt(form.unidad, 10);
      } else if (form.tipo !== "residente") {
        // Si no es residente, eliminar cualquier asignación de unidad
        payload.unidad_habitacional_id = null;
      }

      console.log("Actualizando usuario:", payload);
      await updateUsuario(id, payload);

      navigate("/usuarios");
    } catch (err) {
      console.error("Error actualizando usuario:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Error al actualizar el usuario";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <Spinner animation="border" />
          <p>Cargando datos del usuario...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex align-items-center mb-4">
        <FaUser className="me-2 text-purple" size={30} />
        <h2 className="mb-0">Editar Usuario</h2>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body className="bg-light">
          <small>
            <strong>ID del Usuario:</strong> {id} |
            <strong> Fecha de Registro:</strong>{" "}
            {new Date().toLocaleDateString()}
          </small>
        </Card.Body>
      </Card>

      <Form onSubmit={handleSubmit}>
        {/* Línea 1: Información Personal Básica */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <FaUser className="me-1" />
                Nombre *
              </Form.Label>
              <Form.Control
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                maxLength={50}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Apellidos *</Form.Label>
              <Form.Control
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 2: Documento y Contacto */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>
                <FaIdCard className="me-1" />
                Documento de Identidad *
              </Form.Label>
              <Form.Control
                name="ci"
                value={form.ci}
                onChange={handleChange}
                required
                maxLength={12}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>
                <FaEnvelope className="me-1" />
                Email *
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={150}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>
                <FaPhone className="me-1" />
                Teléfono
              </Form.Label>
              <Form.Control
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                maxLength={20}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 3: Fecha Nacimiento y Género */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <FaCalendar className="me-1" />
                Fecha de Nacimiento *
              </Form.Label>
              <Form.Control
                type="date"
                name="fecha_nacimiento"
                value={form.fecha_nacimiento}
                onChange={handleChange}
                required
                max={new Date().toISOString().split("T")[0]}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <FaVenusMars className="me-1" />
                Género *
              </Form.Label>
              <Form.Select
                name="genero"
                value={form.genero}
                onChange={handleChange}
                required
              >
                {GENEROS.map((genero) => (
                  <option key={genero.value} value={genero.value}>
                    {genero.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 4: Tipo y Estado */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Tipo de Usuario *</Form.Label>
              <Form.Select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                required
              >
                {TIPOS_USUARIO.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Estado *</Form.Label>
              <Form.Select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                required
              >
                {ESTADOS_USUARIO.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 5: Condominio y Unidad (solo para residentes) */}
        {form.tipo === "residente" && (
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  <FaHome className="me-1" />
                  Condominio
                </Form.Label>
                <Form.Select
                  name="condominio"
                  value={form.condominio}
                  onChange={handleChange}
                >
                  <option value="">Seleccione un condominio</option>
                  {condominios.map((condominio) => (
                    <option key={condominio.id} value={condominio.id}>
                      {condominio.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Unidad Habitacional</Form.Label>
                <Form.Select
                  name="unidad"
                  value={form.unidad}
                  onChange={handleChange}
                  disabled={!form.condominio}
                >
                  <option value="">Seleccione una unidad</option>
                  {unidadesFiltradas.map((unidad) => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.codigo} - {unidad.tipo_display}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        )}

        {/* Línea 6: Cambio de Contraseña */}
        <Row className="mb-4">
          <Col md={12}>
            <Card>
              <Card.Header>
                <Form.Check
                  type="switch"
                  id="change-password-switch"
                  label="Cambiar contraseña"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                />
              </Card.Header>
              {changePassword && (
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Nueva Contraseña *</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Mínimo 6 caracteres"
                          required={changePassword}
                          minLength={6}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Confirmar Contraseña *</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder="Repite la contraseña"
                          required={changePassword}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              )}
            </Card>
          </Col>
        </Row>

        {/* Botones de acción */}
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            type="submit"
            disabled={saving}
            className="d-flex align-items-center"
          >
            <FaSave className="me-2" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate("/usuarios")}
            className="d-flex align-items-center"
          >
            <FaTimes className="me-2" />
            Cancelar
          </Button>
        </div>
      </Form>
    </DashboardLayout>
  );
}

export default UsuarioEditar;
