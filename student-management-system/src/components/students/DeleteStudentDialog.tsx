"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useStudentsStore } from "@/store/studentStore";
import { Student } from "@/types/student";

interface DeleteStudentDialogProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteStudentDialog({ student, isOpen, onClose }: DeleteStudentDialogProps) {
  const { deleteStudent, isLoading } = useStudentsStore();

  const handleDelete = async () => {
    try {
      await deleteStudent(student.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete student:", error);
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
            <CardTitle className="text-lg">Delete Student</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-gray-600">
            <p>Are you sure you want to delete this student?</p>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{student.user.name}</p>
              <p className="text-sm text-gray-600">{student.user.email}</p>
              <p className="text-sm text-gray-600">Course: {student.course}</p>
            </div>
            <p className="mt-3 text-sm text-red-600">
              <strong>Warning:</strong> This action cannot be undone. The student's account and all associated data will be permanently removed.
            </p>
          </div>

          <div className="flex gap-2">
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
              {isLoading ? "Deleting..." : "Delete Student"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}