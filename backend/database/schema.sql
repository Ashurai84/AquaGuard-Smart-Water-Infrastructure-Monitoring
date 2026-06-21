-- Project AquaGuard PostgreSQL Database Schema

-- Drop tables in order of dependency
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS smart_meters CASCADE;
DROP TABLE IF EXISTS sensors CASCADE;
DROP TABLE IF EXISTS pumps CASCADE;
DROP TABLE IF EXISTS pipelines CASCADE;
DROP TABLE IF EXISTS reservoirs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS analytics_data CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Operations Manager', 'Field Engineer'))
);

-- 2. Reservoirs Table
CREATE TABLE reservoirs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    capacity_liters DOUBLE PRECISION NOT NULL CHECK (capacity_liters > 0),
    current_level_liters DOUBLE PRECISION NOT NULL CHECK (current_level_liters >= 0),
    status VARCHAR(50) DEFAULT 'Normal' CHECK (status IN ('Normal', 'Low Level', 'Near Capacity')),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_level_limit CHECK (current_level_liters <= capacity_liters)
);

-- 3. Pipelines Table
CREATE TABLE pipelines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Healthy' CHECK (status IN ('Healthy', 'Leaking', 'Maintenance')),
    flow_rate DOUBLE PRECISION NOT NULL CHECK (flow_rate >= 0),
    pressure DOUBLE PRECISION NOT NULL CHECK (pressure >= 0),
    location_start VARCHAR(100) NOT NULL,
    location_end VARCHAR(100) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Pumps Table
CREATE TABLE pumps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Overheated')),
    temperature DOUBLE PRECISION NOT NULL,
    runtime_hours DOUBLE PRECISION NOT NULL CHECK (runtime_hours >= 0),
    location VARCHAR(100) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Sensors Table
CREATE TABLE sensors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Pressure', 'Flow', 'Temperature', 'Water Level')),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Offline')),
    current_value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Smart Meters Table
CREATE TABLE smart_meters (
    id SERIAL PRIMARY KEY,
    meter_number VARCHAR(50) UNIQUE NOT NULL,
    consumer_name VARCHAR(100) NOT NULL,
    usage_kwh DOUBLE PRECISION NOT NULL CHECK (usage_kwh >= 0),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Offline')),
    last_reading TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Maintenance Requests Table
CREATE TABLE maintenance_requests (
    id SERIAL PRIMARY KEY,
    equipment_type VARCHAR(50) NOT NULL,
    equipment_id INTEGER NOT NULL,
    issue TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    assigned_engineer_id INTEGER NOT NULL,
    assigned_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Alerts Table
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('Critical', 'Warning', 'Info')),
    message TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Resolved')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Logs Table
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('system', 'application', 'sensor', 'audit')),
    level VARCHAR(50) NOT NULL CHECK (level IN ('info', 'warn', 'error')),
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Analytics Data Table
CREATE TABLE analytics_data (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexing optimizations
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_sensors_type ON sensors(type);
CREATE INDEX idx_meters_number ON smart_meters(meter_number);
