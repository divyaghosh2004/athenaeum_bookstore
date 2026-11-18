import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Lock,
  Edit2,
  Camera,
  Check,
  X,
  MapPin,
  Phone,
  Mail,
  Shield,
  Calendar,
  ExternalLink,
  BookOpen,
  BookDown,
  Download,
  Laptop
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import LoadingSpinner from '../components/LoadingSpinner';
import AuthModal from '../components/AuthModal';
import BookReaderModal from '../components/BookReaderModal';
import { Link } from 'react-router-dom';

export default function AccountPage() {
  const { user, isAuthenticated, updateProfile, changePassword, logout } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'orders', 'ebooks', 'security'
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ebooksList, setEbooksList] = useState([]);
  const [ebooksLoading, setEbooksLoading] = useState(false);
  const [downloadingEbook, setDownloadingEbook] = useState({});
  const [readerOpen, setReaderOpen] = useState(false);
  const [readerBook, setReaderBook] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Password change state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // Populate form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        street: user.deliveryAddress?.street || '',
        city: user.deliveryAddress?.city || '',
        state: user.deliveryAddress?.state || '',
        postalCode: user.deliveryAddress?.postalCode || '',
        country: user.deliveryAddress?.country || 'India'
      });
      setAvatarPreview(user.profilePicture || '');
    }
  }, [user]);

  // Fetch orders
  const fetchOrders = async () => {
    if (!isAuthenticated) return;
    setOrdersLoading(true);
    try {
      const res = await api.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.warn('Orders fetch error:', err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'ebooks') {
      fetchMyEbooks();
    }
  }, [activeTab, isAuthenticated]);

  // Fetch user's digital books & downloaded books
  const fetchMyEbooks = async () => {
    setEbooksLoading(true);
    try {
      const libraryBooks = [];
      if (isAuthenticated) {
        try {
          const res = await api.get('/library');
          if (res.data.success && res.data.library?.items) {
            libraryBooks.push(...res.data.library.items.map(it => it.book).filter(Boolean));
          }
        } catch {
          // Library fetch fallback
        }
      }

      const localDownloads = JSON.parse(localStorage.getItem('athenaeum_downloaded_ebooks') || '[]');

      const bookMap = new Map();
      for (const b of libraryBooks) {
        bookMap.set(b._id, {
          _id: b._id,
          title: b.title,
          author: b.author,
          coverImage: b.coverImage,
          category: b.category,
          description: b.description,
          source: 'Personal Digital Library'
        });
      }
      for (const d of localDownloads) {
        if (!bookMap.has(d.bookId)) {
          bookMap.set(d.bookId, {
            _id: d.bookId,
            title: d.title,
            author: d.author,
            coverImage: d.coverImage,
            category: d.category,
            description: d.description,
            downloadedAt: d.downloadedAt,
            format: d.format,
            source: 'Downloaded to Device'
          });
        }
      }

      setEbooksList(Array.from(bookMap.values()));
    } catch (err) {
      console.warn('Failed to fetch user ebooks:', err);
    } finally {
      setEbooksLoading(false);
    }
  };

  const handleDownloadEbook = async (book, format = 'pdf') => {
    const key = `${book._id}-${format}`;
    setDownloadingEbook(prev => ({ ...prev, [key]: true }));

    try {
      const res = await api.get(`/books/${book._id}/download?format=${format}`, {
        responseType: 'blob'
      });

      const mimeType = format === 'epub' ? 'application/epub+zip' : 'application/pdf';
      const blob = new Blob([res.data], { type: mimeType });
      const downloadUrl = window.URL.createObjectURL(blob);

      const safeTitle = (book.title || 'ebook').replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_');
      const filename = `${safeTitle}.${format}`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`"${book.title}" (${format.toUpperCase()}) downloaded again to your device!`);
    } catch (err) {
      console.error(err);
      toast.error(`Download failed. Please check your connection.`);
    } finally {
      setDownloadingEbook(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleProfileInputChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('profilePicture', avatarFile);
        formData.append('name', profileForm.name);
        formData.append('email', profileForm.email);
        formData.append('phone', profileForm.phone);
        formData.append('street', profileForm.street);
        formData.append('city', profileForm.city);
        formData.append('state', profileForm.state);
        formData.append('postalCode', profileForm.postalCode);
        formData.append('country', profileForm.country);
        await updateProfile(formData);
      } else {
        await updateProfile(profileForm);
      }
      setIsEditing(false);
      toast.success('Profile updated successfully in MongoDB!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEditing = () => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        street: user.deliveryAddress?.street || '',
        city: user.deliveryAddress?.city || '',
        state: user.deliveryAddress?.state || '',
        postalCode: user.deliveryAddress?.postalCode || '',
        country: user.deliveryAddress?.country || 'India'
      });
      setAvatarPreview(user.profilePicture || '');
      setAvatarFile(null);
    }
    setIsEditing(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{
          maxWidth: '460px',
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
            <User size={32} />
          </div>
          <h2 className="heading-serif" style={{ fontSize: '24px', marginBottom: '8px' }}>
            My Account & Profile
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
            Sign in to manage your delivery address, inspect past orders and simulated demo receipts, or update your account security.
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '12px 32px' }}
          >
            Sign In or Register
          </button>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-burgundy)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '700',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {avatarPreview ? (
              <img src={avatarPreview} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div>
            <h1 className="heading-serif" style={{ fontSize: '26px' }}>
              {user.name}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} • {user.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ fontSize: '13px', color: '#DC2626' }}
        >
          Sign Out of Account
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '28px',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '12px'
      }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'profile' ? 'var(--accent-burgundy)' : 'transparent',
            color: activeTab === 'profile' ? '#FFF' : 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <User size={16} /> Personal Profile
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'orders' ? 'var(--accent-burgundy)' : 'transparent',
            color: activeTab === 'orders' ? '#FFF' : 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <ShoppingBag size={16} /> My Orders
        </button>

        <button
          onClick={() => setActiveTab('ebooks')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'ebooks' ? 'var(--accent-burgundy)' : 'transparent',
            color: activeTab === 'ebooks' ? '#FFF' : 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <BookDown size={16} /> My E-Books ({ebooksList.length})
        </button>

        <button
          onClick={() => setActiveTab('security')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'security' ? 'var(--accent-burgundy)' : 'transparent',
            color: activeTab === 'security' ? '#FFF' : 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <Lock size={16} /> Password & Security
        </button>
      </div>

      {/* ================= TAB 1: PROFILE ================= */}
      {activeTab === 'profile' && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-sm)',
          padding: '32px',
          maxWidth: '760px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '16px'
          }}>
            <div>
              <h2 className="heading-serif" style={{ fontSize: '20px' }}>
                Account Information
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Your personal credentials and default delivery destination for orders
              </p>
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-outline"
                style={{ fontSize: '13px' }}
              >
                <Edit2 size={15} /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  className="btn btn-secondary"
                  style={{ fontSize: '13px' }}
                >
                  <X size={15} /> Cancel
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Avatar upload */}
            {isEditing && (
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: 'var(--border-medium)'
                }}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={30} style={{ margin: '13px' }} />
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                    Upload New Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ fontSize: '12px' }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="name"
                    required
                    disabled={!isEditing}
                    value={profileForm.name}
                    onChange={handleProfileInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-medium)',
                      backgroundColor: isEditing ? 'var(--bg-card)' : 'var(--bg-secondary)',
                      fontSize: '14px'
                    }}
                  />
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={!isEditing}
                    value={profileForm.email}
                    onChange={handleProfileInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-medium)',
                      backgroundColor: isEditing ? 'var(--bg-card)' : 'var(--bg-secondary)',
                      fontSize: '14px'
                    }}
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                Contact Phone
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  name="phone"
                  disabled={!isEditing}
                  placeholder="+91 98765 43210"
                  value={profileForm.phone}
                  onChange={handleProfileInputChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: isEditing ? 'var(--bg-card)' : 'var(--bg-secondary)',
                    fontSize: '14px'
                  }}
                />
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Delivery address section */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <MapPin size={18} style={{ color: 'var(--accent-burgundy)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: '600' }}>
                  Default Delivery Address
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                    Street Address & House / Apartment
                  </label>
                  <input
                    type="text"
                    name="street"
                    disabled={!isEditing}
                    placeholder="e.g. 42 Heritage Park Lane"
                    value={profileForm.street}
                    onChange={handleProfileInputChange}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-medium)',
                      backgroundColor: isEditing ? 'var(--bg-card)' : 'var(--bg-secondary)',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      disabled={!isEditing}
                      placeholder="e.g. New Delhi"
                      value={profileForm.city}
                      onChange={handleProfileInputChange}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-medium)',
                        backgroundColor: isEditing ? 'var(--bg-card)' : 'var(--bg-secondary)',
                        fontSize: '13px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      disabled={!isEditing}
                      placeholder="e.g. Delhi NCR"
                      value={profileForm.state}
                      onChange={handleProfileInputChange}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-medium)',
                        backgroundColor: isEditing ? 'var(--bg-card)' : 'var(--bg-secondary)',
                        fontSize: '13px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                      PIN Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      disabled={!isEditing}
                      placeholder="e.g. 110001"
                      value={profileForm.postalCode}
                      onChange={handleProfileInputChange}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-medium)',
                        backgroundColor: isEditing ? 'var(--bg-card)' : 'var(--bg-secondary)',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px' }}
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ================= TAB 2: MY ORDERS ================= */}
      {activeTab === 'orders' && (
        <div>
          {ordersLoading ? (
            <LoadingSpinner text="Fetching your orders from MongoDB..." />
          ) : orders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '860px' }}>
              {orders.map((ord) => (
                <div
                  key={ord._id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-medium)',
                    boxShadow: 'var(--shadow-sm)',
                    padding: '24px'
                  }}
                >
                  {/* Order header row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    borderBottom: '1px solid var(--border-light)',
                    paddingBottom: '14px',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        ORDER PLACED: {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '2px' }}>
                        Ref #{ord._id?.slice(-8).toUpperCase()}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>TOTAL AMOUNT:</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-burgundy)' }}>
                        {formatINR(ord.totalAmount)}
                      </div>
                    </div>

                    <div>
                      <span className="badge" style={{ backgroundColor: 'var(--accent-green-subtle)', color: 'var(--accent-green)' }}>
                        {ord.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Purchased items list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    {ord.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '44px',
                          height: '64px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 className="heading-serif" style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.title}
                          </h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            By {item.author} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--accent-burgundy)' }}>
                          {formatINR(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer with demo txn info & library link */}
                  <div style={{
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <span>Demo Txn: <code>{ord.demoTransactionId}</code> ({ord.demoPaymentStatus})</span>
                    <Link to="/library" className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>
                      <BookOpen size={14} /> Open in Digital Library
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--bg-card)',
              padding: '48px 24px',
              borderRadius: '10px',
              border: '1px dashed var(--border-medium)',
              textAlign: 'center',
              maxWidth: '640px'
            }}>
              <ShoppingBag size={40} style={{ color: 'var(--accent-burgundy)', marginBottom: '14px' }} />
              <h3 className="heading-serif" style={{ fontSize: '18px', marginBottom: '8px' }}>
                No past orders found
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                When you check out books, your orders and demo transaction records will be securely recorded here.
              </p>
              <Link to="/" className="btn btn-primary">
                Explore Bookstore
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB: MY E-BOOKS ================= */}
      {activeTab === 'ebooks' && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h2 className="heading-serif" style={{ fontSize: '22px', marginBottom: '4px' }}>
                My E-Books & Downloaded Volumes
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Your personal digital books and offline editions. Download PDF or EPUB files to your computer anytime.
              </p>
            </div>

            <Link to="/ebooks" className="btn btn-secondary" style={{ fontSize: '13px' }}>
              <BookDown size={15} /> Browse More E-Books
            </Link>
          </div>

          {ebooksLoading ? (
            <LoadingSpinner text="Retrieving your digital volumes..." />
          ) : ebooksList.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {ebooksList.map((item) => {
                const isDownloadingPdf = downloadingEbook[`${item._id}-pdf`];
                const isDownloadingEpub = downloadingEbook[`${item._id}-epub`];

                return (
                  <div
                    key={item._id}
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
                      <Link
                        to={`/book/${item._id}`}
                        style={{
                          width: '80px',
                          height: '115px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          boxShadow: 'var(--shadow-book)'
                        }}
                      >
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Link>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span className="badge badge-category" style={{ marginBottom: '6px', display: 'inline-block' }}>
                          {item.category}
                        </span>

                        <Link to={`/book/${item._id}`} style={{ textDecoration: 'none' }}>
                          <h3 className="heading-serif" style={{
                            fontSize: '15px',
                            color: 'var(--text-primary)',
                            marginBottom: '4px',
                            lineHeight: '1.3',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {item.title}
                          </h3>
                        </Link>

                        <p style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          marginBottom: '8px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.author}
                        </p>

                        <div style={{
                          fontSize: '11px',
                          color: 'var(--accent-green)',
                          fontWeight: '600',
                          backgroundColor: 'var(--accent-green-subtle)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          width: 'fit-content'
                        }}>
                          ✓ {item.source || 'Authorized Digital Access'}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Download PDF / EPUB */}
                    <div style={{
                      marginTop: 'auto',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleDownloadEbook(item, 'pdf')}
                          disabled={isDownloadingPdf}
                          className="btn btn-primary"
                          style={{ padding: '8px 10px', fontSize: '12px', fontWeight: '600', borderRadius: '6px' }}
                          title="Download PDF file to your laptop or PC"
                        >
                          <Download size={13} /> {isDownloadingPdf ? 'Saving...' : 'Download PDF'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadEbook(item, 'epub')}
                          disabled={isDownloadingEpub}
                          className="btn btn-secondary"
                          style={{ padding: '8px 10px', fontSize: '12px', fontWeight: '600', borderRadius: '6px', border: '1px solid var(--border-medium)' }}
                          title="Download EPUB file to your laptop or PC"
                        >
                          <Download size={13} /> {isDownloadingEpub ? 'Saving...' : 'Download EPUB'}
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setReaderBook(item);
                            setReaderOpen(true);
                          }}
                          className="btn btn-outline"
                          style={{ padding: '6px 8px', fontSize: '11px', borderRadius: '6px' }}
                        >
                          <BookOpen size={13} /> Read Online
                        </button>

                        <Link
                          to={`/book/${item._id}`}
                          className="btn btn-secondary"
                          style={{ padding: '6px 8px', fontSize: '11px', borderRadius: '6px', textAlign: 'center' }}
                        >
                          <ExternalLink size={13} /> Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--bg-card)',
              padding: '48px 24px',
              borderRadius: '10px',
              border: '1px dashed var(--border-medium)',
              textAlign: 'center',
              maxWidth: '640px'
            }}>
              <BookDown size={40} style={{ color: 'var(--accent-burgundy)', marginBottom: '14px' }} />
              <h3 className="heading-serif" style={{ fontSize: '18px', marginBottom: '8px' }}>
                No E-Books in your account yet
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Browse our comprehensive digital library to download PDF and EPUB books directly to your PC, laptop, or mobile reader.
              </p>
              <Link to="/ebooks" className="btn btn-primary">
                Explore Digital E-Books
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: SECURITY ================= */}
      {activeTab === 'security' && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-sm)',
          padding: '32px',
          maxWidth: '560px'
        }}>
          <h2 className="heading-serif" style={{ fontSize: '20px', marginBottom: '8px' }}>
            Change Password
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Keep your account secure by updating your password periodically.
          </p>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                Current Password *
              </label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                New Password * (Min. 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '14px'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="btn btn-primary"
              style={{ marginTop: '8px', padding: '12px' }}
            >
              {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Interactive E-Reader Modal */}
      <BookReaderModal
        book={readerBook}
        isOpen={readerOpen}
        onClose={() => setReaderOpen(false)}
      />
    </div>
  );
}

