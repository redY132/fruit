# Fruity — Build Checklist
Each file has one job. Nothing bleeds into its neighbour.

---

## Phase 1 — Project Scaffold
- [ ] `frontend/index.html` — Vite HTML shell, mounts `#root`
- [ ] `frontend/vite.config.ts` — Vite config (React plugin, path aliases only)
- [ ] `frontend/tsconfig.json` — TypeScript config (strict, path aliases)
- [ ] `.env.local` — VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (gitignored)
- [ ] `.env.example` — same keys, empty values, committed
- [x] `supabase/config.toml` — Supabase CLI project config

---

## Phase 2 — Types (no logic, no imports from project)
- [ ] `frontend/src/types/game.ts` — `Fruit`, `Bomb`, `FruitQueue`, `SpawnEvent`
- [ ] `frontend/src/types/player.ts` — `Player`, `Lives`, `Score`, `Multiplier`
- [ ] `frontend/src/types/shop.ts` — `ShopItem`, `TriggerZone`, `Sabotage`
- [ ] `frontend/src/types/database.ts` — generated via `supabase gen types typescript`; row types for lobbies, lobby_players, match_events

---

## Phase 3 — Lib (singleton setup, no game logic)
- [ ] `frontend/src/lib/mediapipe.ts` — loads MediaPipe model, exports initialised `HandLandmarker`
- [ ] `frontend/src/lib/supabase.ts` — Supabase client init (anon key + URL only); no game knowledge
- [ ] `frontend/src/lib/channels.ts` — channel name constants (`lobby:{id}`, `game:{id}`) + event type enums; no Supabase import

---

## Phase 4 — Utils (pure functions, no side effects)
- [ ] `frontend/src/utils/fruitPhysics.ts` — arc/trajectory math: given spawn params → position at time t
- [ ] `frontend/src/utils/sliceDetection.ts` — hand landmarks → slice vector; no rendering, no state
- [ ] `frontend/src/utils/triggerZones.ts` — given pointer position → which corner zone (if any) was hit

---

## Phase 5 — Store (state only, no async, no side effects)
- [ ] `frontend/src/store/gameStore.ts` — fruit queue, active injections, game phase, match clock
- [ ] `frontend/src/store/playerStore.ts` — local score, lives, combo multiplier, shop balance

---

## Phase 6 — Hooks (wire lib/utils/store together, one concern each)
- [ ] `frontend/src/hooks/useAuth.ts` — Supabase anon sign-in on mount; exposes session/player_id only
- [ ] `frontend/src/hooks/useHandTracking.ts` — runs `mediapipe.ts` on webcam stream, emits landmark frames
- [ ] `frontend/src/hooks/useGameLoop.ts` — RAF tick; calls physics update + slice check each frame
- [ ] `frontend/src/hooks/useRealtimeChannel.ts` — Supabase Realtime channel; dispatches inbound events to store

---

## Phase 7 — Components (render only what they're given via props/store)
- [ ] `frontend/src/components/GameCanvas.tsx` — webcam feed + fruit/bomb draw layer; reads gameStore
- [ ] `frontend/src/components/ShopOverlay.tsx` — renders corner Trigger Zones; fires purchase on zone hit
- [ ] `frontend/src/components/Leaderboard.tsx` — live score list; pure display, receives scores as props
- [ ] `frontend/src/components/LobbyRoom.tsx` — player list + ready-up UI; no match logic
- [ ] `frontend/src/components/LivesDisplay.tsx` — renders current lives; reads playerStore only

---

## Phase 8 — Pages (compose components, own routing concerns only)
- [ ] `frontend/src/pages/Lobby.tsx` — mounts `LobbyRoom`, handles create/join flow
- [ ] `frontend/src/pages/Game.tsx` — mounts `GameCanvas`, `ShopOverlay`, `Leaderboard`, `LivesDisplay`
- [ ] `frontend/src/pages/Results.tsx` — reads final scores from store, renders end-screen

---

## Phase 9 — App Entry
- [ ] `frontend/index.ts` — create root, mount router; nothing else

---

## Phase 10 — Supabase Schema (one migration per table)
- [x] `supabase/migrations/001_lobbies.sql` — lobbies table: id, code, host_id, status, seed, created_at + RLS
- [x] `supabase/migrations/002_lobby_players.sql` — lobby_players table: lobby_id, player_id, ready, lives, score, eliminated_at + RLS
- [x] `supabase/migrations/003_match_events.sql` — match_events table: id, lobby_id, type, payload (jsonb), created_at + RLS

---

## Phase 11 — Supabase Edge Functions (server-authoritative logic)
- [ ] `supabase/functions/_shared/cors.ts` — shared CORS headers; imported by all functions
- [x] `supabase/functions/_shared/supabase-admin.ts` — service-role client; never exposed to frontend
- [x] `supabase/functions/generate-fruit-queue/index.ts` — seeded deterministic spawn sequence; called at match start
- [x] `supabase/functions/validate-sabotage/index.ts` — validates buyer balance, deducts points, injects into match_events
