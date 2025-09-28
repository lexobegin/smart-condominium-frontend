import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner, Alert, Card } from "react-bootstrap";
import {
  createRegistroAcceso,
  TIPOS_ACCESO,
  DIRECCIONES,
  METODOS_ACCESO,
} from "../../services/acceso";
import { listarUsers } from "../../services/users";
import { listarVehiculos } from "../../services/vehiculos"; // Asumimos este servicio
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  FaDoorOpen,
  FaSave,
  FaTimes,
  FaUser,
  FaCar,
  FaCamera,
  FaIdCard,
} from "react-icons/fa";

function AccesoCrear() {
  const [form, setForm] = useState({
    usuario: "",
    vehiculo: "",
    tipo: "peatonal",
    direccion: "entrada",
    metodo: "manual",
    fecha_hora: new Date().toISOString().slice(0, 16),
    reconocimiento_exitoso: true,
    confidence_score: "",
    foto_evidencia: null,
  });

  const [usuarios, setUsuarios] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadDatos();
  }, []);

  const loadDatos = async () => {
    try {
      setLoading(true);
      // Cargar usuarios y vehículos en paralelo
      const [usuariosData, vehiculosData] = await Promise.all([
        listarUsers().catch(() => ({ results: [] })),
        listarVehiculos().catch(() => ({ results: [] })),
      ]);

      setUsuarios(usuariosData.results || usuariosData || []);
      setVehiculos(vehiculosData.results || vehiculosData || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos necesarios");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setForm((prev) => ({
        ...prev,
        [name]: files[0] || null,
      }));
    } else if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Actualizar tipo cuando se selecciona un vehículo
  useEffect(() => {
    if (form.vehiculo) {
      setForm((prev) => ({
        ...prev,
        tipo: "vehicular",
      }));
    }
  }, [form.vehiculo]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!form.usuario) {
      setError("Debe seleccionar un usuario");
      return;
    }

    if (form.tipo === "vehicular" && !form.vehiculo) {
      setError("Para acceso vehicular debe seleccionar un vehículo");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Preparar FormData para soportar archivos
      const formData = new FormData();

      // Agregar campos de texto
      formData.append("usuario_id", form.usuario);
      formData.append("tipo", form.tipo);
      formData.append("direccion", form.direccion);
      formData.append("metodo", form.metodo);
      formData.append("fecha_hora", form.fecha_hora);
      formData.append(
        "reconocimiento_exitoso",
        form.reconocimiento_exitoso.toString()
      );

      // Agregar vehículo si está seleccionado
      if (form.vehiculo) {
        formData.append("vehiculo_id", form.vehiculo);
      }

      // Agregar confidence score si existe
      if (form.confidence_score) {
        formData.append("confidence_score", parseFloat(form.confidence_score));
      }

      // Agregar archivo de evidencia si existe
      if (form.foto_evidencia) {
        formData.append("foto_evidencia", form.foto_evidencia);
      }

      console.log("Enviando registro de acceso:", Object.fromEntries(formData));
      await createRegistroAcceso(formData);

      navigate("/registros-acceso");
    } catch (err) {
      console.error("Error creando registro de acceso:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Error al crear el registro de acceso";
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
        <FaDoorOpen className="me-2 text-primary" size={30} />
        <h2 className="mb-0">Nuevo Registro de Acceso</h2>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Línea 1: Usuario */}
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>
                <FaUser className="me-1" />
                Usuario *
              </Form.Label>
              <Form.Select
                name="usuario"
                value={form.usuario}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un usuario</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellidos} -
                    {usuario.unidades_habitacionales?.[0]?.codigo ||
                      "Sin unidad"}{" "}
                    -{usuario.email}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 2: Tipo y Vehículo */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Tipo de Acceso *</Form.Label>
              <Form.Select
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                required
                disabled={!!form.vehiculo} // Deshabilitar si hay vehículo seleccionado
              >
                {TIPOS_ACCESO.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                {form.vehiculo &&
                  "Automáticamente vehicular por vehículo seleccionado"}
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <FaCar className="me-1" />
                Vehículo
              </Form.Label>
              <Form.Select
                name="vehiculo"
                value={form.vehiculo}
                onChange={handleChange}
              >
                <option value="">Sin vehículo (acceso peatonal)</option>
                {vehiculos.map((vehiculo) => (
                  <option key={vehiculo.id} value={vehiculo.id}>
                    {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo} -{" "}
                    {vehiculo.propietario?.nombre}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Opcional - Solo para acceso vehicular
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 3: Dirección y Método */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Dirección *</Form.Label>
              <Form.Select
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                required
              >
                {DIRECCIONES.map((direccion) => (
                  <option key={direccion.value} value={direccion.value}>
                    {direccion.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Método de Acceso *</Form.Label>
              <Form.Select
                name="metodo"
                value={form.metodo}
                onChange={handleChange}
                required
              >
                {METODOS_ACCESO.map((metodo) => (
                  <option key={metodo.value} value={metodo.value}>
                    {metodo.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 4: Fecha/Hora y Reconocimiento */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Fecha y Hora *</Form.Label>
              <Form.Control
                type="datetime-local"
                name="fecha_hora"
                value={form.fecha_hora}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Estado del Reconocimiento</Form.Label>
              <div className="mt-2">
                <Form.Check
                  type="switch"
                  id="reconocimiento_exitoso"
                  name="reconocimiento_exitoso"
                  label="Reconocimiento exitoso"
                  checked={form.reconocimiento_exitoso}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 5: Confidence Score y Evidencia */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Confidence Score</Form.Label>
              <Form.Control
                type="number"
                step="0.0001"
                min="0"
                max="1"
                name="confidence_score"
                value={form.confidence_score}
                onChange={handleChange}
                placeholder="0.0000 - 1.0000"
              />
              <Form.Text className="text-muted">
                Nivel de confianza del reconocimiento (0.0000 - 1.0000)
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <FaCamera className="me-1" />
                Evidencia Fotográfica
              </Form.Label>
              <Form.Control
                type="file"
                name="foto_evidencia"
                accept="image/*"
                onChange={handleChange}
              />
              <Form.Text className="text-muted">
                Foto de evidencia del acceso (opcional)
              </Form.Text>
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
            {saving ? "Registrando..." : "Registrar Acceso"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate("/accesos")}
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
          <strong>Información sobre Métodos de Acceso</strong>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>Métodos Automatizados:</h6>
              <ul className="small mb-0">
                <li>
                  <strong>Reconocimiento Facial:</strong> Acceso mediante
                  biometría facial
                </li>
                <li>
                  <strong>Reconocimiento de Placa:</strong> Para vehículos
                  registrados
                </li>
                <li>
                  <strong>Tarjeta de Acceso:</strong> Tarjeta RFID o magnética
                </li>
              </ul>
            </Col>
            <Col md={6}>
              <h6>Métodos Manuales:</h6>
              <ul className="small mb-0">
                <li>
                  <strong>Código de Acceso:</strong> Código numérico o
                  alfanumérico
                </li>
                <li>
                  <strong>Registro Manual:</strong> Ingreso realizado por
                  personal de seguridad
                </li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
}

export default AccesoCrear;
