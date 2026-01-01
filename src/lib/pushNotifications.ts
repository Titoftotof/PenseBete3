import { supabase } from './supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

/**
 * Convert a base64 string to Uint8Array (for VAPID key)
 */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray.buffer as ArrayBuffer
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

/**
 * Get the current push subscription
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null

  try {
    const registration = await navigator.serviceWorker.ready
    return await registration.pushManager.getSubscription()
  } catch (error) {
    console.error('[Push] Error getting subscription:', error)
    return null
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.log('[Push] Push notifications not supported')
    return null
  }

  if (!VAPID_PUBLIC_KEY) {
    console.error('[Push] VAPID public key not configured')
    return null
  }

  try {
    // Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready
    console.log('[Push] Service worker ready')

    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      console.log('[Push] Already subscribed')
      // Save to database in case it's not there
      await saveSubscriptionToDatabase(subscription)
      return subscription
    }

    // Subscribe to push
    console.log('[Push] Subscribing to push...')
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })

    console.log('[Push] Subscribed successfully:', subscription.endpoint)

    // Save subscription to database
    await saveSubscriptionToDatabase(subscription)

    return subscription
  } catch (error) {
    console.error('[Push] Error subscribing:', error)
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const subscription = await getCurrentSubscription()
    if (!subscription) return true

    // Remove from database first
    await removeSubscriptionFromDatabase(subscription)

    // Unsubscribe from push manager
    await subscription.unsubscribe()
    console.log('[Push] Unsubscribed successfully')

    return true
  } catch (error) {
    console.error('[Push] Error unsubscribing:', error)
    return false
  }
}

/**
 * Save subscription to Supabase database
 */
async function saveSubscriptionToDatabase(subscription: PushSubscription): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('[Push] No user logged in')
    return
  }

  const subscriptionJson = subscription.toJSON()
  const keys = subscriptionJson.keys as { p256dh: string; auth: string }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth
    }, {
      onConflict: 'user_id,endpoint'
    })

  if (error) {
    console.error('[Push] Error saving subscription:', error)
  } else {
    console.log('[Push] Subscription saved to database')
  }
}

/**
 * Remove subscription from Supabase database
 */
async function removeSubscriptionFromDatabase(subscription: PushSubscription): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', subscription.endpoint)

  if (error) {
    console.error('[Push] Error removing subscription:', error)
  } else {
    console.log('[Push] Subscription removed from database')
  }
}

/**
 * Initialize push notifications (call after user login)
 */
export async function initPushNotifications(): Promise<boolean> {
  console.log('[Push] Initializing push notifications...')

  if (!isPushSupported()) {
    console.log('[Push] Push not supported')
    return false
  }

  // Check if notification permission is granted
  if (Notification.permission !== 'granted') {
    console.log('[Push] Notification permission not granted')
    return false
  }

  // Subscribe to push
  const subscription = await subscribeToPush()
  return subscription !== null
}
