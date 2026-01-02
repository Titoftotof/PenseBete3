export type ListCategory = 'shopping' | 'tasks' | 'ideas' | 'notes'

export type GroceryCategory =
  | 'Fruits & Légumes'
  | 'Produits Laitiers'
  | 'Boulangerie'
  | 'Viandes & Poissons'
  | 'Surgelés'
  | 'Épicerie'
  | 'Boissons'
  | 'Hygiène & Maison'
  | 'Autres'

export type Priority = 'low' | 'normal' | 'high' | 'urgent'

export interface List {
  id: string
  user_id: string
  name: string
  category: ListCategory
  folder_id?: string
  position: number
  created_at: string
  updated_at: string
}

export interface ListItem {
  id: string
  list_id: string
  content: string
  is_completed: boolean
  is_archived: boolean
  position: number
  priority: Priority
  due_date?: string | null
  grocery_category?: GroceryCategory
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  user_id: string
  name: string
  color?: string
  created_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
}

export interface FrequentItem {
  id: string
  user_id: string
  content: string
  normalized_content: string
  category: string | null
  use_count: number
  last_used: string
  created_at: string
}

export interface Reminder {
  id: string
  user_id: string
  item_id: string
  reminder_time: string
  is_sent: boolean
  sent_at?: string | null
  recurrence_type?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
  recurrence_interval?: number | null
  created_at: string
}
