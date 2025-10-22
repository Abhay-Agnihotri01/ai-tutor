# Deployment Guide

## Quick Deploy Steps

### 1. Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### 2. Backend (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### 3. Environment Variables

**Backend (Railway/Render):**
- `NODE_ENV=production`
- `JWT_SECRET=your_secret`
- `DB_HOST=your_db_host`
- `DB_NAME=your_db_name`
- `DB_USER=your_db_user`
- `DB_PASS=your_db_pass`
- `CLIENT_URL=https://your-frontend-url.vercel.app`

**Frontend (Vercel):**
- `VITE_API_URL=https://your-backend-url.railway.app`

## Alternative: One-Click Deploy

### Render (Full Stack)
1. Connect GitHub repo
2. Create Web Service for backend
3. Create Static Site for frontend
4. Add environment variables

### Netlify + Railway
1. Frontend: Connect repo to Netlify
2. Backend: Deploy to Railway
3. Configure environment variables

## Database Options
- **PlanetScale** (MySQL, free tier)
- **Supabase** (PostgreSQL, free tier)
- **Railway MySQL** (built-in)

## Post-Deployment
1. Test all API endpoints
2. Verify file uploads work
3. Check authentication flow
4. Test course creation/enrollment