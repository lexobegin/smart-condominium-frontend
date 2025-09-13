import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";

function AppNavbar() {
  return (
    <Navbar bg="light" variant="light" expand="lg" fixed="top">
      <Container fluid>
        <Navbar.Brand href="/dashboard">Smart Condominium</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/">Inicio</Nav.Link>
            <Nav.Link href="/logout">Cerrar sesión</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
