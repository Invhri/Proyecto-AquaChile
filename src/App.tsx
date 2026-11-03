import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FormularioPublico from "./pages/FormularioPublicoPage";
import DashboardPage from "./pages/DashboardPage";
import Login from "./pages/LoginPage";
import FormularioInternoPage from "./pages/FormularioInternoPage";
import CandidatosPage from "./pages/CandidatosPage";
import SolicitudesEvaluacionPage from "./pages/SolicitudesEvaluacionPage";
import EvaluacionesPage from "./pages/EvaluacionesPage";
import AdminUsuariosPage from "./pages/AdminUsuariosPage"; // <-- Importamos la nueva página

// Componente para proteger páginas privadas
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const usuarioAuth = localStorage.getItem("usuario_autenticado");
  if (!usuarioAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta por defecto: Redirige al Login cuando entran a la raíz */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Rutas Públicas */}
        <Route path="/postular" element={<FormularioPublico />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas Privadas protegidas por localStorage (Dashboard y flujos de RRHH) */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/formulario-interno" 
          element={
            <ProtectedRoute>
              <FormularioInternoPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/candidatos" 
          element={
            <ProtectedRoute>
              <CandidatosPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Rutas conectadas a la barra lateral */}
        <Route 
          path="/solicitudes" 
          element={
            <ProtectedRoute>
              <SolicitudesEvaluacionPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/evaluaciones" 
          element={
            <ProtectedRoute>
              <EvaluacionesPage />
            </ProtectedRoute>
          } 
        />

        {/* Ruta de Administración (Solo para Administrador académico) */}
        <Route 
          path="/admin-usuarios" 
          element={
            <ProtectedRoute>
              <AdminUsuariosPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;