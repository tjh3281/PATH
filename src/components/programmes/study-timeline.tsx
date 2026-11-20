"use client";

import { Briefcase, Check, GraduationCap, Plus, RotateCcw, X } from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type {
  ElectiveOption,
  ElectiveOptions,
  PlannedElectives,
  PlannedSemester,
  PlannedYear,
  StudyPlan,
} from "@/lib/study-plan";
import { cn } from "@/lib/utils";

// The card pins just below the sticky site header.
const PIN_TOP = 96;
// Scroll distance that hands over from one year to the next.
const SCROLL_PER_YEAR = "85vh";
// Height of the pinned card: fits the fullest semester (Data Science, Year 3) with no dead space.
const CARD_HEIGHT = "32rem";

const tint = (color: string, amount: number) => `color-mix(in oklab, ${color} ${amount}%, white)`;
const shade = (color: string, amount: number) => `color-mix(in oklab, ${color} ${amount}%, black)`;
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

type Selections = Record<string, string[]>;
type ElectiveProps = {
  options: ElectiveOptions;
  selections: Selections;
  chosenInPool: (pool: PlannedElectives["pool"]) => Set<string>;
  onChoose: (id: string, code: string) => void;
  onRemove: (id: string, code: string) => void;
};

const slotId = (year: number, semester: number, pool: PlannedElectives["pool"]) =>
  `${year}-${semester}-${pool}`;

// ---------------------------------------------------------------------------------------------
// Elective picks: a per-viewer convenience, kept in this browser only.

const CHANGE_EVENT = "pathfinder:electives";
const memory = new Map<string, string>();

function useElectiveSelections(slug: string) {
  const key = `pathfinder:electives:${slug}`;
  const raw = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener(CHANGE_EVENT, onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(CHANGE_EVENT, onChange);
      };
    },
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        // Storage blocked (private mode, disabled site data): fall back to this visit's memory.
        return memory.get(key) ?? null;
      }
    },
    () => null,
  );

  const selections = useMemo<Selections>(() => {
    try {
      return raw ? (JSON.parse(raw) as Selections) : {};
    } catch {
      return {};
    }
  }, [raw]);

  const save = (next: Selections) => {
    const value = JSON.stringify(next);
    memory.set(key, value);
    try {
      localStorage.setItem(key, value);
    } catch {
      // Private mode or blocked storage: the in-memory copy still works for this visit.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return [selections, save] as const;
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

// ---------------------------------------------------------------------------------------------

export function StudyTimeline({
  slug,
  plan,
  options,
  color,
}: {
  slug: string;
  plan: StudyPlan;
  options: ElectiveOptions;
  color: string;
}) {
  const [selections, save] = useElectiveSelections(slug);
  const wide = useMediaQuery("(min-width: 768px)");

  const totalSlots = plan.years
    .flatMap((year) => year.semesters)
    .flatMap((semester) => semester?.electives ?? [])
    .reduce((sum, slot) => sum + slot.count, 0);
  const chosenCount = Object.values(selections).reduce((sum, codes) => sum + codes.length, 0);

  const electives: ElectiveProps = {
    options,
    selections,
    chosenInPool: (pool) =>
      new Set(
        Object.entries(selections)
          .filter(([id]) => id.endsWith(`-${pool}`))
          .flatMap(([, codes]) => codes),
      ),
    onChoose: (id, code) => save({ ...selections, [id]: [...(selections[id] ?? []), code] }),
    onRemove: (id, code) =>
      save({ ...selections, [id]: (selections[id] ?? []).filter((c) => c !== code) }),
  };

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2
        id="study-plan-title"
        className="font-heading text-xl leading-7 font-semibold tracking-[-0.015em]"
      >
        Study plan
      </h2>
      <div className="flex items-center gap-1 text-sm">
        <span className="text-muted-foreground">
          <span className="text-foreground font-semibold tabular-nums">{chosenCount}</span> of{" "}
          {totalSlots} electives chosen
        </span>
        {chosenCount > 0 && (
          <button
            type="button"
            onClick={() => save({})}
            className="text-muted-foreground hover:text-foreground focus-visible:outline-ring ml-1 flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-[background-color,color,scale] duration-150 hover:bg-white focus-visible:outline-2 active:scale-95"
          >
            <RotateCcw aria-hidden="true" className="size-3" />
            Reset
          </button>
        )}
      </div>
    </div>
  );

  return (
    <TooltipProvider delay={250}>
      {wide ? (
        <PinnedStage plan={plan} color={color} header={header} electives={electives} />
      ) : (
        <Card>
          {header}
          <div className="divide-border mt-2 divide-y">
            {plan.years.map((year) => (
              <div key={year.year} className="py-6 last:pb-1">
                <YearContent year={year} color={color} electives={electives} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </TooltipProvider>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      aria-labelledby="study-plan-title"
      className={cn(
        "rounded-[1.5rem] border border-white/80 bg-gradient-to-br from-white/75 to-white/40 p-5 shadow-[inset_0_1px_0_rgb(255_255_255),0_12px_32px_-18px_rgb(76_29_149/0.35)] backdrop-blur-md sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------------------------
// Pinned stage: the card holds still while the page scrolls; years trade places in depth.

function PinnedStage({
  plan,
  color,
  header,
  electives,
}: {
  plan: StudyPlan;
  color: string;
  header: React.ReactNode;
  electives: ElectiveProps;
}) {
  const track = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const steps = plan.years.length - 1;
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: track,
    offset: [`start ${PIN_TOP}px`, `end ${PIN_TOP}px`],
  });
  // Critically damped smoothing: the stack glides after the wheel instead of ticking with it.
  const smooth = useSpring(scrollYProgress, { stiffness: 170, damping: 30, restDelta: 0.0005 });

  // Each year rests through the first and last quarter of its stretch; the hand-over happens
  // in the middle half with an ease-in-out, so nothing is ever caught half-way while reading.
  const position = useTransform(smooth, (v) => {
    const raw = v * steps;
    const base = Math.min(Math.floor(raw), steps - 1);
    const t = clamp01((raw - base - 0.25) / 0.5);
    return base + t * t * (3 - 2 * t);
  });
  useMotionValueEvent(position, "change", (v) => setActive(Math.round(v)));

  const goTo = (index: number) => {
    const element = track.current;
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY - PIN_TOP;
    window.scrollTo({ top: top + (element.offsetHeight * index) / steps, behavior: "smooth" });
  };

  return (
    <div
      className="relative"
      style={{ height: `calc(${steps} * ${SCROLL_PER_YEAR} + ${CARD_HEIGHT})` }}
    >
      <div
        ref={track}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{ height: `calc(${steps} * ${SCROLL_PER_YEAR})` }}
      />
      <div className="sticky" style={{ top: PIN_TOP }}>
        <Card className="flex h-[min(32rem,calc(100svh-7.5rem))] flex-col">
          {header}
          <div className="relative mt-4 min-h-0 flex-1 [overflow:clip] [overflow-clip-margin:1.5rem] [perspective:1400px]">
            {/* The spine sits on the bottom layer and stays put; only the years move over it. */}
            <TimelineSpine
              years={plan.years}
              active={active}
              position={position}
              steps={steps}
              onSelect={goTo}
            />
            {plan.years.map((year, index) => (
              <YearLayer
                key={year.year}
                index={index}
                position={position}
                active={index === active}
                reduceMotion={reduceMotion}
              >
                <YearContent year={year} color={color} electives={electives} split />
              </YearLayer>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function YearLayer({
  index,
  position,
  active,
  reduceMotion,
  children,
}: {
  index: number;
  position: MotionValue<number>;
  active: boolean;
  reduceMotion: boolean;
  children: React.ReactNode;
}) {
  // depth 0 = in front; > 0 = still waiting in the distance; < 0 = already pushed past.
  const depth = useTransform(position, (p) => index - p);

  // The outgoing year is gone by mid-hand-over, before the incoming one is legible:
  // the two never share the frame as readable text.
  const opacity = useTransform(depth, (d) => (d < 0 ? clamp01(1 + d * 2.2) : clamp01(1 - d * 1.8)));
  // Movement is capped at one step either way, so years long gone (or far ahead) stay in place
  // instead of growing past the card.
  const scale = useTransform(depth, (d) =>
    reduceMotion ? 1 : d < 0 ? 1 + clamp01(-d) * 0.06 : 1 - clamp01(d) * 0.1,
  );
  const y = useTransform(depth, (d) =>
    reduceMotion ? 0 : d < 0 ? -clamp01(-d) * 28 : clamp01(d) * 36,
  );
  const z = useTransform(depth, (d) =>
    reduceMotion ? 0 : d < 0 ? clamp01(-d) * 60 : -clamp01(d) * 120,
  );
  // No filter at rest: even blur(0px) can soften text by keeping it on a filtered layer.
  const filter = useTransform(depth, (d) => {
    const amount = d < 0 ? clamp01(-d) * 10 : clamp01(d) * 12;
    return reduceMotion || amount < 0.05 ? "none" : `blur(${amount.toFixed(2)}px)`;
  });

  return (
    <motion.div
      inert={!active}
      className="absolute inset-0 origin-[50%_40%]"
      style={{ opacity, scale, y, z, filter, zIndex: active ? 2 : 1 }}
    >
      {children}
    </motion.div>
  );
}

// Macaron palette, top to bottom of the spine: strawberry, lavender, blueberry, pistachio, apricot.
const MACARON = ["#f6a6c1", "#c3a8f0", "#9cc7f4", "#93d9bd", "#f8c39b"];
const MACARON_GRADIENT = `linear-gradient(to bottom, ${MACARON.join(", ")})`;

/** Colour of the macaron gradient at a point along the spine (0 = top, 1 = bottom). */
function macaronAt(fraction: number) {
  const scaled = clamp01(fraction) * (MACARON.length - 1);
  const from = Math.floor(scaled);
  const to = Math.min(from + 1, MACARON.length - 1);
  const mix = Math.round((scaled - from) * 100);
  return `color-mix(in oklab, ${MACARON[to]} ${mix}%, ${MACARON[from]})`;
}

// Stage geometry. The semesters begin SEMESTERS_TOP below the top of the stage (year title
// 3.25rem + 1.25rem gap), and the spine starts at the centre line of the 1.75rem semester
// heading row, so its first node sits exactly between "Semester 1" and "Semester 2".
const SEMESTERS_TOP = "4.5rem";
const SPINE_TOP = `calc(${SEMESTERS_TOP} + 0.875rem)`;

/**
 * The timeline's spine: a soft groove down the middle of the card that doubles as the divider
 * between Semester 1 and Semester 2. It fills with macaron colours as the years go by, and each
 * year's node lights up when the fill reaches it.
 */
function TimelineSpine({
  years,
  active,
  position,
  steps,
  onSelect,
}: {
  years: PlannedYear[];
  active: number;
  position: MotionValue<number>;
  steps: number;
  onSelect: (index: number) => void;
}) {
  // Reveal the full-length gradient from the top, so colours stay fixed to the track.
  const clipPath = useTransform(
    position,
    (p) => `inset(0 0 ${(1 - p / steps) * 100}% 0 round 999px)`,
  );

  return (
    <nav
      aria-label="Years"
      // Ends 0.875rem short of the stage, so the last node (1.75rem when active) rests on its edge.
      className="absolute bottom-3.5 left-1/2 w-3.5 -translate-x-1/2"
      style={{ top: SPINE_TOP }}
    >
      {/* Groove the colour fills into. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-violet-950/[0.05] shadow-[inset_0_1px_2px_rgb(76_29_149/0.14),0_1px_0_rgb(255_255_255/0.9)]"
      />
      {/* Soft bloom under the fill, then the fill itself with a glossy highlight down its centre. */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full opacity-70 blur-[7px]"
        style={{ backgroundImage: MACARON_GRADIENT, clipPath }}
      />
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={{ backgroundImage: MACARON_GRADIENT, clipPath }}
      >
        <span className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-white/80 via-white/45 to-white/70" />
      </motion.span>

      <ol>
        {years.map((year, index) => {
          const isActive = index === active;
          const reached = index <= active;
          return (
            <li
              key={year.year}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ top: `${(index / steps) * 100}%` }}
            >
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-label={`Year ${year.year}`}
                aria-current={isActive ? "step" : undefined}
                className="group focus-visible:outline-ring grid size-7 cursor-pointer place-items-center rounded-full focus-visible:outline-2"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid place-items-center rounded-full bg-white text-[0.625rem] font-bold tabular-nums shadow-[0_2px_6px_-1px_rgb(76_29_149/0.3),0_0_0_1px_rgb(255_255_255)] transition-[width,height,color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-active:scale-90",
                    isActive ? "text-foreground size-7" : "text-muted-foreground size-5",
                  )}
                  style={
                    reached
                      ? {
                          boxShadow: `0 0 0 2.5px ${macaronAt(index / steps)}, 0 4px 14px -2px ${macaronAt(index / steps)}`,
                        }
                      : undefined
                  }
                >
                  {year.year}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ---------------------------------------------------------------------------------------------
// Year content. Split: the two semesters flank the spine, Semester 1 mirrored so both read
// outward from the line. Stacked (phones): one column under the year title. No inner cards.

function YearContent({
  year,
  color,
  electives,
  split = false,
}: {
  year: PlannedYear;
  color: string;
  electives: ElectiveProps;
  split?: boolean;
}) {
  const credits = year.semesters.reduce((sum, s) => sum + (s?.credits ?? 0), 0);

  return (
    <div className="flex h-full flex-col">
      {/* Split: the title stands alone on its line so it centres exactly on the spine, with
          the credits as a caption under it. Its height plus the gap below equal SEMESTERS_TOP. */}
      <div className={split ? "h-[3.25rem] text-center" : "flex items-baseline gap-3"}>
        <h3 className="font-heading text-[1.75rem] leading-none font-semibold tracking-[-0.025em]">
          Year {year.year}
        </h3>
        <p className={cn("text-muted-foreground text-sm leading-5", split && "mt-1")}>
          {credits} credits
        </p>
      </div>
      <div
        className={cn(
          "grid min-h-0 flex-1",
          split
            ? "mt-5 grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,1fr)]"
            : "mt-4 grid-cols-1 gap-y-6",
        )}
      >
        {year.semesters.map((semester, index) => {
          const mirror = split && index === 0;
          const column = semester ? (
            <SemesterContent
              key={index}
              year={year.year}
              semester={semester}
              color={color}
              electives={electives}
              mirror={mirror}
            />
          ) : (
            <Graduation key={index} color={color} />
          );
          return split && index === 0 ? [column, <span key="spine" aria-hidden="true" />] : column;
        })}
      </div>
    </div>
  );
}

function SemesterContent({
  year,
  semester,
  color,
  electives,
  mirror = false,
}: {
  year: number;
  semester: PlannedSemester;
  color: string;
  electives: ElectiveProps;
  mirror?: boolean;
}) {
  return (
    <div className={cn("min-w-0", mirror && "text-right")}>
      {/* Fixed 1.75rem tall: the spine's first node is centred on this row. */}
      <div className={cn("flex h-7 items-center gap-2.5", mirror && "flex-row-reverse")}>
        <h4 className="text-[1.0625rem] leading-7 font-semibold tracking-[-0.01em]">
          Semester {semester.semester}
        </h4>
        {semester.industry ? (
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold"
            style={{ background: tint(color, 16), color: shade(color, 68) }}
          >
            <Briefcase aria-hidden="true" className="size-3" />
            In industry
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">{semester.credits} credits</span>
        )}
      </div>

      <ul className="mt-2">
        {semester.courses.map((course) => (
          <CourseRow key={course.code} {...course} mirror={mirror} />
        ))}
      </ul>

      {semester.electives.map((slot) => {
        const id = slotId(year, semester.semester, slot.pool);
        const chosen = (electives.selections[id] ?? []).flatMap((code) => {
          const option = electives.options[slot.pool].find((o) => o.code === code);
          return option ? [option] : [];
        });
        const remaining = Math.max(slot.count - chosen.length, 0);
        return (
          <div key={slot.pool} className="mt-3">
            <p
              className={cn(
                "text-muted-foreground flex items-baseline gap-2 text-[0.8125rem] leading-5",
                mirror && "flex-row-reverse",
              )}
            >
              <span className="text-foreground font-medium">
                {slot.pool === "faculty" ? "Faculty" : "Specialization"}{" "}
                {slot.count === 1 ? "elective" : "electives"}
              </span>
              <span>
                Choose {slot.count} of {slot.options}
              </span>
            </p>
            <ul className="mt-1">
              {chosen.map((option) => (
                <CourseRow
                  key={option.code}
                  {...option}
                  mirror={mirror}
                  onRemove={() => electives.onRemove(id, option.code)}
                />
              ))}
              {/* Open slots use the same row grid as courses, so the list stays aligned. */}
              {Array.from({ length: remaining }, (_, i) => (
                <li key={i}>
                  <ElectivePicker
                    pool={slot.pool}
                    options={electives.options[slot.pool]}
                    taken={electives.chosenInPool(slot.pool)}
                    color={color}
                    mirror={mirror}
                    onSelect={(code) => electives.onChoose(id, code)}
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {semester.university.length > 0 && (
        <p className="text-muted-foreground mt-3 text-xs leading-5">
          Also: {semester.university.map((course) => course.name).join(", ")}
        </p>
      )}
    </div>
  );
}

function CourseRow({
  code,
  name,
  credits,
  color,
  summary,
  mirror = false,
  onRemove,
}: {
  code: string;
  name: string;
  credits: number;
  color: string;
  summary: string;
  mirror?: boolean;
  onRemove?: () => void;
}) {
  return (
    <li>
      <RowGrid mirror={mirror}>
        <span
          aria-hidden="true"
          className="size-2 justify-self-center rounded-full"
          style={{ background: color }}
        />
        <span
          className={cn(
            "text-muted-foreground text-xs font-medium tracking-[0.01em] tabular-nums",
            mirror && "text-right",
          )}
        >
          {code}
        </span>
        {/* Hover or focus the name for its credits and a one-line introduction. */}
        <Tooltip>
          <TooltipTrigger
            render={<span tabIndex={0} />}
            className={cn(
              "focus-visible:outline-ring min-w-0 cursor-default rounded-sm text-[0.9375rem] leading-snug font-medium decoration-violet-300 underline-offset-4 transition-colors hover:underline focus-visible:outline-2",
              mirror && "text-right",
            )}
          >
            <FitLine>{name}</FitLine>
          </TooltipTrigger>
          <TooltipContent side="top" className="block max-w-72 text-left">
            <span className="block text-[0.8125rem] font-semibold">{name}</span>
            <span className="text-muted-foreground mt-0.5 block text-[0.6875rem] font-medium">
              {code} · {credits} credits
            </span>
            {summary && <span className="mt-1.5 block leading-snug">{summary}</span>}
          </TooltipContent>
        </Tooltip>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${name}`}
            className="text-muted-foreground hover:text-foreground focus-visible:outline-ring grid size-6 cursor-pointer place-items-center justify-self-center rounded-full transition-[background-color,color,scale] duration-150 hover:bg-white focus-visible:outline-2 active:scale-90"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
      </RowGrid>
    </li>
  );
}

const MIN_FIT_SIZE = 11;

/**
 * Keeps a course name on one line on wide screens: if the full name is wider than its column,
 * the text size steps down just enough to fit (never below 11px) instead of being cut off.
 * Phones let names wrap, since their columns are too narrow for one line.
 */
function FitLine({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const wide = window.matchMedia("(min-width: 768px)");

    const fit = () => {
      element.style.fontSize = "";
      if (!wide.matches) return;
      const overflow = element.scrollWidth / element.clientWidth;
      if (overflow <= 1) return;
      const base = parseFloat(getComputedStyle(element).fontSize);
      element.style.fontSize = `${Math.max((base / overflow) * 0.98, MIN_FIT_SIZE)}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    wide.addEventListener("change", fit);
    document.fonts?.ready.then(fit);
    return () => {
      observer.disconnect();
      wide.removeEventListener("change", fit);
    };
  }, [children]);

  return (
    <span ref={ref} className="block overflow-hidden md:whitespace-nowrap">
      {children}
    </span>
  );
}

/**
 * Shared four-column grid for every line in a semester: dot, code, name, action.
 * Fixed columns keep codes and names aligned whether or not a row has an action, and long
 * names wrap instead of being cut off. Mirrored rows (Semester 1, left of the spine) run the
 * same columns right to left.
 */
function RowGrid({
  mirror,
  className,
  children,
}: {
  mirror: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        // Every row is 2rem tall and centred, with or without an action button.
        "grid min-h-8 grid-cols-[0.5rem_3.75rem_minmax(0,1fr)_1.5rem] items-center gap-x-3 py-1",
        // Flip only the column order; text inside each cell still reads left to right. Mirrored
        // cells align their text towards the spine, so codes sit flush against their dots.
        mirror && "[direction:rtl] *:[direction:ltr]",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Graduation({ color }: { color: string }) {
  return (
    <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-center">
      <span
        className="grid size-11 place-items-center rounded-full"
        style={{ background: tint(color, 14), color }}
      >
        <GraduationCap aria-hidden="true" className="size-5" />
      </span>
      <p className="text-sm font-semibold">Graduation</p>
      <p className="text-muted-foreground max-w-[24ch] text-xs">
        The programme ends after Semester 1.
      </p>
    </div>
  );
}

function ElectivePicker({
  pool,
  options,
  taken,
  color,
  mirror = false,
  onSelect,
}: {
  pool: PlannedElectives["pool"];
  options: ElectiveOption[];
  taken: Set<string>;
  color: string;
  mirror?: boolean;
  onSelect: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const kind = pool === "faculty" ? "faculty" : "specialization";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* An open slot is a row in the course list: hollow dot, quiet label, + where × would be. */}
      <PopoverTrigger className="group focus-visible:outline-ring -mx-2 block w-[calc(100%+1rem)] cursor-pointer rounded-lg px-2 text-left transition-colors duration-150 hover:bg-white/80 focus-visible:outline-2 active:bg-white">
        <RowGrid mirror={mirror}>
          <span
            aria-hidden="true"
            className="size-2 justify-self-center rounded-full border-[1.5px] opacity-60"
            style={{ borderColor: shade(color, 80) }}
          />
          <span
            className={cn("text-muted-foreground/70 text-xs font-medium", mirror && "text-right")}
          >
            Elective
          </span>
          <span
            className={cn(
              "text-muted-foreground group-hover:text-foreground min-w-0 text-[0.9375rem] leading-snug font-medium whitespace-nowrap transition-colors",
              mirror && "text-right",
            )}
          >
            Choose a course
          </span>
          <span
            aria-hidden="true"
            className="grid size-6 place-items-center justify-self-center rounded-full transition-[background-color,scale] duration-150 group-active:scale-90"
            style={{ background: tint(color, 14), color: shade(color, 70) }}
          >
            <Plus className="size-3.5" />
          </span>
        </RowGrid>
      </PopoverTrigger>
      <PopoverContent
        align={mirror ? "end" : "start"}
        className="w-80 gap-0 border border-white bg-white/90 p-1.5 shadow-[0_24px_48px_-20px_rgb(76_29_149/0.5)] backdrop-blur-2xl"
      >
        <p className="px-2.5 pt-1.5 pb-2 text-left">
          <span className="block text-sm font-semibold">Choose a {kind} elective</span>
          <span className="text-muted-foreground text-xs">
            Each elective runs once a year, in Semester 1 or 2.
          </span>
        </p>
        <ul className="max-h-72 overflow-y-auto overscroll-contain">
          {options.map((option) => {
            const isTaken = taken.has(option.code);
            return (
              <li key={option.code}>
                <button
                  type="button"
                  disabled={isTaken}
                  onClick={() => {
                    onSelect(option.code);
                    setOpen(false);
                  }}
                  className="focus-visible:outline-ring flex w-full cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-100 hover:bg-violet-50 focus-visible:outline-2 active:bg-violet-100 disabled:cursor-default disabled:opacity-45 disabled:hover:bg-transparent"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-1.5 shrink-0 rounded-full"
                    style={{ background: option.color }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="text-muted-foreground flex items-center gap-2 text-[0.6875rem]">
                      <span className="font-semibold">{option.code}</span>
                      <span>{option.topic}</span>
                    </span>
                    <span className="block text-[0.8125rem] leading-snug font-medium">
                      {option.name}
                    </span>
                    <span className="text-muted-foreground block text-xs leading-snug">
                      {option.summary}
                    </span>
                  </span>
                  {isTaken && (
                    <span className="text-muted-foreground mt-1 flex shrink-0 items-center gap-1 text-[0.6875rem] font-semibold">
                      <Check aria-hidden="true" className="size-3" />
                      Chosen
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
