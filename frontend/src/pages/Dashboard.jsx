import React, { useState, useEffect } from 'react';
import { Droplet, Activity, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [data, setData] = useState({
    stats: {
      totalReservoirs: 5,
      activePumps: 6,
      activePipelines: 8,
      activeSmartMeters: 50,
      totalWaterConsumption: 520.4,
      activeAlerts: 7,
      systemHealth: 88.5
    },
    recentAlerts: [
      { id: 1, severity: 'Critical', message: 'Leak detected in Sector 4 Pipeline A', source: 'Pipeline Sensor 14', timestamp: 'Just now' },
      { id: 2, severity: 'Warning', message: 'High pump temperature recorded: 82°C', source: 'Pump Station 3', timestamp: '12 min ago' },
      { id: 3, severity: 'Warning', message: 'Reservoir Level below 20%', source: 'East Side Reservoir', timestamp: '45 min ago' }
    ],
    chartData: [450, 480, 520, 490, 510, 580, 620]
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const resData = await response.json();
          setData(resData);
        }
      } catch (err) {
        console.warn("Express API dashboard unavailable, using mock telemetry context.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // 1. Water Consumption Chart Configuration (Line)
  const lineChartData = {
    labels: ['18:00', '18:10', '18:20', '18:30', '18:40', '18:50', '18:60'],
    datasets: [
      {
        fill: true,
        label: 'Flow Rate (L/s)',
        data: data.chartData,
        borderColor: '#00F2FE',
        backgroundColor: 'rgba(0, 242, 254, 0.15)',
        tension: 0.3,
        borderWidth: 2,
        pointBackgroundColor: '#00F2FE',
        pointHoverRadius: 6
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#94a3b8' } }
    }
  };

  // 2. Reservoir Capacity Chart Configuration (Bar)
  const barChartData = {
    labels: ['Reservoir 1', 'Reservoir 2', 'Reservoir 3', 'Reservoir 4', 'Reservoir 5'],
    datasets: [
      {
        label: 'Current Level (M Liters)',
        data: [42.0, 15.0, 24.5, 31.0, 11.2],
        backgroundColor: '#009cfd',
        borderRadius: 4
      },
      {
        label: 'Total Capacity (M Liters)',
        data: [50.0, 30.0, 25.0, 40.0, 15.0],
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 4
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#f1f5f9' } }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.03)' }, ticks: { color: '#94a3b8' } }
    }
  };

  // 3. Alert Analytics Configuration (Doughnut)
  const doughnutChartData = {
    labels: ['Critical Alerts', 'Warning Alerts', 'Info Alerts'],
    datasets: [
      {
        data: [3, 4, 3],
        backgroundColor: ['#ef4444', '#f59e0b', '#00f2fe'],
        borderWidth: 2,
        borderColor: '#0c1630'
      }
    ]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#f1f5f9' } }
    }
  };

  return (
    <div className="container" id="dashboard-view">
      {/* 5 Core Metrics Cards Row */}
      <div className="dashboard-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Reservoirs</span>
            <span className="stat-value cyan">{data.stats.totalReservoirs}</span>
          </div>
          <div className="stat-icon-wrapper cyan">
            <Droplet size={20} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Active Pumps</span>
            <span className="stat-value blue">{data.stats.activePumps}</span>
          </div>
          <div className="stat-icon-wrapper blue">
            <Activity size={20} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Smart Meters</span>
            <span className="stat-value orange">{data.stats.activeSmartMeters}</span>
          </div>
          <div className="stat-icon-wrapper orange">
            <Zap size={20} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Active Alerts</span>
            <span className="stat-value red">{data.stats.activeAlerts}</span>
          </div>
          <div className="stat-icon-wrapper red">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">System Health</span>
            <span className="stat-value green">{data.stats.systemHealth}%</span>
          </div>
          <div className="stat-icon-wrapper green">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      {/* Grid containing the 3 Chart.js graphs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
        
        {/* Chart 1: Water Consumption */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 className="panel-title" style={{ marginBottom: '1rem', fontSize: '1rem' }}>Water Consumption Trends</h3>
          <div style={{ height: '220px' }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Chart 2: Reservoir Capacities */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 className="panel-title" style={{ marginBottom: '1rem', fontSize: '1rem' }}>Reservoir Capacity Levels</h3>
          <div style={{ height: '220px' }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Chart 3: Alert Analytics */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 className="panel-title" style={{ marginBottom: '1rem', fontSize: '1rem' }}>Alert Analytics Distribution</h3>
          <div style={{ height: '220px' }}>
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>
        </div>

      </div>

      {/* Alerts and Incidents Tailing Row */}
      <div className="dashboard-charts-section" style={{ gridTemplateColumns: '1fr', marginTop: '1rem' }}>
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">Critical System Incidents</h3>
          </div>
          <div className="panel-body">
            <div className="alert-feed-list" style={{ maxHeight: '180px' }}>
              {data.recentAlerts.map(alert => (
                <div key={alert.id} className={`alert-feed-item ${alert.severity.toLowerCase()}`}>
                  <AlertTriangle 
                    size={18} 
                    style={{ color: alert.severity === 'Critical' ? 'var(--accent-red)' : 'var(--accent-orange)' }} 
                  />
                  <div className="alert-content-box">
                    <span className="alert-msg">{alert.message}</span>
                    <span className="alert-meta">{alert.source} • {alert.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
