export interface StreamingSource {
  id: number
  name: string
  type: 'sub' | 'free' | 'buy' | 'rent'
  region: string
  web_url?: string
  format?: string
}

export interface Season {
  season_number: number
  title?: string
  first_air_date: string | null
  last_air_date: string | null
  episode_count?: number
}

export interface TVShow {
  id: string
  title: string // User's input title
  officialTitle?: string // API's official title
  streamingSources: StreamingSource[]
  latestSeason: number | null
  seasonStartDate: string | null
  seasonEndDate: string | null
  episodeCount: number | null
  genreNames: string[] | null
  userRating: number | null      // 0-10 scale
  criticScore: number | null     // 0-100 scale
  originalLanguage: string | null // ISO language code (e.g., "en")
  comments: string | null        // User comments/notes
  isLoading: boolean
  error: string | null
  lastUpdated?: number
}

export interface WatchModeSearchResult {
  id: number
  title: string
  name?: string // Some results use 'name' instead of 'title'
  original_title: string
  type: 'tv_series' | 'movie'
  year?: number
  tmdb_id?: number
  imdb_id?: string
}

export interface WatchModeSourcesResponse {
  id: number
  sources: StreamingSource[]
}

export interface WatchModeSeason {
  id: number
  poster_url?: string
  name: string
  overview?: string
  number: number
  air_date: string | null
  episode_count: number
}

// The API returns an array directly, not wrapped in an object
export type WatchModeSeasonResponse = WatchModeSeason[]

export interface WatchModeEpisode {
  id: number
  name: string
  season_number: number
  episode_number: number
  release_date: string | null
  runtime_minutes?: number
  overview?: string
}

export interface WatchModeTitleDetails {
  id: number
  title: string
  original_title: string
  plot_overview?: string
  type: 'tv_series' | 'movie'
  runtime_minutes?: number
  year?: number
  end_year?: number
  release_date?: string
  imdb_id?: string
  tmdb_id?: number
  tmdb_type?: string
  genres?: number[]
  genre_names: string[]
  user_rating: number
  critic_score: number
  us_rating?: string
  poster?: string
  backdrop?: string
  original_language: string
  networks?: number[]
  network_names?: string[]
  relevance_percentile?: number
  // Data from append_to_response
  sources?: StreamingSource[]
  seasons?: WatchModeSeason[]
}

export type ShowStatus = 'idle' | 'loading' | 'success' | 'error'
