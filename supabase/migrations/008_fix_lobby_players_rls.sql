-- Break recursive RLS by using a security definer function.
-- SECURITY DEFINER bypasses RLS when reading lobby_players,
-- so the SELECT policy can no longer call itself recursively.
CREATE OR REPLACE FUNCTION get_my_lobby_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT lobby_id FROM lobby_players WHERE player_id = auth.uid();
$$;

DROP POLICY IF EXISTS "members see all rows in their lobby" ON lobby_players;

CREATE POLICY "members see all rows in their lobby"
  ON lobby_players FOR SELECT
  TO authenticated
  USING (lobby_id IN (SELECT get_my_lobby_ids()));
