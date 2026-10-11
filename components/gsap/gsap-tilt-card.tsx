"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";

interface GsapTiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum rotation angle in degrees (default: 8)
  scale?: number; // Scale on hover (default: 1.015)
  perspective?: number; // Perspective distance in px (default: 1000)
  glare?: boolean;
  onClick?: () => void;
}

export function GsapTiltCard({
  children,
  className = "",
  maxTilt = 7,
  scale = 1.012,
  perspective = 1000,
  glare = true,
  onClick,
}: GsapTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof window === "undefined") return;

    // Direct hardware setters for buttery 120fps motion
    const rotateXTo = gsap.quickTo(card, "rotateX", {
      duration: 0.35,
      ease: "power2.out",
    });
    const rotateYTo = gsap.quickTo(card, "rotateY", {
      duration: 0.35,
      ease: "power2.out",
    });
    const scaleTo = gsap.quickTo(card, "scale", {
      duration: 0.35,
      ease: "power2.out",
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width) * 2 - 1; // -1 to +1
      const normY = (y / rect.height) * 2 - 1; // -1 to +1

      rotateYTo(normX * maxTilt);
      rotateXTo(-normY * maxTilt);
      scaleTo(scale);

      if (glare && glareRef.current) {
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glareRef.current.style.background = `radial-gradient(circle 180px at ${glareX}% ${glareY}%, rgba(212, 255, 0, 0.08), transparent 70%)`;
        glareRef.current.style.opacity = "1";
      }
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.65,
        ease: "power3.out",
        overwrite: "auto",
      });

      if (glare && glareRef.current) {
        gsap.to(glareRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      }
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      gsap.killTweensOf(card);
    };
  }, [maxTilt, scale, glare]);

  return (
    <div
      style={{ perspective: `${perspective}px` }}
      className="relative will-change-transform"
      onClick={onClick}
    >
      <div
        ref={cardRef}
        style={{ transformStyle: "preserve-3d" }}
        className={`relative overflow-hidden transition-shadow duration-300 ${className}`}
      >
        {glare && (
          <div
            ref={glareRef}
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 z-20"
          />
        )}
        {children}
      </div>
    </div>
  );
}
