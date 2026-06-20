import React, { useState, useEffect } from 'react';
import { Droplet, GitFork, Activity, AlertTriangle, Radio, ShieldCheck, Zap } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState({
    stats: {
      totalReservoirs: 8,
      activePumps: 24,
      activePipelines: 112,
      activeSmartMeters: 14502,
      totalWaterConsumption: 4850.2,
      activeAlerts: 3,
      systemHealth: 98.4
    },
    recentAlerts: [
      { id: 1, severity: 'Critical', message: 'Leak detected in Sector 4 Pipeline A', source: 'Pipeline Sensor 14', timestamp: 'Just now' },
      { id: 2, severity: 'Warning', message: 'High pump temperature recorded: 82°C', source: 'Pump Station 3', timestamp: '12 min ago' },
      { id: 3, severity: 'Warning', message: 'Reservoir Level below 20%', source: 'East Side Reservoir', timestamp: '45 min ago' }
    ],
    chartData: [450, 480, 520, 490, 510, 580, 620]
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const resData = await response.json();
          setData(resData);
        }
      } catch (err) {
        console.warn("Express API dashboard unavailable, using mock telemetry context.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Compute SVG line path points based on values
  const points = data.chartData
    .map((val, index) => {
      const x = 50 + index * 100;
      const y = 200 - (val / 700) * 150;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="container" id="dashboard-view">
      {/* Metric Cards Row */}
      <div className="dashboard-metrics-grid">
        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Reservoirs</span>
            <span className="stat-value cyan">{data.stats.totalReservoirs}</span>
          </div>
          <div className="stat-icon-wrapper cyan">
            <Droplet size={24} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Active Pumps</span>
            <span className="stat-value blue">{data.stats.activePumps}</span>
          </div>
          <div className="stat-icon-wrapper blue">
            <Activity size={24} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Active Pipelines</span>
            <span className="stat-value green">{data.stats.activePipelines}</span>
          </div>
          <div className="stat-icon-wrapper green">
            <GitFork size={24} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Smart Meters</span>
            <span className="stat-value orange">{data.stats.activeSmartMeters.toLocaleString()}</span>
          </div>
          <div className="stat-icon-wrapper orange">
            <Zap size={24} />
          </div>
        </div>
      </div>

      <div className="dashboard-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Water Consumption (L/s)</span>
            <span className="stat-value cyan">{data.stats.totalWaterConsumption}</span>
          </div>
          <div className="stat-icon-wrapper cyan">
            <Droplet size={24} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Active Alerts</span>
            <span className="stat-value red">{data.stats.activeAlerts}</span>
          </div>
          <div className="stat-icon-wrapper red">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">System Health</span>
            <span className="stat-value green">{data.stats.systemHealth}%</span>
          </div>
          <div className="stat-icon-wrapper green">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* Chart and Alerts Row */}
      <div className="dashboard-charts-section">
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">Real-time Water Flow Telemetry (L/s)</h3>
          </div>
          <div className="panel-body">
            <div className="chart-container-svg">
              <svg className="chart-svg-graphic" viewBox="0 0 700 220">
                <defs>
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-cyan)" />
                    <stop offset="100%" stopColor="rgba(0, 242, 254, 0)" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="50" y1="50" x2="650" y2="50" className="chart-grid-line" />
                <line x1="50" y1="100" x2="650" y2="100" className="chart-grid-line" />
                <line x1="50" y1="150" x2="650" y2="150" className="chart-grid-line" />
                <line x1="50" y1="200" x2="650" y2="200" className="chart-grid-line" />

                {/* Y-Axis labels */}
                <text x="20" y="55" className="chart-axis-label">600</text>
                <text x="20" y="105" className="chart-axis-label">400</text>
                <text x="20" y="155" className="chart-axis-label">200</text>
                <text x="20" y="205" className="chart-axis-label">0</text>

                {/* X-Axis labels */}
                {data.chartData.map((_, i) => (
                  <text key={i} x={50 + i * 100} y="218" className="chart-axis-label" textAnchor="middle">
                    {`18:${(i * 10).toString().padStart(2, '0')}`}
                  </text>
                ))}

                {/* Area under the path */}
                <path
                  d={`M 50 200 L ${points} L 650 200 Z`}
                  className="chart-data-area"
                />

                {/* Line path */}
                <path
                  d={`M ${points}`}
                  className="chart-data-line"
                />

                {/* Data point glowing dots */}
                {data.chartData.map((val, index) => {
                  const x = 50 + index * 100;
                  const y = 200 - (val / 700) * 150;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="var(--accent-cyan)"
                      stroke="var(--bg-secondary)"
                      strokeWidth="2"
                      style={{ filter: 'drop-shadow(0 0 4px var(--accent-cyan))' }}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">Critical System Incidents</h3>
          </div>
          <div className="panel-body">
            <div className="alert-feed-list">
              {data.recentAlerts.map(alert => (
                <div key={alert.id} className={`alert-feed-item ${alert.severity.toLowerCase()}`}>
                  <AlertTriangle 
                    size={18} 
                    className={alert.severity === 'Critical' ? 'text-danger' : 'text-warning'} 
                    style={{ color: alert.severity === 'Critical' ? 'var(--accent-red)' : 'var(--accent-orange)' }} 
                  />
                  <div className="alert-content-box">
                    <span className="alert-msg">{alert.message}</span>
                    <span className="alert-meta">{alert.source} • {alert.timestamp}</span>
                  </div>
                </div>
              ))}
              {data.recentAlerts.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  All systems healthy. No active alerts.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
