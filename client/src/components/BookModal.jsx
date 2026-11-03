import React, { useState } from 'react';
import { X, ShoppingCart, Zap, Star, ShieldCheck, Truck, BookOpen } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function BookModal({ book, isOpen, onClose, onReadSample }) {
  if (!isOpen || !book) return null;

  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const isOutOfStock = book.stockQuantity <= 0;

  const handleAddToCart = async () => {
    const success = await addToCart(book, quantity);
    if (success) {
      onClose();
    }
  };

  const handleBuyNow = async () => {
    const success = await addToCart(book, quantity);
    if (success) {
      onClose();
      navigate('/cart?checkout=true');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '0', overflow: 'hidden' }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <X size={20} />
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          minHeight: '480px'
        }}>
          {/* Left Column: Cover & Badges */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid var(--border-light)'
          }}>
            <div style={{
              width: '220px',
              height: '320px',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-book)'
            }}>
              <img
                src={book.coverImage}
                alt={book.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{
              marginTop: '20px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} style={{ color: 'var(--accent-green)' }} />
                <span>100% Genuine Edition & Verified Binding</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={16} style={{ color: 'var(--accent-burgundy)' }} />
                <span>Express Pan-India Delivery Available</span>
              </div>
            </div>
          </div>

          {/* Right Column: Book Details */}
          <div style={{ padding: '36px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-category">{book.category}</span>
              {book.isBestseller && <span className="badge badge-bestseller">Bestseller</span>}
              {book.isFeatured && <span className="badge badge-featured">Curator's Pick</span>}
            </div>

            <h2 className="heading-serif" style={{ fontSize: '26px', marginBottom: '6px' }}>
              {book.title}
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              By <strong style={{ color: 'var(--text-primary)' }}>{book.author}</strong>
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#B48E43' }}>
                <Star size={18} fill="#B48E43" color="#B48E43" />
                <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)' }}>
                  {book.rating?.toFixed(1) || '4.5'}
                </span>
              </div>
              <span style={{ color: 'var(--border-medium)' }}>|</span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {book.reviewsCount || 120} verified reader ratings
              </span>
              <span style={{ color: 'var(--border-medium)' }}>|</span>
              <span style={{
                fontSize: '13px',
                fontWeight: '600',
                color: isOutOfStock ? '#DC2626' : 'var(--accent-green)'
              }}>
                {isOutOfStock ? 'Currently Out of Stock' : `${book.stockQuantity} Copies in Stock`}
              </span>
            </div>

            {/* Price Banner */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '16px 20px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'baseline',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent-burgundy)' }}>
                {formatINR(book.price)}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Inclusive of all taxes & instant digital chapter access
              </span>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px', flex: 1 }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Synopsis
              </h4>
              <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                {book.description}
              </p>
            </div>

            {/* Quantity and Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>Quantity:</span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{
                      width: '36px',
                      height: '36px',
                      background: 'var(--bg-secondary)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    -
                  </button>
                  <span style={{ width: '44px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= book.stockQuantity}
                    onClick={() => setQuantity(q => Math.min(book.stockQuantity, q + 1))}
                    style={{
                      width: '36px',
                      height: '36px',
                      background: 'var(--bg-secondary)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    +
                  </button>
                </div>

                {onReadSample && (
                  <button
                    onClick={() => {
                      onClose();
                      onReadSample(book);
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '13px', padding: '8px 14px' }}
                  >
                    <BookOpen size={16} /> Read Sample Chapter
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="btn btn-outline"
                  style={{ padding: '12px' }}
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className="btn btn-primary"
                  style={{ padding: '12px' }}
                >
                  <Zap size={18} /> Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

