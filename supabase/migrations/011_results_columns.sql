ALTER TABLE public.lobby_players
  ADD COLUMN IF NOT EXISTS fruits_sliced INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_combo     INT NOT NULL DEFAULT 0;

GRANT UPDATE (fruits_sliced, max_combo) ON public.lobby_players TO authenticated;
