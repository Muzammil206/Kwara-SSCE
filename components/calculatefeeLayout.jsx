"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Loader2,
  Hash,
  AlertCircle,
  Upload,
  File,
  CheckCircle,
  X,
  ImageIcon,
  FileText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabaseClient"

const FeeLayout = ({ register, watch, setValue, nextStep, prevStep,  schedule, onfileUrl, onPilot }) => {
  const [calculatedAmount, setCalculatedAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [plotCount, setPlotCount] = useState("")
  const [hasCalculated, setHasCalculated] = useState(false)

  // File upload states
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const fileInputRef = useRef(null)


  
 
  

  const formatNaira = (value) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(value)
  }

  // Calculate fee when the calculate button is clicked
  const calculateFee = async () => {
    if (!plotCount || Number(plotCount) < 2 || !schedule?.schedule) {
      setError("Please enter a valid number of plots (minimum 2)")
      return
    }

    setIsLoading(true)
    setError("")
    onPilot(plotCount)

    try {
      const scheduleLetter = schedule.schedule.toUpperCase().replace("SCHEDULE ", "").charAt(0)
      const response = await fetch(`/api/layoutfee?plots=${plotCount}&schedule=${scheduleLetter}`)

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const data = await response.json()
      console.log(data)

      if (data.error) {
        throw new Error(data.error)
      }

      // Update the calculated amount from the API response
      setCalculatedAmount(data.price * plotCount || 0)
      setHasCalculated(true)

      // Update the form value for payment amount
      setValue("paymentAmount", data.price || 0)
      
    } catch (error) {
      console.error("Error calculating fee:", error)
      setError("Failed to calculate fee. Please try again.")
      setCalculatedAmount(0)
      setHasCalculated(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle plot count input change
  const handlePlotCountChange = (e) => {
    const value = e.target.value
    setPlotCount(value)
    setValue("plotCount", value)
    // Reset calculation when input changes
    if (hasCalculated) {
      setHasCalculated(false)
      setCalculatedAmount(0)
    }
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    // Check file type
    const fileType = selectedFile.type
    if (!fileType.includes("image") && fileType !== "application/pdf") {
      setUploadError("Only images and PDF files are allowed")
      return
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError("File size should be less than 5MB")
      return
    }

    setFile(selectedFile)
    setUploadError("")

    // Create preview for images
    if (fileType.includes("image")) {
      const reader = new FileReader()
      reader.onload = () => {
        setFilePreview(reader.result)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      // For PDFs, just show an icon
      setFilePreview(null)
    }
  }

  // Upload file to Supabase
  const uploadFile = async () => {
    if (!file) {
      setUploadError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setUploadError("")

    try {
      

      // Create a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `layout-documents/${fileName}`

      // Upload the file
      const { data, error } = await supabase.storage.from("layout").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) throw error

      // Get the public URL
      const { data: urlData } = supabase.storage.from("layout").getPublicUrl(filePath)

      // Set the file URL and update form value
      onfileUrl(urlData.publicUrl)
      setFileUrl(urlData.publicUrl)
      setValue("documentUrl", urlData.publicUrl)
      setValue("documentName", file.name)
    } catch (error) {
      console.error("Error uploading file:", error)
      setUploadError("Failed to upload file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  // Remove uploaded file
  const removeFile = () => {
    setFile(null)
    setFilePreview(null)
    setFileUrl("")
    setValue("documentUrl", "")
    setValue("documentName", "")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Get file icon based on type
  const getFileIcon = () => {
    if (!file) return null

    if (file.type.includes("image")) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />
    } else if (file.type === "application/pdf") {
      return <FileText className="h-6 w-6 text-red-500" />
    } else {
      return <File className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Payment Calculation</h2>
        <p className="text-gray-600 mt-2">
          Enter the number of plots, calculate your payment, and upload required documents
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Plot Information
          </CardTitle>
          <CardDescription>
            The minimum number of plots is 2. Your fee will be calculated based on the schedule and plot count.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="plotCount" className="text-base">
              Number of Plots
            </Label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Hash className="h-5 w-5 text-gray-500" />
                </div>
                <Input
                  type="number"
                  id="plotCount"
                  value={plotCount}
                  onChange={handlePlotCountChange}
                  className="pl-10 text-lg h-12"
                  placeholder="Enter number of plots"
                  min="2"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={calculateFee}
                disabled={isLoading || !plotCount || Number(plotCount) < 2}
                className="h-12 px-6"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Calculate
              </Button>
            </div>
            {plotCount && Number(plotCount) < 2 && (
              <p className="text-sm text-red-500 mt-1">Minimum number of plots is 2</p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-gray-50 p-6 rounded-lg mt-4">
            <div className="text-sm font-medium text-gray-600">Schedule:</div>
            <div className="text-lg font-semibold mt-1">{schedule?.schedule || "Not specified"}</div>

            <div className="text-sm font-medium text-gray-600 mt-4">Calculated Amount:</div>
            {isLoading ? (
              <div className="flex items-center gap-2 text-2xl font-bold text-primary mt-1">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Calculating...</span>
              </div>
            ) : hasCalculated ? (
              <div className="text-3xl font-bold text-primary mt-1">{formatNaira(calculatedAmount)}</div>
            ) : (
              <div className="text-xl text-gray-500 mt-1">Enter plot count and click Calculate</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Document Upload
          </CardTitle>
          <CardDescription>Upload a supporting document (image or PDF, max 5MB)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!fileUrl ? (
            <>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,application/pdf"
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Upload className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-base font-medium">Click to upload a document</p>
                    <p className="text-sm text-gray-500">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-400">Supported formats: JPG, PNG, PDF (max 5MB)</p>
                </div>
              </div>

              {file && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon()}
                    <div>
                      <p className="font-medium text-sm truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={removeFile} className="h-8 px-2">
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={uploadFile} disabled={isUploading} className="h-8">
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Upload</>}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Document uploaded successfully</p>
                  <p className="text-sm text-gray-600 truncate max-w-[300px]">{file?.name}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={removeFile} className="h-8">
                Remove
              </Button>
            </div>
          )}

          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {filePreview && file?.type.includes("image") && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Preview:</p>
              <div className="relative rounded-lg overflow-hidden border border-gray-200 max-h-[200px]">
                <img src={filePreview || "/placeholder.svg"} alt="Preview" className="object-contain w-full h-full" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
        <Button variant="outline" onClick={prevStep} className="flex items-center" size="lg" asChild>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </motion.button>
        </Button>
        <Button
          onClick={nextStep}
          disabled={!hasCalculated || calculatedAmount <= 0 || !fileUrl}
          className="flex items-center bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 text-white font-medium rounded-md shadow-sm px-4 py-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
          size="lg"
          asChild
        >
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Next
            <ArrowRight className="ml-2 h-5 w-5" />
          </motion.button>
        </Button>
      </div>
    </motion.div>
  )
}

export default FeeLayout
