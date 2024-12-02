import {
  Image,
  MeshReflectorMaterial,
  MeshTransmissionMaterial,
  ScrollControls,
  useCursor,
  useScroll,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useRef, useState } from "react";
import * as THREE from "three";
import { RoundedRectangle } from "./helpers/utils";

export default function Background({}) {
  const radius = 2;
  const circleRadius = radius / 2;
  return (
    <div className=" absolute w-full h-full top-0 left-0">
      <Canvas
        camera={{ position: [0, 0, 100], fov: 15 }}
        eventPrefix="client"
        shadows
      >
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
          <ScrollControls pages={4} infinite damping={0.15}>
            <Rig>
              <Carousel radius={radius} />
            </Rig>
          </ScrollControls>

          <Sphere radius={circleRadius} />
          <Ground yPos={-circleRadius} />
        </group>
        {/* <Environment preset="studio" environmentIntensity={0.01} /> */}
      </Canvas>
    </div>
  );
}

function Rig(props) {
  const outerRef = useRef();
  const ref = useRef();
  const scroll = useScroll();
  useFrame((state, delta) => {
    easing.damp3(outerRef.current.rotation, [0, 0, 0], 1, delta); // Rotate carousel
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

  return (
    <group ref={outerRef} rotation={[0, 2, 0]}>
      <group ref={ref} {...props} />
    </group>
  );
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

function Card({ cardSize = 1, url, ...props }) {
  const backPlateSize = cardSize * 1.1;
  const backPlateGeometry = RoundedRectangle(
    backPlateSize,
    backPlateSize,
    0.1,
    10
  );

  const ref = useRef();
  const [hovered, hover] = useState(false);

  const pointerOver = (e) => (e.stopPropagation(), hover(true));
  const pointerOut = () => hover(false);

  useCursor(hovered);
  useFrame((state, delta) => {
    ref.current.children.forEach((child) => {
      // Adjust scale when hovered
      easing.damp3(child.scale, hovered ? 1.15 : 1, 0.1, delta);

      // Adjust material properties
      easing.damp(child.material, "radius", hovered ? 0.25 : 0.1, 0.2, delta);
      easing.damp(child.material, "zoom", hovered ? 1 : 1.5, 0.2, delta);
      easing.damp(child.material, "opacity", hovered ? 1 : 1, 0.2, delta);
    });
  });

  return (
    <group
      onPointerOver={pointerOver}
      onPointerOut={pointerOut}
      ref={ref}
      {...props}
    >
      <Image url={url} transparent side={THREE.DoubleSide} castShadow>
        <planeGeometry args={[1, 1]} />
      </Image>
      <mesh position={[0, 0, 0.01]} castShadow geometry={backPlateGeometry}>
        <meshBasicMaterial color="white" side={THREE.FrontSide} />
      </mesh>
    </group>
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
