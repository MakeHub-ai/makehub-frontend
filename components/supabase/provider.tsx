'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient, type Session } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

/**
 * Context to provide Supabase session throughout the app
 * Used for authentication state management
 */
const SupabaseContext = createContext<{
  session: Session | null
}>({
  session: null
})

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()
  // Create Supabase client for client-side usage
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Initial session fetch
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }

    getSession()

    // Listen for authentication state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      router.refresh()
    })

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <SupabaseContext.Provider value={{ session }}>
      {children}
    </SupabaseContext.Provider>
  )
}

/**
 * Hook to access Supabase session anywhere in the app
 * Must be used within SupabaseProvider
 */
export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}
