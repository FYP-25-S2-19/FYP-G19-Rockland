"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";

// Interface for Interest data
interface Interest {
  interest_id: number;
  title: string;
  description: string;
  categories_id: number;
  category_title: string;
}

export default function RegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  // State for dynamic interests from database
  const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
  const [interestsLoading, setInterestsLoading] = useState(true);
  const [interestsError, setInterestsError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    contactNumber: "",
    region: "Singapore",
    gender: "Rather not say",
    plan: "Free Plan",
  });

  // Fetch interests from database on component mount
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setInterestsLoading(true);
        setInterestsError("");

        const response = await fetch(
          "http://localhost:5000/api/interests/all",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setAvailableInterests(data.interests);
        } else {
          setInterestsError(data.error || "Failed to load interests");
        }
      } catch (error) {
        console.error("Error fetching interests:", error);
        setInterestsError("Unable to connect to server");
      } finally {
        setInterestsLoading(false);
      }
    };

    fetchInterests();
  }, []);

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      // Only allow selecting if less than 3 interests are selected
      if (interests.length < 3) {
        setInterests([...interests, interest]);
      }
    }
  };

  const validateStep1 = () => {
    setError("");

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Please enter your first and last name");
      return false;
    }

    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.push("/");
    } else {
      setStep(1);
    }
  };

  const handleCreateAccount = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Validate date format
      if (!formData.dateOfBirth) {
        setError("Please enter your date of birth");
        setIsLoading(false);
        return;
      }

      const dateParts = formData.dateOfBirth.split("/");
      let formattedDate = formData.dateOfBirth;
      if (dateParts.length === 3) {
        formattedDate = `${dateParts[2]}-${dateParts[1].padStart(
          2,
          "0"
        )}-${dateParts[0].padStart(2, "0")}`;
      }

      // ❗Always create as Free first (user_type_id: 2)
      const requestData = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        date_of_birth: formattedDate,
        contact_number: formData.contactNumber || null,
        gender: formData.gender === "Rather not say" ? null : formData.gender,
        region: formData.region,
        user_type_id: 2,
        interests: interests,
      };

      console.log("Sending registration request:", requestData);

      const response = await fetch(
        "http://localhost:5000/api/users/create_user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const data = await response.json();
      console.log("Registration response:", data);

      if (response.ok && data.success) {
        const userId = data.user_id || data.user?.user_id;
        if (!userId) {
          setError("Missing user ID after registration");
          setIsLoading(false);
          return;
        }

        // ✅ If user selected Premium Plan, redirect to Stripe
        if (formData.plan === "Premium Plan") {
          const stripeResponse = await fetch(
            "http://localhost:5000/api/create-checkout-session",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_id: userId,
                plan_id: 4, // Replace with your Premium plan_id
              }),
            }
          );

          const stripeData = await stripeResponse.json();
          console.log("Stripe session response:", stripeData);

          if (stripeResponse.ok && stripeData.url) {
            window.location.href = stripeData.url;
            return;
          } else {
            setError("Stripe checkout session failed.");
          }
        } else {
          // ✅ Free user — go to login
          alert("Account created successfully! Please login.");
          router.push("/login");
        }
      } else {
        const errorMessage = data.message || "Registration failed";
        if (response.status === 409) {
          setError("An account with this email already exists");
        } else if (response.status === 400) {
          if (errorMessage.includes("age")) {
            setError("You must be at least 13 years old to register");
          } else if (errorMessage.includes("date")) {
            setError("Please enter a valid date in DD/MM/YYYY format");
          } else {
            setError(errorMessage);
          }
        } else {
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        "Unable to connect to server. Please ensure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="w-72 h-72 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white text-9xl">🪨</span>
          </div>
        </div>

        <h2 className="text-white text-4xl font-bold">REGISTRATION</h2>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {step === 1 ? (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Step 1: Account Setup
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm text-gray-600">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="mt-1 text-black"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm text-gray-600">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="mt-1 text-black"
                    placeholder="Enter your last name"
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
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-1 text-black"
                    placeholder="your.email@example.com"
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
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="pr-10 text-black"
                      placeholder="At least 6 characters"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-6 w-6 text-gray-600" />
                      ) : (
                        <Eye className="h-6 w-6 text-gray-600" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm text-gray-600"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="pr-10 text-black"
                      placeholder="Re-enter your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-6 w-6 text-gray-600" />
                      ) : (
                        <Eye className="h-6 w-6 text-gray-600" />
                      )}
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
                <h3 className="text-xl font-semibold text-gray-800">
                  Step 2: Profiling
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tell us about yourself!
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="dateOfBirth"
                    className="text-sm text-gray-600"
                  >
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="mt-1 text-black"
                    placeholder="DD/MM/YYYY"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="contactNumber"
                    className="text-sm text-gray-600"
                  >
                    Contact Number (Optional)
                  </Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactNumber: e.target.value,
                      })
                    }
                    className="mt-1 text-black"
                    placeholder="+65 1234 5678"
                  />
                </div>

                <div>
                  <Label htmlFor="region" className="text-sm text-gray-600">
                    Region
                  </Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) =>
                      setFormData({ ...formData, region: value })
                    }
                  >
                    <SelectTrigger className="mt-1 text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Singapore",
                        "Malaysia",
                        "Thailand",
                        "Indonesia",
                        "Philippines",
                        "Vietnam",
                        "Other",
                      ].map((region) => (
                        <SelectItem
                          key={region}
                          value={region}
                          className="text-black"
                        >
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">
                    Interests (Optional) - Select up to 3
                  </Label>
                  <div className="text-xs text-gray-500 mt-1">
                    {interests.length}/3 selected
                  </div>

                  {interestsLoading ? (
                    <div className="mt-2 flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span className="text-sm text-gray-500">
                        Loading interests...
                      </span>
                    </div>
                  ) : interestsError ? (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <span className="text-sm text-yellow-700">
                        {interestsError}. Please try again later.
                      </span>
                    </div>
                  ) : null}

                  <div className="mt-2 max-h-32 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2 text-black">
                      {availableInterests.map((interest) => {
                        const isSelected = interests.includes(interest.title);
                        const canSelect = interests.length < 3 || isSelected;

                        return (
                          <div
                            key={interest.interest_id}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={`interest-${interest.interest_id}`}
                              checked={isSelected}
                              onChange={() => toggleInterest(interest.title)}
                              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:opacity-50"
                              disabled={interestsLoading || !canSelect}
                            />
                            <Label
                              htmlFor={`interest-${interest.interest_id}`}
                              className={`text-sm cursor-pointer ${
                                !canSelect ? "opacity-50" : ""
                              }`}
                              title={interest.description || interest.title}
                            >
                              {interest.title}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {interests.length === 3 && (
                    <div className="mt-2 text-xs text-emerald-600">
                      Maximum interests selected. Uncheck an interest to select
                      a different one.
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm text-gray-600">
                    What's your gender?
                  </Label>
                  <div className="mt-2 space-y-2 text-black">
                    {["Female", "Male", "Rather not say"].map((option) => {
                      const isSelected = formData.gender === option;
                      return (
                        <div
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            id={option.toLowerCase().replace(/\s+/g, "-")}
                            name="gender"
                            value={option}
                            checked={isSelected}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                gender: e.target.value,
                              })
                            }
                            className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                          />
                          <Label
                            htmlFor={option.toLowerCase().replace(/\s+/g, "-")}
                            className={`text-sm cursor-pointer ${
                              isSelected
                                ? "text-emerald-600 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {option}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Select Plan</Label>
                  <div className="mt-2 space-y-2">
                    {["Free Plan", "Premium Plan"].map((plan) => {
                      const isSelected = formData.plan === plan;
                      return (
                        <div key={plan} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={plan.toLowerCase().replace(/\s+/g, "-")}
                            name="plan"
                            value={plan}
                            checked={isSelected}
                            onChange={(e) =>
                              setFormData({ ...formData, plan: e.target.value })
                            }
                            className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                          />
                          <Label
                            htmlFor={plan.toLowerCase().replace(/\s+/g, "-")}
                            className={`text-sm cursor-pointer ${
                              isSelected
                                ? "text-emerald-600 font-medium"
                                : "text-gray-700"
                            }`}
                          >
                            {plan}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateAccount}
                disabled={isLoading}
                className="w-full mt-8 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
