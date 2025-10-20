'use client'
import dynamic from "next/dynamic";

const AdminMap = dynamic(() => import("@/components/oneparcelMap"), { ssr: false });

export default function AdminMapPage() {
  return <AdminMap />;
}
