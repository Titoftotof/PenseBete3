import { useState } from 'react'
import { Mic, MicOff, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard, GlassCardContent } from '@/components/ui/glass-card'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

interface VoiceInputButtonProps {
  onResult: (text: string) => void
  disabled?: boolean
}

export function VoiceInputButton({ onResult, disabled }: VoiceInputButtonProps) {
  const { isListening, transcript, error, startListening, stopListening, isSupported } = useSpeechRecognition()
  const [showResult, setShowResult] = useState(false)

  const handleStart = () => {
    setShowResult(false)
    startListening()
  }

  const handleStop = () => {
    stopListening()
  }

  // When transcript is received, show confirmation modal
  if (transcript && !isListening && !showResult) {
    setShowResult(true)
  }

  const handleConfirm = () => {
    onResult(transcript)
    setShowResult(false)
  }

  const handleCancel = () => {
    setShowResult(false)
  }

  // Not supported state
  if (!isSupported) {
    return (
      <Button
        type="button"
        variant="glass"
        size="icon"
        disabled={true}
        className="h-12 w-12 rounded-xl"
        title="Reconnaissance vocale non supportée"
      >
        <MicOff className="h-5 w-5 text-muted-foreground" />
      </Button>
    )
  }

  return (
    <>
      <Button
        type="button"
        variant="glass"
        size="icon"
        disabled={disabled || isListening}
        onClick={handleStart}
        className={`h-12 w-12 rounded-xl transition-all duration-300 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
        }`}
        title={isListening ? 'En écoute...' : 'Ajouter par la voix'}
      >
        {isListening ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
      </Button>

      {/* Listening overlay */}
      {isListening && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full">
            <GlassCardContent className="p-6 text-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 animate-ping absolute opacity-20"></div>
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center relative">
                  <Mic className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Écoute en cours...</h3>
              <p className="text-muted-foreground mb-4">Parlez maintenant pour ajouter des éléments</p>
              <Button
                variant="outline"
                onClick={handleStop}
                className="rounded-xl"
              >
                Annuler
              </Button>
            </GlassCardContent>
          </GlassCard>
        </div>
      )}

      {/* Result confirmation modal */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full">
            <GlassCardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Résultat de la reconnaissance vocale</h3>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
                  {error}
                </div>
              )}
              <div className="p-4 rounded-xl bg-muted/50 mb-4">
                <p className="text-lg">"{transcript}"</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 rounded-xl"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Confirmer
                </Button>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      )}
    </>
  )
}
