import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

export default function Topbar() {
  const [usuario, setUsuario] = useState({ nombre: "Usuario", rol: "Rol" });
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar usuario logueado correctamente
    const auth = JSON.parse(localStorage.getItem("usuario_autenticado") || "{}");
    // Soporte para los dos nombres que hemos manejado (nombre y nombre_completo)
    const nombreStr = auth.nombre || auth.nombre_completo; 
    if (nombreStr) {
      setUsuario({
        nombre: `${nombreStr} ${auth.apellido || ""}`.trim(),
        rol: auth.rol || "Rol"
      });
    }
  }, []);

  // Función que se ejecuta al presionar una tecla en el buscador
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (busqueda.trim() !== "") {
        // Redirige a la página de candidatos enviando la palabra por la URL
        navigate(`/candidatos?q=${encodeURIComponent(busqueda)}`);
      } else {
        // Si busca vacío, lo lleva a la vista general
        navigate(`/candidatos`);
      }
    }
  };

  return (
    <header className="dash-topbar">
      <div className="dash-topbar-left">
        <select className="dash-select-faena">
          <option>Faena Activa: Todas</option>
        </select>
      </div>
      <div className="dash-topbar-search">
        <input 
          type="text" 
          placeholder="🔍 Buscar por candidato o cargo... (Presiona Enter)" 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="dash-topbar-user">
        <span className="dash-bell">🔔</span>
        <div className="dash-user-info">
          <strong>{usuario.nombre}</strong>
          <span>{usuario.rol}</span>
        </div>
      </div>
    </header>
  );
}