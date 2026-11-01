"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";

import { cn } from "@/lib/utils";

const SIZE = 240;
const CENTER = SIZE / 2;
const POINTS = 120;

// Three ribbons (cyan, blue, violet), each a bundle of thin loops slightly out of phase.
// Deeper than neon so they still read on the light lavender page.
const RIBBONS = [
  { color: "#0891b2", phase: 0, opacity: 0.85 },
  { color: "#2563eb", phase: 2.1, opacity: 0.7 },
  { color: "#9333ea", phase: 4.2, opacity: 0.6 },
];
const STRANDS_PER_RIBBON = 7;
// Ring geometry: the innermost strand never dips below BASE_RADIUS - WOBBLE (79), which keeps
// it clear of the letters' corners (about 76 from the centre at LETTER_WIDTH).
const BASE_RADIUS = 92;
const WOBBLE = [7, 4, 2] as const;
const LETTER_WIDTH = "48%";
const LOOPS = RIBBONS.flatMap((ribbon, r) =>
  Array.from({ length: STRANDS_PER_RIBBON }, (_, s) => ({
    ...ribbon,
    radius: BASE_RADIUS + r * 2 + s * 1.2,
    offset: s * 0.07,
    opacity: ribbon.opacity * (0.4 + (s / STRANDS_PER_RIBBON) * 0.6),
  })),
);

function loopPath(loop: (typeof LOOPS)[number], t: number) {
  let d = "";
  for (let i = 0; i <= POINTS; i++) {
    const a = (i / POINTS) * Math.PI * 2;
    const r =
      loop.radius +
      WOBBLE[0] * Math.sin(3 * a + t * 0.55 + loop.phase + loop.offset) +
      WOBBLE[1] * Math.sin(5 * a - t * 0.8 + loop.phase * 0.6) +
      WOBBLE[2] * Math.sin(2 * a + t * 0.35 + loop.offset * 3);
    const x = CENTER + r * Math.cos(a);
    const y = CENTER + r * Math.sin(a);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${d}Z`;
}

/**
 * Decorative AI badge: the circuit letters from the header photo, ringed by glowing waves
 * that keep flowing. No frame or backdrop, so it sits straight on the page.
 */
export function AiEmblem({ className }: { className?: string }) {
  const id = useId();
  const paths = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      LOOPS.forEach((loop, i) => paths.current[i]?.setAttribute("d", loopPath(loop, t)));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div aria-hidden="true" className={cn("relative", className)}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full overflow-visible">
        <defs>
          <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={`${id}-core`}>
            <stop offset="0" stopColor="#38bdf8" stopOpacity="0.14" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={CENTER} cy={CENTER} r="78" fill={`url(#${id}-core)`} />

        <g filter={`url(#${id}-glow)`} fill="none" strokeWidth="0.8">
          {LOOPS.map((loop, i) => (
            <path
              key={i}
              ref={(node) => {
                paths.current[i] = node;
              }}
              d={loopPath(loop, 0)}
              stroke={loop.color}
              strokeOpacity={loop.opacity}
            />
          ))}
        </g>
      </svg>

      {/* Letters cut from public/assets/AI HEADER PHOTO.jpg, background keyed out. */}
      <Image
        src="/assets/ai-letters-v2.png"
        alt=""
        width={358}
        height={306}
        priority
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_6px_rgb(37_99_235/0.3)]"
        style={{ width: LETTER_WIDTH }}
      />
    </div>
  );
}
