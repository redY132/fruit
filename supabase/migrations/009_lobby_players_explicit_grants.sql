-- Explicit grants ensure SELECT/INSERT/DELETE work for authenticated users
-- regardless of Supabase project defaults. Safe to re-run (GRANT is idempotent).
GRANT SELECT, INSERT, DELETE ON public.lobby_players TO authenticated;
