"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Search, RefreshCw, Eye, Check, X, Clock, CheckCircle, XCircle, FileTextIcon } from 'lucide-react'
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"

interface Application {
  id: string
  firstName: string
  lastName: string
  email: string
  dateSubmitted: string
  filesSubmitted: number
  status?: "Accepted" | "Rejected"
  dateProcessed?: string
  adminId?: string
  // Additional fields for detailed view
  dateOfBirth?: string
  contactNumber?: string
  interest?: string
  role?: string
  gender?: string
  region?: string
  createdDate?: string
  questions?: {
    question1: string
    answer1: string
    question2: string
    answer2: string
  }
  attachedFiles?: string[]
}

export default function ApplicationsManagement() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("pending")
  const [entries, setEntries] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: "accept" | "reject"
    applicationId: string
    applicantName: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "detail">("list")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [detailPage, setDetailPage] = useState(1)

  // Sample data for pending applications
  const pendingApplications: Application[] = [
    {
      id: "#1",
      firstName: "Matt",
      lastName: "Dickerson",
      email: "dicker@gmail.com",
      dateSubmitted: "13/05/2025",
      filesSubmitted: 10,
      dateOfBirth: "12/10/2004",
      contactNumber: "82622526",
      interest: "Fossils, Minerals",
      role: "Free User",
      gender: "Male",
      region: "Singapore",
      createdDate: "09/04/2025",
      questions: {
        question1: "Why do you want to become an expert?",
        answer1: "lorem ipsum ...",
        question2: "Describe your background and expertise?",
        answer2: "lorem ipsum ..."
      },
      attachedFiles: ["Resume_Matt.pdf", "Certification_Matt.pdf"]
    },
    {
      id: "#2",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@gmail.com",
      dateSubmitted: "12/05/2025",
      filesSubmitted: 8,
      dateOfBirth: "12/10/2004",
      contactNumber: "82622526",
      interest: "Fossils, Minerals",
      role: "Free User",
      gender: "Male",
      region: "Singapore",
      createdDate: "09/04/2025",
      questions: {
        question1: "Why do you want to become an expert?",
        answer1: "lorem ipsum ...",
        question2: "Describe your background and expertise?",
        answer2: "lorem ipsum ..."
      },
      attachedFiles: ["Resume_Matt.pdf", "Certification_Matt.pdf"]
    },
    {
      id: "#3",
      firstName: "Michael",
      lastName: "Brown",
      email: "m.brown@gmail.com",
      dateSubmitted: "11/05/2025",
      filesSubmitted: 12,
      dateOfBirth: "12/10/2004",
      contactNumber: "82622526",
      interest: "Fossils, Minerals",
      role: "Free User",
      gender: "Male",
      region: "Singapore",
      createdDate: "09/04/2025",
      questions: {
        question1: "Why do you want to become an expert?",
        answer1: "lorem ipsum ...",
        question2: "Describe your background and expertise?",
        answer2: "lorem ipsum ..."
      },
      attachedFiles: ["Resume_Matt.pdf", "Certification_Matt.pdf"]
    },
    {
      id: "#4",
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@gmail.com",
      dateSubmitted: "10/05/2025",
      filesSubmitted: 6,
      dateOfBirth: "12/10/2004",
      contactNumber: "82622526",
      interest: "Fossils, Minerals",
      role: "Free User",
      gender: "Male",
      region: "Singapore",
      createdDate: "09/04/2025",
      questions: {
        question1: "Why do you want to become an expert?",
        answer1: "lorem ipsum ...",
        question2: "Describe your background and expertise?",
        answer2: "lorem ipsum ..."
      },
      attachedFiles: ["Resume_Matt.pdf", "Certification_Matt.pdf"]
    },
  ]

  // Sample data for past applications
  const pastApplications: Application[] = [
    {
      id: "#1",
      firstName: "Matt",
      lastName: "Dickerson",
      email: "dicker@gmail.com",
      dateSubmitted: "13/05/2025",
      filesSubmitted: 10,
      status: "Accepted",
      dateProcessed: "15/05/2025",
      adminId: "100",
      dateOfBirth: "12/10/2004",
      contactNumber: "82622526",
      interest: "Fossils, Minerals",
      role: "Free User",
      gender: "Male",
      region: "Singapore",
      createdDate: "09/04/2025",
      questions: {
        question1: "Why do you want to become an expert?",
        answer1: "lorem ipsum ...",
        question2: "Describe your background and expertise?",
        answer2: "lorem ipsum ..."
      },
      attachedFiles: ["Resume_Matt.pdf", "Certification_Matt.pdf"]
    },
    {
      id: "#2",
      firstName: "Jessica",
      lastName: "Wilson",
      email: "j.wilson@gmail.com",
      dateSubmitted: "12/05/2025",
      filesSubmitted: 7,
      status: "Accepted",
      dateProcessed: "14/05/2025",
      adminId: "100",
      dateOfBirth: "12/10/2004",
      contactNumber: "82622526",
      interest: "Fossils, Minerals",
      role: "Free User",
      gender: "Male",
      region: "Singapore",
      createdDate: "09/04/2025",
      questions: {
        question1: "Why do you want to become an expert?",
        answer1: "lorem ipsum ...",
        question2: "Describe your background and expertise?",
        answer2: "lorem ipsum ..."
      },
      attachedFiles: ["Resume_Matt.pdf", "Certification_Matt.pdf"]
    },
    {
      id: "#3",
      firstName: "David",
      lastName: "Miller",
      email: "d.miller@gmail.com",
      dateSubmitted: "11/05/2025",
      filesSubmitted: 4,
      status: "Rejected",
      dateProcessed: "13/05/2025",
      adminId: "100",
      dateOfBirth: "12/10/2004",
      contactNumber: "82622526",
      interest: "Fossils, Minerals",
      role: "Free User",
      gender: "Male",
      region: "Singapore",
      createdDate: "09/04/2025",
      questions: {
        question1: "Why do you want to become an expert?",
        answer1: "lorem ipsum ...",
        question2: "Describe your background and expertise?",
        answer2: "lorem ipsum ..."
      },
      attachedFiles: ["Resume_Matt.pdf", "Certification_Matt.pdf"]
    },
    {
      id: "#4",
      firstName: "Lisa",
      lastName: "Anderson",
      email: "lisa.a@gmail.com",
      dateSubmitted: "10/05/2025",
      filesSubmitted: 9,
      status: "Accepted",
      dateProcessed: "12/05/2025",
      adminId: "100",
      dateOfBirth: "12/10/2004",
      contactNumber: "82622526",
      interest: "Fossils, Minerals",
      role: "Free User",
      gender: "Male",
      region: "Singapore",
      createdDate: "09/04/2025",
      questions: {
        question1: "Why do you want to become an expert?",
        answer1: "lorem ipsum ...",
        question2: "Describe your background and expertise?",
        answer2: "lorem ipsum ..."
      },
      attachedFiles: ["Resume_Matt.pdf", "Certification_Matt.pdf"]
    },
    {
      id: "#5",
      firstName: "Robert",
      lastName: "Taylor",
      email: "r.taylor@gmail.com",
      dateSubmitted: "09/05/2025",
      filesSubmitted: 3,
      status: "Rejected",
      dateProcessed: "11/05/2025",
      adminId: "100",
      dateOfBirth: "12/10/2004",
      contactNumber: "82622526",
      interest: "Fossils, Minerals",
      role: "Free User",
      gender: "Male",
      region: "Singapore",
      createdDate: "09/04/2025",
      questions: {
        question1: "Why do you want to become an expert?",
        answer1: "lorem ipsum ...",
        question2: "Describe your background and expertise?",
        answer2: "lorem ipsum ..."
      },
      attachedFiles: ["Resume_Matt.pdf", "Certification_Matt.pdf"]
    },
  ]

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
      case "faq-page":
        router.push('/faqmanagement')
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

  const handleAction = async (action: "accept" | "reject", applicationId: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setShowConfirmDialog(false)
    setConfirmAction(null)
    // Here you would update the application status
  }

  const handleView = (application: Application) => {
    setSelectedApplication(application)
    setViewMode("detail")
    setDetailPage(1)
  }

  const handleBackToList = () => {
    setViewMode("list")
    setSelectedApplication(null)
    setDetailPage(1)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Accepted":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
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

  const filteredPendingApplications = pendingApplications.filter(
    (app) =>
      app.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredPastApplications = pastApplications.filter(
    (app) =>
      app.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
                  {selectedApplication.firstName} {selectedApplication.lastName}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>
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
                      <Input value={selectedApplication.firstName} readOnly className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <Input value={selectedApplication.lastName} readOnly className="bg-gray-50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                      <Input value={selectedApplication.dateOfBirth || ""} readOnly className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Contact Number</label>
                      <Input value={selectedApplication.contactNumber || ""} readOnly className="bg-gray-50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input value={selectedApplication.email} readOnly className="bg-gray-50" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Interest</label>
                      <Input value={selectedApplication.interest || ""} readOnly className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <Input value={selectedApplication.role || ""} readOnly className="bg-gray-50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Gender</label>
                      <Input value={selectedApplication.gender || ""} readOnly className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Region</label>
                      <Input value={selectedApplication.region || ""} readOnly className="bg-gray-50" />
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
                      <Input value={selectedApplication.createdDate || ""} readOnly className="bg-gray-50" />
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
                        value={selectedApplication.questions?.question1 || ""} 
                        readOnly 
                        className="bg-gray-50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Answer</label>
                      <textarea 
                        value={selectedApplication.questions?.answer1 || ""} 
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
                        value={selectedApplication.questions?.question2 || ""} 
                        readOnly 
                        className="bg-gray-50" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Answer</label>
                      <textarea 
                        value={selectedApplication.questions?.answer2 || ""} 
                        readOnly 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md resize-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700">Attached Files</label>
                    <div className="space-y-2">
                      {selectedApplication.attachedFiles?.map((file, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md">
                          <FileTextIcon className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-gray-700">{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => setDetailPage(1)}
                    >
                      {'<'} Previous
                    </Button>
                    <div className="space-x-2">
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          setConfirmAction({
                            type: "accept",
                            applicationId: selectedApplication.id,
                            applicantName: `${selectedApplication.firstName} ${selectedApplication.lastName}`,
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
                            applicationId: selectedApplication.id,
                            applicantName: `${selectedApplication.firstName} ${selectedApplication.lastName}`,
                          })
                          setShowConfirmDialog(true)
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
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
                <div className="relative w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search applications..."
                    className="pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="pending" className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Pending Applicants ({filteredPendingApplications.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Past Applicants ({filteredPastApplications.length})
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
                    {filteredPendingApplications.map((application) => (
                      <TableRow key={application.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium text-gray-900">{application.id}</TableCell>
                        <TableCell className="text-gray-900">{application.firstName}</TableCell>
                        <TableCell className="text-gray-900">{application.lastName}</TableCell>
                        <TableCell className="text-gray-600">{application.email}</TableCell>
                        <TableCell className="text-gray-600">{application.dateSubmitted}</TableCell>
                        <TableCell className="text-gray-600">{application.filesSubmitted}</TableCell>
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
                                  applicationId: application.id,
                                  applicantName: `${application.firstName} ${application.lastName}`,
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
                                  applicationId: application.id,
                                  applicantName: `${application.firstName} ${application.lastName}`,
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
                    ))}
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
                    {filteredPastApplications.map((application) => (
                      <TableRow key={application.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium text-gray-900">{application.id}</TableCell>
                        <TableCell className="text-gray-900">{application.firstName}</TableCell>
                        <TableCell className="text-gray-900">{application.lastName}</TableCell>
                        <TableCell className="text-gray-600">{application.email}</TableCell>
                        <TableCell className="text-gray-600">{application.dateSubmitted}</TableCell>
                        <TableCell className="text-gray-600">{application.filesSubmitted}</TableCell>
                        <TableCell>{getStatusBadge(application.status!)}</TableCell>
                        <TableCell className="text-gray-600">{application.dateProcessed}</TableCell>
                        <TableCell className="text-gray-600">{application.adminId}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing 1 to {entries} of{" "}
              {activeTab === "pending" ? filteredPendingApplications.length : filteredPastApplications.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 w-8 h-8">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
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
    </AdminLayout>
  )
}