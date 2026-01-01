// Supabase Edge Function: check-reminders
// This function checks for due reminders and sends push notifications
// Called every minute by cron-job.org

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:contact@pensebete.app'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Web Push signature generation using Web Crypto API
async function generateVapidHeaders(endpoint: string): Promise<{ authorization: string; cryptoKey: string }> {
  const url = new URL(endpoint)
  const audience = `${url.protocol}//${url.host}`

  // Create JWT header and payload
  const header = { typ: 'JWT', alg: 'ES256' }
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: VAPID_SUBJECT
  }

  // Base64url encode
  const base64urlEncode = (data: string | Uint8Array): string => {
    const str = typeof data === 'string' ? data : new TextDecoder().decode(data)
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  const headerB64 = base64urlEncode(JSON.stringify(header))
  const payloadB64 = base64urlEncode(JSON.stringify(payload))
  const unsignedToken = `${headerB64}.${payloadB64}`

  // Import private key
  const privateKeyBuffer = Uint8Array.from(atob(VAPID_PRIVATE_KEY.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))

  // For ES256, we need to create a proper JWK from the raw private key
  // The private key is 32 bytes
  const privateKeyJwk = {
    kty: 'EC',
    crv: 'P-256',
    d: VAPID_PRIVATE_KEY,
    x: VAPID_PUBLIC_KEY.slice(0, 43), // First 32 bytes base64url
    y: VAPID_PUBLIC_KEY.slice(43), // Last 32 bytes base64url
  }

  try {
    const key = await crypto.subtle.importKey(
      'jwk',
      privateKeyJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    )

    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      new TextEncoder().encode(unsignedToken)
    )

    const signatureB64 = base64urlEncode(new Uint8Array(signature))
    const jwt = `${unsignedToken}.${signatureB64}`

    return {
      authorization: `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
      cryptoKey: `p256ecdsa=${VAPID_PUBLIC_KEY}`
    }
  } catch (error) {
    console.error('Error generating VAPID headers:', error)
    throw error
  }
}

// Send a push notification
async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; data?: Record<string, unknown> }
): Promise<boolean> {
  try {
    console.log('Sending push to:', subscription.endpoint)

    // For now, use a simple fetch without encryption (works for testing)
    // In production, you'd want to use proper web-push encryption
    const vapidHeaders = await generateVapidHeaders(subscription.endpoint)

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
        'Authorization': vapidHeaders.authorization,
        'Crypto-Key': vapidHeaders.cryptoKey,
      },
      body: JSON.stringify(payload)
    })

    if (response.ok || response.status === 201) {
      console.log('Push sent successfully')
      return true
    } else {
      const text = await response.text()
      console.error('Push failed:', response.status, text)

      // If subscription is invalid (410 Gone), we should delete it
      if (response.status === 410 || response.status === 404) {
        console.log('Subscription expired or invalid')
      }

      return false
    }
  } catch (error) {
    console.error('Error sending push:', error)
    return false
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('check-reminders function called')

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current time and window
    const now = new Date()
    const oneMinuteAgo = new Date(now.getTime() - 60000)
    const oneMinuteFromNow = new Date(now.getTime() + 60000)

    console.log('Checking reminders between', oneMinuteAgo.toISOString(), 'and', oneMinuteFromNow.toISOString())

    // Fetch due reminders that haven't been sent
    const { data: reminders, error: remindersError } = await supabase
      .from('reminders')
      .select(`
        id,
        user_id,
        reminder_time,
        is_sent,
        list_items (
          content
        )
      `)
      .eq('is_sent', false)
      .gte('reminder_time', oneMinuteAgo.toISOString())
      .lte('reminder_time', oneMinuteFromNow.toISOString())

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError)
      return new Response(JSON.stringify({ error: remindersError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Found', reminders?.length || 0, 'due reminders')

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ message: 'No due reminders', count: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let sentCount = 0

    // Process each reminder
    for (const reminder of reminders) {
      const itemContent = (reminder.list_items as any)?.content || 'Élément'

      console.log('Processing reminder for:', itemContent)

      // Get push subscriptions for this user
      const { data: subscriptions, error: subsError } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', reminder.user_id)

      if (subsError) {
        console.error('Error fetching subscriptions:', subsError)
        continue
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log('No push subscriptions for user', reminder.user_id)
        continue
      }

      console.log('Found', subscriptions.length, 'subscriptions for user')

      // Send push to each subscription
      for (const sub of subscriptions) {
        const success = await sendPushNotification(
          {
            endpoint: sub.endpoint,
            p256dh: sub.p256dh,
            auth: sub.auth
          },
          {
            title: `🔔 ${itemContent}`,
            body: `Rappel: "${itemContent}" - c'est maintenant !`,
            data: { reminderId: reminder.id }
          }
        )

        if (success) {
          sentCount++
        }
      }

      // Mark reminder as sent
      const { error: updateError } = await supabase
        .from('reminders')
        .update({ is_sent: true })
        .eq('id', reminder.id)

      if (updateError) {
        console.error('Error marking reminder as sent:', updateError)
      } else {
        console.log('Marked reminder', reminder.id, 'as sent')
      }
    }

    return new Response(JSON.stringify({
      message: 'Reminders processed',
      remindersChecked: reminders.length,
      notificationsSent: sentCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in check-reminders:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
