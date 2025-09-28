import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner, Alert, Card } from "react-bootstrap";
import {
  createVehiculo,
  MARCAS_VEHICULOS,
  COLORES_VEHICULOS,
} from "../../services/vehiculos";
import { listarUsers } from "../../services/users";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import {
  FaCar,
  FaSave,
  FaTimes,
  FaUser,
  FaIdCard,
  FaPalette,
} from "react-icons/fa";

function VehiculoCrear() {
  const [form, setForm] = useState({
    placa: "",
    marca: "toyota",
    modelo: "",
    color: "blanco",
    usuario: "",
    autorizado: true,
    datos_ocr: "",
  });

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosData = await listarUsers().catch(() => ({ results: [] }));
      setUsuarios(usuariosData.results || usuariosData || []);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setError("Error al cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Función para formatear placa automáticamente
  const handlePlacaChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // Formato sugerido: AAA-111 o AAA111
    if (value.length > 3) {
      value = value.slice(0, 3) + "-" + value.slice(3);
    }

    setForm((prev) => ({
      ...prev,
      placa: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!form.placa.trim()) {
      setError("La placa es obligatoria");
      return;
    }

    if (!form.modelo.trim()) {
      setError("El modelo es obligatorio");
      return;
    }

    if (!form.usuario) {
      setError("Debe seleccionar un propietario");
      return;
    }

    // Validar formato de placa (mínimo 6 caracteres: AAA-111)
    const placaLimpia = form.placa.replace("-", "");
    if (placaLimpia.length < 6) {
      setError("La placa debe tener al menos 6 caracteres (ej: ABC123)");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        placa: form.placa.trim().toUpperCase(),
        marca: form.marca,
        modelo: form.modelo.trim(),
        color: form.color,
        usuario_id: parseInt(form.usuario, 10),
        autorizado: form.autorizado,
        datos_ocr: form.datos_ocr.trim(),
      };

      console.log("Enviando vehículo:", payload);
      await createVehiculo(payload);

      navigate("/vehiculos");
    } catch (err) {
      console.error("Error creando vehículo:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Error al crear el vehículo";
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
          <p>Cargando usuarios...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex align-items-center mb-4">
        <FaCar className="me-2 text-dark" size={30} />
        <h2 className="mb-0">Registrar Nuevo Vehículo</h2>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Línea 1: Placa y Marca */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <FaIdCard className="me-1" />
                Placa del Vehículo *
              </Form.Label>
              <Form.Control
                name="placa"
                value={form.placa}
                onChange={handlePlacaChange}
                placeholder="Ej: ABC-123"
                required
                maxLength={7}
                style={{ textTransform: "uppercase" }}
              />
              <Form.Text className="text-muted">
                Formato: AAA-123 o AAA123 (máx. 7 caracteres)
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Marca *</Form.Label>
              <Form.Select
                name="marca"
                value={form.marca}
                onChange={handleChange}
                required
              >
                {MARCAS_VEHICULOS.map((marca) => (
                  <option key={marca.value} value={marca.value}>
                    {marca.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 2: Modelo y Color */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Modelo *</Form.Label>
              <Form.Control
                name="modelo"
                value={form.modelo}
                onChange={handleChange}
                placeholder="Ej: Corolla 2023, Civic LX, etc."
                required
                maxLength={50}
              />
              <Form.Text className="text-muted">
                Modelo completo del vehículo (ej: Corolla 2023)
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>
                <FaPalette className="me-1" />
                Color *
              </Form.Label>
              <Form.Select
                name="color"
                value={form.color}
                onChange={handleChange}
                required
              >
                {COLORES_VEHICULOS.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 3: Propietario */}
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>
                <FaUser className="me-1" />
                Propietario *
              </Form.Label>
              <Form.Select
                name="usuario"
                value={form.usuario}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un propietario</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellidos} -
                    {usuario.unidades_habitacionales?.[0]?.codigo ||
                      "Sin unidad"}{" "}
                    -{usuario.email}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Seleccione el residente propietario del vehículo
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Línea 4: Autorización y Datos OCR */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Estado de Autorización</Form.Label>
              <div className="mt-2">
                <Form.Check
                  type="switch"
                  id="autorizado"
                  name="autorizado"
                  label="Vehículo autorizado para ingreso"
                  checked={form.autorizado}
                  onChange={handleChange}
                />
              </div>
              <Form.Text className="text-muted">
                Los vehículos no autorizados no podrán ingresar al condominio
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Datos OCR (Opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="datos_ocr"
                value={form.datos_ocr}
                onChange={handleChange}
                placeholder="Datos extraídos por OCR del vehículo..."
                maxLength={200}
              />
              <Form.Text className="text-muted">
                Información adicional obtenida por reconocimiento óptico
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Botones de acción */}
        <div className="d-flex gap-2">
          <Button
            variant="dark"
            type="submit"
            disabled={saving}
            className="d-flex align-items-center"
          >
            <FaSave className="me-2" />
            {saving ? "Registrando..." : "Registrar Vehículo"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate("/vehiculos")}
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
          <strong>Información Importante</strong>
        </Card.Header>
        <Card.Body>
          <ul className="mb-0">
            <li>
              La <strong>placa</strong> debe ser única para cada vehículo
              registrado
            </li>
            <li>
              Los vehículos <strong>autorizados</strong> podrán ingresar al
              condominio mediante reconocimiento de placas
            </li>
            <li>
              Los vehículos <strong>no autorizados</strong> serán bloqueados en
              los sistemas de acceso
            </li>
            <li>
              El campo <strong>Datos OCR</strong> se llena automáticamente
              cuando se usa reconocimiento automático de placas
            </li>
            <li>Cada residente puede tener múltiples vehículos registrados</li>
          </ul>
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
}

export default VehiculoCrear;
