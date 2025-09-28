export interface Course {
  id: string;
  name: string;
  description: string;
  instructor: string;
  duration: number; // in weeks
  maxStudents: number;
  currentStudents: number;
  startDate: Date;
  endDate: Date;
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum CourseStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE", 
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export interface CourseFormData {
  name: string;
  description: string;
  instructor: string;
  duration: number;
  maxStudents: number;
  startDate: Date;
  status: CourseStatus;
}

export interface CourseFilters {
  searchTerm?: string;
  status?: CourseStatus;
  instructor?: string;
}