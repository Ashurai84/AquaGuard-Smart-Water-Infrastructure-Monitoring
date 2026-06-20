import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wrench, Plus, CheckCircle, Clock, Shield, AlertTriangle } from 'lucide-react';

const Maintenance = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([
    { id: 1, equipment_type: 'Pipeline', equipment_id: 2, issue: 'Leak detected in Sector 4 Pipeline A', priority: 'Critical', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'In Progress' },
    { id: 2, equipment_type: 'Pump', equipment_id: 4, issue: 'High pump temperature recorded: 86°C', priority: 'High', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Pending' },
    { id: 3, equipment_type: 'Reservoir', equipment_id: 2, issue: 'Reservoir level below 20% limit', priority: 'Medium', assigned_engineer_id: 3, assigned_name: 'Engineer Dave', status: 'Pending' }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [equipType, setEquipType] = useState('Pipeline');
  const [equipId, setEquipId] = useState('');
  const [issue, setIssue] = useState('');
  const [priority, setPriority] = useState('Low');
  const [assignee, setAssignee] = useState('Engineer Dave');

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/maintenance');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.warn("Express API maintenance unavailable, using local mock data.");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, currentStatus) => {
    let nextStatus = 'In Progress';
    if (currentStatus === 'In Progress') nextStatus = 'Resolved';
    if (currentStatus === 'Resolved') return;

    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) fetchRequests();
    } catch (err) {
      setRequests(requests.map(r => r.id === id ? { ...r, status: nextStatus } : r));
    }
  };

  const handleSave = async () => {
    const payload = {
      equipment_type: equipType,
      equipment_id: parseInt(equipId) || 1,
      issue,
      priority,
      assigned_engineer_id: 3,
      assigned_name: assignee,
      status: 'Pending'
    };

    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) fetchRequests();
    } catch (err) {
      setRequests([...requests, { id: Date.now(), ...payload }]);
    }
    setModalOpen(false);
  };

  const isReadOnly = user?.role === 'Field Engineer';

  return (
    <div className="container" id="maintenance-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Log and assign utility hardware repair tasks and track active field work.</p>
        {user?.role !== 'Field Engineer' && (
          <button className="btn btn-primary" onClick={() => setModalOpen(true)} id="btn-add-maintenance">
            <Plus size={16} />
            <span>Create Request</span>
          </button>
        )}
      </div>

      <div className="glass-panel data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Asset Info</th>
              <th>Issue Description</th>
              <th>Priority</th>
              <th>Assigned Tech</th>
              <th>Work Status</th>
              <th>Workflow Controls</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>#{r.id}</td>
                <td>
                  <span className="badge badge-info">{r.equipment_type} (ID: {r.equipment_id})</span>
                </td>
                <td style={{ fontSize: '0.85rem' }}>{r.issue}</td>
                <td>
                  <span className={`priority-indicator ${r.priority.toLowerCase()}`}>
                    {r.priority}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                    <Shield size={12} className="text-secondary" />
                    <span>{r.assigned_name || 'Dave (Field Eng)'}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${r.status === 'Resolved' ? 'badge-success' : r.status === 'In Progress' ? 'badge-warning' : 'badge-danger'}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  {r.status !== 'Resolved' ? (
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', borderColor: r.status === 'In Progress' ? 'var(--accent-green)' : 'var(--accent-orange)' }} 
                      onClick={() => handleUpdateStatus(r.id, r.status)}
                      id={`btn-update-status-${r.id}`}
                    >
                      {r.status === 'Pending' ? (
                        <>
                          <Clock size={12} />
                          <span>Start Work</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={12} />
                          <span>Complete Task</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Work Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel">
            <div className="modal-header">
              <h3 className="panel-title">Submit Maintenance Request</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Equipment Type</label>
                <select className="form-control" value={equipType} onChange={(e) => setEquipType(e.target.value)}>
                  <option value="Pipeline">Pipeline</option>
                  <option value="Pump">Pump</option>
                  <option value="Reservoir">Reservoir</option>
                  <option value="Sensor">Sensor</option>
                  <option value="Smart Meter">Smart Meter</option>
                </select>
              </div>
              <div className="form-group">
                <label>Asset ID</label>
                <input type="number" className="form-control" placeholder="1" value={equipId} onChange={(e) => setEquipId(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Issue Description</label>
                <textarea className="form-control" rows="3" placeholder="Describe the fault..." value={issue} onChange={(e) => setIssue(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assigned Engineer</label>
                <input type="text" className="form-control" value={assignee} onChange={(e) => setAssignee(e.target.value)} required />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
