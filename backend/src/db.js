import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const config = {
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  database: process.env.PGDATABASE || 'aquaguard',
  password: process.env.PGPASSWORD || 'postgres',
  port: parseInt(process.env.PGPORT || '5432'),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

let pool = null;
let useMock = false;

// Mock Datastore for runtime fallback
const mockDb = {
  users: [
    { id: 1, username: 'admin', password_hash: 'admin123', role: 'Admin' },
    { id: 2, username: 'manager', password_hash: 'manager123', role: 'Operations Manager' },
    { id: 3, username: 'engineer', password_hash: 'engineer123', role: 'Field Engineer' }
  ],
  reservoirs: [
    { id: 1, name: 'Grand Valley Reservoir', location: 'Sector 1 North', capacity_liters: 50000000.0, current_level_liters: 42000000.0, status: 'Normal' },
    { id: 2, name: 'Pinecrest Basin', location: 'Sector 3 East', capacity_liters: 30000000.0, current_level_liters: 15000000.0, status: 'Low Level' },
    { id: 3, name: 'West Gate Reservoir', location: 'Sector 5 West', capacity_liters: 25000000.0, current_level_liters: 24500000.0, status: 'Near Capacity' },
    { id: 4, name: 'Summit Lake Facility', location: 'Sector 2 Ridge', capacity_liters: 40000000.0, current_level_liters: 31000000.0, status: 'Normal' },
    { id: 5, name: 'South Aqueduct Tank', location: 'Sector 4 South', capacity_liters: 15000000.0, current_level_liters: 11200000.0, status: 'Normal' }
  ],
  pipelines: [
    { id: 1, name: 'Main Trunk Line A', status: 'Healthy', flow_rate: 154.2, pressure: 4.2, location_start: 'Grand Valley', location_end: 'Pumping Stn 1' },
    { id: 2, name: 'Sector 4 Distribution Loop', status: 'Leaking', flow_rate: 98.4, pressure: 2.1, location_start: 'Pumping Stn 1', location_end: 'Sector 4 Residential' },
    { id: 3, name: 'Industrial Link B', status: 'Maintenance', flow_rate: 0.0, pressure: 0.0, location_start: 'Pumping Stn 2', location_end: 'West Heavy Zone' },
    { id: 4, name: 'Ridge Route Feed', status: 'Healthy', flow_rate: 76.8, pressure: 3.9, location_start: 'East Gate Reservoir', location_end: 'North Station' },
    { id: 5, name: 'South Connector Pipe 5', status: 'Healthy', flow_rate: 45.2, pressure: 3.2, location_start: 'South Aqueduct Tank', location_end: 'Substation 4' },
    { id: 6, name: 'North Bypass Line 6', status: 'Healthy', flow_rate: 120.4, pressure: 4.5, location_start: 'Summit Lake', location_end: 'Intake Plant' },
    { id: 7, name: 'East Gate Link C', status: 'Healthy', flow_rate: 65.0, pressure: 3.1, location_start: 'Pinecrest Basin', location_end: 'East Gate Sub' },
    { id: 8, name: 'Commercial Line 8', status: 'Healthy', flow_rate: 88.5, pressure: 3.8, location_start: 'Pumping Stn 1', location_end: 'City Business District' },
    { id: 9, name: 'Sub-Trunk Line 9', status: 'Healthy', flow_rate: 50.1, pressure: 2.9, location_start: 'Pumping Stn 2', location_end: 'South Substation' },
    { id: 10, name: 'Coastal Feed Line 10', status: 'Healthy', flow_rate: 95.0, pressure: 4.0, location_start: 'Grand Valley', location_end: 'Coastal Water Hub' }
  ],
  pumps: [
    { id: 1, name: 'Main Intake Pump 1A', status: 'Active', temperature: 48.2, runtime_hours: 1245.5, location: 'Intake Plant North' },
    { id: 2, name: 'High-Pressure Booster 2', status: 'Active', temperature: 78.4, runtime_hours: 980.2, location: 'Station Sector 3' },
    { id: 3, name: 'Auxiliary Drain Pump', status: 'Inactive', temperature: 24.1, runtime_hours: 145.0, location: 'West Gate Facility' },
    { id: 4, name: 'High-Pressure Booster 1', status: 'Overheated', temperature: 86.5, runtime_hours: 1102.8, location: 'Station Sector 3' },
    { id: 5, name: 'Backup Supply Pump 5', status: 'Inactive', temperature: 21.0, runtime_hours: 32.4, location: 'Intake Plant North' },
    { id: 6, name: 'East Gate Pumping Unit', status: 'Active', temperature: 52.4, runtime_hours: 650.0, location: 'East Gate Sub' },
    { id: 7, name: 'South Aqueduct Lifter', status: 'Active', temperature: 44.9, runtime_hours: 870.5, location: 'Substation 4' },
    { id: 8, name: 'City District Booster', status: 'Active', temperature: 59.2, runtime_hours: 1420.0, location: 'City Business District' }
  ],
  sensors: [
    { id: 1, name: 'Reservoir Level L1', type: 'Water Level', status: 'Active', current_value: 84.0, unit: '%' },
    { id: 2, name: 'Pinecrest Level L2', type: 'Water Level', status: 'Active', current_value: 50.0, unit: '%' },
    { id: 3, name: 'West Gate Level L3', type: 'Water Level', status: 'Active', current_value: 98.0, unit: '%' },
    { id: 4, name: 'Summit Level L4', type: 'Water Level', status: 'Active', current_value: 77.5, unit: '%' },
    { id: 5, name: 'South Tank Level L5', type: 'Water Level', status: 'Active', current_value: 74.6, unit: '%' },
    { id: 6, name: 'Trunk Flowmeter F1', type: 'Flow', status: 'Active', current_value: 154.2, unit: 'L/s' },
    { id: 7, name: 'Loop Flowmeter F2', type: 'Flow', status: 'Active', current_value: 98.4, unit: 'L/s' },
    { id: 8, name: 'Ridge Flowmeter F3', type: 'Flow', status: 'Active', current_value: 76.8, unit: 'L/s' },
    { id: 9, name: 'South Flowmeter F4', type: 'Flow', status: 'Active', current_value: 45.2, unit: 'L/s' },
    { id: 10, name: 'North Flowmeter F5', type: 'Flow', status: 'Active', current_value: 120.4, unit: 'L/s' },
    { id: 11, name: 'Trunk Pressure P1', type: 'Pressure', status: 'Active', current_value: 4.2, unit: 'Bar' },
    { id: 12, name: 'Loop Pressure P2', type: 'Pressure', status: 'Active', current_value: 2.1, unit: 'Bar' },
    { id: 13, name: 'Ridge Pressure P3', type: 'Pressure', status: 'Active', current_value: 3.9, unit: 'Bar' },
    { id: 14, name: 'South Pressure P4', type: 'Pressure', status: 'Active', current_value: 3.2, unit: 'Bar' },
    { id: 15, name: 'North Pressure P5', type: 'Pressure', status: 'Active', current_value: 4.5, unit: 'Bar' },
    { id: 16, name: 'Intake Temp T1', type: 'Temperature', status: 'Active', current_value: 48.2, unit: '°C' },
    { id: 17, name: 'Booster 2 Temp T2', type: 'Temperature', status: 'Active', current_value: 78.4, unit: '°C' },
    { id: 18, name: 'Drain Temp T3', type: 'Temperature', status: 'Active', current_value: 24.1, unit: '°C' },
    { id: 19, name: 'Booster 1 Temp T4', type: 'Temperature', status: 'Active', current_value: 86.5, unit: '°C' },
    { id: 20, name: 'Substation 4 Temp T5', type: 'Temperature', status: 'Active', current_value: 44.9, unit: '°C' }
  ],
  smart_meters: [
    { id: 1, meter_number: 'MTR-001', consumer_name: 'Grand Valley Apartments', usage_kwh: 450.2, status: 'Active' },
    { id: 2, meter_number: 'MTR-002', consumer_name: 'Sector 4 Public Gardens', usage_kwh: 124.5, status: 'Active' },
    { id: 3, meter_number: 'MTR-003', consumer_name: 'Apex Heavy Industries', usage_kwh: 12450.0, status: 'Active' },
    { id: 4, meter_number: 'MTR-004', consumer_name: 'Ridge Shopping Complex', usage_kwh: 812.8, status: 'Active' },
    { id: 5, meter_number: 'MTR-005', consumer_name: 'South Substation Station', usage_kwh: 34.0, status: 'Active' },
    { id: 6, meter_number: 'MTR-006', consumer_name: 'Greenfield Dairy Farm', usage_kwh: 320.4, status: 'Active' },
    { id: 7, meter_number: 'MTR-007', consumer_name: 'Coastal Resort & Spa', usage_kwh: 945.1, status: 'Active' },
    { id: 8, meter_number: 'MTR-008', consumer_name: 'City Business Hub', usage_kwh: 2300.5, status: 'Active' },
    { id: 9, meter_number: 'MTR-009', consumer_name: 'Riverside Steelworks', usage_kwh: 15400.0, status: 'Active' },
    { id: 10, meter_number: 'MTR-010', consumer_name: 'Valley General Hospital', usage_kwh: 4120.6, status: 'Active' }
  ],
  maintenance_requests: [
    { id: 1, equipment_type: 'Pipeline', equipment_id: 2, issue: 'Leak detected in Sector 4 Pipeline A', priority: 'Critical', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'In Progress' },
    { id: 2, equipment_type: 'Pump', equipment_id: 4, issue: 'High pump temperature recorded: 86°C', priority: 'High', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Pending' },
    { id: 3, equipment_type: 'Reservoir', equipment_id: 2, issue: 'Reservoir level below 20% limit', priority: 'Medium', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Pending' },
    { id: 4, equipment_type: 'Pump', equipment_id: 1, issue: 'Intake Pump 1A failed communication handshake', priority: 'High', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'In Progress' },
    { id: 5, equipment_type: 'Sensor', equipment_id: 19, issue: 'Sensor Booster 1 Temp T4 reporting overheated status', priority: 'High', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Pending' },
    { id: 6, equipment_type: 'Pipeline', equipment_id: 3, issue: 'Execute regular maintenance checks on Industrial Link B', priority: 'Low', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Resolved' },
    { id: 7, equipment_type: 'Smart Meter', equipment_id: 3, issue: 'Inspect High Consumption reading on MTR-003', priority: 'Medium', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Pending' },
    { id: 8, equipment_type: 'Reservoir', equipment_id: 5, issue: 'Check South Aqueduct Tank valve response timers', priority: 'Low', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Pending' },
    { id: 9, equipment_type: 'Pump', equipment_id: 8, issue: 'City District Booster annual bearing replacement', priority: 'Low', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Resolved' },
    { id: 10, equipment_type: 'Sensor', equipment_id: 5, issue: 'Replace battery in wireless Level Sensor L5', priority: 'Low', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Resolved' },
    { id: 11, equipment_type: 'Pipeline', equipment_id: 5, issue: 'Validate pressure ratings on South Connector 5', priority: 'Medium', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Pending' },
    { id: 12, equipment_type: 'Pump', equipment_id: 3, issue: 'Check auxiliary pump bypass configurations', priority: 'Low', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Pending' },
    { id: 13, equipment_type: 'Sensor', equipment_id: 20, issue: 'Recalibrate Temp Sensor T5', priority: 'Low', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Resolved' },
    { id: 14, equipment_type: 'Smart Meter', equipment_id: 9, issue: 'Consumer reported physical casing damage on MTR-009', priority: 'Low', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Pending' },
    { id: 15, equipment_type: 'Pipeline', equipment_id: 10, issue: 'Inspect coastal line joint points for wear', priority: 'Medium', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Pending' }
  ],
  alerts: [
    { id: 1, severity: 'Critical', message: 'Leak detected in Sector 4 Pipeline A', source: 'Pipeline Sensor 14', status: 'Active', timestamp: '2026-06-20 22:15:30' },
    { id: 2, severity: 'Warning', message: 'High pump temperature recorded: 82°C', source: 'Pump Station 3', status: 'Active', timestamp: '2026-06-20 22:04:15' },
    { id: 3, severity: 'Warning', message: 'Reservoir Level below 20%', source: 'East Side Reservoir', status: 'Active', timestamp: '2026-06-20 21:30:10' },
    { id: 4, severity: 'Critical', message: 'Intake Pump 1A failed communication handshake', source: 'Main Intake Pump 1A', status: 'Active', timestamp: '2026-06-20 22:18:00' },
    { id: 5, severity: 'Warning', message: 'Booster 1 showing temperature spike: 86.5°C', source: 'Booster 1 Temp T4', status: 'Active', timestamp: '2026-06-20 22:19:10' },
    { id: 6, severity: 'Info', message: 'Daily backup check completed: S3 synchronised', source: 'Backup Scheduler', status: 'Resolved', timestamp: '2026-06-20 18:00:00' },
    { id: 7, severity: 'Info', message: 'Chlorine telemetry levels adjusted', source: 'Water Quality Sensor 3', status: 'Resolved', timestamp: '2026-06-20 18:30:00' },
    { id: 8, severity: 'Warning', message: 'Pinecrest Basin volume below critical 50%', source: 'Pinecrest Level L2', status: 'Active', timestamp: '2026-06-20 19:15:00' },
    { id: 9, severity: 'Critical', message: 'High line pressure recorded: 4.5 Bar', source: 'North Pressure P5', status: 'Active', timestamp: '2026-06-20 20:00:00' },
    { id: 10, severity: 'Info', message: 'Weekly pipeline visual inspection completed', source: 'Maintenance Team', status: 'Resolved', timestamp: '2026-06-20 20:45:00' }
  ],
  logs: [
    { id: 1, type: 'system', level: 'info', message: 'Database connection established to postgresql://db-node:5432/aquaguard', timestamp: '2026-06-20 22:10:05' },
    { id: 2, type: 'sensor', level: 'info', message: 'Telemetry packet received from Sensor ID 14 (Flow rate: 154.2 L/s)', timestamp: '2026-06-20 22:10:06' },
    { id: 3, type: 'audit', level: 'warn', message: 'User "manager" requested status update for Pump ID 2', timestamp: '2026-06-20 22:11:15' },
    { id: 4, type: 'sensor', level: 'error', message: 'Alert threshold breached: Pump ID 4 Temp (86.5°C > 80°C Limit)', timestamp: '2026-06-20 22:12:30' },
    { id: 5, type: 'audit', level: 'info', message: 'Admin login session initiated from IP 192.168.1.42', timestamp: '2026-06-20 22:14:02' },
    { id: 6, type: 'application', level: 'info', message: 'Express Server listening on port 5001 in production mode', timestamp: '2026-06-20 22:00:00' }
  ],
  analytics_data: []
};

// Try connecting to PostgreSQL
try {
  pool = new Pool(config);
  
  // Test query
  await pool.query('SELECT NOW()');
  console.log('PostgreSQL Database connected successfully.');
} catch (err) {
  console.warn('PostgreSQL database connection failed. Reverting to AquaGuard In-Memory Mock Store.');
  useMock = true;
}

export const query = async (text, params) => {
  if (useMock) {
    return handleMockQuery(text, params);
  }
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error('PostgreSQL query execution error:', err);
    throw err;
  }
};

export const getMockDb = () => mockDb;

// Minimal Mock Query Engine for SQLite/PostgreSQL mimicry
function handleMockQuery(sql, params) {
  const queryLower = sql.toLowerCase();
  
  // Handle User Auth
  if (queryLower.includes('from users')) {
    const user = mockDb.users.find(u => u.username === params[0]);
    return { rows: user ? [user] : [] };
  }

  // Handle Reservoirs
  if (queryLower.includes('from reservoirs')) {
    return { rows: mockDb.reservoirs };
  }
  if (queryLower.includes('insert into reservoirs')) {
    const nextId = mockDb.reservoirs.length + 1;
    const newRes = { id: nextId, name: params[0], location: params[1], capacity_liters: params[2], current_level_liters: params[3], status: params[4] };
    mockDb.reservoirs.push(newRes);
    return { rows: [newRes] };
  }
  if (queryLower.includes('update reservoirs')) {
    const id = params[4];
    const idx = mockDb.reservoirs.findIndex(r => r.id === id);
    if (idx !== -1) {
      mockDb.reservoirs[idx] = { ...mockDb.reservoirs[idx], name: params[0], location: params[1], capacity_liters: params[2], current_level_liters: params[3], status: params[4] };
      return { rows: [mockDb.reservoirs[idx]] };
    }
  }
  if (queryLower.includes('delete from reservoirs')) {
    const id = params[0];
    mockDb.reservoirs = mockDb.reservoirs.filter(r => r.id !== id);
    return { rowCount: 1 };
  }

  // Handle Pipelines
  if (queryLower.includes('from pipelines')) {
    return { rows: mockDb.pipelines };
  }
  if (queryLower.includes('insert into pipelines')) {
    const newPipe = { id: mockDb.pipelines.length + 1, name: params[0], status: params[1], flow_rate: params[2], pressure: params[3], location_start: params[4], location_end: params[5] };
    mockDb.pipelines.push(newPipe);
    return { rows: [newPipe] };
  }
  if (queryLower.includes('update pipelines')) {
    // Check if updating simulation or standard edit
    if (params.length === 2) {
      const id = params[1];
      const idx = mockDb.pipelines.findIndex(p => p.id === id);
      if (idx !== -1) {
        mockDb.pipelines[idx].status = params[0];
        return { rows: [mockDb.pipelines[idx]] };
      }
    }
    const id = params[6];
    const idx = mockDb.pipelines.findIndex(p => p.id === id);
    if (idx !== -1) {
      mockDb.pipelines[idx] = { ...mockDb.pipelines[idx], name: params[0], status: params[1], flow_rate: params[2], pressure: params[3], location_start: params[4], location_end: params[5] };
      return { rows: [mockDb.pipelines[idx]] };
    }
  }
  if (queryLower.includes('delete from pipelines')) {
    const id = params[0];
    mockDb.pipelines = mockDb.pipelines.filter(p => p.id !== id);
    return { rowCount: 1 };
  }

  // Handle Pumps
  if (queryLower.includes('from pumps')) {
    return { rows: mockDb.pumps };
  }
  if (queryLower.includes('insert into pumps')) {
    const newPump = { id: mockDb.pumps.length + 1, name: params[0], status: params[1], temperature: params[2], runtime_hours: params[3], location: params[4] };
    mockDb.pumps.push(newPump);
    return { rows: [newPump] };
  }
  if (queryLower.includes('update pumps')) {
    const id = params[4];
    const idx = mockDb.pumps.findIndex(p => p.id === id);
    if (idx !== -1) {
      mockDb.pumps[idx] = { ...mockDb.pumps[idx], name: params[0], status: params[1], temperature: params[2], runtime_hours: params[3] };
      return { rows: [mockDb.pumps[idx]] };
    }
  }
  if (queryLower.includes('delete from pumps')) {
    const id = params[0];
    mockDb.pumps = mockDb.pumps.filter(p => p.id !== id);
    return { rowCount: 1 };
  }

  // Handle Sensors
  if (queryLower.includes('from sensors')) {
    return { rows: mockDb.sensors };
  }

  // Handle Smart Meters
  if (queryLower.includes('from smart_meters')) {
    return { rows: mockDb.smart_meters };
  }

  // Handle Alerts
  if (queryLower.includes('from alerts')) {
    return { rows: mockDb.alerts };
  }
  if (queryLower.includes('insert into alerts')) {
    const nextId = mockDb.alerts.length + 1;
    const newAlert = { id: nextId, severity: params[0], message: params[1], source: params[2], status: 'Active', timestamp: new Date().toISOString() };
    mockDb.alerts.push(newAlert);
    return { rows: [newAlert] };
  }
  if (queryLower.includes('update alerts')) {
    const id = params[1];
    const idx = mockDb.alerts.findIndex(a => a.id === id);
    if (idx !== -1) {
      mockDb.alerts[idx].status = params[0];
      return { rows: [mockDb.alerts[idx]] };
    }
  }

  // Handle Logs
  if (queryLower.includes('from logs')) {
    return { rows: mockDb.logs };
  }
  if (queryLower.includes('insert into logs')) {
    const newLog = { id: mockDb.logs.length + 1, type: params[0], level: params[1], message: params[2], timestamp: new Date().toISOString() };
    mockDb.logs.push(newLog);
    return { rows: [newLog] };
  }

  // Handle Maintenance
  if (queryLower.includes('from maintenance_requests')) {
    return { rows: mockDb.maintenance_requests };
  }
  if (queryLower.includes('insert into maintenance_requests')) {
    const newReq = { id: mockDb.maintenance_requests.length + 1, equipment_type: params[0], equipment_id: params[1], issue: params[2], priority: params[3], assigned_engineer_id: params[4], assigned_name: 'Engineer Dave', status: params[5] };
    mockDb.maintenance_requests.push(newReq);
    return { rows: [newReq] };
  }
  if (queryLower.includes('update maintenance_requests')) {
    const id = params[1];
    const idx = mockDb.maintenance_requests.findIndex(m => m.id === id);
    if (idx !== -1) {
      mockDb.maintenance_requests[idx].status = params[0];
      return { rows: [mockDb.maintenance_requests[idx]] };
    }
  }

  // Fallback
  return { rows: [], rowCount: 0 };
}
