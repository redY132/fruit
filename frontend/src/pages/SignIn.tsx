import React from 'react'
import { supabase } from '../lib/supabase'

export function SignIn() {
  function handleGoogleSignIn() {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      <button
        onClick={handleGoogleSignIn}
        className="px-8 py-4 rounded-full font-bold text-lg border-2"
        style={{ borderColor: '#564A4A', color: '#564A4A' }}
      >
        Sign in with Google
      </button>
    </div>
  )
}
