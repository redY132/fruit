export type SabotageKind = 'bomb' | 'freeze' | 'frenzy';

export interface ShopItem {
  kind: SabotageKind;
  label: string;
  cost: number;
  locked?: boolean;
}

export interface TriggerZone {
  position: 'tl' | 'tr' | 'bl' | 'br';
  sabotage: SabotageKind;
}
