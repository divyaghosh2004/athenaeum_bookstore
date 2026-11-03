import React from 'react';
import { BookOpen } from 'lucide-react';

export default function LoadingSpinner({ text = 'Curating your collection...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      gap: '16px',
      color: 'var(--text-muted)'
    }}>
      <div style={{
        animation: 'spin 1.5s linear infinite',
        color: 'var(--accent-burgundy)'
      }}>
        <BookOpen size={36} />
      </div>
      <p style={{ fontSize: '14px', fontWeight: '500' }}>{text}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(1); }
        }
      `}</style>
    </div>
  );
}

