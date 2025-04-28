import {
  Image,
  MeshReflectorMaterial,
  MeshTransmissionMaterial,
  PerformanceMonitor,
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
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { useLocation, useNavigate } from "react-router";
import { createNoise3D } from "simplex-noise";
import * as THREE from "three";
import { Group } from "three";
import { proxy } from "valtio";
import { subscribeKey } from "valtio/utils";
import data from "./assets/collections.json";
import { TRANSITION } from "./helpers/constants";
import { getShortestDistance, RoundedRectangle } from "./helpers/utils";
import { backgroundStore } from "./stores";

interface Store {
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
  delta: {
    drag: { x: 0, y: 0 },
    wheel: { x: 0, y: 0 },
  },
};

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
        >
          <Suspense fallback={null}>
            <PerformanceMonitor flipflops={3}>
              <Scene />
            </PerformanceMonitor>
            <Preload all />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}

const Scene = () => {
  const radius = 2;
  const circleRadius = radius / 1.8;
  const spotLightRef = useRef<THREE.SpotLight>(null);
  const { gl } = useThree();

  usePerformanceMonitor({
    onChange: ({ factor }) => {
      gl.pixelRatio = Math.min(Math.floor(0.5 + 1.5 * factor), 1);

      if (spotLightRef.current) {
        const res = 2 ** Math.floor(5 + 4 * factor);

        if (spotLightRef.current.shadow.mapSize.x == res) return;

        spotLightRef.current.shadow.mapSize.set(res, res);
        spotLightRef.current.shadow.map?.setSize(res, res);
      }
    },
  });

  return (
    <>
      <fog attach="fog" args={["#eee", 4, 15]} />
      <pointLight position={[0, 5, 0]} intensity={2} decay={0} />
      <spotLight
        ref={spotLightRef}
        angle={0.8}
        position={[0, 5, 0]}
        intensity={0.5}
        decay={0}
        castShadow
        shadow-mapSize={[128, 128]}
      />
      <Rig>
        <Carousel radius={radius} />
      </Rig>

      <Sphere radius={circleRadius} />
      <Ground yPos={-circleRadius} />
      <DustParticles />
    </>
  );
};

interface RigProps extends GroupProps {}

function Rig({ ...props }: RigProps) {
  const [isDelayed, setIsDelayed] = useState(false);

  const { scene, camera } = useThree();

  const carouselRef = useRef<Group>(null);
  const carouselRotation = useRef(new THREE.Euler());
  const cameraTarget = useRef({
    pos: new THREE.Vector3(),
    rot: new THREE.Euler(),
  });
  const prevRoute = useRef("");

  const ids = data.map((item) => item.id);
  const THRESHOLD = 0.001;

  // variables, for memory allocation
  const v = new THREE.Vector3();
  const toCamera = new THREE.Vector3(0, 0, -1); // Default camera forward direction
  const e = new THREE.Euler();
  const [q1, q2] = [new THREE.Quaternion(), new THREE.Quaternion()];
  const CAMERA_POS: THREE.Vector3Tuple = [0, 1, 9];
  const SCENE_CENTER = new THREE.Vector3(0, 0, 0);
  const CLOSE_UP_OFFSET = new THREE.Vector3(0, 0.2, 0);

  /**
   * Calculate camera target position and rotation to face object
   * @param obj Object to face camera
   * @param distance Distance from object
   * @returns Camera target position and rotation
   */
  function calculateCameraTarget(
    obj: THREE.Object3D,
    distance = 2
  ): {
    pos: THREE.Vector3;
    rot: THREE.Euler;
  } {
    // Get object's world quaternion and position
    obj.getWorldQuaternion(q1);
    obj.getWorldPosition(v);

    // Calculate direction vector from target position to object
    const direction = new THREE.Vector3(0, 0, 1)
      .applyQuaternion(q1)
      .normalize();

    // Calculate target position
    const targetPos = v.clone().sub(direction.multiplyScalar(distance));

    // Compute quaternion for camera to face v
    const lookDirection = v.clone().sub(targetPos).normalize(); // Vector pointing from targetPos to v
    const cameraQuaternion = q2.setFromUnitVectors(toCamera, lookDirection);

    // Adjust camera's rotation
    const cameraRotation = e.setFromQuaternion(cameraQuaternion);

    return {
      pos: targetPos.add(CLOSE_UP_OFFSET),
      rot: cameraRotation,
    };
  }

  /**
   * Get rotation for carousel to rotate to next route
   * @param prevRouteId Previous route id
   * @param currentRouteObj Current route object
   * @returns
   */
  function getCarouselRotation(
    prevRouteId: string,
    currentRouteObj: THREE.Object3D
  ) {
    const prevRouteObj = scene.getObjectByName(prevRouteId);
    if (prevRouteObj) {
      const units = getShortestDistance(
        prevRouteObj.userData.index,
        currentRouteObj.userData.index,
        ids.length
      );

      return e.set(0, -units * ((Math.PI * 2) / ids.length), 0) as THREE.Euler;
    }
    return e.set(0, 0, 0) as THREE.Euler;
  }

  /**
   * Move camera, affected by pointer movement
   * @param target Target position
   * @param pointer Pointer position
   * @param camera Camera
   * @param delta Time delta
   */
  function pointerMoveCamera(
    target: THREE.Vector3Tuple,
    pointer: THREE.Vector2,
    camera: THREE.Camera,
    delta: number
  ) {
    const cameraPos: THREE.Vector3Tuple = isMobile
      ? target
      : [
          -pointer.x * 1 + target[0],
          pointer.y * 0.5 + target[1],
          pointer.y / 3 + target[2],
        ];

    easing.damp3(camera.position, cameraPos, 0.4, delta);
  }

  /**
   * Rotate camera to face target
   * @param target Target position
   * @param camera Camera
   * @param delta Time delta
   */
  function rotateCamera(
    target: THREE.Vector3,
    camera: THREE.Camera,
    delta: number
  ) {
    // direction vector from camera to target
    const cameraDirection = v.subVectors(target, camera.position).normalize();

    // quaternion for camera to face target
    q1.setFromUnitVectors(toCamera, cameraDirection);
    const euler = e.setFromQuaternion(q1);

    easing.dampE(camera.rotation, euler, 0.2, delta);
  }

  /**
   * Move camera to target position and rotation
   * @param camera Camera
   * @param delta Time delta
   * @param targetPos Target position
   * @param targetRot Target rotation
   */
  function moveCamera(
    camera: THREE.Camera,
    delta: number,
    targetPos: THREE.Vector3,
    targetRot: THREE.Euler
  ) {
    const currentPos = camera.position;
    const currentRot = camera.rotation;

    // Check if position and rotation differences are below threshold
    const posDone = currentPos.distanceTo(targetPos) < THRESHOLD;
    const rotDone =
      q1.setFromEuler(currentRot).angleTo(q2.setFromEuler(targetRot)) <
      THRESHOLD;

    if (posDone && rotDone) {
      return;
    }

    easing.damp3(camera.position, targetPos, 0.5, delta);
    easing.dampE(camera.rotation, targetRot, 0.5, delta);
  }

  /**
   * Rotate carousel
   * @param delta delta time
   * @param targetRotation Target rotation
   */
  function rotateCarousel(delta: number, targetRotation: THREE.Euler) {
    easing.dampE(carouselRef.current!.rotation, targetRotation, 0.1, delta);
  }

  // one-time onmount effects:
  // subscribe to drag and wheel events, assign findClosestObjectId to store
  useEffect(() => {
    // Delay useFrame execution by 1 second
    const timeout = setTimeout(() => {
      setIsDelayed(true);
    }, TRANSITION.DURATION_S / 2);

    const findClosestObjectId = () => {
      if (!carouselRef.current) return null;
      const objects = carouselRef.current.children;

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

    // Assign function to Valtio store
    backgroundStore.findClosestObjectId = findClosestObjectId;

    const dragUnsub = subscribeKey(store.delta, "drag", () => {
      carouselRotation.current.y += store.delta.drag.x * 0.005;
    });

    const wheelUnsub = subscribeKey(store.delta, "wheel", () => {
      carouselRotation.current.y +=
        (-store.delta.wheel.x + -store.delta.wheel.y) * 0.008;
    });

    return () => {
      dragUnsub();
      wheelUnsub();
      clearTimeout(timeout);
    };
  }, []);

  // route change effects
  useEffect(() => {
    if (/\/collections\/\d+/.test(location.pathname)) {
      const id = location.pathname.split("/")[2];
      const currentRouteObj = scene.getObjectByName(id);

      if (currentRouteObj) {
        const prevRouteId = prevRoute.current.split("/")[2];
        if (!prevRouteId) {
          // lock camera to object
          const { pos, rot } = calculateCameraTarget(currentRouteObj, 2.5);

          cameraTarget.current.pos.copy(pos);
          cameraTarget.current.rot.copy(rot);
        } else {
          const rot = getCarouselRotation(prevRouteId, currentRouteObj);
          carouselRotation.current.set(
            carouselRotation.current.x + rot.x,
            carouselRotation.current.y + rot.y,
            carouselRotation.current.z + rot.z
          );
        }
      }
    } else if (location.pathname === "/about") {
      cameraTarget.current.pos.set(0, 2, 5);
      cameraTarget.current.rot.set(-0.2, 0, -Math.PI / 2.2);
    } else if (location.pathname === "/404") {
      cameraTarget.current.pos.set(0, 10, 0);
      cameraTarget.current.rot.set(-Math.PI / 2, 0, 0);
    }
    prevRoute.current = location.pathname;
  }, [location.pathname]);

  // render loop
  useFrame((state, delta) => {
    if (!isDelayed) return;
    if (location.pathname === "/") {
      pointerMoveCamera(CAMERA_POS, state.pointer, state.camera, delta);
      rotateCamera(SCENE_CENTER, state.camera, delta);
    } else {
      moveCamera(
        state.camera,
        delta,
        cameraTarget.current.pos,
        cameraTarget.current.rot
      );
    }
    if (location.pathname == "/about") {
      carouselRotation.current.y += 0.3 * delta;
    }
    rotateCarousel(delta, carouselRotation.current);
  });

  return <group ref={carouselRef} {...props} />;
}

function Carousel({ radius = 2 }) {
  return data
    .sort()
    .map((item, i) => (
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
    ));
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
    16
  );
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef<Group>(null);
  const [hovered, hover] = useState(false);

  const pointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hover(true);
  };

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
        radius={0.08}
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
        <meshPhongMaterial
          emissive="#ddd"
          color="white"
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
interface SphereProps extends MeshProps {
  radius: number;
}

function Sphere({ radius }: SphereProps) {
  // const [hovered, hover] = useState(false);
  const [samples, setSamples] = useState(4);

  // const pointerOver = (e: ThreeEvent<PointerEvent>) => (
  //   e.stopPropagation(), hover(true)
  // );
  // const pointerOut = () => hover(false);

  // useCursor(hovered);

  // Commented out because causes freezing when changing samples
  // usePerformanceMonitor({
  //   onChange: ({ factor }) => {
  //     setSamples(Math.max(Math.floor(6 * factor - 2), 1));
  //   },
  // });

  return (
    <mesh
      position={[0, 0, 0]}
      castShadow
      // onPointerOver={pointerOver}
      // onPointerOut={pointerOut}
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
      const res = 2 ** Math.max(Math.floor(7 + 4 * factor), 8);
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

const DustParticles = ({ count = 1000, radius = 10 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const speed = 0.002;
  const noise = useMemo(() => createNoise3D(), []);

  // Precompute particle positions and velocities
  const particles = useMemo(() => {
    const positions = [];
    const velocities = [];
    for (let i = 0; i < count; i++) {
      const phi = Math.random() * 2 * Math.PI;
      const theta = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * radius;

      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);

      positions.push(new THREE.Vector3(x, y, z));
      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed,
          (Math.random() - 0.5) * speed
        )
      );
    }
    return { positions, velocities };
  }, [count, radius]);

  // Update particles on every frame
  useFrame(() => {
    for (let i = 0; i < count; i++) {
      const particle = particles.positions[i];
      const velocity = particles.velocities[i];

      // Update particle position
      particle.add(velocity);

      // Keep particles within bounds (wrap around)
      if (particle.length() > radius) {
        particle.set(
          Math.random() * radius - radius / 2,
          Math.random() * radius - radius / 2,
          Math.random() * radius - radius / 2
        );
      }

      // Update dummy object and set matrix for instancing
      dummy.position.copy(particle);
      // Calculate sparkle brightness (sin-based for smooth transitions)
      dummy.scale.setScalar(
        0.5 + noise(particle.x * 2, particle.y * 2, particle.z * 2) * 0.5
      ); // Scale particles with sparkle
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      position={[0, 0, -3]}
      ref={meshRef}
      args={[undefined, undefined, count]}
    >
      <sphereGeometry args={[0.02, 4, 4]} />
      <meshBasicMaterial color="#eee" transparent />
    </instancedMesh>
  );
};
