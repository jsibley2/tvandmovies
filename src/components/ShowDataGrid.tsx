import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { StreamingChips } from './StreamingChips'
import { GenreChips } from './GenreChips'
import { formatDate } from '@/lib/utils'
import { Trash2, RefreshCw, Loader2, Star } from 'lucide-react'
import type { TVShow } from '@/types/show.types'

interface ShowDataGridProps {
  showData: {
    shows: TVShow[]
    updateShowTitle: (id: string, title: string) => void
    updateShowComments: (id: string, comments: string) => void
    deleteShow: (id: string) => void
    refreshShow: (id: string) => void
  }
}

export function ShowDataGrid({ showData }: ShowDataGridProps) {
  const { shows, updateShowTitle, updateShowComments, deleteShow, refreshShow } = showData

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'TV Show Title',
      width: 250,
      editable: true,
      renderCell: (params: GridRenderCellParams<TVShow>) => {
        const row = params.row as TVShow
        const isEmpty = !params.value || params.value === ''

        return (
          <div className="flex items-center gap-2 w-full h-full">
            {row.isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
            <span className={`${row.error ? 'text-red-600' : ''} ${isEmpty ? 'text-gray-400 italic' : ''}`}>
              {params.value || 'Click to enter show name...'}
            </span>
          </div>
        )
      },
      cellClassName: (params) => {
        const row = params.row as TVShow
        return !row.title ? 'bg-blue-50 border-l-2 border-l-blue-400' : ''
      }
    },
    {
      field: 'officialTitle',
      headerName: 'Official Title',
      width: 200,
      sortable: true,
      renderCell: (params: GridRenderCellParams<TVShow>) => {
        const row = params.row as TVShow
        if (row.isLoading) return '...'
        return params.value || '-'
      }
    },
    {
      field: 'genreNames',
      headerName: 'Genres',
      width: 220,
      sortable: false,
      renderCell: (params: GridRenderCellParams<TVShow>) => {
        const row = params.row as TVShow
        if (row.isLoading) {
          return <span className="text-sm text-muted-foreground">Loading...</span>
        }
        if (row.error) return '-'
        return <GenreChips genres={row.genreNames} />
      }
    },
    {
      field: 'userRating',
      headerName: 'User Rating',
      width: 120,
      type: 'number',
      sortable: true,
      renderCell: (params: GridRenderCellParams<TVShow>) => {
        const row = params.row as TVShow
        if (row.isLoading) return '...'
        if (row.error || params.value == null) return '-'
        return (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{(params.value as number).toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">/10</span>
          </div>
        )
      }
    },
    {
      field: 'criticScore',
      headerName: 'Critic Score',
      width: 120,
      type: 'number',
      sortable: true,
      renderCell: (params: GridRenderCellParams<TVShow>) => {
        const row = params.row as TVShow
        if (row.isLoading) return '...'
        if (row.error || params.value == null) return '-'

        const score = params.value as number
        let colorClass = 'text-red-600'
        if (score >= 75) colorClass = 'text-green-600'
        else if (score >= 60) colorClass = 'text-yellow-600'

        return (
          <span className={`font-medium ${colorClass}`}>
            {score}%
          </span>
        )
      }
    },
    {
      field: 'originalLanguage',
      headerName: 'Language',
      width: 100,
      sortable: true,
      renderCell: (params: GridRenderCellParams<TVShow>) => {
        const row = params.row as TVShow
        if (row.isLoading) return '...'
        if (row.error || !params.value) return '-'

        // Convert language code to readable format
        const languageMap: Record<string, string> = {
          'en': 'English',
          'es': 'Spanish',
          'fr': 'French',
          'de': 'German',
          'it': 'Italian',
          'ja': 'Japanese',
          'ko': 'Korean',
          'zh': 'Chinese',
          'pt': 'Portuguese',
          'ru': 'Russian'
        }

        return languageMap[params.value as string] || (params.value as string).toUpperCase()
      }
    },
    {
      field: 'streamingSources',
      headerName: 'Streaming Services',
      width: 300,
      sortable: false,
      renderCell: (params: GridRenderCellParams<TVShow>) => {
        const row = params.row as TVShow
        if (row.isLoading) {
          return <span className="text-sm text-muted-foreground">Loading...</span>
        }
        if (row.error) {
          return <span className="text-sm text-red-600">{row.error}</span>
        }
        return <StreamingChips sources={row.streamingSources} />
      }
    },
    {
      field: 'latestSeason',
      headerName: 'Latest Season',
      width: 130,
      type: 'number',
      renderCell: (params: GridRenderCellParams<TVShow>) => {
        const row = params.row as TVShow
        if (row.isLoading) return '...'
        if (row.error) return '-'
        return params.value ? `Season ${params.value}` : 'N/A'
      }
    },
    {
      field: 'episodeCount',
      headerName: 'Episodes',
      width: 100,
      type: 'number',
      renderCell: (params: GridRenderCellParams<TVShow>) => {
        const row = params.row as TVShow
        if (row.isLoading) return '...'
        if (row.error) return '-'
        return params.value || 'N/A'
      }
    },
    {
      field: 'seasonStartDate',
      headerName: 'Season Start Date',
      width: 150,
      renderCell: (params: GridRenderCellParams<TVShow>) => {
        const row = params.row as TVShow
        if (row.isLoading) return '...'
        if (row.error) return '-'
        return formatDate(params.value as string)
      }
    },
    {
      field: 'seasonEndDate',
      headerName: 'Season End Date',
      width: 150,
      renderCell: (params: GridRenderCellParams<TVShow>) => {
        const row = params.row as TVShow
        if (row.isLoading) return '...'
        if (row.error) return '-'
        return formatDate(params.value as string)
      }
    },
    {
      field: 'comments',
      headerName: 'Comments',
      width: 300,
      editable: true,
      sortable: false,
      renderCell: (params: GridRenderCellParams<TVShow>) => {
        const row = params.row as TVShow
        const isEmpty = !params.value || params.value === ''

        return (
          <div className="flex items-center w-full h-full">
            <span className={`${isEmpty ? 'text-gray-400 italic' : ''} truncate`}>
              {params.value || 'Click to add notes...'}
            </span>
          </div>
        )
      },
      cellClassName: () => 'cursor-text'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams<TVShow>) => {
        const row = params.row as TVShow
        return (
          <div className="flex gap-2">
            <button
              onClick={() => refreshShow(row.id)}
              disabled={row.isLoading || !row.title}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${row.isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => deleteShow(row.id)}
              className="p-1 hover:bg-red-100 rounded text-red-600"
              title="Delete row"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      }
    }
  ]

  return (
    <div className="h-full w-full bg-white">
      <DataGrid
        rows={shows}
        columns={columns}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 }
          }
        }}
        disableRowSelectionOnClick
        processRowUpdate={(newRow, oldRow) => {
          // Check what changed
          if (newRow.title !== oldRow.title) {
            updateShowTitle(newRow.id, newRow.title)
          }
          if (newRow.comments !== oldRow.comments) {
            updateShowComments(newRow.id, newRow.comments || '')
          }
          return newRow
        }}
        onProcessRowUpdateError={(error) => {
          console.error('Row update error:', error)
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell:focus': {
            outline: 'none'
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none'
          },
          '& .MuiDataGrid-cell--editable': {
            cursor: 'text',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
            }
          },
          '& .MuiDataGrid-cell.bg-blue-50': {
            backgroundColor: 'rgb(239 246 255)',
            borderLeft: '2px solid rgb(96 165 250)',
            cursor: 'text',
            '&:hover': {
              backgroundColor: 'rgb(219 234 254)',
            }
          }
        }}
      />
    </div>
  )
}
