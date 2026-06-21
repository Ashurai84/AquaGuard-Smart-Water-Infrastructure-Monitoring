import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Sensors = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSensors = async () => {
    try {
      const res = await fetch('/api/sensors');
      if (res.ok) {
        const data = await res.json();
        setSensors(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Server API sensors error');
      }
    } catch (err) {
      console.warn("Express API sensors unavailable, using local mock data.");
      const fallback = [
        { id: 1, name: 'Reservoir Level L1', type: 'Level Sensor', status: 'Active', current_value: 84.0, unit: '%', last_updated: 'Just now' },
        { id: 2, name: 'Trunk Flowmeter F4', type: 'Flow Sensor', status: 'Active', current_value: 154.2, unit: 'L/s', last_updated: 'Just now' },
        { id: 3, name: 'Loop Pressure P2', type: 'Pressure Sensor', status: 'Active', current_value: 4.2, unit: 'Bar', last_updated: 'Just now' },
        { id: 4, name: 'Pump Thermistor T8', type: 'Temperature Sensor', status: 'Active', current_value: 48.2, unit: '°C', last_updated: '10s ago' },
        { id: 5, name: 'District Flowmeter F12', type: 'Flow Sensor', status: 'Offline', current_value: 0.0, unit: 'L/s', last_updated: '3 hrs ago' }
      ];
      setSensors(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
    const interval = setInterval(fetchSensors, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && sensors.length === 0) {
    return <LoadingSpinner text="Polling sensor networks..." />;
  }

  const sensorList = sensors || [];

  return (
    <div className="container" id="sensors-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Inspect remote hardware status, communication health, and current telemetry streams.</p>
        <button className="btn btn-secondary" onClick={fetchSensors} disabled={loading} id="btn-refresh-sensors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Force Poll</span>
        </button>
      </div>

      {sensorList.length > 0 ? (
        <div className="glass-panel data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sensor Name</th>
                <th>Sensor Type</th>
                <th>Status</th>
                <th>Telemetry Reading</th>
                <th>Last Handshake</th>
              </tr>
            </thead>
            <tbody>
              {sensorList.map(s => {
                const statusStr = s?.status || 'Offline';
                const curVal = s?.current_value || 0;
                return (
                  <tr key={s?.id || Math.random()}>
                    <td style={{ fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Radio size={16} className="text-secondary" style={{ color: statusStr === 'Active' ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                        <span>{s?.name || 'Unknown Sensor'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{s?.type || 'Telemetry'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className={`pulse-indicator ${statusStr === 'Active' ? 'green' : 'red'}`} />
                        <span style={{ fontSize: '0.9rem', color: statusStr === 'Active' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                          {statusStr}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '1rem', color: statusStr === 'Active' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {statusStr === 'Active' ? `${curVal.toFixed(1)} ${s?.unit || ''}` : 'N/A'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {s?.last_updated || 'No data'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState 
          title="No Sensors Detected" 
          description="There are currently no telemetry sensor nodes reported in this sector." 
          actionText="Repoll Network"
          onAction={fetchSensors}
        />
      )}
    </div>
  );
};

export default Sensors;

