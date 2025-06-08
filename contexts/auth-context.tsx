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
        // ✅ Utiliser getUser() pour une vérification sécurisée
        const { data: { user: initialUser }, error: initialError } = await supabase.auth.getUser();
        console.log('Auth initialization (getUser):', {
          hasUser: !!initialUser,
          error: initialError?.message
        });

        if (initialError) {
          console.error('Initial getUser error:', initialError);
          setUser(null);
          setSession(null);
        } else {
          setUser(initialUser ?? null);
          // ✅ Récupérer la session seulement si l'utilisateur est valide
          if (initialUser) {
            // Utiliser onAuthStateChange pour obtenir la session de manière sécurisée
            // ou récupérer via getUser qui inclut la session
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);
          }
        }

        // Configuration de l'écoute des changements d'état
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('Auth state change:', {
              event,
              hasSession: !!currentSession,
              hasAccessToken: !!currentSession?.access_token,
            });

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              // ✅ Toujours utiliser getUser() pour valider
              const { data: { user: updatedUser }, error: getUserError } = await supabase.auth.getUser();
              if (getUserError) {
                console.error('Error fetching user on auth state change:', getUserError);
                setUser(null);
                setSession(null);
              } else {
                setUser(updatedUser ?? null);
                setSession(currentSession);
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setSession(null);
            } else {
              // Pour les autres événements, mettre à jour la session si elle existe
              setSession(currentSession);
            }
            
            // Refresh de la page pour mettre à jour l'état d'authentification côté serveur
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
              router.refresh();
            }
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setSession(null);
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