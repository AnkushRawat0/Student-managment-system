import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Course, CourseFormData, CourseFilters } from "@/types/course";
import { CourseFiltersData } from "@/lib/validation";

interface CourseState {
  // Data state
  courses: Course[];
  filteredCourses: Course[];
  selectedCourse: Course | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  showAddModal: boolean;
  showEditModal: boolean;
  showDeleteDialog: boolean;

  // Filter state
  filters: CourseFiltersData;
  
  // Actions
  fetchCourses: () => Promise<void>;
  createCourse: (data: CourseFormData) => Promise<void>;
  updateCourse: (id: string, data: Partial<CourseFormData>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  
  // UI Actions
  setShowAddModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteDialog: (show: boolean) => void;
  setSelectedCourse: (course: Course | null) => void;
  
  // Filter Actions
  setFilters: (filters: Partial<CourseFiltersData>) => void;
  applyFilters: () => void;
  clearError: () => void;
}


export const useCoursesStore = create<CourseState>()(
  persist(
    (set, get) => ({
      // Initial state
      courses: [],
      filteredCourses: [],
      selectedCourse: null,
      isLoading: false,
      error: null,
      showAddModal: false,
      showEditModal: false,
      showDeleteDialog: false,
      filters: {},
       // Fetch all courses
      fetchCourses: async () => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams();
          const { filters } = get();
          
          if (filters.searchTerm) params.append("searchTerm", filters.searchTerm);
          if (filters.status) params.append("status", filters.status);
          if (filters.instructor) params.append("instructor", filters.instructor);

          const response = await fetch(`/api/courses?${params.toString()}`);
          if (!response.ok) throw new Error("Failed to fetch courses");
          
          const data = await response.json();
          set({ 
            courses: data.courses, 
            filteredCourses: data.courses,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || "Failed to fetch courses", 
            isLoading: false 
          });
            }
      },

      // Create new course
      createCourse: async (data: CourseFormData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/courses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json();
            if (errorData.fieldErrors) {
              throw { fieldErrors: errorData.fieldErrors };
            }
            throw new Error(errorData.error || "Failed to create course");
          }
             const { course } = await response.json();
          set((state) => ({
            courses: [course, ...state.courses],
            filteredCourses: [course, ...state.filteredCourses],
            isLoading: false,
            showAddModal: false,
          }));
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },
        // Update existing course
      updateCourse: async (id: string, data: Partial<CourseFormData>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/courses/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json();
            if (errorData.fieldErrors) {
              throw { fieldErrors: errorData.fieldErrors };
            }
            throw new Error(errorData.error || "Failed to update course");
          }
           const { course } = await response.json();
          set((state) => ({
            courses: state.courses.map((c) => (c.id === id ? course : c)),
            filteredCourses: state.filteredCourses.map((c) => (c.id === id ? course : c)),
            isLoading: false,
            showEditModal: false,
          }));
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      // Delete course
      deleteCourse: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/courses/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete course");
          }

          set((state) => ({
            courses: state.courses.filter((c) => c.id !== id),
            filteredCourses: state.filteredCourses.filter((c) => c.id !== id),
            isLoading: false,
            showDeleteDialog: false,
            selectedCourse: null,
          }));
        } catch (error: any) {
             set({ 
            error: error.message || "Failed to delete course", 
            isLoading: false 
          });
        }
      },

      // UI Actions
      setShowAddModal: (show: boolean) => set({ showAddModal: show }),
      setShowEditModal: (show: boolean) => set({ showEditModal: show }),
      setShowDeleteDialog: (show: boolean) => set({ showDeleteDialog: show }),
      setSelectedCourse: (course: Course | null) => set({ selectedCourse: course }),

      // Filter Actions
      setFilters: (newFilters: Partial<CourseFiltersData>) => {
        set((state) => {
          const updatedFilters = { ...state.filters, ...newFilters };
          return { filters: updatedFilters };
        });
        get().applyFilters();
      },
  applyFilters: () => {
        const { courses, filters } = get();
        let filtered = [...courses];

        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          filtered = filtered.filter(
            (course) =>
              course.name.toLowerCase().includes(searchLower) ||
              course.description.toLowerCase().includes(searchLower) ||
              course.instructor.toLowerCase().includes(searchLower)
          );
        }
 if (filters.status) {
          filtered = filtered.filter((course) => course.status === filters.status);
        }

        if (filters.instructor) {
          const instructorLower = filters.instructor.toLowerCase();
          filtered = filtered.filter((course) =>
            course.instructor.toLowerCase().includes(instructorLower)
          );
        }

        set({ filteredCourses: filtered });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "course-store",
      partialize: (state) => ({ 
        courses: state.courses,
        filters: state.filters 
      }),
    }
  )
);

