CREATE TABLE Familia_del_cargo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE Cargo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    Familia_del_cargo_id INT NOT NULL,
    CONSTRAINT FK_Cargo_Familia FOREIGN KEY (Familia_del_cargo_id) REFERENCES Familia_del_cargo(id)
);

CREATE TABLE Candidato (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(70) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    ruta_cv VARCHAR(255) NOT NULL,
    origen VARCHAR(20) DEFAULT 'Externo',
    Cargo_id INT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'En consideración',
    fecha_cierre DATE,
    CONSTRAINT FK_Candidato_Cargo FOREIGN KEY (Cargo_id) REFERENCES Cargo(id)
);

CREATE TABLE Rol (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE Usuario (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(70) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    Rol_id INT NOT NULL,
    CONSTRAINT FK_Usuario_Rol FOREIGN KEY (Rol_id) REFERENCES Rol(id)
);

CREATE TABLE Solicitud (
    id SERIAL PRIMARY KEY,
    fecha_creacion DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'Pendiente',
    observaciones TEXT,
    Candidato_id INT NOT NULL,
    Usuario_Responsable_id INT,
    CONSTRAINT FK_Solicitud_Candidato FOREIGN KEY (Candidato_id) REFERENCES Candidato(id),
    CONSTRAINT FK_Solicitud_Usuario FOREIGN KEY (Usuario_Responsable_id) REFERENCES Usuario(id)
);

CREATE TABLE Evaluacion (
    id SERIAL PRIMARY KEY,
    fecha_evaluacion DATE NOT NULL,
    resultado_general TEXT,
    observaciones TEXT,
    Solicitud_id INT NOT NULL,
    CONSTRAINT FK_Evaluacion_Solicitud FOREIGN KEY (Solicitud_id) REFERENCES Solicitud(id)
);

INSERT INTO Familia_del_cargo (nombre) VALUES 
('Profesional A'),
('Profesional B C'),
('Operario Calificado'),
('Técnico B C'),
('Técnico A'),
('Supervisor B'),
('Jefatura');

INSERT INTO Cargo (nombre, Familia_del_cargo_id) VALUES 
('Líder Desarrollo Producción', 1),
('Analista de Sistemas', 2),
('Coordinador servicios generales', 2),
('Gruero', 3),
('Asistente Bodega Planta', 4),
('Operador Sala Control', 4),
('Monitor Producción', 4),
('Tecnico Mantencion Senior', 5),
('Supervisor Planta', 6),
('Jefe Area Piscicultura', 7),
('Jefe de SSO', 7);

INSERT INTO Rol (nombre) VALUES
('Administrador académico'),
('Analista de Reclutamiento'),
('Profesional Evaluador'),
('Jefatura o contraparte simulada');

INSERT INTO Usuario (nombre_completo, correo, password, Rol_id) VALUES
('Carmen Analista', 'carmen.analista@ficticio.cl', 'password123', 2),
('Roberto Evaluador', 'roberto.evaluador@ficticio.cl', 'password123', 3),
('Lucía Psicóloga', 'lucia.psicologa@ficticio.cl', 'password123', 3),
('Admin Pruebas', 'admin@ficticio.cl', 'password123', 1);
