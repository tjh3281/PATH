"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/programmes", label: "Programmes" },
  { href: "/careers", label: "Careers" },
  { href: "/seniors", label: "Senior insights" },
] as const;

const QUIZ_HREF = "/quiz";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Content sliding under the sticky bar needs a denser, blurrier glass to stay unreadable.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-3 sm:pt-4">
      <div className="relative mx-auto max-w-6xl">
        <nav
          aria-label="Main"
          className={cn(
            "flex h-16 items-center gap-1 rounded-[1.25rem] pr-2.5 pl-3 transition-[background,box-shadow,backdrop-filter] duration-300 sm:pl-4",
            scrolled || menuOpen ? "glass-frosted" : "glass",
          )}
        >
          <Link
            href="/"
            aria-label="PathFinder FCSIT home"
            onClick={closeMenu}
            className="focus-visible:outline-ring rounded-xl outline-offset-4 focus-visible:outline-2"
          >
            <Logo />
          </Link>

          <ul className="ml-auto hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={cn(
                    "text-foreground/70 rounded-full px-4 py-2 text-[0.9375rem] font-medium transition-colors",
                    "hover:text-foreground hover:bg-white/60",
                    "focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
                    isActive(href) &&
                      "text-primary hover:text-primary bg-white/85 shadow-[inset_0_1px_0_rgb(255_255_255),0_2px_8px_-2px_rgb(108_43_217/0.25)] hover:bg-white/85",
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <Link href={QUIZ_HREF} className="btn-gradient ml-2 hidden md:inline-flex">
            Take the quiz
          </Link>

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? "mobile-menu" : undefined}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="text-foreground focus-visible:outline-ring ml-auto grid size-11 place-items-center rounded-full transition-colors hover:bg-white/60 focus-visible:outline-2 md:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div
            id="mobile-menu"
            className="glass-strong animate-in fade-in slide-in-from-top-2 absolute inset-x-0 top-full mt-2 rounded-[1.25rem] p-2 duration-200 md:hidden"
          >
            <ul className="flex flex-col">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeMenu}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={cn(
                      "text-foreground/80 block rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-white/70",
                      "focus-visible:outline-ring focus-visible:outline-2",
                      isActive(href) && "text-primary bg-white/90",
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={QUIZ_HREF} onClick={closeMenu} className="btn-gradient mt-2 flex w-full">
              Take the quiz
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
