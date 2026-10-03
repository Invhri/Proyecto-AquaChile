CREATE TABLE Familia_del_cargo (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE Cargo (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    Familia_del_cargo_id INT NOT NULL,
    CONSTRAINT FK_Cargo_Familia FOREIGN KEY (Familia_del_cargo_id) 
        REFERENCES Familia_del_cargo(id)
);

CREATE TABLE Candidato (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(70) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    ruta_cv VARCHAR(255) NOT NULL,
    Cargo_id INT NOT NULL,
    CONSTRAINT FK_Candidato_Cargo FOREIGN KEY (Cargo_id) 
        REFERENCES Cargo(id)
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
