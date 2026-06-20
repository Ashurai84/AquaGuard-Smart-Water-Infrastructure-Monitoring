# api_documentation.md

# AquaGuard REST API Documentation

This document describes the API request and response formats for the AquaGuard Smart Water Monitoring & Management Platform.

All endpoints are relative to `http://localhost:5000/api`.

---

## 1. Authentication
### `POST /auth/login`
Authenticates a user session and returns a JWT bearer token.

- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "Admin"
    }
  }
  ```
- **Response (`401 Unauthorized`)**:
  ```json
  {
    "message": "Invalid username or password"
  }
  ```

---

## 2. Operations Dashboard
### `GET /dashboard`
Aggregated telemetry, active incidents, and historical flow logs.

- **Response (`200 OK`)**:
  ```json
  {
    "stats": {
      "totalReservoirs": 4,
      "activePumps": 2,
      "activePipelines": 3,
      "activeSmartMeters": 4,
      "totalWaterConsumption": 231.0,
      "activeAlerts": 3,
      "systemHealth": 88.2
    },
    "recentAlerts": [
      {
        "id": 1,
        "severity": "Critical",
        "message": "Leak detected in Sector 4 Pipeline A",
        "source": "Pipeline Sensor 14",
        "status": "Active",
        "timestamp": "2026-06-20T16:15:30.000Z"
      }
    ],
    "chartData": [450, 480, 520, 490, 510, 580, 620]
  }
  ```

---

## 3. Reservoir Management
### `GET /reservoirs`
Retrieves all reservoir entities.

- **Response (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "name": "Grand Valley Reservoir",
      "location": "Sector 1 North",
      "capacity_liters": 50000000.0,
      "current_level_liters": 42000000.0,
      "status": "Normal",
      "last_updated": "2026-06-20T16:00:00.000Z"
    }
  ]
  ```

### `POST /reservoirs`
Creates a new reservoir.

- **Request Body**:
  ```json
  {
    "name": "East Hill Reservoir",
    "location": "Sector 6 East",
    "capacity_liters": 15000000.0,
    "current_level_liters": 14000000.0,
    "status": "Normal"
  }
  ```

---

## 4. Pipeline Management
### `GET /pipelines`
Lists all distribution pipe segments.

### `POST /pipelines/:id/simulate-leak`
Triggers an artificial pipeline leak, sets state to "Leaking", and dispatches a Critical Alert.

- **Response (`200 OK`)**:
  ```json
  {
    "message": "Leak simulated and alert dispatched."
  }
  ```

---

## 5. Pumps Management
### `GET /pumps`
Lists all pumping stations.

### `PUT /pumps/:id`
Toggles status (Active, Inactive, Overheated) or increments runtimes.

---

## 6. Maintenance Scheduling
### `GET /maintenance`
Lists all active requests.

### `POST /maintenance`
Creates a new request.
- **Request Body**:
  ```json
  {
    "equipment_type": "Pipeline",
    "equipment_id": 2,
    "issue": "Leak detected in Sector 4",
    "priority": "Critical",
    "assigned_engineer_id": 3
  }
  ```
- **Response (`201 Created`)**

---

## 7. Observability
### `GET /system/health`
Prometheus metric endpoints returning system diagnostics (CPU load, RAM usage, network bandwidth I/O).

- **Response (`200 OK`)**:
  ```json
  {
    "cpu": 18.4,
    "memory": 56.2,
    "disk": 42.4,
    "networkRx": 1.25,
    "networkTx": 0.65,
    "apiHealth": "Healthy",
    "dbHealth": "Healthy"
  }
  ```

### `GET /logs`
Returns the tail of system audit trails and database logs.
