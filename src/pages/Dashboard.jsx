import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Card, Spinner, Row, Col } from "react-bootstrap";
import { fetchDashboardData } from "../services/dashboard";

// Chart.js
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Registrar elementos para gráficos
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error("Error cargando el dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center mt-5">
          <Spinner animation="border" />
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <p>Error al cargar los datos del dashboard.</p>
      </DashboardLayout>
    );
  }

  // Procesar datos
  const usuariosPorTipo = dashboardData.usuarios_por_tipo;
  const usuariosPorCondominioRaw = dashboardData.usuarios_por_condominio_y_tipo;
  const facturacionPorCondominioRaw = dashboardData.facturacion_por_condominio;

  const usuariosPorCondominio = {};
  usuariosPorCondominioRaw.forEach((item) => {
    const nombre = item.condominio_nombre;
    if (!usuariosPorCondominio[nombre]) {
      usuariosPorCondominio[nombre] = {};
    }
    usuariosPorCondominio[nombre][item.tipo_usuario] = item.total;
  });

  const facturacionPorCondominio = {};
  facturacionPorCondominioRaw.forEach((item) => {
    facturacionPorCondominio[item.condominio_nombre] = item;
  });

  const condominios = Object.keys(usuariosPorCondominio);

  // Chart.js: Pie chart para usuarios por tipo
  const pieChartData = {
    labels: usuariosPorTipo.map((u) => u.tipo),
    datasets: [
      {
        label: "Usuarios",
        data: usuariosPorTipo.map((u) => u.total),
        backgroundColor: [
          "#007bff",
          "#28a745",
          "#ffc107",
          "#dc3545",
          "#17a2b8",
        ],
      },
    ],
  };

  // Chart.js: Bar chart para facturación por condominio
  const barChartData = {
    labels: facturacionPorCondominioRaw.map((c) => c.condominio_nombre),
    datasets: [
      {
        label: "Facturado",
        data: facturacionPorCondominioRaw.map((c) => c.total_facturado),
        backgroundColor: "#007bff",
      },
      {
        label: "Pagado",
        data: facturacionPorCondominioRaw.map((c) => c.total_pagado),
        backgroundColor: "#28a745",
      },
      {
        label: "Pendiente",
        data: facturacionPorCondominioRaw.map((c) => c.total_pendiente),
        backgroundColor: "#dc3545",
      },
    ],
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Usuarios por tipo
    const usuariosTipoSheet = XLSX.utils.json_to_sheet(
      dashboardData.usuarios_por_tipo
    );
    XLSX.utils.book_append_sheet(wb, usuariosTipoSheet, "Usuarios por Tipo");

    // Usuarios por condominio y tipo
    const usuariosCondominioSheet = XLSX.utils.json_to_sheet(
      dashboardData.usuarios_por_condominio_y_tipo
    );
    XLSX.utils.book_append_sheet(
      wb,
      usuariosCondominioSheet,
      "Usuarios por Condominio"
    );

    // Facturación por condominio
    const facturacionSheet = XLSX.utils.json_to_sheet(
      dashboardData.facturacion_por_condominio
    );
    XLSX.utils.book_append_sheet(wb, facturacionSheet, "Facturación");

    // Guardar el archivo
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "dashboard_datos.xlsx");
  };

  return (
    <DashboardLayout>
      <h2 className="mb-4">Dashboard</h2>

      <div className="mb-3">
        <button className="btn btn-outline-primary" onClick={exportToExcel}>
          Exportar a Excel
        </button>
      </div>

      {/* Gráficos */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Usuarios por Tipo</Card.Title>
              <Pie data={pieChartData} />
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Facturación por Condominio</Card.Title>
              <Bar data={barChartData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tarjetas por condominio */}
      <h4 className="mt-4">Resumen por Condominio</h4>
      <Row className="mt-3">
        {condominios.map((condo) => (
          <Col key={condo} md={6} lg={4}>
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <Card.Title className="text-primary">{condo}</Card.Title>

                <div className="mt-3">
                  <h6>Usuarios:</h6>
                  <ul className="list-unstyled">
                    {Object.entries(usuariosPorCondominio[condo] || {}).map(
                      ([tipo, total]) => (
                        <li key={tipo}>
                          <strong>{tipo}</strong>: {total}
                        </li>
                      )
                    )}
                  </ul>

                  <h6 className="mt-3">Facturación:</h6>
                  <ul className="list-unstyled">
                    <li>
                      Facturado: S/{" "}
                      {facturacionPorCondominio[condo]?.total_facturado.toFixed(
                        2
                      )}
                    </li>
                    <li>
                      Pagado: S/{" "}
                      {facturacionPorCondominio[condo]?.total_pagado.toFixed(2)}
                    </li>
                    <li>
                      Pendiente: S/{" "}
                      {facturacionPorCondominio[condo]?.total_pendiente.toFixed(
                        2
                      )}
                    </li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </DashboardLayout>
  );
}

export default Dashboard;
