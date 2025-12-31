import { useState, useEffect } from 'react'
import { notificationService } from '@/lib/notifications'

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    const init = async () => {
      const enabled = await notificationService.init()
      setIsEnabled(enabled)
      setPermission(enabled ? 'granted' : 'default')
    }

    init()

    return () => {
      // Cleanup on unmount
      notificationService.destroy()
    }
  }, [])

  const requestPermission = async () => {
    const granted = await notificationService.requestPermission()
    setPermission(granted ? 'granted' : 'denied')
    setIsEnabled(granted)
    return granted
  }

  const sendNotification = (title: string, body: string, data?: any) => {
    notificationService.sendNotification(title, body, data)
  }

  return {
    permission,
    isEnabled,
    requestPermission,
    sendNotification
  }
}
