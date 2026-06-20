import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Network, ShieldAlert, CheckCircle2 } from 'lucide-react';

const Monitoring = () => {
  const [metrics, setMetrics] = useState({
    cpu: 24,
    memory: 58,
    disk: 42,
    networkRx: 1.2,
    networkTx: 0.8,
    apiHealth: 'Healthy',
    dbHealth: 'Healthy',
    services: [
      { name: 'Authentication API Service', status: 'Online' },
      { name: 'Telemetry Processing Queue', status: 'Online' },
      { name: 'PostgreSQL Connection Pool', status: 'Online' },
      { name: 'Background Alarm Dispatcher', status: 'Online' }
    ]
  });

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/system/health');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.warn("Express API system monitoring metrics unavailable, rendering simulated load dial states.");
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  const renderCircularGauge = (value, label, icon) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="glass-panel metric-dial-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          {icon}
          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{label}</span>
        </div>
        <div className="dial-svg-wrapper">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--accent-cyan)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          <div className="dial-svg-text">
            <span className="dial-value">{Math.round(value)}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container" id="monitoring-view">
      <p style={{ color: 'var(--text-secondary)' }}>Observe virtualization layer performance, server loads, and microservice status logs.</p>
      
      <div className="system-metrics-grid">
        {renderCircularGauge(metrics.cpu, 'CPU Load', <Cpu size={18} />)}
        {renderCircularGauge(metrics.memory, 'Memory Usage', <HardDrive size={18} />)}
        {renderCircularGauge(metrics.disk, 'Disk Space', <HardDrive size={18} />)}
      </div>

      <div className="dashboard-charts-section" style={{ marginTop: '1rem' }}>
        {/* Network & Traffic */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Network size={20} className="text-secondary" />
            <span>Network I/O & Load</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
            <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>INBOUND (RX)</span>
              <strong style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)' }}>{metrics.networkRx.toFixed(2)} MB/s</strong>
            </div>
            <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>OUTBOUND (TX)</span>
              <strong style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)' }}>{metrics.networkTx.toFixed(2)} MB/s</strong>
            </div>
          </div>
        </div>

        {/* API and Database Health Indicators */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="panel-title" style={{ marginBottom: '1rem' }}>Active Service Registrations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem' }}>Main API Server Gateway</span>
              <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>{metrics.apiHealth}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem' }}>PostgreSQL Datastore Pool</span>
              <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>{metrics.dbHealth}</span>
            </div>
            {metrics.services.map((srv, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{srv.name}</span>
                <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>{srv.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
