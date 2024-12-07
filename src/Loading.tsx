import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Center,
  Environment,
  MeshTransmissionMaterial,
  OrbitControls,
  Plane,
  Text3D,
  useHelper,
} from "@react-three/drei";
import * as THREE from "three";
import { useLocation } from "react-router";
import { motion, usePresence } from "motion/react";

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <Sphere />

      {/* <Ground /> */}
      <OrbitControls />
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

const Loading: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <>
      <motion.div
        ref={ref}
        className="absolute w-full h-full top-0 left-0"
        initial={{ clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: ["inset(0 0 100% 0)", "inset(0 0 0 0)"] }}
        exit={{ clipPath: "inset(0 0 100% 0)" }}
        transition={{ duration: 1 }}
      >
        <Canvas shadows camera={{ position: [0, 0, 3], fov: 90 }}>
          <Scene />
        </Canvas>
      </motion.div>

      <motion.div
        ref={ref}
        className="absolute w-full h-full top-0 left-0"
        initial={{ clipPath: "inset(0 0 0 0)" }}
        animate={{ clipPath: ["inset(0 0 0 0)", "inset(0 0 100% 0)"] }}
        exit={{ clipPath: "inset(0 0 0 0)" }}
        transition={{ duration: 1 }}
      >
        <Canvas shadows camera={{ position: [0, 0, 3], fov: 90 }}>
          <Scene />
        </Canvas>
      </motion.div>
    </>
  );
};

const Title = () => {
  const location = useLocation();
  const [text, setText] = useState("Collections");
  useEffect(() => {
    if (location.pathname === "/") {
      setText("Home");
    } else if (location.pathname === "/about") {
      setText("About");
    } else if (location.pathname === "/collections") {
      setText("Collections");
    } else {
      setText("Unknown");
    }
  }, [location.pathname]);
  return (
    <Center position={[0, 0, -8]}>
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

export default Loading;
