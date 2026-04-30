# ⚡ RapidRush — Professional On-Demand Delivery App

A full-stack **MERN** delivery platform — Swiggy/Zomato/DoorDash level UI with local JSON file storage.

---

## 🚀 Quick Start

```bash
# Terminal 1 — Backend
cd ondemand/backend
npm install
npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd ondemand/frontend
npm install --legacy-peer-deps
npm start
# → http://localhost:3000
```

---

## ✨ Features

### 🏠 Home
- Animated hero with live order status card
- Rolling offer banner with auto-rotation
- 10 food category quick-picks
- Sort by Rating / Fastest / Cost
- Veg-only toggle filter
- Promoted & regular restaurant grids
- "How it works" section

### 🍽️ Restaurant Page
- Category sidebar with item counts
- Veg/Non-veg indicators per item
- Calorie & prep-time badges
- Bestseller highlights
- Reviews tab
- Floating cart bar with total

### 🛒 Cart
- Full bill breakdown (item total, delivery, GST, platform fee)
- Live coupon validation
- 4 payment methods (Cash, UPI, Card, Wallet)
- Delivery instructions field
- Saved addresses support
- Loyalty points preview

### 📦 Orders
- Tabbed: All / Active / Delivered / Cancelled
- Order history with status badges

### 🔴 Order Tracking
- 5-step live animated tracker
- Auto-polls every 5 seconds
- Order timeline log with timestamps
- Assigned rider card with call & track buttons

### 🛵 Rider Tracker
- SVG map with real coordinate plotting
- Animated delivery route with glowing line
- Distance (Haversine formula) + ETA
- Filter riders by status
- Nearest rider indicator
- Replay animation button

### 🏷️ Offers Page
- 6 coupon cards with one-click copy
- Colour-coded by type
- Max discount display
- "How to use" guide

### 👤 Profile
- Bronze/Silver/Gold loyalty tiers with perks
- Animated progress bar to next tier
- Saved addresses manager
- 2-step registration

### 🔍 Search
- Live global search from Navbar
- Searches restaurants AND individual dishes
- Debounced for performance

---

## 🗂 Structure

```
ondemand/
├── backend/
│   ├── controllers/index.js   (all controllers in one)
│   ├── middleware/localDB.js   (JSON storage + full seed data)
│   ├── middleware/auth.js
│   ├── routes/index.js
│   ├── data/                  (auto-generated JSON files)
│   └── server.js
│
└── frontend/src/
    ├── components/  Navbar, ProtectedRoute
    ├── context/     AuthContext, CartContext
    ├── pages/       Home, RestaurantPage, Cart, Orders,
    │                OrderDetail, Auth, Profile, OffersPage, RidersPage
    └── utils/       api.js
```

---

## 🍔 Seed Data
- **7 Restaurants**, **88 menu items** across 6 cuisines
- **6 Riders** with real GPS coordinates
- **6 Coupon codes**: FIRST50, SAVE100, FREEDEL, WEEKEND20, NEWUSER, FLASH30
- **10 Food categories**

---

## 💳 Coupon Codes to Try
| Code | Discount |
|------|----------|
| FIRST50 | 50% off (max ₹150) |
| SAVE100 | ₹100 flat off |
| FREEDEL | Free delivery |
| WEEKEND20 | 20% off (max ₹80) |
| NEWUSER | 60% off (max ₹200) |
| FLASH30 | 30% off (max ₹90) |
