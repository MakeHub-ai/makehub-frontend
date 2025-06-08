'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signInWithGitHub: () => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  signInWithEmail: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signInWithGitHub: async () => ({ error: null })
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initial user fetch using getUser()
        const { data: { user: initialUser }, error: initialError } = await supabase.auth.getUser();
        console.log('Auth initialization (getUser):', {
          hasUser: !!initialUser,
          error: initialError?.message
        });

        if (initialError) {
          // Don't throw, allow onAuthStateChange to handle session restoration
          console.error('Initial getUser error:', initialError);
        }
        setUser(initialUser ?? null);
        // Session will be set by onAuthStateChange

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('Auth state change:', {
              event,
              hasSession: !!currentSession,
              hasAccessToken: !!currentSession?.access_token,
            });
            setSession(currentSession); // Set session from the event

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              // Fetch user again to ensure it's validated
              const { data: { user: updatedUser }, error: getUserError } = await supabase.auth.getUser();
              if (getUserError) {
                console.error('Error fetching user on auth state change:', getUserError);
                setUser(null); // Or handle error appropriately
              } else {
                setUser(updatedUser ?? null);
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
            }
            
            // Refresh the page to update server-side auth state
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
              router.refresh();
            }
          }
        );

        // Immediately set session if initialUser exists, as onAuthStateChange might not fire immediately
        // if a session is already active from a previous page load.
        if (initialUser) {
          const { data: { session: activeSession } } = await supabase.auth.getSession(); // getSession is okay here as we have a validated user
          setSession(activeSession);
        }


        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [router, supabase.auth]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
    router.push('/');
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    });
    return { error };
  };

  const signInWithGitHub = async () => {
    console.log('Initiating GitHub sign-in');
    console.log('Redirect URL:', `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    });
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signOut,
      signInWithEmail,
      signInWithGoogle,
      signInWithGitHub
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
