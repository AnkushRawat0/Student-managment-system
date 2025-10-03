"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { CoachFilter } from "@/components/coach/CoachFilter";
import { AddCoachModal } from "@/components/coach/AddCoachModal";
import { CoachTable } from "@/components/coach/CoachTable";
import { EditCoachModal } from "@/components/coach/EditCoachModal";
import { DeleteCoachModal } from "@/components/coach/DeleteCoachModal";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useCoachStore } from "@/store/coachStore";

export default function CoachesPage() {
  const { user } = useAuthStore();
  const { 
    coaches, 
    loading, 
    error, 
    fetchCoaches, 
    setAddModalOpen 
  } = useCoachStore();

  // Fetch coaches on mount (hook must be called before any conditional returns)
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchCoaches();
    }
  }, [user?.role]);

  // Only allow ADMIN access
  if (user?.role !== 'ADMIN') {
    return <div>Access Denied - Admin Only</div>;
  }

  const handleAddCoach = () => {
    setAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6" />
            Coaches
          </h1>
          <p className="text-gray-600">
            Manage coaches and their course assignments
          </p>
        </div>
        <Button 
          onClick={handleAddCoach}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Coach
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {coaches.length}
          </div>
          <div className="text-sm text-gray-600">Total Coaches</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {coaches.filter(coach => coach.courseAssignments && coach.courseAssignments.length > 0).length}
          </div>
          <div className="text-sm text-gray-600">Active Assignments</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {coaches.reduce((total, coach) => total + (coach.totalStudents || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">
            {new Set(coaches.map(coach => coach.subject)).size}
          </div>
          <div className="text-sm text-gray-600">Subjects Covered</div>
        </div>
      </div>

      {/* Filters */}
      <CoachFilter />

      {/* Coach Table */}
      <div className="bg-white rounded-lg border">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <CoachTable />
      </div>

      {/* Modals */}
      <AddCoachModal />
      <EditCoachModal />
      <DeleteCoachModal />
    </div>
  );
}