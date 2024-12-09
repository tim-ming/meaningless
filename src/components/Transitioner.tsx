import { usePresence } from "motion/react";
import { useEffect } from "react";
import { TRANSITION } from "../helpers/constants";
import { useTransitionStore } from "../stores";

const Transitioner = () => {
  const { setWillTransition, setTransitioning } = useTransitionStore();
  const [isPresent, safeToRemove] = usePresence();

  useEffect(() => {
    setWillTransition(!isPresent);
    if (!isPresent) {
      setTransitioning(!isPresent);
      setTimeout(() => {
        setTransitioning(isPresent);
      }, TRANSITION.DURATION_S * 1000);
      !isPresent &&
        setTimeout(() => {
          safeToRemove();
        }, (TRANSITION.DURATION_S * 1000) / 2);
    }
  }, [isPresent]);
  return <></>;
};

export default Transitioner;
