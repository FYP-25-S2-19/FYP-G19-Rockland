"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Eye,
  Trash2,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/ui/AdminLayout"

interface Article {
  article_id: number
  title: string
  content: string
  photo?: string           // Cloud storage path (articles/20250711_123456_photo.jpg)
  photo_url?: string       // Public cloud URL (https://storage.googleapis.com/...)
  signed_photo_url?: string // Signed URL for secure access
  date_created: string
  is_free: boolean
  categories_id: number
  category_title?: string
  user_id: number
  author_name?: string
  author_email?: string
  total_likes: number
}

interface Discussion {
  id: string
  title: string
  content: string
  date: string
  userId: string
  userType: "Expert" | "Premium" | "Free"
  likeCount: number
  dislikeCount: number
  category: string
  author: string
  comments: Comment[]
  image?: string
}

interface Comment {
  id: string
  author: string
  content: string
  date: string
  likeCount: number
  dislikeCount: number
}

type ViewMode = "list" | "detail"
type ForumType = "Articles" | "Discussion"

export default function ForumManagement() {
  const router = useRouter()
  const [forumType, setForumType] = useState<ForumType>("Articles")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedItem, setSelectedItem] = useState<Article | Discussion | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete"
    itemId: string
    itemTitle: string
    itemType: "article" | "discussion"
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [error, setError] = useState("")

  // Sample discussions data (kept for now)
  const discussions: Discussion[] = [
    {
      id: "1",
      title: "Rocks found in",
      content:
        "I found a... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin porta nulla ac tincidunt bibendum. Donec ac faucibus mauris.",
      date: "19/10/2025",
      userId: "1029",
      userType: "Premium",
      likeCount: 1500,
      dislikeCount: 164,
      category: "Sodium Rocks",
      author: "Jason",
      image: "/placeholder.svg?height=200&width=300",
      comments: [
        {
          id: "1",
          author: "Mason",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin porta nulla ac tincidunt bibendum. Donec ac faucibus mauris.",
          date: "19/10/2025",
          likeCount: 45,
          dislikeCount: 3,
        },
      ],
    },
  ]

  // Helper function to get article image URL
  const getArticleImageUrl = (article: Article): string | null => {
    // Priority: signed_photo_url (fresh signed URL) > photo_url (old public URL) > fallback
    if (article.signed_photo_url) {
      console.log('✅ Using signed_photo_url:', article.signed_photo_url)
      return article.signed_photo_url
    }
    
    if (article.photo_url) {
      console.log('⚠️ Using legacy photo_url:', article.photo_url)
      return article.photo_url
    }
    
    if (article.photo) {
      // For old local files
      if (article.photo.startsWith('/')) {
        const localUrl = `http://localhost:5000${article.photo}`
        console.log('📁 Using local URL:', localUrl)
        return localUrl
      }
      
      console.log('❌ Photo path exists but no signed URL available:', article.photo)
    }
    
    console.log('📷 No image available for article:', article.article_id)
    return null
  }

  // Make bucket public function (for debugging)
  const makeBucketPublic = async () => {
    console.log('📝 To make your Google Cloud Storage bucket public, run these commands:')
    console.log('gsutil iam ch allUsers:objectViewer gs://rocklandapp')
    console.log('gsutil cors set cors.json gs://rocklandapp')
    console.log('Or set bucket permissions in Google Cloud Console')
  }

  // Fetch articles from API
  const fetchArticles = async () => {
    setIsLoadingData(true)
    setError("")
    
    try {
      // Get admin token from localStorage
      const adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      const response = await fetch('http://localhost:5000/api/articles/admin/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('Fetched articles:', data.articles)
        setArticles(data.articles)
      } else {
        setError(data.message || 'Failed to fetch articles')
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
      setError('Unable to connect to server')
    } finally {
      setIsLoadingData(false)
    }
  }

  // Delete article
  const deleteArticle = async (articleId: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken')
      
      if (!adminToken) {
        setError("Admin authentication required")
        return false
      }

      const response = await fetch(`http://localhost:5000/api/articles/delete/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Remove article from local state
        setArticles(prev => prev.filter(article => article.article_id.toString() !== articleId))
        return true
      } else {
        setError(data.message || 'Failed to delete article')
        return false
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      setError('Unable to connect to server')
      return false
    }
  }

  // Load articles on component mount
  useEffect(() => {
    if (forumType === "Articles") {
      fetchArticles()
    }
  }, [forumType])

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
        // Already on forum page
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
        localStorage.removeItem('adminToken')
        router.push('/login')
        break
      default:
        console.log("Unknown navigation item:", item)
    }
  }

  const currentData = forumType === "Articles" ? articles : discussions
  const filteredData = currentData

  const handleDelete = async (itemId: string, itemType: "article" | "discussion") => {
    setIsLoading(true)
    
    let success = false
    if (itemType === "article") {
      success = await deleteArticle(itemId)
    } else {
      // Handle discussion deletion when implemented
      await new Promise((resolve) => setTimeout(resolve, 1500))
      success = true
    }
    
    setIsLoading(false)
    if (success) {
      setShowConfirmDialog(false)
      setConfirmAction(null)
    }
  }

  const handleView = (item: Article | Discussion) => {
    setSelectedItem(item)
    setViewMode("detail")
  }

  const handleBackToList = () => {
    setViewMode("list")
    setSelectedItem(null)
  }

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "Expert":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "Premium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Free":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getArticleTypeColor = (isFree: boolean) => {
    return isFree 
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-orange-100 text-orange-700 border-orange-200"
  }

  // Helper function to handle forum type change with proper type checking
  const handleForumTypeChange = (value: string) => {
    if (value === "Articles" || value === "Discussion") {
      setForumType(value as ForumType)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Detail View
  if (viewMode === "detail" && selectedItem) {
    const isArticle = forumType === "Articles"
    const article = isArticle ? selectedItem as Article : null
    const discussion = !isArticle ? selectedItem as Discussion : null

    // Get the correct image URL for articles
    const articleImageUrl = article ? getArticleImageUrl(article) : null

    return (
      <AdminLayout
        activeMenuItem="forum"
        title="Hi, Admin 👋"
        subtitle="Forum content details"
        onNavigate={handleNavigation}
      >
        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToList}
                className="text-gray-600 hover:text-gray-800 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {forumType === "Articles" ? "Article" : "Discussion"} List
              </Button>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Forum &gt; View {forumType === "Articles" ? "Articles" : "Discussion"}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Image */}
              <div className="lg:col-span-1">
                <div className="bg-gray-100 rounded-lg overflow-hidden">
                  {articleImageUrl ? (
                    <div className="relative w-full h-80">
                      <Image
                        src={articleImageUrl}
                        alt={article?.title || 'Article image'}
                        width={400}
                        height={320}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          console.error('Image failed to load:', articleImageUrl)
                          // Hide the image on error
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                      {/* Debug info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                        <p className="truncate">
                          {articleImageUrl.includes('storage.googleapis.com') ? '☁️ Cloud' : '💻 Local'}: {articleImageUrl}
                        </p>
                      </div>
                    </div>
                  ) : discussion?.image ? (
                    <div className="relative w-full h-80">
                      <Image
                        src={discussion.image}
                        alt={discussion.title || 'Discussion image'}
                        width={400}
                        height={320}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-80 flex items-center justify-center bg-gray-200">
                      <div className="text-gray-400 text-center">
                        <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded flex items-center justify-center">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-sm">No image available</p>
                        {article && (
                          <p className="text-xs mt-1">
                            photo: {article.photo || 'null'}<br/>
                            photo_url: {article.photo_url || 'null'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Article metadata */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Likes:</span>
                    <div className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-1 text-blue-500" />
                      <span className="font-medium">{article ? article.total_likes : 0}</span>
                    </div>
                  </div>
                  
                  {article && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Type:</span>
                        <Badge className={`text-xs ${getArticleTypeColor(article.is_free)}`}>
                          {article.is_free ? 'Free' : 'Premium'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Category:</span>
                        <span className="text-sm font-medium">{article.category_title || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Author:</span>
                        <span className="text-sm font-medium">{article.author_name || 'Unknown'}</span>
                      </div>
                    </>
                  )}
                  
                  {discussion && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Dislike:</span>
                      <span className="font-medium">{discussion.dislikeCount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Category: {article ? article.category_title || 'N/A' : discussion?.category}
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {forumType === "Articles" ? "Article" : "Discussion"} Title: {selectedItem.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>
                    Posted By: {article ? article.author_name || 'Unknown Author' : discussion?.author}
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>
                    Date: {article ? formatDate(article.date_created) : discussion?.date}
                  </span>
                </div>

                <div>
                  <p className="text-gray-700 leading-relaxed break-words overflow-wrap-anywhere">
                    {selectedItem.content}
                  </p>
                </div>

                {/* Comments Section for Discussions */}
                {forumType === "Discussion" && discussion && discussion.comments.length > 0 && (
                  <div className="mt-8">
                    <Separator className="mb-6" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Comments</h4>
                    <div className="space-y-4">
                      {discussion.comments.map((comment) => (
                        <Card key={comment.id} className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">Comment by: {comment.author}</span>
                              <span className="text-sm text-gray-500">{comment.date}</span>
                            </div>
                            <p className="text-gray-700 mb-3">{comment.content}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                {comment.likeCount}
                              </div>
                              <div className="flex items-center">
                                <ThumbsDown className="w-4 h-4 mr-1" />
                                {comment.dislikeCount}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // List View
  return (
    <AdminLayout
      activeMenuItem="forum"
      title="Hi, Admin 👋"
      subtitle="Manage forum content and discussions"
      onNavigate={handleNavigation}
    >
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Forum</h2>
                <p className="text-gray-600 mt-1">Select Forum</p>
              </div>
              <Button
                onClick={() => forumType === "Articles" ? fetchArticles() : null}
                variant="outline"
                size="sm"
                disabled={isLoadingData}
              >
                {isLoadingData && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                Refresh
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Select value={forumType} onValueChange={handleForumTypeChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Articles">Articles</SelectItem>
                    <SelectItem value="Discussion">Discussion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {forumType === "Articles" ? "Article" : "Discussion"} List
              {forumType === "Articles" && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredData.length} articles)
                </span>
              )}
            </h3>

            {/* Loading State */}
            {isLoadingData ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                <span>Loading {forumType.toLowerCase()}...</span>
              </div>
            ) : (
              /* Table */
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      {forumType === "Articles" ? (
                        <>
                          <TableHead className="font-semibold">Article Title</TableHead>
                          <TableHead className="font-semibold">Content</TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Author</TableHead>
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold text-center">Like Count</TableHead>
                          <TableHead className="font-semibold text-center">Action</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead className="font-semibold">Discussion Title</TableHead>
                          <TableHead className="font-semibold">Content</TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Author</TableHead>
                          <TableHead className="font-semibold text-center">Action</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell 
                          colSpan={forumType === "Articles" ? 7 : 5} 
                          className="text-center py-8 text-gray-500"
                        >
                          No {forumType.toLowerCase()} found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((item) => {
                        if (forumType === "Articles") {
                          const article = item as Article
                          return (
                            <TableRow key={article.article_id} className="hover:bg-gray-50 transition-colors">
                              <TableCell className="font-medium text-gray-900 max-w-xs">
                                <p className="line-clamp-1">{article.title}</p>
                              </TableCell>
                              <TableCell className="text-gray-600 max-w-md">
                                <p className="line-clamp-2">{article.content}</p>
                              </TableCell>
                              <TableCell className="text-gray-600">{formatDate(article.date_created)}</TableCell>
                              <TableCell className="text-gray-600">
                                {article.author_name || 'Unknown Author'}
                              </TableCell>
                              <TableCell>
                                <Badge className={`text-xs ${getArticleTypeColor(article.is_free)}`}>
                                  {article.is_free ? 'Free' : 'Premium'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="font-medium">
                                  {article.total_likes}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center space-x-2">
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3"
                                    onClick={() => handleView(article)}
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
                                        itemId: article.article_id.toString(),
                                        itemTitle: article.title,
                                        itemType: "article",
                                      })
                                      setShowConfirmDialog(true)
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        } else {
                          const discussion = item as Discussion
                          return (
                            <TableRow key={discussion.id} className="hover:bg-gray-50 transition-colors">
                              <TableCell className="font-medium text-gray-900 max-w-xs">
                                <p className="line-clamp-1">{discussion.title}</p>
                              </TableCell>
                              <TableCell className="text-gray-600 max-w-md">
                                <p className="line-clamp-2">{discussion.content}</p>
                              </TableCell>
                              <TableCell className="text-gray-600">{discussion.date}</TableCell>
                              <TableCell className="text-gray-600">{discussion.author}</TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center space-x-2">
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3"
                                    onClick={() => handleView(discussion)}
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
                                        itemId: discussion.id,
                                        itemTitle: discussion.title,
                                        itemType: "discussion",
                                      })
                                      setShowConfirmDialog(true)
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        }
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {confirmAction?.itemType === "article" ? "Article" : "Discussion"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {confirmAction?.itemType}:{" "}
              <strong>"{confirmAction?.itemTitle}"</strong>? This action cannot be undone.
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
                  handleDelete(confirmAction.itemId, confirmAction.itemType)
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