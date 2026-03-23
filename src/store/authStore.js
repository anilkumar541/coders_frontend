import { create } from "zustand";

export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,

  setAccessToken: (token) => set({ accessToken: token }),

  setUser: (user) => set({ user }),

  loginSuccess: (accessToken, user) => set({ accessToken, user }),

  logout: () => set({ accessToken: null, user: null }),
}));
