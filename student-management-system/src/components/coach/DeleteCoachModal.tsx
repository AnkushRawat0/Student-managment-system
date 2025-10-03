"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  X, 
  Trash2, 
  AlertTriangle, 
  User, 
  Mail, 
  BookOpen, 
  Users,
  Calendar
} from "lucide-react";
import { useCoachStore } from "@/store/coachStore";

export function DeleteCoachModal() {
  const { 
    isDeleteModalOpen, 
    setDeleteModalOpen, 
    selectedCoach, 
    deleteCoach, 
    loading 
  } = useCoachStore();

  const handleDelete = async () => {
    if (!selectedCoach) return;
    
    try {
      await deleteCoach(selectedCoach.id);
      // Modal will be closed by the store action
    } catch (error) {
      console.error("Failed to delete coach:", error);
    }
  };

  const handleClose = () => {
    setDeleteModalOpen(false);
  };

  if (!isDeleteModalOpen || !selectedCoach) return null;

  const hasAssignments = selectedCoach.courseAssignments && selectedCoach.courseAssignments.length > 0;
  const hasStudents = selectedCoach.totalStudents && selectedCoach.totalStudents > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Coach
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800 mb-1">
                Permanent Action
              </h4>
              <p className="text-sm text-red-700">
                This action cannot be undone. The coach's account and all associated data will be permanently deleted.
              </p>
            </div>
          </div>

          {/* Coach Details */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                  {selectedCoach.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedCoach.user.name}</h3>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {selectedCoach.subject}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                {selectedCoach.user.email}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="h-4 w-4" />
                {selectedCoach.courseAssignments?.length || 0} course assignments
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                {selectedCoach.totalStudents || 0} students under supervision
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                Joined {new Date(selectedCoach.user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Impact Warning */}
          {(hasAssignments || hasStudents) && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Impact Assessment</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {hasAssignments && (
                      <li>• {selectedCoach.courseAssignments?.length} course assignments will be removed</li>
                    )}
                    {hasStudents && (
                      <li>• {selectedCoach.totalStudents} students will need to be reassigned to other coaches</li>
                    )}
                    <li>• All coach-related data and history will be permanently lost</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600 font-medium">
              Please confirm that you want to delete this coach:
            </p>
            <div className="p-3 bg-gray-100 rounded border-l-4 border-red-500">
              <p className="text-sm font-medium text-gray-900">
                "{selectedCoach.user.name}"
              </p>
              <p className="text-xs text-gray-600">
                {selectedCoach.user.email} • {selectedCoach.subject}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
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
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Deleting..." : "Delete Coach"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
