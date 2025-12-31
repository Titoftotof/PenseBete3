import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ShoppingCart, CheckSquare, Lightbulb, FileText, Trash2, FolderOpen, Menu, Share2 } from 'lucide-react'
import { useListStore } from '@/stores/listStore'
import { useFolderStore } from '@/stores/folderStore'
import { useShareStore } from '@/stores/shareStore'
import { CreateListDialog } from '@/components/CreateListDialog'
import { ListDetail } from '@/components/ListDetail'
import { Header } from '@/components/Header'
import { FolderManager } from '@/components/FolderManager'
import { SearchBar } from '@/components/SearchBar'
import { ShareDialog } from '@/components/ShareDialog'
import type { List, ListCategory } from '@/types'

const categories: { id: ListCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'shopping', label: 'Courses', icon: <ShoppingCart className="h-5 w-5" />, color: 'bg-green-500' },
  { id: 'tasks', label: 'Tâches', icon: <CheckSquare className="h-5 w-5" />, color: 'bg-blue-500' },
  { id: 'ideas', label: 'Idées', icon: <Lightbulb className="h-5 w-5" />, color: 'bg-yellow-500' },
  { id: 'notes', label: 'Notes', icon: <FileText className="h-5 w-5" />, color: 'bg-purple-500' },
]

export default function DashboardPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ListCategory | null>(null)
  const [selectedList, setSelectedList] = useState<List | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSidebar, setShowSidebar] = useState(false)
  const [sharingList, setSharingList] = useState<List | null>(null)

  const { lists, fetchLists, deleteList, loading } = useListStore()
  const { folders } = useFolderStore()
  const { fetchSharedWithMe } = useShareStore()

  useEffect(() => {
    fetchLists()
    fetchSharedWithMe()
  }, [fetchLists, fetchSharedWithMe])

  // Filter lists based on search, folder, and category
  const filteredLists = useMemo(() => {
    let result = lists

    // Filter by folder
    if (selectedFolderId) {
      result = result.filter((list) => list.folder_id === selectedFolderId)
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((list) => list.category === selectedCategory)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((list) => list.name.toLowerCase().includes(query))
    }

    return result
  }, [lists, selectedFolderId, selectedCategory, searchQuery])

  const getListCountByCategory = (category: ListCategory) => {
    const baseLists = selectedFolderId
      ? lists.filter((list) => list.folder_id === selectedFolderId)
      : lists
    return baseLists.filter((list) => list.category === category).length
  }

  const handleCategoryClick = (category: ListCategory) => {
    setSelectedCategory(category)
  }

  const handleCreateList = (category?: ListCategory) => {
    setSelectedCategory(category || null)
    setShowCreateDialog(true)
  }

  const handleListClick = (list: List) => {
    setSelectedList(list)
  }

  const handleDeleteList = async (e: React.MouseEvent, listId: string) => {
    e.stopPropagation()
    if (confirm('Supprimer cette liste ?')) {
      await deleteList(listId)
    }
  }

  const handleShareList = (e: React.MouseEvent, list: List) => {
    e.stopPropagation()
    setSharingList(list)
  }

  const getFolderName = (folderId: string | null | undefined) => {
    if (!folderId) return null
    const folder = folders.find((f) => f.id === folderId)
    return folder?.name
  }

  // If a list is selected, show the list detail view
  if (selectedList) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <ListDetail list={selectedList} onBack={() => setSelectedList(null)} />
        </main>
      </div>
    )
  }

  // If a category is selected, show lists in that category
  if (selectedCategory) {
    const categoryInfo = categories.find((c) => c.id === selectedCategory)!

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setSelectedCategory(null)}>
                ← Retour
              </Button>
              <div className={`w-8 h-8 rounded-full ${categoryInfo.color} flex items-center justify-center text-white`}>
                {categoryInfo.icon}
              </div>
              <h2 className="text-xl font-bold">{categoryInfo.label}</h2>
            </div>
            <Button onClick={() => handleCreateList(selectedCategory)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle liste
            </Button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <SearchBar onSearch={setSearchQuery} placeholder="Rechercher dans cette catégorie..." />
          </div>

          {filteredLists.length > 0 ? (
            <div className="grid gap-3">
              {filteredLists.map((list) => (
                <Card
                  key={list.id}
                  className="cursor-pointer hover:shadow-md transition-shadow group"
                  onClick={() => handleListClick(list)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-medium">{list.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getFolderName(list.folder_id) && (
                          <span className="mr-2">
                            <FolderOpen className="h-3 w-3 inline mr-1" />
                            {getFolderName(list.folder_id)}
                          </span>
                        )}
                        Créée le {new Date(list.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleShareList(e, list)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteList(e, list.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Aucun résultat' : 'Aucune liste dans cette catégorie'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => handleCreateList(selectedCategory)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une liste
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>

        <CreateListDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          defaultCategory={selectedCategory}
        />

        {sharingList && (
          <ShareDialog
            list={sharingList}
            onClose={() => setSharingList(null)}
          />
        )}
      </div>
    )
  }

  // Default: show categories overview with sidebar
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        {/* Mobile sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 left-4 z-50 md:hidden shadow-lg bg-primary text-primary-foreground"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-card border-r p-4 z-40 transition-transform md:translate-x-0 ${
            showSidebar ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="pt-16 md:pt-4">
            <FolderManager
              selectedFolderId={selectedFolderId}
              onSelectFolder={(id) => {
                setSelectedFolderId(id)
                setShowSidebar(false)
              }}
            />
          </div>
        </aside>

        {/* Overlay for mobile */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 container mx-auto px-4 py-6">
          {/* Search */}
          <div className="mb-6">
            <SearchBar onSearch={setSearchQuery} placeholder="Rechercher une liste..." />
          </div>

          {/* Current folder indicator */}
          {selectedFolderId && (
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <FolderOpen className="h-4 w-4" />
              <span>Dossier: {getFolderName(selectedFolderId)}</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFolderId(null)}>
                ✕
              </Button>
            </div>
          )}

          {/* Categories grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardHeader className="pb-2">
                  <div className={`w-10 h-10 rounded-full ${category.color} flex items-center justify-center text-white mb-2`}>
                    {category.icon}
                  </div>
                  <CardTitle className="text-lg">{category.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {getListCountByCategory(category.id)} liste{getListCountByCategory(category.id) !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Lists */}
          {filteredLists.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {searchQuery ? `Résultats pour "${searchQuery}"` : 'Listes récentes'}
              </h2>
              <div className="grid gap-3">
                {filteredLists.slice(0, searchQuery ? undefined : 10).map((list) => {
                  const categoryInfo = categories.find((c) => c.id === list.category)!
                  return (
                    <Card
                      key={list.id}
                      className="cursor-pointer hover:shadow-md transition-shadow group"
                      onClick={() => handleListClick(list)}
                    >
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className={`w-8 h-8 rounded-full ${categoryInfo.color} flex items-center justify-center text-white`}>
                          {categoryInfo.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{list.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {categoryInfo.label}
                            {getFolderName(list.folder_id) && ` • ${getFolderName(list.folder_id)}`}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleShareList(e, list)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleDeleteList(e, list.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">
                  {searchQuery ? 'Aucun résultat' : 'Aucune liste pour le moment'}
                </h3>
                {!searchQuery && (
                  <>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Créez votre première liste pour commencer à organiser vos idées
                    </p>
                    <Button onClick={() => handleCreateList()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer une liste
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </main>
      </div>

      <CreateListDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        defaultCategory={selectedCategory || undefined}
      />

      {sharingList && (
        <ShareDialog
          list={sharingList}
          onClose={() => setSharingList(null)}
        />
      )}
    </div>
  )
}
