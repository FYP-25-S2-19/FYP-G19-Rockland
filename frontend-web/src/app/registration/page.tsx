"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, X, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

export default function RegistrationPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [interests, setInterests] = useState(["Volcanic Rock", "Fossils", "Mineral & Crystal"])
  const availableInterests = [
    "Volcanic Rock",
    "Fossils", 
    "Mineral & Crystal",
    "Gemstones",
    "Sedimentary Rock",
    "Igneous Rock",
    "Metamorphic Rock",
    "Paleontology",
    "Geology",
    "Mining",
    "Rock Collecting",
    "Crystal Healing"
  ]
  const [formData, setFormData] = useState({
    firstName: "Lois",
    lastName: "Becket",
    email: "loisbecket@gmail.com",
    password: "•••••••",
    confirmPassword: "•••••••",
    dateOfBirth: "18/03/2024",
    region: "Singapore",
    gender: "Female",
    plan: "Free Plan",
  })

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest))
    } else {
      setInterests([...interests, interest])
    }
  }

  const handleNext = () => {
    setStep(2)
  }

  const handleBack = () => {
    if (step === 1) {
      router.push("/")
    } else {
      setStep(1)
    }
  }

  const handleCreateAccount = () => {
    // Handle account creation
    console.log("Creating account with:", formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 to-emerald-600 flex">
      {/* Left Side - Illustration */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-6 left-6 text-white hover:bg-white/20"
          onClick={handleBack}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-bold mb-2">ROCKLAND</h1>
        </div>

        <div className="relative mb-8">
          <Image
            src="/1.png"
            alt="Rockland Registration Illustration"
            width={288}
            height={288}
            className="w-72 h-72 object-contain"
            priority
          />
        </div>

        <h2 className="text-white text-4xl font-bold">REGISTRATION</h2>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
          {step === 1 ? (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Step 1: Account Setup</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm text-gray-600">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm text-gray-600">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm text-gray-600">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm text-gray-600">
                    Create Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm text-gray-600">
                    Confirm Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="w-full mt-8 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium"
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Step 2: Profiling</h3>
                <p className="text-sm text-gray-500 mt-1">Tell us about your self!</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm text-gray-600">
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="region" className="text-sm text-gray-600">
                    Region
                  </Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => setFormData({ ...formData, region: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Singapore">Singapore</SelectItem>
                      <SelectItem value="Malaysia">Malaysia</SelectItem>
                      <SelectItem value="Thailand">Thailand</SelectItem>
                      <SelectItem value="Indonesia">Indonesia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Interests</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {availableInterests.map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`interest-${interest}`}
                          checked={interests.includes(interest)}
                          onChange={() => toggleInterest(interest)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <Label htmlFor={`interest-${interest}`} className="text-sm cursor-pointer">
                          {interest}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">What's your gender?</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="female"
                        name="gender"
                        value="Female"
                        checked={formData.gender === "Female"}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                      />
                      <Label htmlFor="female" className="text-sm cursor-pointer">
                        Female
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="male"
                        name="gender"
                        value="Male"
                        checked={formData.gender === "Male"}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                      />
                      <Label htmlFor="male" className="text-sm cursor-pointer">
                        Male
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="rather-not-say"
                        name="gender"
                        value="Rather not say"
                        checked={formData.gender === "Rather not say"}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                      />
                      <Label htmlFor="rather-not-say" className="text-sm cursor-pointer">
                        Rather not say
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Select Plan</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="free-plan"
                        name="plan"
                        value="Free Plan"
                        checked={formData.plan === "Free Plan"}
                        onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                        className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                      />
                      <Label htmlFor="free-plan" className="text-sm cursor-pointer">
                        Free Plan
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="premium-plan"
                        name="plan"
                        value="Premium Plan"
                        checked={formData.plan === "Premium Plan"}
                        onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                        className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                      />
                      <Label htmlFor="premium-plan" className="text-sm cursor-pointer">
                        Premium Plan
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateAccount}
                className="w-full mt-8 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium"
              >
                Create Account
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}