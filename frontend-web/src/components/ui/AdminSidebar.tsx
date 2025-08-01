"use client"

import { 
  Home, 
  Users, 
  UserCheck, 
  UserCog, 
  User, 
  MessageSquare, 
  FileText, 
  HelpCircle, 
  LogOut,
  Mountain, // Added for rock management icon
  MapPin // Added for zone management icon
} from 'lucide-react'

interface SidebarProps {
  activeItem?: string
  onNavigate?: (item: string) => void
}

interface NavigationItem {
  id: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  href?: string
}

const navigationItems: NavigationItem[] = [
  { id: "home", icon: Home, label: "Home", href: "/admin" },
  { id: "applications", icon: Users, label: "Applications", href: "/admin/applications" },
  { id: "user-account", icon: UserCheck, label: "User Account", href: "/admin/user-account" },
  { id: "user-type", icon: UserCog, label: "User Type", href: "/admin/user-type" },
  { id: "user-profiling", icon: User, label: "User Profiling", href: "/admin/user-profiling" },
  { id: "forum", icon: MessageSquare, label: "Forum", href: "/admin/forum" },
  { id: "landing-page", icon: FileText, label: "Landing Page", href: "/admin/landing-page" },
  { id: "rock-management", icon: Mountain, label: "Rock Management", href: "/admin/rock-management" },
  { id: "zone-management", icon: MapPin, label: "Zone Management", href: "/admin/zone-management" }, // Added zone management
  { id: "faq-page", icon: HelpCircle, label: "FAQ Page", href: "/admin/faq" },
  { id: "my-profile", icon: User, label: "My Profile", href: "/admin/profile" },
]

export default function AdminSidebar({ activeItem = "", onNavigate }: SidebarProps) {
  const handleItemClick = (item: NavigationItem) => {
    if (onNavigate) {
      onNavigate(item.id)
    } else if (item.href) {
      // If using Next.js router, you can import and use it here
      // router.push(item.href)
      window.location.href = item.href
    }
  }

  const handleLogout = () => {
    // Add logout logic here
    if (onNavigate) {
      onNavigate("logout")
    } else {
      // Default logout behavior
      window.location.href = "/login"
    }
  }

  return (
    <div className="w-64 bg-green-600 text-white flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-green-500">
        <h1 className="text-xl font-bold tracking-wide">ROCKLAND</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navigationItems.map((item) => {
          const IconComponent = item.icon
          const isActive = activeItem === item.id
          
          return (
            <div
              key={item.id}
              className={`flex items-center px-6 py-3 text-sm cursor-pointer transition-all duration-200 ${
                isActive 
                  ? "bg-green-500 border-r-4 border-white" 
                  : "hover:bg-green-500 hover:translate-x-1"
              }`}
              onClick={() => handleItemClick(item)}
            >
              <IconComponent className="w-5 h-5 mr-3" />
              {item.label}
            </div>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-green-500">
        <div 
          className="flex items-center px-2 py-3 text-sm hover:bg-green-500 cursor-pointer rounded transition-colors duration-200"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Log Out
        </div>
      </div>
    </div>
  )
}