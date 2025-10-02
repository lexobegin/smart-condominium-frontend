import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner, Alert, Card } from "react-bootstrap";
import {
  createUsuario,
  TIPOS_USUARIO,
  GENEROS,
  ESTADOS_USUARIO,
} from "../../services/usuarios";
import { listarCondominios } from "../../services/condominios";
import { listarUnidades } from "../../services/unidades";
import { useNavigate } from "react-router-dom";
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

function UsuarioCrear() {
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadDatos();
  }, []);

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

  const loadDatos = async () => {
    try {
      setLoading(true);
      // Cargar condominios y unidades en paralelo
      const [condominiosData, unidadesData] = await Promise.all([
        listarCondominios().catch(() => ({ results: [] })),
        listarUnidades().catch(() => ({ results: [] })),
      ]);

      setCondominios(condominiosData.results || condominiosData || []);
      setUnidades(unidadesData.results || unidadesData || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos necesarios");
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

  // Validar formato de CI (puede variar por país)
  const isValidCI = (ci) => {
    // Ejemplo básico - ajustar según requisitos del país
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

    if (!form.fecha_nacimiento) {
      setError("La fecha de nacimiento es obligatoria");
      return;
    }

    // Validar edad mínima (18 años)
    const fechaNacimiento = new Date(form.fecha_nacimiento);
    const hoy = new Date();

    // Calcular edad correctamente
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad = edad - 1; // ← Usamos asignación en lugar de decremento
    }

    if (edad < 18) {
      setError("El usuario debe ser mayor de 18 años");
      return;
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
        password: form.password,
      };

      // Solo agregar unidad si está seleccionada y el tipo es residente
      if (form.unidad && form.tipo === "residente") {
        payload.unidad_habitacional_id = parseInt(form.unidad, 10);
      }

      console.log("Creando usuario:", payload);
      await createUsuario(payload);

      navigate("/usuarios");
    } catch (err) {
      console.error("Error creando usuario:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Error al crear el usuario";
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
          <p>Cargando datos...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex align-items-center mb-4">
        <FaUser className="me-2 text-purple" size={30} />
        <h2 className="mb-0">Registrar Nuevo Usuario</h2>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

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
                placeholder="Ej: Juan"
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
                placeholder="Ej: Pérez García"
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
                placeholder="Ej: 12345678"
                required
                maxLength={12}
              />
              <Form.Text className="text-muted">
                Solo números, sin puntos ni guiones
              </Form.Text>
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
                placeholder="Ej: usuario@email.com"
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
                placeholder="Ej: +34 600 123 456"
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
              <Form.Text className="text-muted">
                Debe ser mayor de 18 años
              </Form.Text>
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
                <Form.Text className="text-muted">
                  Opcional - Para asignar unidad habitacional
                </Form.Text>
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
                <Form.Text className="text-muted">
                  {!form.condominio
                    ? "Seleccione un condominio primero"
                    : "Unidades disponibles en el condominio seleccionado"}
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        )}

        {/* Línea 6: Contraseñas */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Contraseña *</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
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
                required
              />
            </Form.Group>
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
            {saving ? "Registrando..." : "Registrar Usuario"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate("/usuarios-face")}
            className="d-flex align-items-center"
          >
            <FaTimes className="me-2" />
            Cancelar
          </Button>
        </div>
      </Form>

      {/* Información adicional */}
      <Card className="mt-4">
        <Card.Header>
          <strong>Tipos de Usuario y Permisos</strong>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>Tipos Disponibles:</h6>
              <ul className="small mb-0">
                <li>
                  <strong>Residente:</strong> Habitantes del condominio con
                  acceso a áreas comunes
                </li>
                <li>
                  <strong>Administrador:</strong> Gestión completa del sistema
                </li>
                <li>
                  <strong>Seguridad:</strong> Control de acceso y vigilancia
                </li>
                <li>
                  <strong>Mantenimiento:</strong> Personal de reparaciones y
                  limpieza
                </li>
                <li>
                  <strong>Portero:</strong> Control de ingreso y recepción
                </li>
              </ul>
            </Col>
            <Col md={6}>
              <h6>Información Importante:</h6>
              <ul className="small mb-0">
                <li>
                  Los residentes pueden ser asignados a unidades habitacionales
                </li>
                <li>
                  El registro facial se realiza después de crear el usuario
                </li>
                <li>La contraseña debe tener al menos 6 caracteres</li>
                <li>El usuario debe ser mayor de 18 años</li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
}

export default UsuarioCrear;
