"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"

interface FAQ {
  id: string
  question: string
  answer: string
  userId: string
  category: string
  isActive: boolean
  createdDate: string
  updatedDate: string
}

interface FormData {
  question: string
  answer: string
  category: string
}

export default function FAQManagement() {
  const router = useRouter()
  const [entries, setEntries] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete"
    faqId: string
    question: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form states for Add dialog
  const [newFAQ, setNewFAQ] = useState<FormData>({
    question: "",
    answer: "",
    category: ""
  })
  
  // Form states for Update dialog
  const [updateFAQ, setUpdateFAQ] = useState<FormData>({
    question: "",
    answer: "",
    category: ""
  })

  // Sample FAQ data
  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How Do I reset my password?",
      answer:
        "To reset your password, go to the login page and click 'Forgot Password'. Enter your email address and follow the instructions sent to your email.",
      userId: "100",
      category: "Account",
      isActive: true,
      createdDate: "2024-01-15",
      updatedDate: "2024-01-15",
    },
    {
      id: "2",
      question: "How do I scan a rock?",
      answer:
        "Open the Rockland app, tap the camera icon, point your camera at the rock, and tap the capture button. The AI will analyze the rock and provide identification results.",
      userId: "100",
      category: "Features",
      isActive: true,
      createdDate: "2024-01-16",
      updatedDate: "2024-01-20",
    },
    {
      id: "3",
      question: "How do I upgrade my account?",
      answer:
        "Go to Settings > Account > Subscription. Choose your preferred plan (Premium or Expert) and complete the payment process.",
      userId: "100",
      category: "Subscription",
      isActive: true,
      createdDate: "2024-01-17",
      updatedDate: "2024-01-17",
    },
    {
      id: "4",
      question: "How do I earn points?",
      answer:
        "You can earn points by scanning rocks, completing daily quizzes, sharing discoveries, and participating in community challenges.",
      userId: "100",
      category: "Gamification",
      isActive: true,
      createdDate: "2024-01-18",
      updatedDate: "2024-01-18",
    },
    {
      id: "5",
      question: "How many free scans do I get?",
      answer:
        "Free users get 5 scans per day. Premium users get 50 scans per day, and Expert users get unlimited scans.",
      userId: "100",
      category: "Subscription",
      isActive: true,
      createdDate: "2024-01-19",
      updatedDate: "2024-01-19",
    },
    {
      id: "6",
      question: "What if no rock information is found?",
      answer:
        "If the AI cannot identify your rock, try taking a clearer photo with better lighting. You can also submit it to our expert community for manual identification.",
      userId: "100",
      category: "Features",
      isActive: true,
      createdDate: "2024-01-20",
      updatedDate: "2024-01-20",
    },
  ]

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
      case "faq-page":
        // Already on FAQ page
        break
      case "my-profile":
        router.push('/adminprofile')
        break
      case "logout":
        localStorage.removeItem('isAdminLoggedIn')
        localStorage.removeItem('adminEmail')
        router.push('/login')
        break
      default:
        console.log("Unknown navigation item:", item)
    }
  }

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredFAQs.length / Number.parseInt(entries))
  const startIndex = (currentPage - 1) * Number.parseInt(entries)
  const paginatedFAQs = filteredFAQs.slice(startIndex, startIndex + Number.parseInt(entries))

  const handleDelete = async (faqId: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setShowConfirmDialog(false)
    setConfirmAction(null)
    // Here you would delete the FAQ from the data
  }

  const handleAdd = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setShowAddDialog(false)
    // Reset form
    setNewFAQ({ question: "", answer: "", category: "" })
    // Here you would add the new FAQ
  }

  const handleUpdate = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setShowUpdateDialog(false)
    setSelectedFAQ(null)
    // Reset form
    setUpdateFAQ({ question: "", answer: "", category: "" })
    // Here you would update the FAQ
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Account":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Features":
        return "bg-green-100 text-green-700 border-green-200"
      case "Subscription":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "Gamification":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  // Open update dialog with pre-filled data
  const openUpdateDialog = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setUpdateFAQ({
      question: faq.question,
      answer: faq.answer,
      category: faq.category
    })
    setShowUpdateDialog(true)
  }

  return (
    <AdminLayout
      activeMenuItem="faq-page"
      title="Hi, Admin 👋"
      subtitle="Manage frequently asked questions"
      onNavigate={handleNavigation}
    >
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">FAQ Page</h2>
                <p className="text-gray-600 mt-1">{filteredFAQs.length} FAQs found</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" className="hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New FAQ
                </Button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Show</span>
                  <Select value={entries} onValueChange={setEntries}>
                    <SelectTrigger className="w-20 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-500">entries</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="relative w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search FAQs..."
                    className="pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
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
                    <TableHead className="font-semibold">FAQ ID</TableHead>
                    <TableHead className="font-semibold">Question</TableHead>
                    <TableHead className="font-semibold">Answer</TableHead>
                    <TableHead className="font-semibold">User-ID</TableHead>
                    <TableHead className="font-semibold text-center">Category</TableHead>
                    <TableHead className="font-semibold text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedFAQs.map((faq) => (
                    <TableRow key={faq.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-900">{faq.id}</TableCell>
                      <TableCell className="font-medium text-gray-900 max-w-xs">
                        <p className="line-clamp-2">{faq.question}</p>
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-md">
                        <p className="line-clamp-2">{faq.answer}</p>
                      </TableCell>
                      <TableCell className="text-gray-600">{faq.userId}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={`border ${getCategoryColor(faq.category)}`}>{faq.category}</Badge>
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
                                faqId: faq.id,
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
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + Number.parseInt(entries), filteredFAQs.length)} of{" "}
                {filteredFAQs.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={`w-8 h-8 ${currentPage === page ? "bg-green-600 hover:bg-green-700" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={newFAQ.category} onValueChange={(value) => setNewFAQ({...newFAQ, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Account">Account</SelectItem>
                  <SelectItem value="Features">Features</SelectItem>
                  <SelectItem value="Subscription">Subscription</SelectItem>
                  <SelectItem value="Gamification">Gamification</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                </SelectContent>
              </Select>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={updateFAQ.category} onValueChange={(value) => setUpdateFAQ({...updateFAQ, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Account">Account</SelectItem>
                    <SelectItem value="Features">Features</SelectItem>
                    <SelectItem value="Subscription">Subscription</SelectItem>
                    <SelectItem value="Gamification">Gamification</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                  </SelectContent>
                </Select>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <Badge className={`border ${getCategoryColor(selectedFAQ.category)}`}>{selectedFAQ.category}</Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Created By</label>
                  <p className="text-gray-700">User ID: {selectedFAQ.userId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Created Date</label>
                  <p className="text-gray-700">{selectedFAQ.createdDate}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-700">{selectedFAQ.updatedDate}</p>
                </div>
              </div>
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
            <DialogTitle>Delete FAQ</DialogTitle>
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
    </AdminLayout>
  )
}