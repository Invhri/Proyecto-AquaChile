# Sistema de Solicitud de Evaluacion Psicolaboral - AquaChile

## Descripcion del Proyecto
Este proyecto es una plataforma web desarrollada para automatizar el proceso de solicitudes de evaluacion psicolaboral de candidatos en AquaChile. El sistema cuenta con un formulario que captura los datos del postulante, valida los formatos de documentos (Curriculum Vitae) y maneja dependencias jerarquicas entre familias de cargos y cargos especificos. 

El objetivo final de la aplicacion es integrar esta captura de datos con el ecosistema de Microsoft (SQL Server, SharePoint y Planner) mediante flujos de automatizacion.

## Tecnologias Utilizadas
* **Frontend:** React con TypeScript.
* **Base de Datos:** Microsoft SQL Server (T-SQL).
* **Integraciones Proyectadas:** Microsoft Power Automate, SharePoint, Microsoft Planner.

## Estructura del Repositorio
* **/src:** Contiene el codigo fuente de la aplicacion React, incluyendo los componentes del formulario, estilos y validaciones.
* **/database:** Almacena los recursos de base de datos como codigo (Database as Code).
  * `esquema_y_datos.sql`: Script de creacion de tablas y poblado de datos iniciales.
  * `diagrama_relacional.png`: Modelo fisico de la base de datos.

## Configuracion de la Base de Datos
Para inicializar la base de datos localmente y habilitar las opciones del formulario, es necesario ejecutar el script SQL proporcionado.

1. Abrir Microsoft SQL Server Management Studio (SSMS) u otro cliente de base de datos.
2. Conectarse a la instancia de base de datos local.
3. Abrir el archivo `/database/esquema_y_datos.sql`.
4. Ejecutar el script. Esto creara las tablas `Familia_del_cargo`, `Cargo` y `Candidato`, e insertara los datos estaticos necesarios para poblar los menus desplegables dependientes.

## Ejecucion del Frontend
Para levantar el entorno de desarrollo del formulario en React:

1. Abrir una terminal en la raiz del proyecto.
2. Instalar las dependencias ejecutando:
   ```bash
   npm install
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm start
   ```
4. El formulario estara disponible en el navegador local (generalmente en `http://localhost:3000` o `http://localhost:5173`).

## Proximos Pasos (En Desarrollo)
* **Endpoint de Integracion:** Reemplazar la simulacion de envio en el formulario por una peticion HTTP real hacia un Webhook (Power Automate o backend Node.js).
* **Gestion de Archivos:** Habilitar el almacenamiento automatico del documento adjunto (Curriculum Vitae) en una ruta especifica de SharePoint/OneDrive.
* **Tareas Automaticas:** Configurar la generacion de tickets de seguimiento en Microsoft Planner una vez que el registro en la base de datos sea exitoso.
