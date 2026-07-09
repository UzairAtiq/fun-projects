# 🚀 Vercel Configuration Guide: Static Frontend Only

## ❌ The Error Explained

**Error Message:**
```
If `rewrites`, `redirects`, `headers`, `cleanUrls` or `trailingSlash` are used, 
then `routes` cannot be present.
```

**Why This Happens:**
Vercel has two routing systems that **cannot coexist**:

| System | Status | Options |
|--------|--------|---------|
| **Legacy** | ⛔️ Deprecated | `routes`, `builds` |
| **Modern** | ✅ Current | `rewrites`, `redirects`, `headers`, `cleanUrls`, `trailingSlash` |

When you use `headers` (modern) + `routes` (legacy), Vercel throws this error.

---

## 🔍 What Was Wrong in Your vercel.json

**❌ INCORRECT** (causes error):
```json
{
  "version": 2,           // ❌ Unnecessary
  "name": "...",          // ❌ Unnecessary  
  "builds": [...],        // ❌ Legacy, not needed for static
  "routes": [...],        // ❌ LEGACY - Conflicts with headers!
  "headers": [...]        // ✅ Modern
}
```

**Problems:**
1. `routes` - Legacy system, conflicts with `headers`
2. `builds` - Not needed; Vercel auto-detects static files
3. `version` - Always 2 by default, unnecessary
4. Path mappings - Vercel serves static files automatically

---

## ✅ CORRECT Configuration: Static HTML/CSS/JS

### Option 1: Direct Backend Connection (Simple)

**When to use:** Frontend connects directly to `http://192.168.1.13:8080`

**vercel.json:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**Or even simpler - NO vercel.json at all!**
```
(Delete vercel.json completely)
```
Vercel automatically serves your `index.html` from the root.

---

### Option 2: API Proxy via Vercel (Recommended for ngrok/Cloudflare)

**When to use:** You want `/api/*` requests to proxy to your Flask backend

**vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-ngrok-url.ngrok-free.app/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**How it works:**
```
User → https://your-app.vercel.app/api/status
      ↓ (Vercel rewrites)
Backend ← https://your-ngrok-url.ngrok-free.app/status
```

**Update your frontend API calls:**
```javascript
// Before:
const response = await fetch(`${apiUrl}/status/`, {
    headers: { 'X-Auth-Token': token }
});

// After (with proxy):
const response = await fetch('/api/status/', {
    headers: { 'X-Auth-Token': token }
});
```

---

## ✅ CORRECT Configuration: React / Vite Frontend

**Same as static! No difference.**

Vite builds to static HTML/CSS/JS, so use the same `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-url/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

**Additional Vite considerations:**
- Build output goes to `dist/` by default
- Vercel auto-detects this
- No special configuration needed

---

## 🗑️ What to REMOVE

### 1. Remove `routes` (Always)
```json
{
  "routes": [...]  // ❌ DELETE THIS ENTIRE SECTION
}
```

### 2. Remove `builds` (For Static Sites)
```json
{
  "builds": [...]  // ❌ DELETE THIS - Not needed for static
}
```

### 3. Remove `version` (Unnecessary)
```json
{
  "version": 2  // ❌ DELETE - It's the default
}
```

### 4. Remove `name` (Optional, Not Required)
```json
{
  "name": "..."  // ❌ DELETE - Vercel uses repo name
}
```

---

## 🎯 Proxy API Requests to Flask Backend

### Setup 1: Using ngrok (Temporary URL)

**1. Start Flask backend:**
```bash
/Users/uzair/Developer/Projects/Mac-control-py/.venv/bin/python run.py
```

**2. Start ngrok:**
```bash
ngrok http 8080
```

**3. Copy ngrok URL** (e.g., `https://abc123.ngrok-free.app`)

**4. Update vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://abc123.ngrok-free.app/:path*"
    }
  ]
}
```

**5. Update frontend API calls:**
```javascript
// Change this:
const API_URL = 'http://192.168.1.13:8080';

// To this:
const API_URL = '/api';  // Uses Vercel proxy
```

---

### Setup 2: Using Cloudflare Tunnel (Permanent URL)

**1. Install cloudflared:**
```bash
brew install cloudflare/cloudflare/cloudflared
```

**2. Authenticate:**
```bash
cloudflared tunnel login
```

**3. Create tunnel:**
```bash
cloudflared tunnel create mac-control
```

**4. Configure tunnel:**
```bash
nano ~/.cloudflared/config.yml
```

```yaml
tunnel: mac-control
credentials-file: /Users/uzair/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: mac-control.yourdomain.com
    service: http://localhost:8080
  - service: http_status:404
```

**5. Run tunnel:**
```bash
cloudflared tunnel run mac-control
```

**6. Update vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://mac-control.yourdomain.com/:path*"
    }
  ]
}
```

---

### Setup 3: Direct Connection (No Proxy)

**Keep it simple - don't use rewrites at all!**

**vercel.json:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

**Frontend connects directly:**
```javascript
// User enters their Mac's IP in settings page
const API_URL = 'http://192.168.1.13:8080';

fetch(`${API_URL}/status/`, {
    headers: { 'X-Auth-Token': token }
});
```

**This is what you have now - it works!**

---

## 📝 When vercel.json is NOT Needed

**Delete `vercel.json` entirely if:**

1. ✅ You have static HTML/CSS/JS files
2. ✅ Your `index.html` is in the root or `public/` directory
3. ✅ You don't need custom headers
4. ✅ You don't need API proxying
5. ✅ You don't need redirects/rewrites

**Vercel auto-detects and serves:**
- `index.html` at root
- All static files (`.html`, `.css`, `.js`, `.png`, etc.)
- React/Vite build outputs

**When you DO need vercel.json:**
- Custom security headers
- API proxying (`/api/*` → backend)
- Custom redirects (e.g., `/old-page` → `/new-page`)
- SPA routing (e.g., React Router needs `cleanUrls` or `rewrites`)

---

## 🎯 Your Specific Setup (Current)

### Current Architecture:
```
Vercel Frontend → Direct connection → http://192.168.1.13:8080 (Flask)
```

### Recommended vercel.json:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

**Why this works:**
- ✅ No `routes` (avoids conflict)
- ✅ Uses modern `headers`
- ✅ Frontend connects directly to Mac (via settings page)
- ✅ No proxy needed (users configure their own IP)

---

## 🚀 Deployment Checklist

### 1. Fix vercel.json
```bash
# Remove: routes, builds, version, name
# Keep: headers (optional), rewrites (if proxying)
```

### 2. Commit and push
```bash
git add vercel.json
git commit -m "Fix Vercel configuration - remove legacy routes"
git push origin main
```

### 3. Vercel auto-deploys
- Goes to GitHub → Vercel auto-detects push
- Builds and deploys automatically
- Check deployment logs for errors

### 4. Test deployment
```bash
# Open your Vercel URL
open https://your-app.vercel.app

# Go to Settings page
# Enter your Mac's IP: http://192.168.1.13:8080
# Enter token: replace-this-token
# Test connection
```

---

## 🔧 Troubleshooting

### Error: "routes cannot be present"
**Solution:** Remove `routes` from vercel.json

### Error: Build failed
**Solution:** Ensure `index.html` is in root or set build output directory

### Error: 404 on deployment
**Solution:** Check file structure - Vercel needs `index.html` in:
- Project root (`/index.html`)
- OR `public/` directory (`/public/index.html`)
- OR build output (`/dist/index.html` for Vite)

### CORS errors in browser
**Solution:** Your Flask backend needs CORS enabled (you already have this)

---

## 📚 Vercel Configuration Reference

### Modern Options (Use These)
```json
{
  "rewrites": [...],        // Proxy requests
  "redirects": [...],       // HTTP redirects
  "headers": [...],         // Security headers
  "cleanUrls": true,        // Remove .html extensions
  "trailingSlash": false    // Remove trailing slashes
}
```

### Legacy Options (Don't Use)
```json
{
  "routes": [...],          // ❌ DEPRECATED - Don't use
  "builds": [...],          // ❌ Legacy - Auto-detected now
  "version": 2              // ❌ Default - Not needed
}
```

### File Structure for Static Sites
```
your-repo/
├── index.html           ✅ Vercel serves this
├── status.html          ✅ Auto-served
├── settings.html        ✅ Auto-served
├── css/
│   └── style.css        ✅ Auto-served
├── js/
│   └── main.js          ✅ Auto-served
└── vercel.json          ⚠️  Optional (only if needed)
```

---

## ✅ Summary: Your Fixed Configuration

**Before (❌ ERROR):**
```json
{
  "routes": [...],     // Conflicts with headers
  "headers": [...]
}
```

**After (✅ WORKS):**
```json
{
  "headers": [...]     // No routes = No conflict
}
```

**Or even simpler:**
```
(No vercel.json at all!)
```

**Your setup is now correct and will deploy successfully!** 🎉
