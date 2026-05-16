## Status: Staging — migrate useWebSocket.ts → useRealtimeChannel.ts

### Delete
- `frontend/src/hooks/useWebSocket.ts` — stub only, no consumers

### Create `frontend/src/hooks/useRealtimeChannel.ts`
- params: `channelName: string`, `onBroadcast?: (event: string, payload: unknown) => void`
- `onBroadcastRef = useRef(onBroadcast)` — keep ref in sync each render; useEffect reads from ref so subscription is NOT recreated when callback identity changes
- `channelRef = useRef<RealtimeChannel | null>(null)` — holds live channel instance for use outside useEffect
- `status` state: string, default `'SUBSCRIBED'`
- useEffect deps: `[channelName]` only
  - create channel: `supabase.channel(channelName)`
  - `.on('broadcast', { event: '*' }, ({ event, payload }) => onBroadcastRef.current?.(event, payload))`
  - `.subscribe((s) => setStatus(s))`
  - store in `channelRef.current`
  - cleanup: `channelRef.current?.unsubscribe()`
- `broadcast(event, payload)`: calls `channelRef.current?.send({ type: 'broadcast', event, payload })`
- return `{ broadcast, status }`
- import `supabase` from `../lib/supabase`
