// components/visuals/ToadField.tsx
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Vec2 = { x: number; y: number };

function ToadParticles({ mouse }: { mouse: Vec2 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 900;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // tighter cluster behind logo in center
      arr[i3 + 0] = (Math.random() - 0.5) * 2.6; // x
      arr[i3 + 1] = (Math.random() - 0.5) * 1.8; // y
      arr[i3 + 2] = (Math.random() - 0.5) * 1.8; // z
    }
    return arr;
  }, [count]);

  const speeds = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = 0.01 + Math.random() * 0.035; // faster
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    const pts = pointsRef.current;
    if (!pts) return;

    const pos = pts.geometry.attributes.position as THREE.BufferAttribute;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let x = pos.array[i3 + 0] as number;
      let y = pos.array[i3 + 1] as number;
      let z = pos.array[i3 + 2] as number;

      const s = speeds[i];

      // organic motion
      x += Math.sin(time * s * 1.7 + i * 0.12) * 0.01;
      y += Math.cos(time * s * 2.3 + i * 0.19) * 0.01;
      z += Math.sin(time * s * 1.3 + i * 0.17) * 0.012;

      // attract to center (behind logo)
      const targetX = 0;
      const targetY = 0.25; // slightly above center to sit behind logo
      const targetZ = -0.5;

      x += (targetX - x) * 0.004;
      y += (targetY - y) * 0.004;
      z += (targetZ - z) * 0.004;

      pos.array[i3 + 0] = x;
      pos.array[i3 + 1] = y;
      pos.array[i3 + 2] = z;
    }
    pos.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#8CD45A"
        size={0.085}
        sizeAttenuation
        depthWrite={false}
        opacity={1}
      />
    </Points>
  );
}

export default function ToadField() {
  const [mouse, setMouse] = useState<Vec2>({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMouse({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[2, 4, 3]} intensity={0.4} />
        <ToadParticles mouse={mouse} />
      </Canvas>
    </div>
  );
}