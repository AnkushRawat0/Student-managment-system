"use client"

import { useAuthStore } from "@/store/authStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"



export function Header() {
    const { user, logout } = useAuthStore();

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* left side logo and title */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Student Management
                    </h1>
                </div>

                {/* Navigation Links */}
                {user?.role === "ADMIN" && (
                    <nav className="flex items-center gap-6">
                        <a 
                            href="/dashboard" 
                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Dashboard
                        </a>
                        <a 
                            href="/dashboard/students" 
                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Students
                        </a>
                        <a 
                            href="/dashboard/courses" 
                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Courses
                        </a>
                        <a 
                            href="/dashboard/coaches" 
                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Coaches
                        </a>
                        <a 
                            href="/dashboard/settings" 
                            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Settings
                        </a>
                    </nav>
                )}

                {/* right side user profile and settings */}
                <div className="flex items-center gap-4">
                    {/* User info */}
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="hidden md:block">
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.role}</p>
                        </div>
                    </div>
                    
                    {/* logout button */}
                    <Button 
                        onClick={logout}
                        variant="ghost" 
                        size="sm"
                        className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden md:inline ml-2">Logout</span>
                    </Button>
                </div>
            </div>
        </header>
    )
}