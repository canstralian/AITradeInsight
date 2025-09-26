import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

interface FormData {
  // Step 1: Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Step 2: Trading Profile
  experience: string;
  riskTolerance: string;
  investmentGoals: string[];
  initialInvestment: string;
  tradingStyle: string;

  // Terms
  termsAccepted: boolean;
  newsletterSubscription: boolean;
}

export function GetStarted() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    experience: "",
    riskTolerance: "",
    investmentGoals: [],
    initialInvestment: "",
    tradingStyle: "",
    termsAccepted: false,
    newsletterSubscription: false,
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.experience)
      newErrors.experience = "Experience level is required";
    if (!formData.riskTolerance)
      newErrors.riskTolerance = "Risk tolerance is required";
    if (formData.investmentGoals.length === 0)
      newErrors.investmentGoals = [
        "At least one investment goal is required",
      ] as any;
    if (!formData.initialInvestment)
      newErrors.initialInvestment = "Initial investment amount is required";
    if (!formData.tradingStyle)
      newErrors.tradingStyle = "Trading style is required";
    if (!formData.termsAccepted) newErrors.termsAccepted = true as any;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoalToggle = (goal: string) => {
    const currentGoals = formData.investmentGoals;
    const updatedGoals = currentGoals.includes(goal)
      ? currentGoals.filter((g) => g !== goal)
      : [...currentGoals, goal];
    updateFormData("investmentGoals", updatedGoals);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to dashboard on success
      setLocation("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
      // Handle error - could show toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / 2) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Get Started with AI Trading
          </h1>
          <p className="text-gray-400">
            Complete your profile to access personalized trading insights
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span className={currentStep >= 1 ? "text-purple-400" : ""}>
              Personal Information
            </span>
            <span className={currentStep >= 2 ? "text-purple-400" : ""}>
              Trading Profile
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              Step {currentStep} of 2:{" "}
              {currentStep === 1 ? "Personal Information" : "Trading Profile"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-300">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        updateFormData("firstName", e.target.value)
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-300">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        updateFormData("lastName", e.target.value)
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-300">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-300">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter your phone number"
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div>
                  <Label className="text-gray-300">Trading Experience *</Label>
                  <Select
                    value={formData.experience}
                    onValueChange={(value) =>
                      updateFormData("experience", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">
                        Beginner (0-1 years)
                      </SelectItem>
                      <SelectItem value="intermediate">
                        Intermediate (1-3 years)
                      </SelectItem>
                      <SelectItem value="advanced">
                        Advanced (3-5 years)
                      </SelectItem>
                      <SelectItem value="expert">Expert (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.experience && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.experience}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-300">Risk Tolerance *</Label>
                  <Select
                    value={formData.riskTolerance}
                    onValueChange={(value) =>
                      updateFormData("riskTolerance", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select your risk tolerance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                      <SelectItem value="very-aggressive">
                        Very Aggressive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.riskTolerance && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.riskTolerance}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-300">
                    Investment Goals * (Select all that apply)
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {[
                      "Long-term wealth building",
                      "Short-term profits",
                      "Passive income generation",
                      "Portfolio diversification",
                      "Learning and education",
                      "Retirement planning",
                    ].map((goal) => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox
                          id={goal}
                          checked={formData.investmentGoals.includes(goal)}
                          onCheckedChange={() => handleGoalToggle(goal)}
                        />
                        <Label htmlFor={goal} className="text-gray-300 text-sm">
                          {goal}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.investmentGoals && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.investmentGoals[0]}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-300">
                    Initial Investment Amount *
                  </Label>
                  <Select
                    value={formData.initialInvestment}
                    onValueChange={(value) =>
                      updateFormData("initialInvestment", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select your initial investment range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                      <SelectItem value="5000-10000">
                        $5,000 - $10,000
                      </SelectItem>
                      <SelectItem value="10000-25000">
                        $10,000 - $25,000
                      </SelectItem>
                      <SelectItem value="25000-50000">
                        $25,000 - $50,000
                      </SelectItem>
                      <SelectItem value="50000+">$50,000+</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.initialInvestment && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.initialInvestment}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-300">
                    Preferred Trading Style *
                  </Label>
                  <Select
                    value={formData.tradingStyle}
                    onValueChange={(value) =>
                      updateFormData("tradingStyle", value)
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select your trading style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day-trading">Day Trading</SelectItem>
                      <SelectItem value="swing-trading">
                        Swing Trading
                      </SelectItem>
                      <SelectItem value="position-trading">
                        Position Trading
                      </SelectItem>
                      <SelectItem value="buy-and-hold">Buy and Hold</SelectItem>
                      <SelectItem value="mixed">Mixed Approach</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tradingStyle && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.tradingStyle}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) =>
                        updateFormData("termsAccepted", checked)
                      }
                    />
                    <Label htmlFor="terms" className="text-gray-300 text-sm">
                      I agree to the{" "}
                      <a href="#" className="text-purple-400 hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-purple-400 hover:underline">
                        Privacy Policy
                      </a>{" "}
                      *
                    </Label>
                  </div>
                  {errors.termsAccepted && (
                    <p className="text-red-400 text-sm">
                      You must accept the terms and conditions
                    </p>
                  )}

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletterSubscription}
                      onCheckedChange={(checked) =>
                        updateFormData("newsletterSubscription", checked)
                      }
                    />
                    <Label
                      htmlFor="newsletter"
                      className="text-gray-300 text-sm"
                    >
                      Subscribe to our newsletter for market insights and
                      trading tips
                    </Label>
                  </div>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={
                  currentStep === 1 ? () => setLocation("/") : handlePrevious
                }
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {currentStep === 1 ? "Back to Home" : "Previous"}
              </Button>

              {currentStep === 1 ? (
                <Button
                  onClick={handleNext}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@aitrading.com"
              className="text-purple-400 hover:underline"
            >
              support@aitrading.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
