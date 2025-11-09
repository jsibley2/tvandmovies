# Quick Start Guide

## Get Your WatchMode API Key

1. Go to [https://api.watchmode.com/](https://api.watchmode.com/)
2. Sign up for a free account
3. Copy your API key from the dashboard

## Setup & Run

```bash
# 1. Add your API key to .env file
echo "VITE_WATCHMODE_API_KEY=your_api_key_here" > .env

# 2. Install dependencies (already done if you see node_modules)
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deploy to Vercel

### Option 1: Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts, then add your API key:
# Dashboard → Project Settings → Environment Variables
# Name: VITE_WATCHMODE_API_KEY
# Value: your_api_key_here
```

### Option 2: GitHub + Vercel Dashboard

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Add Environment Variable:
     - Name: `VITE_WATCHMODE_API_KEY`
     - Value: Your WatchMode API key
   - Click "Deploy"

Your app will be live at `https://your-project.vercel.app` 🎉

## Usage

1. Click **"Add Show"** to create a new row
2. Type a TV show title (e.g., "Breaking Bad", "The Office")
3. Wait ~1 second - data will auto-populate:
   - Streaming services (Netflix, Hulu, etc.)
   - Latest season number
   - Season air dates
4. Use the refresh icon to update a show's data
5. Use the trash icon to delete a show
6. Your list is automatically saved in your browser

## Troubleshooting

**"API key not configured"**
- Make sure `.env` file exists with `VITE_WATCHMODE_API_KEY=your_key`
- Restart dev server after creating/editing `.env`

**"Rate limit exceeded"**
- Free tier has limited API calls
- Wait a minute and try again
- App caches results to minimize API usage

**Show not found**
- Try different title variations
- Check spelling
- Some shows may not be in WatchMode database
