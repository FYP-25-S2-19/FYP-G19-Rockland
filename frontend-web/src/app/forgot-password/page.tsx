"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [step, setStep] = useState(1) // 1: Enter email, 2: Verify code, 3: Set password
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds
  
  const router = useRouter()

  // API configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  useEffect(() => {
    // Countdown timer - only runs when step is 2 (OTP verification)
    if (step === 2 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, step])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!email.trim()) {
      setError('Please enter your email address')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/forgot-password/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim()
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStep(2) // Move to OTP verification step
        setTimeLeft(900) // Reset timer to 15 minutes
        setSuccess('Verification code sent to your email!')
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.error || 'Failed to send verification code. Please try again.')
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      setError('Unable to connect to server. Please check your internet connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!verificationCode.trim()) {
      setError('Please enter the verification code')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/forgot-password/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          code: verificationCode.trim()
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStep(3) // Move to password reset step
        setError("")
        setSuccess('Code verified! Now set your new password.')
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.message || 'Invalid verification code. Please try again.')
      }
    } catch (error) {
      console.error('Code verification error:', error)
      setError('Unable to verify code. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields')
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/forgot-password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          code: verificationCode.trim(),
          new_password: newPassword
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess('Password reset successfully! Redirecting to login...')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(data.message || 'Failed to reset password. Please try again.')
      }
    } catch (error) {
      console.error('Password reset error:', error)
      setError('Unable to reset password. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/api/forgot-password/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim()
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setTimeLeft(900) // Reset timer to 15 minutes
        setSuccess('New verification code sent to your email!')
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError('Failed to resend code. Please try again.')
      }
    } catch (error) {
      console.error('Resend code error:', error)
      setError('Unable to resend code. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToStep = (targetStep: number) => {
    setStep(targetStep)
    setError("")
    setSuccess("")
  }

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Reset Password'
      case 2: return 'Verify Your Email'
      case 3: return 'Set New Password'
      default: return 'Reset Password'
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 1: return 'Enter your email address to receive a verification code'
      case 2: return `Enter the verification code sent to ${email}`
      case 3: return 'Create a new password for your account'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="text-left">
            <h1 className="text-lg font-semibold tracking-wide text-black">ROCKLAND</h1>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-green-600' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-green-600' : 'bg-gray-300'}`} />
          </div>

          {/* Header Section */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-black">{getStepTitle()}</h2>
            <p className="text-sm text-gray-600">{getStepDescription()}</p>
          </div>

          {/* Timer - only show in step 2 */}
          {step === 2 && timeLeft > 0 && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Code expires in: <span className="font-medium text-green-600">{formatTime(timeLeft)}</span>
              </p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200"
              >
                {isLoading ? 'Sending Code...' : 'Send Verification Code'}
              </Button>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                  disabled={isLoading || timeLeft === 0}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || timeLeft === 0}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>

              {/* Resend Code */}
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading || timeLeft > 600} // Can resend after 5 minutes
                  className="text-sm text-green-600 hover:text-green-700 hover:underline focus:outline-none focus:underline disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {timeLeft > 600 ? `Resend available in ${formatTime(timeLeft - 600)}` : 'Resend Code'}
                </button>
              </div>

              {/* Back to change email */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleBackToStep(1)}
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline focus:outline-none focus:underline transition-colors duration-200"
                >
                  ← Change email address
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Set New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    minLength={8}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    minLength={8}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Password requirements */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Password must contain:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>At least 8 characters</li>
                    <li>At least one letter</li>
                    <li>At least one number</li>
                  </ul>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium py-2.5 px-4 rounded-md transition-colors duration-200"
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          )}

          {/* Back to Login */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-sm text-gray-600 hover:text-gray-800 hover:underline focus:outline-none focus:underline transition-colors duration-200"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Background Image */}
      <div className="flex-1 relative overflow-hidden">
        <Image src="/1.png" alt="Monstera leaves background" fill className="object-cover" priority />
      </div>
    </div>
  )
}