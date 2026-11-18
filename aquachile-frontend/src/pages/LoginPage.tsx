import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

export default function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Nuevo estado para controlar la visibilidad de la contraseña
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim() || !password.trim()) {
      setError("Por favor, ingresa tu correo y contraseña.");
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Credenciales inválidas");
      }

      const usuarioDB = await response.json();
      setError("");
      
      // Guardamos los datos reales extraídos de PostgreSQL
      localStorage.setItem(
        "usuario_autenticado",
        JSON.stringify({ 
          nombre: usuarioDB.nombre_completo, 
          correo: usuarioDB.correo, 
          rol: usuarioDB.rol 
        })
      );
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    }
  };

  return (
    <div className="layout-login-completo">
      {/* BARRA SUPERIOR */}
      <header className="login-topbar">
        <div className="topbar-left">
          <div className="logo-placeholder-small">AquaChile</div>
          <span className="topbar-divider">|</span>
          <span className="topbar-title">
            GESTIÓN DE RECLUTAMIENTO & SELECCIÓN
          </span>
        </div>
        <div className="topbar-right">
          <div className="status-pill">
            <span className="status-dot"></span> Servicio Activo • MVP Full Stack
          </div>
          <a href="#" className="link-ayuda">
            Centro de Ayuda
          </a>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="login-main-area">
        <div className="tarjeta-login-avanzada">
          {/* Logo y Encabezado de Tarjeta */}
          <div className="tarjeta-header">
            <div className="logo-placeholder-large">AquaChile</div>
            <h1 className="tarjeta-titulo">
              Plataforma de Evaluación
              <br />
              Psicolaboral
            </h1>
            <p className="tarjeta-subtitulo">
              Ingrese sus credenciales corporativas para acceder al panel de gestión
            </p>
          </div>

          {error && <div className="mensaje-error-global">{error}</div>}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="formulario-login-avanzado">
            {/* Input Correo */}
            <div className="grupo-input">
              <label className="label-avanzado">
                Correo electrónico corporativo:
              </label>
              <div className="input-con-icono">
                <input
                  type="email"
                  placeholder="analista.rrhh@aquachile.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
                <span className="icono-input">@</span>
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="grupo-input">
              <div className="label-con-enlace">
                <label className="label-avanzado">Contraseña de acceso:</label>
                <a href="#" className="link-olvido">
                  ¿Olvidó su contraseña?
                </a>
              </div>
              <div className="input-con-icono">
                <input
                  // El tipo cambia dinámicamente según el estado 'mostrarPassword'
                  type={mostrarPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span 
                  className="icono-input" 
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  style={{ cursor: 'pointer' }}
                  title={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {mostrarPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            {/* Opciones extra */}
            <div className="opciones-extra">
              <label className="checkbox-recordar">
                <input type="checkbox" defaultChecked />
                <span>Recordar este equipo</span>
              </label>
              <div className="indicador-ssl">
                <span className="ssl-dot"></span> Conexión Cifrada SSL
              </div>
            </div>

            {/* Botón Ingresar */}
            <button type="submit" className="boton-ingresar-naranjo">
              Ingresar al Sistema <span>→</span>
            </button>
          </form>

          <hr className="separador-tarjeta" />

          {/* Caja para Candidatos Externos */}
          <div className="caja-candidato-externo">
            <div className="caja-candidato-info">
              <div className="icono-usuario-naranjo">👤</div>
              <div>
                <h4>¿Eres postulante o candidato externo?</h4>
                <p>
                  Ingresa tus antecedentes a través de nuestra plataforma abierta de selección.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/postular")}
              className="boton-postular-outline"
            >
              Postular aquí <span>&gt;</span>
            </button>
          </div>
        </div>

        {/* Textos bajo la tarjeta */}
        <div className="textos-bajo-tarjeta">
          <p>AquaChile S.A. • Área de Reclutamiento y Selección</p>
          <p>
            MVP Proyecto VcM - Asignatura Full Stack II • Acceso exclusivo a usuarios autorizados
          </p>
        </div>
      </main>

      {/* PIE DE PÁGINA */}
      <footer className="login-footer-bar">
        <div className="footer-left">
          © 2026 AquaChile. Todos los derechos reservados.
        </div>
        <div className="footer-right">
          <a href="#">Términos de confidencialidad</a>
          <a href="#">Política de Privacidad</a>
          <a href="#">Soporte Técnico</a>
        </div>
      </footer>
    </div>
  );
}