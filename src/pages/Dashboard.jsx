import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <h2>Bienvenido al Panel de Administración</h2>
      <div className="d-flex gap-3 mt-4 flex-wrap">
        <Card
          style={{ width: "18rem", cursor: "pointer" }}
          onClick={() => navigate("/usuarios")}
        >
          <Card.Body>
            <Card.Title>Usuarios</Card.Title>
            <Card.Text>Gestión de usuarios y roles.</Card.Text>
          </Card.Body>
        </Card>

        <Card
          style={{ width: "18rem", cursor: "pointer" }}
          onClick={() => navigate("/reportes/financieros")}
        >
          <Card.Body>
            <Card.Title>Reportes</Card.Title>
            <Card.Text>Visualiza métricas e informes.</Card.Text>
          </Card.Body>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
