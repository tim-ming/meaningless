import { usePresence } from "motion/react";
import { useEffect } from "react";
import { TRANSITION } from "../helpers/constants";
import { useTransitioningStore } from "../stores";

const Transitioner = () => {
  const transitioning = useTransitioningStore();
  const [isPresent, safeToRemove] = usePresence();

  useEffect(() => {
    !isPresent &&
      setTimeout(() => {
        safeToRemove();
      }, (TRANSITION.DURATION_S * 1000) / 2);
    transitioning.setTransitioning(isPresent);
  }, [isPresent]);
  return <></>;
};

export default Transitioner;
