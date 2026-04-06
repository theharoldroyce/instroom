"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"

import data from "./data.json"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if no session
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Show nothing while checking auth status
  if (status === "loading" || status === "unauthenticated") {
    return null
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />

      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>

      <DataTable data={data} />
    </div>
  )
}