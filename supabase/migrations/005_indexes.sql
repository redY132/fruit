CREATE INDEX idx_match_events_lobby_id ON public.match_events(lobby_id);
CREATE INDEX idx_match_events_lobby_type ON public.match_events(lobby_id, type);
