import React from 'react';
import { Search, Plus, User, Users, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router';

const MOCK_ROOMS = [
  { id: 1, name: "Ninja Masters", host: "Kuro", players: 3, max: 6, status: "OPEN", mode: "survival" },
  { id: 2, name: "Casual Slice", host: "Sakura", players: 6, max: 6, status: "FULL", mode: "score" },
  { id: 3, name: "Pro League qualifiers", host: "Ryu", players: 4, max: 4, status: "IN PROGRESS", mode: "survival" },
  { id: 4, name: "Late night slicing", host: "Jin", players: 1, max: 8, status: "OPEN", mode: "score" },
  { id: 5, name: "Fruit Salad", host: "Mango", players: 5, max: 6, status: "OPEN", mode: "survival" },
  { id: 6, name: "Sweaty tryhards only", host: "Sweat", players: 6, max: 6, status: "FULL", mode: "survival" },
];

export function Lobby() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full w-full p-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input
              type="text"
              placeholder="Search lobbies..."
              className="bg-input rounded-full pl-12 pr-6 py-3 text-white outline-none focus:ring-2 focus:ring-primary w-64 placeholder:text-muted/60 transition-all"
            />
          </div>
          <div className="flex items-center bg-input p-1 rounded-full">
            <FilterPill label="all" active />
            <FilterPill label="open" />
            <FilterPill label="in progress" />
          </div>
        </div>
        <button
          onClick={() => navigate('/room')}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-transform active:scale-95"
        >
          <Plus size={20} />
          Create room
        </button>
      </div>

      {/* 2-column Grid */}
      <div className="flex-1 overflow-y-auto pr-4 pb-12 relative scrollbar-hide">
        <div className="grid grid-cols-2 gap-6">
          {MOCK_ROOMS.map(room => (
            <RoomCard key={room.id} room={room} onClick={() => navigate('/room')} />
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-muted animate-bounce flex flex-col items-center">
          <span className="text-xs font-bold tracking-widest uppercase mb-1">Scroll</span>
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
}

function FilterPill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      className={`px-5 py-2 rounded-full font-bold text-sm capitalize transition-colors ${
        active ? 'bg-secondary text-white' : 'text-muted hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

function RoomCard({ room, onClick }: { room: (typeof MOCK_ROOMS)[number]; onClick: () => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-success bg-success/10 border-success/20';
      case 'FULL': return 'text-muted bg-muted/10 border-muted/20';
      case 'IN PROGRESS': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-white bg-white/10';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-card rounded-[20px] p-6 border-l-4 border-l-transparent hover:border-l-primary border border-border cursor-pointer transition-all hover:bg-surface-hover group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{room.name}</h3>
          <div className="flex items-center gap-2 text-muted text-sm">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
              <User size={14} />
            </div>
            <span>{room.host}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(room.status)}`}>
            {room.status}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold text-muted bg-secondary px-3 py-1 rounded-full">
            {room.mode}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full">
          <Users size={16} className={room.players === room.max ? 'text-muted' : 'text-white'} />
          <span className="text-sm font-mono font-bold text-white">
            {room.players}<span className="text-muted">/{room.max}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
