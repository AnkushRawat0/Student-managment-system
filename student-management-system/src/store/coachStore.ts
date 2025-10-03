import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Coach {
  id: string;
  userId: string;
  subject: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
  courseAssignments?: CourseAssignment[];
  totalStudents?: number;
}

export interface CourseAssignment {
  id: string;
  courseId: string;
  coachId: string;
  assignedAt: string;
  course: {
    id: string;
    name: string;
    currentStudents: number;
  };
}

export interface CoachFilters {
  search: string;
  subject: string;
}

interface CoachState {
  // Data
  coaches: Coach[];
  loading: boolean;
  error: string | null;
  
  // UI State
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  selectedCoach: Coach | null;
  filters: CoachFilters;
  
  // Actions
  fetchCoaches: () => Promise<void>;
  addCoach: (coachData: any) => Promise<void>;
  updateCoach: (id: string, coachData: any) => Promise<void>;
  deleteCoach: (id: string) => Promise<void>;
  assignCourseToCoach: (coachId: string, courseId: string) => Promise<void>;
  unassignCourseFromCoach: (coachId: string, courseId: string) => Promise<void>;
  
  // UI Actions
  setAddModalOpen: (open: boolean) => void;
  setEditModalOpen: (open: boolean) => void;
  setDeleteModalOpen: (open: boolean) => void;
  setSelectedCoach: (coach: Coach | null) => void;
  setFilters: (filters: Partial<CoachFilters>) => void;
  clearError: () => void;
}

export const useCoachStore = create<CoachState>()(
  persist(
    (set, get) => ({
      // Initial State
      coaches: [],
      loading: false,
      error: null,
      isAddModalOpen: false,
      isEditModalOpen: false,
      isDeleteModalOpen: false,
      selectedCoach: null,
      filters: {
        search: '',
        subject: 'all'
      },

      // Fetch Coaches
      fetchCoaches: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/coaches');
          if (!response.ok) throw new Error('Failed to fetch coaches');
          
          const data = await response.json();
          set({ coaches: data.coaches, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      // Add Coach
      addCoach: async (coachData: any) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/coaches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(coachData),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add coach');
          }
          
          const data = await response.json();
          set(state => ({
            coaches: [...state.coaches, data.coach],
            loading: false,
            isAddModalOpen: false
          }));
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Update Coach
      updateCoach: async (id: string, coachData: any) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/coaches/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(coachData),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update coach');
          }
          
          const data = await response.json();
          set(state => ({
            coaches: state.coaches.map(coach => 
              coach.id === id ? data.coach : coach
            ),
            loading: false,
            isEditModalOpen: false,
            selectedCoach: null
          }));
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Delete Coach
      deleteCoach: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/coaches/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete coach');
          }
          
          set(state => ({
            coaches: state.coaches.filter(coach => coach.id !== id),
            loading: false,
            isDeleteModalOpen: false,
            selectedCoach: null
          }));
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Assign Course to Coach
      assignCourseToCoach: async (coachId: string, courseId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/coaches/assign-course', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coachId, courseId }),
          });
          
          if (!response.ok) throw new Error('Failed to assign course');
          
          // Refresh coaches to get updated data
          await get().fetchCoaches();
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      // Unassign Course from Coach
      unassignCourseFromCoach: async (coachId: string, courseId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/coaches/unassign-course', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coachId, courseId }),
          });
          
          if (!response.ok) throw new Error('Failed to unassign course');
          
          // Refresh coaches to get updated data
          await get().fetchCoaches();
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      // UI Actions
      setAddModalOpen: (open: boolean) => set({ isAddModalOpen: open }),
      setEditModalOpen: (open: boolean) => set({ isEditModalOpen: open }),
      setDeleteModalOpen: (open: boolean) => set({ isDeleteModalOpen: open }),
      setSelectedCoach: (coach: Coach | null) => set({ selectedCoach: coach }),
      setFilters: (filters: Partial<CoachFilters>) => 
        set(state => ({ filters: { ...state.filters, ...filters } })),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'coach-storage',
      partialize: (state) => ({
        coaches: state.coaches,
        filters: state.filters,
      }),
    }
  )
);