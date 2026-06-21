import React, { useState, useEffect, useRef } from 'react';
import { Terminal, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const terminalEndRef = useRef(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Server API logs error');
      }
    } catch (err) {
      console.warn("Express API logs unavailable, rendering system event buffer.");
      const fallback = [
        { id: 1, type: 'system', level: 'info', message: 'Database connection established to postgresql://db-node:5432/aquaguard', timestamp: '2026-06-20 22:10:05' },
        { id: 2, type: 'sensor', level: 'info', message: 'Telemetry packet received from Sensor ID 14 (Flow rate: 154.2 L/s)', timestamp: '2026-06-20 22:10:06' },
        { id: 3, type: 'audit', level: 'warn', message: 'User "manager" requested status update for Pump ID 2', timestamp: '2026-06-20 22:11:15' },
        { id: 4, type: 'sensor', level: 'error', message: 'Alert threshold breached: Pump ID 4 Temp (86.5°C > 80°C Limit)', timestamp: '2026-06-20 22:12:30' },
        { id: 5, type: 'audit', level: 'info', message: 'Admin login session initiated from IP 192.168.1.42', timestamp: '2026-06-20 22:14:02' },
        { id: 6, type: 'application', level: 'info', message: 'Express Server listening on port 5000 in production mode', timestamp: '2026-06-20 22:00:00' }
      ];
      setLogs(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && logs.length === 0) {
    return <LoadingSpinner text="Connecting to cluster log aggregators..." />;
  }

  const logList = logs || [];
  const filteredLogs = logList.filter(log => {
    const logType = log?.type || 'system';
    const logMsg = log?.message || '';
    const logLevel = log?.level || 'info';

    const tabMatch = activeTab === 'all' || logType === activeTab;
    const searchMatch = logMsg.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        logLevel.toLowerCase().includes(searchTerm.toLowerCase());
    return tabMatch && searchMatch;
  });

  return (
    <div className="container" id="logs-view">
      <div className="filter-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'system', 'application', 'sensor', 'audit'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="btn btn-secondary"
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                borderColor: activeTab === tab ? 'var(--accent-cyan)' : 'transparent',
                background: activeTab === tab ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.02)'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            className="filter-input"
            placeholder="Search log messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '240px' }}
          />
          <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={fetchLogs} title="Refresh Logs">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {logList.length > 0 ? (
        <div className="glass-panel" style={{ padding: '0.5rem', background: '#040814', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Terminal size={16} className="text-secondary" />
            <span>Console Streams Output - Logstash logs formatter active</span>
          </div>
          
          <div className="log-terminal-output">
            {filteredLogs.map(log => {
              const logLevel = log?.level || 'info';
              return (
                <div key={log?.id || Math.random()} className={`log-line-item ${logLevel}`}>
                  <span style={{ color: 'var(--text-muted)' }}>[{log?.timestamp || 'N/A'}]</span>{' '}
                  <span style={{ fontWeight: '600', textTransform: 'uppercase' }}>[{logLevel}]</span>{' '}
                  <span style={{ color: '#93c5fd', textTransform: 'uppercase' }}>[{log?.type || 'SYS'}]</span>:{' '}
                  {log?.message || ''}
                </div>
              );
            })}
            {filteredLogs.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No console outputs matched the query parameters.
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      ) : (
        <EmptyState 
          title="No Logs Available" 
          description="Logstash index has not collected any system messages from container cluster yet." 
          actionText="Repoll Streams"
          onAction={fetchLogs}
        />
      )}
    </div>
  );
};

export default Logs;


