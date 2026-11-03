import React from 'react';
import { BookX } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = BookX,
  title = 'No books found',
  description = 'Try adjusting your search or category filters.',
  actionText = 'Explore All Books',
  actionLink = '/',
  onAction
}) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '64px 24px',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px dashed var(--border-medium)',
      margin: '24px 0'
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--accent-burgundy)',
        marginBottom: '16px'
      }}>
        <Icon size={32} />
      </div>
      <h3 className="heading-serif" style={{ fontSize: '20px', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '420px', margin: '0 auto 24px' }}>
        {description}
      </p>
      {actionText && (
        onAction ? (
          <button onClick={onAction} className="btn btn-primary">
            {actionText}
          </button>
        ) : (
          <Link to={actionLink} className="btn btn-primary">
            {actionText}
          </Link>
        )
      )}
    </div>
  );
}

