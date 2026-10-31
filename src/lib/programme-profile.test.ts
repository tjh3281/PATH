import { describe, expect, it } from "vitest";

import { COURSES } from "@/data/courses";
import { getProgramme, PROGRAMMES } from "@/data/programmes";
import { programmeCourses, programmeProfile } from "@/lib/programme-profile";

describe("curriculum data", () => {
  it("has unique course codes", () => {
    const codes = COURSES.map((course) => course.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("only references courses that exist", () => {
    for (const programme of PROGRAMMES) {
      expect(() => programmeCourses(programme)).not.toThrow();
    }
  });

  it("has a one-line summary for every course a programme lists", () => {
    for (const programme of PROGRAMMES) {
      for (const course of programmeCourses(programme)) {
        expect(course.summary, course.code).not.toBe("");
      }
    }
  });

  it("marks only elective options as electives", () => {
    const courses = programmeCourses(getProgramme("ds")!);
    expect(courses.find((c) => c.code === "WIA2001")?.elective).toBe(false);
    expect(courses.find((c) => c.code === "WIX3001")?.elective).toBe(true);
    expect(courses.find((c) => c.code === "WIH2001")?.elective).toBe(true);
  });

  it("lists the programmes in tab order", () => {
    expect(PROGRAMMES.map((programme) => programme.slug)).toEqual([
      "ai",
      "se",
      "csn",
      "mm",
      "ds",
      "is",
    ]);
  });
});

describe("programmeProfile", () => {
  it("adds slice counts up to the total and shares up to 1", () => {
    for (const programme of PROGRAMMES) {
      const { total, slices } = programmeProfile(programme);
      expect(slices.reduce((sum, slice) => sum + slice.count, 0)).toBe(total);
      expect(slices.reduce((sum, slice) => sum + slice.share, 0)).toBeCloseTo(1);
      for (const slice of slices) expect(slice.courses).toHaveLength(slice.count);
    }
  });

  it("leaves out university courses and projects", () => {
    const { slices } = programmeProfile(getProgramme("ai")!);
    expect(slices.map((slice) => slice.label.kind)).not.toContain("general");
  });

  it.each([
    ["ai", "ai"],
    ["se", "software-eng"],
    ["csn", "systems"],
    ["ds", "data"],
    ["mm", "media"],
  ])("puts the signature label of %s first", (slug, labelId) => {
    expect(programmeProfile(getProgramme(slug)!).slices[0].label.id).toBe(labelId);
  });
});
