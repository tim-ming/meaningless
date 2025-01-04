import {
  Image,
  MeshReflectorMaterial,
  MeshTransmissionMaterial,
  PerformanceMonitor,
  PerformanceMonitorApi,
  Preload,
  useCursor,
  usePerformanceMonitor,
} from "@react-three/drei";
import {
  Canvas,
  GroupProps,
  MeshProps,
  ThreeEvent,
  useFrame,
  useThree,
} from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import { easing } from "maath";
import { Suspense, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import * as THREE from "three";
import { Group } from "three";
import { proxy } from "valtio";
import { subscribeKey } from "valtio/utils";
import data from "./assets/collections.json";
import { TRANSITION } from "./helpers/constants";
import { getShortestDistance, RoundedRectangle } from "./helpers/utils";
import { backgroundStore } from "./stores";
import { isMobile } from "react-device-detect";

const THRESHOLD = 0.001;

interface Store {
  carouselRotation: THREE.Euler;

  prevRoute: string;
  cameraTarget: {
    pos: THREE.Vector3;
    rot: THREE.Euler;
  };

  ids: string[];
  delta: {
    drag: {
      x: number;
      y: number;
    };
    wheel: {
      x: number;
      y: number;
    };
  };
}

const initialState: Store = {
  carouselRotation: new THREE.Euler(0, 0, 0),
  prevRoute: "",
  cameraTarget: {
    pos: new THREE.Vector3(0, 0, 5),
    rot: new THREE.Euler(0, 0, 0),
  },
  ids: data.map((item) => item.id),
  delta: {
    drag: { x: 0, y: 0 },
    wheel: { x: 0, y: 0 },
  },
};

const CAMERA_POS: THREE.Vector3Tuple = [0, 1, 9];

const store: Store = proxy<Store>({ ...initialState });

export default function Background({}) {
  const location = useLocation();
  const bind = useGesture({
    onWheel: ({ delta: [deltaX, deltaY] }) => {
      if (location.pathname === "/") {
        store.delta.wheel = {
          x: deltaX,
          y: deltaY,
        };
      }
    },
    onDrag: ({ delta: [deltaX, deltaY] }) => {
      if (location.pathname === "/") {
        store.delta.drag = {
          x: deltaX,
          y: deltaY,
        };
      }
    },
  });
  return (
    <>
      <div
        {...bind()}
        className="fixed w-full h-full top-0 left-0 bg-white touch-none"
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          eventPrefix="client"
          shadows
          frameloop="always"
          // frameloop="never"
        >
          <Suspense fallback={null}>
            <PerformanceMonitor flipflops={3}>
              <Scene />
            </PerformanceMonitor>
            <Preload all />
          </Suspense>
          {/* <Environment preset="studio" environmentIntensity={0.01} /> */}
        </Canvas>
      </div>
    </>
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
  distance = 2
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
  const ref = useRef<Group>(null);
  const radius = 2;
  const circleRadius = radius / 1.8;
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      store.cameraTarget.pos.set(0, 0, 5);
      store.cameraTarget.rot.set(0, 0, 0);

      setRigEnabled(true);
    } else if (/\/collections\/\d+/.test(location.pathname)) {
      setRigEnabled(false);

      const id = location.pathname.split("/")[2];
      const obj = ref.current?.getObjectByName(id);

      if (obj) {
        const prevRouteId = store.prevRoute.split("/")[2];
        if (!prevRouteId) {
          const { pos, rot } = calculateCameraTarget(obj, 2.5);

          store.cameraTarget.pos.copy(pos);
          store.cameraTarget.rot.copy(rot);
        }
      }
    } else if (location.pathname === "/about") {
      setRigEnabled(false);

      store.cameraTarget.pos.set(0, 2, 5);
      store.cameraTarget.rot.set(-0.2, 0, -Math.PI / 2.2);
    }
    store.prevRoute = location.pathname;
  }, [location]);

  return (
    <>
      <PerformanceController />
      <CameraController />
      {/* <color attach="background" args={["#fff"]} /> */}
      <fog attach="fog" args={["#fff", 4, 20]} />
      <group ref={ref}>
        <pointLight position={[0, 5, 0]} intensity={2} decay={0} />
        <spotLight
          name="spotLight"
          angle={0.8}
          position={[0, 5, 0]}
          intensity={0.5}
          decay={0}
          castShadow
          shadow-mapSize={[128, 128]}
        />
        <Rig enabled={rigEnabled}>
          <Carousel radius={radius} />
        </Rig>

        <Sphere radius={circleRadius} />
        <Ground yPos={-circleRadius} />
      </group>
    </>
  );
};

const PerformanceController = () => {
  const { gl, scene } = useThree();
  usePerformanceMonitor({
    onChange: ({ factor }) => {
      gl.pixelRatio = Math.min(Math.floor(0.5 + 1.5 * factor), 1);
      const spotLight = scene.getObjectByName("spotLight") as THREE.SpotLight;

      if (spotLight) {
        const res = 2 ** Math.floor(5 + 4 * factor);

        if (spotLight.shadow.mapSize.x == res) return;

        spotLight.shadow.mapSize.set(res, res);
        spotLight.shadow.map?.setSize(res, res);

        console.log(spotLight.shadow.mapSize);
      }
      // if (gl) {
      //   gl.shadowMap.enabled = factor > 0.8;
      // }
    },
  });

  return <></>;
};

const CameraController = () => {
  const [q1, q2] = [new THREE.Quaternion(), new THREE.Quaternion()];
  useFrame((state, delta) => {
    if (location.pathname === "/") return;

    const currentPos = state.camera.position;
    const targetPos = store.cameraTarget.pos;
    const currentRot = state.camera.rotation;
    const targetRot = store.cameraTarget.rot;

    // Check if position and rotation differences are below the threshold
    const posDone = currentPos.distanceTo(targetPos) < THRESHOLD;
    const rotDone =
      q1.setFromEuler(currentRot).angleTo(q2.setFromEuler(targetRot)) <
      THRESHOLD;

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
  const [isDelayed, setIsDelayed] = useState(false); // Store to trigger useFrame logic
  useEffect(() => {
    // Delay the useFrame execution by 1 second
    const timeout = setTimeout(() => {
      setIsDelayed(true);
    }, TRANSITION.DURATION_S / 2);

    return () => clearTimeout(timeout); // Cleanup timeout on unmount
  }, []);

  // Calculate the Euler angles required to look at (0, 0, 0)
  const target = new THREE.Vector3(0, 0, 0);
  const v = new THREE.Vector3(0, 0, 0);
  const q = new THREE.Quaternion();
  const toCamera = new THREE.Vector3(0, 0, -1); // Default camera forward direction
  const e = new THREE.Euler();

  useFrame((state, delta) => {
    if (!enabled) return;
    if (!isDelayed) return;

    easing.dampE(outerRef.current!.rotation, [0, 0, 0], 1, delta); // Initial rotation (first page load)

    const cameraPos: THREE.Vector3Tuple = isMobile
      ? CAMERA_POS
      : [
          -state.pointer.x * 1 + CAMERA_POS[0],
          state.pointer.y * 0.5 + CAMERA_POS[1],
          state.pointer.y / 3 + CAMERA_POS[2],
        ];

    // Move camera
    easing.damp3(state.camera.position, cameraPos, 0.3, delta);

    // Compute the direction vector from the camera to the target
    const cameraDirection = v
      .subVectors(target, state.camera.position)
      .normalize();

    // Create a quaternion to represent the rotation towards the target
    q.setFromUnitVectors(toCamera, cameraDirection);

    // Convert the quaternion to Euler angles
    const euler = e.setFromQuaternion(q);

    // Smoothly rotate the camera towards the target using damping
    easing.dampE(state.camera.rotation, euler, 0.2, delta);
  });

  return (
    <group ref={outerRef} rotation={[0, 2, 0]}>
      <group ref={ref} {...props} />
    </group>
  );
}

function Carousel({ radius = 2 }) {
  const ref = useRef<Group>(null);
  const { camera, scene } = useThree();
  const location = useLocation();

  useFrame((_, delta) => {
    if (location.pathname == "/about") {
      store.carouselRotation.y += 0.3 * delta;
    }
    easing.dampE(ref.current!.rotation, store.carouselRotation, 0.1, delta);
  });

  useEffect(() => {
    const findClosestObjectId = () => {
      if (!ref.current) return null;
      const objects = ref.current.children;

      const closest = objects
        .map((object) => ({
          object,
          distance: camera.position.distanceTo(
            object.getWorldPosition(new THREE.Vector3())
          ),
        }))
        .reduce(
          (closest, current) =>
            current.distance < closest.distance ? current : closest,
          { object: null, distance: Infinity } as {
            object: THREE.Object3D | null;
            distance: number;
          }
        ).object;

      return closest ? closest.name : null;
    };

    // Assign the function to the Valtio store
    backgroundStore.findClosestObjectId = findClosestObjectId;

    const dragUnsub = subscribeKey(store.delta, "drag", () => {
      store.carouselRotation.y += store.delta.drag.x * 0.005;
    });

    const wheelUnsub = subscribeKey(store.delta, "wheel", () => {
      store.carouselRotation.y +=
        (-store.delta.wheel.x + -store.delta.wheel.y) * 0.008;
    });

    return () => {
      dragUnsub();
      wheelUnsub();
    };
  }, []);

  useEffect(() => {
    // if any unexpected behavior happens, do check the prevRoute settings in Scene.
    if (location.pathname === "/") {
      store.carouselRotation = initialState.carouselRotation;
    } else if (/\/collections\/\d+/.test(location.pathname)) {
      store.carouselRotation = initialState.carouselRotation;

      const id = location.pathname.split("/")[2];
      const obj = ref.current?.getObjectByName(id);

      if (obj) {
        const prevRouteId = store.prevRoute.split("/")[2];
        if (prevRouteId) {
          const prevRouteObj = scene.getObjectByName(prevRouteId);
          if (prevRouteObj) {
            const units = getShortestDistance(
              prevRouteObj.userData.index,
              obj.userData.index,
              store.ids.length
            );

            const rotation =
              store.carouselRotation.y -
              units * ((Math.PI * 2) / store.ids.length);

            store.carouselRotation.set(
              store.carouselRotation.x,
              rotation,
              store.carouselRotation.z
            );
          }
        }
      }
    }
  }, [location]);

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
  const backPlateSize = cardSize * 1.05;
  const backPlateGeometry = RoundedRectangle(
    backPlateSize,
    backPlateSize,
    0.1,
    10
  );
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef<Group>(null);
  const [hovered, hover] = useState(false);

  const pointerOver = (e: ThreeEvent<PointerEvent>) => (
    e.stopPropagation(), hover(true)
  );
  const pointerOut = () => hover(false);
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const id = location.pathname.split("/")[2];
    if (id === imageId) return;
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
        position={[0, 0, 0.005]}
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

function Sphere({ radius }: SphereProps) {
  const [hovered, hover] = useState(false);

  const pointerOver = (e: ThreeEvent<PointerEvent>) => (
    e.stopPropagation(), hover(true)
  );
  const pointerOut = () => hover(false);
  const [samples, setSamples] = useState(4);

  useCursor(hovered);

  usePerformanceMonitor({
    onChange: ({ factor }) => {
      setSamples(Math.max(Math.floor(6 * factor - 2), 1));
    },
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
        samples={samples}
        thickness={5}
        chromaticAberration={0.02}
        // anisotropy={0.05}
        distortion={0.2}
        distortionScale={2}
        temporalDistortion={0.2}
        transmission={0.9}
      />
    </mesh>
  );
}

function Ground({ yPos }: { yPos: number }) {
  const [res, setRes] = useState(512);

  usePerformanceMonitor({
    onChange: ({ factor }) => {
      const res = 2 ** Math.floor(7 + 4 * factor);
      setRes(res);
    },
  });

  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, yPos, 0]}>
      <circleGeometry args={[4, 100]} />
      <MeshReflectorMaterial
        mirror={0}
        blur={[300, 300]}
        resolution={res}
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
