import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import BookProductPage from './pages/BookProductPage';
import LibraryPage from './pages/LibraryPage';
import CartPage from './pages/CartPage';
import EBooksPage from './pages/EBooksPage';
import AccountPage from './pages/AccountPage';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/book/:id" element={<BookProductPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/ebooks" element={<EBooksPage />} />
                  <Route path="/offline" element={<Navigate to="/ebooks" replace />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

