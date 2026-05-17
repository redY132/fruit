import React from 'react'
import { Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { supabaseConfigured } from '../lib/supabase'

export function ProtectedRoute() {
  const { session, playerId } = useAuth()

  if (!supabaseConfigured) return <Outlet />

  if (session === undefined || !playerId) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <div className="w-8 h-8 rounded-full border-4 border-[#564A4A] border-t-transparent animate-spin" />
        <p className="text-sm font-semibold" style={{ color: '#564A4A', fontFamily: "'Baloo Bhaijaan 2', sans-serif" }}>
          Connecting…
        </p>
      </div>
    )
  }

  return <Outlet />
}
