---
name: design-taste-frontend
description: Anti-slop frontend skill for landing pages, SaaS apps, and redesigns. Enforces deliberate aesthetic direction, typography hierarchy, visual density dials, and anti-default discipline.
---

# Taste Skill: Anti-Slop Frontend Framework

## 0. Brief Inference & Aesthetic Direction
Before touching code or layout:
1. **Infer the design direction:** Understand the intended vibe (sleek, minimal, luxury, Linear-like, Apple-like).
2. **Anti-Default Discipline:** Eliminate AI slop tells:
   - No generic purple-to-blue gradients
   - No cards nested within cards with identical borders
   - No cluttered status-chip soup
   - No gimmicky stickers or chaotic tape unless specifically an underground punk zine
   - For premium SaaS: Embrace generous breathing room, intentional hierarchy, restrained accents, and precise 1px micro-borders.

## 1. Dials Configuration
- **DESIGN_VARIANCE (1-10):** Set to 5 for premium SaaS (balanced, structured, elegant).
- **MOTION_INTENSITY (1-10):** Set to 4 (subtle, refined spring physics, zero distracting infinite loops).
- **VISUAL_DENSITY (1-10):** Set to 3-4 (airy, luxurious padding, generous whitespace).

## 2. Layout & Spacing
- Use generous padding (`p-6` to `p-8` on desktop, `p-4` on mobile).
- High visual hierarchy: 1 primary hero metric, secondary actionable insights, tertiary context.
- Clean Bento-grid layouts with subtle contrast separation.
