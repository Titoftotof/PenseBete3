import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2, Check, GripVertical, Flag, Calendar } from 'lucide-react'
import { useListStore } from '@/stores/listStore'
import type { List, ListItem, Priority } from '@/types'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ListDetailProps {
  list: List
  onBack: () => void
}

interface SortableItemProps {
  item: ListItem
  onToggle: () => void
  onDelete: () => void
  onUpdatePriority: (priority: Priority) => void
}

const PRIORITY_CONFIG: Record<Priority, { color: string; label: string }> = {
  low: { color: 'text-gray-400', label: 'Basse' },
  normal: { color: 'text-blue-500', label: 'Normale' },
  high: { color: 'text-orange-500', label: 'Haute' },
  urgent: { color: 'text-red-500', label: 'Urgente' },
}

const PRIORITIES: Priority[] = ['low', 'normal', 'high', 'urgent']

function SortableItem({ item, onToggle, onDelete, onUpdatePriority }: SortableItemProps) {
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const priority = item.priority || 'normal'
  const priorityConfig = PRIORITY_CONFIG[priority]

  const isOverdue = item.due_date && new Date(item.due_date) < new Date() && !item.is_completed

  return (
    <Card ref={setNodeRef} style={style} className={`group ${isOverdue ? 'border-red-500' : ''}`}>
      <CardContent className="flex items-center gap-3 p-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={onToggle}
          className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
            item.is_completed
              ? 'border-primary bg-primary'
              : 'border-border hover:border-primary'
          }`}
        >
          {item.is_completed && <Check className="h-3 w-3 text-primary-foreground" />}
        </button>
        <div className="flex-1 min-w-0">
          <span className={`block truncate ${item.is_completed ? 'line-through opacity-60' : ''}`}>
            {item.content}
          </span>
          {item.due_date && (
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
              <Calendar className="h-3 w-3" />
              {new Date(item.due_date).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>

        {/* Priority indicator */}
        <div className="relative">
          <button
            onClick={() => setShowPriorityMenu(!showPriorityMenu)}
            className={`p-1 rounded hover:bg-accent ${priorityConfig.color}`}
            title={`Priorité: ${priorityConfig.label}`}
          >
            <Flag className="h-4 w-4" />
          </button>
          {showPriorityMenu && (
            <div className="absolute right-0 top-full mt-1 bg-popover border rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onUpdatePriority(p)
                    setShowPriorityMenu(false)
                  }}
                  className={`w-full text-left px-3 py-1.5 text-sm hover:bg-accent flex items-center gap-2 ${
                    p === priority ? 'bg-accent' : ''
                  }`}
                >
                  <Flag className={`h-3 w-3 ${PRIORITY_CONFIG[p].color}`} />
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardContent>
    </Card>
  )
}

export function ListDetail({ list, onBack }: ListDetailProps) {
  const [newItemContent, setNewItemContent] = useState('')
  const { items, fetchItems, createItem, toggleItemComplete, deleteItem, updateItem, reorderItems, loading } = useListStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchItems(list.id)
  }, [list.id, fetchItems])

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemContent.trim()) return

    await createItem(list.id, newItemContent.trim())
    setNewItemContent('')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      const newItems = arrayMove(items, oldIndex, newIndex)
      reorderItems(newItems)
    }
  }

  const handleUpdatePriority = (itemId: string, priority: Priority) => {
    updateItem(itemId, { priority })
  }

  // Sort items: urgent first, then by priority, then by position
  const sortedPendingItems = items
    .filter((item) => !item.is_completed)
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
      const aPriority = priorityOrder[a.priority || 'normal']
      const bPriority = priorityOrder[b.priority || 'normal']
      if (aPriority !== bPriority) return aPriority - bPriority
      return a.position - b.position
    })

  const completedItems = items.filter((item) => item.is_completed)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">{list.name}</h2>
      </div>

      {/* Add item form */}
      <form onSubmit={handleAddItem} className="flex gap-2">
        <Input
          placeholder="Ajouter un élément..."
          value={newItemContent}
          onChange={(e) => setNewItemContent(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !newItemContent.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {/* Priority legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        {PRIORITIES.map((p) => (
          <span key={p} className="flex items-center gap-1">
            <Flag className={`h-3 w-3 ${PRIORITY_CONFIG[p].color}`} />
            {PRIORITY_CONFIG[p].label}
          </span>
        ))}
      </div>

      {/* Pending items with drag and drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortedPendingItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sortedPendingItems.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                onToggle={() => toggleItemComplete(item.id)}
                onDelete={() => deleteItem(item.id)}
                onUpdatePriority={(priority) => handleUpdatePriority(item.id, priority)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Completed items */}
      {completedItems.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Complétés ({completedItems.length})
          </h3>
          {completedItems.map((item) => (
            <Card key={item.id} className="group opacity-60">
              <CardContent className="flex items-center gap-3 p-3">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0" />
                <button
                  onClick={() => toggleItemComplete(item.id)}
                  className="h-5 w-5 rounded border border-primary bg-primary flex items-center justify-center"
                >
                  <Check className="h-3 w-3 text-primary-foreground" />
                </button>
                <span className="flex-1 line-through">{item.content}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Aucun élément dans cette liste</p>
          <p className="text-sm">Ajoutez votre premier élément ci-dessus</p>
        </div>
      )}
    </div>
  )
}
