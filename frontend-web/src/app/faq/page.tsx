"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react"
import { useState } from "react"

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const faqData = [
    {
      question: "How do I scan a rock?",
      answer:
        "To scan a rock with Rockland, simply open the app and tap the 'Scan' button at the bottom of the screen. Point your camera at the rock you want to identify, making sure it's well-lit and clearly visible. The AI will automatically analyze the rock's features including color, texture, crystal structure, and mineral composition to provide you with detailed information about the rock type.",
    },
    {
      question: "How do I save a rock scan?",
      answer:
        "After scanning a rock, you'll see a 'Save' button on the results screen. Tap it to add the rock to your personal collection. You can also add notes, location data, and photos. All saved rocks are stored in your profile under 'My Collection' where you can view them anytime, even offline.",
    },
    {
      question: "How do I upgrade my account?",
      answer:
        "To upgrade to Premium, go to Settings > Subscription in the app, or visit our website and click 'Subscribe Now' on the pricing page. Premium gives you unlimited scans, advanced AI identification, detailed geological information, and access to exclusive educational content. You can pay monthly ($5/mo) or annually for a discount.",
    },
    {
      question: "How do I earn points?",
      answer:
        "You earn points in Rockland by: completing daily quizzes (10 points), scanning new rock types (5 points), sharing discoveries with the community (3 points), and completing educational modules (15 points). Points unlock achievements, badges, and can be used to access premium content temporarily.",
    },
    {
      question: "How many free scans do I get?",
      answer:
        "With the Basic (free) account, you get 5 rock scans per day. This limit resets every 24 hours at midnight. Premium subscribers get unlimited scans. If you run out of daily scans, you can either wait for the reset or upgrade to Premium for unlimited access.",
    },
    {
      question: "What if no rock information is found?",
      answer:
        "If our AI can't identify your rock, try these steps: 1) Ensure good lighting and clear focus, 2) Clean the rock surface, 3) Try scanning from different angles, 4) Check if it's actually a rock (not concrete, brick, etc.). You can also submit the image to our community experts who will help identify it within 24 hours.",
    },
    {
      question: "Can I use Rockland offline?",
      answer:
        "Yes! Rockland works offline for basic rock identification using our downloaded database. However, you'll need an internet connection for: advanced AI features, community interactions, syncing your collection, and accessing the latest rock database updates.",
    },
    {
      question: "Is Rockland suitable for beginners?",
      answer:
        "Rockland is designed for all skill levels. We have beginner-friendly content including: basic geology tutorials, simple identification guides, glossary of terms, and step-by-step learning paths. The app adapts to your knowledge level and provides appropriate content.",
    },
    {
      question: "How accurate is the rock identification?",
      answer:
        "Our AI has a 95% accuracy rate for common rocks and minerals. Accuracy depends on image quality, lighting, and rock condition. For rare or complex specimens, we recommend consulting with our community experts or using multiple identification methods.",
    },
    {
      question: "Can I contribute to the Rockland database?",
      answer:
        "Yes! Premium users can submit verified rock samples to help improve our database. Your contributions are reviewed by geologists and, if approved, added to help other users. Contributors receive special badges and recognition in the community.",
    },
    {
      question: "What educational content is available?",
      answer:
        "Rockland offers: interactive geology courses, rock formation videos, mineral property guides, field trip suggestions, virtual museum tours, and expert-led webinars. Premium users get access to advanced courses and exclusive content from professional geologists.",
    },
    {
      question: "How do I contact support?",
      answer:
        "You can reach our support team through: the in-app help center, email at support@rocklandapp.com, or our website contact form. Premium users get priority support with response times under 4 hours. We also have an active community forum for peer support.",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-green-600 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white text-xl font-bold">
            ROCKLAND
          </Link>
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
          <Link href="/registration">
            <Button className="bg-white hover:bg-gray-100 text-green-600 font-semibold px-6 py-2 rounded-full border border-white hover:border-gray-200 transition-all duration-200">
              Register
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link href="/" className="inline-flex items-center text-white hover:text-green-100 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-emerald-100">
            Find answers to common questions about Rockland and rock identification
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 pr-4">{item.question}</span>
                    {openItems.includes(index) ? (
                      <ChevronUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {openItems.includes(index) && (
                    <div className="px-6 pb-4 border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed pt-4">{item.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to start exploring?</h2>
          <p className="text-gray-600 mb-8">Download Rockland today and begin your rock identification journey</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registration">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">Get Started Free</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-sm">
              <div className="mb-4">2025 Rockland FYP-S2-G19</div>
              <div className="space-x-4">
                <span>Privacy & Policy</span>
                <span>Terms & Conditions</span>
              </div>
              <div className="mt-4">
                <a href="/login" className="text-emerald-200 hover:text-white text-xs">
                  Admin Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}