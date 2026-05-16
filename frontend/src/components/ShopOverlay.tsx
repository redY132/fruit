import React from 'react';
import { X, Bomb, Snowflake, Zap, Shield, Lock, ChevronDown } from 'lucide-react';

interface TriggerZoneProps {
  position: 'tl' | 'tr' | 'bl' | 'br';
  icon: React.ReactNode;
  label: string;
  cost: string;
  color: 'primary' | 'blue-400' | 'purple-400' | 'teal-400';
}

function TriggerZone({ position, icon, label, cost, color }: TriggerZoneProps) {
  const isTop = position.includes('t');
  const isLeft = position.includes('l');

  const positionClasses = [
    isTop ? 'top-0' : 'bottom-0',
    isLeft ? 'left-0' : 'right-0',
    isTop
      ? isLeft ? 'rounded-br-[100px]' : 'rounded-bl-[100px]'
      : isLeft ? 'rounded-tr-[100px]' : 'rounded-tl-[100px]',
  ].join(' ');

  const colorMap: Record<string, string> = {
    primary: 'bg-primary/20 border-primary text-primary',
    'blue-400': 'bg-blue-400/20 border-blue-400 text-blue-400',
    'purple-400': 'bg-purple-400/20 border-purple-400 text-purple-400',
    'teal-400': 'bg-teal-400/20 border-teal-400 text-teal-400',
  };

  return (
    <div
      className={`absolute w-[160px] h-[160px] ${positionClasses} border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all hover:bg-opacity-30 cursor-crosshair group backdrop-blur-sm z-0 ${colorMap[color]}`}
    >
      <div
        className={`transform transition-transform group-hover:scale-110 mb-2 ${
          isTop
            ? isLeft ? 'translate-x-[-10px] translate-y-[-10px]' : 'translate-x-[10px] translate-y-[-10px]'
            : isLeft ? 'translate-x-[-10px] translate-y-[10px]' : 'translate-x-[10px] translate-y-[10px]'
        }`}
      >
        {icon}
      </div>
      <div
        className={`text-xs font-black tracking-widest ${
          isTop
            ? isLeft ? 'translate-x-[-10px]' : 'translate-x-[10px]'
            : isLeft ? 'translate-x-[-10px]' : 'translate-x-[10px]'
        }`}
      >
        {label}
      </div>
      <div
        className={`text-[10px] font-mono opacity-80 ${
          isTop
            ? isLeft ? 'translate-x-[-10px]' : 'translate-x-[10px]'
            : isLeft ? 'translate-x-[-10px]' : 'translate-x-[10px]'
        }`}
      >
        {cost}
      </div>
    </div>
  );
}

interface ShopOverlayProps {
  open: boolean;
  onClose: () => void;
  points: number;
}

export function ShopOverlay({ open, onClose, points }: ShopOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex justify-end font-sans">
      {/* Dim backdrop */}
      <div
        className="absolute inset-0 bg-black/40 pointer-events-auto backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="w-[320px] h-full bg-card border-l border-border pointer-events-auto flex flex-col p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-muted hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-8 mt-2">
          <div className="text-xs font-bold text-muted uppercase tracking-widest mb-1">spend points</div>
          <div className="text-4xl font-mono font-black text-primary">{points.toLocaleString()} pts</div>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <ShopItem icon={<Bomb size={24} />} title="Bomb Injection" desc="Spawn a bomb on target's screen" cost={50} color="primary" />
          <ShopItem icon={<Snowflake size={24} />} title="Freeze Ray" desc="Slows target's fruits by 50%" cost={30} color="blue-400" />
          <ShopItem icon={<Zap size={24} />} title="Frenzy Burst" desc="Spawn extra fruits for yourself" cost={40} color="purple-400" />
          <ShopItem icon={<Shield size={24} />} title="Parry Shield" desc="Auto-deflects next bomb" cost={35} color="teal-400" locked />
        </div>

        <div className="mt-auto pt-6 border-t border-border">
          <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Targeting</div>
          <button className="w-full flex items-center justify-between bg-input p-4 rounded-xl text-white font-bold hover:bg-input/80 transition-colors border border-transparent focus:border-primary">
            <span className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px]">KU</div>
              Kuro
            </span>
            <ChevronDown size={16} className="text-muted" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShopTriggerZones() {
  return (
    <>
      <TriggerZone position="tl" icon={<Bomb size={32} />} label="BOMB" cost="50pts" color="primary" />
      <TriggerZone position="tr" icon={<Snowflake size={32} />} label="FREEZE" cost="30pts" color="blue-400" />
      <TriggerZone position="bl" icon={<Zap size={32} />} label="FRENZY" cost="40pts" color="purple-400" />
      <TriggerZone position="br" icon={<Shield size={32} />} label="PARRY" cost="35pts" color="teal-400" />
    </>
  );
}

function ShopItem({
  icon, title, desc, cost, color, locked,
}: {
  icon: React.ReactNode; title: string; desc: string; cost: number;
  color: 'primary' | 'blue-400' | 'purple-400' | 'teal-400'; locked?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    'blue-400': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'purple-400': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    'teal-400': 'text-teal-400 bg-teal-400/10 border-teal-400/20',
  };

  return (
    <div
      className={`relative flex flex-col p-4 rounded-2xl border transition-all ${
        locked
          ? 'border-border bg-card/50 opacity-50 grayscale cursor-not-allowed'
          : 'border-border bg-card hover:border-primary/50 hover:bg-surface-hover cursor-pointer'
      }`}
    >
      <div className="flex gap-4 mb-2">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
            locked ? 'bg-secondary text-muted border-transparent' : colorClasses[color]
          }`}
        >
          {icon}
        </div>
        <div>
          <div className="font-bold text-white mb-0.5">{title}</div>
          <div className="text-xs text-muted leading-tight">{desc}</div>
        </div>
      </div>

      <div className="flex justify-end mt-1">
        <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${locked ? 'bg-secondary text-muted' : 'bg-primary text-white'}`}>
          {cost} pts
        </div>
      </div>

      {locked && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-black/80 p-2 rounded-full text-white/80 backdrop-blur-md">
            <Lock size={20} />
          </div>
        </div>
      )}
    </div>
  );
}
