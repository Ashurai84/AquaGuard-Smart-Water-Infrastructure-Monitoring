import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aquaguard_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      // Direct POST request to backend API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        const loggedUser = { username: data.user.username, role: data.user.role, token: data.token };
        setUser(loggedUser);
        localStorage.setItem('aquaguard_user', JSON.stringify(loggedUser));
        setLoading(false);
        return true;
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Invalid username or password');
      }
    } catch (err) {
      // DAY 1 / FALLBACK Mock Authentication Logic
      console.warn("API unavailable, falling back to mock authentication:", err.message);
      
      const demoUsers = {
        admin: { role: 'Admin', pass: 'admin123' },
        manager: { role: 'Operations Manager', pass: 'manager123' },
        engineer: { role: 'Field Engineer', pass: 'engineer123' }
      };

      const matched = demoUsers[username.toLowerCase()];
      if (matched && matched.pass === password) {
        const fallbackUser = { username: username, role: matched.role, token: 'mock-jwt-token' };
        setUser(fallbackUser);
        localStorage.setItem('aquaguard_user', JSON.stringify(fallbackUser));
        setLoading(false);
        return true;
      } else {
        setError('Invalid credentials. Use: admin/admin123, manager/manager123, or engineer/engineer123');
        setLoading(false);
        return false;
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aquaguard_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
