import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles.css";

export default function CandidatosPage() {
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [solicitadosLocales, setSolicitadosLocales] = useState<number[]>([]);
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const terminoBusqueda = queryParams.get("q")?.toLowerCase() || "";

  useEffect(() => {
    const fetchCandidatos = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/candidatos');
        if (res.ok) {
          const data = await res.json();
          setCandidatos(data);
        }
      } catch (err) {
        console.error("Error al cargar candidatos:", err);
      }
    };
    fetchCandidatos();
  }, []);

  const candidatosFiltrados = useMemo(() => {
    if (!terminoBusqueda) return candidatos;
    return candidatos.filter(c => 
      c.nombre_completo.toLowerCase().includes(terminoBusqueda) || 
      (c.cargo_postulado && c.cargo_postulado.toLowerCase().includes(terminoBusqueda)) ||
      c.origen.toLowerCase().includes(terminoBusqueda)
    );
  }, [candidatos, terminoBusqueda]);

  const handleSolicitarEvaluacion = async (idCandidato: number) => {
    try {
      const res = await fetch('http://localhost:3001/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidato_id: idCandidato })
      });
      if (res.ok) {
        alert("Solicitud generada exitosamente. El candidato pasará al área de asignación.");
        setSolicitadosLocales([...solicitadosLocales, idCandidato]);
      } else alert("Error al generar la solicitud.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDescartar = async (idCandidato: number) => {
    if(window.confirm("¿Seguro que deseas descartar a este candidato permanentemente?")) {
      try {
        const res = await fetch(`http://localhost:3001/api/candidatos/${idCandidato}`, { method: 'DELETE' });
        if (res.ok) {
          setCandidatos(candidatos.filter(c => c.id !== idCandidato));
        } else {
          const errorData = await res.json();
          alert(errorData.error || "Error al descartar.");
        }
      } catch (err) {
        console.error("Error:", err);
      }
    }
  };

  return (
    <div className="dash-layout">
      <Sidebar />
      <div className="dash-main-wrapper">
        <Topbar />
        <main className="dash-workspace">
          <section className="dash-center-column">
            <div className="dash-breadcrumb">
              Reclutamiento & Selección / Procesos Vigentes / <strong>Candidatos</strong>
            </div>
            
            <h1 className="dash-page-title">
              Directorio de Candidatos
              {terminoBusqueda && <span style={{fontSize:'16px', color:'#888', marginLeft:'10px'}}> (Buscando: "{terminoBusqueda}")</span>}
            </h1>
            
            <div style={{ marginTop: '20px', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
              {candidatosFiltrados.length > 0 ? (
                candidatosFiltrados.map((candidato, index) => {
                  
                  const yaSolicitado = candidato.tiene_solicitud || solicitadosLocales.includes(candidato.id);

                  return (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                      <div>
                        <strong style={{ display: 'block', color: '#445563', fontSize: '16px' }}>{candidato.nombre_completo}</strong>
                        <span style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '8px' }}>
                          {candidato.cargo_postulado} | Origen: <strong>{candidato.origen}</strong>
                        </span>
                        
                        {/* Enlace de CV corregido con SVG para aplicar correctamente el CSS */}
                        <a 
                          href={`http://localhost:3001/uploads/cvs/${candidato.ruta_cv}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="link-descarga-cv"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                          Descargar CV
                        </a>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        
                        {/* Botón de Descartar */}
                        <button className="dash-btn-outline" onClick={() => handleDescartar(candidato.id)}>
                          Descartar
                        </button>
                        
                        {/* Botón de Solicitar Evaluación Dinámico */}
                        <button 
                          className="dash-btn-outline dash-btn-outline-accent"
                          style={{ width: '200px' }}
                          onClick={() => !yaSolicitado && handleSolicitarEvaluacion(candidato.id)}
                          disabled={yaSolicitado}
                        >
                          {yaSolicitado ? '✓ Evaluación Solicitada' : '+ Solicitar Evaluación'}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ textAlign: 'center', color: '#888' }}>
                  {terminoBusqueda ? "No se encontraron candidatos con esa búsqueda." : "No hay candidatos disponibles."}
                </p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}