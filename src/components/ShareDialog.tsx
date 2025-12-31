import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Share2, X, Users, Trash2, Mail } from 'lucide-react'
import { useShareStore, type SharePermission } from '@/stores/shareStore'
import type { List } from '@/types'

interface ShareDialogProps {
  list: List
  onClose: () => void
}

export function ShareDialog({ list, onClose }: ShareDialogProps) {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<SharePermission>('read')
  const { shares, fetchShares, shareList, updateSharePermission, removeShare, loading, error } = useShareStore()

  useEffect(() => {
    fetchShares(list.id)
  }, [list.id, fetchShares])

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    const result = await shareList(list.id, email.trim(), permission)
    if (result) {
      setEmail('')
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Partager "{list.name}"
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Share form */}
          <form onSubmit={handleShare} className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value as SharePermission)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="read">Lecture seule</option>
                <option value="write">Lecture et écriture</option>
              </select>
              <Button type="submit" disabled={loading || !email.trim()}>
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </form>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Shared with */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Partagé avec ({shares.length})
            </h4>

            {shares.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Cette liste n'est partagée avec personne.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-accent/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {share.shared_with_email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {share.permission === 'write' ? 'Lecture et écriture' : 'Lecture seule'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <select
                        value={share.permission}
                        onChange={(e) => updateSharePermission(share.id, e.target.value as SharePermission)}
                        className="h-8 text-xs rounded border border-input bg-background px-2"
                      >
                        <option value="read">Lecture</option>
                        <option value="write">Écriture</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeShare(share.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
