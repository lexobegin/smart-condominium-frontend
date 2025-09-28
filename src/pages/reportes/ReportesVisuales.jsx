import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card } from "react-bootstrap";
import { getReportesVisuales } from "../../services/reportes";

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

  const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <DashboardLayout>
      <h2>📈 Reportes Visuales</h2>

      <div className="d-flex flex-wrap gap-4 mt-4">
        {/* Ingresos mensuales */}
        <Card style={{ flex: 1, minWidth: "300px" }}>
          <Card.Body>
            <Card.Title>Ingresos Mensuales</Card.Title>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.ingresos_mensuales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>

        {/* Morosidad mensual */}
        <Card style={{ flex: 1, minWidth: "300px" }}>
          <Card.Body>
            <Card.Title>Morosidad Mensual</Card.Title>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.morosidad_mensual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pendientes" fill="#FFBB28" />
                <Bar dataKey="vencidas" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>

        {/* Reservas por área */}
        <Card style={{ flex: 1, minWidth: "300px" }}>
          <Card.Body>
            <Card.Title>Reservas por Área</Card.Title>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.reservas_por_area}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="total"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data.reservas_por_area.map((entry, index) => (
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

export default ReportesVisuales;
