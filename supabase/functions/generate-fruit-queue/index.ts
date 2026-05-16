import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabase-admin.ts'

const FRUIT_POOL = [
  { type: 'apple',      weight: 35 },
  { type: 'orange',     weight: 30 },
  { type: 'watermelon', weight: 20 },
  { type: 'pineapple',  weight: 15 },
]
const TOTAL_WEIGHT = FRUIT_POOL.reduce((sum, f) => sum + f.weight, 0)
const EVENT_COUNT  = 60
const INTERVAL_MS  = 1500

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickFruit(rand: () => number): string {
  let roll = rand() * TOTAL_WEIGHT
  for (const { type, weight } of FRUIT_POOL) {
    roll -= weight
    if (roll <= 0) return type
  }
  return FRUIT_POOL[0].type
}

Deno.serve(async (req: Request) => {
  const preflight = handleCors(req)
  if (preflight) return preflight

  let lobby_id: string
  try {
    const body = await req.json()
    lobby_id = body?.lobby_id
  } catch {
    return new Response(JSON.stringify({ error: 'invalid body' }), { status: 400, headers: corsHeaders })
  }
  if (!lobby_id) {
    return new Response(JSON.stringify({ error: 'missing lobby_id' }), { status: 400, headers: corsHeaders })
  }

  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt ?? '')
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders })
  }

  const { data: lobby, error: lobbyError } = await supabaseAdmin
    .from('lobbies')
    .select('id, host_id, seed')
    .eq('id', lobby_id)
    .single()
  if (lobbyError || !lobby) {
    return new Response(JSON.stringify({ error: 'lobby not found' }), { status: 404, headers: corsHeaders })
  }

  if (user.id !== lobby.host_id) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders })
  }

  const rand   = mulberry32(Number(lobby.seed) >>> 0)
  const events = Array.from({ length: EVENT_COUNT }, (_, i) => ({
    fruit_type:    pickFruit(rand),
    spawn_time_ms: i * INTERVAL_MS,
    spawn_x:       0.1 + rand() * 0.8,
    arc_height:    0.4 + rand() * 0.4,
  }))

  const { error: insertError } = await supabaseAdmin
    .from('match_events')
    .insert(events.map((payload) => ({ lobby_id, player_id: null, type: 'fruit_spawn', payload })))
  if (insertError) {
    return new Response(JSON.stringify({ error: 'failed to insert events' }), { status: 500, headers: corsHeaders })
  }

  const { error: updateError } = await supabaseAdmin
    .from('lobbies')
    .update({ status: 'playing' })
    .eq('id', lobby_id)
  if (updateError) {
    return new Response(JSON.stringify({ error: 'failed to start match' }), { status: 500, headers: corsHeaders })
  }

  return new Response(JSON.stringify({ events }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
