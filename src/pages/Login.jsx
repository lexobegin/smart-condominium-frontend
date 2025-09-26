import React, { useState } from "react";
import {
  Container,
  Form,
  Button,
  Alert,
  Card,
  Row,
  Col,
} from "react-bootstrap";
import api from "../services/api"; // <-- corregido el import

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(false);
    try {
      // 🔹 Usar /auth/login/ para que registre en Bitácora
      const res = await api.post("/auth/login/", { email, password });

      // 🔹 Guardamos tokens y usuario
      localStorage.setItem("token", res.data.access);    // access
      localStorage.setItem("refresh", res.data.refresh); // refresh

      if (res.data.usuario) {
        localStorage.setItem("user", JSON.stringify(res.data.usuario));
      } else {
        // fallback simple con email si no viene usuario
        localStorage.setItem("user", JSON.stringify({ email }));
      }

      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(true);
    }
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex justify-content-center align-items-center"
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={6} lg={4}>
          <Card className="p-4 shadow">
            <Card.Body>
              <h2 className="mb-4 text-center">Iniciar Sesión</h2>
              {error && <Alert variant="danger">Credenciales inválidas</Alert>}
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingrese su correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Entrar
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
