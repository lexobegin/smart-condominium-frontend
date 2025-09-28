import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import RedirectToInitial from "./components/RedirectToInitial";

// Usuarios
import Usuarios from "./pages/usuario/Usuarios";
import UsuarioForm from "./pages/usuario/UsuarioForm";

// Áreas comunes
//import Listar from "./pages/areas-comunes/Listar";
//import Crear from "./pages/areas-comunes/Crear";
//import Editar from "./pages/areas-comunes/Editar";
import Ver from "./pages/areas-comunes/Ver";

// Condominios
import Condominios from "./pages/condominio/Condominios_TEMP";
import CondominioForm from "./pages/condominio/CondominiosForm";

// Unidades
import UnidadHabitacional from "./pages/UnidadHabitacional/UnidadHabitacional";
import UnidadForm from "./pages/UnidadHabitacional/UnidadForm";

// Categorías Mantenimiento
import CategoriaListar from "./pages/categorias-mantenimiento/CategoriaListar";
import CategoriaCrear from "./pages/categorias-mantenimiento/CategoriaCrear";
import CategoriaEditar from "./pages/categorias-mantenimiento/CategoriaEditar";

// Mantenimientos Preventivos
import MantenimientoListar from "./pages/mantenimientos-preventivos/MantenimientoListar";
import MantenimientoCrear from "./pages/mantenimientos-preventivos/MantenimientoCrear";
import MantenimientoEditar from "./pages/mantenimientos-preventivos/MantenimientoEditar";

// Tareas Mantenimiento
import TareaListar from "./pages/tareas-mantenimiento/TareaListar";
import TareaCrear from "./pages/tareas-mantenimiento/TareaCrear";
import TareaEditar from "./pages/tareas-mantenimiento/TareaEditar";
import TareaAsignada from "./pages/tareas-mantenimiento/TareasAsignada";

// Solicitudes Mantenimiento
import SolicitudListar from "./pages/solicitudes-mantenimiento/SolicitudListar";
import SolicitudCrear from "./pages/solicitudes-mantenimiento/SolicitudCrear";
import SolicitudEditar from "./pages/solicitudes-mantenimiento/SolicitudEditar";

// Bitácora
import Bitacora from "./pages/bitacora/Bitacora";

import CamaraListar from "./pages/camaras-seguridad/CamaraListar";
import CamaraEditar from "./pages/camaras-seguridad/CamaraEditar";
import CamaraCrear from "./pages/camaras-seguridad/CamaraCrear";
import NotificacionListar from "./pages/notificaciones/NotificacionListar";
import NotificacionCrear from "./pages/notificaciones/NotificacionCrear";
import NotificacionEditar from "./pages/notificaciones/NotificacionEditar";
import IncidenteListar from "./pages/incidentes-seguridad/IncidenteListar";
import IncidenteCrear from "./pages/incidentes-seguridad/IncidenteCrear";
import IncidenteEditar from "./pages/incidentes-seguridad/IncidenteEditar";
import VisitanteListar from "./pages/visitantes/VisitanteListar";
import VisitanteCrear from "./pages/visitantes/VisitanteCrear";
import VisitanteEditar from "./pages/visitantes/VisitanteEditar";
import AccesoListar from "./pages/registros-acceso/AccesoListar";
import VehiculoListar from "./pages/vehiculos/VehiculoListar";
import AccesoCrear from "./pages/registros-acceso/AccesoCrear";
import AccesoEditar from "./pages/registros-acceso/AccesoEditar";
import VehiculoCrear from "./pages/vehiculos/VehiculoCrear";
import VehiculoEditar from "./pages/vehiculos/VehiculoEditar";
import AreaListar from "./pages/areas-comunes/AreaListar";
import AreaEditar from "./pages/areas-comunes/AreaEditar";
import AreaCrear from "./pages/areas-comunes/AreaCrear";
// import CategoriaVer from "./pages/categorias-mantenimiento/CategoriaVer";

// === NUEVOS REPORTES ===
import ReportesFinancieros from "./pages/reportes/ReportesFinancieros";
import ReportesAreasComunes from "./pages/reportes/ReportesAreasComunes";
import ReportesVisuales from "./pages/reportes/ReportesVisuales";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección desde la raíz */}
        <Route path="/" element={<RedirectToInitial />} />

        {/* Autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />

        {/* Dashboard protegido */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Usuarios */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <Usuarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios/nuevo"
          element={
            <ProtectedRoute>
              <UsuarioForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios/editar/:id"
          element={
            <ProtectedRoute>
              <UsuarioForm />
            </ProtectedRoute>
          }
        />

        {/* Condominios */}
        <Route
          path="/condominios"
          element={
            <ProtectedRoute>
              <Condominios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/condominios/nuevo"
          element={
            <ProtectedRoute>
              <CondominioForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/condominios/editar/:id"
          element={
            <ProtectedRoute>
              <CondominioForm />
            </ProtectedRoute>
          }
        />

        {/* Unidades */}
        <Route
          path="/unidades"
          element={
            <ProtectedRoute>
              <UnidadHabitacional />
            </ProtectedRoute>
          }
        />
        <Route
          path="/unidades/nueva"
          element={
            <ProtectedRoute>
              <UnidadForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/unidades/editar/:id"
          element={
            <ProtectedRoute>
              <UnidadForm />
            </ProtectedRoute>
          }
        />

        {/* Áreas comunes */}
        <Route
          path="/areas-comunes"
          element={
            <ProtectedRoute>
              <AreaListar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/areas-comunes/crear"
          element={
            <ProtectedRoute>
              <AreaCrear />
            </ProtectedRoute>
          }
        />
        <Route
          path="/areas-comunes/:id"
          element={
            <ProtectedRoute>
              <Ver />
            </ProtectedRoute>
          }
        />
        <Route
          path="/areas-comunes/editar/:id"
          element={
            <ProtectedRoute>
              <AreaEditar />
            </ProtectedRoute>
          }
        />

        {/* Camaras de Seguridad */}
        <Route
          path="/camaras-seguridad"
          element={
            <ProtectedRoute>
              <CamaraListar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/camaras-seguridad/crear"
          element={
            <ProtectedRoute>
              <CamaraCrear />
            </ProtectedRoute>
          }
        />
        <Route
          path="/camaras-seguridad/editar/:id"
          element={
            <ProtectedRoute>
              <CamaraEditar />
            </ProtectedRoute>
          }
        />
        {/* Notificaion */}
        <Route
          path="/notificaciones"
          element={
            <ProtectedRoute>
              <NotificacionListar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notificaciones/crear"
          element={
            <ProtectedRoute>
              <NotificacionCrear />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notificaciones/editar/:id"
          element={
            <ProtectedRoute>
              <NotificacionEditar />
            </ProtectedRoute>
          }
        />
        {/* Incidentes de Seguridad */}
        <Route
          path="/incidentes-seguridad"
          element={
            <ProtectedRoute>
              <IncidenteListar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidentes-seguridad/crear"
          element={
            <ProtectedRoute>
              <IncidenteCrear />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidentes-seguridad/editar/:id"
          element={
            <ProtectedRoute>
              <IncidenteEditar />
            </ProtectedRoute>
          }
        />
        {/* Visitante */}
        <Route
          path="/visitantes"
          element={
            <ProtectedRoute>
              <VisitanteListar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visitantes/crear"
          element={
            <ProtectedRoute>
              <VisitanteCrear />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visitantes/editar/:id"
          element={
            <ProtectedRoute>
              <VisitanteEditar />
            </ProtectedRoute>
          }
        />
        {/* Accesos */}
        <Route
          path="/accesos"
          element={
            <ProtectedRoute>
              <AccesoListar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/registros-acceso/crear"
          element={
            <ProtectedRoute>
              <AccesoCrear />
            </ProtectedRoute>
          }
        />
        <Route
          path="/registros-acceso/editar/:id"
          element={
            <ProtectedRoute>
              <AccesoEditar />
            </ProtectedRoute>
          }
        />
        {/* Vehiculos */}
        <Route
          path="/vehiculos"
          element={
            <ProtectedRoute>
              <VehiculoListar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehiculos/crear"
          element={
            <ProtectedRoute>
              <VehiculoCrear />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehiculos/editar/:id"
          element={
            <ProtectedRoute>
              <VehiculoEditar />
            </ProtectedRoute>
          }
        />
        {/* Categorías Mantenimiento */}
        <Route
          path="/categorias-mantenimiento"
          element={
            <ProtectedRoute>
              <CategoriaListar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categorias-mantenimiento/crear"
          element={
            <ProtectedRoute>
              <CategoriaCrear />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categorias-mantenimiento/editar/:id"
          element={
            <ProtectedRoute>
              <CategoriaEditar />
            </ProtectedRoute>
          }
        />

        {/* Mantenimientos Preventivos */}
        <Route
          path="/mantenimientos-preventivos"
          element={
            <ProtectedRoute>
              <MantenimientoListar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mantenimiento-preventivo/crear"
          element={
            <ProtectedRoute>
              <MantenimientoCrear />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mantenimiento-preventivo/editar/:id"
          element={
            <ProtectedRoute>
              <MantenimientoEditar />
            </ProtectedRoute>
          }
        />

        {/* Tareas Mantenimiento */}
        <Route
          path="/tareas-mantenimientos"
          element={
            <ProtectedRoute>
              <TareaListar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tareas-asignadas"
          element={
            <ProtectedRoute>
              <TareaAsignada />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tareas-mantenimiento/crear"
          element={
            <ProtectedRoute>
              <TareaCrear />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tareas-mantenimiento/editar/:id"
          element={
            <ProtectedRoute>
              <TareaEditar />
            </ProtectedRoute>
          }
        />

        {/* Reportes */}
        <Route
          path="/reportes/financieros"
          element={
            <ProtectedRoute>
              <ReportesFinancieros />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes/areas-comunes"
          element={
            <ProtectedRoute>
              <ReportesAreasComunes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes/visuales"
          element={
            <ProtectedRoute>
              <ReportesVisuales />
            </ProtectedRoute>
          }
        />

        {/* Solicitudes Mantenimiento */}
        <Route
          path="/solicitudes-mantenimientos"
          element={
            <ProtectedRoute>
              <SolicitudListar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/solicitud-mantenimiento/crear"
          element={
            <ProtectedRoute>
              <SolicitudCrear />
            </ProtectedRoute>
          }
        />
        <Route
          path="/solicitud-mantenimiento/editar/:id"
          element={
            <ProtectedRoute>
              <SolicitudEditar />
            </ProtectedRoute>
          }
        />
        {/* Bitácora */}
        <Route
          path="/admin/bitacora"
          element={
            <ProtectedRoute>
              <Bitacora />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
