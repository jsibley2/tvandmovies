import axios from 'axios'
import type {
  WatchModeSearchResult,
  WatchModeSourcesResponse,
  WatchModeSeasonResponse,
  StreamingSource,
  Season
} from '@/types/show.types'

const WATCHMODE_API_KEY = import.meta.env.VITE_WATCHMODE_API_KEY
const BASE_URL = 'https://api.watchmode.com/v1'

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }
  cache.delete(key)
  return null
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export class WatchModeAPI {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || WATCHMODE_API_KEY
    if (!this.apiKey) {
      console.warn('WatchMode API key not configured. Please set VITE_WATCHMODE_API_KEY in .env file')
    }
  }

  /**
   * Search for a TV show by title
   */
  async searchShow(title: string): Promise<WatchModeSearchResult | null> {
    if (!this.apiKey) {
      throw new Error('API key not configured')
    }

    const cacheKey = `search:${title.toLowerCase()}`
    const cached = getCached<WatchModeSearchResult>(cacheKey)
    if (cached) return cached

    try {
      // Build URL with proper encoding
      const searchParams = new URLSearchParams({
        apiKey: this.apiKey,
        search_field: 'name',
        search_value: title
      })

      const url = `${BASE_URL}/search/?${searchParams.toString()}`

      const response = await axios.get(url)

      // Get the first result that matches best
      const results = response.data.title_results as WatchModeSearchResult[]
      console.log('Search results:', results)
      if (results && results.length > 0) {
        // Filter for TV series only
        const tvShows = results.filter(r => r.type === 'tv_series')
        console.log('TV shows found:', tvShows.length)
        if (tvShows.length > 0) {
          const bestMatch = tvShows[0]
          console.log('Best match:', bestMatch)
          setCache(cacheKey, bestMatch)
          return bestMatch
        }
      }

      return null
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment.')
        }
        if (error.response?.status === 401) {
          throw new Error('Invalid API key')
        }
        if (error.response?.status === 500) {
          console.error('WatchMode API error:', error.response.data)
          throw new Error('Search service temporarily unavailable')
        }
      }
      console.error('Search error:', error)
      throw new Error(`Failed to search for show: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get streaming sources for a show
   */
  async getStreamingSources(showId: number): Promise<StreamingSource[]> {
    if (!this.apiKey) {
      throw new Error('API key not configured')
    }

    const cacheKey = `sources:${showId}`
    const cached = getCached<StreamingSource[]>(cacheKey)
    if (cached) return cached

    try {
      const response = await axios.get(
        `${BASE_URL}/title/${showId}/sources/`,
        {
          params: {
            apiKey: this.apiKey,
            regions: 'US' // Focus on US sources
          }
        }
      )

      // Log the entire response to see the structure
      console.log('Raw API response for sources:', response.data)

      // Try to extract sources from different possible structures
      let sources: StreamingSource[] = []

      if (Array.isArray(response.data)) {
        // API might return array directly
        sources = response.data
        console.log('Sources are in array format')
      } else if (response.data.sources) {
        // Or wrapped in sources property
        sources = response.data.sources
        console.log('Sources are in object.sources format')
      }

      console.log('Parsed sources for', showId, ':', sources.length, 'total')
      if (sources.length > 0) {
        console.log('Source types:', [...new Set(sources.map((s: any) => s.type))])
        console.log('First 3 sources:', sources.slice(0, 3))
      }

      setCache(cacheKey, sources)
      return sources
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return [] // No sources found
        }
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment.')
        }
      }
      console.error('Failed to get streaming sources:', error)
      return []
    }
  }

  /**
   * Get season information for a show
   */
  async getSeasons(showId: number): Promise<Season[]> {
    if (!this.apiKey) {
      throw new Error('API key not configured')
    }

    const cacheKey = `seasons:${showId}`
    const cached = getCached<Season[]>(cacheKey)
    if (cached) return cached

    try {
      const response = await axios.get<WatchModeSeasonResponse>(
        `${BASE_URL}/title/${showId}/seasons/`,
        {
          params: {
            apiKey: this.apiKey
          }
        }
      )

      // The API returns an array directly
      const seasons = response.data || []

      console.log('Raw seasons for', showId, ':', seasons.length, 'total')
      if (seasons.length > 0) {
        console.log('Sample season:', seasons[0])
      }

      const mappedSeasons: Season[] = seasons.map(s => ({
        season_number: s.number,
        title: s.name,
        first_air_date: s.air_date,
        last_air_date: null, // API doesn't provide end date for each season
        episode_count: s.episode_count
      }))

      setCache(cacheKey, mappedSeasons)
      return mappedSeasons
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return [] // No season data
        }
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment.')
        }
      }
      console.error('Failed to get seasons:', error)
      return []
    }
  }

  /**
   * Get complete show data (search + sources + seasons)
   */
  async getShowData(title: string) {
    const searchResult = await this.searchShow(title)
    if (!searchResult) {
      return null
    }

    const [sources, seasons] = await Promise.all([
      this.getStreamingSources(searchResult.id),
      this.getSeasons(searchResult.id)
    ])

    // Get the latest season
    const latestSeason = seasons.length > 0
      ? seasons.reduce((max, s) => s.season_number > max.season_number ? s : max, seasons[0])
      : null

    // Try to estimate end date: if there's a next season, use its start date
    // Otherwise use last_air_date if available
    let seasonEndDate = latestSeason?.last_air_date || null
    if (!seasonEndDate && seasons.length > 1) {
      // Sort seasons by number
      const sorted = [...seasons].sort((a, b) => a.season_number - b.season_number)
      const latestIndex = sorted.findIndex(s => s.season_number === latestSeason?.season_number)
      if (latestIndex >= 0 && latestIndex < sorted.length - 1) {
        // Use next season's start as this season's end
        seasonEndDate = sorted[latestIndex + 1].first_air_date
      }
    }

    const result = {
      id: searchResult.id,
      title: searchResult.name || searchResult.title, // Try 'name' first, then 'title'
      sources,
      latestSeason: latestSeason?.season_number || null,
      seasonStartDate: latestSeason?.first_air_date || null,
      seasonEndDate,
      episodeCount: latestSeason?.episode_count || null
    }

    console.log('Returning show data:', result)

    return result
  }
}

// Export singleton instance
export const watchModeAPI = new WatchModeAPI()
