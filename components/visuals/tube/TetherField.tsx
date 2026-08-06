"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export interface Attractor {
  /** Viewport coordinates in CSS pixels. */
  x: number;
  y: number;
  /** 0 = ignore, 1 = tubes fully commit to the attractor. */
  strength: number;
}

interface TetherFieldProps {
  colors?: string[];
  tubeCount?: number;
  /** Pulls the tubes toward a point that is not the cursor — a menu button, say. */
  attractor?: Attractor | null;
  /** Collapses the field into a horizontal band, for wipe transitions. */
  band?: number;
  className?: string;
}

const POINTS_PER_TUBE = 12;
const RADIAL_SEGMENTS = 6;
const TUBULAR_SEGMENTS = 44;

/**
 * First-party replacement for the vendored `tubes1.min.js` bundle.
 *
 * The vendor file is 774KB, loaded through a string-eval'd dynamic import, pins
 * devicePixelRatio to 2 regardless of display, and exposes no usable handle on
 * colour — which is why per-section tinting is currently a CSS hue-rotate over
 * the whole canvas, bloom included. Owning the scene gives real colour tweening,
 * DPR control, reduced-motion, and lets DOM interactions reach into the field.
 */
export default function TetherField({
  colors = ["#74a443", "#f1f0f1", "#6c9442"],
  tubeCount = 8,
  attractor = null,
  band = 0,
  className = "",
}: TetherFieldProps) {
  const mount = useRef<HTMLDivElement>(null);
  // Latest props for the render loop to read without tearing down the scene.
  // Written in an effect, not during render — mutating a ref while rendering is
  // not safe under concurrent React.
  const live = useRef({ attractor, band, colors });
  useEffect(() => {
    live.current = { attractor, band, colors };
  }, [attractor, band, colors]);

  useEffect(() => {
    const container = mount.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    // Capped rather than pinned. On a 1x display the vendor renders 4x the pixels it needs.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.35, 0.5, 0);
    composer.addPass(bloom);

    const tubes = Array.from({ length: tubeCount }, (_, i) => {
      const points = Array.from(
        { length: POINTS_PER_TUBE },
        () => new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4, 0)
      );
      const curve = new THREE.CatmullRomCurve3(points);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colors[i % colors.length]),
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      });
      const geometry = new THREE.TubeGeometry(
        curve,
        TUBULAR_SEGMENTS,
        0.012 + Math.random() * 0.03,
        RADIAL_SEGMENTS,
        false
      );
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      return {
        mesh,
        curve,
        points,
        material,
        radius: geometry.parameters.radius,
        lag: 0.16 + (i / tubeCount) * 0.2,
        phase: Math.random() * Math.PI * 2,
        // Each tube orbits its own offset from the shared target. Without this the
        // whole field collapses onto one line and reads as a single beam.
        orbit: {
          radius: 0.28 + Math.random() * 0.72,
          speedX: 0.22 + Math.random() * 0.38,
          speedY: 0.26 + Math.random() * 0.42,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
        },
        head: new THREE.Vector3(),
      };
    });

    const target = new THREE.Vector3(0, 0, 0);
    const pointer = { x: 0, y: 0, inside: false };
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const ndc = new THREE.Vector2();

    const toWorld = (clientX: number, clientY: number, out: THREE.Vector3) => {
      const rect = container.getBoundingClientRect();
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      raycaster.ray.intersectPlane(plane, out);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.inside = true;
    };
    const onPointerLeave = () => {
      pointer.inside = false;
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloom.resolution.set(w, h);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    let visible = true;
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    visibility.observe(container);

    const cursorWorld = new THREE.Vector3();
    const attractWorld = new THREE.Vector3();
    const clock = new THREE.Clock();
    let frame = 0;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;

      const elapsed = clock.getElapsedTime();
      const { attractor: attract, band: bandAmount } = live.current;
      const speed = reduced ? 0.35 : 1;

      if (pointer.inside) {
        toWorld(pointer.x, pointer.y, cursorWorld);
        target.lerp(cursorWorld, 0.12 * speed);
      } else {
        // Idle: a slow Lissajous orbit so the field never sits still.
        target.lerp(
          new THREE.Vector3(Math.cos(elapsed * 0.4) * 2.2, Math.sin(elapsed * 0.8) * 1.2, 0),
          0.05 * speed
        );
      }

      // A DOM element can claim the field — this is what makes the menu tether work.
      if (attract && attract.strength > 0) {
        toWorld(attract.x, attract.y, attractWorld);
        target.lerp(attractWorld, attract.strength * 0.3);
      }

      tubes.forEach((tube) => {
        const pts = tube.points;
        const { orbit } = tube;

        // Head chases the shared target plus a personal orbit, so the tubes braid
        // around each other instead of stacking on one path.
        tube.head.set(
          target.x + Math.cos(elapsed * orbit.speedX * speed + orbit.phaseX) * orbit.radius,
          target.y + Math.sin(elapsed * orbit.speedY * speed + orbit.phaseY) * orbit.radius,
          Math.sin(elapsed * 0.4 * speed + tube.phase) * 0.5
        );

        for (let i = pts.length - 1; i > 0; i--) {
          pts[i].lerp(pts[i - 1], tube.lag);
        }
        pts[0].lerp(tube.head, 0.22 * speed);

        if (bandAmount > 0) {
          pts.forEach((p, i) => {
            const bandY = Math.sin(i * 0.6 + tube.phase) * 0.12;
            p.y += (bandY - p.y) * bandAmount * 0.35;
            p.x += ((i / pts.length - 0.5) * 9 - p.x) * bandAmount * 0.2;
          });
        }

        tube.curve.points = pts;
        const next = new THREE.TubeGeometry(
          tube.curve,
          TUBULAR_SEGMENTS,
          tube.radius,
          RADIAL_SEGMENTS,
          false
        );
        tube.mesh.geometry.dispose();
        tube.mesh.geometry = next;
      });

      composer.render();
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      tubes.forEach((tube) => {
        tube.mesh.geometry.dispose();
        tube.material.dispose();
      });
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [tubeCount, colors]);

  return <div ref={mount} className={`h-full w-full ${className}`} />;
}
