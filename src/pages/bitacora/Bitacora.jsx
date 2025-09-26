import { useEffect, useMemo, useState } from "react";
import { Button, Table, InputGroup, Spinner, Pagination } from "react-bootstrap";
import api from "../../services/api";

// Campos del backend (ajusta si difieren)
const FIELD = {
  id: "id",
  createdAt: "created_at",
  usuario: "usuario", // puede ser string o {email, nombre, apellidos}
  accion: "accion",
  modulo: "modulo",
};

// Formatear fecha-hora a La Paz
const formatLaPaz = (iso) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("es-BO", {
      timeZone: "America/La_Paz",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
};

export default function Bitacora() {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // solo buscador
  const [term, setTerm] = useState("");

  // paginación
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // helpers nombre/usuario
  const getFullName = (u) => {
    if (!u) return "-";
    if (typeof u === "string") return u;
    const first = u.first_name || u.nombre || "";
    const last = u.last_name || u.apellidos || "";
    const full = `${first} ${last}`.trim();
    return full || "-";
  };

  const getUserLogin = (u) => {
    if (!u) return "-";
    if (typeof u === "string") return u;
    return u.email || u.username || u.usuario || u.id || "-";
  };

  const fetchData = async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: p,
      page_size: pageSize,
      ordering: "-created_at", // lo más reciente primero
    });
    if (term) params.set("search", term);

    const { data } = await api.get(`/bitacora/?${params.toString()}`);

    if (Array.isArray(data)) {
      setRows(data);
      setCount(data.length);
    } else {
      setRows(data.results || []);
      setCount(data.count || (data.results?.length ?? 0));
    }
    setPage(p);
    setLoading(false);
  };

  useEffect(() => { fetchData(1); }, []); // carga inicial

  // columnas: ID, Nombre completo, Usuario, Acción, Módulo, Fecha-Hora
  const columns = useMemo(() => ([
    { key: FIELD.id, title: "ID" },
    { key: "nombre_completo", title: "Nombre completo", render: (r) => getFullName(r[FIELD.usuario]) },
    { key: "usuario_login", title: "Usuario", render: (r) => getUserLogin(r[FIELD.usuario]) },
    { key: FIELD.accion, title: "Acción" },
    { key: FIELD.modulo, title: "Módulo" },
    { key: FIELD.createdAt, title: "Fecha-Hora", render: (r) => formatLaPaz(r[FIELD.createdAt]) },
  ]), []);

  const exportCSV = () => {
    const headers = columns.map(c => c.title).join(",");
    const lines = rows.map(r => columns.map(c => {
      const val = c.render ? c.render(r) : r[c.key];
      const s = (val ?? "").toString().replace(/"/g, '""');
      return `"${s}"`;
    }).join(","));
    const csv = [headers, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bitacora_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <div className="container-fluid py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">Bitácora</h1>
        <Button variant="dark" onClick={exportCSV}>Exportar CSV</Button>
      </div>

      {/* Solo buscador */}
      <div className="mb-3">
        <label className="form-label">Buscar</label>
        <InputGroup>
          <input
            className="form-control"
            placeholder="Buscar en usuario, acción o módulo…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <Button variant="dark" onClick={() => fetchData(1)}>Filtrar</Button>
        </InputGroup>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" role="status" className="me-2" />
          Cargando…
        </div>
      ) : (
        <>
          <div className="text-muted small mb-2">
            {count} registros (página {page} de {Math.max(1, Math.ceil(count / pageSize))})
          </div>
          <div className="table-responsive">
            <Table hover striped bordered className="mb-0">
              <thead>
                <tr>
                  {columns.map(col => <th key={col.key}>{col.title}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-4">
                      Sin resultados
                    </td>
                  </tr>
                ) : rows.map((r) => (
                  <tr key={r[FIELD.id]}>
                    {columns.map(col => (
                      <td key={col.key}>
                        {col.render ? col.render(r) : r[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div />
              <Pagination className="mb-0">
                <Pagination.Prev disabled={page <= 1} onClick={() => fetchData(page - 1)} />
                <Pagination.Item active>{page}</Pagination.Item>
                <Pagination.Next disabled={page >= totalPages} onClick={() => fetchData(page + 1)} />
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
