import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, ShoppingCart, CheckSquare, Lightbulb, FileText } from 'lucide-react'
import { useListStore } from '@/stores/listStore'
import type { ListCategory } from '@/types'

interface CreateListDialogProps {
  isOpen: boolean
  onClose: () => void
  defaultCategory?: ListCategory
}

const categories: { id: ListCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'shopping', label: 'Courses', icon: <ShoppingCart className="h-5 w-5" /> },
  { id: 'tasks', label: 'Tâches', icon: <CheckSquare className="h-5 w-5" /> },
  { id: 'ideas', label: 'Idées', icon: <Lightbulb className="h-5 w-5" /> },
  { id: 'notes', label: 'Notes', icon: <FileText className="h-5 w-5" /> },
]

export function CreateListDialog({ isOpen, onClose, defaultCategory }: CreateListDialogProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ListCategory>(defaultCategory || 'shopping')
  const { createList, loading } = useListStore()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const list = await createList(name.trim(), category)
    if (list) {
      setName('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Nouvelle liste</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Nom de la liste"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    category === cat.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  {cat.icon}
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={loading || !name.trim()}>
                {loading ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
