"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";

interface GsapMagneticProps {
  children: React.ReactNode;
  strength?: number; // Distance multiplier (default: 0.35)
  className?: string;
  onClick?: () => void;
}

export function GsapMagnetic({
  children,
  strength = 0.35,
  className = "",
  onClick,
}: GsapMagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;

    // Fast mutable setters using GSAP quickTo for 120fps direct hardware interpolation
    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      xTo(deltaX);
      yTo(deltaY);
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1.1, 0.4)",
        overwrite: "auto",
      });
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      gsap.killTweensOf(el);
    };
  }, [strength]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`inline-block will-change-transform ${className}`}
      data-magnetic="true"
    >
      {children}
    </div>
  );
}
