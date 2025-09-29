"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCoursesStore } from "@/store/courseStore";
import { CourseStatus } from "@/types/course";

export function AddCourseModal() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    instructor: "",
    duration: "",
    maxStudents: "",
    startDate: "",
    status: CourseStatus.DRAFT
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { createCourse, isLoading, showAddModal, setShowAddModal } = useCoursesStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await createCourse({
        name: formData.name,
        description: formData.description,
        instructor: formData.instructor,
        duration: parseInt(formData.duration),
        maxStudents: parseInt(formData.maxStudents),
        startDate: new Date(formData.startDate),
        status: formData.status
      });
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        instructor: "",
        duration: "",
        maxStudents: "",
        startDate: "",
        status: CourseStatus.DRAFT
      });
    } catch (error: any) {
      if (error.fieldErrors) {
        setErrors(error.fieldErrors);
      } else {
        setErrors({ general: error.message || "Failed to create course" });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as CourseStatus }));
  };

  if (!showAddModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Add New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="text-red-500 text-sm">{errors.general}</div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Course Name */}
              <div>
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter course name"
                  disabled={isLoading}
                />
                {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
              </div>

              {/* Instructor */}
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  name="instructor"
                  type="text"
                  value={formData.instructor}
                  onChange={handleChange}
                  placeholder="Instructor name"
                  disabled={isLoading}
                />
                {errors.instructor && <div className="text-red-500 text-sm">{errors.instructor}</div>}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Course description"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              {errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Duration */}
              <div>
                <Label htmlFor="duration">Duration (weeks)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="Duration in weeks"
                  min="1"
                  max="52"
                  disabled={isLoading}
                />
                {errors.duration && <div className="text-red-500 text-sm">{errors.duration}</div>}
              </div>

              {/* Max Students */}
              <div>
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input
                  id="maxStudents"
                  name="maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={handleChange}
                  placeholder="Maximum capacity"
                  min="1"
                  max="100"
                  disabled={isLoading}
                />
                {errors.maxStudents && <div className="text-red-500 text-sm">{errors.maxStudents}</div>}
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={handleStatusChange} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CourseStatus.DRAFT}>Draft</SelectItem>
                    <SelectItem value={CourseStatus.ACTIVE}>Active</SelectItem>
                    <SelectItem value={CourseStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={CourseStatus.CANCELLED}>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <div className="text-red-500 text-sm">{errors.status}</div>}
              </div>
            </div>

            {/* Start Date */}
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.startDate && <div className="text-red-500 text-sm">{errors.startDate}</div>}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
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
                {isLoading ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}