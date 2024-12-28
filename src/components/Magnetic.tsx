import React, { useRef, ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

interface MagneticWrapperProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  springConfig?: { stiffness?: number; damping?: number; mass?: number };
}

const MagneticWrapper: React.FC<MagneticWrapperProps> = ({
  children,
  className = "",
  style,
  springConfig = { stiffness: 300, damping: 20, mass: 1 },
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Initialize motion values for x, y, and scale
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  // Initialize springs for smooth transitions
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);
  const scaleSpring = useSpring(scale, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    x.set(offsetX * 0.5);
    y.set(offsetY * 0.5);
    scale.set(1.1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: xSpring, y: ySpring, scale: scaleSpring, ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default MagneticWrapper;
