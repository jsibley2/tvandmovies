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
  isLoading: boolean
  error: string | null
  lastUpdated?: number
}

export interface WatchModeSearchResult {
  id: number
  title: string
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

export type ShowStatus = 'idle' | 'loading' | 'success' | 'error'
