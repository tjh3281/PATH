import { describe, expect, it } from "vitest";

import { getProgramme, PROGRAMMES } from "@/data/programmes";
import { STUDY_PLANS } from "@/data/study-plans";
import { electiveOptions, studyPlan } from "@/lib/study-plan";

describe("studyPlan", () => {
  it.each([
    ["ai", 128],
    ["se", 128],
    ["csn", 128],
    ["mm", 128],
    ["is", 128],
    ["ds", 124],
  ])("adds up to the handbook's graduation credits for %s", (slug, credits) => {
    expect(studyPlan(getProgramme(slug)!).totalCredits).toBe(credits);
  });

  it("schedules every faculty and programme core course exactly once", () => {
    for (const programme of PROGRAMMES) {
      const scheduled = STUDY_PLANS[programme.slug]
        .flatMap((semester) => semester.items)
        .flatMap((item) => (item.kind === "course" ? [item.code] : []));
      expect([...scheduled].sort(), programme.slug).toEqual(
        [...programme.facultyCore, ...programme.core].sort(),
      );
    }
  });

  it("schedules as many elective slots as the programme asks students to pick", () => {
    for (const programme of PROGRAMMES) {
      const slots = STUDY_PLANS[programme.slug]
        .flatMap((semester) => semester.items)
        .reduce(
          (sum, item) =>
            sum + (item.kind === "electives" && item.pool === "specialization" ? item.count : 0),
          0,
        );
      expect(slots, programme.slug).toBe(programme.electivesToPick);
    }
  });

  it("offers every elective slot enough courses to fill it", () => {
    for (const programme of PROGRAMMES) {
      const options = electiveOptions(programme);
      for (const item of STUDY_PLANS[programme.slug].flatMap((semester) => semester.items)) {
        if (item.kind === "electives") {
          expect(options[item.pool].length, programme.slug).toBeGreaterThanOrEqual(item.count);
        }
      }
    }
  });

  it("covers four years, ending after Year 4 Semester 1", () => {
    for (const programme of PROGRAMMES) {
      const { years } = studyPlan(programme);
      expect(years.map((year) => year.year)).toEqual([1, 2, 3, 4]);
      expect(years[3].semesters[1]).toBeNull();
    }
  });

  it("marks the industry semesters", () => {
    const industry = (slug: string) =>
      studyPlan(getProgramme(slug)!)
        .years.flatMap((year) =>
          year.semesters.map((semester) =>
            semester?.industry ? `Y${year.year}S${semester.semester}` : null,
          ),
        )
        .filter(Boolean);
    expect(industry("ai")).toEqual(["Y3S1"]);
    expect(industry("ds")).toEqual(["Y3S2", "Y4S1"]);
  });
});
