# Agent Task Manager — MERN Stack Assignment

A full-stack web application that lets an admin log in, manage field agents, upload CSV/Excel files and automatically distribute tasks equally among all registered agents.

---

## Tech Stack

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Frontend | React 18 + Vite + Tailwind CSS   |
| Backend  | Node.js + Express.js             |
| Database | MongoDB + Mongoose               |
| Auth     | JWT (JSON Web Tokens) + bcryptjs |
| File     | Multer + csv-parser + xlsx       |

---

## Features

- **Admin Login** — JWT-based authentication with protected routes
- **Agent Management** — Add / view / delete agents with mobile + country code
- **CSV / XLSX Upload** — Drag-and-drop file upload with format validation
- **Automatic Distribution** — Tasks distributed equally (remainder items go round-robin)
- **View Distributed Lists** — Browse upload batches; see each agent's task list in a clean table

---

## Project Structure

```
assignment-internshala/
├── backend/
│   ├── config/           # MongoDB connection
│   ├── controllers/      # Route handlers (auth, agents, lists)
│   ├── middleware/        # JWT auth guard, multer upload
│   ├── models/           # Mongoose schemas (User, Agent, TaskList)
│   ├── routes/           # Express routers
│   ├── utils/            # Seed script for admin user
│   ├── .env              # Environment variables
│   └── server.js         # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/   # DashboardLayout, AddAgentModal
    │   ├── context/      # AuthContext (global auth state)
    │   ├── pages/        # LoginPage, AgentsPage, UploadPage, ListsPage
    │   └── services/     # Axios instance (api.js)
    ├── index.html
    └── vite.config.js    # Dev server + API proxy
```

---

## Prerequisites

- **Node.js** v18 or higher
- **MongoDB** running locally on `mongodb://localhost:27017` (or use MongoDB Atlas — update `MONGO_URI` in `.env`)
- **npm** v9+

---

## Setup & Run

### 1. Clone / open the project

```bash
cd d:\projects\assignment-internshala
```

### 2. Set up the Backend

```bash
cd backend

# Install dependencies
npm install

# (Optional) Edit .env if you want custom values
# The file is already pre-filled with working defaults

# Seed the admin user into the database (run once)
npm run seed

# Start the backend server (port 5000)
npm run dev
```

> **Default admin credentials** (set in `.env`):
>
> - Email: `admin@example.com`
> - Password: `Admin@123`

### 3. Set up the Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (port 5173)
npm run dev
```

### 4. Open the app

Visit **http://localhost:5173** in your browser.

---

## Environment Variables

All variables live in `backend/.env`:

| Variable         | Default                                            | Description                        |
| ---------------- | -------------------------------------------------- | ---------------------------------- |
| `PORT`           | `5000`                                             | Backend server port                |
| `MONGO_URI`      | `mongodb://localhost:27017/internshala_assignment` | MongoDB connection string          |
| `JWT_SECRET`     | `your_super_secret_jwt_key_...`                    | Secret used to sign JWT tokens     |
| `JWT_EXPIRES_IN` | `7d`                                               | Token expiry duration              |
| `ADMIN_EMAIL`    | `admin@example.com`                                | Admin email used by seed script    |
| `ADMIN_PASSWORD` | `Admin@123`                                        | Admin password used by seed script |

---

## API Endpoints

### Auth

| Method | Endpoint          | Auth | Description              |
| ------ | ----------------- | ---- | ------------------------ |
| POST   | `/api/auth/login` | No   | Login and receive JWT    |
| GET    | `/api/auth/me`    | Yes  | Get current user profile |

### Agents

| Method | Endpoint          | Auth | Description        |
| ------ | ----------------- | ---- | ------------------ |
| GET    | `/api/agents`     | Yes  | List all agents    |
| POST   | `/api/agents`     | Yes  | Create a new agent |
| DELETE | `/api/agents/:id` | Yes  | Delete an agent    |

### Lists

| Method | Endpoint                    | Auth | Description                      |
| ------ | --------------------------- | ---- | -------------------------------- |
| POST   | `/api/lists/upload`         | Yes  | Upload file and distribute tasks |
| GET    | `/api/lists`                | Yes  | Get all task lists               |
| GET    | `/api/lists/batches`        | Yes  | Get all upload batches (summary) |
| GET    | `/api/lists/batch/:batchId` | Yes  | Get lists for a specific batch   |

---

## CSV / Excel File Format

The uploaded file must have the following columns (case-insensitive):

| Column      | Type   | Required |
| ----------- | ------ | -------- |
| `FirstName` | Text   | Yes      |
| `Phone`     | Number | Yes      |
| `Notes`     | Text   | No       |

**Sample CSV:**

```csv
FirstName,Phone,Notes
Alice,9876543210,Follow up on Monday
Bob,9123456789,New lead
Charlie,9988776655,
```

Extra columns are ignored. Empty rows are skipped automatically.

---

## Distribution Logic

Tasks from the uploaded file are distributed in **round-robin** order:

```
Agent 1 → item 1, 6, 11, 16 ...
Agent 2 → item 2, 7, 12, 17 ...
...
```

This guarantees that all remaining items (when total is not divisible by the number of agents) are spread sequentially rather than all going to the first agent.

---

## Video Demo

> Add your Google Drive video link here after recording.

---

## License

MIT
