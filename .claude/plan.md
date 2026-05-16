# Fruity — Build Checklist
Each file has one job. Nothing bleeds into its neighbour.

---

## Phase 1 — Project Scaffold
- [ ] `frontend/index.html` — Vite HTML shell, mounts `#root`
- [ ] `frontend/vite.config.ts` — Vite config (React plugin, path aliases only)
- [ ] `frontend/tsconfig.json` — TypeScript config (strict, path aliases)
- [x] `backend/java/build.gradle` — Gradle config (Spring Boot, WebSocket deps only)
- [x] `backend/java/settings.gradle` — project name declaration (required by Gradle)
- [x] `backend/java/src/main/resources/application.properties` — server port, WS config

---

## Phase 2 — Types (no logic, no imports from project)
- [ ] `frontend/src/types/game.ts` — `Fruit`, `Bomb`, `FruitQueue`, `SpawnEvent`
- [ ] `frontend/src/types/player.ts` — `Player`, `Lives`, `Score`, `Multiplier`
- [ ] `frontend/src/types/shop.ts` — `ShopItem`, `TriggerZone`, `Sabotage`

---

## Phase 3 — Lib (singleton setup, no game logic)
- [ ] `frontend/src/lib/mediapipe.ts` — loads MediaPipe model, exports initialised `HandLandmarker`
- [ ] `frontend/src/lib/websocket.ts` — WS client (connect, send, on, reconnect); no game knowledge

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
- [ ] `frontend/src/hooks/useHandTracking.ts` — runs `mediapipe.ts` on webcam stream, emits landmark frames
- [ ] `frontend/src/hooks/useGameLoop.ts` — RAF tick; calls physics update + slice check each frame
- [ ] `frontend/src/hooks/useWebSocket.ts` — connects via `websocket.ts`, dispatches inbound events to store

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

## Phase 10 — Backend: Models (data shapes, no logic)
- [ ] `backend/.../model/Player.java` — id, score, lives, ready state
- [ ] `backend/.../model/FruitEvent.java` — spawnTime, type, arc params, targetPlayerId
- [ ] `backend/.../model/SabotageEvent.java` — type, senderId, targetId, injectedAt

---

## Phase 11 — Backend: Services (one service = one domain)
- [ ] `backend/.../game/FruitQueueService.java` — deterministic sequence generator (seeded RNG); no WS knowledge
- [ ] `backend/.../game/SabotageService.java` — validates + routes injections; reads/writes queue only
- [ ] `backend/.../game/GameSessionService.java` — lobby lifecycle, match start/end, score aggregation

---

## Phase 12 — Backend: WebSocket Handlers (transport only, delegate to services)
- [ ] `backend/.../websocket/LobbyWebSocketHandler.java` — join, ready, leave messages → GameSessionService
- [ ] `backend/.../websocket/GameWebSocketHandler.java` — slice, purchase, sabotage messages → services
- [ ] `backend/.../config/WebSocketConfig.java` — registers handlers, sets endpoints; no logic

---

## Phase 13 — Backend: Entry
- [ ] `backend/.../FruityApplication.java` — `@SpringBootApplication` main; nothing else
