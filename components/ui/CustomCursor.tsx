// components/ui/CustomCursor.tsx
"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

type Variant = "default" | "link";

export default function CustomCursor() {
  const [isMounted, setIsMounted] = useState(false);
  const [variant, setVariant] = useState<Variant>("default");

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // spring gives us that “laggy trail” feeling
  const smoothX = useSpring(cursorX, { stiffness: 200, damping: 25, mass: 0.4 });
  const smoothY = useSpring(cursorY, { stiffness: 200, damping: 25, mass: 0.4 });

  useEffect(() => {
    setIsMounted(true);

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const isInteractive = target?.closest(
        "a, button, [data-cursor='link']"
      );
      setVariant(isInteractive ? "link" : "default");
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", handleOver);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", handleOver);
    };
  }, [cursorX, cursorY]);

  if (!isMounted) return null;

  const size = variant === "link" ? 90 : 60;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden md:block"
      style={{
        x: smoothX,
        y: smoothY,
        translateX: -size / 2,
        translateY: -size / 2,
      }}
    >
      {/* single blurred green shade */}
      <motion.div
        className="rounded-full"
        animate={{
          width: size,
          height: size,
          background:
            "radial-gradient(circle, rgba(164,232,132,0.7) 0%, rgba(123,174,68,0.35) 35%, rgba(5,5,5,0) 70%)",
          boxShadow:
            variant === "link"
              ? "0 0 45px rgba(123,174,68,0.9)"
              : "0 0 30px rgba(123,174,68,0.65)",
          scale: variant === "link" ? 1.1 : 1,
        }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      />
    </motion.div>
  );
}