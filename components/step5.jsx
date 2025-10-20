"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, User, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState, useCallback, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

// Simple debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const Step5 = ({ register, watch, setValue, trigger, formState, nextStep, prevStep }) => {
  const clientName = watch("clientName")
  const clientAddress = watch("clientAddress")
  const planNumber = watch("planNumber")

  const [planStatus, setPlanStatus] = useState("") // "checking", "available", "exists", "error"
  const [isCheckingPlan, setIsCheckingPlan] = useState(false)

  // Debounce the plan number - faster response
  const debouncedPlanNumber = useDebounce(planNumber, 300)

  // Function to capitalize each word
  const capitalizeWords = (str) => {
    if (!str) return ""
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
  }

  // Simple plan number formatting - just uppercase
  const handlePlanNumberChange = (e) => {
    const value = e.target.value.toUpperCase()
    if (setValue) {
      setValue("planNumber", value)
    }

    // Reset status when user types
    if (planStatus !== "checking") {
      setPlanStatus("")
    }

    if (trigger) {
      trigger("planNumber")
    }
  }

  // Fast and smooth plan number checking
  const checkPlanNumber = useCallback(async (value) => {
    if (!value?.trim() || value.length < 12) {
      setPlanStatus("")
      return
    }

    setIsCheckingPlan(true)
    setPlanStatus("checking")

    try {
      const { data, error } = await supabase
        .from("pillar_applications")
        .select("plan_number")
        .eq("plan_number", value)
        .limit(1) // Only need to know if one exists

      if (error) {
        console.error("Error checking plan number:", error)
        setPlanStatus("error")
        return
      }

      if (data && data.length > 0) {
        setPlanStatus("exists")
      } else {
        setPlanStatus("available")
      }
    } catch (error) {
      console.error("Error checking plan number:", error)
      setPlanStatus("error")
    } finally {
      setIsCheckingPlan(false)
    }
  }, [])

  // Check plan number when debounced value changes
  useEffect(() => {
    checkPlanNumber(debouncedPlanNumber)
  }, [debouncedPlanNumber, checkPlanNumber])

  // Simple validation - just length check
  const isPlanNumberValid = planNumber && planNumber.length >= 12 && planStatus !== "exists"
  const isFormValid = clientName && clientAddress && isPlanNumberValid

  // Status indicator component
  const PlanStatusIndicator = () => {
    if (!planNumber || planNumber.length < 12) {
      return <p className="text-gray-500 text-xs mt-1">Enter at least 12 characters</p>
    }

    switch (planStatus) {
      case "checking":
        return (
          <div className="flex items-center text-blue-500 text-xs mt-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2"></div>
            Checking availability...
          </div>
        )
      case "available":
        return <p className="text-green-500 text-xs mt-1">✓ Plan number is available</p>
      case "exists":
        return <p className="text-red-500 text-xs mt-1">✗ This plan number is already in use</p>
      case "error":
        return <p className="text-orange-500 text-xs mt-1">⚠ Unable to check availability. Please try again.</p>
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Client Information</h2>
        <p className="text-muted-foreground">Please provide the client's info details.</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="clientName" className="text-base">
              Client Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
              <Input
                id="clientName"
                {...register("clientName", {
                  required: "Client name is required",
                  onChange: (e) => {
                    const capitalizedValue = capitalizeWords(e.target.value)
                    setValue && setValue("clientName", capitalizedValue)
                  },
                })}
                className="pl-10"
                placeholder="Enter Client Name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="planNumber" className="text-base">
              Plan Number
            </Label>
            <div className="relative">
              <Input
                id="planNumber"
                {...register("planNumber", {
                  required: "Plan number is required",
                  minLength: {
                    value: 12,
                    message: "Plan number must be at least 12 characters",
                  },
                })}
                onChange={handlePlanNumberChange}
                className={`pl-10 font-mono transition-colors ${
                  planStatus === "available"
                    ? "border-green-500 focus:border-green-500"
                    : planStatus === "exists"
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300"
                }`}
                placeholder="Enter plan number (min 12 characters)"
                maxLength={25}
              />

              <PlanStatusIndicator />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientAddress" className="text-base">
              Address
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-500 h-5 w-5" />
              <Textarea
                id="clientAddress"
                {...register("clientAddress", {
                  required: "Address is required",
                  onChange: (e) => {
                    const capitalizedValue = capitalizeWords(e.target.value)
                    setValue && setValue("clientAddress", capitalizedValue)
                  },
                })}
                className="pl-10 min-h-[100px]"
                placeholder="Enter your full address"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={prevStep} className="flex items-center bg-transparent">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </motion.div>
        </Button>
        <Button
          onClick={nextStep}
          disabled={!isFormValid}
          className="flex items-center bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 text-white font-medium rounded-md shadow-sm px-4 py-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Next
            <ArrowRight className="ml-2 h-5 w-5" />
          </motion.div>
        </Button>
      </div>
    </motion.div>
  )
}

export default Step5
