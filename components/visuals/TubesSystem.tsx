"use client";

import { useEffect, useRef } from "react";
import { useTubesScrollState } from "@/components/system/useTubesScrollState";

const HERO_COLORS = ["#a8ff78", "#78ffd6", "#b7f465"];
const ABOUT_COLORS = ["#e0e0e0", "#d1f1ff", "#c8e6c9"];
const WORK_COLORS = ["#222222", "#333333", "#444444"];
const LIGHT_COLORS = ["#f5f4ee", "#f1ede1", "#dcd8c8"];
const TUBES_DEBUG = false;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpChannel(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function lerpHexColor(a: string, b: string, t: number): string {
  const na = a.replace("#", "");
  const nb = b.replace("#", "");
  if (na.length !== 6 || nb.length !== 6) return a;
  const ar = parseInt(na.slice(0, 2), 16);
  const ag = parseInt(na.slice(2, 4), 16);
  const ab = parseInt(na.slice(4, 6), 16);
  const br = parseInt(nb.slice(0, 2), 16);
  const bg = parseInt(nb.slice(2, 4), 16);
  const bb = parseInt(nb.slice(4, 6), 16);
  const r = lerpChannel(ar, br, t).toString(16).padStart(2, "0");
  const g = lerpChannel(ag, bg, t).toString(16).padStart(2, "0");
  const bch = lerpChannel(ab, bb, t).toString(16).padStart(2, "0");
  return `#${r}${g}${bch}`;
}

function lerpColorArray(a: string[], b: string[], t: number) {
  return a.map((c, i) => lerpHexColor(c, b[i % b.length], t));
}

declare global {
  interface Window {
    tubesControls?: {
      updateFromTimeline: (mode: string, segmentProgress: number) => void;
      updatePointer: (x: number, y: number, inside?: boolean) => void;
    };
  }
}

// Default export as required
export default function TubesSystem() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tubesRef = useRef<any | null>(null);
  const threeRefs = useRef<{
    camera?: any;
    scene?: any;
    renderer?: any;
    tubesGroup?: any;
  }>({});

  // Use the scroll state hook
  const {
    mode,
    segmentProgress,
    heroProgress,
    heroToAboutProgress,
    aboutProgress,
    aboutToWorkProgress,
    workProgress,
  } = useTubesScrollState();

  // Camera and tubes positions/scales for each mode
  const heroCameraPos = { x: 0, y: 0, z: 60 };
  const aboutLeftCameraPos = { x: -20, y: 0, z: 50 };
  const aboutRightCameraPos = { x: 20, y: 0, z: 50 };
  const workCameraPos = { x: 0, y: 0, z: 40 };

  const heroScale = 1.0;
  const aboutScale = 0.7;
  const workScale = 0.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let resizeHandler: (() => void) | null = null;

    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - keep vendor file out of Next.js bundler
        const mod = await import(
          /* webpackIgnore: true */
          "/vendor/tubes1.min.js"
        );
        if (disposed) return;

        const TubesCursorImpl = (mod as any).default ?? (mod as any);
        const instance = TubesCursorImpl(canvas, {
          tubes: {
            colors: HERO_COLORS,
          },
          lights: {
            intensity: 220,
          },
        });

        tubesRef.current = instance;
        // Save refs to three.js objects if available
        try {
          threeRefs.current.camera = instance?.camera;
          threeRefs.current.scene = instance?.scene;
          threeRefs.current.renderer = instance?.renderer;
          threeRefs.current.tubesGroup = instance?.tubes?.group;
        } catch (err) {
          // ignore
        }

        if (TUBES_DEBUG) {
          console.log("[TubesSystem] Tubes instance initialized (reset)", instance);
        }

        const handleResize = () => {
          instance?.resize?.();
        };
        window.addEventListener("resize", handleResize);
        resizeHandler = handleResize;
      } catch (err) {
        console.error("Failed to init TubesSystem", err);
      }
    })();

    return () => {
      disposed = true;
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
      }
      if (tubesRef.current?.dispose) {
        tubesRef.current.dispose();
      }
      tubesRef.current = null;
    };
  }, []);

  // Animation loop: update three.js scene based on scrollState
  useEffect(() => {
    let rafId: number | null = null;

    function animate() {
      const inst = tubesRef.current;
      if (!inst) {
        rafId = requestAnimationFrame(animate);
        return;
      }
      const { camera, tubesGroup } = threeRefs.current;

      // Camera position interpolation
      let camTarget = { ...heroCameraPos };
      let scaleTarget = heroScale;
      let colorTarget = HERO_COLORS;

      if (mode === "hero") {
        camTarget = { ...heroCameraPos };
        scaleTarget = heroScale;
        colorTarget = HERO_COLORS;
      } else if (mode === "heroToAbout") {
        camTarget = {
          x: lerp(heroCameraPos.x, aboutLeftCameraPos.x, segmentProgress),
          y: lerp(heroCameraPos.y, aboutLeftCameraPos.y, segmentProgress),
          z: lerp(heroCameraPos.z, aboutLeftCameraPos.z, segmentProgress),
        };
        scaleTarget = lerp(heroScale, aboutScale, segmentProgress);
        colorTarget = lerpColorArray(HERO_COLORS, ABOUT_COLORS, segmentProgress);
      } else if (mode === "aboutLeft") {
        camTarget = { ...aboutLeftCameraPos };
        scaleTarget = aboutScale;
        colorTarget = ABOUT_COLORS;
      } else if (mode === "aboutRight") {
        camTarget = {
          x: lerp(aboutLeftCameraPos.x, aboutRightCameraPos.x, segmentProgress),
          y: lerp(aboutLeftCameraPos.y, aboutRightCameraPos.y, segmentProgress),
          z: lerp(aboutLeftCameraPos.z, aboutRightCameraPos.z, segmentProgress),
        };
        scaleTarget = aboutScale;
        colorTarget = ABOUT_COLORS;
      } else if (mode === "aboutToWork") {
        camTarget = {
          x: lerp(aboutRightCameraPos.x, workCameraPos.x, segmentProgress),
          y: lerp(aboutRightCameraPos.y, workCameraPos.y, segmentProgress),
          z: lerp(aboutRightCameraPos.z, workCameraPos.z, segmentProgress),
        };
        scaleTarget = lerp(aboutScale, workScale, segmentProgress);
        colorTarget = lerpColorArray(ABOUT_COLORS, WORK_COLORS, segmentProgress);
      } else if (mode === "work") {
        camTarget = { ...workCameraPos };
        scaleTarget = workScale;
        colorTarget = WORK_COLORS;
      }

      // Animate camera position
      if (camera) {
        camera.position.x = lerp(camera.position.x, camTarget.x, 0.15);
        camera.position.y = lerp(camera.position.y, camTarget.y, 0.15);
        camera.position.z = lerp(camera.position.z, camTarget.z, 0.15);
        camera.lookAt(0, 0, 0);
      }

      // Animate tubes group scale
      if (tubesGroup && tubesGroup.scale) {
        const s = lerp(tubesGroup.scale.x, scaleTarget, 0.15);
        tubesGroup.scale.set(s, s, s);
      }

      // Animate tubes color
      if (inst.tubes?.setColors) {
        inst.tubes.setColors(colorTarget);
      }

      // Optionally, add subtle idle motion in hero mode
      if (mode === "hero" && camera) {
        const t = performance.now() * 0.0005;
        camera.position.x += Math.sin(t) * 0.05;
        camera.position.y += Math.cos(t) * 0.05;
      }

      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
    // Only re-run when scrollState changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, segmentProgress]);

  // Debug overlay for mode and segmentProgress
  return (
    <>
      <canvas
        ref={canvasRef}
        id="tubes-canvas"
        className="pointer-events-none fixed inset-0 z-[1]"
        aria-hidden="true"
      />
      <div className="pointer-events-none fixed bottom-4 right-4 z-[5] rounded-xl bg-black/70 px-3 py-2 text-xs text-white">
        <div>mode: {mode}</div>
        <div>segment: {segmentProgress.toFixed(2)}</div>
        <div>hero: {heroProgress.toFixed(2)}</div>
        <div>h→a: {heroToAboutProgress.toFixed(2)}</div>
        <div>about: {aboutProgress.toFixed(2)}</div>
        <div>a→w: {aboutToWorkProgress.toFixed(2)}</div>
        <div>work: {workProgress.toFixed(2)}</div>
      </div>
      {TUBES_DEBUG && (
        <div className="pointer-events-none fixed bottom-20 right-4 z-[6] rounded-xl bg-black/75 px-4 py-3 font-mono text-[11px] leading-relaxed text-white shadow-lg shadow-black/40">
          <div>hero {heroProgress.toFixed(3)}</div>
          <div>heroToAbout {heroToAboutProgress.toFixed(3)}</div>
          <div>about {aboutProgress.toFixed(3)}</div>
          <div>aboutToWork {aboutToWorkProgress.toFixed(3)}</div>
          <div>work {workProgress.toFixed(3)}</div>
        </div>
      )}
    </>
  );
}
