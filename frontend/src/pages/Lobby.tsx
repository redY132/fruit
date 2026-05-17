import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera } from 'lucide-react';
import { useNavigate } from 'react-router';
import { profileStore } from '../store/profileStore';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const FONT_TITLE = "'Irish Grover', cursive";
const FONT_BODY = "'Baloo Bhaijaan 2', sans-serif";
const BROWN = '#564A4A';
const SHADOW = '0 4px 14px rgba(86,74,74,0.35)';

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function Lobby() {
  const navigate = useNavigate();
  const { playerId } = useAuth();
  const profile = profileStore.get();

  const [showJoin, setShowJoin] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState(profile.name);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl);
  const [loading, setLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [createError, setCreateError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!playerId) return;
    supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', playerId)
      .single()
      .then(({ data }) => {
        if (data?.display_name) {
          setName(data.display_name);
          profileStore.save({ name: data.display_name });
        }
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
          profileStore.save({ avatarUrl: data.avatar_url });
        }
      });
  }, [playerId]);

  function handleNameChange(val: string) {
    setName(val);
    profileStore.save({ name: val });
    if (playerId) profileStore.syncToSupabase(playerId, val, profileStore.get().avatarUrl);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 128;
      const ratio = Math.min(MAX / img.width, MAX / img.height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setAvatarUrl(dataUrl);
      profileStore.save({ avatarUrl: dataUrl });
      if (playerId) profileStore.syncToSupabase(playerId, name, dataUrl);
    };
    img.src = objectUrl;
  }

  async function upsertProfile(userId: string) {
    const avatar = profileStore.get().avatarUrl;
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: name || 'Player',
      ...(avatar ? { avatar_url: avatar } : {}),
    });
    if (error) console.error('[upsertProfile] failed:', error.message, error);
  }

  async function handleCreate() {
    if (!playerId || loading) return;
    setLoading(true);
    setCreateError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setCreateError('Session expired — please refresh.');
      return;
    }
    await upsertProfile(user.id);
    const code = generateCode();
    const { data, error } = await supabase
      .from('lobbies')
      .insert({
        code,
        host_id: user.id,
        status: 'waiting',
        max_players: 4,
        seed: Math.floor(Math.random() * 2 ** 32),
      })
      .select('id')
      .single();
    if (!error && data) {
      console.log('[Create] lobby created:', data.id, 'userId:', user.id);
      const { error: joinErr } = await supabase.from('lobby_players').insert({ lobby_id: data.id, player_id: user.id });
      if (joinErr) console.error('[Create] lobby_players insert failed:', joinErr.message, joinErr);
      else console.log('[Create] lobby_players insert OK');
      setLoading(false);
      navigate(`/room?code=${code}&lobbyId=${data.id}`);
    } else {
      setLoading(false);
      setCreateError(error?.message ?? 'Failed to create room. Try again.');
    }
  }

  async function handleJoin() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || !playerId || loading) return;
    setLoading(true);
    setJoinError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setJoinError('Session expired — please refresh and try again.');
      return;
    }
    console.log('[handleJoin] verified user.id:', user.id);
    await upsertProfile(user.id);
    const { data } = await supabase
      .from('lobbies')
      .select('id')
      .eq('code', trimmed)
      .eq('status', 'waiting')
      .single();
    if (data) {
      const { error: joinErr } = await supabase
        .from('lobby_players')
        .insert({ lobby_id: data.id, player_id: user.id });
      if (joinErr && joinErr.code !== '23505') { // 23505 = already in lobby (OK)
        setLoading(false);
        console.error('[handleJoin] lobby_players insert failed:', joinErr);
        setJoinError(`Failed to join: ${joinErr.message}`);
        return;
      }
      setLoading(false);
      navigate(`/room?code=${trimmed}&lobbyId=${data.id}`);
    } else {
      setLoading(false);
      setJoinError('Room not found or already started.');
    }
  }

  return (
    <div className="w-screen h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-10 flex items-center gap-2 hover:opacity-70 transition-opacity"
        style={{ fontFamily: FONT_BODY, color: BROWN }}
      >
        <ArrowLeft size={20} />
        <span className="font-semibold text-sm">Back</span>
      </button>

      {/* Main content */}
      <div className="flex flex-col items-center z-10 mb-8">
        <h1
          className="text-7xl leading-none mb-8"
          style={{ fontFamily: FONT_TITLE, color: BROWN }}
        >
          Rooms
        </h1>

        <div className="flex flex-col gap-3 w-[280px]" style={{ fontFamily: FONT_BODY }}>
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-1 mb-1">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: `${BROWN}80` }}>
              Profile Picture
            </label>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center transition-opacity hover:opacity-80 group"
              style={{ backgroundColor: `${BROWN}20`, border: `2px solid ${BROWN}40` }}
              title="Upload photo"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold" style={{ color: BROWN }}>
                  {name ? name[0].toUpperCase() : '?'}
                </span>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera size={20} className="text-white" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Name input */}
          <div className="flex flex-col gap-1 mb-1">
            <label className="text-xs font-bold uppercase tracking-widest pl-1" style={{ color: `${BROWN}80` }}>
              Your Name
            </label>
            <input
              type="text"
              maxLength={20}
              placeholder="Enter your name"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              className="w-full py-3 px-5 rounded-full text-sm font-semibold outline-none transition-colors border-2 placeholder:opacity-40"
              style={{ fontFamily: FONT_BODY, borderColor: BROWN, color: BROWN, backgroundColor: '#EDE8E8', boxShadow: SHADOW }}
            />
          </div>

          <button
            onClick={() => setShowJoin(true)}
            disabled={loading || !playerId}
            className="w-full text-white py-4 rounded-full font-bold text-lg transition-colors active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: BROWN, boxShadow: SHADOW }}
          >
            Join Room
          </button>

          <button
            onClick={handleCreate}
            disabled={loading || !playerId}
            className="w-full text-white py-4 rounded-full font-bold text-lg transition-colors active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: BROWN, boxShadow: SHADOW }}
          >
            {loading ? 'Creating…' : !playerId ? 'Connecting…' : '+ Create Room'}
          </button>
          {createError && (
            <p className="text-sm text-red-500 text-center -mt-1">{createError}</p>
          )}
        </div>
      </div>

      {/* Mascot */}
      <img
        src="/assets/mascot.png"
        alt="Fruity mascots"
        className="absolute bottom-0 left-0 w-full object-contain object-bottom pointer-events-none select-none"
        style={{ maxHeight: '38vh' }}
      />

      {/* Join Room modal */}
      {showJoin && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => { setShowJoin(false); setJoinError(''); }}
        >
          <div
            className="bg-white rounded-2xl p-8 w-[340px] shadow-2xl flex flex-col items-center gap-6"
            onClick={e => e.stopPropagation()}
            style={{ fontFamily: FONT_BODY }}
          >
            <h2 className="text-3xl font-bold" style={{ color: BROWN }}>
              Enter Room Code
            </h2>
            <input
              autoFocus
              type="text"
              maxLength={6}
              placeholder="ABC123"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setJoinError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              className="w-full text-center text-3xl font-mono tracking-widest border-2 rounded-xl py-3 px-4 outline-none"
              style={{ borderColor: joinError ? '#ef4444' : BROWN, color: BROWN }}
            />
            {joinError && (
              <p className="text-sm text-red-500 -mt-4">{joinError}</p>
            )}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => { setShowJoin(false); setJoinError(''); }}
                className="flex-1 py-3 rounded-full font-semibold text-sm border-2 transition-colors"
                style={{ borderColor: BROWN, color: BROWN }}
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                disabled={loading}
                className="flex-1 py-3 rounded-full font-bold text-sm text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: BROWN, boxShadow: SHADOW }}
              >
                {loading ? 'Joining…' : 'Join'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
