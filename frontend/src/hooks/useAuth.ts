import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session)
      } else {
        supabase.auth.signInAnonymously().then(({ data, error }) => {
          if (error) {
            console.error('[useAuth] signInAnonymously failed:', error.message, error)
            setSession(null)
          } else {
            console.log('[useAuth] signInAnonymously succeeded, user:', data.user?.id)
          }
        })
        // onAuthStateChange picks up the result and sets session
      }
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  return { session, playerId: session?.user.id ?? null }
}
