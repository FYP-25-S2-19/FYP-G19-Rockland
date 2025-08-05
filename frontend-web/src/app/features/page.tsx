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
  Menu,
} from "lucide-react"
import { useState } from "react"

export default function FeaturesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = (): void => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

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
              <Link href="/features" className="block text-white hover:text-green-100 font-semibold py-2">
                Feature
              </Link>
              <Link href="/pricing" className="block text-white hover:text-green-100 py-2">
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Rockland Special Features
          </h1>
          <p className="text-base sm:text-lg text-emerald-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Discover the powerful tools that make Rockland the #1 rock learning platform
          </p>
        </div>
      </section>

      {/* Main Features Section - Made responsive */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {mainFeatures.map((feature, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold">{feature.title}</h3>
                        <Badge variant="secondary" className="text-xs w-fit">
                          {feature.badge}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{feature.description}</p>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start text-sm sm:text-base text-gray-700">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        <span className="leading-relaxed">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase with Enhanced Phone Mockup - Made responsive */}
      <section className="py-12 sm:py-16 bg-gray-50">
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
          
          @media (max-width: 640px) {
            .floating {
              animation: none;
            }
            .phone-glow {
              box-shadow: 0 0 30px rgba(34, 197, 94, 0.2);
            }
          }
        `}</style>
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">See Rockland in Action</h2>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
                Experience the power of AI-driven rock identification with our intuitive mobile interface.
              </p>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Point & Identify</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Simply point your camera at any rock for instant identification
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">AI Analysis</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Advanced AI analyzes texture, color, and mineral composition
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Learn & Save</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Get detailed information and save to your collection
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Phone Mockup with Camera Interface - Made responsive */}
            <div className="flex justify-center order-1 lg:order-2">
              <div className="relative floating">
                {/* Glow effect */}
                <div className="absolute inset-0 phone-glow rounded-[2rem] sm:rounded-[3rem] opacity-60"></div>
                
                <div className="relative bg-gray-900 rounded-[2rem] sm:rounded-[3rem] p-1 sm:p-2 shadow-2xl">
                  <div className="bg-black rounded-[1.5rem] sm:rounded-[2.5rem] p-1">
                    <div className="w-[240px] sm:w-[300px] h-[480px] sm:h-[600px] bg-black rounded-[1.5rem] sm:rounded-[2.5rem] relative overflow-hidden">
                      {/* Phone notch - responsive */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-4 sm:h-6 bg-gray-900 rounded-b-xl sm:rounded-b-2xl z-20"></div>

                      {/* Camera interface background with rock image */}
                      <div className="absolute inset-0 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-gray-600 via-gray-500 to-gray-700 relative">
                          {/* Simulated rock texture - responsive */}
                          <div className="absolute inset-0 opacity-80">
                            <div className="absolute top-1/4 left-1/4 w-24 sm:w-32 h-36 sm:h-48 bg-gray-300 rounded-full transform rotate-12 opacity-70"></div>
                            <div className="absolute top-1/3 left-1/3 w-18 sm:w-24 h-28 sm:h-36 bg-gray-200 rounded-full transform -rotate-6 opacity-60"></div>
                            <div className="absolute top-2/5 left-2/5 w-16 sm:w-20 h-22 sm:h-28 bg-gray-100 rounded-full transform rotate-3 opacity-50"></div>
                          </div>
                          {/* Dark overlay for better contrast */}
                          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                        </div>
                      </div>

                      {/* Camera UI overlay - responsive */}
                      <div className="relative z-10 h-full flex flex-col">
                        {/* Top controls - responsive */}
                        <div className="flex justify-between items-center p-3 sm:p-4 pt-6 sm:pt-8">
                          <button className="w-8 h-8 sm:w-10 sm:h-10 bg-black bg-opacity-20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors">
                            <X className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                          </button>
                          <button className="w-8 h-8 sm:w-10 sm:h-10 bg-black bg-opacity-20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors">
                            <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                          </button>
                        </div>

                        {/* Center area - spacer for viewfinder */}
                        <div className="flex-1 flex items-center justify-center relative">
                          {/* Enhanced scanning animation overlay - responsive */}
                          <div className="absolute inset-6 sm:inset-8 border-2 rounded-xl sm:rounded-2xl scan-animation">
                            <div className="absolute -top-1 -left-1 w-6 sm:w-8 h-6 sm:h-8 border-t-4 border-l-4 border-green-400 rounded-tl-xl sm:rounded-tl-2xl"></div>
                            <div className="absolute -top-1 -right-1 w-6 sm:w-8 h-6 sm:h-8 border-t-4 border-r-4 border-green-400 rounded-tr-xl sm:rounded-tr-2xl"></div>
                            <div className="absolute -bottom-1 -left-1 w-6 sm:w-8 h-6 sm:h-8 border-b-4 border-l-4 border-green-400 rounded-bl-xl sm:rounded-bl-2xl"></div>
                            <div className="absolute -bottom-1 -right-1 w-6 sm:w-8 h-6 sm:h-8 border-b-4 border-r-4 border-green-400 rounded-br-xl sm:rounded-br-2xl"></div>
                          </div>
                          
                          {/* Enhanced scanning indicator - responsive */}
                          <div className="bg-green-500 bg-opacity-90 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-2 shadow-lg">
                            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white rounded-full animate-pulse"></div>
                            Scanning...
                          </div>
                        </div>

                        {/* Bottom controls - responsive */}
                        <div className="p-4 sm:p-6 pb-6 sm:pb-8">
                          {/* Flash icon */}
                          <div className="flex justify-center mb-6 sm:mb-8">
                            <button className="w-10 h-10 sm:w-12 sm:h-12 bg-black bg-opacity-20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors">
                              <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </button>
                          </div>

                          {/* Bottom action row - responsive */}
                          <div className="flex items-center justify-between">
                            {/* Gallery button */}
                            <button className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-opacity-70 transition-colors">
                              <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </button>

                            {/* Enhanced capture button - responsive */}
                            <button className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full border-2 sm:border-4 border-gray-300 relative">
                                <div className="absolute inset-1 sm:inset-2 bg-gray-100 rounded-full"></div>
                              </div>
                            </button>

                            {/* Flip camera button */}
                            <button className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-opacity-70 transition-colors">
                              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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

      {/* Additional Features Grid - Made responsive */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">More Powerful Features</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold mb-2 text-sm sm:text-base">{feature.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Features - Made responsive */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Built with Advanced Technology</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Rockland leverages cutting-edge technology to provide the most accurate and reliable rock identification
              experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {technicalFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-white w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
                  <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">{feature.title}</h4>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - New addition */}
      <section className="py-12 sm:py-16 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Explore?</h2>
          <p className="text-emerald-100 mb-6 sm:mb-8 text-sm sm:text-base max-w-2xl mx-auto">
            Join thousands of rock enthusiasts who are already using Rockland to discover and learn about geology.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link href="/registration" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-white hover:bg-gray-100 text-green-600 font-semibold px-6 sm:px-8 py-3 text-sm sm:text-base rounded-full">
                Get Started Free
              </Button>
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-green-600 px-6 sm:px-8 py-3 text-sm sm:text-base rounded-full"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Made responsive */}
      <footer className="bg-green-600 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-sm text-center sm:text-left">
              <div className="mb-4 font-medium">2025 Rockland FYP-S2-G19</div>
              <div className="mt-4">
                <a href="/login" className="text-emerald-200 hover:text-white text-xs transition-colors">
                  Admin Login
                </a>
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