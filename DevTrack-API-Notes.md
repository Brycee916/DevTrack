# DevTrack API and Feature Notes

## Project Overview: DevTrack

The backend is a Node/Express/PostgreSQL app with auth + project management endpoints.

- `backend/server.js`
  - `/api/auth` for authentication
  - `/api/project` for project CRUD
- `backend/db/db.js` database pool config via `.env`
- `backend/middleware/authMiddleware.js` JWT auth guard
- `backend/routes/authRoutes.js` register/login/getAllUsers
- `backend/routes/projectRoutes.js` create/get/delete/update projects by user

## Existing API Endpoints

### Authentication
- `POST /api/auth/register` body `{ email, password }` creates user
- `POST /api/auth/login` body `{ email, password }` returns JWT token
- `GET /api/auth/getAllUsers` protected, returns users

### Projects (protected via Bearer token)
- `POST /api/project/` body `{ title, description, status, priority }` create project
- `GET /api/project/getAll` list authenticated user projects
- `DELETE /api/project/deleteProjectId=:id` delete project by id
- `PUT /api/project/updateProjectId=:id` update project by id

## Immediate Code Fixes and Stabilization
- `projectRoutes` has SQL bug in update: `UPDATE TABLE projects` should be `UPDATE projects SET ...`
- normalize routes to REST style (`/api/project/:id`)
- add validation (Joi/Zod), strong enums for status and priority
- combine queries in login and reduce user enumeration risk

## Enhancement / Business Ideas
- team collaboration with roles (owner/editor/viewer)
- project history/audit log endpoint
- subtasks, comments, due date, assignee
- kanban board API (`/api/board` etc.)
- webhooks + third-party integrations (Slack, email)
- analytics dashboard APIs
- OAuth2/SSO, 2FA, enterprise audit as premium offerings

## Business Model Opportunities
- freemium: basic tracking + premium team/collab features
- paid connectors for tools (GitHub, Asana) and webhooks
- reporting/metrics add-on
- workflow automation as subscription tier
- specialized variants: freelancer/agency, enterprise turnover
