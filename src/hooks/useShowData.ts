import { useState, useCallback, useEffect } from 'react'
import { watchModeAPI } from '@/services/watchmode'
import type { TVShow } from '@/types/show.types'
import { debounce } from '@/lib/utils'

const STORAGE_KEY = 'tv-show-tracker-data'

export function useShowData() {
  const [shows, setShows] = useState<TVShow[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setShows(parsed)
      } catch (error) {
        console.error('Failed to parse stored shows:', error)
      }
    }
  }, [])

  // Save to localStorage whenever shows change
  useEffect(() => {
    if (shows.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shows))
    }
  }, [shows])

  const fetchShowData = useCallback(async (id: string, title: string) => {
    if (!title.trim()) {
      // Clear the row if title is empty
      setShows(prev => prev.map(show =>
        show.id === id
          ? {
              ...show,
              title: '',
              streamingSources: [],
              latestSeason: null,
              seasonStartDate: null,
              seasonEndDate: null,
              episodeCount: null,
              genreNames: null,
              userRating: null,
              criticScore: null,
              originalLanguage: null,
              isLoading: false,
              error: null
            }
          : show
      ))
      return
    }

    // Set loading state
    setShows(prev => prev.map(show =>
      show.id === id
        ? { ...show, title, isLoading: true, error: null }
        : show
    ))

    try {
      const data = await watchModeAPI.getShowData(title)

      if (data) {
        console.log('Updating show with data:', { id, officialTitle: data.title, sources: data.sources.length })

        setShows(prev => prev.map(show => {
          if (show.id === id) {
            const updated = {
              ...show,
              id,
              title, // Keep user's input
              officialTitle: data.title, // Store API's official title
              streamingSources: data.sources,
              latestSeason: data.latestSeason,
              seasonStartDate: data.seasonStartDate,
              seasonEndDate: data.seasonEndDate,
              episodeCount: data.episodeCount,
              genreNames: data.genreNames,
              userRating: data.userRating,
              criticScore: data.criticScore,
              originalLanguage: data.originalLanguage,
              comments: show.comments, // Preserve comments
              isLoading: false,
              error: null,
              lastUpdated: Date.now()
            }
            console.log('Updated show object:', updated)
            return updated
          }
          return show
        }))
      } else {
        // Show not found
        setShows(prev => prev.map(show =>
          show.id === id
            ? {
                ...show,
                title,
                isLoading: false,
                error: 'Show not found',
                streamingSources: [],
                latestSeason: null,
                seasonStartDate: null,
                seasonEndDate: null,
                episodeCount: null,
                genreNames: null,
                userRating: null,
                criticScore: null,
                originalLanguage: null
              }
            : show
        ))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch show data'
      setShows(prev => prev.map(show =>
        show.id === id
          ? {
              ...show,
              title,
              isLoading: false,
              error: errorMessage,
              streamingSources: [],
              latestSeason: null,
              seasonStartDate: null,
              seasonEndDate: null,
              episodeCount: null,
              genreNames: null,
              userRating: null,
              criticScore: null,
              originalLanguage: null
            }
          : show
      ))
    }
  }, [])

  // Debounced version for typing
  const debouncedFetchShowData = useCallback(
    debounce((id: string, title: string) => {
      fetchShowData(id, title)
    }, 500),
    [fetchShowData]
  )

  const addShow = useCallback(() => {
    const newShow: TVShow = {
      id: `show-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      title: '',
      streamingSources: [],
      latestSeason: null,
      seasonStartDate: null,
      seasonEndDate: null,
      episodeCount: null,
      genreNames: null,
      userRating: null,
      criticScore: null,
      originalLanguage: null,
      comments: null,
      isLoading: false,
      error: null
    }
    setShows(prev => [...prev, newShow])
    return newShow.id
  }, [])

  const deleteShow = useCallback((id: string) => {
    setShows(prev => prev.filter(show => show.id !== id))
  }, [])

  const updateShowTitle = useCallback((id: string, title: string) => {
    // Immediately update the title in state
    setShows(prev => prev.map(show =>
      show.id === id ? { ...show, title } : show
    ))
    // Trigger debounced API call
    debouncedFetchShowData(id, title)
  }, [debouncedFetchShowData])

  const updateShowComments = useCallback((id: string, comments: string) => {
    // Update comments immediately in state
    setShows(prev => prev.map(show =>
      show.id === id ? { ...show, comments } : show
    ))
  }, [])

  const refreshShow = useCallback((id: string) => {
    const show = shows.find(s => s.id === id)
    if (show?.title) {
      fetchShowData(id, show.title)
    }
  }, [shows, fetchShowData])

  const clearAll = useCallback(() => {
    setShows([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    shows,
    addShow,
    deleteShow,
    updateShowTitle,
    updateShowComments,
    refreshShow,
    clearAll
  }
}
