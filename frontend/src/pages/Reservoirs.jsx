import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Droplets, MapPin } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Reservoirs = () => {
  const { user } = useAuth();
  const [reservoirs, setReservoirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [level, setLevel] = useState('');

  const fetchReservoirs = async () => {
    try {
      const res = await fetch('/api/reservoirs');
      if (res.ok) {
        const data = await res.json();
        setReservoirs(Array.isArray(data) ? data : []);
        setError(null);
      } else {
        throw new Error('Server API reservoirs error');
      }
    } catch (err) {
      console.warn("Express API reservoirs offline. Falling back to local data context.");
      // Fallback local mock state if database is down
      const fallback = [
        { id: 1, name: 'Grand Valley Reservoir', location: 'Sector 1 North', capacity_liters: 50000000, current_level_liters: 42000000, status: 'Normal' },
        { id: 2, name: 'Pinecrest Basin', location: 'Sector 3 East', capacity_liters: 30000000, current_level_liters: 15000000, status: 'Low Level' },
        { id: 3, name: 'West Gate Reservoir', location: 'Sector 5 West', capacity_liters: 25000000, current_level_liters: 24500000, status: 'Near Capacity' },
        { id: 4, name: 'Summit Lake Facility', location: 'Sector 2 Ridge', capacity_liters: 40000000, current_level_liters: 31000000, status: 'Normal' },
        { id: 5, name: 'South Aqueduct Tank', location: 'Sector 4 South', capacity_liters: 15000000, current_level_liters: 11200000, status: 'Normal' }
      ];
      setReservoirs(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservoirs();
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setName('');
    setLocation('');
    setCapacity('');
    setLevel('');
    setModalOpen(true);
  };

  const openEditModal = (res) => {
    if (!res) return;
    setEditId(res.id);
    setName(res.name || '');
    setLocation(res.location || '');
    setCapacity(res.capacity_liters || '');
    setLevel(res.current_level_liters || '');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name || !location || !capacity || !level) {
      alert("All fields are required.");
      return;
    }

    const numCapacity = parseFloat(capacity);
    const numLevel = parseFloat(level);

    if (numLevel > numCapacity) {
      alert("Current level cannot exceed maximum capacity.");
      return;
    }

    const payload = {
      name,
      location,
      capacity_liters: numCapacity,
      current_level_liters: numLevel,
      status: (numLevel / numCapacity) < 0.2 ? 'Low Level' : (numLevel / numCapacity) > 0.95 ? 'Near Capacity' : 'Normal'
    };

    try {
      let method = 'POST';
      let url = '/api/reservoirs';
      if (editId) {
        method = 'PUT';
        url = `/api/reservoirs/${editId}`;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchReservoirs();
      } else {
        throw new Error('API save reservoirs error');
      }
    } catch (err) {
      if (editId) {
        setReservoirs((reservoirs || []).map(r => r.id === editId ? { ...r, ...payload } : r));
      } else {
        setReservoirs([...(reservoirs || []), { id: Date.now(), ...payload }]);
      }
    }
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this reservoir?")) return;
    try {
      const res = await fetch(`/api/reservoirs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchReservoirs();
      } else {
        throw new Error('API delete reservoirs error');
      }
    } catch (err) {
      setReservoirs((reservoirs || []).filter(r => r.id !== id));
    }
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to Reservoir telemetry units..." />;
  }

  const isReadOnly = user?.role === 'Field Engineer';
  const isAdmin = user?.role === 'Admin';
  const reservoirList = reservoirs || [];

  return (
    <div className="container" id="reservoirs-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Observe reservoir water storage volumes and update parameters.</p>
        {!isReadOnly && (
          <button className="btn btn-primary" onClick={openAddModal} id="btn-add-reservoir">
            <Plus size={16} />
            <span>Add Reservoir</span>
          </button>
        )}
      </div>

      {reservoirList.length > 0 ? (
        <div className="dashboard-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {reservoirList.map(res => {
            const cap = res?.capacity_liters || 1;
            const lvl = res?.current_level_liters || 0;
            const pct = Math.round((lvl / cap) * 100);
            let levelColor = 'var(--accent-cyan)';
            if (pct < 20) levelColor = 'var(--accent-red)';
            else if (pct > 90) levelColor = 'var(--accent-orange)';

            return (
              <div key={res?.id || Math.random()} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{res?.name || 'Reservoir'}</h4>
                  <span className={`badge ${pct < 20 ? 'badge-danger' : pct > 90 ? 'badge-warning' : 'badge-success'}`}>
                    {res?.status || 'Normal'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <MapPin size={14} />
                  <span>{res?.location || 'Unmapped Location'}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Fill Level</span>
                    <span style={{ color: levelColor, fontWeight: '600' }}>{pct}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: levelColor, borderRadius: '4px', transition: 'width 1s ease-in-out' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-muted)' }}>Level (Liters)</span>
                    <strong>{(res?.current_level_liters || 0).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-muted)' }}>Capacity (Liters)</span>
                    <strong>{(res?.capacity_liters || 0).toLocaleString()}</strong>
                  </div>
                </div>

                {!isReadOnly && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                    <button className="action-btn-small" onClick={() => openEditModal(res)} title="Edit Reservoir">
                      <Edit2 size={15} />
                    </button>
                    {isAdmin && (
                      <button className="action-btn-small danger" onClick={() => handleDelete(res?.id)} title="Delete Reservoir">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          title="No Reservoirs Configured" 
          description="There are currently no telemetry registered reservoirs in the database cluster." 
          actionText={!isReadOnly ? "Register Reservoir" : ""}
          onAction={openAddModal}
        />
      )}

      {/* Edit/Add Modal Dialog */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel">
            <div className="modal-header">
              <h3 className="panel-title">{editId ? 'Edit Reservoir' : 'Add Reservoir'}</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Reservoir Name</label>
                <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Capacity (Liters)</label>
                <input type="number" className="form-control" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Current Fill Level (Liters)</label>
                <input type="number" className="form-control" value={level} onChange={(e) => setLevel(e.target.value)} required />
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

export default Reservoirs;
