import { COURSE_SUMMARIES } from "@/data/course-summaries";
import { COURSES_BY_CODE } from "@/data/courses";
import { LABELS_BY_ID } from "@/data/labels";
import { STUDY_PLANS } from "@/data/study-plans";
import type { Programme } from "@/types/curriculum";

const ELECTIVE_CREDITS = 3;

export type PlannedCourse = {
  code: string;
  name: string;
  credits: number;
  color: string;
  summary: string;
};
export type PlannedElectives = {
  pool: "specialization" | "faculty";
  count: number;
  credits: number;
  options: number;
};
export type PlannedUniversity = { name: string; credits: number };

export type PlannedSemester = {
  semester: 1 | 2;
  industry: boolean;
  credits: number;
  courses: PlannedCourse[];
  electives: PlannedElectives[];
  university: PlannedUniversity[];
};

export type PlannedYear = {
  year: number;
  /** Semester 1 and Semester 2; null when the programme ends before that semester. */
  semesters: [PlannedSemester | null, PlannedSemester | null];
};

export type StudyPlan = { years: PlannedYear[]; totalCredits: number };

export type ElectiveOption = PlannedCourse & { topic: string };
export type ElectiveOptions = Record<PlannedElectives["pool"], ElectiveOption[]>;

/** The courses a student can pick for each kind of elective slot in the plan. */
export function electiveOptions(programme: Programme): ElectiveOptions {
  const resolve = (codes: string[]) =>
    codes.map((code) => {
      const course = COURSES_BY_CODE.get(code);
      if (!course) throw new Error(`${programme.slug}: unknown elective ${code}`);
      const label = LABELS_BY_ID[course.primary];
      return {
        code,
        name: course.name,
        credits: course.credits,
        color: label.color,
        topic: label.name,
        summary: COURSE_SUMMARIES[code] ?? "",
      };
    });
  return {
    specialization: resolve(programme.electives),
    faculty: resolve(programme.facultyElectives),
  };
}

/** Resolves a programme's handbook course plan into display-ready years and semesters. */
export function studyPlan(programme: Programme): StudyPlan {
  const plan = STUDY_PLANS[programme.slug];
  const years = new Map<number, PlannedYear>();

  for (const entry of plan) {
    const semester: PlannedSemester = {
      semester: entry.semester,
      industry: entry.industry ?? false,
      credits: 0,
      courses: [],
      electives: [],
      university: [],
    };

    for (const item of entry.items) {
      if (item.kind === "course") {
        const course = COURSES_BY_CODE.get(item.code);
        if (!course)
          throw new Error(`${programme.slug}: unknown course ${item.code} in study plan`);
        semester.courses.push({
          code: course.code,
          name: course.name,
          credits: course.credits,
          color: LABELS_BY_ID[course.primary].color,
          summary: COURSE_SUMMARIES[course.code] ?? "",
        });
        semester.credits += course.credits;
      } else if (item.kind === "electives") {
        const options =
          item.pool === "faculty" ? programme.facultyElectives.length : programme.electives.length;
        const credits = item.count * ELECTIVE_CREDITS;
        semester.electives.push({ pool: item.pool, count: item.count, credits, options });
        semester.credits += credits;
      } else {
        semester.university.push({ name: item.name, credits: item.credits });
        semester.credits += item.credits;
      }
    }

    const year = years.get(entry.year) ?? { year: entry.year, semesters: [null, null] };
    year.semesters[entry.semester - 1] = semester;
    years.set(entry.year, year);
  }

  const ordered = [...years.values()].sort((a, b) => a.year - b.year);
  const totalCredits = plan.length
    ? ordered.reduce(
        (sum, year) => sum + year.semesters.reduce((s, sem) => s + (sem?.credits ?? 0), 0),
        0,
      )
    : 0;

  return { years: ordered, totalCredits };
}
