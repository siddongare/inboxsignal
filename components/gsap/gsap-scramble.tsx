"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

const DEFAULT_CHARS = "01アイウエオカキサシスセソ<>[]{}_/\\*#+~=";

interface GsapScrambleTextProps {
  text: string;
  className?: string;
  scrambleOnHover?: boolean;
  triggerKey?: any; // Re-triggers animation when this key changes
  duration?: number;
  chars?: string;
  as?: React.ElementType;
}

export function GsapScrambleText({
  text,
  className = "",
  scrambleOnHover = true,
  triggerKey,
  duration = 0.8,
  chars = DEFAULT_CHARS,
  as: Component = "span",
}: GsapScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const isHovered = useRef(false);

  const scramble = useCallback(() => {
    if (typeof window === "undefined") return;

    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    const obj = { progress: 0 };
    const original = text;
    const charLen = original.length;

    tweenRef.current = gsap.to(obj, {
      progress: 1,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        const p = obj.progress;
        const resolvedCount = Math.floor(p * charLen);

        let output = "";
        for (let i = 0; i < charLen; i++) {
          if (original[i] === " " || original[i] === "\n") {
            output += original[i];
          } else if (i < resolvedCount) {
            output += original[i];
          } else {
            const randomChar = chars[Math.floor(Math.random() * chars.length)];
            output += randomChar;
          }
        }
        setDisplayText(output);
      },
      onComplete: () => {
        setDisplayText(original);
      },
    });
  }, [text, duration, chars]);

  useEffect(() => {
    scramble();
    return () => {
      if (tweenRef.current) tweenRef.current.kill();
    };
  }, [text, triggerKey, scramble]);

  const handleMouseEnter = () => {
    if (!scrambleOnHover || isHovered.current) return;
    isHovered.current = true;
    scramble();
  };

  const handleMouseLeave = () => {
    isHovered.current = false;
  };

  return (
    <Component
      className={`inline-block font-mono select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {displayText}
    </Component>
  );
}
