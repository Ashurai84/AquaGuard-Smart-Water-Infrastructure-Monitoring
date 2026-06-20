import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { query, getMockDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'aquaguard_jwt_secure_key_123';

app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  const msg = `${req.method} ${req.url} Request received`;
  console.log(msg);
  // Log request in database async
  query('INSERT INTO logs (type, level, message) VALUES ($1, $2, $3)', ['application', 'info', msg]).catch(() => {});
  next();
});

// 1. Auth REST API
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const result = await query('SELECT * FROM users WHERE username = $1', [username.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    // Plaintext check for demo simple validation (or hashed)
    if (user.password_hash !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    // Log login audit
    await query('INSERT INTO logs (type, level, message) VALUES ($1, $2, $3)', ['audit', 'info', `User "${username}" authenticated successfully as role: ${user.role}`]);

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal server login error' });
  }
});

// 2. Dashboard REST API
app.get('/api/dashboard', async (req, res) => {
  try {
    const reservoirs = await query('SELECT * FROM reservoirs');
    const pumps = await query('SELECT * FROM pumps');
    const pipelines = await query('SELECT * FROM pipelines');
    const meters = await query('SELECT * FROM smart_meters');
    const activeAlerts = await query("SELECT * FROM alerts WHERE status = 'Active'");

    const totalReservoirs = reservoirs.rows.length;
    const activePumps = pumps.rows.filter(p => p.status === 'Active').length;
    const activePipelines = pipelines.rows.filter(p => p.status === 'Healthy').length;
    const activeSmartMeters = meters.rows.length;
    
    // Sum flow rates for current consumption
    const totalWaterConsumption = parseFloat(
      pipelines.rows.reduce((acc, p) => acc + (p.status === 'Healthy' ? p.flow_rate : 0), 0).toFixed(1)
    );

    // Calculate system health percentage based on leakage and pump statuses
    const brokenPumps = pumps.rows.filter(p => p.status === 'Overheated').length;
    const brokenPipes = pipelines.rows.filter(p => p.status === 'Leaking').length;
    const totalDevices = totalReservoirs + pumps.rows.length + pipelines.rows.length;
    const systemHealth = parseFloat(
      (((totalDevices - (brokenPumps + brokenPipes)) / totalDevices) * 100).toFixed(1)
    );

    // Dynamic historical consumption chart points
    const baseConsumption = [450, 480, 520, 490, 510, 580, 620];
    // Shift points slightly with noise for live visual updates
    const liveTelemetryVal = totalWaterConsumption > 0 ? totalWaterConsumption : 480;
    const chartData = [...baseConsumption.slice(1), Math.round(liveTelemetryVal)];

    return res.json({
      stats: {
        totalReservoirs,
        activePumps,
        activePipelines,
        activeSmartMeters,
        totalWaterConsumption,
        activeAlerts: activeAlerts.rows.length,
        systemHealth
      },
      recentAlerts: activeAlerts.rows.slice(0, 5),
      chartData
    });
  } catch (err) {
    return res.status(500).json({ message: 'Dashboard read error' });
  }
});

// 3. Reservoir CRUD APIs
app.get('/api/reservoirs', async (req, res) => {
  const result = await query('SELECT * FROM reservoirs ORDER BY id ASC');
  res.json(result.rows);
});

app.post('/api/reservoirs', async (req, res) => {
  const { name, location, capacity_liters, current_level_liters, status } = req.body;
  const result = await query(
    'INSERT INTO reservoirs (name, location, capacity_liters, current_level_liters, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, location, capacity_liters, current_level_liters, status]
  );
  await query('INSERT INTO logs (type, level, message) VALUES ($1, $2, $3)', ['audit', 'info', `Created new reservoir ${name}`]);
  res.status(201).json(result.rows[0]);
});

app.put('/api/reservoirs/:id', async (req, res) => {
  const { name, location, capacity_liters, current_level_liters, status } = req.body;
  const result = await query(
    'UPDATE reservoirs SET name=$1, location=$2, capacity_liters=$3, current_level_liters=$4, status=$5, last_updated=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *',
    [name, location, capacity_liters, current_level_liters, status, req.params.id]
  );
  res.json(result.rows[0]);
});

app.delete('/api/reservoirs/:id', async (req, res) => {
  await query('DELETE FROM reservoirs WHERE id=$1', [req.params.id]);
  await query('INSERT INTO logs (type, level, message) VALUES ($1, $2, $3)', ['audit', 'warn', `Deleted reservoir ID: ${req.params.id}`]);
  res.json({ message: 'Reservoir deleted' });
});

// 4. Pipeline CRUD APIs
app.get('/api/pipelines', async (req, res) => {
  const result = await query('SELECT * FROM pipelines ORDER BY id ASC');
  res.json(result.rows);
});

app.post('/api/pipelines', async (req, res) => {
  const { name, status, flow_rate, pressure, location_start, location_end } = req.body;
  const result = await query(
    'INSERT INTO pipelines (name, status, flow_rate, pressure, location_start, location_end) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [name, status, flow_rate, pressure, location_start, location_end]
  );
  res.status(201).json(result.rows[0]);
});

app.put('/api/pipelines/:id', async (req, res) => {
  const { name, status, flow_rate, pressure, location_start, location_end } = req.body;
  const result = await query(
    'UPDATE pipelines SET name=$1, status=$2, flow_rate=$3, pressure=$4, location_start=$5, location_end=$6, last_updated=CURRENT_TIMESTAMP WHERE id=$7 RETURNING *',
    [name, status, flow_rate, pressure, location_start, location_end, req.params.id]
  );
  res.json(result.rows[0]);
});

app.delete('/api/pipelines/:id', async (req, res) => {
  await query('DELETE FROM pipelines WHERE id=$1', [req.params.id]);
  res.json({ message: 'Pipeline segment deleted' });
});

app.post('/api/pipelines/:id/simulate-leak', async (req, res) => {
  try {
    const id = req.params.id;
    // Set pipeline status to Leaking
    await query("UPDATE pipelines SET status = 'Leaking', pressure = 1.8 WHERE id = $1", [id]);
    
    // Get Pipeline Name
    const pResult = await query("SELECT name FROM pipelines WHERE id = $1", [id]);
    const pName = pResult.rows[0]?.name || `Pipeline ${id}`;

    // Add alert
    await query("INSERT INTO alerts (severity, message, source) VALUES ('Critical', $1, $2)", [
      `Leak detected in ${pName} distribution path. Pressure dropped to 1.8 Bar.`,
      pName
    ]);

    // Insert log
    await query("INSERT INTO logs (type, level, message) VALUES ('sensor', 'error', $1)", [
      `Alert generated: Leak pressure drop registered in ${pName}`
    ]);

    res.json({ message: 'Leak simulated and alert dispatched.' });
  } catch (err) {
    res.status(500).json({ error: 'Simulation failed' });
  }
});

// 5. Pump Station CRUD APIs
app.get('/api/pumps', async (req, res) => {
  const result = await query('SELECT * FROM pumps ORDER BY id ASC');
  res.json(result.rows);
});

app.post('/api/pumps', async (req, res) => {
  const { name, status, temperature, runtime_hours, location } = req.body;
  const result = await query(
    'INSERT INTO pumps (name, status, temperature, runtime_hours, location) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, status, temperature, runtime_hours, location]
  );
  res.status(201).json(result.rows[0]);
});

app.put('/api/pumps/:id', async (req, res) => {
  const { status, temperature, runtime_hours } = req.body;
  
  // Custom update to handle toggle and maintenance status
  let result;
  if (temperature !== undefined && runtime_hours !== undefined) {
    result = await query(
      'UPDATE pumps SET status=$1, temperature=$2, runtime_hours=$3, last_updated=CURRENT_TIMESTAMP WHERE id=$4 RETURNING *',
      [status, temperature, runtime_hours, req.params.id]
    );
  } else {
    result = await query(
      'UPDATE pumps SET status=$1, temperature=$2, last_updated=CURRENT_TIMESTAMP WHERE id=$3 RETURNING *',
      [status, temperature || 25.0, req.params.id]
    );
  }
  
  await query('INSERT INTO logs (type, level, message) VALUES ($1, $2, $3)', [
    'audit', 'info', `Pump ID ${req.params.id} state updated to: ${status}`
  ]);
  res.json(result.rows[0]);
});

app.delete('/api/pumps/:id', async (req, res) => {
  await query('DELETE FROM pumps WHERE id=$1', [req.params.id]);
  res.json({ message: 'Pump deleted' });
});

// 6. Sensor REST APIs
app.get('/api/sensors', async (req, res) => {
  const result = await query('SELECT * FROM sensors ORDER BY id ASC');
  res.json(result.rows);
});

// 7. Alert REST APIs
app.get('/api/alerts', async (req, res) => {
  const result = await query('SELECT * FROM alerts ORDER BY id DESC');
  res.json(result.rows);
});

app.put('/api/alerts/:id', async (req, res) => {
  const { status } = req.body;
  const result = await query('UPDATE alerts SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
  
  const msg = `Alert ID ${req.params.id} marked as: ${status}`;
  await query('INSERT INTO logs (type, level, message) VALUES ($1, $2, $3)', ['audit', 'info', msg]);
  
  res.json(result.rows[0]);
});

// 8. Analytics REST APIs
app.get('/api/analytics', async (req, res) => {
  try {
    const pipelines = await query('SELECT * FROM pipelines');
    const flowSum = pipelines.rows.reduce((acc, p) => acc + p.flow_rate, 0);
    const avgFlow = parseFloat((flowSum / (pipelines.rows.length || 1)).toFixed(1));

    // Calculate simulated metrics
    const efficiencyPct = 94.6;
    const waterLostLiters = 120500;
    const efficiencyHistory = [92, 94, 91, 95, 93, 94, 96];

    const predictiveFailures = [
      { id: 1, name: 'Main Booster Pump Sector 3', runHours: 980.2, estimatedFailureHours: 1200, risk: 'Medium' },
      { id: 2, name: 'Ridge Route Feed Valve', runHours: 1102.8, estimatedFailureHours: 1150, risk: 'High' }
    ];

    res.json({
      avgFlow,
      efficiencyPct,
      waterLostLiters,
      predictiveFailures,
      efficiencyHistory
    });
  } catch (err) {
    res.status(500).json({ error: 'Analytics failure' });
  }
});

// 9. System/Health REST API
app.get('/api/system/health', async (req, res) => {
  // Read system variables or return structured diagnostic load info
  const cpu = 15 + Math.random() * 20;
  const memory = 52 + Math.random() * 10;
  const disk = 42.4;
  const rx = 1.0 + Math.random() * 0.5;
  const tx = 0.5 + Math.random() * 0.4;

  res.json({
    cpu,
    memory,
    disk,
    networkRx: rx,
    networkTx: tx,
    apiHealth: 'Healthy',
    dbHealth: 'Healthy',
    services: [
      { name: 'Authentication API Service', status: 'Online' },
      { name: 'Telemetry Processing Queue', status: 'Online' },
      { name: 'PostgreSQL Connection Pool', status: 'Online' },
      { name: 'Background Alarm Dispatcher', status: 'Online' }
    ]
  });
});

// 10. Logs & Audit REST API
app.get('/api/logs', async (req, res) => {
  const result = await query('SELECT * FROM logs ORDER BY id DESC LIMIT 50');
  res.json(result.rows);
});

// 11. Maintenance REST APIs
app.get('/api/maintenance', async (req, res) => {
  const result = await query('SELECT * FROM maintenance_requests ORDER BY id DESC');
  res.json(result.rows);
});

app.post('/api/maintenance', async (req, res) => {
  const { equipment_type, equipment_id, issue, priority, assigned_engineer_id, status } = req.body;
  const result = await query(
    'INSERT INTO maintenance_requests (equipment_type, equipment_id, issue, priority, assigned_engineer_id, assigned_name, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [equipment_type, equipment_id, issue, priority, assigned_engineer_id, 'Engineer Dave', status || 'Pending']
  );
  await query('INSERT INTO logs (type, level, message) VALUES ($1, $2, $3)', [
    'audit', 'info', `Maintenance requested for ${equipment_type} ID ${equipment_id}`
  ]);
  res.status(201).json(result.rows[0]);
});

app.put('/api/maintenance/:id', async (req, res) => {
  const { status } = req.body;
  const result = await query('UPDATE maintenance_requests SET status=$1 WHERE id=$2 RETURNING *', [status, req.params.id]);
  
  // Audit log
  await query('INSERT INTO logs (type, level, message) VALUES ($1, $2, $3)', [
    'audit', 'info', `Maintenance request #${req.params.id} updated to: ${status}`
  ]);
  res.json(result.rows[0]);
});

// ==========================================
// BACKGROUND TELEMETRY SIMULATOR
// ==========================================
setInterval(async () => {
  try {
    const mockData = getMockDb();
    
    // 1. Slightly fluctuate reservoir levels
    const resResult = await query('SELECT id, current_level_liters, capacity_liters FROM reservoirs');
    for (const r of resResult.rows) {
      const change = (Math.random() - 0.5) * 50000; // Fluctuate +/- 50,000 liters
      const nextLevel = Math.max(0, Math.min(r.capacity_liters, r.current_level_liters + change));
      await query('UPDATE reservoirs SET current_level_liters = $1 WHERE id = $2', [
        parseFloat(nextLevel.toFixed(0)), r.id
      ]);
    }

    // 2. Oscillate active pipeline flow rates
    const pipesResult = await query("SELECT id, flow_rate, status FROM pipelines WHERE status = 'Healthy'");
    for (const p of pipesResult.rows) {
      const flowChange = (Math.random() - 0.5) * 2;
      const nextFlow = Math.max(5, p.flow_rate + flowChange);
      await query('UPDATE pipelines SET flow_rate = $1 WHERE id = $2', [
        parseFloat(nextFlow.toFixed(1)), p.id
      ]);
    }

    // 3. Increment pump runtime and vary temp
    const pumpsResult = await query("SELECT id, runtime_hours, temperature, status FROM pumps WHERE status = 'Active'");
    for (const p of pumpsResult.rows) {
      const runtimeIncr = 0.05; // 3 mins simulated runtime increment
      const tempChange = (Math.random() - 0.5) * 1.5;
      const nextTemp = Math.max(35, Math.min(85, p.temperature + tempChange));
      await query('UPDATE pumps SET runtime_hours = $1, temperature = $2 WHERE id = $3', [
        parseFloat((p.runtime_hours + runtimeIncr).toFixed(2)),
        parseFloat(nextTemp.toFixed(1)),
        p.id
      ]);
    }
  } catch (err) {
    // Simulator error ignored during mock run
  }
}, 10000); // Trigger every 10 seconds

app.listen(PORT, () => {
  console.log(`AquaGuard API running on http://localhost:${PORT}`);
});
export default app;
