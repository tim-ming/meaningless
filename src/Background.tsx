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
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { getShortestDistance, RoundedRectangle } from "./helpers/utils";
import { Group } from "three";
import { lerp } from "three/src/math/MathUtils.js";
import data from "./assets/collections.json";
import { useLocation, useNavigate, useParams } from "react-router";
import { TRANSITION } from "./helpers/constants";
import { proxy, useSnapshot } from "valtio";

const THRESHOLD = 0.001;

interface Store {
  sceneRotation: THREE.Euler;

  carouselRotation: number;
  prevRoute: string;
  cameraTarget: {
    pos: THREE.Vector3;
    rot: THREE.Euler;
  };
  ids: string[];
}
const initialState: Store = {
  sceneRotation: new THREE.Euler(0, 0, 0),
  carouselRotation: 0,
  prevRoute: "",
  cameraTarget: {
    pos: new THREE.Vector3(0, 0, 5),
    rot: new THREE.Euler(0, 0, 0),
  },
  ids: data.map((item) => item.id),
};

const store: Store = proxy<Store>({ ...initialState });

export default function Background({}) {
  const [dpr, setDpr] = useState(1);
  return (
    <div className="fixed w-screen h-screen top-0 left-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        eventPrefix="client"
        shadows
        frameloop="always"
        // frameloop="never"
        dpr={dpr}
      >
        <Suspense fallback={null}>
          <PerformanceMonitor
            onIncline={() => setDpr(1.5)}
            onDecline={() => setDpr(1)}
            flipflops={3}
          >
            <Scene />
          </PerformanceMonitor>
          <Preload all />
        </Suspense>
        {/* <Environment preset="studio" environmentIntensity={0.01} /> */}
      </Canvas>
    </div>
  );
}

/**
 * Calculate the camera target position and rotation to face the object
 * @param obj Object to face the camera
 * @param distance Distance from the object
 * @returns Camera target position and rotation
 */
function calculateCameraTarget(
  obj: THREE.Object3D,
  distance = 1.8
): {
  pos: THREE.Vector3;
  rot: THREE.Euler;
} {
  // Get the object's world quaternion and position
  const q = obj.getWorldQuaternion(new THREE.Quaternion());
  const p = obj.getWorldPosition(new THREE.Vector3());

  // Calculate the direction vector from the target position to the object
  const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(q).normalize();

  // Calculate the target position
  const targetPos = p.clone().sub(direction.multiplyScalar(distance));

  // Compute the quaternion for the camera to face p
  const lookDirection = p.clone().sub(targetPos).normalize(); // Vector pointing from targetPos to p
  const cameraQuaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, -1),
    lookDirection
  );

  // Adjust the camera's rotation
  const cameraRotation = new THREE.Euler().setFromQuaternion(cameraQuaternion);

  return {
    pos: new THREE.Vector3(0, 0.2, 0).add(targetPos),
    rot: cameraRotation,
  };
}

const Scene = () => {
  const [rigEnabled, setRigEnabled] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const ref = useRef<Group>(null);
  const radius = 2;
  const circleRadius = radius / 2;
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      store.cameraTarget.pos.set(0, 0, 5);
      store.cameraTarget.rot.set(0, 0, 0);

      store.sceneRotation = initialState.sceneRotation;

      setRigEnabled(true);
      setScrollEnabled(true);
    } else if (/\/collections\/\d+/.test(location.pathname)) {
      store.sceneRotation = initialState.sceneRotation;

      setRigEnabled(false);
      setScrollEnabled(false);

      const id = location.pathname.split("/")[2];
      const obj = ref.current?.getObjectByName(id);

      if (obj) {
        const prevRouteId = store.prevRoute.split("/")[2];
        if (!prevRouteId) {
          const { pos, rot } = calculateCameraTarget(obj, 1.5);

          store.cameraTarget.pos.copy(pos);
          store.cameraTarget.rot.copy(rot);
        } else {
          const prevRouteObj = ref.current?.getObjectByName(prevRouteId);
          if (prevRouteObj) {
            const units = getShortestDistance(
              prevRouteObj.userData.index,
              obj.userData.index,
              store.ids.length
            );

            const rotation =
              store.sceneRotation.y -
              units * ((Math.PI * 2) / store.ids.length);

            store.sceneRotation.set(
              store.sceneRotation.x,
              rotation,
              store.sceneRotation.z
            );
          }
        }
      }
    } else if (location.pathname === "/about") {
      setRigEnabled(false);
      setScrollEnabled(false);

      store.cameraTarget.pos.set(0, 0, 5);
      store.cameraTarget.rot.set(0, 0, 0);
    }
    store.prevRoute = location.pathname;
  }, [location]);

  return (
    <>
      <CameraController />
      <group ref={ref}>
        {/* <fog attach="fog" args={["#fff", 4, 20]} /> */}
        <pointLight position={[0, 5, 0]} intensity={2} decay={0} />
        <spotLight
          angle={0.8}
          position={[0, 5, 0]}
          intensity={0.5}
          decay={0}
          castShadow
        />
        <ScrollControls
          horizontal
          enabled={scrollEnabled}
          pages={3}
          infinite
          maxSpeed={2}
          distance={0.5}
        >
          <Rig enabled={rigEnabled}>
            <Carousel radius={radius} />
          </Rig>
        </ScrollControls>

        <Sphere radius={circleRadius} />
        <Ground yPos={-circleRadius} />
      </group>
    </>
  );
};

const CameraController = () => {
  useFrame((state, delta) => {
    if (location.pathname === "/") return;

    const currentPos = state.camera.position;
    const targetPos = store.cameraTarget.pos;
    const currentRot = state.camera.rotation;
    const targetRot = store.cameraTarget.rot;

    // Check if position and rotation differences are below the threshold
    const posDone = currentPos.distanceTo(targetPos) < THRESHOLD;
    const rotDone =
      new THREE.Quaternion()
        .setFromEuler(currentRot)
        .angleTo(new THREE.Quaternion().setFromEuler(targetRot)) < THRESHOLD;

    if (posDone && rotDone) {
      return;
    }

    easing.damp3(
      state.camera.position,
      [...store.cameraTarget.pos.toArray()],
      0.3,
      delta
    );
    easing.dampE(
      state.camera.rotation,
      [...store.cameraTarget.rot.toArray()],
      0.3,
      delta
    );
  });
  return <></>;
};
interface RigProps extends GroupProps {
  enabled: boolean;
}

function Rig({ enabled, ...props }: RigProps) {
  const outerRef = useRef<Group>(null);
  const ref = useRef<Group>(null);
  const scroll = useScroll();
  const [isDelayed, setIsDelayed] = useState(false); // Store to trigger useFrame logic

  useEffect(() => {
    // Delay the useFrame execution by 1 second
    const timeout = setTimeout(() => {
      setIsDelayed(true);
    }, TRANSITION.DURATION_S / 2);

    return () => clearTimeout(timeout); // Cleanup timeout on unmount
  }, []);

  useFrame((state, delta) => {
    if (!enabled) return;
    if (!isDelayed) return;

    easing.dampE(outerRef.current!.rotation, [0, 0, 0], 1, delta); // Initial rotation (first page load)
    ref.current!.rotation.y = -scroll.offset * (Math.PI * 2); // Rotate contents
    state.events.update!(); // Raycasts every frame rather than on pointer-move

    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 2, state.pointer.y * 1 + 1, state.pointer.y / 2 + 9],
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
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    easing.dampE(ref.current!.rotation, store.sceneRotation, 0.1, delta);
  });
  return (
    <group ref={ref}>
      {data.sort().map((item, i) => (
        <Card
          index={i}
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
      ))}
    </group>
  );
}

interface CardProps extends GroupProps {
  cardSize?: number;
  imageUrl: string;
  imageId: string;
  index: number;
}

function Card({
  index,
  cardSize = 1,
  imageUrl = "",
  imageId,
  ...props
}: CardProps) {
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
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    navigate(`/collections/${imageId}`);
  };

  useCursor(hovered);
  useFrame((_, delta) => {
    const id = location.pathname.split("/")[2];
    const isObj = id ? imageId == id : false;
    ref.current!.children.forEach((child) => {
      const mesh = child as THREE.Mesh;

      // Adjust scale when hovered
      easing.damp3(mesh.scale, hovered || isObj ? 1.2 : 1, 0.2, delta);

      // Adjust material properties
      easing.damp(
        mesh.material,
        "radius",
        hovered || isObj ? 0.05 : 0.1,
        0.2,
        delta
      );
      easing.damp(
        mesh.material,
        "zoom",
        hovered || isObj ? 1 : 1.5,
        0.2,
        delta
      );
    });
  });

  return (
    <group
      onPointerOver={pointerOver}
      onPointerOut={pointerOut}
      ref={ref}
      {...props}
      onClick={click}
      userData={{ index }}
      name={imageId}
    >
      <Image
        url={"/" + imageUrl + ".webp"}
        transparent
        side={THREE.DoubleSide}
        castShadow
      >
        <planeGeometry args={[1, 1]} />
      </Image>
      <mesh
        onClick={(e) => e.stopPropagation()}
        onPointerOver={(e) => e.stopPropagation()}
        position={[0, 0, 0.01]}
        castShadow
        geometry={backPlateGeometry}
      >
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
