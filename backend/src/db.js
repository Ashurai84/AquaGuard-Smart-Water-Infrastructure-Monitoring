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
    { id: 4, name: 'Summit Lake Facility', location: 'Sector 2 Ridge', capacity_liters: 40000000.0, current_level_liters: 31000000.0, status: 'Normal' }
  ],
  pipelines: [
    { id: 1, name: 'Main Trunk Line A', status: 'Healthy', flow_rate: 154.2, pressure: 4.2, location_start: 'Grand Valley', location_end: 'Pumping Stn 1' },
    { id: 2, name: 'Sector 4 Distribution Loop', status: 'Leaking', flow_rate: 98.4, pressure: 2.1, location_start: 'Pumping Stn 1', location_end: 'Sector 4 Residential' },
    { id: 3, name: 'Industrial Link B', status: 'Maintenance', flow_rate: 0.0, pressure: 0.0, location_start: 'Pumping Stn 2', location_end: 'West Heavy Zone' },
    { id: 4, name: 'Ridge Route Feed', status: 'Healthy', flow_rate: 76.8, pressure: 3.9, location_start: 'East Gate Reservoir', location_end: 'North Station' }
  ],
  pumps: [
    { id: 1, name: 'Main Intake Pump 1A', status: 'Active', temperature: 48.2, runtime_hours: 1245.5, location: 'Intake Plant North' },
    { id: 2, name: 'High-Pressure Booster 2', status: 'Active', temperature: 78.4, runtime_hours: 980.2, location: 'Station Sector 3' },
    { id: 3, name: 'Auxiliary Drain Pump', status: 'Inactive', temperature: 24.1, runtime_hours: 145.0, location: 'West Gate Facility' },
    { id: 4, name: 'High-Pressure Booster 1', status: 'Overheated', temperature: 86.5, runtime_hours: 1102.8, location: 'Station Sector 3' }
  ],
  sensors: [
    { id: 1, name: 'Reservoir Level L1', type: 'Level Sensor', status: 'Active', current_value: 84.0, unit: '%', last_updated: 'Just now' },
    { id: 2, name: 'Trunk Flowmeter F4', type: 'Flow Sensor', status: 'Active', current_value: 154.2, unit: 'L/s', last_updated: 'Just now' },
    { id: 3, name: 'Loop Pressure P2', type: 'Pressure Sensor', status: 'Active', current_value: 4.2, unit: 'Bar', last_updated: 'Just now' },
    { id: 4, name: 'Pump Thermistor T8', type: 'Temperature Sensor', status: 'Active', current_value: 48.2, unit: '°C', last_updated: '10s ago' },
    { id: 5, name: 'District Flowmeter F12', type: 'Flow Sensor', status: 'Offline', current_value: 0.0, unit: 'L/s', last_updated: '3 hrs ago' }
  ],
  smart_meters: [
    { id: 1, meter_number: 'MTR-9827-X', consumer_name: 'Apex Heavy Industries', usage_kwh: 450.2, status: 'Active' },
    { id: 2, meter_number: 'MTR-1290-A', consumer_name: 'Grand Valley Apartments', usage_kwh: 124.5, status: 'Active' },
    { id: 3, meter_number: 'MTR-8812-C', consumer_name: 'Sector 4 Public Gardens', usage_kwh: 32.1, status: 'Active' },
    { id: 4, meter_number: 'MTR-3042-B', consumer_name: 'Ridge Shopping Complex', usage_kwh: 215.8, status: 'Active' }
  ],
  maintenance_requests: [
    { id: 1, equipment_type: 'Pipeline', equipment_id: 2, issue: 'Leak detected in Sector 4 Pipeline A', priority: 'Critical', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'In Progress' },
    { id: 2, equipment_type: 'Pump', equipment_id: 4, issue: 'High pump temperature recorded: 86°C', priority: 'High', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Pending' },
    { id: 3, equipment_type: 'Reservoir', equipment_id: 2, issue: 'Reservoir level below 20% limit', priority: 'Medium', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Pending' }
  ],
  alerts: [
    { id: 1, severity: 'Critical', message: 'Leak detected in Sector 4 Pipeline A', source: 'Pipeline Sensor 14', status: 'Active', timestamp: '2026-06-20 22:15:30' },
    { id: 2, severity: 'Warning', message: 'High pump temperature recorded: 82°C', source: 'Pump Station 3', status: 'Active', timestamp: '2026-06-20 22:04:15' },
    { id: 3, severity: 'Warning', message: 'Reservoir Level below 20%', source: 'East Side Reservoir', status: 'Active', timestamp: '2026-06-20 21:30:10' }
  ],
  logs: [
    { id: 1, type: 'system', level: 'info', message: 'Database connection established to postgresql://db-node:5432/aquaguard', timestamp: '2026-06-20 22:10:05' },
    { id: 2, type: 'sensor', level: 'info', message: 'Telemetry packet received from Sensor ID 14 (Flow rate: 154.2 L/s)', timestamp: '2026-06-20 22:10:06' },
    { id: 3, type: 'audit', level: 'warn', message: 'User "manager" requested status update for Pump ID 2', timestamp: '2026-06-20 22:11:15' },
    { id: 4, type: 'sensor', level: 'error', message: 'Alert threshold breached: Pump ID 4 Temp (86.5°C > 80°C Limit)', timestamp: '2026-06-20 22:12:30' },
    { id: 5, type: 'audit', level: 'info', message: 'Admin login session initiated from IP 192.168.1.42', timestamp: '2026-06-20 22:14:02' },
    { id: 6, type: 'application', level: 'info', message: 'Express Server listening on port 5000 in production mode', timestamp: '2026-06-20 22:00:00' }
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
