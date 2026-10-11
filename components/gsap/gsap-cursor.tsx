"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function GsapCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    // Only mount on desktop with fine mouse pointer
    if (
      typeof window === "undefined" ||
      window.matchMedia("(hover: none) or (pointer: coarse)").matches
    ) {
      return;
    }

    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    // Direct hardware setters
    const cursorX = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power2.out" });
    const cursorY = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power2.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.28, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.28, ease: "power3.out" });

    let isVisible = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) {
        isVisible = true;
        gsap.to([cursor, ring], { opacity: 1, duration: 0.3 });
      }

      cursorX(e.clientX);
      cursorY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);

      // Check if hovering over interactive element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("button") ||
          target.closest("a") ||
          target.closest("[data-magnetic]") ||
          target.closest("[data-cursor-expand]") ||
          target.closest("input") ||
          target.closest("textarea"))
      ) {
        setActive(true);
      } else {
        setActive(false);
      }
    };

    const handleMouseDown = () => {
      setClicked(true);
      gsap.to(cursor, { scale: 0.6, duration: 0.15 });
      gsap.to(ring, { scale: 1.4, borderColor: "#D4FF00", duration: 0.15 });
    };

    const handleMouseUp = () => {
      setClicked(false);
      gsap.to(cursor, { scale: 1, duration: 0.25, ease: "elastic.out(1.2, 0.4)" });
      gsap.to(ring, { scale: 1, duration: 0.3, ease: "power2.out" });
    };

    const handleMouseLeave = () => {
      isVisible = false;
      gsap.to([cursor, ring], { opacity: 0, duration: 0.3 });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      gsap.killTweensOf([cursor, ring]);
    };
  }, []);

  return (
    <>
      {/* Precision Core Dot */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 rounded-full bg-[#D4FF00] pointer-events-none z-[9999] opacity-0 mix-blend-difference shadow-[0_0_8px_#D4FF00]"
      />

      {/* Fluid Trailing Ring with Crosshair Indicators */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 pointer-events-none z-[9998] opacity-0 transition-transform duration-200 -ml-4 -mt-4 rounded-full border ${
          active
            ? "w-8 h-8 scale-150 border-[#D4FF00] bg-[#D4FF00]/10 shadow-[0_0_15px_rgba(212,255,0,0.3)] backdrop-blur-[1px]"
            : "w-8 h-8 border-white/30 bg-transparent"
        }`}
      />
    </>
  );
}
