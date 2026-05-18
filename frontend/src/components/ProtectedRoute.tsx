import React, { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { supabaseConfigured } from '../lib/supabase'

const GAME_ROUTES = ['/game', '/bomb', '/shop']

export function ProtectedRoute() {
  const { session, playerId } = useAuth()
  const location = useLocation()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio('/assets/lobby.mp3')
    audio.loop = true
    audio.volume = 0.3
    audioRef.current = audio
    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (GAME_ROUTES.includes(location.pathname)) {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
  }, [location.pathname])

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
