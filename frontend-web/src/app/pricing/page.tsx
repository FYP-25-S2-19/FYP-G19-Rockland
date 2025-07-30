"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X, ArrowLeft, Star, Users, Crown, Camera, MapPin, MessageCircle, Trophy, Archive, Loader2 } from "lucide-react"

// Interface for subscription plan data
interface SubscriptionPlan {
  subscription_plan_id: number
  name: string
  description: string
  price: number
  currency: string
  feature_a: string
  feature_b: string
  feature_c: string
  feature_d: string
}

export default function PricingPage() {
  
   // API configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  // Dynamic subscription plans state
  const [subscriptionPlans, setSubscriptionPlans] = useState({
    free: null as SubscriptionPlan | null,
    premium: null as SubscriptionPlan | null
  })
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null)

  // Fetch subscription plans from database
  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setSubscriptionLoading(true)
        setSubscriptionError(null)
        
        const response = await fetch(`${API_BASE_URL}/api/subscription-plans/public`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('💳 Received subscription plans data:', data)
        
        if (data.success && data.subscription_plans) {
          // Process the plans to identify free and premium
          const processedPlans = {
            free: null as SubscriptionPlan | null,
            premium: null as SubscriptionPlan | null
          }
          
          data.subscription_plans.forEach((plan: SubscriptionPlan) => {
            const planName = plan.name.toLowerCase()
            
            // Check for free plan keywords
            if (planName.includes('free') || planName.includes('basic') || plan.price === 0) {
              processedPlans.free = plan
            }
            // Check for premium plan keywords
            else if (planName.includes('premium') || planName.includes('pro') || planName.includes('paid') || plan.price > 0) {
              processedPlans.premium = plan
            }
          })
          
          setSubscriptionPlans(processedPlans)
          console.log('✅ Processed subscription plans:', processedPlans)
        } else {
          setSubscriptionError("No subscription plans available")
        }
      } catch (error) {
        console.error('❌ Error fetching subscription plans:', error)
        setSubscriptionError("Failed to load subscription plans")
      } finally {
        setSubscriptionLoading(false)
      }
    }

    fetchSubscriptionPlans()
  }, [])

  // Function to parse features from database fields
  const parseFeatures = (plan: SubscriptionPlan): string[] => {
    const features: string[] = []
    
    if (plan.feature_a && plan.feature_a.trim()) features.push(plan.feature_a.trim())
    if (plan.feature_b && plan.feature_b.trim()) features.push(plan.feature_b.trim())
    if (plan.feature_c && plan.feature_c.trim()) features.push(plan.feature_c.trim())
    if (plan.feature_d && plan.feature_d.trim()) features.push(plan.feature_d.trim())
    
    return features
  }

  // Fallback features for when database is unavailable
  const fallbackFeatures = {
    basic: [
      { name: "Photo-based rock identification", included: true, icon: Camera },
      { name: "5 scans per day", included: true },
      { name: "Basic rock database (1,000+ rocks)", included: true },
      { name: "Community forum access", included: true, icon: MessageCircle },
      { name: "View nearby rock locations", included: true, icon: MapPin },
    ],
    premium: [
      { name: "Everything in Basic", included: true },
      { name: "Unlimited rock scans", included: true },
      { name: "Interactive mapping & discovery", included: true, icon: MapPin },
      { name: "Expert consultation access", included: true, icon: MessageCircle },
      { name: "Quiz system with point rewards", included: true, icon: Trophy },
    ],
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-green-600 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white text-xl font-bold">
            ROCKLAND
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white hover:text-green-100">
              Home
            </Link>
            <Link href="/features" className="text-white hover:text-green-100">
              Feature
            </Link>
            <Link href="/pricing" className="text-white hover:text-green-100 font-semibold">
              Pricing
            </Link>
            <Link href="/faq" className="text-white hover:text-green-100">
              FAQ
            </Link>
          </div>
          <Link href="/registration">
            <Button className="bg-white hover:bg-gray-100 text-green-600 font-semibold px-6 py-2 rounded-full border border-white hover:border-gray-200 transition-all duration-200">
              Register
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link href="/" className="inline-flex items-center text-white hover:text-green-100 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-lg text-emerald-100 mb-8">
            Discover, identify, and collect rocks with our comprehensive platform
          </p>
        </div>
      </section>

      {/* Key Features Highlight */}
      <section className="py-12 -mt-8 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-center mb-8">Core Platform Features</h2>
            <div className="grid md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Photo ID</h3>
                <p className="text-sm text-gray-600">Advanced AI rock identification from photos</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Rock Mapping</h3>
                <p className="text-sm text-gray-600">Discover rocks near you with GPS locations</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Expert Network</h3>
                <p className="text-sm text-gray-600">Connect with geology experts for consultations</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2">Quiz & Rewards</h3>
                <p className="text-sm text-gray-600">Learn through interactive quizzes and earn points</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Archive className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Collections</h3>
                <p className="text-sm text-gray-600">Organize and manage your rock discoveries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Subscription Plans</h2>
            <p className="text-gray-600">Choose the perfect plan for your rock exploration journey</p>
          </div>

          {subscriptionLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-green-600" />
                <p className="text-gray-600">Loading subscription plans...</p>
              </div>
            </div>
          ) : subscriptionError ? (
            <div className="text-center py-8 mb-8">
              <div className="text-yellow-600 mb-2">⚠️</div>
              <p className="text-gray-600">{subscriptionError}</p>
              <p className="text-sm text-gray-400 mt-2">Showing default plans</p>
            </div>
          ) : null}

          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-gray-600 mr-2" />
                    <h3 className="text-lg font-bold text-gray-600">
                      {subscriptionPlans.free?.name?.toUpperCase() || 'BASIC'}
                    </h3>
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-bold">
                      {subscriptionPlans.free?.currency || '$'}{subscriptionPlans.free?.price || 0}
                    </span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="text-gray-600 mb-8">
                    {subscriptionPlans.free?.description || 'Perfect for casual rock enthusiasts'}
                  </p>

                  <Link href="/registration">
                    <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white mb-8">
                      Get Started Free
                    </Button>
                  </Link>

                  <div className="space-y-4 text-left">
                    {subscriptionPlans.free ? (
                      parseFeatures(subscriptionPlans.free).map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))
                    ) : (
                      fallbackFeatures.basic.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <div className="flex items-center">
                            {feature.icon && (
                              <feature.icon className="w-4 h-4 mr-2 text-green-500" />
                            )}
                            <span className="text-gray-700">{feature.name}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative overflow-hidden border-2 border-green-200 shadow-lg">
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-2 text-sm font-medium">
                <Crown className="w-4 h-4 inline mr-1" />
                Most Popular
              </div>
              <CardContent className="p-8 pt-12">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Star className="w-6 h-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-bold text-green-600">
                      {subscriptionPlans.premium?.name?.toUpperCase() || 'PREMIUM'}
                    </h3>
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-bold">
                      {subscriptionPlans.premium?.currency || '$'}{subscriptionPlans.premium?.price || 5}
                    </span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="text-gray-600 mb-8">
                    {subscriptionPlans.premium?.description || 'For serious rock collectors and students'}
                  </p>

                  <Link href="/registration">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white mb-8">
                      Start Premium Trial
                    </Button>
                  </Link>

                  <div className="space-y-4 text-left">
                    {subscriptionPlans.premium ? (
                      parseFeatures(subscriptionPlans.premium).map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))
                    ) : (
                      fallbackFeatures.premium.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <div className="flex items-center">
                            {feature.icon && (
                              <feature.icon className="w-4 h-4 mr-2 text-green-500" />
                            )}
                            <span className="text-gray-700">{feature.name}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Detailed Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Features</th>
                  <th className="text-center p-4 font-semibold">
                    {subscriptionPlans.free?.name || 'Basic'}
                  </th>
                  <th className="text-center p-4 font-semibold text-green-600">
                    {subscriptionPlans.premium?.name || 'Premium'}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium flex items-center">
                    <Camera className="w-4 h-4 mr-2 text-gray-500" />
                    Photo Recognition
                  </td>
                  <td className="p-4 text-center">✓</td>
                  <td className="p-4 text-center text-green-600">✓</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium">Daily Scans</td>
                  <td className="p-4 text-center">5 per day</td>
                  <td className="p-4 text-center text-green-600">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    Rock Location Mapping
                  </td>
                  <td className="p-4 text-center">✓</td>
                  <td className="p-4 text-center text-green-600">✓</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2 text-gray-500" />
                    Expert Consultations
                  </td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center text-green-600">Discussion access</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium flex items-center">
                    <Trophy className="w-4 h-4 mr-2 text-gray-500" />
                    Quiz & Rewards System
                  </td>
                  <td className="p-4 text-center">❌</td>
                  <td className="p-4 text-center text-green-600">Full access</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium flex items-center">
                    <Archive className="w-4 h-4 mr-2 text-gray-500" />
                    Collection Storage
                  </td>
                  <td className="p-4 text-center">20 rocks</td>
                  <td className="p-4 text-center text-green-600">Unlimited</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-sm">
              <div className="mb-4">2025 Rockland FYP-S2-G19</div>
              <div className="space-x-4">
                <span>Privacy & Policy</span>
                <span>Terms & Conditions</span>
              </div>
              <div className="mt-4">
                <a href="/login" className="text-emerald-200 hover:text-white text-xs">
                  Admin Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}