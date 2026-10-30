import type { Label, LabelId } from "@/types/curriculum";

export const LABELS: Label[] = [
  {
    id: "ai",
    name: "AI & ML",
    description: "Machines that learn, reason, see or act",
    color: "#7c3aed",
    kind: "subject",
  },
  {
    id: "programming",
    name: "Programming",
    description: "Writing code; languages and paradigms",
    color: "#4f46e5",
    kind: "subject",
  },
  {
    id: "math",
    name: "Math & Stats",
    description: "Calculus, algebra, discrete maths, statistics",
    color: "#2563eb",
    kind: "subject",
  },
  {
    id: "data",
    name: "Data & Analytics",
    description: "Turning data into insight",
    color: "#0891b2",
    kind: "subject",
  },
  {
    id: "databases",
    name: "Databases",
    description: "Storing and managing data",
    color: "#0d9488",
    kind: "subject",
  },
  {
    id: "software-eng",
    name: "Software Engineering",
    description: "Requirements, design, testing and quality",
    color: "#c026d3",
    kind: "subject",
  },
  {
    id: "web-mobile",
    name: "Web & Mobile",
    description: "Apps for the browser and the phone",
    color: "#db2777",
    kind: "subject",
  },
  {
    id: "networking",
    name: "Networking",
    description: "Protocols, network design and the Internet",
    color: "#0284c7",
    kind: "subject",
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    description: "Defending, attacking and investigating systems",
    color: "#e11d48",
    kind: "subject",
  },
  {
    id: "systems",
    name: "Systems & Hardware",
    description: "Processors, operating systems, embedded devices",
    color: "#475569",
    kind: "subject",
  },
  {
    id: "media",
    name: "Graphics, Media & Games",
    description: "Images, sound, video, 3D and games",
    color: "#f59e0b",
    kind: "subject",
  },
  {
    id: "design",
    name: "Design & UX",
    description: "Designing for people",
    color: "#f97316",
    kind: "subject",
  },
  {
    id: "business",
    name: "Business & IS",
    description: "Technology inside organisations",
    color: "#16a34a",
    kind: "subject",
  },
  {
    id: "projects",
    name: "Projects & Industry",
    description: "Capstone projects and industrial training",
    color: "#a78bfa",
    kind: "general",
  },
  {
    id: "university",
    name: "University & Soft Skills",
    description: "University-wide requirements",
    color: "#94a3b8",
    kind: "general",
  },
];

export const LABELS_BY_ID = Object.fromEntries(LABELS.map((label) => [label.id, label])) as Record<
  LabelId,
  Label
>;
