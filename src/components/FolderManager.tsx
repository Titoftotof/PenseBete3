import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Folder, Plus, Trash2, Edit2, X, Check } from 'lucide-react'
import { useFolderStore } from '@/stores/folderStore'
import { useListStore } from '@/stores/listStore'

const FOLDER_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
]

interface FolderManagerProps {
  onSelectFolder: (folderId: string | null) => void
  selectedFolderId: string | null
}

export function FolderManager({ onSelectFolder, selectedFolderId }: FolderManagerProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[4])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const { folders, fetchFolders, createFolder, updateFolder, deleteFolder, loading } = useFolderStore()
  const { lists } = useListStore()

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    await createFolder(newFolderName.trim(), newFolderColor)
    setNewFolderName('')
    setShowCreate(false)
  }

  const handleStartEdit = (folder: { id: string; name: string }) => {
    setEditingId(folder.id)
    setEditName(folder.name)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return
    await updateFolder(editingId, { name: editName.trim() })
    setEditingId(null)
  }

  const handleDeleteFolder = async (id: string) => {
    if (confirm('Supprimer ce dossier ? Les listes ne seront pas supprimées.')) {
      await deleteFolder(id)
      if (selectedFolderId === id) {
        onSelectFolder(null)
      }
    }
  }

  const getListCountInFolder = (folderId: string) => {
    return lists.filter((list) => list.folder_id === folderId).length
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Folder className="h-4 w-4" />
          Dossiers
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {/* Create folder form */}
      {showCreate && (
        <Card>
          <CardContent className="p-3 space-y-3">
            <Input
              placeholder="Nom du dossier"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="flex gap-2">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewFolderColor(color)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    newFolderColor === color ? 'scale-125 ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={handleCreateFolder}
              disabled={loading || !newFolderName.trim()}
            >
              Créer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All lists button */}
      <button
        onClick={() => onSelectFolder(null)}
        className={`w-full text-left p-3 rounded-lg transition-colors ${
          selectedFolderId === null
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-current opacity-50" />
          <span className="flex-1">Toutes les listes</span>
          <span className="text-sm opacity-70">{lists.length}</span>
        </div>
      </button>

      {/* Folders list */}
      <div className="space-y-1">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`group flex items-center gap-2 p-3 rounded-lg transition-colors cursor-pointer ${
              selectedFolderId === folder.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
            onClick={() => onSelectFolder(folder.id)}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: folder.color }}
            />

            {editingId === folder.id ? (
              <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                  className="h-7 text-sm"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveEdit}>
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <span className="flex-1 truncate">{folder.name}</span>
                <span className="text-sm opacity-70">{getListCountInFolder(folder.id)}</span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => handleStartEdit(folder)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => handleDeleteFolder(folder.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {folders.length === 0 && !showCreate && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun dossier. Créez-en un pour organiser vos listes.
        </p>
      )}
    </div>
  )
}
