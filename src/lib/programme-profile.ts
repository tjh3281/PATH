import { COURSE_SUMMARIES } from "@/data/course-summaries";
import { COURSES_BY_CODE } from "@/data/courses";
import { LABELS, LABELS_BY_ID } from "@/data/labels";
import type { Course, Label, Programme } from "@/types/curriculum";

export type ProgrammeCourse = Course & {
  summary: string;
  /** True for courses the student chooses from (faculty and specialization electives). */
  elective: boolean;
};

export type ProfileSlice = {
  label: Label;
  count: number;
  share: number;
  courses: ProgrammeCourse[];
};

export type ProgrammeProfile = {
  total: number;
  slices: ProfileSlice[];
};

export function programmeCourses(programme: Programme): ProgrammeCourse[] {
  const required = [...programme.facultyCore, ...programme.core];
  const electives = [...programme.facultyElectives, ...programme.electives];
  return [...required, ...electives].map((code, index) => {
    const course = COURSES_BY_CODE.get(code);
    if (!course) throw new Error(`${programme.slug}: unknown course ${code}`);
    return {
      ...course,
      summary: COURSE_SUMMARIES[code] ?? "",
      elective: index >= required.length,
    };
  });
}

/**
 * Topic mix of a programme: every course the student takes or can choose, grouped by
 * primary label. University courses and projects are shared by all programmes, so they
 * are left out to keep the differences visible.
 */
export function programmeProfile(programme: Programme): ProgrammeProfile {
  const groups = new Map<Label["id"], ProgrammeCourse[]>();
  for (const course of programmeCourses(programme)) {
    if (LABELS_BY_ID[course.primary].kind !== "subject") continue;
    groups.set(course.primary, [...(groups.get(course.primary) ?? []), course]);
  }

  const total = [...groups.values()].reduce((sum, courses) => sum + courses.length, 0);
  const labelOrder = new Map(LABELS.map((label, index) => [label.id, index]));
  const slices = [...groups.entries()]
    .map(([id, courses]) => ({
      label: LABELS_BY_ID[id],
      count: courses.length,
      share: courses.length / total,
      courses,
    }))
    .sort((a, b) => b.count - a.count || labelOrder.get(a.label.id)! - labelOrder.get(b.label.id)!);

  return { total, slices };
}
