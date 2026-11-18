import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles.css";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({ 
    totales: 0, abiertas: 0, pendientes: 0, aprobados: 0,
    porcentajeAprobados: 0, porcentajeEsperando: 0, porcentajeEnProceso: 0 
  });
  const [solicitudDestacada, setSolicitudDestacada] = useState<any>(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/dashboard-kpis');
        if (res.ok) setKpis(await res.json());
      } catch (error) {
        console.error("Error al cargar KPIs:", error);
      }
    };
    fetchKpis();
  }, []);

  return (
    <div className="dash-layout">
      <Sidebar />
      <div className="dash-main-wrapper">
        <Topbar />

        <main className="dash-workspace">
          <section className="dash-center-column">
            <div className="dash-breadcrumb">
              Reclutamiento & Selección / Procesos Vigentes / <strong>Dashboard</strong>
            </div>
            <h1 className="dash-page-title">Directorio de Selección & Gestión de Postulantes</h1>

            <div className="dash-action-row" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => navigate("/formulario-interno")}
                style={{ backgroundColor: '#e9551c', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                + Postulación Interna
              </button>
            </div>

            <div className="dash-kpi-grid">
              <div className="dash-kpi-card">
                <div className="kpi-title">CANDIDATOS TOTALES</div>
                <div className="kpi-value">{kpis.totales}</div>
              </div>
              <div className="dash-kpi-card">
                <div className="kpi-title">SOLICITUDES ABIERTAS</div>
                <div className="kpi-value naranjo">{kpis.abiertas}</div>
              </div>
              <div className="dash-kpi-card">
                <div className="kpi-title">EVALUACIONES PENDIENTES</div>
                <div className="kpi-value naranjo">{kpis.pendientes}</div>
              </div>
              <div className="dash-kpi-card border-green">
                <div className="kpi-title">APROBADOS FINALES</div>
                <div className="kpi-value green">{kpis.aprobados}</div>
              </div>
            </div>

            <h3 style={{ marginTop: '30px', color: '#445563', fontSize: '16px' }}>Indicadores de Avance (%)</h3>
            <div className="dash-kpi-grid" style={{ marginTop: '10px' }}>
              <div className="dash-kpi-card border-green">
                <div className="kpi-title">% EVALUADOS ACEPTADOS</div>
                <div className="kpi-value green">{kpis.porcentajeAprobados}%</div>
              </div>
              <div className="dash-kpi-card">
                <div className="kpi-title">% ESPERANDO EVALUADOR</div>
                <div className="kpi-value naranjo">{kpis.porcentajeEsperando}%</div>
              </div>
              <div className="dash-kpi-card">
                <div className="kpi-title">% EVALUACIONES EN PROCESO</div>
                <div className="kpi-value naranjo">{kpis.porcentajeEnProceso}%</div>
              </div>
            </div>

            {solicitudDestacada ? (
              <div className="dash-solicitud-card" style={{ marginTop: '20px' }}>
                <div className="solicitud-tag">Solicitud #{solicitudDestacada.id}</div>
                <div className="solicitud-estado">● {solicitudDestacada.estado}</div>
                <h3>{solicitudDestacada.cargo}</h3>
                <p>Sede: {solicitudDestacada.sede} | Área: {solicitudDestacada.area}</p>
              </div>
            ) : (
              <p style={{ color: '#888', marginTop: '20px' }}>No hay solicitudes destacadas actualmente.</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}