import {
  Center,
  MeshTransmissionMaterial,
  OrbitControls,
  Preload,
  Text3D,
  useProgress,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { useInView } from "motion/react";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import { TRANSITION } from "./helpers/constants";
import { useTransitionStore } from "./stores";

const Overlay: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [dpr, setDpr] = useState(1);
  const { transitioning } = useTransitionStore();
  const inView = useInView(ref);
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
        {/* <Canvas
          gl={{ antialias: false }}
          frameloop={inView ? "always" : "never"}
          // frameloop={"always"}
          dpr={dpr}
          camera={{ fov: 90 }}
        >
          <Scene doneLoading={doneLoading} />
          <Preload all />
        </Canvas> */}
        <div className="flex w-full h-full justify-center items-center">
          <p className="text-[20vw] tracking-[-1.5vw] font-semibold text-neutral-300">
            {percentage ? percentage : "0"}
          </p>
        </div>
      </div>
    </>
  );
};

const Scene = ({ doneLoading }: { doneLoading: boolean }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <Sphere />

      <Percentage />
      <color attach="background" args={["#000"]} />
    </>
  );
};

const Sphere = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[2, 64, 32]} />
      <MeshTransmissionMaterial
        backside
        samples={4}
        thickness={5}
        // roughness={0.05}
        chromaticAberration={0.01}
        // anisotropy={0.2}
        distortion={0.1}
        distortionScale={0.5}
        temporalDistortion={0.1}
        transmission={1}
      />
    </mesh>
  );
};

const Percentage = () => {
  const { loaded, total } = useProgress(); // useProgress gives the loading progress percentage
  const percentage = Math.floor((loaded / total) * 100);
  return (
    <Center cacheKey={percentage} position={[0, 0, -8]}>
      <Text3D
        letterSpacing={-0.1}
        font="/Inter_Semibold.json"
        bevelEnabled
        bevelSize={0.02}
        bevelThickness={0.1}
        height={0}
      >
        {percentage ? percentage : "0"}
        <meshStandardMaterial
          color="white"
          roughness={0.1}
          metalness={0.1}
          emissive={"#aaa"}
          emissiveIntensity={1}
        />
      </Text3D>
    </Center>
  );
};

export default Overlay;
