import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Reminder } from '@/types'

interface ReminderStore {
  reminders: Reminder[]
  loading: boolean
  error: string | null

  fetchReminders: () => Promise<void>
  createReminder: (itemId: string, reminderTime: Date) => Promise<Reminder | null>
  updateReminder: (reminderId: string, reminderTime: Date) => Promise<void>
  deleteReminder: (reminderId: string) => Promise<void>
  markAsSent: (reminderId: string) => Promise<void>
  getUpcomingReminders: () => Reminder[]
  getReminderByItemId: (itemId: string) => Reminder | null
}

export const useReminderStore = create<ReminderStore>((set, get) => ({
  reminders: [],
  loading: false,
  error: null,

  // Fetch all reminders for current user
  fetchReminders: async () => {
    set({ loading: true, error: null })

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('reminder_time', { ascending: true })

    if (error) {
      set({ error: error.message, loading: false })
    } else {
      set({ reminders: data || [], loading: false })
    }
  },

  // Create a new reminder for an item
  createReminder: async (itemId: string, reminderTime: Date) => {
    set({ loading: true, error: null })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      set({ error: 'Non authentifié', loading: false })
      return null
    }

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: user.id,
        item_id: itemId,
        reminder_time: reminderTime.toISOString(),
      })
      .select()
      .single()

    if (error) {
      set({ error: error.message, loading: false })
      return null
    }

    set((state) => ({
      reminders: [...state.reminders, data],
      loading: false
    }))
    return data
  },

  // Update reminder time
  updateReminder: async (reminderId: string, reminderTime: Date) => {
    set({ loading: true, error: null })

    const { error } = await supabase
      .from('reminders')
      .update({ reminder_time: reminderTime.toISOString() })
      .eq('id', reminderId)

    if (error) {
      set({ error: error.message, loading: false })
    } else {
      set((state) => ({
        reminders: state.reminders.map((reminder) =>
          reminder.id === reminderId
            ? { ...reminder, reminder_time: reminderTime.toISOString() }
            : reminder
        ),
        loading: false,
      }))
    }
  },

  // Delete a reminder
  deleteReminder: async (reminderId: string) => {
    set({ loading: true, error: null })

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId)

    if (error) {
      set({ error: error.message, loading: false })
    } else {
      set((state) => ({
        reminders: state.reminders.filter((reminder) => reminder.id !== reminderId),
        loading: false,
      }))
    }
  },

  // Mark reminder as sent
  markAsSent: async (reminderId: string) => {
    const { error } = await supabase
      .from('reminders')
      .update({ is_sent: true })
      .eq('id', reminderId)

    if (error) {
      set({ error: error.message })
    } else {
      set((state) => ({
        reminders: state.reminders.map((reminder) =>
          reminder.id === reminderId
            ? { ...reminder, is_sent: true }
            : reminder
        ),
      }))
    }
  },

  // Get upcoming reminders (not sent and in the future)
  getUpcomingReminders: () => {
    const { reminders } = get()
    const now = new Date().toISOString()

    return reminders.filter(
      (reminder) => !reminder.is_sent && reminder.reminder_time > now
    )
  },

  // Get reminder by item ID
  getReminderByItemId: (itemId: string) => {
    const { reminders } = get()
    return reminders.find((reminder) => reminder.item_id === itemId) || null
  },
}))

// Real-time subscription for reminders
export function subscribeToReminders() {
  const channel = supabase
    .channel('reminders_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reminders',
      },
      (payload) => {
        const { reminders } = useReminderStore.getState()

        if (payload.eventType === 'INSERT') {
          useReminderStore.setState({ reminders: [...reminders, payload.new as Reminder] })
        } else if (payload.eventType === 'UPDATE') {
          useReminderStore.setState({
            reminders: reminders.map((reminder) =>
              reminder.id === payload.new.id ? (payload.new as Reminder) : reminder
            ),
          })
        } else if (payload.eventType === 'DELETE') {
          useReminderStore.setState({
            reminders: reminders.filter((reminder) => reminder.id !== payload.old.id),
          })
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
