import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Crown } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';

const FONT_TITLE = "'Irish Grover', cursive";
const FONT_BODY = "'Baloo Bhaijaan 2', sans-serif";
const BROWN = '#564A4A';
const SHADOW = '0 4px 14px rgba(86,74,74,0.35)';

const MOCK_PLAYERS = [
  { id: '1', name: 'Kuro', isHost: true },
  { id: '2', name: 'PlayerTwo', isYou: true },
];

export function Room() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') ?? 'XXXXXX';

  const [isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReady() {
    if (isReady) {
      navigate('/game');
    } else {
      setIsReady(true);
    }
  }

  return (
    <div className="w-screen h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Back button */}
      <button
        onClick={() => navigate('/lobby')}
        className="absolute top-6 left-6 z-10 flex items-center gap-2 hover:opacity-70 transition-opacity"
        style={{ fontFamily: FONT_BODY, color: BROWN }}
      >
        <ArrowLeft size={20} />
        <span className="font-semibold text-sm">Lobby</span>
      </button>

      {/* Main content */}
      <div className="flex flex-col items-center z-10 mb-8 w-[360px]" style={{ fontFamily: FONT_BODY }}>

        {/* Room code */}
        <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: `${BROWN}99` }}>
          Room Code
        </p>
        <div className="flex items-center gap-3 mb-8">
          <span
            className="text-5xl tracking-[0.2em]"
            style={{ fontFamily: FONT_TITLE, color: BROWN }}
          >
            {code}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg transition-colors hover:opacity-70"
            style={{ color: BROWN }}
            title="Copy code"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>

        {/* Player list */}
        <div className="w-full flex flex-col gap-2 mb-6">
          {MOCK_PLAYERS.map(p => (
            <PlayerSlot key={p.id} name={p.name} isHost={p.isHost} isYou={p.isYou} />
          ))}
          {Array.from({ length: Math.max(0, 4 - MOCK_PLAYERS.length) }).map((_, i) => (
            <EmptySlot key={`empty-${i}`} />
          ))}
        </div>

        {/* Ready button */}
        <button
          onClick={handleReady}
          className="w-full py-4 rounded-full font-bold text-lg transition-all active:scale-95"
          style={
            isReady
              ? { backgroundColor: BROWN, color: '#fff', boxShadow: SHADOW }
              : { backgroundColor: '#EDE8E8', border: `2px solid ${BROWN}`, color: BROWN, boxShadow: SHADOW }
          }
        >
          {isReady ? 'READY — Start Game' : 'Not Ready'}
        </button>
      </div>

      {/* Mascot */}
      <img
        src="/assets/mascot.png"
        alt="Fruity mascots"
        className="absolute bottom-0 left-0 w-full object-contain object-bottom pointer-events-none select-none"
        style={{ maxHeight: '38vh' }}
      />
    </div>
  );
}

function PlayerSlot({ name, isHost, isYou }: { name: string; isHost?: boolean; isYou?: boolean }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white"
      style={{ border: `1.5px solid ${BROWN}30` }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
        style={{ backgroundColor: BROWN }}
      >
        {name.substring(0, 2).toUpperCase()}
      </div>
      <div className="flex items-center gap-2 flex-1">
        <span className="font-semibold" style={{ color: BROWN }}>
          {name}
        </span>
        {isHost && <Crown size={14} style={{ color: BROWN }} />}
        {isYou && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${BROWN}15`, color: BROWN }}>
            YOU
          </span>
        )}
      </div>
    </div>
  );
}

function EmptySlot() {
  return (
    <div
      className="flex items-center justify-center px-4 py-3 rounded-xl h-[52px]"
      style={{ border: `1.5px dashed ${BROWN}30` }}
    >
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: `${BROWN}50` }}>
        Waiting for player…
      </span>
    </div>
  );
}
