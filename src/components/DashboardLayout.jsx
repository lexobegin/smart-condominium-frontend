import React from "react";
import AppNavbar from "./Navbar";
import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {
  return (
    <div>
      <AppNavbar />

      {/* Sidebar (fijo) */}
      <Sidebar />

      {/* Contenido principal */}
      <div
        style={{
          marginTop: "40px", // Altura del Navbar
          marginLeft: "0px",
        }}
        className="p-4 p-md-5"
      >
        {/* En pantallas md+ aplica margen izquierdo para dejar espacio al sidebar */}
        <div className="d-none d-md-block" style={{ marginLeft: "250px" }}>
          {children}
        </div>

        {/* En pantallas pequeñas no dejamos margen */}
        <div className="d-md-none">{children}</div>
      </div>
    </div>
  );
}

export default DashboardLayout;
