# AccessHub - Role-Based Verification & User Management Portal

AccessHub is a production-style full-stack Single Page Application (SPA) built with **Angular (v16+)** and **Node.js / Express / MongoDB**. It features robust Role-Based Access Control (RBAC), JWT authentication, Reactive Forms, Route Guards, HTTP Interceptors, artificial API delay simulation, and an automated test suite.

---

## 🌟 Key Features

### Frontend (Angular)
- **Role-Based Access Control (RBAC)**:
  - Dynamic navigation tailored to `ADMIN` vs `GENERAL_USER`.
  - Route Guards (`AuthGuard`, `RoleGuard`) protecting private and administrative routes.
  - Granular action permissions (view, edit, delete records).
- **Reactive Forms & Validation**:
  - Full client-side validation with real-time feedback (pattern, required, length, password confirmation).
- **RxJS / Observables Architecture**:
  - Reactive state management with `BehaviorSubject`.
  - Parallel API aggregation via `forkJoin`.
  - Memory leak protection via `takeUntil(destroy$)`.
  - Live search debounce with `debounceTime(350)` and `distinctUntilChanged()`.
  - HTTP request interceptors automatically attaching `Bearer <token>`.
- **Async API Simulation**:
  - Interactive latency control (0ms, 1000ms, 2000ms, 3000ms) to demonstrate loading spinners and async state transitions.
- **Premium Design System**:
  - Tailored indigo/slate color scheme, micro-animations, glassmorphism overlays, and Inter typography.

### Backend (Node.js & Express)
- **Modular Clean Architecture**: Separated `controllers`, `services`, `models`, `routes`, `middleware`, and `config`.
- **JWT Authentication & Bcrypt Hashing**: Secure token generation with password salting.
- **Role-Based Access Enforcement**: Route-level middleware (`authenticate`, `requireAdmin`).
- **RESTful Endpoints & MongoDB Mongoose Models**:
  - Authentication (`/api/auth/login`)
  - User Directory Management (`/api/users`, `/api/users/stats`, `/api/users/:id/status`)
  - Verification Records CRUD (`/api/records`, `/api/records/stats`)
- **Interactive Swagger Documentation**: Full OpenAPI 3.0 specification available at `/api-docs`.
- **Automated Test Suite**: 14 Jest integration tests verifying authentication, RBAC authorization, and API contracts.

---

## 📋 Demo Credentials

| Role | User ID | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Full administrative access: all records, user management, global platform stats |
| **General User** | `user` | `user123` | Personal records only, view profile, edit own verification items |
| **General User** | `john` | `user123` | Personal records only (3 sample records) |
| **General User** | `sarah` | `user123` | Personal records only (3 sample records) |
| **General User** | `mike` | `user123` | Personal records only (3 sample records) |
| **Inactive User** | `emily` | `user123` | Account disabled (login blocked with 403 Forbidden) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** running on `mongodb://localhost:27017`

### 2. Backend Setup
```bash
cd server
npm install
npm run seed     # Seeds demo users and verification records
npm start        # Starts server on http://localhost:5000
```
- API Health Check: `http://localhost:5000/health`
- Swagger Documentation: `http://localhost:5000/api-docs`

### 3. Frontend Setup
```bash
cd client
npm install
node serve.js    # Serves the built Angular SPA on http://localhost:4200
```
- Application Portal: `http://localhost:4200`

### 4. Running Backend Tests
```bash
cd server
npm test         # Runs 14 automated Jest integration tests
```

---

## 📁 Project Structure

```
MployCheck Task/
├── client/                     # Angular Single Page Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/           # Login Module & Reactive Form
│   │   │   ├── core/           # Guards, Interceptors, Services, Models
│   │   │   ├── dashboard/      # Role-filtered analytics dashboard
│   │   │   ├── records/        # Verification records management & CRUD
│   │   │   ├── admin/          # Administrative user management & status toggles
│   │   │   ├── profile/        # User profile, password update & permissions
│   │   │   ├── layout/         # Shell with Sidebar and Topbar
│   │   │   └── shared/         # Loading spinner, empty state, badges, dialogs
│   │   ├── environments/       # Environment configs (API URLs)
│   │   ├── styles.scss         # Global theme & typography
│   │   └── index.html
│   ├── angular.json
│   ├── package.json
│   └── serve.js                # Production static server with SPA fallback
│
├── server/                     # Node.js & Express REST API
│   ├── src/
│   │   ├── config/             # DB, JWT, environment & Swagger OpenAPI config
│   │   ├── controllers/        # Auth, User, and Record controllers
│   │   ├── middleware/         # Auth (JWT), RBAC role checks, delay simulator
│   │   ├── models/             # Mongoose User and Record schemas
│   │   ├── routes/             # Express API route definitions
│   │   ├── seed/               # Database seeder script
│   │   ├── services/           # Business logic layer
│   │   ├── __tests__/          # Automated Jest integration tests
│   │   ├── app.ts              # Express application factory
│   │   └── server.ts           # HTTP server bootstrap & graceful shutdown
│   ├── jest.config.json
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```
