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

// Areas Comunes
import Listar from "./pages/areas-comunes/Listar";
import Crear from "./pages/areas-comunes/Crear";
import Editar from "./pages/areas-comunes/Editar";
import Ver from "./pages/areas-comunes/Ver";

// Condominios
import Condominios from "./pages/condominio/Condominios_TEMP";
import CondominioForm from "./pages/condominio/CondominiosForm";

// Unidades
import UnidadHabitacional from "./pages/UnidadHabitacional/UnidadHabitacional";
import UnidadForm from "./pages/UnidadHabitacional/UnidadForm";

// Categorias Mantenimiento
import CategoriaListar from "./pages/categorias-mantenimiento/CategoriaListar";
import CategoriaCrear from "./pages/categorias-mantenimiento/CategoriaCrear";
import CategoriaEditar from "./pages/categorias-mantenimiento/CategoriaEditar";

// Mantenimientos Preventivos
import MantenimientoListar from "./pages/mantenimientos-preventivos/MantenimientoListar";
import MantenimientoCrear from "./pages/mantenimientos-preventivos/MantenimientoCrear";
import MantenimientoEditar from "./pages/mantenimientos-preventivos/MantenimientoEditar";

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
        {/* Areas Comunes */}
        <Route
          path="/areas-comunes"
          element={
            <ProtectedRoute>
              <Listar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/areas-comunes/crear"
          element={
            <ProtectedRoute>
              <Crear />
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
              <Editar />
            </ProtectedRoute>
          }
        />

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
