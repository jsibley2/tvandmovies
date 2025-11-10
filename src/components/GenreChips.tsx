import { Badge } from '@/components/ui/badge'

interface GenreChipsProps {
  genres: string[] | null
}

export function GenreChips({ genres }: GenreChipsProps) {
  if (!genres || genres.length === 0) {
    return <span className="text-sm text-muted-foreground">-</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {genres.slice(0, 4).map((genre) => (
        <Badge
          key={genre}
          variant="secondary"
          className="text-xs font-normal"
        >
          {genre}
        </Badge>
      ))}
      {genres.length > 4 && (
        <Badge variant="outline" className="text-xs font-normal">
          +{genres.length - 4}
        </Badge>
      )}
    </div>
  )
}
