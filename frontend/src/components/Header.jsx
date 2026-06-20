import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Shield, Clock } from 'lucide-react';

const Header = ({ title, alertCount, setCurrentPage }) => {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <header className="header-container glass-panel">
      <div className="header-title-section">
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-actions">
        <div className="header-datetime">
          <Clock size={16} className="text-secondary" />
          <span className="time-display">{formatTime(time)}</span>
          <span className="date-display">({formatDate(time)})</span>
        </div>

        <button 
          className="notification-trigger" 
          onClick={() => setCurrentPage('alerts')}
          id="header-notification-btn"
        >
          <Bell size={20} />
          {alertCount > 0 && (
            <span className="notification-badge">{alertCount}</span>
          )}
        </button>

        <div className="user-role-badge">
          <Shield size={14} className="badge-icon" />
          <span>{user?.role}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
