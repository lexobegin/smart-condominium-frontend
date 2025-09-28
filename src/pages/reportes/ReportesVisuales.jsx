import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "react-bootstrap";
import { getReportesVisuales } from "../../services/reportes";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

function ReportesVisuales() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getReportesVisuales();
        setData(result);
      } catch (error) {
        console.error("Error cargando reportes visuales:", error);
      }
    };
    fetchData();
  }, []);

  if (!data) return <p className="m-4">Cargando reportes visuales...</p>;

  // 🎯 Gráfico de Ingresos Mensuales
  const ingresosMensualesData = {
    labels: data.ingresos_mensuales.map((item) => item.mes),
    datasets: [
      {
        label: "Total",
        data: data.ingresos_mensuales.map((item) => item.total),
        borderColor: "#8884d8",
        backgroundColor: "#8884d8",
        tension: 0.4,
      },
    ],
  };

  // 🎯 Gráfico de Morosidad Mensual
  const morosidadMensualData = {
    labels: data.morosidad_mensual.map((item) => item.mes),
    datasets: [
      {
        label: "Pendientes",
        data: data.morosidad_mensual.map((item) => item.pendientes),
        backgroundColor: "#FFBB28",
      },
      {
        label: "Vencidas",
        data: data.morosidad_mensual.map((item) => item.vencidas),
        backgroundColor: "#FF8042",
      },
    ],
  };

  // 🎯 Gráfico de Reservas por Área
  const reservasPorAreaData = {
    labels: data.reservas_por_area.map((item) => item.name),
    datasets: [
      {
        label: "Reservas",
        data: data.reservas_por_area.map((item) => item.total),
        backgroundColor: ["#00C49F", "#FFBB28", "#FF8042", "#8884d8"],
      },
    ],
  };

  return (
    <DashboardLayout>
      <h2>📈 Reportes Visuales</h2>

      <div className="d-flex flex-wrap gap-4 mt-4">
        {/* Ingresos mensuales */}
        <Card style={{ flex: 1, minWidth: "300px" }}>
          <Card.Body>
            <Card.Title>Ingresos Mensuales</Card.Title>
            <Line data={ingresosMensualesData} />
          </Card.Body>
        </Card>

        {/* Morosidad mensual */}
        <Card style={{ flex: 1, minWidth: "300px" }}>
          <Card.Body>
            <Card.Title>Morosidad Mensual</Card.Title>
            <Bar data={morosidadMensualData} />
          </Card.Body>
        </Card>

        {/* Reservas por área */}
        <Card style={{ flex: 1, minWidth: "300px" }}>
          <Card.Body>
            <Card.Title>Reservas por Área</Card.Title>
            <Pie data={reservasPorAreaData} />
          </Card.Body>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default ReportesVisuales;
