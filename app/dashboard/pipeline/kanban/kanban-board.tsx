// app/dashboard/pipeline/kanban/kanban-board.tsx

"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"
import ReactDOM from "react-dom"
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
  IconFilter,
  IconSearch,
  IconLocation,
  IconBrandTwitter,
  IconX,
  IconLayoutList,
  IconChevronDown,
  IconLoader2,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react"

import InfluencerProfileSidebar, {
  type Partner,
  type Campaign,
} from "@/components/InfluencerProfileSidebar"

import { usePipelineData, type PipelineInfluencer } from "@/hooks/usePipelineData"

// ─── Platform Icons ──────────────────────────────────────────────────────────
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
  Twitter: <IconBrandTwitter size={14} className="text-blue-400" />,
}

// ─── Filter constants ────────────────────────────────────────────────────────
const NICHES = ["Beauty", "Fitness", "Lifestyle", "Food", "Tech", "Fashion", "Travel"]
const LOCATIONS = [
  "Philippines", "Singapore", "United States", "Australia",
  "United Kingdom", "Malaysia", "Indonesia", "Thailand", "Vietnam",
]

// ─── Not Interested reasons ──────────────────────────────────────────────────
const NI_REASONS = [
  { r: "Fee too low / unpaid",                  bucket: "hard", color: "#E24B4A" },
  { r: "Brief too scripted",                    bucket: "hard", color: "#E8724A" },
  { r: "Won't allow content reuse",             bucket: "hard", color: "#F4A240" },
  { r: "Working with a competitor",             bucket: "hard", color: "#C97B3A" },
  { r: "Product doesn't fit their brand",       bucket: "hard", color: "#888780" },
  { r: "Wrong audience fit",                    bucket: "hard", color: "#6B7F7A" },
  { r: "Seen bad reviews about us",             bucket: "hard", color: "#A32D2D" },
  { r: "Fully booked",                          bucket: "soft", color: "#2C8EC4" },
  { r: "Temporarily unavailable / can't shoot", bucket: "soft", color: "#5BAFD4" },
  { r: "Can't ship to their location",          bucket: "soft", color: "#7DC4E4" },
  { r: "Ghosted / no longer active",            bucket: "soft", color: "#B4B2A9" },
  { r: "Rate / deadline too tight",             bucket: "soft", color: "#F4B740" },
  { r: "Others",                                bucket: "hard", color: "#D3D1C7" },
]

// ─── Column definitions ──────────────────────────────────────────────────────
const columns = [
  { key: "for-outreach",    title: "For Outreach",    color: "bg-yellow-400", status: "For Outreach" },
  { key: "contacted",       title: "Contacted",        color: "bg-orange-400", status: "Contacted" },
  { key: "in-conversation", title: "In Conversation",  color: "bg-blue-400",   status: "In Conversation" },
  { key: "deal-agreed",     title: "Deal Agreed",      color: "bg-green-500",  status: "Deal Agreed" },
  { key: "not-interested",  title: "Not Interested",   color: "bg-red-500",    status: "Not Interested" },
]

const isExitStage = (status: string) => status === "Not Interested"
const getStatusFromColumnKey = (key: string): string => columns.find((c) => c.key === key)?.status ?? key

const getStatusColor = (status: string) => {
  const column = columns.find((c) => c.status === status)
  if (!column) return "bg-gray-100 text-gray-700 border-gray-300"
  switch (column.color) {
    case "bg-yellow-400": return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "bg-orange-400": return "bg-orange-100 text-orange-800 border-orange-300"
    case "bg-blue-400":   return "bg-blue-100 text-blue-800 border-blue-300"
    case "bg-green-500":  return "bg-green-100 text-green-800 border-green-300"
    case "bg-red-500":    return "bg-red-100 text-red-800 border-red-300"
    default:              return "bg-gray-100 text-gray-700 border-gray-300"
  }
}

const getOptionDotColor = (status: string) => columns.find((c) => c.status === status)?.color ?? "bg-gray-400"
const getPlatformIcon = (platform?: string): ReactNode => PLATFORM_ICONS[platform ?? ""] || PLATFORM_ICONS.Instagram
const getAvatarColor = (name: string) => {
  const colors = ["bg-pink-500","bg-purple-500","bg-indigo-500","bg-blue-500","bg-cyan-500","bg-teal-500","bg-green-500","bg-yellow-500","bg-orange-500","bg-red-500","bg-rose-500"]
  return colors[name.charCodeAt(0) % colors.length]
}

const getNextStages = (currentStatus: string): string[] => {
  switch (currentStatus) {
    case "For Outreach":    return ["Contacted", "Not Interested"]
    case "Contacted":       return ["In Conversation", "Not Interested"]
    case "In Conversation": return ["Deal Agreed", "Not Interested"]
    case "Deal Agreed":     return []
    case "Not Interested":  return []
    default:                return []
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]

// ✅ FIX: influencerToPartner was missing — added back
function influencerToPartner(inf: PipelineInfluencer): Partner {
  const nameParts = inf.influencer?.split(" ") || [""]
  const firstName = nameParts[0] || inf.handle?.slice(0, 6) || ""
  const lastName  = nameParts.slice(1).join(" ") || ""
  return {
    id:          inf.id as any,
    handle:      inf.handle || "",
    firstName,
    lastName,
    birthday:    "",
    plat:        inf.platform || "Instagram",
    niche:       inf.niche || "",
    gend:        "",
    loc:         inf.location || "",
    tier:        "",
    tierOverride: null,
    onRet:       false,
    retFee:      0,
    defComm:     0,
    commSt:      inf.pipelineStatus || "Pending",
    clicks:      0,
    cvr:         0,
    sales:       0,
    aov:         0,
    rev:         0,
    fol:         inf.followerCount,
    eng:         parseFloat(inf.engagementRate) || 0,
    avgV:        0,
    gmv:         0,
    added:       inf.createdAt ? new Date(inf.createdAt) : new Date(),
    prods:       [],
    prodCost:    0,
    feesPaid:    inf.agreedRate || 0,
    commPaid:    0,
    totalSpend:  inf.agreedRate || 0,
    roi_val:     0,
    roas_val:    0,
    monthly:     MONTHS.map((m) => ({ month: m, posts: 0, clicks: 0, rev: 0, eng: 0, sales: 0 })),
    ppm:         0,
    hClicks:     0,
    hSales:      0,
    hRev:        0,
    hCVR:        0,
    hPosts:      0,
  }
}

// ─── Not Interested Modal ────────────────────────────────────────────────────
interface NIModalProps {
  influencer: PipelineInfluencer
  onConfirm: (reason: string) => void
  onCancel: () => void
}

function NotInterestedModal({ influencer, onConfirm, onCancel }: NIModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const hardReasons = NI_REASONS.filter((r) => r.bucket === "hard")
  const softReasons = NI_REASONS.filter((r) => r.bucket === "soft")
  const initials = influencer.influencer.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-[800px] max-w-[95vw] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Mark as not interested</h2>
            <p className="text-xs text-gray-500 mt-0.5">Select the reason why this influencer declined or is not moving forward.</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition ml-4 mt-0.5"><IconX size={18} /></button>
        </div>
        <div className="px-7 pt-5">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            {influencer.profileImageUrl ? (
              <img src={influencer.profileImageUrl} alt={influencer.influencer} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-sm">{initials}</div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">{influencer.influencer}</p>
              <p className="text-xs text-gray-500">{influencer.instagramHandle}</p>
            </div>
          </div>
        </div>
        <div className="px-7 pt-5 pb-3 grid grid-cols-2 gap-x-5 gap-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-700">Hard pass</span>
              <span className="text-[10px] text-gray-400">— don't reach out soon</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {hardReasons.map((reason) => (
                <button key={reason.r} onClick={() => setSelectedReason(reason.r)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all w-full ${selectedReason === reason.r ? "border-red-400 bg-red-50" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"}`}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: reason.color }} />
                  <span className="text-sm text-gray-700 flex-1 leading-snug">{reason.r}</span>
                  {selectedReason === reason.r && (
                    <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Soft pass</span>
              <span className="text-[10px] text-gray-400">— follow up next campaign</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {softReasons.map((reason) => (
                <button key={reason.r} onClick={() => setSelectedReason(reason.r)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all w-full ${selectedReason === reason.r ? "border-blue-400 bg-blue-50" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"}`}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: reason.color }} />
                  <span className="text-sm text-gray-700 flex-1 leading-snug">{reason.r}</span>
                  {selectedReason === reason.r && (
                    <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
            {selectedReason && (
              <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Selected reason</p>
                <p className="text-sm font-medium text-gray-800">{selectedReason}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {NI_REASONS.find((r) => r.r === selectedReason)?.bucket === "soft"
                    ? "This influencer can be re-approached in a future campaign."
                    : "This influencer should not be contacted again soon."}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-7 py-4 border-t border-gray-100">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={() => selectedReason && onConfirm(selectedReason)} disabled={!selectedReason}
            className="px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed">Confirm</button>
        </div>
      </div>
    </div>
  )
}

// ─── Deal Agreed Checklist ────────────────────────────────────────────────────
interface DealAgreedChecklistProps {
  influencerId: string
  addressReceived: boolean
  onAddressToggle: (id: string) => void
  onMarkOrderPlaced: (id: string) => void
}

function DealAgreedChecklist({ influencerId, addressReceived, onAddressToggle, onMarkOrderPlaced }: DealAgreedChecklistProps) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div
        onClick={(e) => { e.stopPropagation(); onAddressToggle(influencerId) }}
        className="flex items-center gap-2 cursor-pointer group mb-2"
      >
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${addressReceived ? "bg-green-500 border-green-500" : "border-gray-300 bg-white group-hover:border-green-400"}`}>
          {addressReceived && <IconCheck size={10} className="text-white" />}
        </div>
        <span className={`text-xs ${addressReceived ? "text-gray-400 line-through" : "text-gray-600"}`}>
          Shipping address received
        </span>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); if (addressReceived) onMarkOrderPlaced(influencerId) }}
        disabled={!addressReceived}
        className={`w-full text-xs font-medium py-1.5 rounded-lg transition-all ${addressReceived ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
      >
        {addressReceived ? "✓ Mark For Order Creation" : "Mark For Order Creation"}
      </button>
    </div>
  )
}

// ─── Pipeline Card ────────────────────────────────────────────────────────────
interface PipelineCardProps {
  influencer: PipelineInfluencer & { addressReceived?: boolean; niReason?: string }
  onOpenSidebar: (inf: PipelineInfluencer) => void
  onStatusChange: (id: string, newStatus: string) => void
  onAddressToggle?: (id: string) => void
  onMarkOrderPlaced?: (id: string) => void
}

function PipelineCard({ influencer, onOpenSidebar, onStatusChange, onAddressToggle, onMarkOrderPlaced }: PipelineCardProps) {
  const nextStages = getNextStages(influencer.pipelineStatus)
  const isExit = isExitStage(influencer.pipelineStatus)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
      <div className="cursor-pointer" onClick={() => onOpenSidebar(influencer)}>
        {/* Name + handle — no avatar */}
        <div className="flex flex-col text-sm mb-2">
          <span className="font-medium text-gray-900">{influencer.influencer}</span>
          <span className="text-xs text-gray-500">{influencer.instagramHandle}</span>
        </div>
        {/* Platform + location */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
          <span className="flex items-center gap-1">{getPlatformIcon(influencer.platform)}{influencer.platform || "Instagram"}</span>
          <span>•</span>
          <span>{influencer.location || "—"}</span>
        </div>
        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{influencer.followerCount?.toLocaleString() || influencer.followers || "—"} followers</span>
          <span>{influencer.engagementRate || "—"}% eng</span>
        </div>
        {/* NI reason */}
        {influencer.niReason && influencer.pipelineStatus === "Not Interested" && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1 inline-block">
            {influencer.niReason}
          </div>
        )}
      </div>

      {/* Deal Agreed checklist */}
      {influencer.pipelineStatus === "Deal Agreed" && onAddressToggle && onMarkOrderPlaced && (
        <DealAgreedChecklist
          influencerId={influencer.id}
          addressReceived={influencer.addressReceived ?? false}
          onAddressToggle={onAddressToggle}
          onMarkOrderPlaced={onMarkOrderPlaced}
        />
      )}

      {/* Stage action buttons */}
      {nextStages.length > 0 && !isExit && (
        <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100 flex-wrap">
          {nextStages.map((stage) => (
            <button
              key={stage}
              onClick={(e) => { e.stopPropagation(); onStatusChange(influencer.id, stage) }}
              className={`text-xs px-2 py-1 rounded transition-all ${
                stage === "Not Interested"
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {stage === "Not Interested" ? "✕ Not Interested" : `→ ${stage}`}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Portal StatusDropdown ────────────────────────────────────────────────────
function StatusDropdown({ currentStatus, onStatusChange }: { currentStatus: string; onStatusChange: (s: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isOpen || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const dropdownHeight = 300, dropdownWidth = 180
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceRight = window.innerWidth - rect.left
    const top  = spaceBelow >= dropdownHeight ? rect.bottom + 4 : rect.top - dropdownHeight - 4
    const left = spaceRight >= dropdownWidth  ? rect.left       : rect.right - dropdownWidth
    setDropdownStyle({ position: "fixed", top: Math.max(8, top), left: Math.max(8, left), zIndex: 9999, minWidth: dropdownWidth })
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (buttonRef.current && !buttonRef.current.contains(target)) {
        const portalEl = document.getElementById("status-dropdown-portal")
        if (!portalEl || !portalEl.contains(target)) setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [isOpen])

  const dropdown = isOpen ? (
    <div id="status-dropdown-portal" style={dropdownStyle} className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
      {columns.map((col, index) => (
        <div key={col.status}
          onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); onStatusChange(col.status); setIsOpen(false) }}
          className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${index !== columns.length - 1 ? "border-b border-gray-100" : ""} ${currentStatus === col.status ? "bg-gray-50 font-semibold" : ""}`}
        >
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getOptionDotColor(col.status)}`} />
          <span className="text-gray-700 whitespace-nowrap">{col.title}</span>
        </div>
      ))}
    </div>
  ) : null

  return (
    <>
      <button ref={buttonRef}
        onClick={(e) => { e.stopPropagation(); setIsOpen((p) => !p) }}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap border ${getStatusColor(currentStatus)}`}
      >
        {currentStatus}
        <IconChevronDown size={12} className={`transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {mounted && dropdown && typeof document !== "undefined" ? ReactDOM.createPortal(dropdown, document.body) : null}
    </>
  )
}

// ─── Droppable / Draggable ────────────────────────────────────────────────────
function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const isExit = id === "not-interested"
  return (
    <div ref={setNodeRef} className={`flex flex-col gap-3 w-[240px] flex-shrink-0 transition-colors rounded-lg ${isOver ? (isExit ? "bg-red-50" : "bg-gray-50") : ""}`}>
      {children}
    </div>
  )
}

function DraggableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}>
      {children}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
interface PipelinePageProps { brandId?: string }

export default function PipelinePage({ brandId }: PipelinePageProps) {
  const [view, setView] = useState<"Board" | "list">("Board")
  const [search, setSearch] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [selectedColumnStatus, setSelectedColumnStatus] = useState<string | null>(null)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [filters, setFilters] = useState({ influencer: "", handle: "", location: "all", niche: "all" })
  const [niModalInfluencer, setNiModalInfluencer] = useState<PipelineInfluencer | null>(null)
  const [pendingNiId, setPendingNiId] = useState<string | null>(null)
  const [addressReceivedState, setAddressReceivedState] = useState<Record<string, boolean>>({})

  const { data, isLoading, error, updateStatus, refetch } = usePipelineData(brandId)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    if (data.length > 0) {
      setAddressReceivedState((prev) => {
        const next = { ...prev }
        data.forEach((item) => { if (!(item.id in next)) next[item.id] = false })
        return next
      })
    }
  }, [data])

  const handleAddressToggle = (id: string) => {
    setAddressReceivedState((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      setShowSuccessMessage(`Address ${next[id] ? "confirmed" : "unchecked"}`)
      setTimeout(() => setShowSuccessMessage(null), 2000)
      return next
    })
  }

  const handleMarkOrderPlaced = async (id: string) => {
    const influencer = data.find((i) => i.id === id)
    if (!influencer || !addressReceivedState[id]) return
    const success = await updateStatus(id, "For Order Creation")
    setShowSuccessMessage(
      success
        ? `${influencer.influencer} moved to Post Tracker → For Order Creation`
        : `Failed to move ${influencer.influencer}`
    )
    setTimeout(() => setShowSuccessMessage(null), 3000)
  }

  const handleDragStart = (event: DragStartEvent) => { setActiveId(event.active.id as string) }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return
    const draggedId = active.id as string
    const destinationKey = over.id as string
    const draggedInfluencer = data.find((item) => item.id === draggedId)
    if (!draggedInfluencer) return
    const newStatus = getStatusFromColumnKey(destinationKey)
    if (draggedInfluencer.pipelineStatus === newStatus) return
    const allowedNext = getNextStages(draggedInfluencer.pipelineStatus)
    if (!allowedNext.includes(newStatus)) {
      setShowSuccessMessage(`Cannot move from "${draggedInfluencer.pipelineStatus}" to "${newStatus}"`)
      setTimeout(() => setShowSuccessMessage(null), 2000)
      return
    }
    if (newStatus === "Not Interested") {
      setPendingNiId(draggedId)
      setNiModalInfluencer(draggedInfluencer)
      return
    }
    const success = await updateStatus(draggedId, newStatus)
    const columnTitle = columns.find((col) => col.key === destinationKey)?.title
    setShowSuccessMessage(success ? `${draggedInfluencer.influencer} moved to ${columnTitle}` : `Failed to move ${draggedInfluencer.influencer}`)
    setTimeout(() => setShowSuccessMessage(null), 3000)
  }

  const handleNiConfirm = async (reason: string) => {
    if (!pendingNiId || !niModalInfluencer) return
    const success = await updateStatus(pendingNiId, "Not Interested", { niReason: reason })
    setShowSuccessMessage(success ? `${niModalInfluencer.influencer} marked as Not Interested · ${reason}` : `Failed to update ${niModalInfluencer.influencer}`)
    setTimeout(() => setShowSuccessMessage(null), 3000)
    setNiModalInfluencer(null)
    setPendingNiId(null)
  }

  const handleNiCancel = () => { setNiModalInfluencer(null); setPendingNiId(null) }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (newStatus === "Not Interested") {
      const influencer = data.find((i) => i.id === id)
      if (influencer) { setPendingNiId(id); setNiModalInfluencer(influencer) }
      return
    }
    const influencer = data.find((i) => i.id === id)
    const success = await updateStatus(id, newStatus)
    setShowSuccessMessage(success ? `${influencer?.influencer} updated to ${newStatus}` : `Failed to update ${influencer?.influencer}`)
    setTimeout(() => setShowSuccessMessage(null), 2000)
  }

  const openSidebar = (inf: PipelineInfluencer) => {
    setSelectedPartner(influencerToPartner(inf))
    setSidebarOpen(true)
  }

  const handleColumnClick = (column: typeof columns[0]) => {
    setSelectedColumnStatus(column.status)
    setView("list")
    setShowSuccessMessage(`Showing "${column.title}"`)
    setTimeout(() => setShowSuccessMessage(null), 2000)
  }

  const clearColumnFilter = () => {
    setSelectedColumnStatus(null)
    setShowSuccessMessage("Showing all influencers")
    setTimeout(() => setShowSuccessMessage(null), 2000)
  }

  let filteredData = data
    .filter((d) => d.influencer.toLowerCase().includes(search.toLowerCase()) || d.instagramHandle.toLowerCase().includes(search.toLowerCase()))
    .filter((d) => (selectedColumnStatus ? d.pipelineStatus === selectedColumnStatus : true))

  if (filters.influencer)         filteredData = filteredData.filter((p) => p.influencer.toLowerCase().includes(filters.influencer.toLowerCase()))
  if (filters.handle)             filteredData = filteredData.filter((p) => p.instagramHandle.toLowerCase().includes(filters.handle.toLowerCase()))
  if (filters.location !== "all") filteredData = filteredData.filter((p) => p.location === filters.location)
  if (filters.niche !== "all")    filteredData = filteredData.filter((p) => p.niche === filters.niche)

  const getItemsByColumn = (columnKey: string) =>
    filteredData.filter((item) => item.pipelineStatus === getStatusFromColumnKey(columnKey))

  const hasActiveFilters = filters.influencer !== "" || filters.handle !== "" || filters.location !== "all" || filters.niche !== "all" || search !== "" || selectedColumnStatus !== null
  const activeInfluencer = activeId ? data.find((item) => item.id === activeId) : null
  const selectedColumnInfo = selectedColumnStatus ? columns.find((col) => col.status === selectedColumnStatus) : null

  // ✅ FIX: Pass addressReceived and niReason into the card via spread
  const renderCardContent = (inf: PipelineInfluencer) => (
    <PipelineCard
      influencer={{
        ...inf,
        addressReceived: addressReceivedState[inf.id] ?? false,
        niReason: (inf as any).niReason ?? (inf as any).approvalNotes ?? undefined,
      }}
      onOpenSidebar={openSidebar}
      onStatusChange={handleStatusUpdate}
      onAddressToggle={handleAddressToggle}
      onMarkOrderPlaced={handleMarkOrderPlaced}
    />
  )

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center gap-3 p-12 text-gray-500">
      <IconLoader2 size={32} className="animate-spin text-[#1FAE5B]" />
      <span className="text-sm">Loading pipeline data...</span>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center gap-3 p-12">
      <IconAlertCircle size={32} className="text-red-500" />
      <span className="text-sm text-red-600">{error}</span>
      <button onClick={() => refetch()} className="px-4 py-2 bg-[#1FAE5B] text-white rounded-lg text-sm hover:bg-[#178a48] transition">Retry</button>
    </div>
  )

  return (
    <div className="flex flex-col gap-4 p-6">
      {niModalInfluencer && <NotInterestedModal influencer={niModalInfluencer} onConfirm={handleNiConfirm} onCancel={handleNiCancel} />}

      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2">
          {showSuccessMessage}
        </div>
      )}

      {sidebarOpen && selectedPartner && (
        <InfluencerProfileSidebar partner={selectedPartner} campaigns={[] as Campaign[]} allPartners={[]} onClose={() => setSidebarOpen(false)} />
      )}

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search influencer..."
            className="w-full pl-9 pr-3 h-10 border border-[#0F6B3E]/20 rounded-lg outline-none focus:ring-2 focus:ring-[#1FAE5B] text-sm" />
        </div>
        <span className="text-sm text-gray-500 whitespace-nowrap">{data.length} influencer{data.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium">Follow up 0</div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 border ${hasActiveFilters ? "bg-[#1FAE5B] text-white border-[#1FAE5B]" : "border-[#0F6B3E]/20"}`}>
              <IconFilter size={16} /> Filters
            </button>
            {showFilterPanel && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-30 w-[340px] p-5">
                <div className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-4">Filter by</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Influencer</label>
                    <input type="text" value={filters.influencer} onChange={(e) => setFilters((p) => ({ ...p, influencer: e.target.value }))} placeholder="Search by name..." className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1FAE5B]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Handle</label>
                    <input type="text" value={filters.handle} onChange={(e) => setFilters((p) => ({ ...p, handle: e.target.value }))} placeholder="@username..." className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1FAE5B]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Location</label>
                    <select value={filters.location} onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1FAE5B] appearance-none cursor-pointer">
                      <option value="all">All Locations</option>
                      {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">Niche</label>
                    <select value={filters.niche} onChange={(e) => setFilters((p) => ({ ...p, niche: e.target.value }))} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1FAE5B] appearance-none cursor-pointer">
                      <option value="all">All Niches</option>
                      {NICHES.map((n) => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-5">
                  <button onClick={() => setFilters({ influencer: "", handle: "", location: "all", niche: "all" })} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition">Clear all</button>
                  <button onClick={() => setShowFilterPanel(false)} className="px-5 py-1.5 bg-[#1FAE5B] text-white rounded-lg text-sm font-medium hover:bg-[#178a48] transition">Apply</button>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setView("Board"); setSelectedColumnStatus(null) }}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${view === "Board" ? "bg-[#1FAE5B] text-white" : "border border-[#0F6B3E]/20"}`}>
              <IconLayoutKanban size={16} /> Board
            </button>
            <button onClick={() => { setView("list"); setSelectedColumnStatus(null) }}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${view === "list" ? "bg-[#1FAE5B] text-white" : "border border-[#0F6B3E]/20"}`}>
              <IconList size={16} /> List
            </button>
          </div>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {view === "Board" && (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="rounded-xl border border-[#0F6B3E]/10 bg-white p-5 overflow-x-auto">
            <div className="flex gap-4 min-w-max">
              {columns.map((col) => {
                const items = getItemsByColumn(col.key)
                return (
                  <DroppableColumn key={col.key} id={col.key}>
                    <div onClick={() => handleColumnClick(col)}
                      className={`${col.color} text-white rounded-lg px-3 py-2 text-sm font-semibold flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity`}>
                      <span>{col.title}</span>
                      <span className="bg-white/20 text-white rounded-full px-2 py-0.5 text-xs">{items.length}</span>
                    </div>
                    <div className="flex flex-col gap-2 min-h-[400px]">
                      {items.map((inf) => (
                        <DraggableCard key={inf.id} id={inf.id}>
                          {renderCardContent(inf)}
                        </DraggableCard>
                      ))}
                      {items.length === 0 && (
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-xs text-gray-400">Drop here</div>
                      )}
                    </div>
                  </DroppableColumn>
                )
              })}
            </div>
          </div>
          <DragOverlay>
            {activeInfluencer ? (
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg rotate-2 w-[240px]">
                {renderCardContent(activeInfluencer)}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* LIST VIEW */}
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
                <IconX size={16} /> Clear filter
              </button>
            </div>
          )}
          <div style={{ overflowX: "auto" }}>
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Influencer</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Platform</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Handle</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Followers</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Engagement</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Niche</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No influencers found matching your filters</td></tr>
                ) : (
                  filteredData.map((inf) => (
                    <tr key={inf.id} className="border-t hover:bg-gray-50 cursor-pointer transition" onClick={() => openSidebar(inf)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {inf.profileImageUrl ? (
                            <img src={inf.profileImageUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 ${getAvatarColor(inf.influencer)} bg-opacity-20 flex items-center justify-center text-[#0F6B3E] font-semibold text-xs`}>
                              {inf.influencer.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium">{inf.influencer}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">{getPlatformIcon(inf.platform)}<span>{inf.platform || "Instagram"}</span></div>
                      </td>
                      <td className="px-4 py-3 text-[#0F6B3E] font-medium">{inf.instagramHandle}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1"><IconLocation size={14} className="text-gray-400" />{inf.location}</div>
                      </td>
                      <td className="px-4 py-3">{inf.followerCount?.toLocaleString() || inf.followers}</td>
                      <td className="px-4 py-3">{inf.engagementRate}</td>
                      <td className="px-4 py-3"><span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">{inf.niche}</span></td>
                      <td className="px-4 py-3">
                        <div onClick={(e) => e.stopPropagation()}>
                          <StatusDropdown currentStatus={inf.pipelineStatus} onStatusChange={(s) => handleStatusUpdate(inf.id, s)} />
                        </div>
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