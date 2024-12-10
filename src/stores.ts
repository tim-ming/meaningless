import { create } from "zustand";

interface TransitioningState {
  transitioning: boolean;
  setTransitioning: (transitioning: boolean) => void;
}
export const useTransitionStore = create<TransitioningState>((set) => ({
  transitioning: false,
  setTransitioning: (transitioning) => set({ transitioning }),
}));
