"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthCard() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleRegistrationSuccess = () => {
    // Switch back to login mode after successful registration
    setIsLoginMode(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isLoginMode ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <p className="text-slate-600">
            {isLoginMode 
              ? "Sign in to your account" 
              : "Sign up to get started"
            }
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isLoginMode ? (
            <LoginForm />
          ) : (
            <RegisterForm onSuccess={handleRegistrationSuccess} />
          )}
          
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-slate-600 mb-2">
              {isLoginMode 
                ? "Don't have an account?" 
                : "Already have an account?"
              }
            </p>
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-700"
              onClick={() => setIsLoginMode(!isLoginMode)}
            >
              {isLoginMode ? "Create an account" : "Sign in instead"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}