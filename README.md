# 👗 AI Fashion Stylist Pro

A full-stack AI-powered personal fashion assistant web application built for Indian users. Upload your outfit, pick your occasion and budget, and get intelligent style recommendations with direct shopping links to Amazon, Flipkart, and Meesho — all powered by a TensorFlow/Keras backend and a clean vanilla JS frontend.

---

## 🌐 Live Demo

> **Frontend:** Deployed as a static site (Vercel / Render Static)  
> **Backend API:** `https://ai-fashion-stylist-pro-production-5bde.up.railway.app`  
> **Deployment Guide:** See the Render section below

---

## ✨ Features

### 🤖 AI Outfit Analyser
- Upload a clothing image and get ranked outfit recommendations
- Detects garment type with confidence score
- Optional skin tone & face analysis
- Context-aware results based on occasion, climate, body type, and budget
- Shopping links for every recommended item (Amazon, Flipkart, Meesho)

### 🎯 Occasion Solver
- 6 occasions: College, Office, Interview, Wedding, Casual, Date Night
- Men's and Women's specific outfit suggestions
- Real-time weather-aware tips via Open-Meteo API (no API key needed)
- Complete accessories, footwear, colour palette, and budget guide per occasion

### 💰 Budget Stylist
- Pre-curated outfit combos for ₹500, ₹1000, ₹3000, and custom budget
- Filter by gender (Men's / Women's / All)
- Direct shopping buttons for Amazon, Flipkart, and Meesho
- Indian-context outfits (kurtas, lehengas, sherwanis, co-ords)

### 🪞 Virtual Try-On
- Browser-based canvas overlay try-on — no server upload
- 6 outfit types: Kurta, Formal Suit, Casual Tee, Saree, Lehenga, Western Dress
- Download result as PNG
- Privacy-first: photo never leaves the browser

### 👗 Smart Wardrobe
- Add, view, filter, and remove wardrobe items
- Filter by category (Top, Bottom, Footwear, Accessories), ownership, and wishlist
- View details modal with direct "Order Now" buttons per store
- Wardrobe stats (total, owned, wishlist)

### 📊 Personal Dashboard
- Live weather widget with style tip (via geolocation + Open-Meteo)
- Wardrobe & activity stats
- Quick-access links to all features
- Personalized greeting based on time of day

### 🔐 Authentication
- Email/password registration and login with JWT
- Magic link (passwordless) login support
- User profile with body type, lifestyle, and budget preferences
- Persistent sessions via localStorage
- Shared auth UI across all pages via `auth-ui.js`

### 💬 AI Chat Stylist Widget
- Floating chat assistant present on every page
- Rule-based responses for outfit ideas, budget, occasions, weather, wardrobe
- Quick-reply buttons for common queries
- Zero external API dependency — fully self-contained

### ⭐ Premium Plans
- Free / Premium (₹199/mo) / Pro (₹499/mo) tiers defined
- Waitlist signup stored in localStorage (Razorpay integration planned)
- Full feature comparison table

---

## 🛠️ Tech Stack

### Frontend
| Technology | Usage |
|---|---|
| Vanilla HTML / CSS / JS | All pages — no framework |
| ES Modules | `import`/`export` across all JS files |
| Canvas API | Virtual try-on overlay rendering |
| Geolocation API | Weather-based styling on dashboard |
| localStorage | Auth state, wardrobe cache, activity log |
| Google Fonts | Playfair Display + Outfit |

### Backend
| Technology | Usage |
|---|---|
| Python / Flask | REST API server |
| TensorFlow / Keras | Clothing image classification (CNN) |
| Gunicorn | WSGI production server |
| Flask-CORS | Cross-origin requests from frontend |
| Railway | Backend hosting |

### External APIs
| API | Usage |
|---|---|
| Open-Meteo | Free real-time weather (no API key required) |
| UI Avatars | User avatar generation |
| Amazon / Flipkart / Meesho | Shopping search URL generation |

---

## 📁 Project Structure

```
/
├── index.html               # Home — hero, AI stylist, features, FAQ
├── dashboard.html           # Personal dashboard with weather & stats
├── occasion-solver.html     # Occasion-based outfit picker
├── budget-stylist.html      # Budget-filtered outfit browser
├── virtual-tryon.html       # Canvas-based virtual try-on
├── wardrobe.html            # Wardrobe manager with order buttons
├── premium.html             # Pricing plans & feature comparison
├── login.html               # Login / Register with tab toggle
│
├── css/
│   └── main.css             # Global design system (CSS vars, all components)
│
├── js/
│   ├── script.js            # Main AI stylist (upload, predict, results)
│   ├── auth.js              # Auth module (login, register, JWT, wardrobe API)
│   ├── auth-ui.js           # Shared header auth UI (avatar, dropdown, logout)
│   ├── app.js               # App initializer (nav + styler bootstrap)
│   ├── chat.js              # Floating AI chat widget (self-contained)
│   ├── dashboard.js         # Dashboard logic (weather, stats, activity)
│   ├── occasion-solver.js   # Occasion → outfit data & rendering
│   ├── budget-stylist.js    # Budget outfit data & filter logic
│   ├── virtual-tryon.js     # Canvas try-on engine
│   └── weather.js           # Open-Meteo weather fetcher
│
├── auth.js                  # Root-level auth module (for root-relative imports)
│
├── assets/
│   └── images/              # Static images (model photos, video poster)
│
└── backend/                 # Python Flask + TensorFlow backend
    ├── app.py               # Flask app with /predict, /health, /auth, /wardrobe
    └── requirements.txt     # Python dependencies (includes gunicorn, tensorflow)
```

---

## 🚀 Getting Started

### Frontend (Static)

No build step required. Serve with any static server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# VS Code
# Right-click index.html → "Open with Live Server"
```

### Backend (Flask + TensorFlow)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Development server
python app.py

# Production server
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

The API will be available at `http://localhost:5000`.

---

## 🚢 Deploying to Render

### Backend Web Service

| Setting | Value |
|---|---|
| Language | Python 3 |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn -w 4 -b 0.0.0.0:$PORT app:app` |
| Instance Type | Free (testing) or Starter $7/mo (production) |

**Optional environment variables:**
```
FLASK_ENV=production
DEBUG=False
```

After deployment you'll get a URL like: `https://ai-fashion-stylist-pro.onrender.com`

### Frontend Static Site

Deploy the root folder as a Render Static Site, Vercel, or Netlify project. No build command needed — it's pure HTML/CSS/JS.

---

## ⚙️ Configuration

### Updating the API URL

Two files reference the backend URL and must be updated after deploying:

```js
// auth.js  AND  js/auth.js
const API_BASE_URL = 'https://your-backend.up.railway.app/';

// js/script.js
const API_URL = 'https://your-backend.up.railway.app/predict';
```

### Weather

No configuration needed. The app uses [Open-Meteo](https://open-meteo.com/) which is entirely free with no API key. It requests the user's location via `navigator.geolocation` and falls back gracefully if permission is denied.

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/predict` | Optional | Analyse clothing image, return outfit recommendations |
| GET | `/health` | None | Health check |
| POST | `/auth/register` | None | Register a new user |
| POST | `/auth/login` | None | Login, returns JWT token |
| POST | `/auth/magic-link` | None | Send passwordless magic link |
| POST | `/auth/verify-magic` | None | Verify magic link token |
| PUT | `/auth/profile` | Bearer | Update user profile |
| POST | `/wardrobe/add` | Bearer | Add item to wardrobe |
| GET | `/wardrobe/items` | Bearer | List wardrobe items (supports filters) |
| DELETE | `/wardrobe/remove/:id` | Bearer | Remove a wardrobe item |
| PUT | `/wardrobe/mark-owned/:id` | Bearer | Toggle owned/wishlist status |
| GET | `/wardrobe/stats` | Bearer | Wardrobe statistics summary |
| GET | `/insights/gaps` | Bearer | Wardrobe gap analysis |
| GET | `/insights/balance` | Bearer | Wardrobe balance report |

All authenticated endpoints expect: `Authorization: Bearer <jwt_token>`

---

## 🔑 Authentication Flow

```
Register / Login ──→ JWT Token stored in localStorage
        ↓
API calls include: Authorization: Bearer <token>
        ↓
Auth state changes fire: window.dispatchEvent('authStateChanged')
        ↓
initAuthUI() on every page subscribes → updates header nav
```

The `auth-ui.js` module manages header navigation state (Login button vs user avatar + dropdown) consistently across all pages. Any new page should import and call `initAuthUI()` in its module.

---

## 🎨 Design System

All styling is in `css/main.css` using CSS custom properties:

```css
:root {
  --primary-color:  #2d1b4e;   /* Deep purple */
  --accent-color:   #d4af37;   /* Gold */
  --font-heading:   'Playfair Display', serif;
  --font-body:      'Outfit', sans-serif;
  /* Shadow scale: --shadow-sm → --shadow-xl */
  /* Spacing scale: --spacing-xs (8px) → --spacing-3xl (96px) */
  /* Radius scale:  --border-radius-sm (8px) → --border-radius-xl (32px) */
}
```

Dark mode is supported via `[data-theme="dark"]` toggled by the theme button on `index.html`.

---

## 🌦️ Weather Integration

Uses [Open-Meteo](https://open-meteo.com/en/docs) — free, no signup, no API key:

```js
// js/weather.js
const url = `https://api.open-meteo.com/v1/forecast
  ?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
```

WMO weather codes are mapped to style tips: sunny → light cotton, rainy → waterproof jacket, cold → layered wool, hot → linen/rayon.

---

## 🛍️ Shopping Integration

Shopping links are constructed as search URLs so they always return current products:

```js
amazon:   `https://www.amazon.in/s?k=${query}`
flipkart: `https://www.flipkart.com/search?q=${query}`
meesho:   `https://www.meesho.com/search?q=${query}`
```

The wardrobe order modal additionally supports Myntra, Ajio, and Tata CLiQ for item-level ordering.

---

## 🚧 Known Limitations

- **Free Render tier** spins down after 15 minutes of inactivity — first request after sleep may take 30–60 seconds.
- **TensorFlow** build is heavy (~5–10 min on Render free tier due to large dependencies).
- **Virtual Try-On** is a CSS/canvas colour overlay preview, not a true body-mapped AI try-on (planned for Premium tier).
- **Payment integration** (Razorpay) is not yet live — Premium signup only stores to localStorage as a waitlist.
- **Magic link** delivery requires email configuration in `backend/app.py`.

---

## 📜 Scripts & Commands

| Command | Description |
|---|---|
| `python app.py` | Start Flask development server |
| `gunicorn -w 4 -b 0.0.0.0:$PORT app:app` | Start production server |
| `pip install -r requirements.txt` | Install Python dependencies |
| `npx serve .` | Serve frontend locally |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
  Built with ❤️ for Indian fashion lovers · Powered by <strong>AI Fashion Stylist Pro</strong>
  <br><br>
  TensorFlow · Keras · Flask · Vanilla JS · Open-Meteo · Canvas API
</div>
