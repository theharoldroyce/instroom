// hooks/usePipelineData.ts

import { useState, useEffect, useCallback } from "react"

export interface PipelineInfluencer {
  id: string
  influencerId: string
  campaignId: string | null
  campaignName: string | null
  influencer: string
  instagramHandle: string
  handle: string
  platform: string
  followers: string
  followerCount: number
  engagementRate: string
  niche: string
  location: string
  email: string
  profileImageUrl: string | null
  bio: string
  pipelineStatus: string
  contactStatus: string
  stage: number
  approvalStatus: string | null
  approvalNotes: string | null
  // ✅ FIX: added missing fields
  niReason?: string
  addressReceived?: boolean
  agreedRate: number | null
  currency: string | null
  deliverables: string | null
  deadline: string | null
  notes: string
  internalRating: number | null
  lastContact: string
  createdAt: string
}

interface UsePipelineDataReturn {
  data: PipelineInfluencer[]
  isLoading: boolean
  error: string | null
  updateStatus: (id: string, newStatus: string, extra?: { niReason?: string }) => Promise<boolean>
  refetch: () => void
}

// ✅ DB → UI mapping — includes For Order Creation (stage 5)
function mapToPipelineStatus(contactStatus: string, stage: number): string {
  if (contactStatus === "not_interested")    return "Not Interested"
  if (contactStatus === "for_order_creation" || stage === 5) return "For Order Creation"

  switch (stage) {
    case 1:  return "For Outreach"
    case 2:  return "Contacted"
    case 3:  return "In Conversation"
    case 4:  return "Deal Agreed"
    default: return "For Outreach"
  }
}

export function usePipelineData(brandId?: string): UsePipelineDataReturn {
  const [data, setData] = useState<PipelineInfluencer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!brandId) { setIsLoading(false); return }

    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch(`/api/brand/${brandId}/pipeline`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to fetch pipeline data")
      }
      const json = await res.json()
      const mapped = json.data.map((item: any) => ({
        ...item,
        pipelineStatus: mapToPipelineStatus(item.contact_status, item.stage),
        contactStatus:  item.contact_status,
        // ✅ FIX: map niReason from DB approval_notes
        niReason:       item.approval_notes ?? undefined,
        addressReceived: false,
      }))
      setData(mapped)
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e?.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }, [brandId])

  useEffect(() => { fetchData() }, [fetchData])

  const updateStatus = useCallback(
    async (id: string, newStatus: string, extra?: { niReason?: string }): Promise<boolean> => {
      if (!brandId) return false

      // ✅ Optimistic UI update
      setData((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          if (newStatus === "Not Interested") {
            return { ...item, pipelineStatus: newStatus, approvalStatus: "Declined", approvalNotes: extra?.niReason || "Not interested", niReason: extra?.niReason }
          }
          return { ...item, pipelineStatus: newStatus }
        })
      )

      try {
        const res = await fetch(`/api/brand/${brandId}/pipeline/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pipelineStatus: newStatus,
            ...(extra?.niReason ? { niReason: extra.niReason } : {}),
          }),
        })
        if (!res.ok) { await fetchData(); return false }
        return true
      } catch {
        await fetchData()
        return false
      }
    },
    [brandId, fetchData]
  )

  return { data, isLoading, error, updateStatus, refetch: fetchData }
}