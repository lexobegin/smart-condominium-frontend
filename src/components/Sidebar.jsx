import React, { useState } from "react";
import { Offcanvas, Nav, Button, Collapse } from "react-bootstrap";
import { FaBars, FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const [show, setShow] = useState(false);
  const [menusOpen, setMenusOpen] = useState({
    admin: false,
    seguridad: false,
    areas: false,
    mantenimientos: false,
    reportes: false,
  });

  const handleToggle = () => setShow(!show);
  const handleClose = () => setShow(false);

  const toggleMenu = (menu) => {
    setMenusOpen((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const navigate = useNavigate();

  return (
    <>
      {/* Botón menú para móvil */}
      <div
        className="d-md-none bg-light w-100"
        style={{
          position: "sticky",
          top: "56px",
          zIndex: 1050,
          padding: "10px 16px",
          backgroundColor: "#f8f9fa",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Button variant="primary" onClick={handleToggle}>
          <FaBars /> Menú
        </Button>
      </div>

      {/* Sidebar fijo para pantallas md+ */}
      <div
        className="d-none d-md-block bg-light"
        style={{
          width: "250px",
          height: "100vh",
          position: "fixed",
          top: "56px",
          left: 0,
          borderRight: "1px solid #ddd",
          overflowY: "auto",
          zIndex: 1000,
        }}
      >
        <Nav className="flex-column px-3">
          <div
            className="d-flex justify-content-between align-items-center py-2"
            style={{ cursor: "pointer", fontWeight: "500", color: "#333" }}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </div>

          {/* Administración */}
          <div
            className="d-flex justify-content-between align-items-center py-2"
            onClick={() => toggleMenu("admin")}
            style={{ cursor: "pointer", fontWeight: "500", color: "#333" }}
          >
            Administración{" "}
            <FaChevronDown
              className={`ms-2 ${menusOpen.admin ? "rotate-180" : ""}`}
            />
          </div>

          <Collapse in={menusOpen.admin}>
            <div>
              {/* NUEVO: Roles y Permisos + Bitácora */}
              <Nav.Link href="" className="ps-4">
                Role y Permiso
              </Nav.Link>
              <Nav.Link href="/admin/bitacora" className="ps-4">
                Bitácora
              </Nav.Link>
              <Nav.Link href="/usuarios" className="ps-4">
                Usuarios
              </Nav.Link>
              <Nav.Link href="/condominios" className="ps-4">
                Condominio
              </Nav.Link>
              <Nav.Link href="/unidades" className="ps-4">
                Unidad Habitacional
              </Nav.Link>
              <Nav.Link className="ps-4">Cuota y Expensas</Nav.Link>
              <Nav.Link className="ps-4">Multa y Cargo Adic.</Nav.Link>
              <Nav.Link className="ps-4">Comunicado</Nav.Link>
            </div>
          </Collapse>

          {/* Seguridad */}
          <div
            className="d-flex justify-content-between align-items-center py-2"
            onClick={() => toggleMenu("seguridad")}
            style={{ cursor: "pointer", fontWeight: "500", color: "#333" }}
          >
            Seguridad{" "}
            <FaChevronDown
              className={`ms-2 ${menusOpen.seguridad ? "rotate-180" : ""}`}
            />
          </div>

          <Collapse in={menusOpen.seguridad}>
            <div>
              {/* NUEVO: Roles y Permisos + Bitácora */}
              <Nav.Link href="/camaras-seguridad" className="ps-4">
                Camaras
              </Nav.Link>
              <Nav.Link href="" className="ps-4">
                Alerta de Seguridad
              </Nav.Link>
              <Nav.Link href="/notificaciones" className="ps-4">
                Notificaciones
              </Nav.Link>
              <Nav.Link href="/incidentes-seguridad" className="ps-4">
                Incidentes
              </Nav.Link>
              <Nav.Link href="/visitantes" className="ps-4">
                Visitantes
              </Nav.Link>
              <Nav.Link href="/accesos" className="ps-4">
                Accesos
              </Nav.Link>
              <Nav.Link href="/vehiculos" className="ps-4">
                Vehiculos
              </Nav.Link>
            </div>
          </Collapse>

          {/* Área Común */}
          <div
            className="d-flex justify-content-between align-items-center py-2"
            onClick={() => toggleMenu("areas")}
            style={{ cursor: "pointer", fontWeight: "500", color: "#333" }}
          >
            Área Común{" "}
            <FaChevronDown
              className={`ms-2 ${menusOpen.areas ? "rotate-180" : ""}`}
            />
          </div>

          <Collapse in={menusOpen.areas}>
            <div>
              <Nav.Link href="/areas-comunes" className="ps-4">
                Áreas Comunes
              </Nav.Link>
              <Nav.Link className="ps-4">Reservar Área Común</Nav.Link>
              <Nav.Link className="ps-4">Historial de Reservas</Nav.Link>
              <Nav.Link className="ps-4">
                Horarios Disp. de Áreas Comunes
              </Nav.Link>
            </div>
          </Collapse>

          {/* Mantenimiento */}
          <div
            className="d-flex justify-content-between align-items-center py-2"
            onClick={() => toggleMenu("mantenimientos")}
            style={{ cursor: "pointer", fontWeight: "500", color: "#333" }}
          >
            Mantenimiento{" "}
            <FaChevronDown
              className={`ms-2 ${menusOpen.mantenimientos ? "rotate-180" : ""}`}
            />
          </div>

          <Collapse in={menusOpen.mantenimientos}>
            <div>
              <Nav.Link href="/categorias-mantenimiento" className="ps-4">
                Categorias Mantenimiento
              </Nav.Link>
              <Nav.Link href="/mantenimientos-preventivos" className="ps-4">
                Mantenimiento Preventivo
              </Nav.Link>
              <Nav.Link href="/solicitudes-mantenimientos" className="ps-4">
                Mantenimiento Correctivo
              </Nav.Link>
              <Nav.Link href="/tareas-mantenimientos" className="ps-4">
                Asignar Tareas de Mantenimiento
              </Nav.Link>
              <Nav.Link href="/tareas-asignadas" className="ps-4">
                Consultar Tareas Asignadas
              </Nav.Link>
              <Nav.Link className="ps-4">Actualizar Estado de Tareas</Nav.Link>
            </div>
          </Collapse>

          {/* Reportes */}
          <div
            className="d-flex justify-content-between align-items-center py-2"
            onClick={() => toggleMenu("reportes")}
            style={{ cursor: "pointer", fontWeight: "500", color: "#333" }}
          >
            Reportes{" "}
            <FaChevronDown
              className={`ms-2 ${menusOpen.reportes ? "rotate-180" : ""}`}
            />
          </div>

          <Collapse in={menusOpen.reportes}>
            <div>
              <Nav.Link href="/reportes/financieros" className="ps-4">
                Financieros
              </Nav.Link>
              <Nav.Link href="/reportes/areas-comunes" className="ps-4">
                Áreas Comunes
              </Nav.Link>
              <Nav.Link href="/reportes/visuales" className="ps-4">
                Visuales
              </Nav.Link>
            </div>
          </Collapse>
          {/*<div
            className="d-flex justify-content-between align-items-center py-2"
            style={{ cursor: "pointer", fontWeight: "500", color: "#333" }}
            onClick={() => navigate("")}
          >
            Reportes
          </div>*/}
        </Nav>
      </div>

      {/* Offcanvas para móvil */}
      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="start"
        className="d-md-none"
        style={{ zIndex: 1100, width: "100%" }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menú</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link href="/dashboard" onClick={handleClose}>
              Dashboard
            </Nav.Link>

            {/* Administración */}
            <div
              className="d-flex justify-content-between align-items-center py-2"
              onClick={() => toggleMenu("admin")}
              style={{ cursor: "pointer", fontWeight: "500", color: "#333" }}
            >
              Administración{" "}
              <FaChevronDown
                className={`ms-2 ${menusOpen.admin ? "rotate-180" : ""}`}
              />
            </div>

            <Collapse in={menusOpen.admin}>
              <div>
                {/* NUEVO: Roles y Permisos + Bitácora */}
                <Nav.Link href="" className="ps-4" onClick={handleClose}>
                  Role y Permiso
                </Nav.Link>
                <Nav.Link
                  href="/admin/bitacora"
                  className="ps-4"
                  onClick={handleClose}
                >
                  Bitácora
                </Nav.Link>
                <Nav.Link
                  href="/usuarios"
                  className="ps-4"
                  onClick={handleClose}
                >
                  Usuarios
                </Nav.Link>
                <Nav.Link
                  href="/condominios"
                  className="ps-4"
                  onClick={handleClose}
                >
                  Condominios
                </Nav.Link>
                <Nav.Link
                  href="/unidades"
                  className="ps-4"
                  onClick={handleClose}
                >
                  Unidad Habitacional
                </Nav.Link>
              </div>
            </Collapse>

            {/* Área Común */}
            <div
              className="d-flex justify-content-between align-items-center py-2"
              onClick={() => toggleMenu("areas")}
              style={{ cursor: "pointer", fontWeight: "500", color: "#333" }}
            >
              Área Común{" "}
              <FaChevronDown
                className={`ms-2 ${menusOpen.areas ? "rotate-180" : ""}`}
              />
            </div>

            <Collapse in={menusOpen.areas}>
              <div>
                <Nav.Link
                  href="/areas-comunes"
                  className="ps-4"
                  onClick={handleClose}
                >
                  Áreas Comunes
                </Nav.Link>
                <Nav.Link className="ps-4" onClick={handleClose}>
                  Reservar Área Común
                </Nav.Link>
                <Nav.Link className="ps-4" onClick={handleClose}>
                  Historial de Reservas
                </Nav.Link>
                <Nav.Link className="ps-4" onClick={handleClose}>
                  Horarios Disp. de Áreas Comunes
                </Nav.Link>
              </div>
            </Collapse>

            {/* Reportes en móvil */}
            <div
              className="d-flex justify-content-between align-items-center py-2"
              onClick={() => toggleMenu("reportes")}
              style={{ cursor: "pointer", fontWeight: "500", color: "#333" }}
            >
              Reportes{" "}
              <FaChevronDown
                className={`ms-2 ${menusOpen.reportes ? "rotate-180" : ""}`}
              />
            </div>

            <Collapse in={menusOpen.reportes}>
              <div>
                <Nav.Link
                  href="/reportes/financieros"
                  className="ps-4"
                  onClick={handleClose}
                >
                  Financieros
                </Nav.Link>
                <Nav.Link
                  href="/reportes/areas-comunes"
                  className="ps-4"
                  onClick={handleClose}
                >
                  Áreas Comunes
                </Nav.Link>
                <Nav.Link
                  href="/reportes/visuales"
                  className="ps-4"
                  onClick={handleClose}
                >
                  Visuales
                </Nav.Link>
              </div>
            </Collapse>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Sidebar;
