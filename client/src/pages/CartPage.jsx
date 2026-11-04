import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  CreditCard,
  Building2,
  Smartphone,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import EmptyState from '../components/EmptyState';
import AuthModal from '../components/AuthModal';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeFromCart, clearCart, checkoutOrder } = useCart();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Checkout modal / step state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Address form
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.deliveryAddress?.street || '',
    city: user?.deliveryAddress?.city || '',
    state: user?.deliveryAddress?.state || '',
    postalCode: user?.deliveryAddress?.postalCode || '',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI (GPay / PhonePe / Paytm Demo)');

  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const grandTotal = subtotal + deliveryFee;

  const handleStartCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Please sign in or register to complete your order.');
      setAuthModalOpen(true);
      return;
    }
    // Pre-fill user data
    setAddress({
      fullName: user?.name || '',
      phone: user?.phone || '',
      street: user?.deliveryAddress?.street || '',
      city: user?.deliveryAddress?.city || '',
      state: user?.deliveryAddress?.state || '',
      postalCode: user?.deliveryAddress?.postalCode || '',
      country: 'India'
    });
    setIsCheckingOut(true);
  };

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.street || !address.city || !address.state || !address.postalCode) {
      toast.error('Please complete all delivery address fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await checkoutOrder(address, paymentMethod);
      if (res.success) {
        setConfirmedOrder(res.order);
        setIsCheckingOut(false);
        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success('Order placed successfully! Verified in MongoDB.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed. Please check stock and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If order was just placed, display the confirmation view
  if (confirmedOrder) {
    return (
      <div className="container animate-fade-in" style={{ padding: '64px 24px', maxWidth: '720px' }}>
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-green-subtle)',
            color: 'var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h1 className="heading-serif" style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Order Confirmed!
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Thank you for ordering with Athenaeum Bookstore. Your order has been recorded.
          </p>

          {/* Demo Simulation Badge */}
          <div style={{
            backgroundColor: 'var(--accent-gold-light)',
            border: '1px solid var(--accent-gold)',
            borderRadius: '8px',
            padding: '12px 18px',
            fontSize: '13px',
            color: '#785A1D',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <strong>Demo Simulation Receipt:</strong> Transaction ID: <code>{confirmedOrder.demoTransactionId}</code>.
            Eligible digital editions have been added to your <strong>Personal Digital Library</strong>.
          </div>

          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'left',
            marginBottom: '28px',
            fontSize: '13px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order Reference:</span>
              <span style={{ fontWeight: '600' }}>#{confirmedOrder._id?.slice(-8).toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Amount Paid (INR):</span>
              <span style={{ fontWeight: '700', color: 'var(--accent-burgundy)', fontSize: '16px' }}>
                {formatINR(confirmedOrder.totalAmount)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Delivery Recipient:</span>
              <span>{confirmedOrder.deliveryAddress?.fullName} ({confirmedOrder.deliveryAddress?.phone})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Destination:</span>
              <span>{confirmedOrder.deliveryAddress?.street}, {confirmedOrder.deliveryAddress?.city}, {confirmedOrder.deliveryAddress?.state} - {confirmedOrder.deliveryAddress?.postalCode}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/library" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              Go to Digital Library
            </Link>
            <Link to="/account" className="btn btn-secondary" style={{ padding: '12px 24px' }}>
              View in My Orders
            </Link>
            <button
              onClick={() => {
                setConfirmedOrder(null);
                navigate('/');
              }}
              className="btn btn-outline"
              style={{ padding: '12px 24px' }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '20px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShoppingCart size={28} style={{ color: 'var(--accent-burgundy)' }} />
          <h1 className="heading-serif" style={{ fontSize: '28px' }}>
            Shopping Cart ({items.length} unique title{items.length === 1 ? '' : 's'})
          </h1>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            style={{
              background: 'none',
              border: 'none',
              color: '#DC2626',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Trash2 size={15} /> Clear Entire Cart
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr minmax(300px, 380px)',
          gap: '36px',
          alignItems: 'start'
        }}>
          {/* Left Column: Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {items.map((item) => {
              const book = item.book;
              if (!book) return null;
              const bookId = book._id || book;
              const price = book.price || item.priceSnapshot;
              const itemTotal = price * item.quantity;

              return (
                <div
                  key={bookId}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-light)',
                    padding: '20px',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'center',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{
                    width: '72px',
                    height: '104px',
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
                      marginBottom: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {book.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      By {book.author}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent-burgundy)' }}>
                        {formatINR(price)}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>each</span>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '6px',
                      overflow: 'hidden'
                    }}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(bookId, item.quantity - 1)}
                        style={{
                          width: '30px',
                          height: '30px',
                          background: 'var(--bg-secondary)',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ width: '36px', textAlign: 'center', fontSize: '13px', fontWeight: '600' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(bookId, item.quantity + 1)}
                        style={{
                          width: '30px',
                          height: '30px',
                          background: 'var(--bg-secondary)',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div style={{ fontSize: '15px', fontWeight: '700' }}>
                      {formatINR(itemTotal)}
                    </div>

                    <button
                      onClick={() => removeFromCart(bookId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title="Remove from Cart"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            border: '1px solid var(--border-medium)',
            padding: '28px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h2 className="heading-serif" style={{ fontSize: '20px', marginBottom: '20px' }}>
              Order Summary
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Items Subtotal</span>
                <span style={{ fontWeight: '600' }}>{formatINR(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pan-India Standard Shipping</span>
                <span style={{ fontWeight: '600', color: deliveryFee === 0 ? 'var(--accent-green)' : 'inherit' }}>
                  {deliveryFee === 0 ? 'FREE' : formatINR(deliveryFee)}
                </span>
              </div>
              {subtotal < 499 && (
                <p style={{ fontSize: '12px', color: 'var(--accent-burgundy)' }}>
                  Add {formatINR(499 - subtotal)} more for Free Shipping!
                </p>
              )}
              <div style={{
                borderTop: '1px solid var(--border-light)',
                paddingTop: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '18px',
                fontWeight: '700'
              }}>
                <span>Total Amount (INR)</span>
                <span style={{ color: 'var(--accent-burgundy)' }}>{formatINR(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleStartCheckout}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              Proceed to Demo Checkout <ArrowRight size={18} />
            </button>

            <div style={{
              marginTop: '20px',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} style={{ color: 'var(--accent-green)' }} />
                <span>Simulated Secure Checkout (Academic Mini Project)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={16} style={{ color: 'var(--accent-burgundy)' }} />
                <span>Instant Digital Library access upon order placement</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={ShoppingCart}
          title="Your shopping cart is currently empty"
          description="Explore our rich collection of bestsellers, tech guides, academic textbooks, and classic literature to add items to your cart."
          actionText="Explore Book Catalog"
          actionLink="/"
        />
      )}

      {/* ==================== CHECKOUT MODAL FORM ==================== */}
      {isCheckingOut && (
        <div className="modal-overlay" onClick={() => setIsCheckingOut(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', padding: '36px' }}
          >
            <h2 className="heading-serif" style={{ fontSize: '24px', marginBottom: '8px' }}>
              Complete Your Demo Order
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Enter your shipping details below. All prices and payments are strictly simulated in Indian Rupees (₹).
            </p>

            {/* Simulation disclosure */}
            <div style={{
              backgroundColor: 'var(--accent-gold-light)',
              border: '1px solid var(--accent-gold)',
              borderRadius: '6px',
              padding: '10px 14px',
              fontSize: '12px',
              color: '#785A1D',
              marginBottom: '20px'
            }}>
              <strong>College Project Simulation Notice:</strong> No real bank transactions or card charges are made. Submitting will create genuine orders in MongoDB and automatically grant digital reading access.
            </div>

            <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={address.fullName}
                    onChange={handleAddressChange}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={address.phone}
                    onChange={handleAddressChange}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                  Street Address & Flat / House No. *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={address.street}
                  onChange={handleAddressChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={address.city}
                    onChange={handleAddressChange}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={address.state}
                    onChange={handleAddressChange}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={address.postalCode}
                    onChange={handleAddressChange}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                  Simulated Payment Method
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { id: 'UPI (GPay / PhonePe / Paytm Demo)', icon: Smartphone },
                    { id: 'Credit / Debit Card (Demo Simulated)', icon: CreditCard },
                    { id: 'Net Banking (All Indian Banks Demo)', icon: Building2 }
                  ].map((method) => {
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          border: '1px solid',
                          borderColor: paymentMethod === method.id ? 'var(--accent-burgundy)' : 'var(--border-light)',
                          backgroundColor: paymentMethod === method.id ? 'var(--accent-burgundy-subtle)' : 'var(--bg-secondary)',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          style={{ accentColor: 'var(--accent-burgundy)' }}
                        />
                        <Icon size={16} />
                        <span style={{ fontWeight: paymentMethod === method.id ? '600' : '400' }}>
                          {method.id}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-light)',
                paddingTop: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Payable Amount (INR):</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-burgundy)' }}>
                    {formatINR(grandTotal)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsCheckingOut(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px' }}
                  >
                    {submitting ? 'Confirming Order...' : 'Pay & Confirm Order (Demo)'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setIsCheckingOut(true)}
      />
    </div>
  );
}

