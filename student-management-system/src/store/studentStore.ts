import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Student, StudentFormData, StudentFilters } from "@/types/student";
import { studentSchema } from "@/lib/validation";

interface StudentsStore {
  // Data State
  students: Student[];
  filteredStudents: Student[];
  
  // UI State  
  isLoading: boolean;
  error: string | null;
  
  // Filter State (persisted)
  filters: StudentFilters;
  
  // Modal State
  showAddModal: boolean;
  showEditModal: boolean;
  showDeleteDialog: boolean;
  selectedStudent: Student | null;
  
  // Actions - Data Management
  fetchStudents: () => Promise<void>;
  createStudent: (data: StudentFormData) => Promise<void>;
  updateStudent: (id: string, data: Partial<StudentFormData>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
  // Actions - Filtering
  setFilters: (filters: Partial<StudentFilters>) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  
  // Actions - UI State
  setShowAddModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteDialog: (show: boolean) => void;
  setSelectedStudent: (student: Student | null) => void;
  clearError: () => void;
}

export const useStudentsStore = create<StudentsStore>()(
  persist(
    (set, get) => ({
      // Initial State
      students: [],
      filteredStudents: [],
      isLoading: false,
      error: null,
      filters: {
        searchTerm: "",
        course: "all",
        minAge: undefined,
        maxAge: undefined,
      },
      showAddModal: false,
      showEditModal: false,
      showDeleteDialog: false,
      selectedStudent: null,

      // Data Actions
      fetchStudents: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/students');
          if (!response.ok) throw new Error('Failed to fetch students');
          
          const data = await response.json();
          set({ students: data.students || [], isLoading: false });
          get().applyFilters(); // Apply current filters
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      createStudent: async (data: StudentFormData) => {
        set({ isLoading: true, error: null });
        try {
          // Validate data
          const validatedData = studentSchema.parse(data);
          
          const response = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validatedData),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create student');
          }

          // Refresh students list
          await get().fetchStudents();
          set({ showAddModal: false, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      updateStudent: async (id: string, data: Partial<StudentFormData>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update student');
          }

          await get().fetchStudents();
          set({ showEditModal: false, selectedStudent: null, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      deleteStudent: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/students/${id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete student');
          }

          await get().fetchStudents();
          set({ 
            showDeleteDialog: false, 
            selectedStudent: null, 
            isLoading: false 
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      // Filter Actions
      setFilters: (newFilters: Partial<StudentFilters>) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        set({ filters: updatedFilters });
        get().applyFilters();
      },

      clearFilters: () => {
        set({ 
          filters: { 
            searchTerm: "", 
            course: "all", 
            minAge: undefined, 
            maxAge: undefined 
          } 
        });
        get().applyFilters();
      },

      applyFilters: () => {
        const { students, filters } = get();
        let filtered = [...students];

        // Search filter
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          filtered = filtered.filter((student) =>
            student.user.name.toLowerCase().includes(searchLower) ||
            student.user.email.toLowerCase().includes(searchLower) ||
            student.course?.name.toLowerCase().includes(searchLower)
          );
        }

        // Course filter
        if (filters.course && filters.course !== "all") {
          filtered = filtered.filter((student) =>
            student.course?.name.toLowerCase().includes(filters.course.toLowerCase()) || 
             student.course?.id === filters.course
          );
        }

        // Age filters
        if (filters.minAge !== undefined) {
          filtered = filtered.filter((student) => student.age >= filters.minAge!);
        }
        if (filters.maxAge !== undefined) {
          filtered = filtered.filter((student) => student.age <= filters.maxAge!);
        }

        set({ filteredStudents: filtered });
      },

      // UI Actions
      setShowAddModal: (show: boolean) => set({ showAddModal: show }),
      setShowEditModal: (show: boolean) => set({ showEditModal: show }),
      setShowDeleteDialog: (show: boolean) => set({ showDeleteDialog: show }),
      setSelectedStudent: (student: Student | null) => set({ selectedStudent: student }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'students-storage',
      partialize: (state) => ({ 
        filters: state.filters // Only persist filters
      }),
    }
  )
);