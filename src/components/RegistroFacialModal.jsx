import React, { useRef, useState, useCallback, useEffect } from "react";
import { Modal, Button, Alert, Card, Row, Col, Spinner } from "react-bootstrap";
import {
  FaCamera,
  FaSync,
  FaCheckCircle,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";

const RegistroFacialModal = ({
  show,
  onHide,
  usuario,
  onRegistrarRostro,
  loading,
  message,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(true);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  // Función para verificar si la cámara está funcionando
  const checkCameraActive = useCallback(() => {
    if (videoRef.current && streamRef.current) {
      const video = videoRef.current;
      return (
        video.readyState >= 2 && // HAVE_CURRENT_DATA or better
        video.videoWidth > 0 &&
        video.videoHeight > 0 &&
        streamRef.current.active
      );
    }
    return false;
  }, []);

  // Iniciar cámara de forma estable
  const startCamera = useCallback(async () => {
    try {
      setCameraLoading(true);
      setCameraError("");
      setCameraActive(false);

      console.log("Iniciando cámara...");

      // Detener stream anterior si existe
      if (streamRef.current) {
        console.log("Deteniendo stream anterior...");
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }

      // Limpiar video reference
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // Pequeña pausa para asegurar que el stream anterior se detuvo
      await new Promise((resolve) => setTimeout(resolve, 100));

      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
          frameRate: { ideal: 24 },
        },
        audio: false,
      };

      console.log("Solicitando permisos de cámara...");
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      console.log("Cámara accedida exitosamente");

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // Esperar a que el video esté listo
        await new Promise((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error("Elemento video no disponible"));
            return;
          }

          const video = videoRef.current;

          const onLoaded = () => {
            console.log(
              "Video cargado, dimensiones:",
              video.videoWidth,
              "x",
              video.videoHeight
            );
            video.removeEventListener("loadedmetadata", onLoaded);
            video.removeEventListener("error", onError);
            resolve();
          };

          const onError = (err) => {
            console.error("Error en elemento video:", err);
            video.removeEventListener("loadedmetadata", onLoaded);
            video.removeEventListener("error", onError);
            reject(err);
          };

          video.addEventListener("loadedmetadata", onLoaded, { once: true });
          video.addEventListener("error", onError, { once: true });

          // Timeout de seguridad
          setTimeout(() => {
            if (video.readyState < 2) {
              reject(new Error("Timeout al cargar video"));
            }
          }, 5000);
        });

        setCameraActive(true);
        setIsCapturing(true);
        console.log("Cámara iniciada y lista");
      }
    } catch (err) {
      console.error("Error crítico al acceder a la cámara:", err);
      let errorMessage = "No se pudo acceder a la cámara. ";

      if (err.name === "NotAllowedError") {
        errorMessage +=
          "Permisos denegados. Por favor permite el acceso a la cámara.";
      } else if (err.name === "NotFoundError") {
        errorMessage += "No se encontró ninguna cámara disponible.";
      } else if (err.name === "NotSupportedError") {
        errorMessage += "Tu navegador no soporta esta funcionalidad.";
      } else {
        errorMessage += `Error: ${err.message}`;
      }

      setCameraError(errorMessage);
      setCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  }, []);

  // Detener cámara correctamente
  const stopCamera = useCallback(() => {
    console.log("Deteniendo cámara...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Capturar foto de forma estable
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && checkCameraActive()) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      console.log("Capturando foto...");

      // Configurar canvas con las dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Dibujar el frame actual del video en el canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convertir a base64
      try {
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        console.log("Foto capturada exitosamente");
        setCapturedImage(imageData);
        setIsCapturing(false);
      } catch (error) {
        console.error("Error al convertir imagen:", error);
        alert("Error al procesar la foto. Intenta nuevamente.");
      }
    } else {
      alert("La cámara no está lista. Espera un momento e intenta nuevamente.");
    }
  };

  // Tomar otra foto
  const retakePhoto = async () => {
    console.log("Reiniciando cámara para nueva captura...");
    setCapturedImage(null);
    setCameraError("");
    await startCamera();
  };

  // Registrar rostro
  const handleRegistrar = () => {
    if (capturedImage && onRegistrarRostro) {
      // Extraer solo la parte base64 de la data URL
      const base64Data = capturedImage.split(",")[1];
      onRegistrarRostro(base64Data);
    }
  };

  // Efecto para manejar la cámara cuando se abre/cierra el modal
  useEffect(() => {
    let mounted = true;

    if (show && mounted) {
      console.log("Modal abierto, iniciando cámara...");
      startCamera();
    }

    return () => {
      mounted = false;
      console.log("Modal cerrado, limpiando...");
      stopCamera();
    };
  }, [show, startCamera, stopCamera]);

  // Verificar estado de la cámara periódicamente
  useEffect(() => {
    if (!show || !isCapturing || capturedImage) return;

    const checkInterval = setInterval(() => {
      if (videoRef.current && streamRef.current) {
        const isActive = checkCameraActive();
        if (cameraActive !== isActive) {
          console.log("Estado de cámara cambiado:", isActive);
          setCameraActive(isActive);
        }

        // Si la cámara debería estar activa pero no lo está, reintentar
        if (!isActive && !cameraLoading && !cameraError) {
          console.warn("Cámara inactiva, reintentando...");
          startCamera();
        }
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [
    show,
    isCapturing,
    capturedImage,
    cameraActive,
    cameraLoading,
    cameraError,
    checkCameraActive,
    startCamera,
  ]);

  // Manejar errores del video
  const handleVideoError = (e) => {
    console.error("Error en el elemento video:", e);
    setCameraError("Error en la transmisión de video. Reintentando...");
    // Reintentar automáticamente después de un error
    setTimeout(() => {
      if (show) {
        startCamera();
      }
    }, 1000);
  };

  // Manejar cuando el video comienza a reproducir
  const handleVideoPlay = () => {
    console.log("Video comenzó a reproducirse");
    setCameraActive(true);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCamera className="me-2" />
          Registrar Rostro - {usuario?.nombre} {usuario?.apellidos}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && <Alert variant={message.type}>{message.text}</Alert>}

        <Card>
          <Card.Body>
            <Row>
              <Col md={12} className="text-center mb-3">
                <p className="mb-3">
                  <strong>Instrucciones:</strong>
                  <br />
                  1. Asegúrate de tener buena iluminación
                  <br />
                  2. Mira directamente a la cámara
                  <br />
                  3. Mantén una expresión neutral
                  <br />
                  4. Presiona "Capturar Foto" cuando estés listo
                </p>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                {/* Estado de carga de la cámara */}
                {cameraLoading && (
                  <div className="text-center p-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Iniciando cámara...</p>
                  </div>
                )}

                {/* Error de cámara */}
                {cameraError && !cameraLoading && (
                  <div className="text-center p-4">
                    <FaVideoSlash size={48} className="text-danger mb-3" />
                    <p className="text-danger">{cameraError}</p>
                    <Button
                      variant="primary"
                      onClick={startCamera}
                      disabled={cameraLoading}
                    >
                      <FaVideo className="me-1" />
                      Reintentar
                    </Button>
                  </div>
                )}

                {/* Vista de la cámara */}
                {isCapturing && !cameraLoading && !cameraError && (
                  <div className="text-center">
                    <div className="position-relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        onError={handleVideoError}
                        onPlay={handleVideoPlay}
                        style={{
                          width: "100%",
                          maxWidth: "300px",
                          border: cameraActive
                            ? "2px solid #28a745"
                            : "2px solid #dc3545",
                          borderRadius: "8px",
                          background: "#000",
                          minHeight: "240px",
                        }}
                      />
                      {/* Indicador de estado de la cámara */}
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          width: "12px",
                          height: "12px",
                          backgroundColor: cameraActive ? "#28a745" : "#dc3545",
                          borderRadius: "50%",
                          animation: cameraActive
                            ? "pulse 2s infinite"
                            : "none",
                        }}
                        title={
                          cameraActive ? "Cámara activa" : "Cámara inactiva"
                        }
                      />
                    </div>

                    {/* Información de estado */}
                    <div className="mt-2">
                      <small
                        className={
                          cameraActive ? "text-success" : "text-warning"
                        }
                      >
                        {cameraActive
                          ? "✅ Cámara lista"
                          : "⏳ Inicializando cámara..."}
                      </small>
                    </div>

                    <div className="mt-3">
                      <Button
                        variant="primary"
                        onClick={capturePhoto}
                        disabled={!cameraActive || loading}
                        size="lg"
                      >
                        <FaCamera className="me-2" />
                        Capturar Foto
                      </Button>
                    </div>
                  </div>
                )}

                {/* Vista previa de la foto capturada */}
                {capturedImage && (
                  <div className="text-center">
                    <div className="position-relative">
                      <img
                        src={capturedImage}
                        alt="Captura facial"
                        style={{
                          width: "100%",
                          maxWidth: "300px",
                          border: "2px solid #28a745",
                          borderRadius: "8px",
                        }}
                      />
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="warning"
                        onClick={retakePhoto}
                        disabled={loading}
                        className="me-2"
                      >
                        <FaSync className="me-1" />
                        Tomar Otra
                      </Button>
                      <Button
                        variant="success"
                        onClick={handleRegistrar}
                        disabled={loading}
                      >
                        <FaCheckCircle className="me-1" />
                        {loading ? "Registrando..." : "Registrar Rostro"}
                      </Button>
                    </div>
                  </div>
                )}
              </Col>

              <Col md={6}>
                <Card className="bg-light h-100">
                  <Card.Header>
                    <strong>Información del Usuario</strong>
                  </Card.Header>
                  <Card.Body>
                    <p>
                      <strong>Nombre:</strong> {usuario?.nombre}{" "}
                      {usuario?.apellidos}
                    </p>
                    <p>
                      <strong>CI:</strong> {usuario?.ci}
                    </p>
                    <p>
                      <strong>Email:</strong> {usuario?.email}
                    </p>
                    <p>
                      <strong>Tipo:</strong> {usuario?.tipo_display}
                    </p>

                    {usuario?.unidades_habitacionales?.[0] && (
                      <>
                        <p>
                          <strong>Unidad:</strong>{" "}
                          {usuario.unidades_habitacionales[0].codigo}
                        </p>
                        <p>
                          <strong>Condominio:</strong>{" "}
                          {usuario.unidades_habitacionales[0].condominio_nombre}
                        </p>
                      </>
                    )}

                    <hr />

                    <div className="mt-3">
                      <h6>Estado del Registro:</h6>
                      {usuario?.datos_faciales ? (
                        <Alert variant="info" className="small">
                          <strong>Rostro ya registrado</strong>
                          <br />
                          Este usuario ya tiene datos faciales registrados en el
                          sistema.
                        </Alert>
                      ) : (
                        <Alert variant="warning" className="small">
                          <strong>Rostro pendiente</strong>
                          <br />
                          Este usuario necesita registrar sus datos faciales
                          para acceso biométrico.
                        </Alert>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Canvas oculto para captura */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
      </Modal.Footer>

      {/* Estilos para la animación de pulso */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Modal>
  );
};

export default RegistroFacialModal;
