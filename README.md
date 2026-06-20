# Project AquaGuard
### Smart Water Infrastructure Monitoring & Management Platform

AquaGuard is a full-stack, enterprise-grade operations dashboard and resource monitoring platform for a national water utility. It provides municipal operators, utility managers, and technicians with live observability over water reservoirs, pumps, pipelines, smart meters, sensors, and maintenance schedules.

---

## 1. Directory Structure

```text
Project-AquaGuard-CaseStudy68/
├── architecture/                     # System Diagrams
│   ├── system-architecture.png
│   ├── deployment-architecture.png
│   ├── ci-cd-architecture.png
│   └── observability-architecture.png
├── backend/                          # Express REST API Server
│   ├── src/
│   │   ├── db.js                     # Postgres Client & Mock Simulator
│   │   └── index.js                  # Express API Gateway & Telemetry Sim
│   ├── database/
│   │   └── schema.sql                # PostgreSQL Schema DDL & Seeds
│   ├── swagger/
│   │   └── swagger.yaml              # API Specifications
│   ├── Dockerfile
│   └── package.json
├── frontend/                         # Vite React Client
│   ├── src/
│   │   ├── components/               # Header & Sidebar Layouts
│   │   ├── context/                  # Authentication Providers
│   │   ├── pages/                    # 12 Core Operations Modules
│   │   ├── App.jsx
│   │   └── index.css                 # Custom HSL Cyan Design Styles
│   ├── index.html
│   ├── Dockerfile
│   └── package.json
├── devops/                           # DevOps Orchestration Files
│   ├── terraform/                    # AWS VPC, EKS, RDS Provisioning
│   ├── kubernetes/                   # Pod Deployments & Routing Ingress
│   ├── prometheus/                   # Telemetry Scrapers Config
│   ├── grafana/                      # Panel JSON Templates
│   ├── elk/                          # Logstash & Filebeat Pipelines
│   ├── jenkins/                      # Declarative Jenkinsfile
│   └── disaster-recovery/            # DR Plans & DB Backup scripts
├── docker-compose.yml                # Full Stack Multi-Container Runner
├── api_documentation.md              # REST Endpoints Details
└── README.md                         # Main Project Manual
```

---

## 2. Default Credentials & Roles

The system is seeded with three testing roles. Login parameters are:

| Username | Password | Role | Access Level / Permissions |
| :--- | :--- | :--- | :--- |
| **admin** | `admin123` | **Admin** | Read/Write all assets, edit alerts settings, audit system logs, monitor infrastructure. |
| **manager** | `manager123` | **Operations Manager** | Read all panels, assign maintenance, toggle pump hardware, view analytics. |
| **engineer** | `engineer123` | **Field Engineer** | Read telemetry, schedule/complete maintenance logs, resolve triggered alerts. |

---

## 3. Quickstart Guide

### Option A: Running with Docker Compose (Recommended)
This option automatically builds the client/server images, launches a PostgreSQL database, runs migrations, and seeds records.

1. Ensure Docker Desktop is installed and running.
2. In the root directory, execute:
   ```bash
   docker-compose up --build
   ```
3. Open the portal at:
   - **Frontend App**: `http://localhost` (Port 80 via Nginx proxy)
   - **Backend API**: `http://localhost:5000`
   - **PostgreSQL**: `localhost:5432`

---

### Option B: Local Node.js Development Setup
In local dev setup, the backend runs on port 5000 and the React client runs on port 5173 (with local proxy enabled). If a live PostgreSQL server is not running on localhost, **the backend automatically falls back to In-Memory simulation mode** so that all APIs, mock database queries, and background telemetry loops function seamlessly.

#### 1. Setup Backend
```bash
cd backend
npm install
npm start
```

#### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 4. Key Observability Features
- **Telemetry Simulator**: Every 10 seconds, the backend automatically simulates water flow variations, reservoir drops, pump run-hour logs, and triggers leak incidents when requested.
- **Leak Simulator**: Click "Simulate Leak" on the Pipelines page to trigger alert alerts, alert logs, and system faults.
- **Maintenance Actions**: Assign leaking components to engineering leads and track workflows from "Pending" $\to$ "In Progress" $\to$ "Resolved".
