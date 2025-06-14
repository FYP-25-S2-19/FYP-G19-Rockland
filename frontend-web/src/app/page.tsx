import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Play, Plus, Heart } from "lucide-react"

export default function RocklandLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-green-600 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-white text-xl font-bold">ROCKLAND</div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-white hover:text-green-100">
              Home
            </a>
            <a href="#" className="text-white hover:text-green-100">
              Feature
            </a>
            <a href="#" className="text-white hover:text-green-100">
              Pricing
            </a>
            <a href="#" className="text-white hover:text-green-100">
              FAQ
            </a>
          </div>
          <Button className="bg-gray-800 hover:bg-gray-700 text-white">Register</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="text-sm mb-4">#1 Rock Learning Platform</div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">Explore the World of Rocks</h1>
              <p className="text-lg mb-8 text-emerald-100">
                Rockland helps you explore and learn about rocks interactively using AI, maps, and gamification.
              </p>
              <Button className="bg-gray-800 hover:bg-gray-700 text-white mb-8">Register Now!</Button>

              <div className="space-y-4">
                <div className="text-sm font-medium">DOWNLOAD OUR APP</div>
                <div className="flex space-x-4">
                  <Image
                    src="/placeholder.svg?height=40&width=120"
                    alt="Download on App Store"
                    width={120}
                    height={40}
                    className="rounded"
                  />
                  <Image
                    src="/placeholder.svg?height=40&width=120"
                    alt="Get it on Google Play"
                    width={120}
                    height={40}
                    className="rounded"
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-center space-x-4">
                <div className="bg-white rounded-3xl p-2 shadow-2xl transform rotate-12">
                  <div className="w-48 h-96 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <div className="text-gray-400">Phone Mockup</div>
                  </div>
                </div>
                <div className="bg-white rounded-3xl p-2 shadow-2xl transform -rotate-6">
                  <div className="w-48 h-96 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <div className="text-gray-400">Phone Mockup</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white rounded-t-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative flex justify-center">
              {/* Main phone mockup */}
              <div className="bg-gray-900 rounded-[3rem] p-2 shadow-2xl relative z-10">
                <div className="bg-white rounded-[2.5rem] p-1">
                  <div className="w-[300px] h-[600px] bg-white rounded-[2.5rem] relative overflow-hidden">
                    {/* Phone notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl flex items-center justify-center">
                      <div className="w-20 h-1 bg-gray-700 rounded-full"></div>
                    </div>
                    
                    {/* Status bar */}
                    <div className="flex justify-between items-center px-6 pt-10 pb-2">
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-3 bg-gray-900 rounded-full"></div>
                        <div className="w-1 h-4 bg-gray-900 rounded-full"></div>
                        <div className="w-1 h-5 bg-gray-900 rounded-full"></div>
                        <div className="w-1 h-4 bg-gray-900 rounded-full"></div>
                      </div>
                      <div className="text-xs font-medium">ROCKLAND</div>
                    </div>

                    {/* App content */}
                    <div className="px-4 pt-2">
                      <div className="text-xs text-gray-500 mb-4 text-center">#1 Rock Learning Platform</div>

                      {/* Search bar */}
                      <div className="bg-gray-100 rounded-full px-4 py-3 mb-4 flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-sm text-gray-400">Search</span>
                      </div>

                      {/* Promotional cards */}
                      <div className="space-y-2 mb-4">
                        <div className="bg-gray-600 text-white rounded-xl px-4 py-3 text-sm text-center">
                          Upgrade to Premium
                        </div>
                        <div className="bg-gray-600 text-white rounded-xl px-4 py-3 text-sm text-center">
                          50% Off. Tap to claim.
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3 mb-6">
                        <button className="flex-1 bg-gray-600 text-white rounded-xl py-3 text-sm font-medium">
                          Take Quiz
                        </button>
                        <button className="flex-1 bg-gray-200 text-gray-700 rounded-xl py-3 text-sm font-medium">
                          Leaderboard
                        </button>
                      </div>

                      {/* Popular section */}
                      <div className="mb-2">
                        <h3 className="text-sm font-semibold mb-1">Popular on Rockland</h3>
                        <p className="text-xs text-gray-500">Articles</p>
                      </div>

                      {/* Article grid */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-gray-200 rounded-lg h-20"></div>
                        <div className="bg-gray-200 rounded-lg h-20"></div>
                        <div className="bg-gray-200 rounded-lg h-20"></div>
                        <div className="bg-gray-200 rounded-lg h-20"></div>
                      </div>
                    </div>

                    {/* Bottom navigation */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100">
                      <div className="flex justify-around py-2">
                        <button className="p-2">
                          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                          </svg>
                          <span className="text-xs">Home</span>
                        </button>
                        <button className="p-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-xs text-gray-400">Feed</span>
                        </button>
                        <button className="p-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="text-xs text-gray-400">Scan</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature callouts positioned around the phone */}
              {/* Rock Identifier - top left */}
              <div className="absolute top-10 -left-32 bg-white rounded-2xl px-6 py-3 shadow-lg border border-gray-200 z-20">
                <div className="text-sm font-semibold">1. Rock Identifier</div>
              </div>

              {/* Interactive Map - top right */}
              <div className="absolute top-10 -right-32 bg-emerald-500 text-white rounded-2xl px-6 py-3 shadow-lg z-20">
                <div className="text-sm font-semibold">2. Interactive Map</div>
              </div>

              {/* Daily Quiz - bottom left */}
              <div className="absolute bottom-20 -left-32 bg-emerald-500 text-white rounded-2xl px-6 py-3 shadow-lg z-20">
                <div className="text-sm font-semibold">3. Daily Quiz</div>
              </div>

              {/* Social - bottom right */}
              <div className="absolute bottom-20 -right-32 bg-white rounded-2xl px-6 py-3 shadow-lg border border-gray-200 z-20">
                <div className="text-sm font-semibold">4. Social</div>
              </div>
            </div>

            <div className="text-center lg:text-right">
              <h2 className="text-5xl lg:text-6xl font-bold">
                Rockland
              </h2>
              <h3 className="text-4xl lg:text-5xl font-bold mt-2">
                Special Features
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* App Demo Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">App Demo</h2>
          <p className="text-gray-600 mb-8">Lets see virtually how its work</p>

          <div className="bg-gray-200 rounded-2xl aspect-video flex items-center justify-center">
            <Button size="lg" className="rounded-full w-16 h-16 bg-gray-600 hover:bg-gray-700">
              <Play className="w-6 h-6 text-white" />
            </Button>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-16 bg-emerald-500">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Our Articles</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="overflow-hidden">
              <div className="relative">
                <Image
                  src="/placeholder.svg?height=200&width=300"
                  alt="Rock types"
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <Badge className="absolute top-4 right-4 bg-emerald-500">Free</Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <div className="text-sm font-medium">Song Kim</div>
                    <div className="text-xs text-gray-500">1 day ago</div>
                  </div>
                </div>
                <h3 className="font-bold mb-2">What are the type of geologics rocks?</h3>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                  Beginner
                </Badge>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">1.5k</div>
                  <Heart className="w-4 h-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-100">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gray-300 rounded mx-auto mb-4"></div>
                <h3 className="font-bold mb-2">Lorem Ipsum</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Lorem ipsum dolor sit amet consectetur adipiscing elit ipsum dolor sit amet.
                </p>
                <Button className="bg-gray-800 hover:bg-gray-700 text-white rounded-full">Label</Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-100">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gray-300 rounded mx-auto mb-4"></div>
                <h3 className="font-bold mb-2">Lorem Ipsum</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Lorem ipsum dolor sit amet consectetur adipiscing elit ipsum dolor sit amet.
                </p>
                <Button className="bg-gray-800 hover:bg-gray-700 text-white rounded-full">Label</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Subscription Plan</h2>
          <p className="text-gray-600 mb-12">
            With lots of unique blocks, you can easily build a<br />
            page easily without any coding.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Card className="p-8">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500 mb-4">BASIC</div>
                <div className="text-5xl font-bold mb-1">
                  $<span>0</span>
                </div>
                <div className="text-gray-500 mb-8">/ mo</div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-500 mr-3" />
                    <span className="text-sm">Unlimited Team Members</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-500 mr-3" />
                    <span className="text-sm">Unlimited Team Members</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-500 mr-3" />
                    <span className="text-sm">Unlimited Team Members</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-500 mr-3" />
                    <span className="text-sm">Unlimited Team Members</span>
                  </div>
                </div>

                <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white">Register Free Now!</Button>
              </div>
            </Card>

            <Card className="p-8">
              <div className="text-center">
                <div className="text-sm font-medium text-emerald-500 mb-4">PREMIUM</div>
                <div className="text-5xl font-bold mb-1">
                  $<span>5</span>
                </div>
                <div className="text-gray-500 mb-8">/ mo</div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-500 mr-3" />
                    <span className="text-sm">Unlimited Team Members</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-500 mr-3" />
                    <span className="text-sm">Unlimited Team Members</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-500 mr-3" />
                    <span className="text-sm">Unlimited Team Members</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="w-5 h-5 text-emerald-500 mr-3" />
                    <span className="text-sm">Unlimited Team Members</span>
                  </div>
                </div>

                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">Subscribe Now!</Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">Download Rockland and Start Exploring Now!</h2>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="w-48 h-48 bg-black flex items-center justify-center">
                  <div className="text-white text-xs">QR Code</div>
                </div>
                <p className="text-sm text-gray-600 mt-4">Scan the QR code</p>
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-center space-x-4">
                <div className="bg-white rounded-3xl p-2 shadow-2xl">
                  <div className="w-48 h-96 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <div className="text-gray-400">Phone Mockup</div>
                  </div>
                </div>
                <div className="bg-white rounded-3xl p-2 shadow-2xl">
                  <div className="w-48 h-96 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <div className="text-gray-400">Phone Mockup</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4 mt-8">
                <Image
                  src="/placeholder.svg?height=40&width=120"
                  alt="Download on App Store"
                  width={120}
                  height={40}
                  className="rounded"
                />
                <Image
                  src="/placeholder.svg?height=40&width=120"
                  alt="Get it on Google Play"
                  width={120}
                  height={40}
                  className="rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold mb-8">
                Frequently
                <br />
                asked
                <br />
                questions
              </h2>
            </div>

            <div className="space-y-4">
              {[
                "How do I scan a rock?",
                "How do I save a rock scan?",
                "How do I upgrade my account?",
                "How do I earn points?",
                "How many free scans do I get?",
                "What if no rock information is found?",
              ].map((question, index) => (
                <div key={index} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{question}</span>
                    <Plus className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* ... existing footer content ... */}
            
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