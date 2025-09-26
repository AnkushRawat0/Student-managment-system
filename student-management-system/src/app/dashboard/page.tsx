"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold p-8">
        Welcome to Dashboard, {user.name}!
      </h1>
      <p className="px-8 text-gray-600">Role: {user.role}</p>
      
      {/* Different content based on role */}
      {user.role === 'ADMIN' && (
        <div className="p-8">
          <h2 className="text-xl font-semibold">Admin Dashboard</h2>
          <p>You can manage students, courses, and system settings.</p>
        </div>
      )}
      
      {user.role === 'STUDENT' && (
        <div className="p-8">
          <h2 className="text-xl font-semibold">Student Dashboard</h2>
          <p>View your courses and assignments.</p>
        </div>
      )}
      
      {user.role === 'COACH' && (
        <div className="p-8">
          <h2 className="text-xl font-semibold">Coach Dashboard</h2>
          <p>Manage your assigned students.</p>
        </div>
      )}
    </div>
  );
}