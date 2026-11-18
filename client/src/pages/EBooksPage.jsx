import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookDown,
  Search,
  Filter,
  FileText,
  BookOpen,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  Star,
  Sparkles,
  Laptop,
  Check,
  ChevronDown,
  ArrowUpDown,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { saveOfflineBook } from '../services/indexedDB';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import BookReaderModal from '../components/BookReaderModal';

export default function EBooksPage() {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [formatFilter, setFormatFilter] = useState('all'); // 'all', 'pdf', 'epub'
  const [sortBy, setSortBy] = useState('popularity'); // 'popularity', 'rating', 'newest', 'title'

  // Download states: map of bookId -> 'pdf' | 'epub' | null
  const [downloadingState, setDownloadingState] = useState({});
  const [downloadSuccessMap, setDownloadSuccessMap] = useState({});

  // Reader state
  const [readerOpen, setReaderOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const categories = [
    'All',
    'Fiction',
    'Mystery',
    'Romance',
    'Self-Help',
    'Technology',
    'Business',
    'Education'
  ];

  // Fetch E-Books from MongoDB API
  const fetchEbooks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (sortBy) params.sort = sortBy;

      const res = await api.get('/books/ebooks', { params });
      if (res.data.success) {
        setEbooks(res.data.ebooks || []);
      }
    } catch (err) {
      console.warn('Failed to fetch ebooks:', err.message);
      // Fallback: try standard books endpoint
      try {
        const fallbackRes = await api.get('/books');
        if (fallbackRes.data.success) {
          const mapped = fallbackRes.data.books.map(b => ({
            ...b,
            ebookFormats: ['PDF', 'EPUB'],
            fileSize: '2.4 MB',
            downloadCount: 480,
            isDigitalAvailable: true
          }));
          setEbooks(mapped);
        }
      } catch (fbErr) {
        toast.error('Unable to retrieve e-books catalog.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEbooks();
  }, [activeCategory, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEbooks();
  };

  // Perform actual file download to local device
  const handleDownload = async (book, format = 'pdf') => {
    const key = `${book._id}-${format}`;
    setDownloadingState(prev => ({ ...prev, [key]: true }));

    try {
      // 1. Fetch binary file from backend API
      const res = await api.get(`/books/${book._id}/download?format=${format}`, {
        responseType: 'blob'
      });

      // 2. Create blob object URL
      const mimeType = format === 'epub' ? 'application/epub+zip' : 'application/pdf';
      const blob = new Blob([res.data], { type: mimeType });
      const downloadUrl = window.URL.createObjectURL(blob);

      // 3. Trigger immediate browser file download to local Downloads folder
      const safeTitle = (book.title || 'ebook')
        .replace(/[^a-zA-Z0-9_\- ]/g, '')
        .trim()
        .replace(/\s+/g, '_');
      const filename = `${safeTitle}.${format}`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // 4. Record download into local history so it appears in My Account > My E-Books
      try {
        const stored = JSON.parse(localStorage.getItem('athenaeum_downloaded_ebooks') || '[]');
        const updatedRecord = {
          bookId: book._id,
          title: book.title,
          author: book.author,
          coverImage: book.coverImage,
          category: book.category,
          description: book.description,
          format: format.toUpperCase(),
          downloadedAt: new Date().toISOString()
        };
        const exists = stored.some(item => item.bookId === book._id && item.format === format.toUpperCase());
        if (!exists) {
          stored.unshift(updatedRecord);
          localStorage.setItem('athenaeum_downloaded_ebooks', JSON.stringify(stored));
        }

        // Also cache into browser IndexedDB for offline e-reader
        await saveOfflineBook(book);
      } catch (storageErr) {
        console.warn('Local download tracking note:', storageErr);
      }

      // 5. Update UI feedback
      setDownloadSuccessMap(prev => ({ ...prev, [key]: true }));
      toast.success(`"${book.title}" (${format.toUpperCase()}) downloaded to your PC!`);
      setTimeout(() => {
        setDownloadSuccessMap(prev => ({ ...prev, [key]: false }));
      }, 4000);

    } catch (err) {
      console.error('E-Book download failed:', err);
      toast.error(`Failed to download ${format.toUpperCase()}. Please check your connection and try again.`);
    } finally {
      setDownloadingState(prev => ({ ...prev, [key]: false }));
    }
  };

  const openSampleReader = (book) => {
    setSelectedBook(book);
    setReaderOpen(true);
  };

  return (
    <div className="animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)', paddingBottom: '80px' }}>
      {/* ================= Header Banner ================= */}
      <section style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-light)',
        padding: '48px 0 52px'
      }}>
        <div className="container">
          <div style={{ maxWidth: '800px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 14px',
              borderRadius: '20px',
              backgroundColor: 'var(--accent-burgundy-subtle)',
              color: 'var(--accent-burgundy)',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '14px'
            }}>
              <BookDown size={15} /> Athenaeum Digital Repository
            </div>

            <h1 className="heading-serif" style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              color: 'var(--text-primary)',
              lineHeight: '1.2',
              marginBottom: '12px'
            }}>
              Digital E-Books Library
            </h1>

            <p style={{
              fontSize: '15px',
              color: 'var(--text-secondary)',
              lineHeight: '1.7',
              marginBottom: '24px'
            }}>
              Download high-fidelity <strong>PDF</strong> and <strong>EPUB</strong> editions directly to your laptop, PC, or e-reader device. Read your favorite titles completely offline without internet connectivity.
            </p>

            {/* Offline Device Capability Feature Pills */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              fontSize: '13px',
              color: 'var(--text-secondary)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Laptop size={16} style={{ color: 'var(--accent-green)' }} /> Direct Download to Laptop & PC
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} style={{ color: 'var(--accent-burgundy)' }} /> Multi-Format: PDF & EPUB
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HardDrive size={16} style={{ color: 'var(--accent-gold)' }} /> 100% Offline Compatible
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Search & Controls Bar ================= */}
      <div className="container" style={{ marginTop: '32px' }}>
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          {/* Search Input & Sort Selector */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '280px', display: 'flex', gap: '8px' }}>
              <div style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center'
              }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search digital titles, authors, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 40px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-primary)',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                Search
              </button>
            </form>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpDown size={15} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-card)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Recently Added</option>
                <option value="title">Title (A to Z)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Filter by Category:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map((cat) => {
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-burgundy)' : 'var(--border-medium)',
                      backgroundColor: isSelected ? 'var(--accent-burgundy)' : 'var(--bg-secondary)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: isSelected ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Catalog Count & Active Notice */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '24px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Showing <strong>{ebooks.length}</strong> available digital titles
            {activeCategory !== 'All' && <span> in <strong>{activeCategory}</strong></span>}
            {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
          </div>

          {(activeCategory !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-burgundy)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* ================= E-Books Grid ================= */}
        {loading ? (
          <div style={{ padding: '60px 0' }}>
            <LoadingSpinner text="Retrieving digital editions from MongoDB repository..." />
          </div>
        ) : ebooks.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '24px'
          }}>
            {ebooks.map((book) => {
              const isDownloadingPdf = downloadingState[`${book._id}-pdf`];
              const isDownloadingEpub = downloadingState[`${book._id}-epub`];
              const pdfDownloaded = downloadSuccessMap[`${book._id}-pdf`];
              const epubDownloaded = downloadSuccessMap[`${book._id}-epub`];

              return (
                <div
                  key={book._id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '10px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  className="ebook-card"
                >
                  {/* Top Bar: Category & Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span className="badge badge-category">{book.category}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#B48E43' }}>
                      <Star size={13} fill="#B48E43" color="#B48E43" />
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                        {book.rating ? book.rating.toFixed(1) : '4.8'}
                      </span>
                    </div>
                  </div>

                  {/* Book Body: Cover + Details */}
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <Link
                      to={`/book/${book._id}`}
                      style={{
                        width: '90px',
                        height: '130px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        boxShadow: 'var(--shadow-book)',
                        display: 'block'
                      }}
                    >
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Link>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        to={`/book/${book._id}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <h3 className="heading-serif" style={{
                          fontSize: '16px',
                          color: 'var(--text-primary)',
                          marginBottom: '4px',
                          lineHeight: '1.3',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {book.title}
                        </h3>
                      </Link>

                      <p style={{
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                        marginBottom: '8px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {book.author}
                      </p>

                      {/* Format tags */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: 'var(--accent-burgundy-subtle)',
                          color: 'var(--accent-burgundy)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          PDF
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: 'var(--accent-green-subtle)',
                          color: 'var(--accent-green)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          EPUB
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center' }}>
                          {book.fileSize || '2.8 MB'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description snippet */}
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    marginBottom: '18px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1
                  }}>
                    {book.description}
                  </p>

                  {/* Actions Area */}
                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    {/* Primary Download Buttons (PDF & EPUB) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {/* PDF Download Button */}
                      <button
                        type="button"
                        onClick={() => handleDownload(book, 'pdf')}
                        disabled={isDownloadingPdf}
                        className="btn btn-primary"
                        style={{
                          padding: '9px 10px',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: '6px'
                        }}
                        title="Download PDF to your laptop/PC"
                      >
                        {isDownloadingPdf ? (
                          <>
                            <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }} />
                            <span>Saving...</span>
                          </>
                        ) : pdfDownloaded ? (
                          <>
                            <Check size={14} /> Saved!
                          </>
                        ) : (
                          <>
                            <Download size={14} /> Download PDF
                          </>
                        )}
                      </button>

                      {/* EPUB Download Button */}
                      <button
                        type="button"
                        onClick={() => handleDownload(book, 'epub')}
                        disabled={isDownloadingEpub}
                        className="btn btn-secondary"
                        style={{
                          padding: '9px 10px',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: '6px',
                          border: '1px solid var(--border-medium)'
                        }}
                        title="Download EPUB to your laptop/PC"
                      >
                        {isDownloadingEpub ? (
                          <>
                            <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }} />
                            <span>Saving...</span>
                          </>
                        ) : epubDownloaded ? (
                          <>
                            <Check size={14} color="var(--accent-green)" /> Saved!
                          </>
                        ) : (
                          <>
                            <Download size={14} /> Download EPUB
                          </>
                        )}
                      </button>
                    </div>

                    {/* Secondary actions: Details & Sample */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => openSampleReader(book)}
                        className="btn btn-outline"
                        style={{
                          padding: '7px 8px',
                          fontSize: '11px',
                          borderRadius: '6px'
                        }}
                      >
                        <BookOpen size={13} /> Read Sample
                      </button>

                      <Link
                        to={`/book/${book._id}`}
                        className="btn btn-secondary"
                        style={{
                          padding: '7px 8px',
                          fontSize: '11px',
                          borderRadius: '6px',
                          textAlign: 'center'
                        }}
                      >
                        <Eye size={13} /> View Specs
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No Digital E-Books Found"
            description={`We couldn't find any downloadable titles matching "${searchQuery}". Try searching with a different author, title, or category.`}
            actionText="View All E-Books"
            onAction={() => {
              setActiveCategory('All');
              setSearchQuery('');
            }}
          />
        )}
      </div>

      {/* Interactive E-Reader Modal */}
      <BookReaderModal
        book={selectedBook}
        isOpen={readerOpen}
        onClose={() => setReaderOpen(false)}
      />
    </div>
  );
}
