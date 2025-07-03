"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Add more detailed logging for debugging
      console.log('Attempting login with:', { email, password: '***' })
      
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(), // Trim whitespace
          password: password
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response')
      }

      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        // Validate that required fields exist in response
        if (!data.access_token || !data.user) {
          throw new Error('Invalid response format from server')
        }

        // Store authentication data
        localStorage.setItem('authToken', data.access_token)
        localStorage.setItem('userId', data.user.user_id?.toString() || '')
        localStorage.setItem('userEmail', email)
        localStorage.setItem('isLoggedIn', 'true')
        
        // Store additional user info if available
        if (data.user.first_name && data.user.last_name) {
          localStorage.setItem('userName', `${data.user.first_name} ${data.user.last_name}`)
        }
        if (data.user.user_type_id) {
          localStorage.setItem('userType', data.user.user_type_id.toString())
        }
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        // Handle different error status codes
        let errorMessage = 'Login failed. Please check your credentials.'
        
        if (response.status === 401) {
          errorMessage = 'Invalid email or password. Please try again.'
        } else if (response.status === 403) {
          errorMessage = 'Account access denied. Please contact support.'
        } else if (response.status === 429) {
          errorMessage = 'Too many login attempts. Please wait and try again.'
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later or contact support.'
        }
        
        setError(data.error || data.message || errorMessage)
      }
    } catch (error) {
      console.error('Login error:', error)
      
      // More specific error handling
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Unable to connect to server. Please check your internet connection.')
      } else if (error instanceof SyntaxError) {
        setError('Server returned invalid response. Please try again.')
      } else {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="text-left">
            <h1 className="text-lg font-semibold tracking-wide text-black">ROCKLAND</h1>
          </div>

          {/* Welcome Section */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-black">Welcome back!</h2>
            <p className="text-sm text-gray-600">Enter your Credentials to access your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rockland.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                disabled={isLoading}
              />
              <Label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">
                Remember for 30 days
              </Label>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            {/* Test Credentials Info */}
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p className="font-medium">Test Credentials:</p>
              <p>Admin: admin@rockland.com / admin123</p>
              <p>Premium: premium@rockland.com / rock123</p>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Background Image */}
      <div className="flex-1 relative overflow-hidden">
        <Image src="/1.png" alt="Monstera leaves background" fill className="object-cover" priority />
      </div>
    </div>
  )
}