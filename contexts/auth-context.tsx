'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Auth initialization:', {
          hasSession: !!session,
          hasAccessToken: !!session?.access_token,
          error: error?.message
        });

        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            console.log('Auth state change:', {
              hasSession: !!session,
              hasAccessToken: !!session?.access_token,
            });
            setSession(session);
            setUser(session?.user ?? null);
            router.refresh();
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
