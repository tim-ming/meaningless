import {
  Image,
  MeshReflectorMaterial,
  MeshTransmissionMaterial,
  PerformanceMonitor,
  Preload,
  ScrollControls,
  useCursor,
  useProgress,
  useScroll,
} from "@react-three/drei";
import {
  Canvas,
  GroupProps,
  MeshProps,
  ThreeEvent,
  useFrame,
} from "@react-three/fiber";
import { easing } from "maath";
import { useRef, useState } from "react";
import * as THREE from "three";
import { RoundedRectangle } from "./helpers/utils";
import { Group } from "three";
import { lerp } from "three/src/math/MathUtils.js";
import data from "./assets/collections.json";
import { useNavigate } from "react-router";

export default function Background({}) {
  const [dpr, setDpr] = useState(1);
  const [loadingComplete, setLoadingComplete] = useState(false);
  return (
    <div className="absolute w-screen h-screen top-0 left-0">
      <Canvas
        camera={{ position: [0, 0, 100], fov: 15 }}
        eventPrefix="client"
        shadows
        frameloop="demand"
        // frameloop="never"
        dpr={dpr}
        onCreated={() => setLoadingComplete(true)} // Set loading complete when canvas is ready
      >
        <PerformanceMonitor
          onIncline={() => setDpr(1.5)}
          onDecline={() => setDpr(1)}
          flipflops={3}
        >
          <Scene />
        </PerformanceMonitor>
        <Preload all />
        {/* <Environment preset="studio" environmentIntensity={0.01} /> */}
      </Canvas>
    </div>
  );
}

const Scene = () => {
  const radius = 2;
  const circleRadius = radius / 2;
  return (
    <group rotation={[0, 0, 0.2]}>
      {/* <fog attach="fog" args={["#fff", 4, 20]} /> */}
      <pointLight position={[0, 5, 0]} intensity={2} decay={0} />
      <spotLight
        angle={0.8}
        position={[0, 5, 0]}
        intensity={0.5}
        decay={0}
        castShadow
      />
      <ScrollControls pages={3} infinite maxSpeed={2} distance={0.5}>
        <Rig>
          <Carousel radius={radius} />
        </Rig>
      </ScrollControls>

      <Sphere radius={circleRadius} />
      <Ground yPos={-circleRadius} />
    </group>
  );
};

function Rig(props: GroupProps) {
  const outerRef = useRef<Group>(null);
  const ref = useRef<Group>(null);
  const scroll = useScroll();
  useFrame((state, delta) => {
    easing.dampE(outerRef.current!.rotation, [0, 0, 0], 1, delta); // Initial rotation (first page load)
    ref.current!.rotation.y = -scroll.offset * (Math.PI * 2); // Rotate contents
    state.events.update!(); // Raycasts every frame rather than on pointer-move

    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 5, state.pointer.y * 2 + 3, state.pointer.y / 2 + 30],
      0.3,
      delta
    ); // Move camera
    state.camera.lookAt(0, 0, 0); // Look at center
  });

  return (
    <group ref={outerRef} rotation={[0, 2, 0]}>
      <group ref={ref} {...props} />
    </group>
  );
}

function Carousel({ radius = 2 }) {
  return data.map((item, i) => (
    <Card
      key={item.id}
      imageUrl={item.image}
      imageId={item.id}
      position={[
        Math.sin((i / data.length) * Math.PI * 2) * radius,
        0,
        Math.cos((i / data.length) * Math.PI * 2) * radius,
      ]}
      rotation={[0, Math.PI + (i / data.length) * Math.PI * 2, 0]}
    />
  ));
}

interface CardProps extends GroupProps {
  cardSize?: number;
  imageUrl: string;
  imageId: string;
}
function Card({ cardSize = 1, imageUrl = "", imageId, ...props }: CardProps) {
  const backPlateSize = cardSize * 1.1;
  const backPlateGeometry = RoundedRectangle(
    backPlateSize,
    backPlateSize,
    0.1,
    10
  );
  const navigate = useNavigate();
  const ref = useRef<Group>(null);
  const [hovered, hover] = useState(false);

  const pointerOver = (e: ThreeEvent<PointerEvent>) => (
    e.stopPropagation(), hover(true)
  );
  const pointerOut = () => hover(false);

  useCursor(hovered);
  useFrame((_, delta) => {
    ref.current!.children.forEach((child) => {
      const mesh = child as THREE.Mesh;

      // Adjust scale when hovered
      easing.damp3(mesh.scale, hovered ? 1.15 : 1, 0.1, delta);

      // Adjust material properties
      easing.damp(mesh.material, "radius", hovered ? 0.25 : 0.1, 0.2, delta);
      easing.damp(mesh.material, "zoom", hovered ? 1 : 1.5, 0.2, delta);
    });
  });

  return (
    <group
      onPointerOver={pointerOver}
      onPointerOut={pointerOut}
      ref={ref}
      {...props}
      onClick={() => navigate(`/collections#${imageId}`)}
    >
      <Image url={imageUrl} transparent side={THREE.DoubleSide} castShadow>
        <planeGeometry args={[1, 1]} />
      </Image>
      <mesh position={[0, 0, 0.01]} castShadow geometry={backPlateGeometry}>
        <meshBasicMaterial color="white" side={THREE.FrontSide} />
      </mesh>
    </group>
  );
}
interface SphereProps extends MeshProps {
  radius: number;
}

function Sphere({ radius, ...props }: SphereProps) {
  const [hovered, hover] = useState(false);

  const pointerOver = (e: ThreeEvent<PointerEvent>) => (
    e.stopPropagation(), hover(true)
  );
  const pointerOut = () => hover(false);
  const [distortion, setDistortion] = useState(0);
  const [distortionScale, setDistortionScale] = useState(0);
  const [transmission, setTransmission] = useState(0.9);
  useCursor(hovered);
  useFrame((_, delta) => {
    setDistortion((v) => lerp(v, hovered ? 0.5 : 0.2, delta));
    setDistortionScale((v) => lerp(v, hovered ? 0.3 : 2, delta));
    setTransmission((v) => lerp(v, hovered ? 0.7 : 0.9, delta * 2));
  });
  return (
    <mesh
      position={[0, 0, 0]}
      castShadow
      onPointerOver={pointerOver}
      onPointerOut={pointerOut}
    >
      <sphereGeometry args={[radius, 64, 32]} />
      <MeshTransmissionMaterial
        backside
        samples={4}
        thickness={5}
        chromaticAberration={0.02}
        // anisotropy={0.05}
        distortion={distortion}
        distortionScale={distortionScale}
        temporalDistortion={0.2}
        transmission={transmission}
      />
    </mesh>
  );
}

function Ground({ yPos }: { yPos: number }) {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, yPos, 0]}>
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
