// app/dashboard/manage-influencers/page.tsx
"use client"

import { useState, useRef, Suspense, useCallback, useEffect } from "react"
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
  return {
    handle: row.handle.trim().replace(/^@/, ""),
    platform: row.platform,
    full_name: row.full_name || row.first_name || null,
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
    brandId,
  }
}

function buildUpdatePayload(row: InfluencerRow) {
  const existingLastName = row.full_name
    ? row.full_name.split(" ").slice(1).join(" ")
    : ""
  const rebuiltFullName = row.first_name
    ? existingLastName
      ? `${row.first_name} ${existingLastName}`
      : row.first_name
    : row.full_name || null

  return {
    full_name: rebuiltFullName,
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
// Serial PUT queue — ensures only ONE request runs at a time
// This is the key fix for the connection limit problem.
// Instead of firing 8 PUT requests simultaneously, we process them one-by-one.
// ─────────────────────────────────────────────────────────────────────────────

type QueueItem = {
  url: string
  payload: string
  onError?: (status: number) => void
}

function createPutQueue() {
  const queue: QueueItem[] = []
  let running = false

  async function run() {
    if (running) return
    running = true
    while (queue.length > 0) {
      const item = queue.shift()!
      try {
        const res = await fetch(item.url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: item.payload,
        })
        if (!res.ok) {
          item.onError?.(res.status)
        }
      } catch {
        // Network error — silent, will be retried on next edit
      }
    }
    running = false
  }

  return {
    // Enqueue a PUT — if same URL already queued, replace payload (latest wins)
    enqueue(item: QueueItem) {
      const existing = queue.findIndex((q) => q.url === item.url)
      if (existing >= 0) {
        queue[existing] = item // replace with latest
      } else {
        queue.push(item)
      }
      run()
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────

function InfluencersContent() {
  const searchParams = useSearchParams()
  const rawBrandId = searchParams.get("brandId")
  const brandId = rawBrandId?.trim() || null

  const { rows, customColumns, isLoading, error, setCustomColumns } =
    useInfluencerData(brandId)

  // ── dbIds: Influencer.ids that exist in DB for this brand ─────────────────
  const dbIds = useRef<Set<string>>(new Set())
  const seededForBrand = useRef<string | null>(null)

  useEffect(() => {
    if (!isLoading && rows.length > 0 && brandId && seededForBrand.current !== brandId) {
      seededForBrand.current = brandId
      rows.forEach((r) => dbIds.current.add(r.id))
    }
  }, [isLoading, rows, brandId])

  // ── Prevent PUT storm on mount ────────────────────────────────────────────
  // TableSheet fires onRowsChange on mount. We block PUTs for the first 800ms.
  const readyToSave = useRef(false)
  useEffect(() => {
    if (!isLoading && rows.length > 0) {
      const t = setTimeout(() => { readyToSave.current = true }, 800)
      return () => clearTimeout(t)
    }
  }, [isLoading, rows.length])

  // ── Serial PUT queue (one request at a time) ──────────────────────────────
  const putQueue = useRef(createPutQueue())

  // per-row debounce timers
  const updateTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const createdHandles  = useRef<Set<string>>(new Set())
  const idSwapCallback  = useRef<((tempId: string, realId: string) => void) | null>(null)

  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)

  // ── Schedule PUT for one row (debounced 1.5s, then queued serially) ───────
  const scheduleUpdate = useCallback(
    (row: InfluencerRow) => {
      if (!brandId || !dbIds.current.has(row.id)) return

      const existing = updateTimers.current.get(row.id)
      if (existing) clearTimeout(existing)

      const payload = JSON.stringify(buildUpdatePayload(row))
      const url = `/api/brand/${brandId}/influencers/${row.id}`
      const handle = row.handle

      const timer = setTimeout(() => {
        updateTimers.current.delete(row.id)
        if (!dbIds.current.has(row.id)) return

        putQueue.current.enqueue({
          url,
          payload,
          onError(status) {
            if (status === 404) {
              dbIds.current.delete(row.id)
              toast.error(`Could not save @${handle} — not found. Try refreshing.`)
            } else if (status !== 503) {
              toast.error(`Save failed (${status})`)
            }
          },
        })
      }, 1500)

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
          const realId: string = created.id || created.influencer_id
          dbIds.current.add(realId)
          idSwapCallback.current?.(row.id, realId)
          toast.success(`@${handle} added`)
        } else if (res.status === 409) {
          const body = await res.json().catch(() => ({}))
          const existingId: string = body.id || body.influencer_id || row.id
          dbIds.current.add(existingId)
          if (existingId !== row.id) idSwapCallback.current?.(row.id, existingId)
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

  // ── onFetchComplete — Instroom API enriched a row ─────────────────────────
  const handleFetchComplete = useCallback(
    (row: InfluencerRow) => {
      if (!brandId || !rowHasHandle(row)) return

      if (dbIds.current.has(row.id)) {
        // Existing row — push to queue (serialized)
        const existing = updateTimers.current.get(row.id)
        if (existing) clearTimeout(existing)
        putQueue.current.enqueue({
          url: `/api/brand/${brandId}/influencers/${row.id}`,
          payload: JSON.stringify(buildUpdatePayload(row)),
        })
      } else {
        createRow(row)
      }
    },
    [brandId, createRow]
  )

  // ── onRowsChange — user edited something in the table ─────────────────────
  const handleRowsChange = useCallback(
    (updatedRows: InfluencerRow[]) => {
      // Block PUTs during initial load burst
      if (!readyToSave.current) return

      updatedRows.forEach((row) => {
        if (!rowHasHandle(row)) return

        if (dbIds.current.has(row.id)) {
          scheduleUpdate(row)
        } else {
          const isApiPlatform = row.platform === "instagram" || row.platform === "tiktok"
          if (!isApiPlatform) createRow(row)
        }
      })
    },
    [scheduleUpdate, createRow]
  )

  // ── DELETE ─────────────────────────────────────────────────────────────────
  const handleDeleteRow = useCallback(
    async (rowId: string) => {
      if (!brandId || !dbIds.current.has(rowId)) return

      try {
        const res = await fetch(`/api/brand/${brandId}/influencers/${rowId}`, {
          method: "DELETE",
        })
        if (res.ok || res.status === 404) {
          dbIds.current.delete(rowId)
          if (res.ok) toast.success("Influencer removed")
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
          console.error("[custom-fields] error:", err)
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
          <p className="text-gray-600 mb-2 font-medium">No brand selected</p>
          <p className="text-sm text-gray-500">
            <p className="text-sm text-gray-500">Please select a brand to manage influencers</p>
            {/* Add <code className="bg-gray-100 px-1 rounded text-xs">?brandId=your-brand-id</code> to the URL */}
          </p>
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