"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudentsStore } from "@/store/studentStore";
import { StudentFormData } from "@/types/student";

// Form validation errors type
interface FormErrors {
  name?: string;
  email?: string;
  age?: string;
  courseId?: string;
}

// Course type
interface Course {
  id: string;
  name: string;
  description: string;
  status: string;
}

export function AddStudentModal() {
  const { 
    showAddModal, 
    setShowAddModal, 
    createStudent, 
    isLoading, 
    error 
  } = useStudentsStore();

  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    email: "",
    age: 0,
    courseId: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

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

    if (showAddModal) {
      fetchCourses();
    }
  }, [showAddModal]);

  const handleInputChange = (field: keyof StudentFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.courseId.trim()) newErrors.courseId = "Course selection is required";
    if (formData.age < 16) newErrors.age = "Age must be at least 16";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    await createStudent(formData);
    
    // Reset form if successful (no error)
    if (!error) {
      setFormData({ name: "", email: "", age: 0, courseId: "" });
      setErrors({});
    }
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setFormData({ name: "", email: "", age: 0, courseId: "" });
    setErrors({});
  };

  if (!showAddModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Add New Student</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter student's full name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter student's email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ''}
                onChange={(e) => handleInputChange("age", parseInt(e.target.value) || 0)}
                placeholder="Enter student's age"
                min="16"
                max="100"
                className={errors.age ? "border-red-500" : ""}
              />
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
            </div>

            <div>
              <Label htmlFor="courseId">Course *</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) => handleInputChange("courseId", value)}
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
              {errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId}</p>}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Student"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}