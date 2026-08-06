"use client";

import { useEffect, useRef, useState } from "react";
import { displayFont } from "@/app/fonts";
import BehaviourField from "@/components/visuals/tube/BehaviourField";
import { BEHAVIOR_META, type BehaviorId } from "@/components/visuals/tube/behaviors";

const NAV_ITEMS = ["About", "Work", "Contact"];

export default function TubeBehaviours() {
  const [behavior, setBehavior] = useState<BehaviorId>("comb");
  const [formation, setFormation] = useState(0);
  const [hovered, setHovered] = useState(-1);
  const raf = useRef(0);

  // LabShell keys each demo on replayKey, so Replay already remounts this and
  // resets state; an explicit reset effect would just be a second render.

  // Formation only means anything to `morph`, so it is cleared where the
  // behaviour is chosen rather than inside an effect that would re-render.
  const chooseBehavior = (next: BehaviorId) => {
    setBehavior(next);
    if (next !== "morph") setFormation(0);
  };

  // `morph` needs a formation value to drive; cycle it so the assemble/release
  // beat plays on its own rather than needing a scroll to exist yet.
  useEffect(() => {
    cancelAnimationFrame(raf.current);
    if (behavior !== "morph") return;
    const start = performance.now();
    const loop = () => {
      const t = ((performance.now() - start) / 1000) % 6;
      const eased = t < 2 ? t / 2 : t < 4.5 ? 1 : 1 - (t - 4.5) / 1.5;
      setFormation(Math.max(0, Math.min(1, eased)));
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [behavior]);

  const meta = BEHAVIOR_META.find((b) => b.id === behavior)!;
  const showsAnchors = behavior === "field" || behavior === "route";

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050505]">
      <div className="absolute inset-0">
        <BehaviourField
          behavior={behavior}
          formation={formation}
          glyphText="TOAD"
          anchorSelector={showsAnchors ? "[data-tube-anchor]" : undefined}
          // A wordmark needs far more strokes to be legible than a cursor tail does.
          strandCount={behavior === "morph" ? 40 : behavior === "curl" ? 14 : 10}
          pointsPerStrand={behavior === "morph" ? 8 : 14}
        />
      </div>

      {/* Headline sits mid-stack so `weave` has something to thread through. */}
      {behavior === "weave" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <h2
            className={`${displayFont.className} text-[clamp(3rem,11vw,8rem)] font-extrabold tracking-tighter text-white`}
            style={{ mixBlendMode: "difference" }}
          >
            TOAD
          </h2>
        </div>
      )}

      {showsAnchors && (
        <div className="absolute inset-y-0 right-8 flex flex-col justify-center gap-4">
          {NAV_ITEMS.map((label, i) => (
            <button
              key={label}
              type="button"
              data-tube-anchor
              data-anchor-active={hovered === i ? "true" : "false"}
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered(-1)}
              className={`rounded-full border px-5 py-2 text-right font-mono text-[0.6rem] uppercase tracking-[0.2em] transition-colors ${
                hovered === i
                  ? "border-lime-300 bg-lime-300/15 text-lime-200"
                  : "border-white/20 text-neutral-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
        <div className="pointer-events-auto flex flex-wrap gap-1.5">
          {BEHAVIOR_META.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => chooseBehavior(b.id)}
              aria-pressed={behavior === b.id}
              className={`rounded-full border px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.14em] transition-colors ${
                behavior === b.id
                  ? "border-lime-300 bg-lime-300 text-black"
                  : "border-white/15 bg-black/50 text-neutral-400 backdrop-blur hover:border-white/40 hover:text-white"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
        <p className="mt-3 font-mono text-[0.6rem] tracking-[0.08em] text-lime-300/90">{meta.hint}</p>
      </div>
    </div>
  );
}
