-- Project AquaGuard Database Seeding Script

-- 1. Seed Users
INSERT INTO users (username, password_hash, role) VALUES
('admin', 'admin123', 'Admin'),
('manager', 'manager123', 'Operations Manager'),
('engineer', 'engineer123', 'Field Engineer');

-- 2. Seed 5 Reservoirs
INSERT INTO reservoirs (name, location, capacity_liters, current_level_liters, status) VALUES
('Grand Valley Reservoir', 'Sector 1 North', 50000000.0, 42000000.0, 'Normal'),
('Pinecrest Basin', 'Sector 3 East', 30000000.0, 15000000.0, 'Low Level'),
('West Gate Reservoir', 'Sector 5 West', 25000000.0, 24500000.0, 'Near Capacity'),
('Summit Lake Facility', 'Sector 2 Ridge', 40000000.0, 31000000.0, 'Normal'),
('South Aqueduct Tank', 'Sector 4 South', 15000000.0, 11200000.0, 'Normal');

-- 3. Seed 10 Pipelines
INSERT INTO pipelines (name, status, flow_rate, pressure, location_start, location_end) VALUES
('Main Trunk Line A', 'Healthy', 154.2, 4.2, 'Grand Valley', 'Pumping Stn 1'),
('Sector 4 Distribution Loop', 'Leaking', 98.4, 2.1, 'Pumping Stn 1', 'Sector 4 Residential'),
('Industrial Link B', 'Maintenance', 0.0, 0.0, 'Pumping Stn 2', 'West Heavy Zone'),
('Ridge Route Feed', 'Healthy', 76.8, 3.9, 'East Gate Reservoir', 'North Station'),
('South Connector Pipe 5', 'Healthy', 45.2, 3.2, 'South Aqueduct Tank', 'Substation 4'),
('North Bypass Line 6', 'Healthy', 120.4, 4.5, 'Summit Lake', 'Intake Plant'),
('East Gate Link C', 'Healthy', 65.0, 3.1, 'Pinecrest Basin', 'East Gate Sub'),
('Commercial Line 8', 'Healthy', 88.5, 3.8, 'Pumping Stn 1', 'City Business District'),
('Sub-Trunk Line 9', 'Healthy', 50.1, 2.9, 'Pumping Stn 2', 'South Substation'),
('Coastal Feed Line 10', 'Healthy', 95.0, 4.0, 'Grand Valley', 'Coastal Water Hub');

-- 4. Seed 8 Pumps
INSERT INTO pumps (name, status, temperature, runtime_hours, location) VALUES
('Main Intake Pump 1A', 'Active', 48.2, 1245.5, 'Intake Plant North'),
('High-Pressure Booster 2', 'Active', 78.4, 980.2, 'Station Sector 3'),
('Auxiliary Drain Pump', 'Inactive', 24.1, 145.0, 'West Gate Facility'),
('High-Pressure Booster 1', 'Overheated', 86.5, 1102.8, 'Station Sector 3'),
('Backup Supply Pump 5', 'Inactive', 21.0, 32.4, 'Intake Plant North'),
('East Gate Pumping Unit', 'Active', 52.4, 650.0, 'East Gate Sub'),
('South Aqueduct Lifter', 'Active', 44.9, 870.5, 'Substation 4'),
('City District Booster', 'Active', 59.2, 1420.0, 'City Business District');

-- 5. Seed 20 Sensors
INSERT INTO sensors (name, type, status, current_value, unit) VALUES
('Reservoir Level L1', 'Water Level', 'Active', 84.0, '%'),
('Pinecrest Level L2', 'Water Level', 'Active', 50.0, '%'),
('West Gate Level L3', 'Water Level', 'Active', 98.0, '%'),
('Summit Level L4', 'Water Level', 'Active', 77.5, '%'),
('South Tank Level L5', 'Water Level', 'Active', 74.6, '%'),
('Trunk Flowmeter F1', 'Flow', 'Active', 154.2, 'L/s'),
('Loop Flowmeter F2', 'Flow', 'Active', 98.4, 'L/s'),
('Ridge Flowmeter F3', 'Flow', 'Active', 76.8, 'L/s'),
('South Flowmeter F4', 'Flow', 'Active', 45.2, 'L/s'),
('North Flowmeter F5', 'Flow', 'Active', 120.4, 'L/s'),
('Trunk Pressure P1', 'Pressure', 'Active', 4.2, 'Bar'),
('Loop Pressure P2', 'Pressure', 'Active', 2.1, 'Bar'),
('Ridge Pressure P3', 'Pressure', 'Active', 3.9, 'Bar'),
('South Pressure P4', 'Pressure', 'Active', 3.2, 'Bar'),
('North Pressure P5', 'Pressure', 'Active', 4.5, 'Bar'),
('Intake Temp T1', 'Temperature', 'Active', 48.2, '°C'),
('Booster 2 Temp T2', 'Temperature', 'Active', 78.4, '°C'),
('Drain Temp T3', 'Temperature', 'Active', 24.1, '°C'),
('Booster 1 Temp T4', 'Temperature', 'Active', 86.5, '°C'),
('Substation 4 Temp T5', 'Temperature', 'Active', 44.9, '°C');

-- 6. Seed 50 Smart Meters
INSERT INTO smart_meters (meter_number, consumer_name, usage_kwh, status) VALUES
('MTR-001', 'Grand Valley Apartments', 450.2, 'Active'),
('MTR-002', 'Sector 4 Public Gardens', 124.5, 'Active'),
('MTR-003', 'Apex Heavy Industries', 12450.0, 'Active'),
('MTR-004', 'Ridge Shopping Complex', 812.8, 'Active'),
('MTR-005', 'South Substation Station', 34.0, 'Active'),
('MTR-006', 'Greenfield Dairy Farm', 320.4, 'Active'),
('MTR-007', 'Coastal Resort & Spa', 945.1, 'Active'),
('MTR-008', 'City Business Hub', 2300.5, 'Active'),
('MTR-009', 'Riverside Steelworks', 15400.0, 'Active'),
('MTR-010', 'Valley General Hospital', 4120.6, 'Active'),
('MTR-011', 'User Residence 11', 89.2, 'Active'),
('MTR-012', 'User Residence 12', 104.5, 'Active'),
('MTR-013', 'User Residence 13', 76.1, 'Active'),
('MTR-014', 'User Residence 14', 112.4, 'Active'),
('MTR-015', 'User Residence 15', 95.0, 'Active'),
('MTR-016', 'User Residence 16', 130.8, 'Active'),
('MTR-017', 'User Residence 17', 84.4, 'Active'),
('MTR-018', 'User Residence 18', 62.0, 'Active'),
('MTR-019', 'User Residence 19', 145.2, 'Active'),
('MTR-020', 'User Residence 20', 101.9, 'Active'),
('MTR-021', 'Commercial Laundry 21', 890.5, 'Active'),
('MTR-022', 'Metro Bottling Plant', 7420.0, 'Active'),
('MTR-023', 'Municipal Library', 188.4, 'Active'),
('MTR-024', 'District High School', 560.1, 'Active'),
('MTR-025', 'Community Swimming Pool', 1205.0, 'Active'),
('MTR-026', 'Federal Post Office', 145.2, 'Active'),
('MTR-027', 'Central Railway Stn', 3100.8, 'Active'),
('MTR-028', 'Northside Food Market', 645.2, 'Active'),
('MTR-029', 'University Laboratory', 2890.0, 'Active'),
('MTR-030', 'City Center Park', 120.4, 'Active'),
('MTR-031', 'West Side Car Wash', 410.2, 'Active'),
('MTR-032', 'East Gate Brewery', 3150.0, 'Active'),
('MTR-033', 'Residential Block 33', 92.5, 'Active'),
('MTR-034', 'Residential Block 34', 108.1, 'Active'),
('MTR-035', 'Residential Block 35', 85.0, 'Active'),
('MTR-036', 'Residential Block 36', 115.4, 'Active'),
('MTR-037', 'Residential Block 37', 99.0, 'Active'),
('MTR-038', 'Residential Block 38', 121.2, 'Active'),
('MTR-039', 'Residential Block 39', 77.8, 'Active'),
('MTR-040', 'Residential Block 40', 134.0, 'Active'),
('MTR-041', 'Heavy Metal Castings', 9400.5, 'Active'),
('MTR-042', 'Textile Weaving Mill', 6120.2, 'Active'),
('MTR-043', 'Chemical Processing 43', 11400.0, 'Active'),
('MTR-044', 'Data Storage Center', 18900.2, 'Active'),
('MTR-045', 'Silicon Wafer Fab', 24500.0, 'Active'),
('MTR-046', 'District Fire Station', 112.5, 'Active'),
('MTR-047', 'Police Headquarters', 380.4, 'Active'),
('MTR-048', 'Suburban Country Club', 890.0, 'Active'),
('MTR-049', 'Golf Course Irrigation', 4150.2, 'Active'),
('MTR-050', 'Water Treatment Sludge', 1820.6, 'Active');

-- 7. Seed 10 Alerts
INSERT INTO alerts (severity, message, source, status) VALUES
('Critical', 'Leak detected in Sector 4 Pipeline A', 'Pipeline Sensor 14', 'Active'),
('Warning', 'High pump temperature recorded: 82°C', 'Pump Station 3', 'Active'),
('Warning', 'Reservoir Level below 20%', 'East Side Reservoir', 'Active'),
('Critical', 'Intake Pump 1A failed communication handshake', 'Main Intake Pump 1A', 'Active'),
('Warning', 'Booster 1 showing temperature spike: 86.5°C', 'Booster 1 Temp T4', 'Active'),
('Info', 'Daily backup check completed: S3 synchronised', 'Backup Scheduler', 'Resolved'),
('Info', 'Chlorine telemetry levels adjusted', 'Water Quality Sensor 3', 'Resolved'),
('Warning', 'Pinecrest Basin volume below critical 50%', 'Pinecrest Level L2', 'Active'),
('Critical', 'High line pressure recorded: 4.5 Bar', 'North Pressure P5', 'Active'),
('Info', 'Weekly pipeline visual inspection completed', 'Maintenance Team', 'Resolved');

-- 8. Seed 15 Maintenance Requests
INSERT INTO maintenance_requests (equipment_type, equipment_id, issue, priority, assigned_engineer_id, assigned_name, status) VALUES
('Pipeline', 2, 'Leak detected in Sector 4 Pipeline A', 'Critical', 3, 'Engineer Dave', 'In Progress'),
('Pump', 4, 'High pump temperature recorded: 86°C', 'High', 3, 'Engineer Dave', 'Pending'),
('Reservoir', 2, 'Reservoir level below 20% limit', 'Medium', 3, 'Engineer Dave', 'Pending'),
('Pump', 1, 'Intake Pump 1A failed communication handshake', 'High', 3, 'Engineer Dave', 'In Progress'),
('Sensor', 19, 'Sensor Booster 1 Temp T4 reporting overheated status', 'High', 3, 'Engineer Dave', 'Pending'),
('Pipeline', 3, 'Execute regular maintenance checks on Industrial Link B', 'Low', 3, 'Engineer Dave', 'Resolved'),
('Smart Meter', 3, 'Inspect High Consumption reading on MTR-003', 'Medium', 3, 'Engineer Dave', 'Pending'),
('Reservoir', 5, 'Check South Aqueduct Tank valve response timers', 'Low', 3, 'Engineer Dave', 'Pending'),
('Pump', 8, 'City District Booster annual bearing replacement', 'Low', 3, 'Engineer Dave', 'Resolved'),
('Sensor', 5, 'Replace battery in wireless Level Sensor L5', 'Low', 3, 'Engineer Dave', 'Resolved'),
('Pipeline', 5, 'Validate pressure ratings on South Connector 5', 'Medium', 3, 'Engineer Dave', 'Pending'),
('Pump', 3, 'Check auxiliary pump bypass configurations', 'Low', 3, 'Engineer Dave', 'Pending'),
('Sensor', 20, 'Recalibrate Temp Sensor T5', 'Low', 3, 'Engineer Dave', 'Resolved'),
('Smart Meter', 9, 'Consumer reported physical casing damage on MTR-009', 'Low', 3, 'Engineer Dave', 'Pending'),
('Pipeline', 10, 'Inspect coastal line joint points for wear', 'Medium', 3, 'Engineer Dave', 'Pending');

-- 9. Seed Logs
INSERT INTO logs (type, level, message) VALUES
('system', 'info', 'Database connection established to postgresql://db-node:5432/aquaguard'),
('sensor', 'info', 'Telemetry packet received from Sensor ID 14 (Flow rate: 154.2 L/s)'),
('audit', 'warn', 'User "manager" requested status update for Pump ID 2'),
('sensor', 'error', 'Alert threshold breached: Pump ID 4 Temp (86.5°C > 80°C Limit)'),
('audit', 'info', 'Admin login session initiated from IP 192.168.1.42'),
('application', 'info', 'Express Server listening on port 5001 in production mode');
