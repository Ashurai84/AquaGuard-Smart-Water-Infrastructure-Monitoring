import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Clock, ArrowDownRight, ArrowUpRight } from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState({
    avgFlow: 450.8,
    efficiencyPct: 94.6,
    waterLostLiters: 120500,
    predictiveFailures: [
      { id: 1, name: 'Main Booster Pump Sector 3', runHours: 980.2, estimatedFailureHours: 1200, risk: 'Medium' },
      { id: 2, name: 'Ridge Route Feed Valve', runHours: 1102.8, estimatedFailureHours: 1150, risk: 'High' }
    ],
    efficiencyHistory: [92, 94, 91, 95, 93, 94, 96]
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        }
      } catch (err) {
        console.warn("Express API analytics unavailable, using local mock metrics.");
      }
    };
    fetchAnalytics();
  }, []);

  const points = data.efficiencyHistory
    .map((val, idx) => {
      const x = 50 + idx * 100;
      const y = 200 - ((val - 80) / 20) * 150;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="container" id="analytics-view">
      <div className="dashboard-metrics-grid">
        <div className="glass-panel stat-card">
          <div className="stat-info">
            <span className="stat-label">Average Demand (L/s)</span>
            <span className="stat-value cyan">{data.avgFlow} L/s</span>
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
            <span className="stat-value green">{data.efficiencyPct}%</span>
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
            <span className="stat-value red">{(data.waterLostLiters / 1000).toFixed(1)}k L</span>
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

                {data.efficiencyHistory.map((_, i) => (
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.predictiveFailures.map(pf => {
                const pct = Math.round((pf.runHours / pf.estimatedFailureHours) * 100);
                return (
                  <div key={pf.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.03)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: '600' }}>{pf.name}</span>
                      <span className={`badge ${pf.risk === 'High' ? 'badge-danger' : 'badge-warning'}`}>{pf.risk} Risk</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Runtime: {pf.runHours.toFixed(1)} hrs</span>
                      <span>Target Limit: {pf.estimatedFailureHours} hrs</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pf.risk === 'High' ? 'var(--accent-red)' : 'var(--accent-orange)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
