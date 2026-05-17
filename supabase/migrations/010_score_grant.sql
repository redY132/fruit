-- Allow clients to write their own score and lives.
-- Note: no server-side validation yet; secure later with Edge Function scoring.
GRANT UPDATE (score, lives) ON public.lobby_players TO authenticated;
