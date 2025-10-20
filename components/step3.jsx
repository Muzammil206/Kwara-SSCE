"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Hash, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {useState, useEffect, use } from "react"
import { supabase } from "@/lib/supabaseClient"

const Step3 = ({ register, watch, setValue, nextStep, prevStep, userId }) => {
  const pillarNo = watch("pillarNo")
  const [quota, setQuota] = useState(null)
  const [quotaLimit, setQuotalLimit] = useState(null)
  const [regular, setRegular] = useState(null)
  const [remainingApplications, setRemainingApplications] = useState(null)


  ///check if the user have exceeded the quota limit...
useEffect(() => {

  
  const fetchUserQuota = async () => {
    if (!userId) return

    try {
      const { data: user_quota, error } = await supabase.from("user_quota").select("*").eq("user_id", userId).order('year', { ascending: false })
      .order('quarter', { ascending: false }).limit(1)
      

      if (error) {
        console.error("Error fetching user_quota:", error.message)
        return
      }
      console.log(...user_quota)
      setQuota(...user_quota)
      
      // setQuotalLimit(quota.quota_limit)

      // setRegular(quota.regular_pillars_applied )
      // console.log('limit', regular, quotaLimit )
      

      console.log(remainingApplications)
      
      setRegular(user_quota[0].regular_pillars_applied || 0)

    } catch (error) {
      console.error("Error in fetchUserQuota:", error.message)
    }
  }

  fetchUserQuota()
}, [])
  


  useEffect(() => {







    
    if (pillarNo) {
      const type = Number(pillarNo) > 11 ? "special" : "regular"
      setValue("pillarType", type)
    }
  }, [pillarNo, setValue])

  const pillarType = watch("pillarType")

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        {/* <h2 className="text-2xl font-bold text-gray-800">Step 3: Pillar Details</h2> */}
        <p className="text-muted-foreground">
          Specify the number of pillars needed. The type will be determined automatically.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pillarNo">Number of Pillars</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    type="number"
                    id="pillarNo"
                    {...register("pillarNo")}
                    className="pl-9"
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">Specify the total number of pillars required</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {pillarType && pillarNo > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Selection Summary</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You have selected {pillarNo} pillar{pillarNo > 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pillar Type: <span className="font-medium capitalize">{pillarType}</span>
                    {pillarType === "special" && <span className="text-xs ml-2"></span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={prevStep} className="flex items-center" asChild>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </motion.button>
        </Button>
        <Button onClick={nextStep} disabled={!pillarNo || pillarNo < 1} className="flex items-center bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 text-white font-medium rounded-md shadow-sm px-4 py-2 disabled:bg-blue-300 disabled:cursor-not-allowed" asChild>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Next
            <ArrowRight className="ml-2 h-5 w-5" />
          </motion.button>
        </Button>
      </div>
    </motion.div>
  )
}

export default Step3

