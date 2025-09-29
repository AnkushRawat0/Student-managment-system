"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Users, User } from "lucide-react";
import { useCoursesStore } from "@/store/courseStore";
import { Course } from "@/types/course";

interface DeleteCourseModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

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

export function DeleteCourseModal({ course, isOpen, onClose }: DeleteCourseModalProps) {
  const { deleteCourse, isLoading } = useCoursesStore();

  const handleDelete = async () => {
    try {
      await deleteCourse(course.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete course:", error);
      // Error handling is done in the store
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-lg">Delete Course</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-gray-600">
            <p>Are you sure you want to delete this course?</p>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
              {/* Course Name */}
              <div>
                <p className="font-medium text-gray-900 text-lg">{course.name}</p>
                <p className="text-sm text-gray-600 mt-1">{course.description}</p>
              </div>
              
              {/* Course Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{course.instructor}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{course.duration} weeks</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {course.currentStudents || 0}/{course.maxStudents} students
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(course.status)}>
                    {course.status}
                  </Badge>
                </div>
              </div>
              
              {/* Start Date */}
              <div className="text-sm text-gray-600">
                <strong>Start Date:</strong> {new Date(course.startDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">
                <strong>Warning:</strong> This action cannot be undone. The course and all its associated data will be permanently removed from the system.
              </p>
              
              {(course.currentStudents && course.currentStudents > 0) && (
                <p className="text-sm text-red-600 mt-2">
                  <strong>Note:</strong> This course currently has {course.currentStudents} enrolled student(s). 
                  Consider moving them to another course before deletion.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Course"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}