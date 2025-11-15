"use client";

import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { displayFont } from "@/app/fonts";

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 43758.5453123;
  return x - Math.floor(x);
};

const ribbonVertexShader = `
uniform float uTime;
varying vec2 vUv;
varying float vWave;

float noise(vec2 p) {
  return sin(p.x * 0.7) * cos(p.y * 0.7);
}

void main() {
  vUv = uv;
  vec3 pos = position;
  float waveX = sin((pos.x * 1.35) + (uTime * 0.8));
  float waveY = cos((pos.y * 1.7) - (uTime * 0.6));
  float ripple = noise(vec2(pos.x * 0.6 + uTime * 0.2, pos.y * 0.6));
  float displacement = (waveX * 0.35) + (waveY * 0.25) + ripple * 0.15;
  pos.z += displacement * 0.9;
  pos.y += displacement * 0.4;
  vWave = displacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const ribbonFragmentShader = `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec2 vUv;
varying float vWave;

void main() {
  float alpha = smoothstep(0.05, 0.9, vUv.y) * 0.85;
  vec3 color = mix(uColorA, uColorB, vUv.y + vWave * 0.15);
  gl_FragColor = vec4(color, alpha);
}
`;

function AuroraRibbon() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color("#bfffa1") },
      uColorB: { value: new THREE.Color("#5ed9ff") },
    }),
    []
  );

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value += delta * 0.65;
  });

  return (
    <mesh rotation={[-Math.PI / 2.2, 0.35, 0]} position={[0, -1.5, 0]}>
      <planeGeometry args={[14, 9, 200, 120]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={ribbonVertexShader}
        fragmentShader={ribbonFragmentShader}
      />
    </mesh>
  );
}

function AuroraParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const COUNT = 650;
    const posArray = new Float32Array(COUNT * 3);
    const colorArray = new Float32Array(COUNT * 3);
    const colorA = new THREE.Color("#bfffa1");
    const colorB = new THREE.Color("#68e2ff");

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const radius = 3 + pseudoRandom(i * 3.1) * 2.5;
      const angle = pseudoRandom(i * 5.9 + 1.3) * Math.PI * 2;
      const height = (pseudoRandom(i * 7.7 + 2.1) - 0.5) * 1.6;

      posArray[i3 + 0] = Math.cos(angle) * radius;
      posArray[i3 + 1] = height;
      posArray[i3 + 2] = Math.sin(angle) * radius;

      const lerp = pseudoRandom(i * 11.3 + 3.7);
      const mixed = colorA.clone().lerp(colorB, lerp);
      colorArray[i3 + 0] = mixed.r;
      colorArray[i3 + 1] = mixed.g;
      colorArray[i3 + 2] = mixed.b;
    }

    return { positions: posArray, colors: colorArray };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.08;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.12;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.65}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function About() {
  return (
    <section
      id="about"
      className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50"
    >
      <div className="pointer-events-none absolute inset-0 -z-30">
        <Canvas camera={{ position: [0, 0, 8], fov: 35 }} gl={{ antialias: true, alpha: true }}>
          <color attach="background" args={["transparent"]} />
          <AuroraRibbon />
          <AuroraParticles />
        </Canvas>
      </div>
      {/* === AMBIENT BACKGROUND MOTION LAYERS === */}

      {/* Big diagonal beam drifting slowly */}
      <motion.div
        className="
          pointer-events-none
          absolute
          -left-40
          top-1/4
          -z-20
          h-[160%]
          w-[160%]
          -rotate-12
          bg-lime-500/20
          blur-3xl
        "
        animate={{ x: [-140, 120, -140], y: [-90, 60, -90] }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orb behind left text block */}
      <motion.div
        className="
          pointer-events-none
          absolute
          -left-10
          top-1/2
          -z-10
          h-72
          w-72
          rounded-full
          bg-lime-400/25
          blur-3xl
        "
        animate={{ x: [0, 40, -20, 0], y: [40, -20, 20, 40] }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Soft orb towards bottom-right */}
      <motion.div
        className="
          pointer-events-none
          absolute
          right-[-10%]
          bottom-[-10%]
          -z-10
          h-80
          w-80
          rounded-full
          bg-lime-300/18
          blur-3xl
        "
        animate={{ x: [0, -40, 20, 0], y: [0, -30, 10, 0] }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* === CONTENT === */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-16 px-6 py-24 lg:flex-row lg:items-center lg:px-10">
        {/* LEFT COLUMN */}
        <div className="max-w-xl space-y-8">
          <p className="text-xs tracking-[0.25em] text-slate-400 uppercase">
            About Toad Creatives
          </p>

          <h2
            className={`${displayFont.className} text-balance text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.05]`}
          >
            I design <span className="text-lime-300">motion–driven</span>{" "}
            interfaces that feel alive, not loud.
          </h2>

          <p className="max-w-xl text-sm leading-relaxed text-slate-300">
            I’m Pasindu, a developer obsessed with kinetic layouts, subtle
            physics, and that sweet spot where{" "}
            <span className="text-lime-300/80">
              nature–inspired motion meets clean product thinking
            </span>
            . Toad Creatives is my lab for Next.js, WebGL and GSAP experiments —
            then refining them into production–ready experiences.
          </p>

          <p className="max-w-xl text-sm leading-relaxed text-slate-400">
            I build for brands that care about craft, performance and detail —
            not just another template. Every interaction should feel like it’s
            been tuned by hand, even if the stack is ruthlessly modern.
          </p>

          <div className="mt-6 grid gap-8 text-xs uppercase tracking-[0.18em] text-slate-400 sm:grid-cols-2">
            <div className="space-y-3">
              <p>What I do</p>
              <ul className="space-y-1 text-[0.78rem] normal-case tracking-normal text-slate-300">
                <li>• Motion–driven landing pages</li>
                <li>• Interactive hero &amp; brand moments</li>
                <li>• Kinetic portfolios &amp; case studies</li>
              </ul>
            </div>
            <div className="space-y-3">
              <p>How we work</p>
              <ul className="space-y-1 text-[0.78rem] normal-case tracking-normal text-slate-300">
                <li>• Concept → prototype → polish</li>
                <li>• Dev–ready Next.js builds</li>
                <li>• Remote–friendly collaboration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT SNAPSHOT CARD */}
        <motion.aside
          className="relative max-w-sm self-stretch"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Breathing glow under card */}
          <motion.div
            className="pointer-events-none absolute inset-[-18%] -z-10 rounded-[2rem] bg-lime-400/25 blur-2xl"
            animate={{
              opacity: [0.3, 0.75, 0.3],
              scale: [0.9, 1.08, 0.9],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="h-full rounded-[1.75rem] border border-white/5 bg-slate-900/80 px-7 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between text-[0.7rem] uppercase tracking-[0.2em] text-slate-400">
              <span>Snapshot</span>
              <span className="rounded-full border border-lime-400/40 bg-lime-400/10 px-3 py-1 text-[0.65rem] font-medium text-lime-300 tracking-[0.18em]">
                Available for projects
              </span>
            </div>

            <dl className="space-y-3 text-[0.8rem] text-slate-200">
              <div className="flex justify-between gap-6">
                <dt className="text-slate-500">Based in</dt>
                <dd className="text-right">Sri Lanka → working globally</dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="text-slate-500">Focus</dt>
                <dd className="text-right">
                  Next.js motion, WebGL &amp; creative dev
                </dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="text-slate-500">Recent work</dt>
                <dd className="text-right">
                  Hospitality, studios, crypto concepts
                </dd>
              </div>
            </dl>

            <p className="mt-6 text-[0.78rem] leading-relaxed text-slate-400">
              Think of Toad Creatives as a motion lab: we prototype the weird
              interactions, keep what feels effortless, and ship only what
              performs for your users.
            </p>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
