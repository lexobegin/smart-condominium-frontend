// src/pages/tareas-mantenimiento/TareaAsignada.jsx

import React, { useEffect, useState } from "react";
import { Table, Spinner } from "react-bootstrap";
import { fetchTareasMantenimientosTodos } from "../../services/tareas-mantenimiento";
import { getCurrentUser } from "../../services/auth";
import DashboardLayout from "../../components/DashboardLayout";

function TareaAsignada() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTareas();
  }, []);

  const loadTareas = async () => {
    try {
      setLoading(true);

      // ✅ 1. Obtener usuario logueado
      const currentUser = getCurrentUser();
      console.log("Usuario actual:", currentUser);
      if (!currentUser) {
        console.warn("No hay usuario logueado");
        setTareas([]);
        return;
      }

      // ✅ 2. Traer todas las tareas
      const data = await fetchTareasMantenimientosTodos();
      console.log("Tareas obtenidas:", data);
      // ✅ 3. Filtrar solo las asignadas al usuario logueado
      const tareasUsuario = data.filter(
        (t) => t.usuario_asignado === currentUser.id
      );

      setTareas(tareasUsuario);
    } catch (err) {
      console.error("Error cargando tareas asignadas:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h2 className="mb-4">📋 Mis Tareas Asignadas</h2>

      {loading ? (
        <Spinner animation="border" />
      ) : tareas.length === 0 ? (
        console.log("tareas asignadas:", tareas),
        <p>No tienes tareas asignadas.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Título</th>
              <th>Descripción</th>
              <th>Fecha Asignación</th>
              <th>Fecha Límite</th>
              <th>Fecha Completado</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {tareas.map((tarea, index) => (
              <tr key={tarea.id}>
                <td>{index + 1}</td>
                <td>{tarea.titulo || "Sin título"}</td>
                <td>{tarea.descripcion || "—"}</td>
                <td>{tarea.fecha_asignacion || "—"}</td>
                <td>{tarea.fecha_limite || "—"}</td>
                <td>{tarea.fecha_completado || "—"}</td>
                <td>{tarea.estado || "Pendiente"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </DashboardLayout>
  );
}

export default TareaAsignada;
