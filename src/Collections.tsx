import { Link } from "react-router";
import data from "./assets/collections.json";
import ScrollToAnchor from "./components/ScrollToAnchor";
import { useTransitionStore } from "./stores";
import { useEffect, useRef, useState } from "react";
import { usePresence } from "motion/react";
import { TRANSITION } from "./helpers/constants";
import Transitioner from "./components/Transitioner";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { Scroll, ScrollControls, useScroll } from "@react-three/drei";
import { Image } from "@react-three/drei";
import { easing } from "maath";
import { Color, Material, Mesh, ShaderMaterial } from "three";

// const Collections = () => {
//   return (
//     <>
//       <Transitioner />
//       <ScrollToAnchor />

//       <div className="mt-[var(--nav-height)] w-screen min-h-screen flex justify-center">
//         <span className="fixed border-t-[1px] w-screen"></span>
//         <div className="grid grid-cols-2 relative justify-center border-x-[1px]">
//           {/* Sidebar */}
//           <aside className="px-[var(--padding)] max-w-[640px] relative pt-6 border-r border-gray-300">
//             <div className="fixed flex flex-col gap-20">
//               <h1 className="text-5xl leading-[1.05] tracking-[-0.05em] font-semibold">
//                 Collections
//               </h1>
//               <ul className="flex flex-col gap-1">
//                 {data.map((item, index) => (
//                   <div key={index}>
//                     <Link
//                       to={`/collections#${item.id}`}
//                       className="text-lg leading-[1.05] tracking-[-0.05em] hover:underline"
//                     >
//                       {item.title}
//                     </Link>
//                   </div>
//                 ))}
//               </ul>
//             </div>
//           </aside>

//           {/* Main Content */}
//           <main className=" max-w-[640px]">
//             {data.map((item, _) => (
//               <section className="flex flex-col" id={item.id} key={item.id}>
//                 <div className="mb-4">
//                   <img
//                     src={item.image + ".webp"}
//                     alt={item.title}
//                     className="w-full object-cover p-6"
//                   />
//                 </div>
//                 <header className="flex justify-between items-start mb-4 px-6">
//                   <h2 className="text-3xl font-semibold leading-[1.05] tracking-[-0.05em]">
//                     {item.title}
//                   </h2>
//                 </header>
//                 <div className="flex space-x-8 px-6">
//                   <p className="text-neutral-600 leading-[1.15] tracking-[-0.04em]">
//                     {item.description}
//                   </p>
//                 </div>
//                 <span className="text-xl my-16 font-medium text-neutral-800 px-6">
//                   {item.id}
//                 </span>
//                 <span className="border-b-[1px] w-full mt-8" />
//               </section>
//             ))}
//           </main>
//         </div>
//       </div>
//     </>
//   );
// };
const SCALE = 3;

function Item({ index, position, scale, c = new Color(), ...props }) {
  const ref = useRef<Mesh>();
  const scroll = useScroll();
  const [hovered, hover] = useState(false);
  const over = () => hover(true);
  const out = () => hover(false);
  useFrame((state, delta) => {
    if (!ref.current) return;
    const y = scroll.curve(
      index / data.length - 1.5 / data.length,
      3 / data.length
    );
    easing.damp3(
      ref.current.scale,
      [y / 2 + SCALE, y / 2 + SCALE, 1],
      0.15,
      delta
    );
    ref.current.material.scale[0] = ref.current.scale.x;
    ref.current.material.scale[1] = ref.current.scale.y;
  });

  const materialRef = useRef<ShaderMaterial>(null);
  const [scrollY, setScrollY] = useState(0);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      setScrollY((prev) => prev + event.deltaY * 0.001);
      if (materialRef.current) {
        materialRef.current.uniforms.scrollEffect.value = Math.sin(scrollY);
      }
    };
    window.addEventListener("wheel", handleScroll);
    return () => window.removeEventListener("wheel", handleScroll);
  }, [scrollY]);
  return (
    <Image
      ref={ref}
      {...props}
      position={position}
      scale={scale}
      onPointerOver={over}
      onPointerOut={out}
    >
      <planeGeometry args={[1, 1, 100, 100]} />
    </Image>
  );
}

function Items({ s = SCALE, gap = 0.5 }) {
  const { width } = useThree((state) => state.viewport);
  const scale = {
    x: 1,
    y: 1,
  };
  const xW = s + gap;
  return (
    <ScrollControls
      horizontal
      damping={0.1}
      pages={(width - xW + data.length * xW) / width}
      // infinite
    >
      {/* <Minimap /> */}
      <Scroll>
        {
          data.map((d, i) => <Item key={i} index={i} position={[i * xW, 0, 0]} scale={[s,s,1]} url={d.image+".webp"} />) /* prettier-ignore */
        }
      </Scroll>
    </ScrollControls>
  );
}

// function WavyPlane() {

//   return (
//     <mesh>
//       <planeGeometry args={[10, 10, 100, 100]} />
//       <shaderMaterial
//         ref={materialRef}
//         vertexShader={vertexShader}
//         fragmentShader={fragmentShader}
//         uniforms={{
//           time: { value: 0 },
//           scrollEffect: { value: 1.0 },
//         }}
//       />
//     </mesh>
//   );
// }

const Collections = () => {
  return (
    <>
      <Transitioner />
      {/* <ScrollToAnchor /> */}
      <div className="fixed w-screen h-screen top-0 left-0">
        <Canvas>
          <Items />
        </Canvas>
      </div>
    </>
  );
};

export default Collections;
