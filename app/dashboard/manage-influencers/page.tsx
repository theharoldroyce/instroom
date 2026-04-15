// app/dashboard/manage-influencers/page.tsx
"use client"

import { useState, useRef, Suspense, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

import TableSheet, {
  type InfluencerRow,
  type CustomColumn,
} from "@/components/table-sheet"
import { useInfluencerData } from "@/hooks/useInfluencerData"
import { LimitExceededDialog } from "@/components/limit-exceeded-dialog"

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function rowHasHandle(row: InfluencerRow): boolean {
  const handle = row.handle?.trim().replace(/^@/, "")
  return !!(handle && handle.length > 0 && row.platform)
}

function buildCreatePayload(row: InfluencerRow, brandId: string) {
  const handle = row.handle.trim().replace(/^@/, "")
  return {
    handle,                                              // store WITHOUT @
    platform: row.platform,
    full_name: row.full_name || row.first_name || null,
    email: row.contact_info || row.email || null,  // contact_info is the editable email field in table
    gender: row.gender || null,
    niche: row.niche || null,
    location: row.location || null,
    bio: row.bio || null,
    profile_image_url: row.profile_image_url || null,
    social_link: row.social_link || null,
    follower_count: parseInt(String(row.follower_count)) || 0,
    engagement_rate: parseFloat(String(row.engagement_rate)) || 0,
    avg_likes: parseInt(String(row.avg_likes)) || 0,
    avg_comments: parseInt(String(row.avg_comments)) || 0,
    avg_views: parseInt(String(row.avg_views)) || 0,
    brandId,
  }
}

function buildUpdatePayload(row: InfluencerRow) {
  return {
    // Influencer (global) fields
    full_name: row.full_name || null,
    email: row.contact_info || row.email || null,
    gender: row.gender || null,
    niche: row.niche || null,
    location: row.location || null,
    bio: row.bio || null,
    profile_image_url: row.profile_image_url || null,
    social_link: row.social_link || null,
    follower_count: parseInt(String(row.follower_count)) || 0,
    engagement_rate: parseFloat(String(row.engagement_rate)) || 0,
    avg_likes: parseInt(String(row.avg_likes)) || 0,
    avg_comments: parseInt(String(row.avg_comments)) || 0,
    avg_views: parseInt(String(row.avg_views)) || 0,
    // BrandInfluencer (relationship) fields
    contact_status: row.contact_status,
    stage: parseInt(String(row.stage)) || 1,
    agreed_rate: row.agreed_rate || null,
    notes: row.notes || null,
    approval_status: row.approval_status,
    approval_notes: row.approval_notes || null,
    transferred_date: row.transferred_date || null,
  }
}

// ─────────────────────────────────────────────────────────────────────────────

function InfluencersContent() {
  const searchParams = useSearchParams()
  const brandId = searchParams.get("brandId")

  const { rows, customColumns, isLoading, error, setCustomColumns } =
    useInfluencerData(brandId)

  // IDs of rows that exist in the DB
  const dbIds = useRef<Set<string>>(new Set())
  // handle (no @) + platform keys already sent to create
  const createdHandles = useRef<Set<string>>(new Set())
  // per-row debounce timers
  const updateTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  // callback to swap temp UUID → real DB id in TableSheet's internal state
  const idSwapCallback = useRef<((tempId: string, realId: string) => void) | null>(null)
  const seeded = useRef(false)

  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)

  // Seed dbIds synchronously during render so it's ready before any callback fires
  if (!isLoading && rows.length > 0 && !seeded.current) {
    seeded.current = true
    rows.forEach((r) => dbIds.current.add(r.id))
  }

  // ── UPDATE existing DB row (debounced 1.2s) ───────────────────────────────
  const scheduleUpdate = useCallback(
    (row: InfluencerRow) => {
      if (!brandId || !dbIds.current.has(row.id)) return

      const existing = updateTimers.current.get(row.id)
      if (existing) clearTimeout(existing)

      const payload = JSON.stringify(buildUpdatePayload(row))

      const timer = setTimeout(async () => {
        updateTimers.current.delete(row.id)
        if (!dbIds.current.has(row.id)) return // deleted while timer pending

        try {
          const res = await fetch(`/api/brand/${brandId}/influencers/${row.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: payload,
          })
          const body = await res.json().catch(() => ({}))
          if (!res.ok) {
            console.error("PUT failed:", res.status, body)
            toast.error(body.error || body.details || `Save failed (${res.status})`)
          } else {
            console.log("PUT ok:", res.status, row.id)
          }
        } catch (err) {
          console.error("PUT network error:", err)
        }
      }, 1200)

      updateTimers.current.set(row.id, timer)
    },
    [brandId]
  )

  // ── CREATE new row ─────────────────────────────────────────────────────────
  const createRow = useCallback(
    async (row: InfluencerRow) => {
      if (!brandId || !rowHasHandle(row)) return

      const handle = row.handle.trim().replace(/^@/, "")
      const key = `${handle}@${row.platform}`
      if (createdHandles.current.has(key)) return
      createdHandles.current.add(key)

      try {
        const res = await fetch("/api/influencers/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildCreatePayload(row, brandId)),
        })

        if (res.ok) {
          const created = await res.json()
          dbIds.current.add(created.id)
          idSwapCallback.current?.(row.id, created.id)
          toast.success(`@${handle} saved`)
        } else if (res.status === 409) {
          const body = await res.json().catch(() => ({}))
          if (body?.id) {
            dbIds.current.add(body.id)
            idSwapCallback.current?.(row.id, body.id)
          }
          // Not an error — just already exists
        } else if (res.status === 403) {
          const body = await res.json().catch(() => ({}))
          if (body.requiresSubscription) setShowSubscriptionDialog(true)
          else toast.error(body.error || "Influencer limit reached")
          createdHandles.current.delete(key)
        } else {
          const body = await res.json().catch(() => ({}))
          toast.error(body.details || body.error || `Failed to save @${handle}`)
          createdHandles.current.delete(key)
        }
      } catch {
        toast.error(`Network error saving @${handle}`)
        createdHandles.current.delete(key)
      }
    },
    [brandId]
  )

  // ── onFetchComplete — Instroom API finished ────────────────────────────────
  // Row now has full data (followers, location, profile pic, etc.)
  // If it's a new row: create it now with complete data
  // If it's an existing row: update it immediately (no debounce)
  const handleFetchComplete = useCallback(
    (row: InfluencerRow) => {
      if (!brandId || !rowHasHandle(row)) return

      if (dbIds.current.has(row.id)) {
        // Existing row — save API data immediately (bypass debounce)
        const existing = updateTimers.current.get(row.id)
        if (existing) clearTimeout(existing)
        fetch(`/api/brand/${brandId}/influencers/${row.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildUpdatePayload(row)),
        }).catch(() => {})
      } else {
        // New row — create with full API data
        createRow(row)
      }
    },
    [brandId, createRow]
  )

  // ── onRowsChange — every table mutation ───────────────────────────────────
  const handleRowsChange = useCallback(
    (updatedRows: InfluencerRow[]) => {
      updatedRows.forEach((row) => {
        if (!rowHasHandle(row)) return

        if (dbIds.current.has(row.id)) {
          // Existing DB row — debounced update
          scheduleUpdate(row)
        } else {
          // New row:
          // - Instagram/TikTok: wait for onFetchComplete (API will enrich first)
          // - YouTube/Twitter/other: create immediately (no API fetch happens)
          const isApiPlatform = row.platform === "instagram" || row.platform === "tiktok"
          if (!isApiPlatform) {
            createRow(row)
          }
        }
      })
    },
    [scheduleUpdate, createRow]
  )

  // ── DELETE ─────────────────────────────────────────────────────────────────
  const handleDeleteRow = useCallback(
    async (rowId: string) => {
      if (!brandId) return
      if (!dbIds.current.has(rowId)) return

      try {
        const res = await fetch(`/api/brand/${brandId}/influencers/${rowId}`, {
          method: "DELETE",
        })
        if (res.ok) {
          dbIds.current.delete(rowId)
          toast.success("Influencer removed")
        } else {
          const body = await res.json().catch(() => ({}))
          toast.error(body.error || "Failed to delete")
        }
      } catch {
        toast.error("Network error — could not delete")
      }
    },
    [brandId]
  )

  // ── Custom columns ─────────────────────────────────────────────────────────
  const handleCustomColumnsChange = useCallback(
    async (cols: CustomColumn[]) => {
      setCustomColumns(cols)
      if (!brandId) return
      for (const col of cols) {
        try {
          await fetch(`/api/brand/${brandId}/custom-fields`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              field_name: col.field_name,
              field_key: col.field_key,
              field_type: col.field_type,
              field_options: col.field_options ?? [],
              assignedGroup: col.assignedGroup,
              description: col.description ?? "",
            }),
          })
        } catch (err) {
          console.error("Failed to persist custom column:", err)
        }
      }
    },
    [brandId, setCustomColumns]
  )

  // ─────────────────────────────────────────────────────────────────────────

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-2 font-medium">Failed to load influencers</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading influencers…</p>
          </div>
        </div>
      ) : (
        <TableSheet
          initialRows={rows}
          initialCustomColumns={customColumns}
          onRowsChange={handleRowsChange}
          onDeleteRow={handleDeleteRow}
          onFetchComplete={handleFetchComplete}
          onCustomColumnsChange={handleCustomColumnsChange}
          onRegisterIdSwap={(fn) => { idSwapCallback.current = fn }}
          brandId={brandId}
        />
      )}

      <LimitExceededDialog
        isOpen={showSubscriptionDialog}
        onClose={() => setShowSubscriptionDialog(false)}
        limitType="influencer"
        current={0}
        max={null}
        title="Subscription Required"
        description="You need a paid plan to add influencers."
        message="Subscribe to a paid plan to start adding influencers to your brand."
      />
    </div>
  )
}

export default function InfluencersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InfluencersContent />
    </Suspense>
  )
}