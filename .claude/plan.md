# Fruity — Build Checklist
Each file has one job. Nothing bleeds into its neighbour.

---

## Phase 1 — Project Scaffold
- [x] `frontend/index.html` — Vite HTML shell
- [x] `frontend/vite.config.ts` — Vite + React plugin config
- [x] `frontend/tsconfig.json` — TypeScript config
- [ ] `.env.local` — VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (gitignored)
- [ ] `.env.example` — same keys, empty values, committed
- [x] `supabase/config.toml` — Supabase CLI project config

---

## Phase 2 — Types (no logic, no imports from project)
- [x] `frontend/src/types/game.ts` — `Fruit`, `Bomb`, `FruitQueue`, `SpawnEvent`
- [x] `frontend/src/types/player.ts` — `Player`, `Lives`, `Score`, `Multiplier`
- [x] `frontend/src/types/shop.ts` — `ShopItem`, `TriggerZone`, `Sabotage`
- [ ] `frontend/src/types/database.ts` — generated via `supabase gen types typescript`

---

## Phase 3 — Lib (singleton setup, no game logic)
- [x] `frontend/src/lib/mediapipe.ts` — MediaPipe init + HandLandmarker
- [ ] `frontend/src/lib/supabase.ts` — Supabase client init (anon key + URL only) [websocket.ts exists; needs migration]
- [ ] `frontend/src/lib/channels.ts` — Realtime channel name constants + event type enums

---

## Phase 4 — Utils (pure functions, no side effects)
- [x] `frontend/src/utils/fruitPhysics.ts` — arc/trajectory math
- [x] `frontend/src/utils/sliceDetection.ts` — hand landmarks → slice vector
- [x] `frontend/src/utils/triggerZones.ts` — corner zone hit-detection

---

## Phase 5 — Store (state only, no async, no side effects)
- [x] `frontend/src/store/gameStore.ts` — fruit queue, injections, game phase, match clock
- [x] `frontend/src/store/playerStore.ts` — score, lives, multiplier, shop balance

---

## Phase 6 — Hooks
- [ ] `frontend/src/hooks/useAuth.ts` — Supabase anon sign-in; exposes session/player_id only
- [x] `frontend/src/hooks/useHandTracking.ts` — MediaPipe on webcam stream
- [x] `frontend/src/hooks/useGameLoop.ts` — RAF tick; physics + slice check
- [ ] `frontend/src/hooks/useRealtimeChannel.ts` — Supabase Realtime channel [useWebSocket.ts exists; needs migration]

---

## Phase 7 — Components
- [x] `frontend/src/components/GameCanvas.tsx`
- [x] `frontend/src/components/ShopOverlay.tsx`
- [x] `frontend/src/components/Leaderboard.tsx`
- [x] `frontend/src/components/LobbyRoom.tsx`
- [x] `frontend/src/components/LivesDisplay.tsx`
- [x] `frontend/src/components/HandOverlay.tsx` — hand landmark overlay (added by user)
- [x] `frontend/src/components/Webcam.tsx` — webcam stream setup (added by user)

---

## Phase 8 — Pages
- [x] `frontend/src/pages/Menu.tsx` — main menu (added by user)
- [x] `frontend/src/pages/Lobby.tsx` — create/join lobby
- [x] `frontend/src/pages/Room.tsx` — pre-game waiting room (added by user)
- [x] `frontend/src/pages/Game.tsx` — main game screen
- [x] `frontend/src/pages/Results.tsx` — end-of-match results

---

## Phase 9 — App Entry & Routing
- [x] `frontend/src/main.tsx` — React root mount (was planned as index.ts)
- [x] `frontend/src/app/App.tsx` — root component
- [x] `frontend/src/app/Layout.tsx` — shared layout shell
- [x] `frontend/src/app/routes.tsx` — route definitions

---

## Phase 10 — Supabase Schema
- [x] `supabase/migrations/001_lobbies.sql` — lobbies table + RLS
- [x] `supabase/migrations/002_lobby_players.sql` — lobby_players table + RLS
- [x] `supabase/migrations/003_match_events.sql` — match_events table + RLS

---

## Phase 11 — Supabase Edge Functions
- [x] `supabase/functions/_shared/cors.ts` — shared CORS headers
- [x] `supabase/functions/_shared/supabase-admin.ts` — service-role client
- [x] `supabase/functions/generate-fruit-queue/index.ts` — deterministic spawn sequence
- [x] `supabase/functions/validate-sabotage/index.ts` — validates purchase, injects bomb

---

## Remaining — Supabase Migration (frontend)
- [x] migrate `frontend/src/lib/websocket.ts` → `supabase.ts`
- [x] migrate `frontend/src/hooks/useWebSocket.ts` → `useRealtimeChannel.ts`
- [x] add `frontend/src/hooks/useAuth.ts`
- [ ] add `frontend/src/lib/channels.ts`
- [ ] add `frontend/src/types/database.ts`
- [ ] add `.env.local` + `.env.example`
