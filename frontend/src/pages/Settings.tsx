import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { settingsStore } from '../store/settingsStore';

const FONT_TITLE = "'Irish Grover', cursive";
const FONT_BODY = "'Baloo Bhaijaan 2', sans-serif";
const BROWN = '#564A4A';
const SHADOW = '0 4px 14px rgba(86,74,74,0.35)';

const DURATIONS = [60, 90, 120, 180];

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return sec === 0 ? `${m}m` : `${m}:${String(sec).padStart(2, '0')}`;
}

export function Settings() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(settingsStore.get().gameDuration);

  function handleSelect(d: number) {
    setDuration(d);
    settingsStore.save({ gameDuration: d });
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

      <div className="flex flex-col items-center z-10 mb-8 w-[320px]" style={{ fontFamily: FONT_BODY }}>
        <h1
          className="text-7xl leading-none mb-12"
          style={{ fontFamily: FONT_TITLE, color: BROWN }}
        >
          Settings
        </h1>

        {/* Game Duration */}
        <div className="w-full flex flex-col gap-3">
          <label
            className="text-xs font-bold uppercase tracking-widest pl-1"
            style={{ color: `${BROWN}80` }}
          >
            Game Duration
          </label>

          <div className="grid grid-cols-4 gap-2">
            {DURATIONS.map(d => (
              <button
                key={d}
                onClick={() => handleSelect(d)}
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

          <p className="text-xs text-center mt-1" style={{ color: `${BROWN}60` }}>
            Selected: {formatDuration(duration)} per round
          </p>
        </div>
      </div>

      {/* Mascot */}
      <img
        src="/assets/mascot.png"
        alt="Fruity mascots"
        className="absolute bottom-0 left-0 w-full object-contain object-bottom pointer-events-none select-none"
        style={{ maxHeight: '42vh' }}
      />
    </div>
  );
}
