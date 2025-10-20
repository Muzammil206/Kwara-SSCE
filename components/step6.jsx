"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Toaster } from "./ui/sonner"
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Ruler,
  PillIcon,
  Hash,
  DollarSign,
  MapPin,
  Loader2,
  X,
  Printer,
} from "lucide-react"

const Step6 = ({ watch, prevStep, onSubmit, isLoading, area, csvFile, location, onCancel, schedule }) => {
  const [isSuccess, setIsSuccess] = useState(false)
  const printContentRef = useRef(null)

  const formData = {
    csvFile: watch("csvFile"),
    calculatedArea: watch("calculatedArea"),
    pillarType: watch("pillarType"),
    pillarNo: watch("pillarNo"),
    paymentAmount: watch("paymentAmount"),
    planNumber: watch("planNumber"),
    clientName: watch("clientName"),
    clientAddress: watch("clientAddress"),
    landUse: watch("landUse") ? watch("landUse") : "Layout",
    schedule: watch("schedule"),

  }

  const formatNaira = (value) => {
    const number = Number.parseFloat(value)
    if (isNaN(number)) return "₦0.00"
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(number)
  }


  function capitalizeFirstLetter(word) {
    if (typeof word !== 'string' || word.length === 0) {
      return word; // Handle non-string or empty input
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  

  const handleSubmit = async () => {
    try {
      await onSubmit()
      setIsSuccess(true)
    } catch (error) {
      console.error("Application submission failed:", error)
      // You could add error handling here
      Toaster.show({
        message: "Application submission failed. Please try again later.",
        type: "error",
        })
    }
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")

    if (!printWindow) {
      alert("Please allow pop-ups to print this document")
      return
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Application Details - ${formData.clientName || "Client"}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 10px;
            border-bottom: 2px solid #eaeaea;
          }
          .header h1 {
            color: #333;
            margin-bottom: 5px;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .review-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #eaeaea;
          }
          .review-item:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #666;
            width: 200px;
          }
          .value {
            font-weight: 700;
            color: #333;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #999;
          }
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Application Details</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="review-items">
          <div class="review-item">
            <div class="label">Client Name:</div>
            <div class="value">${formData.clientName || "Not specified"}</div>
          </div>
          <div class="review-item">
            <div class="label">Client Address:</div>
            <div class="value">${formData.clientAddress || "Not specified"}</div>
          </div>
          <div class="review-item">
            <div class="label">CSV File:</div>
            <div class="value">${csvFile?.name || "Not uploaded"}</div>
          </div>
          <div class="review-item">
            <div class="label">Calculated Area:</div>
            <div class="value">${area ? `${area} m²` : "Not calculated"}</div>
          </div>
          <div class="review-item">
            <div class="label">Location:</div>
            <div class="value">${location || "Not specified"}</div>
          </div>
          <div class="review-item">
            <div class="label">Pillar Type:</div>
            <div class="value">${capitalizeFirstLetter(formData.pillarType) || "Not specified"}</div>
          </div>
          <div class="review-item">
            <div class="label">Pillar Amount:</div>
            <div class="value">${formData.pillarNo || "Not specified"}</div>
          </div>
          <div class="review-item">
            <div class="label">Payment Amount:</div>
            <div class="value">${formatNaira(formData.paymentAmount)}</div>
          </div>
          <div class="review-item">
            <div class="label">Plan Number:</div>
            <div class="value">${formData.planNumber || "Not specified"}</div>
          </div>
          <div class="review-item">
            <div class="label">Land Use:</div>
            <div class="value  ">${formData.landUse || "Layout"}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>.</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            // Uncomment the line below if you want the print window to close after printing
            // window.onfocus = function() { window.close(); }
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  const ReviewItem = ({ icon, label, value }) => (
    <div className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
      <div className="bg-gray-50 p-2 rounded-full">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-base font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )

  // Success screen component
  const SuccessScreen = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center space-y-6 py-10"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="bg-green-100 p-5 rounded-full"
      >
        <CheckCircle className="h-16 w-16 text-green-500" />
      </motion.div>

      <h2 className="text-3xl font-bold text-gray-800">Application Successful!</h2>
      <p className="text-gray-600 max-w-md">
        Your application has been submitted successfully. You will receive a confirmation shortly.
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-6 px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        onClick={() => (window.location.href = "/dashboard")}
      >
        Go to Dashboard
      </motion.button>
    </motion.div>
  )

  return (
    <AnimatePresence mode="wait">
      {isSuccess ? (
        <SuccessScreen />
      ) : (
        <motion.div
          key="review-form"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 max-w-2xl mx-auto"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800">Review & Apply</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Printer className="h-5 w-5" />
              <span className="hidden sm:inline">Print Details</span>
            </motion.button>
          </div>

          <div ref={printContentRef} className="bg-white p-6 rounded-xl shadow-lg space-y-6 scrollbar-hide">
            <ReviewItem
              icon={<FileText className="h-6 w-6 text-blue-500" />}
              label="schedule"
              value={schedule.purpose || "Not specified"}
            />
            <ReviewItem
              icon={<Ruler className="h-6 w-6 text-green-500" />}
              label="Calculated Area"
              value={area ? `${area} m²` : "Not calculated"}
            />
            <ReviewItem
              icon={<MapPin className="h-6 w-6 text-red-500" />}
              label="Location"
              value={location || "Not specified"}
            />
            <ReviewItem
              icon={<PillIcon className="h-6 w-6 text-purple-500" />}
              label="Pillar Type"
              value={formData.pillarType}
            />
            <ReviewItem
              icon={<Hash className="h-6 w-6 text-orange-500" />}
              label="Pillar Amount"
              value={formData.pillarNo}
            />
            <ReviewItem
              icon={<DollarSign className="h-6 w-6 text-red-500" />}
              label="Payment Amount"
              value={formatNaira(formData.paymentAmount)}
            />
            <ReviewItem
              icon={<FileText className="h-6 w-6 text-blue-500" />}
              label="Plan Number"
              value={formData.planNumber || "Not specified"}
            />
            <ReviewItem
              icon={<MapPin className="h-6 w-6 text-indigo-500" />}
              label="Client Name"
              value={formData.clientName || "Not specified"}
            />
            <ReviewItem
              icon={<MapPin className="h-6 w-6 text-teal-500" />}
              label="Client Address"
              value={formData.clientAddress || "Not specified"}
            />
            <ReviewItem
              icon={<PillIcon className="h-6 w-6 text-amber-500" />}
              label="Land Use"
              value={formData.landUse   || "Layout"}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 print:hidden">
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              onClick={prevStep}
              disabled={isLoading}
              className={`flex items-center justify-center px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 w-full sm:w-auto ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </motion.button>
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              onClick={onCancel}
              disabled={isLoading}
              className={`flex items-center justify-center px-6 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 w-full sm:w-auto ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <X className="mr-2 h-5 w-5" />
              Cancel Application
            </motion.button>
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              onClick={handleSubmit}
              disabled={isLoading}
              className={`flex items-center justify-center px-8 py-3 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-colors duration-200 w-full sm:w-auto ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  Apply
                  <CheckCircle className="ml-2 h-5 w-5" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Step6

