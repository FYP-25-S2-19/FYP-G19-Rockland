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
}

interface AppLink {
  app_link_id: number
  name: string
  user_id: number
  date_created: string
  link_attached?: string
}

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  currency: string
  price: number
  userId: string
}

interface Testimonial {
  testimonials_id: number
  name: string
  testimony: string
  date_created: string
  user_id: number
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

interface TestimonialFormData {
  name: string
  testimony: string
}

// API configuration - get from your existing auth utils
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
    type: "delete"
    itemId: string
    itemTitle: string
    contentType: ContentType
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Video-specific state
  const [videos, setVideos] = useState<VideoPost[]>([])
  const [videoFormData, setVideoFormData] = useState<VideoFormData>({
    name: '',
    description: '',
    remarks: '',
    video_file: null
  })

  // AppLink-specific state
  const [appLinks, setAppLinks] = useState<AppLink[]>([])
  const [appLinkFormData, setAppLinkFormData] = useState<AppLinkFormData>({
    name: '',
    link_attached: ''
  })

  // Testimonials-specific state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [testimonialFormData, setTestimonialFormData] = useState<TestimonialFormData>({
    name: '',
    testimony: ''
  })

  // Sample data for other content types (unchanged)
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "1",
      name: "January Plan",
      description: "Premium Users",
      currency: "$USD",
      price: 100,
      userId: "7894",
    },
  ]

  // Fetch videos from API
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
        setVideos(data.videos)
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

  // Fetch testimonials from API
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
        setTestimonials(data.testimonials)
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

  // Create testimonial
  const createTestimonial = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Validation
      if (!testimonialFormData.name.trim()) {
        setError('Name is required')
        return
      }

      if (!testimonialFormData.testimony.trim()) {
        setError('Testimony is required')
        return
      }

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/testimonials/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: testimonialFormData.name.trim(),
          testimony: testimonialFormData.testimony.trim()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(data.message || 'Testimonial created successfully')
        setShowSuccessDialog(true)
        
        // Reset form
        setTestimonialFormData({
          name: '',
          testimony: ''
        })
        
        // Refresh testimonials list
        await fetchTestimonials()
      } else {
        setError(data.message || 'Failed to create testimonial')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating testimonial')
      console.error('Error creating testimonial:', err)
    } finally {
      setIsLoading(false)
      setShowAddDialog(false)
    }
  }
  const uploadVideo = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Validation
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

      // Create FormData for file upload
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
        
        // Reset form
        setVideoFormData({
          name: '',
          description: '',
          remarks: '',
          video_file: null
        })
        
        // Refresh videos list
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

  // Create app link
  const createAppLink = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Validation
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
        
        // Reset form
        setAppLinkFormData({
          name: '',
          link_attached: ''
        })
        
        // Refresh app links list
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

  // Delete video
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
        
        // Refresh videos list
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

  // Delete testimonial
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
        
        // Refresh testimonials list
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
        
        // Refresh app links list
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
    } else if (contentType === "Testimonials") {
      fetchTestimonials()
    }
  }, [contentType])

  // Clear error after a few seconds
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
        // Already on landing page management
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
    } else if (contentType === "Testimonials") {
      await deleteTestimonial(itemId)
    } else {
      // Handle other content types deletion (existing logic)
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsLoading(false)
      setShowConfirmDialog(false)
      setConfirmAction(null)
    }
  }

  const handleAdd = async () => {
    if (contentType === "Video") {
      await uploadVideo()
    } else if (contentType === "App Links") {
      await createAppLink()
    } else if (contentType === "Testimonials") {
      await createTestimonial()
    } else {
      // Handle other content types addition (existing logic)
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsLoading(false)
      setShowAddDialog(false)
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
      case "Testimonials":
        return "Add Testimonials"
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
            <TableHead className="font-semibold text-center">Action</TableHead>
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
            <TableHead className="font-semibold">Subscription Plan ID</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold">Currency</TableHead>
            <TableHead className="font-semibold">Price</TableHead>
            <TableHead className="font-semibold">UserID (Admin)</TableHead>
            <TableHead className="font-semibold text-center">Action</TableHead>
          </>
        )
      case "Testimonials":
        return (
          <>
            <TableHead className="font-semibold">Testimonials ID</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Testimony</TableHead>
            <TableHead className="font-semibold">Date Created</TableHead>
            <TableHead className="font-semibold">UserID (Admin)</TableHead>
            <TableHead className="font-semibold text-center">Action</TableHead>
          </>
        )
    }
  }

  const renderTableRows = () => {
    const data = getCurrentData()

    if ((contentType === "Video" || contentType === "App Links" || contentType === "Testimonials") && loading) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <span className="text-gray-500">Loading {contentType.toLowerCase()}...</span>
          </TableCell>
        </TableRow>
      )
    }

    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
            {contentType === "Video" ? "No videos found" : 
             contentType === "App Links" ? "No app links found" :
             contentType === "Testimonials" ? "No testimonials found" :
             `No ${contentType.toLowerCase()} found`}
          </TableCell>
        </TableRow>
      )
    }

    return data.map((item) => (
      <TableRow key={
        contentType === "Video" ? (item as VideoPost).video_id : 
        contentType === "App Links" ? (item as AppLink).app_link_id :
        contentType === "Testimonials" ? (item as Testimonial).testimonials_id :
        (item as any).id
      } className="hover:bg-gray-50 transition-colors">
        <TableCell className="font-medium text-gray-900">
          {contentType === "Video" ? (item as VideoPost).video_id :
           contentType === "App Links" ? (item as AppLink).app_link_id :
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
          </>
        )}
        {contentType === "Testimonials" && (
          <>
            <TableCell className="font-medium text-gray-900">{(item as Testimonial).name}</TableCell>
            <TableCell className="text-gray-600 max-w-xs truncate">{(item as Testimonial).testimony}</TableCell>
            <TableCell className="text-gray-600">{formatDate((item as Testimonial).date_created)}</TableCell>
            <TableCell className="text-gray-600">{(item as Testimonial).user_id}</TableCell>
          </>
        )}
        {contentType === "Subscription Plan" && (
          <>
            <TableCell className="font-medium text-gray-900">{(item as SubscriptionPlan).name}</TableCell>
            <TableCell className="text-gray-600">{(item as SubscriptionPlan).description}</TableCell>
            <TableCell className="text-gray-600">{(item as SubscriptionPlan).currency}</TableCell>
            <TableCell className="text-gray-600">{(item as SubscriptionPlan).price}</TableCell>
            <TableCell className="text-gray-600">{(item as SubscriptionPlan).userId}</TableCell>
          </>
        )}
        <TableCell className="text-center">
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white h-8 px-4"
            onClick={() => {
              setConfirmAction({
                type: "delete",
                itemId: contentType === "Video" 
                  ? (item as VideoPost).video_id.toString() 
                  : contentType === "App Links"
                    ? (item as AppLink).app_link_id.toString()
                    : contentType === "Testimonials"
                      ? (item as Testimonial).testimonials_id.toString()
                      : (item as any).id,
                itemTitle: contentType === "Video"
                  ? (item as VideoPost).name
                  : contentType === "App Links"
                    ? (item as AppLink).name
                    : contentType === "Testimonials"
                      ? (item as Testimonial).name
                      : contentType === "Subscription Plan"
                        ? (item as SubscriptionPlan).name
                        : (item as any).title,
                contentType,
              })
              setShowConfirmDialog(true)
            }}
          >
            Delete
          </Button>
        </TableCell>
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
              <h3 className="text-xl font-bold text-gray-900 mb-4">Subscription Plan</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name:</label>
                  <Input placeholder="Premium" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Function A:</label>
                  <Input placeholder="Function A" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description:</label>
                  <Textarea placeholder="Premium Functionalities" rows={3} />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Function B:</label>
                    <Input placeholder="Function A" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Function C:</label>
                    <Input placeholder="Function A" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price:</label>
                  <Input placeholder="10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Function D:</label>
                  <Input placeholder="Function A" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency:</label>
                  <Input placeholder="USD" />
                </div>
                <div></div>
              </div>
            </div>
          </div>
        )

      case "Testimonials":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Testimonial</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name:</label>
                  <Input 
                    placeholder="John Doe" 
                    value={testimonialFormData.name}
                    onChange={(e) => setTestimonialFormData(prev => ({ ...prev, name: e.target.value }))}
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
                <label className="text-sm font-medium">Testimony:</label>
                <Textarea 
                  placeholder="This app has helped me tremendously..." 
                  rows={4}
                  value={testimonialFormData.testimony}
                  onChange={(e) => setTestimonialFormData(prev => ({ ...prev, testimony: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )
    }
  }

  // Fixed: Proper type handler for Select component
  const handleContentTypeChange = (value: string) => {
    // Type assertion since we know the value will be one of our ContentType values
    setContentType(value as ContentType)
  }

  // Show error dialog if there's an error
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
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {getAddButtonText()}
              </Button>
            </div>

            {/* Content Type Selector */}
            <div className="flex items-center space-x-4">
              <Select value={contentType} onValueChange={handleContentTypeChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="App Links">App Links</SelectItem>
                  <SelectItem value="Subscription Plan">Subscription Plan</SelectItem>
                  <SelectItem value="Testimonials">Testimonials</SelectItem>
                </SelectContent>
              </Select>
              {(contentType === "Video" || contentType === "App Links" || contentType === "Testimonials") && (
                <Button
                  variant="outline"
                  onClick={contentType === "Video" ? fetchVideos : contentType === "App Links" ? fetchAppLinks : fetchTestimonials}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Post List</h3>

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
              {contentType === "Testimonials" && "Landing Page Management > Add New Testimonial"}
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
              {contentType === "Subscription Plan" && "Post New Subscription"}
              {contentType === "Testimonials" && "Create Testimonial"}
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
            <DialogTitle>Delete {confirmAction?.contentType}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>"{confirmAction?.itemTitle}"</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (confirmAction) {
                  handleDelete(confirmAction.itemId, confirmAction.contentType)
                }
              }}
              disabled={isLoading}
            >
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Delete
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