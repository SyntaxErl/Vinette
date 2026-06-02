import { create } from "zustand";
import { disconnectSocket } from "../api/socket";
import useTaskStore from "./taskStore";
import useNotificationStore from "./notificationStore";
import usePresenceStore from "./presenceStore";
import useTeamStore from "./teamStore";
import useThemeStore from "./themeStore";

// Wipe all per-user, in-memory store state on logout so the next account to
// log in (without a full page reload) never shows the previous user's cached
// data. Not done on login to avoid racing the session-restore re-seed on refresh.
const clearUserState = () => {
  useTaskStore.getState().reset();
  useNotificationStore.getState().reset();
  usePresenceStore.getState().reset();
  useTeamStore.getState().reset();
  useThemeStore.getState().reset();
};

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),

  login: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true });
  },

  // Merge updated fields into the current user (after a profile save).
  updateUser: (patch) =>
    set((state) => ({ user: state.user ? { ...state.user, ...patch } : state.user })),

  logout: () => {
    localStorage.removeItem("token");
    disconnectSocket();
    clearUserState();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;