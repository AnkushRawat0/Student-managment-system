"use client";

import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuthCard } from "@/components/auth/AuthCard";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuthStore();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-green-600">Welcome!</CardTitle>
            <p className="text-slate-600">Hello, {user?.name}</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg text-slate-600">Role: {user?.role}</p>
            <Button 
              onClick={logout}
              variant="destructive"
              className="w-full"
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AuthCard />;
}
  