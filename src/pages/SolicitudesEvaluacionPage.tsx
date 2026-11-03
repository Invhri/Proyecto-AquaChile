import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles.css";

export default function SolicitudesEvaluacionPage() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [evaluadores, setEvaluadores] = useState<any[]>([]);
  const [seleccionados, setSeleccionados] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/solicitudes/pendientes');
        if (res.ok) setSolicitudes(await res.json());
      } catch (err) { console.error("Error al cargar solicitudes:", err); }
    };
    const fetchEvaluadores = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/usuarios/evaluadores');
        if (res.ok) setEvaluadores(await res.json());
      } catch (err) { console.error("Error al cargar evaluadores:", err); }
    };
    fetchSolicitudes();
    fetchEvaluadores();
  }, []);

  const handleSelectChange = (solicitudId: number, evaluadorId: string) => {
    setSeleccionados({ ...seleccionados, [solicitudId]: parseInt(evaluadorId) });
  };

  const handleAsignar = async (solicitudId: number) => {
    const evaluadorId = seleccionados[solicitudId];
    if (!evaluadorId) return alert("Por favor, seleccione un evaluador antes de asignar.");

    try {
      const res = await fetch('http://localhost:3001/api/solicitudes/asignar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solicitud_id: solicitudId, evaluador_id: evaluadorId })
      });
      if (res.ok) {
        alert("Evaluador asignado correctamente.");
        setSolicitudes(solicitudes.filter(s => s.id !== solicitudId));
      } else alert("Error al asignar el evaluador.");
    } catch (err) {
      console.error(err);
      alert("Error de conexión al asignar evaluador.");
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
              Reclutamiento & Selección / Procesos Vigentes / <strong>Asignación de Evaluaciones</strong>
            </div>
            <h1 className="dash-page-title">Solicitudes Pendientes de Asignación</h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Seleccione un profesional evaluador para cada candidato aprobado.
            </p>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
              {solicitudes.length > 0 ? (
                solicitudes.map((sol) => (
                  <div key={sol.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#445563', fontSize: '16px' }}>{sol.candidato_nombre}</strong>
                      <span style={{ fontSize: '14px', color: '#888' }}>Cargo: {sol.cargo} | Solicitado: {sol.fecha_creacion}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <select className="formulario-input" style={{ margin: 0, width: '250px' }} value={seleccionados[sol.id] || ""} onChange={(e) => handleSelectChange(sol.id, e.target.value)}>
                        <option value="">-- Seleccionar Evaluador --</option>
                        {evaluadores.map(ev => (
                          <option key={ev.id} value={ev.id}>{ev.nombre_completo}</option>
                        ))}
                      </select>
                      <button className="dash-btn-primary" onClick={() => handleAsignar(sol.id)}>Asignar</button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#888' }}>No hay solicitudes pendientes de asignación.</p>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}