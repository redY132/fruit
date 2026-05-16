Fruity — File & Folder Breakdown

Root
  .env.local              — VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (gitignored)
  .env.example            — same keys, empty values, committed
  package.json            — root deps (MediaPipe)
  README.md
  CLAUDE.md
  bums.txt                — scratch file, ignore

supabase/
  config.toml             — Supabase CLI project config
  migrations/
    001_lobbies.sql       — lobbies table + RLS
    002_lobby_players.sql — lobby_players junction table + RLS (column privilege: only ready is client-writable)
    003_match_events.sql  — match_events table + RLS (SELECT only for authenticated)
  functions/
    _shared/
      cors.ts             — shared CORS headers + handleCors preflight helper
      supabase-admin.ts   — service-role Supabase client; never exposed to frontend
    generate-fruit-queue/
      index.ts            — seeded deterministic SpawnEvent[] generator; flips lobby to 'playing'
    validate-sabotage/
      index.ts            — validates buyer balance, deducts points, inserts bomb_inject event

backend/java/             — SUPERSEDED by Supabase; kept on disk, not used
  build.gradle
  settings.gradle
  src/main/resources/application.properties
  src/main/java/com/fruity/{game,websocket,model,config}/

frontend/
  index.html              — Vite HTML shell
  vite.config.ts          — Vite + React plugin config
  tsconfig.json           — TypeScript config
  package.json            — frontend deps (React, Vite, Tailwind, shadcn, MediaPipe, etc.)
  package-lock.json

  public/
    assets/
      mascot.png          — mascot sprite

  src/
    main.tsx              — app entry point; mounts React root

    app/
      App.tsx             — root component; wraps router
      Layout.tsx          — shared page layout shell
      routes.tsx          — route definitions

    styles/
      index.css           — global styles
      tailwind.css        — Tailwind base/components/utilities
      fonts.css           — font imports
      theme.css           — CSS custom properties / design tokens

    types/
      game.ts             — Fruit, Bomb, FruitQueue, SpawnEvent
      player.ts           — Player, Lives, Score, Multiplier
      shop.ts             — ShopItem, TriggerZone, Sabotage
      database.ts         — generated DB row types (supabase gen types typescript) [MISSING]

    lib/
      mediapipe.ts        — MediaPipe initialisation & HandLandmarker loading
      models/
        hand_landmarker.task  — bundled MediaPipe model file
      supabase.ts         — Supabase client init (anon key + URL)
      channels.ts         — Realtime channel name constants + event type enums [MISSING]
      utils.ts            — shadcn cn() utility
      ImageWithFallback.tsx — image component with fallback handling

    utils/
      fruitPhysics.ts     — arc trajectory math (spawn → position at time t)
      sliceDetection.ts   — hand landmarks → slice vector
      triggerZones.ts     — corner zone hit-detection for shop purchases

    store/
      gameStore.ts        — fruit queue, active injections, game phase, match clock
      playerStore.ts      — local score, lives, combo multiplier, shop balance

    hooks/
      useHandTracking.ts  — MediaPipe on webcam stream, emits landmark frames
      useGameLoop.ts      — RAF tick; physics update + slice check each frame
      useAuth.ts          — Supabase anon sign-in on INITIAL_SESSION; exposes session/playerId
      useRealtimeChannel.ts — Supabase Realtime channel; subscribe/broadcast, refs prevent stale closures

    components/
      GameCanvas.tsx      — webcam feed + fruit/bomb draw layer
      HandOverlay.tsx     — renders hand landmark skeleton over webcam
      ShopOverlay.tsx     — corner Trigger Zone UI
      Leaderboard.tsx     — live score sidebar
      LobbyRoom.tsx       — player list + ready-up UI
      LivesDisplay.tsx    — lives indicator
      Webcam.tsx          — webcam stream setup and video element
      ui/                 — shadcn/ui component library (button, card, dialog, etc.)

    pages/
      Menu.tsx            — main menu / home screen
      Lobby.tsx           — create/join lobby flow
      Room.tsx            — pre-game room (waiting for players)
      Game.tsx            — main game screen
      Results.tsx         — end-of-match results
