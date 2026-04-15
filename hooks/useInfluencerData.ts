// ─── hooks/useInfluencerData.ts ──────────────────────────────────────────────
// Fetches influencer rows + custom field definitions from the API.
// Returns data shaped exactly for the TableSheet component.

"use client"

import { useState, useEffect, useCallback } from "react"
import type { InfluencerRow, CustomColumn } from "@/components/table-sheet"

type UseInfluencerDataReturn = {
  rows: InfluencerRow[]
  customColumns: CustomColumn[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  setRows: React.Dispatch<React.SetStateAction<InfluencerRow[]>>
  setCustomColumns: React.Dispatch<React.SetStateAction<CustomColumn[]>>
}

export function useInfluencerData(brandId: string | null): UseInfluencerDataReturn {
  const [rows, setRows] = useState<InfluencerRow[]>([])
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!brandId) {
      setIsLoading(false)
      setError("No brand selected")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/brand/${brandId}/influencers`)

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || `Failed to fetch (${res.status})`)
      }

      const data = await res.json()

      // The API returns { influencers: [...], customFields: [...] }
      const apiRows: InfluencerRow[] = (data.influencers ?? []).map(
        (item: any) => ({
          id: item.id,
          handle: item.handle ?? "",
          platform: item.platform ?? "instagram",
          full_name: item.full_name ?? "",
          email: item.email ?? "",
          follower_count: item.follower_count ?? "",
          engagement_rate: item.engagement_rate ?? "",
          niche: item.niche ?? "",
          contact_status: item.contact_status ?? "not_contacted",
          stage: item.stage ?? "1",
          agreed_rate: item.agreed_rate ?? "",
          notes: item.notes ?? "",
          custom: item.custom ?? {},

          // Extended fields
          gender: item.gender ?? "",
          location: item.location ?? "",
          social_link: item.social_link ?? "",
          first_name: item.full_name
            ? item.full_name.split(" ")[0]
            : "",
          contact_info: item.email ?? "",
          approval_status: item.approval_status ?? "Pending",
          transferred_date: item.transferred_date ?? "",
          approval_notes: item.approval_notes ?? "",
          decline_reason: "",
          tier: "Bronze",
          community_status: "Pending",
          bio: item.bio ?? "",
          profile_image_url: item.profile_image_url ?? "",
          avg_likes: item.avg_likes ?? "",
          avg_comments: item.avg_comments ?? "",
          avg_views: item.avg_views ?? "",
        })
      )

      const apiCustomCols: CustomColumn[] = (data.customFields ?? []).map(
        (cf: any) => ({
          id: cf.id,
          field_key: cf.field_key,
          field_name: cf.field_name,
          field_type: cf.field_type ?? "text",
          field_options: cf.field_options ?? [],
          assignedGroup: cf.assignedGroup ?? "Influencer Details",
          description: cf.description,
        })
      )

      setRows(apiRows)
      setCustomColumns(apiCustomCols)
    } catch (err: any) {
      console.error("useInfluencerData fetch error:", err)
      setError(err.message || "Failed to load influencers")
    } finally {
      setIsLoading(false)
    }
  }, [brandId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    rows,
    customColumns,
    isLoading,
    error,
    refetch: fetchData,
    setRows,
    setCustomColumns,
  }
}