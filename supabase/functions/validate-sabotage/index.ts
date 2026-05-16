import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabase-admin.ts'

const SABOTAGE_COST = 100

Deno.serve(async (req: Request) => {
  const preflight = handleCors(req)
  if (preflight) return preflight

  let lobby_id: string
  let target_player_id: string
  try {
    const body = await req.json()
    lobby_id = body?.lobby_id
    target_player_id = body?.target_player_id
  } catch {
    return new Response(JSON.stringify({ error: 'invalid body' }), { status: 400, headers: corsHeaders })
  }
  if (!lobby_id || !target_player_id) {
    return new Response(JSON.stringify({ error: 'missing lobby_id or target_player_id' }), { status: 400, headers: corsHeaders })
  }

  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt ?? '')
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders })
  }

  if (user.id === target_player_id) {
    return new Response(JSON.stringify({ error: 'cannot target yourself' }), { status: 400, headers: corsHeaders })
  }

  const { data: rows, error: rowsError } = await supabaseAdmin
    .from('lobby_players')
    .select('player_id, score, eliminated_at')
    .eq('lobby_id', lobby_id)
    .in('player_id', [user.id, target_player_id])
  if (rowsError) {
    return new Response(JSON.stringify({ error: 'db error' }), { status: 500, headers: corsHeaders })
  }

  const callerRow = rows?.find((r) => r.player_id === user.id)
  const targetRow = rows?.find((r) => r.player_id === target_player_id)

  if (!callerRow || callerRow.eliminated_at !== null) {
    return new Response(JSON.stringify({ error: 'not in lobby or already eliminated' }), { status: 403, headers: corsHeaders })
  }
  if (!targetRow || targetRow.eliminated_at !== null) {
    return new Response(JSON.stringify({ error: 'target not in lobby or already eliminated' }), { status: 400, headers: corsHeaders })
  }
  if (callerRow.score < SABOTAGE_COST) {
    return new Response(JSON.stringify({ error: 'insufficient score' }), { status: 402, headers: corsHeaders })
  }

  const { error: deductError } = await supabaseAdmin
    .from('lobby_players')
    .update({ score: callerRow.score - SABOTAGE_COST })
    .eq('lobby_id', lobby_id)
    .eq('player_id', user.id)
  if (deductError) {
    return new Response(JSON.stringify({ error: 'failed to deduct score' }), { status: 500, headers: corsHeaders })
  }

  const { error: insertError } = await supabaseAdmin
    .from('match_events')
    .insert({ lobby_id, player_id: user.id, type: 'bomb_inject', payload: { target_player_id } })
  if (insertError) {
    await supabaseAdmin
      .from('lobby_players')
      .update({ score: callerRow.score })
      .eq('lobby_id', lobby_id)
      .eq('player_id', user.id)
    return new Response(JSON.stringify({ error: 'failed to inject bomb' }), { status: 500, headers: corsHeaders })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
