import { create } from "zustand";
import { User } from "../api/user";



interface UserStore {
  user: User | null;
  fetchError: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  setFetchError: (val: boolean) => void;
}

const useUserStore = create<UserStore>((set) => ({
  user: null,
  fetchError: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null, fetchError: false }),
  setFetchError: (val) => set({ fetchError: val }),
}));

export default useUserStore;
