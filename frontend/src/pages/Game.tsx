import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { GameCanvas } from "../components/GameCanvas";
import { Leaderboard, type ScoreEntry } from "../components/Leaderboard";
import { settingsStore } from "../store/settingsStore";
import { profileStore } from "../store/profileStore";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { loadFruitAssets, FOOD_KEYS } from "../game/FruitAssets";
import { setSpawnQueue, startMatch, setPhase, getLocalScore, getCombo } from "../store/gameStore";
import type { SpawnEvent } from "../types/game";

const START_GAP_MS = 3000;
const END_GAP_MS = 500;
const ARC_HEIGHTS = [0.35, 0.45, 0.55, 0.65, 0.75, 0.85];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

interface GameProps {
  bombWarning?: boolean;
}

export function Game({ bombWarning = false }: GameProps) {
  const navigate = useNavigate();
  const { playerId } = useAuth();
  const [searchParams] = useSearchParams();
  const lobbyId = searchParams.get("lobbyId") ?? "";

  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [myScore, setMyScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboKey, setComboKey] = useState(0);
  const [scoreKey, setScoreKey] = useState(0);
  const prevComboRef = useRef(0);
  const prevScoreRef = useRef(0);
  const duration = settingsStore.get().gameDuration;
  const [timeRemaining, setTimeRemaining] = useState(duration);

  function handleBomb() {
    // TODO: send bomb to other players via websocket
    console.log("bomb sent");
  }

  async function fetchScores() {
    if (!lobbyId) return;
    const { data: lps } = await supabase
      .from("lobby_players")
      .select("player_id, score, eliminated_at")
      .eq("lobby_id", lobbyId)
      .order("score", { ascending: false });
    if (!lps?.length) return;
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in(
        "id",
        lps.map((p) => p.player_id)
      );
    const nameMap = Object.fromEntries(
      profs?.map((p) => [p.id, p.display_name]) ?? []
    );
    const avatarMap = Object.fromEntries(
      profs?.map((p) => [p.id, p.avatar_url]) ?? []
    );
    const entries: ScoreEntry[] = lps.map((lp, i) => ({
      id: lp.player_id,
      rank: i + 1,
      name: nameMap[lp.player_id] ?? "Unknown",
      score: lp.score,
      dead: lp.eliminated_at !== null,
      avatarUrl: avatarMap[lp.player_id] ?? null,
    }));
    setScores(entries);
    const mine = entries.find((e) => e.id === playerId);
    if (mine) {
      setMyScore(mine.score);
    }
  }

  useEffect(() => {
    let mounted = true;
    const BOMB_RATE = 0.18;
    const durationMs = duration * 1000;
    const n = Math.max(
      2,
      Math.floor(durationMs / ((START_GAP_MS + END_GAP_MS) / 2))
    );
    let t = 0;
    const devQueue: SpawnEvent[] = Array.from({ length: n }, (_, i) => {
      const gap = START_GAP_MS + (END_GAP_MS - START_GAP_MS) * (i / (n - 1));
      const spawnAt = t;
      t += gap;
      const isBomb = Math.random() < BOMB_RATE;
      const type = isBomb
        ? 'bomb'
        : FOOD_KEYS[Math.floor(Math.random() * FOOD_KEYS.length)];
      return {
        id: `fruit-${i}`,
        type,
        spawnAt,
        x: 0.1 + Math.random() * 0.8,
        arc_height: ARC_HEIGHTS[Math.floor(Math.random() * ARC_HEIGHTS.length)],
      };
    });
    setSpawnQueue(devQueue);
    loadFruitAssets().then(() => {
      if (mounted) startMatch(performance.now());
    });
    return () => {
      mounted = false;
      setPhase("lobby");
    };
  }, []);

  useEffect(() => {
    fetchScores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyId, playerId]);

  useEffect(() => {
    if (!lobbyId) return;
    const channel = supabase
      .channel(`game-scores-${lobbyId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "lobby_players",
          filter: `lobby_id=eq.${lobbyId}`,
        },
        () => fetchScores()
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyId]);

  useEffect(() => {
    const id = setInterval(() => {
      setMyScore(getLocalScore());
      setCombo(getCombo());
    }, 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!lobbyId || !playerId) return;
    const id = setInterval(async () => {
      const score = getLocalScore();
      const { error } = await supabase
        .from('lobby_players')
        .update({ score })
        .eq('lobby_id', lobbyId)
        .eq('player_id', playerId);
      if (error) console.error('[score-sync] update failed:', error.message);
    }, 2000);
    return () => clearInterval(id);
  }, [lobbyId, playerId]);

  useEffect(() => {
    const id = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id);
          navigate(`/results?lobbyId=${lobbyId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (combo > prevComboRef.current) setComboKey(k => k + 1);
    prevComboRef.current = combo;
  }, [combo]);

  useEffect(() => {
    if (myScore !== prevScoreRef.current) setScoreKey(k => k + 1);
    prevScoreRef.current = myScore;
  }, [myScore]);

  // Show self in leaderboard immediately even before DB scores load
  const displayScores: ScoreEntry[] =
    scores.length > 0
      ? scores
      : playerId
      ? [
          {
            id: playerId,
            rank: 1,
            name: profileStore.get().name || "Player",
            score: myScore,
            dead: false,
          },
        ]
      : [];

  return (
    <>
    <style>{`
      @keyframes comboPunch {
        0%   { transform: scale(1.45); opacity: 0.6; }
        55%  { transform: scale(0.93); opacity: 1;   }
        100% { transform: scale(1);    opacity: 1;   }
      }
      @keyframes scorePunch {
        0%   { transform: scale(1.35); }
        55%  { transform: scale(0.96); }
        100% { transform: scale(1);    }
      }
    `}</style>
    <GameCanvas bombWarning={bombWarning} onBomb={handleBomb}>
      {/* Bomb incoming warning banner */}
      {bombWarning && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-pulse">
          <div className="bg-destructive text-white px-6 py-2 rounded-full font-bold tracking-widest text-sm flex items-center gap-2">
            <span>⚠</span> INCOMING BOMB — 2s
          </div>
        </div>
      )}

      {/* Top Center: Timer */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
        <div className="text-4xl font-mono font-black text-white tracking-tight">
          {formatTime(timeRemaining)}
        </div>
        <div className="text-xs font-bold text-white/70 uppercase tracking-widest">
          time remaining
        </div>
      </div>

      {/* Top Right: Player Stats */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-1 z-10">
        {/* Score box */}
        <div className="flex items-center bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
          <div className="flex flex-col items-end">
            <div
              key={scoreKey}
              className="text-4xl font-black leading-none tracking-tight"
              style={{
                fontFamily: "'Baloo Bhaijaan 2', sans-serif",
                backgroundImage: myScore < 0
                  ? 'linear-gradient(180deg, #C04040 0%, #F08080 100%)'
                  : 'linear-gradient(180deg, #C07878 0%, #F8E0E0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(1px 2px 5px rgba(0,0,0,0.6))',
                animation: 'scorePunch 0.25s ease-out',
              }}
            >
              {myScore.toLocaleString()}
            </div>
            <div className="text-xs font-mono text-white/50">score</div>
          </div>
        </div>

        {/* Scoring diagram */}
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-right space-y-0.5">
          <div className="text-xs font-mono text-white/50">
            🍎 <span className="text-white/80">10 + 3×combo</span>
          </div>
          <div className="text-xs font-mono text-white/50">
            💣 hit <span className="text-white/80">−250 pts</span>
          </div>
          <div className="text-xs font-mono text-white/50">
            💣 send <span className="text-white/80">75 pts</span>
          </div>
        </div>
      </div>

      {/* Bottom Right: Combo counter */}
      {combo > 0 && (
        <div className="absolute bottom-6 right-6 z-10 select-none">
          <div
            key={comboKey}
            className="font-black leading-none tracking-tighter"
            style={{
              fontFamily: "'Baloo Bhaijaan 2', sans-serif",
              fontSize: '5.5rem',
              backgroundImage: 'linear-gradient(180deg, #C07878 0%, #F8E0E0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(2px 3px 8px rgba(0,0,0,0.65))',
              animation: 'comboPunch 0.28s cubic-bezier(0.36,0.07,0.19,0.97)',
            }}
          >
            {combo}x
          </div>
        </div>
      )}

      {/* Bottom Left: Live Leaderboard */}
      <Leaderboard entries={displayScores} localPlayerId={playerId ?? ""} />

      {/* Dev navigation */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 opacity-0 hover:opacity-100 transition-opacity z-50">
        <button
          onClick={() => navigate("/bomb")}
          className="text-white bg-destructive/50 hover:bg-destructive px-3 py-2 text-xs rounded font-bold"
        >
          Test Bomb Warning
        </button>
        <button
          onClick={() => navigate("/results")}
          className="text-white bg-black/50 hover:bg-black/80 px-3 py-2 text-xs rounded font-bold"
        >
          Go to Results
        </button>
      </div>
    </GameCanvas>
    </>
  );
}
