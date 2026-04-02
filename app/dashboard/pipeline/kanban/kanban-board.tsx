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
  IconChevronLeft,
  IconLayoutList,
} from "@tabler/icons-react"

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
}

// Map pipeline status to column keys
const getColumnKey = (status: string): string => {
  switch (status) {
    case "Prospect":
      return "prospects"
    case "Reached Out":
      return "reached"
    case "In Conversation":
      return "conversation"
    case "Onboarded":
      return "onboarded"
    case "For Order Creation":
      return "for-creation"
    case "In-Transit":
      return "in-transit"
    case "Delivered":
      return "delivered"
    case "Posted":
      return "posted"
    case "Completed":
      return "completed"
    case "Rejected":
      return "rejected"
    default:
      return status.toLowerCase().replace(/\s+/g, "-")
  }
}

// Map column keys back to pipeline status
const getStatusFromColumnKey = (key: string): string => {
  const col = columns.find((c) => c.key === key)
  return col ? col.status : key
}

const columns = [
  { key: "prospects", title: "Prospects", color: "bg-yellow-400", status: "Prospect" },
  { key: "reached", title: "Reached Out", color: "bg-orange-400", status: "Reached Out" },
  { key: "conversation", title: "In Conversation", color: "bg-blue-400", status: "In Conversation" },
  { key: "onboarded", title: "Onboarded", color: "bg-[#1FAE5B]", status: "Onboarded" },
  { key: "for-creation", title: "For Order Creation", color: "bg-[#1FAE5B]", status: "For Order Creation" },
  { key: "in-transit", title: "In-Transit", color: "bg-yellow-500", status: "In-Transit" },
  { key: "delivered", title: "Delivered", color: "bg-cyan-500", status: "Delivered" },
  { key: "posted", title: "Posted", color: "bg-[#0F6B3E]", status: "Posted" },
  { key: "completed", title: "Completed", color: "bg-pink-500", status: "Completed" },
  { key: "rejected", title: "Rejected", color: "bg-red-500", status: "Rejected" },
]

// Available platforms
const platforms = ["All", "Instagram", "TikTok", "YouTube", "Twitter"]

// Available locations
const locations = ["All", "USA", "UK", "Canada", "Australia", "India", "Europe", "Asia"]

// Platform icons mapping
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

// Droppable column component
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

// Draggable card component
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
        {/* DRAG HANDLE */}
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

export default function PipelinePage() {
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [data, setData] = useState<Influencer[]>([])
  const [search, setSearch] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Filter states
  const [platformFilter, setPlatformFilter] = useState<string>("All")
  const [locationFilter, setLocationFilter] = useState<string>("All")
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  // Column list view state
  const [activeListColumn, setActiveListColumn] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // Load data from JSON file on component mount
  useEffect(() => {
    if (jsonData && Array.isArray(jsonData)) {
      const transformedData = jsonData.map((item: any) => ({
        ...item,
        platform: item.platform || "Instagram",
        location: item.location || "USA",
        lastContact: item.lastContact || undefined,
        notes: item.notes || "",
        priority: item.priority || "medium",
      }))
      setData(transformedData)
    }
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // Handle drag and drop
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

  // Handle column click - toggle list view for that column
  const handleColumnClick = (columnKey: string) => {
    if (activeListColumn === columnKey) {
      setActiveListColumn(null)
    } else {
      setActiveListColumn(columnKey)
    }
  }

  // Group data by column with filters applied
  const getItemsByColumn = (columnKey: string) => {
    const status = getStatusFromColumnKey(columnKey)
    return filteredData.filter((item) => item.pipelineStatus === status)
  }

  // Clear all filters
  const clearAllFilters = () => {
    setPlatformFilter("All")
    setLocationFilter("All")
    setSearch("")
    setShowSuccessMessage("All filters cleared")
    setTimeout(() => setShowSuccessMessage(null), 2000)
  }

  // Filtered data
  const filteredData = data
    .filter(
      (d) =>
        d.influencer.toLowerCase().includes(search.toLowerCase()) ||
        d.instagramHandle.toLowerCase().includes(search.toLowerCase())
    )
    .filter((d) => {
      if (platformFilter !== "All" && d.platform !== platformFilter) return false
      return true
    })
    .filter((d) => {
      if (locationFilter !== "All" && d.location !== locationFilter) return false
      return true
    })

  // Check if any filter is active
  const hasActiveFilters = platformFilter !== "All" || locationFilter !== "All" || search !== ""

  // Get the active dragged influencer for the overlay
  const activeInfluencer = activeId
    ? data.find((item) => item.id.toString() === activeId)
    : null

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2">
          {showSuccessMessage}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* SEARCH */}
        <div className="relative w-full max-w-md">
          <IconSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search influencer..."
            className="w-full pl-9 pr-3 h-10 border border-[#0F6B3E]/20 rounded-lg outline-none focus:ring-2 focus:ring-[#1FAE5B]"
          />
        </div>

        {/* FILTERS */}
        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 border ${
                hasActiveFilters
                  ? "bg-[#1FAE5B] text-white border-[#1FAE5B]"
                  : "border-[#0F6B3E]/20"
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
                  {/* Platform Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Platform</label>
                    <select
                      value={platformFilter}
                      onChange={(e) => setPlatformFilter(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FAE5B] text-sm"
                    >
                      {platforms.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FAE5B] text-sm"
                    >
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
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

          {/* VIEW SWITCH */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setView("kanban")
                setActiveListColumn(null)
              }}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                view === "kanban"
                  ? "bg-[#1FAE5B] text-white"
                  : "border border-[#0F6B3E]/20"
              }`}
            >
              <IconLayoutKanban size={16} />
              Kanban
            </button>
            <button
              onClick={() => {
                setView("list")
                setActiveListColumn(null)
              }}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                view === "list"
                  ? "bg-[#1FAE5B] text-white"
                  : "border border-[#0F6B3E]/20"
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
            {platformFilter !== "All" && (
              <span className="bg-white px-2 py-1 rounded-full text-xs border flex items-center gap-1">
                {getPlatformIcon(platformFilter)}
                {platformFilter}
              </span>
            )}
            {locationFilter !== "All" && (
              <span className="bg-white px-2 py-1 rounded-full text-xs border">
                📍 {locationFilter}
              </span>
            )}
            {search && (
              <span className="bg-white px-2 py-1 rounded-full text-xs border">
                🔍 {search}
              </span>
            )}
          </div>
          <button
            onClick={clearAllFilters}
            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <IconX size={12} />
            Clear all
          </button>
        </div>
      )}

      {/* Show results count */}
      <div className="text-sm text-gray-500">
        Showing {filteredData.length} of {data.length} influencers
      </div>

      {/* KANBAN with Drag and Drop */}
      {view === "kanban" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="rounded-xl border border-[#0F6B3E]/10 bg-white p-5 overflow-x-auto">
            <div className="flex gap-5 min-w-max">
              {columns.map((col) => {
                const items = getItemsByColumn(col.key)
                const isListView = activeListColumn === col.key

                return (
                  <DroppableColumn key={col.key} id={col.key}>
                    {/* COLUMN HEADER */}
                    <div
                      className={`${col.color} text-white rounded-lg px-3 py-2 text-sm font-semibold flex justify-between items-center`}
                    >
                      <div className="flex items-center gap-2">
                        {isListView ? (
                          <button
                            onClick={() => setActiveListColumn(null)}
                            className="hover:bg-white/20 rounded p-1 transition"
                          >
                            <IconChevronLeft size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleColumnClick(col.key)}
                            className="hover:bg-white/20 rounded p-1 transition"
                            title="View as list"
                          >
                            <IconLayoutList size={16} />
                          </button>
                        )}
                        <span>
                          {items.length} {col.title}
                        </span>
                      </div>
                    </div>

                    {/* CONTENT - Either List View or Cards View */}
                    {isListView ? (
                      // LIST VIEW FOR THIS COLUMN
                      <div className="bg-white border rounded-lg overflow-hidden">
                        {items.length === 0 ? (
                          <div className="p-8 text-center text-gray-500 text-sm">
                            No influencers in this stage
                          </div>
                        ) : (
                          <div className="divide-y">
                            {items.map((inf) => (
                              <div key={inf.id} className="p-3 hover:bg-gray-50 transition">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-[#1FAE5B] flex items-center justify-center text-white font-medium text-sm">
                                    {inf.influencer?.charAt(0) || "?"}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium text-sm truncate">
                                        {inf.influencer}
                                      </p>
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                      {getPlatformIcon(inf.platform)}
                                      {inf.instagramHandle}
                                    </p>
                                    <div className="flex gap-2 mt-1 text-xs text-gray-400">
                                      <span>👥 {inf.followers}</span>
                                      <span>💬 {inf.engagementRate}</span>
                                      <span className="flex items-center gap-1">
                                        <IconLocation size={10} />
                                        {inf.location}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">🏷️ {inf.niche}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      // CARD VIEW (Kanban Cards)
                      <>
                        {items.map((inf) => (
                          <DraggableCard key={inf.id} id={inf.id.toString()}>
                            {/* PROFILE AVATAR */}
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-[#1FAE5B] flex items-center justify-center text-white font-medium">
                              {inf.influencer?.charAt(0) || "?"}
                            </div>

                            {/* INFO */}
                            <div className="flex flex-col leading-tight flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-sm">{inf.influencer}</span>
                              </div>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                {getPlatformIcon(inf.platform)}
                                {inf.instagramHandle}
                              </span>
                              <div className="flex gap-2 mt-1">
                                <span className="text-xs text-gray-400">
                                  👥 {inf.followers}
                                </span>
                                <span className="text-xs text-gray-400">
                                  💬 {inf.engagementRate}
                                </span>
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
                          </DraggableCard>
                        ))}

                        {/* DROP AREA */}
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition cursor-pointer">
                          <span>Drop Here</span>
                          <IconPlus size={16} />
                        </div>
                      </>
                    )}
                  </DroppableColumn>
                )
              })}
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeInfluencer ? (
              <div className="bg-gray-50 border rounded-xl p-4 shadow-lg rotate-2 border-gray-200 w-[280px]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1FAE5B] flex items-center justify-center text-white font-medium">
                    {activeInfluencer.influencer?.charAt(0) || "?"}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-medium text-sm">{activeInfluencer.influencer}</span>
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

      {/* LIST VIEW (Global List View) */}
      {view === "list" && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
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
                filteredData.map((inf) => {
                  return (
                    <tr key={inf.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-[#1FAE5B] flex items-center justify-center text-white font-medium text-sm">
                          {inf.influencer?.charAt(0) || "?"}
                        </div>
                        {inf.influencer}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {getPlatformIcon(inf.platform)}
                          <span>{inf.platform}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#0F6B3E] font-medium">
                        {inf.instagramHandle}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <IconLocation size={14} className="text-gray-400" />
                          {inf.location}
                        </div>
                      </td>
                      <td className="px-4 py-3">{inf.followers}</td>
                      <td className="px-4 py-3">{inf.engagementRate}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                          {inf.niche}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={inf.pipelineStatus}
                          onChange={(e) => {
                            setData((prev) =>
                              prev.map((item) =>
                                item.id === inf.id
                                  ? { ...item, pipelineStatus: e.target.value }
                                  : item
                              )
                            )
                            setShowSuccessMessage(
                              `${inf.influencer} status updated to ${e.target.value}`
                            )
                            setTimeout(() => setShowSuccessMessage(null), 3000)
                          }}
                          className={`px-2 py-1 rounded text-xs border ${
                            inf.pipelineStatus === "Onboarded"
                              ? "bg-green-100 text-green-700"
                              : inf.pipelineStatus === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-[#1FAE5B]/15 text-[#0F6B3E]"
                          }`}
                        >
                          <option value="Prospect">Prospect</option>
                          <option value="Reached Out">Reached Out</option>
                          <option value="In Conversation">In Conversation</option>
                          <option value="Onboarded">Onboarded</option>
                          <option value="For Order Creation">For Order Creation</option>
                          <option value="In-Transit">In-Transit</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Posted">Posted</option>
                          <option value="Completed">Completed</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {inf.lastContact
                          ? new Date(inf.lastContact).toLocaleDateString()
                          : "Never"}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
