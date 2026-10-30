export type LabelId =
  | "programming"
  | "math"
  | "data"
  | "databases"
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
