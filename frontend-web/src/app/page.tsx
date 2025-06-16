"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Play, Plus, Heart, Minus } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

export default function RocklandLanding(): JSX.Element {
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null)

  const faqData: FAQItem[] = [
    {
      question: "How do I scan a rock?",
      answer: "Simply open the Rockland app, tap the camera icon, and point your camera at the rock. The AI will automatically identify the rock type and provide detailed information."
    },
    {
      question: "How do I save a rock scan?",
      answer: "After scanning a rock, tap the 'Save' button to add it to your personal collection. You can access saved rocks in the 'My Collection' section of the app."
    },
    {
      question: "How do I upgrade my account?",
      answer: "Go to Settings > Subscription in the app, or visit our website's pricing page. Choose the Premium plan for unlimited scans and advanced features."
    },
    {
      question: "How do I earn points?",
      answer: "Earn points by completing daily quizzes, scanning new rocks, sharing discoveries with the community, and participating in challenges."
    },
    {
      question: "How many free scans do I get?",
      answer: "Free users get 5 rock scans per day. Premium subscribers enjoy unlimited scans along with access to advanced identification features."
    },
    {
      question: "What if no rock information is found?",
      answer: "If our AI can't identify a rock, you can submit it to our expert geologists for manual identification. Premium users get priority support for unknown specimens."
    }
  ]

  const toggleFAQ = (index: number): void => {
    setOpenFAQIndex(openFAQIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-green-600 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-white text-xl font-bold">ROCKLAND</div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-white hover:text-green-100">
              Home
            </a>
            <Link href="/features" className="text-white hover:text-green-100">
              Feature
            </Link>
            <Link href="/pricing" className="text-white hover:text-green-100">
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="text-sm mb-4">#1 Rock Learning Platform</div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">Explore the World of Rocks</h1>
              <p className="text-lg mb-8 text-emerald-100">
                Rockland helps you explore and learn about rocks interactively using AI, maps, and gamification.
              </p>
              <Link href="/registration">
                <Button className="bg-white hover:bg-gray-100 text-green-600 font-semibold px-6 py-2 rounded-full border border-white hover:border-gray-200 transition-all duration-200">
                  Register Now!
                </Button>
              </Link>

              <div className="space-y-4 mt-8">
                <div className="text-sm font-medium">DOWNLOAD OUR APP</div>
                <div className="flex space-x-4">
                  {/* App Store Badge */}
                  <a href="#" className="hover:opacity-80 transition-opacity">
                    <div className="bg-black text-white rounded-lg px-4 py-2 flex items-center space-x-2 min-w-[140px]">
                      <div>
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs">Download on the</div>
                        <div className="text-sm font-semibold">App Store</div>
                      </div>
                    </div>
                  </a>
                  
                  {/* Google Play Badge */}
                  <a href="#" className="hover:opacity-80 transition-opacity">
                    <div className="bg-black text-white rounded-lg px-4 py-2 flex items-center space-x-2 min-w-[140px]">
                      <div>
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs">Get it on</div>
                        <div className="text-sm font-semibold">Google Play</div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white rounded-t-3xl"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative flex justify-center">
              {/* Main phone mockup */}
              <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-[3rem] p-3 shadow-2xl relative z-10 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-[2.5rem] p-1 shadow-inner">
                  <div className="w-[300px] h-[600px] bg-gradient-to-br from-white via-gray-50 to-white rounded-[2.5rem] relative overflow-hidden shadow-lg">
                    {/* Phone notch with realistic styling */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-7 bg-gradient-to-b from-gray-900 to-black rounded-b-3xl flex items-center justify-center shadow-lg">
                      <div className="w-16 h-1 bg-gray-600 rounded-full"></div>
                      <div className="absolute left-3 w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                    </div>
                    
                    {/* Status bar with improved styling */}
                    <div className="flex justify-between items-center px-6 pt-10 pb-2 bg-gradient-to-r from-white to-gray-50">
                      <div className="flex items-center gap-1">
                        <div className="text-xs font-semibold text-gray-800">9:41</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                          <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        </div>
                        <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M2 17h20v2H2zm1.15-4.05L4 11.47l.85 1.48 1.3-.75-.85-1.48H7v-1.5H5.3l.85-1.48L4.85 7 4 8.47 3.15 7l-1.3.75.85 1.48H1v1.5h1.7l-.85 1.48 1.3.75z"/>
                        </svg>
                        <div className="w-6 h-3 border border-gray-800 rounded-sm">
                          <div className="w-4 h-1.5 bg-green-500 rounded-sm m-0.5"></div>
                        </div>
                      </div>
                    </div>

                    {/* App content with enhanced styling */}
                    <div className="px-4 pt-2 bg-gradient-to-b from-white via-gray-50 to-white">
                      <div className="text-sm font-bold mb-1 text-center bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">ROCKLAND</div>
                      <div className="text-xs text-gray-500 mb-4 text-center">#1 Rock Learning Platform</div>

                      {/* Search bar with modern styling */}
                      <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl px-4 py-3 mb-4 flex items-center shadow-sm border border-gray-200">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-sm text-gray-400">Search rocks...</span>
                      </div>

                      {/* Promotional cards with gradients */}
                      <div className="space-y-3 mb-4">
                        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl px-4 py-3 text-sm flex items-center justify-between shadow-lg">
                          <span className="flex-1 text-center font-medium">Upgrade to Premium</span>
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl px-4 py-3 text-sm text-center font-medium shadow-lg">
                          🎉 50% Off. Tap to claim.
                        </div>
                      </div>

                      {/* Action buttons with improved styling */}
                      <div className="flex gap-3 mb-4">
                        <button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-2xl py-3 text-sm font-medium shadow-lg transform hover:scale-105 transition-all duration-200">
                          📝 Take Quiz
                        </button>
                        <button className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-2xl py-3 text-sm font-medium shadow-sm transform hover:scale-105 transition-all duration-200">
                          🏆 Leaderboard
                        </button>
                      </div>

                      {/* Popular section with better typography */}
                      <div className="mb-3">
                        <h3 className="text-sm font-bold mb-1 text-gray-800">Popular on Rockland</h3>
                        <p className="text-xs text-gray-500">Featured Articles</p>
                      </div>

                      {/* Article grid with enhanced cards */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-3 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                          <div className="relative h-14 mb-2 rounded-xl overflow-hidden shadow-sm">
                            <Image
                              src="/1.png"
                              alt="Types of Igneous Rocks"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </div>
                          <p className="text-xs font-semibold line-clamp-2 text-gray-800">Types of Igneous Rocks</p>
                          <div className="flex items-center mt-1">
                            <div className="flex text-yellow-400">
                              <span className="text-xs">★★★★★</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-3 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                          <div className="relative h-14 mb-2 rounded-xl overflow-hidden shadow-sm">
                            <Image
                              src="/2.jpg"
                              alt="Sedimentary Rock Formation"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </div>
                          <p className="text-xs font-semibold line-clamp-2 text-gray-800">Sedimentary Rock Formation</p>
                          <div className="flex items-center mt-1">
                            <div className="flex text-yellow-400">
                              <span className="text-xs">★★★★☆</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-3 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                          <div className="relative h-14 mb-2 rounded-xl overflow-hidden shadow-sm">
                            <Image
                              src="/3.png"
                              alt="Crystal Identification Guide"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </div>
                          <p className="text-xs font-semibold line-clamp-2 text-gray-800">Crystal Identification Guide</p>
                          <div className="flex items-center mt-1">
                            <div className="flex text-yellow-400">
                              <span className="text-xs">★★★★★</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-3 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                          <div className="relative h-14 mb-2 rounded-xl overflow-hidden shadow-sm">
                            <Image
                              src="/1.png"
                              alt="Rock Collecting Tips"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </div>
                          <p className="text-xs font-semibold line-clamp-2 text-gray-800">Rock Collecting Tips</p>
                          <div className="flex items-center mt-1">
                            <div className="flex text-yellow-400">
                              <span className="text-xs">★★★★☆</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom navigation with modern styling */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-gray-50 border-t border-gray-100 backdrop-blur-sm">
                      <div className="flex justify-around py-3 px-2">
                        <button className="flex flex-col items-center gap-1 group">
                          <div className="p-1.5 rounded-xl bg-green-600 shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                            </svg>
                          </div>
                          <span className="text-xs text-green-600 font-medium">Home</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 group">
                          <div className="p-1.5 rounded-xl">
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                          </div>
                          <span className="text-xs text-gray-400 group-hover:text-gray-600">Feed</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 group">
                          <div className="p-1.5 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <span className="text-xs text-orange-500 font-medium">Scan</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 group">
                          <div className="p-1.5 rounded-xl">
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                          </div>
                          <span className="text-xs text-gray-400 group-hover:text-gray-600">Maps</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 group">
                          <div className="p-1.5 rounded-xl">
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="text-xs text-gray-400 group-hover:text-gray-600">Account</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature callouts positioned around the phone with enhanced styling */}
              {/* Rock Identifier - top left */}
              <div className="absolute top-8 -left-40 bg-gradient-to-br from-white to-gray-50 rounded-2xl px-5 py-3 shadow-xl border border-gray-200 z-20 transform -rotate-2 hover:rotate-0 transition-transform duration-300 max-w-[180px]">
                <div className="text-sm font-bold text-gray-800">🔍 1. Rock Identifier</div>
                <div className="text-xs text-gray-500 mt-1">AI-powered scanning</div>
              </div>

              {/* Interactive Map - top right */}
              <div className="absolute top-8 -right-40 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl px-5 py-3 shadow-xl z-20 transform rotate-2 hover:rotate-0 transition-transform duration-300 max-w-[180px]">
                <div className="text-sm font-bold">🗺️ 2. Interactive Map</div>
                <div className="text-xs text-green-100 mt-1">Discover locations</div>
              </div>

              {/* Daily Quiz - bottom left */}
              <div className="absolute bottom-32 -left-40 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl px-5 py-3 shadow-xl z-20 transform rotate-1 hover:rotate-0 transition-transform duration-300 max-w-[180px]">
                <div className="text-sm font-bold">📝 3. Daily Quiz</div>
                <div className="text-xs text-blue-100 mt-1">Test your knowledge</div>
              </div>

              {/* Social - bottom right */}
              <div className="absolute bottom-32 -right-40 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl px-5 py-3 shadow-xl z-20 transform -rotate-1 hover:rotate-0 transition-transform duration-300 max-w-[180px]">
                <div className="text-sm font-bold">👥 4. Social</div>
                <div className="text-xs text-purple-100 mt-1">Connect & share</div>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <h2 className="text-5xl lg:text-6xl font-bold text-gray-900">
                Rockland
              </h2>
              <h3 className="text-4xl lg:text-5xl font-bold mt-2 text-gray-700">
                Special Features
              </h3>
              <p className="text-lg text-gray-600 mt-4 max-w-md">
                Discover our innovative features designed to enhance your rock learning experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Demo Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">App Demo</h2>
          <p className="text-gray-600 mb-8">Lets see virtually how its work</p>

          <div className="bg-gray-900 rounded-2xl aspect-video overflow-hidden shadow-2xl">
            <video 
              className="w-full h-full object-cover"
              controls
              poster="/video-thumbnail.jpg"
            >
              <source src="/rock.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Our Articles</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Featured Article */}
            <Card className="overflow-hidden bg-white">
              <div className="relative">
                <div className="w-full h-48 relative overflow-hidden">
                  <Image
                    src="/1.png"
                    alt="Igneous Rock Sample"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">Igneous Rock Sample</span>
                  </div>
                </div>
                <Badge className="absolute top-4 right-4 bg-green-600">Free</Badge>
              </div>
              <CardContent className="p-4 bg-white">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mr-3 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">SK</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Dr. Sarah Kim</div>
                    <div className="text-xs text-gray-500">2 days ago</div>
                  </div>
                </div>
                <h3 className="font-bold mb-2">Understanding the Three Types of Geological Rocks</h3>
                <p className="text-sm text-gray-600 mb-3">Explore igneous, sedimentary, and metamorphic rocks and learn how they form through Earth's geological processes.</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">2.1k views</div>
                    <div className="text-sm text-gray-500">5 min read</div>
                  </div>
                  <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
                </div>
              </CardContent>
            </Card>

            {/* Rock Identification Guide */}
            <Card className="overflow-hidden bg-white">
              <div className="relative">
                <div className="w-full h-48 relative overflow-hidden">
                  <Image
                    src="/2.jpg"
                    alt="Sedimentary Layers"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">Sedimentary Layers</span>
                  </div>
                </div>
                <Badge className="absolute top-4 right-4 bg-blue-600">Premium</Badge>
              </div>
              <CardContent className="p-4 bg-white">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full mr-3 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">MJ</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Prof. Michael Johnson</div>
                    <div className="text-xs text-gray-500">1 week ago</div>
                  </div>
                </div>
                <h3 className="font-bold mb-2">Complete Rock Identification Field Guide</h3>
                <p className="text-sm text-gray-600 mb-3">Master the art of identifying rocks in the field using texture, color, crystal structure, and formation clues.</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">3.7k views</div>
                    <div className="text-sm text-gray-500">12 min read</div>
                  </div>
                  <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
                </div>
              </CardContent>
            </Card>

            {/* Crystal Formation Article */}
            <Card className="overflow-hidden bg-white">
              <div className="relative">
                <div className="w-full h-48 relative overflow-hidden">
                  <Image
                    src="/3.png"
                    alt="Crystal Structure"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">Crystal Structure</span>
                  </div>
                </div>
                <Badge className="absolute top-4 right-4 bg-blue-600">Premium</Badge>
              </div>
              <CardContent className="p-4 bg-white">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mr-3 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">AL</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Dr. Anna Lee</div>
                    <div className="text-xs text-gray-500">3 days ago</div>
                  </div>
                </div>
                <h3 className="font-bold mb-2">The Science of Crystal Formation and Growth</h3>
                <p className="text-sm text-gray-600 mb-3">Dive deep into crystallography and understand how temperature, pressure, and chemical composition create stunning crystal formations.</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">1.9k views</div>
                    <div className="text-sm text-gray-500">8 min read</div>
                  </div>
                  <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Subscription Plan</h2>
          <p className="text-gray-600 mb-12">
            With lots of unique blocks, you can easily build a<br />
            page easily without any coding.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Basic Plan */}
            <Card className="p-8 relative">
              <div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">BASIC</span>
                </div>
                <div className="text-5xl font-bold mb-1">
                  $0<span className="text-base font-normal text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-600 mb-8">Perfect for casual rock enthusiasts</p>

                <Link href="/registration">
                  <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white mb-8">
                    Get Started Free
                  </Button>
                </Link>

                <div className="space-y-3 text-left">
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Photo-based rock identification</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">5 scans per day</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Basic rock database (1,000+ rocks)</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Community forum access</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">View nearby rock locations</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Premium Plan */}
            <Card className="p-8 relative border-green-600 border-2">
              {/* Most Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Most Popular
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-green-600">PREMIUM</span>
                </div>
                <div className="text-5xl font-bold mb-1">
                  $5<span className="text-base font-normal text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-600 mb-8">For serious rock collectors and students</p>

                <Link href="/registration">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white mb-8">
                    Start Premium Plan
                  </Button>
                </Link>

                <div className="space-y-3 text-left">
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Everything in Basic</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Unlimited rock scans</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Interactive mapping & discovery</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Expert consultation access</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Quiz system with point rewards</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

{/* Download Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">Download Rockland and Start Exploring Now!</h2>

          <div className="flex justify-center">
            <div className="text-center">
              <div className="w-48 h-48 relative overflow-hidden rounded-xl mx-auto mb-4">
                <Image
                  src="/qr.jpg"
                  alt="QR Code to download Rockland app"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-gray-600">Scan the QR code</p>
              <p className="text-sm text-gray-600 mb-8">to download the app on your phone</p>

              <div className="flex justify-center space-x-4">
                {/* App Store Badge */}
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <div className="bg-black text-white rounded-lg px-4 py-2 flex items-center space-x-2 min-w-[140px]">
                    <div>
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs">Download on the</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </div>
                </a>
                
                {/* Google Play Badge */}
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <div className="bg-black text-white rounded-lg px-4 py-2 flex items-center space-x-2 min-w-[140px]">
                    <div>
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs">Get it on</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold mb-8">
                Frequently
                <br />
                asked
                <br />
                questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqData.map((faq: FAQItem, index: number) => (
                <div key={index} className="border-b border-gray-200">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50 rounded-lg px-2"
                  >
                    <span className="text-gray-700 font-medium pr-4">{faq.question}</span>
                    {openFAQIndex === index ? (
                      <Minus className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openFAQIndex === index && (
                    <div className="pb-4 pr-8 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
                <a href="/login" className="text-green-200 hover:text-white text-xs">
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