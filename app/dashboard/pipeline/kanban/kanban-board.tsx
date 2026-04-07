"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { useDroppable } from "@dnd-kit/core"
import { useDraggable } from "@dnd-kit/core"
import {
  IconLayoutKanban,
  IconList,
  IconSearch,
  IconPlus,
  IconFilter,
  IconGripVertical,
  IconLocation,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandYoutube,
  IconBrandTwitter,
  IconX,
  IconLayoutList,
} from "@tabler/icons-react"

import InfluencerProfileSidebar, {
  type Partner,
  type Campaign,
} from "@/components/InfluencerProfileSidebar"

// Import the JSON data
import jsonData from "@/app/dashboard/data.json"

type Influencer = {
  id: number
  influencer: string
  instagramHandle: string
  followers: string
  engagementRate: string
  niche: string
  pipelineStatus: string
  platform?: string
  location?: string
  lastContact?: string
  notes?: string
  priority?: "high" | "medium" | "low"
  email?: string
  phone?: string
  website?: string
  birthday?: string
}

// ─── Helpers: map Influencer → Partner ──────────────────────────────────────
const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]

function parseFollowers(raw: string): number {
  if (!raw) return 0
  const cleaned = raw.replace(/,/g, "").trim()
  const lower = cleaned.toLowerCase()
  if (lower.endsWith("m")) return parseFloat(lower) * 1_000_000
  if (lower.endsWith("k")) return parseFloat(lower) * 1_000
  return parseInt(cleaned, 10) || 0
}

function parseEngagement(raw: string): number {
  if (!raw) return 0
  return parseFloat(raw.replace("%", "").trim()) || 0
}

function influencerToPartner(inf: Influencer): Partner {
  const nameParts = inf.influencer?.split(" ") || [""]
  const firstName = nameParts[0] || inf.instagramHandle?.replace("@", "").slice(0, 6) || ""
  const lastName = nameParts.slice(1).join(" ") || ""
  const fol = parseFollowers(inf.followers)
  const eng = parseEngagement(inf.engagementRate)

  return {
    id: inf.id,
    handle: inf.instagramHandle || "",
    firstName,
    lastName,
    birthday: inf.birthday || "",
    plat: inf.platform || "Instagram",
    niche: inf.niche || "",
    gend: "",
    loc: inf.location || "",
    tier: "",
    tierOverride: null,
    onRet: false,
    retFee: 0,
    defComm: 0,
    commSt: inf.pipelineStatus || "Pending",
    clicks: 0,
    cvr: 0,
    sales: 0,
    aov: 0,
    rev: 0,
    fol,
    eng,
    avgV: 0,
    gmv: 0,
    added: inf.lastContact ? new Date(inf.lastContact) : new Date(),
    prods: [],
    prodCost: 0,
    feesPaid: 0,
    commPaid: 0,
    totalSpend: 0,
    roi_val: 0,
    roas_val: 0,
    monthly: MONTHS.map((m) => ({ month: m, posts: 0, clicks: 0, rev: 0, eng: 0, sales: 0 })),
    ppm: 0,
    hClicks: 0,
    hSales: 0,
    hRev: 0,
    hCVR: 0,
    hPosts: 0,
  }
}

// ─── Column definitions ─────────────────────────────────────────────────────
const columns = [
  { key: "for-outreach", title: "For Outreach", color: "bg-yellow-400", status: "For Outreach" },
  { key: "contacted", title: "Contacted", color: "bg-orange-400", status: "Contacted" },
  { key: "replied", title: "Replied", color: "bg-blue-400", status: "Replied" },
  { key: "in-progress", title: "In-Progress", color: "bg-pink-400", status: "In-Progress" },
  { key: "not-interested", title: "Not Interested", color: "bg-red-500", status: "Not Interested" },
  { key: "for-order-creation", title: "For Order Creation", color: "bg-green-500", status: "For Order Creation" },
  { key: "in-transit", title: "In-Transit", color: "bg-yellow-500", status: "In-Transit" },
  { key: "delivered", title: "Delivered", color: "bg-cyan-500", status: "Delivered" },
  { key: "posted", title: "Posted", color: "bg-green-600", status: "Posted" },
  { key: "completed", title: "Completed", color: "bg-pink-500", status: "Completed" },
]

const getColumnKey = (status: string): string => {
  const column = columns.find((col) => col.status === status)
  return column ? column.key : status.toLowerCase().replace(/\s+/g, "-")
}

const getStatusFromColumnKey = (key: string): string => {
  const column = columns.find((c) => c.key === key)
  return column ? column.status : key
}

const platforms = ["All", "Instagram", "TikTok", "YouTube", "Twitter"]
const locations = ["All", "USA", "UK", "Canada", "Australia", "India", "Europe", "Asia"]

const getPlatformIcon = (platform?: string) => {
  switch (platform?.toLowerCase()) {
    case "instagram":
      return <IconBrandInstagram size={14} className="text-pink-500" />
    case "tiktok":
      return <IconBrandTiktok size={14} className="text-black" />
    case "youtube":
      return <IconBrandYoutube size={14} className="text-red-500" />
    case "twitter":
      return <IconBrandTwitter size={14} className="text-blue-400" />
    default:
      return <IconBrandInstagram size={14} className="text-gray-400" />
  }
}

// ─── Droppable / Draggable ──────────────────────────────────────────────────
function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 w-[320px] flex-shrink-0 transition-colors ${
        isOver ? "bg-gray-50 rounded-lg" : ""
      }`}
    >
      {children}
    </div>
  )
}

function DraggableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-50 border rounded-xl p-4 hover:shadow-md transition border-gray-200 ${
        isDragging ? "shadow-lg opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <IconGripVertical size={16} />
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function PipelinePage() {
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [data, setData] = useState<Influencer[]>([])
  const [search, setSearch] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Sidebar state — now drives InfluencerProfileSidebar
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)

  // Column filter state for list view
  const [selectedColumnStatus, setSelectedColumnStatus] = useState<string | null>(null)

  // Filter states
  const [platformFilter, setPlatformFilter] = useState<string>("All")
  const [locationFilter, setLocationFilter] = useState<string>("All")
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // Load data from JSON
  useEffect(() => {
    if (jsonData && Array.isArray(jsonData)) {
      const transformedData = jsonData.map((item: any) => ({
        ...item,
        platform: item.platform || "Instagram",
        location: item.location || "USA",
        lastContact: item.lastContact || undefined,
        notes: item.notes || "",
        priority: item.priority || "medium",
        email: item.email || "",
        phone: item.phone || "",
        website: item.website || "",
        birthday: item.birthday || "",
        pipelineStatus:
          item.pipelineStatus && columns.some((col) => col.status === item.pipelineStatus)
            ? item.pipelineStatus
            : "For Outreach",
      }))
      setData(transformedData)
    }
  }, [])

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const draggedId = active.id as string
    const destinationKey = over.id as string
    const draggedInfluencer = data.find((item) => item.id.toString() === draggedId)
    if (!draggedInfluencer) return

    const newStatus = getStatusFromColumnKey(destinationKey)
    if (draggedInfluencer.pipelineStatus === newStatus) return

    setData((prev) =>
      prev.map((item) =>
        item.id === draggedInfluencer.id ? { ...item, pipelineStatus: newStatus } : item
      )
    )

    const columnTitle = columns.find((col) => col.key === destinationKey)?.title
    setShowSuccessMessage(`${draggedInfluencer.influencer} moved to ${columnTitle}`)
    setTimeout(() => setShowSuccessMessage(null), 3000)
  }

  // ── Status update (from sidebar or inline select) ─────────────────────────
  const handleStatusUpdate = (id: number, newStatus: string) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, pipelineStatus: newStatus } : item))
    )
    const influencer = data.find((i) => i.id === id)
    setShowSuccessMessage(`${influencer?.influencer} status updated to ${newStatus}`)
    setTimeout(() => setShowSuccessMessage(null), 2000)
  }

  // ── Open sidebar ──────────────────────────────────────────────────────────
  const openSidebar = (inf: Influencer) => {
    setSelectedPartner(influencerToPartner(inf))
    setSidebarOpen(true)
  }

  // ── Filter helpers ────────────────────────────────────────────────────────
  const clearAllFilters = () => {
    setPlatformFilter("All")
    setLocationFilter("All")
    setSearch("")
    setSelectedColumnStatus(null)
    setShowSuccessMessage("All filters cleared")
    setTimeout(() => setShowSuccessMessage(null), 2000)
  }

  const handleColumnClick = (column: (typeof columns)[0]) => {
    setSelectedColumnStatus(column.status)
    setView("list")
    setShowSuccessMessage(`Showing all influencers in "${column.title}" column`)
    setTimeout(() => setShowSuccessMessage(null), 2000)
  }

  const clearColumnFilter = () => {
    setSelectedColumnStatus(null)
    setShowSuccessMessage("Showing all influencers")
    setTimeout(() => setShowSuccessMessage(null), 2000)
  }

  // ── Filtered data ─────────────────────────────────────────────────────────
  const filteredData = data
    .filter(
      (d) =>
        d.influencer.toLowerCase().includes(search.toLowerCase()) ||
        d.instagramHandle.toLowerCase().includes(search.toLowerCase())
    )
    .filter((d) => (platformFilter !== "All" ? d.platform === platformFilter : true))
    .filter((d) => (locationFilter !== "All" ? d.location === locationFilter : true))
    .filter((d) => (selectedColumnStatus ? d.pipelineStatus === selectedColumnStatus : true))

  const getItemsByColumn = (columnKey: string) => {
    const status = getStatusFromColumnKey(columnKey)
    return filteredData.filter((item) => item.pipelineStatus === status)
  }

  const hasActiveFilters =
    platformFilter !== "All" || locationFilter !== "All" || search !== "" || selectedColumnStatus !== null

  const activeInfluencer = activeId ? data.find((item) => item.id.toString() === activeId) : null

  const selectedColumnInfo = selectedColumnStatus
    ? columns.find((col) => col.status === selectedColumnStatus)
    : null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Success Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2">
          {showSuccessMessage}
        </div>
      )}

      {/* ── Influencer Profile Sidebar ── */}
      {sidebarOpen && selectedPartner && (
        <InfluencerProfileSidebar
          partner={selectedPartner}
          campaigns={[] as Campaign[]}
          allPartners={[]}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative w-full max-w-md">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search influencer..."
            className="w-full pl-9 pr-3 h-10 border border-[#0F6B3E]/20 rounded-lg outline-none focus:ring-2 focus:ring-[#1FAE5B]"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 border ${
                hasActiveFilters ? "bg-[#1FAE5B] text-white border-[#1FAE5B]" : "border-[#0F6B3E]/20"
              }`}
            >
              <IconFilter size={16} />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 bg-white text-[#1FAE5B] rounded-full w-4 h-4 text-xs flex items-center justify-center">
                  {filteredData.length}
                </span>
              )}
            </button>

            {showFilterDropdown && (
              <div className="absolute top-full mt-1 right-0 bg-white border rounded-lg shadow-lg z-10 min-w-[280px] p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Platform</label>
                    <select
                      value={platformFilter}
                      onChange={(e) => setPlatformFilter(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FAE5B] text-sm"
                    >
                      {platforms.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FAE5B] text-sm"
                    >
                      {locations.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="w-full text-sm text-red-500 hover:text-red-700 py-2 border-t mt-2"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setView("kanban"); setSelectedColumnStatus(null) }}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                view === "kanban" ? "bg-[#1FAE5B] text-white" : "border border-[#0F6B3E]/20"
              }`}
            >
              <IconLayoutKanban size={16} />
              Kanban
            </button>
            <button
              onClick={() => { setView("list"); setSelectedColumnStatus(null) }}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                view === "list" ? "bg-[#1FAE5B] text-white" : "border border-[#0F6B3E]/20"
              }`}
            >
              <IconList size={16} />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <IconFilter size={14} />
            <span>Active filters:</span>
            {selectedColumnStatus && selectedColumnInfo && (
              <span className={`${selectedColumnInfo.color} text-white px-2 py-1 rounded-full text-xs flex items-center gap-1`}>
                <IconLayoutList size={12} />
                {selectedColumnInfo.title}
              </span>
            )}
            {platformFilter !== "All" && (
              <span className="bg-white px-2 py-1 rounded-full text-xs border flex items-center gap-1">
                {getPlatformIcon(platformFilter)}
                {platformFilter}
              </span>
            )}
            {locationFilter !== "All" && (
              <span className="bg-white px-2 py-1 rounded-full text-xs border">📍 {locationFilter}</span>
            )}
            {search && (
              <span className="bg-white px-2 py-1 rounded-full text-xs border">🔍 {search}</span>
            )}
          </div>
          <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
            <IconX size={12} />
            Clear all
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Showing {filteredData.length} of {data.length} influencers
      </div>

      {/* ── KANBAN VIEW ── */}
      {view === "kanban" && (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="rounded-xl border border-[#0F6B3E]/10 bg-white p-5 overflow-x-auto">
            <div className="flex gap-5 min-w-max">
              {columns.map((col) => {
                const items = getItemsByColumn(col.key)
                return (
                  <DroppableColumn key={col.key} id={col.key}>
                    <div
                      onClick={() => handleColumnClick(col)}
                      className={`${col.color} text-white rounded-lg px-3 py-2 text-sm font-semibold flex justify-between items-center cursor-pointer hover:opacity-90 transition-opacity`}
                    >
                      <div className="flex items-center gap-2">
                        <IconLayoutList size={16} />
                        <span>{items.length} {col.title}</span>
                      </div>
                    </div>

                    <>
                      {items.map((inf) => (
                        <DraggableCard key={inf.id} id={inf.id.toString()}>
                          <div
                            className="flex flex-col leading-tight flex-1 cursor-pointer"
                            onClick={() => openSidebar(inf)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-[#1FAE5B] flex items-center justify-center text-white font-medium">
                                {inf.influencer?.charAt(0) || "?"}
                              </div>
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm">{inf.influencer}</span>
                                </div>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  {getPlatformIcon(inf.platform)}
                                  {inf.instagramHandle}
                                </span>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-xs text-gray-400">👥 {inf.followers}</span>
                                  <span className="text-xs text-gray-400">💬 {inf.engagementRate}</span>
                                </div>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-xs text-gray-400">🏷️ {inf.niche}</span>
                                  {inf.location && (
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                      <IconLocation size={10} />
                                      {inf.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </DraggableCard>
                      ))}

                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition cursor-pointer">
                        <span>Drop Here</span>
                        <IconPlus size={16} />
                      </div>
                    </>
                  </DroppableColumn>
                )
              })}
            </div>
          </div>

          <DragOverlay>
            {activeInfluencer ? (
              <div className="bg-gray-50 border rounded-xl p-4 shadow-lg rotate-2 border-gray-200 w-[280px]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1FAE5B] flex items-center justify-center text-white font-medium">
                    {activeInfluencer.influencer?.charAt(0) || "?"}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-medium text-sm">{activeInfluencer.influencer}</span>
                    <span className="text-xs text-gray-500">{activeInfluencer.instagramHandle}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* ── LIST VIEW ── */}
      {view === "list" && (
        <div className="bg-white border rounded-xl overflow-hidden">
          {selectedColumnStatus && selectedColumnInfo && (
            <div className={`${selectedColumnInfo.color} px-4 py-3 text-white flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <IconLayoutList size={20} />
                <span className="font-semibold">{selectedColumnInfo.title} Column</span>
                <span className="text-sm bg-white/20 px-2 py-1 rounded">{filteredData.length} influencers</span>
              </div>
              <button onClick={clearColumnFilter} className="text-white hover:bg-white/20 px-2 py-1 rounded transition flex items-center gap-1">
                <IconX size={16} />
                Clear filter
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">Influencer</th>
                  <th className="px-4 py-3 text-left">Platform</th>
                  <th className="px-4 py-3 text-left">Handle</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Followers</th>
                  <th className="px-4 py-3 text-left">Engagement</th>
                  <th className="px-4 py-3 text-left">Niche</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Last Contact</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No influencers found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredData.map((inf) => (
                    <tr
                      key={inf.id}
                      className="border-t hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => openSidebar(inf)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-[#1FAE5B] flex items-center justify-center text-white font-medium text-sm">
                            {inf.influencer?.charAt(0) || "?"}
                          </div>
                          <span className="font-medium">{inf.influencer}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {getPlatformIcon(inf.platform)}
                          <span>{inf.platform}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#0F6B3E] font-medium">{inf.instagramHandle}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <IconLocation size={14} className="text-gray-400" />
                          {inf.location}
                        </div>
                      </td>
                      <td className="px-4 py-3">{inf.followers}</td>
                      <td className="px-4 py-3">{inf.engagementRate}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">{inf.niche}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={inf.pipelineStatus}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleStatusUpdate(inf.id, e.target.value)
                          }}
                          className={`px-2 py-1 rounded text-xs border ${
                            inf.pipelineStatus === "Not Interested"
                              ? "bg-red-100 text-red-700"
                              : "bg-[#1FAE5B]/15 text-[#0F6B3E]"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {columns.map((col) => (
                            <option key={col.status} value={col.status}>{col.title}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {inf.lastContact ? new Date(inf.lastContact).toLocaleDateString() : "Never"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}