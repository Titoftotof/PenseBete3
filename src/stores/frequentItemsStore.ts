import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { FrequentItem } from '@/types'

interface FrequentItemsStore {
  frequentItems: FrequentItem[]
  loading: boolean
  error: string | null

  fetchFrequentItems: () => Promise<void>
  trackItem: (content: string, category?: string | null) => Promise<void>
  getTopItems: (limit?: number) => FrequentItem[]
}

// Helper function to normalize text for comparison
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, ' ')
}

export const useFrequentItemsStore = create<FrequentItemsStore>((set, get) => ({
  frequentItems: [],
  loading: false,
  error: null,

  // Fetch all frequent items for current user
  fetchFrequentItems: async () => {
    set({ loading: true, error: null })

    const { data, error } = await supabase
      .from('frequent_items')
      .select('*')
      .order('use_count', { ascending: false })
      .order('last_used', { ascending: false })
      .limit(50)

    if (error) {
      set({ error: error.message, loading: false })
    } else {
      set({ frequentItems: data || [], loading: false })
    }
  },

  // Track a new item or increment usage count
  trackItem: async (content: string, category?: string | null) => {
    const normalizedContent = normalizeText(content)
    const { frequentItems } = get()

    // Check if item already exists in local state
    const existingItem = frequentItems.find(
      item => item.normalized_content === normalizedContent
    )

    if (existingItem) {
      // Update existing item
      const { error } = await supabase
        .from('frequent_items')
        .update({
          use_count: existingItem.use_count + 1,
          last_used: new Date().toISOString(),
          category: category || existingItem.category,
        })
        .eq('id', existingItem.id)

      if (error) {
        set({ error: error.message })
      } else {
        set((state) => ({
          frequentItems: state.frequentItems.map((item) =>
            item.id === existingItem.id
              ? { ...item, use_count: item.use_count + 1, last_used: new Date().toISOString(), category: category || item.category }
              : item
          ),
        }))
      }
    } else {
      // Create new frequent item
      const { data, error } = await supabase
        .from('frequent_items')
        .insert({
          content,
          normalized_content: normalizedContent,
          category,
          use_count: 1,
          last_used: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        // If unique constraint violation, the item was created concurrently
        if (error.code === '23505') {
          // Fetch the existing item and update it
          const { data: existingData } = await supabase
            .from('frequent_items')
            .select('*')
            .eq('normalized_content', normalizedContent)
            .single()

          if (existingData) {
            await supabase
              .from('frequent_items')
              .update({
                use_count: existingData.use_count + 1,
                last_used: new Date().toISOString(),
              })
              .eq('id', existingData.id)

            set((state) => ({
              frequentItems: [existingData, ...state.frequentItems],
            }))
          }
        } else {
          set({ error: error.message })
        }
      } else if (data) {
        set((state) => ({
          frequentItems: [data, ...state.frequentItems],
        }))
      }
    }
  },

  // Get top N frequent items
  getTopItems: (limit: number = 10) => {
    const { frequentItems } = get()
    return frequentItems.slice(0, limit)
  },
}))
