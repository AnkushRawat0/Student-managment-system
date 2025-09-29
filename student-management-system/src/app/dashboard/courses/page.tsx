"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCoursesStore } from "@/store/courseStore";
import { CourseFilter } from "@/components/courses/CourseFilter";
import { CourseTable } from "@/components/courses/CourseTable";
import { AddCourseModal } from "@/components/courses/AddCourseModal";
import { EditCourseModal } from "@/components/courses/EditCourseModal";
import { DeleteCourseModal } from "@/components/courses/DeleteCourseModal";

export default function CoursesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { fetchCourses, error, clearError, showEditModal, selectedCourse, setShowEditModal, showDeleteDialog, setShowDeleteDialog } = useCoursesStore();
  const router = useRouter();
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Wait for auth state to hydrate from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Authentication and authorization check
  useEffect(() => {
    if (!isAuthReady) return;

    console.log('Auth check - isAuthenticated:', isAuthenticated, 'user:', user, 'role:', user?.role);
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to /');
      router.push("/");
    } else if (user?.role !== "ADMIN") {
      console.log('User is not admin, role:', user?.role, 'redirecting to /dashboard');
      router.push("/dashboard");
    } else {
      console.log('User is admin, staying on courses page');
    }
  }, [isAuthReady, isAuthenticated, user, router]);

  // Fetch courses on mount
  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchCourses();
    }
  }, [user, fetchCourses]);

  // Loading state while checking auth
  if (!isAuthReady || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Access denied for non-admins
  if (user.role !== "ADMIN") {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">
          Only administrators can access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
        <p className="text-gray-600 mt-2">
          Manage all courses in the system with advanced search and filtering.
        </p>
      </div>

      {/* Global Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex justify-between items-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <CourseFilter />

      {/* Courses Table */}
      <CourseTable />

      {/* Modals */}
      <AddCourseModal />
      {selectedCourse && (
        <EditCourseModal 
          course={selectedCourse}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
      {selectedCourse && (
        <DeleteCourseModal 
          course={selectedCourse}
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}