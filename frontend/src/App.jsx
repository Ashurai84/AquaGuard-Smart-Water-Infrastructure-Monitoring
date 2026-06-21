import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';

// Import All Page Panels
import Dashboard from './pages/Dashboard';
import Reservoirs from './pages/Reservoirs';
import Pipelines from './pages/Pipelines';
import Pumps from './pages/Pumps';
import Sensors from './pages/Sensors';
import Maintenance from './pages/Maintenance';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Monitoring from './pages/Monitoring';
import Logs from './pages/Logs';
import Settings from './pages/Settings';

const DashboardLayout = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [alertCount, setAlertCount] = useState(3);

  // Poll for alert counts
  useEffect(() => {
    const pollAlerts = async () => {
      try {
        const res = await fetch('/api/alerts');
        if (res.ok) {
          const data = await res.json();
          const active = data.filter(a => a.status === 'Active').length;
          setAlertCount(active);
        }
      } catch (err) {
        // Fallback mock check
      }
    };
    pollAlerts();
    const interval = setInterval(pollAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'reservoirs':
        return <Reservoirs />;
      case 'pipelines':
        return <Pipelines />;
      case 'pumps':
        return <Pumps />;
      case 'sensors':
        return <Sensors />;
      case 'maintenance':
        return <Maintenance />;
      case 'alerts':
        return <Alerts />;
      case 'analytics':
        return <Analytics />;
      case 'monitoring':
        return <Monitoring />;
      case 'logs':
        return <Logs />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Operations Dashboard';
      case 'reservoirs': return 'Reservoir Capacity Monitoring';
      case 'pipelines': return 'Pipeline Health Inventory';
      case 'pumps': return 'Pump Station Operations';
      case 'sensors': return 'IoT Telemetry Status';
      case 'maintenance': return 'Maintenance Task Scheduling';
      case 'alerts': return 'Utility Alert Center';
      case 'analytics': return 'Water Analytics & Forecasts';
      case 'monitoring': return 'Node Systems Diagnostics';
      case 'logs': return 'Systems Audit Terminal';
      case 'settings': return 'System Configurations';
      default: return 'AquaGuard Platform';
    }
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="main-content">
        <Header title={getPageTitle()} alertCount={alertCount} setCurrentPage={setCurrentPage} />
        <ErrorBoundary key={currentPage}>
          {renderPage()}
        </ErrorBoundary>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <DashboardLayout />
    </AuthProvider>
  );
}

export default App;
