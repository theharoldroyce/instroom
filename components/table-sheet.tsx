"use client"

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type ReactNode,
  type DragEvent,
} from "react"
import {
  IconTrash,
  IconPlus,
  IconX,
  IconExternalLink,
  IconCheck,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconGripVertical,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandYoutube,
  IconBrandX,
  IconWorld,
  IconSearch,
  IconFilter,
  IconEye,
  IconEyeOff,
  IconEdit,
  IconDeviceFloppy,
  IconUserCircle,
  IconMail,
  IconUsers,
  IconChartBar,
  IconTags,
  IconPhone,
  IconCurrencyDollar,
  IconFileText,
  IconMessageCircle,
  IconMapPin,
  IconGenderFemale,
  IconLink,
  IconUser,
  IconAddressBook,
  IconChecklist,
  IconClock,
  IconCopy,
  IconAlertCircle,
  IconAlertTriangle,
} from "@tabler/icons-react"

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════════ */
export type InfluencerRow = {
  id: string
  handle: string
  platform: string
  full_name: string
  email: string
  follower_count: string
  engagement_rate: string
  niche: string
  contact_status: string
  stage: string
  agreed_rate: string
  notes: string
  custom: Record<string, string>
  gender?: string
  location?: string
  social_link?: string
  first_name?: string
  contact_info?: string
  approval_status?: "Approved" | "Declined" | "Pending"
  transferred_date?: string
  approval_notes?: string
  decline_reason?: string
}

export type CustomColumn = {
  id: string
  field_key: string
  field_name: string
  field_type:
    | "text"
    | "number"
    | "dropdown"
    | "multi-select"
    | "date"
    | "boolean"
    | "url"
  field_options?: string[]
  assignedGroup: "Influencer Details" | "Approval Details" | "Outreach Details"
  description?: string
}

type CellAddress = { rowIdx: number; colIdx: number }

type ColDef = {
  key: string
  label: string
  group: "Influencer Details" | "Approval Details" | "Outreach Details"
  minWidth: number
  type: "text" | "number" | "select" | "url" | "date"
  options?: string[]
  isCustom?: false
}

type CustomColDef = {
  key: string
  label: string
  group: "Influencer Details" | "Approval Details" | "Outreach Details" | "Custom Fields"
  minWidth: number
  type: "text" | "number" | "dropdown" | "multi-select" | "date" | "boolean" | "url"
  options?: string[]
  isCustom: true
  customId: string
  fieldKey: string
  assignedGroup: "Influencer Details" | "Approval Details" | "Outreach Details"
}

type AnyColDef = ColDef | CustomColDef

/* ═══════════════════════════════════════════════════════════════════════════════
   STATIC COLUMNS
   ═══════════════════════════════════════════════════════════════════════════════ */
const STATIC_COLS: ColDef[] = [
  { key: "handle", label: "Handle", group: "Influencer Details", minWidth: 140, type: "text" },
  { key: "platform", label: "Platform", group: "Influencer Details", minWidth: 110, type: "select", options: ["instagram", "tiktok", "youtube", "twitter", "other"] },
  { key: "niche", label: "Niche", group: "Influencer Details", minWidth: 120, type: "text" },
  { key: "gender", label: "Gender", group: "Influencer Details", minWidth: 110, type: "select", options: ["Male", "Female", "Non-binary", "Other"] },
  { key: "location", label: "Location", group: "Influencer Details", minWidth: 130, type: "text" },
  { key: "follower_count", label: "Follower Count", group: "Influencer Details", minWidth: 120, type: "number" },
  { key: "engagement_rate", label: "Engagement Rate (%)", group: "Influencer Details", minWidth: 140, type: "number" },
  { key: "social_link", label: "Social Link", group: "Influencer Details", minWidth: 150, type: "url" },
  { key: "first_name", label: "First Name", group: "Influencer Details", minWidth: 110, type: "text" },
  { key: "contact_info", label: "Contact Info", group: "Influencer Details", minWidth: 160, type: "text" },
  { key: "approval_status", label: "Approve/Decline", group: "Approval Details", minWidth: 130, type: "select", options: ["Approved", "Declined", "Pending"] },
  { key: "transferred_date", label: "Transferred Date", group: "Approval Details", minWidth: 140, type: "date" },
  { key: "approval_notes", label: "Notes", group: "Approval Details", minWidth: 200, type: "text" },
  { key: "contact_status", label: "Status", group: "Outreach Details", minWidth: 120, type: "select", options: ["not_contacted", "contacted", "interested", "agreed"] },
  { key: "agreed_rate", label: "Rate ($)", group: "Outreach Details", minWidth: 100, type: "number" },
  { key: "notes", label: "Notes", group: "Outreach Details", minWidth: 200, type: "text" },
]

// Outreach-related field keys (removed outreach_method)
const OUTREACH_FIELDS = new Set(["contact_status", "stage", "agreed_rate", "notes"])

/* ═══════════════════════════════════════════════════════════════════════════════
   PLATFORM ICONS & URL MAP
   ═══════════════════════════════════════════════════════════════════════════════ */
const PLATFORM_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  instagram: IconBrandInstagram,
  tiktok: IconBrandTiktok,
  youtube: IconBrandYoutube,
  twitter: IconBrandX,
  other: IconWorld,
}

function PlatformIcon({ platform, size = 16, className = "" }: { platform: string; size?: number; className?: string }) {
  const IC = PLATFORM_ICONS[platform]
  if (!IC) return null
  return <IC size={size} className={className} />
}

const PLATFORM_URL_MAP: Record<string, (h: string) => string> = {
  instagram: (h) => `https://instagram.com/${h.replace(/^@/, "")}`,
  tiktok: (h) => `https://tiktok.com/@${h.replace(/^@/, "")}`,
  youtube: (h) => `https://youtube.com/@${h.replace(/^@/, "")}`,
  twitter: (h) => `https://x.com/${h.replace(/^@/, "")}`,
  other: () => "",
}

function getProfileUrl(platform: string, handle: string): string {
  if (!handle || handle === "@") return ""
  const fn = PLATFORM_URL_MAP[platform]
  return fn ? fn(handle) : ""
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════════ */
function newEmptyRow(customCols: CustomColumn[]): InfluencerRow {
  const custom: Record<string, string> = {}
  customCols.forEach((c) => { custom[c.field_key] = c.field_type === "boolean" ? "No" : "" })
  return {
    id: crypto.randomUUID(), handle: "@", platform: "instagram", full_name: "", email: "",
    follower_count: "", engagement_rate: "", niche: "", contact_status: "not_contacted",
    stage: "1", agreed_rate: "", notes: "", custom,
    gender: "", location: "", social_link: "", first_name: "", contact_info: "",
    approval_status: "Pending", transferred_date: "", approval_notes: "", decline_reason: "",
  }
}

const STATUS_STYLE: Record<string, string> = {
  not_contacted: "bg-gray-100 text-gray-600", contacted: "bg-blue-100 text-blue-700",
  interested: "bg-yellow-100 text-yellow-700", agreed: "bg-green-100 text-green-700",
}
const STATUS_LABEL: Record<string, string> = {
  not_contacted: "Not Contacted", contacted: "Contacted", interested: "Interested", agreed: "Agreed",
}
const APPROVAL_STYLE: Record<string, string> = {
  Approved: "bg-green-100 text-green-700", Declined: "bg-red-100 text-red-600", Pending: "bg-yellow-100 text-yellow-700",
}

function StatusBadge({ value }: { value: string }) {
  return <span className={`inline-block truncate max-w-full px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[value] ?? "bg-gray-100 text-gray-500"}`}>{STATUS_LABEL[value] || value || "—"}</span>
}
function ApprovalBadge({ value }: { value: string }) {
  return <span className={`inline-block truncate max-w-full px-2 py-0.5 rounded-full text-xs font-medium ${APPROVAL_STYLE[value] ?? "bg-gray-100 text-gray-500"}`}>{value || "Pending"}</span>
}

function isValidUrl(str: string): boolean {
  if (!str) return false
  try { const u = new URL(str.startsWith("http") ? str : `https://${str}`); return u.hostname.includes(".") } catch { return false }
}
function normalizeUrl(str: string): string {
  if (!str) return ""; return str.startsWith("http") ? str : `https://${str}`
}

const handleApprovalChange = (row: InfluencerRow, newStatus: string, declineReason?: string): InfluencerRow => {
  const r = { ...row }
  if (newStatus === "Approved" && row.approval_status !== "Approved") {
    const t = new Date()
    r.transferred_date = [t.getFullYear(), String(t.getMonth() + 1).padStart(2, "0"), String(t.getDate()).padStart(2, "0")].join("-")
  } else if (newStatus !== "Approved") { 
    r.transferred_date = "" 
  }
  
  // If changing to Declined, clear outreach fields and set decline reason
  if (newStatus === "Declined" && row.approval_status !== "Declined") {
    r.contact_status = "not_contacted"
    r.stage = "1"
    r.agreed_rate = ""
    r.notes = ""
    if (declineReason) {
      r.approval_notes = declineReason
      r.decline_reason = declineReason
    }
  }
  
  r.approval_status = newStatus as "Approved" | "Declined" | "Pending"
  return r
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CONFIRMATION DIALOG COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
}

function ConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "danger"
}: ConfirmationDialogProps) {
  const variantStyles = {
    danger: {
      icon: IconAlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      buttonBg: "bg-red-600 hover:bg-red-700",
      ringColor: "focus:ring-red-400"
    },
    warning: {
      icon: IconAlertCircle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      buttonBg: "bg-amber-600 hover:bg-amber-700",
      ringColor: "focus:ring-amber-400"
    },
    info: {
      icon: IconAlertCircle,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonBg: "bg-blue-600 hover:bg-blue-700",
      ringColor: "focus:ring-blue-400"
    }
  }
  
  const styles = variantStyles[variant]
  const IconComponent = styles.icon
  
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: globalThis.KeyboardEvent) => {
        if (e.key === "Escape") onClose()
      }
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-xl w-[420px] p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2 ${styles.iconBg} rounded-full flex-shrink-0`}>
            <IconComponent size={24} className={styles.iconColor} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <div className="text-sm text-gray-500 mt-1">{message}</div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose() }}
            className={`flex-1 px-4 py-2 rounded-lg text-white text-sm transition flex items-center justify-center gap-1.5 ${styles.buttonBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */
function MultiSelectDisplay({ value }: { value: string }) {
  const tags = value ? value.split(",").map((s) => s.trim()).filter(Boolean) : []
  if (!tags.length) return <span className="text-gray-300">—</span>
  return <div className="flex flex-wrap gap-1">{tags.map((t) => <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[11px] font-medium leading-none">{t}</span>)}</div>
}

function FloatingPopup({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  return (
    <div ref={ref} tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onClose() } }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) onClose() }}
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl"
    >{children}</div>
  )
}

function DropdownEditor({ value, options, onChange, onClose, onAddOption }: { value: string; options: string[]; onChange: (v: string) => void; onClose: () => void; onAddOption: (v: string) => void }) {
  const [newOpt, setNewOpt] = useState("")
  const addNew = () => { const v = newOpt.trim(); if (!v || options.includes(v)) return; onAddOption(v); onChange(v); setNewOpt(""); onClose() }
  return (
    <FloatingPopup onClose={onClose}>
      <div className="w-52 max-h-60 overflow-auto py-1">
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(""); onClose() }} className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition ${!value ? "text-indigo-600 font-medium" : "text-gray-400"}`}>— None —</button>
        {options.map((o) => (
          <button key={o} onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(o); onClose() }}
            className={`flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition ${value === o ? "text-indigo-700 font-medium bg-indigo-50" : "text-gray-700"}`}>
            {value === o && <IconCheck size={14} className="text-indigo-600 flex-shrink-0" />}{o}
          </button>
        ))}
      </div>
      <div className="border-t border-gray-100 px-2 py-2"><div className="flex gap-1">
        <input type="text" value={newOpt} placeholder="Add new…" onChange={(e) => setNewOpt(e.target.value)}
          onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") addNew() }} onMouseDown={(e) => e.stopPropagation()}
          className="flex-1 text-sm px-2 py-1 border border-gray-200 rounded outline-none focus:ring-1 ring-indigo-400 min-w-0" />
        <button onClick={addNew} disabled={!newOpt.trim()} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-40 transition"><IconPlus size={12} /></button>
      </div></div>
    </FloatingPopup>
  )
}

function MultiSelectEditor({ value, options, onChange, onClose, onAddOption }: { value: string; options: string[]; onChange: (v: string) => void; onClose: () => void; onAddOption: (v: string) => void }) {
  const selected = value ? value.split(",").map((s) => s.trim()).filter(Boolean) : []
  const [newOpt, setNewOpt] = useState("")
  const toggle = (opt: string) => { const next = selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]; onChange(next.join(",")) }
  const addNew = () => { const v = newOpt.trim(); if (!v || options.includes(v)) return; onAddOption(v); onChange([...selected, v].join(",")); setNewOpt("") }
  return (
    <FloatingPopup onClose={onClose}>
      <div className="w-56 max-h-52 overflow-auto py-1">
        {options.map((opt) => { const isOn = selected.includes(opt); return (
          <button key={opt} onMouseDown={(e) => e.preventDefault()} onClick={() => toggle(opt)}
            className={`flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition ${isOn ? "text-purple-700 font-medium" : "text-gray-700"}`}>
            <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isOn ? "bg-purple-600 border-purple-600" : "border-gray-300"}`}>
              {isOn && <IconCheck size={12} className="text-white" />}
            </span>{opt}
          </button>
        ) })}
        {!options.length && <div className="px-3 py-2 text-xs text-gray-400">No options yet — add one below</div>}
      </div>
      <div className="border-t border-gray-100 px-2 py-2"><div className="flex gap-1">
        <input type="text" value={newOpt} placeholder="Add new…" onChange={(e) => setNewOpt(e.target.value)}
          onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") addNew() }} onMouseDown={(e) => e.stopPropagation()}
          className="flex-1 text-sm px-2 py-1 border border-gray-200 rounded outline-none focus:ring-1 ring-purple-400 min-w-0" />
        <button onClick={addNew} disabled={!newOpt.trim()} className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-40 transition"><IconPlus size={12} /></button>
      </div></div>
    </FloatingPopup>
  )
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DAY_NAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"]

function DatePicker({ value, onChange, onClose }: { value: string; onChange: (v: string) => void; onClose: () => void }) {
  const init = value ? new Date(value + "T00:00:00") : new Date()
  const [viewYear, setViewYear] = useState(init.getFullYear())
  const [viewMonth, setViewMonth] = useState(init.getMonth())
  const today = new Date()
  const todayStr = [today.getFullYear(), String(today.getMonth()+1).padStart(2,"0"), String(today.getDate()).padStart(2,"0")].join("-")
  const firstDow = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate()
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()
  type DayCell = { day: number; current: boolean; dateStr: string }
  const cells: DayCell[] = []
  for (let i=0; i<firstDow; i++) { const d=prevMonthDays-firstDow+1+i; const m=viewMonth===0?12:viewMonth; const y=viewMonth===0?viewYear-1:viewYear; cells.push({day:d,current:false,dateStr:`${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`}) }
  for (let d=1; d<=daysInMonth; d++) { cells.push({day:d,current:true,dateStr:`${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`}) }
  while (cells.length<42) { const d=cells.length-firstDow-daysInMonth+1; const m=viewMonth===11?1:viewMonth+2; const y=viewMonth===11?viewYear+1:viewYear; cells.push({day:d,current:false,dateStr:`${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`}) }
  const prevMo = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1)}else{setViewMonth(m=>m-1)} }
  const nextMo = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1)}else{setViewMonth(m=>m+1)} }
  const pick = (s: string) => { onChange(s); onClose() }
  return (
    <FloatingPopup onClose={onClose}>
      <div className="w-[280px] p-3 select-none">
        <div className="flex items-center justify-between mb-3">
          <button onMouseDown={e=>e.preventDefault()} onClick={prevMo} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition"><IconChevronLeft size={16}/></button>
          <span className="text-sm font-semibold text-gray-800">{MONTH_NAMES[viewMonth]} {viewYear}</span>
          <button onMouseDown={e=>e.preventDefault()} onClick={nextMo} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition"><IconChevronRight size={16}/></button>
        </div>
        <div className="grid grid-cols-7 mb-1">{DAY_NAMES.map(d=><div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>)}</div>
        <div className="grid grid-cols-7">{cells.map((c,i)=>{
          const isSelected=c.dateStr===value; const isToday=c.dateStr===todayStr
          return <button key={i} onMouseDown={e=>e.preventDefault()} onClick={()=>pick(c.dateStr)}
            className={`w-[36px] h-[36px] mx-auto rounded-lg text-xs flex items-center justify-center transition-colors
              ${!c.current?"text-gray-300 hover:bg-gray-50":"text-gray-700 hover:bg-blue-50"}
              ${isSelected?"!bg-blue-600 !text-white font-bold hover:!bg-blue-700":""}
              ${isToday&&!isSelected?"ring-1 ring-inset ring-blue-400 font-semibold text-blue-600":""}`}>{c.day}</button>
        })}</div>
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          <button onMouseDown={e=>e.preventDefault()} onClick={()=>pick(todayStr)} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition">Today</button>
          <button onMouseDown={e=>e.preventDefault()} onClick={()=>{onChange("");onClose()}} className="text-xs text-gray-400 hover:text-red-500 transition">Clear</button>
        </div>
      </div>
    </FloatingPopup>
  )
}

function PlatformEditor({ value, onChange, onClose }: { value: string; onChange: (v: string) => void; onClose: () => void }) {
  return (
    <FloatingPopup onClose={onClose}>
      <div className="p-4 grid grid-cols-5 gap-3 w-[280px]">
        {Object.entries(PLATFORM_ICONS).map(([plat, IC]) => {
          const sel = value===plat
          return <button key={plat} onMouseDown={e=>e.preventDefault()} onClick={()=>{onChange(plat);onClose()}} title={plat.charAt(0).toUpperCase()+plat.slice(1)}
            className={`flex flex-col items-center p-3 rounded-xl hover:bg-gray-100 transition-all ${sel?"bg-blue-50 ring-2 ring-blue-400 shadow-sm":""}`}>
            <IC size={32} className={`transition-colors ${sel?"text-blue-600":"text-gray-600"}`}/>
          </button>
        })}
      </div>
    </FloatingPopup>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ADD ROWS MODAL
   ═══════════════════════════════════════════════════════════════════════════════ */
function AddRowsModal({ isOpen, onClose, onAdd, selectedCount }: { isOpen: boolean; onClose: () => void; onAdd: (count: number) => void; selectedCount: number }) {
  const [count, setCount] = useState(5)
  const [insertPosition, setInsertPosition] = useState<"end" | "after-selection">(selectedCount > 0 ? "after-selection" : "end")
  
  if (!isOpen) return null
  
  const handleAdd = () => {
    onAdd(count)
    onClose()
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="bg-white rounded-2xl shadow-xl w-[400px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Multiple Rows</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><IconX size={20}/></button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of rows to add</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                min="1" 
                max="100" 
                value={count} 
                onChange={e => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-center"
              />
              <span className="text-sm text-gray-500">rows</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Insert position</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="position" 
                  value="end" 
                  checked={insertPosition === "end"} 
                  onChange={() => setInsertPosition("end")}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">At the end of the table</span>
              </label>
              <label className={`flex items-center gap-2 ${selectedCount === 0 ? 'opacity-50' : 'cursor-pointer'}`}>
                <input 
                  type="radio" 
                  name="position" 
                  value="after-selection" 
                  checked={insertPosition === "after-selection"} 
                  onChange={() => setInsertPosition("after-selection")}
                  disabled={selectedCount === 0}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">
                  After selected rows 
                  {selectedCount > 0 && <span className="ml-1 text-xs text-blue-600">({selectedCount} selected)</span>}
                  {selectedCount === 0 && <span className="ml-1 text-xs text-gray-400">(no rows selected)</span>}
                </span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleAdd} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition flex items-center justify-center gap-1.5">
            <IconPlus size={16} />
            Add {count} {count === 1 ? 'Row' : 'Rows'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DECLINE CONFIRMATION MODAL
   ═══════════════════════════════════════════════════════════════════════════════ */
function DeclineConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  influencerName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (reason: string) => void; 
  influencerName: string;
}) {
  const [declineReason, setDeclineReason] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  useEffect(() => {
    if (isOpen) {
      setDeclineReason("")
      setError("")
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  const handleConfirm = () => {
    if (!declineReason.trim()) {
      setError("Please provide a reason for declining")
      return
    }
    onConfirm(declineReason.trim())
    onClose()
  }
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault()
      handleConfirm()
    }
    if (e.key === "Escape") {
      onClose()
    }
  }

    const handleSkip = () => {
    onConfirm("")
    onClose()
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="bg-white rounded-2xl shadow-xl w-[450px] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <IconAlertTriangle size={24} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Decline Influencer</h3>
            <p className="text-sm text-gray-500">You are about to decline <span className="font-medium text-gray-700">{influencerName || "this influencer"}</span></p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for declining <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={inputRef}
              value={declineReason}
              onChange={(e) => {
                setDeclineReason(e.target.value)
                setError("")
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Budget constraints, Not a good fit, Already partnered with competitor..."
              rows={4}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-400 outline-none resize-none ${
                error ? "border-red-300 bg-red-50" : "border-gray-200"
              }`}
            />
            {error && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <IconAlertCircle size={12} />
                {error}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              This reason will be saved in the approval notes for future reference.
            </p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <span className="font-medium">Note:</span> Declining this influencer will disable all outreach fields and clear any existing outreach data.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          
                    <button 
            onClick={handleSkip}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition"
            title="Skip adding a reason (not recommended)"
          >
            Skip
          </button>s
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition flex items-center justify-center gap-1.5"
          >
            <IconX size={16} />
            Confirm Decline
          </button>
        </div>
        
        <p className="text-xs text-gray-400 text-center mt-3">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-[10px] font-mono">Ctrl + Enter</kbd> to confirm
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DETAIL SECTION
   ═══════════════════════════════════════════════════════════════════════════════ */
interface DetailSectionProps {
  row: InfluencerRow | null; customCols: CustomColumn[]; onUpdate: (r: InfluencerRow) => void; onClose: () => void; readOnly?: boolean; showEmptyState?: boolean; emptyStateMessage?: string
}

function DetailSection({ row, customCols, onUpdate, onClose, readOnly=false, showEmptyState=true, emptyStateMessage="Select a row to view details" }: DetailSectionProps) {
  const [editMode, setEditMode] = useState(false)
  const [editedRow, setEditedRow] = useState<InfluencerRow|null>(row?{...row}:null)
  const [showDeclineWarning, setShowDeclineWarning] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [pendingDecline, setPendingDecline] = useState(false)
  
  useEffect(() => { if(row){setEditedRow({...row});setEditMode(false);setShowDeclineWarning(false);setPendingDecline(false)} }, [row])

  if (!row || !editedRow) {
    if (!showEmptyState) return null
    return <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center"><div className="flex flex-col items-center gap-3"><IconUserCircle size={48} className="text-gray-300"/><p className="text-gray-400">{emptyStateMessage}</p><p className="text-xs text-gray-300 mt-1">Click on any row to see influencer details</p></div></div>
  }

  const isDeclined = editedRow.approval_status === "Declined"
  const outreachDisabled = isDeclined && !editMode

  const handleFieldChange = (field: string, value: string) => {
    if (!editedRow) return
    
    if (field === "approval_status") {
      if (value === "Declined") {
        // Show decline modal instead of immediately changing
        setPendingDecline(true)
        setShowDeclineModal(true)
        return
      } else {
        setShowDeclineWarning(false)
        setEditedRow(handleApprovalChange(editedRow, value))
      }
    } else if (field.startsWith("custom.")) {
      setEditedRow({...editedRow,custom:{...editedRow.custom,[field.slice(7)]:value}})
    } else if (field === "handle" || field === "platform") {
      const newHandle = field === "handle" ? value : editedRow.handle
      const newPlatform = field === "platform" ? value : editedRow.platform
      const oldUrl = getProfileUrl(editedRow.platform, editedRow.handle)
      const freshUrl = getProfileUrl(newPlatform, newHandle)
      const curLink = editedRow.social_link ?? ""
      const updatedRow = { ...editedRow, [field]: value }
      if (!curLink || curLink === oldUrl) {
        updatedRow.social_link = freshUrl
      }
      setEditedRow(updatedRow)
    } else {
      setEditedRow({...editedRow,[field]:value})
    }
  }

  const handleDeclineConfirm = (reason: string) => {
    if (!editedRow) return
    setEditedRow(handleApprovalChange(editedRow, "Declined", reason))
    setShowDeclineWarning(false)
    setPendingDecline(false)
  }

  const handleDeclineCancel = () => {
    setShowDeclineModal(false)
    setPendingDecline(false)
  }

  const handleSave = () => {
    if (editedRow.approval_status === "Declined" && !editedRow.decline_reason?.trim()) {
      alert("Please provide a reason for declining this influencer in the approval notes.")
      return
    }
    onUpdate(editedRow)
    setEditMode(false)
    setShowDeclineWarning(false)
  }
  
  const handleCancel = () => { if(row) setEditedRow({...row}); setEditMode(false); setShowDeclineWarning(false) }

  return (
    <>
      <DeclineConfirmationModal 
        isOpen={showDeclineModal}
        onClose={handleDeclineCancel}
        onConfirm={handleDeclineConfirm}
        influencerName={editedRow.full_name || editedRow.handle || "this influencer"}
      />
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-100 rounded-lg"><IconUserCircle size={20} className="text-blue-600"/></div>
            <h3 className="font-semibold text-gray-800">{editedRow.full_name||editedRow.handle||"Influencer Details"}</h3>
          </div>
          <div className="flex items-center gap-2">
            {!readOnly && (<>{editMode ? (<>
              <button onClick={handleCancel} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"><IconDeviceFloppy size={14}/> Save</button>
            </>) : (
              <button onClick={()=>setEditMode(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"><IconEdit size={14}/> Edit</button>
            )}</>)}
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><IconX size={18}/></button>
          </div>
        </div>
        
        {showDeclineWarning && (
          <div className="mx-4 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <IconAlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">Please provide a reason for declining this influencer in the approval notes below.</p>
          </div>
        )}
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Influencer Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100"><IconUsers size={14} className="text-blue-500"/><h4 className="font-medium text-sm text-gray-700">Influencer Details</h4></div>
              <div><label className="text-xs text-gray-400 block mb-1">Handle</label>{editMode?<input type="text" value={editedRow.handle} onChange={e=>handleFieldChange("handle",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/>:<div className="flex items-center gap-2"><PlatformIcon platform={editedRow.platform} size={16} className="text-gray-500"/><span className="text-sm text-gray-800">{editedRow.handle}</span></div>}</div>
              <div><label className="text-xs text-gray-400 block mb-1">Platform</label>{editMode?<select value={editedRow.platform} onChange={e=>handleFieldChange("platform",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"><option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="youtube">YouTube</option><option value="twitter">Twitter/X</option><option value="other">Other</option></select>:<div className="flex items-center gap-2"><PlatformIcon platform={editedRow.platform} size={16} className="text-gray-500"/><span className="text-sm text-gray-800 capitalize">{editedRow.platform}</span></div>}</div>
              <div><label className="text-xs text-gray-400 block mb-1">Niche</label>{editMode?<input type="text" value={editedRow.niche} onChange={e=>handleFieldChange("niche",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/>:<div className="flex items-center gap-2"><IconTags size={14} className="text-gray-400"/><span className="text-sm text-gray-800">{editedRow.niche||"—"}</span></div>}</div>
              <div><label className="text-xs text-gray-400 block mb-1">Gender</label>{editMode?<select value={editedRow.gender||""} onChange={e=>handleFieldChange("gender",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"><option value="">Select gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Non-binary">Non-binary</option><option value="Other">Other</option></select>:<div className="flex items-center gap-2"><IconUser size={14} className="text-gray-400"/><span className="text-sm text-gray-800">{editedRow.gender||"—"}</span></div>}</div>
              <div><label className="text-xs text-gray-400 block mb-1">Location</label>{editMode?<input type="text" value={editedRow.location||""} onChange={e=>handleFieldChange("location",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/>:<div className="flex items-center gap-2"><IconMapPin size={14} className="text-gray-400"/><span className="text-sm text-gray-800">{editedRow.location||"—"}</span></div>}</div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-400 block mb-1">Follower Count</label>{editMode?<input type="number" value={editedRow.follower_count} onChange={e=>handleFieldChange("follower_count",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/>:<p className="text-sm text-gray-800">{Number(editedRow.follower_count).toLocaleString()||"—"}</p>}</div>
                <div><label className="text-xs text-gray-400 block mb-1">Engagement Rate</label>{editMode?<input type="number" step="0.1" value={editedRow.engagement_rate} onChange={e=>handleFieldChange("engagement_rate",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/>:<p className="text-sm text-gray-800">{editedRow.engagement_rate?`${editedRow.engagement_rate}%`:"—"}</p>}</div>
              </div>
              <div><label className="text-xs text-gray-400 block mb-1">Social Link</label>{editMode?<input type="url" value={editedRow.social_link||""} onChange={e=>handleFieldChange("social_link",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" placeholder="https://..."/>:(editedRow.social_link?<a href={normalizeUrl(editedRow.social_link)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline group">
                <IconLink size={14} className="flex-shrink-0"/>
                <span className="truncate max-w-[200px]">{editedRow.social_link}</span>
                <IconExternalLink size={12} className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition" />
              </a>:<span className="text-sm text-gray-400">—</span>)}</div>
              <div><label className="text-xs text-gray-400 block mb-1">First Name</label>{editMode?<input type="text" value={editedRow.first_name||""} onChange={e=>handleFieldChange("first_name",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/>:<div className="flex items-center gap-2"><IconUser size={14} className="text-gray-400"/><span className="text-sm text-gray-800">{editedRow.first_name||"—"}</span></div>}</div>
              <div><label className="text-xs text-gray-400 block mb-1">Contact Info</label>{editMode?<input type="text" value={editedRow.contact_info||""} onChange={e=>handleFieldChange("contact_info",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/>:<div className="flex items-center gap-2"><IconAddressBook size={14} className="text-gray-400"/><span className="text-sm text-gray-800">{editedRow.contact_info||"—"}</span></div>}</div>
            </div>
            <div className="space-y-3">
              {/* Approval Details */}
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100"><IconChecklist size={14} className="text-purple-500"/><h4 className="font-medium text-sm text-gray-700">Approval Details</h4></div>
              <div><label className="text-xs text-gray-400 block mb-1">Approve/Decline</label>{editMode?<select value={editedRow.approval_status||"Pending"} onChange={e=>handleFieldChange("approval_status",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Declined">Declined</option></select>:<ApprovalBadge value={editedRow.approval_status||"Pending"}/>}</div>
              <div><label className="text-xs text-gray-400 block mb-1">Transferred Date</label>{editMode?<input type="date" value={editedRow.transferred_date||""} onChange={e=>handleFieldChange("transferred_date",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/>:<div className="flex items-center gap-2"><IconClock size={14} className="text-gray-400"/><span className="text-sm text-gray-800">{editedRow.transferred_date?new Date(editedRow.transferred_date).toLocaleDateString():"—"}</span></div>}</div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Notes {editedRow.approval_status === "Declined" && <span className="text-red-500">*</span>}
                </label>
                {editMode ? (
                  <textarea 
                    value={editedRow.approval_notes||""} 
                    onChange={e => {
                      handleFieldChange("approval_notes", e.target.value)
                      handleFieldChange("decline_reason", e.target.value)
                    }} 
                    rows={2} 
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none resize-none ${
                      editedRow.approval_status === "Declined" && !editedRow.approval_notes?.trim() 
                        ? "border-red-300 bg-red-50" 
                        : "border-gray-200"
                    }`} 
                    placeholder={editedRow.approval_status === "Declined" ? "Required: Provide reason for declining..." : "Add approval notes..."}
                  />
                ) : (
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg min-h-[60px]">{editedRow.approval_notes||"No notes added"}</p>
                )}
              </div>
              
              {/* Outreach Details */}
              <div className="flex items-center gap-2 pt-2 pb-1 border-b border-gray-100">
                <IconChartBar size={14} className={`${outreachDisabled ? 'text-gray-400' : 'text-emerald-500'}`}/>
                <h4 className={`font-medium text-sm ${outreachDisabled ? 'text-gray-400' : 'text-gray-700'}`}>Outreach Details</h4>
                {outreachDisabled && <span className="text-xs text-gray-400 ml-auto">(Disabled - Influencer Declined)</span>}
              </div>
              
              <div className={`${outreachDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
                <label className="text-xs text-gray-400 block mb-1">Status</label>
                {editMode ? (
                  <select value={editedRow.contact_status} onChange={e=>handleFieldChange("contact_status",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white">
                    <option value="not_contacted">Not Contacted</option>
                    <option value="contacted">Contacted</option>
                    <option value="interested">Interested</option>
                    <option value="agreed">Agreed</option>
                  </select>
                ) : (
                  <StatusBadge value={editedRow.contact_status}/>
                )}
              </div>
              
              <div className={`${outreachDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
                <label className="text-xs text-gray-400 block mb-1">Stage</label>
                {editMode ? (
                  <input type="number" min="1" max="5" value={editedRow.stage} onChange={e=>handleFieldChange("stage",e.target.value)} className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white"/>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{width:`${(parseInt(editedRow.stage)||1)*20}%`}}/>
                    </div>
                    <span className="text-sm text-gray-600">Stage {editedRow.stage}/5</span>
                  </div>
                )}
              </div>
              
              <div className={`${outreachDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
                <label className="text-xs text-gray-400 block mb-1">Agreed Rate</label>
                {editMode ? (
                  <input type="number" value={editedRow.agreed_rate} onChange={e=>handleFieldChange("agreed_rate",e.target.value)} className="w-32 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white"/>
                ) : (
                  <div className="flex items-center gap-2">
                    <IconCurrencyDollar size={14} className="text-gray-400"/>
                    <span className="text-sm text-gray-800">{editedRow.agreed_rate?`$${Number(editedRow.agreed_rate).toLocaleString()}`:"—"}</span>
                  </div>
                )}
              </div>
              
              <div className={`${outreachDisabled ? 'opacity-60 pointer-events-none' : ''}`}>
                <label className="text-xs text-gray-400 block mb-1">Notes</label>
                {editMode ? (
                  <textarea value={editedRow.notes} onChange={e=>handleFieldChange("notes",e.target.value)} rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none resize-none bg-white" placeholder="Add notes..."/>
                ) : (
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg min-h-[60px]">{editedRow.notes||"No notes added"}</p>
                )}
              </div>
              
              {/* Custom Fields */}
              {customCols.length > 0 && (<>
                <div className="flex items-center gap-2 pt-2 pb-1 border-b border-gray-100"><IconFileText size={14} className="text-gray-500"/><h4 className="font-medium text-sm text-gray-700">Custom Fields</h4></div>
                {customCols.map((col) => {
                  const val = editedRow.custom[col.field_key]||""
                  const isOutreachCustom = col.assignedGroup === "Outreach Details"
                  const disabled = outreachDisabled && isOutreachCustom
                  
                  return <div key={col.id} className={`${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
                    <label className="text-xs text-gray-400 block mb-1">
                      {col.field_name}
                      {col.description && <span className="ml-1 text-gray-400" title={col.description}>ⓘ</span>}
                    </label>
                    {editMode ? (
                      col.field_type==="boolean"?<select value={val} onChange={e=>handleFieldChange(`custom.${col.field_key}`,e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white"><option value="No">No</option><option value="Yes">Yes</option></select>
                      :col.field_type==="dropdown"?<select value={val} onChange={e=>handleFieldChange(`custom.${col.field_key}`,e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white"><option value="">— Select —</option>{col.field_options?.map(o=><option key={o} value={o}>{o}</option>)}</select>
                      :col.field_type==="multi-select"?<input type="text" value={val} placeholder="Comma-separated values" onChange={e=>handleFieldChange(`custom.${col.field_key}`,e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white"/>
                      :col.field_type==="date"?<input type="date" value={val} onChange={e=>handleFieldChange(`custom.${col.field_key}`,e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white"/>
                      :<input type={col.field_type==="number"?"number":"text"} value={val} onChange={e=>handleFieldChange(`custom.${col.field_key}`,e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-white"/>
                    ) : (
                      <div className="flex items-center gap-2">
                        {col.field_type==="boolean"?<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${val==="Yes"?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>{val||"No"}</span>
                        :col.field_type==="multi-select"?<MultiSelectDisplay value={val}/>
                        :col.field_type==="url"&&val?<a href={normalizeUrl(val)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline group">
                            <IconLink size={14} className="flex-shrink-0"/>
                            <span className="truncate max-w-[150px]">{val}</span>
                            <IconExternalLink size={12} className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition"/>
                          </a>
                        :<p className="text-sm text-gray-800">{val||"—"}</p>}
                      </div>
                    )}
                  </div>
                })}
              </>)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FILTER MODAL
   ═══════════════════════════════════════════════════════════════════════════════ */
function FilterModal({ isOpen, onClose, onApplyFilter, onClearFilter, currentFilterColumn, currentFilterValue, columns }: { isOpen: boolean; onClose: () => void; onApplyFilter: (c: string, v: string) => void; onClearFilter: () => void; currentFilterColumn: string; currentFilterValue: string; columns: AnyColDef[] }) {
  const [sel, setSel] = useState(currentFilterColumn)
  const [val, setVal] = useState(currentFilterValue)
  useEffect(() => { if(isOpen){setSel(currentFilterColumn);setVal(currentFilterValue)} }, [isOpen, currentFilterColumn, currentFilterValue])
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="bg-white rounded-2xl shadow-xl w-[400px] p-6">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900">Filter Data</h3><button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><IconX size={20}/></button></div>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Column</label><select value={sel} onChange={e=>setSel(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"><option value="">Select column</option>{columns.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Filter Value</label><input type="text" value={val} onChange={e=>setVal(e.target.value)} placeholder="Enter value to filter..." className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/></div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={()=>{onClearFilter();onClose()}} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Clear Filter</button>
          <button onClick={()=>{if(sel&&val)onApplyFilter(sel,val);onClose()}} disabled={!sel||!val} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-40 transition">Apply Filter</button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════════════════════ */
const MOCK_ROWS: InfluencerRow[] = [
  { id:"mock-1", handle:"@prettyliv", platform:"instagram", full_name:"Liv Santos", email:"liv@example.com", follower_count:"245000", engagement_rate:"3.2", niche:"Beauty", contact_status:"contacted", stage:"2", agreed_rate:"500", notes:"Very responsive. Sent product for review.", custom:{}, gender:"Female", location:"Los Angeles, CA", social_link:"https://instagram.com/prettyliv", first_name:"Olivia", contact_info:"liv@example.com | +1 555-123-4567", approval_status:"Pending", transferred_date:"", approval_notes:"Awaiting contract signing", decline_reason:"" },
  { id:"mock-2", handle:"@fitwithjay", platform:"tiktok", full_name:"Jay Kim", email:"jay@example.com", follower_count:"890000", engagement_rate:"5.8", niche:"Fitness", contact_status:"interested", stage:"3", agreed_rate:"1200", notes:"Discussing deliverables for Q1 campaign", custom:{}, gender:"Male", location:"New York, NY", social_link:"https://tiktok.com/@fitwithjay", first_name:"Jay", contact_info:"jay@example.com | +1 555-987-6543", approval_status:"Approved", transferred_date:"2024-03-15", approval_notes:"Approved for Q1 campaign - contract signed", decline_reason:"" },
  { id:"mock-3", handle:"@travelwithmar", platform:"youtube", full_name:"Marco Reyes", email:"marco@example.com", follower_count:"1200000", engagement_rate:"2.1", niche:"Travel", contact_status:"agreed", stage:"4", agreed_rate:"2500", notes:"Contract signed for summer campaign", custom:{}, gender:"Male", location:"Miami, FL", social_link:"https://youtube.com/@travelwithmar", first_name:"Marco", contact_info:"marco@example.com | +1 555-456-7890", approval_status:"Declined", transferred_date:"", approval_notes:"Budget constraints for Q1 - reconsider for Q2", decline_reason:"Budget constraints for Q1" },
]

/* ═══════════════════════════════════════════════════════════════════════════════
   PROPS & MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
interface TableSheetProps {
  initialRows?: InfluencerRow[]; initialCustomColumns?: CustomColumn[]; onRowsChange?: (rows: InfluencerRow[]) => void; onCustomColumnsChange?: (cols: CustomColumn[]) => void; readOnly?: boolean; showEmptyDetailState?: boolean; emptyDetailStateMessage?: string; showDetailPanelByDefault?: boolean
}

export default function TableSheet({
  initialRows = MOCK_ROWS, initialCustomColumns = [], onRowsChange, onCustomColumnsChange,
  readOnly = false, showEmptyDetailState = true, emptyDetailStateMessage = "Select a row to view details", showDetailPanelByDefault = false,
}: TableSheetProps) {
  const [rows, setRows] = useState<InfluencerRow[]>(initialRows)
  const [customCols, setCustomCols] = useState<CustomColumn[]>(initialCustomColumns)
  const [activeCell, setActiveCell] = useState<CellAddress|null>(null)
  const [editCell, setEditCell] = useState<CellAddress|null>(null)
  const [editValue, setEditValue] = useState("")
  const [popupCell, setPopupCell] = useState<CellAddress|null>(null)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [addingCol, setAddingCol] = useState(false)
  const [newColName, setNewColName] = useState("")
  const [newColDescription, setNewColDescription] = useState("")
  const [newColType, setNewColType] = useState<CustomColumn["field_type"]>("text")
  const [newColGroup, setNewColGroup] = useState<"Influencer Details" | "Approval Details" | "Outreach Details">("Influencer Details")
  const [newColOpts, setNewColOpts] = useState("")
  const [colOrder, setColOrder] = useState<number[]|null>(null)
  const [dragIdx, setDragIdx] = useState<number|null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number|null>(null)
  const [dragOverGroup, setDragOverGroup] = useState<string|null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterColumn, setFilterColumn] = useState("")
  const [filterValue, setFilterValue] = useState("")
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showAddRowsModal, setShowAddRowsModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [pendingDeclineRowIdx, setPendingDeclineRowIdx] = useState<number | null>(null)
  const [selectedRowId, setSelectedRowId] = useState<string|null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set())
  const [showDetailPanel, setShowDetailPanel] = useState(showDetailPanelByDefault)
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: ReactNode
    onConfirm: () => void
    variant: "danger" | "warning" | "info"
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "danger"
  })

  const editInputRef = useRef<HTMLInputElement|HTMLSelectElement|null>(null)
  const newColInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tabPendingRef = useRef(false)

  const getEffectiveGroup = useCallback((cc: CustomColumn): "Influencer Details"|"Approval Details"|"Outreach Details"|"Custom Fields" => {
    return cc.assignedGroup
  }, [])

  const rawCols: AnyColDef[] = [
    ...STATIC_COLS,
    ...customCols.map<CustomColDef>((c) => ({
      key:`custom.${c.field_key}`, label:c.field_name, group:getEffectiveGroup(c),
      minWidth:c.field_type==="date"?160:c.field_type==="boolean"?100:140,
      type:c.field_type, options:c.field_options, isCustom:true, customId:c.id, fieldKey:c.field_key, assignedGroup:c.assignedGroup,
    })),
  ]

  useEffect(() => { setColOrder(prev => (!prev||prev.length!==rawCols.length)?rawCols.map((_,i)=>i):prev) }, [rawCols.length])

  const order = colOrder&&colOrder.length===rawCols.length ? colOrder : rawCols.map((_,i)=>i)
  const allCols = order.map(i=>rawCols[i])
  const totalCols = allCols.length

  // Filtering
  const filteredRows = rows.filter(row => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const match = row.handle.toLowerCase().includes(q)||row.full_name.toLowerCase().includes(q)||row.email.toLowerCase().includes(q)||row.niche.toLowerCase().includes(q)||row.notes.toLowerCase().includes(q)||(row.first_name&&row.first_name.toLowerCase().includes(q))||(row.location&&row.location.toLowerCase().includes(q))
      if (!match) return false
    }
    if (filterColumn&&filterValue) {
      let cv = filterColumn.startsWith("custom.")?row.custom[filterColumn.slice(7)]||"":String((row as Record<string,unknown>)[filterColumn]||"")
      if (!cv.toLowerCase().includes(filterValue.toLowerCase())) return false
    }
    return true
  })

  const totalRows = filteredRows.length
  const totalPages = Math.max(1,Math.ceil(totalRows/rowsPerPage))
  const pageStart = (currentPage-1)*rowsPerPage
  const pageEnd = Math.min(pageStart+rowsPerPage, totalRows)
  const pageRows = filteredRows.slice(pageStart, pageEnd)

  useEffect(() => { const mx=Math.max(1,Math.ceil(filteredRows.length/rowsPerPage)); if(currentPage>mx)setCurrentPage(mx) }, [filteredRows.length,rowsPerPage,currentPage])

  const selectedRow = rows.find(r=>r.id===selectedRowId)||null

  const handleRowSelect = (id: string, e?: React.MouseEvent) => {
    if (e?.ctrlKey || e?.metaKey) {
      setSelectedRowIds(prev => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return next
      })
      setSelectedRowId(id)
    } else if (e?.shiftKey && selectedRowId) {
      const currentIdx = filteredRows.findIndex(r => r.id === selectedRowId)
      const targetIdx = filteredRows.findIndex(r => r.id === id)
      if (currentIdx !== -1 && targetIdx !== -1) {
        const start = Math.min(currentIdx, targetIdx)
        const end = Math.max(currentIdx, targetIdx)
        const rangeIds = filteredRows.slice(start, end + 1).map(r => r.id)
        setSelectedRowIds(new Set(rangeIds))
      }
      setSelectedRowId(id)
    } else {
      setSelectedRowId(id)
      setSelectedRowIds(new Set([id]))
    }
  }

  const handleUpdateRow = (r: InfluencerRow) => { 
    setRows(prev=>{
      const next=prev.map(x=>x.id===r.id?r:x)
      onRowsChange?.(next)
      return next
    })
  }
  
  const handleApplyFilter = (c: string,v: string) => { setFilterColumn(c);setFilterValue(v);setCurrentPage(1) }
  const handleClearFilter = () => { setFilterColumn("");setFilterValue("");setCurrentPage(1) }

  const handleAddMultipleRows = (count: number) => {
    const newRows: InfluencerRow[] = []
    for (let i = 0; i < count; i++) {
      newRows.push(newEmptyRow(customCols))
    }
    
    setRows(prev => {
      let next: InfluencerRow[]
      if (selectedRowIds.size > 0) {
        const selectedIndices = filteredRows
          .map((r, idx) => selectedRowIds.has(r.id) ? idx : -1)
          .filter(idx => idx !== -1)
        const lastSelectedIdx = Math.max(...selectedIndices)
        const lastSelectedId = filteredRows[lastSelectedIdx].id
        const insertIdx = prev.findIndex(r => r.id === lastSelectedId) + 1
        
        next = [
          ...prev.slice(0, insertIdx),
          ...newRows,
          ...prev.slice(insertIdx)
        ]
      } else {
        next = [...prev, ...newRows]
      }
      onRowsChange?.(next)
      return next
    })
    
    setCurrentPage(Math.ceil((rows.length + count) / rowsPerPage))
    containerRef.current?.focus()
  }

  const addRow = () => { 
    const r = newEmptyRow(customCols)
    setRows(prev=>{
      const next=[...prev, r]
      onRowsChange?.(next)
      return next
    })
    setCurrentPage(Math.ceil((rows.length+1)/rowsPerPage))
    setActiveCell({rowIdx:rows.length, colIdx:0})
    containerRef.current?.focus() 
  }
  
  const deleteRow = (id: string) => {
    const rowToDelete = rows.find(r => r.id === id)
    setConfirmDialog({
      isOpen: true,
      title: "Delete Row",
      message: (
        <span>
          Are you sure you want to delete <strong>{rowToDelete?.full_name || rowToDelete?.handle || "this row"}</strong>? This action cannot be undone.
        </span>
      ),
      onConfirm: () => {
        setRows(prev=>{
          const next=prev.filter(r=>r.id!==id)
          onRowsChange?.(next)
          return next
        })
        if(selectedRowId===id) setSelectedRowId(null)
        setSelectedRowIds(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      },
      variant: "danger"
    })
  }
  
  const deleteSelectedRows = () => {
    if (selectedRowIds.size === 0) return
    
    setConfirmDialog({
      isOpen: true,
      title: "Delete Selected Rows",
      message: (
        <span>
          Are you sure you want to delete <strong>{selectedRowIds.size} {selectedRowIds.size === 1 ? 'row' : 'rows'}</strong>? This action cannot be undone.
        </span>
      ),
      onConfirm: () => {
        setRows(prev => {
          const next = prev.filter(r => !selectedRowIds.has(r.id))
          onRowsChange?.(next)
          return next
        })
        setSelectedRowId(null)
        setSelectedRowIds(new Set())
      },
      variant: "danger"
    })
  }

  const onColDragStart = (vi: number,e: DragEvent) => { setDragIdx(vi);e.dataTransfer.effectAllowed="move";e.dataTransfer.setDragImage(e.currentTarget as HTMLElement,40,18) }
  const onColDragOver = (vi: number,e: DragEvent) => { e.preventDefault();e.dataTransfer.dropEffect="move";setDragOverIdx(vi);const tc=allCols[vi];if(tc&&(tc.group==="Influencer Details"||tc.group==="Approval Details"||tc.group==="Outreach Details")){setDragOverGroup(tc.group)}else{setDragOverGroup(null)} }
  const onColDragEnd = () => {
    if(dragIdx!==null&&dragOverIdx!==null&&dragIdx!==dragOverIdx){
      const dc=allCols[dragIdx]
      if(dc.isCustom&&dragOverGroup&&(dragOverGroup==="Influencer Details"||dragOverGroup==="Approval Details"||dragOverGroup==="Outreach Details")){
        const fk=(dc as CustomColDef).fieldKey
        setCustomCols(prev=>{
          const next=prev.map(c=>c.field_key===fk?{...c,assignedGroup:dragOverGroup as "Influencer Details"|"Approval Details"|"Outreach Details"}:c)
          onCustomColumnsChange?.(next)
          return next
        })
      }
      setColOrder(prev=>{const arr=[...(prev??rawCols.map((_,i)=>i))];const[moved]=arr.splice(dragIdx,1);arr.splice(dragOverIdx!,0,moved);return arr})
    }
    setDragIdx(null);setDragOverIdx(null);setDragOverGroup(null)
  }

  const getCellValue = useCallback((row: InfluencerRow,key: string): string => {
    if(key.startsWith("custom."))return row.custom[key.slice(7)]??""; return String((row as Record<string,unknown>)[key]??"")
  }, [])

  const isOutreachField = useCallback((colKey: string): boolean => {
    if (colKey.startsWith("custom.")) {
      const fk = colKey.slice(7)
      const customCol = customCols.find(c => c.field_key === fk)
      return customCol?.assignedGroup === "Outreach Details"
    }
    return OUTREACH_FIELDS.has(colKey)
  }, [customCols])

  const handleDeclineConfirm = (reason: string) => {
    if (pendingDeclineRowIdx === null) return
    
    const actualRow = filteredRows[pendingDeclineRowIdx]
    const actualRowIdx = rows.findIndex(r => r.id === actualRow.id)
    if (actualRowIdx === -1) return
    
    setRows(prev => {
      const next = [...prev]
      next[actualRowIdx] = handleApprovalChange(prev[actualRowIdx], "Declined", reason)
      onRowsChange?.(next)
      return next
    })
    
    setShowDeclineModal(false)
    setPendingDeclineRowIdx(null)
    containerRef.current?.focus()
  }

  const applyCellValue = useCallback((rowIdx: number, colKey: string, value: string) => {
    const actualRow = filteredRows[rowIdx]
    const actualRowIdx = rows.findIndex(r=>r.id===actualRow.id)
    if(actualRowIdx===-1)return
    
    if (actualRow.approval_status === "Declined" && isOutreachField(colKey)) {
      return
    }
    
    if (colKey === "approval_status" && value === "Declined") {
      setPendingDeclineRowIdx(rowIdx)
      setShowDeclineModal(true)
      return
    }
    
    setRows(prev=>{
      const next=[...prev]
      let row={...next[actualRowIdx]}
      
      if(colKey==="approval_status"){
        row=handleApprovalChange(row,value)
      } else if(colKey.startsWith("custom.")){
        row.custom={...row.custom,[colKey.slice(7)]:value}
      } else {
        (row as Record<string,unknown>)[colKey]=value
      }
      
      if(colKey==="handle"||colKey==="platform"){
        const newHandle = colKey==="handle"?value:row.handle
        const newPlatform = colKey==="platform"?value:row.platform
        const oldUrl = getProfileUrl(
          colKey==="platform"?prev[actualRowIdx].platform:row.platform,
          colKey==="handle"?prev[actualRowIdx].handle:row.handle
        )
        const freshUrl = getProfileUrl(newPlatform, newHandle)
        const curSocialLink = row.social_link ?? ""
        if(!curSocialLink || curSocialLink===oldUrl){
          row.social_link = freshUrl
        }
        const urlFieldKeys = customCols.filter(c=>c.field_type==="url").map(c=>c.field_key)
        if(urlFieldKeys.length){
          row.custom={...row.custom}
          urlFieldKeys.forEach(fk=>{
            const cur=row.custom[fk]??""
            if(!cur||cur===oldUrl)row.custom[fk]=freshUrl
          })
        }
      }
      
      next[actualRowIdx]=row
      onRowsChange?.(next)
      return next
    })
  }, [onRowsChange, customCols, filteredRows, rows, isOutreachField])

  const addOptionToCol = useCallback((fk: string,newOpt: string) => {
    setCustomCols(prev=>{
      const next=prev.map(c=>c.field_key!==fk?c:{...c,field_options:[...(c.field_options??[]),newOpt]})
      onCustomColumnsChange?.(next)
      return next
    })
  }, [onCustomColumnsChange])

  const startEdit = useCallback((ri: number,ci: number) => {
    if(readOnly)return
    const col=allCols[ci]
    const row=filteredRows[ri]
    
    if (row.approval_status === "Declined" && isOutreachField(col.key)) {
      return
    }
    
    if(col.type==="boolean"){applyCellValue(ri,col.key,getCellValue(row,col.key)==="Yes"?"No":"Yes");setActiveCell({rowIdx:ri,colIdx:ci});return}
    if(col.key==="platform"||col.type==="dropdown"||col.type==="multi-select"||col.type==="date"){setActiveCell({rowIdx:ri,colIdx:ci});setEditCell(null);setPopupCell({rowIdx:ri,colIdx:ci});return}
    setActiveCell({rowIdx:ri,colIdx:ci});setPopupCell(null);setEditCell({rowIdx:ri,colIdx:ci});setEditValue(getCellValue(row,col.key))
  }, [allCols, getCellValue, readOnly, filteredRows, applyCellValue, isOutreachField])

  const commitEdit = useCallback(() => { if(!editCell)return; applyCellValue(editCell.rowIdx,allCols[editCell.colIdx].key,editValue); setEditCell(null) }, [editCell,editValue,allCols,applyCellValue])
  const cancelEdit = useCallback(() => { setEditCell(null);setPopupCell(null) }, [])

  useEffect(() => { if(!editCell)return; requestAnimationFrame(()=>{const el=editInputRef.current;if(!el)return;el.focus();if(el instanceof HTMLInputElement)el.select()}) }, [editCell])
  useEffect(() => { if(addingCol)newColInputRef.current?.focus() }, [addingCol])

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement|HTMLSelectElement>) => {
    if(e.key==="Enter"){e.preventDefault();commitEdit();if(activeCell&&activeCell.rowIdx<pageEnd-1)setActiveCell({rowIdx:activeCell.rowIdx+1,colIdx:activeCell.colIdx});containerRef.current?.focus()}
    else if(e.key==="Escape"){cancelEdit();containerRef.current?.focus()}
    else if(e.key==="Tab"){e.preventDefault();tabPendingRef.current=true;commitEdit();if(activeCell){const nc=e.shiftKey?Math.max(0,activeCell.colIdx-1):Math.min(totalCols-1,activeCell.colIdx+1);const next={rowIdx:activeCell.rowIdx,colIdx:nc};setActiveCell(next);setTimeout(()=>{startEdit(next.rowIdx,next.colIdx);tabPendingRef.current=false},0)}}
    else if(e.key==="ArrowRight"){e.preventDefault();commitEdit();if(activeCell&&activeCell.colIdx<totalCols-1){const n={rowIdx:activeCell.rowIdx,colIdx:activeCell.colIdx+1};setActiveCell(n);setTimeout(()=>startEdit(n.rowIdx,n.colIdx),0)}}
    else if(e.key==="ArrowLeft"){e.preventDefault();commitEdit();if(activeCell&&activeCell.colIdx>0){const n={rowIdx:activeCell.rowIdx,colIdx:activeCell.colIdx-1};setActiveCell(n);setTimeout(()=>startEdit(n.rowIdx,n.colIdx),0)}}
    else if(e.key==="ArrowUp"){e.preventDefault();commitEdit();if(activeCell&&activeCell.rowIdx>0){const n={rowIdx:activeCell.rowIdx-1,colIdx:activeCell.colIdx};setActiveCell(n);setTimeout(()=>startEdit(n.rowIdx,n.colIdx),0)}}
    else if(e.key==="ArrowDown"){e.preventDefault();commitEdit();if(activeCell&&activeCell.rowIdx<pageEnd-1){const n={rowIdx:activeCell.rowIdx+1,colIdx:activeCell.colIdx};setActiveCell(n);setTimeout(()=>startEdit(n.rowIdx,n.colIdx),0)}}
  }
  const handleEditBlur = () => { if(tabPendingRef.current)return; commitEdit() }

  const handleContainerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if(editCell||popupCell||!activeCell)return
    const{rowIdx,colIdx}=activeCell
    switch(e.key){
      case"ArrowUp":e.preventDefault();if(rowIdx>pageStart)setActiveCell({rowIdx:rowIdx-1,colIdx});break
      case"ArrowDown":e.preventDefault();if(rowIdx<pageEnd-1)setActiveCell({rowIdx:rowIdx+1,colIdx});break
      case"ArrowLeft":e.preventDefault();if(colIdx>0)setActiveCell({rowIdx,colIdx:colIdx-1});break
      case"ArrowRight":e.preventDefault();if(colIdx<totalCols-1)setActiveCell({rowIdx,colIdx:colIdx+1});break
      case"Tab":e.preventDefault();setActiveCell({rowIdx,colIdx:e.shiftKey?Math.max(0,colIdx-1):Math.min(totalCols-1,colIdx+1)});break
      case"Enter":case"F2":e.preventDefault();startEdit(rowIdx,colIdx);break
      case"Delete":case"Backspace":e.preventDefault();applyCellValue(rowIdx,allCols[colIdx].key,"");break
    }
  }

  const confirmAddCol = () => {
    const name=newColName.trim()
    if(!name)return
    
    const fk=name.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"")
    const hasOpts=newColType==="dropdown"||newColType==="multi-select"
    const col: CustomColumn = {
      id: crypto.randomUUID(),
      field_key: fk,
      field_name: name,
      field_type: newColType,
      field_options: hasOpts ? newColOpts.split(",").map(s=>s.trim()).filter(Boolean) : undefined,
      assignedGroup: newColGroup,
      description: newColDescription.trim() || undefined
    }
    
    setCustomCols(prev=>{
      const next=[...prev,col]
      onCustomColumnsChange?.(next)
      return next
    })
    
    setRows(prev=>prev.map(r=>{
      let dv=""
      if(newColType==="boolean") dv="No"
      else if(newColType==="url") dv=getProfileUrl(r.platform,r.handle)
      return {...r, custom: {...r.custom, [fk]: dv}}
    }))
    
    setNewColName("")
    setNewColDescription("")
    setNewColType("text")
    setNewColGroup("Influencer Details")
    setNewColOpts("")
    setAddingCol(false)
    containerRef.current?.focus()
  }
  
  const deleteCustomCol = (fk: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Custom Column",
      message: "Are you sure you want to delete this custom column? All data stored in this column will be permanently lost.",
      onConfirm: () => {
        setCustomCols(prev=>{
          const next=prev.filter(c=>c.field_key!==fk)
          onCustomColumnsChange?.(next)
          return next
        })
        setRows(prev=>prev.map(r=>{
          const custom={...r.custom}
          delete custom[fk]
          return {...r,custom}
        }))
        setActiveCell(null);setEditCell(null);setPopupCell(null)
      },
      variant: "danger"
    })
  }

  const getGroupBgClass = (g: string) => { switch(g){case"Influencer Details":return"bg-blue-50 text-blue-700";case"Approval Details":return"bg-purple-50 text-purple-700";case"Outreach Details":return"bg-emerald-50 text-emerald-700";case"Custom Fields":return"bg-gray-50 text-gray-500 border-dashed";default:return"bg-gray-50 text-gray-700"} }
  const getColHeaderBgClass = (g: string) => { switch(g){case"Influencer Details":return"bg-blue-50/60";case"Approval Details":return"bg-purple-50/60";case"Outreach Details":return"bg-emerald-50/60";case"Custom Fields":return"bg-gray-50/40 border-dashed";default:return"bg-gray-50/60"} }

  const groupSpans:{group:string;span:number}[]=[]
  allCols.forEach(col=>{const last=groupSpans[groupSpans.length-1];if(last&&last.group===col.group){last.span++}else{groupSpans.push({group:col.group,span:1})}})

  const getActiveFilterText = () => { if(!filterColumn||!filterValue)return null; const c=allCols.find(x=>x.key===filterColumn); return `${c?.label||filterColumn}: "${filterValue}"` }

  const renderCell = (row: InfluencerRow, rowIdx: number, col: AnyColDef, colIdx: number) => {
    const isActive=activeCell?.rowIdx===rowIdx&&activeCell?.colIdx===colIdx
    const isEditing=editCell?.rowIdx===rowIdx&&editCell?.colIdx===colIdx
    const isPopup=popupCell?.rowIdx===rowIdx&&popupCell?.colIdx===colIdx
    const value=getCellValue(row,col.key)
    const ringCls=isActive?"ring-2 ring-inset ring-blue-500 z-[1]":""
    
    const isOutreach = isOutreachField(col.key)
    const isDeclined = row.approval_status === "Declined"
    const disabled = isDeclined && isOutreach
    
    if (disabled) {
      return <td key={col.key} className={`border border-gray-200 px-2 py-1.5 text-sm bg-gray-100 text-gray-400 cursor-not-allowed`} style={{minWidth:col.minWidth}}>
        {col.key==="contact_status" ? <StatusBadge value={value} /> : 
         col.key==="approval_status" ? <ApprovalBadge value={value} /> :
         <span className="block truncate text-gray-400">{value || "—"}</span>}
      </td>
    }

    if(isEditing){
      if(col.type==="select"&&col.options&&col.key!=="platform"){
        return <td key={col.key} className={`border border-gray-200 p-0 relative ${ringCls}`} style={{minWidth:col.minWidth}}>
          <select ref={editInputRef as React.RefObject<HTMLSelectElement>} value={editValue} onChange={e=>setEditValue(e.target.value)} onBlur={handleEditBlur} onKeyDown={handleEditKeyDown} onMouseDown={e=>e.stopPropagation()} className="w-full h-full px-2 py-1.5 text-sm outline-none bg-white appearance-none">
            {col.options.map(o=><option key={o} value={o}>{o||"—"}</option>)}
          </select></td>
      }
      if(col.type==="url"){
        const inv=editValue!==""&&!isValidUrl(editValue)
        return <td key={col.key} className={`border border-gray-200 p-0 relative ${ringCls}`} style={{minWidth:col.minWidth}}>
          <input ref={editInputRef as React.RefObject<HTMLInputElement>} type="text" value={editValue} placeholder="https://…" onChange={e=>setEditValue(e.target.value)} onBlur={handleEditBlur} onKeyDown={handleEditKeyDown} onMouseDown={e=>e.stopPropagation()} className={`w-full h-full px-2 py-1.5 text-sm outline-none bg-white ${inv?"text-red-500":"text-blue-600"}`}/>
          {inv&&<div className="absolute -bottom-5 left-1 text-[10px] text-red-400 whitespace-nowrap z-50">Enter a valid URL</div>}</td>
      }
      return <td key={col.key} className={`border border-gray-200 p-0 relative ${ringCls}`} style={{minWidth:col.minWidth}}>
        <input ref={editInputRef as React.RefObject<HTMLInputElement>} type={col.type==="number"?"number":"text"} value={editValue} onChange={e=>setEditValue(e.target.value)} onBlur={handleEditBlur} onKeyDown={handleEditKeyDown} onMouseDown={e=>e.stopPropagation()} className="w-full h-full px-2 py-1.5 text-sm outline-none bg-white"/></td>
    }

    if(isPopup){
      const closeP=()=>{setPopupCell(null);containerRef.current?.focus()}
      if(col.key==="platform"){const IC=PLATFORM_ICONS[value]||IconWorld;return <td key={col.key} className={`border border-gray-200 px-2 py-1.5 text-sm relative ${ringCls}`} style={{minWidth:col.minWidth}}><div className="flex items-center justify-center"><IC size={20} className="text-gray-700"/></div><PlatformEditor value={value} onChange={v=>applyCellValue(rowIdx,col.key,v)} onClose={closeP}/></td>}
      if(col.type==="dropdown"&&col.isCustom){return <td key={col.key} className={`border border-gray-200 px-2 py-1.5 text-sm relative ${ringCls}`} style={{minWidth:col.minWidth}}>{value?<span className="inline-block px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium truncate max-w-full">{value}</span>:<span className="text-gray-300">—</span>}<DropdownEditor value={value} options={col.options??[]} onChange={v=>applyCellValue(rowIdx,col.key,v)} onClose={closeP} onAddOption={o=>addOptionToCol((col as CustomColDef).fieldKey,o)}/></td>}
      if(col.type==="multi-select"&&col.isCustom){return <td key={col.key} className={`border border-gray-200 px-2 py-1.5 text-sm relative ${ringCls}`} style={{minWidth:col.minWidth}}><MultiSelectDisplay value={value}/><MultiSelectEditor value={value} options={col.options??[]} onChange={v=>applyCellValue(rowIdx,col.key,v)} onClose={closeP} onAddOption={o=>addOptionToCol((col as CustomColDef).fieldKey,o)}/></td>}
      if(col.type==="date"){const disp=value?new Date(value+"T00:00:00").toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}):"";return <td key={col.key} className={`border border-gray-200 px-2 py-1.5 text-sm relative ${ringCls}`} style={{minWidth:col.minWidth}}><div className="flex items-center gap-1.5"><IconCalendar size={14} className="text-blue-500 flex-shrink-0"/><span>{disp||<span className="text-gray-300">Pick a date</span>}</span></div><DatePicker value={value} onChange={v=>applyCellValue(rowIdx,col.key,v)} onClose={closeP}/></td>}
    }

    const tdCls=`border border-gray-200 px-2 py-1.5 text-sm cursor-cell select-none relative hover:bg-blue-50/20 ${ringCls}`
    const onClick=()=>startEdit(rowIdx,colIdx)
    const onFocus=()=>setActiveCell({rowIdx,colIdx})

    if(col.key==="platform"){const IC=PLATFORM_ICONS[value]||null;return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}>{IC?<div className="flex items-center justify-center"><IC size={20} className="text-gray-700"/></div>:<span className="text-gray-300">—</span>}</td>}
    if(col.type==="boolean"){const y=value==="Yes";return <td key={col.key} className={`${tdCls} cursor-pointer`} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}><span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${y?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>{y?"Yes":"No"}</span></td>}
    if(col.type==="multi-select"){return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}><MultiSelectDisplay value={value}/></td>}
    if(col.type==="date"){const disp=value?new Date(value+"T00:00:00").toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}):"";return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}><div className="flex items-center gap-1.5"><IconCalendar size={14} className="text-gray-400 flex-shrink-0"/><span className="truncate">{disp||<span className="text-gray-300">—</span>}</span></div></td>}
    if(col.type==="url"){
      const valid=isValidUrl(value)
      return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}>
        {value ? (
          valid ? (
            <a
              href={normalizeUrl(value)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center justify-center"
            >
              <IconExternalLink size={16} />
            </a>
          ) : (
            <span className="text-red-400 truncate block">{value}</span>
          )
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>
    }
    if(col.type==="dropdown"){return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}>{value?<span className="inline-block px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium truncate max-w-full">{value}</span>:<span className="text-gray-300">—</span>}</td>}
    if(col.key==="approval_status"){return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}><ApprovalBadge value={value}/></td>}
    return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}>{col.key==="contact_status"?<StatusBadge value={value}/>:<span className="block truncate">{value}</span>}</td>
  }

  const declineModalInfluencerName = pendingDeclineRowIdx !== null 
    ? filteredRows[pendingDeclineRowIdx]?.full_name || filteredRows[pendingDeclineRowIdx]?.handle || "this influencer"
    : "this influencer"

  return (
    <div className="flex flex-col gap-4">
      <ConfirmationDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />
      
      <DeclineConfirmationModal 
        isOpen={showDeclineModal}
        onClose={() => {setShowDeclineModal(false); setPendingDeclineRowIdx(null)}}
        onConfirm={handleDeclineConfirm}
        influencerName={declineModalInfluencerName}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search by handle, name, email, niche, location, notes..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"/>
        </div>
        <div className="flex items-center gap-2">
          {selectedRowIds.size > 0 && !readOnly && (
            <button onClick={deleteSelectedRows} className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition">
              <IconTrash size={16}/>
              Delete {selectedRowIds.size} {selectedRowIds.size === 1 ? 'row' : 'rows'}
            </button>
          )}
          <button onClick={()=>setShowFilterModal(true)} className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition ${filterColumn?"bg-blue-100 text-blue-700":"text-gray-600 hover:bg-gray-100"}`}><IconFilter size={16}/>Filter{filterColumn&&<span className="w-2 h-2 bg-blue-500 rounded-full"/>}</button>
          <button onClick={()=>setShowDetailPanel(!showDetailPanel)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">{showDetailPanel?<IconEyeOff size={16}/>:<IconEye size={16}/>}{showDetailPanel?"Hide Details":"Show Details"}</button>
        </div>
      </div>

      {getActiveFilterText()&&<div className="flex items-center gap-2"><span className="text-xs text-gray-500">Active filter:</span><div className="flex items-center gap-1.5 bg-blue-50 rounded-full px-3 py-1 text-xs"><IconFilter size={12} className="text-blue-500"/><span className="text-blue-700">{getActiveFilterText()}</span><button onClick={handleClearFilter} className="ml-1 text-blue-400 hover:text-blue-600"><IconX size={12}/></button></div></div>}

      <FilterModal isOpen={showFilterModal} onClose={()=>setShowFilterModal(false)} onApplyFilter={handleApplyFilter} onClearFilter={handleClearFilter} currentFilterColumn={filterColumn} currentFilterValue={filterValue} columns={allCols}/>
      <AddRowsModal isOpen={showAddRowsModal} onClose={()=>setShowAddRowsModal(false)} onAdd={handleAddMultipleRows} selectedCount={selectedRowIds.size}/>

      <div className={`flex gap-4 ${showDetailPanel?"flex-col lg:flex-row":"flex-col"}`}>
        <div className={`${showDetailPanel?"lg:flex-1":"w-full"} min-w-0`}>
          <div ref={containerRef} tabIndex={0} className="overflow-auto border border-gray-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-200"
            onKeyDown={handleContainerKeyDown}
            onMouseDown={e=>{const t=e.target as HTMLElement;if(t.closest("input, select, button, [tabindex]")&&t!==containerRef.current)return;setTimeout(()=>containerRef.current?.focus(),0)}}>
            <table className="text-sm border-collapse" style={{minWidth:"max-content"}}>
              <thead className="sticky top-0 z-10">
                <tr>
                  <th rowSpan={2} className="border border-gray-200 bg-gray-50 w-10 min-w-[2.5rem] text-center text-xs text-gray-400 font-normal">#</th>
                  {groupSpans.map((g,i)=><th key={`${g.group}-${i}`} colSpan={g.span} className={`border border-gray-200 text-center text-xs font-semibold py-1.5 px-3 whitespace-nowrap ${getGroupBgClass(g.group)}`}>{g.group}</th>)}
                  {!readOnly&&<th rowSpan={2} className="border border-gray-200 bg-gray-50 text-center">
                    <button 
                      onClick={()=>setAddingCol(true)} 
                      title="Add column" 
                      className="px-2 py-1 mx-auto flex items-center justify-center gap-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition text-xs"
                    >
                      <IconPlus size={12}/>
                      <span>Add column</span>
                    </button>
                  </th>}
                  <th rowSpan={2} className="border border-gray-200 bg-gray-50 w-10 min-w-[2.5rem]"/>
                </tr>
                <tr>
                  {allCols.map((col,vi)=>{
                    const isDragging=dragIdx===vi;const isOver=dragOverIdx===vi&&dragIdx!==vi
                    return <th key={col.key} draggable={!readOnly} onDragStart={e=>onColDragStart(vi,e)} onDragOver={e=>onColDragOver(vi,e)} onDragEnd={onColDragEnd}
                      className={`border border-gray-200 px-2 py-1.5 text-left text-xs font-semibold text-gray-600 whitespace-nowrap group/col transition-all ${getColHeaderBgClass(col.group)} ${isDragging?"opacity-40":""} ${isOver?"border-l-2 !border-l-blue-500":""}`}
                      style={{minWidth:col.minWidth,cursor:readOnly?"default":"grab"}}>
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          {!readOnly&&<IconGripVertical size={12} className="text-gray-300 flex-shrink-0 opacity-0 group-hover/col:opacity-100 transition"/>}
                          <span title={col.isCustom ? (col as CustomColDef).assignedGroup : undefined}>{col.label}</span>
                        </div>
                        {!readOnly&&col.isCustom&&<button onClick={()=>deleteCustomCol((col as CustomColDef).fieldKey)} title="Remove column" className="opacity-0 group-hover/col:opacity-100 p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><IconX size={12}/></button>}
                      </div></th>
                  })}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row,li)=>{
                  const ri=pageStart+li
                  const isSel=selectedRowIds.has(row.id)
                  const isDeclined = row.approval_status === "Declined"
                  
                  return(
                  <tr key={row.id} className={`group cursor-pointer transition-colors ${isSel?"bg-blue-100":"hover:bg-gray-50/60"} ${isDeclined ? "bg-red-50/30" : ""}`} onClick={(e)=>handleRowSelect(row.id, e)}>
                    <td className="border border-gray-200 text-center text-xs text-gray-400 bg-gray-50/40 select-none">
                      <div className="flex items-center justify-center gap-1">
                        {isSel && <IconCheck size={12} className="text-blue-600" />}
                        {ri+1}
                      </div>
                    </td>
                    {allCols.map((col,ci)=>renderCell(row,ri,col,ci))}
                    {!readOnly&&<td className="border border-gray-200 bg-gray-50/40"/>}
                    <td className="border border-gray-200 text-center bg-gray-50/40">{!readOnly&&<button onClick={e=>{e.stopPropagation();deleteRow(row.id)}} title="Delete row" className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition"><IconTrash size={14}/></button>}</td>
                  </tr>
                )})}
                {totalRows===0&&<tr><td colSpan={totalCols+3} className="py-10 text-center text-sm text-gray-400">No influencers found. Try adjusting your search or filters, or add rows to get started.</td></tr>}
              </tbody>
              {!readOnly&&<tfoot>
                <tr>
                  <td colSpan={totalCols+3} className="border-t border-gray-200">
                    <div className="flex items-center">
                      <button onClick={addRow} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 transition">
                        <IconPlus size={14}/> Add row
                      </button>
                      <button onClick={()=>setShowAddRowsModal(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition border-l border-gray-200">
                        <IconCopy size={14}/> Add multiple rows
                      </button>
                    </div>
                  </td>
                </tr>
              </tfoot>}
            </table>
          </div>

          {totalRows>0&&(
            <div className="flex items-center justify-between gap-4 text-sm text-gray-600 px-1 mt-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Rows per page:</span>
                <select value={rowsPerPage} onChange={e=>{setRowsPerPage(Number(e.target.value));setCurrentPage(1)}} className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white outline-none focus:ring-2 ring-blue-400"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select>
                {selectedRowIds.size > 0 && <span className="ml-4 text-xs text-blue-600">{selectedRowIds.size} row{selectedRowIds.size !== 1 ? 's' : ''} selected</span>}
              </div>
              <div className="flex items-center gap-2"><span className="text-gray-400 text-xs">{pageStart+1}–{pageEnd} of {totalRows}</span><div className="flex gap-1">
                <button onClick={()=>setCurrentPage(1)} disabled={currentPage===1} className="px-2 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50 transition">«</button>
                <button onClick={()=>setCurrentPage(p=>Math.max(p-1,1))} disabled={currentPage===1} className="px-3 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50 transition">Prev</button>
                <span className="px-3 py-1 border border-gray-200 rounded-lg text-xs bg-white min-w-[70px] text-center">{currentPage} / {totalPages}</span>
                <button onClick={()=>setCurrentPage(p=>Math.min(p+1,totalPages))} disabled={currentPage===totalPages} className="px-3 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50 transition">Next</button>
                <button onClick={()=>setCurrentPage(totalPages)} disabled={currentPage===totalPages} className="px-2 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50 transition">»</button>
              </div></div>
            </div>
          )}
        </div>

        {showDetailPanel&&<div className="lg:w-[420px] flex-shrink-0"><DetailSection row={selectedRow} customCols={customCols} onUpdate={handleUpdateRow} onClose={()=>{setSelectedRowId(null);setSelectedRowIds(new Set())}} readOnly={readOnly} showEmptyState={showEmptyDetailState} emptyStateMessage={emptyDetailStateMessage}/></div>}
      </div>

      {!readOnly&&(
        <div className="flex items-center gap-4 px-1 flex-wrap">
          {[{keys:["Ctrl","Click"],label:"Multi-select"},{keys:["Shift","Click"],label:"Range select"},{keys:["↑","↓","←","→"],label:"Navigate"},{keys:["Enter"],label:"Edit"},{keys:["Tab"],label:"Next cell"},{keys:["Esc"],label:"Cancel"},{keys:["Del"],label:"Clear"}].map(({keys,label})=>(
            <div key={label} className="flex items-center gap-1">{keys.map(k=><kbd key={k} className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-[10px] font-mono text-gray-500 shadow-sm leading-none">{k}</kbd>)}<span className="text-[11px] text-gray-400 ml-0.5">{label}</span></div>
          ))}
          <div className="flex items-center gap-1 ml-2 border-l border-gray-200 pl-3"><IconGripVertical size={12} className="text-gray-400"/><span className="text-[11px] text-gray-400">Drag custom columns to assign them to a group</span></div>
        </div>
      )}

      {!readOnly&&addingCol&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e=>{if(e.target===e.currentTarget)setAddingCol(false)}}>
          <div className="bg-white rounded-2xl shadow-xl w-[420px] p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div><h3 className="text-base font-semibold text-gray-900">Add custom column</h3><p className="text-xs text-gray-400 mt-0.5">Create a new column to track additional information</p></div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Column Name <span className="text-red-500">*</span></label>
              <input 
                ref={newColInputRef} 
                type="text" 
                value={newColName} 
                onChange={e=>setNewColName(e.target.value)} 
                onKeyDown={e=>{if(e.key==="Enter")confirmAddCol();if(e.key==="Escape")setAddingCol(false)}} 
                placeholder="e.g., Preferred Contact Time" 
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-400 w-full"
              />
              <p className="text-xs text-gray-400 mt-1">Choose a clear, descriptive name so users understand what data to enter</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <input 
                type="text" 
                value={newColDescription} 
                onChange={e=>setNewColDescription(e.target.value)} 
                placeholder="Additional context about this column" 
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-400 w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
              <select 
                value={newColType} 
                onChange={e=>setNewColType(e.target.value as CustomColumn["field_type"])} 
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-400 w-full bg-white"
              >
                <option value="text">Text - Free form text input</option>
                <option value="number">Number - Numeric values only</option>
                <option value="dropdown">Dropdown - Single selection from options</option>
                <option value="multi-select">Multi-select - Multiple selections</option>
                <option value="date">Date - Calendar date picker</option>
                <option value="boolean">Yes/No - Boolean toggle</option>
                <option value="url">URL - Website or social link</option>
              </select>
            </div>
            
            {(newColType==="dropdown"||newColType==="multi-select")&&(
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                <input 
                  type="text" 
                  value={newColOpts} 
                  onChange={e=>setNewColOpts(e.target.value)} 
                  placeholder="Option A, Option B, Option C" 
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-400 w-full"
                />
                <p className="text-xs text-gray-400 mt-1">Enter comma-separated options</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Section</label>
              <select 
                value={newColGroup} 
                onChange={e=>setNewColGroup(e.target.value as "Influencer Details" | "Approval Details" | "Outreach Details")} 
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-400 w-full bg-white"
              >
                <option value="Influencer Details">Influencer Details - Basic profile information</option>
                <option value="Approval Details">Approval Details - Approval workflow fields</option>
                <option value="Outreach Details">Outreach Details - Communication and rates</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {newColGroup === "Outreach Details" && "Note: Fields in this section will be disabled for declined influencers"}
                {newColGroup === "Approval Details" && "For tracking approval status and related notes"}
                {newColGroup === "Influencer Details" && "For basic influencer profile information"}
              </p>
            </div>
            
            <div className="flex gap-2 pt-1">
              <button onClick={()=>setAddingCol(false)} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={confirmAddCol} disabled={!newColName.trim()} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-40 transition">Add Column</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}