import { onAuthStateChanged, User } from "firebase/auth";
import { create } from "zustand";
import { auth } from "../firebase/firebaseSetup";
import { firebaseSignOut } from "../firebase/firebaseMethods";

interface InitActions {
  onLogin: (user: User) => void;
  onLogout: () => void;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  init: (actions: InitActions) => () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),

  logout: async () => {
    await firebaseSignOut();
    set({ user: null });
  },

  /* registering callback that is triggered through Firebase's onAuthStateChanged observer.
   * if a user is passed, that means they are freshly authenticated, in which we call a login function to the backend to request a user doc
   * otherwise, if there is no user, that means we have logged out, in which we clear the user state
   * Firebase also returns a cleanup function to unsubscribe to the listeners
   */
  init: (actions) => {
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      if (authenticatedUser) {
        set({ user: authenticatedUser, loading: false, initialized: true });
        actions.onLogin(authenticatedUser);
      } else {
        set({ user: null, loading: false, initialized: true });
        actions.onLogout();
      }
    });
    return unsubscribe;
  },
}));

export default useAuthStore;
