Fruity — File & Folder Breakdown

Root
  package.json            — root deps (MediaPipe); will also hold Vite/React/TS when scaffolded
  package-lock.json
  CLAUDE.md
  README.md

frontend/
  index.html              — Vite HTML entry point (MISSING — needs creating)
  vite.config.ts          — Vite + React plugin config (MISSING)
  tsconfig.json           — TypeScript config (MISSING)
  index.ts                — app bootstrap / root render

  public/
    assets/               — static sprites: fruit images, bomb image, slash particle

  src/
    components/           — React UI components
      GameCanvas.tsx        webcam feed + fruit/bomb rendering layer
      ShopOverlay.tsx       corner Trigger Zone UI (buy/deploy sabotage)
      Leaderboard.tsx       live score sidebar (bottom-left)
      LobbyRoom.tsx         pre-game lobby, player list, ready-up
      LivesDisplay.tsx      health/lives indicator

    hooks/
      useHandTracking.ts    MediaPipe GestureRecognizer setup + landmark stream
      useGameLoop.ts        requestAnimationFrame game tick
      useWebSocket.ts       multiplayer WS connection + message dispatch

    lib/
      mediapipe.ts          MediaPipe initialisation & model loading
      websocket.ts          WebSocket client wrapper (connect, send, reconnect)

    pages/
      Lobby.tsx             lobby page (create/join room)
      Game.tsx              main game page (mounts GameCanvas + overlays)
      Results.tsx           end-of-match results screen

    store/
      gameStore.ts          global game state: fruit queue, injections, phase
      playerStore.ts        local player state: score, lives, multiplier

    types/
      game.ts               Fruit, Bomb, FruitQueue, SpawnEvent types
      player.ts             Player, Lives, Score, Multiplier types
      shop.ts               ShopItem, TriggerZone, Sabotage types

    utils/
      sliceDetection.ts     hand landmark → slice gesture logic
      fruitPhysics.ts       arc trajectory math (spawn → fall)
      triggerZones.ts       corner zone hit-detection for shop purchases

backend/
  java/
    (Gradle or Maven project root — MISSING setup)
    src/main/java/com/fruity/
      FruityApplication.java          Spring Boot entry point
      game/
        GameSessionService.java       manages lobby + match lifecycle
        FruitQueueService.java        deterministic fruit sequence generator
        SabotageService.java          injection logic, bomb routing
      websocket/
        GameWebSocketHandler.java     WS message routing
        LobbyWebSocketHandler.java    lobby join/ready/start
      model/
        Player.java
        FruitEvent.java
        SabotageEvent.java
      config/
        WebSocketConfig.java
