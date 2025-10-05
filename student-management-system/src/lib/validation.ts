import { z } from "zod";
import { sanitizeName, sanitizeEmail, sanitizeText } from "./sanitize";

// Enhanced string validation with sanitization
const createSanitizedStringSchema = (
  sanitizer: (input: string) => string,
  minLength: number = 1,
  maxLength: number = 255,
  fieldName: string = "Field"
) =>
  z
    .string()
    .trim()
    .min(minLength, `${fieldName} must be at least ${minLength} characters`)
    .max(maxLength, `${fieldName} must be less than ${maxLength} characters`)
    .transform(sanitizer);

// Enhanced email validation with sanitization
const emailSchema = z
  .string()
  .trim()
  .email("Invalid email format")
  .toLowerCase()
  .transform(sanitizeEmail);

//user validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: createSanitizedStringSchema(sanitizeName, 2, 50, "Name"),
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "COACH", "STUDENT"]),
});

//student validation schema
export const studentSchema = z.object({
  name: createSanitizedStringSchema(sanitizeName, 2, 50, "Name"),
  email: emailSchema,
  age: z
    .number()
    .min(16, "Age must be at least 16")
    .max(100, "Age must be less than 100"),
  courseId: z
    .string()
    .min(1, "Course selection is required"),
});

// Student update schema (all fields optional)
export const updateStudentSchema = studentSchema.partial();


// Search and filter schema
export const studentFiltersSchema = z.object({
  searchTerm: z.string().transform((input) => sanitizeText(input)).optional(),
  course: z.string().optional(),
  minAge: z.number().min(0).optional(),
  maxAge: z.number().max(150).optional(),
});

// Course validation schemas
export const courseSchema = z.object({
  name: createSanitizedStringSchema(sanitizeText, 2, 100, "Course name"),
  description: createSanitizedStringSchema(sanitizeText, 10, 500, "Description"),
  coachId: z
    .string()
    .min(1, "Coach selection is required"),
  duration: z
    .number()
    .min(1, "Duration must be at least 1 week")
    .max(52, "Duration cannot exceed 52 weeks"),
  maxStudents: z
    .number()
    .min(1, "Must allow at least 1 student")
    .max(100, "Cannot exceed 100 students"),
  startDate: z.string().min(1, "Start date is required").transform((str) => new Date(str)),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"]),
});

// Course update schema (all fields optional)
export const updateCourseSchema = courseSchema.partial();

// Course filters schema
export const courseFiltersSchema = z.object({
  searchTerm: z.string().transform((input) => sanitizeText(input)).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  coachId: z.string().optional(),
});

// Coach validation schemas
export const coachSchema = z.object({
  name: createSanitizedStringSchema(sanitizeName, 2, 50, "Name"),
  email: emailSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
  subject: createSanitizedStringSchema(sanitizeText, 2, 100, "Subject"),
});

// Coach assignment schema (for assigning existing users to coach roles)
export const coachAssignmentSchema = z.object({
  userId: z.string().min(1, "User selection is required"),
  subject: createSanitizedStringSchema(sanitizeText, 2, 100, "Subject"),
});

// Coach update schema (all fields optional except password which should be handled separately)
export const updateCoachSchema = z.object({
  name: createSanitizedStringSchema(sanitizeName, 2, 50, "Name").optional(),
  email: emailSchema.optional(),
  subject: createSanitizedStringSchema(sanitizeText, 2, 100, "Subject").optional(),
});

// Coach filters schema
export const coachFiltersSchema = z.object({
  searchTerm: z.string().transform((input) => sanitizeText(input)).optional(),
  subject: z.string().transform((input) => sanitizeText(input)).optional(),
});

// Course assignment schema
export const courseAssignmentSchema = z.object({
  coachId: z.string().min(1, "Coach ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
});

//export types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type StudentFormData = z.infer<typeof studentSchema>;
export type UpdateStudentData = z.infer<typeof updateStudentSchema>;
export type StudentFiltersData = z.infer<typeof studentFiltersSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type CourseFormData = z.infer<typeof courseSchema>;
export type UpdateCourseData = z.infer<typeof updateCourseSchema>;
export type CourseFiltersData = z.infer<typeof courseFiltersSchema>;
export type CoachInput = z.infer<typeof coachSchema>;
export type CoachFormData = z.infer<typeof coachSchema>;
export type UpdateCoachData = z.infer<typeof updateCoachSchema>;
export type CoachFiltersData = z.infer<typeof coachFiltersSchema>;
export type CoachAssignmentData = z.infer<typeof coachAssignmentSchema>;
export type CourseAssignmentData = z.infer<typeof courseAssignmentSchema>;
