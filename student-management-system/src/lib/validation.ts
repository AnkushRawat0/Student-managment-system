import { z } from "zod";

//user validation schema
export const loginSchmea = z.object({
  email: z.string().email("invalid email address"),
  password: z.string().min(6, "password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "COACH", "STUDENT"]),
});

//student validation schema

export const studentSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email format").toLowerCase(),
  age: z
    .number()
    .min(16, "Age must be at least 16")
    .max(100, "Age must be less than 100"),
  course: z
    .string()
    .min(1, "Course is required")
    .max(100, "Course name too long"),
});

// Student update schema (all fields optional)
export const updateStudentSchema = studentSchema.partial();


// Search and filter schema
export const studentFiltersSchema = z.object({
  searchTerm: z.string().optional(),
  course: z.string().optional(),
  minAge: z.number().min(0).optional(),
  maxAge: z.number().max(150).optional(),
});

// Course validation schemas
export const courseSchema = z.object({
  name: z
    .string()
    .min(2, "Course name must be at least 2 characters")
    .max(100, "Course name must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  instructor: z
    .string()
    .min(2, "Instructor name must be at least 2 characters")
    .max(50, "Instructor name must be less than 50 characters"),
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
  searchTerm: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  instructor: z.string().optional(),
});

//export types
export type LoginInput = z.infer<typeof loginSchmea>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type StudentFormData = z.infer<typeof studentSchema>;
export type UpdateStudentData = z.infer<typeof updateStudentSchema>;
export type StudentFiltersData = z.infer<typeof studentFiltersSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type CourseFormData = z.infer<typeof courseSchema>;
export type UpdateCourseData = z.infer<typeof updateCourseSchema>;
export type CourseFiltersData = z.infer<typeof courseFiltersSchema>;
