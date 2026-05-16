import React from 'react';
import { Heart } from 'lucide-react';

interface LivesDisplayProps {
  lives: number;
  maxLives?: number;
}

export function LivesDisplay({ lives, maxLives = 3 }: LivesDisplayProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: maxLives }, (_, i) => (
        <Heart
          key={i}
          size={24}
          className={i < lives ? 'fill-primary text-primary' : 'fill-transparent text-white/30'}
        />
      ))}
    </div>
  );
}
