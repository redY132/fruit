import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useRealtimeChannel(
  channelName: string,
  onBroadcast?: (event: string, payload: unknown) => void
) {
  const onBroadcastRef = useRef(onBroadcast)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [status, setStatus] = useState<string>('CLOSED')

  useEffect(() => {
    onBroadcastRef.current = onBroadcast
  })

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: '*' }, ({ event, payload }) => {
        onBroadcastRef.current?.(event, payload)
      })
      .subscribe((s) => setStatus(s))

    channelRef.current = channel

    return () => {
      channelRef.current?.unsubscribe()
      channelRef.current = null
    }
  }, [channelName])

  function broadcast(event: string, payload: unknown) {
    channelRef.current?.send({ type: 'broadcast', event, payload })
  }

  return { broadcast, status }
}
