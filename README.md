# -MediTrackX-A-Smart-Digital-Platform-for-Biomedical-Waste-Collection-Segregation-and-Traceability-

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-0D9488.svg)](https://reactjs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-green.svg)](https://www.mongodb.com/atlas)
[![UI Design](https://img.shields.io/badge/Design-Healthcare%20SaaS%20Dark%20Glass-1E40AF.svg)]()
[![License](https://img.shields.io/badge/License-ISC-blue.svg)]()

> **Full Academic Project Title**: *“MediTrackX: A Smart Digital Platform for Biomedical Waste Collection, Segregation and Traceability”*

---

## 1. Executive Summary & Problem Statement

Healthcare facilities generate diverse categories of hazardous biomedical waste (infectious materials, sharps, pathological organs, cytotoxic chemicals, and pharmaceuticals) that must be safely segregated at the point of origin, monitored in real time, collected under chain-of-custody protocols, and transported without human hazard or environmental exposure.

### Legacy Hospital Dilemmas
* **Manual & Paper-based Logging**: Vulnerable to omissions, tampering, and missing compliance manifests.
* **Lack of End-to-End Traceability**: Inability to verify which nurse or technician logged a bag, which collector picked it up, and when terminal incineration/autoclaving occurred.
* **Bin Overfill Incidents**: No real-time warning when high-hazard sharps or biohazardous receptacles exceed capacity.
* **Siloed Communication**: Delayed dispatch between hospital floor stations and certified biowaste collectors.

### The MediTrackX Solution
**MediTrackX** transforms hospital biowaste handling into a centralized, modern cloud SaaS ecosystem. It pairs dynamic category segregation, smart bin fill telemetry, multi-party workflow handoffs, cryptographic-style audit timelines, and MongoDB Atlas analytical aggregations into an intuitive, responsive interface.

---

## 2. Technology Stack

### Frontend Architecture
* **Library / Runtime**: React 19 + Vite 8
* **Styling**: Tailwind CSS with custom Healthcare SaaS dark-glass tokens (`#070E1A` navy base, translucent cards, `#0D9488` teal accents)
* **Routing**: React Router DOM (protected routes with role-based guard middleware)
* **API Client**: Axios with automatic JWT bearer injection and session expiration handling
* **Icons**: Lucide React
* **Data Visualization**: Recharts (dynamic area trends, category segregation donuts, departmental horizontal bars)

### Backend Architecture
* **Runtime**: Node.js v22 (ES Modules)
* **Framework**: Express.js
* **Database & ORM**: MongoDB Atlas via Mongoose
* **Security & Auth**: JSON Web Tokens (JWT) + bcrypt password hashing + Role-Based Access Control (RBAC)
* **Logging**: Morgan HTTP logger

---

## 3. Core Role-Based Capabilities

| Role | Core Capabilities |
| :--- | :--- |
| **System Administrator** | Complete system governance, hospital facility onboarding, user provisioning, waste category standardization, cross-facility smart bin oversight, global waste ledger inspection, collector dispatching, MongoDB Atlas analytics, and audit CSV exports. |
| **Hospital Staff** | Point-of-origin waste logging with auto-generated IDs (`MW-2026-XXXXXX`), ward-level smart bin telemetry monitoring, collection request creation with multi-batch selection, and tracking lifecycle views. |
| **Biowaste Collector** | Operations dashboard, assignment acceptance, collection transit initiation, custody handoff signing with notes/tamper seals, and terminal disposal confirmation. |

---

## 4. End-to-End Collection Workflow

```text
[Hospital Staff]
       │
       ▼
1. Log Biomedical Waste (Generates MW-YYYY-XXXXXX, creates TrackingRecord, updates Smart Bin)
       │
       ▼
2. Create Collection Request (Selects batches, status: "Pending", generates CR-YYYY-XXXXXX)
       │
       ▼
[System Admin]
       │
       ▼
3. Assign Collector (Dispatches active collector, status: "Assigned", logs timestamp)
       │
       ▼
[Waste Collector]
       │
       ▼
4. Accept Assignment (Status: "Accepted")
       │
       ▼
5. Start Collection (Status: "Collecting", items marked "In Transit")
       │
       ▼
6. Mark Waste Collected (Status: "Collected", resets linked bin capacity levels to Active)
       │
       ▼
7. Complete Disposal (Status: "Completed", waste status: "Disposed", stores tamper notes)
```

---

## 5. Repository Structure

```text
MediTrackX/
├── client/                      # Frontend Application (React + Vite + Tailwind)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # GlassCard, StatCard, ProgressBar, StatusBadge, Timeline, Modal, etc.
│   │   │   └── layout/          # Navbar, Sidebar, MobileNav, Layout wrapper
│   │   ├── context/             # AuthContext, NotificationContext
│   │   ├── pages/
│   │   │   ├── admin/           # AdminDashboard, Hospitals, Bins, Categories, Users, Waste, Reports
│   │   │   ├── hospital/        # HospitalDashboard, HospitalWaste, HospitalBins, HospitalRequests
│   │   │   ├── collector/       # CollectorDashboard, CollectorAssignments, CollectorHistory
│   │   │   ├── common/          # WasteDetail, CollectionDetail, TraceabilitySearch, Profile, 404
│   │   │   └── auth/            # Login, Register
│   │   ├── routes/              # ProtectedRoute, AppRoutes
│   │   ├── services/            # Axios API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                      # Backend REST API (Node + Express + Mongoose)
│   ├── config/
│   │   └── db.js                # MongoDB Atlas connection helper
│   ├── controllers/             # auth, hospital, bin, category, waste, collection, report, tracking, etc.
│   ├── middleware/              # authMiddleware, roleMiddleware, errorMiddleware
│   ├── models/                  # User, Hospital, Bin, WasteCategory, WasteRecord, CollectionRequest, etc.
│   ├── routes/                  # Express API subroutes
│   ├── seed/
│   │   └── seed.js              # Comprehensive demo seed data script
│   ├── utils/                   # generateId, apiResponse
│   ├── server.js                # Express app entrypoint
│   ├── package.json
│   └── .env.example
│
├── .gitignore
├── package.json                 # Monorepo root script runner
└── README.md
```

---

## 6. Installation & Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher (v22 recommended)
* **npm**: v9.0.0 or higher
* **MongoDB Atlas Account**: A cloud cluster with connection credentials

### Step 1: Clone and Configure Environment

In `server/.env`:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/meditrackx?retryWrites=true&w=majority

# JWT Encryption Secret Key
JWT_SECRET=your_super_secure_jwt_secret_key_2026

# Server Port & Allowed Client URL
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

*(Refer to `server/.env.example` as a template. Never commit your `.env` to version control).*

### Step 2: Install Dependencies

From the project root:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 3: Populate Development Database (Seed Script)

Run the automated seeder to load healthcare facilities, biohazard categories, smart bins, historical waste records, collection workflows, and user accounts:

```bash
cd server
node seed/seed.js
# or from root: npm run seed
```

### Step 4: Run the Application

#### Start Backend API Server:
```bash
cd server
npm run dev
# Server starts on http://localhost:5000 (Health Check: http://localhost:5000/api/health)
```

#### Start Frontend Client (in a separate terminal):
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

---

## 7. Development & Demo Credentials

The seed script initializes three accounts for testing:

| Role | Email Address | Password | Facility Affiliation |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@example.com` | `Admin@123` | Global Administration |
| **Hospital Staff** | `hospital@example.com` | `Hospital@123` | Apex Super Specialty Hospital |
| **Biowaste Collector** | `collector@example.com` | `Collector@123` | Certified Hazardous Transport |

*(The login screen also features 1-click quick-fill buttons for immediate evaluation).*

---

## 8. REST API Reference Overview

### Authentication
* `POST /api/auth/register` — Create user / hospital staff account
* `POST /api/auth/login` — Authenticate and receive JWT token
* `GET  /api/auth/me` — Retrieve active user session profile
* `PUT  /api/auth/profile` — Update account profile details & credentials

### Healthcare Facilities
* `GET    /api/hospitals` — List registered facilities
* `POST   /api/hospitals` — Register hospital *(Admin only)*
* `GET    /api/hospitals/:id` — Hospital details
* `PUT    /api/hospitals/:id` — Update hospital *(Admin only)*
* `DELETE /api/hospitals/:id` — Remove hospital *(Admin only)*

### Waste Categories
* `GET    /api/categories` — List segregation categories
* `POST   /api/categories` — Add category *(Admin only)*
* `PUT    /api/categories/:id` — Update category *(Admin only)*
* `DELETE /api/categories/:id` — Delete category *(Admin only)*

### Smart Bins
* `GET    /api/bins` — List bins (filtered by facility for hospital staff)
* `POST   /api/bins` — Deploy bin *(Admin & Staff)*
* `PUT    /api/bins/:id` — Update bin fill telemetry / status
* `DELETE /api/bins/:id` — Remove bin *(Admin only)*

### Biomedical Waste Records
* `GET    /api/waste` — Query waste ledger (search, category, status, date filters, pagination)
* `POST   /api/waste` — Log segregated waste batch (auto-generates `MW-2026-XXXXXX` and tracking record)
* `GET    /api/waste/:id` — Waste record details & digital tracking timeline
* `PUT    /api/waste/:id` — Edit logged waste *(Creator / Admin)*
* `DELETE /api/waste/:id` — Remove waste record *(Admin only)*

### Collection Orders & Workflow
* `GET    /api/collections` — List collection orders
* `POST   /api/collections` — Create pickup request (`CR-2026-XXXXXX`)
* `GET    /api/collections/:id` — Collection order details and full timeline
* `PUT    /api/collections/:id/assign` — Assign collector *(Admin only)*
* `PATCH  /api/collections/:id/status` — Lifecycle transition (`Accepted`, `Collecting`, `Collected`, `Completed`)

### Digital Traceability & Audit Logs
* `GET /api/tracking/:identifier` — Comprehensive chain of custody audit timeline by `MW-...` or `CR-...`

### Reports & Compliance
* `GET /api/reports/dashboard` — Aggregated KPI metrics
* `GET /api/reports/analytics` — MongoDB aggregation charts (category, hospital, department, daily trends)
* `GET /api/reports/export/csv` — Stream downloadable CSV manifest

---

## 9. Future AI & Hardware Roadmap (Architecture-Ready)

MediTrackX was engineered with an open RESTful contract to support future hardware expansions without refactoring core business logic:

1. **AI Computer Vision**: Integration with camera edge nodes (`POST /api/ai/classify-waste`) to automatically detect sharps vs infectious materials and prevent bin contamination.
2. **IoT Smart Bin Telemetry**: Direct ingestion from ultrasonic fill-level and weight load-cell sensors (`POST /api/iot/bins/:binId/telemetry`).
3. **GPS Fleet Monitoring**: Real-time vehicle location and route geofencing for hazardous transport trucks (`POST /api/gps/location`).
4. **Autonomous Hospital Robots**: Automated task assignment for indoor autonomous mobile robots (AMRs) transporting biowaste from operating rooms to staging bays.

---

## 10. License

This project is licensed under the ISC License. Designed and developed as a modern healthcare management platform.
