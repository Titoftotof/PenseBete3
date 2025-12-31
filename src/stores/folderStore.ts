import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Folder } from '@/types'

interface FolderStore {
  folders: Folder[]
  loading: boolean
  error: string | null

  fetchFolders: () => Promise<void>
  createFolder: (name: string, color?: string) => Promise<Folder | null>
  updateFolder: (id: string, updates: Partial<Pick<Folder, 'name' | 'color'>>) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
}

export const useFolderStore = create<FolderStore>((set) => ({
  folders: [],
  loading: false,
  error: null,

  fetchFolders: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      set({ error: error.message, loading: false })
    } else {
      set({ folders: data || [], loading: false })
    }
  },

  createFolder: async (name: string, color?: string) => {
    set({ loading: true, error: null })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      set({ error: 'Non authentifié', loading: false })
      return null
    }

    const { data, error } = await supabase
      .from('folders')
      .insert({ name, color: color || '#6b7280', user_id: user.id })
      .select()
      .single()

    if (error) {
      set({ error: error.message, loading: false })
      return null
    }

    set((state) => ({
      folders: [data, ...state.folders],
      loading: false,
    }))
    return data
  },

  updateFolder: async (id: string, updates) => {
    set({ loading: true, error: null })
    const { error } = await supabase
      .from('folders')
      .update(updates)
      .eq('id', id)

    if (error) {
      set({ error: error.message, loading: false })
    } else {
      set((state) => ({
        folders: state.folders.map((folder) =>
          folder.id === id ? { ...folder, ...updates } : folder
        ),
        loading: false,
      }))
    }
  },

  deleteFolder: async (id: string) => {
    set({ loading: true, error: null })
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)

    if (error) {
      set({ error: error.message, loading: false })
    } else {
      set((state) => ({
        folders: state.folders.filter((folder) => folder.id !== id),
        loading: false,
      }))
    }
  },
}))
