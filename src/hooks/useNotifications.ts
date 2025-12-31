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

  const disableNotifications = () => {
    notificationService.disable()
    setIsEnabled(false)
  }

  const enableNotifications = () => {
    notificationService.enable()
    setIsEnabled(notificationService.isEnabled())
  }

  const toggleNotifications = async () => {
    if (isEnabled) {
      disableNotifications()
    } else {
      // If browser permission is granted, just enable
      if (Notification.permission === 'granted') {
        enableNotifications()
      } else {
        // Otherwise request permission
        await requestPermission()
      }
    }
  }

  const sendNotification = (title: string, body: string, data?: any) => {
    notificationService.sendNotification(title, body, data)
  }

  return {
    permission,
    isEnabled,
    requestPermission,
    disableNotifications,
    enableNotifications,
    toggleNotifications,
    sendNotification
  }
}
