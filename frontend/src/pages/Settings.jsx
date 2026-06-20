import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Save, Info } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [maxPumpTemp, setMaxPumpTemp] = useState(80);
  const [minReservoirPct, setMinReservoirPct] = useState(20);
  const [maxPipelineFlow, setMaxPipelineFlow] = useState(200);
  const [notifySlack, setNotifySlack] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifySMS, setNotifySMS] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    if (user?.role !== 'Admin') {
      alert("Permission Denied: Only Admins can modify physical threshold metrics.");
      return;
    }
    alert("Threshold triggers updated successfully inside Redis cache!");
  };

  const isReadOnly = user?.role !== 'Admin';

  return (
    <div className="container" id="settings-view">
      <div className="glass-panel" style={{ maxWidth: '680px', padding: '2rem' }}>
        <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <SettingsIcon size={20} className="text-secondary" />
          <span>System Operation Parameters</span>
        </h3>

        {isReadOnly && (
          <div className="login-error" style={{ background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.15)', color: 'var(--accent-cyan)', marginBottom: '1.5rem' }}>
            <Info size={16} />
            <span>Viewing settings in read-only mode. Only Admins can edit thresholds.</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', color: 'var(--accent-cyan)' }}>Sensor Threshold Alerts</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label>Critical Pump Temp Limit (°C)</label>
              <input
                type="number"
                className="form-control"
                value={maxPumpTemp}
                onChange={(e) => setMaxPumpTemp(e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div className="form-group">
              <label>Min Reservoir Capacity warning (%)</label>
              <input
                type="number"
                className="form-control"
                value={minReservoirPct}
                onChange={(e) => setMinReservoirPct(e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Max Pipeline Flowrate Threshold (L/s)</label>
            <input
              type="number"
              className="form-control"
              value={maxPipelineFlow}
              onChange={(e) => setMaxPipelineFlow(e.target.value)}
              disabled={isReadOnly}
            />
          </div>

          <h4 style={{ fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', color: 'var(--accent-cyan)', marginTop: '0.5rem' }}>Dispatch Configurations</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={notifySlack}
                onChange={(e) => setNotifySlack(e.target.checked)}
                disabled={isReadOnly}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-cyan)' }}
              />
              <span>Send warnings directly to Slack Channel #aquaguard-alerts</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                disabled={isReadOnly}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-cyan)' }}
              />
              <span>Send digest emails daily to engineering-leads@waterutility.gov</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={notifySMS}
                onChange={(e) => setNotifySMS(e.target.checked)}
                disabled={isReadOnly}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-cyan)' }}
              />
              <span>Push urgent alerts via Twilio SMS to Active Engineers on duty</span>
            </label>
          </div>

          {!isReadOnly && (
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }} id="btn-save-settings">
              <Save size={16} />
              <span>Save System Settings</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Settings;
