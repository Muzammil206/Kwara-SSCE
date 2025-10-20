import ResetPasswordPage from "@/components/resetpassword";
import { Suspense } from "react"


export default function Page() {
    return (
      <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading...</div>}>
        <ResetPasswordPage />
      </Suspense>
    )
  }