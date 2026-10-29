import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * Branching-path mark: one trunk (the student) splits into programme paths,
 * and the highlighted end is the best fit. Draws itself once on first load.
 */
export function LogoMark({ className }: { className?: string }) {
  const gradientId = `${useId()}-logo-gradient`;
  const gradient = `url(#${gradientId})`;

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      strokeLinecap="round"
      strokeWidth={2.4}
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="4"
          y1="24"
          x2="28"
          y2="6"
          gradientUnits="userSpaceOnUse"
        >
          <stop style={{ stopColor: "var(--brand-violet)" }} />
          <stop offset="1" style={{ stopColor: "var(--brand-orchid)" }} />
        </linearGradient>
      </defs>

      {/* Other paths */}
      <path
        d="M12 16H25"
        pathLength={1}
        className="logo-path stroke-brand-periwinkle/60 [--d:0.3s]"
      />
      <path
        d="M12 16C18 16 18 25 25 25"
        pathLength={1}
        className="logo-path stroke-brand-periwinkle/60 [--d:0.3s]"
      />
      <circle cx="25" cy="16" r="1.8" className="logo-dot fill-brand-periwinkle/70 [--d:0.75s]" />
      <circle cx="25" cy="25" r="1.8" className="logo-dot fill-brand-periwinkle/70 [--d:0.75s]" />

      {/* Trunk and best-fit path */}
      <circle cx="4.5" cy="16" r="2.3" style={{ fill: "var(--brand-violet)" }} />
      <path d="M4.5 16H12" pathLength={1} stroke={gradient} className="logo-path" />
      <path
        d="M12 16C18 16 18 7 25 7"
        pathLength={1}
        stroke={gradient}
        className="logo-path [--d:0.45s]"
      />
      <g className="logo-dot-best [--d:0.95s]">
        <circle cx="25" cy="7" r="4.8" className="fill-brand-orchid/25" />
        <circle cx="25" cy="7" r="2.8" fill={gradient} />
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-10 place-items-center rounded-xl border border-white/80 bg-white/70 shadow-[inset_0_1px_0_rgb(255_255_255),0_4px_12px_-4px_rgb(108_43_217/0.35)]">
        <LogoMark className="size-[1.875rem]" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-foreground text-[1.2rem] font-bold tracking-[-0.02em]">
          PathFinder
        </span>
        <span className="text-muted-foreground mt-1 text-xs font-semibold tracking-[0.04em]">
          FCSIT
        </span>
      </span>
    </span>
  );
}
