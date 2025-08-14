"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Eye,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  CheckSquare,
  XSquare,
  Clock,
  User,
  Calendar,
  Edit3,
  Globe,
  EyeOff,
} from "lucide-react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"
import { getAuthInfo } from "@/lib/auth-utils"

interface FAQ {
  faq_id: number
  question: string
  answer: string | null
  status: 'pending' | 'answered' | 'published' | 'rejected'
  submitted_by_user_id: number
  answered_by_admin_id: number | null
  submitted_at: string
  answered_at: string | null
  published_at: string | null
  admin_notes: string | null
  submitted_by_username: string | null
  answered_by_username: string | null
}

interface AnswerFormData {
  answer: string
  admin_notes: string
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function FAQManagement() {
  const router = useRouter()
  const [showAnswerDialog, setShowAnswerDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "reject" | "publish" | "unpublish"
    faqId: string
    question: string
    description?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // FAQ data state
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Form state for answering questions
  const [answerForm, setAnswerForm] = useState<AnswerFormData>({
    answer: "",
    admin_notes: ""
  })

  // Fetch all FAQs
  const fetchFAQs = async () => {
    try {
      setLoading(true)
      setError(null)

      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      // Use status filter if not "all"
      const endpoint = statusFilter === "all" 
        ? `${API_BASE_URL}/api/faqs/all` 
        : `${API_BASE_URL}/api/faqs/all?status=${statusFilter}`

      const response = await fetch(endpoint, {
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
        console.log('FAQ Data received:', data.faqs) // Debug log
        setFaqs(data.faqs)
      } else {
        setError(data.error || 'Failed to fetch FAQs')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching FAQs')
      console.error('Error fetching FAQs:', err)
    } finally {
      setLoading(false)
    }
  }

  // Answer a question
  const handleAnswerQuestion = async () => {
    if (!selectedFAQ || !answerForm.answer.trim()) {
      setError('Please provide an answer')
      return
    }

    setIsLoading(true)
    
    try {
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/faqs/answer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          faq_id: selectedFAQ.faq_id,
          answer: answerForm.answer.trim(),
          admin_notes: answerForm.admin_notes.trim() || null
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('Question answered successfully!')
        setShowSuccessDialog(true)
        setShowAnswerDialog(false)
        setSelectedFAQ(null)
        setAnswerForm({ answer: "", admin_notes: "" })
        await fetchFAQs()
      } else {
        setError(data.message || 'Failed to answer question')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while answering question')
      console.error('Error answering question:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Publish an answered FAQ
  const handlePublishFAQ = async (faqId: number) => {
    setIsLoading(true)
    
    try {
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/faqs/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ faq_id: faqId })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('FAQ published successfully!')
        setShowSuccessDialog(true)
        setShowConfirmDialog(false)
        setConfirmAction(null)
        await fetchFAQs()
      } else {
        setError(data.message || 'Failed to publish FAQ')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while publishing FAQ')
      console.error('Error publishing FAQ:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Reject a question
  const handleRejectQuestion = async (faqId: number) => {
    setIsLoading(true)
    
    try {
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/faqs/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          faq_id: faqId,
          admin_notes: "Question rejected by admin"
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('Question rejected successfully!')
        setShowSuccessDialog(true)
        setShowConfirmDialog(false)
        setConfirmAction(null)
        await fetchFAQs()
      } else {
        setError(data.message || 'Failed to reject question')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while rejecting question')
      console.error('Error rejecting question:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Unpublish FAQ
  const handleUnpublishFAQ = async (faqId: number) => {
    setIsLoading(true)
    
    try {
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/faqs/unpublish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ faq_id: faqId })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('FAQ unpublished successfully!')
        setShowSuccessDialog(true)
        setShowConfirmDialog(false)
        setConfirmAction(null)
        await fetchFAQs()
      } else {
        setError(data.message || 'Failed to unpublish FAQ')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while unpublishing FAQ')
      console.error('Error unpublishing FAQ:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete FAQ
  const handleDelete = async (faqId: string) => {
    setIsLoading(true)
    
    try {
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/faqs/delete/${faqId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('FAQ deleted successfully!')
        setShowSuccessDialog(true)
        setShowConfirmDialog(false)
        setConfirmAction(null)
        await fetchFAQs()
      } else {
        setError(data.error || 'Failed to delete FAQ')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting FAQ')
      console.error('Error deleting FAQ:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle action confirmation
  const handleConfirmAction = async () => {
    if (!confirmAction) return

    switch (confirmAction.type) {
      case "delete":
        await handleDelete(confirmAction.faqId)
        break
      case "reject":
        await handleRejectQuestion(parseInt(confirmAction.faqId))
        break
      case "publish":
        await handlePublishFAQ(parseInt(confirmAction.faqId))
        break
      case "unpublish":
        await handleUnpublishFAQ(parseInt(confirmAction.faqId))
        break
    }
  }

  // Load FAQs on component mount and when filter changes
  useEffect(() => {
    fetchFAQs()
  }, [statusFilter])

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
        router.push('/landingpagemanagement')
        break
      case "rock-management":
        router.push('/rockmanagement')
        break
      case "zone-management":
        router.push('/zoneprofile')
        break
      case "faq-page":
        // Already on FAQ page
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

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case "answered":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><MessageCircle className="w-3 h-3 mr-1" />Answered</Badge>
      case "published":
        return <Badge className="bg-green-100 text-green-700 border-green-200"><Globe className="w-3 h-3 mr-1" />Published</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 border-red-200"><XSquare className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>
    }
  }

  // Get action buttons based on status
  const getActionButtons = (faq: FAQ) => {
    const buttons = []

    // View button (always available)
    buttons.push(
      <Button
        key="view"
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3"
        onClick={() => {
          setSelectedFAQ(faq)
          setShowViewDialog(true)
        }}
      >
        <Eye className="w-3 h-3 mr-1" />
        View
      </Button>
    )

    // Status-specific actions
    switch (faq.status) {
      case "pending":
        buttons.push(
          <Button
            key="answer"
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
            onClick={() => {
              setSelectedFAQ(faq)
              setAnswerForm({ answer: "", admin_notes: "" })
              setShowAnswerDialog(true)
            }}
          >
            <Edit3 className="w-3 h-3 mr-1" />
            Answer
          </Button>,
          <Button
            key="reject"
            size="sm"
            variant="outline"
            className="text-red-600 hover:bg-red-50 border-red-200 h-8 px-3"
            onClick={() => {
              setConfirmAction({
                type: "reject",
                faqId: faq.faq_id.toString(),
                question: faq.question,
                description: "This will mark the question as rejected and it won't be answered."
              })
              setShowConfirmDialog(true)
            }}
          >
            <XSquare className="w-3 h-3 mr-1" />
            Reject
          </Button>
        )
        break

      case "answered":
        buttons.push(
          <Button
            key="publish"
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
            onClick={() => {
              setConfirmAction({
                type: "publish",
                faqId: faq.faq_id.toString(),
                question: faq.question,
                description: "This will make the FAQ visible to all users."
              })
              setShowConfirmDialog(true)
            }}
          >
            <Globe className="w-3 h-3 mr-1" />
            Publish
          </Button>
        )
        break

      case "published":
        buttons.push(
          <Button
            key="unpublish"
            size="sm"
            variant="outline"
            className="text-orange-600 hover:bg-orange-50 border-orange-200 h-8 px-3"
            onClick={() => {
              setConfirmAction({
                type: "unpublish",
                faqId: faq.faq_id.toString(),
                question: faq.question,
                description: "This will remove the FAQ from public view."
              })
              setShowConfirmDialog(true)
            }}
          >
            <EyeOff className="w-3 h-3 mr-1" />
            Unpublish
          </Button>
        )
        break
    }

    // Delete button (always available)
    buttons.push(
      <Button
        key="delete"
        size="sm"
        variant="outline"
        className="text-red-600 hover:bg-red-50 border-red-200 h-8 px-3"
        onClick={() => {
          setConfirmAction({
            type: "delete",
            faqId: faq.faq_id.toString(),
            question: faq.question,
            description: "This action cannot be undone."
          })
          setShowConfirmDialog(true)
        }}
      >
        <Trash2 className="w-3 h-3 mr-1" />
        Delete
      </Button>
    )

    return buttons
  }

  // Get pending count for header
  const pendingCount = faqs.filter(faq => faq.status === 'pending').length

  // Loading state
  if (loading) {
    return (
      <AdminLayout
        activeMenuItem="faq-page"
        title="Hi, Admin 👋"
        subtitle="Manage user questions and FAQ responses"
        onNavigate={handleNavigation}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">Loading FAQs...</span>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      activeMenuItem="faq-page"
      title="Hi, Admin 👋"
      subtitle="Manage user questions and FAQ responses"
      onNavigate={handleNavigation}
    >
      <div className="p-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">FAQ Management</h2>
                <p className="text-gray-600 mt-1">
                  {faqs.length} total questions • {pendingCount} pending review
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={fetchFAQs}
                  className="flex items-center space-x-2"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Questions</SelectItem>
                  <SelectItem value="pending">Pending ({faqs.filter(f => f.status === 'pending').length})</SelectItem>
                  <SelectItem value="answered">Answered ({faqs.filter(f => f.status === 'answered').length})</SelectItem>
                  <SelectItem value="published">Published ({faqs.filter(f => f.status === 'published').length})</SelectItem>
                  <SelectItem value="rejected">Rejected ({faqs.filter(f => f.status === 'rejected').length})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* FAQ List */}
          <div className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold">Question</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Submitted By</TableHead>
                    <TableHead className="font-semibold">Submitted Date</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No questions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    faqs.map((faq) => (
                      <TableRow key={faq.faq_id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium text-gray-900 max-w-md">
                          <p className="line-clamp-2">{faq.question}</p>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(faq.status)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{faq.submitted_by_username || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(faq.submitted_at).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-2 flex-wrap gap-1">
                            {getActionButtons(faq)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Question Dialog */}
      <Dialog open={showAnswerDialog} onOpenChange={setShowAnswerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Answer Question</DialogTitle>
            <DialogDescription>Provide an answer to this user question.</DialogDescription>
          </DialogHeader>
          {selectedFAQ && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Question</label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-gray-900">{selectedFAQ.question}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Your Answer *</label>
                <Textarea 
                  placeholder="Type your answer here..." 
                  rows={4} 
                  value={answerForm.answer}
                  onChange={(e) => setAnswerForm({...answerForm, answer: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Admin Notes (Internal)</label>
                <Textarea 
                  placeholder="Optional internal notes (not visible to users)" 
                  rows={2} 
                  value={answerForm.admin_notes}
                  onChange={(e) => setAnswerForm({...answerForm, admin_notes: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnswerDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleAnswerQuestion} disabled={isLoading}>
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Submit Answer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View FAQ Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
            <DialogDescription>Complete information about this FAQ.</DialogDescription>
          </DialogHeader>
          {selectedFAQ && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  {getStatusBadge(selectedFAQ.status)}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Submitted By</label>
                  <p className="text-gray-900">{selectedFAQ.submitted_by_username || 'Unknown'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Submitted Date</label>
                  <p className="text-gray-900">{new Date(selectedFAQ.submitted_at).toLocaleString()}</p>
                </div>
                {selectedFAQ.answered_at && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Answered Date</label>
                    <p className="text-gray-900">{new Date(selectedFAQ.answered_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Question</label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-gray-900">{selectedFAQ.question}</p>
                </div>
              </div>
              
              {selectedFAQ.answer && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Answer</label>
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-gray-900">{selectedFAQ.answer}</p>
                  </div>
                </div>
              )}
              
              {selectedFAQ.admin_notes && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Admin Notes (Internal)</label>
                  <div className="p-3 bg-yellow-50 rounded-md">
                    <p className="text-gray-700">{selectedFAQ.admin_notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>Confirm Action</span>
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "delete" && (
                <>
                  Are you sure you want to delete this question: <strong>"{confirmAction.question}"</strong>?
                  <br />
                  <span className="text-red-600">{confirmAction.description}</span>
                </>
              )}
              {confirmAction?.type === "reject" && (
                <>
                  Are you sure you want to reject this question: <strong>"{confirmAction.question}"</strong>?
                  <br />
                  <span className="text-orange-600">{confirmAction.description}</span>
                </>
              )}
              {confirmAction?.type === "publish" && (
                <>
                  Are you sure you want to publish this FAQ: <strong>"{confirmAction.question}"</strong>?
                  <br />
                  <span className="text-green-600">{confirmAction.description}</span>
                </>
              )}
              {confirmAction?.type === "unpublish" && (
                <>
                  Are you sure you want to unpublish this FAQ: <strong>"{confirmAction.question}"</strong>?
                  <br />
                  <span className="text-orange-600">{confirmAction.description}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className={
                confirmAction?.type === "delete" || confirmAction?.type === "reject"
                  ? "bg-red-600 hover:bg-red-700"
                  : confirmAction?.type === "publish"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-orange-600 hover:bg-orange-700"
              }
              onClick={handleConfirmAction}
              disabled={isLoading}
            >
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              {confirmAction?.type === "delete" && "Delete"}
              {confirmAction?.type === "reject" && "Reject"}
              {confirmAction?.type === "publish" && "Publish"}
              {confirmAction?.type === "unpublish" && "Unpublish"}
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