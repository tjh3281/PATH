import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";

import { SiteHeader } from "@/components/layout/site-header";

import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PathFinder FCSIT",
  description:
    "Explore FCSIT Universiti Malaya bachelor programmes, careers and senior insights, and find your best-fit programme.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} ${figtree.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <div aria-hidden="true" className="aurora" />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
