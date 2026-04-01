# 📊 StockScope — India Stock Screener

Pure frontend React app. No backend. Works 100% on Netlify.

---

## 📁 Folder Structure

```
stockscope/               ← Push this entire folder to GitHub
├── public/
│   ├── index.html
│   └── _redirects        ← Fixes Netlify 404s
├── src/
│   ├── App.js
│   ├── index.js
│   ├── index.css
│   ├── data/
│   │   └── stocks.js     ← 100+ stocks, embedded (no backend needed)
│   ├── components/
│   │   ├── FilterBuilder.jsx
│   │   ├── StockTable.jsx
│   │   ├── Charts.jsx
│   │   └── SavedScreeners.jsx
│   └── utils/
│       ├── filterEngine.js   ← All filtering + localStorage screeners
│       ├── constants.js      ← Presets, colors, fields
│       └── exportCSV.js
├── netlify.toml          ← Netlify build config
└── package.json
```

---

## 🚀 Deploy to Netlify via GitHub

### Step 1 — Push to GitHub
```bash
cd stockscope
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stockscope.git
git push -u origin main
```

### Step 2 — Connect to Netlify
1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
2. Choose **GitHub** and select your `stockscope` repo
3. Netlify will auto-detect settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
4. Click **Deploy site** ✅

That's it. No environment variables, no backend needed.

---

## 💻 Run Locally

```bash
npm install
npm start
# → http://localhost:3000
```

---

## ✨ Features

- **100+ Indian stocks** embedded in the app (no API calls)
- **Dynamic filter builder** — add/remove conditions, field + operator + value
- **AND / OR logic** toggle
- **6 preset screens** — Undervalued, High Growth, High Dividend, Low Debt, etc.
- **Sortable columns** — click any header
- **Pagination** — 10 / 25 / 50 per page
- **Save screeners** — stored in browser `localStorage`, persists across sessions
- **Charts tab** — Sector Pie + Market Cap Bar + Top Performers
- **CSV export** — download filtered results
- **Color-coded cells** — green/red for ROE, D/E, EPS growth, P/E
