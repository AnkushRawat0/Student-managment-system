"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudentsStore } from "@/store/studentStore";
import { Student } from "@/types/student";

interface EditStudentModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

export function EditStudentModal({ student, isOpen, onClose }: EditStudentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "", 
    age: "",
    course: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { updateStudent, isLoading } = useStudentsStore();

  // Pre-fill form when modal opens or student changes
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.user.name,
        email: student.user.email,
        age: student.age.toString(),
        course: student.course
      });
      setErrors({});
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await updateStudent(student.id, {
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age),
        course: formData.course
      });
      onClose();
    } catch (error: any) {
      if (error.fieldErrors) {
        setErrors(error.fieldErrors);
      } else {
        setErrors({ general: error.message || "Failed to update student" });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="text-red-500 text-sm">{errors.general}</div>
            )}
            
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Student name"
                disabled={isLoading}
              />
              {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@example.com"
                disabled={isLoading}
              />
              {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                placeholder="Age"
                min="16"
                max="100"
                disabled={isLoading}
              />
              {errors.age && <div className="text-red-500 text-sm">{errors.age}</div>}
            </div>

            <div>
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                name="course"
                type="text"
                value={formData.course}
                onChange={handleChange}
                placeholder="Course name"
                disabled={isLoading}
              />
              {errors.course && <div className="text-red-500 text-sm">{errors.course}</div>}
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
                type="submit" 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Student"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
