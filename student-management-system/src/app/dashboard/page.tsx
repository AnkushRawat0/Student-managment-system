"use client";

import { useAuthStore } from "@/store/authStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  UserCheck,
  TrendingUp,
  Plus,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalCoaches: 0,
    recentStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Add this useEffect to fetch real data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-blue-100 text-lg">
          {user.role === "ADMIN"
            ? "Manage your institution effectively"
            : user.role === "COACH"
            ? "Guide your students to success"
            : "Track your learning journey"}
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Students
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? "..." : stats.totalStudents}
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{loading ? "..." : stats.recentStudents} new this month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Courses
            </CardTitle>
            <BookOpen className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? "..." : stats.activeCourses}
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +3 new courses
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Coaches
            </CardTitle>
            <UserCheck className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {loading ? "..." : stats.totalCoaches}
            </div>
            <p className="text-xs text-blue-600 flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              Available now
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">89%</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.role === "ADMIN" && (
                  <>
                    <Button className="h-16 flex flex-col gap-2" size="lg">
                      <Plus className="h-5 w-5" />
                      Add New Student
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex flex-col gap-2"
                      size="lg"
                    >
                      <BookOpen className="h-5 w-5" />
                      Create Course
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex flex-col gap-2"
                      size="lg"
                    >
                      <UserCheck className="h-5 w-5" />
                      Assign Coach
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex flex-col gap-2"
                      size="lg"
                    >
                      <TrendingUp className="h-5 w-5" />
                      View Reports
                    </Button>
                  </>
                )}

                {user.role === "COACH" && (
                  <>
                    <Button className="h-16 flex flex-col gap-2" size="lg">
                      <Users className="h-5 w-5" />
                      My Students
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex flex-col gap-2"
                      size="lg"
                    >
                      <Calendar className="h-5 w-5" />
                      Schedule Session
                    </Button>
                  </>
                )}

                {user.role === "STUDENT" && (
                  <>
                    <Button className="h-16 flex flex-col gap-2" size="lg">
                      <BookOpen className="h-5 w-5" />
                      My Courses
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex flex-col gap-2"
                      size="lg"
                    >
                      <Calendar className="h-5 w-5" />
                      View Schedule
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">New student enrolled</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Course completed</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">New assignment</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Coach assigned</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
