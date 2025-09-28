"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function CoursesPage() {
  const { user, isAuthenticated } = useAuthStore();
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

    if (!isAuthenticated) {
      router.push("/");
    } else if (user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [isAuthReady, isAuthenticated, user, router]);

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

      {/* Temporary content - we'll replace this with actual components */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Course management interface coming soon...</p>
      </div>
    </div>
  );
}