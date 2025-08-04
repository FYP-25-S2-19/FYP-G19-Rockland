"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X, ArrowLeft, Star, Users, Crown, Camera, MapPin, MessageCircle, Trophy, Archive, Loader2, Menu } from "lucide-react"

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
   // API configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  // Dynamic subscription plans state
  const [subscriptionPlans, setSubscriptionPlans] = useState({
    free: null as SubscriptionPlan | null,
    premium: null as SubscriptionPlan | null
  })
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null)

  const toggleMobileMenu = (): void => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

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
      {/* Navigation - Made responsive */}
      <nav className="bg-green-600 px-4 py-4 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white text-xl font-bold">
            ROCKLAND
          </Link>
          
          {/* Desktop Navigation */}
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

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-white p-2"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Register Button */}
          <Link href="/registration" className="hidden md:block">
            <Button className="bg-white hover:bg-gray-100 text-green-600 font-semibold px-6 py-2 rounded-full border border-white hover:border-gray-200 transition-all duration-200">
              Register
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-green-600 border-t border-green-500 z-50">
            <div className="px-4 py-2 space-y-2">
              <Link href="/" className="block text-white hover:text-green-100 py-2">
                Home
              </Link>
              <Link href="/features" className="block text-white hover:text-green-100 py-2">
                Feature
              </Link>
              <Link href="/pricing" className="block text-white hover:text-green-100 font-semibold py-2">
                Pricing
              </Link>
              <Link href="/faq" className="block text-white hover:text-green-100 py-2">
                FAQ
              </Link>
              <Link href="/registration" className="block py-2">
                <Button className="w-full bg-white hover:bg-gray-100 text-green-600 font-semibold px-6 py-2 rounded-full">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Header Section - Made responsive */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link href="/" className="inline-flex items-center text-white hover:text-green-100 mb-4 sm:mb-6 text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-base sm:text-lg text-emerald-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Discover, identify, and collect rocks with our comprehensive platform
          </p>
        </div>
      </section>

      {/* Key Features Highlight - Made responsive */}
      <section className="py-8 sm:py-12 -mt-6 sm:-mt-8 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">Core Platform Features</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                  <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Photo ID</h3>
                <p className="text-xs sm:text-sm text-gray-600">Advanced AI rock identification from photos</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Rock Mapping</h3>
                <p className="text-xs sm:text-sm text-gray-600">Discover rocks near you with GPS locations</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Expert Network</h3>
                <p className="text-xs sm:text-sm text-gray-600">Connect with geology experts for consultations</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Quiz & Rewards</h3>
                <p className="text-xs sm:text-sm text-gray-600">Learn through interactive quizzes and earn points</p>
              </div>
              <div className="text-center col-span-2 sm:col-span-3 lg:col-span-1">
                <div className="bg-orange-100 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                  <Archive className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Collections</h3>
                <p className="text-xs sm:text-sm text-gray-600">Organize and manage your rock discoveries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section - Made responsive */}
      <section className="py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Subscription Plans</h2>
            <p className="text-gray-600 text-sm sm:text-base">Choose the perfect plan for your rock exploration journey</p>
          </div>

          {subscriptionLoading ? (
            <div className="flex items-center justify-center py-12 sm:py-16">
              <div className="text-center">
                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mx-auto mb-4 text-green-600" />
                <p className="text-gray-600 text-sm sm:text-base">Loading subscription plans...</p>
              </div>
            </div>
          ) : subscriptionError ? (
            <div className="text-center py-6 sm:py-8 mb-6 sm:mb-8">
              <div className="text-yellow-600 mb-2">⚠️</div>
              <p className="text-gray-600 text-sm sm:text-base">{subscriptionError}</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">Showing default plans</p>
            </div>
          ) : null}

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Basic Plan - Made responsive */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mr-2" />
                    <h3 className="text-base sm:text-lg font-bold text-gray-600">
                      {subscriptionPlans.free?.name?.toUpperCase() || 'BASIC'}
                    </h3>
                  </div>
                  <div className="mb-4 sm:mb-6">
                    <span className="text-4xl sm:text-5xl font-bold">
                      {subscriptionPlans.free?.currency || '$'}{subscriptionPlans.free?.price || 0}
                    </span>
                    <span className="text-gray-500 text-sm sm:text-base">/month</span>
                  </div>
                  <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                    {subscriptionPlans.free?.description || 'Perfect for casual rock enthusiasts'}
                  </p>

                  <Link href="/registration">
                    <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white mb-6 sm:mb-8 text-sm sm:text-base py-2 sm:py-3">
                      Get Started Free
                    </Button>
                  </Link>

                  <div className="space-y-3 sm:space-y-4 text-left">
                    {subscriptionPlans.free ? (
                      parseFeatures(subscriptionPlans.free).map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                        </div>
                      ))
                    ) : (
                      fallbackFeatures.basic.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <div className="flex items-start">
                            {feature.icon && (
                              <feature.icon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                            )}
                            <span className="text-gray-700 text-sm sm:text-base">{feature.name}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Plan - Made responsive */}
            <Card className="relative overflow-hidden border-2 border-green-200 shadow-lg">
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-2 text-xs sm:text-sm font-medium">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                Most Popular
              </div>
              <CardContent className="p-6 sm:p-8 pt-10 sm:pt-12">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2" />
                    <h3 className="text-base sm:text-lg font-bold text-green-600">
                      {subscriptionPlans.premium?.name?.toUpperCase() || 'PREMIUM'}
                    </h3>
                  </div>
                  <div className="mb-4 sm:mb-6">
                    <span className="text-4xl sm:text-5xl font-bold">
                      {subscriptionPlans.premium?.currency || '$'}{subscriptionPlans.premium?.price || 5}
                    </span>
                    <span className="text-gray-500 text-sm sm:text-base">/month</span>
                  </div>
                  <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                    {subscriptionPlans.premium?.description || 'For serious rock collectors and students'}
                  </p>

                  <Link href="/registration">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white mb-6 sm:mb-8 text-sm sm:text-base py-2 sm:py-3">
                      Start Premium Trial
                    </Button>
                  </Link>

                  <div className="space-y-3 sm:space-y-4 text-left">
                    {subscriptionPlans.premium ? (
                      parseFeatures(subscriptionPlans.premium).map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                        </div>
                      ))
                    ) : (
                      fallbackFeatures.premium.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <div className="flex items-start">
                            {feature.icon && (
                              <feature.icon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                            )}
                            <span className="text-gray-700 text-sm sm:text-base">{feature.name}</span>
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

      {/* Feature Comparison Table - Made responsive */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Detailed Feature Comparison</h2>

          {/* Mobile-friendly comparison cards */}
          <div className="block lg:hidden space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-bold mb-4 text-center">Feature Comparison</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center">
                    <Camera className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium">Photo Recognition</span>
                  </div>
                  <div className="flex space-x-4">
                    <span className="text-green-600 text-sm">✓</span>
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">Daily Scans</span>
                  <div className="flex space-x-4 text-sm">
                    <span className="w-12 text-center">5/day</span>
                    <span className="w-12 text-center text-green-600">∞</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium">Location Mapping</span>
                  </div>
                  <div className="flex space-x-4">
                    <span className="text-green-600 text-sm">✓</span>
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium">Expert Consultations</span>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <span className="w-12 text-center">❌</span>
                    <span className="w-12 text-center text-green-600">✓</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center">
                    <Trophy className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium">Quiz & Rewards</span>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <span className="w-12 text-center">❌</span>
                    <span className="w-12 text-center text-green-600">✓</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Archive className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium">Collection Storage</span>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <span className="w-12 text-center">20</span>
                    <span className="w-12 text-center text-green-600">∞</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-4 text-xs text-gray-500">
                <div className="flex space-x-8">
                  <span>{subscriptionPlans.free?.name || 'Basic'}</span>
                  <span className="text-green-600">{subscriptionPlans.premium?.name || 'Premium'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
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

      {/* CTA Section - New addition */}
      <section className="py-12 sm:py-16 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Start Your Rock Journey Today</h2>
          <p className="text-emerald-100 mb-6 sm:mb-8 text-sm sm:text-base max-w-2xl mx-auto">
            Join thousands of geology enthusiasts who are discovering, learning, and collecting rocks with Rockland.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link href="/registration" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-white hover:bg-gray-100 text-green-600 font-semibold px-6 sm:px-8 py-3 text-sm sm:text-base rounded-full">
                Try Free Plan
              </Button>
            </Link>
            <Link href="/features" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-green-600 px-6 sm:px-8 py-3 text-sm sm:text-base rounded-full"
              >
                View Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Quick Access - New section */}
      <section className="py-12 sm:py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Questions About Pricing?</h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Find answers to common questions about our subscription plans and features.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-sm sm:max-w-none mx-auto">
            <Link href="/faq" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 px-4 sm:px-6 py-2 text-sm sm:text-base"
              >
                View FAQ
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 px-4 sm:px-6 py-2 text-sm sm:text-base"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Made responsive */}
      <footer className="bg-green-600 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-sm text-center sm:text-left">
              <div className="mb-4 font-medium">2025 Rockland FYP-S2-G19</div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
                <a href="#" className="text-emerald-200 hover:text-white transition-colors">
                  Privacy & Policy
                </a>
                <a href="#" className="text-emerald-200 hover:text-white transition-colors">
                  Terms & Conditions
                </a>
              </div>
              <div className="mt-4">
                <a href="/login" className="text-emerald-200 hover:text-white text-xs transition-colors">
                  Admin Login
                </a>
              </div>
            </div>
            
            {/* Additional footer sections */}
            <div className="text-sm text-center sm:text-left">
              <div className="font-medium mb-4">Product</div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div><Link href="/features" className="text-emerald-200 hover:text-white transition-colors">Features</Link></div>
                <div><Link href="/pricing" className="text-emerald-200 hover:text-white transition-colors">Pricing</Link></div>
                <div><Link href="/faq" className="text-emerald-200 hover:text-white transition-colors">FAQ</Link></div>
              </div>
            </div>
            
            <div className="text-sm text-center sm:text-left">
              <div className="font-medium mb-4">Support</div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div><a href="#" className="text-emerald-200 hover:text-white transition-colors">Help Center</a></div>
                <div><a href="#" className="text-emerald-200 hover:text-white transition-colors">Contact Us</a></div>
                <div><a href="#" className="text-emerald-200 hover:text-white transition-colors">Community</a></div>
              </div>
            </div>
            
            <div className="text-sm text-center sm:text-left">
              <div className="font-medium mb-4">Connect</div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div><a href="#" className="text-emerald-200 hover:text-white transition-colors">Newsletter</a></div>
                <div><a href="#" className="text-emerald-200 hover:text-white transition-colors">Social Media</a></div>
                <div><a href="#" className="text-emerald-200 hover:text-white transition-colors">Blog</a></div>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-green-500 text-center">
            <p className="text-emerald-200 text-xs sm:text-sm">
              © 2025 Rockland. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}