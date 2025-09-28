import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "react-bootstrap";
import { getReportesFinancieros } from "../../services/reportes";

// Chart.js imports
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

// Registrar elementos necesarios
ChartJS.register(ArcElement, Tooltip, Legend);

function ReportesFinancieros() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getReportesFinancieros();
        setData(result);
      } catch (error) {
        console.error("Error cargando reportes financieros:", error);
      }
    };
    fetchData();
  }, []);

  if (!data) return <p className="m-4">Cargando reporte financiero...</p>;

  // Preparar datos para el gráfico de pastel
  const pagosData = {
    labels: Object.keys(data.pagos),
    datasets: [
      {
        data: Object.values(data.pagos),
        backgroundColor: ["#00C49F", "#FFBB28", "#FF8042"],
        hoverOffset: 8,
      },
    ],
  };

  const pagosOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <DashboardLayout>
      <h2>📊 Reporte Financiero</h2>
      <div className="d-flex flex-wrap gap-3 mt-4">
        {/* Card: Morosidad */}
        <Card style={{ minWidth: "18rem" }}>
          <Card.Body>
            <Card.Title>Morosidad</Card.Title>
            <p>Total facturas: {data.morosidad.total_facturas}</p>
            <p>Pendientes: {data.morosidad.pendientes}</p>
            <p>Vencidas: {data.morosidad.vencidas}</p>
            <p>Porcentaje: {data.morosidad.porcentaje_morosidad}%</p>
          </Card.Body>
        </Card>

        {/* Card: Ingresos */}
        <Card style={{ minWidth: "18rem" }}>
          <Card.Body>
            <Card.Title>Ingresos</Card.Title>
            <p>Total: ${data.ingresos.total.toFixed(2)}</p>
            <p>Último mes: ${data.ingresos.ultimo_mes.toFixed(2)}</p>
          </Card.Body>
        </Card>

        {/* Card: Gráfico de pastel */}
        <Card style={{ flex: 1 }}>
          <Card.Body>
            <Card.Title>Distribución de Pagos</Card.Title>
            <div style={{ width: "100%", height: "250px" }}>
              <Pie data={pagosData} options={pagosOptions} />
            </div>
          </Card.Body>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default ReportesFinancieros;
