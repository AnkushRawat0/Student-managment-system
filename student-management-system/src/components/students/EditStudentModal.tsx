"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudentsStore } from "@/store/studentStore";
import { Student } from "@/types/student";

// Course type
interface Course {
  id: string;
  name: string;
  description: string;
  status: string;
}

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
    courseId: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  const { updateStudent, isLoading } = useStudentsStore();

  // Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        // Only show ACTIVE courses for student enrollment
        const activeCourses = data.courses.filter((course: Course) => course.status === 'ACTIVE');
        setCourses(activeCourses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    };

    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  // Pre-fill form when modal opens or student changes
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.user.name,
        email: student.user.email,
        age: student.age.toString(),
        courseId: student.courseId || ""
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
        courseId: formData.courseId
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
              <Label htmlFor="courseId">Course</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.courseId ? "border-red-500" : ""}>
                  <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Select a course"} />
                </SelectTrigger>
                <SelectContent>
                  {courses.length === 0 && !loadingCourses ? (
                    <SelectItem value="no-courses" disabled>
                      No active courses available
                    </SelectItem>
                  ) : (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{course.name}</span>
                          <span className="text-sm text-gray-500 truncate">{course.description}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.courseId && <div className="text-red-500 text-sm">{errors.courseId}</div>}
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
