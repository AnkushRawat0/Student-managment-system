"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Users, Calendar } from "lucide-react";
import { useCoursesStore } from "@/store/courseStore";
import { Course } from "@/types/course";

const getStatusColor = (status: string) => {
  switch (status) {
    case "DRAFT":
      return "bg-gray-100 text-gray-800";
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "COMPLETED":
      return "bg-blue-100 text-blue-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function CourseTable() {
  const {
    filteredCourses,
    isLoading,
    setShowAddModal,
    setShowEditModal,
    setShowDeleteDialog,
    setSelectedCourse,
  } = useCoursesStore();

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteDialog(true);
  };

  const handleViewCourse = (course: Course) => {
    // For now, just log - we'll implement course details view later
    console.log("View course details:", course);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">
            All Courses ({filteredCourses.length})
          </CardTitle>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Course Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Instructor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Duration</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Capacity</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Start Date</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-gray-500">Loading courses...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="text-gray-500">
                      <p className="text-lg mb-2">No courses found</p>
                      <p className="text-sm">
                        Try adjusting your search filters or{" "}
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          add a new course
                        </button>
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {course.name}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                          {course.description}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {course.coach?.user.name || 'No coach assigned'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{course.duration} weeks</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{course.currentStudents || 0}/{course.maxStudents}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(course.status)}>
                        {course.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(course.startDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCourse(course)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCourse(course)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCourse(course)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}