import { useState, useEffect, useCallback } from "react"

export type ClosedColumn =
  | "For Order Creation"
  | "In-Transit"
  | "Delivered"
  | "Posted"
  | "No post"

export interface ClosedInfluencer {
  id: string
  influencerId: string
  campaignId: string | null
  campaignName: string | null

  influencer: string
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

  closedStatus: ClosedColumn

  contactStatus: string
  stage: number
  orderStatus: string | null
  contentPosted: boolean
  approvalStatus: string | null
  approvalNotes: string | null

  scriptStatus: string | null
  contentStatus: string | null

  agreedRate: number | null
  currency: string | null
  deliverables: string | null
  deadline: string | null
  notes: string

  campaignType: string | null

  productDetails: string | null
  shippedAt: string | null
  deliveredAt: string | null
  trackingNumber: string | null

  postUrl: string | null
  postedAt: string | null
  likesCount: number
  commentsCount: number
  engagementCount: number

  paidCollabData: PaidCollabData | null

  internalRating: number | null
  lastContact: string
  createdAt: string
}

export interface PaidCollabData {
  contractEnabled: boolean
  contractStatus: string
  contractLink: string
  scriptEnabled: boolean
  postStatus: string
  deliverables: CollabDeliverable[]
  agreedRate: number
  payStructure: "upfront" | "5050" | "after" | "custom"
  milestoneStatuses: string[]
  milestoneProofLinks: string[]
}

export interface CollabDeliverable {
  id: number
  name: string
  scriptStatus: string
  scriptLink: string
  scriptRevs: { num: number; date: string; notes: string }[]
  contentStatus: string
  contentLink: string
  contentRevs: { num: number; date: string; notes: string }[]
}

interface UseClosedDataReturn {
  data: ClosedInfluencer[]
  isLoading: boolean
  error: string | null
  updateColumn: (id: string, newColumn: ClosedColumn) => Promise<boolean>
  updatePaidCollab: (id: string, paidCollabData: PaidCollabData) => Promise<boolean>
  updateCampaignType: (id: string, campaignType: string) => Promise<boolean>
  refetch: () => void
}

// ─────────────────────────────────────────────
// Infer script/content status
// ─────────────────────────────────────────────
function inferContentStatuses(inf: any) {
  const paid = inf.paidCollabData
  if (!paid?.deliverables?.length) {
    return { scriptStatus: null, contentStatus: null }
  }

  const scripts = paid.deliverables.map((d: any) => d.scriptStatus)
  const contents = paid.deliverables.map((d: any) => d.contentStatus)

  return {
    scriptStatus: scripts.every((s: string) => s === "approved")
      ? "approved"
      : scripts.some((s: string) => ["pending", "revision_requested"].includes(s))
      ? "pending"
      : null,

    contentStatus: contents.every((s: string) => s === "approved")
      ? "approved"
      : contents.some((s: string) => ["pending", "revision_requested"].includes(s))
      ? "pending"
      : null,
  }
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────
export function useClosedData(brandId?: string): UseClosedDataReturn {
  const [data, setData] = useState<ClosedInfluencer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ─────────────────────────────────────────
  // Fetch
  // ─────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!brandId) {
      setData([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch(`/api/brand/${brandId}/closed`)

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Fetch failed")
      }

      const json = await res.json()
      const raw = json.data || []

      const validStatuses: ClosedColumn[] = [
        "For Order Creation",
        "In-Transit",
        "Delivered",
        "Posted",
        "No post",
      ]

      const mapped = raw.map((inf: any) => {
        let closedStatus = validStatuses.includes(inf.closedStatus)
          ? inf.closedStatus
          : "For Order Creation"

        return {
          ...inf,
          closedStatus,
          ...inferContentStatuses(inf),
        }
      })

      setData(mapped)
    } catch (err: any) {
      console.error("Fetch error:", err)
      setError(err.message || "Error")
    } finally {
      setIsLoading(false)
    }
  }, [brandId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ─────────────────────────────────────────
  // Update Column
  // ─────────────────────────────────────────
  const updateColumn = useCallback(
    async (id: string, newColumn: ClosedColumn) => {
      if (!brandId) return false

      let prevState: ClosedInfluencer[] = []

      setData((prev) => {
        prevState = prev

        return prev.map((item) =>
          item.id === id
            ? {
                ...item,
                closedStatus: newColumn,
                orderStatus:
                  newColumn === "In-Transit"
                    ? "shipped"
                    : newColumn === "Delivered" || newColumn === "Posted"
                    ? "delivered"
                    : newColumn === "For Order Creation"
                    ? "pending"
                    : null,
                contentPosted: newColumn === "Posted",
              }
            : item
        )
      })

      try {
        const res = await fetch(`/api/brand/${brandId}/closed/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ closedStatus: newColumn }),
        })

        if (!res.ok) {
          setData(prevState)
          return false
        }

        fetchData()
        return true
      } catch {
        setData(prevState)
        return false
      }
    },
    [brandId, fetchData]
  )

  // ─────────────────────────────────────────
  // Update Paid Collab
  // ─────────────────────────────────────────
  const updatePaidCollab = useCallback(
    async (id: string, paidCollabData: PaidCollabData) => {
      if (!brandId) return false

      let prevState: ClosedInfluencer[] = []

      setData((prev) => {
        prevState = prev

        return prev.map((item) =>
          item.id === id
            ? {
                ...item,
                paidCollabData,
                ...inferContentStatuses({ paidCollabData }),
              }
            : item
        )
      })

      try {
        const res = await fetch(`/api/brand/${brandId}/closed/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paidCollabData }),
        })

        if (!res.ok) {
          setData(prevState)
          return false
        }

        fetchData()
        return true
      } catch {
        setData(prevState)
        return false
      }
    },
    [brandId, fetchData]
  )

  // ─────────────────────────────────────────
  // Update Campaign Type
  // ─────────────────────────────────────────
  const updateCampaignType = useCallback(
    async (id: string, campaignType: string) => {
      if (!brandId) return false

      let prevState: ClosedInfluencer[] = []

      setData((prev) => {
        prevState = prev

        return prev.map((item) =>
          item.id === id ? { ...item, campaignType } : item
        )
      })

      try {
        const res = await fetch(`/api/brand/${brandId}/closed/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignType }),
        })

        if (!res.ok) {
          setData(prevState)
          return false
        }

        fetchData()
        return true
      } catch {
        setData(prevState)
        return false
      }
    },
    [brandId, fetchData]
  )

  return {
    data,
    isLoading,
    error,
    updateColumn,
    updatePaidCollab,
    updateCampaignType,
    refetch: fetchData,
  }
}