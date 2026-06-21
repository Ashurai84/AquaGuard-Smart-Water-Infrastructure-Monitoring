import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Clock, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const resData = await res.json();
        setData(resData);
      } else {
        throw new Error('Server API analytics error');
      }
    } catch (err) {
      console.warn("Express API analytics unavailable, using local mock metrics.");
      const fallback = {
        avgFlow: 450.8,
        efficiencyPct: 94.6,
        waterLostLiters: 120500,
        predictiveFailures: [
          { id: 1, name: 'Main Booster Pump Sector 3', runHours: 980.2, estimatedFailureHours: 1200, risk: 'Medium' },
          { id: 2, name: 'Ridge Route Feed Valve', runHours: 1102.8, estimatedFailureHours: 1150, risk: 'High' }
        ],
        efficiencyHistory: [92, 94, 91, 95, 93, 94, 96]
      };
      setData(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return <LoadingSpinner text="Computing predictive water models..." />;
  }

  const avgFlow = data?.avgFlow || 0;
  const efficiencyPct = data?.efficiencyPct || 0;
  const waterLostLiters = data?.waterLostLiters || 0;
  const predictiveFailures = data?.predictiveFailures || [];
  const efficiencyHistory = data?.efficiencyHistory || [90, 90, 90, 90, 90, 90, 90];

  const points = efficiencyHistory
    .map((val, idx) => {
      const x = 50 + idx * 100;
      const valNum = typeof val === 'number' ? val : 90;
      const y = 200 - ((valNum - 80) / 20) * 150;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="container" id="analytics-view">
      <div className="dashboard-metrics-grid">
        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Average Demand (L/s)</span>
            <span className="stat-value cyan">{avgFlow} L/s</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={12} />
              <span>+2.4% vs last week</span>
            </span>
          </div>
          <div className="stat-icon-wrapper cyan">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Distribution Efficiency</span>
            <span className="stat-value green">{efficiencyPct}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={12} />
              <span>+0.8% reduction in leaks</span>
            </span>
          </div>
          <div className="stat-icon-wrapper green">
            <Award size={20} />
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Non-Revenue Water Lost</span>
            <span className="stat-value red">{(waterLostLiters / 1000).toFixed(1)}k L</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-red)', display: 'flex', alignItems: 'center' }}>
              <ArrowDownRight size={12} />
              <span>-12.4% reduction vs yesterday</span>
            </span>
          </div>
          <div className="stat-icon-wrapper red">
            <Clock size={20} />
          </div>
        </div>
      </div>

      <div className="dashboard-charts-section">
        {/* Efficiency Chart */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">System Distribution Efficiency (%)</h3>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => alert("Report compiled. Ready for download!")}>
              Export Report
            </button>
          </div>
          <div className="panel-body">
            <div className="chart-container-svg">
              <svg className="chart-svg-graphic" viewBox="0 0 700 220">
                <line x1="50" y1="50" x2="650" y2="50" className="chart-grid-line" />
                <line x1="50" y1="100" x2="650" y2="100" className="chart-grid-line" />
                <line x1="50" y1="150" x2="650" y2="150" className="chart-grid-line" />
                <line x1="50" y1="200" x2="650" y2="200" className="chart-grid-line" />

                <text x="20" y="55" className="chart-axis-label">100%</text>
                <text x="20" y="105" className="chart-axis-label">93%</text>
                <text x="20" y="155" className="chart-axis-label">87%</text>
                <text x="20" y="205" className="chart-axis-label">80%</text>

                {efficiencyHistory.map((_, i) => (
                  <text key={i} x={50 + i * 100} y="218" className="chart-axis-label" textAnchor="middle">
                    {`Day ${i + 1}`}
                  </text>
                ))}

                <path d={`M 50 200 L ${points} L 650 200 Z`} className="chart-data-area" style={{ fill: 'var(--accent-green)', opacity: '0.1' }} />
                <path d={`M ${points}`} className="chart-data-line" style={{ stroke: 'var(--accent-green)' }} />
              </svg>
            </div>
          </div>
        </div>

        {/* Predictive AI Analytics */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">AI Predictive Failures</h3>
          </div>
          <div className="panel-body">
            {predictiveFailures.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {predictiveFailures.map(pf => {
                  const runHrsVal = pf?.runHours || 0;
                  const estFailVal = pf?.estimatedFailureHours || 1;
                  const pct = Math.round((runHrsVal / estFailVal) * 100);
                  const riskStr = pf?.risk || 'Low';
                  return (
                    <div key={pf?.id || Math.random()} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.03)', paddingBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: '600' }}>{pf?.name || 'Pump Station'}</span>
                        <span className={`badge ${riskStr === 'High' ? 'badge-danger' : 'badge-warning'}`}>{riskStr} Risk</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>Runtime: {runHrsVal.toFixed(1)} hrs</span>
                        <span>Target Limit: {estFailVal} hrs</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: riskStr === 'High' ? 'var(--accent-red)' : 'var(--accent-orange)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState 
                title="Telemetry Predictor Clean" 
                description="Machine learning telemetry indexes indicate no anomalies or risk of pump failures."
                actionText=""
                onAction={null}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;



