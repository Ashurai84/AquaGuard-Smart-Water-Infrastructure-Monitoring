import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Droplet, Lock, User, AlertTriangle } from 'lucide-react';

const Login = () => {
  const { login, error, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username && password) {
      await login(username, password);
    }
  };

  const selectDemoUser = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="login-page-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          <Droplet className="login-logo" size={48} />
          <h2>AquaGuard</h2>
          <p className="login-subtitle">Infrastructure Monitoring & Management</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username-input">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="username-input"
                type="text"
                className="form-control"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password-input">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="password-input"
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading} id="btn-submit-login">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials-box">
          <div className="demo-title">Quick Demo Login</div>
          <div className="demo-grid">
            <div className="demo-user-item" onClick={() => selectDemoUser('admin', 'admin123')}>
              <strong>Admin:</strong> admin / admin123
            </div>
            <div className="demo-user-item" onClick={() => selectDemoUser('manager', 'manager123')}>
              <strong>Manager:</strong> manager / manager123
            </div>
            <div className="demo-user-item" onClick={() => selectDemoUser('engineer', 'engineer123')}>
              <strong>Engineer:</strong> engineer / engineer123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
