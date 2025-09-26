"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function StudentsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give some time for auth state to load
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push('/');
      } else if (user?.role !== 'ADMIN') {
        router.push('/dashboard');
      } else {
        setIsLoading(false); // Auth is good, stop loading
      }
    }, 1000); // Wait 1 second for auth state

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  // Show loading while checking auth
  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show access denied for non-admins
  if (user.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">Only administrators can access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
      </div>
      
      <p className="text-gray-600">Manage all students in the system</p>
      
      {/* Debug info - we can remove this later */}
      <div className="bg-green-100 p-4 rounded-md">
        <p className="text-green-800">✅ Successfully loaded! User: {user.name} | Role: {user.role}</p>
      </div>

      {/* Students Table Section */}
<div className="bg-white rounded-lg shadow">
  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
    <h2 className="text-xl font-semibold text-gray-900">All Students</h2>
    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Add Student
    </button>
  </div>

  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Email
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Course
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Age
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Enrolled
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
 <tbody className="bg-white divide-y divide-gray-200">
        {/* Sample student data - we'll make this dynamic later */}
        <tr>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            John Doe
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            john@example.com
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            Web Development
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            25
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            Jan 15, 2025
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
            <button className="text-blue-600 hover:text-blue-900">Edit</button>
            <button className="text-red-600 hover:text-red-900">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>


    </div>
  );
}