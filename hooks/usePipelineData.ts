// ─── hooks/usePipelineData.ts ────────────────────────────────────────────────

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
  notes: string
  internalRating: number | null
  lastContact: string
  createdAt: string
}

interface UsePipelineDataReturn {
  data: PipelineInfluencer[]
  isLoading: boolean
  error: string | null
  updateStatus: (brandInfluencerId: string, newStatus: string) => Promise<boolean>
  refetch: () => Promise<void>
}

export function usePipelineData(brandId: string | undefined): UsePipelineDataReturn {
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

      // ← singular "brand" to match your route folder
      const res = await fetch(`/api/brand/${brandId}/pipeline`)

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || `HTTP ${res.status}`)
      }

      const json = await res.json()
      setData(json.data)
    } catch (err: any) {
      console.error("Failed to fetch pipeline data:", err)
      setError(err.message || "Failed to load pipeline data")
    } finally {
      setIsLoading(false)
    }
  }, [brandId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateStatus = useCallback(
    async (brandInfluencerId: string, newStatus: string): Promise<boolean> => {
      if (!brandId) return false

      setData((prev) =>
        prev.map((item) =>
          item.id === brandInfluencerId
            ? { ...item, pipelineStatus: newStatus }
            : item
        )
      )

      try {
        // ← singular "brand" to match your route folder
        const res = await fetch(
          `/api/brand/${brandId}/pipeline/${brandInfluencerId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pipelineStatus: newStatus }),
          }
        )

        if (!res.ok) {
          await fetchData()
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody.error || "Update failed")
        }

        return true
      } catch (err: any) {
        console.error("Failed to update status:", err)
        setError(err.message)
        return false
      }
    },
    [brandId, fetchData]
  )

  return { data, isLoading, error, updateStatus, refetch: fetchData }
}