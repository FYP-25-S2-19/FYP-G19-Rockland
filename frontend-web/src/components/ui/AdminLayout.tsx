"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import AdminSidebar from "@/components/ui/AdminSidebar"

interface AdminLayoutProps {
  children: React.ReactNode
  activeMenuItem: string
  title: string
  subtitle?: string
  onNavigate?: (item: string) => void
}

interface AdminInfo {
  name: string
  email: string
  initials: string
}

const adminInfo: AdminInfo = {
  name: "Admin",
  email: "admin@main.com",
  initials: "A"
}

export default function AdminLayout({ 
  children, 
  activeMenuItem, 
  title, 
  subtitle,
  onNavigate 
}: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar activeItem={activeMenuItem} onNavigate={onNavigate} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminInfo.name}</p>
                <p className="text-xs text-gray-500">{adminInfo.email}</p>
              </div>
              <Avatar className="ring-2 ring-green-100">
                <AvatarFallback className="bg-green-100 text-green-600 font-semibold">
                  {adminInfo.initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}