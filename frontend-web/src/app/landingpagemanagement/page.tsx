"use client"

import { useState } from "react"
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
} from "lucide-react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"

interface VideoPost {
  id: string
  title: string
  fileAttached: string
  date: string
  userId: string
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
  id: string
  title: string
  fileAttached: string
  date: string
  userId: string
}

type ContentType = "Video" | "Subscription Plan" | "Testimonials"

export default function LandingPageManagement() {
  const router = useRouter()
  const [contentType, setContentType] = useState<ContentType>("Video")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete"
    itemId: string
    itemTitle: string
    contentType: ContentType
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Sample data
  const videoPosts: VideoPost[] = [
    {
      id: "1",
      title: "Announcement",
      fileAttached: "Announcement.mp4",
      date: "19/10/2025",
      userId: "7894",
    },
  ]

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

  const testimonials: Testimonial[] = [
    {
      id: "1",
      title: "Learned a lot!",
      fileAttached: "testimonials_kim.jpg",
      date: "19/10/2025",
      userId: "7894",
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
        router.push('/login')
        break
      default:
        console.log("Unknown navigation item:", item)
    }
  }

  const handleDelete = async (itemId: string, contentType: ContentType) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setShowConfirmDialog(false)
    setConfirmAction(null)
    // Here you would delete the item from the data
  }

  const handleAdd = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setShowAddDialog(false)
    // Here you would add the new item
  }

  const getCurrentData = () => {
    switch (contentType) {
      case "Video":
        return videoPosts
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
      case "Subscription Plan":
        return "Add Subscription Plan"
      case "Testimonials":
        return "Add Testimonials"
      default:
        return "Add New"
    }
  }

  const renderTableHeaders = () => {
    switch (contentType) {
      case "Video":
        return (
          <>
            <TableHead className="font-semibold">Video ID</TableHead>
            <TableHead className="font-semibold">Video Title</TableHead>
            <TableHead className="font-semibold">File attached</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
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
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="font-semibold">File attached</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">UserID (Admin)</TableHead>
            <TableHead className="font-semibold text-center">Action</TableHead>
          </>
        )
    }
  }

  const renderTableRows = () => {
    const data = getCurrentData()

    return data.map((item) => (
      <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
        <TableCell className="font-medium text-gray-900">{item.id}</TableCell>
        {contentType === "Video" && (
          <>
            <TableCell className="font-medium text-gray-900">{(item as VideoPost).title}</TableCell>
            <TableCell className="text-gray-600">{(item as VideoPost).fileAttached}</TableCell>
            <TableCell className="text-gray-600">{(item as VideoPost).date}</TableCell>
            <TableCell className="text-gray-600">{(item as VideoPost).userId}</TableCell>
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
        {contentType === "Testimonials" && (
          <>
            <TableCell className="font-medium text-gray-900">{(item as Testimonial).title}</TableCell>
            <TableCell className="text-gray-600">{(item as Testimonial).fileAttached}</TableCell>
            <TableCell className="text-gray-600">{(item as Testimonial).date}</TableCell>
            <TableCell className="text-gray-600">{(item as Testimonial).userId}</TableCell>
          </>
        )}
        <TableCell className="text-center">
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white h-8 px-4"
            onClick={() => {
              setConfirmAction({
                type: "delete",
                itemId: item.id,
                itemTitle:
                  contentType === "Video"
                    ? (item as VideoPost).title
                    : contentType === "Subscription Plan"
                      ? (item as SubscriptionPlan).name
                      : (item as Testimonial).title,
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
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center -mt-2 ml-12">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Video name:</label>
                  <Input placeholder="Announcement" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date:</label>
                  <Input placeholder="6/3/2025" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description:</label>
                <Textarea placeholder="Walkthrough of the app" rows={3} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Remarks:</label>
                <Input placeholder="" />
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
              <h3 className="text-xl font-bold text-gray-900 mb-4">Testimonials</h3>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">Attach Photo</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center -mt-2 ml-12">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name:</label>
                  <Input placeholder="Kieron" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date:</label>
                  <Input placeholder="6/3/2025" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description:</label>
                <Textarea placeholder="Subscription Plan Comparison" rows={3} />
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
                  <SelectItem value="Subscription Plan">Subscription Plan</SelectItem>
                  <SelectItem value="Testimonials">Testimonials</SelectItem>
                </SelectContent>
              </Select>
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
              {contentType === "Subscription Plan" && "Landing Page Management > New Subscription Plan"}
              {contentType === "Testimonials" && "Landing Page Management > New Testimonials"}
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
              {contentType === "Subscription Plan" && "Post New Subscription"}
              {contentType === "Testimonials" && "Post New Testimonials"}
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
    </AdminLayout>
  )
}