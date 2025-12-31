import { supabase } from './supabase'

const NOTIFICATIONS_ENABLED_KEY = 'pensebete-notifications-enabled'

class NotificationService {
  private permission: NotificationPermission = 'default'
  private checkInterval: number | null = null

  async init() {
    if (!('Notification' in window)) {
      console.log('Ce navigateur ne supporte pas les notifications')
      return false
    }

    // Load saved preference
    const savedPermission = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY)
    if (savedPermission === 'granted') {
      this.permission = 'granted'
    }

    // Start checking for reminders periodically
    this.startReminderCheck()

    return this.permission === 'granted'
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    if (this.permission !== 'denied') {
      const result = await Notification.requestPermission()
      this.permission = result

      if (result === 'granted') {
        localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'granted')
        return true
      } else {
        localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, result)
        return false
      }
    }

    return false
  }

  isEnabled(): boolean {
    return this.permission === 'granted' || localStorage.getItem(NOTIFICATIONS_ENABLED_KEY) === 'granted'
  }

  sendNotification(title: string, body: string, data?: any) {
    if (!this.isEnabled()) return

    // Check if we're in a browser context
    if (typeof window === 'undefined') return

    // Use Service Worker if available, otherwise fallback to regular Notification
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        data: { title, body, data }
      })
    } else {
      new Notification(title, {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: data?.itemId || 'default',
        data
      } as NotificationOptions)
    }
  }

  /**
   * Start periodic check for reminders (every minute)
   */
  private startReminderCheck() {
    if (this.checkInterval) return

    this.checkReminders() // Initial check
    this.checkInterval = window.setInterval(() => {
      this.checkReminders()
    }, 60000) // Check every minute
  }

  /**
   * Stop periodic check for reminders
   */
  private stopReminderCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  /**
   * Check for due reminders from Supabase
   */
  async checkReminders() {
    if (!this.isEnabled()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const now = new Date().toISOString()
    const oneHourFromNow = new Date(Date.now() + 3600000).toISOString()

    // Fetch reminders that are due within the next hour and not yet sent
    const { data: reminders } = await supabase
      .from('reminders')
      .select(`
        *,
        list_items (
          content,
          lists (
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('is_sent', false)
      .gte('reminder_time', now)
      .lte('reminder_time', oneHourFromNow)

    if (!reminders) return

    // Get notified reminder IDs from localStorage
    const notifiedKey = 'pensebete-notified-reminders'
    const notified = JSON.parse(localStorage.getItem(notifiedKey) || '[]')

    for (const reminder of reminders as any[]) {
      const reminderId = reminder.id
      const itemName = reminder.list_items?.content || 'Élément'
      const listName = reminder.list_items?.lists?.name || 'Liste'

      // Check if already notified
      if (notified.includes(reminderId)) continue

      // Calculate time until reminder
      const reminderTime = new Date(reminder.reminder_time)
      const timeDiff = reminderTime.getTime() - Date.now()

      // Send notification
      if (timeDiff <= 60000) {
        // Due within 1 minute - send now
        this.sendNotification(
          `Rappel: ${itemName}`,
          `Élément "${itemName}" de la liste "${listName}" est à échéance maintenant !`,
          { itemId: reminder.item_id }
        )
      } else {
        // Due within the hour
        this.sendNotification(
          `Rappel: ${itemName}`,
          `Élément "${itemName}" de la liste "${listName}" à échéance dans ${Math.ceil(timeDiff / 60000)} minutes`,
          { itemId: reminder.item_id }
        )
      }

      // Mark as notified locally
      notified.push(reminderId)
      localStorage.setItem(notifiedKey, JSON.stringify(notified))

      // Mark as sent in database
      await supabase
        .from('reminders')
        .update({ is_sent: true })
        .eq('id', reminderId)
    }

    // Also check for overdue reminders
    const { data: overdueReminders } = await supabase
      .from('reminders')
      .select(`
        *,
        list_items (
          content,
          lists (
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('is_sent', false)
      .lt('reminder_time', now)

    if (overdueReminders) {
      for (const reminder of overdueReminders as any[]) {
        const overdueKey = `${reminder.id}-overdue`
        if (notified.includes(overdueKey)) continue

        const itemName = reminder.list_items?.content || 'Élément'
        const listName = reminder.list_items?.lists?.name || 'Liste'

        this.sendNotification(
          `Échéance dépassée: ${itemName}`,
          `L'élément "${itemName}" de la liste "${listName}" est en retard !`,
          { itemId: reminder.item_id }
        )

        notified.push(overdueKey)
        localStorage.setItem(notifiedKey, JSON.stringify(notified))
      }
    }
  }

  /**
   * Clean up old notified reminders from localStorage
   */
  cleanupNotifiedReminders() {
    const notifiedKey = 'pensebete-notified-reminders'
    const notified = JSON.parse(localStorage.getItem(notifiedKey) || '[]')

    // Note: We can't easily filter by time without storing timestamps
    // For now, just limit the array size
    if (notified.length > 100) {
      localStorage.setItem(notifiedKey, JSON.stringify(notified.slice(-50)))
    }
  }

  /**
   * Destroy the notification service
   */
  destroy() {
    this.stopReminderCheck()
  }
}

export const notificationService = new NotificationService()

// Hook for using notifications in components
export function initNotifications() {
  return notificationService.init()
}

export function requestNotificationPermission() {
  return notificationService.requestPermission()
}

export function sendNotification(title: string, body: string, data?: any) {
  return notificationService.sendNotification(title, body, data)
}
