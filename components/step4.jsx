"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Building2, Home, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

const Step4 = ({ register, watch, setValue, nextStep, prevStep, area, schedule }) => {
  const [calculatedAmount, setCalculatedAmount] = useState(0)
  const [commercialFee, setCommercialFee] = useState(0)
  const [privateFee, setPrivateFee] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLandUse, setSelectedLandUse] = useState("Private")
 
  const formattedArea = Math.floor(area)
  

  const formatNaira = (value) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(value)
  }

  useEffect(() => {
    const fetchPaymentFee = async () => {
      setIsLoading(true);
      try {
        const scheduleLetter = schedule.schedule.toUpperCase().replace("SCHEDULE ", "").charAt(0);
        const response = await fetch(
          `/api/getPaymentFee?area=${formattedArea}&schedule=${scheduleLetter}`
        );
  
        if (!response.ok) {
          throw new Error(await response.text());
        }
  
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
  
        // Handle calculated fees
        if (data.is_calculated) {
          console.log('Fee breakdown:', {
            baseFee: data.base_fee,
            additionalHectares: data.additional_hectares,
            additionalRate: data.additional_rate,
            totalFee: {
              private: data.residential_survey_fee,
              commercial: data.commercial_survey_fee
            }
          });
        }
  
        setCommercialFee(data.commercial_survey_fee || 0);
        setPrivateFee(data.residential_survey_fee || 0);
  
      } catch (error) {
        console.error("Error fetching payment fee:", error);
        setCommercialFee(0);
        setPrivateFee(0);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (formattedArea && schedule?.schedule) {
      fetchPaymentFee();
    }
  }, [formattedArea, schedule?.schedule]);
  // Update calculated amount whenever fees or selected land use changes
  useEffect(() => {
    const amount = selectedLandUse === "commercial" ? commercialFee : privateFee
    setCalculatedAmount(amount)
    setValue("paymentAmount", amount)
    setValue("landUse", selectedLandUse)
  }, [commercialFee, privateFee, selectedLandUse, setValue])

  const handleLandUseChange = useCallback((value) => {
    setSelectedLandUse(value)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800">Step 4: Payment Amount</h2>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Land Use Type</label>
              <Select value={selectedLandUse} onValueChange={handleLandUseChange} disabled={isLoading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select land use type">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : selectedLandUse === "commercial" ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>Commercial</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <span>Private</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>Commercial</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="residential">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <span>Private</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-600">Calculated Amount:</div>
              {isLoading ? (
                <div className="flex items-center gap-2 text-2xl font-bold text-primary mt-1">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Calculating...</span>
                </div>
              ) : (
                <div className="text-2xl font-bold text-primary mt-1">{formatNaira(calculatedAmount)}</div>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                This amount is calculated based on your selected land use type and  survey fee.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevStep}
          className="flex items-center px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextStep}
          className="flex items-center px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
          disabled={isLoading}
        >
          Next
          <ArrowRight className="ml-2 h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default Step4

