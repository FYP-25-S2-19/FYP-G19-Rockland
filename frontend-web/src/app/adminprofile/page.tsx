"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  Phone,
  Mail,
  Lock,
  Shield,
  Clock,
  User,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"
import { getAuthInfo } from "@/lib/auth-utils" // Import the auth utilities

interface AdminProfile {
  user_id: number
  email: string
  first_name: string
  last_name: string
  date_of_birth: string
  contact_number: string
  gender: string
  region: string
  status: string
  total_points: number
  user_type_id: number
  user_type_name: string
  created_date: string
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function AdminProfile() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  
  // Form data for editing
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    contactNumber: "",
    email: "",
    password: "••••••••••••",
    gender: "",
    region: "",
    role: "",
    status: "",
    createdDate: "",
  })

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
        router.push('/landingpagemanagement')
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
        // Already on admin profile page
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

  // Updated fetchAdminProfile function using auth utils with proper TypeScript handling
  const fetchAdminProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get authentication info from token
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      // Ensure email exists before using it (TypeScript safety)
      if (!authInfo.email) {
        setError('No email found in authentication token. Please log in again.')
        router.push('/login')
        return
      }

      console.log('Auth info:', authInfo) // Debug log

      // Using the same view_user endpoint as in user account implementation
      const response = await fetch(`${API_BASE_URL}/api/users/view_user?email=${encodeURIComponent(authInfo.email)}`, {
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
        // Convert the backend response to match frontend interface
        const adminDetails: AdminProfile = {
          user_id: data.user.user_id,
          email: data.user.email,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          date_of_birth: data.user.date_of_birth,
          contact_number: data.user.contact_number,
          gender: data.user.gender,
          region: data.user.region,
          status: data.user.status,
          total_points: data.user.total_points,
          user_type_id: data.user.user_type_id,
          user_type_name: data.user.user_type_name,
          created_date: data.user.created_date
        }
        
        setAdminProfile(adminDetails)
        
        // Update form data
        setFormData({
          firstName: adminDetails.first_name || '',
          lastName: adminDetails.last_name || '',
          dateOfBirth: formatDate(adminDetails.date_of_birth),
          contactNumber: adminDetails.contact_number || '',
          email: adminDetails.email || '',
          password: "••••••••••••",
          gender: adminDetails.gender || '',
          region: adminDetails.region || '',
          role: adminDetails.user_type_name || 'Admin',
          status: adminDetails.status || 'Active',
          createdDate: formatDate(adminDetails.created_date),
        })
      } else {
        setError(data.error || 'Failed to fetch admin profile')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching admin profile')
      console.error('Error fetching admin profile:', err)
    } finally {
      setLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  }

  // Convert display date back to YYYY-MM-DD format for backend
  const convertToBackendDate = (displayDate: string) => {
    if (!displayDate) return ''
    
    // If it's already in YYYY-MM-DD format, return as is
    if (displayDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return displayDate
    }
    
    // Convert from DD/MM/YYYY to YYYY-MM-DD
    const parts = displayDate.split('/')
    if (parts.length === 3) {
      const [day, month, year] = parts
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
    
    // Try to parse as date and convert
    try {
      const date = new Date(displayDate)
      return date.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  // Load admin profile on component mount
  useEffect(() => {
    fetchAdminProfile()
  }, [])

  // Updated handleUpdate function using auth utils with proper TypeScript handling
  const handleUpdate = async () => {
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

      // Ensure email exists before using it (TypeScript safety)
      if (!authInfo.email) {
        setError('No email found in authentication token. Please log in again.')
        router.push('/login')
        return
      }

      // Prepare update data - convert date back to YYYY-MM-DD format for backend
      const updateData = {
        email: authInfo.email, // Use email from token
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        date_of_birth: convertToBackendDate(formData.dateOfBirth),
        contact_number: formData.contactNumber.trim(),
        gender: formData.gender.trim(),
        region: formData.region.trim(),
        // Only include password if it's been changed (not the placeholder)
        ...(formData.password !== "••••••••••••" && formData.password.trim() && {
          password: formData.password
        })
      }

      const response = await fetch(`${API_BASE_URL}/api/users/update_user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Update the admin profile state with the returned data
        if (data.user) {
          const updatedProfile: AdminProfile = {
            user_id: data.user.user_id,
            email: data.user.email,
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            date_of_birth: data.user.date_of_birth,
            contact_number: data.user.contact_number,
            gender: data.user.gender,
            region: data.user.region,
            status: data.user.status,
            total_points: data.user.total_points,
            user_type_id: data.user.user_type_id,
            user_type_name: data.user.user_type_name,
            created_date: data.user.created_date
          }
          
          setAdminProfile(updatedProfile)
          
          // Update form data with fresh data from server
          setFormData({
            firstName: updatedProfile.first_name || '',
            lastName: updatedProfile.last_name || '',
            dateOfBirth: formatDate(updatedProfile.date_of_birth),
            contactNumber: updatedProfile.contact_number || '',
            email: updatedProfile.email || '',
            password: "••••••••••••", // Reset password field
            gender: updatedProfile.gender || '',
            region: updatedProfile.region || '',
            role: updatedProfile.user_type_name || 'Admin',
            status: updatedProfile.status || 'Active',
            createdDate: formatDate(updatedProfile.created_date),
          })
        }
        
        setShowConfirmDialog(true)
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating profile')
      console.error('Error updating profile:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Loading state
  if (loading) {
    return (
      <AdminLayout
        activeMenuItem="my-profile"
        title="Hi, Admin 👋"
        subtitle="Manage your profile information"
        onNavigate={handleNavigation}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      </AdminLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <AdminLayout
        activeMenuItem="my-profile"
        title="Hi, Admin 👋"
        subtitle="Manage your profile information"
        onNavigate={handleNavigation}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAdminProfile} className="bg-green-600 hover:bg-green-700">
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
      activeMenuItem="my-profile"
      title="Hi, Admin 👋"
      subtitle="Manage your profile information"
      onNavigate={handleNavigation}
    >
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
          <div className="p-8">
            {/* Header with refresh button */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
              <Button
                variant="outline"
                onClick={fetchAdminProfile}
                className="flex items-center space-x-2"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>

            <div className="space-y-6">
              {/* First Row - Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      className="pl-10 h-12 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      className="pl-10 h-12 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Second Row - DOB and Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      className="pl-10 h-12 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      className="pl-10 h-12 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.contactNumber}
                      onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Third Row - Email (Full Width) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>

              {/* Fourth Row - Gender and Region */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                  >
                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Rather not say">Rather not say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Region</label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => handleInputChange("region", value)}
                  >
                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Singapore">Singapore</SelectItem>
                      <SelectItem value="Malaysia">Malaysia</SelectItem>
                      <SelectItem value="Thailand">Thailand</SelectItem>
                      <SelectItem value="Indonesia">Indonesia</SelectItem>
                      <SelectItem value="Philippines">Philippines</SelectItem>
                      <SelectItem value="Vietnam">Vietnam</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fifth Row - Password and Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      className="pl-10 h-12 bg-gray-50 border-gray-200 cursor-not-allowed"
                      value={formData.role}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Sixth Row - Status and Created Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="flex items-center h-12 px-3 bg-gray-50 border border-gray-200 rounded-md">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      formData.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-gray-900 font-medium">{formData.status}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Created Date</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      className="pl-10 h-12 bg-gray-50 border-gray-200 cursor-not-allowed"
                      value={formData.createdDate}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3 pt-6">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-medium"
                  onClick={handleUpdate}
                  disabled={isLoading}
                >
                  {isLoading && <RefreshCw className="w-5 h-5 mr-2 animate-spin" />}
                  Update Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-medium border-gray-300 hover:bg-gray-50 bg-transparent"
                  onClick={fetchAdminProfile}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile Updated Successfully</DialogTitle>
            <DialogDescription>
              Your profile information has been updated successfully. The changes have been saved to the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowConfirmDialog(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}