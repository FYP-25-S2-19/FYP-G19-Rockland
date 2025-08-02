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
  Search,
  Plus,
  Eye,
  Trash2,
  Edit,
  RefreshCw,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"
import { getAuthInfo } from "@/lib/auth-utils" // Import the auth utilities

interface FAQ {
  faq_id: number
  question: string
  answer: string
  user_id: number
  user_name?: string
}

interface FormData {
  question: string
  answer: string
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function FAQManagement() {
  const router = useRouter()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete"
    faqId: string
    question: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // FAQ data state
  const [faqs, setFaqs] = useState<FAQ[]>([])
  
  // Form states for Add dialog
  const [newFAQ, setNewFAQ] = useState<FormData>({
    question: "",
    answer: ""
  })
  
  // Form states for Update dialog
  const [updateFAQ, setUpdateFAQ] = useState<FormData>({
    question: "",
    answer: ""
  })

  // Fetch all FAQs
  const fetchFAQs = async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/faqs/all`, {
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

  // Add new FAQ
  const handleAdd = async () => {
    if (!newFAQ.question.trim() || !newFAQ.answer.trim()) {
      setError('Please fill in both question and answer fields')
      return
    }

    setIsLoading(true)
    
    try {
      // Get authentication info from token
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/faqs/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: newFAQ.question.trim(),
          answer: newFAQ.answer.trim()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('FAQ created successfully!')
        setShowSuccessDialog(true)
        setShowAddDialog(false)
        setNewFAQ({ question: "", answer: "" })
        await fetchFAQs() // Refresh the list
      } else {
        setError(data.error || 'Failed to create FAQ')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating FAQ')
      console.error('Error creating FAQ:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Update FAQ
  const handleUpdate = async () => {
    if (!selectedFAQ || !updateFAQ.question.trim() || !updateFAQ.answer.trim()) {
      setError('Please fill in both question and answer fields')
      return
    }

    setIsLoading(true)
    
    try {
      // Get authentication info from token
      const authInfo = getAuthInfo()
      
      if (!authInfo.isAuthenticated) {
        setError(authInfo.error || 'Authentication failed. Please log in again.')
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/faqs/update/${selectedFAQ.faq_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authInfo.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: updateFAQ.question.trim(),
          answer: updateFAQ.answer.trim()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('FAQ updated successfully!')
        setShowSuccessDialog(true)
        setShowUpdateDialog(false)
        setSelectedFAQ(null)
        setUpdateFAQ({ question: "", answer: "" })
        await fetchFAQs() // Refresh the list
      } else {
        setError(data.error || 'Failed to update FAQ')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating FAQ')
      console.error('Error updating FAQ:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete FAQ
  const handleDelete = async (faqId: string) => {
    setIsLoading(true)
    
    try {
      // Get authentication info from token
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
        await fetchFAQs() // Refresh the list
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

  // Load FAQs on component mount
  useEffect(() => {
    fetchFAQs()
  }, [])

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

  // Show all FAQs without pagination
  const paginatedFAQs = faqs

  // Open update dialog with pre-filled data
  const openUpdateDialog = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setUpdateFAQ({
      question: faq.question,
      answer: faq.answer
    })
    setShowUpdateDialog(true)
  }

  // Loading state
  if (loading) {
    return (
      <AdminLayout
        activeMenuItem="faq-page"
        title="Hi, Admin 👋"
        subtitle="Manage frequently asked questions"
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
      subtitle="Manage frequently asked questions"
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
                <h2 className="text-2xl font-bold text-gray-900">FAQ Page</h2>
                <p className="text-gray-600 mt-1">{faqs.length} FAQs found</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New FAQ
                </Button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-start gap-4">
              <div className="flex items-center space-x-4">
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
          </div>

          {/* FAQ List */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">FAQ List</h3>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold">Question</TableHead>
                    <TableHead className="font-semibold">Answer</TableHead>
                    <TableHead className="font-semibold text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFAQs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                        No FAQs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedFAQs.map((faq) => (
                      <TableRow key={faq.faq_id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium text-gray-900 max-w-xs">
                          <p className="line-clamp-2">{faq.question}</p>
                        </TableCell>
                        <TableCell className="text-gray-600 max-w-md">
                          <p className="line-clamp-2">{faq.answer}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-2">
                            <Button
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
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white h-8 px-3"
                              onClick={() => {
                                setConfirmAction({
                                  type: "delete",
                                  faqId: faq.faq_id.toString(),
                                  question: faq.question,
                                })
                                setShowConfirmDialog(true)
                              }}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                              onClick={() => openUpdateDialog(faq)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Update
                            </Button>
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

      {/* Add New FAQ Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New FAQ</DialogTitle>
            <DialogDescription>Create a new frequently asked question for users.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question</label>
              <Input 
                placeholder="Enter the question" 
                value={newFAQ.question}
                onChange={(e) => setNewFAQ({...newFAQ, question: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Answer</label>
              <Textarea 
                placeholder="Enter the detailed answer" 
                rows={4} 
                value={newFAQ.answer}
                onChange={(e) => setNewFAQ({...newFAQ, answer: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleAdd} disabled={isLoading}>
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Create FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update FAQ Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update FAQ</DialogTitle>
            <DialogDescription>Edit the frequently asked question.</DialogDescription>
          </DialogHeader>
          {selectedFAQ && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question</label>
                <Input 
                  value={updateFAQ.question}
                  onChange={(e) => setUpdateFAQ({...updateFAQ, question: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Answer</label>
                <Textarea 
                  value={updateFAQ.answer}
                  onChange={(e) => setUpdateFAQ({...updateFAQ, answer: e.target.value})}
                  rows={4} 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleUpdate} disabled={isLoading}>
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Update FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View FAQ Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>FAQ Details</DialogTitle>
            <DialogDescription>View the complete FAQ information.</DialogDescription>
          </DialogHeader>
          {selectedFAQ && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Question</label>
                <p className="text-gray-900 font-medium">{selectedFAQ.question}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Answer</label>
                <p className="text-gray-700">{selectedFAQ.answer}</p>
              </div>

              {selectedFAQ.user_name && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Created By</label>
                  <p className="text-gray-700">{selectedFAQ.user_name}</p>
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
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span>Delete FAQ</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this FAQ: <strong>"{confirmAction?.question}"</strong>? This action cannot
              be undone.
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
                  handleDelete(confirmAction.faqId)
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