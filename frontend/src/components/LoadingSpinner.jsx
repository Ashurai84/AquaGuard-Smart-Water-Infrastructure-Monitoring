import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading system metrics...', fullScreen = false }) => {
  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <Loader2 
        className="animate-spin" 
        size={36} 
        style={{ 
          color: 'var(--accent-cyan)',
          animation: 'spin 1s linear infinite'
        }} 
      />
      <span style={{ 
        color: 'var(--text-secondary)', 
        fontSize: '0.9rem',
        fontWeight: '500'
      }}>
        {text}
      </span>
      
      {/* Dynamic Keyframes Injection */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)'
      }}>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
