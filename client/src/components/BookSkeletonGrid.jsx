import React from 'react';

export default function BookSkeletonGrid({ count = 8 }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="books-grid" style={{ marginTop: '20px' }}>
      {items.map((i) => (
        <div
          key={i}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '10px',
            border: '1px solid var(--border-light)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Cover Skeleton */}
          <div
            className="athenaeum-skeleton"
            style={{
              width: '100%',
              aspectRatio: '2 / 3',
              borderRadius: '6px'
            }}
          />

          {/* Category Pill Skeleton */}
          <div
            className="athenaeum-skeleton"
            style={{
              width: '45%',
              height: '14px',
              borderRadius: '4px'
            }}
          />

          {/* Title Line Skeleton */}
          <div
            className="athenaeum-skeleton"
            style={{
              width: '85%',
              height: '18px',
              borderRadius: '4px'
            }}
          />

          {/* Author Line Skeleton */}
          <div
            className="athenaeum-skeleton"
            style={{
              width: '60%',
              height: '13px',
              borderRadius: '4px'
            }}
          />

          {/* Bottom Price & Button Skeleton */}
          <div
            style={{
              marginTop: 'auto',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div
              className="athenaeum-skeleton"
              style={{
                width: '35%',
                height: '18px',
                borderRadius: '4px'
              }}
            />
            <div
              className="athenaeum-skeleton"
              style={{
                width: '40%',
                height: '32px',
                borderRadius: '6px'
              }}
            />
          </div>
        </div>
      ))}

      <style>{`
        .athenaeum-skeleton {
          background: linear-gradient(
            90deg,
            var(--bg-secondary) 25%,
            rgba(180, 142, 67, 0.08) 37%,
            var(--bg-secondary) 63%
          );
          background-size: 400% 100%;
          animation: athenaeumShimmer 1.6s ease-in-out infinite;
        }
        @keyframes athenaeumShimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>
    </div>
  );
}
