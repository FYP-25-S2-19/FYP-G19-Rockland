"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle } from "lucide-react"

// Component that uses useSearchParams - must be wrapped in Suspense
function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    console.log("✅ Stripe session completed. ID:", sessionId)
    // Optionally: Verify session_id or trigger backend actions here
  }, [sessionId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 to-emerald-600 flex">
      {/* Left Side - Logo + Illustration */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 text-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">ROCKLAND</h1>
        </div>

        <div className="mb-10">
          <div className="w-72 h-72 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white text-9xl">✅</span>
          </div>
        </div>

        <h2 className="text-4xl font-bold">PAYMENT SUCCESSFUL</h2>
        <p className="mt-2 text-lg text-white/90">You've been upgraded to Premium!</p>
      </div>

      {/* Right Side - Actions */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">
          <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />

          <h3 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Premium</h3>
          <p className="text-sm text-gray-600 mb-6">
            Thank you for subscribing! You now have full access to quizzes, expert articles, and more.
          </p>

          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg"
            onClick={() => router.push("/")}
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
      <div className="text-white text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <p className="text-lg">Loading...</p>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  )
}