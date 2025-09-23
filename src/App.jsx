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

// Condominios
import Condominios from "./pages/Condominio/Condominios";
import CondominioForm from "./pages/Condominio/CondominiosForm";

// Unidades
import UnidadHabitacional from "./pages/unidadHabitacional/UnidadHabitacional";
import UnidadForm from "./pages/unidadHabitacional/UnidadForm";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
