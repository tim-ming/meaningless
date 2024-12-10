import {
  Center,
  MeshTransmissionMaterial,
  Preload,
  Text3D,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useInView } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { TRANSITION } from "./helpers/constants";
import { useTransitionStore } from "./stores";

const Overlay: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [dpr, setDpr] = useState(1);
  const { transitioning } = useTransitionStore();
  const inView = useInView(ref);

  useEffect(() => {
    if (transitioning) {
      ref.current!.classList.remove("top-[100%]");
      ref.current!.classList.add("clip");
    } else {
      ref.current!.classList.remove("clip");
      ref.current!.classList.add("top-[100%]");
    }
  }, [transitioning]);

  return (
    <>
      <div
        ref={ref}
        className="fixed w-full h-full top-0 left-0 z-[99999] loading"
      >
        <Canvas
          gl={{ antialias: false }}
          frameloop={inView ? "always" : "never"}
          // frameloop={"always"}
          dpr={dpr}
          camera={{ fov: 90 }}
        >
          <Scene />
          <Preload all />
        </Canvas>
      </div>
    </>
  );
};

const Scene = () => {
  const { transitioning } = useTransitionStore();

  useFrame((state, delta) => {
    if (transitioning) {
      easing.damp3(
        state.camera.position,
        [0, 2, 5],
        TRANSITION.DURATION_S / 1.5,
        delta,
        Infinity
      );
    } else {
      state.camera.position.set(0, -2, 5);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <Sphere />

      <Title />
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

const Title = () => {
  const location = useLocation();
  const [text, setText] = useState("Collections");

  useEffect(() => {
    if (location.pathname === "/") {
      setText("home");
    } else if (location.pathname === "/about") {
      setText("about");
    } else if (location.pathname === "/collections") {
      setText("collections");
    } else {
      setText("Unknown");
    }
  }, [location.pathname]);

  return (
    <Center cacheKey={text} position={[0, 0, -8]}>
      <Text3D
        letterSpacing={-0.1}
        font="/Inter_Semibold.json"
        bevelEnabled
        bevelSize={0.02}
        bevelThickness={0.1}
        height={0}
      >
        {text}
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
