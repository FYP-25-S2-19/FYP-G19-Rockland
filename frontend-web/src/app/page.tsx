"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Play, Plus, Minus, Loader2 } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

interface Video {
  video_id: number
  name: string
  description: string
  file_url: string
  file_name: string
  file_size: number
  file_type: string
  date_created: string
}

export default function RocklandLanding(): JSX.Element {
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null)
  const [demoVideo, setDemoVideo] = useState<Video | null>(null)
  const [videoLoading, setVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)

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

  // Fetch the most recent video for landing page
  useEffect(() => {
    const fetchLatestVideo = async () => {
      try {
        setVideoLoading(true)
        setVideoError(null)
        
        // Use the correct backend port (5000)
        const response = await fetch('http://localhost:5000/api/videos')
        
        if (!response.ok) {
          if (response.status === 404) {
            setVideoError("No videos available")
          } else {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return
        }
        
        const videoData = await response.json()
        console.log('📹 Received video data:', videoData)
        
        // Check if we got video data
        if (videoData && videoData.video_id) {
          // Use signed_video_url (the working GCS URL with authentication)
          const videoUrl = videoData.signed_video_url || videoData.file_url
          
          if (videoUrl) {
            // Create video object with the working URL
            const workingVideo = {
              ...videoData,
              file_url: videoUrl  // Use the signed URL
            }
            setDemoVideo(workingVideo)
            console.log('✅ Video loaded successfully:', workingVideo.name)
            console.log('🔗 Video URL:', videoUrl)
          } else {
            setVideoError("Video file not accessible")
          }
        } else {
          setVideoError("No videos available")
        }
      } catch (error) {
        console.error('❌ Error fetching latest video:', error)
        setVideoError("Failed to load video")
      } finally {
        setVideoLoading(false)
      }
    }

    fetchLatestVideo()
  }, [])

  const toggleFAQ = (index: number): void => {
    setOpenFAQIndex(openFAQIndex === index ? null : index)
  }

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
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
              {/* Main phone mockup using uploaded image */}
              <div className="relative z-10 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="w-[300px] h-[600px] relative overflow-hidden rounded-[3rem] shadow-2xl">
                  <Image
                    src="/5.jpg"
                    alt="Rockland app interface on phone"
                    fill
                    className="object-cover rounded-[3rem]"
                  />
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
          <p className="text-gray-600 mb-8">Let's see virtually how it works</p>

          <div className="bg-gray-900 rounded-2xl aspect-video overflow-hidden shadow-2xl relative">
            {videoLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                  <p>Loading demo video...</p>
                </div>
              </div>
            ) : videoError ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-red-400 mb-2">⚠️</div>
                  <p className="text-red-300">{videoError}</p>
                  <p className="text-sm text-gray-400 mt-2">Please check back later</p>
                </div>
              </div>
            ) : demoVideo ? (
              <>
                <video 
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                >
                  <source src={demoVideo.file_url} type={demoVideo.file_type} />
                  Your browser does not support the video tag.
                </video>
                
                {/* Video Info Overlay */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white rounded-lg px-3 py-2 text-sm">
                  <div className="font-medium">{demoVideo.name}</div>
                  {demoVideo.description && (
                    <div className="text-xs text-gray-300 mt-1">{demoVideo.description}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {formatFileSize(demoVideo.file_size)} • {demoVideo.file_type}
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No demo video available</p>
                </div>
              </div>
            )}
          </div>
          
          {demoVideo && (
            <div className="mt-4 text-center text-gray-600">
              <p className="text-sm">
                Video uploaded on {new Date(demoVideo.date_created).toLocaleDateString()}
              </p>
            </div>
          )}
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
                <div className="flex items-center mt-4">
                  <div className="text-sm text-gray-500">1.5k likes</div>
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
                <div className="flex items-center mt-4">
                  <div className="text-sm text-gray-500">1.5k likes</div>
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
                <div className="flex items-center mt-4">
                  <div className="text-sm text-gray-500">1.5k likes</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600">Join thousands of rock enthusiasts who love using Rockland</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mr-4 flex items-center justify-center">
                  <span className="text-white font-bold">JM</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Jessica Martinez</h4>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic">"Rockland has revolutionized my field studies! The AI identification is incredibly accurate, and I love how I can track all my discoveries in one place. The quiz feature keeps me engaged and learning."</p>
            </Card>

            {/* Testimonial 2 */}
            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full mr-4 flex items-center justify-center">
                  <span className="text-white font-bold">DT</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">David Thompson</h4>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic">"As a hobbyist collector for 15 years, I've never seen anything like this. The interactive maps help me discover new locations, and the community features let me connect with fellow enthusiasts worldwide."</p>
            </Card>

            {/* Testimonial 3 */}
            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mr-4 flex items-center justify-center">
                  <span className="text-white font-bold">LW</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Lisa Wong</h4>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(4)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <svg className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p className="text-gray-600 italic">"My earth science students absolutely love using Rockland for their field trips! It makes learning interactive and fun. The educational content is top-notch and perfectly aligned with our curriculum."</p>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">25K+</div>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">500K+</div>
              <p className="text-gray-600">Rocks Identified</p>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">4.8</div>
              <p className="text-gray-600">App Store Rating</p>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">150+</div>
              <p className="text-gray-600">Countries</p>
            </div>
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