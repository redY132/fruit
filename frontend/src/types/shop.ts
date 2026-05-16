export type SabotageKind = 'bomb' | 'freeze' | 'frenzy' | 'parry';

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
