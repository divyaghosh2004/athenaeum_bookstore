import React from 'react';
import { ShoppingCart, Star, Eye, BookOpen } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { useCart } from '../context/CartContext';

export default function BookCard({ book, onViewDetails }) {
  const { addToCart } = useCart();
  const isOutOfStock = book.stockQuantity <= 0;

  return (
    <div className="book-card">
      <div className="book-card-cover-wrap" onClick={() => onViewDetails(book)} style={{ cursor: 'pointer' }}>
        <img
          src={book.coverImage}
          alt={book.title}
          className="book-card-cover-img"
          loading="lazy"
        />
        {/* Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {book.isBestseller && <span className="badge badge-bestseller">Bestseller</span>}
          {book.isFeatured && !book.isBestseller && <span className="badge badge-featured">Featured</span>}
          {book.isNewArrival && <span className="badge badge-new">New</span>}
        </div>

        {book.freeDownloadStatus && (
          <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
            <span className="badge" style={{ backgroundColor: 'var(--accent-green)', color: '#fff' }}>
              Free
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="badge badge-category">{book.category}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#B48E43' }}>
            <Star size={13} fill="#B48E43" color="#B48E43" />
            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{book.rating?.toFixed(1) || '4.5'}</span>
          </div>
        </div>

        <h3
          className="heading-serif"
          onClick={() => onViewDetails(book)}
          style={{
            fontSize: '15px',
            lineHeight: '1.35',
            marginBottom: '4px',
            cursor: 'pointer',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '40px'
          }}
          title={book.title}
        >
          {book.title}
        </h3>

        <p style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          marginBottom: '12px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {book.author}
        </p>

        <div style={{
          marginTop: 'auto',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--accent-burgundy)' }}>
              {formatINR(book.price)}
            </div>
            <div style={{
              fontSize: '11px',
              fontWeight: '500',
              color: isOutOfStock ? '#DC2626' : 'var(--accent-green)'
            }}>
              {isOutOfStock ? 'Out of Stock' : `In Stock (${book.stockQuantity})`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => onViewDetails(book)}
              title="View Details"
              className="btn btn-secondary"
              style={{ padding: '8px', borderRadius: '6px' }}
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => addToCart(book, 1)}
              disabled={isOutOfStock}
              title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              className="btn btn-primary"
              style={{ padding: '8px 12px', borderRadius: '6px' }}
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

