// hooks/useClosedData.ts

import { useState, useEffect, useCallback } from "react"

export type ClosedColumn =
  | "For Order Creation"
  | "In-Transit"
  | "Delivered"
  | "Posted"
  | "Completed"
  | "No post"

export interface ClosedInfluencer {
  // ── Identity ────────────────────────────────────────────────────────────────
  id: string
  influencerId: string
  campaignId: string | null
  campaignName: string | null

  // ── Display ─────────────────────────────────────────────────────────────────
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

  // ── Kanban column ───────────────────────────────────────────────────────────
  closedStatus: ClosedColumn

  // ── Pipeline fields ─────────────────────────────────────────────────────────
  contactStatus: string
  stage: number
  orderStatus: string | null
  contentPosted: boolean
  approvalStatus: string | null
  approvalNotes: string | null

  // ── Content review status (for UI display) ──────────────────────────────────
  scriptStatus: string | null
  contentStatus: string | null

  // ── Collab details ──────────────────────────────────────────────────────────
  agreedRate: number | null
  currency: string | null
  deliverables: string | null
  deadline: string | null
  notes: string

  // ── Campaign type ───────────────────────────────────────────────────────────
  campaignType: string | null

  // ── Order ───────────────────────────────────────────────────────────────────
  productDetails: string | null
  shippedAt: string | null
  deliveredAt: string | null
  trackingNumber: string | null

  // ── Content ─────────────────────────────────────────────────────────────────
  postUrl: string | null
  postedAt: string | null
  likesCount: number
  commentsCount: number
  engagementCount: number

  // ── Paid collab ─────────────────────────────────────────────────────────────
  paidCollabData: PaidCollabData | null

  // ── Meta ────────────────────────────────────────────────────────────────────
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
  refetch: () => void
}

// Helper to infer script/content status from paidCollabData
function inferContentStatuses(inf: any): { scriptStatus: string | null; contentStatus: string | null } {
  const paid = inf.paidCollabData
  if (!paid || !paid.deliverables || paid.deliverables.length === 0) {
    return { scriptStatus: null, contentStatus: null }
  }

  const deliverables = paid.deliverables
  const scriptStatuses = deliverables.map((d: CollabDeliverable) => d.scriptStatus)
  const contentStatuses = deliverables.map((d: CollabDeliverable) => d.contentStatus)

  const allScriptApproved = scriptStatuses.every((s: string) => s === "approved")
  const allContentApproved = contentStatuses.every((s: string) => s === "approved")
  const anyScriptPending = scriptStatuses.some((s: string) => s === "pending" || s === "revision_requested")
  const anyContentPending = contentStatuses.some((s: string) => s === "pending" || s === "revision_requested")

  return {
    scriptStatus: allScriptApproved ? "approved" : anyScriptPending ? "pending" : null,
    contentStatus: allContentApproved ? "approved" : anyContentPending ? "pending" : null,
  }
}

export function useClosedData(brandId?: string): UseClosedDataReturn {
  const [data, setData] = useState<ClosedInfluencer[]>([])
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
      const res = await fetch(`/api/brand/${brandId}/closed`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to fetch closed data")
      }
      const json = await res.json()
      
      // Augment data with inferred statuses
      const augmentedData = json.data.map((inf: any) => ({
        ...inf,
        ...inferContentStatuses(inf),
      }))
      
      setData(augmentedData)
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

  const updateColumn = useCallback(
    async (id: string, newColumn: ClosedColumn): Promise<boolean> => {
      if (!brandId) return false

      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, closedStatus: newColumn } : item
        )
      )

      try {
        const res = await fetch(`/api/brand/${brandId}/closed/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ closedStatus: newColumn }),
        })
        if (!res.ok) {
          await fetchData()
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

  const updatePaidCollab = useCallback(
    async (id: string, paidCollabData: PaidCollabData): Promise<boolean> => {
      if (!brandId) return false

      // Optimistic update with inferred statuses
      setData((prev) =>
        prev.map((item) =>
          item.id === id 
            ? { 
                ...item, 
                paidCollabData,
                ...inferContentStatuses({ paidCollabData }),
              } 
            : item
        )
      )

      try {
        const res = await fetch(`/api/brand/${brandId}/closed/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paidCollabData }),
        })
        if (!res.ok) {
          await fetchData()
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

  return { data, isLoading, error, updateColumn, updatePaidCollab, refetch: fetchData }
}