"use client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StudentsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    age: "",
    course: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  useEffect(() => {
    // Give some time for auth state to load
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push("/");
      } else if (user?.role !== "ADMIN") {
        router.push("/dashboard");
      } else {
        setIsLoading(false); // Auth is good, stop loading
      }
    }, 1000); // Wait 1 second for auth state

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/students");
        const data = await response.json();
        setStudents(data.students || []);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    if (!isLoading && user?.role === "ADMIN") {
      fetchStudents();
    }
  }, [isLoading, user]);

  // Show loading while checking auth
  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show access denied for non-admins
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
      </div>

      <p className="text-gray-600">Manage all students in the system</p>

      {/* Debug info - we can remove this later */}
      <div className="bg-green-100 p-4 rounded-md">
        <p className="text-green-800">
          ✅ Successfully loaded! User: {user.name} | Role: {user.role}
        </p>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add a new Student </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={newStudent.name}
              onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
              placeholder="Enter student's full name"
            />
          </div>
           <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={newStudent.email}
              onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
              placeholder="Enter student's email"
            />
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={newStudent.age}
              onChange={(e) => setNewStudent({...newStudent, age: e.target.value})}
              placeholder="Enter student's age"
            />
          </div>
           <div>
            <Label htmlFor="course">Course</Label>
            <Input
              id="course"
              type="text"
              value={newStudent.course}
              onChange={(e) => setNewStudent({...newStudent, course: e.target.value})}
              placeholder="e.g., Web Development, Data Science"
            />
          </div>
           <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => {
                setShowAddModal(false);
                setNewStudent({ name: '', email: '', age: '', course: '' });
              }}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
             <Button 
              onClick={() => {
                // We'll add the submit logic here next
                console.log('Creating student:', newStudent);
              }}
              className="flex-1"
            >
              Add Student
            </Button>
            </div>
        </div>


              
            </CardContent>

          </Card>
        </div>
      )}

      {/* Students Table Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">All Students</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
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
              {isLoadingStudents ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Loading students...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No students found. Click "Add Student" to create the first
                    one.
                  </td>
                </tr>
              ) : (
                students.map((student: any) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.enrollmentDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
