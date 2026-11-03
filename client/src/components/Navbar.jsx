import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Home,
  Library,
  ShoppingCart,
  DownloadCloud,
  User,
  LogOut,
  Search,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Library', path: '/library', icon: Library },
    { name: 'Cart', path: '/cart', icon: ShoppingCart, badge: itemCount },
    { name: 'Offline', path: '/offline', icon: DownloadCloud },
    { name: 'My Account', path: '/account', icon: User }
  ];

  return (
    <>
      {/* Top Banner Notice */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-light)',
        padding: '6px 24px',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Special Academic & Reader Editions • Free Pan-India Delivery on orders over ₹499</span>
        <span style={{ fontWeight: '600', color: 'var(--accent-burgundy)' }}>
          Prices strictly in Indian Rupees (₹)
        </span>
      </div>

      {/* Main Header */}
      <header style={{
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px',
          gap: '24px'
        }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-burgundy)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(128, 0, 32, 0.25)'
            }}>
              <BookOpen size={24} />
            </div>
            <div>
              <span className="heading-serif" style={{
                fontSize: '22px',
                fontWeight: '700',
                letterSpacing: '-0.02em',
                color: 'var(--accent-burgundy)',
                display: 'block',
                lineHeight: '1'
              }}>
                ATHENAEUM
              </span>
              <span style={{
                fontSize: '10px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                fontWeight: '600'
              }}>
                Fine Books & Digital Readers
              </span>
            </div>
          </Link>

          {/* Quick Search */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              flex: 1,
              maxWidth: '380px',
              position: 'relative',
              display: 'none',
              margin: '0 16px'
            }}
            className="header-search-form"
          >
            <input
              type="text"
              placeholder="Search books, authors, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 16px 9px 38px',
                borderRadius: '20px',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-primary)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
          </form>

          {/* 5 Functional Navigation Buttons */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="desktop-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? 'var(--accent-burgundy)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--accent-burgundy-subtle)' : 'transparent',
                    textDecoration: 'none',
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  })}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                  {item.badge > 0 && (
                    <span style={{
                      backgroundColor: 'var(--accent-burgundy)',
                      color: '#FFF',
                      fontSize: '11px',
                      fontWeight: '700',
                      borderRadius: '10px',
                      padding: '1px 6px',
                      marginLeft: '2px'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile / Auth Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to="/account"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-secondary)',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-burgundy)',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    overflow: 'hidden'
                  }}>
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  title="Log Out"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="btn btn-primary"
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)'
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderTop: '1px solid var(--border-light)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <form onSubmit={handleSearchSubmit} style={{ marginBottom: '12px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 16px 9px 36px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '14px'
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            </form>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '15px',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? 'var(--accent-burgundy)' : 'var(--text-primary)',
                    backgroundColor: isActive ? 'var(--accent-burgundy-subtle)' : 'transparent',
                    textDecoration: 'none'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span style={{
                      backgroundColor: 'var(--accent-burgundy)',
                      color: '#FFF',
                      fontSize: '11px',
                      fontWeight: '700',
                      borderRadius: '10px',
                      padding: '1px 8px'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <style>{`
        @media (min-width: 900px) {
          .header-search-form {
            display: block !important;
          }
        }
        @media (max-width: 860px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}

