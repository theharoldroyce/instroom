"use client"

import { useState, useEffect, useRef } from "react"
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
  IconPlus,
  IconFilter,
  IconSearch,
  IconLocation,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandYoutube,
  IconBrandTwitter,
  IconX,
  IconLayoutList,
  IconChevronDown,
  IconMail,
  IconSend,
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
  tier?: string
  commSt?: string
}

// ─── Filter constants ───────────────────────────────────────────────────────
const PLATFORMS = ["Instagram", "YouTube", "TikTok"]
const NICHES = ["Beauty", "Fitness", "Lifestyle", "Food", "Tech"]
const LOCATIONS = [
  "Philippines",
  "Singapore",
  "United States",
  "Australia",
  "United Kingdom",
  "Malaysia",
]
const COMMUNITY_STATUS = [
  "Pending",
  "Invited",
  "Joined",
  "Not Interested",
  "Left",
]

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

function getDisplayTier(inf: Influencer): string {
  return inf.tier || "Bronze"
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

const getStatusFromColumnKey = (key: string): string => {
  const column = columns.find((c) => c.key === key)
  return column ? column.status : key
}

// ─── Helper to get status color for table dropdown ──────────────────────────
const getStatusColor = (status: string) => {
  const column = columns.find((c) => c.status === status)
  if (!column) return "bg-gray-100 text-gray-700 border-gray-300"
  switch (column.color) {
    case "bg-yellow-400": return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "bg-orange-400": return "bg-orange-100 text-orange-800 border-orange-300"
    case "bg-blue-400": return "bg-blue-100 text-blue-800 border-blue-300"
    case "bg-pink-400": return "bg-pink-100 text-pink-800 border-pink-300"
    case "bg-red-500": return "bg-red-100 text-red-800 border-red-300"
    case "bg-green-500": return "bg-green-100 text-green-800 border-green-300"
    case "bg-yellow-500": return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "bg-cyan-500": return "bg-cyan-100 text-cyan-800 border-cyan-300"
    case "bg-green-600": return "bg-green-100 text-green-900 border-green-400"
    case "bg-pink-500": return "bg-pink-100 text-pink-800 border-pink-300"
    default: return "bg-gray-100 text-gray-700 border-gray-300"
  }
}

const getOptionDotColor = (status: string) => {
  const column = columns.find((c) => c.status === status)
  return column ? column.color : "bg-gray-400"
}

// ─── Platform helpers ───────────────────────────────────────────────────────
const getPlatformDotColor = (platform?: string) => {
  switch (platform?.toLowerCase()) {
    case "instagram": return "bg-pink-500"
    case "tiktok": return "bg-black"
    case "youtube": return "bg-red-500"
    case "twitter": return "bg-blue-400"
    default: return "bg-gray-400"
  }
}

const getPlatformIcon = (platform?: string) => {
  switch (platform?.toLowerCase()) {
    case "instagram": return <IconBrandInstagram size={14} className="text-pink-500" />
    case "tiktok": return <IconBrandTiktok size={14} className="text-black" />
    case "youtube": return <IconBrandYoutube size={14} className="text-red-500" />
    case "twitter": return <IconBrandTwitter size={14} className="text-blue-400" />
    default: return <IconBrandInstagram size={14} className="text-gray-400" />
  }
}

// ─── Custom Status Dropdown Component ──────────────────────────────────────
function StatusDropdown({
  currentStatus,
  onStatusChange,
}: {
  currentStatus: string
  onStatusChange: (status: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(currentStatus)}`}
      >
        {currentStatus}
        <IconChevronDown size={12} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-20 overflow-hidden min-w-[160px]">
          {columns.map((col, index) => (
            <div
              key={col.status}
              onClick={(e) => { e.stopPropagation(); onStatusChange(col.status); setIsOpen(false) }}
              className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                index !== columns.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${getOptionDotColor(col.status)}`} />
              <span className="text-gray-700">{col.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Droppable / Draggable (whole card is drag handle) ──────────────────────
function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 w-[280px] flex-shrink-0 transition-colors ${
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
      {...listeners}
      {...attributes}
      className={`bg-white border rounded-lg p-3 hover:shadow-md transition cursor-grab active:cursor-grabbing border-gray-200 ${
        isDragging ? "shadow-lg opacity-50" : ""
      }`}
    >
      {children}
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

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)

  // Column filter state for list view
  const [selectedColumnStatus, setSelectedColumnStatus] = useState<string | null>(null)

  // ── Filter panel state (matches your existing filter UI) ──────────────────
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [filters, setFilters] = useState({
    tier: "all",
    platform: "all",
    niche: "all",
    location: "all",
    comm: "all",
  })

  // ── Unsaved changes tracking ──────────────────────────────────────────────
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // ── Follow-up count ───────────────────────────────────────────────────────
  const [followUpCount] = useState(0)

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
        tier: item.tier || "",
        commSt: item.commSt || "Pending",
        pipelineStatus:
          item.pipelineStatus && columns.some((col) => col.status === item.pipelineStatus)
            ? item.pipelineStatus
            : "For Outreach",
      }))
      setData(transformedData)
    }
  }, [])

  // ── Drag handlers (direct move — no modal) ────────────────────────────────
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
    setHasUnsavedChanges(true)
  }

  // ── Save button handler ───────────────────────────────────────────────────
  const handleSave = () => {
    setHasUnsavedChanges(false)
    setShowSuccessMessage("All changes saved!")
    setTimeout(() => setShowSuccessMessage(null), 2000)
  }

  // ── Status update (from list view dropdown) ───────────────────────────────
  const handleStatusUpdate = (id: number, newStatus: string) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, pipelineStatus: newStatus } : item))
    )
    const influencer = data.find((i) => i.id === id)
    setShowSuccessMessage(`${influencer?.influencer} status updated to ${newStatus}`)
    setTimeout(() => setShowSuccessMessage(null), 2000)
    setHasUnsavedChanges(true)
  }

  // ── Open sidebar ──────────────────────────────────────────────────────────
  const openSidebar = (inf: Influencer) => {
    setSelectedPartner(influencerToPartner(inf))
    setSidebarOpen(true)
  }

  // ── Column click → list view ──────────────────────────────────────────────
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

  // ── Filtered data (uses your exact filter logic) ──────────────────────────
  let filteredData = data
    .filter(
      (d) =>
        d.influencer.toLowerCase().includes(search.toLowerCase()) ||
        d.instagramHandle.toLowerCase().includes(search.toLowerCase())
    )
    .filter((d) => (selectedColumnStatus ? d.pipelineStatus === selectedColumnStatus : true))

  if (filters.tier !== "all")
    filteredData = filteredData.filter((p) => getDisplayTier(p) === filters.tier)
  if (filters.platform !== "all")
    filteredData = filteredData.filter((p) => p.platform === filters.platform)
  if (filters.niche !== "all")
    filteredData = filteredData.filter((p) => p.niche === filters.niche)
  if (filters.location !== "all")
    filteredData = filteredData.filter((p) => p.location === filters.location)
  if (filters.comm !== "all")
    filteredData = filteredData.filter((p) => p.commSt === filters.comm)

  const getItemsByColumn = (columnKey: string) => {
    const status = getStatusFromColumnKey(columnKey)
    return filteredData.filter((item) => item.pipelineStatus === status)
  }

  const hasActiveFilters =
    filters.tier !== "all" ||
    filters.platform !== "all" ||
    filters.niche !== "all" ||
    filters.location !== "all" ||
    filters.comm !== "all" ||
    search !== "" ||
    selectedColumnStatus !== null

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

      {/* ── SEARCH BAR + SAVE ── */}
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <IconSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search influencer..."
            className="w-full pl-9 pr-3 h-10 border border-[#0F6B3E]/20 rounded-lg outline-none focus:ring-2 focus:ring-[#1FAE5B] text-sm"
          />
        </div>

        {/* Save button — appears only when there are unsaved changes */}
        {hasUnsavedChanges && (
          <button
            onClick={handleSave}
            className="ml-auto px-5 py-2 bg-green-50 text-[#1FAE5B] border border-[#1FAE5B] rounded-lg text-sm font-semibold hover:bg-green-100 transition whitespace-nowrap"
          >
            Save
          </button>
        )}
      </div>

      {/* ── Follow-up counter + filter/view toggles ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium">
            Follow up {followUpCount}
          </div>
        </div>

        <div className="flex gap-2">
          {/* Filter toggle button + dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 border ${
                hasActiveFilters ? "bg-[#1FAE5B] text-white border-[#1FAE5B]" : "border-[#0F6B3E]/20"
              }`}
            >
              <IconFilter size={16} />
              Filters
            </button>

            {/* Floating filter dropdown */}
            {showFilterPanel && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-30 w-[340px] p-5">
                <div className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-4">Filter by</div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Tier</label>
                    <select
                      value={filters.tier}
                      onChange={(e) => setFilters((p) => ({ ...p, tier: e.target.value }))}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1FAE5B] appearance-none cursor-pointer"
                    >
                      <option value="all">All</option>
                      <option value="Gold">🥇 Gold</option>
                      <option value="Silver">🥈 Silver</option>
                      <option value="Bronze">🥉 Bronze</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Platform</label>
                    <select
                      value={filters.platform}
                      onChange={(e) => setFilters((p) => ({ ...p, platform: e.target.value }))}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1FAE5B] appearance-none cursor-pointer"
                    >
                      <option value="all">All</option>
                      {PLATFORMS.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Niche</label>
                    <select
                      value={filters.niche}
                      onChange={(e) => setFilters((p) => ({ ...p, niche: e.target.value }))}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1FAE5B] appearance-none cursor-pointer"
                    >
                      <option value="all">All</option>
                      {NICHES.map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Location</label>
                    <select
                      value={filters.location}
                      onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1FAE5B] appearance-none cursor-pointer"
                    >
                      <option value="all">All</option>
                      {LOCATIONS.map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Community</label>
                    <select
                      value={filters.comm}
                      onChange={(e) => setFilters((p) => ({ ...p, comm: e.target.value }))}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1FAE5B] appearance-none cursor-pointer"
                    >
                      <option value="all">All</option>
                      {COMMUNITY_STATUS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-5">
                  <button
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
                    onClick={() =>
                      setFilters({
                        tier: "all",
                        platform: "all",
                        niche: "all",
                        location: "all",
                        comm: "all",
                      })
                    }
                  >
                    Clear all
                  </button>
                  <button
                    className="px-5 py-1.5 bg-[#1FAE5B] text-white rounded-lg text-sm font-medium hover:bg-[#178a48] transition"
                    onClick={() => setShowFilterPanel(false)}
                  >
                    Apply
                  </button>
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

      {/* ── KANBAN VIEW ── */}
      {view === "kanban" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 overflow-x-auto">
            <div className="flex gap-4 min-w-max">
              {columns.map((col) => {
                const items = getItemsByColumn(col.key)
                return (
                  <DroppableColumn key={col.key} id={col.key}>
                    {/* Column header — "2 For Outreach" */}
                    <div
                      onClick={() => handleColumnClick(col)}
                      className={`${col.color} text-white rounded-lg px-3 py-2 text-sm font-semibold flex items-center cursor-pointer hover:opacity-90 transition-opacity`}
                    >
                      <span>{items.length} {col.title}</span>
                    </div>

                    {/* Cards */}
                    {items.map((inf) => {
                      const note = inf.notes || ""

                      return (
                        <DraggableCard key={inf.id} id={inf.id.toString()}>
                          {/* Row 1: platform dots + name + mail/send icons */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-3 h-3 rounded-full ${getPlatformDotColor(inf.platform)}`} />
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              <span className="font-medium text-sm ml-1">{inf.influencer}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation() }}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="text-blue-500 hover:text-blue-700 transition"
                                title="Send email"
                              >
                                <IconMail size={16} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation() }}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="text-blue-500 hover:text-blue-700 transition"
                                title="Send message"
                              >
                                <IconSend size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Row 2: followers + engagement */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span className="flex items-center gap-1">
                              👥 {inf.followers}
                            </span>
                            <span className="flex items-center gap-1">
                              💬 {inf.engagementRate}
                            </span>
                          </div>

                          {/* Row 3: note text (if any) */}
                          {note && (
                            <div className="text-xs text-gray-500 mt-1">
                              {note}
                            </div>
                          )}
                        </DraggableCard>
                      )
                    })}

                    {/* Drop zone */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-400 flex items-center justify-center gap-2 hover:bg-gray-50 transition cursor-pointer">
                      <span>Drop Here</span>
                      <IconPlus size={14} />
                    </div>
                  </DroppableColumn>
                )
              })}
            </div>
          </div>

          <DragOverlay>
            {activeInfluencer ? (
              <div className="bg-white border rounded-lg p-3 shadow-lg rotate-2 border-gray-200 w-[260px]">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getPlatformDotColor(activeInfluencer.platform)}`} />
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="font-medium text-sm">{activeInfluencer.influencer}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>👥 {activeInfluencer.followers}</span>
                  <span>💬 {activeInfluencer.engagementRate}</span>
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
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getPlatformDotColor(inf.platform)}`} />
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
                        <StatusDropdown
                          currentStatus={inf.pipelineStatus}
                          onStatusChange={(newStatus) => handleStatusUpdate(inf.id, newStatus)}
                        />
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