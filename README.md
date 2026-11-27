# AWS Cloud Monitor React

Dashboard demostrativo para gestionar trabajo con un tablero Kanban y visualizar actividad de una aplicación preparada para desplegarse en AWS. Las tareas se guardan en `localStorage`; el acceso demo permite explorar el tablero sin configurar una cuenta.

## Arquitectura

- **Frontend:** React 18 y Vite. Vite genera los archivos estáticos en `dist/`.
- **Backend:** Express en `server.js`. Expone `GET /health` para comprobaciones de salud y `GET /api/metrics` para telemetría básica; también puede servir `dist/`.
- **AWS:** `amplify.yml` configura la instalación y compilación del frontend para AWS Amplify. Elastic Beanstalk puede ejecutar el servidor Express mediante `npm start`, con `/health` como health check. La publicación del frontend en Amplify y del backend en Elastic Beanstalk son destinos posibles y no quedan desplegados por el workflow de CI de este repositorio.
- **Integración continua:** GitHub Actions instala dependencias con `npm ci`, ejecuta Vitest y construye el frontend en cada cambio dirigido a `main`.

## Kanban-XP: historia y aceptación

**Historia de usuario:** Como integrante de un equipo ágil, quiero registrar tareas, asignarles prioridad y moverlas por un tablero Kanban, para dar seguimiento al trabajo del equipo.

**Criterios de aceptación:**

- El usuario puede entrar al modo demo y ver las columnas Por Hacer, En Proceso y Finalizadas.
- Una tarea con título y prioridad válidos se agrega a Por Hacer y queda guardada localmente.
- Si se intenta agregar un título vacío, se muestra un mensaje de error visible y no se crea una tarea.
- El tablero impide superar el límite WIP de tres tareas en En Proceso.
- Las pruebas automatizadas cubren el alta correcta y el error de entrada vacía.

## Requisitos

- Node.js 20 o superior y npm.
- Git para trabajar con ramas y Pull Requests.
- Para publicar en AWS, acceso a las aplicaciones de Amplify y/o Elastic Beanstalk correspondientes. El workflow solo verifica que exista el secreto `AWS_DEPLOY_ENV`; no realiza por sí mismo el despliegue.

## Uso local

```bash
npm install
npm run dev
npm test
npm run build
npm start
```

Vite muestra la URL local al ejecutar `npm run dev` (puerto 3000 por defecto). `npm start` sirve la compilación ya generada desde `dist/` y expone la comprobación en `http://localhost:8080/health` (o en el puerto definido por `PORT`). Para ejecutar ambas variantes, usa terminales separadas y compila antes de iniciar Express.

## Ramas y revisión

- `main` contiene la versión integrada y debe mantenerse desplegable.
- Cada cambio se desarrolla en una rama `feat/<nombre>`.
- Se abre un Pull Request hacia `main`; GitHub Actions debe completar pruebas y build antes de integrar.
- Al menos un compañero revisa el cambio, valida los criterios de aceptación y aprueba el Pull Request.
- Tras resolver observaciones y recibir aprobación, se integra el Pull Request en `main`.

## Rollback

1. Identifica el último commit o artefacto conocido como estable y detén la promoción del cambio que causó el incidente.
2. En Amplify, vuelve a desplegar la última versión correcta desde el historial de despliegues o revierte el commit y publica de nuevo.
3. En Elastic Beanstalk, selecciona una versión de aplicación previamente estable y vuelve a desplegarla en el entorno afectado.
4. Comprueba `/health`, la carga del frontend y los flujos principales del tablero.
5. Registra el incidente y prepara la corrección en una nueva rama `feat/*` con su Pull Request y validación de CI.