import { create } from "zustand";

interface TransitioningState {
  transitioning: boolean;
  willTransition: boolean;
  setTransitioning: (transitioning: boolean) => void;
  setWillTransition: (willTransition: boolean) => void;
}
export const useTransitionStore = create<TransitioningState>((set) => ({
  transitioning: false,
  willTransition: false,
  setTransitioning: (transitioning) => set({ transitioning }),
  setWillTransition: (willTransition) => set({ willTransition }),
}));
