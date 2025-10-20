import React from 'react'
import AdminDashboard from '@/components/admin'
import {AdminLayout} from "@/components/layout-admin"

export default function page() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  )
}
