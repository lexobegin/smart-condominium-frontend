import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RedirectToInitial from "./components/RedirectToInitial";

import Usuarios from "./pages/usuario/Usuarios";
import UsuarioForm from "./pages/usuario/UsuarioForm";
import Condominios from "./pages/condominio/condominios";
import UnidadHabitacional from "./pages/UnidadHabitacional/UnidadHabitacional";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección desde la raíz */}
        <Route path="/" element={<RedirectToInitial />} />

        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
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

        <Route
          path="/condominios"
          element={
            <ProtectedRoute>
              <Condominios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/unidades"
          element={
            <ProtectedRoute>
              {" "}
              <UnidadHabitacional />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
