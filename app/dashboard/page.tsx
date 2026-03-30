'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import data from "./data.json"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [subscriptionChecked, setSubscriptionChecked] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const checkSubscription = async () => {
      if (status === "loading") return
      if (!session?.user) {
        router.replace("/signup")
        return
      }
      const userId = (session.user as any).id
      if (!userId) {
        router.replace("/signup")
        return
      }
      const res = await fetch("/api/subscription/check", {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
        headers: { "Content-Type": "application/json" },
      })
      if (!res.ok) {
        const data = await res.json()
        if (data.error === "No active or trialing subscription. Please subscribe first.") {
          router.replace("/pricing")
          return
        }
        throw new Error(data.error || "Failed to check subscription")
      }
      setIsSubscribed(true)
      setSubscriptionChecked(true)
    }
    checkSubscription()
  }, [status, session, router])

  if (!subscriptionChecked || !isSubscribed) {
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