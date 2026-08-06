"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {
  BEHAVIORS,
  setBehaviorTime,
  type BehaviorId,
  type FrameContext,
  type Strand,
} from "./behaviors";

interface BehaviourFieldProps {
  behavior: BehaviorId;
  colors?: string[];
  strandCount?: number;
  pointsPerStrand?: number;
  /** CSS selector for elements the field should treat as anchors. */
  anchorSelector?: string;
  /** Text sampled into a point cloud for the `morph` behaviour. */
  glyphText?: string;
  /** 0 → dispersed, 1 → assembled. Drives `morph`. */
  formation?: number;
  className?: string;
}

const PALETTE = ["#bef264", "#7bb237", "#f1f0f1"];

/**
 * Rasterises a string offscreen and returns one coherent stroke per strand.
 *
 * Sampling the letterform into a flat point list is not enough: each strand is a
 * continuous tube, so if consecutive points land on unrelated parts of the glyph
 * the tube zigzags across the whole word and the shape never reads. Each strand
 * instead gets a nearest-neighbour chain, which traces a short local stroke.
 */
function sampleGlyphStrokes(
  text: string,
  bounds: { x: number; y: number },
  strandCount: number,
  pointsPerStrand: number
): THREE.Vector3[][] {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  canvas.width = 512;
  canvas.height = 160;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "700 110px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const hits: THREE.Vector3[] = [];
  const wanted = strandCount * pointsPerStrand * 3;

  for (let i = 0; i < 60000 && hits.length < wanted; i++) {
    const px = Math.floor(Math.random() * canvas.width);
    const py = Math.floor(Math.random() * canvas.height);
    if (data[(py * canvas.width + px) * 4] > 128) {
      hits.push(
        new THREE.Vector3(
          (px / canvas.width - 0.5) * bounds.x * 1.7,
          -(py / canvas.height - 0.5) * bounds.y * 0.95,
          (Math.random() - 0.5) * 0.25
        )
      );
    }
  }
  if (!hits.length) return [];

  const used = new Uint8Array(hits.length);
  const strokes: THREE.Vector3[][] = [];

  for (let s = 0; s < strandCount; s++) {
    let current = -1;
    for (let guard = 0; guard < hits.length && current < 0; guard++) {
      const candidate = Math.floor(Math.random() * hits.length);
      if (!used[candidate]) current = candidate;
    }
    if (current < 0) current = Math.floor(Math.random() * hits.length);

    const stroke: THREE.Vector3[] = [];
    for (let p = 0; p < pointsPerStrand; p++) {
      used[current] = 1;
      stroke.push(hits[current].clone());

      let best = -1;
      let bestDist = Infinity;
      for (let i = 0; i < hits.length; i++) {
        if (used[i]) continue;
        const d = hits[i].distanceToSquared(hits[current]);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      if (best < 0) break;
      current = best;
    }
    while (stroke.length < pointsPerStrand) stroke.push(stroke[stroke.length - 1].clone());
    strokes.push(stroke);
  }

  return strokes;
}

export default function BehaviourField({
  behavior,
  colors = PALETTE,
  strandCount = 10,
  pointsPerStrand = 14,
  anchorSelector,
  glyphText = "TOAD",
  formation = 0,
  className = "",
}: BehaviourFieldProps) {
  const mount = useRef<HTMLDivElement>(null);
  // Latest props for the render loop to read without tearing down the scene.
  // Written in an effect, not during render — mutating a ref while rendering is
  // not safe under concurrent React.
  const live = useRef({ behavior, formation, anchorSelector, glyphText });
  useEffect(() => {
    live.current = { behavior, formation, anchorSelector, glyphText };
  }, [behavior, formation, anchorSelector, glyphText]);

  useEffect(() => {
    const container = mount.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.15, 0.6, 0);
    composer.addPass(bloom);

    // World half-extents on the z=0 plane, so behaviours can reason in world units.
    const bounds = { x: 5, y: 3 };
    const recomputeBounds = () => {
      const vFov = (camera.fov * Math.PI) / 180;
      bounds.y = Math.tan(vFov / 2) * camera.position.z;
      bounds.x = bounds.y * camera.aspect;
    };

    const strands: Strand[] = Array.from({ length: strandCount }, (_, i) => {
      const row = (i / (strandCount - 1) - 0.5) * 2;
      const points: THREE.Vector3[] = [];
      const rest: THREE.Vector3[] = [];
      const prev: THREE.Vector3[] = [];

      for (let j = 0; j < pointsPerStrand; j++) {
        const t = j / (pointsPerStrand - 1);
        const p = new THREE.Vector3((t - 0.5) * 8, row * 2.4, 0);
        points.push(p.clone());
        rest.push(p.clone());
        prev.push(p.clone());
      }

      return {
        points,
        rest,
        prev,
        targets: [],
        seed: i,
        phase: (i / strandCount) * Math.PI * 2,
        hue: i % colors.length,
        radius: 0.016 + (i % 3) * 0.012,
        break: -1,
        heal: 0,
      };
    });

    const meshes = strands.map((strand) => {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colors[strand.hue]),
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      });
      const curve = new THREE.CatmullRomCurve3(strand.points);
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, strand.radius, 6, false), material);
      scene.add(mesh);
      return { mesh, material, curve };
    });

    const frame: FrameContext = {
      strands,
      pointer: new THREE.Vector3(),
      pointerVelocity: new THREE.Vector3(),
      pointerSpeed: 0,
      pointerDown: false,
      impulse: 0,
      anchors: [],
      activeAnchor: -1,
      glyph: [],
      formation: 0,
      time: 0,
      dt: 1 / 60,
      bounds,
      reduced,
    };

    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const ndc = new THREE.Vector2();
    const lastPointer = new THREE.Vector3();

    const toWorld = (clientX: number, clientY: number, out: THREE.Vector3) => {
      const rect = container.getBoundingClientRect();
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      raycaster.ray.intersectPlane(plane, out);
    };

    const pointerTarget = new THREE.Vector3();
    let hasPointer = false;

    const onMove = (event: PointerEvent) => {
      toWorld(event.clientX, event.clientY, pointerTarget);
      hasPointer = true;
    };
    const onDown = () => {
      frame.pointerDown = true;
      frame.impulse = 1;
    };
    const onUp = () => {
      frame.pointerDown = false;
    };

    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      recomputeBounds();
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloom.resolution.set(w, h);
      frame.glyph = sampleGlyphStrokes(
        live.current.glyphText ?? "TOAD",
        bounds,
        strandCount,
        pointsPerStrand
      );
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(container);

    const clock = new THREE.Clock();
    let raf = 0;
    const anchorPoint = new THREE.Vector3();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      frame.dt = dt;
      frame.time += dt;
      setBehaviorTime(frame.time);

      if (!hasPointer) {
        // Idle drift so the field is alive before the first pointer event.
        pointerTarget.set(
          Math.cos(frame.time * 0.42) * bounds.x * 0.45,
          Math.sin(frame.time * 0.55) * bounds.y * 0.45,
          0
        );
      }

      lastPointer.copy(frame.pointer);
      frame.pointer.lerp(pointerTarget, reduced ? 0.06 : 0.18);
      frame.pointerVelocity.subVectors(frame.pointer, lastPointer).divideScalar(dt || 0.016);
      frame.pointerSpeed = frame.pointerVelocity.length();
      frame.impulse = Math.max(0, frame.impulse - dt * 1.6);
      frame.formation = live.current.formation ?? 0;

      // Republish DOM anchors each frame; layout can move under us.
      const selector = live.current.anchorSelector;
      if (selector) {
        frame.anchors.length = 0;
        frame.activeAnchor = -1;
        document.querySelectorAll<HTMLElement>(selector).forEach((el, i) => {
          const rect = el.getBoundingClientRect();
          toWorld(rect.left + rect.width / 2, rect.top + rect.height / 2, anchorPoint);
          frame.anchors.push(anchorPoint.clone());
          if (el.dataset.anchorActive === "true") frame.activeAnchor = i;
        });
      }

      BEHAVIORS[live.current.behavior](frame);

      strands.forEach((strand, i) => {
        const { mesh, curve } = meshes[i];
        curve.points = strand.points;
        const next = new THREE.TubeGeometry(curve, 40, strand.radius, 6, false);
        mesh.geometry.dispose();
        mesh.geometry = next;
      });

      composer.render();
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      meshes.forEach(({ mesh, material }) => {
        mesh.geometry.dispose();
        material.dispose();
      });
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, [strandCount, pointsPerStrand, colors]);

  return <div ref={mount} className={`h-full w-full ${className}`} />;
}
