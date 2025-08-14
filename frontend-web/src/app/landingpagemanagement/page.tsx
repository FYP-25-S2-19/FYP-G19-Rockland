"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  Upload,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Star,
} from "lucide-react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"

interface VideoPost {
  video_id: number
  name: string
  file_name: string
  date_created: string
  user_id: number
  description?: string
  file_size?: number
  file_type?: string
  remarks?: string
  is_selected?: boolean // Selection status for display
}

interface AppLink {
  app_link_id: number
  name: string
  user_id: number
  date_created: string
  link_attached?: string
}

interface SubscriptionPlan {
  subscription_plan_id: number
  name: string
  description: string
  currency: string
  price: number
  feature_a?: string
  feature_b?: string
  feature_c?: string
  feature_d?: string
}

interface Testimonial {
  testimonials_id: number
  name: string
  user_name?: string
  rating: number
  testimony: string
  date_created: string
  user_id: number
  is_selected?: boolean // Selection status for display
}

type ContentType = "Video" | "App Links" | "Subscription Plan" | "Testimonials"

interface VideoFormData {
  name: string
  description: string
  remarks: string
  video_file: File | null
}

interface AppLinkFormData {
  name: string
  link_attached: string
}

interface SubscriptionPlanFormData {
  name: string
  description: string
  price: string
  currency: string
  feature_a: string
  feature_b: string
  feature_c: string
  feature_d: string
}

// API configuration
const getAuthInfo = () => {
  try {
    const token = localStorage.getItem('adminToken')
    const email = localStorage.getItem('adminEmail')
    
    if (!token || !email) {
      return { isAuthenticated: false, error: 'No authentication token found' }
    }
    
    return { isAuthenticated: true, token, email }
  } catch (error) {
    return { isAuthenticated: false, error: 'Authentication error' }
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function LandingPageManagement() {
  const router = useRouter()
  const [contentType, setContentType] = useState<ContentType>("Video")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "toggle_select"
    itemId: string
    itemTitle: string
    contentType: ContentType
    currentStatus?: boolean
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for different content types
  const [videos, setVideos] = useState<VideoPost[]>([])
  const [appLinks, setAppLinks] = useState<AppLink[]>([])
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  // Form data states
  const [videoFormData, setVideoFormData] = useState<VideoFormData>({
    name: '',
    description: '',
    remarks: '',
    video_file: null
  })

  const [appLinkFormData, setAppLinkFormData] = useState<AppLinkFormData>({
    name: '',
    link_attached: ''
  })

  const [subscriptionPlanFormData, setSubscriptionPlanFormData] = useState<SubscriptionPlanFormData>({
    name: '',
    description: '',
    price: '',
    currency: '',
    feature_a: '',
    feature_b: '',
    feature_c: '',
    feature_d: ''
  })

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

  // Helper function to render stars for testimonial rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
      </div>
    )
  }

  // Toggle selection functions
  const toggleVideoSelection = async (videoId: string, currentStatus: boolean) => {
    try {
      setIsLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/videos/toggle-selection/${videoId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(data.message || `Video ${!currentStatus ? 'selected' : 'deselected'} for display on landing page`)
        setShowSuccessDialog(true)
        await fetchVideos() // Refresh the video list
      } else {
        setError(data.message || 'Failed to update video selection')
      }
    } catch (err) {
      console.error('Error toggling video selection:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while updating video selection')
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
      setConfirmAction(null)
    }
  }

  const toggleTestimonialSelection = async (testimonialId: string, currentStatus: boolean) => {
    try {
      setIsLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/testimonials/toggle-selection/${testimonialId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(data.message || `Testimonial ${!currentStatus ? 'selected' : 'deselected'} for display on landing page`)
        setShowSuccessDialog(true)
        await fetchTestimonials() // Refresh the testimonials list
      } else {
        setError(data.message || 'Failed to update testimonial selection')
      }
    } catch (err) {
      console.error('Error toggling testimonial selection:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while updating testimonial selection')
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
      setConfirmAction(null)
    }
  }

  // Fetch functions
  const fetchVideos = async () => {
    try {
      setLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/videos/admin/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Ensure is_selected field is present (default to false)
        const videosWithSelection = data.videos.map((video: VideoPost) => ({
          ...video,
          is_selected: video.is_selected ?? false
        }))
        setVideos(videosWithSelection)
      } else {
        setError(data.error || 'Failed to fetch videos')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching videos')
      console.error('Error fetching videos:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/testimonials/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Ensure is_selected field is present (default to false)
        const testimonialsWithSelection = data.testimonials.map((testimonial: Testimonial) => ({
          ...testimonial,
          is_selected: testimonial.is_selected ?? false
        }))
        setTestimonials(testimonialsWithSelection)
      } else {
        setError(data.error || 'Failed to fetch testimonials')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching testimonials')
      console.error('Error fetching testimonials:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptionPlans = async () => {
    try {
      setLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/subscription-plans/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSubscriptionPlans(data.subscription_plans)
      } else {
        setError(data.error || 'Failed to fetch subscription plans')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching subscription plans')
      console.error('Error fetching subscription plans:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAppLinks = async () => {
    try {
      setLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/applinks/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setAppLinks(data.applinks)
      } else {
        setError(data.error || 'Failed to fetch app links')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching app links')
      console.error('Error fetching app links:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create functions
  const createSubscriptionPlan = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!subscriptionPlanFormData.name.trim()) {
        setError('Name is required')
        return
      }

      if (!subscriptionPlanFormData.price.trim()) {
        setError('Price is required')
        return
      }

      if (!subscriptionPlanFormData.currency.trim()) {
        setError('Currency is required')
        return
      }

      const price = parseFloat(subscriptionPlanFormData.price)
      if (isNaN(price) || price < 0) {
        setError('Please enter a valid price')
        return
      }

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/subscription-plans/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: subscriptionPlanFormData.name.trim(),
          description: subscriptionPlanFormData.description.trim() || null,
          price: price,
          currency: subscriptionPlanFormData.currency.trim(),
          feature_a: subscriptionPlanFormData.feature_a.trim() || null,
          feature_b: subscriptionPlanFormData.feature_b.trim() || null,
          feature_c: subscriptionPlanFormData.feature_c.trim() || null,
          feature_d: subscriptionPlanFormData.feature_d.trim() || null
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(data.message || 'Subscription plan created successfully')
        setShowSuccessDialog(true)
        
        // Reset form
        setSubscriptionPlanFormData({
          name: '',
          description: '',
          price: '',
          currency: '',
          feature_a: '',
          feature_b: '',
          feature_c: '',
          feature_d: ''
        })
        
        await fetchSubscriptionPlans()
      } else {
        setError(data.message || 'Failed to create subscription plan')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating subscription plan')
      console.error('Error creating subscription plan:', err)
    } finally {
      setIsLoading(false)
      setShowAddDialog(false)
    }
  }

  const uploadVideo = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!videoFormData.name.trim()) {
        setError('Video name is required')
        return
      }

      if (!videoFormData.video_file) {
        setError('Please select a video file')
        return
      }

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const formData = new FormData()
      formData.append('video_file', videoFormData.video_file)
      formData.append('name', videoFormData.name.trim())
      formData.append('description', videoFormData.description.trim())
      formData.append('remarks', videoFormData.remarks.trim())

      const response = await fetch(`${API_BASE_URL}/api/videos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(data.message || 'Video uploaded successfully')
        setShowSuccessDialog(true)
        
        setVideoFormData({
          name: '',
          description: '',
          remarks: '',
          video_file: null
        })
        
        await fetchVideos()
      } else {
        setError(data.message || 'Failed to upload video')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while uploading video')
      console.error('Error uploading video:', err)
    } finally {
      setIsLoading(false)
      setShowAddDialog(false)
    }
  }

  const createAppLink = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!appLinkFormData.name.trim()) {
        setError('App link name is required')
        return
      }

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/applinks/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: appLinkFormData.name.trim(),
          link_attached: appLinkFormData.link_attached.trim() || null
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(data.message || 'App link created successfully')
        setShowSuccessDialog(true)
        
        setAppLinkFormData({
          name: '',
          link_attached: ''
        })
        
        await fetchAppLinks()
      } else {
        setError(data.message || 'Failed to create app link')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating app link')
      console.error('Error creating app link:', err)
    } finally {
      setIsLoading(false)
      setShowAddDialog(false)
    }
  }

  // Delete functions
  const deleteVideo = async (videoId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/videos/delete/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(data.message || 'Video deleted successfully')
        setShowSuccessDialog(true)
        await fetchVideos()
      } else {
        setError(data.message || 'Failed to delete video')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting video')
      console.error('Error deleting video:', err)
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
      setConfirmAction(null)
    }
  }

  const deleteTestimonial = async (testimonialId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/testimonials/delete_testimonial`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: testimonialId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(data.message || 'Testimonial deleted successfully')
        setShowSuccessDialog(true)
        await fetchTestimonials()
      } else {
        setError(data.message || 'Failed to delete testimonial')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting testimonial')
      console.error('Error deleting testimonial:', err)
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
      setConfirmAction(null)
    }
  }

  const deleteSubscriptionPlan = async (planId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/subscription-plans/delete/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(data.message || 'Subscription plan deleted successfully')
        setShowSuccessDialog(true)
        await fetchSubscriptionPlans()
      } else {
        setError(data.message || 'Failed to delete subscription plan')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting subscription plan')
      console.error('Error deleting subscription plan:', err)
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
      setConfirmAction(null)
    }
  }

  const deleteAppLink = async (appLinkId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/applinks/delete_applink`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: appLinkId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(data.message || 'App link deleted successfully')
        setShowSuccessDialog(true)
        await fetchAppLinks()
      } else {
        setError(data.message || 'Failed to delete app link')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting app link')
      console.error('Error deleting app link:', err)
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
      setConfirmAction(null)
    }
  }

  // Load data on component mount and content type change
  useEffect(() => {
    if (contentType === "Video") {
      fetchVideos()
    } else if (contentType === "App Links") {
      fetchAppLinks()
    } else if (contentType === "Subscription Plan") {
      fetchSubscriptionPlans()
    } else if (contentType === "Testimonials") {
      fetchTestimonials()
    }
  }, [contentType])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleNavigation = (item: string) => {
    switch (item) {
      case "home":
        router.push('/dashboard')
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
        break
      case "rock-management":
        router.push('/rockmanagement')
        break
      case "zone-management":
        router.push('/zoneprofile')
        break
      case "faq-page":
        router.push('/faqmanagement')
        break
      case "my-profile":
        router.push('/adminprofile')
        break
      case "logout":
        localStorage.removeItem('isAdminLoggedIn')
        localStorage.removeItem('adminEmail')
        localStorage.removeItem('adminToken')
        router.push('/login')
        break
      default:
        console.log("Unknown navigation item:", item)
    }
  }

  const handleDelete = async (itemId: string, contentType: ContentType) => {
    if (contentType === "Video") {
      await deleteVideo(itemId)
    } else if (contentType === "App Links") {
      await deleteAppLink(itemId)
    } else if (contentType === "Subscription Plan") {
      await deleteSubscriptionPlan(itemId)
    } else if (contentType === "Testimonials") {
      await deleteTestimonial(itemId)
    }
  }

  const handleToggleSelection = async (itemId: string, contentType: ContentType, currentStatus: boolean) => {
    if (contentType === "Video") {
      await toggleVideoSelection(itemId, currentStatus)
    } else if (contentType === "Testimonials") {
      await toggleTestimonialSelection(itemId, currentStatus)
    }
  }

  const handleAdd = async () => {
    if (contentType === "Video") {
      await uploadVideo()
    } else if (contentType === "App Links") {
      await createAppLink()
    } else if (contentType === "Subscription Plan") {
      await createSubscriptionPlan()
    } 
  }

  const getCurrentData = () => {
    switch (contentType) {
      case "Video":
        return videos
      case "App Links":
        return appLinks
      case "Subscription Plan":
        return subscriptionPlans
      case "Testimonials":
        return testimonials
      default:
        return []
    }
  }

  const getAddButtonText = () => {
    switch (contentType) {
      case "Video":
        return "Add New Video"
      case "App Links":
        return "Add New App Link"
      case "Subscription Plan":
        return "Add Subscription Plan"
      default:
        return "Add New"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  }

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const renderTableHeaders = () => {
    switch (contentType) {
      case "Video":
        return (
          <>
            <TableHead className="font-semibold">Video ID</TableHead>
            <TableHead className="font-semibold">Video Title</TableHead>
            <TableHead className="font-semibold">File Name</TableHead>
            <TableHead className="font-semibold">File Size</TableHead>
            <TableHead className="font-semibold">Date Created</TableHead>
            <TableHead className="font-semibold">UserID (Admin)</TableHead>
            <TableHead className="font-semibold">Display Status</TableHead>
            <TableHead className="font-semibold text-center">Actions</TableHead>
          </>
        )
      case "App Links":
        return (
          <>
            <TableHead className="font-semibold">App Link ID</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Link Attached</TableHead>
            <TableHead className="font-semibold">Date Created</TableHead>
            <TableHead className="font-semibold">UserID (Admin)</TableHead>
            <TableHead className="font-semibold text-center">Action</TableHead>
          </>
        )
      case "Subscription Plan":
        return (
          <>
            <TableHead className="font-semibold">Plan ID</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold">Price</TableHead>
            <TableHead className="font-semibold">Currency</TableHead>
            <TableHead className="font-semibold">Features</TableHead>
            <TableHead className="font-semibold text-center">Action</TableHead>
          </>
        )
      case "Testimonials":
        return (
          <>
            <TableHead className="font-semibold">Testimonials ID</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Rating</TableHead>
            <TableHead className="font-semibold">Testimony</TableHead>
            <TableHead className="font-semibold">Date Created</TableHead>
            <TableHead className="font-semibold">UserID</TableHead>
            <TableHead className="font-semibold">Display Status</TableHead>
            <TableHead className="font-semibold text-center">Actions</TableHead>
          </>
        )
    }
  }

  const renderTableRows = () => {
    const data = getCurrentData()

    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <span className="text-gray-500">Loading {contentType.toLowerCase()}...</span>
          </TableCell>
        </TableRow>
      )
    }

    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
            {contentType === "Video" ? "No videos found" : 
             contentType === "App Links" ? "No app links found" :
             contentType === "Subscription Plan" ? "No subscription plans found" :
             contentType === "Testimonials" ? "No testimonials found" :
             "No items found"}
          </TableCell>
        </TableRow>
      )
    }

    return data.map((item) => (
      <TableRow key={
        contentType === "Video" ? (item as VideoPost).video_id : 
        contentType === "App Links" ? (item as AppLink).app_link_id :
        contentType === "Subscription Plan" ? (item as SubscriptionPlan).subscription_plan_id :
        contentType === "Testimonials" ? (item as Testimonial).testimonials_id :
        (item as any).id
      } className="hover:bg-gray-50 transition-colors">
        <TableCell className="font-medium text-gray-900">
          {contentType === "Video" ? (item as VideoPost).video_id :
           contentType === "App Links" ? (item as AppLink).app_link_id :
           contentType === "Subscription Plan" ? (item as SubscriptionPlan).subscription_plan_id :
           contentType === "Testimonials" ? (item as Testimonial).testimonials_id :
           (item as any).id}
        </TableCell>
        
        {contentType === "Video" && (
          <>
            <TableCell className="font-medium text-gray-900">{(item as VideoPost).name}</TableCell>
            <TableCell className="text-gray-600">{(item as VideoPost).file_name}</TableCell>
            <TableCell className="text-gray-600">{formatFileSize((item as VideoPost).file_size)}</TableCell>
            <TableCell className="text-gray-600">{formatDate((item as VideoPost).date_created)}</TableCell>
            <TableCell className="text-gray-600">{(item as VideoPost).user_id}</TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center space-x-2">
                {(item as VideoPost).is_selected ? (
                  <>
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 text-sm font-medium">Displayed</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">Hidden</span>
                  </>
                )}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <Button
                  size="sm"
                  variant={!(item as VideoPost).is_selected ? "default" : "outline"}
                  className={`h-8 px-3 ${
                    !(item as VideoPost).is_selected 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setConfirmAction({
                      type: "toggle_select",
                      itemId: (item as VideoPost).video_id.toString(),
                      itemTitle: (item as VideoPost).name,
                      contentType,
                      currentStatus: (item as VideoPost).is_selected
                    })
                    setShowConfirmDialog(true)
                  }}
                  disabled={isLoading}
                >
                  {(item as VideoPost).is_selected ? "Hide" : "Display"}
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white h-8 px-3"
                  onClick={() => {
                    setConfirmAction({
                      type: "delete",
                      itemId: (item as VideoPost).video_id.toString(),
                      itemTitle: (item as VideoPost).name,
                      contentType,
                    })
                    setShowConfirmDialog(true)
                  }}
                  disabled={isLoading}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </>
        )}
        
        {contentType === "App Links" && (
          <>
            <TableCell className="font-medium text-gray-900">{(item as AppLink).name}</TableCell>
            <TableCell className="text-gray-600">
              {(item as AppLink).link_attached ? (
                <a 
                  href={(item as AppLink).link_attached} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {(item as AppLink).link_attached}
                </a>
              ) : 'No link'}
            </TableCell>
            <TableCell className="text-gray-600">{formatDate((item as AppLink).date_created)}</TableCell>
            <TableCell className="text-gray-600">{(item as AppLink).user_id}</TableCell>
            <TableCell className="text-center">
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white h-8 px-4"
                onClick={() => {
                  setConfirmAction({
                    type: "delete",
                    itemId: (item as AppLink).app_link_id.toString(),
                    itemTitle: (item as AppLink).name,
                    contentType,
                  })
                  setShowConfirmDialog(true)
                }}
                disabled={isLoading}
              >
                Delete
              </Button>
            </TableCell>
          </>
        )}
        
        {contentType === "Subscription Plan" && (
          <>
            <TableCell className="font-medium text-gray-900">{(item as SubscriptionPlan).name}</TableCell>
            <TableCell className="text-gray-600 max-w-xs truncate">{(item as SubscriptionPlan).description}</TableCell>
            <TableCell className="text-gray-600">{(item as SubscriptionPlan).price}</TableCell>
            <TableCell className="text-gray-600">{(item as SubscriptionPlan).currency}</TableCell>
            <TableCell className="text-gray-600 max-w-xs">
              <div className="space-y-1 text-xs">
                {(item as SubscriptionPlan).feature_a && <div>• {(item as SubscriptionPlan).feature_a}</div>}
                {(item as SubscriptionPlan).feature_b && <div>• {(item as SubscriptionPlan).feature_b}</div>}
                {(item as SubscriptionPlan).feature_c && <div>• {(item as SubscriptionPlan).feature_c}</div>}
                {(item as SubscriptionPlan).feature_d && <div>• {(item as SubscriptionPlan).feature_d}</div>}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white h-8 px-4"
                onClick={() => {
                  setConfirmAction({
                    type: "delete",
                    itemId: (item as SubscriptionPlan).subscription_plan_id.toString(),
                    itemTitle: (item as SubscriptionPlan).name,
                    contentType,
                  })
                  setShowConfirmDialog(true)
                }}
                disabled={isLoading}
              >
                Delete
              </Button>
            </TableCell>
          </>
        )}
        
        {contentType === "Testimonials" && (
          <>
            <TableCell className="font-medium text-gray-900">
              {getTestimonialDisplayName(item as Testimonial)}
            </TableCell>
            <TableCell className="text-center">
              {renderStars((item as Testimonial).rating)}
            </TableCell>
            <TableCell className="text-gray-600 max-w-xs">
              <div className="truncate" title={(item as Testimonial).testimony}>
                {(item as Testimonial).testimony}
              </div>
            </TableCell>
            <TableCell className="text-gray-600">{formatDate((item as Testimonial).date_created)}</TableCell>
            <TableCell className="text-gray-600">{(item as Testimonial).user_id}</TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center space-x-2">
                {(item as Testimonial).is_selected ? (
                  <>
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 text-sm font-medium">Displayed</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">Hidden</span>
                  </>
                )}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <Button
                  size="sm"
                  variant={!(item as Testimonial).is_selected ? "default" : "outline"}
                  className={`h-8 px-3 ${
                    !(item as Testimonial).is_selected 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setConfirmAction({
                      type: "toggle_select",
                      itemId: (item as Testimonial).testimonials_id.toString(),
                      itemTitle: getTestimonialDisplayName(item as Testimonial),
                      contentType,
                      currentStatus: (item as Testimonial).is_selected
                    })
                    setShowConfirmDialog(true)
                  }}
                  disabled={isLoading}
                >
                  {(item as Testimonial).is_selected ? "Hide" : "Display"}
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white h-8 px-3"
                  onClick={() => {
                    setConfirmAction({
                      type: "delete",
                      itemId: (item as Testimonial).testimonials_id.toString(),
                      itemTitle: getTestimonialDisplayName(item as Testimonial),
                      contentType,
                    })
                    setShowConfirmDialog(true)
                  }}
                  disabled={isLoading}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </>
        )}
      </TableRow>
    ))
  }

  const renderAddDialog = () => {
    switch (contentType) {
      case "Video":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Post New Video</h3>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">Attach Video</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setVideoFormData(prev => ({ ...prev, video_file: file }))
                      }}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center -mt-2 ml-12">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </label>
                  </div>
                  {videoFormData.video_file && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {videoFormData.video_file.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Video name:</label>
                  <Input 
                    placeholder="Announcement" 
                    value={videoFormData.name}
                    onChange={(e) => setVideoFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date:</label>
                  <Input 
                    value={new Date().toLocaleDateString('en-GB')} 
                    readOnly 
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description:</label>
                <Textarea 
                  placeholder="Walkthrough of the app" 
                  rows={3} 
                  value={videoFormData.description}
                  onChange={(e) => setVideoFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Remarks:</label>
                <Input 
                  placeholder="Additional notes..." 
                  value={videoFormData.remarks}
                  onChange={(e) => setVideoFormData(prev => ({ ...prev, remarks: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )

      case "App Links":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add New App Link</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">App Link Name:</label>
                  <Input 
                    placeholder="iOS App Store" 
                    value={appLinkFormData.name}
                    onChange={(e) => setAppLinkFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date:</label>
                  <Input 
                    value={new Date().toLocaleDateString('en-GB')} 
                    readOnly 
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Link URL:</label>
                <Input 
                  placeholder="https://apps.apple.com/..." 
                  type="url"
                  value={appLinkFormData.link_attached}
                  onChange={(e) => setAppLinkFormData(prev => ({ ...prev, link_attached: e.target.value }))}
                />
                <p className="text-xs text-gray-500">Optional: Leave empty if no link is available yet</p>
              </div>
            </div>
          </div>
        )

      case "Subscription Plan":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Subscription Plan</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name:</label>
                  <Input 
                    placeholder="Premium" 
                    value={subscriptionPlanFormData.name}
                    onChange={(e) => setSubscriptionPlanFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price:</label>
                  <Input 
                    placeholder="10.00" 
                    type="number"
                    step="0.01"
                    min="0"
                    value={subscriptionPlanFormData.price}
                    onChange={(e) => setSubscriptionPlanFormData(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description:</label>
                  <Textarea 
                    placeholder="Premium Functionalities" 
                    rows={3} 
                    value={subscriptionPlanFormData.description}
                    onChange={(e) => setSubscriptionPlanFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Currency:</label>
                    <Input 
                      placeholder="USD" 
                      value={subscriptionPlanFormData.currency}
                      onChange={(e) => setSubscriptionPlanFormData(prev => ({ ...prev, currency: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Feature A:</label>
                    <Input 
                      placeholder="Premium Support" 
                      value={subscriptionPlanFormData.feature_a}
                      onChange={(e) => setSubscriptionPlanFormData(prev => ({ ...prev, feature_a: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Feature B:</label>
                  <Input 
                    placeholder="Advanced Analytics" 
                    value={subscriptionPlanFormData.feature_b}
                    onChange={(e) => setSubscriptionPlanFormData(prev => ({ ...prev, feature_b: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Feature C:</label>
                  <Input 
                    placeholder="Custom Integrations" 
                    value={subscriptionPlanFormData.feature_c}
                    onChange={(e) => setSubscriptionPlanFormData(prev => ({ ...prev, feature_c: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Feature D:</label>
                  <Input 
                    placeholder="Priority Access" 
                    value={subscriptionPlanFormData.feature_d}
                    onChange={(e) => setSubscriptionPlanFormData(prev => ({ ...prev, feature_d: e.target.value }))}
                  />
                </div>
                <div></div>
              </div>
            </div>
          </div>
        )
    }
  }

  const handleContentTypeChange = (value: string) => {
    setContentType(value as ContentType)
  }

  if (error) {
    return (
      <AdminLayout
        activeMenuItem="landing-page"
        title="Hi, Admin 👋"
        subtitle="Manage landing page content and features"
        onNavigate={handleNavigation}
      >
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-red-600 mb-4 max-w-md mx-auto">{error}</p>
              <Button 
                onClick={() => {
                  setError(null)
                  if (contentType === "Video") {
                    fetchVideos()
                  } else if (contentType === "App Links") {
                    fetchAppLinks()
                  } else if (contentType === "Subscription Plan") {
                    fetchSubscriptionPlans()
                  } else if (contentType === "Testimonials") {
                    fetchTestimonials()
                  }
                }} 
                className="bg-green-600 hover:bg-green-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      activeMenuItem="landing-page"
      title="Hi, Admin 👋"
      subtitle="Manage landing page content and features"
      onNavigate={handleNavigation}
    >
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Landing Page Management</h2>
                <p className="text-gray-600 mt-1">
                  Manage content displayed on your landing page. Use the toggle buttons to show/hide items.
                </p>
              </div>
              {contentType !== "Testimonials" && (
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {getAddButtonText()}
                </Button>
              )}
            </div>

            {/* Content Type Selector */}
            <div className="flex items-center space-x-4">
              <Select value={contentType} onValueChange={handleContentTypeChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Video">Videos</SelectItem>
                  <SelectItem value="App Links">App Links</SelectItem>
                  <SelectItem value="Subscription Plan">Subscription Plans</SelectItem>
                  <SelectItem value="Testimonials">Testimonials</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  if (contentType === "Video") {
                    fetchVideos()
                  } else if (contentType === "App Links") {
                    fetchAppLinks()
                  } else if (contentType === "Subscription Plan") {
                    fetchSubscriptionPlans()
                  } else if (contentType === "Testimonials") {
                    fetchTestimonials()
                  }
                }}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {contentType} List
                {(contentType === "Video" || contentType === "Testimonials") && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Use Display/Hide buttons to control landing page visibility)
                  </span>
                )}
              </h3>
              {(contentType === "Video" || contentType === "Testimonials") && (
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4 text-green-600" />
                    <span>Displayed on landing page</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <EyeOff className="h-4 w-4 text-gray-400" />
                    <span>Hidden from landing page</span>
                  </div>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">{renderTableHeaders()}</TableRow>
                </TableHeader>
                <TableBody>{renderTableRows()}</TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {contentType === "Video" && "Landing Page Management > Post New Video"}
              {contentType === "App Links" && "Landing Page Management > Add New App Link"}
              {contentType === "Subscription Plan" && "Landing Page Management > New Subscription Plan"}
            </DialogTitle>
          </DialogHeader>

          {renderAddDialog()}

          <DialogFooter className="flex flex-col space-y-2">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white w-full"
              onClick={handleAdd}
              disabled={isLoading}
            >
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              {contentType === "Video" && "Post New Video"}
              {contentType === "App Links" && "Create App Link"}
              {contentType === "Subscription Plan" && "Create Subscription Plan"}
            </Button>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isLoading} className="w-full">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "delete" 
                ? `Delete ${confirmAction?.contentType}`
                : confirmAction?.type === "toggle_select"
                  ? `${confirmAction?.currentStatus ? 'Hide' : 'Display'} ${confirmAction?.contentType}`
                  : "Confirm Action"
              }
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "delete" && (
                <>
                  Are you sure you want to delete <strong>"{confirmAction?.itemTitle}"</strong>? This action cannot be undone.
                </>
              )}
              {confirmAction?.type === "toggle_select" && (
                <>
                  Are you sure you want to {confirmAction?.currentStatus ? 'hide' : 'display'} <strong>"{confirmAction?.itemTitle}"</strong> on the landing page?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className={confirmAction?.type === "delete" 
                ? "bg-red-600 hover:bg-red-700" 
                : confirmAction?.currentStatus 
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-green-600 hover:bg-green-700"
              }
              onClick={() => {
                if (confirmAction) {
                  if (confirmAction.type === "delete") {
                    handleDelete(confirmAction.itemId, confirmAction.contentType)
                  } else if (confirmAction.type === "toggle_select") {
                    handleToggleSelection(confirmAction.itemId, confirmAction.contentType, confirmAction.currentStatus || false)
                  }
                }
              }}
              disabled={isLoading}
            >
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              {confirmAction?.type === "delete" 
                ? "Delete"
                : confirmAction?.currentStatus 
                  ? "Hide"
                  : "Display"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Operation Successful</span>
            </DialogTitle>
            <DialogDescription>
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowSuccessDialog(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}