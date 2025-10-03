"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  BookOpen, 
  Calendar,
  Users,
  MoreVertical
} from "lucide-react";
import { useCoachStore } from "@/store/coachStore";
import { Coach } from "@/store/coachStore";

export function CoachTable() {
  const { 
    coaches, 
    loading, 
    setEditModalOpen, 
    setDeleteModalOpen, 
    setSelectedCoach,
    filters 
  } = useCoachStore();

  // Filter coaches based on current filters
  const filteredCoaches = coaches.filter(coach => {
    if (!coach.user) return false;
    
    const matchesSearch = !filters.search || 
      coach.user.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      coach.user.email?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesSubject = !filters.subject || filters.subject === 'all' || coach.subject === filters.subject;

    return matchesSearch && matchesSubject;
  });

  const handleEdit = (coach: Coach) => {
    setSelectedCoach(coach);
    setEditModalOpen(true);
  };

  const handleDelete = (coach: Coach) => {
    setSelectedCoach(coach);
    setDeleteModalOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading coaches...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredCoaches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Coaches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {coaches.length === 0 ? "No coaches found" : "No coaches match your filters"}
            </h3>
            <p className="text-gray-600 mb-4">
              {coaches.length === 0 
                ? "Get started by adding your first coach to the system."
                : "Try adjusting your search criteria or clear the filters."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Coaches ({filteredCoaches.length})</span>
          <Badge variant="secondary" className="text-sm">
            Total: {coaches.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Coach</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Courses</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Students</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Joined</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoaches.map((coach) => (
                  <tr key={coach.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {coach.user?.name ? coach.user.name.split(' ').map(n => n[0]).join('') : '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">
                            {coach.user?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {coach.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {coach.subject}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {coach.user?.email || 'No email'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {coach.courseAssignments?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {coach.totalStudents || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(coach.user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(coach)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(coach)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredCoaches.map((coach) => (
              <Card key={coach.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {coach.user?.name ? coach.user.name.split(' ').map(n => n[0]).join('') : '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{coach.user?.name || 'Unknown'}</h3>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        {coach.subject}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(coach)}
                      className="text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(coach)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {coach.user?.email || 'No email'}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {coach.courseAssignments?.length || 0} courses
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {coach.totalStudents || 0} students
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(coach.user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
