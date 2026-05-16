import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router';
import { GameCanvas } from '../components/GameCanvas';
import { Leaderboard, type ScoreEntry } from '../components/Leaderboard';
import { LivesDisplay } from '../components/LivesDisplay';
import { ShopOverlay, ShopTriggerZones } from '../components/ShopOverlay';

const MOCK_SCORES: ScoreEntry[] = [
  { id: 'kuro', rank: 1, name: 'Kuro', score: 2850, hearts: 3 },
  { id: 'me', rank: 2, name: 'PlayerTwo', score: 2480, hearts: 2 },
  { id: 'sakura', rank: 3, name: 'Sakura', score: 1920, hearts: 1 },
  { id: 'jin', rank: 4, name: 'Jin', score: 1450, hearts: 0, dead: true },
];

interface GameProps {
  bombWarning?: boolean;
}

export function Game({ bombWarning = false }: GameProps) {
  const navigate = useNavigate();
  const [shopOpen, setShopOpen] = useState(false);

  return (
    <GameCanvas bombWarning={bombWarning}>
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
        <div className="text-4xl font-mono font-black text-white tracking-tight">1:42</div>
        <div className="text-xs font-bold text-white/70 uppercase tracking-widest">time remaining</div>
      </div>

      {/* Top Right: Player Stats */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-2 z-10">
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
          <LivesDisplay lives={2} />
          <div className="w-px h-8 bg-white/10 mx-2" />
          <div className="flex flex-col items-end">
            <div className="text-4xl font-mono font-black text-white leading-none tracking-tight">2,480</div>
            <div className="text-xs font-mono text-white/50">1,200 pts available</div>
          </div>
        </div>

        <div className="bg-primary text-white px-4 py-1.5 rounded-full font-black italic text-lg transform -rotate-2">
          ×3 COMBO
        </div>

        <button
          onClick={() => setShopOpen(true)}
          className="mt-4 bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/20 transition-all text-white relative group"
        >
          <ShoppingBag size={24} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full" />
        </button>
      </div>

      {/* Bottom Left: Live Leaderboard */}
      <Leaderboard entries={MOCK_SCORES} localPlayerId="me" />

      {/* Corner Trigger Zones */}
      <ShopTriggerZones />

      {/* Shop drawer */}
      <ShopOverlay open={shopOpen} onClose={() => setShopOpen(false)} points={1200} />

      {/* Dev navigation (hidden, hover bottom-right to reveal) */}
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
