import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles.css";

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [formData, setFormData] = useState({ nombre_completo: "", correo: "", password: "", rol_id: "" });
  const [mensaje, setMensaje] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/usuarios');
      if (res.ok) setUsuarios(await res.json());
    } catch (err) { console.error("Error al cargar usuarios", err); }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/roles');
      if (res.ok) setRoles(await res.json());
    } catch (err) { console.error("Error al cargar roles", err); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_completo || !formData.correo || !formData.password || !formData.rol_id) {
      return setMensaje("Por favor, completa todos los campos.");
    }
    setIsSubmitting(true);
    setMensaje("");
    try {
      const res = await fetch('http://localhost:3001/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMensaje("✅ Usuario creado exitosamente.");
        setFormData({ nombre_completo: "", correo: "", password: "", rol_id: "" });
        fetchUsuarios();
      } else {
        const errorData = await res.json();
        setMensaje(`❌ Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error de conexión al servidor.");
    } finally {
      setIsSubmitting(false);
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
              Configuración / <strong>Gestión de Usuarios</strong>
            </div>
            <h1 className="dash-page-title">Directorio de Cuentas y Accesos</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '20px' }}>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', height: 'fit-content' }}>
                <h3 style={{ marginTop: 0, color: '#445563', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Nuevo Usuario</h3>
                {mensaje && (
                  <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: mensaje.includes('✅') ? '#d4edda' : '#f8d7da', color: mensaje.includes('✅') ? '#155724' : '#721c24', fontSize: '14px' }}>
                    {mensaje}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '15px' }}>
                    <label className="formulario-label">Nombre Completo:</label>
                    <input type="text" name="nombre_completo" value={formData.nombre_completo} onChange={handleInputChange} className="formulario-input" placeholder="Ej. Roberto Evaluador" />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label className="formulario-label">Correo Electrónico:</label>
                    <input type="email" name="correo" value={formData.correo} onChange={handleInputChange} className="formulario-input" placeholder="roberto@ficticio.cl" />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label className="formulario-label">Contraseña de acceso:</label>
                    <input type="text" name="password" value={formData.password} onChange={handleInputChange} className="formulario-input" placeholder="Ej. password123" />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label className="formulario-label">Rol del Sistema:</label>
                    <select name="rol_id" value={formData.rol_id} onChange={handleInputChange} className="formulario-input">
                      <option value="">Seleccione un rol...</option>
                      {roles.map(rol => (
                        <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="boton-enviar" disabled={isSubmitting} style={{ width: '100%' }}>
                    {isSubmitting ? 'Creando...' : 'Crear Usuario'}
                  </button>
                </form>
              </div>

              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <h3 style={{ marginTop: 0, color: '#445563', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Usuarios Registrados</h3>
                {usuarios.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '10px', color: '#445563' }}>ID</th>
                        <th style={{ padding: '10px', color: '#445563' }}>Nombre</th>
                        <th style={{ padding: '10px', color: '#445563' }}>Correo</th>
                        <th style={{ padding: '10px', color: '#445563' }}>Rol</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px', color: '#888' }}>{u.id}</td>
                          <td style={{ padding: '10px', fontWeight: 'bold', color: '#445563' }}>{u.nombre_completo}</td>
                          <td style={{ padding: '10px', color: '#666' }}>{u.correo}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ 
                              padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                              backgroundColor: u.rol.includes('Admin') ? '#e9ecef' : u.rol.includes('Evaluador') ? '#d1ecf1' : '#fff3cd',
                              color: u.rol.includes('Admin') ? '#495057' : u.rol.includes('Evaluador') ? '#0c5460' : '#856404'
                            }}>
                              {u.rol}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: '#888', textAlign: 'center', marginTop: '30px' }}>No hay usuarios registrados o cargando...</p>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}