"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface GsapCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function GsapCounter({
  value,
  duration = 1.4,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: GsapCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const countObj = useRef({ val: 0 });
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    tweenRef.current = gsap.to(countObj.current, {
      val: value,
      duration,
      ease: "power3.out",
      onUpdate: () => {
        setDisplayValue(
          decimals > 0
            ? Number(countObj.current.val.toFixed(decimals))
            : Math.round(countObj.current.val)
        );
      },
      onComplete: () => {
        setDisplayValue(value);
      },
    });

    return () => {
      if (tweenRef.current) tweenRef.current.kill();
    };
  }, [value, duration, decimals]);

  return (
    <span className={`tabular-nums font-mono ${className}`}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
