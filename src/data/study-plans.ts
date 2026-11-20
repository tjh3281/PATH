import type { PlanItem, PlanSemester, ProgrammeSlug } from "@/types/curriculum";

// Source: "Course Planning" pages of the FCSIT Undergraduate Programme Handbook 2025/2026
// (pp. 21, 25, 29, 33, 37, 41).

const course = (code: string): PlanItem => ({ kind: "course", code });
const electives = (
  count: number,
  pool: "specialization" | "faculty" = "specialization",
): PlanItem => ({
  kind: "electives",
  pool,
  count,
});
const university = (name: string, credits: number): PlanItem => ({
  kind: "university",
  name,
  credits,
});

const ENTREPRENEURSHIP = university("Basic Entrepreneurship Culture", 2);
const PHILOSOPHY = university("Philosophy and Current Issues / Malay Language", 2);
const ETHICS = university("Ethics and Civilizations", 2);
const ENGLISH_1 = university("English for Communication (1)", 2);
const ENGLISH_2 = university("English for Communication (2)", 2);
const COCURRICULUM_1 = university("Co-curriculum (1)", 2);
const COCURRICULUM_2 = university("Co-curriculum (2)", 2);
const INTEGRITY = university("Integrity and Anti-Corruption", 2);
const SHE_1 = university("SHE: Thinking Matters", 2);
const SHE_2 = university("SHE: i-Techie", 2);
const SHE_3 = university("SHE: Global Issues", 2);

/**
 * Shared shape of the 3.5-year plan for AI, SE, CSN, MM and IS. Programmes differ only in
 * which core courses sit in Year 1 Semester 1 and Year 2 Semester 1.
 *
 * The AI handbook page lists SHE Cluster 3 twice and leaves out the integrity course; it
 * follows this shared shape here, which gives the same credit totals.
 */
function standardPlan(year1Sem1: PlanItem[], year2Sem1: PlanItem[]): PlanSemester[] {
  return [
    {
      year: 1,
      semester: 1,
      items: [
        ENTREPRENEURSHIP,
        ENGLISH_1,
        course("WIX1001"),
        course("WIX1002"),
        course("WIX1003"),
        ...year1Sem1,
      ],
    },
    {
      year: 1,
      semester: 2,
      items: [
        PHILOSOPHY,
        ENGLISH_2,
        course("WIA1002"),
        course("WIA1003"),
        course("WIA1005"),
        course("WIA1006"),
      ],
    },
    { year: 2, semester: 1, items: [ETHICS, ...year2Sem1] },
    {
      year: 2,
      semester: 2,
      items: [COCURRICULUM_1, course("WIA2004"), course("WIA2005"), electives(3), INTEGRITY],
    },
    { year: 3, semester: 1, industry: true, items: [course("WIA3001")] },
    { year: 3, semester: 2, items: [course("WIA3002"), electives(4), SHE_1, SHE_2] },
    { year: 4, semester: 1, items: [COCURRICULUM_2, course("WIA3003"), electives(3), SHE_3] },
  ];
}

const YEAR_2_COMMON = ["WIX2001", "WIX2002", "WIA2001", "WIA2003"].map(course);

export const STUDY_PLANS: Record<ProgrammeSlug, PlanSemester[]> = {
  ai: standardPlan([course("WIA1007")], [...YEAR_2_COMMON, course("WIA2006"), course("WIA2007")]),
  se: standardPlan([course("WIA2010")], [...YEAR_2_COMMON, course("WIA2002"), course("WIA2007")]),
  // CSN takes Thinking and Communication Skills in Year 1, freeing Year 2 for its hardware core.
  csn: standardPlan(
    [course("WIX2001")],
    ["WIX2002", "WIA2001", "WIA2003", "WIA2006", "WIA2008", "WIA2009"].map(course),
  ),
  mm: standardPlan([course("WIA1008")], [...YEAR_2_COMMON, course("WIA2006"), course("WIA2007")]),
  is: standardPlan([course("WIA1001")], [...YEAR_2_COMMON, course("WIA2006"), course("WIA2007")]),
  ds: [
    {
      year: 1,
      semester: 1,
      items: [ENTREPRENEURSHIP, ...["WIX1001", "WIX1002", "WIX1003", "WIA1001"].map(course)],
    },
    {
      year: 1,
      semester: 2,
      items: [
        PHILOSOPHY,
        university("Information Literacy", 2),
        university("Social Engagement", 2),
        ...["WIA1002", "WIA1003", "WID3006", "WIE2003"].map(course),
      ],
    },
    {
      year: 2,
      semester: 1,
      items: [
        university("English for Communication (1)", 3),
        ETHICS,
        ...["WIX2001", "WIX2002", "WIA2001", "WIA2002", "WIA2003"].map(course),
      ],
    },
    {
      year: 2,
      semester: 2,
      items: [
        university("Co-curriculum", 2),
        university("English for Communication (2)", 3),
        course("WIA2004"),
        course("WIA1005"),
        electives(2),
        electives(1, "faculty"),
      ],
    },
    {
      year: 3,
      semester: 1,
      items: [
        course("WIH3001"),
        electives(4),
        electives(1, "faculty"),
        university("External faculty elective", 2),
      ],
    },
    { year: 3, semester: 2, industry: true, items: [course("WIH3002")] },
    {
      year: 4,
      semester: 1,
      industry: true,
      items: ["WIH3005", "WIH3006", "WIH3007"].map(course),
    },
  ],
};
