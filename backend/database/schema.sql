-- Project AquaGuard PostgreSQL Database Schema

-- Drop Tables if Exist to support clean re-initialization
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
    capacity_liters DOUBLE PRECISION NOT NULL,
    current_level_liters DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) DEFAULT 'Normal',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Pipelines Table
CREATE TABLE pipelines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Healthy',
    flow_rate DOUBLE PRECISION NOT NULL,
    pressure DOUBLE PRECISION NOT NULL,
    location_start VARCHAR(100) NOT NULL,
    location_end VARCHAR(100) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Pumps Table
CREATE TABLE pumps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    temperature DOUBLE PRECISION NOT NULL,
    runtime_hours DOUBLE PRECISION NOT NULL,
    location VARCHAR(100) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Sensors Table
CREATE TABLE sensors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    current_value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Smart Meters Table
CREATE TABLE smart_meters (
    id SERIAL PRIMARY KEY,
    meter_number VARCHAR(50) UNIQUE NOT NULL,
    consumer_name VARCHAR(100) NOT NULL,
    usage_kwh DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    last_reading TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Maintenance Requests Table
CREATE TABLE maintenance_requests (
    id SERIAL PRIMARY KEY,
    equipment_type VARCHAR(50) NOT NULL,
    equipment_id INTEGER NOT NULL,
    issue TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL,
    assigned_engineer_id INTEGER NOT NULL,
    assigned_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Alerts Table
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    severity VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    source VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Logs Table
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    level VARCHAR(50) NOT NULL,
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

-- Indexing for observability performance
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_alerts_status ON alerts(status);

-- Seed Default Demo Data
INSERT INTO users (username, password_hash, role) VALUES
('admin', 'admin123', 'Admin'),
('manager', 'manager123', 'Operations Manager'),
('engineer', 'engineer123', 'Field Engineer');

INSERT INTO reservoirs (name, location, capacity_liters, current_level_liters, status) VALUES
('Grand Valley Reservoir', 'Sector 1 North', 50000000.0, 42000000.0, 'Normal'),
('Pinecrest Basin', 'Sector 3 East', 30000000.0, 15000000.0, 'Low Level'),
('West Gate Reservoir', 'Sector 5 West', 25000000.0, 24500000.0, 'Near Capacity'),
('Summit Lake Facility', 'Sector 2 Ridge', 40000000.0, 31000000.0, 'Normal');

INSERT INTO pipelines (name, status, flow_rate, pressure, location_start, location_end) VALUES
('Main Trunk Line A', 'Healthy', 154.2, 4.2, 'Grand Valley', 'Pumping Stn 1'),
('Sector 4 Distribution Loop', 'Leaking', 98.4, 2.1, 'Pumping Stn 1', 'Sector 4 Residential'),
('Industrial Link B', 'Maintenance', 0.0, 0.0, 'Pumping Stn 2', 'West Heavy Zone'),
('Ridge Route Feed', 'Healthy', 76.8, 3.9, 'East Gate Reservoir', 'North Station');

INSERT INTO pumps (name, status, temperature, runtime_hours, location) VALUES
('Main Intake Pump 1A', 'Active', 48.2, 1245.5, 'Intake Plant North'),
('High-Pressure Booster 2', 'Active', 78.4, 980.2, 'Station Sector 3'),
('Auxiliary Drain Pump', 'Inactive', 24.1, 145.0, 'West Gate Facility'),
('High-Pressure Booster 1', 'Overheated', 86.5, 1102.8, 'Station Sector 3');

INSERT INTO sensors (name, type, status, current_value, unit) VALUES
('Reservoir Level L1', 'Level Sensor', 'Active', 84.0, '%'),
('Trunk Flowmeter F4', 'Flow Sensor', 'Active', 154.2, 'L/s'),
('Loop Pressure P2', 'Pressure Sensor', 'Active', 4.2, 'Bar'),
('Pump Thermistor T8', 'Temperature Sensor', 'Active', 48.2, '°C'),
('District Flowmeter F12', 'Flow Sensor', 'Offline', 0.0, 'L/s');

INSERT INTO smart_meters (meter_number, consumer_name, usage_kwh, status) VALUES
('MTR-9827-X', 'Apex Heavy Industries', 450.2, 'Active'),
('MTR-1290-A', 'Grand Valley Apartments', 124.5, 'Active'),
('MTR-8812-C', 'Sector 4 Public Gardens', 32.1, 'Active'),
('MTR-3042-B', 'Ridge Shopping Complex', 215.8, 'Active');

INSERT INTO maintenance_requests (equipment_type, equipment_id, issue, priority, assigned_engineer_id, assigned_name, status) VALUES
('Pipeline', 2, 'Leak detected in Sector 4 Pipeline A', 'Critical', 3, 'Engineer Dave', 'In Progress'),
('Pump', 4, 'High pump temperature recorded: 86°C', 'High', 3, 'Engineer Dave', 'Pending'),
('Reservoir', 2, 'Reservoir level below 20% limit', 'Medium', 3, 'Engineer Dave', 'Pending');

INSERT INTO alerts (severity, message, source, status) VALUES
('Critical', 'Leak detected in Sector 4 Pipeline A', 'Pipeline Sensor 14', 'Active'),
('Warning', 'High pump temperature recorded: 82°C', 'Pump Station 3', 'Active'),
('Warning', 'Reservoir Level below 20%', 'East Side Reservoir', 'Active');

INSERT INTO logs (type, level, message) VALUES
('system', 'info', 'Database connection established to postgresql://db-node:5432/aquaguard'),
('sensor', 'info', 'Telemetry packet received from Sensor ID 14 (Flow rate: 154.2 L/s)'),
('audit', 'warn', 'User "manager" requested status update for Pump ID 2'),
('sensor', 'error', 'Alert threshold breached: Pump ID 4 Temp (86.5°C > 80°C Limit)'),
('audit', 'info', 'Admin login session initiated from IP 192.168.1.42'),
('application', 'info', 'Express Server listening on port 5000 in production mode');
