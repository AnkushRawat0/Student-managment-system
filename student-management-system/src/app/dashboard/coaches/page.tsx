"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, BookOpen } from "lucide-react";

export default function CoachesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Only allow ADMIN access
  if (user?.role !== 'ADMIN') {
    return <div>Access Denied - Admin Only</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coach Management</h1>
          <p className="text-gray-600">Manage coaches and their course assignments</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Coach
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search coaches by name or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coach Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Coaches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Subject</th>
                  <th className="text-left py-2">Assigned Courses</th>
                  <th className="text-left py-2">Total Students</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Coach rows will go here */}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}