import React, { useState } from "react";
import "./styles.css";

// Diccionario de familias y sus respectivos cargos
const cargosPorFamilia: Record<string, string[]> = {
  "Profesional A": ["Líder Desarrollo Producción"],
  "Profesional B C": [
    "Analista de Sistemas",
    "Coordinador servicios generales",
  ],
  "Operario Calificado": ["Gruero"],
  "Técnico B C": [
    "Asistente Bodega Planta",
    "Operador Sala Control",
    "Monitor Producción",
  ],
  "Técnico A": ["Tecnico Mantencion Senior"],
  "Supervisor B": ["Supervisor Planta"],
  Jefatura: ["Jefe Area Piscicultura", "Jefe de SSO"],
};

const SolicitudEvaluacionForm = () => {
  // 1. Definición de los estados para los datos del formulario
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

  // 2. Manejador para campos de texto y selects
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Si cambia la familia del cargo, reseteamos el nombre del cargo para evitar inconsistencias
    if (name === "familiaCargo") {
      setFormData({
        ...formData,
        familiaCargo: value,
        nombreCargo: "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  // 3. Manejador para el archivo (Curriculum Vitae)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
      if (errors.cv) {
        setErrors((prevErrors) => ({ ...prevErrors, cv: "" }));
      }
    }
  };

  // 4. Función de Validación del Formulario
  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!formData.nombreCandidato.trim()) {
      nuevosErrores.nombreCandidato = "El nombre del candidato es obligatorio.";
    } else if (formData.nombreCandidato.trim().length < 3) {
      nuevosErrores.nombreCandidato =
        "El nombre debe tener al menos 3 caracteres.";
    } else if (!regexNombre.test(formData.nombreCandidato.trim())) {
      nuevosErrores.nombreCandidato =
        "El nombre no puede contener números ni símbolos.";
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correoCandidato.trim()) {
      nuevosErrores.correoCandidato = "El correo electrónico es obligatorio.";
    } else if (!regexEmail.test(formData.correoCandidato.trim())) {
      nuevosErrores.correoCandidato = "Ingrese un correo electrónico válido.";
    }

    const regexTelefono = /^\+?[0-9]{8,15}$/;
    if (!formData.telefonoCandidato.trim()) {
      nuevosErrores.telefonoCandidato = "El número telefónico es obligatorio.";
    } else if (!regexTelefono.test(formData.telefonoCandidato.trim())) {
      nuevosErrores.telefonoCandidato =
        "Ingrese un número válido (entre 8 y 15 dígitos).";
    }

    // Validar Familia de cargo
    if (!formData.familiaCargo) {
      nuevosErrores.familiaCargo = "Debe seleccionar una familia de cargo.";
    }

    // Validar Nombre del cargo (selección estricta)
    if (!formData.nombreCargo) {
      nuevosErrores.nombreCargo = "Debe seleccionar el nombre del cargo.";
    }

    if (!cvFile) {
      nuevosErrores.cv = "Es obligatorio adjuntar el CV.";
    } else {
      const maxSizeBytes = 5 * 1024 * 1024;
      if (cvFile.size > maxSizeBytes) {
        nuevosErrores.cv =
          "El archivo supera el tamaño máximo permitido de 5 MB.";
      }

      const formatosPermitidos = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      // Usamos indexOf para evitar el error de TypeScript con target antiguo
      if (formatosPermitidos.indexOf(cvFile.type) === -1) {
        nuevosErrores.cv = "Formato no válido. Solo PDF o Word.";
      }
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // 5. Manejador del envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const esValido = validarFormulario();

    if (!esValido) {
      setMessage("Por favor, corrige los errores señalados en el formulario.");
      return;
    }

    setIsSubmitting(true);

    const dataToSend = new FormData();
    dataToSend.append("nombreCandidato", formData.nombreCandidato.trim());
    dataToSend.append("correoCandidato", formData.correoCandidato.trim());
    dataToSend.append("telefonoCandidato", formData.telefonoCandidato.trim());
    dataToSend.append("familiaCargo", formData.familiaCargo);
    dataToSend.append("nombreCargo", formData.nombreCargo);
    dataToSend.append("cv", cvFile as File);

    try {
      console.log("Enviando datos validados al sistema...");

      setTimeout(() => {
        setMessage(
          "Solicitud enviada con éxito. La carpeta del candidato se está creando."
        );
        setIsSubmitting(false);
        setFormData({
          nombreCandidato: "",
          correoCandidato: "",
          telefonoCandidato: "",
          familiaCargo: "",
          nombreCargo: "",
        });
        setCvFile(null);
        setErrors({});
        (e.target as HTMLFormElement).reset();
      }, 2000);
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setMessage("Ocurrió un error al enviar la solicitud.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="formulario-contenedor">
      <h2>Formulario de Solicitud de Evaluación Psicolaboral</h2>
      <p>Ingrese los datos para iniciar el proceso de AquaChile</p>

      {message && (
        <div
          className={`mensaje-feedback ${
            Object.keys(errors).length > 0 ? "mensaje-error-global" : ""
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="formulario-layout" noValidate>
        {/* Campo: Nombre del candidato */}
        <div>
          <label htmlFor="nombreCandidato" className="formulario-label">
            Nombre del candidato:
          </label>
          <input
            type="text"
            id="nombreCandidato"
            name="nombreCandidato"
            value={formData.nombreCandidato}
            onChange={handleInputChange}
            className={`formulario-input ${
              errors.nombreCandidato ? "input-error" : ""
            }`}
            placeholder="Ej. Juan Pérez"
          />
          {errors.nombreCandidato && (
            <span className="texto-error">{errors.nombreCandidato}</span>
          )}
        </div>

        {/* Campo: Correo del candidato */}
        <div>
          <label htmlFor="correoCandidato" className="formulario-label">
            Correo electrónico del candidato:
          </label>
          <input
            type="email"
            id="correoCandidato"
            name="correoCandidato"
            value={formData.correoCandidato}
            onChange={handleInputChange}
            className={`formulario-input ${
              errors.correoCandidato ? "input-error" : ""
            }`}
            placeholder="Ej. juan.perez@ejemplo.com"
          />
          {errors.correoCandidato && (
            <span className="texto-error">{errors.correoCandidato}</span>
          )}
        </div>

        {/* Campo: Teléfono del candidato */}
        <div>
          <label htmlFor="telefonoCandidato" className="formulario-label">
            Teléfono del candidato:
          </label>
          <input
            type="tel"
            id="telefonoCandidato"
            name="telefonoCandidato"
            value={formData.telefonoCandidato}
            onChange={handleInputChange}
            className={`formulario-input ${
              errors.telefonoCandidato ? "input-error" : ""
            }`}
            placeholder="Ej. +56912345678"
          />
          {errors.telefonoCandidato && (
            <span className="texto-error">{errors.telefonoCandidato}</span>
          )}
        </div>

        {/* Campo: Familia de cargo */}
        <div>
          <label htmlFor="familiaCargo" className="formulario-label">
            Familia de cargo:
          </label>
          <select
            id="familiaCargo"
            name="familiaCargo"
            value={formData.familiaCargo}
            onChange={handleInputChange}
            className={`formulario-input ${
              errors.familiaCargo ? "input-error" : ""
            }`}
          >
            <option value="">Seleccione una familia...</option>
            {Object.keys(cargosPorFamilia).map((familia) => (
              <option key={familia} value={familia}>
                {familia}
              </option>
            ))}
          </select>
          {errors.familiaCargo && (
            <span className="texto-error">{errors.familiaCargo}</span>
          )}
        </div>

        {/* Campo: Nombre del cargo (Select dependiente) */}
        <div>
          <label htmlFor="nombreCargo" className="formulario-label">
            Nombre del cargo:
          </label>
          <select
            id="nombreCargo"
            name="nombreCargo"
            value={formData.nombreCargo}
            onChange={handleInputChange}
            className={`formulario-input ${
              errors.nombreCargo ? "input-error" : ""
            }`}
            disabled={!formData.familiaCargo}
          >
            <option value="">Seleccione el cargo...</option>
            {formData.familiaCargo &&
              cargosPorFamilia[formData.familiaCargo].map((cargo) => (
                <option key={cargo} value={cargo}>
                  {cargo}
                </option>
              ))}
          </select>
          {errors.nombreCargo && (
            <span className="texto-error">{errors.nombreCargo}</span>
          )}
        </div>

        {/* Campo: Curriculum Vitae */}
        <div>
          <label htmlFor="cv" className="formulario-label">
            Curriculum Vitae (CV):
          </label>
          <input
            type="file"
            id="cv"
            name="cv"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className={`formulario-file ${errors.cv ? "input-error" : ""}`}
          />
          <small>Formatos permitidos: PDF, DOC, DOCX (Máx 5MB)</small>
          {errors.cv && <span className="texto-error">{errors.cv}</span>}
        </div>

        {/* Botón de envío dinámico */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`boton-enviar ${
            isSubmitting ? "boton-deshabilitado" : ""
          }`}
        >
          {isSubmitting ? "Enviando solicitud..." : "Solicitar Evaluación"}
        </button>
      </form>
    </div>
  );
};

export default SolicitudEvaluacionForm;
