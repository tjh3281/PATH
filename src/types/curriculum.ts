export type LabelId =
  | "programming"
  | "math"
  | "data"
  | "ai"
  | "software-eng"
  | "web-mobile"
  | "networking"
  | "cybersecurity"
  | "systems"
  | "media"
  | "design"
  | "business"
  | "projects"
  | "university";

export type Label = {
  id: LabelId;
  name: string;
  description: string;
  color: string;
  /** "subject" labels describe what a course teaches; "general" ones are shared by every programme. */
  kind: "subject" | "general";
};

export type Course = {
  code: string;
  name: string;
  credits: number;
  primary: LabelId;
  secondary?: LabelId[];
};

/** One entry in a semester of the handbook's course plan. */
export type PlanItem =
  | { kind: "course"; code: string }
  /** Elective slots: the plan fixes how many, the student picks which (each 3 credits). */
  | { kind: "electives"; pool: "specialization" | "faculty"; count: number }
  /** University-wide course with no faculty course code (English, co-curriculum, SHE…). */
  | { kind: "university"; name: string; credits: number };

export type PlanSemester = {
  year: 1 | 2 | 3 | 4;
  semester: 1 | 2;
  /** Semester spent working in industry. */
  industry?: boolean;
  items: PlanItem[];
};

export type ProgrammeSlug = "ai" | "se" | "csn" | "ds" | "is" | "mm";

export type Programme = {
  slug: ProgrammeSlug;
  shortName: string;
  name: string;
  /** Short name that fits on the folder tab. */
  tabName: string;
  /** Programme theme colour: tab dot, accents and the big code on the overview. */
  color: string;
  degree: string;
  intro: string;
  highlights: string[];
  facultyCore: string[];
  core: string[];
  facultyElectives: string[];
  electives: string[];
  electivesToPick: number;
};
