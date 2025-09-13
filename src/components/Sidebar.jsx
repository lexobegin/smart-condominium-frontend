import React, { useState } from "react";
import { Offcanvas, Nav, Button, Collapse } from "react-bootstrap";
import { FaBars, FaChevronDown } from "react-icons/fa";

function Sidebar() {
  const [show, setShow] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  const handleToggle = () => setShow(!show);
  const handleClose = () => setShow(false);
  const toggleSubmenu = () => setSubmenuOpen(!submenuOpen);

  return (
    <>
      {/* Botón para abrir el sidebar en móvil (visible solo en sm y abajo) */}
      <div
        className="d-md-none bg-light w-100"
        style={{
          position: "sticky",
          top: "56px", // justo debajo del navbar (que es fixed)
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

      {/* Sidebar permanente en pantallas md y mayores */}
      <div
        className="d-none d-md-block bg-light"
        style={{
          width: "250px",
          height: "100vh",
          position: "fixed",
          top: "56px", // Altura del navbar
          left: 0,
          borderRight: "1px solid #ddd",
          overflowY: "auto",
          zIndex: 1000,
        }}
      >
        <Nav className="flex-column px-3">
          <Nav.Link href="/dashboard">Dashboard</Nav.Link>

          <div
            className="d-flex justify-content-between align-items-center py-2"
            onClick={toggleSubmenu}
            style={{ cursor: "pointer", fontWeight: "500", color: "#333" }}
          >
            Menú{" "}
            <FaChevronDown
              className={`ms-2 ${submenuOpen ? "rotate-180" : ""}`}
            />
          </div>

          <Collapse in={submenuOpen}>
            <div>
              <Nav.Link href="/submenu1" className="ps-4">
                Submenú 1
              </Nav.Link>
              <Nav.Link href="/submenu2" className="ps-4">
                Submenú 2
              </Nav.Link>
            </div>
          </Collapse>

          <Nav.Link href="/usuarios">Usuarios</Nav.Link>
          <Nav.Link href="/condominios">Condominios</Nav.Link>
          <Nav.Link href="/reportes">Reportes</Nav.Link>
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

            <div
              className="d-flex justify-content-between align-items-center py-2"
              onClick={toggleSubmenu}
              style={{ cursor: "pointer", fontWeight: "500", color: "#333" }}
            >
              Menú{" "}
              <FaChevronDown
                className={`ms-2 ${submenuOpen ? "rotate-180" : ""}`}
              />
            </div>

            <Collapse in={submenuOpen}>
              <div>
                <Nav.Link
                  href="/submenu1"
                  className="ps-4"
                  onClick={handleClose}
                >
                  Submenú 1
                </Nav.Link>
                <Nav.Link
                  href="/submenu2"
                  className="ps-4"
                  onClick={handleClose}
                >
                  Submenú 2
                </Nav.Link>
              </div>
            </Collapse>

            <Nav.Link href="/usuarios" onClick={handleClose}>
              Usuarios
            </Nav.Link>
            <Nav.Link href="/condominios" onClick={handleClose}>
              Condominios
            </Nav.Link>
            <Nav.Link href="/reportes" onClick={handleClose}>
              Reportes
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Sidebar;
