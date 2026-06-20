import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';

const Alerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([
    { id: 1, severity: 'Critical', message: 'Leak detected in Sector 4 Pipeline A', source: 'Pipeline Sensor 14', status: 'Active', timestamp: '2026-06-20 22:15:30' },
    { id: 2, severity: 'Warning', message: 'High pump temperature recorded: 86°C', source: 'Pump Station 3', status: 'Active', timestamp: '2026-06-20 22:04:15' },
    { id: 3, severity: 'Warning', message: 'Reservoir Level below 20%', source: 'East Side Reservoir', status: 'Active', timestamp: '2026-06-20 21:30:10' },
    { id: 4, severity: 'Info', message: 'Backup power battery test completed', source: 'Intake Plant Backup', status: 'Resolved', timestamp: '2026-06-20 18:12:00' }
  ]);

  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active');

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.warn("Express API alerts unavailable, using local mock data.");
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved' })
      });
      if (res.ok) fetchAlerts();
    } catch (err) {
      setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
    }
  };

  const filteredAlerts = alerts.filter(a => {
    const sevMatch = severityFilter === 'All' || a.severity === severityFilter;
    const statMatch = statusFilter === 'All' || a.status === statusFilter;
    return sevMatch && statMatch;
  });

  return (
    <div className="container" id="alerts-view">
      {/* Filters Row */}
      <div className="filter-row">
        <div className="filter-item">
          <label>Severity Level</label>
          <select className="filter-input" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="All">All Severities</option>
            <option value="Critical">Critical Only</option>
            <option value="Warning">Warnings Only</option>
            <option value="Info">Information Only</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Status Filter</label>
          <select className="filter-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Alerts</option>
            <option value="Active">Active Only</option>
            <option value="Resolved">Resolved Only</option>
          </select>
        </div>
      </div>

      <div className="glass-panel data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Incident Details</th>
              <th>Severity</th>
              <th>Source Component</th>
              <th>Triggered Time</th>
              <th>Current Status</th>
              <th>Resolution Controls</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map(alert => (
              <tr key={alert.id}>
                <td style={{ fontWeight: '600' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle 
                      size={18} 
                      style={{ color: alert.severity === 'Critical' ? 'var(--accent-red)' : alert.severity === 'Warning' ? 'var(--accent-orange)' : 'var(--accent-cyan)' }} 
                    />
                    <span>{alert.message}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${alert.severity === 'Critical' ? 'badge-danger' : alert.severity === 'Warning' ? 'badge-warning' : 'badge-info'}`}>
                    {alert.severity}
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{alert.source}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{alert.timestamp}</td>
                <td>
                  <span className={`badge ${alert.status === 'Active' ? 'badge-danger' : 'badge-success'}`}>
                    {alert.status}
                  </span>
                </td>
                <td>
                  {alert.status === 'Active' ? (
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} 
                      onClick={() => handleResolve(alert.id)}
                      id={`btn-resolve-alert-${alert.id}`}
                    >
                      <CheckCircle2 size={12} className="text-success" />
                      <span>Resolve</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ShieldCheck size={14} className="text-success" />
                      <span>Closed</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filteredAlerts.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No alerts match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Alerts;
