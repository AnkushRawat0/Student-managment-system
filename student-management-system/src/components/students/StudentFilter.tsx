"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";
import { useStudentsStore } from "@/store/studentStore";


export function StudentFilter() {
    const {filters , setFilters , clearFilters} = useStudentsStore();

    const handleSearchChange = (value : string) =>{
        setFilters({searchTerm: value});
    }
     const handleCourseChange = (value: string) => {
    setFilters({ course: value });
  }

    const handleAgeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    if (type === 'min') {
      setFilters({ minAge: numValue });
    } else {
      setFilters({ maxAge: numValue });
    }
  };
   const hasActiveFilters = 
    filters.searchTerm || 
    filters.course || 
    filters.minAge !== undefined || 
    filters.maxAge !== undefined;

     return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <h3 className="text-lg font-semibold">Search & Filter Students</h3>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="ml-auto"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, course..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          
          {/* Course Filter */}
          <Input
            placeholder="Filter by course..."
            value={filters.course}
            onChange={(e) => handleCourseChange(e.target.value)}
          />


            {/* Min Age */}
          <Input
            type="number"
            placeholder="Min age"
            value={filters.minAge || ''}
            onChange={(e) => handleAgeChange('min', e.target.value)}
            min="16"
            max="100"
          />


               {/* Max Age */}
          <Input
            type="number"
            placeholder="Max age"
            value={filters.maxAge || ''}
            onChange={(e) => handleAgeChange('max', e.target.value)}
            min="16"
            max="100"
          />
        </div>
        
        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Search: "{filters.searchTerm}"
                <button
                  onClick={() => setFilters({ searchTerm: "" })}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
              {filters.course && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Course: "{filters.course}"
                <button
                  onClick={() => setFilters({ course: "" })}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

             {(filters.minAge !== undefined || filters.maxAge !== undefined) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                Age: {filters.minAge || '0'} - {filters.maxAge || '∞'}
                <button
                  onClick={() => setFilters({ minAge: undefined, maxAge: undefined })}
                  className="ml-1 hover:text-purple-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
