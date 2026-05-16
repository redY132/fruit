import React from 'react';
import { Heart, Skull } from 'lucide-react';

export interface ScoreEntry {
  id: string;
  rank: number;
  name: string;
  score: number;
  hearts: number;
  dead?: boolean;
}

interface LeaderboardProps {
  entries: ScoreEntry[];
  localPlayerId: string;
}

export function Leaderboard({ entries, localPlayerId }: LeaderboardProps) {
  return (
    <div className="absolute bottom-6 left-6 w-[280px] bg-black/40 backdrop-blur-md rounded-[20px] border border-white/10 p-4 z-10">
      <div className="text-xs font-bold text-white/70 uppercase tracking-widest mb-3 px-2">
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

function ScoreRow({
  rank, name, score, hearts, isYou, dead,
}: ScoreEntry & { isYou: boolean }) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
        isYou ? 'bg-primary/20 border border-primary/30' : 'bg-white/5 border border-transparent'
      } ${dead ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className={`text-xs font-bold w-4 text-center ${rank === 1 ? 'text-amber-400' : 'text-white/50'}`}>
          {rank}
        </span>
        <span className={`text-sm font-bold truncate w-20 ${dead ? 'line-through text-white/50' : 'text-white'}`}>
          {name}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-white/90">{score}</span>
        <div className="flex gap-0.5 w-12 justify-end">
          {dead ? (
            <Skull size={14} className="text-destructive" />
          ) : (
            [...Array(3)].map((_, i) => (
              <Heart
                key={i}
                size={10}
                className={i < hearts ? 'fill-primary text-primary' : 'fill-transparent text-white/20'}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
