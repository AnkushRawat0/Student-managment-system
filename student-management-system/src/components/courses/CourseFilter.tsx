"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCoursesStore } from "@/store/courseStore";
import { Search, Filter, X } from "lucide-react";

export const CourseFilter = () => {
  const { filters, setFilters } = useCoursesStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ searchTerm: e.target.value });
  };
  const handleStatusChange = (value: string) => {
    setFilters({
      status: value as "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED",
    });
  };

  const handleInstructorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ instructor: e.target.value });
  };
  const clearAllFilters = () => {
    setFilters({ searchTerm: "", status: undefined, instructor: "" });
  };
  const hasActiveFilters =
    filters.searchTerm || filters.status || filters.instructor;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Courses
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="h-4 w-4" />
            {isExpanded ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search courses by name, description, or instructor..."
            value={filters.searchTerm || ""}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        {/* Advanced Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            {/* Status Filter */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || ""}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Instructor Filter */}
            <div>
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                type="text"
                placeholder="Filter by instructor..."
                value={filters.instructor || ""}
                onChange={handleInstructorChange}
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}
        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Search: "{filters.searchTerm}"
                <button onClick={() => setFilters({ searchTerm: "" })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Status: {filters.status}
                <button onClick={() => setFilters({ status: undefined })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.instructor && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Instructor: "{filters.instructor}"
                <button onClick={() => setFilters({ instructor: "" })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
