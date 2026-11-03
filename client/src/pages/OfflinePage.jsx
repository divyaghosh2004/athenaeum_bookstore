import React, { useState, useEffect } from 'react';
import {
  DownloadCloud,
  HardDrive,
  BookOpen,
  Trash2,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ExternalLink,
  Wifi,
  WifiOff
} from 'lucide-react';
import api from '../services/api';
import {
  saveOfflineBook,
  getOfflineBooks,
  deleteOfflineBook,
  updateOfflineProgress
} from '../services/indexedDB';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import BookReaderModal from '../components/BookReaderModal';

export default function OfflinePage() {
  const [freeBooks, setFreeBooks] = useState([]);
  const [offlineBooks, setOfflineBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'downloaded'

  // Reader state
  const [readerOpen, setReaderOpen] = useState(false);
  const [activeBook, setActiveBook] = useState(null);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const toast = useToast();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch free books from MongoDB API + load offline books from IndexedDB
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch free books from backend if online
      if (navigator.onLine) {
        const res = await api.get('/books/free');
        if (res.data.success) {
          setFreeBooks(res.data.books);
        }
      }
    } catch (err) {
      console.warn('Free books network fetch failed, relying on offline cache:', err.message);
    }

    try {
      // 2. Fetch locally stored books from browser IndexedDB
      const stored = await getOfflineBooks();
      setOfflineBooks(stored || []);
    } catch (err) {
      console.error('IndexedDB fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Download book into IndexedDB
  const handleDownload = async (book) => {
    setDownloadingId(book._id);
    try {
      // Simulate real file caching / storing in IndexedDB
      await new Promise(resolve => setTimeout(resolve, 800));
      await saveOfflineBook(book);
      const updated = await getOfflineBooks();
      setOfflineBooks(updated);
      toast.success(`"${book.title}" downloaded for offline reading!`);
    } catch (err) {
      toast.error('Download failed. IndexedDB storage error.');
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Remove from IndexedDB
  const handleDeleteOffline = async (id, title) => {
    try {
      await deleteOfflineBook(id);
      setOfflineBooks(prev => prev.filter(b => b.id !== id));
      toast.info(`Removed "${title}" from device.`);
    } catch (err) {
      toast.error('Failed to remove book.');
    }
  };

  // Open reader
  const handleOpenReader = (book) => {
    setActiveBook(book);
    setReaderOpen(true);
  };

  // Save progress in IndexedDB
  const handleSaveOfflineProgress = async (id, progress, position) => {
    try {
      await updateOfflineProgress(id, progress, position);
      setOfflineBooks(prev =>
        prev.map(b => (b.id === id ? { ...b, readingProgress: progress, lastReadPosition: position } : b))
      );
    } catch (err) {
      console.warn('Failed to update offline progress:', err);
    }
  };

  const isDownloaded = (bookId) => {
    return offlineBooks.some(b => b.id === bookId);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '20px',
        marginBottom: '28px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DownloadCloud size={28} style={{ color: 'var(--accent-burgundy)' }} />
            <h1 className="heading-serif" style={{ fontSize: '28px' }}>
              Offline Reader & Free Classics
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Authentic public-domain literature from Project Gutenberg stored directly in your browser's IndexedDB for internet-free reading.
          </p>
        </div>

        {/* Network status pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          backgroundColor: isOnline ? 'var(--accent-green-subtle)' : '#FEE2E2',
          color: isOnline ? 'var(--accent-green)' : '#DC2626'
        }}>
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{isOnline ? 'Online • Live Cloud Sync' : 'Offline Mode Active'}</span>
        </div>
      </div>

      {/* Tabs: Free Library vs My Offline Books */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '10px'
      }}>
        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'catalog' ? 'var(--accent-burgundy)' : 'transparent',
            color: activeTab === 'catalog' ? '#FFF' : 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <BookOpen size={16} /> Free Public Domain E-Books ({freeBooks.length})
        </button>

        <button
          onClick={() => setActiveTab('downloaded')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'downloaded' ? 'var(--accent-burgundy)' : 'transparent',
            color: activeTab === 'downloaded' ? '#FFF' : 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <HardDrive size={16} /> My Stored Offline Books ({offlineBooks.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Connecting to IndexedDB and public library catalog..." />
      ) : activeTab === 'catalog' ? (
        /* ================= CATALOG TAB ================= */
        <div>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '16px 20px',
            borderRadius: '8px',
            border: '1px solid var(--border-light)',
            marginBottom: '24px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <ShieldCheck size={20} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
            <span>
              All titles in this section are legally recognized open-access or public-domain works. Downloading stores the complete chapter text and metadata in browser <strong>IndexedDB</strong>, accessible even with zero network connectivity.
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '24px'
          }}>
            {freeBooks.map((book) => {
              const downloaded = isDownloaded(book._id);
              const isDownloading = downloadingId === book._id;

              return (
                <div
                  key={book._id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-light)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: 'var(--shadow-sm)'
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
                      <span className="badge badge-category" style={{ marginBottom: '4px' }}>
                        {book.category}
                      </span>
                      <h3 className="heading-serif" style={{
                        fontSize: '16px',
                        marginBottom: '4px',
                        lineHeight: '1.3'
                      }}>
                        {book.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        By {book.author}
                      </p>
                      <span className="badge" style={{ backgroundColor: 'var(--accent-green)', color: '#FFF' }}>
                        Free Public Domain
                      </span>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {book.description}
                  </p>

                  <div style={{
                    marginTop: 'auto',
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '14px',
                    display: 'flex',
                    gap: '10px'
                  }}>
                    {downloaded ? (
                      <button
                        onClick={() => {
                          const offlineItem = offlineBooks.find(b => b.id === book._id);
                          handleOpenReader(offlineItem || book);
                        }}
                        className="btn btn-forest"
                        style={{ flex: 1, fontSize: '13px' }}
                      >
                        <CheckCircle2 size={16} /> Read Offline
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDownload(book)}
                        disabled={isDownloading}
                        className="btn btn-primary"
                        style={{ flex: 1, fontSize: '13px' }}
                      >
                        <DownloadCloud size={16} />
                        <span>{isDownloading ? 'Saving to IndexedDB...' : 'Download for Offline'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenReader(book)}
                      className="btn btn-secondary"
                      style={{ padding: '8px 12px' }}
                      title="Read Online Sample"
                    >
                      <BookOpen size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================= MY STORED OFFLINE BOOKS TAB ================= */
        <div>
          {offlineBooks.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '24px'
            }}>
              {offlineBooks.map((book) => (
                <div
                  key={book.id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-medium)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: 'var(--shadow-sm)'
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
                      <span className="badge badge-category" style={{ marginBottom: '4px' }}>
                        {book.category}
                      </span>
                      <h3 className="heading-serif" style={{ fontSize: '16px', marginBottom: '4px', lineHeight: '1.3' }}>
                        {book.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        By {book.author}
                      </p>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Saved: {new Date(book.downloadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Offline Reading Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{book.lastReadPosition || 'Chapter 1'}</span>
                      <span style={{ fontWeight: '700', color: 'var(--accent-burgundy)' }}>
                        {book.readingProgress || 0}% read
                      </span>
                    </div>
                    <div style={{ height: '5px', backgroundColor: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${book.readingProgress || 0}%`,
                        backgroundColor: 'var(--accent-burgundy)'
                      }} />
                    </div>
                  </div>

                  <div style={{
                    marginTop: 'auto',
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '14px',
                    display: 'flex',
                    gap: '10px'
                  }}>
                    <button
                      onClick={() => handleOpenReader(book)}
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: '13px' }}
                    >
                      <BookOpen size={16} /> Open Offline Reader
                    </button>
                    <button
                      onClick={() => handleDeleteOffline(book.id, book.title)}
                      className="btn btn-secondary"
                      style={{ padding: '8px 12px', color: '#DC2626' }}
                      title="Remove from IndexedDB"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={HardDrive}
              title="No books stored for offline reading yet"
              description="Download public domain volumes from our Free Classics collection to read anytime without an internet connection."
              actionText="Explore Free Classics"
              onAction={() => setActiveTab('catalog')}
            />
          )}
        </div>
      )}

      {/* Offline Reader Modal */}
      {activeBook && (
        <BookReaderModal
          book={activeBook}
          isOpen={readerOpen}
          onClose={() => setReaderOpen(false)}
          initialProgress={activeBook.readingProgress || 0}
          initialPosition={activeBook.lastReadPosition || 'Chapter 1: The Beginning'}
          onSaveProgress={handleSaveOfflineProgress}
        />
      )}
    </div>
  );
}

