/**
 * Static logo for generated images (link previews, app icons). It mirrors the branching-path
 * mark in logo.tsx, with plain colours because image generation has no CSS variables or
 * animation. Keep the two in sync.
 */
export function LogoImage({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="path" x1="4" y1="24" x2="28" y2="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6c2bd9" />
          <stop offset="1" stopColor="#b44cf0" />
        </linearGradient>
      </defs>
      <g strokeLinecap="round" strokeWidth={2.6}>
        <path d="M12 16H25" stroke="#8b9bff" strokeOpacity={0.6} />
        <path d="M12 16C18 16 18 25 25 25" stroke="#8b9bff" strokeOpacity={0.6} />
        <circle cx="25" cy="16" r="1.8" fill="#8b9bff" fillOpacity={0.7} />
        <circle cx="25" cy="25" r="1.8" fill="#8b9bff" fillOpacity={0.7} />
        <circle cx="4.5" cy="16" r="2.3" fill="#6c2bd9" />
        <path d="M4.5 16H12" stroke="url(#path)" />
        <path d="M12 16C18 16 18 7 25 7" stroke="url(#path)" />
        <circle cx="25" cy="7" r="4.8" fill="#b44cf0" fillOpacity={0.25} />
        <circle cx="25" cy="7" r="2.8" fill="url(#path)" />
      </g>
    </svg>
  );
}
