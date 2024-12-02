import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Image,
  Environment,
  ScrollControls,
  useScroll,
  useTexture,
  MeshReflectorMaterial,
  MeshTransmissionMaterial,
  Caustics,
  useCursor,
} from "@react-three/drei";
import { easing } from "maath";
import { roughness } from "three/webgpu";

export default function Background({}) {
  const radius = 2;
  const circleRadius = radius / 2;
  return (
    <Canvas
      camera={{ position: [0, 0, 100], fov: 15 }}
      eventSource={document.getElementById("root")}
      eventPrefix="client"
      shadows="soft"
    >
      <group rotation={[0, 0, 0.2]}>
        {/* <fog attach="fog" args={["#fff", 4, 20]} /> */}

        <pointLight
          position={[0, 10, 0]}
          intensity={10}
          decay={0.5}
          castShadow
        />
        {/* <spotLight
          angle={0.5}
          position={[0, 5, 0]}
          intensity={10}
          decay={1}
          castShadow
        /> */}
        <ScrollControls pages={4} infinite>
          <Rig>
            <Carousel radius={radius} />
          </Rig>
        </ScrollControls>
        <Ground yPos={-circleRadius} />
        <Sphere radius={circleRadius} />
      </group>
      <mesh
        position={[0, 1, 0]}
        castShadow
        onClick={() => console.log("clicked")}
      >
        <sphereGeometry args={[1, 64, 32]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={5}
          chromaticAberration={0.02}
          // anisotropy={0.05}
          distortion={0.2}
          distortionScale={2}
          temporalDistortion={0.1}
          transmission={0.9}
        />
      </mesh>
      {/* <Environment preset="studio" environmentIntensity={0.01} /> */}
    </Canvas>
  );
}

function Rig(props) {
  const ref = useRef();
  const scroll = useScroll();
  useFrame((state, delta) => {
    ref.current.rotation.y = -scroll.offset * (Math.PI * 2); // Rotate contents
    state.events.update(); // Raycasts every frame rather than on pointer-move
    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 5, state.pointer.y * 2 + 3, state.pointer.y / 2 + 30],
      0.3,
      delta
    ); // Move camera
    state.camera.lookAt(0, 0, 0); // Look at center
  });
  return <group ref={ref} {...props} />;
}

function Carousel({ radius = 2, count = 10 }) {
  return Array.from({ length: count }, (_, i) => (
    <Card
      key={i}
      url={`/${Math.floor(i % 10) + 1}.png`}
      position={[
        Math.sin((i / count) * Math.PI * 2) * radius,
        0,
        Math.cos((i / count) * Math.PI * 2) * radius,
      ]}
      rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0]}
    />
  ));
}

function Card({ url, ...props }) {
  const ref = useRef();
  const [hovered, hover] = useState(false);

  const pointerOver = (e) => (e.stopPropagation(), hover(true));
  const pointerOut = () => hover(false);
  useCursor(hovered);

  useFrame((state, delta) => {
    // Adjust scale when hovered
    easing.damp3(ref.current.scale, hovered ? 1.15 : 1, 0.1, delta);

    // Adjust material properties
    easing.damp(
      ref.current.material,
      "radius",
      hovered ? 0.25 : 0.1,
      0.2,
      delta
    );
    easing.damp(ref.current.material, "zoom", hovered ? 1 : 1.5, 0.2, delta);
    easing.damp(ref.current.material, "opacity", hovered ? 1 : 1, 0.2, delta);

    // Ch
  });

  return (
    <Image
      ref={ref}
      url={url}
      transparent
      side={THREE.DoubleSide}
      onPointerOver={pointerOver}
      onPointerOut={pointerOut}
      {...props}
      castShadow
      onClick={() => console.log("clicked")}
    >
      <planeGeometry args={[1, 1]} />
    </Image>
  );
}

function Sphere({ radius }) {
  return (
    <mesh
      position={[0, 0, 0]}
      castShadow
      onPointerOver={(e) => e.stopPropagation()}
    >
      <sphereGeometry args={[radius, 64, 32]} />
      <MeshTransmissionMaterial
        backside
        samples={4}
        thickness={5}
        chromaticAberration={0.02}
        // anisotropy={0.05}
        distortion={0.2}
        distortionScale={2}
        temporalDistortion={0.1}
        transmission={0.9}
      />
    </mesh>
  );
}

function Ground({ yPos }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, yPos, 0]}>
      <circleGeometry args={[4, 100]} />
      <MeshReflectorMaterial
        mirror={0}
        blur={[300, 300]}
        resolution={2048}
        mixBlur={1}
        mixStrength={10}
        roughness={0.5}
        depthScale={1}
        minDepthThreshold={0}
        maxDepthThreshold={2}
        color="#555"
        metalness={0.5}
      />
    </mesh>
  );
}
