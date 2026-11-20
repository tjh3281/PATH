"use client";

import { ArrowRight, X } from "lucide-react";
import { AnimatePresence, motion, MotionConfig, type Transition } from "motion/react";
import { useEffect, useId, useMemo, useState } from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ProfileSlice, ProgrammeCourse } from "@/lib/programme-profile";
import { cn } from "@/lib/utils";

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 92;
const STROKE = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3;
// Room around the ring for the blurred glow, so neither the mask nor the filter clips it.
const BLEED = 60;

// Topics below this share are folded into a single "Others" slice to keep the legend short.
const OTHERS_BELOW = 0.05;
const OTHERS_ID = "others";
const OTHERS_COLOR = "#a29bbf";

const MORPH: Transition = { type: "spring", bounce: 0.18, duration: 0.6 };

const percent = (share: number) => `${Math.round(share * 100)}%`;
const tint = (color: string, amount: number) => `color-mix(in oklab, ${color} ${amount}%, white)`;
const shade = (color: string, amount: number) => `color-mix(in oklab, ${color} ${amount}%, black)`;

type TopicCourse = ProgrammeCourse & { topic: string; topicColor: string };

/** A slice as the explorer shows it: a single topic, or "Others" grouping the small ones. */
type TopicSlice = {
  id: string;
  name: string;
  color: string;
  count: number;
  share: number;
  courses: TopicCourse[];
  /** Topics folded into this slice; only set on "Others". */
  members?: { name: string; color: string }[];
};

function toTopicSlices(slices: ProfileSlice[]): TopicSlice[] {
  const asTopic = (slice: ProfileSlice): TopicSlice => ({
    id: slice.label.id,
    name: slice.label.name,
    color: slice.label.color,
    count: slice.count,
    share: slice.share,
    courses: slice.courses.map((course) => ({
      ...course,
      topic: slice.label.name,
      topicColor: slice.label.color,
    })),
  });

  const major = slices.filter((slice) => slice.share >= OTHERS_BELOW);
  const minor = slices.filter((slice) => slice.share < OTHERS_BELOW);
  if (minor.length < 2) return slices.map(asTopic);

  const others = minor.map(asTopic);
  return [
    ...major.map(asTopic),
    {
      id: OTHERS_ID,
      name: "Others",
      color: OTHERS_COLOR,
      count: others.reduce((sum, slice) => sum + slice.count, 0),
      share: others.reduce((sum, slice) => sum + slice.share, 0),
      courses: others.flatMap((slice) => slice.courses),
      members: others.map((slice) => ({ name: slice.name, color: slice.color })),
    },
  ];
}

/** Background for a slice's swatch: its own colour, or a blend of the topics inside "Others". */
const swatch = (slice: TopicSlice) =>
  slice.members
    ? `conic-gradient(${slice.members.map((member) => member.color).join(", ")}, ${slice.members[0].color})`
    : `linear-gradient(135deg, ${tint(slice.color, 55)}, ${slice.color})`;

export function TopicExplorer({ total, slices }: { total: number; slices: ProfileSlice[] }) {
  const shapeId = useId();
  const topics = useMemo(() => toTopicSlices(slices), [slices]);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Colour of the last opened topic, so the shape can morph back out of it.
  const [lastColor, setLastColor] = useState<string | null>(null);

  const selected = topics.find((slice) => slice.id === selectedId);

  const select = (id: string | null) => {
    if (id) setLastColor(topics.find((slice) => slice.id === id)!.color);
    setSelectedId(id);
    setHoverId(null);
  };

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-8">
        {/* As tall as the donut, so swapping it for a course list doesn't resize the card.
            Top-aligned: a long course list must not push the donut down out of view. */}
        <div className="relative flex min-h-72 items-start justify-center sm:min-h-[22rem]">
          <AnimatePresence mode="popLayout" initial={false}>
            {selected ? (
              <CourseGrid key={`courses-${selected.id}`} slice={selected} />
            ) : (
              <motion.div
                key="donut"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, transition: { ...MORPH, delay: 0.1 } }}
                exit={{ opacity: 0, scale: 0.55, transition: { duration: 0.3 } }}
                className="relative size-72 sm:size-[22rem]"
              >
                <motion.div
                  layoutId={shapeId}
                  transition={MORPH}
                  initial={lastColor ? { opacity: 1 } : false}
                  animate={{ opacity: 0, transition: { duration: 0.5, delay: 0.15 } }}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    borderRadius: 176,
                    background: lastColor ? tint(lastColor, 22) : "none",
                  }}
                />
                <DonutRing
                  total={total}
                  slices={topics}
                  activeId={hoverId}
                  onHover={setHoverId}
                  onSelect={select}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Two columns read top to bottom on tablets; one column beside the stage on desktop,
            centred against the donut's height so it stays put when a course list opens.
            Rows bleed 0.75rem past the column so their dots and arrows sit on the card's
            content edges while the hover background has room around them. */}
        <div className="lg:flex lg:h-[22rem] lg:items-center">
          <ul
            className="-mx-3 grid min-w-0 flex-1 content-start gap-1 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-[repeat(var(--rows),auto)] sm:gap-x-4 lg:grid-flow-row lg:grid-cols-1 lg:grid-rows-none"
            style={{ "--rows": Math.ceil(topics.length / 2) } as React.CSSProperties}
          >
            {topics.map((slice, index) => {
              const { id, color, name } = slice;
              const isSelected = id === selectedId;
              const isHovered = id === hoverId && !selectedId;
              const Icon = isSelected ? X : ArrowRight;
              return (
                <li key={id}>
                  <motion.button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => select(isSelected ? null : id)}
                    onMouseEnter={() => !selectedId && setHoverId(id)}
                    onMouseLeave={() => setHoverId(null)}
                    onFocus={() => !selectedId && setHoverId(id)}
                    onBlur={() => setHoverId(null)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="group focus-visible:outline-ring relative flex h-9 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left focus-visible:outline-2"
                    style={{ "--i": index, "--swatch": color } as React.CSSProperties}
                  >
                    {isSelected ? (
                      <motion.span
                        layoutId={shapeId}
                        transition={MORPH}
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                          borderRadius: 12,
                          background: `linear-gradient(135deg, ${tint(color, 28)}, ${tint(color, 12)})`,
                          border: `1px solid ${tint(color, 45)}`,
                          boxShadow: `0 10px 24px -12px ${color}`,
                        }}
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-0 rounded-xl transition-[background-color,box-shadow] duration-200",
                          isHovered
                            ? "bg-white/80 shadow-[0_4px_14px_-6px_rgb(76_29_149/0.35)]"
                            : "group-hover:bg-white/60",
                        )}
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className="topic-hint-swatch relative size-3 shrink-0 rounded-full ring-2 ring-white/80 transition-transform duration-200 group-hover:scale-125"
                      style={{ background: swatch(slice) }}
                    />
                    <span className="relative flex min-w-0 flex-1 items-baseline gap-2">
                      <span className="truncate text-sm font-medium">{name}</span>
                      {slice.members && (
                        <span className="text-muted-foreground shrink-0 text-xs">
                          {slice.members.length} topics
                        </span>
                      )}
                    </span>
                    <span className="relative text-sm font-semibold tabular-nums">
                      {percent(slice.share)}
                    </span>
                    {/* Always there, quietly, so every row ends on the same edge; it comes to
                      full colour and bounces on hover. The wrapper carries the one-time hint
                      and the icon inside bounces, so leaving a row doesn't replay the hint. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "relative shrink-0 transition-opacity duration-200",
                        isSelected
                          ? "opacity-100"
                          : "topic-hint-chevron opacity-35 group-hover:opacity-100 group-focus-visible:opacity-100",
                      )}
                      style={{ color: isSelected ? shade(color, 70) : shade(color, 85) }}
                    >
                      <Icon className={cn("size-4", !isSelected && "topic-arrow")} />
                    </span>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </MotionConfig>
  );
}

function DonutRing({
  total,
  slices,
  activeId,
  onHover,
  onSelect,
}: {
  total: number;
  slices: TopicSlice[];
  activeId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const id = useId();
  const active = slices.find((slice) => slice.id === activeId);

  const arcs = slices.map((slice, index) => ({
    slice,
    dash: Math.max(slice.share * CIRCUMFERENCE - GAP, 0.5),
    offset: slices.slice(0, index).reduce((sum, s) => sum + s.share, 0) * CIRCUMFERENCE,
  }));

  const summary = slices.map((slice) => `${slice.name} ${percent(slice.share)}`).join(", ");

  return (
    <>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Topic mix: ${summary}`}
        className="relative size-full overflow-visible"
      >
        <defs>
          {slices.map((slice) => (
            <linearGradient
              key={slice.id}
              id={`${id}-${slice.id}`}
              x1="0"
              y1="0"
              x2={SIZE}
              y2={SIZE}
              gradientUnits="userSpaceOnUse"
            >
              {slice.members ? (
                // "Others" carries a quiet blend of the topics folded into it.
                slice.members.map((member, i) => (
                  <stop
                    key={member.name}
                    offset={i / Math.max(slice.members!.length - 1, 1)}
                    style={{ stopColor: tint(member.color, 60) }}
                  />
                ))
              ) : (
                <>
                  <stop style={{ stopColor: tint(slice.color, 55) }} />
                  <stop offset="1" style={{ stopColor: slice.color }} />
                </>
              )}
            </linearGradient>
          ))}
          <filter
            id={`${id}-glow`}
            filterUnits="userSpaceOnUse"
            x={-BLEED}
            y={-BLEED}
            width={SIZE + BLEED * 2}
            height={SIZE + BLEED * 2}
          >
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <mask
            id={`${id}-sweep`}
            maskUnits="userSpaceOnUse"
            x={-BLEED}
            y={-BLEED}
            width={SIZE + BLEED * 2}
            height={SIZE + BLEED * 2}
          >
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="white"
              strokeWidth={STROKE + BLEED * 1.4}
              pathLength={1}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
              className="donut-sweep"
            />
          </mask>
        </defs>

        {/* Frosted track the segments sit in */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="rgb(255 255 255 / 0.55)"
          strokeWidth={STROKE + 8}
        />

        <g mask={`url(#${id}-sweep)`} transform={`rotate(-90 ${CENTER} ${CENTER})`}>
          {/* Soft coloured glow under the ring */}
          <g filter={`url(#${id}-glow)`} opacity={0.45} aria-hidden="true">
            {arcs.map(({ slice, dash, offset }) => (
              <circle
                key={slice.id}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth={STROKE}
                strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
                strokeDashoffset={-offset}
              />
            ))}
          </g>

          {arcs.map(({ slice, dash, offset }) => {
            const isActive = slice.id === activeId;
            return (
              <circle
                key={slice.id}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={`url(#${id}-${slice.id})`}
                strokeWidth={isActive ? STROKE + 8 : STROKE}
                strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
                strokeDashoffset={-offset}
                opacity={activeId && !isActive ? 0.3 : 1}
                className="cursor-pointer transition-[stroke-width,opacity] duration-200"
                onMouseEnter={() => onHover(slice.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onSelect(slice.id)}
              />
            );
          })}
        </g>

        {/* Glass centre and a thin highlight along the ring's upper-left edge */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS - STROKE / 2 - 8}
          fill="rgb(255 255 255 / 0.6)"
          stroke="rgb(255 255 255 / 0.9)"
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS + STROKE / 2 - 2}
          fill="none"
          stroke="rgb(255 255 255 / 0.7)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE * 0.16} ${CIRCUMFERENCE}`}
          transform={`rotate(200 ${CENTER} ${CENTER})`}
          pointerEvents="none"
        />
      </svg>

      <div
        aria-live="polite"
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
      >
        {active ? (
          <>
            <span
              className="font-heading text-5xl font-bold tracking-tight"
              style={{ color: active.members ? shade(active.color, 75) : active.color }}
            >
              {percent(active.share)}
            </span>
            <span className="mt-1 max-w-32 text-sm leading-tight font-semibold">{active.name}</span>
            <span className="text-muted-foreground mt-0.5 text-xs">
              {active.count} {active.count === 1 ? "course" : "courses"}
            </span>
          </>
        ) : (
          <>
            <span className="font-heading text-5xl font-bold tracking-tight">{total}</span>
            <span className="text-muted-foreground mt-0.5 text-sm">courses</span>
          </>
        )}
      </div>
    </>
  );
}

function CourseGrid({ slice }: { slice: TopicSlice }) {
  const grouped = Boolean(slice.members);

  return (
    <TooltipProvider delay={120}>
      <motion.ul
        aria-label={`${slice.name} courses`}
        initial="hidden"
        animate="shown"
        exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
        variants={{ shown: { transition: { staggerChildren: 0.035, delayChildren: 0.15 } } }}
        className="grid w-full content-start gap-2 self-start sm:grid-cols-2"
      >
        {slice.courses.map((course) => (
          <motion.li
            key={course.code}
            variants={{ hidden: { opacity: 0, y: 10 }, shown: { opacity: 1, y: 0 } }}
            transition={MORPH}
          >
            <Tooltip>
              <TooltipTrigger
                render={<div tabIndex={0} />}
                className="focus-visible:outline-ring border-border relative flex h-full cursor-default flex-col gap-1.5 overflow-hidden rounded-2xl border bg-white/60 py-3 pr-3.5 pl-4.5 transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-white/90 hover:shadow-[0_8px_20px_-12px_rgb(76_29_149/0.4)] focus-visible:outline-2"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-3 left-0 w-1 rounded-r-full"
                  style={{
                    background: `linear-gradient(${tint(course.topicColor, 50)}, ${course.topicColor})`,
                  }}
                />
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[0.6875rem] font-semibold tabular-nums">
                    {course.code}
                  </span>
                  {course.elective && (
                    <span
                      className="rounded-full px-1.5 py-px text-[0.625rem] font-semibold"
                      style={{
                        background: tint(course.topicColor, 16),
                        color: shade(course.topicColor, 70),
                      }}
                    >
                      Elective
                    </span>
                  )}
                  <span className="text-muted-foreground ml-auto text-xs font-medium whitespace-nowrap">
                    {course.credits} credits
                  </span>
                </span>
                <span className="text-sm leading-snug font-medium">{course.name}</span>
                {grouped && (
                  <span
                    className="text-[0.6875rem] font-medium"
                    style={{ color: shade(course.topicColor, 70) }}
                  >
                    {course.topic}
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-64">
                {course.summary}
              </TooltipContent>
            </Tooltip>
          </motion.li>
        ))}
      </motion.ul>
    </TooltipProvider>
  );
}
