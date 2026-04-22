// app/dashboard/manage-influencers/page.tsx
"use client"

import { useState, useRef, Suspense, useCallback, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import TableSheet, {
  type InfluencerRow,
  type CustomColumn,
} from "@/components/table-sheet"
import { useInfluencerData } from "@/hooks/useInfluencerData"
import { LimitExceededDialog } from "@/components/limit-exceeded-dialog"
import { WorkspaceUnavailableModal } from "@/components/workspace-unavailable-modal"

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
        // Network error — silent
      }
    }
    running = false
  }

  return {
    enqueue(item: QueueItem) {
      const existing = queue.findIndex((q) => q.url === item.url)
      if (existing >= 0) {
        queue[existing] = item
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
  const router = useRouter()
  const rawBrandId = searchParams.get("brandId")
  const brandId = rawBrandId?.trim() || null

  const { rows, customColumns, isLoading, error, setCustomColumns } =
    useInfluencerData(brandId)

  // ── Auto-select owned brand if no brandId provided ──────────────────────────
  useEffect(() => {
    if (brandId) return // Already have a brandId, don't auto-select

    const autoSelectBrand = async () => {
      try {
        const res = await fetch("/api/brand/list")
        if (res.ok) {
          const data = await res.json()
          const brands = data.brands || []
          
          // Find the first brand owned by this user
          const ownedBrand = brands.find((b: any) => b.owner === true)
          if (ownedBrand) {
            router.push(`/dashboard/manage-influencers?brandId=${ownedBrand.id}`)
          }
        }
      } catch (err) {
        // Silent fail - user can manually select brand
      }
    }

    autoSelectBrand()
  }, [brandId, router])

  // ── dbIds: Influencer.ids confirmed in DB for this brand ──────────────────
  const dbIds = useRef<Set<string>>(new Set())
  const seededForBrand = useRef<string | null>(null)

  // Fetch brand name for the modal
  useEffect(() => {
    if (!brandId) return
    
    const fetchBrandName = async () => {
      try {
        const res = await fetch(`/api/brands/me?brandId=${brandId}`)
        if (res.ok) {
          const data = await res.json()
          const brand = data.brands?.find((b: any) => b.id === brandId)
          if (brand) {
            setSelectedBrandName(brand.name)
          }
        }
      } catch (err) {
        // Silent fail - we have the brandId anyway
      }
    }
    
    fetchBrandName()
  }, [brandId])

  useEffect(() => {
    if (!isLoading && brandId && seededForBrand.current !== brandId) {
      seededForBrand.current = brandId
      // Seed ALL loaded rows — even if rows is empty (fresh brand)
      rows.forEach((r) => dbIds.current.add(r.id))
    }
  }, [isLoading, rows, brandId])

  // ── Prevent PUT storm on mount ────────────────────────────────────────────
  // FIX 1: readyToSave only gates EDIT-triggered saves, not import saves.
  // We expose a separate importSave path that bypasses this guard.
  const readyToSave = useRef(false)
  useEffect(() => {
    if (!isLoading) {
      // Wait a tick after loading finishes — whether there are rows or not.
      const t = setTimeout(() => {
        readyToSave.current = true
      }, 800)
      return () => clearTimeout(t)
    }
  }, [isLoading])

  // ── Serial PUT queue ──────────────────────────────────────────────────────
  const putQueue = useRef(createPutQueue())

  // per-row debounce timers
  const updateTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // FIX 1: Track which handles we've ALREADY created so the Instroom API
  // re-fetch (autoFetchInfluencer) doesn't re-create a row that was just
  // fetched on load.  Key = "handle@platform".
  const createdHandles = useRef<Set<string>>(new Set())
  const idSwapCallback = useRef<((tempId: string, realId: string) => void) | null>(null)

  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
  const [showWorkspaceUnavailableModal, setShowWorkspaceUnavailableModal] = useState(false)
  const [selectedBrandName, setSelectedBrandName] = useState<string>("")

  const handleWorkspaceUnavailableClose = () => {
    setShowWorkspaceUnavailableModal(false)
    router.push("/dashboard")
  }

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

  // ── CREATE new row ────────────────────────────────────────────────────────
  const createRow = useCallback(
    async (row: InfluencerRow, skipToast = false) => {
      if (!brandId || !rowHasHandle(row)) return null

      const handle = row.handle.trim().replace(/^@/, "")
      const key = `${handle}@${row.platform}`
      if (createdHandles.current.has(key)) return null
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
          if (!skipToast) toast.success(`@${handle} added`)
          return realId
        } else if (res.status === 409) {
          // Already exists globally — link it to this brand
          const body = await res.json().catch(() => ({}))
          const existingId: string = body.id || body.influencer_id || row.id
          dbIds.current.add(existingId)
          if (existingId !== row.id) idSwapCallback.current?.(row.id, existingId)
          return existingId
        } else if (res.status === 403) {
          const body = await res.json().catch(() => ({}))
          if (body.requiresSubscription) setShowSubscriptionDialog(true)
          else toast.error(body.error || "Influencer limit reached")
          createdHandles.current.delete(key)
          return null
        } else {
          const body = await res.json().catch(() => ({}))
          if (!skipToast) toast.error(body.details || body.error || `Failed to save @${handle}`)
          createdHandles.current.delete(key)
          return null
        }
      } catch {
        if (!skipToast) toast.error(`Network error saving @${handle}`)
        createdHandles.current.delete(key)
        return null
      }
    },
    [brandId]
  )

  // ── FIX 1: onFetchComplete — Instroom API enriched a row ─────────────────
  // ONLY save if the row is ALREADY in dbIds (i.e. it existed before the fetch).
  // If the row is new (not yet in DB), createRow will handle saving it when
  // the user finishes typing — we must NOT trigger a second create here.
  const handleFetchComplete = useCallback(
    (row: InfluencerRow) => {
      if (!brandId || !rowHasHandle(row)) return

      if (dbIds.current.has(row.id)) {
        // Row already exists — just update the enriched fields
        const existing = updateTimers.current.get(row.id)
        if (existing) clearTimeout(existing)
        putQueue.current.enqueue({
          url: `/api/brand/${brandId}/influencers/${row.id}`,
          payload: JSON.stringify(buildUpdatePayload(row)),
        })
      }
      // If NOT in dbIds: this is a new row mid-creation. The handle-blur in
      // applyCellValue will trigger createRow via handleRowsChange once the
      // platform is also set. Don't double-create here.
    },
    [brandId]
  )

  // ── onRowsChange — user edited something in the table ─────────────────────
  const handleRowsChange = useCallback(
    (updatedRows: InfluencerRow[]) => {
      if (!readyToSave.current) return

      updatedRows.forEach((row) => {
        if (!rowHasHandle(row)) return

        if (dbIds.current.has(row.id)) {
          scheduleUpdate(row)
        } else {
          // FIX 1: Only auto-create for non-API platforms (youtube, twitter, other).
          // For instagram/tiktok, autoFetchInfluencer fires first; createRow is
          // called from handleFetchComplete ONLY after the API enriches the row.
          // This prevents the double-create race condition.
          const isApiPlatform =
            row.platform === "instagram" || row.platform === "tiktok"
          if (!isApiPlatform) createRow(row)
        }
      })
    },
    [scheduleUpdate, createRow]
  )

  // ── FIX 3: onImportRows — batch save all imported rows ───────────────────
  // Import bypasses readyToSave and the platform guard because imported rows
  // already have a handle and we want them all saved immediately.
  const handleImportRows = useCallback(
    async (importedRows: InfluencerRow[]) => {
      if (!brandId) return

      const validRows = importedRows.filter(rowHasHandle)
      if (!validRows.length) return

      let savedCount = 0
      let skippedCount = 0

      // Save concurrently in batches of 5 to avoid overwhelming the server
      const BATCH = 5
      for (let i = 0; i < validRows.length; i += BATCH) {
        const batch = validRows.slice(i, i + BATCH)
        await Promise.all(
          batch.map(async (row) => {
            const realId = await createRow(row, true /* skipToast */)
            if (realId) {
              savedCount++
            } else {
              skippedCount++
            }
          })
        )
      }

      if (savedCount > 0)
        toast.success(
          `Imported ${savedCount} influencer${savedCount !== 1 ? "s" : ""}${skippedCount ? ` (${skippedCount} skipped — duplicates or limit reached)` : ""}`
        )
      else if (skippedCount > 0)
        toast.warning(`${skippedCount} rows skipped — already exist or limit reached`)
    },
    [brandId, createRow]
  )

  // ── DELETE ────────────────────────────────────────────────────────────────
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

  // ── Custom columns ────────────────────────────────────────────────────────
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
            Add{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">
              ?brandId=your-brand-id
            </code>{" "}
            to the URL
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    const isSubscriptionExpired = error.toLowerCase().includes("subscription expired")
    const isWorkspaceUnavailable = error.toLowerCase().includes("workspace is unavailable") || error.toLowerCase().includes("subscription is inactive")
    
    if (isSubscriptionExpired) {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Subscription Expired</h2>
              <p className="text-sm text-gray-600 mt-2">Your subscription has expired. Please renew it to access your workspace and continue working with your influencers.</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-900">
                Renew your subscription now to regain full access to all features.
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => window.location.href = "/pricing"}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Renew Subscription
              </button>
              <button
                onClick={() => window.location.href = "/dashboard"}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }
    
    if (isWorkspaceUnavailable) {
      return (
        <WorkspaceUnavailableModal
          open={true}
          onOpenChange={setShowWorkspaceUnavailableModal}
          workspaceName={selectedBrandName || "Workspace"}
          onClose={handleWorkspaceUnavailableClose}
        />
      )
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-2 font-medium">
            Failed to load influencers
          </p>
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
          onImportRows={handleImportRows}
          onRegisterIdSwap={(fn) => {
            idSwapCallback.current = fn
          }}
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

      <WorkspaceUnavailableModal
        open={showWorkspaceUnavailableModal}
        onOpenChange={setShowWorkspaceUnavailableModal}
        onClose={handleWorkspaceUnavailableClose}
        workspaceName={selectedBrandName}
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