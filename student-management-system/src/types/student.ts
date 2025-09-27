// Base student interface matching our Prisma schema
export interface Student {
  id: string;
  userId: string;
  age: number;
  course: string;
  enrollmentDate: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Form data for creating/updating students
export interface StudentFormData {
  name: string;
  email: string;
  age: number;
  course: string;
}

// API response types
export interface StudentsResponse {
  students: Student[];
}

export interface StudentResponse {
  student: Student;
}

// Filter and search types
export interface StudentFilters {
  searchTerm: string;
  course: string;
  minAge?: number;
  maxAge?: number;
}

// UI state types
export interface StudentUIState {
  showAddModal: boolean;
  showEditModal: boolean;
  showDeleteDialog: boolean;
  selectedStudent: Student | null;
  isLoading: boolean;
  error: string | null;
}