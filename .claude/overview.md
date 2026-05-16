Core Gameplay & Win Condition
Survival First: The primary goal is to stay alive. Players start with a set number of lives (e.g., 3). Dropping fruits or slicing bombs drains health/lives.
Score Tie-Breaker: If multiple players survive until the track/timer ends, the player with the highest score wins.
The Combo Engine: Slicing multiple fruits in a single, continuous sweep increases a score multiplier, exponentially boosting your point economy.
The BTD-Style Economy & Sabotage
Points as Currency: Points earned from slicing are actively spent to sabotage opponents.
Hands-Free Shop (Spatial UI): The shop is built directly into the webcam canvas. Static "Trigger Zones" occupy the corners of the screen (e.g., Top-Left to buy a Bomb). Players physically slash a corner zone to purchase and deploy a hazard, forcing a risky, split-second distraction from the center fruit-spawning zone.
Targeted Injections: Sabotages are injected directly into an opponent's upcoming fruit queue.
Lobby & Match Architecture (Osu! Style)
Synchronized Base Track: All players in a lobby receive the exact same core sequence and rhythm of fruit spawns at the exact same millisecond to ensure fundamental competitive fairness.
Live Pressure Sidebar: A shared, real-time leaderboard ticks constantly on the bottom-left of the screen, visualising everyone's live scores and survival status to drive psychological tension.
System Defenses & Balance
Injection Warnings: Injected bombs give a brief visual edge-flash on the victim's screen before spawning, preventing unreactable cheap shots.
High-Skill Counters: Players can spend points on defensive clearing zones, or potentially "parry" an incoming bomb by slicing it at the absolute peak of its physical arc to reflect it back to the sender.

Backend Infrastructure — Supabase
Realtime: Supabase Realtime channels handle lobby presence, live leaderboard sync, and fruit spawn broadcast across all players.
Database: Postgres tables (lobbies, players, match_events) store lobby/match state and scores with row-level security.
Edge Functions: Server-authoritative logic — seeded deterministic fruit queue generation and sabotage validation run as Supabase Edge Functions to prevent client-side cheating.
Auth: Supabase Auth for player identity.
