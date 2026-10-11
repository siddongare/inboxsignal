"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";

export function GsapSignalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 180,
    };

    // Smooth mouse lerping via GSAP ticker / quickTo
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Node particle grid for cyber signal telemetry
    interface Node {
      x: number;
      y: number;
      originX: number;
      originY: number;
      vx: number;
      vy: number;
      size: number;
      baseAlpha: number;
      pulseOffset: number;
    }

    let nodes: Node[] = [];
    const spacing = 80;

    const initNodes = () => {
      nodes = [];
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = c * spacing;
          const y = r * spacing;
          nodes.push({
            x,
            y,
            originX: x,
            originY: y,
            vx: 0,
            vy: 0,
            size: (c + r) % 3 === 0 ? 1.5 : 1,
            baseAlpha: (c + r) % 4 === 0 ? 0.22 : 0.08,
            pulseOffset: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    initNodes();

    let clock = 0;

    const render = () => {
      clock += 0.02;

      // Smooth lerp mouse towards target
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Render subtle connection web near mouse
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Distance to mouse
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Physics reaction to cursor proximity
        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 12;
          const angle = Math.atan2(dy, dx);
          node.x = node.originX - Math.cos(angle) * force;
          node.y = node.originY - Math.sin(angle) * force;
        } else {
          node.x += (node.originX - node.x) * 0.1;
          node.y += (node.originY - node.y) * 0.1;
        }

        // Pulse alpha calculation
        const pulse = Math.sin(clock + node.pulseOffset) * 0.06;
        let alpha = node.baseAlpha + pulse;

        // Proximity glow
        if (dist < mouse.radius) {
          const proximityBoost = (1 - dist / mouse.radius) * 0.45;
          alpha += proximityBoost;

          // Draw small beam to mouse for closest nodes
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(212, 255, 0, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = dist < mouse.radius
          ? `rgba(212, 255, 0, ${Math.min(alpha, 0.7)})`
          : `rgba(255, 255, 255, ${Math.max(alpha, 0.05)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
      aria-hidden="true"
    />
  );
}
