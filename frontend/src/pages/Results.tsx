import React from 'react';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

const FONT_TITLE = "'Irish Grover', cursive";
const FONT_BODY = "'Baloo Bhaijaan 2', sans-serif";
const BROWN = '#564A4A';
const SHADOW = '0 4px 14px rgba(86,74,74,0.35)';

export function Results() {
  const navigate = useNavigate();

  return (
    <div
      className="w-screen min-h-screen bg-white flex flex-col items-center py-12 px-6 overflow-y-auto relative"
      style={{ fontFamily: FONT_BODY }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/lobby')}
        className="absolute top-6 left-6 flex items-center gap-2 hover:opacity-70 transition-opacity"
        style={{ color: BROWN }}
      >
        <ArrowLeft size={20} />
        <span className="font-semibold text-sm">Lobby</span>
      </button>

      <h1
        className="text-7xl leading-none mb-8"
        style={{ fontFamily: FONT_TITLE, color: BROWN }}
      >
        Round Over
      </h1>

      {/* Winner Banner */}
      <div
        className="flex items-center gap-4 px-8 py-4 rounded-full mb-10"
        style={{ backgroundColor: `${BROWN}12`, border: `1.5px solid ${BROWN}40` }}
      >
        <Trophy style={{ color: BROWN }} size={26} />
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: BROWN }}
        >
          KU
        </div>
        <div className="text-2xl font-bold" style={{ color: BROWN }}>
          Kuro <span className="font-normal opacity-60">wins!</span>
        </div>
      </div>

      {/* Grade Panel */}
      <div
        className="flex items-center gap-12 bg-white rounded-2xl p-8 mb-10 w-full max-w-2xl relative overflow-hidden"
        style={{ border: `1.5px solid ${BROWN}25`, boxShadow: '0 2px 20px rgba(86,74,74,0.08)' }}
      >
        <div
          className="text-[110px] font-black italic leading-none pr-10"
          style={{ fontFamily: FONT_TITLE, color: BROWN, borderRight: `1.5px solid ${BROWN}20` }}
        >
          S
        </div>
        <div className="flex-1 grid grid-cols-2 gap-y-5 gap-x-10">
          <Stat label="Total Score" value="12,450" />
          <Stat label="Max Combo" value="×42" highlight />
          <Stat label="Fruits Sliced" value="846" />
          <Stat label="Accuracy" value="98.4%" />
        </div>
      </div>

      {/* Leaderboard */}
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden mb-10"
        style={{ border: `1.5px solid ${BROWN}20` }}
      >
        <div
          className="grid grid-cols-[50px_1fr_110px_90px_90px_90px] gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider"
          style={{ color: `${BROWN}70`, borderBottom: `1px solid ${BROWN}15` }}
        >
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
      <div className="flex items-center gap-4 mb-24">
        <button
          onClick={() => navigate('/room')}
          className="px-10 py-4 rounded-full font-bold text-lg text-white transition-colors active:scale-95"
          style={{ backgroundColor: BROWN, boxShadow: SHADOW }}
        >
          Play again
        </button>
        <button
          onClick={() => navigate('/lobby')}
          className="px-10 py-4 rounded-full font-bold text-lg transition-colors active:scale-95"
          style={{ backgroundColor: '#EDE8E8', border: `2px solid ${BROWN}`, color: BROWN, boxShadow: SHADOW }}
        >
          Back to lobby
        </button>
      </div>

      <p className="text-sm mb-36" style={{ color: `${BROWN}70` }}>
        longest combo <span className="font-bold" style={{ color: BROWN }}>×42</span> by Kuro
      </p>

      {/* Mascot */}
      <img
        src="/assets/mascot.png"
        alt="Fruity mascots"
        className="fixed bottom-0 left-0 w-full object-contain object-bottom pointer-events-none select-none"
        style={{ maxHeight: '34vh' }}
      />
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col">
      <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: `${BROWN}70` }}>
        {label}
      </div>
      <div
        className="text-3xl font-mono font-bold"
        style={{ color: highlight ? BROWN : `${BROWN}CC` }}
      >
        {value}
      </div>
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
      className="grid grid-cols-[50px_1fr_110px_90px_90px_90px] gap-3 px-4 py-3 items-center transition-colors hover:bg-black/[0.02]"
      style={{
        borderBottom: `1px solid ${BROWN}10`,
        borderLeft: isWinner ? `3px solid ${BROWN}` : isYou ? `3px solid ${BROWN}80` : '3px solid transparent',
        backgroundColor: isWinner ? `${BROWN}06` : isYou ? `${BROWN}04` : dead ? '#fafafa' : undefined,
        opacity: dead ? 0.55 : 1,
      }}
    >
      <div className="text-center font-bold text-sm" style={{ color: isWinner ? BROWN : `${BROWN}50` }}>
        #{rank}
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: BROWN }}
        >
          {name.substring(0, 2).toUpperCase()}
        </div>
        <span
          className="font-semibold text-sm"
          style={{ color: BROWN, textDecoration: dead ? 'line-through' : undefined }}
        >
          {name} {isYou && <span className="text-xs opacity-60">(YOU)</span>}
        </span>
      </div>
      <div className="text-right font-mono font-bold text-sm" style={{ color: isWinner ? BROWN : `${BROWN}BB` }}>
        {score}
      </div>
      <div className="text-right font-mono text-sm" style={{ color: `${BROWN}99` }}>{fruits}</div>
      <div className="text-center font-mono text-sm font-bold text-red-400">{bombs}</div>
      <div
        className="text-center text-xs font-bold uppercase tracking-wide"
        style={{ color: survived === 'Yes' ? '#22C55E' : '#EF4444' }}
      >
        {survived}
      </div>
    </div>
  );
}
