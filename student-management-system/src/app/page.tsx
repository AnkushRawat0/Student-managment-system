"use client" 

import { useAuthStore } from "@/store/authStore"
import {useState} from "react"


export default function Home() {
  const {user , isAuthenticated , isLoading , login , logout} = useAuthStore();
  const [email ,setEmail] =useState("") ;
  const [password ,setPassword] =useState("") ;

    const handleLogin = async () => {
    try {
      await login(email, password)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  if (isAuthenticated){
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <h1 className="text-4xl font-bold text-gray-900">Welcome, {user?.name} !</h1>
          <p className="text-lg text-gray-600">Role : {user?.role}</p>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg">Logout</button>
        </div>
      </div>
    )
  }

return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  )
}