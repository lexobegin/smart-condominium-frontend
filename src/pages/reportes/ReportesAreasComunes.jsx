import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Table } from "react-bootstrap";
import { getReportesAreasComunes } from "../../services/reportes";

function ReportesAreasComunes() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getReportesAreasComunes();
        setData(result);
      } catch (error) {
        console.error("Error cargando reportes de áreas comunes:", error);
      }
    };
    fetchData();
  }, []);

  if (!data) return <p className="m-4">Cargando reporte de áreas comunes...</p>;

  return (
    <DashboardLayout>
      <h2>🏠 Reporte de Áreas Comunes</h2>
      <p>Total reservas: {data.resumen.total_reservas}</p>
      <p>Total ingresos: ${data.resumen.total_ingresos.toFixed(2)}</p>

      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Área</th>
            <th>Total Reservas</th>
            <th>Ingresos</th>
            <th>Pendientes</th>
            <th>Confirmadas</th>
            <th>Completadas</th>
            <th>Canceladas</th>
          </tr>
        </thead>
        <tbody>
          {data.areas.map((a) => (
            <tr key={a.id}>
              <td>{a.nombre}</td>
              <td>{a.total_reservas}</td>
              <td>${a.ingresos.toFixed(2)}</td>
              <td>{a.reservas_pendientes}</td>
              <td>{a.reservas_confirmadas}</td>
              <td>{a.reservas_completadas}</td>
              <td>{a.reservas_canceladas}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </DashboardLayout>
  );
}

export default ReportesAreasComunes;
