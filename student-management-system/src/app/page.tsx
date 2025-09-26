"use client";

import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuthCard } from "@/components/auth/AuthCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function Home() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Auto-redirect to dashboard when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setIsRedirecting(true);
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Show loading screen during redirect
  if (isAuthenticated && isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
  