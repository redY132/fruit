Fruity — File & Folder Breakdown

Root
  .env.local              — VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (gitignored)
  .env.example            — same keys, empty values, committed
  package.json            — root deps (MediaPipe, Supabase JS, React, Vite)
  package-lock.json
  CLAUDE.md
  README.md

supabase/
  config.toml             — Supabase CLI project config
  migrations/
    001_lobbies.sql       — lobbies table + RLS
    002_lobby_players.sql — lobby_players junction table + RLS
    003_match_events.sql  — match_events table + RLS
  functions/
    _shared/
      cors.ts             — shared CORS headers; imported by all Edge Functions
      supabase-admin.ts   — service-role Supabase client; never exposed to frontend
    generate-fruit-queue/
      index.ts            — seeded deterministic SpawnEvent[] generator
    validate-sabotage/
      index.ts            — validates buyer balance, deducts points, injects into match_events

frontend/
  index.html              — Vite HTML shell, mounts `#root`
  vite.config.ts          — Vite config (React plugin, path aliases only)
  tsconfig.json           — TypeScript config (strict, path aliases)
  index.ts                — app bootstrap / root render

  public/
    assets/               — static sprites: fruit images, bomb image, slash particle

  src/
    types/
      game.ts             — Fruit, Bomb, FruitQueue, SpawnEvent
      player.ts           — Player, Lives, Score, Multiplier
      shop.ts             — ShopItem, TriggerZone, Sabotage
      database.ts         — generated DB row types (supabase gen types typescript)

    lib/
      mediapipe.ts        — MediaPipe initialisation & model loading
      supabase.ts         — Supabase client init (anon key + URL only)
      channels.ts         — channel name constants + event type enums; no Supabase import

    utils/
      fruitPhysics.ts     — arc trajectory math (spawn → fall)
      sliceDetection.ts   — hand landmark → slice vector; no rendering, no state
      triggerZones.ts     — corner zone hit-detection for shop purchases

    store/
      gameStore.ts        — fruit queue, active injections, game phase, match clock
      playerStore.ts      — local score, lives, combo multiplier, shop balance

    hooks/
      useAuth.ts          — Supabase anon sign-in on mount; exposes session/player_id only
      useHandTracking.ts  — MediaPipe on webcam stream, emits landmark frames
      useGameLoop.ts      — RAF tick; physics update + slice check each frame
      useRealtimeChannel.ts — Supabase Realtime channel; dispatches inbound events to store

    components/
      GameCanvas.tsx      — webcam feed + fruit/bomb draw layer; reads gameStore
      ShopOverlay.tsx     — corner Trigger Zone UI; fires purchase on zone hit
      Leaderboard.tsx     — live score list; pure display, receives scores as props
      LobbyRoom.tsx       — player list + ready-up UI; no match logic
      LivesDisplay.tsx    — renders current lives; reads playerStore only

    pages/
      Lobby.tsx           — mounts LobbyRoom, handles create/join flow
      Game.tsx            — mounts GameCanvas, ShopOverlay, Leaderboard, LivesDisplay
      Results.tsx         — reads final scores from store, renders end-screen
