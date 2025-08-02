"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RefreshCw, Eye, Check, X, Clock, CheckCircle, XCircle, FileTextIcon, AlertCircle, Download } from 'lucide-react'
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"

interface Application {
  application_id: number
  user_id: number
  first_name: string
  last_name: string
  email: string
  submission_date: string // Changed from date_submitted to match backend
  files_submitted: number
  status: "Pending" | "Approved" | "Rejected"
  date_processed?: string
  admin_id?: string
  // Additional fields for detailed view
  date_of_birth?: string
  contact_number?: string
  interest?: string
  role?: string
  gender?: string
  region?: string
  created_date?: string
  questions?: {
    question1: string
    answer1: string
    question2: string
    answer2: string
  }
  attached_files?: Array<{
    file_id: number
    filename: string
    file_path: string
  }>
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

export default function ApplicationsManagement() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("pending")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [confirmAction, setConfirmAction] = useState<{
    type: "accept" | "reject"
    applicationId: string
    applicantName: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "detail">("list")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [detailPage, setDetailPage] = useState(1)
  const [downloadingFileId, setDownloadingFileId] = useState<number | null>(null)

  // Application data state
  const [pendingApplications, setPendingApplications] = useState<Application[]>([])
  const [pastApplications, setPastApplications] = useState<Application[]>([])

  // Fetch pending applications
  const fetchPendingApplications = async () => {
    try {
      setLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/applications/pending`, {
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
        setPendingApplications(data.applications)
      } else {
        setError(data.error || 'Failed to fetch pending applications')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching pending applications')
      console.error('Error fetching pending applications:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch past applications
  const fetchPastApplications = async () => {
    try {
      setLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/applications/past`, {
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
        setPastApplications(data.applications)
      } else {
        setError(data.error || 'Failed to fetch past applications')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching past applications')
      console.error('Error fetching past applications:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch application details
  const fetchApplicationDetails = async (applicationId: number) => {
    try {
      setLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/applications/view/${applicationId}`, {
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
        return data.application
      } else {
        setError(data.error || 'Failed to fetch application details')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching application details')
      console.error('Error fetching application details:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Download file function
  const downloadFile = async (fileId: number, filename: string) => {
    try {
      setDownloadingFileId(fileId)
      
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        return
      }

      // First get the download URL
      const response = await fetch(`${API_BASE_URL}/api/applications/file/url/${fileId}`, {
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
      
      if (data.success && data.download_url) {
        // Create a temporary link element and trigger download
        const link = document.createElement('a')
        link.href = data.download_url
        link.download = filename
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        setError(data.error || 'Failed to get download URL')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while downloading file')
      console.error('Error downloading file:', err)
    } finally {
      setDownloadingFileId(null)
    }
  }

  // Accept application
  const acceptApplication = async (applicationId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/applications/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: parseInt(applicationId) // Remove the # prefix handling since we're passing clean ID
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(data.message || 'Application accepted successfully')
        setShowSuccessDialog(true)
        
        // Refresh applications
        await fetchPendingApplications()
        await fetchPastApplications()
      } else {
        setError(data.message || 'Failed to accept application')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while accepting application')
      console.error('Error accepting application:', err)
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
      setConfirmAction(null)
    }
  }

  // Reject application
  const rejectApplication = async (applicationId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/applications/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: parseInt(applicationId) // Remove the # prefix handling since we're passing clean ID
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(data.message || 'Application rejected successfully')
        setShowSuccessDialog(true)
        
        // Refresh applications
        await fetchPendingApplications()
        await fetchPastApplications()
      } else {
        setError(data.message || 'Failed to reject application')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while rejecting application')
      console.error('Error rejecting application:', err)
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
      setConfirmAction(null)
    }
  }

  // Load both sets of applications on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchPendingApplications(),
        fetchPastApplications()
      ])
    }
    
    loadInitialData()
  }, [])

  // Load applications when tab changes (for refresh)
  useEffect(() => {
    if (activeTab === "pending") {
      fetchPendingApplications()
    } else if (activeTab === "past") {
      fetchPastApplications()
    }
  }, [activeTab])

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
        // Already on applications page
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

  const handleAction = async (action: "accept" | "reject", applicationId: string) => {
    if (action === "accept") {
      await acceptApplication(applicationId)
    } else {
      await rejectApplication(applicationId)
    }
  }

  const handleView = async (application: Application) => {
    // Fetch detailed application data
    const detailedApplication = await fetchApplicationDetails(application.application_id)
    if (detailedApplication) {
      setSelectedApplication(detailedApplication)
      setViewMode("detail")
      setDetailPage(1)
    }
  }

  const handleBackToList = () => {
    setViewMode("list")
    setSelectedApplication(null)
    setDetailPage(1)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "Rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB')
    } catch {
      return 'Invalid Date'
    }
  }

  // Show error dialog if there's an error
  if (error) {
    return (
      <AdminLayout
        activeMenuItem="applications"
        title="Hi, Admin 👋"
        subtitle="Manage application submissions efficiently"
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
                  if (activeTab === "pending") {
                    fetchPendingApplications()
                  } else {
                    fetchPastApplications()
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

  if (viewMode === "detail" && selectedApplication) {
    return (
      <AdminLayout
        activeMenuItem="applications"
        title="Hi, Admin 👋"
        subtitle="Review application details"
        onNavigate={handleNavigation}
      >
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Breadcrumb */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToList}
                  className="text-gray-600 hover:text-gray-800 p-0"
                >
                  Back to Applications
                </Button>
                <span className="text-gray-400">{'>'}</span>
                <span className="font-medium text-gray-900">
                  {selectedApplication.first_name} {selectedApplication.last_name}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {getStatusBadge(selectedApplication.status)}
                <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
              </div>
            </div>

            {/* Detail Content */}
            <div className="p-8">
              {detailPage === 1 ? (
                // Page 1 - Personal Information
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      <Input value={selectedApplication.first_name || ''} readOnly className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <Input value={selectedApplication.last_name || ''} readOnly className="bg-gray-50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                      <Input value={selectedApplication.date_of_birth || "N/A"} readOnly className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Contact Number</label>
                      <Input value={selectedApplication.contact_number || "N/A"} readOnly className="bg-gray-50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input value={selectedApplication.email || ''} readOnly className="bg-gray-50" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Interest</label>
                      <Input value={selectedApplication.interest || "N/A"} readOnly className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <Input value={selectedApplication.role || "N/A"} readOnly className="bg-gray-50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Gender</label>
                      <Input value={selectedApplication.gender || "N/A"} readOnly className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Region</label>
                      <Input value={selectedApplication.region || "N/A"} readOnly className="bg-gray-50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className="flex items-center h-10 px-3 bg-gray-50 border border-gray-200 rounded-md">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-900">Active</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Created Date</label>
                      <Input value={formatDate(selectedApplication.created_date || '')} readOnly className="bg-gray-50" />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => setDetailPage(2)}
                    >
                      Next {'>'} 
                    </Button>
                  </div>
                </div>
              ) : (
                // Page 2 - Questions and Files
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Question 1</label>
                      <Input 
                        value={selectedApplication.questions?.question1 || "Why do you want to become an expert?"} 
                        readOnly 
                        className="bg-gray-50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Answer</label>
                      <textarea 
                        value={selectedApplication.questions?.answer1 || "No answer provided"} 
                        readOnly 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md resize-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Question 2</label>
                      <Input 
                        value={selectedApplication.questions?.question2 || "Describe your background and expertise in your field."} 
                        readOnly 
                        className="bg-gray-50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Answer</label>
                      <textarea 
                        value={selectedApplication.questions?.answer2 || "No answer provided"} 
                        readOnly 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md resize-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700">Attached Files</label>
                    <div className="space-y-2">
                      {selectedApplication.attached_files && selectedApplication.attached_files.length > 0 ? (
                        selectedApplication.attached_files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
                            <div className="flex items-center">
                              <FileTextIcon className="w-4 h-4 text-gray-500 mr-2" />
                              <span className="text-gray-700">{file.filename}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadFile(file.file_id, file.filename)}
                              disabled={downloadingFileId === file.file_id}
                              className="ml-2"
                            >
                              {downloadingFileId === file.file_id ? (
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                <Download className="w-3 h-3 mr-1" />
                              )}
                              Download
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md">
                          <FileTextIcon className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-gray-500">No files attached</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => setDetailPage(1)}
                    >
                      {'<'} Previous
                    </Button>
                    {selectedApplication.status === 'Pending' && (
                      <div className="space-x-2">
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => {
                            setConfirmAction({
                              type: "accept",
                              applicationId: selectedApplication.application_id.toString(),
                              applicantName: `${selectedApplication.first_name} ${selectedApplication.last_name}`,
                            })
                            setShowConfirmDialog(true)
                          }}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button 
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => {
                            setConfirmAction({
                              type: "reject",
                              applicationId: selectedApplication.application_id.toString(),
                              applicantName: `${selectedApplication.first_name} ${selectedApplication.last_name}`,
                            })
                            setShowConfirmDialog(true)
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmAction?.type === "accept" ? "Accept Application" : "Reject Application"}</DialogTitle>
              <DialogDescription>
                Are you sure you want to {confirmAction?.type} the application from{" "}
                <strong>{confirmAction?.applicantName}</strong>?
                {confirmAction?.type === "reject" && " This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                className={
                  confirmAction?.type === "accept" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }
                onClick={() => {
                  if (confirmAction) {
                    handleAction(confirmAction.type, confirmAction.applicationId)
                  }
                }}
                disabled={isLoading}
              >
                {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                {confirmAction?.type === "accept" ? "Accept" : "Reject"}
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

  return (
    <AdminLayout
      activeMenuItem="applications"
      title="Hi, Admin 👋"
      subtitle="Manage application submissions efficiently"
      onNavigate={handleNavigation}
    >
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
                <p className="text-gray-600 mt-1">Review and manage user applications</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="pending" className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Pending Applicants ({pendingApplications.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Past Applicants ({pastApplications.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Pending Applications */}
            <TabsContent value="pending" className="mt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold">User-ID</TableHead>
                      <TableHead className="font-semibold">First Name</TableHead>
                      <TableHead className="font-semibold">Last Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Date Submitted</TableHead>
                      <TableHead className="font-semibold">Files Submitted</TableHead>
                      <TableHead className="font-semibold text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <span className="text-gray-500">Loading pending applications...</span>
                        </TableCell>
                      </TableRow>
                    ) : pendingApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No pending applications found
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingApplications.map((application) => (
                        <TableRow key={application.application_id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-900">#{application.application_id}</TableCell>
                          <TableCell className="text-gray-900">{application.first_name || 'N/A'}</TableCell>
                          <TableCell className="text-gray-900">{application.last_name || 'N/A'}</TableCell>
                          <TableCell className="text-gray-600">{application.email || 'N/A'}</TableCell>
                          <TableCell className="text-gray-600">{formatDate(application.submission_date)}</TableCell>
                          <TableCell className="text-gray-600">{application.files_submitted || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center space-x-2">
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3"
                                onClick={() => handleView(application)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                                onClick={() => {
                                  setConfirmAction({
                                    type: "accept",
                                    applicationId: application.application_id.toString(),
                                    applicantName: `${application.first_name} ${application.last_name}`,
                                  })
                                  setShowConfirmDialog(true)
                                }}
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white h-8 px-3"
                                onClick={() => {
                                  setConfirmAction({
                                    type: "reject",
                                    applicationId: application.application_id.toString(),
                                    applicantName: `${application.first_name} ${application.last_name}`,
                                  })
                                  setShowConfirmDialog(true)
                                }}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Past Applications */}
            <TabsContent value="past" className="mt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold">User-ID</TableHead>
                      <TableHead className="font-semibold">First Name</TableHead>
                      <TableHead className="font-semibold">Last Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Date Submitted</TableHead>
                      <TableHead className="font-semibold">Files Submitted</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Date Processed</TableHead>
                      <TableHead className="font-semibold">User-ID (Admin)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <span className="text-gray-500">Loading past applications...</span>
                        </TableCell>
                      </TableRow>
                    ) : pastApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No past applications found
                        </TableCell>
                      </TableRow>
                    ) : (
                      pastApplications.map((application) => (
                        <TableRow key={application.application_id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-900">#{application.application_id}</TableCell>
                          <TableCell className="text-gray-900">{application.first_name || 'N/A'}</TableCell>
                          <TableCell className="text-gray-900">{application.last_name || 'N/A'}</TableCell>
                          <TableCell className="text-gray-600">{application.email || 'N/A'}</TableCell>
                          <TableCell className="text-gray-600">{formatDate(application.submission_date)}</TableCell>
                          <TableCell className="text-gray-600">{application.files_submitted || 0}</TableCell>
                          <TableCell>{getStatusBadge(application.status)}</TableCell>
                          <TableCell className="text-gray-600">{formatDate(application.date_processed || application.submission_date)}</TableCell>
                          <TableCell className="text-gray-600">{application.admin_id || 'N/A'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmAction?.type === "accept" ? "Accept Application" : "Reject Application"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmAction?.type} the application from{" "}
              <strong>{confirmAction?.applicantName}</strong>?
              {confirmAction?.type === "reject" && " This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className={
                confirmAction?.type === "accept" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }
              onClick={() => {
                if (confirmAction) {
                  handleAction(confirmAction.type, confirmAction.applicationId)
                }
              }}
              disabled={isLoading}
            >
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              {confirmAction?.type === "accept" ? "Accept" : "Reject"}
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