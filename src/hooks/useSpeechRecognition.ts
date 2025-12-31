import { useState, useEffect, useCallback, useRef } from 'react'

export interface UseSpeechRecognitionResult {
  isListening: boolean
  transcript: string
  error: string | null
  startListening: () => void
  stopListening: () => void
  isSupported: boolean
}

// Check if SpeechRecognition is available
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  const isSupported = !!SpeechRecognitionAPI

  useEffect(() => {
    if (!isSupported) {
      setError('La reconnaissance vocale n\'est pas supportée par ce navigateur. Utilisez Chrome, Safari ou Edge.')
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'fr-FR'

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event: any) => {
      const { transcript: resultTranscript } = event.results[0][0]
      setTranscript(resultTranscript)
    }

    recognition.onerror = (event: any) => {
      const errorMessages: Record<string, string> = {
        'no-speech': 'Aucune parole détectée. Réessayez.',
        'audio-capture': 'Aucun microphone détecté.',
        'not-allowed': 'L\'accès au microphone a été refusé.',
        'network': 'Erreur réseau. Vérifiez votre connexion.',
        'aborted': 'Reconnaissance vocale interrompue.',
      }
      setError(errorMessages[event.error] || `Erreur: ${event.error}`)
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [isSupported])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('La reconnaissance vocale n\'est pas supportée par ce navigateur.')
      return
    }

    setTranscript('')
    setError(null)

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        // Recognition might already be started
        setError('La reconnaissance vocale est déjà en cours.')
      }
    }
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported,
  }
}
