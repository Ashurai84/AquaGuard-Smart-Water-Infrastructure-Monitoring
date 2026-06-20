import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Droplet, 
  GitFork, 
  Activity, 
  Radio, 
  TrendingUp, 
  Settings as SettingsIcon, 
  AlertTriangle, 
  Cpu, 
  FileSpreadsheet,
  Wrench,
  LogOut
} from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Operations Manager', 'Field Engineer'] },
    { id: 'reservoirs', name: 'Reservoirs', icon: Droplet, roles: ['Admin', 'Operations Manager', 'Field Engineer'] },
    { id: 'pipelines', name: 'Pipelines', icon: GitFork, roles: ['Admin', 'Operations Manager', 'Field Engineer'] },
    { id: 'pumps', name: 'Pump Stations', icon: Activity, roles: ['Admin', 'Operations Manager', 'Field Engineer'] },
    { id: 'sensors', name: 'Sensors', icon: Radio, roles: ['Admin', 'Operations Manager', 'Field Engineer'] },
    { id: 'maintenance', name: 'Maintenance', icon: Wrench, roles: ['Admin', 'Operations Manager', 'Field Engineer'] },
    { id: 'alerts', name: 'Alerts Center', icon: AlertTriangle, roles: ['Admin', 'Operations Manager', 'Field Engineer'] },
    { id: 'analytics', name: 'Analytics Platform', icon: TrendingUp, roles: ['Admin', 'Operations Manager'] },
    { id: 'monitoring', name: 'System Monitoring', icon: Cpu, roles: ['Admin'] },
    { id: 'logs', name: 'Logs & Audit', icon: FileSpreadsheet, roles: ['Admin'] },
    { id: 'settings', name: 'Settings', icon: SettingsIcon, roles: ['Admin', 'Operations Manager', 'Field Engineer'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="sidebar-container">
      <div className="sidebar-brand">
        <Droplet className="brand-logo" />
        <div className="brand-text">
          <span className="brand-name">AquaGuard</span>
          <span className="brand-tagline">Utility Platform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              id={`nav-link-${item.id}`}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-summary">
          <div className="avatar-placeholder">{user?.username[0].toUpperCase()}</div>
          <div className="user-details">
            <p className="user-name">{user?.username}</p>
            <p className="user-role">{user?.role}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} id="btn-logout">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
