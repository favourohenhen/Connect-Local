import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  role: 'customer' | 'worker' | 'admin' | null;
  setUser: (user: User | null) => void;
  setRole: (role: 'customer' | 'worker' | 'admin' | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  signOut: () => set({ user: null, role: null }),
}));
