"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, ArrowLeft, Loader2, AlertCircle, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

interface FAQ {
  faq_id: number
  question: string
  answer: string
  user_id: number
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const toggleMobileMenu = (): void => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Fetch FAQs from the public endpoint (no authentication required)
  const fetchFAQs = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/api/faqs/public`, {
        method: 'GET',
        headers: {
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

  // Load FAQs on component mount
  useEffect(() => {
    fetchFAQs()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Made responsive */}
      <nav className="bg-green-600 px-4 py-4 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white text-xl font-bold">
            ROCKLAND
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white hover:text-green-100">
              Home
            </Link>
            <Link href="/features" className="text-white hover:text-green-100">
              Feature
            </Link>
            <Link href="/pricing" className="text-white hover:text-green-100">
              Pricing
            </Link>
            <Link href="/faq" className="text-white hover:text-green-100 font-semibold">
              FAQ
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-white p-2"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Register Button */}
          <Link href="/registration" className="hidden md:block">
            <Button className="bg-white hover:bg-gray-100 text-green-600 font-semibold px-6 py-2 rounded-full border border-white hover:border-gray-200 transition-all duration-200">
              Register
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-green-600 border-t border-green-500 z-50">
            <div className="px-4 py-2 space-y-2">
              <Link href="/" className="block text-white hover:text-green-100 py-2">
                Home
              </Link>
              <Link href="/features" className="block text-white hover:text-green-100 py-2">
                Feature
              </Link>
              <Link href="/pricing" className="block text-white hover:text-green-100 py-2">
                Pricing
              </Link>
              <Link href="/faq" className="block text-white hover:text-green-100 font-semibold py-2">
                FAQ
              </Link>
              <Link href="/registration" className="block py-2">
                <Button className="w-full bg-white hover:bg-gray-100 text-green-600 font-semibold px-6 py-2 rounded-full">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Header Section - Made responsive */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link href="/" className="inline-flex items-center text-white hover:text-green-100 mb-4 sm:mb-6 text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto">
            Find answers to common questions about Rockland and rock identification
          </p>
        </div>
      </section>

      {/* FAQ Content - Made responsive */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600 text-sm sm:text-base">Loading FAQs...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center px-4">
                <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
                <Button 
                  onClick={fetchFAQs} 
                  className="bg-green-600 hover:bg-green-700 text-sm sm:text-base px-4 sm:px-6"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* FAQ List - Made responsive */}
          {!loading && !error && (
            <div className="space-y-3 sm:space-y-4">
              {faqs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-sm sm:text-base">No FAQs available at the moment.</p>
                </div>
              ) : (
                faqs.map((item, index) => (
                  <Card key={item.faq_id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleItem(index)}
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        aria-expanded={openItems.includes(index)}
                        aria-controls={`faq-answer-${item.faq_id}`}
                      >
                        <span className="font-semibold text-gray-800 pr-3 sm:pr-4 text-sm sm:text-base leading-relaxed">
                          {item.question}
                        </span>
                        {openItems.includes(index) ? (
                          <ChevronUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>

                      {openItems.includes(index) && (
                        <div 
                          id={`faq-answer-${item.faq_id}`}
                          className="px-4 sm:px-6 pb-3 sm:pb-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200"
                        >
                          <p className="text-gray-600 leading-relaxed pt-3 sm:pt-4 text-sm sm:text-base">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* FAQ Statistics - Optional enhancement */}
          {!loading && !error && faqs.length > 0 && (
            <div className="mt-8 sm:mt-12 text-center">
              <p className="text-gray-500 text-sm">
                Showing {faqs.length} frequently asked question{faqs.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Made responsive */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Ready to start exploring?</h2>
          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base max-w-2xl mx-auto">
            Download Rockland today and begin your rock identification journey
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link href="/registration" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 text-sm sm:text-base">
                Get Started Free
              </Button>
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-green-600 text-green-600 hover:bg-green-50 px-6 sm:px-8 py-3 text-sm sm:text-base"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer - Made responsive */}
      <footer className="bg-green-600 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-sm text-center sm:text-left">
              <div className="mb-4 font-medium">2025 Rockland FYP-S2-G19</div>
              <div className="mt-4">
                <a href="/login" className="text-emerald-200 hover:text-white text-xs transition-colors">
                  Admin Login
                </a>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-green-500 text-center">
            <p className="text-emerald-200 text-xs sm:text-sm">
              © 2025 Rockland. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}