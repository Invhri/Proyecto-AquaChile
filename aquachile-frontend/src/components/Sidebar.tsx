import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const [metricas, setMetricas] = useState({
    candidatos: 0,
    solicitudesActivas: 0,
    evaluacionesPendientes: 0,
    efectividad: 0,
    ingresosMes: 0
  });

  // Leemos el usuario autenticado guardado en el Login
  const usuarioAuth = JSON.parse(localStorage.getItem("usuario_autenticado") || "{}");
  const rolUsuario = usuarioAuth.rol || "";

  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/sidebar-metrics');
        if (res.ok) {
          const data = await res.json();
          setMetricas(data);
        }
      } catch (err) {
        console.error("Error al cargar métricas del sidebar:", err);
      }
    };
    fetchMetricas();
  }, []);

  // Todos los ítems posibles
  const allItems = [
    { 
      to: "/dashboard", 
      label: "Dashboard / Inicio", 
      icon: "📊", 
      badge: null, 
      badgeClass: null,
      roles: ["Administrador académico", "Analista de Reclutamiento", "Profesional Evaluador", "Jefatura o contraparte simulada"]
    },
    { 
      to: "/candidatos", 
      label: "Candidatos", 
      icon: "👥", 
      badge: metricas.candidatos, 
      badgeClass: "dash-badge",
      roles: ["Administrador académico", "Analista de Reclutamiento"] 
    },
    { 
      to: "/solicitudes", 
      label: "Solicitudes de Evaluación", 
      icon: "💼", 
      badge: `${metricas.solicitudesActivas} activas`, 
      badgeClass: "dash-badge-naranjo",
      roles: ["Administrador académico", "Analista de Reclutamiento"]
    },
    { 
      to: "/evaluaciones", 
      label: "Evaluaciones", 
      icon: "📋", 
      badge: `${metricas.evaluacionesPendientes} pend.`, 
      badgeClass: "dash-badge-outline",
      roles: ["Administrador académico", "Profesional Evaluador"]
    },
    { 
      to: "/admin-usuarios", 
      label: "Gestión de Usuarios", 
      icon: "⚙️", 
      badge: null, 
      badgeClass: null,
      roles: ["Administrador académico"] // <-- Solo visible para el admin
    }
  ];

  // Filtramos las opciones visibles según el rol del usuario actual
  const itemsVisibles = allItems.filter(item => item.roles.includes(rolUsuario));

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("usuario_autenticado");
    window.location.href = "/";
  };

  return (
    <aside className="dash-sidebar">
      <div className="dash-logo-area">
        <div className="dash-logo-icon">⛵</div>
        <div className="dash-logo-text">
          <strong>AquaChile</strong> <span>Talentos</span>
          <div className="dash-logo-sub">RECLUTAMIENTO & SELECCIÓN</div>
        </div>
      </div>

      <div className="dash-sidebar-actions">
        <div className="dash-sidebar-title">
          PORTAL R&S <span>2026</span>
        </div>
      </div>

      <nav className="dash-nav">
        {itemsVisibles.map((i) => (
          <NavLink
            key={i.to}
            to={i.to}
            className={({ isActive }) =>
              "dash-nav-item" + (isActive ? " activo" : "")
            }
          >
            <span className="dash-icon">{i.icon}</span> {i.label}{" "}
            {i.badge !== null && (
              <span className={i.badgeClass || ""}>{i.badge}</span>
            )}
          </NavLink>
        ))}

        {/* Botón de Cerrar Sesión */}
        <button 
          onClick={handleLogout} 
          className="dash-nav-item" 
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#d9534f', marginTop: 'auto' }}
        >
          <span className="dash-icon">🚪</span> Cerrar Sesión
        </button>
      </nav>

      <div className="dash-sidebar-footer">
        <div className="dash-metric">
          <div className="dash-metric-header">
            <span className="dash-dot-green"></span> Efectividad Selección
            <strong>{metricas.efectividad}%</strong>
          </div>
          <div className="dash-progress-bar">
            <div 
              className="dash-progress-fill" 
              style={{ width: `${metricas.efectividad}%` }}
            ></div>
          </div>
          <p>{metricas.ingresosMes} ingresos cerrados este mes</p>
        </div>
      </div>
    </aside>
  );
}