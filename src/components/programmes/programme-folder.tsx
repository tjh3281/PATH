"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export type FolderTab = {
  slug: string;
  shortName: string;
  name: string;
  tabName: string;
  /** Programme theme colour, shown as the tab dot. */
  accent: string;
};

export function ProgrammeFolder({
  tabs,
  children,
}: {
  tabs: FolderTab[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeSlug = tabs.find((tab) => pathname.startsWith(`/programmes/${tab.slug}`))?.slug;

  return (
    <div>
      <nav
        aria-label="Programmes"
        className="no-scrollbar relative z-10 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
      >
        <ul className="flex min-w-max items-end gap-1.5 lg:min-w-0">
          {tabs.map((tab) => {
            const active = tab.slug === activeSlug;
            return (
              <li key={tab.slug} className="lg:min-w-0 lg:flex-1">
                <Link
                  href={`/programmes/${tab.slug}`}
                  aria-current={active ? "page" : undefined}
                  aria-label={tab.name}
                  className={cn(
                    "flex flex-col rounded-t-2xl border border-b-0 px-4 transition-[background-color,color,padding] duration-200 sm:px-5 lg:w-full",
                    "focus-visible:outline-ring focus-visible:outline-2 focus-visible:-outline-offset-2",
                    active
                      ? "folder-surface text-foreground py-2"
                      : "text-foreground/60 hover:text-foreground border-white/50 bg-white/25 py-1.5 hover:bg-white/45",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-2 shrink-0 rounded-full transition-opacity",
                        active ? "opacity-100" : "opacity-60",
                      )}
                      style={{ backgroundColor: tab.accent }}
                    />
                    <span className="font-heading text-[0.9375rem] font-bold tracking-[-0.01em]">
                      {tab.shortName}
                    </span>
                  </span>
                  <span className="hidden truncate pl-4 text-xs font-medium lg:block">
                    {tab.tabName}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={cn(
          // Tabs always sit on the top-left corner (and on the top-right too once they span the
          // full width), so those corners stay square instead of curving away under a tab.
          "folder-surface -mt-px rounded-[1.75rem] rounded-tl-none border shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_24px_48px_-24px_rgb(76_29_149/0.35)] lg:rounded-tr-none",
        )}
      >
        {children}
      </div>
    </div>
  );
}
