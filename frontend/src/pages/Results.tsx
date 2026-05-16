import React from 'react';
import { Trophy } from 'lucide-react';
import { useNavigate } from 'react-router';

export function Results() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen bg-[#050810]/95 backdrop-blur-xl flex flex-col items-center py-12 px-6 overflow-y-auto font-sans">
      <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic mb-8">
        Round Over
      </h1>

      {/* Winner Banner */}
      <div className="flex items-center gap-4 bg-primary/10 border border-primary/30 px-8 py-4 rounded-full mb-12">
        <Trophy className="text-primary" size={28} />
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
          KU
        </div>
        <div className="text-2xl font-bold text-white">
          Kuro <span className="text-primary font-normal">wins!</span>
        </div>
      </div>

      {/* Grade Panel (osu! style) */}
      <div className="flex items-center gap-12 bg-card rounded-[24px] p-8 mb-12 border border-border w-full max-w-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="text-[120px] font-black italic leading-none text-amber-400 pr-12 border-r border-border relative z-10">
          S
        </div>

        <div className="flex-1 grid grid-cols-2 gap-y-6 gap-x-12 relative z-10">
          <Stat label="Total Score" value="12,450" />
          <Stat label="Max Combo" value="×42" highlight />
          <Stat label="Fruits Sliced" value="846" />
          <Stat label="Accuracy" value="98.4%" />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="w-full max-w-3xl bg-card rounded-[20px] border border-border overflow-hidden mb-12">
        <div className="grid grid-cols-[60px_1fr_120px_100px_100px_100px] gap-4 p-4 border-b border-border text-xs font-bold text-muted uppercase tracking-wider">
          <div className="text-center">Rank</div>
          <div>Player</div>
          <div className="text-right">Score</div>
          <div className="text-right">Fruits</div>
          <div className="text-center">Bombs</div>
          <div className="text-center">Survived</div>
        </div>

        <div className="flex flex-col">
          <LeaderboardRow rank={1} name="Kuro" score="12,450" fruits="846" bombs="1" survived="Yes" isWinner />
          <LeaderboardRow rank={2} name="PlayerTwo" score="9,280" fruits="612" bombs="3" survived="Yes" isYou />
          <LeaderboardRow rank={3} name="Sakura" score="4,100" fruits="280" bombs="2" survived="No" dead />
          <LeaderboardRow rank={4} name="Jin" score="2,450" fruits="145" bombs="5" survived="No" dead />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6 mb-8">
        <button
          onClick={() => navigate('/room')}
          className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-full font-bold text-lg transition-transform active:scale-95"
        >
          Play again
        </button>
        <button
          onClick={() => navigate('/lobby')}
          className="bg-transparent border-2 border-border hover:border-white text-white px-10 py-4 rounded-full font-bold text-lg transition-colors active:scale-95"
        >
          Back to lobby
        </button>
      </div>

      <div className="text-muted text-sm tracking-wide">
        longest combo <span className="text-primary font-bold">×42</span> by Kuro
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col">
      <div className="text-sm font-bold text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-3xl font-mono font-bold ${highlight ? 'text-primary' : 'text-white'}`}>{value}</div>
    </div>
  );
}

function LeaderboardRow({
  rank, name, score, fruits, bombs, survived, isWinner, isYou, dead,
}: {
  rank: number; name: string; score: string; fruits: string; bombs: string; survived: string;
  isWinner?: boolean; isYou?: boolean; dead?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[60px_1fr_120px_100px_100px_100px] gap-4 p-4 items-center border-b border-border/50 last:border-0 transition-colors ${
        isWinner ? 'border-l-4 border-l-amber-400 bg-amber-400/5' : ''
      } ${isYou && !isWinner ? 'border-l-4 border-l-primary bg-primary/5' : ''} ${
        dead ? 'bg-destructive/5 text-destructive/80' : ''
      } hover:bg-white/5`}
    >
      <div className={`text-center font-bold ${isWinner ? 'text-amber-400' : 'text-muted'}`}>
        #{rank}
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-white">
          {name.substring(0, 2).toUpperCase()}
        </div>
        <span className={`font-bold ${dead ? 'line-through opacity-70' : 'text-white'} ${isYou ? 'text-primary' : ''}`}>
          {name} {isYou && <span className="text-xs ml-2 text-primary/70">(YOU)</span>}
        </span>
      </div>
      <div className={`text-right font-mono font-bold ${isWinner ? 'text-amber-400' : 'text-white'} ${dead ? 'opacity-70' : ''}`}>
        {score}
      </div>
      <div className={`text-right font-mono ${dead ? 'opacity-70' : 'text-white/80'}`}>{fruits}</div>
      <div className="text-center font-mono text-destructive/80 font-bold">{bombs}</div>
      <div className={`text-center text-xs font-bold uppercase tracking-wider ${survived === 'Yes' ? 'text-success' : 'text-destructive/80'}`}>
        {survived}
      </div>
    </div>
  );
}
