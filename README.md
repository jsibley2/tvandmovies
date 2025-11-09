# TV Show Tracker

A modern React application for tracking TV shows, their streaming availability, and air dates. Built with React, TypeScript, TailwindCSS, shadcn/ui, and MUI DataGrid, powered by the WatchMode API.

## Features

- **Easy TV Show Tracking**: Simply type a show title and watch the data populate automatically
- **Streaming Service Discovery**: See which platforms stream each show (Netflix, Hulu, Disney+, etc.)
- **Season Information**: View the latest season number and air dates
- **Persistent Storage**: Your show list is saved locally in your browser
- **Real-time Updates**: Refresh individual shows or add new ones on the fly
- **Clean UI**: Modern, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui + MUI X DataGrid
- **API**: WatchMode API
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- WatchMode API key (get one at [https://api.watchmode.com/](https://api.watchmode.com/))

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd tvandmovies
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your WatchMode API key:

```
VITE_WATCHMODE_API_KEY=your_actual_api_key_here
```

**Important**: Never commit your `.env` file! It's already included in `.gitignore`.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## How to Use

1. **Add a Show**: Click the "Add Show" button to create a new row
2. **Enter Title**: Type the TV show name in the "TV Show Title" column
3. **Auto-Fetch**: The app automatically fetches and displays:
   - Available streaming services
   - Latest season number
   - Season start and end dates
4. **Refresh**: Use the refresh icon to update a show's data
5. **Delete**: Click the trash icon to remove a show from your list
6. **Clear All**: Remove all shows at once with the "Clear All" button

## Deploying to Vercel

### Method 1: Using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to link your project

4. Add your environment variable in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `VITE_WATCHMODE_API_KEY` with your API key

### Method 2: Using Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variable:
   - Name: `VITE_WATCHMODE_API_KEY`
   - Value: Your WatchMode API key
7. Click "Deploy"

Your app will be live at `https://your-project.vercel.app`

## Project Structure

```
src/
├── components/
│   ├── ShowDataGrid.tsx      # Main data grid component
│   ├── StreamingChips.tsx    # Streaming service badges
│   └── ui/                   # shadcn/ui components
├── services/
│   └── watchmode.ts          # WatchMode API integration
├── hooks/
│   └── useShowData.ts        # Custom hook for show data management
├── types/
│   └── show.types.ts         # TypeScript type definitions
├── lib/
│   └── utils.ts              # Utility functions
├── App.tsx                   # Main application component
├── main.tsx                  # Application entry point
└── index.css                 # Global styles with Tailwind
```

## API Integration

The app uses the WatchMode API with the following endpoints:

- **Search**: `/v1/search/` - Find TV shows by title
- **Sources**: `/v1/title/{id}/sources/` - Get streaming availability
- **Seasons**: `/v1/title/{id}/seasons/` - Get season information

### Rate Limiting

The app implements:
- **Debouncing**: 500ms delay on title input to reduce API calls
- **Caching**: 5-minute cache for API responses
- **Error Handling**: Graceful handling of rate limits and API errors

## Development Notes

- Data is stored in browser localStorage and persists between sessions
- The app filters for US streaming sources by default
- Only subscription and free streaming services are displayed
- Shows not found or with errors display appropriate messages

## Troubleshooting

**"API key not configured" error**
- Make sure you've created a `.env` file with `VITE_WATCHMODE_API_KEY`
- Restart the development server after adding the `.env` file

**"Rate limit exceeded" message**
- WatchMode has API rate limits. Wait a moment before trying again
- The app caches results to minimize API calls

**Show not found**
- Try different variations of the title
- Some shows may not be in the WatchMode database

## License

MIT

## Credits

- TV show data provided by [WatchMode](https://api.watchmode.com/)
- Built with [React](https://react.dev/), [Vite](https://vitejs.dev/), [TailwindCSS](https://tailwindcss.com/), and [MUI](https://mui.com/)
