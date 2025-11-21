"use client";
import { useScrollSteps } from "./ScrollProgressProvider";

export default function DebugSteps() {
  const { stepIndex, step, direction } = useScrollSteps();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        zIndex: 999999,
        padding: "10px 14px",
        background: "rgba(0,0,0,0.6)",
        borderRadius: 8,
        fontSize: 12,
        color: "white",
        pointerEvents: "none",
        fontFamily: "monospace",
      }}
    >
      <div>index: {stepIndex}</div>
      <div>step: {step}</div>
      <div>dir: {direction}</div>
    </div>
  );
}
