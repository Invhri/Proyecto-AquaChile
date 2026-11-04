# AquaChile Talentos

Aplicación web para gestionar postulaciones y el proceso de evaluación psicolaboral de candidatos. El sistema permite recibir postulaciones, revisar candidatos, solicitar y asignar evaluaciones, registrar resultados y consultar candidatos por estado.

## Funcionalidades

- Formularios de postulación interna y pública con carga de currículum.
- Listado de candidatos en consideración con acceso a CV, correo y teléfono.
- Solicitud de evaluación psicolaboral para candidatos que aún no tienen una solicitud.
- Asignación de solicitudes pendientes a profesionales evaluadores.
- Registro de resultados de evaluación: aprobado o rechazado, con observaciones.
- Listas de candidatos aprobados y de descartados o reprobados.
- Los candidatos descartados o reprobados se muestran en su lista durante un mes; sus registros no se eliminan de la base de datos.
- Inicio de sesión, administración de usuarios, indicadores y dashboard.

## Tecnologias

- **Frontend:** React 18, TypeScript y React Router.
- **Backend:** Node.js y Express.
- **Base de datos:** PostgreSQL, accedida desde el backend con `pg`.
- **Archivos:** Multer guarda los CV en `aquachile-backend/uploads/cvs`.
- **Pruebas frontend:** Vitest y Testing Library.

## Requisitos

- Node.js y npm.
- PostgreSQL.
- Acceso a una base de datos PostgreSQL local.

## Estructura del proyecto

```text
src/                              Aplicación React
  components/                     Barra superior y navegación
  pages/                          Formularios y pantallas del sistema
database/
  Base de datos Postgre.sql       Esquema inicial de PostgreSQL y datos demo
aquachile-backend/
  server.js                       API Express
  db.js                           Configuración de conexión PostgreSQL
  .env.example                    Plantilla de configuración local
  migrations/                     Migraciones para bases existentes
  uploads/cvs/                    Archivos CV cargados localmente
```

## Configuracion de la base de datos

### Base existente

**No ejecutes `database/Base de datos Postgre.sql` sobre una base que ya contiene datos.** Ese script comienza eliminando las tablas con `DROP TABLE ... CASCADE`, por lo que borraría las tablas y sus registros.

Para actualizar una base existente:

1. Haz un respaldo de la base de datos.
2. Revisa las migraciones de `aquachile-backend/migrations` y aplica solamente las que aun no se hayan ejecutado, en orden por nombre:
   - `20261102_align_evaluacion_schema.sql`: agrega `observaciones` a `Evaluacion` si falta y, cuando existe la columna antigua `resultado`, copia sus datos a `resultado_general` donde corresponda.
   - `20261103_add_candidate_lifecycle.sql`: agrega `estado` y `fecha_cierre` a `Candidato` si faltan y clasifica candidatos con evaluaciones existentes.
3. No es necesario borrar ni recrear tablas.

Las migraciones usan operaciones condicionales para poder ejecutarse en esquemas que ya tengan algunas de las columnas. De todos modos, respalda la base antes de cualquier cambio.

### Base nueva de desarrollo

1. Crea una base de datos vacía en PostgreSQL.
2. Conéctate a esa base y ejecuta `database/Base de datos Postgre.sql`.
3. Ejecuta las migraciones disponibles en `aquachile-backend/migrations` en orden por nombre.

El esquema inicial incluye datos de demostración para cargos, roles y usuarios. Es un script de desarrollo que elimina las tablas existentes antes de crearlas; ejecútalo únicamente en una base desechable o nueva, nunca en una base que quieras conservar.

## Configurar y ejecutar el backend

Desde PowerShell, en la raiz del repositorio:

```powershell
cd aquachile-backend
Copy-Item .env.example .env
```

Edita `aquachile-backend/.env` con los datos de conexion de tu PostgreSQL:

```dotenv
DB_USER=tu_usuario_postgresql
DB_HOST=localhost
DB_NAME=nombre_de_tu_base
DB_PASSWORD=tu_contrasena_local
DB_PORT=5432
```

El archivo `.env` contiene configuración local y está excluido de Git. No subas contraseñas ni credenciales al repositorio.

Instala dependencias e inicia el backend:

```powershell
npm install
npm start
```

Ejecuta estos comandos desde `aquachile-backend`. El API queda disponible en `http://localhost:3001`; puedes verificar la conexion con `GET http://localhost:3001/api/test-db`.

## Ejecutar el frontend

Abre otra terminal en la raiz del repositorio:

```powershell
npm install
npm start
```

El frontend se inicia normalmente en `http://localhost:3000`. Mantén el backend ejecutándose en el puerto `3001` para que la aplicación pueda consultar la base de datos.

## API principal

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/test-db` | Comprueba la conexion con PostgreSQL. |
| `GET` | `/api/candidatos` | Lista candidatos en consideración. |
| `GET` | `/api/candidatos/aprobados` | Lista candidatos aprobados. |
| `GET` | `/api/candidatos/archivados` | Lista descartados o reprobados cerrados durante el último mes. |
| `PATCH` | `/api/candidatos/:id/descartar` | Marca como descartado a un candidato sin solicitud. |
| `POST` | `/api/solicitudes` | Recibe una postulación con CV o crea una solicitud para un candidato existente. |
| `GET` | `/api/solicitudes/pendientes` | Lista solicitudes pendientes de asignación. |
| `GET` | `/api/usuarios/evaluadores` | Lista profesionales evaluadores. |
| `PUT` | `/api/solicitudes/asignar` | Asigna un evaluador a una solicitud. |
| `GET` | `/api/evaluaciones/asignadas?correo=...` | Lista evaluaciones en proceso del evaluador. |
| `POST` | `/api/evaluaciones` | Registra el resultado y finaliza la solicitud. |
| `GET` | `/api/dashboard-kpis` | Devuelve indicadores del dashboard. |
| `GET` | `/api/sidebar-metrics` | Devuelve indicadores de la barra lateral. |
| `POST` | `/api/login` | Inicia sesión. |
| `GET` | `/api/roles` | Lista roles disponibles. |
| `GET` | `/api/usuarios` | Lista usuarios. |
| `POST` | `/api/usuarios` | Crea un usuario. |

Las solicitudes con archivos CV usan `multipart/form-data`. Los CV guardados localmente se sirven desde `/uploads`.

## Pruebas y compilación

Desde la raiz del proyecto:

```powershell
npm test -- --run
npm run build
```

## Equipo

- Richard Hernández
- Martín Rivas

## Notas para despliegue

El esquema incluye usuarios de demostración y el inicio de sesión corresponde a la implementación actual del proyecto. Antes de usar el sistema en producción, reemplaza o elimina las cuentas de demostración y revisa las medidas de seguridad, gestión de credenciales, almacenamiento de CV y configuración de base de datos.
