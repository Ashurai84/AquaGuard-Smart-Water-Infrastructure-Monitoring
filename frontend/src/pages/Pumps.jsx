import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Power, Thermometer, Clock, Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';

const Pumps = () => {
  const { user } = useAuth();
  const [pumps, setPumps] = useState([
    { id: 1, name: 'Main Intake Pump 1A', status: 'Active', temperature: 48.2, runtime_hours: 1245.5, location: 'Intake Plant North' },
    { id: 2, name: 'High-Pressure Booster 2', status: 'Active', temperature: 78.4, runtime_hours: 980.2, location: 'Station Sector 3' },
    { id: 3, name: 'Auxiliary Drain Pump', status: 'Inactive', temperature: 24.1, runtime_hours: 145.0, location: 'West Gate Facility' },
    { id: 4, name: 'High-Pressure Booster 1', status: 'Overheated', temperature: 86.5, runtime_hours: 1102.8, location: 'Station Sector 3' }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Active');
  const [temp, setTemp] = useState('');
  const [runtime, setRuntime] = useState('');
  const [location, setLocation] = useState('');

  const fetchPumps = async () => {
    try {
      const res = await fetch('/api/pumps');
      if (res.ok) {
        const data = await res.json();
        setPumps(data);
      }
    } catch (err) {
      console.warn("Express API pumps unavailable, using local mock data.");
    }
  };

  useEffect(() => {
    fetchPumps();
  }, []);

  const handleToggleState = async (id, currentStatus) => {
    if (user?.role === 'Field Engineer') {
      alert("Permission denied. Only Admins and Operations Managers can toggle pump hardware.");
      return;
    }
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`/api/pumps/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, temperature: newStatus === 'Active' ? 45.0 : 20.0 })
      });
      if (res.ok) fetchPumps();
    } catch (err) {
      setPumps(pumps.map(p => p.id === id ? { ...p, status: newStatus, temperature: newStatus === 'Active' ? 45.0 : 20.0 } : p));
    }
  };

  const handleRequestMaintenance = async (pump) => {
    const payload = {
      equipment_type: 'Pump',
      equipment_id: pump.id,
      issue: `Pump ${pump.name} requires service. Temperature: ${pump.temperature}°C, Runtime: ${pump.runtime_hours} hrs.`,
      priority: pump.status === 'Overheated' ? 'High' : 'Low',
      assigned_engineer_id: 3,
      status: 'Pending'
    };

    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) alert("Maintenance request filed successfully!");
    } catch (err) {
      alert("Local maintenance request created.");
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setName('');
    setStatus('Active');
    setTemp('');
    setRuntime('');
    setLocation('');
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditId(p.id);
    setName(p.name);
    setStatus(p.status);
    setTemp(p.temperature);
    setRuntime(p.runtime_hours);
    setLocation(p.location);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      name,
      status,
      temperature: parseFloat(temp),
      runtime_hours: parseFloat(runtime),
      location
    };

    try {
      let method = 'POST';
      let url = '/api/pumps';
      if (editId) {
        method = 'PUT';
        url = `/api/pumps/${editId}`;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) fetchPumps();
    } catch (err) {
      if (editId) {
        setPumps(pumps.map(p => p.id === editId ? { ...p, ...payload } : p));
      } else {
        setPumps([...pumps, { id: Date.now(), ...payload }]);
      }
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pump station record?")) return;
    try {
      const res = await fetch(`/api/pumps/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPumps();
    } catch (err) {
      setPumps(pumps.filter(p => p.id !== id));
    }
  };

  const isReadOnly = user?.role === 'Field Engineer';
  const isAdmin = user?.role === 'Admin';

  return (
    <div className="container" id="pumps-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Control water pump operation, monitor machine temperatures, and review engine run hours.</p>
        {!isReadOnly && (
          <button className="btn btn-primary" onClick={openAddModal} id="btn-add-pump">
            <Plus size={16} />
            <span>Add Pump</span>
          </button>
        )}
      </div>

      <div className="dashboard-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {pumps.map(p => {
          let tempColor = 'var(--accent-green)';
          if (p.temperature > 80) tempColor = 'var(--accent-red)';
          else if (p.temperature > 65) tempColor = 'var(--accent-orange)';

          return (
            <div key={p.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{p.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.location}</span>
                </div>
                <span className={`badge ${p.status === 'Active' ? 'badge-success' : p.status === 'Inactive' ? 'badge-info' : 'badge-danger'}`}>
                  {p.status}
                </span>
              </div>

              {/* Status parameters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.01)' }}>
                  <Thermometer size={20} style={{ color: tempColor }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Temperature</span>
                    <strong style={{ color: tempColor, fontFamily: 'var(--font-mono)' }}>{p.temperature}°C</strong>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.01)' }}>
                  <Clock size={20} className="text-secondary" />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Runtimes</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>{p.runtime_hours.toFixed(1)}h</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} 
                    onClick={() => handleToggleState(p.id, p.status)}
                    disabled={isReadOnly}
                    id={`btn-toggle-pump-${p.id}`}
                  >
                    <Power size={12} />
                    <span>{p.status === 'Active' ? 'Turn Off' : 'Turn On'}</span>
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleRequestMaintenance(p)}>
                    <span>Fix</span>
                  </button>
                </div>

                {!isReadOnly && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="action-btn-small" onClick={() => openEditModal(p)} title="Edit Pump">
                      <Edit2 size={14} />
                    </button>
                    {isAdmin && (
                      <button className="action-btn-small danger" onClick={() => handleDelete(p.id)} title="Delete Pump">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel">
            <div className="modal-header">
              <h3 className="panel-title">{editId ? 'Edit Pump Station' : 'Add Pump Station'}</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Pump Station Name</label>
                <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Overheated">Overheated</option>
                </select>
              </div>
              <div className="form-group">
                <label>Temperature (°C)</label>
                <input type="number" className="form-control" value={temp} onChange={(e) => setTemp(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Runtime Hours</label>
                <input type="number" className="form-control" value={runtime} onChange={(e) => setRuntime(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} required />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pumps;
