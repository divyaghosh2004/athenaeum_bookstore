# 📚 ATHENAEUM — PROFESSIONAL FULL-STACK ONLINE BOOK STORE
### *Web Development Mini Project — College Laboratory & Academic Showcase*

An authentic, commercial-grade, fully functional Online Book Store and Digital Reader application engineered with **ReactJS (Vite)**, **Node.js**, **Express.js**, and **MongoDB with Mongoose**.

---

## 🌟 Key Highlights

- **Five Fully Functional Core Sections:**
  1. **Home:** Complete catalog with Hero showcase, live MongoDB search across titles/authors/categories, 7 category filters, sorting by price/popularity/recency, and real INR (`₹`) prices.
  2. **Library:** Personal digital library displaying purchased digital editions and claimed public domain books with progress bars and continuation bookmarks.
  3. **Cart:** Dynamic shopping cart with quantity controls, subtotal calculations in Indian Rupees, server-side stock validation, demo checkout simulation, and automatic order creation in MongoDB.
  4. **Offline:** Free Project Gutenberg public-domain books downloadable directly into browser **IndexedDB** for offline reading without an internet connection.
  5. **My Account:** Complete user dashboard with profile editing, profile picture upload, delivery address management, order history with demo transaction IDs, and password updating.
- **Preloaded Catalog with 70 Curated Books:** 10 authentic books in each of the 7 required categories:
  - **Fiction** *(The Alchemist, The Kite Runner, God of Small Things, Train to Pakistan, etc.)*
  - **Mystery** *(The Silent Patient, And Then There Were None, Feluda, Byomkesh Bakshi, etc.)*
  - **Romance** *(Pride and Prejudice, The Fault in Our Stars, Jane Eyre, 2 States, etc.)*
  - **Self-Help** *(Atomic Habits, The Psychology of Money, Think Like a Monk, Deep Work, etc.)*
  - **Technology** *(Clean Code, The Pragmatic Programmer, Eloquent JavaScript, Python Crash Course, etc.)*
  - **Business** *(Rich Dad Poor Dad, Zero to One, The Lean Startup, Shoe Dog, etc.)*
  - **Education** *(Let Us C, Database System Concepts, Computer Fundamentals, Higher Engineering Mathematics, etc.)*
- **Indian Rupee (₹) Pricing Throughout:** Strict compliance with Indian number formatting (e.g. `₹499`, `₹1,299`).
- **Interactive E-Reader:** Built-in in-browser reading modal with adjustable typography (Serif/Sans), font sizing (A-/A+), reading themes (Day Light, Sepia Paper, Night Dark), chapter navigation, and live progress saving.
- **Dual-Mode MongoDB Engine:** Connects to standard local MongoDB or MongoDB Atlas via `MONGODB_URI`. If no local daemon is installed, it seamlessly auto-launches an embedded in-memory MongoDB engine, guaranteeing 100% plug-and-play execution on any machine!

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router v7, Axios, Lucide React, Canvas Confetti, IndexedDB, CSS3 |
| **Backend** | Node.js (ESM), Express.js, MongoDB, Mongoose ODM, JWT (`jsonwebtoken`), bcryptjs, Multer |
| **Offline / PWA** | Web Service Worker (`sw.js`), Web App Manifest (`manifest.json`), IndexedDB |
| **Security** | Express Rate Limiting, bcrypt password hashing, JWT bearer auth, input validation |

---

## 📁 Project Architecture

```
MINI-PROJECT--1-AntiGR/
├── package.json                   # Root orchestrator scripts
├── .env.example                   # Environment variable template
├── README.md                      # Documentation & instructions
│
├── server/
│   ├── config/
│   │   └── db.js                  # MongoDB & Embedded Memory Engine configuration
│   ├── models/
│   │   ├── User.js                # User schema with bcrypt password hashing
│   │   ├── Book.js                # Book schema with category, price in INR & stock
│   │   ├── Cart.js                # Cart schema with price snapshot & quantity
│   │   ├── Order.js               # Order schema with demo transaction IDs
│   │   └── Library.js             # Personal library & reading progress schema
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, GetMe
│   │   ├── bookController.js      # Search, Filters, Categories, Free books
│   │   ├── userController.js      # Profile update & password change
│   │   ├── cartController.js      # Cart CRUD & stock validation
│   │   ├── orderController.js     # Demo checkout, stock decrement, library grant
│   │   └── libraryController.js   # Reading progress & free claim
│   ├── middleware/
│   │   ├── auth.js                # JWT verification & route protection
│   │   ├── upload.js              # Multer profile picture upload handler
│   │   ├── rateLimiter.js         # Auth rate limiting
│   │   └── errorHandler.js        # Centralized HTTP error handler
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth
│   │   ├── bookRoutes.js          # /api/books
│   │   ├── userRoutes.js          # /api/users
│   │   ├── cartRoutes.js          # /api/cart
│   │   ├── orderRoutes.js         # /api/orders
│   │   └── libraryRoutes.js       # /api/library
│   ├── scripts/
│   │   ├── booksData.js           # 70 curated books data (10 per category)
│   │   ├── seedBooks.js           # Idempotent database seeder
│   │   └── testSuite.js           # Automated end-to-end integration test runner
│   ├── uploads/                   # Uploaded user profile photos
│   ├── app.js                     # Express app setup & route mounting
│   ├── server.js                  # Server entry point & auto-seeding
│   └── package.json               # Backend dependencies
│
└── client/
    ├── public/
    │   ├── manifest.json          # PWA manifest
    │   └── sw.js                  # Service Worker for offline app shell caching
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── Navbar.jsx         # 5 Functional sections + mobile menu + search
    │   │   ├── Footer.jsx         # Academic notice + categories + INR badge
    │   │   ├── BookCard.jsx       # Card with cover, badges, price in ₹ & stock
    │   │   ├── BookModal.jsx      # Detail modal with quantity, Buy Now & synopsis
    │   │   ├── BookReaderModal.jsx# Interactive e-reader with font/theme controls
    │   │   ├── AuthModal.jsx      # Sign In & Registration popup
    │   │   ├── LoadingSpinner.jsx # Book-themed spinner
    │   │   └── EmptyState.jsx     # Reusable empty states
    │   ├── context/
    │   │   ├── AuthContext.jsx    # User auth state, JWT management & profile
    │   │   ├── CartContext.jsx    # Cart items, subtotal & server checkout
    │   │   └── ToastContext.jsx   # Non-intrusive notifications
    │   ├── pages/
    │   │   ├── HomePage.jsx       # 1. Hero, Search, 7 Categories, Curated Tabs
    │   │   ├── LibraryPage.jsx    # 2. Personal digital library & progress
    │   │   ├── CartPage.jsx       # 3. Cart & Demo simulated checkout
    │   │   ├── OfflinePage.jsx    # 4. IndexedDB offline downloads & reader
    │   │   └── AccountPage.jsx    # 5. User profile, orders & password change
    │   ├── services/
    │   │   ├── api.js             # Axios client with JWT interceptor
    │   │   └── indexedDB.js       # Native IndexedDB wrapper for offline books
    │   ├── utils/
    │   │   └── currency.js        # Reusable Indian Rupee (₹) formatter
    │   ├── App.jsx                # Router & Provider wrapper
    │   ├── index.css              # Warm linen theme, typography & buttons
    │   └── main.jsx               # React DOM entry point
    ├── index.html                 # Google Fonts (Cinzel, Plus Jakarta Sans)
    ├── vite.config.js             # Vite configuration with /api proxy
    └── package.json               # Frontend dependencies
```

---

## 🚀 Setup & Execution Guide

### Prerequisites
- **Node.js** (v18 or higher recommended; developed and tested on Node v24)
- **npm** (v9 or higher)
- Optional: Local MongoDB Server (if not running, the application automatically runs its embedded in-memory MongoDB engine!)

### Step 1: Install Dependencies
Open a terminal in the root directory and run:
```bash
npm run install:all
```
*(Or navigate to `server` and `client` individually and run `npm install`)*

### Step 2: Seed the Database (Optional — Done Automatically)
The server auto-seeds all 70 books upon initial startup if the catalog is empty. You can also manually trigger seeding:
```bash
npm run seed
```

### Step 3: Run the Application
Open two terminal windows:

**Terminal 1 — Start the Backend Server:**
```bash
npm run server
```
*The server will start at `http://localhost:5000`.*

**Terminal 2 — Start the React Frontend:**
```bash
npm run client
```
*The Vite frontend dev server will start at `http://localhost:5173`.*

Open your browser and navigate to: **`http://localhost:5173`**

---

## 🧪 Automated Testing

The project includes an end-to-end automated test suite verifying every requirement:
```bash
npm test
```

### Verified Test Cases:
- [x] Test 1: Server Health Check (`GET /api/health`)
- [x] Test 2: Full Catalog Retrieval (70 Books across 7 Categories)
- [x] Test 3: Search Functionality by Title/Author/Category
- [x] Test 4: Category Filtering (e.g. Technology: exactly 10 books)
- [x] Test 5: Price Sorting in INR (Ascending & Descending)
- [x] Test 6: Free Public Domain Books Filter
- [x] Test 7: Category Counts Metadata
- [x] Test 8: User Registration & JWT Token Issuance
- [x] Test 9: Authenticated Profile Retrieval (`/api/auth/me`)
- [x] Test 10: Profile & Delivery Address Updates in MongoDB
- [x] Test 11: Cart Addition with Real Stock Validation
- [x] Test 12: Cart Item Quantity Adjustment
- [x] Test 13: Demo Checkout & Order Placement
- [x] Test 14: Safe Stock Decrement in MongoDB
- [x] Test 15: Digital Access Grant to User's Personal Library
- [x] Test 16: Library Reading Progress Synchronization
- [x] Test 17: User Order History Retrieval
- [x] Test 18: Password Hashing & Security Updates

---

## 💳 Demo Payment Simulation Disclosure

In accordance with academic mini project standards, all checkout payments are simulated. Submitting an order creates an official order record in MongoDB with a unique demo transaction ID (`ATH-DEMO-...`), decrements inventory, and grants reading privileges in the user's digital library without charging real financial instruments.

---

## 📄 License & Attribution

- Built for Academic Mini Project submission.
- Public domain e-book excerpts sourced from **Project Gutenberg**.
- Book cover art metadata sourced via **Open Library** and curated literary photography.

