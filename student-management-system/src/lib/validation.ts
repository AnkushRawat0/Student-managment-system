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
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(16, "Age must be at least 16").max(100, "invalid age "),
  course: z.string().min(1, "Course required"),
  enrollmentDate: z.date(),
});

//export types
export type LoginInput = z.infer<typeof loginSchmea>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
