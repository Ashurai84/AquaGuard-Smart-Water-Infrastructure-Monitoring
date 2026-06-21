import React from 'react';
import { Database, Plus } from 'lucide-react';

const EmptyState = ({ 
  title = 'No Data Available', 
  description = 'There are no active records in this database table segment.', 
  actionText = '', 
  onAction = null 
}) => {
  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
      textAlign: 'center',
      gap: '1rem',
      margin: '1rem 0'
    }}>
      <div style={{
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)'
      }}>
        <Database size={24} />
      </div>

      <div style={{ maxWidth: '360px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
          {title}
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          {description}
        </p>
      </div>

      {actionText && onAction && (
        <button 
          className="btn btn-primary" 
          onClick={onAction}
          style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Plus size={14} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
