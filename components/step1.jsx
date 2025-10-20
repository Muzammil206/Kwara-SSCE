"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { motion } from "framer-motion"
import { Upload, CheckCircle, AlertCircle, Download } from "lucide-react"
import { downloadSampleCSV } from "@/utils/downloadSampleCSV"



const Step1 = ({ onFileUpload, nextStep }) => {
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState("")

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const uploadedFile = acceptedFiles[0]
        if (uploadedFile.type === "text/csv") {
          setFile(uploadedFile)
          if (typeof onFileUpload === "function") {
            onFileUpload(uploadedFile)
          }
          setFileError("")
        } else {
          setFileError("Please upload a CSV file")
        }
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800">Step 1: Upload CSV File</h2>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500"}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        {file ? (
          <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            <span>{file.name}</span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive ? "Drop the CSV file here" : "Drag & drop a CSV file here, or click to select one"}
          </p>
        )}
      </div>

      {fileError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center text-red-500">
          <AlertCircle className="mr-2 h-5 w-5" />
          <span>{fileError}</span>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <motion.button
          variant="outline"
          onClick={downloadSampleCSV}
          className="text-sm"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Sample CSV
        </motion.button>
      </div>

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextStep}
          disabled={!file}
          className={`px-6 py-2 rounded-full text-white font-medium
            ${file ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"}
            transition-colors duration-200`}
        >
          Next
        </motion.button>
      </div>
    </motion.div>
  )
}

export default Step1

