import React, { useState } from "react";
import "../styles.css";

const cargosPorFamilia: Record<string, string[]> = {
  "Profesional A": ["Líder Desarrollo Producción"],
  "Profesional B C": ["Analista de Sistemas", "Coordinador servicios generales"],
  "Operario Calificado": ["Gruero"],
  "Técnico B C": ["Asistente Bodega Planta", "Operador Sala Control", "Monitor Producción"],
  "Técnico A": ["Tecnico Mantencion Senior"],
  "Supervisor B": ["Supervisor Planta"],
  Jefatura: ["Jefe Area Piscicultura", "Jefe de SSO"],
};

const SolicitudEvaluacionForm = () => {
  const [formData, setFormData] = useState({
    nombreCandidato: "",
    correoCandidato: "",
    telefonoCandidato: "",
    familiaCargo: "",
    nombreCargo: "",
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "familiaCargo") {
      setFormData({ ...formData, familiaCargo: value, nombreCargo: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
      if (errors.cv) setErrors((prev) => ({ ...prev, cv: "" }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    
    if (!formData.nombreCandidato.trim()) nuevosErrores.nombreCandidato = "Obligatorio.";
    else if (formData.nombreCandidato.trim().length < 3) nuevosErrores.nombreCandidato = "Mínimo 3 caracteres.";
    else if (!regexNombre.test(formData.nombreCandidato.trim())) nuevosErrores.nombreCandidato = "Solo letras.";

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correoCandidato.trim()) nuevosErrores.correoCandidato = "Obligatorio.";
    else if (!regexEmail.test(formData.correoCandidato.trim())) nuevosErrores.correoCandidato = "Correo inválido.";

    const regexTelefono = /^\+?[0-9]{8,15}$/;
    if (!formData.telefonoCandidato.trim()) nuevosErrores.telefonoCandidato = "Obligatorio.";
    else if (!regexTelefono.test(formData.telefonoCandidato.trim())) nuevosErrores.telefonoCandidato = "Número inválido.";

    if (!formData.familiaCargo) nuevosErrores.familiaCargo = "Seleccione familia.";
    if (!formData.nombreCargo) nuevosErrores.nombreCargo = "Seleccione cargo.";

    if (!cvFile) nuevosErrores.cv = "CV obligatorio.";
    else {
      if (cvFile.size > 5 * 1024 * 1024) nuevosErrores.cv = "Máximo 5 MB.";
      const permitidos = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (permitidos.indexOf(cvFile.type) === -1) nuevosErrores.cv = "Solo PDF o Word.";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (!validarFormulario()) {
      setMessage("Por favor, corrige los errores.");
      return;
    }

    setIsSubmitting(true);
    const dataToSend = new FormData();
    dataToSend.append("nombreCandidato", formData.nombreCandidato.trim());
    dataToSend.append("correoCandidato", formData.correoCandidato.trim());
    dataToSend.append("telefonoCandidato", formData.telefonoCandidato.trim());
    dataToSend.append("familiaCargo", formData.familiaCargo);
    dataToSend.append("nombreCargo", formData.nombreCargo);
    dataToSend.append("origen", "Interno"); 
    dataToSend.append("cv", cvFile as File);

    try {
      const response = await fetch('http://localhost:3001/api/solicitudes', {
        method: 'POST',
        body: dataToSend,
      });

      if (response.ok) {
        setMessage("Solicitud enviada con éxito.");
        setFormData({ nombreCandidato: "", correoCandidato: "", telefonoCandidato: "", familiaCargo: "", nombreCargo: "" });
        setCvFile(null);
        setErrors({});
        (e.target as HTMLFormElement).reset();
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error de conexión con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="formulario-contenedor">
      <h2>Formulario de Solicitud de Evaluación Psicolaboral (Interno)</h2>
      <p>Ingrese los datos para iniciar el proceso de AquaChile</p>

      {message && <div className={`mensaje-feedback ${Object.keys(errors).length > 0 ? "mensaje-error-global" : ""}`}>{message}</div>}

      <form onSubmit={handleSubmit} className="formulario-layout" noValidate>
        <div>
          <label className="formulario-label">Nombre del candidato:</label>
          <input type="text" name="nombreCandidato" value={formData.nombreCandidato} onChange={handleInputChange} className={`formulario-input ${errors.nombreCandidato ? "input-error" : ""}`} />
          {errors.nombreCandidato && <span className="texto-error">{errors.nombreCandidato}</span>}
        </div>
        <div>
          <label className="formulario-label">Correo electrónico:</label>
          <input type="email" name="correoCandidato" value={formData.correoCandidato} onChange={handleInputChange} className={`formulario-input ${errors.correoCandidato ? "input-error" : ""}`} />
          {errors.correoCandidato && <span className="texto-error">{errors.correoCandidato}</span>}
        </div>
        <div>
          <label className="formulario-label">Teléfono:</label>
          <input type="tel" name="telefonoCandidato" value={formData.telefonoCandidato} onChange={handleInputChange} className={`formulario-input ${errors.telefonoCandidato ? "input-error" : ""}`} />
          {errors.telefonoCandidato && <span className="texto-error">{errors.telefonoCandidato}</span>}
        </div>
        <div>
          <label className="formulario-label">Familia de cargo:</label>
          <select name="familiaCargo" value={formData.familiaCargo} onChange={handleInputChange} className={`formulario-input ${errors.familiaCargo ? "input-error" : ""}`}>
            <option value="">Seleccione...</option>
            {Object.keys(cargosPorFamilia).map((fam) => <option key={fam} value={fam}>{fam}</option>)}
          </select>
          {errors.familiaCargo && <span className="texto-error">{errors.familiaCargo}</span>}
        </div>
        <div>
          <label className="formulario-label">Nombre del cargo:</label>
          <select name="nombreCargo" value={formData.nombreCargo} onChange={handleInputChange} className={`formulario-input ${errors.nombreCargo ? "input-error" : ""}`} disabled={!formData.familiaCargo}>
            <option value="">Seleccione...</option>
            {formData.familiaCargo && cargosPorFamilia[formData.familiaCargo].map((cargo) => <option key={cargo} value={cargo}>{cargo}</option>)}
          </select>
          {errors.nombreCargo && <span className="texto-error">{errors.nombreCargo}</span>}
        </div>
        <div>
          <label className="formulario-label">Curriculum Vitae (CV):</label>
          <input type="file" name="cv" accept=".pdf,.doc,.docx" onChange={handleFileChange} className={`formulario-file ${errors.cv ? "input-error" : ""}`} />
          <small>Formatos: PDF, DOC, DOCX (Máx 5MB)</small>
          {errors.cv && <span className="texto-error">{errors.cv}</span>}
        </div>
        <button type="submit" disabled={isSubmitting} className={`boton-enviar ${isSubmitting ? "boton-deshabilitado" : ""}`}>
          {isSubmitting ? "Enviando..." : "Solicitar Evaluación"}
        </button>
      </form>
    </div>
  );
};

export default SolicitudEvaluacionForm;