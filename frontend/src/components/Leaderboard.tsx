import React from 'react';
import { Skull } from 'lucide-react';

export interface ScoreEntry {
  id: string;
  rank: number;
  name: string;
  score: number;
  dead?: boolean;
  avatarUrl?: string | null;
}

interface LeaderboardProps {
  entries: ScoreEntry[];
  localPlayerId: string;
}

export function Leaderboard({ entries, localPlayerId }: LeaderboardProps) {
  return (
    <div className="absolute bottom-6 left-6 w-[280px] bg-black/40 backdrop-blur-md rounded-[20px] border border-white/10 p-4 z-10">
      <div className="text-xs font-bold text-white/70 uppercase tracking-widest mb-3 px-1">
        Live Scores
      </div>
      <div className="flex flex-col gap-2">
        {entries.map(entry => (
          <ScoreRow key={entry.id} {...entry} isYou={entry.id === localPlayerId} />
        ))}
      </div>
    </div>
  );
}

function ScoreRow({ rank, name, score, isYou, dead, avatarUrl }: ScoreEntry & { isYou: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
        isYou ? 'bg-white/15 border border-white/30' : 'bg-white/5'
      } ${dead ? 'opacity-40' : ''}`}
    >
      {/* Rank */}
      <span
        className={`text-xs font-bold w-3 shrink-0 ${
          rank === 1 ? 'text-amber-400' : 'text-white/40'
        }`}
      >
        {rank}
      </span>

      {/* Avatar circle */}
      <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-white text-[10px] font-bold shrink-0 bg-[#564A4A]">
        {avatarUrl
          ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          : name.substring(0, 2).toUpperCase()
        }
      </div>

      {/* Name */}
      <span
        className={`text-sm font-semibold flex-1 truncate ${
          dead ? 'line-through text-white/40' : 'text-white'
        }`}
      >
        {name}
      </span>

      {/* Score */}
      <div className="flex flex-col items-end gap-0.5">
        <span className="font-mono text-xs text-white/90">{score.toLocaleString()}</span>
        {dead && <Skull size={10} className="text-destructive" />}
      </div>
    </div>
  );
}
