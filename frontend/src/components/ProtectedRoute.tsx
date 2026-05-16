import React from 'react'
import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { supabaseConfigured } from '../lib/supabase'

export function ProtectedRoute() {
  const { session, playerId } = useAuth()

  if (!supabaseConfigured) return <Outlet />

  if (session === undefined) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-4 border-[#564A4A] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!playerId) return <Navigate to="/signin" replace />
  return <Outlet />
}
