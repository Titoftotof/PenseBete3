export type ListCategory = 'shopping' | 'tasks' | 'ideas' | 'notes'

export type Priority = 'low' | 'normal' | 'high' | 'urgent'

export interface List {
  id: string
  user_id: string
  name: string
  category: ListCategory
  folder_id?: string
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
  due_date?: string
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
