import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';

export default function LoadingSpinner({
  text = 'Loading page...',
  subtext,
  size = 'md',
  onRetry,
  timeoutMs = 12000
}) {
  const [takingLonger, setTakingLonger] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const longerTimer = setTimeout(() => {
      setTakingLonger(true);
    }, 7000);

    const timeoutTimer = setTimeout(() => {
      setTimedOut(true);
    }, timeoutMs);

    return () => {
      clearTimeout(longerTimer);
      clearTimeout(timeoutTimer);
    };
  }, [timeoutMs]);

  const dimensions = {
    sm: { container: 36, stroke: 2.5, icon: 16 },
    md: { container: 52, stroke: 3, icon: 22 },
    lg: { container: 68, stroke: 3.5, icon: 30 }
  }[size] || { container: 52, stroke: 3, icon: 22 };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 20px',
        gap: '14px',
        color: 'var(--text-secondary)'
      }}
    >
      {/* Refined Dual-Ring Athenaeum Orbital Spinner */}
      <div
        style={{
          position: 'relative',
          width: `${dimensions.container}px`,
          height: `${dimensions.container}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Outer orbital spinning ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `${dimensions.stroke}px solid rgba(128, 0, 32, 0.12)`,
            borderTopColor: 'var(--accent-burgundy)',
            borderRightColor: 'var(--accent-gold)',
            animation: 'athenaeumSpin 0.95s cubic-bezier(0.5, 0.15, 0.35, 0.9) infinite'
          }}
        />

        {/* Stationary gently-pulsing center book emblem */}
        <div
          style={{
            color: 'var(--accent-burgundy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'athenaeumPulse 2s ease-in-out infinite'
          }}
        >
          <BookOpen size={dimensions.icon} />
        </div>
      </div>

      {/* Main Action Text */}
      <div style={{ textAlign: 'center', maxWidth: '380px' }}>
        <p
          className="heading-serif"
          style={{
            fontSize: size === 'sm' ? '13px' : '15px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0,
            letterSpacing: '0.01em'
          }}
        >
          {text}
        </p>

        {subtext && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {subtext}
          </p>
        )}

        {/* Server wake-up note if taking longer than 7s */}
        {takingLonger && !timedOut && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '6px',
              animation: 'fadeIn 0.3s ease-in'
            }}
          >
            Connecting to bookstore server... This may take a moment on first load.
          </p>
        )}

        {/* Timeout notice and Retry Button */}
        {timedOut && (
          <div style={{ marginTop: '12px', animation: 'fadeIn 0.3s ease-in' }}>
            <p style={{ fontSize: '12px', color: '#B45309', marginBottom: '8px' }}>
              Connection is taking longer than usual.
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="btn btn-outline"
                style={{
                  fontSize: '12px',
                  padding: '6px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={13} /> Retry Connection
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes athenaeumSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes athenaeumPulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
