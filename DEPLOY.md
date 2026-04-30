# Magnma Institute - Deployment Guide

## Prerequisites

- [Netlify](https://netlify.com) account
- [GitHub](https://github.com) account
- Your Supabase project (already set up)

## Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add your GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/magnma-institute.git

# Push
git push -u origin main
```

## Step 2: Connect to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** and authorize Netlify
4. Choose your `magnma-institute` repository
5. Configure build settings:
   - **Build command:** `npm run build -w packages/frontend`
   - **Publish directory:** `packages/frontend/dist`
   - **Base directory:** (leave empty)

## Step 3: Set Environment Variables

In Netlify Dashboard → Site settings → Environment variables, add:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key` | Your Supabase anon key |
| `WEB3FORMS_ACCESS_KEY` | `your-web3forms-key` | For contact form fallback |

> **Important:** Never commit `.env` to GitHub! It's already in `.gitignore`.

## Step 4: Deploy

1. Click **"Deploy site"**
2. Netlify will build and deploy automatically
3. Your site will be live at `https://your-site-name.netlify.app`

## Step 5: Custom Domain (Optional)

1. In Netlify Dashboard → Domain settings
2. Click **"Add custom domain"**
3. Follow DNS instructions

## Architecture on Netlify

```
┌─────────────────────────────────────────┐
│           Netlify CDN                 │
│  ┌─────────────────────────────────┐  │
│  │   Static Frontend (React + Vite) │  │
│  │   packages/frontend/dist         │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │   Netlify Functions (Serverless) │  │
│  │   • /api/colleges/*              │  │
│  │   • /api/courses/*               │  │
│  │   • /api/contact                 │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │   Supabase (Database + Auth)   │  │
│  └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Local Development

```bash
# Install dependencies
npm install

# Run all services (frontend + APIs)
npm run dev

# Or run individually:
npm run dev:frontend      # Vite dev server
npm run dev:api-colleges  # Colleges API (port 3001)
npm run dev:api-courses   # Courses API (port 3002)
npm run dev:api-contact   # Contact API (port 3003)
```

## Troubleshooting

### Build fails on Netlify
- Check that `packages/frontend/dist` exists after build
- Verify `npm run build -w packages/frontend` works locally

### API calls fail
- Check environment variables are set in Netlify
- Verify Supabase RLS policies allow public read

### Contact form not working
- Ensure `WEB3FORMS_ACCESS_KEY` is set
- Check browser console for errors

## Files for Deployment

| File | Purpose |
|------|---------|
| `netlify.toml` | Netlify build config + redirects |
| `netlify/functions/*.ts` | Serverless API functions |
| `.gitignore` | Excludes secrets and node_modules |
| `.env.example` | Template for environment variables |
| `Dockerfile` | Docker containerization (optional) |
