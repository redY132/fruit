import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'INITIAL_SESSION' && session === null) {
        supabase.auth.signInAnonymously()
      }
    })

    return () => data.subscription.unsubscribe()
  }, [])

  return { session, playerId: session?.user.id ?? null }
}
