import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles.css";

export default function CandidatosPage() {
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [candidatosAprobados, setCandidatosAprobados] = useState<any[]>([]);
  const [candidatosArchivados, setCandidatosArchivados] = useState<any[]>([]);
  const [errorCarga, setErrorCarga] = useState("");
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const terminoBusqueda = queryParams.get("q")?.toLowerCase() || "";

  useEffect(() => {
    const fetchCandidatos = async () => {
      try {
        const [resActivos, resAprobados, resArchivados] = await Promise.all([
          fetch('http://localhost:3001/api/candidatos'),
          fetch('http://localhost:3001/api/candidatos/aprobados'),
          fetch('http://localhost:3001/api/candidatos/archivados')
        ]);
        if (!resActivos.ok || !resAprobados.ok || !resArchivados.ok) {
          throw new Error("No se pudieron cargar las listas de candidatos.");
        }

        const [activos, aprobados, archivados] = await Promise.all([
          resActivos.json(),
          resAprobados.json(),
          resArchivados.json()
        ]);
        setCandidatos(activos);
        setCandidatosAprobados(aprobados);
        setCandidatosArchivados(archivados);
      } catch (err) {
        console.error("Error al cargar candidatos:", err);
        setErrorCarga("No se pudieron cargar los candidatos. Intenta nuevamente más tarde.");
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

  const candidatosAprobadosFiltrados = useMemo(() => {
    if (!terminoBusqueda) return candidatosAprobados;
    return candidatosAprobados.filter(c =>
      c.nombre_completo.toLowerCase().includes(terminoBusqueda) ||
      (c.cargo_postulado && c.cargo_postulado.toLowerCase().includes(terminoBusqueda)) ||
      c.origen.toLowerCase().includes(terminoBusqueda)
    );
  }, [candidatosAprobados, terminoBusqueda]);

  const handleSolicitarEvaluacion = async (idCandidato: number) => {
    try {
      const res = await fetch('http://localhost:3001/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidato_id: idCandidato })
      });
      if (res.ok) {
        alert("Solicitud generada exitosamente. El candidato pasará al área de asignación.");
        setCandidatos(candidatos.map(candidato =>
          candidato.id === idCandidato ? { ...candidato, tiene_solicitud: true } : candidato
        ));
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al generar la solicitud.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al solicitar la evaluación.");
    }
  };

  const handleDescartar = async (idCandidato: number) => {
    if(window.confirm("¿Seguro que deseas descartar a este candidato? Se conservará en la lista de descartados durante un mes.")) {
      try {
        const res = await fetch(`http://localhost:3001/api/candidatos/${idCandidato}/descartar`, { method: 'PATCH' });
        if (res.ok) {
          const data = await res.json();
          const descartado = candidatos.find(candidato => candidato.id === idCandidato);
          setCandidatos(candidatos.filter(candidato => candidato.id !== idCandidato));
          if (descartado) {
            setCandidatosArchivados([
              { ...descartado, ...data.candidato },
              ...candidatosArchivados
            ]);
          }
        } else {
          const errorData = await res.json();
          alert(errorData.error || "Error al descartar.");
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Error de conexión al descartar al candidato.");
      }
    }
  };

  const candidatosArchivadosFiltrados = useMemo(() => {
    if (!terminoBusqueda) return candidatosArchivados;
    return candidatosArchivados.filter(c =>
      c.nombre_completo.toLowerCase().includes(terminoBusqueda) ||
      (c.cargo_postulado && c.cargo_postulado.toLowerCase().includes(terminoBusqueda)) ||
      c.origen.toLowerCase().includes(terminoBusqueda)
    );
  }, [candidatosArchivados, terminoBusqueda]);

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

            {errorCarga && <p role="alert" style={{ color: '#b42318' }}>{errorCarga}</p>}

            <h2 style={{ marginTop: '20px', color: '#445563', fontSize: '18px' }}>Candidatos en consideración</h2>
            <div style={{ marginTop: '20px', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
              {candidatosFiltrados.length > 0 ? (
                candidatosFiltrados.map((candidato, index) => {
                  const yaSolicitado = candidato.tiene_solicitud;

                  return (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                      <div>
                        <strong style={{ display: 'block', color: '#445563', fontSize: '16px' }}>{candidato.nombre_completo}</strong>
                        <span style={{ fontSize: '13px', color: '#888', display: 'block', marginBottom: '8px' }}>
                          {candidato.cargo_postulado} | Origen: <strong>{candidato.origen}</strong>
                        </span>
                        <span style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '8px' }}>
                          Correo: {candidato.correo} | Teléfono: {candidato.telefono}
                        </span>
                        
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
                        
                        <button
                          className="dash-btn-outline"
                          onClick={() => handleDescartar(candidato.id)}
                          disabled={yaSolicitado}
                          title={yaSolicitado ? "No se puede descartar porque ya tiene una solicitud de evaluación." : undefined}
                        >
                          Descartar
                        </button>
                        
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

            <h2 style={{ marginTop: '28px', color: '#445563', fontSize: '18px' }}>
              Candidatos aprobados
            </h2>
            <div style={{ marginTop: '20px', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
              {candidatosAprobadosFiltrados.length > 0 ? (
                candidatosAprobadosFiltrados.map(candidato => (
                  <div key={candidato.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#445563', fontSize: '16px' }}>{candidato.nombre_completo}</strong>
                      <span style={{ fontSize: '13px', color: '#888', display: 'block' }}>
                        {candidato.cargo_postulado} | Origen: <strong>{candidato.origen}</strong>
                      </span>
                      <span style={{ fontSize: '13px', color: '#666', display: 'block' }}>
                        Correo: {candidato.correo} | Teléfono: {candidato.telefono}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#888' }}>
                  {terminoBusqueda
                    ? "No se encontraron candidatos aprobados con esa búsqueda."
                    : "No hay candidatos aprobados."}
                </p>
              )}
            </div>

            <h2 style={{ marginTop: '28px', color: '#445563', fontSize: '18px' }}>
              Candidatos descartados o que reprobaron la evaluación
            </h2>
            <div style={{ marginTop: '20px', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
              {candidatosArchivadosFiltrados.length > 0 ? (
                candidatosArchivadosFiltrados.map(candidato => (
                  <div key={candidato.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#445563', fontSize: '16px' }}>{candidato.nombre_completo}</strong>
                      <span style={{ fontSize: '13px', color: '#888', display: 'block' }}>
                        {candidato.cargo_postulado} | Origen: <strong>{candidato.origen}</strong>
                      </span>
                      <span style={{ fontSize: '13px', color: '#666', display: 'block' }}>
                        Correo: {candidato.correo} | Teléfono: {candidato.telefono}
                      </span>
                      <span style={{ fontSize: '13px', color: '#888' }}>
                        {candidato.estado === 'Descartado' ? 'Descartado' : 'Reprobó la evaluación'} | Fecha: {candidato.fecha_cierre}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#888' }}>
                  {terminoBusqueda
                    ? "No se encontraron candidatos archivados con esa búsqueda."
                    : "No hay candidatos descartados o reprobados durante el último mes."}
                </p>
              )}
              <p style={{ margin: '12px 0 0', textAlign: 'center', color: '#888', fontSize: '12px' }}>
                Esta lista muestra únicamente cierres del último mes.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}