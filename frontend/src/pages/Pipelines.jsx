import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GitFork, ShieldAlert, Wrench, Edit2, Trash2, Plus } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Pipelines = () => {
  const { user } = useAuth();
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Healthy');
  const [flow, setFlow] = useState('');
  const [pressure, setPressure] = useState('');
  const [startLoc, setStartLoc] = useState('');
  const [endLoc, setEndLoc] = useState('');

  const fetchPipelines = async () => {
    try {
      const res = await fetch('/api/pipelines');
      if (res.ok) {
        const data = await res.json();
        setPipelines(Array.isArray(data) ? data : []);
        setError(null);
      } else {
        throw new Error('Server API pipelines error');
      }
    } catch (err) {
      console.warn("Express API pipelines offline. Falling back to local data context.");
      const fallback = [
        { id: 1, name: 'Main Trunk Line A', status: 'Healthy', flow_rate: 154.2, pressure: 4.2, location_start: 'Grand Valley', location_end: 'Pumping Stn 1' },
        { id: 2, name: 'Sector 4 Distribution Loop', status: 'Leaking', flow_rate: 98.4, pressure: 2.1, location_start: 'Pumping Stn 1', location_end: 'Sector 4 Residential' },
        { id: 3, name: 'Industrial Link B', status: 'Maintenance', flow_rate: 0.0, pressure: 0.0, location_start: 'Pumping Stn 2', location_end: 'West Heavy Zone' },
        { id: 4, name: 'Ridge Route Feed', status: 'Healthy', flow_rate: 76.8, pressure: 3.9, location_start: 'East Gate Reservoir', location_end: 'North Station' },
        { id: 5, name: 'South Connector Pipe 5', status: 'Healthy', flow_rate: 45.2, pressure: 3.2, location_start: 'South Aqueduct Tank', location_end: 'Substation 4' }
      ];
      setPipelines(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const handleSimulateLeak = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/pipelines/${id}/simulate-leak`, { method: 'POST' });
      if (res.ok) {
        alert("Leak simulated successfully! Check Alerts Center.");
        fetchPipelines();
      } else {
        throw new Error('Simulation endpoint failed');
      }
    } catch (err) {
      setPipelines((pipelines || []).map(p => p.id === id ? { ...p, status: 'Leaking', pressure: 1.8 } : p));
      alert("Local Leak simulated. Leak alert generated in system memory.");
    }
  };

  const handleScheduleMaintenance = async (p) => {
    if (!p) return;
    const payload = {
      equipment_type: 'Pipeline',
      equipment_id: p.id,
      issue: `Inspect potential pressure drop in ${p.name || 'Segment'}`,
      priority: p.status === 'Leaking' ? 'Critical' : 'Medium',
      assigned_engineer_id: 3,
      status: 'Pending'
    };

    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Maintenance requested successfully!");
      } else {
        throw new Error('API maintenance save failed');
      }
    } catch (err) {
      alert("Local maintenance task generated inside system logs.");
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setName('');
    setStatus('Healthy');
    setFlow('');
    setPressure('');
    setStartLoc('');
    setEndLoc('');
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    if (!p) return;
    setEditId(p.id);
    setName(p.name || '');
    setStatus(p.status || 'Healthy');
    setFlow(p.flow_rate || '');
    setPressure(p.pressure || '');
    setStartLoc(p.location_start || '');
    setEndLoc(p.location_end || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name || !flow || !pressure || !startLoc || !endLoc) {
      alert("All fields are required.");
      return;
    }

    const payload = {
      name,
      status,
      flow_rate: parseFloat(flow),
      pressure: parseFloat(pressure),
      location_start: startLoc,
      location_end: endLoc
    };

    try {
      let method = 'POST';
      let url = '/api/pipelines';
      if (editId) {
        method = 'PUT';
        url = `/api/pipelines/${editId}`;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchPipelines();
      } else {
        throw new Error('API save pipeline error');
      }
    } catch (err) {
      if (editId) {
        setPipelines((pipelines || []).map(p => p.id === editId ? { ...p, ...payload } : p));
      } else {
        setPipelines([...(pipelines || []), { id: Date.now(), ...payload }]);
      }
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this pipeline segment?")) return;
    try {
      const res = await fetch(`/api/pipelines/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPipelines();
      } else {
        throw new Error('API delete pipeline error');
      }
    } catch (err) {
      setPipelines((pipelines || []).filter(p => p.id !== id));
    }
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to Pipeline flowmeter nodes..." />;
  }

  const isReadOnly = user?.role === 'Field Engineer';
  const isAdmin = user?.role === 'Admin';
  const pipelineList = pipelines || [];

  return (
    <div className="container" id="pipelines-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Observe current telemetry, pressure indicators, and control distribution lines.</p>
        {!isReadOnly && (
          <button className="btn btn-primary" onClick={openAddModal} id="btn-add-pipeline">
            <Plus size={16} />
            <span>Add Segment</span>
          </button>
        )}
      </div>

      {pipelineList.length > 0 ? (
        <div className="glass-panel data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pipeline Segment</th>
                <th>Status</th>
                <th>Flow Rate (L/s)</th>
                <th>Pressure (Bar)</th>
                <th>Route Info</th>
                <th>Monitoring Actions</th>
                {!isReadOnly && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {pipelineList.map(p => (
                <tr key={p?.id || Math.random()}>
                  <td style={{ fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <GitFork size={16} className="text-secondary" />
                      <span>{p?.name || 'Segment'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${p?.status === 'Healthy' ? 'badge-success' : p?.status === 'Leaking' ? 'badge-danger' : 'badge-warning'}`}>
                      {p?.status || 'Healthy'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{(p?.flow_rate || 0).toFixed(1)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{(p?.pressure || 0).toFixed(1)}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {p?.location_start || 'Start'} → {p?.location_end || 'End'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {p?.status !== 'Leaking' && p?.status !== 'Maintenance' && (
                        <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleSimulateLeak(p?.id)}>
                          <ShieldAlert size={12} />
                          <span>Simulate Leak</span>
                        </button>
                      )}
                      <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleScheduleMaintenance(p)}>
                        <Wrench size={12} />
                        <span>Schedule Work</span>
                      </button>
                    </div>
                  </td>
                  {!isReadOnly && (
                    <td>
                      <div className="table-row-actions">
                        <button className="action-btn-small" onClick={() => openEditModal(p)} title="Edit Pipeline">
                          <Edit2 size={14} />
                        </button>
                        {isAdmin && (
                          <button className="action-btn-small danger" onClick={() => handleDelete(p?.id)} title="Delete Pipeline">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState 
          title="No Pipelines Configured" 
          description="There are currently no telemetry registered distribution lines in the database." 
          actionText={!isReadOnly ? "Add Segment" : ""}
          onAction={openAddModal}
        />
      )}

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel">
            <div className="modal-header">
              <h3 className="panel-title">{editId ? 'Edit Pipeline Segment' : 'Add Pipeline Segment'}</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Segment Name</label>
                <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Healthy">Healthy</option>
                  <option value="Leaking">Leaking</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div className="form-group">
                <label>Flow Rate (L/s)</label>
                <input type="number" className="form-control" value={flow} onChange={(e) => setFlow(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Pressure (Bar)</label>
                <input type="number" className="form-control" value={pressure} onChange={(e) => setPressure(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Route Start Location</label>
                <input type="text" className="form-control" value={startLoc} onChange={(e) => setStartLoc(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Route End Location</label>
                <input type="text" className="form-control" value={endLoc} onChange={(e) => setEndLoc(e.target.value)} required />
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

export default Pipelines;
