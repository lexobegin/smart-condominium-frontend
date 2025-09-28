import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Spinner, Alert, Card } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchVehiculo,
  updateVehiculo,
  MARCAS_VEHICULOS,
  COLORES_VEHICULOS,
} from "../../services/vehiculos";
import { listarUsers } from "../../services/users";
import DashboardLayout from "../../components/DashboardLayout";
import {
  FaCar,
  FaSave,
  FaTimes,
  FaUser,
  FaIdCard,
  FaPalette,
} from "react-icons/fa";

function VehiculoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar datos en paralelo
      const [vehiculoData, usuariosData] = await Promise.all([
        fetchVehiculo(id),
        listarUsers().catch(() => ({ results: [] })),
      ]);

      console.log("Datos del vehículo:", vehiculoData);

      setForm({
        placa: vehiculoData.placa || "",
        marca: vehiculoData.marca || "toyota",
        modelo: vehiculoData.modelo || "",
        color: vehiculoData.color || "blanco",
        usuario: vehiculoData.usuario?.id?.toString() || "",
        autorizado:
          vehiculoData.autorizado !== undefined
            ? vehiculoData.autorizado
            : true,
        datos_ocr: vehiculoData.datos_ocr || "",
      });

      setUsuarios(usuariosData.results || usuariosData || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos del vehículo");
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

      console.log("Actualizando vehículo:", payload);
      await updateVehiculo(id, payload);

      navigate("/vehiculos");
    } catch (err) {
      console.error("Error actualizando vehículo:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Error al actualizar el vehículo";
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
          <p>Cargando datos del vehículo...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="d-flex align-items-center mb-4">
        <FaCar className="me-2 text-dark" size={30} />
        <h2 className="mb-0">Editar Vehículo</h2>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body className="bg-light">
          <small>
            <strong>ID del Vehículo:</strong> {id} |
            <strong> Fecha de Registro:</strong>{" "}
            {new Date().toLocaleDateString()}
          </small>
        </Card.Body>
      </Card>

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
                required
                maxLength={7}
                style={{ textTransform: "uppercase" }}
              />
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
                required
                maxLength={50}
              />
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
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Datos OCR</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="datos_ocr"
                value={form.datos_ocr}
                onChange={handleChange}
                maxLength={200}
              />
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
            {saving ? "Guardando..." : "Guardar Cambios"}
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
    </DashboardLayout>
  );
}

export default VehiculoEditar;
