# SGF Workspace Instructions

This workspace contains two applications. Keep changes within the relevant application unless a task explicitly spans both.

## Application layout

- `sgf-api/` is the AdonisJS 6 API, written in TypeScript and backed by MySQL through Lucid ORM. Routes are registered in `start/routes.ts`; the code is organized into controllers, services, models, validators, migrations, and seeders. The API includes security and plan/budget modules.
- `sgf-web/` is a React 17 single-page application built with Create React App. Routes are configured in `src/index.js`; page layouts and features live under `src/layouts/`, `src/views/`, and `src/components/`. It uses React Router 5 and has both Material UI v4 and MUI v6 dependencies, so follow the conventions of the specific component being changed.

## Working conventions

- Read the relevant application code and nearby tests before changing behavior. Preserve existing naming and API contracts unless the task requires a contract change.
- Keep API request validation in Vine validators and database access in the established Lucid model/service patterns. Check route registration and authentication middleware when changing an endpoint.
- Keep frontend changes compatible with React 17 and the existing React Router 5 setup. Reuse nearby components, styling, and UI libraries rather than introducing a new framework.
- Do not commit credentials, service-account keys, or environment-specific configuration. Use the application's environment configuration for secrets and deployment settings.
- Avoid unrelated formatting and cleanup. Add or update focused tests when practical.

## Commands

Run commands from the application directory being changed:

- API dependencies: `npm install` in `sgf-api/`.
- API development server: `npm run dev` in `sgf-api/` (requires configured MySQL and environment variables).
- API tests: `npm test` in `sgf-api/` (may require configured test services and database).
- API type check: `npm run typecheck` in `sgf-api/`.
- API lint: `npm run lint` in `sgf-api/`.
- Web development server: `npm start` in `sgf-web/`.
- Web tests: `npm test -- --watchAll=false` in `sgf-web/`.
- Web production build: `npm run build` in `sgf-web/`.

The API README documents MySQL setup and migrations. Do not run destructive database commands such as migration reset/fresh unless the task explicitly requires it and the target database is known to be disposable.