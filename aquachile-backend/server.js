const express = require('express');
const cors = require('cors');
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// CONFIGURACIÓN DE MULTER (ARCHIVOS Y CVS)
// ==========================================
// Crear la carpeta si no existe automáticamente
const cvDir = path.join(__dirname, 'uploads', 'cvs');
if (!fs.existsSync(cvDir)) {
  fs.mkdirSync(cvDir, { recursive: true });
}

// Exponer la carpeta uploads para poder descargar los CVs desde el frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de Multer para renombrar y guardar el archivo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, cvDir);
  },
  filename: function (req, file, cb) {
    // Agregamos la fecha al nombre para evitar que se sobrescriban archivos con el mismo nombre
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: storage });

// ==========================================
// ENDPOINTS
// ==========================================

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ mensaje: 'Conexión exitosa a PostgreSQL', tiempo: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/candidatos - Obtiene el directorio de candidatos general con el flag de si tiene solicitud
app.get('/api/candidatos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.nombre_completo, c.correo, c.telefono, c.origen, c.ruta_cv, cg.nombre AS cargo_postulado,
             EXISTS(SELECT 1 FROM Solicitud s WHERE s.Candidato_id = c.id) as tiene_solicitud
      FROM Candidato c 
      INNER JOIN Cargo cg ON c.Cargo_id = cg.id 
      WHERE c.estado = 'En consideración'
      ORDER BY c.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener candidatos' });
  }
});

// GET /api/candidatos/aprobados - Candidatos que aprobaron la evaluación psicolaboral
app.get('/api/candidatos/aprobados', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.nombre_completo, c.correo, c.telefono, c.origen, c.ruta_cv,
             cg.nombre AS cargo_postulado
      FROM Candidato c
      INNER JOIN Cargo cg ON c.Cargo_id = cg.id
      WHERE c.estado = 'Aprobado'
      ORDER BY c.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener candidatos aprobados' });
  }
});

// POST /api/solicitudes - Genera la solicitud de evaluación (y el candidato si viene desde el formulario)
app.post('/api/solicitudes', upload.single('cv'), async (req, res) => {
  try {
    // Caso 1: Si solo viene el candidato_id (Lógica para candidatos ya existentes desde CandidatosPage)
    if (req.body.candidato_id) {
      const nuevaSolicitud = await pool.query(
        `INSERT INTO Solicitud (fecha_creacion, estado, Candidato_id)
         SELECT CURRENT_DATE, 'Pendiente', c.id
         FROM Candidato c
         WHERE c.id = $1
           AND c.estado = 'En consideración'
           AND NOT EXISTS (
             SELECT 1 FROM Solicitud s WHERE s.Candidato_id = c.id
           )
         RETURNING *`,
        [req.body.candidato_id]
      );
      if (nuevaSolicitud.rowCount === 0) {
        return res.status(409).json({
          error: 'El candidato ya tiene una solicitud o no está en consideración.'
        });
      }
      return res.status(201).json(nuevaSolicitud.rows[0]);
    }

    // Caso 2: Viene del formulario público/interno con CV adjunto
    const { nombreCandidato, correoCandidato, telefonoCandidato, nombreCargo, origen } = req.body;
    const cvFileName = req.file ? req.file.filename : null;

    if (!cvFileName) {
      return res.status(400).json({ error: 'El archivo CV es obligatorio' });
    }

    // A. Buscar el ID del Cargo por el nombre que seleccionó en el formulario
    const cargoRes = await pool.query('SELECT id FROM Cargo WHERE nombre = $1', [nombreCargo]);
    if (cargoRes.rows.length === 0) {
      return res.status(400).json({ error: 'El cargo seleccionado no existe en la base de datos' });
    }
    const cargoId = cargoRes.rows[0].id;

    // B. Insertar el Candidato
    await pool.query(
      `INSERT INTO Candidato (nombre_completo, correo, telefono, ruta_cv, origen, Cargo_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [nombreCandidato, correoCandidato, telefonoCandidato, cvFileName, origen || 'Externo', cargoId]
    );

    // NOTA CLAVE: Ya NO insertamos una solicitud automáticamente aquí. 
    // Ahora el candidato entra a la bolsa general y Recursos Humanos decidirá si le genera solicitud o no.

    res.status(201).json({ message: 'Postulación y CV guardados con éxito en la base general' });
  } catch (err) {
    console.error("Error al procesar la solicitud:", err.message);
    res.status(500).json({ error: 'Error del servidor al procesar la solicitud' });
  }
});

// GET /api/candidatos/archivados - Descartados o reprobados durante el último mes
app.get('/api/candidatos/archivados', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.nombre_completo, c.correo, c.telefono, c.origen, c.ruta_cv, c.estado,
             TO_CHAR(c.fecha_cierre, 'DD-MM-YYYY') AS fecha_cierre,
             cg.nombre AS cargo_postulado
      FROM Candidato c
      INNER JOIN Cargo cg ON c.Cargo_id = cg.id
      WHERE c.estado IN ('Descartado', 'Reprobado')
        AND c.fecha_cierre >= CURRENT_DATE - INTERVAL '1 month'
      ORDER BY c.fecha_cierre DESC, c.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener candidatos archivados' });
  }
});

// PATCH /api/candidatos/:id/descartar - Marca como descartado sin eliminar su historial
app.patch('/api/candidatos/:id/descartar', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      UPDATE Candidato c
      SET estado = 'Descartado', fecha_cierre = CURRENT_DATE
      WHERE c.id = $1
        AND c.estado = 'En consideración'
        AND NOT EXISTS (
          SELECT 1 FROM Solicitud s WHERE s.Candidato_id = c.id
        )
      RETURNING c.id, c.estado,
                TO_CHAR(c.fecha_cierre, 'DD-MM-YYYY') AS fecha_cierre
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(409).json({
        error: 'El candidato ya tiene una solicitud o no está en consideración.'
      });
    }

    res.json({
      mensaje: 'Candidato descartado exitosamente',
      candidato: result.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al descartar candidato' });
  }
});

// GET /api/solicitudes/pendientes - Lista solicitudes que no tienen evaluador
app.get('/api/solicitudes/pendientes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, c.nombre_completo AS candidato_nombre, cg.nombre AS cargo, 
             TO_CHAR(s.fecha_creacion, 'DD-MM-YYYY') as fecha_creacion
      FROM Solicitud s
      INNER JOIN Candidato c ON s.Candidato_id = c.id
      INNER JOIN Cargo cg ON c.Cargo_id = cg.id
      WHERE s.Usuario_Responsable_id IS NULL AND s.estado = 'Pendiente'
      ORDER BY s.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al cargar solicitudes pendientes' });
  }
});

// GET /api/usuarios/evaluadores - Trae dinámicamente usuarios con Rol 'Profesional Evaluador'
app.get('/api/usuarios/evaluadores', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.nombre_completo 
      FROM Usuario u 
      INNER JOIN Rol r ON u.Rol_id = r.id 
      WHERE r.nombre = 'Profesional Evaluador'
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al cargar evaluadores' });
  }
});

// PUT /api/solicitudes/asignar - Asigna el evaluador a la solicitud
app.put('/api/solicitudes/asignar', async (req, res) => {
  const { solicitud_id, evaluador_id } = req.body;
  try {
    await pool.query(
      `UPDATE Solicitud 
       SET Usuario_Responsable_id = $1, estado = 'En proceso' 
       WHERE id = $2`,
      [evaluador_id, solicitud_id]
    );
    res.json({ mensaje: 'Evaluador asignado correctamente' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al asignar evaluador' });
  }
});

// GET /api/evaluaciones/asignadas - Trae las solicitudes "En proceso" del evaluador logueado
app.get('/api/evaluaciones/asignadas', async (req, res) => {
  const { correo } = req.query;
  try {
    const result = await pool.query(`
      SELECT s.id, c.nombre_completo AS candidato_nombre, cg.nombre AS cargo, 
             TO_CHAR(s.fecha_creacion, 'DD-MM-YYYY') as fecha_asignacion
      FROM Solicitud s
      INNER JOIN Candidato c ON s.Candidato_id = c.id
      INNER JOIN Cargo cg ON c.Cargo_id = cg.id
      INNER JOIN Usuario u ON s.Usuario_Responsable_id = u.id
      WHERE u.correo = $1 AND s.estado = 'En proceso'
      ORDER BY s.id ASC
    `, [correo]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al cargar evaluaciones' });
  }
});

// POST /api/evaluaciones - Guarda el resultado y finaliza la solicitud
app.post('/api/evaluaciones', async (req, res) => {
  const { solicitud_id, resultado, observaciones } = req.body;
  const solicitudId = Number(solicitud_id);

  if (!Number.isInteger(solicitudId) || solicitudId < 1) {
    return res.status(400).json({ error: 'La solicitud indicada no es válida.' });
  }
  if (!['Aprobado', 'Rechazado'].includes(resultado)) {
    return res.status(400).json({ error: 'El resultado debe ser Aprobado o Rechazado.' });
  }
  if (observaciones !== undefined && typeof observaciones !== 'string') {
    return res.status(400).json({ error: 'Las observaciones deben ser texto.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const solicitud = await client.query(
      `SELECT id, Candidato_id FROM Solicitud WHERE id = $1 AND estado = 'En proceso' FOR UPDATE`,
      [solicitudId]
    );

    if (solicitud.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'La solicitud no existe o ya fue finalizada.' });
    }

    await client.query(
      `INSERT INTO Evaluacion (fecha_evaluacion, resultado_general, observaciones, Solicitud_id)
       VALUES (CURRENT_DATE, $1, $2, $3)`,
      [resultado, observaciones || '', solicitudId]
    );

    await client.query(
      `UPDATE Solicitud SET estado = 'Finalizada' WHERE id = $1`,
      [solicitudId]
    );

    await client.query(
      `UPDATE Candidato
       SET estado = CASE WHEN $1 = 'Rechazado' THEN 'Reprobado' ELSE 'Aprobado' END,
           fecha_cierre = CASE WHEN $1 = 'Rechazado' THEN CURRENT_DATE ELSE NULL END
       WHERE id = $2`,
      [resultado, solicitud.rows[0].candidato_id]
    );

    await client.query('COMMIT');
    res.json({ mensaje: 'Evaluación registrada con éxito' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Error al guardar la evaluación' });
  } finally {
    client.release();
  }
});

// GET /api/sidebar-metrics - Métricas dinámicas para el Sidebar
app.get('/api/sidebar-metrics', async (req, res) => {
  try {
    const candidatos = await pool.query('SELECT COUNT(*) FROM Candidato');
    const solicitudesActivas = await pool.query("SELECT COUNT(*) FROM Solicitud WHERE estado = 'Pendiente'");
    const evaluacionesPendientes = await pool.query("SELECT COUNT(*) FROM Solicitud WHERE estado = 'En proceso'");

    const ingresos = await pool.query(`
      SELECT COUNT(*) FROM Evaluacion 
      WHERE resultado_general = 'Aprobado' 
      AND EXTRACT(MONTH FROM fecha_evaluacion) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM fecha_evaluacion) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    const totalEvaluaciones = await pool.query('SELECT COUNT(*) FROM Evaluacion');
    const totalAprobados = await pool.query("SELECT COUNT(*) FROM Evaluacion WHERE resultado_general = 'Aprobado'");
    
    let efectividadCalc = 0;
    const countTotal = parseInt(totalEvaluaciones.rows[0].count);
    const countAprobados = parseInt(totalAprobados.rows[0].count);
    
    if (countTotal > 0) {
      efectividadCalc = Math.round((countAprobados / countTotal) * 100);
    }

    res.json({
      candidatos: parseInt(candidatos.rows[0].count),
      solicitudesActivas: parseInt(solicitudesActivas.rows[0].count),
      evaluacionesPendientes: parseInt(evaluacionesPendientes.rows[0].count),
      efectividad: efectividadCalc,
      ingresosMes: parseInt(ingresos.rows[0].count)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener métricas dinámicas' });
  }
});

// GET /api/dashboard-kpis - Conteo exacto y Porcentajes
app.get('/api/dashboard-kpis', async (req, res) => {
  try {
    const candidatosRes = await pool.query('SELECT COUNT(*) FROM Candidato');
    const solTotalesRes = await pool.query('SELECT COUNT(*) FROM Solicitud');
    const solPendientesRes = await pool.query("SELECT COUNT(*) FROM Solicitud WHERE estado = 'Pendiente'");
    const solEnProcesoRes = await pool.query("SELECT COUNT(*) FROM Solicitud WHERE estado = 'En proceso'");
    
    const evalTotalesRes = await pool.query('SELECT COUNT(*) FROM Evaluacion');
    const evalAprobadosRes = await pool.query("SELECT COUNT(*) FROM Evaluacion WHERE resultado_general = 'Aprobado'");

    const totales = parseInt(candidatosRes.rows[0].count);
    const abiertas = parseInt(solPendientesRes.rows[0].count);
    const pendientes = parseInt(solEnProcesoRes.rows[0].count);
    const aprobados = parseInt(evalAprobadosRes.rows[0].count);

    const totalSol = parseInt(solTotalesRes.rows[0].count);
    const totalEval = parseInt(evalTotalesRes.rows[0].count);

    const porcentajeAprobados = totalEval > 0 ? Math.round((aprobados / totalEval) * 100) : 0;
    const porcentajeEsperando = totalSol > 0 ? Math.round((abiertas / totalSol) * 100) : 0;
    const porcentajeEnProceso = totalSol > 0 ? Math.round((pendientes / totalSol) * 100) : 0;

    res.json({
      totales, abiertas, pendientes, aprobados,
      porcentajeAprobados, porcentajeEsperando, porcentajeEnProceso
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener KPIs del dashboard' });
  }
});

// Endpoint para iniciar sesión
app.post('/api/login', async (req, res) => {
  const { correo, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT u.id, u.nombre_completo, u.correo, r.nombre AS rol 
       FROM Usuario u 
       INNER JOIN Rol r ON u.Rol_id = r.id 
       WHERE u.correo = $1 AND u.password = $2`,
      [correo, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error del servidor al intentar iniciar sesión' });
  }
});
// ==========================================
// MÓDULO DE ADMINISTRACIÓN DE USUARIOS
// ==========================================

// GET /api/roles - Obtener lista de roles para el select del formulario
app.get('/api/roles', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre FROM Rol ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
});

// GET /api/usuarios - Obtener la lista de usuarios registrados
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.nombre_completo, u.correo, r.nombre AS rol 
      FROM Usuario u 
      INNER JOIN Rol r ON u.Rol_id = r.id 
      ORDER BY u.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// POST /api/usuarios - Crear un nuevo usuario
app.post('/api/usuarios', async (req, res) => {
  const { nombre_completo, correo, password, rol_id } = req.body;
  try {
    // Verificar si el correo ya está en uso
    const userExists = await pool.query('SELECT id FROM Usuario WHERE correo = $1', [correo]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado en el sistema' });
    }

    // Insertar el nuevo usuario (Guardamos la password en texto plano como lo has estado haciendo para las pruebas)
    const newUser = await pool.query(
      'INSERT INTO Usuario (nombre_completo, correo, password, Rol_id) VALUES ($1, $2, $3, $4) RETURNING id, nombre_completo',
      [nombre_completo, correo, password, rol_id]
    );
    res.status(201).json({ mensaje: 'Usuario creado con éxito', usuario: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error interno al crear usuario' });
  }
});

app.listen(3001, () => {
  console.log('Servidor backend corriendo en puerto 3001');
});