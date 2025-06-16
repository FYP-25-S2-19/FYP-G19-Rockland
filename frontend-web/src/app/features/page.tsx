"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Camera,
  Map,
  Brain,
  Users,
  BookOpen,
  Trophy,
  Zap,
  Shield,
  Download,
  Star,
  Globe,
  Search,
  Heart,
  Target,
  Smartphone,
  Database,
  Award,
  X,
  RotateCcw,
  Lightbulb,
  Image as ImageIcon,
} from "lucide-react"

export default function FeaturesPage() {
  const mainFeatures = [
    {
      icon: Camera,
      title: "AI Rock Identifier",
      description: "Advanced AI technology that identifies rocks with 95% accuracy using your smartphone camera.",
      details: [
        "Instant rock identification in seconds",
        "Works with over 5,000 rock types",
        "Detailed mineral composition analysis",
        "Color, texture, and crystal structure recognition",
      ],
      badge: "Core Feature",
    },
    {
      icon: Map,
      title: "Interactive Geological Map",
      description: "Explore geological formations and rock locations around the world with our interactive map.",
      details: [
        "Real-time geological data",
        "Rock formation hotspots",
        "Community-contributed locations",
      ],
      badge: "Core Feature",
    },
    {
      icon: Brain,
      title: "Daily Learning Quiz",
      description: "Test your knowledge with daily quizzes and earn points while learning about geology.",
      details: [
        "Daily challenges with varying difficulty",
        "Earn points and unlock achievements",
        "Track your learning progress",
        "Compete with friends on leaderboards",
      ],
      badge: "Gamification",
    },
    {
      icon: Users,
      title: "Social Community",
      description: "Connect with fellow rock enthusiasts, share discoveries, and learn from experts.",
      details: [
        "Share your rock discoveries",
        "Get expert identification help",
        "Join discussion forums",
        "Follow other collectors",
      ],
      badge: "Community",
    },
  ]

  const additionalFeatures = [
    {
      icon: BookOpen,
      title: "Educational Content",
      description: "Comprehensive learning materials from basic geology to advanced mineralogy.",
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description: "Unlock badges and achievements as you discover new rocks and complete challenges.",
    },
    {
      icon: Download,
      title: "Offline Mode",
      description: "Access your rock database and identification tools even without internet connection.",
    },
    {
      icon: Shield,
      title: "Expert Verification",
      description: "Get your rare finds verified by professional geologists and mineralogists.",
    },
    {
      icon: Database,
      title: "Personal Collection",
      description: "Build and organize your digital rock collection with photos, notes, and locations.",
    },
    {
      icon: Search,
      title: "Advanced Search",
      description: "Find rocks by color, hardness, location, or any other geological property.",
    },
  ]

  const technicalFeatures = [
    {
      title: "Machine Learning AI",
      description: "Our AI is trained on millions of rock samples for accurate identification",
      icon: Brain,
    },
    {
      title: "Cloud Sync",
      description: "Your data syncs across all devices automatically",
      icon: Globe,
    },
    {
      title: "High-Resolution Analysis",
      description: "Analyze rock textures and patterns in stunning detail",
      icon: Target,
    },
    {
      title: "Real-time Processing",
      description: "Get instant results without waiting for server processing",
      icon: Zap,
    },
  ]

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
            <Link href="/features" className="text-white hover:text-green-100 font-semibold">
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

      {/* Header Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link href="/" className="inline-flex items-center text-white hover:text-green-100 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Rockland Special Features</h1>
          <p className="text-lg text-emerald-100 mb-8">
            Discover the powerful tools that make Rockland the #1 rock learning platform
          </p>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {mainFeatures.map((feature, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <feature.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{feature.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {feature.badge}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase with Enhanced Phone Mockup */}
      <section className="py-16 bg-gray-50">
        <style jsx>{`
          @keyframes scan-pulse {
            0%, 100% { 
              opacity: 0.7; 
              border-color: rgb(34 197 94);
            }
            50% { 
              opacity: 1; 
              border-color: rgb(74 222 128);
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          .scan-animation {
            animation: scan-pulse 2s ease-in-out infinite;
          }
          
          .phone-glow {
            box-shadow: 0 0 60px rgba(34, 197, 94, 0.3);
          }
          
          .floating {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">See Rockland in Action</h2>
              <p className="text-gray-600 mb-8">
                Experience the power of AI-driven rock identification with our intuitive mobile interface.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Camera className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Point & Identify</h4>
                    <p className="text-sm text-gray-600">
                      Simply point your camera at any rock for instant identification
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Brain className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">AI Analysis</h4>
                    <p className="text-sm text-gray-600">
                      Advanced AI analyzes texture, color, and mineral composition
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Learn & Save</h4>
                    <p className="text-sm text-gray-600">Get detailed information and save to your collection</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Phone Mockup with Camera Interface */}
            <div className="flex justify-center">
              <div className="relative floating">
                {/* Glow effect */}
                <div className="absolute inset-0 phone-glow rounded-[3rem] opacity-60"></div>
                
                <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="bg-black rounded-[2.5rem] p-1">
                    <div className="w-[300px] h-[600px] bg-black rounded-[2.5rem] relative overflow-hidden">
                      {/* Phone notch */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20"></div>

                      {/* Camera interface background with rock image */}
                      <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-gray-600 via-gray-500 to-gray-700 relative">
                          {/* Simulated rock texture */}
                          <div className="absolute inset-0 opacity-80">
                            <div className="absolute top-1/4 left-1/4 w-32 h-48 bg-gray-300 rounded-full transform rotate-12 opacity-70"></div>
                            <div className="absolute top-1/3 left-1/3 w-24 h-36 bg-gray-200 rounded-full transform -rotate-6 opacity-60"></div>
                            <div className="absolute top-2/5 left-2/5 w-20 h-28 bg-gray-100 rounded-full transform rotate-3 opacity-50"></div>
                          </div>
                          {/* Dark overlay for better contrast */}
                          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                        </div>
                      </div>

                      {/* Camera UI overlay */}
                      <div className="relative z-10 h-full flex flex-col">
                        {/* Top controls */}
                        <div className="flex justify-between items-center p-4 pt-8">
                          <button className="w-10 h-10 bg-black bg-opacity-20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors">
                            <X className="w-6 h-6 text-white" />
                          </button>
                          <button className="w-10 h-10 bg-black bg-opacity-20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors">
                            <Zap className="w-6 h-6 text-white" />
                          </button>
                        </div>

                        {/* Center area - spacer for viewfinder */}
                        <div className="flex-1 flex items-center justify-center relative">
                          {/* Enhanced scanning animation overlay */}
                          <div className="absolute inset-8 border-2 rounded-2xl scan-animation">
                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-2xl"></div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-2xl"></div>
                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-2xl"></div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-2xl"></div>
                          </div>
                          
                          {/* Enhanced scanning indicator */}
                          <div className="bg-green-500 bg-opacity-90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            Scanning...
                          </div>
                        </div>

                        {/* Bottom controls */}
                        <div className="p-6 pb-8">
                          {/* Flash icon */}
                          <div className="flex justify-center mb-8">
                            <button className="w-12 h-12 bg-black bg-opacity-20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors">
                              <Lightbulb className="w-6 h-6 text-white" />
                            </button>
                          </div>

                          {/* Bottom action row */}
                          <div className="flex items-center justify-between">
                            {/* Gallery button */}
                            <button className="w-12 h-12 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-opacity-70 transition-colors">
                              <ImageIcon className="w-6 h-6 text-white" />
                            </button>

                            {/* Enhanced capture button */}
                            <button className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
                              <div className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 relative">
                                <div className="absolute inset-2 bg-gray-100 rounded-full"></div>
                              </div>
                            </button>

                            {/* Flip camera button */}
                            <button className="w-12 h-12 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-opacity-70 transition-colors">
                              <RotateCcw className="w-6 h-6 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">More Powerful Features</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built with Advanced Technology</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Rockland leverages cutting-edge technology to provide the most accurate and reliable rock identification
              experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technicalFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <feature.icon className="w-10 h-10 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
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