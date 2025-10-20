"use client"

import { useState } from "react"
import { FileUp, Loader2, AlertCircle, CheckCircle, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useMediaQuery } from "@/hooks/use-media-query"

export function PaymentVerificationForm({ applicationId, onSuccess, onCancel }) {
  const initialFileState = {
    file: null,
    uploadState: "idle",
    uploadProgress: 0,
    error: null,
    publicUrl: null,
  }

  const [files, setFiles] = useState({
    receipt: { ...initialFileState },
    appsn: { ...initialFileState },
    feeAttachment: { ...initialFileState },
  })

  const [activeTab, setActiveTab] = useState("receipt")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dbUpdateStatus, setDbUpdateStatus] = useState("idle") // idle, updating, success, error
  const [dbError, setDbError] = useState(null)

  // Check if screen is mobile
  const isMobile = useMediaQuery("(max-width: 640px)")

  const documentLabels = {
    receipt: "Payment Receipt",
    appsn: "Application Document",
    feeAttachment: "Surcharge Fee Attachment",
  }

  // Shorter labels for mobile
  const mobileDocumentLabels = {
    receipt: "Receipt",
    appsn: "Appsn",
    feeAttachment: "Surcon",
  }

  // Different buckets for each document type
  const documentBuckets = {
    receipt: "application-receipts",
    appsn: "appsn-receipt",
    feeAttachment: "surcon-receipt",
  }

  // Database column names for each document type
  const documentColumns = {
    receipt: "receipt_url",
    appsn: "appsn_url",
    feeAttachment: "surcon_fee_url",
  }

 // Supported file types
 const supportedImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
 const supportedPdfTypes = ["application/pdf"]
 const supportedFileTypes = [...supportedImageTypes, ...supportedPdfTypes]

 // File type extensions for accept attribute
 const acceptFileTypes = ".pdf,.jpg,.jpeg,.png,.webp"

 // Helper to determine file type
 const getFileType = (file) => {
   if (!file) return null
   if (supportedPdfTypes.includes(file.type)) return "pdf"
   if (supportedImageTypes.includes(file.type)) return "image"
   return null
 }

 const handleFileChange = (docType) => (e) => {
   const selectedFile = e.target.files?.[0]

   setFiles((prev) => ({
     ...prev,
     [docType]: {
       ...prev[docType],
       file: null,
       error: null,
       fileType: null,
     },
   }))

   if (!selectedFile) return

   // Validate file type
   const fileType = getFileType(selectedFile)
   if (!fileType) {
     setFiles((prev) => ({
       ...prev,
       [docType]: {
         ...prev[docType],
         error: "Please upload a PDF or image file (JPG, PNG, WEBP)",
       },
     }))
     return
   }
    // Validate file size (max 5MB)
    if (selectedFile.size > 1 * 1024 * 1024) {
      setFiles((prev) => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          error: "File size should be less than 1MB",
        },
      }))
      return
    }

    setFiles((prev) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        file: selectedFile,
        error: null,
      },
    }))
  }

  const uploadFile = async (docType) => {
    const fileState = files[docType]

    if (!fileState.file) return null

    setFiles((prev) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        uploadState: "uploading",
        uploadProgress: 0,
        error: null,
      },
    }))

    try {
      // Create a unique file name
      const fileExt = fileState.file.name.split(".").pop()
      const fileName = `${applicationId}_${docType}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload file to the specific Supabase Storage bucket for this document type
      const { data, error } = await supabase.storage.from(documentBuckets[docType]).upload(filePath, fileState.file, {
        cacheControl: "3600",
        upsert: false,
        onUploadProgress: (progress) => {
          const percent = Math.round((progress.loaded / progress.total) * 100)
          setFiles((prev) => ({
            ...prev,
            [docType]: {
              ...prev[docType],
              uploadProgress: percent,
            },
          }))
        },
      })

      if (error) throw error

      // Get the public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage.from(documentBuckets[docType]).getPublicUrl(filePath)
      console.log("publicUrlData", publicUrlData)

      setFiles((prev) => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          uploadState: "success",
          publicUrl: publicUrlData.publicUrl,
        },
      }))

      return publicUrlData.publicUrl
    } catch (err) {
      console.error(`Error uploading ${docType}:`, err)
      setFiles((prev) => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          uploadState: "error",
          error: err.message || `Failed to upload ${documentLabels[docType].toLowerCase()}`,
        },
      }))
      return null
    }
  }

  // Function to update the database with file URLs
  const updateDatabase = async (fileUrls) => {
    setDbUpdateStatus("updating")
    setDbError(null)

    try {
      // Create an object with the column names and their corresponding URLs
      const updateData = {}

      // Add each URL to the appropriate column
      Object.keys(fileUrls).forEach((docType) => {
        if (fileUrls[docType]) {
          updateData[documentColumns[docType]] = fileUrls[docType]
        }
      })

      // Update the application record in the database
      const { error } = await supabase.from("pillar_applications").update(updateData).eq("id", applicationId)

      if (error) throw error

      setDbUpdateStatus("success")
      return true
    } catch (err) {
      console.error("Error updating database:", err)
      setDbError(err.message || "Failed to update database")
      setDbUpdateStatus("error")
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check if all required documents are selected
    let missingDocuments = false

    // Check each document type
    ;["receipt", "appsn", "feeAttachment"].forEach((docType) => {
      if (!files[docType].file) {
        setFiles((prev) => ({
          ...prev,
          [docType]: {
            ...prev[docType],
            error: `${documentLabels[docType]} is mandatory`,
          },
        }))
        missingDocuments = true
      }
    })

    if (missingDocuments) {
      // Find the first missing document and switch to that tab
      for (const docType of ["receipt", "appsn", "feeAttachment"]) {
        if (!files[docType].file) {
          setActiveTab(docType)
          break
        }
      }
      return
    }

    setIsSubmitting(true)

    try {
      // Upload all files
      const results = await Promise.all([uploadFile("receipt"), uploadFile("appsn"), uploadFile("feeAttachment")])

      // Check if all uploads were successful
      if (results.includes(null)) {
        throw new Error("Failed to upload one or more documents")
      }

      // Create an object with the file URLs
      const fileUrls = {
        receipt: results[0],
        appsn: results[1],
        feeAttachment: results[2],
      }

      // Update the database with the file URLs
      const dbUpdateSuccess = await updateDatabase(fileUrls)

      if (!dbUpdateSuccess) {
        throw new Error("Failed to update database with file URLs")
      }

      // Small delay to show success state
      setTimeout(() => {
        onSuccess(fileUrls)
      }, 1000)
    } catch (err) {
      console.error("Error during submission:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeFile = (docType) => {
    if (files[docType].uploadState === "uploading") return

    setFiles((prev) => ({
      ...prev,
      [docType]: {
        ...initialFileState,
      },
    }))
  }

  const getCompletedCount = () => {
    return Object.values(files).filter((f) => f.uploadState === "success").length
  }

  const renderFileUpload = (docType) => {
    const fileState = files[docType]

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={docType}
            className="text-foreground dark:text-slate-100 flex items-center text-sm sm:text-base"
          >
            {documentLabels[docType]} <Badge className="ml-2 bg-red-500 text-xs">Required</Badge>
          </Label>
          {fileState.file && fileState.uploadState !== "uploading" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground"
              onClick={() => removeFile(docType)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors cursor-pointer",
            "hover:bg-muted/50 dark:hover:bg-slate-800/50",
            fileState.error
              ? "border-destructive/50 bg-destructive/5 dark:bg-red-950/30 dark:border-red-500/50"
              : fileState.file
                ? "border-emerald-500/50 dark:border-emerald-400/70 bg-emerald-50/50 dark:bg-emerald-950/30"
                : "border-muted dark:border-slate-700",
          )}
          onClick={() => document.getElementById(docType).click()}
        >
          <input
            type="file"
            id={docType}
            accept=".pdf,  image/*"
            className="hidden"
            onChange={handleFileChange(docType)}
            disabled={fileState.uploadState === "uploading" || isSubmitting}
          />

          {fileState.uploadState === "uploading" ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary dark:text-emerald-400 animate-spin mb-2" />
              <p className="text-xs sm:text-sm font-medium dark:text-slate-200">
                Uploading {isMobile ? "" : documentLabels[docType].toLowerCase()}...
              </p>
              <div className="w-full bg-muted rounded-full h-2 sm:h-2.5 mt-2 sm:mt-3 dark:bg-slate-700">
                <div
                  className="bg-primary dark:bg-emerald-400 h-2 sm:h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${fileState.uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">{fileState.uploadProgress}%</p>
            </div>
          ) : fileState.uploadState === "success" ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-500 dark:text-emerald-300 mb-2" />
              <p className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-300">
                Upload successful!
              </p>
              <div className="max-w-full overflow-hidden">
                <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1 truncate max-w-[200px] sm:max-w-[300px]">
                  {fileState.file?.name}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FileUp className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground dark:text-slate-400 mb-2" />
              <p className="text-xs sm:text-sm font-medium dark:text-slate-200">
                {fileState.file ? (
                  <span className="truncate block max-w-[200px] sm:max-w-[300px]">{fileState.file.name}</span>
                ) : (
                  `Select PDF file`
                )}
              </p>
              <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
                {fileState.file ? "Ready to upload" : "PDF and img, max 1MB"}
              </p>
              {!fileState.file && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 sm:mt-4 h-8 text-xs sm:text-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    document.getElementById(docType).click()
                  }}
                >
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Browse Files
                </Button>
              )}
            </div>
          )}
        </div>

        {fileState.error && (
          <div className="flex items-center text-destructive dark:text-red-400 text-xs sm:text-sm mt-2">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-2">{fileState.error}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="text-foreground dark:text-slate-100 w-full max-w-full">
      <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
            <TabsList className="w-full sm:w-auto grid grid-cols-3 h-auto p-1">
              <TabsTrigger
                value="receipt"
                className="relative px-2 py-1.5 h-auto text-xs sm:text-sm data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300"
              >
                {isMobile ? "Receipt" : "Mandatory Fee (70%)"}
                {files.receipt.error && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
                {files.receipt.uploadState === "success" && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full"></span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="appsn"
                className="relative px-2 py-1.5 h-auto text-xs sm:text-sm data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300"
              >
                Appsn
                {files.appsn.error && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
                {files.appsn.uploadState === "success" && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full"></span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="feeAttachment"
                className="relative px-2 py-1.5 h-auto text-xs sm:text-sm data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-300"
              >
                {isMobile ? "Surcon" : "Surcon Fee"}
                {files.feeAttachment.error && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
                {files.feeAttachment.uploadState === "success" && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full"></span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* <Badge variant="outline" className="self-end sm:self-auto sm:ml-auto text-xs">
              {getCompletedCount()}/3 Uploaded
            </Badge> */}
          </div>

          <TabsContent value="receipt" className="mt-0">
            {renderFileUpload("receipt")}
          </TabsContent>
          <TabsContent value="appsn" className="mt-0">
            {renderFileUpload("appsn")}
          </TabsContent>
          <TabsContent value="feeAttachment" className="mt-0">
            {renderFileUpload("feeAttachment")}
          </TabsContent>
        </Tabs>

        {dbError && (
          <div className="bg-destructive/10 dark:bg-red-950/30 border border-destructive/30 dark:border-red-500/30 rounded-md p-3 sm:p-4">
            <div className="flex items-start sm:items-center text-destructive dark:text-red-400 text-xs sm:text-sm">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
              <p className="line-clamp-3">Database update failed: {dbError}</p>
            </div>
          </div>
        )}

        <div className="bg-muted dark:bg-slate-800/70 rounded-md p-3 sm:p-4 border border-transparent dark:border-slate-700">
          <h4 className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 dark:text-slate-200">Important Notes:</h4>
          <ul className="text-xs sm:text-sm text-muted-foreground dark:text-slate-300 space-y-0.5 sm:space-y-1">
            <li>• All three documents are mandatory</li>
            <li>• Ensure all documents clearly show relevant information</li>
            <li>• Include the pillar number  in the payment discribtion</li>
            <li>• Verification may take 1-2 business days</li>
          </ul>
        </div>
      </div>

      <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || Object.values(files).some((f) => f.uploadState === "uploading")}
          className="w-full sm:w-auto order-2 sm:order-1 h-10 text-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            !files.receipt.file ||
            !files.appsn.file ||
            !files.feeAttachment.file ||
            isSubmitting ||
            Object.values(files).some((f) => f.uploadState === "uploading")
          }
          className={cn(
            "w-full sm:w-auto order-1 sm:order-2 h-10 text-sm gap-1.5",
            "bg-emerald-600 hover:bg-emerald-700 text-white",
            "dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white",
            "disabled:bg-emerald-600/50 dark:disabled:bg-emerald-600/40",
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {dbUpdateStatus === "updating" ? "Saving..." : "Uploading..."}
            </>
          ) : (
            <>
              <FileUp className="h-3.5 w-3.5" />
              Submit Documents
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

