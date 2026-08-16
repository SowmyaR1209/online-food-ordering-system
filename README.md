# BiteDash — Food Delivery & Razorpay Checkout Platform

A modern, full-stack food delivery web application inspired by Swiggy and Zomato, featuring real-time order tracking, comprehensive user authentication, interactive menus, and Razorpay payment gateway integration.

---

## 🌟 Key Features

- **Restaurant & Menu Explorer**:
  - Filter restaurants by cuisine (Indian, Biryani, Pizza, Asian, Fast Food, Healthy, Desserts, Beverages).
  - Search across restaurant names, dishes, tags, and locations.
  - Dietary filters: Pure Veg, Non-Veg, High-Rated (4.5+ ★), Quick Delivery (<30 mins), and Free Delivery.
  - Sorting by rating, delivery speed, and minimum order cost.

- **Interactive Cart & Smart Checkout**:
  - Add items with real-time quantity modifiers, customization notes, and restaurant mismatch protection.
  - Multi-address manager with custom labels (Home, Work, Office, Other) and default selections.
  - Coupon promo code engine (e.g., `BITE50`, `WELCOME`, `FREESHIP`).
  - Transparent itemized billing with GST, packaging charges, delivery fee, and instant discounts.

- **Razorpay Payment Gateway Integration**:
  - **Standard Gateway Launcher**: Opens the official Razorpay Checkout popup (`checkout.js`) with support for test and live credentials.
  - **Direct Sandbox Gateway**: Built-in 1-click test checkout supporting UPI (Google Pay, PhonePe, Paytm), Test Debit/Credit Cards, Netbanking (HDFC, ICICI, SBI, Axis), and Digital Wallets.
  - **Secure Verification**: Server-side HMAC SHA256 payment signature verification (`POST /api/payments/verify`).
  - Strict server-side secret management (`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` hidden from client code).

- **Live Order Tracking Dashboard**:
  - 5-stage real-time delivery lifecycle with progress indicator:
    1. *Order Placed* → 2. *Restaurant Preparing* → 3. *Rider Assigned* → 4. *Out for Delivery* → 5. *Delivered*.
  - Live simulation clock with auto-advancing status updates every 10 seconds.
  - Delivery partner details, vehicle tracking card, and direct contact buttons.
  - Live rider simulation route map with ETA calculations.

- **Authentication & User Management**:
  - Tabbed modal for **Login** and **Sign Up** (with full name, email, password, phone, and role selection).
  - 1-Click quick login buttons for demo accounts:
    - **Customer**: `alex.morgan@example.com` (`password123`)
    - **Admin / Partner**: `admin@bitedash.com` (`admin123`)
  - Account switching and session management with local persistence.

- **Admin & Partner Analytics Portal**:
  - Real-time revenue metrics, gross merchandise value (GMV), active delivery fleet status, and customer satisfaction index.
  - Live order management dashboard: update order statuses, filter by state, or cancel orders.
  - Top-selling dishes breakdown with volume metrics and revenue charts.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Backend / API**: Node.js, Express, TypeScript (`tsx`)
- **Payments**: Razorpay Node SDK & Razorpay Standard Checkout (`checkout.js`)
- **Tooling & Build**: Vite, esbuild

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ installed on your machine
- npm or yarn package manager

### 2. Environment Configuration
Create a `.env` file in the project root:

```env
# Server Port (Defaults to 3000)
PORT=3000

# Razorpay API Credentials (Optional for live transactions; built-in sandbox is enabled by default)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# Hot Module Replacement toggle (default disabled in container sandboxes)
DISABLE_HMR=true
```

### 3. Installation
Install project dependencies:

```bash
npm install
```

### 4. Running the Development Server
Start both the Express API backend and Vite client:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### 5. Production Build
Compile frontend static assets and bundle the server into `dist/server.cjs`:

```bash
npm run build
npm start
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/restaurants` | List restaurants with search, cuisine, and filter parameters |
| `GET` | `/api/restaurants/:id` | Get restaurant details and full categorized menu |
| `GET` | `/api/orders` | Fetch user orders or all system orders |
| `POST` | `/api/orders` | Place a new order and generate a Razorpay order |
| `POST` | `/api/payments/verify` | Verify Razorpay payment signature & confirm order |
| `PATCH` | `/api/orders/:id/status` | Update delivery status (Admin / System simulation) |
| `POST` | `/api/auth/signup` | Register new customer or admin account |
| `POST` | `/api/auth/login` | Authenticate existing user |
| `GET` | `/api/auth/me` | Fetch active user session & addresses |
| `POST` | `/api/users/address` | Save new delivery address |

---

## 🔒 Security & Privacy

- Secret keys (`RAZORPAY_KEY_SECRET`) are kept strictly on the backend server.
- All checkout callbacks are validated against HMAC SHA256 cryptographic signatures before updating database order states to `PAID`.
- No sensitive keys or tokens are rendered in public UI footers or client bundles.

---

## 📄 License
MIT License. Free for educational and commercial use.
