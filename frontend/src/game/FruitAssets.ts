import type { FruitType } from '../types/game';

const ASSET_PATHS: Record<FruitType, string> = {
  apple:      '/assets/fruits/apple.png',
  orange:     '/assets/fruits/orange.png',
  watermelon: '/assets/fruits/watermelon.png',
  mango:      '/assets/fruits/mango.png',
  bomb:       '/assets/fruits/bomb.png',
};

const cache = new Map<FruitType, HTMLImageElement>();

export async function loadFruitAssets(): Promise<void> {
  await Promise.all(
    (Object.entries(ASSET_PATHS) as [FruitType, string][]).map(
      ([type, src]) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => { cache.set(type, img); resolve(); };
          img.onerror = () => resolve(); // missing asset — skip silently
        })
    )
  );
}

export function getFruitImage(type: FruitType): HTMLImageElement {
  const img = cache.get(type);
  if (!img) throw new Error(`Fruit asset not loaded: ${type}`);
  return img;
}
