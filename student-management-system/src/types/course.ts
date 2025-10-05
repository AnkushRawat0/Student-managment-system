export interface Course {
  id: string;
  name: string;
  description: string;
  coachId: string | null;
  duration: number; // in weeks
  maxStudents: number;
  currentStudents: number;
  startDate: Date;
  endDate: Date;
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
  coach?: {
    id: string;
    subject: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  students?: {
    id: string;
    age: number;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];
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
  coachId: string;
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