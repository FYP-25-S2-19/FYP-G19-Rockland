"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Play, Plus, Minus, Loader2, Menu, X, Star } from "lucide-react"

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface FAQItem {
  faq_id: number
  question: string
  answer: string
  user_id: number
}

interface Video {
  video_id: number
  name: string
  description: string
  file_url: string
  signed_video_url: string
  file_name: string
  file_size: number
  file_type: string
  date_created: string
  is_selected: boolean
}

interface Testimonial {
  testimonials_id: number
  name: string  // This comes from the model's get_user_display_name method
  user_name?: string  // Alternative field name for compatibility
  rating: number
  testimony: string
  date_created: string
  user_id: number
  is_selected: boolean  // Updated field name to match backend
}

interface Article {
  article_id: number
  title: string
  content: string
  photo: string
  photo_url: string
  signed_photo_url: string
  date_created: string
  is_free: boolean
  categories_id: number
  category_title: string
  user_id: number
  author_name: string
  author_email: string
  total_likes: number
}

interface AppLink {
  app_link_id: number
  name: string
  user_id: number
  date_created: string
  link_attached: string
}

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

export default function RocklandLanding(): JSX.Element {
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null)
  const [demoVideo, setDemoVideo] = useState<Video | null>(null)
  const [videoLoading, setVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // New states for dynamic FAQ
  const [faqData, setFaqData] = useState<FAQItem[]>([])
  const [faqLoading, setFaqLoading] = useState(true)
  const [faqError, setFaqError] = useState<string | null>(null)

  // New states for dynamic testimonials
  const [testimonialsData, setTestimonialsData] = useState<Testimonial[]>([])
  const [testimonialsLoading, setTestimonialsLoading] = useState(true)
  const [testimonialsError, setTestimonialsError] = useState<string | null>(null)

  // New states for dynamic articles
  const [articlesData, setArticlesData] = useState<Article[]>([])
  const [articlesLoading, setArticlesLoading] = useState(true)
  const [articlesError, setArticlesError] = useState<string | null>(null)

  // Updated to only track Android app link
  const [androidAppLink, setAndroidAppLink] = useState<AppLink | null>(null)
  const [appLinkLoading, setAppLinkLoading] = useState(true)
  const [appLinkError, setAppLinkError] = useState<string | null>(null)

  // New states for dynamic subscription plans
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

  // Updated to fetch only Android app link
  useEffect(() => {
    const fetchAndroidAppLink = async () => {
      try {
        setAppLinkLoading(true)
        setAppLinkError(null)
        
        // Fetch all app links from your backend
        const response = await fetch(`${API_BASE_URL}/api/applinks`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('🔗 Received app links data:', data)
        
        if (data.success && data.applinks) {
          // Find Android app link
          const androidLink = data.applinks.find((link: AppLink) => {
            const name = link.name.toLowerCase()
            return name.includes('android') || name.includes('google play') || name.includes('play store')
          })
          
          setAndroidAppLink(androidLink || null)
          console.log('✅ Processed Android app link:', androidLink)
        } else {
          setAppLinkError("No app links available")
        }
      } catch (error) {
        console.error('❌ Error fetching app links:', error)
        setAppLinkError("Failed to load app link")
      } finally {
        setAppLinkLoading(false)
      }
    }

    fetchAndroidAppLink()
  }, [])

  // Fetch FAQs from database
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setFaqLoading(true)
        setFaqError(null)
        
        const response = await fetch(`${API_BASE_URL}/api/faqs/public`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('📋 Received FAQ data:', data)
        
        if (data.success && data.faqs) {
          // Take only the first 5 FAQs for landing page
          const limitedFaqs = data.faqs.slice(0, 5)
          setFaqData(limitedFaqs)
          console.log(`✅ Loaded ${limitedFaqs.length} FAQs for landing page`)
        } else {
          setFaqError("No FAQs available")
        }
      } catch (error) {
        console.error('❌ Error fetching FAQs:', error)
        setFaqError("Failed to load FAQs")
      } finally {
        setFaqLoading(false)
      }
    }

    fetchFaqs()
  }, [])

  // Fetch SELECTED testimonials from database
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setTestimonialsLoading(true)
        setTestimonialsError(null)
        
        const response = await fetch(`${API_BASE_URL}/api/testimonials/public`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('🎤 Received selected testimonials data:', data)
        
        if (data.success && data.testimonials) {
          // The backend should now return only selected testimonials
          // Take only the first 3 for landing page display
          const limitedTestimonials = data.testimonials.slice(0, 3)
          setTestimonialsData(limitedTestimonials)
          console.log(`✅ Loaded ${limitedTestimonials.length} selected testimonials for landing page`)
        } else {
          setTestimonialsError("No testimonials available")
        }
      } catch (error) {
        console.error('❌ Error fetching testimonials:', error)
        setTestimonialsError("Failed to load testimonials")
      } finally {
        setTestimonialsLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  // Fetch articles from database
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setArticlesLoading(true)
        setArticlesError(null)
        
        const response = await fetch(`${API_BASE_URL}/api/articles/public`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('📰 Received articles data:', data)
        
        if (data.success && data.articles) {
          // Take only the first 3 articles for landing page
          const limitedArticles = data.articles.slice(0, 3)
          setArticlesData(limitedArticles)
          console.log(`✅ Loaded ${limitedArticles.length} articles for landing page`)
        } else {
          setArticlesError("No articles available")
        }
      } catch (error) {
        console.error('❌ Error fetching articles:', error)
        setArticlesError("Failed to load articles")
      } finally {
        setArticlesLoading(false)
      }
    }

    fetchArticles()
  }, [])

  // Fetch the most recent SELECTED video for landing page
  useEffect(() => {
    const fetchLatestVideo = async () => {
      try {
        setVideoLoading(true)
        setVideoError(null)
        
        // Fetch only selected videos
        const response = await fetch(`${API_BASE_URL}/api/videos/all`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setVideoError("No videos available")
          } else {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return
        }
        
        const videoData = await response.json()
        console.log('📹 Received selected videos data:', videoData)
        
        // Check if we got video data
        if (videoData.success && videoData.videos && videoData.videos.length > 0) {
          // Get the first selected video
          const firstVideo = videoData.videos[0]
          const videoUrl = firstVideo.signed_video_url || firstVideo.file_url
          
          if (videoUrl) {
            // Create video object with the working URL
            const workingVideo = {
              ...firstVideo,
              file_url: videoUrl  // Use the signed URL
            }
            setDemoVideo(workingVideo)
            console.log('✅ Selected video loaded successfully:', workingVideo.name)
            console.log('🔗 Video URL:', videoUrl)
          } else {
            setVideoError("Video file not accessible")
          }
        } else {
          setVideoError("No selected videos available")
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

  const toggleMobileMenu = (): void => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const truncateContent = (content: string, maxLength: number = 120): string => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const getAuthorInitials = (authorName: string): string => {
    if (!authorName) return 'UN'
    return authorName.split(' ').map(word => word.charAt(0)).join('').toUpperCase()
  }

  // Helper function to get display name for testimonial
  const getTestimonialDisplayName = (testimonial: Testimonial): string => {
    if (testimonial.name) {
      return testimonial.name
    }
    
    if (testimonial.user_name) {
      return testimonial.user_name
    }
    
    return `User ${testimonial.user_id}`
  }

  // Helper function to parse features from subscription plan
  const parseFeatures = (plan: SubscriptionPlan): string[] => {
    const features = []
    if (plan.feature_a) features.push(plan.feature_a)
    if (plan.feature_b) features.push(plan.feature_b)
    if (plan.feature_c) features.push(plan.feature_c)
    if (plan.feature_d) features.push(plan.feature_d)
    return features
  }

  // Updated Android-only AppStoreButton component
  const AndroidAppButton = () => {
    // If loading, show skeleton
    if (appLinkLoading) {
      return (
        <div className="bg-gray-300 animate-pulse rounded-lg px-3 py-2 sm:px-4 flex items-center space-x-2 min-w-[120px] sm:min-w-[140px]">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-400 rounded"></div>
          <div className="space-y-1">
            <div className="w-12 sm:w-16 h-2 bg-gray-400 rounded"></div>
            <div className="w-10 sm:w-12 h-3 bg-gray-400 rounded"></div>
          </div>
        </div>
      )
    }
    
    // If error or no link, show disabled state
    if (appLinkError || !androidAppLink || !androidAppLink.link_attached) {
      return (
        <div className="bg-gray-500 text-gray-300 rounded-lg px-3 py-2 sm:px-4 flex items-center space-x-2 min-w-[120px] sm:min-w-[140px] cursor-not-allowed opacity-50">
          <div>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
            </svg>
          </div>
          <div>
            <div className="text-xs">Get it on</div>
            <div className="text-xs sm:text-sm font-semibold">Google Play</div>
          </div>
        </div>
      )
    }
    
    // Normal functional button
    return (
      <a 
        href={androidAppLink.link_attached} 
        target="_blank" 
        rel="noopener noreferrer"
        className="hover:opacity-80 transition-opacity"
      >
        <div className="bg-black text-white rounded-lg px-3 py-2 sm:px-4 flex items-center space-x-2 min-w-[120px] sm:min-w-[140px]">
          <div>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
            </svg>
          </div>
          <div>
            <div className="text-xs">Get it on</div>
            <div className="text-xs sm:text-sm font-semibold">Google Play</div>
          </div>
        </div>
      </a>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Made responsive */}
      <nav className="bg-green-600 px-4 py-4 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-white text-xl font-bold">ROCKLAND</div>
          
          {/* Desktop Navigation */}
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
              <a href="#" className="block text-white hover:text-green-100 py-2">
                Home
              </a>
              <Link href="/features" className="block text-white hover:text-green-100 py-2">
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

      {/* Hero Section - Updated to show only Android download */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-white text-center lg:text-left">
              <div className="text-sm mb-4">#1 Rock Learning Platform</div>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Explore the World of Rocks
              </h1>
              <p className="text-base sm:text-lg mb-8 text-emerald-100 max-w-lg mx-auto lg:mx-0">
                Rockland helps you explore and learn about rocks interactively using AI, maps, and gamification.
              </p>
              <Link href="/registration">
                <Button className="bg-white hover:bg-gray-100 text-green-600 font-semibold px-6 py-3 rounded-full border border-white hover:border-gray-200 transition-all duration-200 mb-8 lg:mb-0">
                  Register Now!
                </Button>
              </Link>

              <div className="space-y-4 mt-8">
                <div className="text-sm font-medium">DOWNLOAD OUR APP</div>
                <div className="flex justify-center lg:justify-start">
                  <AndroidAppButton />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white rounded-t-3xl"></div>
      </section>

      {/* Features Section - Made responsive */}
      <section id="features" className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Mobile-first approach for phone mockup */}
            <div className="relative flex justify-center order-2 lg:order-1">
              {/* Main phone mockup */}
              <div className="relative z-10 transform hover:rotate-0 transition-transform duration-500">
                <div className="w-[250px] sm:w-[300px] h-[500px] sm:h-[600px] relative overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl">
                  <Image
                    src="/5.jpg"
                    alt="Rockland app interface on phone"
                    fill
                    className="object-cover rounded-[2.5rem] sm:rounded-[3rem]"
                  />
                </div>
              </div>

              {/* Feature callouts - Hidden on mobile, shown on desktop */}
              <div className="hidden lg:block">
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
            </div>

            <div className="text-center lg:text-left order-1 lg:order-2">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">
                Rockland
              </h2>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 text-gray-700">
                Special Features
              </h3>
              <p className="text-base sm:text-lg text-gray-600 mt-4 max-w-md mx-auto lg:mx-0">
                Discover our innovative features designed to enhance your rock learning experience
              </p>

              {/* Mobile feature list - shown only on mobile */}
              <div className="lg:hidden mt-8 space-y-4">
                <div className="flex items-center justify-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm">
                  <span className="text-2xl">🔍</span>
                  <div className="text-left">
                    <div className="font-semibold text-gray-800">Rock Identifier</div>
                    <div className="text-sm text-gray-600">AI-powered scanning</div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-sm">
                  <span className="text-2xl">🗺️</span>
                  <div className="text-left">
                    <div className="font-semibold text-green-800">Interactive Map</div>
                    <div className="text-sm text-green-600">Discover locations</div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm">
                  <span className="text-2xl">📝</span>
                  <div className="text-left">
                    <div className="font-semibold text-blue-800">Daily Quiz</div>
                    <div className="text-sm text-blue-600">Test your knowledge</div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl shadow-sm">
                  <span className="text-2xl">👥</span>
                  <div className="text-left">
                    <div className="font-semibold text-purple-800">Social</div>
                    <div className="text-sm text-purple-600">Connect & share</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Demo Section - Made responsive */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-black">App Demo</h2>
          <p className="text-gray-600 mb-6 sm:mb-8">Let's see virtually how it works</p>

          <div className="bg-gray-900 rounded-xl sm:rounded-2xl aspect-video overflow-hidden shadow-2xl relative">
            {videoLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="w-8 sm:w-12 h-8 sm:h-12 animate-spin mx-auto mb-4" />
                  <p className="text-sm sm:text-base">Loading demo video...</p>
                </div>
              </div>
            ) : videoError ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <div className="text-red-400 mb-2">⚠️</div>
                  <p className="text-red-300 text-sm sm:text-base">{videoError}</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2">Please check back later</p>
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
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-black bg-opacity-70 text-white rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm max-w-[80%]">
                  <div className="font-medium truncate">{demoVideo.name}</div>
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
                  <Play className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">No demo video available</p>
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

      {/* Articles Section - Made responsive */}
      <section className="py-12 sm:py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8 sm:mb-12">Our Articles</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {articlesLoading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p>Loading articles...</p>
                </div>
              </div>
            ) : articlesError && articlesData.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="text-yellow-300 mb-2">⚠️</div>
                <p className="text-white">{articlesError}</p>
                <p className="text-sm text-gray-300 mt-2">Please check back later</p>
              </div>
            ) : articlesData.length > 0 ? (
              articlesData.map((article: Article, index: number) => {
                // Generate author initials
                const authorInitials = getAuthorInitials(article.author_name)
                
                // Generate consistent colors for author avatars
                const authorColors = [
                  'from-blue-400 to-blue-600',
                  'from-green-400 to-green-600',
                  'from-purple-400 to-purple-600'
                ]
                const authorColorClass = authorColors[index % 3]

                return (
                  <Card key={article.article_id} className="overflow-hidden bg-white">
                    <div className="relative">
                      <div className="w-full h-40 sm:h-48 relative overflow-hidden">
                        {article.signed_photo_url || article.photo_url ? (
                          <Image
                            src={article.signed_photo_url || article.photo_url}
                            alt={article.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No Image</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm text-center px-2">
                            {article.title}
                          </span>
                        </div>
                      </div>
                      <Badge className={`absolute top-3 sm:top-4 right-3 sm:right-4 ${article.is_free ? 'bg-green-600' : 'bg-blue-600'} text-xs`}>
                        {article.is_free ? 'Free' : 'Premium'}
                      </Badge>
                    </div>
                    <CardContent className="p-3 sm:p-4 bg-white">
                      <div className="flex items-center mb-3">
                        <div className={`w-7 sm:w-8 h-7 sm:h-8 bg-gradient-to-br ${authorColorClass} rounded-full mr-2 sm:mr-3 flex items-center justify-center`}>
                          <span className="text-white text-xs font-bold">{authorInitials}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{article.author_name || 'Unknown Author'}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(article.date_created).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <h3 className="font-bold mb-2 text-sm sm:text-base">{article.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {truncateContent(article.content, 100)}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">{article.total_likes} likes</div>
                        {article.category_title && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded truncate max-w-[100px]">
                            {article.category_title}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              // Fallback static articles when no articles are available
              <>
                {/* Featured Article */}
                <Card className="overflow-hidden bg-white">
                  <div className="relative">
                    <div className="w-full h-40 sm:h-48 relative overflow-hidden">
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
                    <Badge className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-green-600 text-xs">Free</Badge>
                  </div>
                  <CardContent className="p-3 sm:p-4 bg-white">
                    <div className="flex items-center mb-3">
                      <div className="w-7 sm:w-8 h-7 sm:h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mr-2 sm:mr-3 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">SK</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Dr. Sarah Kim</div>
                        <div className="text-xs text-gray-500">2 days ago</div>
                      </div>
                    </div>
                    <h3 className="font-bold mb-2 text-sm sm:text-base">Understanding the Three Types of Geological Rocks</h3>
                    <p className="text-sm text-gray-600 mb-3">Explore igneous, sedimentary, and metamorphic rocks and learn how they form through Earth's geological processes.</p>
                    <div className="flex items-center mt-4">
                      <div className="text-sm text-gray-500">1.5k likes</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rock Identification Guide */}
                <Card className="overflow-hidden bg-white">
                  <div className="relative">
                    <div className="w-full h-40 sm:h-48 relative overflow-hidden">
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
                    <Badge className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-blue-600 text-xs">Premium</Badge>
                  </div>
                  <CardContent className="p-3 sm:p-4 bg-white">
                    <div className="flex items-center mb-3">
                      <div className="w-7 sm:w-8 h-7 sm:h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full mr-2 sm:mr-3 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">MJ</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Prof. Michael Johnson</div>
                        <div className="text-xs text-gray-500">1 week ago</div>
                      </div>
                    </div>
                    <h3 className="font-bold mb-2 text-sm sm:text-base">Complete Rock Identification Field Guide</h3>
                    <p className="text-sm text-gray-600 mb-3">Master the art of identifying rocks in the field using texture, color, crystal structure, and formation clues.</p>
                    <div className="flex items-center mt-4">
                      <div className="text-sm text-gray-500">1.5k likes</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Crystal Formation Article */}
                <Card className="overflow-hidden bg-white sm:col-span-2 lg:col-span-1">
                  <div className="relative">
                    <div className="w-full h-40 sm:h-48 relative overflow-hidden">
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
                    <Badge className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-blue-600 text-xs">Premium</Badge>
                  </div>
                  <CardContent className="p-3 sm:p-4 bg-white">
                    <div className="flex items-center mb-3">
                      <div className="w-7 sm:w-8 h-7 sm:h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mr-2 sm:mr-3 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AL</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Dr. Anna Lee</div>
                        <div className="text-xs text-gray-500">3 days ago</div>
                      </div>
                    </div>
                    <h3 className="font-bold mb-2 text-sm sm:text-base">The Science of Crystal Formation and Growth</h3>
                    <p className="text-sm text-gray-600 mb-3">Dive deep into crystallography and understand how temperature, pressure, and chemical composition create stunning crystal formations.</p>
                    <div className="flex items-center mt-4">
                      <div className="text-sm text-gray-500">1.5k likes</div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Made responsive with updated selected testimonials */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-base sm:text-lg text-gray-600">Join thousands of rock enthusiasts who love using Rockland</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonialsLoading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
                  <p className="text-gray-600">Loading testimonials...</p>
                </div>
              </div>
            ) : testimonialsError && testimonialsData.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="text-yellow-600 mb-2">⚠️</div>
                <p className="text-gray-600">{testimonialsError}</p>
                <p className="text-sm text-gray-400 mt-2">Please check back later</p>
              </div>
            ) : testimonialsData.length > 0 ? (
              testimonialsData.map((testimonial: Testimonial, index: number) => {
                // Generate initials from name
                const displayName = getTestimonialDisplayName(testimonial)
                const initials = displayName.split(' ').map(word => word.charAt(0)).join('').toUpperCase()
                
                // Generate consistent color based on index
                const colors = [
                  'from-blue-400 to-blue-600',
                  'from-green-400 to-green-600', 
                  'from-purple-400 to-purple-600'
                ]
                const colorClass = colors[index % 3]

                return (
                  <Card key={testimonial.testimonials_id} className="p-4 sm:p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      <div className={`w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br ${colorClass} rounded-full mr-3 sm:mr-4 flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm sm:text-base">{initials}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{displayName}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(testimonial.date_created).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">({testimonial.rating}/5)</span>
                    </div>
                    <p className="text-gray-600 italic text-sm sm:text-base">"{testimonial.testimony}"</p>
                  </Card>
                )
              })
            ) : (
              // Fallback content when no testimonials are available
              <div className="col-span-full text-center py-8">
                <p className="text-gray-600">No testimonials available at the moment.</p>
                <p className="text-sm text-gray-400 mt-2">Check back soon for user reviews!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section - Made responsive */}
      <section id="pricing" className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-black">Subscription Plan</h2>
          <p className="text-gray-600 mb-8 sm:mb-12 text-sm sm:text-base">
            With lots of unique blocks, you can easily build a<br className="hidden sm:block" />
            page easily without any coding.
          </p>

          {subscriptionLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-green-600" />
                <p className="text-gray-600">Loading subscription plans...</p>
              </div>
            </div>
          ) : subscriptionError ? (
            <div className="text-center py-16">
              <div className="text-yellow-600 mb-2">⚠️</div>
              <p className="text-gray-600">{subscriptionError}</p>
              <p className="text-sm text-gray-400 mt-2">Showing default plans</p>
              
              {/* Fallback to static plans */}
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto mt-8">
                {/* Static Basic Plan */}
                <Card className="p-6 sm:p-8 relative">
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">BASIC</span>
                    </div>
                    <div className="text-4xl sm:text-5xl font-bold mb-1">
                      $0<span className="text-base font-normal text-gray-500">/month</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-6 sm:mb-8">Perfect for casual rock enthusiasts</p>

                    <Link href="/registration">
                      <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white mb-6 sm:mb-8">
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
                        <span className="text-sm text-gray-700">Community forum access</span>
                      </div>
                      <div className="flex items-start">
                        <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">View nearby rock locations</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Static Premium Plan */}
                <Card className="p-6 sm:p-8 relative border-green-600 border-2">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium text-green-600">PREMIUM</span>
                    </div>
                    <div className="text-4xl sm:text-5xl font-bold mb-1">
                      $5<span className="text-base font-normal text-gray-500">/month</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-6 sm:mb-8">For serious rock collectors and students</p>

                    <Link href="/registration">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white mb-6 sm:mb-8">
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
          ) : (
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
              <Card className="p-6 sm:p-8 relative">
                <div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      {subscriptionPlans.free?.name.toUpperCase() || 'BASIC'}
                    </span>
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold mb-1 text-black">
                    {subscriptionPlans.free?.currency || '$'
                  }{subscriptionPlans.free?.price || 0}
                    <span className="text-base font-normal text-gray-500">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-6 sm:mb-8">
                    {subscriptionPlans.free?.description || 'Perfect for casual rock enthusiasts'}
                  </p>

                  <Link href="/registration">
                    <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white mb-6 sm:mb-8">
                      Get Started Free
                    </Button>
                  </Link>

                  <div className="space-y-3 text-left">
                    {subscriptionPlans.free ? (
                      parseFeatures(subscriptionPlans.free).map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))
                    ) : (
                      // Fallback features
                      <>
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
                          <span className="text-sm text-gray-700">Basic rock database</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">Community forum access</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
              {/* Dynamic Premium Plan */}
              <Card className="p-6 sm:p-8 relative border-green-600 border-2">
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
                    <span className="text-sm font-medium text-green-600">
                      {subscriptionPlans.premium?.name.toUpperCase() || 'PREMIUM'}
                    </span>
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold mb-1">
                    {subscriptionPlans.premium?.currency || '$'
                  }{subscriptionPlans.premium?.price || 5}
                    <span className="text-base font-normal text-gray-500">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-6 sm:mb-8">
                    {subscriptionPlans.premium?.description || 'For serious rock collectors and students'}
                  </p>

                  <Link href="/registration">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white mb-6 sm:mb-8">
                      Start Premium Plan
                    </Button>
                  </Link>

                  <div className="space-y-3 text-left">
                    {subscriptionPlans.premium ? (
                      parseFeatures(subscriptionPlans.premium).map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))
                    ) : (
                      // Fallback features
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Download Section - Updated to show only Android */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12">
            Download Rockland and Start Exploring Now!
          </h2>

          <div className="flex justify-center">
            <AndroidAppButton />
          </div>
        </div>
      </section>

      {/* FAQ Section - Made responsive */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 lg:mb-8">
                Frequently<br />
                asked<br />
                questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
                    <p className="text-gray-600">Loading FAQs...</p>
                  </div>
                </div>
              ) : faqError && faqData.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-yellow-600 mb-2">⚠️</div>
                  <p className="text-gray-600">{faqError}</p>
                  <p className="text-sm text-gray-400 mt-2">Please check back later</p>
                </div>
              ) : (
                faqData.map((faq: FAQItem, index: number) => (
                  <div key={faq.faq_id || index} className="border-b border-gray-200">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50 rounded-lg px-2"
                    >
                      <span className="text-gray-700 font-medium pr-4 text-sm sm:text-base">{faq.question}</span>
                      {openFAQIndex === index ? (
                        <Minus className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {openFAQIndex === index && (
                      <div className="pb-4 pr-8 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {/* Link to full FAQ page */}
              {faqData.length > 0 && (
                <div className="mt-6 text-center lg:text-left">
                  <Link href="/faq" className="text-green-600 hover:text-green-700 font-medium text-sm">
                    View all FAQs →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Made responsive */}
      <footer className="bg-green-600 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-sm text-center sm:text-left">
              <div className="mb-4">2025 Rockland FYP-S2-G19</div>
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