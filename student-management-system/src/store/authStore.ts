import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STUDENT" | "COACH";
}

interface AuthState {
  //state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  //actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

// Create the Zustand store
export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  // Actions
  login: async (email: string, password: string) => {
    set({ isLoading: true })
    
    try {
      // Call real API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }
      
      // Login successful
      set({ 
        user: data.user, 
        isAuthenticated: true, 
        isLoading: false 
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },
  
  logout: () => {
    set({ 
      user: null, 
      isAuthenticated: false 
    })
  },
  
  setUser: (user: User) => {
    set({ 
      user, 
      isAuthenticated: true 
    })
  },
   setLoading: (isLoading: boolean) => {
    set({ isLoading })
  }
}))

export type { User, AuthState }