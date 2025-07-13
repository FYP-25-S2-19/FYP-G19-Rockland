"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import AdminLayout from "@/components/ui/AdminLayout"
import { getAuthInfo } from "@/lib/auth-utils" // Import the auth utilities

const statsCards = [
  {
    title: "Total User",
    value: "40,689",
    icon: "👥",
    color: "bg-blue-50",
  },
  {
    title: "Total Rocks",
    value: "10293",
    icon: "🪨",
    color: "bg-yellow-50",
  },
  {
    title: "Total Applications In",
    value: "456",
    icon: "📋",
    color: "bg-green-50",
  },
  {
    title: "Total Articles",
    value: "4560",
    icon: "📊",
    color: "bg-orange-50",
  },
]

const leastDemandCategories = [
  { name: "Sedimentary Rocks", percentage: 74, color: "bg-red-500", image: "🪨" },
  { name: "Igneous Rocks", percentage: 52, color: "bg-orange-500", image: "🌋" },
  { name: "Regional Rocks", percentage: 36, color: "bg-yellow-500", image: "⛰️" },
]

const onDemandCategories = [
  { name: "Fossils", percentage: 95, color: "bg-green-500", image: "🦕" },
  { name: "Minerals", percentage: 92, color: "bg-green-500", image: "💎" },
  { name: "Metamorphic Rocks", percentage: 89, color: "bg-green-500", image: "🪨" },
]

export default function Dashboard() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    userType: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

        // TODO: Here you can add API calls to fetch dashboard data
        // For now, we'll just simulate a brief loading period
        await new Promise(resolve => setTimeout(resolve, 500))

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

  const handleRefresh = () => {
    window.location.reload()
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
  if (error) {
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
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>
                    {stat.icon}
                  </div>
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
              <CardTitle className="text-lg font-semibold text-gray-900">Least Demand Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {leastDemandCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-sm">
                        {category.image}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{category.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${category.color} transition-all duration-300`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* On Demand Categories */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">On Demand Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {onDemandCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-sm">
                        {category.image}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{category.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${category.color} transition-all duration-300`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}