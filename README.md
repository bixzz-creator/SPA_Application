# AccessHub - Role-Based Verification & User Management Portal

AccessHub is a production-style full-stack Single Page Application (SPA) built with **Angular (v16+)**, **Node.js / Express**, and **MongoDB Atlas**. It features enterprise-grade Role-Based Access Control (RBAC), JWT authentication, Reactive Forms, Route Guards, HTTP Interceptors, artificial API latency simulation, and an automated integration test suite.

---

## 🌐 Live Cloud Deployment

| Component | Service | Live URL | Status |
| :--- | :--- | :--- | :--- |
| **Frontend SPA** | Render Static Site | **[https://spa-application-1.onrender.com](https://spa-application-1.onrender.com)** | 🟢 Online |
| **Backend API** | Render Web Service | **[https://spa-application.onrender.com](https://spa-application.onrender.com)** | 🟢 Online |
| **API Health Check** | Express Endpoint | **[https://spa-application.onrender.com/health](https://spa-application.onrender.com/health)** | 🟢 200 OK |
| **Swagger API Docs** | OpenAPI 3.0 Interactive | **[https://spa-application.onrender.com/api-docs](https://spa-application.onrender.com/api-docs)** | 🟢 Interactive |
| **Cloud Database** | MongoDB Atlas | Cluster `accesshub.0dwc8be.mongodb.net` | 🟢 Connected |

---

## 📋 Demo Credentials & Role Access

Use any of the seeded demo accounts below to experience the application across roles:

| Role | User ID | Password | Role Selection | Permissions & Behavior |
| :--- | :--- | :--- | :--- | :--- |
| 🛡️ **Administrator** | `admin` | `admin123` | **Admin** | **Full Access**: View all 13 enterprise records across all owners, create/edit/delete any record, access Admin User Management tab, toggle user active/inactive status, view aggregate platform metrics. |
| 👤 **General User** | `user` | `user123` | **General User** | **Restricted Access**: View and manage only self-owned verification records. Cannot access the Admin User Management panel (blocked by `RoleGuard` and backend RBAC). |
| 👤 **General User** | `john` | `user123` | **General User** | Personal records only (3 sample verification items). |
| 👤 **General User** | `sarah` | `user123` | **General User** | Personal records only (3 sample verification items). |
| 👤 **General User** | `mike` | `user123` | **General User** | Personal records only (3 sample verification items). |
| 🚫 **Inactive User** | `emily` | `user123` | **General User** | **Deactivated Account**: Login attempt blocked with `403 Forbidden` demonstrating inactive account lockdown. |

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| Feature / Action | Administrator (`ADMIN`) | General User (`GENERAL_USER`) | Enforced At |
| :--- | :---: | :---: | :--- |
| **View Dashboard Metrics** | ✅ Global platform totals | ✅ Personal record counts | Client + API (`/api/records/stats`) |
| **View All Records** | ✅ All owners (13+ records) | ❌ Restricted to own records | API (`RecordService.findAll` vs `findByUser`) |
| **Create New Record** | ✅ Supported | ✅ Supported | API (`POST /api/records`) |
| **Edit Any Record** | ✅ All records | ❌ Only self-owned records | API ownership verification middleware |
| **Delete Any Record** | ✅ Supported | ❌ Admin only | API (`DELETE /api/records/:id`) |
| **Admin User Directory** | ✅ Visible & accessible | ❌ Hidden & guarded (`RoleGuard`) | Route Guard + API (`requireAdmin`) |
| **Toggle User Status** | ✅ Active ⇄ Inactive | ❌ Forbidden | API (`PATCH /api/users/:id/status`) |
| **API Latency Simulator** | ✅ 0ms to 3000ms delay | ✅ 0ms to 3000ms delay | Express delay middleware (`?delay=ms`) |

---

## 🌟 Architecture & Highlights

### 1. Frontend (Angular 16)
- **Modular Architecture**: Feature modules (`AuthModule`, `DashboardModule`, `RecordsModule`, `AdminModule`, `ProfileModule`, `LayoutModule`, and `SharedModule`) with lazy routing.
- **Route Guards & Interceptors**:
  - `AuthGuard`: Prevents unauthenticated access; remembers `returnUrl`.
  - `RoleGuard`: Verifies role requirements before activating administrative routes.
  - `AuthInterceptor`: Automatically attaches JWT `Bearer` token to all outgoing API requests.
- **RxJS Reactive State**:
  - `BehaviorSubject` for reactive authentication state management.
  - `forkJoin` for aggregated dashboard metrics.
  - `takeUntil(destroy$)` for comprehensive memory leak prevention.
  - `debounceTime(350)` and `distinctUntilChanged()` on record searches.
- **Async Delay Demonstration**: Topbar delay selector (`0ms`, `1000ms`, `2000ms`, `3000ms`) allows real-time evaluation of loading spinners, skeleton states, and asynchronous stream handling.

### 2. Backend (Node.js + Express + TypeScript)
- **Clean Layered Architecture**: Strict separation of concerns across `controllers`, `services`, `models`, `routes`, `middleware`, and `config`.
- **JWT & Bcrypt**: Password hashing with salted rounds and signed JWT authentication.
- **RESTful Endpoints & Validation**: Validated request payloads using `express-validator`.
- **MongoDB Atlas Integration**: Mongoose schemas with indexed user IDs and soft-deletion/status flags.
- **Automated Integration Tests**: 14 Jest integration tests in `server/src/__tests__/api.test.ts` verifying authentication, role enforcement, ownership protection, and latency simulation.

---

## 🛠️ Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/bixzz-creator/SPA_Application.git
cd SPA_Application
```

### 2. Backend API Setup
```bash
cd server
npm install
npm run seed     # Populates demo accounts & verification records in MongoDB
npm run dev      # Starts development API server on http://localhost:5000
```
- Local Health Check: `http://localhost:5000/health`
- Local Swagger UI: `http://localhost:5000/api-docs`

### 3. Frontend Angular Setup
```bash
cd ../client
npm install
npm run serve    # Serves the compiled Angular SPA on http://localhost:4200
```
- Open application: `http://localhost:4200`

### 4. Running Backend Integration Tests
```bash
cd ../server
npm test
```
*Executes all 14 test suites covering auth, RBAC permissions, and API endpoints.*

---

## 📁 Repository Structure

```
SPA_Application/
├── client/                     # Angular 16 Single Page Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/           # Login form & reactive validation
│   │   │   ├── core/           # Guards, interceptors, services, models
│   │   │   ├── dashboard/      # Role-based dashboard analytics
│   │   │   ├── records/        # Verification records management table & modal
│   │   │   ├── admin/          # Admin user directory & status toggles
│   │   │   ├── profile/        # User profile & credentials view
│   │   │   ├── layout/         # Shell, navigation sidebar & topbar
│   │   │   └── shared/         # Loading spinner, badges, dialogs
│   │   ├── environments/       # Environment configs (development & production)
│   │   ├── styles.scss         # Theme styling & layout variables
│   │   └── index.html
│   ├── angular.json            # Angular CLI configuration with esbuild builder
│   ├── package.json
│   └── serve.js                # Local SPA server with HTML5 fallback routing
│
├── server/                     # Express.js + TypeScript API
│   ├── src/
│   │   ├── config/             # Database connection, JWT & Swagger OpenAPI spec
│   │   ├── controllers/        # Auth, User, and Record controllers
│   │   ├── middleware/         # Auth (JWT), RBAC role check, delay middleware
│   │   ├── models/             # Mongoose User and Record schemas
│   │   ├── routes/             # Express API route declarations
│   │   ├── seed/               # Database seeder script
│   │   ├── services/           # Business logic layer
│   │   ├── __tests__/          # 14 Jest integration test cases
│   │   ├── app.ts              # Express application factory
│   │   └── server.ts           # Server bootstrap & process lifecycle
│   ├── jest.config.json
│   ├── tsconfig.json
│   └── package.json
│
├── AccessHub_Implementation_Plan.pdf  # Comprehensive 4-page architecture blueprint
├── AccessHub_Implementation_Plan.html # Printable implementation document
└── README.md                          # Project documentation
```

---

## 📄 Implementation Plan Deliverable

A complete 4-page printable architecture and execution plan is included in the root directory:
- 📑 **PDF Document**: [`AccessHub_Implementation_Plan.pdf`](AccessHub_Implementation_Plan.pdf)
- 🌐 **HTML Version**: [`AccessHub_Implementation_Plan.html`](AccessHub_Implementation_Plan.html)
