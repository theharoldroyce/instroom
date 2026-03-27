"use client"

import { useState, useEffect } from "react"
import {
  IconLayoutKanban,
  IconList,
  IconSearch,
  IconPlus,
  IconCalendar,
  IconBell,
  IconFilter,
  IconClock,
  IconAlertCircle,
  IconGripVertical
} from "@tabler/icons-react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"

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
  lastContact?: string
  nextFollowUp?: string
  followUpCount?: number
  notes?: string
  priority?: "high" | "medium" | "low"
}

// Map pipeline status to column keys
const getColumnKey = (status: string): string => {
  switch(status) {
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
      return status.toLowerCase().replace(/\s+/g, '-')
  }
}

// Map column keys back to pipeline status
const getStatusFromColumnKey = (columnKey: string): string => {
  const statusMap: Record<string, string> = {
    "prospects": "Prospect",
    "reached": "Reached Out",
    "conversation": "In Conversation",
    "onboarded": "Onboarded",
    "for-creation": "For Order Creation",
    "in-transit": "In-Transit",
    "delivered": "Delivered",
    "posted": "Posted",
    "completed": "Completed",
    "rejected": "Rejected"
  }
  return statusMap[columnKey] || columnKey
}

const columns = [
  { key: "prospects", title: "Prospects", color: "bg-yellow-400" },
  { key: "reached", title: "Reached Out", color: "bg-orange-400" },
  { key: "conversation", title: "In Conversation", color: "bg-blue-400" },
  { key: "onboarded", title: "Onboarded", color: "bg-[#1FAE5B]" },
  { key: "for-creation", title: "For Order Creation", color: "bg-[#1FAE5B]" },
  { key: "in-transit", title: "In-Transit", color: "bg-yellow-500" },
  { key: "delivered", title: "Delivered", color: "bg-cyan-500" },
  { key: "posted", title: "Posted", color: "bg-[#0F6B3E]" },
  { key: "completed", title: "Completed", color: "bg-pink-500" },
  { key: "rejected", title: "Rejected", color: "bg-red-500" },
]

export default function PipelinePage() {
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [data, setData] = useState<Influencer[]>([])
  const [search, setSearch] = useState("")
  const [showFollowUpFilter, setShowFollowUpFilter] = useState(false)
  const [followUpFilter, setFollowUpFilter] = useState<"all" | "overdue" | "today" | "this-week">("all")
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null)

  // Load data from JSON file on component mount
  useEffect(() => {
    if (jsonData && Array.isArray(jsonData)) {
      // Transform the data to include additional fields
      const transformedData = jsonData.map((item: any) => ({
        ...item,
        // Add optional fields for follow-up functionality
        lastContact: item.lastContact || undefined,
        nextFollowUp: item.nextFollowUp || undefined,
        followUpCount: item.followUpCount || 0,
        notes: item.notes || "",
        priority: item.priority || "medium"
      }))
      setData(transformedData)
    }
  }, [])

  // Function to check if follow-up is needed
  const isFollowUpNeeded = (influencer: Influencer): { needed: boolean; type: "overdue" | "today" | "this-week" | "none" } => {
    if (!influencer.nextFollowUp) return { needed: false, type: "none" }
    
    const today = new Date()
    const followUpDate = new Date(influencer.nextFollowUp)
    const diffDays = Math.ceil((followUpDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { needed: true, type: "overdue" }
    if (diffDays === 0) return { needed: true, type: "today" }
    if (diffDays <= 7) return { needed: true, type: "this-week" }
    
    return { needed: false, type: "none" }
  }

  // Function to update follow-up
  const updateFollowUp = (id: number, newDate: string) => {
    setData(prev => prev.map(item => 
      item.id === id 
        ? { 
            ...item, 
            nextFollowUp: newDate,
            followUpCount: (item.followUpCount || 0) + 1,
            lastContact: new Date().toISOString().split('T')[0]
          }
        : item
    ))
    setShowSuccessMessage("Follow-up scheduled successfully!")
    setTimeout(() => setShowSuccessMessage(null), 3000)
  }

  // Handle drag and drop
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    // If there's no destination or it's the same as source, do nothing
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Get the influencer that was dragged
    const draggedInfluencer = data.find(item => item.id.toString() === draggableId)
    if (!draggedInfluencer) return

    // Update the influencer's status based on the new column
    const newStatus = getStatusFromColumnKey(destination.droppableId)
    
    // Update the data
    setData(prev => prev.map(item => 
      item.id === draggedInfluencer.id 
        ? { ...item, pipelineStatus: newStatus }
        : item
    ))

    // Show success message
    const columnTitle = columns.find(col => col.key === destination.droppableId)?.title
    setShowSuccessMessage(`${draggedInfluencer.influencer} moved to ${columnTitle}`)
    setTimeout(() => setShowSuccessMessage(null), 3000)
  }

  // Group data by column
  const getItemsByColumn = (columnKey: string) => {
    const status = getStatusFromColumnKey(columnKey)
    return filtered.filter(item => item.pipelineStatus === status)
  }

  const filtered = data
    .filter((d) =>
      d.influencer.toLowerCase().includes(search.toLowerCase()) ||
      d.instagramHandle.toLowerCase().includes(search.toLowerCase())
    )
    .filter((d) => {
      if (followUpFilter === "all") return true
      const followUpStatus = isFollowUpNeeded(d)
      return followUpStatus.needed && followUpStatus.type === followUpFilter
    })

  const getFollowUpBadge = (influencer: Influencer) => {
    const followUpStatus = isFollowUpNeeded(influencer)
    if (!followUpStatus.needed || followUpStatus.type === 'none') return null
    
    const badges = {
      overdue: { text: "Overdue", color: "bg-red-100 text-red-700", icon: IconAlertCircle },
      today: { text: "Today", color: "bg-orange-100 text-orange-700", icon: IconClock },
      "this-week": { text: "This Week", color: "bg-yellow-100 text-yellow-700", icon: IconCalendar }
    }
    
    const badge = badges[followUpStatus.type]
    const Icon = badge.icon
    
    return (
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${badge.color}`}>
        <Icon size={12} />
        <span>{badge.text}</span>
      </div>
    )
  }

  const FollowUpModal = ({ influencer, onClose }: { influencer: Influencer; onClose: () => void }) => {
    const [newDate, setNewDate] = useState(influencer.nextFollowUp || "")
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-96">
          <h3 className="text-lg font-semibold mb-4">Schedule Follow-up</h3>
          <p className="text-sm text-gray-600 mb-4">
            {influencer.influencer} - {influencer.instagramHandle}
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Next Follow-up Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1FAE5B]"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (newDate) {
                  updateFollowUp(influencer.id, newDate)
                  onClose()
                }
              }}
              className="px-4 py-2 bg-[#1FAE5B] text-white rounded-lg hover:bg-[#0F6B3E] transition"
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2">
          {showSuccessMessage}
        </div>
      )}

      {selectedInfluencer && (
        <FollowUpModal 
          influencer={selectedInfluencer} 
          onClose={() => setSelectedInfluencer(null)} 
        />
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
              onClick={() => setShowFollowUpFilter(!showFollowUpFilter)}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 border ${
                followUpFilter !== "all" 
                  ? "bg-[#1FAE5B] text-white border-[#1FAE5B]" 
                  : "border-[#0F6B3E]/20"
              }`}
            >
              <IconFilter size={16} />
              Follow-up
              {followUpFilter !== "all" && (
                <span className="ml-1 bg-white text-[#1FAE5B] rounded-full w-4 h-4 text-xs flex items-center justify-center">
                  {filtered.length}
                </span>
              )}
            </button>
            
            {showFollowUpFilter && (
              <div className="absolute top-full mt-1 right-0 bg-white border rounded-lg shadow-lg z-10 min-w-[150px]">
                {[
                  { value: "all", label: "All" },
                  { value: "overdue", label: "Overdue" },
                  { value: "today", label: "Today" },
                  { value: "this-week", label: "This Week" }
                ].map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => {
                      setFollowUpFilter(filter.value as any)
                      setShowFollowUpFilter(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      followUpFilter === filter.value ? "text-[#1FAE5B] font-medium" : ""
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* VIEW SWITCH */}
          <div className="flex gap-2">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                view === "kanban"
                  ? "bg-[#1FAE5B] text-white"
                  : "border border-[#0F6B3E]/20"
              }`}
            >
              <IconLayoutKanban size={16}/>
              Kanban
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                view === "list"
                  ? "bg-[#1FAE5B] text-white"
                  : "border border-[#0F6B3E]/20"
              }`}
            >
              <IconList size={16}/>
              List
            </button>
          </div>
        </div>
      </div>

      {/* KANBAN with Drag and Drop */}
      {view === "kanban" && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="rounded-xl border border-[#0F6B3E]/10 bg-white p-5 overflow-x-auto">
            <div className="flex gap-5 min-w-max">
              {columns.map((col) => {
                const items = getItemsByColumn(col.key)
                const needsFollowUpCount = items.filter(i => isFollowUpNeeded(i).needed).length

                return (
                  <Droppable key={col.key} droppableId={col.key}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex flex-col gap-3 w-[280px] flex-shrink-0 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-gray-50 rounded-lg' : ''
                        }`}
                      >
                        {/* COLUMN HEADER */}
                        <div className={`${col.color} text-white rounded-lg px-3 py-2 text-sm font-semibold flex justify-between items-center`}>
                          <span>{items.length} {col.title}</span>
                          {needsFollowUpCount > 0 && (
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                              {needsFollowUpCount} need follow-up
                            </span>
                          )}
                        </div>

                        {/* CARDS */}
                        {items.map((inf, index) => {
                          const followUpStatus = isFollowUpNeeded(inf)
                          return (
                            <Draggable key={inf.id} draggableId={inf.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`bg-gray-50 border rounded-xl p-4 hover:shadow-md transition ${
                                    followUpStatus.needed ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
                                  } ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}
                                >
                                  <div className="flex items-center gap-4">
                                    {/* DRAG HANDLE */}
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                                    >
                                      <IconGripVertical size={16} />
                                    </div>

                                    {/* PROFILE AVATAR */}
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-[#1FAE5B] flex items-center justify-center text-white font-medium">
                                      {inf.influencer?.charAt(0) || "?"}
                                    </div>

                                    {/* INFO */}
                                    <div className="flex flex-col leading-tight flex-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium text-sm">{inf.influencer}</span>
                                        {getFollowUpBadge(inf)}
                                      </div>
                                      <span className="text-xs text-gray-500">{inf.instagramHandle}</span>
                                      <div className="flex gap-2 mt-1">
                                        <span className="text-xs text-gray-400">👥 {inf.followers}</span>
                                        <span className="text-xs text-gray-400">💬 {inf.engagementRate}</span>
                                      </div>
                                      <span className="text-xs text-gray-400 mt-1">🏷️ {inf.niche}</span>
                                      {inf.nextFollowUp && (
                                        <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                          <IconCalendar size={12} />
                                          Next: {new Date(inf.nextFollowUp).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* FOLLOW-UP BUTTON */}
                                  {(inf.pipelineStatus === "Prospect" || inf.pipelineStatus === "Reached Out" || inf.pipelineStatus === "In Conversation") && (
                                    <button
                                      onClick={() => setSelectedInfluencer(inf)}
                                      className="mt-3 w-full text-xs bg-white border rounded-lg px-3 py-2 hover:bg-gray-50 transition flex items-center justify-center gap-1"
                                    >
                                      <IconBell size={12} />
                                      {inf.nextFollowUp ? 'Schedule Follow-up' : 'Set Reminder'}
                                    </button>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          )
                        })}
                        {provided.placeholder}

                        {/* DROP AREA */}
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition cursor-pointer">
                          <span>Drop Here</span>
                          <IconPlus size={16} />
                        </div>
                      </div>
                    )}
                  </Droppable>
                )
              })}
            </div>
          </div>
        </DragDropContext>
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Influencer</th>
                <th className="px-4 py-3 text-left">Handle</th>
                <th className="px-4 py-3 text-left">Followers</th>
                <th className="px-4 py-3 text-left">Engagement</th>
                <th className="px-4 py-3 text-left">Niche</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Follow-up Status</th>
                <th className="px-4 py-3 text-left">Last Contact</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inf) => {
                const followUpStatus = isFollowUpNeeded(inf)
                return (
                  <tr key={inf.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 flex-shrink-0 bg-[#1FAE5B] flex items-center justify-center text-white font-medium text-sm">
                        {inf.influencer?.charAt(0) || "?"}
                      </div>
                      {inf.influencer}
                    </td>
                    <td className="px-4 py-3 text-[#0F6B3E] font-medium">{inf.instagramHandle}</td>
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
                          setData(prev => prev.map(item =>
                            item.id === inf.id
                              ? { ...item, pipelineStatus: e.target.value }
                              : item
                          ))
                          setShowSuccessMessage(`${inf.influencer} status updated to ${e.target.value}`)
                          setTimeout(() => setShowSuccessMessage(null), 3000)
                        }}
                        className={`px-2 py-1 rounded text-xs border ${
                          inf.pipelineStatus === "Onboarded" ? "bg-green-100 text-green-700" :
                          inf.pipelineStatus === "Rejected" ? "bg-red-100 text-red-700" :
                          "bg-[#1FAE5B]/15 text-[#0F6B3E]"
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getFollowUpBadge(inf)}
                        {inf.followUpCount && inf.followUpCount > 0 && (
                          <span className="text-xs text-gray-500">
                            ({inf.followUpCount} follow-ups)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {inf.lastContact ? new Date(inf.lastContact).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      {(inf.pipelineStatus === "Prospect" || inf.pipelineStatus === "Reached Out" || inf.pipelineStatus === "In Conversation") && (
                        <button
                          onClick={() => setSelectedInfluencer(inf)}
                          className="text-xs bg-[#1FAE5B] text-white px-3 py-1 rounded-lg hover:bg-[#0F6B3E] transition flex items-center gap-1"
                        >
                          <IconBell size={12} />
                          {inf.nextFollowUp ? 'Schedule' : 'Remind'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}