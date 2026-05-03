# Team Task Manager

A full-stack **team task management** application: an **Express.js** REST API with **MongoDB**, and a **React (Vite + TypeScript)** web app with role-based UI for **workspace admins** and **members**. Users collaborate in **projects**, manage **tasks** (status, priority, assignees, due dates), see **dashboard** metrics, and receive **in-app notifications**.

---

## Screenshots — admin workspace

Global **admin** users get the full sidebar: admin dashboard, analytics, all projects and tasks, team & roles, and user management. Thumbnails are laid out in pairs so the README stays easy to scan on GitHub.

<table>
  <tr>
    <td width="50%" valign="top" align="center">
      <strong>Admin dashboard</strong><br /><br />
      <img src="https://github.com/user-attachments/assets/eb2b1f2a-981c-4425-b6b4-aec25f4e9d55" alt="Team Task Manager — admin dashboard overview" width="100%" />
    </td>
    <td width="50%" valign="top" align="center">
      <strong>Analytics</strong><br /><br />
      <img src="https://github.com/user-attachments/assets/c4e95530-a554-414f-bed1-0343fefbcad8" alt="Team Task Manager — admin analytics" width="100%" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center">
      <strong>Projects</strong><br /><br />
      <img src="https://github.com/user-attachments/assets/4e5205ab-6112-4e8b-9906-8e106a42cb73" alt="Team Task Manager — admin projects" width="100%" />
    </td>
    <td width="50%" valign="top" align="center">
      <strong>Tasks</strong><br /><br />
      <img src="https://github.com/user-attachments/assets/c1f88e84-3fdf-483c-9c79-491589464a2f" alt="Team Task Manager — admin tasks" width="100%" />
    </td>
  </tr>
  <tr>
    <td colspan="2" valign="top" align="center">
      <strong>Team &amp; workspace</strong><br /><br />
      <img src="https://github.com/user-attachments/assets/655cdc3c-3516-447d-a119-3d7274f4d769" alt="Team Task Manager — admin team and roles" width="85%" />
    </td>
  </tr>
</table>

---

## Screenshots — member workspace

**Members** see a lighter navigation set focused on personal work: my dashboard, my tasks, calendar, projects, teammates, and bookmarks.

<table>
  <tr>
    <td width="50%" valign="top" align="center">
      <strong>My dashboard</strong><br /><br />
      <img src="https://github.com/user-attachments/assets/a3c423e7-51d5-48c1-9907-832c010055fa" alt="Team Task Manager — member dashboard" width="100%" />
    </td>
    <td width="50%" valign="top" align="center">
      <strong>My tasks</strong><br /><br />
      <img src="https://github.com/user-attachments/assets/824964fd-1b0d-4ce3-8cf2-690ab756d0ff" alt="Team Task Manager — member task list" width="100%" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top" align="center">
      <strong>Calendar</strong><br /><br />
      <img src="https://github.com/user-attachments/assets/68a52075-d63f-48ba-a5e1-75df43e072a6" alt="Team Task Manager — member calendar" width="100%" />
    </td>
    <td width="50%" valign="top" align="center">
      <strong>Projects / workspace</strong><br /><br />
      <img src="https://github.com/user-attachments/assets/fbca14a2-72f1-4202-b20a-d1993d4e8201" alt="Team Task Manager — member projects view" width="100%" />
    </td>
  </tr>
</table>

---

## Repository layout

| Path | Description |
|------|-------------|
| **`be/`** | Backend API (Node.js, Express, Mongoose) |
| **`fe/`** | Frontend SPA (React, Vite, shadcn/ui, TanStack Query) |

---

## Tech stack

### Backend (`be/`)

- **Runtime:** Node.js (ES modules)
- **Framework:** Express 4
- **Database:** MongoDB via **Mongoose**
- **Auth:** **JWT** (`Authorization: Bearer <token>`)
- **Validation:** Zod (env and request validation where used)
- **Security:** Helmet, CORS, `express-mongo-sanitize`, bcrypt password hashing
- **Local server:** `src/local-server.js` (HTTP server + `listen`)
- **Serverless (Vercel):** `src/app.js` default-exported Express app (see `be/vercel.json`)

### Frontend (`fe/`)

- **React 18** with **TypeScript**
- **Vite** for dev and build
- **React Router** for client-side routing
- **TanStack Query** (`QueryClientProvider`)
- **shadcn/ui** (Radix primitives), **Tailwind CSS**, **lucide-react** icons
- **Global state:** `AppStore` context (`fe/src/store/AppStore.tsx`) — user session, projects, tasks, dashboard, notifications
- **API client:** `fe/src/lib/apiClient.ts` — `fetch` + JWT from `localStorage`, base URL from **`VITE_API_URL`**

---

## Features

### Authentication & profiles

- Sign up and sign in (JWT stored client-side)
- Update profile (name, email) via authenticated API
- Sign-out confirmation (Alert Dialog)

### Projects & membership

- Create, rename, and delete projects (within permissions)
- List projects the user belongs to; **project roles:** `admin` or `member`
- Invite members by email with a role; remove members
- **Active project** selection (persisted in `localStorage`) drives task list and team views

### Tasks

- Tasks belong to a project: title, description, **status** (`todo` | `in_progress` | `done`), **priority** (`low` | `medium` | `high`), due date, **assignee**
- CRUD for tasks; members can update **their own** task status where the API allows
- Filtering and search (including query param from header search)
- Task **bookmarks** (stored in browser `localStorage` for members)

### Dashboard & analytics

- **Dashboard API** aggregates tasks across the user’s projects: totals, counts by status, per-assignee breakdown, **overdue** count (rules differ for project admins vs members in backend logic)
- Admin UI includes **Analytics** and richer **Admin Dashboard** views; members get a focused **My Dashboard**

### Notifications

- List notifications with unread counts; mark one read or **mark all read**
- Types include task assigned / task created (see `fe/src/types/api.ts`)
- Header bell with polling / refresh on focus

### Admin (global)

- Users with **`role: "admin"`** (application-wide, not only project admin) can access **`/admin/users`**: list users, update, delete (see `be/src/routes/admin.route.js`)

### UI / UX

- Responsive **sidebar** and **header** (search, notifications, user menu)
- Different **navigation sets** for global admin vs member (see `fe/src/components/layout/Sidebar.tsx`)
- Placeholder / **coming soon** style routes where features are stubbed (e.g. some menu items)

---

## API reference (Express)

All JSON routes are mounted under **`/api`** on the backend.

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/health` | No | Liveness check (`{ ok: true }`) |

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/signup` | No | Register; returns token + user |
| `POST` | `/api/auth/login` | No | Login; returns token + user |
| `GET` | `/api/auth/me` | Yes | Current user |
| `PATCH` | `/api/auth/me` | Yes | Update profile |

### Projects — `/api/projects`

All routes require auth.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/projects` | Create project |
| `GET` | `/api/projects` | List my projects |
| `GET` | `/api/projects/:id` | Project detail + members |
| `PATCH` | `/api/projects/:id` | Rename project |
| `DELETE` | `/api/projects/:id` | Delete project |
| `POST` | `/api/projects/:id/members` | Add member (`email`, `role`) |
| `DELETE` | `/api/projects/:id/members/:userId` | Remove member |

### Tasks — `/api/tasks`

All routes require auth; list/create require project membership (and related RBAC middleware).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/tasks/project/:projectId` | List tasks in project |
| `POST` | `/api/tasks/project/:projectId` | Create task |
| `PATCH` | `/api/tasks/:id` | Update task |
| `DELETE` | `/api/tasks/:id` | Delete task |

### Dashboard — `/api/dashboard`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/dashboard` | Yes | Aggregated stats for current user |

### Notifications — `/api/notifications`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/notifications` | List (optional `?unreadOnly=true`) |
| `PATCH` | `/api/notifications/:id/read` | Mark one read |
| `PATCH` | `/api/notifications/read-all` | Mark all read |

### Admin — `/api/admin`

Requires auth + **global admin** middleware.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/users` | List users |
| `PATCH` | `/api/admin/users/:id` | Update user |
| `DELETE` | `/api/admin/users/:id` | Delete user |

---

## Frontend routes (`fe/src/App.tsx`)

| Path | Notes |
|------|--------|
| `/` | Landing or redirect to `/dashboard` if logged in |
| `/login`, `/signup` | Auth |
| `/dashboard` | Role-specific dashboard |
| `/projects` | Projects |
| `/tasks`, `/my-tasks` | Task list (`/my-tasks` for member-focused flow) |
| `/team` | Team / teammates |
| `/settings` | User settings |
| `/admin/users` | Global admin user management |
| `/analytics`, `/calendar`, `/bookmarks` | Analytics, calendar, bookmarks (per product stubs where applicable) |
| `*` | Not found |

Layout with sidebar/header is wrapped in **`AppLayout`** for authenticated app sections.

---

## Configuration

### Backend (`be/`)

- Copy **`be/.env.example`** → **`be/.env`** (local only; never commit secrets).
- Required variables are validated in **`be/src/config/env.js`** (e.g. `MONGO_URI`, `JWT_SECRET` min length 16).
- On **Vercel**, set the same keys in the backend project: **Settings → Environment Variables**, then **Redeploy**.

### Frontend (`fe/`)

- **`VITE_API_URL`**: base URL for the API **including the `/api` path**.
  - **Local (with Vite proxy):** often `"/api"` so requests hit the dev server and proxy to the backend.
  - **Production:** `https://<your-backend-host>/api`.

---

## Local development

### Prerequisites

- Node.js (LTS recommended)
- MongoDB connection string (e.g. Atlas)

### Backend

```bash
cd be
cp .env.example .env   # then edit .env
npm install
npm run dev
```

Default API port comes from **`PORT`** in `be/.env` (see `be/src/config/env.js`).

### Frontend

```bash
cd fe
# set VITE_API_URL in fe/.env (e.g. VITE_API_URL=/api)
npm install
npm run dev
```

Vite dev server is configured in **`fe/vite.config.ts`** (e.g. proxy `/api` → backend).

---

## Deployment notes

- **Backend:** `be/vercel.json` configures the Express entry **`src/app.js`** (e.g. `maxDuration` for serverless). Set env vars on the Vercel backend project; use **Root Directory `be`** if the repo is a monorepo.
- **Frontend:** `fe/vercel.json` sets Vite build output and SPA fallback rewrites to **`index.html`**.

---

## Scripts (quick reference)

| Location | Command | Purpose |
|----------|---------|---------|
| `be/` | `npm run dev` | API with nodemon (`local-server.js`) |
| `be/` | `npm start` | API without watch |
| `fe/` | `npm run dev` | Vite dev server |
| `fe/` | `npm run build` | Production build → `fe/dist` |
| `fe/` | `npm run lint` | ESLint |

---

## License / security

- Keep **`.env` files out of git** (already listed in `.gitignore`).
- Rotate any credentials that were ever committed or pasted in plain text.
- **Do not** embed production `MONGO_URI` or `JWT_SECRET` in source code.
