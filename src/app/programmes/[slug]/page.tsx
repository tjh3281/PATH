import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AiEmblem } from "@/components/programmes/ai-emblem";
import { TopicExplorer } from "@/components/programmes/topic-explorer";
import { Skeleton } from "@/components/ui/skeleton";
import { getProgramme, PROGRAMME_SLUGS } from "@/data/programmes";
import { programmeProfile } from "@/lib/programme-profile";

export function generateStaticParams() {
  return PROGRAMME_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/programmes/[slug]">): Promise<Metadata> {
  const programme = getProgramme((await params).slug);
  return programme ? { title: `${programme.name} · PathFinder FCSIT` } : {};
}

export default function ProgrammePage({ params }: PageProps<"/programmes/[slug]">) {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <ProgrammeOverview params={params} />
    </Suspense>
  );
}

function OverviewSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4 p-5 sm:p-7 lg:px-8 lg:py-7">
      <Skeleton className="h-4 w-48 bg-white/60" />
      <Skeleton className="h-12 w-80 max-w-full bg-white/60" />
      <Skeleton className="h-16 w-full max-w-xl bg-white/60" />
      <Skeleton className="mt-8 h-80 w-full rounded-[1.5rem] bg-white/50" />
    </div>
  );
}

async function ProgrammeOverview({ params }: Pick<PageProps<"/programmes/[slug]">, "params">) {
  const programme = getProgramme((await params).slug);
  if (!programme) notFound();

  const { total, slices } = programmeProfile(programme);
  const { color } = programme;

  return (
    <section aria-labelledby="programme-name" className="p-5 sm:p-7 lg:px-8 lg:py-7">
      <header className="relative flex items-center gap-10">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-sm font-medium">{programme.degree}</p>
          <h1
            id="programme-name"
            className="font-heading mt-1 text-3xl font-bold tracking-[-0.03em] text-balance sm:text-4xl"
          >
            {programme.name}
          </h1>
          <p className="text-foreground/70 mt-2.5 max-w-[62ch] text-[0.9375rem] leading-relaxed">
            {programme.intro}
          </p>
          <ul className="mt-3.5 flex flex-wrap gap-2">
            {programme.highlights.map((highlight) => (
              <li
                key={highlight}
                className="text-foreground/80 rounded-full border border-white/80 bg-white/55 px-3 py-1 text-xs font-medium"
              >
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        {programme.slug === "ai" ? (
          // Out of the layout flow so its size never makes the hero taller; the empty box
          // beside the text reserves its width.
          <div className="hidden w-56 shrink-0 self-stretch lg:block">
            <AiEmblem className="absolute top-1/2 right-0 size-60 -translate-y-1/2" />
          </div>
        ) : (
          <span
            aria-hidden="true"
            className="font-heading pointer-events-none hidden shrink-0 text-[7rem] leading-[0.8] font-extrabold tracking-[-0.06em] select-none lg:block"
            style={{
              backgroundImage: `linear-gradient(150deg, ${color} 25%, color-mix(in oklab, ${color} 45%, white))`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            {programme.shortName}
          </span>
        )}
      </header>

      <div className="mt-6 rounded-[1.5rem] border border-white/80 bg-gradient-to-br from-white/70 to-white/35 p-5 shadow-[inset_0_1px_0_rgb(255_255_255),0_12px_32px_-18px_rgb(76_29_149/0.35)] backdrop-blur-md sm:p-6">
        <h2 className="font-heading text-xl font-semibold tracking-tight">What you’ll study</h2>
        <div className="mt-5">
          <TopicExplorer total={total} slices={slices} />
        </div>
      </div>
    </section>
  );
}
