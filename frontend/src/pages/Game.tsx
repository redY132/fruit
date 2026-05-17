import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { GameCanvas } from '../components/GameCanvas';
import { Leaderboard, type ScoreEntry } from '../components/Leaderboard';
import { LivesDisplay } from '../components/LivesDisplay';
import { settingsStore } from '../store/settingsStore';
import { profileStore } from '../store/profileStore';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { loadFruitAssets } from '../game/FruitAssets';
import { setSpawnQueue, startMatch, setPhase } from '../store/gameStore';
import type { SpawnEvent, FruitType } from '../types/game';

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

interface GameProps {
  bombWarning?: boolean;
}

export function Game({ bombWarning = false }: GameProps) {
  const navigate = useNavigate();
  const { playerId } = useAuth();
  const [searchParams] = useSearchParams();
  const lobbyId = searchParams.get('lobbyId') ?? '';

  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [myLives, setMyLives] = useState(3);
  const [myScore, setMyScore] = useState(0);
  const duration = settingsStore.get().gameDuration;

  function handleBomb() {
    // TODO: send bomb to other players via websocket
    console.log('bomb sent');
  }

  async function fetchScores() {
    if (!lobbyId) return;
    const { data: lps } = await supabase
      .from('lobby_players')
      .select('player_id, score, lives, eliminated_at')
      .eq('lobby_id', lobbyId)
      .order('score', { ascending: false });
    if (!lps?.length) return;
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', lps.map(p => p.player_id));
    const nameMap = Object.fromEntries(profs?.map(p => [p.id, p.display_name]) ?? []);
    const entries: ScoreEntry[] = lps.map((lp, i) => ({
      id: lp.player_id,
      rank: i + 1,
      name: nameMap[lp.player_id] ?? 'Unknown',
      score: lp.score,
      hearts: lp.lives,
      dead: lp.eliminated_at !== null,
    }));
    setScores(entries);
    const mine = entries.find(e => e.id === playerId);
    if (mine) { setMyLives(mine.hearts); setMyScore(mine.score); }
  }

  useEffect(() => {
    let mounted = true;
    const types = ['apple', 'orange', 'watermelon', 'mango', 'bomb'] as FruitType[];
    const xs = [0.2, 0.5, 0.8];
    const devQueue: SpawnEvent[] = Array.from({ length: 20 }, (_, i) => ({
      id: `fruit-${i}`,
      type: types[i % 5],
      spawnAt: i * 2750,
      x: xs[i % 3],
      arc_height: 0.6,
    }));
    setSpawnQueue(devQueue);
    loadFruitAssets().then(() => {
      if (mounted) startMatch(performance.now());
    });
    return () => {
      mounted = false;
      setPhase('lobby');
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
        'postgres_changes' as any,
        { event: 'UPDATE', schema: 'public', table: 'lobby_players', filter: `lobby_id=eq.${lobbyId}` },
        () => fetchScores()
      )
      .subscribe();
    return () => { channel.unsubscribe(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyId]);

  // Show self in leaderboard immediately even before DB scores load
  const displayScores: ScoreEntry[] = scores.length > 0 ? scores : (
    playerId ? [{
      id: playerId,
      rank: 1,
      name: profileStore.get().name || 'Player',
      score: myScore,
      hearts: myLives,
      dead: false,
    }] : []
  );

  return (
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
        <div className="text-4xl font-mono font-black text-white tracking-tight">{formatTime(duration)}</div>
        <div className="text-xs font-bold text-white/70 uppercase tracking-widest">time remaining</div>
      </div>

      {/* Top Right: Player Stats */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-2 z-10">
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
          <LivesDisplay lives={myLives} />
          <div className="w-px h-8 bg-white/10 mx-2" />
          <div className="flex flex-col items-end">
            <div className="text-4xl font-mono font-black text-white leading-none tracking-tight">
              {myScore.toLocaleString()}
            </div>
            <div className="text-xs font-mono text-white/50">score</div>
          </div>
        </div>
      </div>

      {/* Bottom Left: Live Leaderboard */}
      <Leaderboard entries={displayScores} localPlayerId={playerId ?? ''} />

      {/* Dev navigation */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 opacity-0 hover:opacity-100 transition-opacity z-50">
        <button
          onClick={() => navigate('/bomb')}
          className="text-white bg-destructive/50 hover:bg-destructive px-3 py-2 text-xs rounded font-bold"
        >
          Test Bomb Warning
        </button>
        <button
          onClick={() => navigate('/results')}
          className="text-white bg-black/50 hover:bg-black/80 px-3 py-2 text-xs rounded font-bold"
        >
          Go to Results
        </button>
      </div>
    </GameCanvas>
  );
}
