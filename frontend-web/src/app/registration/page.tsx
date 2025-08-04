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
import { 
  ChevronLeft, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  Mail, 
  CheckCircle,
  Shield
} from "lucide-react";

// Interface for Interest data
interface Interest {
  interest_id: number;
  title: string;
  description: string;
  categories_id: number;
  category_title: string;
}

export default function RegistrationPage() {
  // API configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email Verification, 2: Account Setup, 3: Profile Setup
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  // Email verification states
  const [emailForVerification, setEmailForVerification] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);

  // State for dynamic interests from database
  const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
  const [interestsLoading, setInterestsLoading] = useState(false);
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

  // Fetch interests when reaching step 3
  useEffect(() => {
    if (step === 3) {
      const fetchInterests = async () => {
        try {
          setInterestsLoading(true);
          setInterestsError("");

          const response = await fetch(
            `${API_BASE_URL}/api/interests/all`,
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
    }
  }, [step]);

  // Resend timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((timer) => timer - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      if (interests.length < 3) {
        setInterests([...interests, interest]);
      }
    }
  };

  // Step 1: Email Verification Functions
  const handleSendVerificationCode = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!emailForVerification.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForVerification)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-verification-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailForVerification.toLowerCase().trim(),
          name: "User"
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsCodeSent(true);
        setSuccess("Verification code sent to your email!");
        setCanResend(false);
        setResendTimer(60);
      } else {
        setError(data.message || "Failed to send verification code");
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      setError("Unable to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError("Please enter the 6-digit verification code");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-email-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailForVerification.toLowerCase().trim(),
          code: verificationCode.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsEmailVerified(true);
        setFormData({ ...formData, email: emailForVerification.toLowerCase().trim() });
        setSuccess("Email verified successfully!");
        setTimeout(() => {
          setStep(2);
        }, 1500);
      } else {
        setError(data.message || "Invalid verification code");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      setError("Unable to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailForVerification.toLowerCase().trim(),
          name: "User"
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("New verification code sent!");
        setCanResend(false);
        setResendTimer(60);
      } else {
        setError(data.message || "Failed to resend code");
      }
    } catch (error) {
      console.error("Error resending code:", error);
      setError("Unable to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Account Setup Validation
  const validateStep2 = () => {
    setError("");

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Please enter your first and last name");
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
    if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.push("/");
    } else if (step === 2) {
      setStep(1);
      setIsEmailVerified(false);
      setIsCodeSent(false);
      setVerificationCode("");
    } else {
      setStep(2);
    }
  };

  // Step 3: Create Account
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

      // Include verification code in request
      const requestData = {
        email: formData.email,
        verification_code: verificationCode, // This is the key addition!
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
        `${API_BASE_URL}/api/users/create_user`,
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

        // If user selected Premium Plan, redirect to Stripe
        if (formData.plan === "Premium Plan") {
          const stripeResponse = await fetch(
            `${API_BASE_URL}/api/create-checkout-session`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_id: userId,
                plan_id: 4,
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
          // Free user — go to login
          setSuccess("Account created successfully! Redirecting to landing page...");
          setTimeout(() => {
            router.push("/");
          }, 2000);
        }
      } else {
        const errorMessage = data.message || "Registration failed";
        if (response.status === 409) {
          setError("An account with this email already exists");
        } else if (response.status === 400) {
          if (errorMessage.includes("verification") || errorMessage.includes("verify")) {
            setError("Email verification expired. Please verify your email again.");
            setStep(1);
            setIsEmailVerified(false);
            setIsCodeSent(false);
            setVerificationCode("");
          } else if (errorMessage.includes("age")) {
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
      setError("Unable to connect to server. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Step 1: Email Verification";
      case 2: return "Step 2: Account Setup";
      case 3: return "Step 3: Profile Setup";
      default: return "Registration";
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 1: return <Mail className="h-8 w-8 sm:h-12 sm:w-12 text-emerald-500 mx-auto mb-4" />;
      case 2: return <Shield className="h-8 w-8 sm:h-12 sm:w-12 text-emerald-500 mx-auto mb-4" />;
      case 3: return <span className="text-emerald-500 text-4xl sm:text-6xl mb-4 block">👤</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 to-emerald-600 flex flex-col lg:flex-row">
      {/* Left Side - Illustration - Made responsive */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 relative min-h-[300px] lg:min-h-screen">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 text-white hover:bg-white/20"
          onClick={handleBack}
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>

        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-white text-xl sm:text-2xl font-bold mb-2">ROCKLAND</h1>
        </div>

        <div className="relative mb-4 sm:mb-8">
          <div className="w-32 h-32 sm:w-48 sm:h-48 lg:w-72 lg:h-72 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white text-4xl sm:text-6xl lg:text-9xl">🪨</span>
          </div>
        </div>

        <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">REGISTRATION</h2>
        
        {/* Progress indicator - Made responsive */}
        <div className="mt-4 sm:mt-8 flex space-x-2">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                stepNumber < step
                  ? 'bg-green-300'
                  : stepNumber === step
                  ? 'bg-white'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right Side - Form - Made responsive */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-md shadow-2xl">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start text-green-700">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm">{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm">{error}</span>
            </div>
          )}

          {/* Step 1: Email Verification */}
          {step === 1 && (
            <>
              <div className="text-center mb-4 sm:mb-6">
                {getStepIcon()}
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {getStepTitle()}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  We'll send a verification code to your email
                </p>
              </div>

              {!isCodeSent ? (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="emailVerification" className="text-xs sm:text-sm text-gray-600">
                      Email Address
                    </Label>
                    <Input
                      id="emailVerification"
                      type="email"
                      value={emailForVerification}
                      onChange={(e) => setEmailForVerification(e.target.value)}
                      className="mt-1 text-black text-sm sm:text-base"
                      placeholder="your.email@example.com"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    onClick={handleSendVerificationCode}
                    disabled={isLoading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 sm:py-3 rounded-lg font-medium disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="verificationCode" className="text-xs sm:text-sm text-gray-600">
                      Verification Code
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the 6-digit code sent to {emailForVerification}
                    </p>
                    <Input
                      id="verificationCode"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="mt-1 text-black text-center text-base sm:text-lg tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      disabled={isLoading || isEmailVerified}
                    />
                  </div>

                  <Button
                    onClick={handleVerifyCode}
                    disabled={isLoading || verificationCode.length !== 6 || isEmailVerified}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 sm:py-3 rounded-lg font-medium disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : isEmailVerified ? (
                      <>
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Verified!
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-500">
                      Didn't receive the code?{" "}
                      <button
                        onClick={handleResendCode}
                        disabled={!canResend || isLoading}
                        className="text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {canResend ? "Resend Code" : `Resend in ${resendTimer}s`}
                      </button>
                    </p>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => {
                        setIsCodeSent(false);
                        setVerificationCode("");
                        setEmailForVerification("");
                      }}
                      className="text-xs sm:text-sm text-gray-500 hover:text-gray-700"
                    >
                      Change email address
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 2: Account Setup */}
          {step === 2 && (
            <>
              <div className="text-center mb-4 sm:mb-6">
                {getStepIcon()}
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {getStepTitle()}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Email: {formData.email} ✓
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="firstName" className="text-xs sm:text-sm text-gray-600">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="mt-1 text-black text-sm sm:text-base"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-xs sm:text-sm text-gray-600">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="mt-1 text-black text-sm sm:text-base"
                    placeholder="Enter your last name"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-xs sm:text-sm text-gray-600">
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
                      className="pr-10 text-black text-sm sm:text-base"
                      placeholder="At least 6 characters"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-2 sm:px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-xs sm:text-sm text-gray-600"
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
                      className="pr-10 text-black text-sm sm:text-base"
                      placeholder="Re-enter your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-2 sm:px-3 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="w-full mt-6 sm:mt-8 bg-emerald-500 hover:bg-emerald-600 text-white py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base"
              >
                Next
              </Button>
            </>
          )}

          {/* Step 3: Profile Setup */}
          {step === 3 && (
            <>
              <div className="text-center mb-4 sm:mb-6">
                {getStepIcon()}
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {getStepTitle()}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Tell us about yourself!
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto pr-2">
                <div>
                  <Label
                    htmlFor="dateOfBirth"
                    className="text-xs sm:text-sm text-gray-600"
                  >
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="mt-1 text-black text-sm sm:text-base"
                    placeholder="DD/MM/YYYY"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="contactNumber"
                    className="text-xs sm:text-sm text-gray-600"
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
                    className="mt-1 text-black text-sm sm:text-base"
                    placeholder="+65 1234 5678"
                  />
                </div>

                <div>
                  <Label htmlFor="region" className="text-xs sm:text-sm text-gray-600">
                    Region
                  </Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) =>
                      setFormData({ ...formData, region: value })
                    }
                  >
                    <SelectTrigger className="mt-1 text-black text-sm sm:text-base">
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
                          className="text-black text-sm sm:text-base"
                        >
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm text-gray-600">
                    Interests (Optional) - Select up to 3
                  </Label>
                  <div className="text-xs text-gray-500 mt-1">
                    {interests.length}/3 selected
                  </div>

                  {interestsLoading ? (
                    <div className="mt-2 flex items-center justify-center p-3 sm:p-4">
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                      <span className="text-xs sm:text-sm text-gray-500">
                        Loading interests...
                      </span>
                    </div>
                  ) : interestsError ? (
                    <div className="mt-2 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <span className="text-xs sm:text-sm text-yellow-700">
                        {interestsError}. Please try again later.
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2 max-h-24 sm:max-h-32 overflow-y-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-black">
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
                                className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 disabled:opacity-50"
                                disabled={interestsLoading || !canSelect}
                              />
                              <Label
                                htmlFor={`interest-${interest.interest_id}`}
                                className={`text-xs sm:text-sm cursor-pointer ${
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
                  )}

                  {interests.length === 3 && (
                    <div className="mt-2 text-xs text-emerald-600">
                      Maximum interests selected. Uncheck an interest to select
                      a different one.
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs sm:text-sm text-gray-600">
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
                            className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                          />
                          <Label
                            htmlFor={option.toLowerCase().replace(/\s+/g, "-")}
                            className={`text-xs sm:text-sm cursor-pointer ${
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
                  <Label className="text-xs sm:text-sm text-gray-600">Select Plan</Label>
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
                            className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                          />
                          <Label
                            htmlFor={plan.toLowerCase().replace(/\s+/g, "-")}
                            className={`text-xs sm:text-sm cursor-pointer ${
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
                className="w-full mt-6 sm:mt-8 bg-emerald-500 hover:bg-emerald-600 text-white py-2 sm:py-3 rounded-lg font-medium disabled:opacity-50 text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}