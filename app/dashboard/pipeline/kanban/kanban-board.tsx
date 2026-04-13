// C:\Users\reyme\Videos\instroom\app\dashboard\pipeline\kanban\kanban-board.tsx

"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"
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
} from "@tabler/icons-react"

import InfluencerProfileSidebar, {
  type Partner,
  type Campaign,
} from "@/components/InfluencerProfileSidebar"

// Import the JSON data
import jsonData from "@/app/dashboard/data.json"

// ─── Platform Icons ─────────────────────────────────────────────────────────
export const PLATFORM_ICONS: Record<string, ReactNode> = {
  Instagram: (
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg"
      alt="Instagram"
      className="w-4 h-4"
    />
  ),
  TikTok: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.89 2.89 2.896 2.896 0 0 1-2.889-2.89 2.896 2.896 0 0 1 2.89-2.889c.302 0 .595.05.872.137V9.257a6.339 6.339 0 0 0-5.053 2.212 6.339 6.339 0 0 0-1.33 5.52 6.34 6.34 0 0 0 5.766 4.731 6.34 6.34 0 0 0 6.34-6.34V8.898a7.756 7.756 0 0 0 4.422 1.393V6.825a4.8 4.8 0 0 1-2.443-.139z" />
    </svg>
  ),
  YouTube: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  Twitter: (
    <IconBrandTwitter size={14} className="text-blue-400" />
  ),
}

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
const NICHES = ["Beauty", "Fitness", "Lifestyle", "Food", "Tech", "Fashion", "Travel"]
const LOCATIONS = [
  "Philippines",
  "Singapore",
  "United States",
  "Australia",
  "United Kingdom",
  "Malaysia",
  "Indonesia",
  "Thailand",
  "Vietnam",
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
const getPlatformIcon = (platform?: string): ReactNode => {
  if (!platform) return PLATFORM_ICONS.Instagram
  return PLATFORM_ICONS[platform] || PLATFORM_ICONS.Instagram
}

// ─── Avatar color generator based on name ──────────────────────────────────
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-pink-500", "bg-purple-500", "bg-indigo-500", "bg-blue-500", 
    "bg-cyan-500", "bg-teal-500", "bg-green-500", "bg-yellow-500",
    "bg-orange-500", "bg-red-500", "bg-rose-500"
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
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

// ─── Droppable / Draggable ──────────────────────────────────────────────────
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
      className={`bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-sm transition cursor-grab active:cursor-grabbing ${
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

  // ── Filter panel state (Influencer, Handle, Location, Niche) ─────────────
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [filters, setFilters] = useState({
    influencer: "",
    handle: "",
    location: "all",
    niche: "all",
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

  // ── Filtered data ─────────────────────────────────────────────────────────
  let filteredData = data
    .filter(
      (d) =>
        d.influencer.toLowerCase().includes(search.toLowerCase()) ||
        d.instagramHandle.toLowerCase().includes(search.toLowerCase())
    )
    .filter((d) => (selectedColumnStatus ? d.pipelineStatus === selectedColumnStatus : true))

  // Apply filter panel filters
  if (filters.influencer)
    filteredData = filteredData.filter((p) => 
      p.influencer.toLowerCase().includes(filters.influencer.toLowerCase())
    )
  if (filters.handle)
    filteredData = filteredData.filter((p) => 
      p.instagramHandle.toLowerCase().includes(filters.handle.toLowerCase())
    )
  if (filters.location !== "all")
    filteredData = filteredData.filter((p) => p.location === filters.location)
  if (filters.niche !== "all")
    filteredData = filteredData.filter((p) => p.niche === filters.niche)

  const getItemsByColumn = (columnKey: string) => {
    const status = getStatusFromColumnKey(columnKey)
    return filteredData.filter((item) => item.pipelineStatus === status)
  }

  const hasActiveFilters =
    filters.influencer !== "" ||
    filters.handle !== "" ||
    filters.location !== "all" ||
    filters.niche !== "all" ||
    search !== "" ||
    selectedColumnStatus !== null

  const activeInfluencer = activeId ? data.find((item) => item.id.toString() === activeId) : null

  const selectedColumnInfo = selectedColumnStatus
    ? columns.find((col) => col.status === selectedColumnStatus)
    : null

  // ─── Render Card Content (Clean design matching Closed page) ──────────────
  const renderCardContent = (inf: Influencer) => (
    <div className="flex items-center gap-3">
      {/* Avatar with first letter */}
      <div className={`w-9 h-9 rounded-full ${getAvatarColor(inf.influencer)}/20 flex items-center justify-center text-[#0F6B3E] font-semibold text-sm`}>
        {inf.influencer.charAt(0)}
      </div>
      <div className="flex flex-col text-sm flex-1 min-w-0">
        <span className="font-medium truncate">{inf.influencer}</span>
        <span className="text-xs text-gray-500 truncate">
          {inf.instagramHandle}
        </span>
        <span className="text-xs text-gray-400">
          👥 {inf.followers}
        </span>
      </div>
    </div>
  )

  // ─── Render ───────────────────────────────────────────────────────────────
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

            {/* Floating filter dropdown - Influencer, Handle, Location, Niche */}
            {showFilterPanel && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-30 w-[340px] p-5">
                <div className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-4">Filter by</div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  {/* Influencer Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Influencer</label>
                    <input
                      type="text"
                      value={filters.influencer}
                      onChange={(e) => setFilters((p) => ({ ...p, influencer: e.target.value }))}
                      placeholder="Search by name..."
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1FAE5B]"
                    />
                  </div>

                  {/* Handle */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Handle</label>
                    <input
                      type="text"
                      value={filters.handle}
                      onChange={(e) => setFilters((p) => ({ ...p, handle: e.target.value }))}
                      placeholder="@username..."
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1FAE5B]"
                    />
                  </div>

                  {/* Location */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Location</label>
                    <select
                      value={filters.location}
                      onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1FAE5B] appearance-none cursor-pointer"
                    >
                      <option value="all">All Locations</option>
                      {LOCATIONS.map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  {/* Niche */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Niche</label>
                    <select
                      value={filters.niche}
                      onChange={(e) => setFilters((p) => ({ ...p, niche: e.target.value }))}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1FAE5B] appearance-none cursor-pointer"
                    >
                      <option value="all">All Niches</option>
                      {NICHES.map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-5">
                  <button
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
                    onClick={() =>
                      setFilters({
                        influencer: "",
                        handle: "",
                        location: "all",
                        niche: "all",
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
                    {/* Column header */}
                    <div
                      onClick={() => handleColumnClick(col)}
                      className={`${col.color} text-white rounded-lg px-3 py-2 text-sm font-semibold flex items-center cursor-pointer hover:opacity-90 transition-opacity`}
                    >
                      <span>{items.length} {col.title}</span>
                    </div>

                    {/* Cards - Clean design matching Closed page */}
                    {items.map((inf) => (
                      <DraggableCard key={inf.id} id={inf.id.toString()}>
                        <div onClick={() => openSidebar(inf)} className="cursor-pointer">
                          {renderCardContent(inf)}
                        </div>
                      </DraggableCard>
                    ))}

                    {/* Drop zone */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition">
                      <span>Drop Here</span>
                      <IconPlus size={16} />
                    </div>
                  </DroppableColumn>
                )
              })}
            </div>
          </div>

          <DragOverlay>
            {activeInfluencer ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-lg rotate-2 w-[220px]">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${getAvatarColor(activeInfluencer.influencer)}/20 flex items-center justify-center text-[#0F6B3E] font-semibold text-sm`}>
                    {activeInfluencer.influencer.charAt(0)}
                  </div>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">{activeInfluencer.influencer}</span>
                    <span className="text-xs text-gray-500">
                      {activeInfluencer.instagramHandle}
                    </span>
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
                  {/* Last Contact - Commented out, uncomment when needed */}
                  {/* <th className="px-4 py-3 text-left">Last Contact</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
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
                          <div className={`w-8 h-8 rounded-full ${getAvatarColor(inf.influencer)}/20 flex items-center justify-center text-[#0F6B3E] font-semibold text-xs`}>
                            {inf.influencer.charAt(0)}
                          </div>
                          <span className="font-medium">{inf.influencer}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {getPlatformIcon(inf.platform)}
                          <span>{inf.platform || "Instagram"}</span>
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
                      {/* Last Contact - Commented out, uncomment when needed */}
                      {/* <td className="px-4 py-3 text-gray-500 text-xs">
                        {inf.lastContact ? new Date(inf.lastContact).toLocaleDateString() : "Never"}
                      </td> */}
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