const KEY = 'fruity_settings';

export interface Settings {
  gameDuration: number; // seconds
}

const DEFAULTS: Settings = { gameDuration: 90 };

export const settingsStore = {
  get: (): Settings => {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
    } catch {
      return DEFAULTS;
    }
  },
  save: (s: Partial<Settings>) =>
    localStorage.setItem(KEY, JSON.stringify({ ...settingsStore.get(), ...s })),
};
