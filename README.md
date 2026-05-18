# Food Ninja — 食べ物ニンジャ

A real-time multiplayer fruit-slicing game controlled entirely by your webcam and bare hands. Players use physical hand gestures to slice fruit arcing across the screen, sabotage opponents, and compete for the highest score before time runs out.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + TypeScript, bundled with Vite |
| Styling | Tailwind CSS + shadcn/ui (non-game UI) |
| Hand tracking | MediaPipe HandLandmarker (`@mediapipe/tasks-vision`) |
| Game state | Module-singleton store (plain TS, no library) |
| Routing | React Router v6 (`createBrowserRouter`) |
| Backend / DB | Supabase (Postgres + Realtime + Edge Functions) |
| Auth | Supabase anonymous auth (no sign-up required) |
| Audio | Native `HTMLAudioElement` |

---

## Architecture Overview

```
Browser
└── App.tsx (RouterProvider)
    └── ProtectedRoute          ← auth guard + lobby music
        ├── Menu
        ├── Lobby
        ├── Room
        ├── Game
        │   ├── GameCanvas      ← webcam + fruit canvas layer
        │   │   └── Webcam      ← react-webcam + HandOverlay
        │   │       └── useHandTracking  ← MediaPipe loop
        │   └── useGameLoop     ← RAF tick → gameStore.tick()
        └── Results

gameStore (module singleton)
  ├── spawnQueue, activeFruits, trail
  ├── score, combo, lives, popups
  └── tick() ← called by useGameLoop each frame

Supabase
  ├── Postgres (lobbies, lobby_players, match_events, profiles)
  ├── Realtime (lobby_players table → live leaderboard)
  └── Edge Functions
      ├── generate-fruit-queue  ← deterministic spawn events
      └── validate-sabotage     ← server-side bomb injection
```

---

## Features

### 1. Anonymous Authentication

**Files:** `frontend/src/hooks/useAuth.ts`, `frontend/src/lib/supabase.ts`

Players are automatically signed in anonymously — no account required. `useAuth` checks for an existing Supabase session on mount; if none exists, it calls `supabase.auth.signInAnonymously()`. The hook then subscribes to `onAuthStateChange` so the session is always current. The `playerId` (which is `session.user.id`) is the persistent identity used for every DB write and read throughout the app.

`supabase.ts` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `import.meta.env`. If either is missing, a `supabaseConfigured = false` flag is exported and the app displays a fixed red banner with setup instructions. This allows the frontend to run in a degraded offline mode without crashing.

---

### 2. Lobby Creation & Joining

**Files:** `frontend/src/pages/Lobby.tsx`, `supabase/migrations/001_lobbies.sql`, `supabase/migrations/002_lobby_players.sql`, `supabase/migrations/004_profiles.sql`

#### Creating a lobby
The host clicks "Create Room". The client inserts a row into the `lobbies` table with their `auth.uid()` as `host_id`. The database generates a unique 6-character room code via the `generate_lobby_code()` Postgres function, which picks randomly from uppercase letters excluding I and O (to avoid visual ambiguity). The lobby starts with `status = 'waiting'`.

#### Joining a lobby
The joiner enters the 6-character code. The client queries `lobbies` by code, then inserts a row into `lobby_players` with their `player_id`. Duplicate joins are detected by catching Postgres error code `23505` (unique violation) and show a friendly "already in this room" message.

#### Player profiles & avatars
Before creating or joining, players set a display name (max 20 chars) and optionally upload an avatar. Uploaded images are resized to 128×128 pixels using an off-screen `<canvas>` element, converted to JPEG, and stored as a data URL in the `profiles` table. A Postgres trigger (`on_auth_user_created`) auto-creates a profile row for every new anonymous user, using `COALESCE(full_name, email_prefix, 'Player')` as the display name default.

---

### 3. Waiting Room

**Files:** `frontend/src/pages/Room.tsx`, `frontend/src/hooks/useRealtimeChannel.ts`, `supabase/migrations/006_realtime.sql`

The room shows up to 4 player slots. Player data is kept in sync via two parallel mechanisms:

1. **Supabase Realtime broadcast** — `useRealtimeChannel` subscribes to a `lobby:{lobbyId}` channel. When a player joins, a broadcast event is emitted and the room list updates immediately.
2. **postgres_changes subscription** — A secondary `INSERT` watcher on `lobby_players` acts as a fallback to catch any joins that arrive before the broadcast listener is ready.

The host can set the match duration (60 / 90 / 120 / 180 seconds). Non-hosts click "Ready", which updates their `ready` column in `lobby_players`. The host's "Start Game" button only becomes active once all joined players have `ready = true`. The room code is displayed with a one-click copy-to-clipboard button.

---

### 4. Deterministic Fruit Queue

**Files:** `supabase/functions/generate-fruit-queue/index.ts`

When the host starts the game, the client calls the `generate-fruit-queue` Edge Function. The function:

1. Verifies the caller's JWT and confirms they are the `host_id` of the lobby.
2. Reads `lobby.seed` (a `BIGINT` stored on the lobby row) and passes it into `mulberry32()` — a compact, fast seeded pseudo-random number generator. Because every player uses the same seed, every player's fruit sequence is bit-for-bit identical.
3. Builds a weighted fruit pool: Apple 35%, Orange 30%, Watermelon 20%, Pineapple 15%. Each fruit spawn event contains `spawn_time_ms`, `spawn_x` (0.1–0.9), and `arc_height` (0.4–0.8).
4. Generates one fruit every 1 500 ms for the configured match duration.
5. Bulk-inserts all `fruit_spawn` events into `match_events` and flips `lobby.status` to `'playing'`.

---

### 5. Fruit Physics

**Files:** `frontend/src/utils/fruitPhysics.ts`, `frontend/src/store/gameStore.ts`

Fruits travel on a parabolic arc simulated with Newtonian kinematics. The constant `GRAVITY = 1800 px/s²` is applied downward each frame.

Initial velocities are computed by `computeInitialVelocity()`:

```
vy0 = -√(2 × GRAVITY × arcHeight × screenHeight)   // upward launch speed
vx0 = (0.5 - spawnX) × screenWidth × 0.5           // horizontal drift toward center
```

Each `gameStore.tick(dt)` call (invoked by the RAF loop) iterates every active fruit and updates its position:

```
x += vx × dt
y += vy × dt
vy += GRAVITY × dt
```

A fruit is considered "missed" when `y > screenHeight`. If it was not a bomb, the player loses one life and the combo counter resets.

---

### 6. Hand Tracking

**Files:** `frontend/src/hooks/useHandTracking.ts`, `frontend/src/lib/mediapipe.ts`

#### Model initialization
`mediapipe.ts` loads the HandLandmarker WASM bundle from the MediaPipe CDN (`@mediapipe/tasks-vision` v0.10.35) and configures it with:
- GPU delegate for real-time performance
- Detection confidence 0.4, presence confidence 0.1, tracking confidence 0.2 — intentionally low to keep detection stable in poor lighting conditions
- Max 1 hand
- The `.task` model file is bundled locally via a Vite `?url` import

#### Per-frame detection
`useHandTracking` runs `handLandmarker.detectForVideo(videoElement, timestamp)` on every animation frame while the webcam stream is active. It extracts landmark 8 (index fingertip) in normalized 0–1 coordinates, then mirrors the X-axis (`x = 1 - x`) to match the webcam's horizontal flip.

#### Smoothing & trail
Raw landmark positions are noisy. Two filters are applied:
- **Exponential smoothing** with factor 0.72: `smoothed = 0.72 × prev + 0.28 × raw`
- **Max delta clamp** of 0.1 per frame: discards MediaPipe artifact jumps during fast motion

Trail points are linearly interpolated between the previous and current smoothed position, then appended to a circular buffer capped at 20 points. The trail is drawn on an overlay canvas with fading alpha and increasing line width to give a motion-blur effect.

#### Skeleton rendering
The full hand skeleton (joints and bones) is drawn in lime green / white on each frame using the 21 MediaPipe hand landmarks.

---

### 7. Slice Detection

**Files:** `frontend/src/store/gameStore.ts`

Each frame, `gameStore.tick()` converts the normalized trail points to pixel coordinates and checks them against every active fruit's bounding circle. A hit is registered when a trail point falls within the fruit's radius.

On a successful slice:
- `fruit.mp3` plays (volume 0.7, `currentTime` reset so rapid slices overlap)
- Points awarded: `10 + 3 × comboCount`
- A floating score popup is created at the fruit's position
- The combo counter increments

If the fruit was a bomb:
- `bomb.mp3` plays
- 250 points deducted
- Combo resets
- Lives decrease by 1

---

### 8. Bomb Gesture (Hand Splay)

**Files:** `frontend/src/hooks/useHandTracking.ts`

Slicing a bomb with the normal cutting motion would be unfair — bombs must be avoided. Instead, a distinct gesture is used: rapidly spreading all fingers outward ("splay").

The spread value is calculated each frame as the average Euclidean distance from each fingertip to the palm center, normalized by palm size. A rolling 8-frame window stores recent spread values. If the frame-over-frame velocity (change in spread) exceeds a threshold of 0.4, a bomb event is triggered.

A 1 ms cooldown prevents double-firing. The visual feedback is a concentric ring burst + center flash animation rendered on the overlay canvas over 600 ms.

---

### 9. Score Popups

**Files:** `frontend/src/hooks/useGameLoop.ts`

Every slice and miss spawns a floating text popup on the fruit canvas. Each popup stores its creation timestamp, starting position, value (positive or negative), and is animated directly in the RAF draw loop:

```
t = (now - createdAt) / 900          // 0 → 1 over 900ms
alpha = 1 - t
y = startY - 70 × t                  // floats upward 70px
scale = 1.4 - 0.4 × t               // shrinks from 1.4× to 1×
```

Positive values are rendered in warm tan/cream; negative values in red/pink. Text uses Baloo Bhaijaan 2 bold with a drop shadow.

---

### 10. Game Music & Sound Effects

**Files:** `frontend/src/components/ProtectedRoute.tsx`, `frontend/src/pages/Game.tsx`, `frontend/src/store/gameStore.ts`

#### Lobby music
A single `HTMLAudioElement` is created once when `ProtectedRoute` mounts — it persists for the entire browser session, so navigating between Menu, Lobby, Room, and Results never restarts the track. A `useEffect` watches `location.pathname` and pauses the audio when the route is `/game`, `/bomb`, or `/shop`, and resumes it everywhere else.

#### In-game music
`Game.tsx` creates its own `Audio` instance for `game.mp3` (volume 0.25, loop). It starts on mount and is paused and cleaned up when the game ends or the component unmounts.

#### SFX
`fruit.mp3` and `bomb.mp3` are module-level singletons in `gameStore.ts` (volume 0.7). `currentTime` is reset to 0 before each `.play()` call so rapid consecutive slices don't get swallowed.

---

### 11. Live Leaderboard

**Files:** `frontend/src/pages/Game.tsx`, `frontend/src/components/Leaderboard.tsx`, `supabase/migrations/006_realtime.sql`

`006_realtime.sql` enables Supabase Realtime publication on the `lobby_players` table. During a match, `Game.tsx` subscribes to `postgres_changes` on `lobby_players` filtered by `lobby_id`. Every incoming row update rebuilds the leaderboard array sorted by score descending.

The local player's score is synced to Supabase every 2 seconds via `setInterval` so other players see live updates. The `Leaderboard` component renders:
- Gold rank number for 1st place
- Avatar circle (or initials fallback)
- Skull icon + strikethrough name + 40% opacity for eliminated players
- White highlight border for the local player's row

---

### 12. Sabotage System

**Files:** `supabase/functions/validate-sabotage/index.ts`, `supabase/migrations/003_match_events.sql`

Players can spend points to inject a bomb into an opponent's fruit stream. The transaction is server-authoritative to prevent cheating:

1. The client calls `validate-sabotage` with the target `player_id`.
2. The Edge Function verifies both players are in the same lobby, neither is eliminated, and the attacker has ≥ 100 points.
3. The function deducts 100 points from the attacker and inserts a `bomb_inject` event into `match_events` with `target_player_id` in the JSONB payload.
4. **Rollback:** if the event insert fails after the score deduction, the function re-increments the attacker's score to keep state consistent.

On the victim's client, a Realtime subscription on `match_events` detects `bomb_inject` events targeting their `player_id` and triggers a red edge-flash warning banner before the injected bomb appears.

> **Status:** Sabotage logic is fully implemented server-side. Frontend trigger-zone UI is still in development.

---

### 13. Results Screen

**Files:** `frontend/src/pages/Results.tsx`, `supabase/migrations/011_results_columns.sql`

At game end, `Game.tsx` writes the player's final `fruits_sliced` and `max_combo` to their `lobby_players` row, then navigates to `/results?lobbyId=…&score=…&maxCombo=…&fruits=…`.

`Results.tsx` reads the personal stats from URL params (for instant display) and fetches the full lobby leaderboard from `lobby_players` sorted by score. It also queries the `profiles` table to resolve display names and avatars. The winner (rank 1) gets a trophy banner and a highlighted leaderboard row. "Play again" navigates back to the Room with the same `lobbyId` and `code`.

`011_results_columns.sql` added the `fruits_sliced` and `max_combo` columns to `lobby_players` and granted `UPDATE` access to the authenticated role.

---

### 14. Database Schema

```
lobbies
  id          UUID PK
  code        TEXT UNIQUE          -- 6-char, generated by DB function
  host_id     UUID → auth.users
  status      TEXT                 -- 'waiting' | 'playing' | 'finished'
  seed        BIGINT               -- for deterministic fruit RNG
  max_players SMALLINT DEFAULT 4

lobby_players
  lobby_id    UUID → lobbies  ┐ composite PK
  player_id   UUID → auth.users ┘
  ready       BOOLEAN
  lives       SMALLINT DEFAULT 3
  score       INTEGER
  fruits_sliced INT
  max_combo   INT
  eliminated_at TIMESTAMPTZ

match_events
  id          UUID PK
  lobby_id    UUID → lobbies
  player_id   UUID (nullable)
  type        TEXT CHECK IN ('fruit_spawn', 'bomb_inject')
  payload     JSONB
  created_at  TIMESTAMPTZ

profiles
  id          UUID PK → auth.users (CASCADE DELETE)
  display_name TEXT
  avatar_url  TEXT
```

**Row-Level Security:** Every table requires `auth.uid()` to match the relevant player column. A `security definer` function `get_my_lobby_ids()` breaks the recursive RLS that would otherwise occur on `lobby_players` self-referential SELECT policies.

---

## Development Setup

### Prerequisites
- Node.js 18+
- Supabase CLI (`brew install supabase/tap/supabase`)

### Environment
Create `frontend/.env.local`:
```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### Install & run
```bash
# Install frontend deps
cd frontend
npm install

# Start dev server (http://localhost:5173)
npm run dev
```

### Supabase (local)
```bash
supabase start          # starts local Postgres + API
supabase db push        # applies all migrations
supabase functions serve # serves Edge Functions locally
```

### Asset locations
| File | Purpose |
|------|---------|
| `frontend/public/assets/game.mp3` | In-game background music |
| `frontend/public/assets/lobby.mp3` | Menu / lobby background music |
| `frontend/public/assets/fruit.mp3` | Slice SFX |
| `frontend/public/assets/bomb.mp3` | Bomb hit SFX |
| `frontend/public/assets/mascot.png` | Mascot sprite |
| `frontend/src/lib/models/hand_landmarker.task` | Bundled MediaPipe model |
