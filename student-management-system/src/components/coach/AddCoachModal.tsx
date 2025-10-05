"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, User, BookOpen } from "lucide-react";
import { useCoachStore } from "@/store/coachStore";

// User interface for coach users
interface CoachUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Form data for assigning coach specialization
interface CoachAssignmentData {
  userId: string;
  subject: string;
}

export function AddCoachModal() {
  const { isAddModalOpen, setAddModalOpen, addCoach, loading, error } = useCoachStore();
  
  const [formData, setFormData] = useState<CoachAssignmentData>({
    userId: '',
    subject: ''
  });
  
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [coachUsers, setCoachUsers] = useState<CoachUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users with COACH role who don't have coach assignments yet
  useEffect(() => {
    const fetchCoachUsers = async () => {
      if (!isAddModalOpen) return;
      
      setLoadingUsers(true);
      try {
        const response = await fetch('/api/users/coach-users');
        const data = await response.json();
        setCoachUsers(data.users || []);
      } catch (error) {
        console.error('Failed to fetch coach users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchCoachUsers();
  }, [isAddModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    try {
      await addCoach({
        userId: formData.userId,
        subject: formData.subject
      });
      // Reset form on success
      setFormData({
        userId: '',
        subject: ''
      });
    } catch (error: any) {
      if (error.fieldErrors) {
        setFormErrors(error.fieldErrors);
      }
    }
  };

  const handleClose = () => {
    setAddModalOpen(false);
    setFormData({
      userId: '',
      subject: ''
    });
    setFormErrors({});
  };

  if (!isAddModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Coach
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
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* General Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Select User Field */}
            <div className="space-y-2">
              <Label htmlFor="userId" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Select Coach User
              </Label>
              <Select
                value={formData.userId}
                onValueChange={(value) => setFormData({ ...formData, userId: value })}
              >
                <SelectTrigger className={formErrors.userId ? "border-red-500" : ""}>
                  <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select a user with coach role"} />
                </SelectTrigger>
                <SelectContent>
                  {coachUsers.length === 0 && !loadingUsers ? (
                    <SelectItem value="no-users" disabled>
                      No coach users available
                    </SelectItem>
                  ) : (
                    coachUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-sm text-gray-500">{user.email}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formErrors.userId && (
                <p className="text-sm text-red-600">{formErrors.userId}</p>
              )}
            </div>

            {/* Subject Field */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
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
                  <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                  <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                  <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                  <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                  <SelectItem value="Python Developer">Python Developer</SelectItem>
                  <SelectItem value="Java Developer">Java Developer</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="AI/ML">AI/ML</SelectItem>
                  <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                  <SelectItem value="DSA Only">DSA Only</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.subject && (
                <p className="text-sm text-red-600">{formErrors.subject}</p>
              )}
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
                {loading ? "Adding..." : "Add Coach"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
