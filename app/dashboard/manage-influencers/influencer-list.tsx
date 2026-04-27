"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  IconSearch,
  IconTrash,
  IconLayoutKanban,
  IconHistory,
  IconX,
  IconList,
} from "@tabler/icons-react"

import AddInfluencerModal from "./modal/AddInfluencerModal"
import AddManualInfluencer from "./modal/AddManualInfluencer"
import AddInstagramInfluencer from "./modal/AddInstagramInfluencer"
import AddTiktokCreator from "./modal/AddTiktokCreator"
import ImportInfluencerList from "./modal/ImportInfluencerList"

// ─── Types ────────────────────────────────────────────────────────────────────
type ModalType = "select" | "manual" | "instagram" | "tiktok"

interface AddedBy {
  id: string
  name: string | null
  image: string | null
  added_at: string
}

interface InfluencerRow {
  id: string
  influencer_id: string
  contact_status: string
  stage: number
  approval_status: string | null
  created_at: string
  updated_at: string
  added_by: AddedBy | null
  influencer: {
    id: string
    handle: string
    platform: string
    full_name: string | null
    niche: string | null
    location: string | null
    profile_image_url: string | null
    follower_count: number
    engagement_rate: number
  }
}

interface ActivityLog {
  id: string
  action: string
  label: string
  details: Record<string, unknown>
  created_at: string
  user: {
    id: string
    name: string | null
    image: string | null
    initials: string
  } | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string | null | undefined, fallback = "?") {
  const src = name ?? fallback
  return src
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function Avatar({
  name,
  image,
  size = 8,
}: {
  name?: string | null
  image?: string | null
  size?: number
}) {
  const px = size * 4
  const style = { width: px, height: px, minWidth: px }

  if (image) {
    return (
      <img
        src={image}
        alt={name ?? ""}
        style={style}
        className="rounded-full object-cover flex-shrink-0"
      />
    )
  }
  return (
    <div
      style={style}
      className="rounded-full bg-[#1FAE5B]/20 flex items-center justify-center flex-shrink-0"
    >
      <span className="text-xs font-semibold text-[#0F6B3E]">
        {getInitials(name)}
      </span>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatDetails(
  action: string,
  details: Record<string, unknown>
): string {
  switch (action) {
    case "pipeline.stage_changed":
      return `Stage ${details.from} → ${details.to}`
    case "pipeline.status_changed":
      if (details.ni_reason)
        return `${details.from} → ${details.to} · "${details.ni_reason}"`
      return `${details.from} → ${details.to}`
    case "influencer.approval_changed":
      return `${details.from ?? "—"} → ${details.to}${
        details.notes ? ` · "${details.notes}"` : ""
      }`
    case "influencer.added":
      return `via ${details.method ?? "manual"}${
        details.platform ? ` on ${details.platform}` : ""
      }`
    case "posttracker.stage_changed":
      return `${details.from} → ${details.to}`
    default:
      return ""
  }
}

const ACTION_COLORS: Record<string, string> = {
  "influencer.added":            "bg-green-100 text-green-700",
  "influencer.removed":          "bg-red-100 text-red-600",
  "influencer.approval_changed": "bg-purple-100 text-purple-700",
  "pipeline.stage_changed":      "bg-blue-100 text-blue-700",
  "pipeline.status_changed":     "bg-yellow-100 text-yellow-700",
  "posttracker.stage_changed":   "bg-teal-100 text-teal-700",
  "influencer.submitted":        "bg-orange-100 text-orange-700",
}

const STATUS_COLORS: Record<string, string> = {
  not_contacted:  "bg-gray-100 text-gray-600",
  contacted:      "bg-yellow-100 text-yellow-700",
  responded:      "bg-blue-100 text-blue-700",
  replied:        "bg-blue-100 text-blue-700",
  interested:     "bg-purple-100 text-purple-700",
  agreed:         "bg-green-100 text-green-700",
  not_interested: "bg-red-100 text-red-600",
  email_error:    "bg-orange-100 text-orange-700",
  no_response:    "bg-gray-100 text-gray-500",
  paid_collab:    "bg-emerald-100 text-emerald-700",
  negotiating:    "bg-indigo-100 text-indigo-700",
}

// ─── History Modal ────────────────────────────────────────────────────────────
function HistoryModal({
  brandId,
  influencer,
  onClose,
}: {
  brandId: string
  influencer: InfluencerRow
  onClose: () => void
}) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const url = `/api/brand/${brandId}/influencers/${influencer.id}/activity`
    console.log("[HistoryModal] fetching:", url)
    console.log("[HistoryModal] bi.id:", influencer.id, "| influencer_id:", influencer.influencer_id)

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d) => {
        console.log("[HistoryModal] response:", d)
        setLogs(d.logs ?? [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("[HistoryModal] error:", err)
        setError("Failed to load history")
        setLoading(false)
      })
  }, [brandId, influencer.id])

  const displayName =
    influencer.influencer.full_name || `@${influencer.influencer.handle}`

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-[520px] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Avatar
              name={influencer.influencer.full_name}
              image={influencer.influencer.profile_image_url}
              size={10}
            />
            <div>
              <p className="font-semibold text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-400">
                @{influencer.influencer.handle} · Activity history
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              Loading history...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-red-400">
              <p className="text-sm">{error}</p>
              <p className="text-xs text-gray-400">
                Check the browser console for details
              </p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
              <IconHistory size={36} className="opacity-25" />
              <p className="text-sm font-medium">No activity recorded yet</p>
              <p className="text-xs text-gray-300 text-center max-w-[280px]">
                Actions like adding, approving, or moving this influencer will
                appear here
              </p>
              {/* Debug info — remove after confirming it works */}
              <p className="text-[10px] text-gray-200 font-mono mt-2">
                bi.id: {influencer.id}
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gray-100" />

              <div className="flex flex-col">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-4 pb-6 relative">
                    {/* User avatar */}
                    <div className="flex-shrink-0 z-10">
                      <Avatar
                        name={log.user?.name}
                        image={log.user?.image}
                        size={10}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {log.user?.name ?? "Unknown user"}
                          </span>
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                              ACTION_COLORS[log.action] ??
                              "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {log.label}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                      {formatDetails(log.action, log.details) && (
                        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5 inline-block mt-1">
                          {formatDetails(log.action, log.details)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InfluencerList() {
  const params = useParams()
  const brandId = params?.brandId as string

  const [view, setView] = useState<"table" | "kanban">("table")
  const [influencers, setInfluencers] = useState<InfluencerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [openModal, setOpenModal] = useState(false)
  const [openImport, setOpenImport] = useState(false)
  const [modalType, setModalType] = useState<ModalType>("select")
  const [historyTarget, setHistoryTarget] = useState<InfluencerRow | null>(null)

  const fetchInfluencers = useCallback(async (): Promise<void> => {
    if (!brandId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/brand/${brandId}/influencers`)
      const data = await res.json()
      setInfluencers(data.influencers ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [brandId])

  useEffect(() => {
    fetchInfluencers()
  }, [fetchInfluencers])

  const deleteInfluencer = async (id: string, influencerId: string) => {
    setInfluencers((prev) => prev.filter((i) => i.id !== id))
    await fetch(`/api/brand/${brandId}/influencers/${influencerId}`, {
      method: "DELETE",
    })
  }

  const handleAdded = () => {
    fetchInfluencers()
    setOpenModal(false)
  }

  const filtered = influencers.filter((item) => {
    const name = (item.influencer.full_name ?? "").toLowerCase()
    const handle = item.influencer.handle.toLowerCase()
    const q = search.toLowerCase()
    return name.includes(q) || handle.includes(q)
  })

  return (
    <div className="relative">
      <div className="p-6 flex flex-col gap-6">

        {/* HEADER */}
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-[280px] max-w-[560px] relative">
            <IconSearch
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Search influencer"
              className="pl-9 h-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setModalType("select")
                setOpenModal(true)
              }}
              className="bg-[#1FAE5B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0f6b3e] transition"
            >
              + New Influencer
            </button>
            <button
              onClick={() => setOpenImport(true)}
              className="h-10 px-4 border rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Import
            </button>
            <button className="h-10 px-4 border rounded-lg text-sm hover:bg-gray-50 transition">
              Export
            </button>
            <button className="h-10 px-4 border rounded-lg text-sm hover:bg-gray-50 transition">
              Filter
            </button>
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {loading
              ? "Loading..."
              : `${filtered.length} influencer${filtered.length !== 1 ? "s" : ""}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("table")}
              className={`h-9 w-9 flex items-center justify-center border rounded-md transition ${
                view === "table"
                  ? "border-[#1FAE5B] bg-[#1FAE5B]/10 text-[#0F6B3E]"
                  : "border-gray-300 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <IconList size={16} />
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`h-9 w-9 flex items-center justify-center border rounded-md transition ${
                view === "kanban"
                  ? "border-[#1FAE5B] bg-[#1FAE5B]/10 text-[#0F6B3E]"
                  : "border-gray-300 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <IconLayoutKanban size={16} />
            </button>
          </div>
        </div>

        {/* TABLE VIEW */}
        {view === "table" && (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50/60">
                <tr>
                  <th className="px-3 py-3 w-8" />
                  <th className="px-3 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Profile
                  </th>
                  <th className="px-3 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-3 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Handle
                  </th>
                  <th className="px-3 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Followers
                  </th>
                  <th className="px-3 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Eng %
                  </th>
                  <th className="px-3 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Niche
                  </th>
                  <th className="px-3 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Added by
                  </th>
                  <th className="px-3 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-12 text-gray-400 text-sm"
                    >
                      Loading influencers...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-12 text-gray-500 text-sm"
                    >
                      {search
                        ? `No results for "${search}"`
                        : 'No influencers yet. Click "+ New Influencer" to add one.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="px-3 py-3">
                        <input type="checkbox" />
                      </td>

                      {/* Avatar */}
                      <td className="px-3 py-3">
                        <Avatar
                          name={item.influencer.full_name}
                          image={item.influencer.profile_image_url}
                          size={9}
                        />
                      </td>

                      {/* Name */}
                      <td className="px-3 py-3 font-medium text-gray-900">
                        {item.influencer.full_name ||
                          `@${item.influencer.handle}`}
                      </td>

                      {/* Handle */}
                      <td className="px-3 py-3 text-[#0F6B3E] font-medium">
                        @{item.influencer.handle}
                      </td>

                      {/* Followers */}
                      <td className="px-3 py-3 text-gray-600">
                        {item.influencer.follower_count.toLocaleString()}
                      </td>

                      {/* Engagement */}
                      <td className="px-3 py-3 text-gray-600">
                        {item.influencer.engagement_rate}%
                      </td>

                      {/* Niche */}
                      <td className="px-3 py-3 text-gray-600">
                        {item.influencer.niche ?? "—"}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[item.contact_status] ??
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.contact_status.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Added by */}
                      <td className="px-3 py-3">
                        {item.added_by ? (
                          <div className="relative group inline-flex items-center gap-2">
                            <Avatar
                              name={item.added_by.name}
                              image={item.added_by.image}
                              size={7}
                            />
                            <span className="text-xs text-gray-600 hidden sm:block">
                              {item.added_by.name?.split(" ")[0] ?? "—"}
                            </span>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20 pointer-events-none">
                              <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 whitespace-nowrap shadow-xl">
                                <p className="font-semibold">
                                  {item.added_by.name ?? "Unknown"}
                                </p>
                                <p className="text-gray-400 mt-0.5">
                                  Added{" "}
                                  {formatShortDate(item.added_by.added_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              console.log(
                                "[History] bi.id:", item.id,
                                "| influencer_id:", item.influencer_id
                              )
                              setHistoryTarget(item)
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                            title="View history"
                          >
                            <IconHistory size={15} />
                          </button>
                          <button
                            onClick={() =>
                              deleteInfluencer(item.id, item.influencer_id)
                            }
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                            title="Remove"
                          >
                            <IconTrash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* KANBAN VIEW */}
        {view === "kanban" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(
              [
                { key: "not_contacted",  label: "Not Contacted", color: "bg-gray-400"  },
                { key: "contacted",      label: "Contacted",     color: "bg-yellow-400"},
                { key: "agreed",         label: "Agreed",        color: "bg-green-500" },
                { key: "not_interested", label: "Not Interested",color: "bg-red-400"   },
              ] as const
            ).map(({ key, label, color }) => {
              const stageItems = filtered.filter(
                (i) => i.contact_status === key
              )
              return (
                <div key={key} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <h3 className="text-sm font-semibold text-gray-700">
                      {label}
                    </h3>
                    <span className="ml-auto text-xs text-gray-400 bg-white border rounded-full px-2 py-0.5">
                      {stageItems.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {stageItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition cursor-pointer"
                        onClick={() => {
                          console.log("[History kanban] bi.id:", item.id)
                          setHistoryTarget(item)
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar
                            name={item.influencer.full_name}
                            image={item.influencer.profile_image_url}
                            size={8}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {item.influencer.full_name ||
                                `@${item.influencer.handle}`}
                            </p>
                            <p className="text-xs text-gray-400">
                              @{item.influencer.handle}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                          <span>
                            {item.influencer.follower_count.toLocaleString()}{" "}
                            followers
                          </span>
                          <span>{item.influencer.engagement_rate}% eng</span>
                        </div>
                        {item.added_by && (
                          <div className="flex items-center gap-1.5 pt-2 border-t border-gray-50">
                            <Avatar
                              name={item.added_by.name}
                              image={item.added_by.image}
                              size={5}
                            />
                            <span className="text-[11px] text-gray-400">
                              Added by{" "}
                              {item.added_by.name?.split(" ")[0] ?? "someone"}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    {stageItems.length === 0 && (
                      <div className="text-center py-6 text-gray-300 text-xs border-2 border-dashed border-gray-100 rounded-xl">
                        No influencers here
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── History Modal ── */}
      {historyTarget && (
        <HistoryModal
          brandId={brandId}
          influencer={historyTarget}
          onClose={() => setHistoryTarget(null)}
        />
      )}

      {/* ── Add Influencer Modals ── */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[560px] rounded-2xl shadow-xl p-8">
            {modalType === "select" && (
              <AddInfluencerModal
                setType={setModalType}
                onClose={() => setOpenModal(false)}
              />
            )}
            {modalType === "manual" && (
              <AddManualInfluencer
                onBack={() => setModalType("select")}
                onSave={handleAdded}
              />
            )}
            {modalType === "instagram" && (
              <AddInstagramInfluencer
                onBack={() => setModalType("select")}
                onSave={handleAdded}
              />
            )}
            {modalType === "tiktok" && (
              <AddTiktokCreator
                onBack={() => setModalType("select")}
                onSave={handleAdded}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Import Modal ── */}
      {openImport && (
        <ImportInfluencerList
          close={() => setOpenImport(false)}
          onImport={() => {
            fetchInfluencers()
            setOpenImport(false)
          }}
        />
      )}
    </div>
  )
}