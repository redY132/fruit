import { supabase } from '../lib/supabase';

const KEY = 'fruity_profile';

export interface Profile {
  name: string;
  avatarUrl: string | null;
}

function load(): Profile {
  try {
    return { name: '', avatarUrl: null, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return { name: '', avatarUrl: null };
  }
}

export const profileStore = {
  get: load,
  save: (p: Partial<Profile>) =>
    localStorage.setItem(KEY, JSON.stringify({ ...load(), ...p })),
  syncToSupabase: async (playerId: string, name: string) => {
    await supabase.from('profiles').upsert({ id: playerId, display_name: name });
  },
};
