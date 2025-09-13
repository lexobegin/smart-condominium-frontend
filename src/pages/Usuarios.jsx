import React, { useState, useEffect } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import { fetchUsers, deleteUser } from "../services/users";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";

function Usuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  /*useEffect(() => {
    loadUsers(currentPage);
  }, [currentPage]);*/

  useEffect(() => {
    loadUsers(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  //const loadUsers = async (page) => {
  const loadUsers = async (page, search) => {
    try {
      setLoading(true);
      //const data = await fetchUsers(page);
      const data = await fetchUsers(page, search);
      setUsers(data.results);
      const total = Math.ceil(data.count / 10); // PAGE_SIZE = 10
      setTotalPages(total);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este usuario?"))
      return;
    try {
      await deleteUser(userId);
      loadUsers(currentPage);
    } catch (err) {
      console.error("Error borrando usuario:", err);
      alert("Error al eliminar usuario");
    }
  };

  const filteredUsers = users.filter((u) =>
    `${u.nombre} ${u.apellidos}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Usuarios</h2>
        <Button variant="success" onClick={() => navigate("/usuarios/nuevo")}>
          Nuevo Usuario
        </Button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Buscar por nombre o apellido"
          className="form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>
                    {u.nombre} {u.apellidos}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.tipo}</td>
                  <td>{u.estado}</td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/usuarios/editar/${u.id}`)}
                    >
                      Editar
                    </Button>{" "}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(u.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Anterior
                </Button>{" "}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export default Usuarios;
