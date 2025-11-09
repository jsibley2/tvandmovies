import type { StreamingSource } from '@/types/show.types'
import { cn } from '@/lib/utils'

interface StreamingChipsProps {
  sources: StreamingSource[]
}

const sourceColors: Record<string, string> = {
  'Netflix': 'bg-red-600 text-white',
  'Hulu': 'bg-green-600 text-white',
  'Disney Plus': 'bg-blue-600 text-white',
  'Disney+': 'bg-blue-600 text-white',
  'Amazon Prime Video': 'bg-blue-400 text-white',
  'Prime Video': 'bg-blue-400 text-white',
  'HBO Max': 'bg-purple-600 text-white',
  'Max': 'bg-purple-600 text-white',
  'Apple TV Plus': 'bg-gray-800 text-white',
  'Apple TV+': 'bg-gray-800 text-white',
  'Paramount Plus': 'bg-blue-500 text-white',
  'Paramount+': 'bg-blue-500 text-white',
  'Peacock': 'bg-yellow-500 text-gray-900',
  'Showtime': 'bg-red-700 text-white',
  'AMC+': 'bg-black text-white',
  'Starz': 'bg-black text-white',
  'default': 'bg-gray-600 text-white'
}

// Helper to get color based on source type
function getSourceColor(source: StreamingSource): string {
  const baseColor = sourceColors[source.name] || sourceColors.default

  // Make buy/rent sources lighter to distinguish them
  if (source.type === 'buy' || source.type === 'rent') {
    return 'bg-gray-400 text-white'
  }

  return baseColor
}

export function StreamingChips({ sources }: StreamingChipsProps) {
  if (sources.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No streaming services found
      </div>
    )
  }

  // Get unique sources by name, prioritize subscription services
  const uniqueSourcesMap = new Map<string, StreamingSource>()

  // First pass: add subscription and free sources
  sources.forEach(s => {
    if ((s.type === 'sub' || s.type === 'free') && !uniqueSourcesMap.has(s.name)) {
      uniqueSourcesMap.set(s.name, s)
    }
  })

  // Second pass: add others if not already present
  sources.forEach(s => {
    if (!uniqueSourcesMap.has(s.name)) {
      uniqueSourcesMap.set(s.name, s)
    }
  })

  const uniqueSources = Array.from(uniqueSourcesMap.values())

  return (
    <div className="flex flex-wrap gap-1.5">
      {uniqueSources.slice(0, 5).map((source) => {
        const colorClass = getSourceColor(source)
        const typeLabel = source.type === 'buy' ? ' (Buy)' : source.type === 'rent' ? ' (Rent)' : ''

        return (
          <span
            key={`${source.id}-${source.name}`}
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              colorClass
            )}
            title={`${source.name}${typeLabel}${source.web_url ? ` - ${source.web_url}` : ''}`}
          >
            {source.name}
          </span>
        )
      })}
      {uniqueSources.length > 5 && (
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-300 text-gray-800"
          title={uniqueSources.slice(5).map(s => s.name).join(', ')}
        >
          +{uniqueSources.length - 5} more
        </span>
      )}
    </div>
  )
}
