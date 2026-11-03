import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Flame,
  Clock,
  Compass,
  ArrowRight,
  Filter,
  Check,
  BookOpen,
  ArrowUpDown
} from 'lucide-react';
import api from '../services/api';
import BookCard from '../components/BookCard';
import BookModal from '../components/BookModal';
import BookReaderModal from '../components/BookReaderModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatINR } from '../utils/currency';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active filter states
  const activeCategory = searchParams.get('category') || 'All';
  const searchQueryParam = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(searchQueryParam);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-asc', 'price-desc', 'popularity'
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'featured', 'bestseller', 'new-arrival', 'recommended'

  // Data states
  const [books, setBooks] = useState([]);
  const [sectionsData, setSectionsData] = useState({
    featured: [],
    bestsellers: [],
    newArrivals: [],
    recommended: []
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState(true);

  // Modal states
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);
  const [readerBook, setReaderBook] = useState(null);

  // Sync search input with URL
  useEffect(() => {
    setSearchInput(searchQueryParam);
  }, [searchQueryParam]);

  // Fetch Category counts & curated sections
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, secRes] = await Promise.all([
          api.get('/books/categories'),
          api.get('/books/sections')
        ]);
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
        if (secRes.data.success) {
          setSectionsData(secRes.data.sections);
        }
      } catch (err) {
        console.warn('Metadata fetch error:', err.message);
      } finally {
        setSectionsLoading(false);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch catalog books with filters
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const params = {};
        if (activeCategory && activeCategory !== 'All') {
          params.category = activeCategory;
        }
        if (searchQueryParam) {
          params.search = searchQueryParam;
        }
        if (sortBy) {
          params.sort = sortBy;
        }
        if (activeTab !== 'all') {
          params.collection = activeTab;
        }

        const res = await api.get('/books', { params });
        if (res.data.success) {
          setBooks(res.data.books);
        }
      } catch (err) {
        console.warn('Catalog fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [activeCategory, searchQueryParam, sortBy, activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleCategorySelect = (catName) => {
    const newParams = new URLSearchParams(searchParams);
    if (catName === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', catName);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setSearchInput('');
    setSortBy('newest');
    setActiveTab('all');
  };

  const handleOpenDetails = (book) => {
    setSelectedBook(book);
    setModalOpen(true);
  };

  const handleOpenSampleReader = (book) => {
    setReaderBook(book);
    setReaderOpen(true);
  };

  // Featured book for Hero section banner
  const heroBook = sectionsData.featured[0] || books[0];

  return (
    <div className="animate-fade-in">
      {/* ==================== A. HERO SECTION ==================== */}
      <section style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-light)',
        padding: '56px 0 64px'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '48px'
          }}>
            {/* Left Column: Headlines & CTAs */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: 'var(--accent-burgundy-subtle)',
                color: 'var(--accent-burgundy)',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                <Sparkles size={14} /> Curated Literary & Academic Repository
              </div>

              <h1 className="heading-serif" style={{
                fontSize: 'clamp(32px, 4.5vw, 48px)',
                lineHeight: '1.15',
                color: 'var(--text-primary)',
                marginBottom: '18px'
              }}>
                Stories that Inspire. <br />
                <span style={{ color: 'var(--accent-burgundy)' }}>Knowledge that Transforms.</span>
              </h1>

              <p style={{
                fontSize: '16px',
                color: 'var(--text-secondary)',
                lineHeight: '1.7',
                marginBottom: '28px',
                maxWidth: '540px'
              }}>
                Immerse yourself in over 70 premier titles spanning Fiction, Mystery, Romance, Self-Help, Modern Technology, Business, and University Education. Real editions, authentic INR pricing, and instantaneous digital reading.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '32px' }}>
                <a href="#catalog-section" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }}>
                  Explore Books <ArrowRight size={16} />
                </a>
                <button
                  onClick={() => heroBook && handleOpenDetails(heroBook)}
                  className="btn btn-secondary"
                  style={{ padding: '12px 24px', fontSize: '15px' }}
                >
                  Shop Featured Title
                </button>
              </div>

              {/* Guarantees */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} style={{ color: 'var(--accent-green)' }} /> Authentic INR (₹) Billing
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} style={{ color: 'var(--accent-green)' }} /> Verified Open Library Covers
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} style={{ color: 'var(--accent-green)' }} /> Public Domain Offline E-Books
                </span>
              </div>
            </div>

            {/* Right Column: Hero Featured Book Spotlight */}
            {heroBook && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  backgroundColor: 'var(--bg-card)',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-medium)',
                  boxShadow: 'var(--shadow-lg)',
                  maxWidth: '380px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <span className="badge badge-featured" style={{ marginBottom: '16px' }}>
                    Featured Spotlight
                  </span>
                  <div style={{
                    width: '180px',
                    height: '260px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-book)',
                    marginBottom: '16px'
                  }}>
                    <img
                      src={heroBook.coverImage}
                      alt={heroBook.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <h3 className="heading-serif" style={{ fontSize: '18px', marginBottom: '4px' }}>
                    {heroBook.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    By {heroBook.author} • {heroBook.category}
                  </p>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent-burgundy)', marginBottom: '16px' }}>
                    {formatINR(heroBook.price)}
                  </div>
                  <button
                    onClick={() => handleOpenDetails(heroBook)}
                    className="btn btn-outline"
                    style={{ width: '100%' }}
                  >
                    View Details & Read Sample
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================== B. WORKING SEARCH BAR ==================== */}
      <section style={{
        marginTop: '-28px',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="container">
          <form
            onSubmit={handleSearchSubmit}
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '12px',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-md)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              maxWidth: '860px',
              margin: '0 auto'
            }}
          >
            <Search size={22} style={{ color: 'var(--accent-burgundy)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by title (e.g. 'Clean Code'), author ('Agatha Christie'), or category..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '15px',
                fontFamily: 'inherit',
                backgroundColor: 'transparent'
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('search');
                  setSearchParams(newParams);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '14px', flexShrink: 0 }}
            >
              Search Catalog
            </button>
          </form>
        </div>
      </section>

      {/* ==================== C. 7 BOOK CATEGORIES FILTER ==================== */}
      <section style={{ padding: '40px 0 20px' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h2 className="heading-serif" style={{ fontSize: '22px' }}>
                Browse by Category
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Filter our verified database of {categories.reduce((acc, c) => acc + c.count, 0) || 70} books across 7 disciplines
              </p>
            </div>
            {activeCategory !== 'All' && (
              <button
                onClick={() => handleCategorySelect('All')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-burgundy)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Reset to All Categories
              </button>
            )}
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            paddingBottom: '8px'
          }}>
            <button
              onClick={() => handleCategorySelect('All')}
              style={{
                padding: '8px 18px',
                borderRadius: '24px',
                border: '1px solid',
                borderColor: activeCategory === 'All' ? 'var(--accent-burgundy)' : 'var(--border-medium)',
                backgroundColor: activeCategory === 'All' ? 'var(--accent-burgundy)' : 'var(--bg-card)',
                color: activeCategory === 'All' ? '#FFFFFF' : 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All Categories
            </button>

            {categories.map((cat) => {
              const isSelected = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => handleCategorySelect(cat.name)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '24px',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent-burgundy)' : 'var(--border-medium)',
                    backgroundColor: isSelected ? 'var(--accent-burgundy)' : 'var(--bg-card)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: isSelected ? '600' : '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{cat.name}</span>
                  <span style={{
                    fontSize: '11px',
                    opacity: isSelected ? 0.9 : 0.6,
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)',
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== F. HOMEPAGE CURATED SECTIONS (TABS) ==================== */}
      <section style={{ padding: '24px 0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '12px',
            marginBottom: '28px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'Explore All Books', icon: Compass },
                { id: 'featured', label: 'Featured Books', icon: Sparkles },
                { id: 'bestseller', label: 'Bestsellers', icon: Flame },
                { id: 'new-arrival', label: 'New Arrivals', icon: Clock },
                { id: 'recommended', label: 'Recommended Books', icon: BookOpen }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: isSelected ? 'var(--accent-burgundy)' : 'transparent',
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: isSelected ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* I. Sorting Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpDown size={15} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-card)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="popularity">Popularity / Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Search & Filter Indicator */}
          {(searchQueryParam || activeCategory !== 'All' || activeTab !== 'all') && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-secondary)',
              padding: '10px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '13px'
            }}>
              <div>
                Showing results for{' '}
                {searchQueryParam && <strong>search "{searchQueryParam}" </strong>}
                {activeCategory !== 'All' && <strong>in category "{activeCategory}" </strong>}
                {activeTab !== 'all' && <strong>under {activeTab} </strong>}
                ({books.length} books found)
              </div>
              <button
                onClick={clearAllFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-burgundy)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Catalog Grid */}
          <div id="catalog-section">
            {loading ? (
              <LoadingSpinner text="Retrieving curated books from MongoDB..." />
            ) : books.length > 0 ? (
              <div className="books-grid">
                {books.map((book) => (
                  <BookCard
                    key={book._id}
                    book={book}
                    onViewDetails={handleOpenDetails}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No matching books discovered"
                description={`We couldn't find any titles matching your query "${searchInput || searchQueryParam}". Try clearing filters to view our full collection.`}
                actionText="Reset All Filters"
                onAction={clearAllFilters}
              />
            )}
          </div>
        </div>
      </section>

      {/* Book Details Modal */}
      <BookModal
        book={selectedBook}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onReadSample={handleOpenSampleReader}
      />

      {/* Interactive E-Reader Modal */}
      <BookReaderModal
        book={readerBook}
        isOpen={readerOpen}
        onClose={() => setReaderOpen(false)}
      />
    </div>
  );
}

