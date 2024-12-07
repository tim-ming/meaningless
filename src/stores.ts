import { create } from "zustand";

interface TransitioningState {
  transitioning: boolean;
  setTransitioning: (transitioning: boolean) => void;
}
export const useTransitioningStore = create<TransitioningState>((set) => ({
  transitioning: false,
  setTransitioning: (transitioning) => set({ transitioning }),
}));
