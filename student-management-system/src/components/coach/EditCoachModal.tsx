"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Edit, User, Mail, BookOpen } from "lucide-react";
import { useCoachStore } from "@/store/coachStore";
import { UpdateCoachData } from "@/lib/validation";

export function EditCoachModal() {
  const { 
    isEditModalOpen, 
    setEditModalOpen, 
    selectedCoach, 
    updateCoach, 
    loading, 
    error 
  } = useCoachStore();
  
  const [formData, setFormData] = useState<UpdateCoachData>({
    name: '',
    email: '',
    subject: ''
  });
  
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Populate form when modal opens or selectedCoach changes
  useEffect(() => {
    if (selectedCoach && isEditModalOpen) {
      setFormData({
        name: selectedCoach.user.name,
        email: selectedCoach.user.email,
        subject: selectedCoach.subject
      });
    }
  }, [selectedCoach, isEditModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoach) return;
    
    setFormErrors({});
    
    try {
      await updateCoach(selectedCoach.id, formData);
      // Modal will be closed by the store action
    } catch (error: any) {
      if (error.fieldErrors) {
        setFormErrors(error.fieldErrors);
      }
    }
  };

  const handleClose = () => {
    setEditModalOpen(false);
    setFormErrors({});
  };

  if (!isEditModalOpen || !selectedCoach) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Coach
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Update information for {selectedCoach.user.name}
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Coach ID Display */}
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Coach ID:</span>
                <span className="text-sm font-mono text-gray-900">
                  {selectedCoach.id}
                </span>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="editName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="editName"
                type="text"
                placeholder="Enter coach's full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="editEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="editEmail"
                type="email"
                placeholder="coach@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && (
                <p className="text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Subject Field */}
            <div className="space-y-2">
              <Label htmlFor="editSubject" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Subject Specialization
              </Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData({ ...formData, subject: value })}
              >
                <SelectTrigger className={formErrors.subject ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Geography">Geography</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Physical Education">Physical Education</SelectItem>
                  <SelectItem value="Art">Art</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.subject && (
                <p className="text-sm text-red-600">{formErrors.subject}</p>
              )}
            </div>

            {/* Additional Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Courses:</span>
                  <span className="font-medium text-gray-900">
                    {selectedCoach.courseAssignments?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Students:</span>
                  <span className="font-medium text-gray-900">
                    {selectedCoach.totalStudents || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedCoach.user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Updating..." : "Update Coach"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
