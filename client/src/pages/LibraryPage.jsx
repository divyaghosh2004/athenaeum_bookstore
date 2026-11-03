import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Library as LibraryIcon, Bookmark, Compass, Clock, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import BookReaderModal from '../components/BookReaderModal';
import AuthModal from '../components/AuthModal';

export default function LibraryPage() {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  const [libraryItems, setLibraryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Active book reader state
  const [readerOpen, setReaderOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const fetchLibrary = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/library');
      if (res.data.success && res.data.library) {
        setLibraryItems(res.data.library.items || []);
      }
    } catch (err) {
      console.warn('Library fetch error:', err.message);
      toast.error('Could not load your library.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [isAuthenticated]);

  const handleOpenReader = (item) => {
    setActiveItem(item);
    setReaderOpen(true);
  };

  const handleSaveProgress = async (bookId, progress, position) => {
    try {
      const res = await api.put(`/library/${bookId}/progress`, {
        readingProgress: progress,
        lastReadPosition: position
      });
      if (res.data.success) {
        // Update local state
        setLibraryItems(prev =>
          prev.map(it => {
            if ((it.book?._id || it.book) === bookId) {
              return {
                ...it,
                readingProgress: progress,
                lastReadPosition: position,
                lastReadAt: new Date()
              };
            }
            return it;
          })
        );
      }
    } catch (err) {
      console.warn('Progress update failed:', err.message);
      throw err;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{
          maxWidth: '480px',
          margin: '0 auto',
          backgroundColor: 'var(--bg-card)',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-burgundy-subtle)',
            color: 'var(--accent-burgundy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <LibraryIcon size={32} />
          </div>
          <h2 className="heading-serif" style={{ fontSize: '24px', marginBottom: '10px' }}>
            Personal Digital Library
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
            Please sign in to access your purchased digital volumes, resume reading from your last saved bookmark, and sync your reading progress across devices.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '12px 24px' }}
            >
              Sign In to Your Library
            </button>
            <Link to="/offline" className="btn btn-secondary" style={{ padding: '12px 24px' }}>
              Free Books
            </Link>
          </div>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={fetchLibrary}
        />
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '20px',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LibraryIcon size={28} style={{ color: 'var(--accent-burgundy)' }} />
            <h1 className="heading-serif" style={{ fontSize: '28px' }}>
              My Personal Digital Library
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Welcome back, {user?.name}. You have {libraryItems.length} authorized digital volume{libraryItems.length === 1 ? '' : 's'}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/" className="btn btn-secondary" style={{ fontSize: '13px' }}>
            <Compass size={16} /> Explore More Titles
          </Link>
          <Link to="/offline" className="btn btn-outline" style={{ fontSize: '13px' }}>
            <BookOpen size={16} /> Claim Free Books
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving your digital volumes from MongoDB..." />
      ) : libraryItems.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '24px'
        }}>
          {libraryItems.map((item) => {
            const book = item.book;
            if (!book) return null;

            return (
              <div
                key={item._id || book._id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{
                    width: '84px',
                    height: '124px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-book)'
                  }}>
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="badge badge-category" style={{ marginBottom: '6px' }}>
                      {book.category}
                    </span>
                    <h3 className="heading-serif" style={{
                      fontSize: '15px',
                      marginBottom: '4px',
                      lineHeight: '1.3',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {book.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {book.author}
                    </p>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: item.accessSource === 'purchase' ? 'var(--accent-burgundy)' : 'var(--accent-green)'
                    }}>
                      <CheckCircle size={13} />
                      <span>{item.accessSource === 'purchase' ? 'Purchased Edition' : 'Free Claim'}</span>
                    </div>
                  </div>
                </div>

                {/* Reading Progress */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Bookmark size={13} /> {item.lastReadPosition || 'Chapter 1'}
                    </span>
                    <span style={{ fontWeight: '700', color: 'var(--accent-burgundy)' }}>
                      {item.readingProgress || 0}% read
                    </span>
                  </div>
                  <div style={{
                    height: '6px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${item.readingProgress || 0}%`,
                      backgroundColor: 'var(--accent-burgundy)',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>

                {/* Continue Reading Action */}
                <button
                  onClick={() => handleOpenReader(item)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px', fontSize: '13px', marginTop: 'auto' }}
                >
                  <BookOpen size={16} />
                  <span>{item.readingProgress > 0 ? 'Continue Reading' : 'Start Reading'}</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={LibraryIcon}
          title="Your Library is currently empty"
          description="Purchased digital books and claimed public domain classics will appear here with your saved bookmarks and reading progress."
          actionText="Browse Bookstore Catalog"
          actionLink="/"
        />
      )}

      {/* Reader Modal */}
      {activeItem && (
        <BookReaderModal
          book={activeItem.book}
          isOpen={readerOpen}
          onClose={() => setReaderOpen(false)}
          initialProgress={activeItem.readingProgress || 0}
          initialPosition={activeItem.lastReadPosition || 'Chapter 1: The Beginning'}
          onSaveProgress={handleSaveProgress}
        />
      )}
    </div>
  );
}

