import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Heart, Award } from 'lucide-react';

export default function Footer() {
  const categories = [
    'Fiction',
    'Mystery',
    'Romance',
    'Self-Help',
    'Technology',
    'Business',
    'Education'
  ];

  return (
    <footer style={{
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-light)',
      paddingTop: '56px',
      paddingBottom: '32px',
      marginTop: '64px'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '48px'
        }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'var(--accent-burgundy)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOpen size={18} />
              </div>
              <span className="heading-serif" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--accent-burgundy)' }}>
                ATHENAEUM
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px' }}>
              A curated commercial bookstore and personal digital library for connoisseurs of literature, technical mastery, and intellectual development.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-green)', fontWeight: '600' }}>
              <ShieldCheck size={16} /> Certified Indian Rupee (₹) Pricing
            </div>
          </div>

          {/* Book Categories */}
          <div>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Book Collections
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/?category=${encodeURIComponent(cat)}`}
                    style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.target.style.color = 'var(--accent-burgundy)')}
                    onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Reader Services
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <li>
                <Link to="/library" style={{ color: 'var(--text-secondary)' }}>My Personal Digital Library</Link>
              </li>
              <li>
                <Link to="/cart" style={{ color: 'var(--text-secondary)' }}>Cart & Express Order</Link>
              </li>
              <li>
                <Link to="/offline" style={{ color: 'var(--text-secondary)' }}>Free Public Domain E-Books</Link>
              </li>
              <li>
                <Link to="/account" style={{ color: 'var(--text-secondary)' }}>User Dashboard & Orders</Link>
              </li>
            </ul>
          </div>

          {/* Project & Legal Notice */}
          <div>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Academic Full-Stack Project
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>
              Built as a comprehensive full-stack web development mini project featuring real MongoDB integration, JWT authentication, and browser IndexedDB offline support.
            </p>
            <div style={{
              backgroundColor: 'var(--bg-primary)',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-medium)',
              fontSize: '11px',
              color: 'var(--text-secondary)'
            }}>
              <strong>Demo Payment Notice:</strong> All checkout transactions simulate genuine processing and generate verified MongoDB orders with demo confirmation records.
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{
          borderTop: '1px solid var(--border-light)',
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-muted)',
          gap: '12px'
        }}>
          <div>
            © {new Date().getFullYear()} Athenaeum Bookstore. Designed with elegance for discerning readers.
          </div>
          <div>
            All catalog prices listed in Indian Rupees (₹).
          </div>
        </div>
      </div>
    </footer>
  );
}

