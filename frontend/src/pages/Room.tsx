import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Copy, Check, Crown } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { settingsStore } from '../store/settingsStore';
import { profileStore } from '../store/profileStore';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeChannel } from '../hooks/useRealtimeChannel';
import { supabase } from '../lib/supabase';
import { lobbyChannel, LobbyEvent } from '../lib/channels';

const DURATIONS = [60, 90, 120, 180];

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return sec === 0 ? `${m}m` : `${m}:${String(sec).padStart(2, '0')}`;
}

const FONT_TITLE = "'Irish Grover', cursive";
const FONT_BODY = "'Baloo Bhaijaan 2', sans-serif";
const BROWN = '#564A4A';
const SHADOW = '0 4px 14px rgba(86,74,74,0.35)';

interface RoomPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isYou: boolean;
  ready: boolean;
  avatarUrl?: string | null;
}

export function Room() {
  const navigate = useNavigate();
  const { playerId } = useAuth();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') ?? 'XXXXXX';
  const lobbyId = searchParams.get('lobbyId') ?? '';

  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [hostId, setHostId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [duration, setDuration] = useState(settingsStore.get().gameDuration);
  const [starting, setStarting] = useState(false);

  const isHost = hostId === playerId;

  const fetchPlayers = useCallback(async () => {
    if (!lobbyId || !playerId) return;
    console.log('[Room] fetchPlayers lobbyId:', lobbyId, 'playerId:', playerId);
    const [{ data: lps, error: lpsErr }, { data: lobby, error: lobbyErr }] = await Promise.all([
      supabase.from('lobby_players').select('player_id, ready').eq('lobby_id', lobbyId),
      supabase.from('lobbies').select('host_id').eq('id', lobbyId).single(),
    ]);
    console.log('[Room] lobby_players rows:', lps, lpsErr?.message);
    console.log('[Room] lobby:', lobby, lobbyErr?.message);
    if (lobby?.host_id) setHostId(lobby.host_id);
    if (!lps?.length) return;
    const { data: profs, error: profsErr } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', lps.map(p => p.player_id));
    console.log('[Room] profiles:', profs, profsErr?.message);
    const nameMap = Object.fromEntries(profs?.map(p => [p.id, p.display_name]) ?? []);
    const avatarMap = Object.fromEntries(profs?.map(p => [p.id, p.avatar_url]) ?? []);
    setPlayers(lps.map(lp => ({
      id: lp.player_id,
      name: nameMap[lp.player_id] ?? 'Unknown',
      isHost: lp.player_id === lobby?.host_id,
      isYou: lp.player_id === playerId,
      ready: lp.ready,
      avatarUrl: avatarMap[lp.player_id] ?? null,
    })));
  }, [lobbyId, playerId]);

  useEffect(() => {
    if (!lobbyId || !playerId) return;
    // Show self immediately from local state so the list is never blank
    const { name } = profileStore.get();
    setPlayers(prev => prev.some(p => p.id === playerId) ? prev : [{
      id: playerId,
      name: name || 'Player',
      isHost: true,
      isYou: true,
      ready: false,
      avatarUrl: profileStore.get().avatarUrl ?? null,
    }]);
    fetchPlayers();
  }, [lobbyId, playerId, fetchPlayers]);

  const { broadcast } = useRealtimeChannel(
    lobbyId ? lobbyChannel(lobbyId) : '',
    (event, payload) => {
      if (event === LobbyEvent.PlayerJoined || event === LobbyEvent.PlayerReady) {
        fetchPlayers();
      }
      if (event === LobbyEvent.MatchStart) {
        const p = payload as { lobbyId: string; duration?: number };
        if (typeof p?.duration === 'number') {
          settingsStore.save({ gameDuration: p.duration });
        }
        navigate(`/game?lobbyId=${lobbyId}`);
      }
    }
  );

  useEffect(() => {
    if (lobbyId) broadcast(LobbyEvent.PlayerJoined, { playerId });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyId]);

  // Reliable fallback: postgres_changes fires for every INSERT into lobby_players
  // regardless of broadcast timing, so the host always sees a new joiner.
  useEffect(() => {
    if (!lobbyId) return;
    const sub = supabase
      .channel(`lp-${lobbyId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'lobby_players', filter: `lobby_id=eq.${lobbyId}` },
        () => fetchPlayers(),
      )
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [lobbyId, fetchPlayers]);

  function handleDuration(d: number) {
    setDuration(d);
    settingsStore.save({ gameDuration: d });
  }

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleReady() {
    if (!lobbyId || !playerId) return;
    setIsReady(true);
    await supabase.from('lobby_players')
      .update({ ready: true })
      .eq('lobby_id', lobbyId)
      .eq('player_id', playerId);
    broadcast(LobbyEvent.PlayerReady, { playerId });
  }

  async function handleStart() {
    if (!lobbyId || starting) return;
    setStarting(true);
    await supabase.functions.invoke('generate-fruit-queue', {
      body: { lobby_id: lobbyId, gameDuration: duration },
    });
    broadcast(LobbyEvent.MatchStart, { lobbyId, duration });
    navigate(`/game?lobbyId=${lobbyId}`);
  }

  function handleBack() {
    if (lobbyId && playerId) {
      supabase.from('lobby_players')
        .delete()
        .eq('lobby_id', lobbyId)
        .eq('player_id', playerId);
    }
    navigate('/lobby');
  }

  const allReady = players.length === 0 || players.filter(p => !p.isHost).every(p => p.ready);

  return (
    <div className="w-screen h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 z-10 flex items-center gap-2 hover:opacity-70 transition-opacity"
        style={{ fontFamily: FONT_BODY, color: BROWN }}
      >
        <ArrowLeft size={20} />
        <span className="font-semibold text-sm">Lobby</span>
      </button>

      <div className="flex flex-col items-center z-10 mb-8 w-[360px]" style={{ fontFamily: FONT_BODY }}>

        {/* Room code */}
        <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: `${BROWN}99` }}>
          Room Code
        </p>
        <div className="flex items-center gap-3 mb-8">
          <span className="text-5xl tracking-[0.2em]" style={{ fontFamily: FONT_TITLE, color: BROWN }}>
            {code}
          </span>
          <button onClick={handleCopy} className="p-2 rounded-lg transition-colors hover:opacity-70" style={{ color: BROWN }}>
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>

        {/* Player list */}
        <div className="w-full flex flex-col gap-2 mb-6">
          {players.map(p => (
            <PlayerSlot key={p.id} name={p.name} isHost={p.isHost} isYou={p.isYou} ready={p.ready} avatarUrl={p.avatarUrl} />
          ))}
          {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
            <EmptySlot key={`empty-${i}`} />
          ))}
        </div>

        {/* Game Duration (host only) */}
        {isHost && (
          <div className="w-full flex flex-col gap-2 mb-6">
            <label className="text-xs font-bold uppercase tracking-widest pl-1" style={{ color: `${BROWN}80` }}>
              Game Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  onClick={() => handleDuration(d)}
                  className="py-3 rounded-full font-bold text-sm transition-all active:scale-95"
                  style={
                    duration === d
                      ? { backgroundColor: BROWN, color: '#fff', boxShadow: SHADOW }
                      : { backgroundColor: '#EDE8E8', border: `2px solid ${BROWN}`, color: BROWN }
                  }
                >
                  {formatDuration(d)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action button */}
        {isHost ? (
          <button
            onClick={handleStart}
            disabled={!allReady || starting}
            className="w-full py-4 rounded-full font-bold text-lg transition-all active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: BROWN, color: '#fff', boxShadow: SHADOW }}
          >
            {starting ? 'Starting…' : allReady ? 'Start Game' : 'Waiting for players…'}
          </button>
        ) : (
          <button
            onClick={handleReady}
            disabled={isReady}
            className="w-full py-4 rounded-full font-bold text-lg transition-all active:scale-95 disabled:opacity-60"
            style={
              isReady
                ? { backgroundColor: BROWN, color: '#fff', boxShadow: SHADOW }
                : { backgroundColor: '#EDE8E8', border: `2px solid ${BROWN}`, color: BROWN, boxShadow: SHADOW }
            }
          >
            {isReady ? '✓ Ready' : 'Ready Up'}
          </button>
        )}
      </div>

      <img
        src="/assets/mascot.png"
        alt="Fruity mascots"
        className="absolute bottom-0 left-0 w-full object-contain object-bottom pointer-events-none select-none"
        style={{ maxHeight: '38vh' }}
      />
    </div>
  );
}

function PlayerSlot({ name, isHost, isYou, ready, avatarUrl }: { name: string; isHost?: boolean; isYou?: boolean; ready?: boolean; avatarUrl?: string | null }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white" style={{ border: `1.5px solid ${BROWN}30` }}>
      <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: BROWN }}>
        {avatarUrl
          ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          : name.substring(0, 2).toUpperCase()
        }
      </div>
      <div className="flex items-center gap-2 flex-1">
        <span className="font-semibold" style={{ color: BROWN }}>{name}</span>
        {isHost && <Crown size={14} style={{ color: BROWN }} />}
        {isYou && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${BROWN}15`, color: BROWN }}>YOU</span>
        )}
      </div>
      {ready && !isHost && <span className="text-xs font-bold text-green-600">✓</span>}
    </div>
  );
}

function EmptySlot() {
  return (
    <div className="flex items-center justify-center px-4 py-3 rounded-xl h-[52px]" style={{ border: `1.5px dashed ${BROWN}30` }}>
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: `${BROWN}50` }}>Waiting for player…</span>
    </div>
  );
}
