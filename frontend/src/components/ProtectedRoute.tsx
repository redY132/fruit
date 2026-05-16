import React from 'react'
import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { playerId } = useAuth()

  if (playerId === null) {
    return <Navigate to="/signin" replace />
  }

  return <Outlet />
}
