import React, { useState } from 'react';
import { Crown, Settings, Send, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router';

export function Room() {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [bombOn, setBombOn] = useState(true);

  return (
    <div className="flex h-full w-full p-6 gap-6">
      {/* LEFT COLUMN */}
      <div className="w-[280px] flex flex-col gap-6 shrink-0">
        <div className="flex items-center gap-3 px-2">
          <Crown className="text-primary" size={24} />
          <h2 className="text-2xl font-bold text-white tracking-tight">Ninja Masters</h2>
        </div>

        {/* Current Track Card */}
        <div className="bg-card rounded-[20px] p-5 border border-border">
          <div className="text-xs font-bold text-muted uppercase tracking-wider mb-3 flex justify-between items-center">
            Current Sequence
            <span className="font-mono text-white">#04</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Cascade Rush</h3>
          <div className="font-mono text-muted text-sm mb-4">Duration: 2:30</div>

          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`h-2 flex-1 rounded-sm ${i <= 4 ? 'bg-primary' : 'bg-secondary'}`} />
            ))}
          </div>
          <div className="text-xs font-bold text-right text-primary">HARD</div>
        </div>

        {/* Up Next Queue */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold text-muted uppercase tracking-wider mb-1 px-2">Up Next</div>
          <QueueItem title="Melon Frenzy" duration="1:45" difficulty={2} />
          <QueueItem title="Citrus Storm" duration="3:10" difficulty={5} />
          <QueueItem title="Apple Arcade" duration="2:00" difficulty={3} />
        </div>

        {/* Controls */}
        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={() => setBombOn(!bombOn)}
            className={`w-full py-3 rounded-full font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
              bombOn
                ? 'bg-primary/20 text-primary border border-primary/50'
                : 'bg-secondary text-muted border border-border'
            }`}
          >
            MOD: BOMB {bombOn ? 'ON' : 'OFF'}
          </button>

          <button className="w-full py-3 rounded-full font-bold text-sm text-white border-2 border-border hover:border-white transition-colors">
            Change sequence
          </button>
        </div>
      </div>

      {/* CENTER COLUMN */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Player Slots */}
        <div className="grid grid-cols-2 gap-4 flex-1 content-start">
          <PlayerSlot name="Kuro" ready isHost />
          <PlayerSlot name="PlayerTwo" isYou ready={isReady} />
          <PlayerSlot name="Sakura" />
          <PlayerSlot name="Jin" ready />
          <EmptySlot />
          <EmptySlot />
          <EmptySlot />
          <EmptySlot />
        </div>

        {/* Chat Log */}
        <div className="bg-card rounded-[20px] border border-border p-4 flex flex-col h-[240px]">
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-4">
            <ChatMessage author="Kuro" text="ready up guys" />
            <ChatMessage author="Sakura" text="one sec changing mouse" />
            <ChatMessage author="Jin" text="ok im good" />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full bg-input rounded-full py-3 pl-4 pr-12 text-sm text-white outline-none focus:ring-1 focus:ring-primary placeholder:text-muted"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary rounded-full text-white hover:bg-primary/90 transition-colors">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-[240px] shrink-0 flex flex-col gap-6">
        <div className="bg-card rounded-[20px] border border-border p-5 flex flex-col gap-6">
          <div className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-2">
            <Settings size={14} />
            Match Settings
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted font-bold">Room Name</label>
            <input
              type="text"
              defaultValue="Ninja Masters"
              className="bg-input text-white text-sm rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary"
              disabled
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted font-bold">Max Players</label>
            <div className="flex items-center justify-between bg-input rounded-lg p-2">
              <button className="p-1 hover:text-white text-muted"><Minus size={16} /></button>
              <span className="font-mono text-white">8</span>
              <button className="p-1 hover:text-white text-muted"><Plus size={16} /></button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted font-bold">Mode</label>
            <div className="flex bg-input p-1 rounded-lg">
              <button className="flex-1 py-1.5 bg-secondary rounded-md text-xs font-bold text-white">Survival</button>
              <button className="flex-1 py-1.5 text-xs font-bold text-muted hover:text-white">Score</button>
            </div>
          </div>
        </div>

        <button
          onClick={() => isReady ? navigate('/game') : setIsReady(true)}
          className={`mt-auto w-full py-6 rounded-2xl font-black text-2xl tracking-widest transition-all ${
            isReady
              ? 'bg-success text-white'
              : 'bg-secondary text-muted hover:bg-secondary/80'
          }`}
        >
          {isReady ? 'READY' : 'NOT READY'}
        </button>
      </div>
    </div>
  );
}

function QueueItem({ title, duration, difficulty }: { title: string; duration: string; difficulty: number }) {
  return (
    <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border">
      <div>
        <div className="text-sm font-bold text-white mb-0.5">{title}</div>
        <div className="text-xs font-mono text-muted">{duration}</div>
      </div>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= difficulty ? 'bg-primary' : 'bg-secondary'}`} />
        ))}
      </div>
    </div>
  );
}

function PlayerSlot({ name, isHost, isYou, ready }: { name: string; isHost?: boolean; isYou?: boolean; ready?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border bg-card transition-all ${
      isYou ? 'border-l-4 border-l-primary border-border' : 'border-border'
    }`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-white text-sm">
            {name.substring(0, 2).toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-success border-2 border-card" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{name}</span>
            {isHost && <Crown size={12} className="text-primary" />}
          </div>
          {isYou && <span className="text-xs text-primary font-bold">YOU</span>}
        </div>
      </div>

      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        ready ? 'bg-success/20 text-success' : 'bg-secondary text-muted'
      }`}>
        {ready ? 'Ready' : 'Not Ready'}
      </div>
    </div>
  );
}

function EmptySlot() {
  return (
    <div className="flex items-center justify-center p-3 h-[66px] rounded-xl border-2 border-dashed border-border bg-card/30">
      <span className="text-xs font-bold text-muted uppercase tracking-wider">Waiting for player...</span>
    </div>
  );
}

function ChatMessage({ author, text }: { author: string; text: string }) {
  return (
    <div className="text-sm">
      <span className="font-bold text-muted mr-2">{author}:</span>
      <span className="text-white">{text}</span>
    </div>
  );
}
