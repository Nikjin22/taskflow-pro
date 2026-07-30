import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../lib/api";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },
      register: async (name, email, password) => {
        const { data } = await api.post("/auth/register", { name, email, password });
        localStorage.setItem("token", data.token);
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },
      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, isAuthenticated: false });
        window.location.href = "/login";
      },
      updateUser: (user) => set({ user }),
    }),
    {
      name: "taskflow-auth",
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);