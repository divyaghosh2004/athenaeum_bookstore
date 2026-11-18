import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingCart,
  Zap,
  BookOpen,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  Check,
  Heart,
  Clock,
  Sparkles,
  Info,
  ArrowLeft,
  Award
} from 'lucide-react';
import api from '../services/api';
import { formatINR } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import BookReaderModal from '../components/BookReaderModal';
import BookCard from '../components/BookCard';

export default function BookProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const toast = useToast();

  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Interaction states
  const [quantity, setQuantity] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState('paperback'); // 'paperback', 'hardcover', 'digital'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'details', 'author', 'reviews'
  const [readerOpen, setReaderOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Fetch Book Data
  const fetchBook = useCallback(async () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    setError(false);
    setQuantity(1);

    try {
      const res = await api.get(`/books/${id}`);
      if (res.data.success && res.data.book) {
        setBook(res.data.book);
        setRelatedBooks(Array.isArray(res.data.related) ? res.data.related : []);
      } else {
        throw new Error('Book not found in direct query');
      }
    } catch (err) {
      console.warn('Direct book fetch note, trying catalog search fallback:', err.message);
      // Fallback: search catalog for matching ID or title
      try {
        const allRes = await api.get('/books', { params: { limit: 100 } });
        if (allRes.data.success && Array.isArray(allRes.data.books)) {
          const found = allRes.data.books.find(
            b => String(b._id) === String(id) || String(b.id) === String(id)
          );
          if (found) {
            setBook(found);
            setRelatedBooks(
              allRes.data.books
                .filter(b => b.category === found.category && String(b._id) !== String(id))
                .slice(0, 4)
            );
            setError(false);
            return;
          }
        }
      } catch (fbErr) {
        console.error('Catalog fallback failed:', fbErr);
      }
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  const handleTabChange = (tabId) => {
    if (tabId === 'reviews') {
      setReviewsLoading(true);
      setActiveTab('reviews');
      setTimeout(() => {
        setReviewsLoading(false);
      }, 300);
    } else {
      setActiveTab(tabId);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Loading book details..." onRetry={fetchBook} />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container" style={{ padding: '80px 24px', minHeight: '60vh' }}>
        <EmptyState
          title="Book Details Unavailable"
          description="We couldn't retrieve this book from the catalog. Please check your network connection or try again."
          actionText="Retry"
          onAction={fetchBook}
        />
      </div>
    );
  }

  const isOutOfStock = (book?.stockQuantity || 0) <= 0;

  // Format pricing adjustments
  const priceMultiplier = selectedFormat === 'hardcover' ? 1.35 : selectedFormat === 'digital' ? 0.75 : 1;
  const basePrice = Number(book?.price) || 299;
  const currentPrice = Math.round(basePrice * priceMultiplier);
  const originalMRP = Math.round(currentPrice * 1.25);
  const savings = Math.max(0, originalMRP - currentPrice);

  // Handle Add to Cart
  const handleAddToCart = async () => {
    const itemToAdd = {
      ...book,
      price: currentPrice,
      selectedFormat
    };
    await addToCart(itemToAdd, quantity);
  };

  // Handle Buy Now
  const handleBuyNow = async () => {
    const itemToAdd = {
      ...book,
      price: currentPrice,
      selectedFormat
    };
    const success = await addToCart(itemToAdd, quantity);
    if (success) {
      navigate('/cart?checkout=true');
    }
  };

  // Handle Share / Copy Link
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Direct link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Generating mock deterministic metadata for professional presentation
  const bookIdStr = String(book?._id || book?.id || id || 'book');
  const code0 = bookIdStr.charCodeAt(0) || 65;
  const code1 = bookIdStr.charCodeAt(1) || 66;
  const code2 = bookIdStr.charCodeAt(2) || 67;
  const code3 = bookIdStr.charCodeAt(3) || 68;
  const code4 = bookIdStr.charCodeAt(4) || 69;
  const isbn13 = `978-${Math.abs(code0 * 897 % 900 + 100)}-${Math.abs(code1 * 789 % 90000 + 10000)}-${Math.abs(code2 % 9 + 1)}`;
  const isbn10 = `${Math.abs(code3 * 654 % 900000000 + 100000000)}-${Math.abs(code4 % 9 + 1)}`;
  const pageCount = 280 + (Math.abs(code0 * 17) % 360);
  const publishYear = 2018 + (Math.abs(code1 * 3) % 7);

  // Review breakdown calculation
  const fiveStarPct = 78;
  const fourStarPct = 15;
  const threeStarPct = 5;
  const twoStarPct = 2;

  return (
    <div className="animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)', paddingBottom: '80px' }}>
      {/* ================= Breadcrumb Navigation ================= */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-light)',
        padding: '14px 0'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={14} />
          <Link to={`/?category=${encodeURIComponent(book.category)}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
            {book.category}
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--text-primary)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 'min(240px, 45vw)' }}>
            {book.title}
          </span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px' }}>
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            marginBottom: '24px',
            padding: 0
          }}
        >
          <ArrowLeft size={16} /> Back to Catalog
        </button>

        {/* ================= Main Product Section ================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 380px) 1fr minmax(280px, 320px)',
          gap: '36px',
          alignItems: 'start'
        }} className="product-layout-grid">

          {/* ===== Column 1: Book Cover & Quick Badges ===== */}
          <div>
            <div className="product-cover-card" style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: '12px',
              padding: '24px',
              position: 'relative',
              boxShadow: 'var(--shadow-book)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Badges */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 2 }}>
                {book.isBestseller && <span className="badge badge-bestseller">National Bestseller</span>}
                {book.isFeatured && !book.isBestseller && <span className="badge badge-featured">Curator's Choice</span>}
                {book.isNewArrival && <span className="badge badge-new">New Release</span>}
                {book.freeDownloadStatus && (
                  <span className="badge" style={{ backgroundColor: 'var(--accent-green)', color: '#fff' }}>
                    Free Open Access
                  </span>
                )}
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                title="Share Book"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 2,
                  transition: 'all 0.15s ease'
                }}
              >
                {copied ? <Check size={16} color="var(--accent-green)" /> : <Share2 size={16} color="var(--text-secondary)" />}
              </button>

              {/* Cover Image Container */}
              <div style={{
                width: '100%',
                maxWidth: '280px',
                aspectRatio: '2 / 3',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 16px 32px rgba(28, 25, 23, 0.2)',
                position: 'relative',
                marginTop: '12px'
              }}>
                <img
                  src={book.coverImage}
                  alt={book.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Quick Reader Action */}
              <div style={{ width: '100%', marginTop: '24px' }}>
                <button
                  onClick={() => setReaderOpen(true)}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '11px', fontSize: '13px', fontWeight: '600' }}
                >
                  <BookOpen size={16} /> Read Sample Chapter Online
                </button>
              </div>
            </div>

            {/* Trust and Quality Assurance */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              padding: '18px',
              marginTop: '18px',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={18} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                <span><strong>Authentic Edition:</strong> Guaranteed authentic publisher release with pristine binding.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <RotateCcw size={18} style={{ color: 'var(--accent-burgundy)', flexShrink: 0 }} />
                <span><strong>7-Day Replacement:</strong> Effortless exchange if damaged in transit.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                <span><strong>Curated Excellence:</strong> Selected for literary and intellectual distinction.</span>
              </div>
            </div>
          </div>

          {/* ===== Column 2: Central Book Information ===== */}
          <div>
            {/* Category & Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <Link
                to={`/?category=${encodeURIComponent(book.category)}`}
                className="badge badge-category"
                style={{ textDecoration: 'none' }}
              >
                {book.category}
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#B48E43' }}>
                <Star size={16} fill="#B48E43" color="#B48E43" />
                <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
                  {book.rating ? book.rating.toFixed(1) : '4.8'}
                </span>
              </div>

              <span style={{ color: 'var(--border-medium)' }}>•</span>

              <a
                href="#reviews"
                onClick={(e) => {
                  e.preventDefault();
                  handleTabChange('reviews');
                  document.getElementById('tabs-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'underline' }}
              >
                {book.reviewsCount || 142} Reader Ratings
              </a>
            </div>

            {/* Book Title */}
            <h1 className="heading-serif" style={{ fontSize: '32px', lineHeight: '1.25', color: 'var(--text-primary)', marginBottom: '8px' }}>
              {book.title}
            </h1>

            {/* Author */}
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Authored by <strong style={{ color: 'var(--text-primary)' }}>{book.author}</strong>
            </p>

            {/* Format Selection Selector */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Select Available Edition & Format:
              </div>
              <div className="format-selector-grid">
                {[
                  { id: 'paperback', name: 'Paperback', price: book.price, note: 'Standard Softcover' },
                  { id: 'hardcover', name: 'Hardcover', price: Math.round(book.price * 1.35), note: 'Collector Clothbound' },
                  { id: 'digital', name: 'Digital Edition', price: Math.round(book.price * 0.75), note: 'Instant E-Reader' }
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setSelectedFormat(fmt.id)}
                    style={{
                      border: selectedFormat === fmt.id ? '2px solid var(--accent-burgundy)' : '1px solid var(--border-medium)',
                      backgroundColor: selectedFormat === fmt.id ? 'var(--accent-burgundy-subtle)' : 'var(--bg-card)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '700', color: selectedFormat === fmt.id ? 'var(--accent-burgundy)' : 'var(--text-primary)' }}>
                      {fmt.name}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                      {formatINR(fmt.price)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {fmt.note}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Synopsis Excerpt */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '28px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Editorial Summary
              </h3>
              <p style={{ fontSize: '15px', lineHeight: '1.75', color: 'var(--text-secondary)' }}>
                {book.description}
              </p>
            </div>

            {/* Quick Spec Highlights Grid */}
            <div className="quick-specs-grid" style={{
              borderTop: '1px solid var(--border-light)',
              borderBottom: '1px solid var(--border-light)',
              padding: '16px 0',
              marginBottom: '28px'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Print Length</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{pageCount} pages</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Language</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>English</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Publication Year</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{publishYear}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Publisher</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>Athenaeum Press</span>
              </div>
            </div>
          </div>

          {/* ===== Column 3: Purchase Card / Buy Box ===== */}
          <div>
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: 'var(--shadow-md)',
              position: 'sticky',
              top: '90px'
            }}>
              {/* Pricing Display */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--accent-burgundy)' }}>
                    {formatINR(currentPrice)}
                  </span>
                  <span style={{ fontSize: '16px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    {formatINR(originalMRP)}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: 'var(--accent-green)',
                    backgroundColor: 'var(--accent-green-subtle)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    Save {formatINR(savings)} (20% OFF)
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Inclusive of all Goods and Services Tax (GST)
                </div>
              </div>

              {/* Delivery Estimation */}
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '18px',
                fontSize: '12px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '3px' }}>
                  <Truck size={15} style={{ color: 'var(--accent-green)' }} />
                  <span>Free Express Courier Delivery</span>
                </div>
                <div>Delivered to major Indian pin codes within <strong>2–3 working days</strong>.</div>
              </div>

              {/* Stock Status Indicator */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: isOutOfStock ? '#DC2626' : 'var(--accent-green)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isOutOfStock ? '#DC2626' : 'var(--accent-green)'
                  }} />
                  {isOutOfStock ? 'Currently Out of Stock' : `In Stock (${book.stockQuantity} copies ready to dispatch)`}
                </div>
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Quantity
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '6px',
                    width: 'fit-content',
                    backgroundColor: 'var(--bg-card)'
                  }}>
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      style={{
                        width: '36px',
                        height: '36px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                      }}
                    >
                      -
                    </button>
                    <span style={{ width: '40px', textAlign: 'center', fontSize: '14px', fontWeight: '700' }}>
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= book.stockQuantity}
                      onClick={() => setQuantity(q => Math.min(book.stockQuantity, q + 1))}
                      style={{
                        width: '36px',
                        height: '36px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="btn btn-outline"
                  style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: '600' }}
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: '600' }}
                >
                  <Zap size={18} /> Buy Now with 1-Click
                </button>
              </div>

              {/* Guarantee list */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>✓ Secure checkout simulated payment</div>
                <div>✓ Immediate reading access on Personal Library</div>
                <div>✓ Packaged in eco-friendly protective sleeve</div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= Detailed Content Tabs ================= */}
        <div id="tabs-section" style={{ marginTop: '56px' }}>
          {/* Tab Navigation Headers */}
          <div className="product-tabs-header">
            {[
              { id: 'overview', label: 'Synopsis & Overview' },
              { id: 'details', label: 'Book Specifications' },
              { id: 'author', label: `About ${book.author}` },
              { id: 'reviews', label: `Reader Reviews (${book.reviewsCount || 142})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid var(--accent-burgundy)' : '3px solid transparent',
                  padding: '12px 20px',
                  fontSize: '15px',
                  fontWeight: activeTab === tab.id ? '700' : '500',
                  color: activeTab === tab.id ? 'var(--accent-burgundy)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  marginBottom: '-2px',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Panes */}
          <div className="product-tab-content" style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderTop: 'none',
            borderRadius: '0 0 10px 10px',
            padding: '36px'
          }}>
            {/* 1. Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="heading-serif" style={{ fontSize: '22px', marginBottom: '16px', color: 'var(--text-primary)' }}>
                  About the Literary Work
                </h3>
                <p style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  {book.description}
                </p>
                <div style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  padding: '20px',
                  borderLeft: '4px solid var(--accent-burgundy)'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Publisher Note:
                  </h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    This edition has been typeset in Spectral with rigorous attention to typographic balance, honoring classical bookmaking traditions while delivering exceptional clarity for contemporary readers.
                  </p>
                </div>
              </div>
            )}

            {/* 2. Specifications Tab */}
            {activeTab === 'details' && (
              <div>
                <h3 className="heading-serif" style={{ fontSize: '22px', marginBottom: '20px', color: 'var(--text-primary)' }}>
                  Bibliographic Details & Technical Specifications
                </h3>
                <div className="specs-details-grid">
                  {[
                    { label: 'Full Title', value: book.title },
                    { label: 'Primary Author', value: book.author },
                    { label: 'Category & Genre', value: book.category },
                    { label: 'ISBN-13', value: isbn13 },
                    { label: 'ISBN-10', value: isbn10 },
                    { label: 'Print Length', value: `${pageCount} numbered pages` },
                    { label: 'Language', value: 'English (Original Unabridged)' },
                    { label: 'Publisher', value: 'Athenaeum Press India Pvt. Ltd.' },
                    { label: 'Publication Year', value: publishYear },
                    { label: 'Physical Dimensions', value: '14.0 x 2.2 x 21.6 cm' },
                    { label: 'Binding Format', value: selectedFormat.toUpperCase() },
                    { label: 'Legal License', value: book.licenseInfo || 'All Rights Reserved' }
                  ].map((spec, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: i % 2 === 0 ? 'var(--bg-secondary)' : 'transparent',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <span style={{ color: 'var(--text-muted)' }}>{spec.label}:</span>
                      <strong style={{ color: 'var(--text-primary)', textAlign: 'right' }}>{spec.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Author Tab */}
            {activeTab === 'author' && (
              <div>
                <h3 className="heading-serif" style={{ fontSize: '22px', marginBottom: '14px', color: 'var(--text-primary)' }}>
                  About Author {book.author}
                </h3>
                <p style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                  <strong>{book.author}</strong> is a celebrated contributor to contemporary and classical literature in the <em>{book.category}</em> genre. With a profound capacity to weave thoughtful insight with immersive storytelling, their works continue to inspire millions of readers globally.
                </p>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--accent-gold-light)',
                  border: '1px solid var(--accent-gold)',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  color: '#785A1D'
                }}>
                  <Sparkles size={16} /> Featured Masterpiece in Athenaeum Curated Collection
                </div>
              </div>
            )}

            {/* 4. Reviews Tab */}
            {activeTab === 'reviews' && (
              <div id="reviews">
                {reviewsLoading ? (
                  <div style={{ padding: '40px 0' }}>
                    <LoadingSpinner text="Loading reviews..." size="sm" />
                  </div>
                ) : (
                  <div className="reviews-layout-grid">
                  {/* Rating Breakdown Card */}
                  <div style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    padding: '24px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
                      {book.rating ? book.rating.toFixed(1) : '4.8'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', margin: '8px 0' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={20} fill="#B48E43" color="#B48E43" />
                      ))}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Based on {book.reviewsCount || 142} verified purchaser ratings
                    </div>

                    {/* Progress bars */}
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                      {[
                        { stars: '5 Star', pct: fiveStarPct },
                        { stars: '4 Star', pct: fourStarPct },
                        { stars: '3 Star', pct: threeStarPct },
                        { stars: '2 Star', pct: twoStarPct },
                        { stars: '1 Star', pct: 0 }
                      ].map((bar, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '45px', textAlign: 'left', color: 'var(--text-secondary)' }}>{bar.stars}</span>
                          <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--border-medium)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${bar.pct}%`, height: '100%', backgroundColor: '#B48E43' }} />
                          </div>
                          <span style={{ width: '32px', textAlign: 'right', color: 'var(--text-muted)' }}>{bar.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Testimonials */}
                  <div>
                    <h4 className="heading-serif" style={{ fontSize: '20px', marginBottom: '16px' }}>
                      Verified Readers' Feedback
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {[
                        {
                          name: 'Arjun Venkatesh',
                          city: 'Bengaluru',
                          date: 'October 2025',
                          rating: 5,
                          review: 'An extraordinarily engaging volume! The paper quality from Athenaeum is immaculate and the typesetting is a joy to read. Finished it in two sittings.'
                        },
                        {
                          name: 'Priyanka Sharma',
                          city: 'New Delhi',
                          date: 'September 2025',
                          rating: 5,
                          review: `One of the finest books I've read in ${book.category}. Highly recommended for anyone seeking intellectual depth combined with lucid prose.`
                        },
                        {
                          name: 'Rohan Deshmukh',
                          city: 'Mumbai',
                          date: 'August 2025',
                          rating: 4,
                          review: 'Swift pan-India delivery, well packaged. The book itself is brilliant and the digital reading companion worked flawlessly on my tablet.'
                        }
                      ].map((rev, idx) => (
                        <div key={idx} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{rev.name}</strong>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{rev.city} • {rev.date}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '6px' }}>
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} size={13} fill="#B48E43" color="#B48E43" />
                            ))}
                            <span style={{ fontSize: '11px', color: 'var(--accent-green)', marginLeft: '6px', fontWeight: '600' }}>
                              ✓ Verified Purchase
                            </span>
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            "{rev.review}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= Related Books Carousel / Grid ================= */}
        {relatedBooks.length > 0 && (
          <div style={{ marginTop: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h2 className="heading-serif" style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  More from {book.category}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Hand-selected companions and recommended titles in the same discipline.
                </p>
              </div>

              <Link
                to={`/?category=${encodeURIComponent(book.category)}`}
                className="btn btn-secondary"
                style={{ fontSize: '13px' }}
              >
                View Full Collection <ChevronRight size={15} />
              </Link>
            </div>

            <div className="books-grid">
              {relatedBooks.map((relBook) => (
                <BookCard
                  key={relBook._id}
                  book={relBook}
                  onViewDetails={(b) => navigate(`/book/${b._id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Sample E-Reader Modal */}
      <BookReaderModal
        book={book}
        isOpen={readerOpen}
        onClose={() => setReaderOpen(false)}
      />
    </div>
  );
}
