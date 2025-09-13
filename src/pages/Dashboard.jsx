import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Card } from "react-bootstrap";

function Dashboard() {
  return (
    <DashboardLayout>
      <h2>Bienvenido al Panel de Administración</h2>
      <div className="d-flex gap-3 mt-4">
        <Card style={{ width: "18rem" }}>
          <Card.Body>
            <Card.Title>Usuarios</Card.Title>
            <Card.Text>Gestión de usuarios y roles.</Card.Text>
          </Card.Body>
        </Card>

        <Card style={{ width: "18rem" }}>
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
