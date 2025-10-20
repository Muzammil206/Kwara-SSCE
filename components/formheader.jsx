import { User, AlertCircle } from "lucide-react"
import Link from "next/link"

const FormHeader = ({ userid }) => {
  

  return (
    <div className="max-w-3xl mx-auto mt-4 bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800">Welcome, {userid}</h1>
          <div className="flex items-center text-gray-600">
            <Link href="/dashboard">
            <User className="w-5 h-5 mr-2" />
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-blue-50 text-blue-700 p-3">

      </div>
    </div>
  )
}

export default FormHeader


