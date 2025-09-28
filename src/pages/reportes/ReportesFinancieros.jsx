import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getReportesFinancieros } from "../../services/reportes";

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

  const pagosData = Object.keys(data.pagos).map((estado) => ({
    name: estado,
    value: data.pagos[estado],
  }));
  const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];

  return (
    <DashboardLayout>
      <h2>📊 Reporte Financiero</h2>
      <div className="d-flex flex-wrap gap-3 mt-4">
        <Card style={{ minWidth: "18rem" }}>
          <Card.Body>
            <Card.Title>Morosidad</Card.Title>
            <p>Total facturas: {data.morosidad.total_facturas}</p>
            <p>Pendientes: {data.morosidad.pendientes}</p>
            <p>Vencidas: {data.morosidad.vencidas}</p>
            <p>Porcentaje: {data.morosidad.porcentaje_morosidad}%</p>
          </Card.Body>
        </Card>

        <Card style={{ minWidth: "18rem" }}>
          <Card.Body>
            <Card.Title>Ingresos</Card.Title>
            <p>Total: ${data.ingresos.total.toFixed(2)}</p>
            <p>Último mes: ${data.ingresos.ultimo_mes.toFixed(2)}</p>
          </Card.Body>
        </Card>

        <Card style={{ flex: 1 }}>
          <Card.Body>
            <Card.Title>Distribución de Pagos</Card.Title>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pagosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pagosData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default ReportesFinancieros;
