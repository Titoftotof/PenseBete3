import { useEffect } from 'react'
import { History } from 'lucide-react'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { useFrequentItemsStore } from '@/stores/frequentItemsStore'
import type { FrequentItem } from '@/types'

interface FrequentItemsSuggestionsProps {
  onSelectItem: (content: string) => void
  limit?: number
}

export function FrequentItemsSuggestions({ onSelectItem, limit = 10 }: FrequentItemsSuggestionsProps) {
  const { frequentItems, fetchFrequentItems, loading } = useFrequentItemsStore()

  useEffect(() => {
    fetchFrequentItems()
  }, [fetchFrequentItems])

  const topItems = frequentItems.slice(0, limit)

  if (loading || topItems.length === 0) {
    return null
  }

  return (
    <GlassCard className="border-dashed border-2 border-purple-500/30" hover={false}>
      <GlassCardContent className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <History className="h-4 w-4 text-purple-500" />
            Suggestions rapides
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {topItems.map((item) => (
            <FrequentItemChip
              key={item.id}
              item={item}
              onClick={() => onSelectItem(item.content)}
            />
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  )
}

interface FrequentItemChipProps {
  item: FrequentItem
  onClick: () => void
}

function FrequentItemChip({ item, onClick }: FrequentItemChipProps) {
  return (
    <button
      onClick={onClick}
      className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/20 dark:border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-200"
      title={`Utilisé ${item.use_count} fois`}
    >
      <span className="text-sm">{item.content}</span>
      <span className="text-xs text-muted-foreground group-hover:text-purple-500">
        {item.use_count}
      </span>
    </button>
  )
}
