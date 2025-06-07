'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleGithubSignIn = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      // Use the redirectTo option to specify where to redirect after sign-in
      options: { redirectTo: window.location.origin }
    })
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  return (
    <div className="flex w-full items-center justify-center px-6 py-8">
      <Card className="w-full max-w-[400px] mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription className="text-sm">Choose a login method to continue</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-y-4">
          <Button size="lg" variant="outline" type="button" onClick={handleGithubSignIn} disabled={loading} className="w-full">
            <Icons.gitHub className="mr-2 size-5" />
            Continue with GitHub
          </Button>
          <Button size="lg" variant="outline" type="button" onClick={handleGoogleSignIn} disabled={loading} className="w-full">
            <Icons.google className="mr-2 size-5" />
            Continue with Google
          </Button>
        </CardContent>
        
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          {loading && "Redirecting to login provider..."}
        </CardFooter>
      </Card>
    </div>
  )
}

export { SignInPage }