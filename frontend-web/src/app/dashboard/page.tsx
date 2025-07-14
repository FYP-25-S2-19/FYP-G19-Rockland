"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import AdminLayout from "@/components/ui/AdminLayout"
import { getAuthInfo } from "@/lib/auth-utils"

// Interfaces for dashboard data
interface DashboardStats {
  total_users: number
  total_rocks: number
  total_applications: number
  total_articles: number
}

interface CategoryDemand {
  name: string
  percentage: number
  count: number
}

interface StatsBreakdown {
  user_types: Array<{ type: number, count: number }>
  rock_types: Array<{ type: string, count: number }>
  application_status: Array<{ status: string, count: number }>
}

export default function Dashboard() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    userType: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Real dashboard data states
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [leastDemandCategories, setLeastDemandCategories] = useState<CategoryDemand[]>([])
  const [onDemandCategories, setOnDemandCategories] = useState<CategoryDemand[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Fetch dashboard statistics
  const fetchDashboardData = async () => {
    try {
      setIsLoadingData(true)
      setError(null)

      const adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:5000/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        console.log('📊 Dashboard stats received:', statsData)
        
        if (statsData.success) {
          setStats(statsData.stats)
        } else {
          setError(statsData.message || 'Failed to load dashboard stats')
        }
      } else {
        const errorData = await statsResponse.json()
        setError(errorData.message || 'Failed to fetch dashboard stats')
      }

      // Fetch category demand data
      const demandResponse = await fetch('http://localhost:5000/api/dashboard/categories/demand', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (demandResponse.ok) {
        const demandData = await demandResponse.json()
        console.log('📈 Category demand data received:', demandData)
        
        if (demandData.success) {
          setLeastDemandCategories(demandData.least_demand || [])
          setOnDemandCategories(demandData.on_demand || [])
        }
      }

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get authentication info from token
        const authInfo = getAuthInfo()
        
        if (!authInfo.isAuthenticated) {
          setError(authInfo.error || 'Authentication failed. Please log in again.')
          router.push('/login')
          return
        }

        // Set user info from auth data
        setUserInfo({
          name: authInfo.userType || 'Admin',
          email: authInfo.email || '',
          userType: authInfo.userType || 'Admin'
        })

        // Fetch dashboard data after authentication
        await fetchDashboardData()

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while loading dashboard')
        console.error('Dashboard error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthentication()
  }, [router])

  // Clear error after a few seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 10000) // Clear error after 10 seconds
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleNavigation = (item: string) => {
    switch (item) {
      case "home":
        // Already on home/dashboard
        break
      case "applications":
        router.push('/applications')
        break
      case "user-account":
        router.push('/useraccount')
        break
      case "user-type":
        router.push('/usertype')
        break
      case "user-profiling":
        router.push('/userprofiling')
        break
      case "forum":
        router.push('/forummanagement')
        break
      case "landing-page":
        router.push('/landingpagemanagement')
        break
      case "faq-page":
        router.push('/faqmanagement')
        break
      case "my-profile":
        router.push('/adminprofile')
        break
      case "logout":
        // Clear all auth data including the token
        localStorage.removeItem('adminToken')
        localStorage.removeItem('isAdminLoggedIn')
        localStorage.removeItem('adminEmail')
        // Also clear old keys if they exist
        localStorage.removeItem('authToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('userEmail')
        localStorage.removeItem('userName')
        localStorage.removeItem('userType')
        localStorage.removeItem('userTypeName')
        localStorage.removeItem('isLoggedIn')
        router.push('/login')
        break
      default:
        console.log("Unknown navigation item:", item)
    }
  }

  const handleRefresh = async () => {
    await fetchDashboardData()
  }

  // Create dynamic stats cards with real data
  const statsCards = [
    {
      title: "Total Users",
      value: stats?.total_users?.toLocaleString() || "0",
      icon: "👥",
      color: "bg-blue-50",
    },
    {
      title: "Total Rocks",
      value: stats?.total_rocks?.toLocaleString() || "0",
      icon: "🪨",
      color: "bg-yellow-50",
    },
    {
      title: "Total Applications",
      value: stats?.total_applications?.toLocaleString() || "0",
      icon: "📋",
      color: "bg-green-50",
    },
    {
      title: "Total Articles",
      value: stats?.total_articles?.toLocaleString() || "0",
      icon: "📊",
      color: "bg-orange-50",
    },
  ]

  // Helper function to get category color based on percentage
  const getCategoryColor = (percentage: number, isOnDemand: boolean = false) => {
    if (isOnDemand) {
      return "bg-green-500" // Green for on-demand categories
    } else {
      // Red to yellow gradient for least demand
      if (percentage < 40) return "bg-red-500"
      if (percentage < 60) return "bg-orange-500"
      return "bg-yellow-500"
    }
  }

  // Helper function to get appropriate emoji for rock types
  const getCategoryEmoji = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('sedimentary')) return "🪨"
    if (lowerName.includes('igneous')) return "🌋"
    if (lowerName.includes('metamorphic')) return "⚡"
    if (lowerName.includes('fossil')) return "🦕"
    if (lowerName.includes('mineral')) return "💎"
    if (lowerName.includes('crystal')) return "💠"
    return "🪨" // Default rock emoji
  }

  // Loading state
  if (isLoading) {
    return (
      <AdminLayout
        activeMenuItem="home"
        title="Hi, Admin 👋"
        subtitle=""
        onNavigate={handleNavigation}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </AdminLayout>
    )
  }

  // Error state
  if (error && !stats) {
    return (
      <AdminLayout
        activeMenuItem="home"
        title="Hi, Admin 👋"
        subtitle=""
        onNavigate={handleNavigation}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4 max-w-md">{error}</p>
            <Button onClick={handleRefresh} className="bg-green-600 hover:bg-green-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      activeMenuItem="home"
      title={`Hi, ${userInfo.name.split(' ')[0] || 'Admin'} 👋`}
      subtitle=""
      onNavigate={handleNavigation}
    >
      {/* Dashboard Content */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoadingData}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Error Banner */}
        {error && stats && (
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center text-yellow-700">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>
                    {stat.icon}
                  </div>
                  {isLoadingData && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Least Demand Categories */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                Least Demand Categories
                {isLoadingData && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {leastDemandCategories.length > 0 ? (
                leastDemandCategories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-sm">
                          {getCategoryEmoji(category.name)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">{category.percentage}%</span>
                        <p className="text-xs text-gray-500">({category.count} rocks)</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getCategoryColor(category.percentage, false)} transition-all duration-300`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No category data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* On Demand Categories */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                On Demand Categories
                {isLoadingData && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {onDemandCategories.length > 0 ? (
                onDemandCategories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-sm">
                          {getCategoryEmoji(category.name)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">{category.percentage}%</span>
                        <p className="text-xs text-gray-500">({category.count} rocks)</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getCategoryColor(category.percentage, true)} transition-all duration-300`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No category data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}