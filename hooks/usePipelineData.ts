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
  orderStatus: string | null
  contentPosted: boolean
  approvalStatus: string | null
  approvalNotes: string | null
  agreedRate: number | null
  currency: string | null
  deliverables: string | null
  deadline: string | null
  postUrl: string | null
  likesCount: number
  commentsCount: number
  engagementCount: number
  postedAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  productDetails: string | null
  notes: string       // outreach notes — should NEVER contain NI reason
  internalRating: number | null
  lastContact: string
  createdAt: string
}

interface UsePipelineDataReturn {
  data: PipelineInfluencer[]
  isLoading: boolean
  error: string | null
  updateStatus: (
    id: string,
    newStatus: string,
    extra?: { niReason?: string }
  ) => Promise<boolean>
  refetch: () => void
}

export function usePipelineData(brandId?: string): UsePipelineDataReturn {
  const [data, setData] = useState<PipelineInfluencer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!brandId) {
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch(`/api/brand/${brandId}/pipeline`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to fetch pipeline data")
      }
      const json = await res.json()
      setData(json.data)
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e?.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }, [brandId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateStatus = useCallback(
    async (
      id: string,
      newStatus: string,
      extra?: { niReason?: string }
    ): Promise<boolean> => {
      if (!brandId) return false

      // ── Optimistic update ────────────────────────────────────────────────────
      // Move card to the new column immediately in the UI.
      // For "Not Interested":
      //   - approvalStatus  → "Declined" (so table shows Declined badge)
      //   - approvalNotes   → the NI reason (shows in Approval Details Notes column)
      //   - notes           → NOT touched (outreach notes stay clean)
      // ─────────────────────────────────────────────────────────────────────────
      setData((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item
          if (newStatus === "Not Interested") {
            return {
              ...item,
              pipelineStatus: newStatus,
              approvalStatus: "Declined",
              approvalNotes:  extra?.niReason || "Not interested",
              // notes intentionally NOT changed
            }
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

        if (!res.ok) {
          await fetchData() // revert on failure
          return false
        }

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