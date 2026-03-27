# Frontend Setup Guide

This project does not have a frontend initialized yet, so the frontend needs to be scaffolded from scratch.

## Recommended Setup

Create a React app with Vite inside `devtrack/frontend`.

From the `devtrack` folder, run:

```powershell
npm create vite@latest frontend
```

Choose:

```text
Framework: React
Variant: JavaScript
```

Then install dependencies:

```powershell
cd frontend
npm install
```

Start the frontend:

```powershell
npm run dev
```

## Suggested Frontend Structure

Create these files first:

- `src/pages/Login.jsx`
- `src/pages/Register.jsx`
- `src/pages/Dashboard.jsx`
- `src/components/ProjectForm.jsx`
- `src/components/ProjectList.jsx`
- `src/services/api.js`

## Backend API To Connect To

Base URL:

```js
const API_BASE = "http://localhost:5000/api";
```

Authentication routes:

- `POST /api/auth/register` with `{ email, password }`
- `POST /api/auth/login` with `{ email, password }`

Project routes:

- `GET /api/project/getAll`
- `POST /api/project/`
- `DELETE /api/project/deleteProjectId=:id`

## Auth Flow

Recommended frontend auth flow:

1. Register or log in with email and password.
2. Save the returned JWT token in `localStorage`.
3. Send `Authorization: Bearer <token>` on protected requests.
4. Use the token for project create, list, and delete requests.

## Backend Notes

- CORS is already enabled in the backend, so the Vite frontend can call the API.
- The backend currently has a bug in `PUT /api/project/updateProjectId=:id`, so project updates may fail until that route is fixed.
- The backend does not currently have a dev script in `backend/package.json`.

To run the backend during frontend development, from `backend` run:

```powershell
npx nodemon server.js
```

## Useful Backend Files

- `backend/server.js`
- `backend/routes/authRoutes.js`
- `backend/routes/projectRoutes.js`
- `backend/middleware/authMiddleware.js`
