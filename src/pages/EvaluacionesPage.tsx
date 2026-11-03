import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles.css";

export default function EvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [evaluacionActiva, setEvaluacionActiva] = useState<any>(null);
  const [resultado, setResultado] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("usuario_autenticado") || "{}");
    const fetchEvaluaciones = async () => {
      if (!auth.correo) return;
      try {
        const res = await fetch(`http://localhost:3001/api/evaluaciones/asignadas?correo=${auth.correo}`);
        if (res.ok) setEvaluaciones(await res.json());
      } catch (err) { console.error("Error al cargar evaluaciones:", err); }
    };
    fetchEvaluaciones();
  }, []);

  const handleAbrirEvaluacion = (ev: any) => {
    setEvaluacionActiva(ev);
    setResultado("");
    setObservaciones("");
  };

  const handleGuardarEvaluacion = async () => {
    if (!resultado) return alert("Debe seleccionar Aprobado o Rechazado.");
    const confirmar = window.confirm(`¿Está seguro de registrar a ${evaluacionActiva.candidato_nombre} como ${resultado.toUpperCase()}?\n\nEsta acción finalizará el proceso y no se puede deshacer.`);
    if (!confirmar) return;
    
    try {
      const res = await fetch('http://localhost:3001/api/evaluaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solicitud_id: evaluacionActiva.id, resultado, observaciones })
      });
      if (res.ok) {
        alert("Evaluación registrada exitosamente. La solicitud ha sido finalizada.");
        setEvaluaciones(evaluaciones.filter(e => e.id !== evaluacionActiva.id));
        setEvaluacionActiva(null);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Error al guardar la evaluación.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor.");
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
              Reclutamiento & Selección / Procesos Vigentes / <strong>Evaluaciones</strong>
            </div>
            <h1 className="dash-page-title">Evaluaciones Pendientes</h1>
            <p style={{ fontSize: '14px', color: '#666' }}>Postulantes asignados a tu bandeja para evaluación psicolaboral.</p>

            <div style={{ marginTop: '20px', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
              {evaluaciones.length > 0 ? (
                evaluaciones.map((ev, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#445563' }}>{ev.candidato_nombre}</strong>
                      <span style={{ fontSize: '13px', color: '#888' }}>Cargo: {ev.cargo} | Asignado el: {ev.fecha_asignacion}</span>
                    </div>
                    <button className="dash-btn-outline dash-btn-outline-accent" onClick={() => handleAbrirEvaluacion(ev)}>Evaluar</button>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#888' }}>No tienes evaluaciones pendientes en este momento.</p>
              )}
            </div>
          </section>

          {evaluacionActiva && (
            <aside className="dash-right-panel" aria-label="Ficha de evaluación">
              <div className="panel-header">
                <div className="panel-heading">
                  <span className="panel-badge">EVALUACIÓN PSICOLABORAL</span>
                  <h2 className="panel-title">Ficha de evaluación</h2>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar ficha de evaluación"
                  onClick={() => setEvaluacionActiva(null)}
                >
                  ×
                </button>
              </div>

              <div className="panel-candidate-card">
                <span className="panel-field-caption">CANDIDATO</span>
                <h3 className="panel-candidato-nombre">{evaluacionActiva.candidato_nombre}</h3>
                <p className="panel-candidato-cargo">{evaluacionActiva.cargo}</p>
              </div>

              <section className="panel-seccion">
                <div className="panel-section-heading">
                  <span className="panel-section-icon" aria-hidden="true">✓</span>
                  <div>
                    <h3 className="panel-seccion-titulo">Resultado</h3>
                    <p className="panel-section-description">Registra el dictamen y agrega un resumen de la evaluación.</p>
                  </div>
                </div>

                <div className="panel-form-field">
                  <label htmlFor="evaluation-result">Dictamen final</label>
                  <select
                    id="evaluation-result"
                    className="panel-input"
                    value={resultado}
                    onChange={(e) => setResultado(e.target.value)}
                  >
                    <option value="">-- Seleccionar --</option>
                    <option value="Aprobado">✅ Aprobado</option>
                    <option value="Rechazado">❌ Rechazado</option>
                  </select>
                </div>

                <div className="panel-form-field">
                  <label htmlFor="evaluation-notes">Observaciones</label>
                  <textarea
                    id="evaluation-notes"
                    className="panel-input panel-textarea"
                    rows={5}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Escribe un resumen de los aspectos relevantes..."
                  />
                </div>
              </section>

              <div className="panel-footer-actions">
                <button type="button" className="dash-btn-outline" onClick={() => setEvaluacionActiva(null)}>Cancelar</button>
                <button type="button" className="dash-btn-primary" onClick={handleGuardarEvaluacion}>Guardar y finalizar</button>
              </div>
            </aside>
          )}
        </main>
      </div>
    </div>
  );
}