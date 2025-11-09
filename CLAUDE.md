# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TV Show Tracker - A React application for tracking TV show air dates and streaming services using the WatchMode API. Users input TV show titles into a MUI DataGrid, and the app automatically fetches and displays streaming platforms, season information, and air dates.

## Tech Stack

- **Frontend Framework**: React with Vite
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui + MUI X DataGrid
- **API**: WatchMode API for TV show and streaming data
- **Environment**: API keys stored in `.env` (never commit)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Architecture

### Core Application Flow

1. User enters TV show title in editable DataGrid cell
2. Title input triggers debounced API call to WatchMode
3. App fetches:
   - Streaming service availability
   - Most recent season number
   - Season first air date
   - Season final air date
4. Data populates corresponding DataGrid columns
5. State persisted to localStorage for session recovery

### Key Directories

```
src/
├── components/          # React components
│   ├── ShowDataGrid.tsx    # Main MUI DataGrid with editable cells
│   ├── StreamingChips.tsx  # Streaming service badges
│   └── ui/                 # shadcn/ui components
├── services/           # External API integrations
│   └── watchmode.ts       # WatchMode API client with caching
├── hooks/              # Custom React hooks
│   └── useShowData.ts     # Data fetching and state management
├── types/              # TypeScript type definitions
│   └── show.types.ts      # Show, Season, Streaming interfaces
└── lib/                # Utilities
    └── utils.ts           # Helper functions, debouncing
```

### State Management

- Local React state (useState/useReducer) for DataGrid data
- Context API if global state needed across components
- localStorage for data persistence between sessions
- In-memory cache for API responses to minimize rate limit impact

### API Integration Notes

**WatchMode API Endpoints Used:**
- `/v1/search/` - Search shows by title
- `/v1/title/{id}/sources/` - Get streaming sources
- `/v1/title/{id}/seasons/` - Get season details

**Important Considerations:**
- API has rate limits - implement debouncing (300-500ms) on title input
- Cache API responses to avoid redundant calls
- Handle incomplete data gracefully (some shows missing season info)
- Error handling for show not found, network failures

### Environment Variables

Required in `.env`:
```
VITE_WATCHMODE_API_KEY=your_api_key_here
```

**Security Note**: Never expose API keys in client code. If rate limits become an issue, consider implementing a backend proxy.

### DataGrid Column Configuration

| Column | Type | Behavior |
|--------|------|----------|
| Title | Editable String | User input triggers API lookup |
| Streaming Services | Display (Chips) | Auto-populated from API |
| Season Number | Display (Number) | Latest season number |
| Season Start Date | Display (Date) | First air date of season |
| Season End Date | Display (Date) | Final air date of season |
| Actions | Buttons | Refresh data, delete row |

## Key Implementation Details

### Debouncing Strategy
Title input uses debounced callbacks to prevent excessive API calls while typing. Implemented in `useShowData` hook with 500ms delay.

### Error Handling Patterns
- Show not found: Display friendly message in row
- Network errors: Retry logic with exponential backoff
- Incomplete data: Show partial results, mark missing fields
- Rate limit exceeded: Queue requests, show loading state

### TailwindCSS + shadcn/ui Integration
- TailwindCSS configured in `tailwind.config.js`
- shadcn/ui components initialized with `components.json`
- Custom theme extends Tailwind's default palette
- MUI DataGrid styled with Tailwind utility classes

## Common Workflows

### Adding a New Data Field
1. Update TypeScript interface in `types/show.types.ts`
2. Add column definition to DataGrid in `ShowDataGrid.tsx`
3. Modify API service to fetch new data
4. Update localStorage schema if persisting

### Modifying API Integration
1. Update service function in `services/watchmode.ts`
2. Update TypeScript types to match response structure
3. Adjust caching logic if needed
4. Test error handling for new endpoint

### Adding shadcn/ui Components
```bash
npx shadcn-ui@latest add [component-name]
```
Components auto-install to `src/components/ui/`
