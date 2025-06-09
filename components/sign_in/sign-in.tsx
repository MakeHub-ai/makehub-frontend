'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons' // Importer les icônes

export function SignInForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { signInWithGoogle, signInWithGitHub } = useAuth() // Retirer signInWithEmail

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setError(error.message)
      }
    } catch (_err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await signInWithGitHub()
      if (error) {
        setError(error.message)
      }
    } catch (_err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 w-full max-w-sm p-6 mx-auto flex flex-col items-center">
      {error && (
        <div className="text-red-600 text-sm mb-4 p-2 bg-red-100 border border-red-300 rounded-md w-full text-center">{error}</div>
      )}

      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2 py-3 text-base"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <Icons.google className="h-5 w-5" />
        {loading ? 'Connexion...' : 'Se connecter avec Google'}
      </Button>

      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2 py-3 text-base"
        onClick={handleGitHubSignIn}
        disabled={loading}
      >
        <Icons.gitHub className="h-5 w-5" />
        {loading ? 'Connexion...' : 'Se connecter avec GitHub'}
      </Button>
    </div>
  )
}
