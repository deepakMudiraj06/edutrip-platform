import { z } from "zod";

const optionalText = (label: string) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().trim().min(1, `${label} cannot be blank.`).nullable(),
  );

const optionalSchoolId = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.uuid("Choose a valid school.").nullable(),
);

export const studentProfileSchema = z.object({
  studentNumber: optionalText("Student number"),
  gradeLevel: optionalText("Grade level"),
  schoolId: optionalSchoolId,
});
