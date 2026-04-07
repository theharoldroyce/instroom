"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import TableSheet from "@/components/table-sheet"
// import InfluencerList from "./influencer-list"

export default function InfluencersPage() {
  const searchParams = useSearchParams()
  const [brandId, setBrandId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const id = searchParams.get("brandId")
    setBrandId(id)
  }, [searchParams])

  if (!mounted) {
    return null
  }

  if (!brandId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No brand selected</p>
          <p className="text-sm text-gray-500">Please select a brand to manage influencers</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <TableSheet brandId={brandId} />
         {/* <InfluencerList /> */}
      </div>
    </div>
  )
}