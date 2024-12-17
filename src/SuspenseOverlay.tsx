import { useProgress } from "@react-three/drei";
import React, { useEffect, useMemo, useRef } from "react";

const Overlay: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { loaded, total } = useProgress(); // useProgress gives the loading progress percentage

  const doneLoading = useMemo(
    () => total > 0 && loaded === total,
    [loaded, total]
  ); // Check if loading is finished

  useEffect(() => {
    console.log("doneLoading", doneLoading);
    const handleAnimationEnd = () => {
      ref.current!.classList.add("top-[100%]");
      ref.current!.classList.remove("load-in");
      ref.current!.classList.remove("loading");
      ref.current!.removeEventListener("animationend", handleAnimationEnd);
    };
    if (doneLoading) {
      ref.current!.classList.add("load-in");
      ref.current!.addEventListener("animationend", handleAnimationEnd);
    }
  }, [doneLoading]);

  const percentage = Math.floor((loaded / total) * 100);
  return (
    <>
      <div
        ref={ref}
        className="fixed w-full h-full top-0 left-0 z-[99999] bg-black"
      >
        <div className="flex w-full h-full justify-center items-center">
          <p className="text-[20vw] tracking-[-1.5vw] font-semibold text-neutral-300">
            {percentage ? percentage : "0"}
          </p>
        </div>
      </div>
    </>
  );
};

export default Overlay;
