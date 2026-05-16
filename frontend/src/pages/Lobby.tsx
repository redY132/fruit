import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

const FONT_TITLE = "'Irish Grover', cursive";
const FONT_BODY = "'Baloo Bhaijaan 2', sans-serif";
const BROWN = '#564A4A';
const SHADOW = '0 4px 14px rgba(86,74,74,0.35)';

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function Lobby() {
  const navigate = useNavigate();
  const [showJoin, setShowJoin] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  function handleJoin() {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length > 0) navigate(`/room?code=${trimmed}`);
  }

  function handleCreate() {
    navigate(`/room?code=${generateCode()}`);
  }

  return (
    <div className="w-screen h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-[#564A4A] hover:opacity-70 transition-opacity"
        style={{ fontFamily: FONT_BODY }}
      >
        <ArrowLeft size={20} />
        <span className="font-semibold text-sm">Back</span>
      </button>

      {/* Main content */}
      <div className="flex flex-col items-center z-10 mb-8">
        <h1
          className="text-7xl leading-none mb-10"
          style={{ fontFamily: FONT_TITLE, color: BROWN }}
        >
          Rooms
        </h1>

        <div className="flex flex-col gap-3 w-[280px]" style={{ fontFamily: FONT_BODY }}>
          {/* Profile name */}
          <div className="flex flex-col gap-1 mb-1">
            <label className="text-xs font-bold uppercase tracking-widest pl-1" style={{ color: `${BROWN}80` }}>
              Your Name
            </label>
            <input
              type="text"
              maxLength={20}
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full py-3 px-5 rounded-full text-sm font-semibold outline-none transition-colors border-2 placeholder:opacity-40"
              style={{
                fontFamily: FONT_BODY,
                borderColor: BROWN,
                color: BROWN,
                backgroundColor: '#EDE8E8',
                boxShadow: SHADOW,
              }}
            />
          </div>

          <button
            onClick={() => setShowJoin(true)}
            className="w-full text-white py-4 rounded-full font-bold text-lg transition-colors active:scale-95"
            style={{ backgroundColor: BROWN, boxShadow: SHADOW }}
          >
            Join Room
          </button>

          <button
            onClick={handleCreate}
            className="w-full text-white py-4 rounded-full font-bold text-lg transition-colors active:scale-95"
            style={{ backgroundColor: BROWN, boxShadow: SHADOW }}
          >
            + Create Room
          </button>
        </div>
      </div>

      {/* Mascot */}
      <img
        src="/assets/mascot.png"
        alt="Fruity mascots"
        className="absolute bottom-0 left-0 w-full object-contain object-bottom pointer-events-none select-none"
        style={{ maxHeight: '42vh' }}
      />

      {/* Join Room modal */}
      {showJoin && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setShowJoin(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 w-[340px] shadow-2xl flex flex-col items-center gap-6"
            onClick={e => e.stopPropagation()}
            style={{ fontFamily: FONT_BODY }}
          >
            <h2
              className="text-3xl font-bold"
              style={{ fontFamily: FONT_BODY, color: BROWN }}
            >
              Enter Room Code
            </h2>

            <input
              autoFocus
              type="text"
              maxLength={6}
              placeholder="ABC123"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              className="w-full text-center text-3xl font-mono tracking-widest border-2 rounded-xl py-3 px-4 outline-none transition-colors"
              style={{
                borderColor: BROWN,
                color: BROWN,
                fontFamily: FONT_BODY,
              }}
            />

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowJoin(false)}
                className="flex-1 py-3 rounded-full font-semibold text-sm border-2 transition-colors"
                style={{ borderColor: BROWN, color: BROWN }}
              >
                Cancel
              </button>
              <button
                onClick={handleJoin}
                className="flex-1 py-3 rounded-full font-bold text-sm text-white transition-colors"
                style={{ backgroundColor: BROWN, boxShadow: SHADOW }}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
