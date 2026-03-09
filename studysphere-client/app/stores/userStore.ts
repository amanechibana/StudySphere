import { create } from "zustand";
import { User } from "../types/User.interface";

const dummyUser: User = {
  _id: "dummy",
  username: "Scholar42",
  email: "dummy@email.com",
  currentRoomId: null,
  userSettingsId: "123",
  createdAt: new Date(),
};

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const useUserStore = create<UserStore>((set) => ({
  user: dummyUser,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

export default useUserStore;
