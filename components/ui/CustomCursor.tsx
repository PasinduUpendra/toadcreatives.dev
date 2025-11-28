// FILE: components/ui/CustomCursor.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorVariant = "default" | "magnet" | "press";

const CustomCursor: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState<CursorVariant>("default");
  const [isPointerDevice, setIsPointerDevice] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Smooth follower
  const fx = useSpring(x, { stiffness: 220, damping: 22, mass: 0.6 });
  const fy = useSpring(y, { stiffness: 220, damping: 22, mass: 0.6 });

  // Enable only on non-touch devices
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasTouch =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (!hasTouch) setIsPointerDevice(true);
  }, []);

  useEffect(() => {
    if (!isPointerDevice) return;
    if (typeof window === "undefined") return;

    const handleMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleLeave = () => {
      setVisible(false);
    };

    const handleDown = () => {
      setVariant((current) => (current === "magnet" ? "magnet" : "press"));
    };

    const handleUp = () => {
      setVariant((current) => (current === "press" ? "default" : current));
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const magnetEl = target?.closest("[data-cursor='magnet']");
      if (magnetEl) {
        setVariant((current) =>
          current === "press" ? "press" : "magnet"
        );
      } else {
        setVariant((current) =>
          current === "press" ? "press" : "default"
        );
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    document.addEventListener("mouseover", handleOver);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.removeEventListener("mouseover", handleOver);
    };
  }, [isPointerDevice, visible, x, y]);

  if (!isPointerDevice) return null;

  // Cursor styling per variant
  const outerStyles = (() => {
    switch (variant) {
      case "magnet":
        return {
          size: 44,
          border: "rgba(180, 255, 140, 0.9)",
          glow: "0 0 40px rgba(183, 244, 101, 0.45)",
          opacity: 0.95,
        };
      case "press":
        return {
          size: 26,
          border: "rgba(200, 255, 200, 0.9)",
          glow: "0 0 30px rgba(183, 244, 101, 0.6)",
          opacity: 1,
        };
      default:
        return {
          size: 30,
          border: "rgba(183, 244, 101, 0.65)",
          glow: "0 0 30px rgba(183, 244, 101, 0.35)",
          opacity: 0.85,
        };
    }
  })();

  const innerStyles = (() => {
    switch (variant) {
      case "magnet":
        return {
          size: 6,
          opacity: 0.35,
        };
      case "press":
        return {
          size: 6,
          opacity: 0.0,
        };
      default:
        return {
          size: 8,
          opacity: 0.5,
        };
    }
  })();

  return (
    <>
      {/* Outer ring / glow */}
      <motion.div
        className="pointer-events-none fixed z-[9998] hidden md:block mix-blend-screen"
        style={{
          x: fx,
          y: fy,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: outerStyles.size,
          height: outerStyles.size,
          borderRadius: outerStyles.size,
          borderWidth: 1,
          borderColor: outerStyles.border,
          boxShadow: outerStyles.glow,
          opacity: visible ? outerStyles.opacity : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 22,
          mass: 0.8,
        }}
      />

      {/* Inner core */}
      <motion.div
        className="pointer-events-none fixed z-[9999] hidden md:block mix-blend-screen bg-lime-300"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: innerStyles.size,
          height: innerStyles.size,
          borderRadius: innerStyles.size,
          opacity: visible ? innerStyles.opacity : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 25,
          mass: 0.6,
        }}
      />
    </>
  );
};

export default CustomCursor;