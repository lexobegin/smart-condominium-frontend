import React, { useEffect, useState } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import {
  fetchCategoriaMantenimiento,
  updateCategoriaMantenimiento,
} from "../../services/categorias-mantenimiento";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCondominio, listarCondominios } from "../../services/condominios";

function Editar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true); // control de carga
  const [saving, setSaving] = useState(false);
  const [condominio, setCondominio] = useState(null); // detalle del condominio seleccionado
  const [condominios, setCondominios] = useState([]); // lista para el select
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
    loadCondominios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // cuando cambie form.condominio_id, cargar detalle del condominio
  useEffect(() => {
    if (form?.condominio_id) {
      fetchCondominio(form.condominio_id)
        .then((data) => setCondominio(data))
        .catch((err) => {
          console.error("Error al cargar condominio:", err);
          setCondominio(null);
        });
    } else {
      setCondominio(null);
    }
  }, [form?.condominio_id]);

  // carga la categoria y normaliza el objeto form
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategoriaMantenimiento(id);
      // soporta ambos casos: data.condominio puede ser objeto o id
      const condId = data?.condominio?.id ?? data?.condominio ?? null;

      setForm({
        nombre: data?.nombre ?? "",
        descripcion: data?.descripcion ?? "",
        condominio_id: condId,
        // agrega aquí otros campos si tu API los devuelve...
      });
    } catch (err) {
      console.error("Error al cargar categoria de mantenimiento:", err);
      setError("No se pudo cargar la categoría.");
    } finally {
      setLoading(false);
    }
  };

  // carga la lista de condominios para el <select>
  const loadCondominios = async () => {
    try {
      const data = await listarCondominios(); // ajusta según tu servicio
      setCondominios(data.results ?? data ?? []); // acepta paginado o lista simple
    } catch (err) {
      console.error("Error cargando condominios:", err);
      // no interrumpe la edición si falla la lista
    }
  };

  // manejador genérico de campos (convierte condominio_id a número)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue;
    if (type === "checkbox") newValue = checked;
    else if (name === "condominio_id") newValue = value === "" ? null : Number(value);
    else newValue = value;

    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // construir payload según lo que espere tu API (aquí asumo que quiere `condominio` = id)
      const payload = {
        ...form,
      };

      if ("condominio_id" in payload) {
        payload.condominio = payload.condominio_id;
        delete payload.condominio_id;
      }

      // opcional: console.log("payload", payload);
      await updateCategoriaMantenimiento(id, payload);
      navigate("/categorias-mantenimiento");
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Error al actualizar la categoria de mantenimiento");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <Spinner animation="border" />
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <h2>Editar Categoria de Mantenimiento</h2>

      {error && <Alert variant="danger">{error}</Alert>}

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
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Condominio</Form.Label>
          <Form.Select
            name="condominio_id"
            value={form.condominio_id ?? ""}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un condominio</option>
            {condominios.map((condo) => (
              <option key={condo.id} value={condo.id}>
                {condo.nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>{" "}
        <Button
          variant="secondary"
          onClick={() => navigate("/categorias-mantenimiento")}
        >
          Cancelar
        </Button>
      </Form>
    </DashboardLayout>
  );
}

export default Editar;
