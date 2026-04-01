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
  outreach_method: string
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
  assignedGroup?: "Influencer Details" | "Approval Details" | "Outreach Details"
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
  assignedGroup?: "Influencer Details" | "Approval Details" | "Outreach Details"
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
  { key: "outreach_method", label: "Outreach", group: "Outreach Details", minWidth: 110, type: "select", options: ["", "email", "dm", "phone", "whatsapp"] },
  { key: "agreed_rate", label: "Rate ($)", group: "Outreach Details", minWidth: 100, type: "number" },
  { key: "notes", label: "Notes", group: "Outreach Details", minWidth: 200, type: "text" },
]

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
    stage: "1", outreach_method: "", agreed_rate: "", notes: "", custom,
    gender: "", location: "", social_link: "", first_name: "", contact_info: "",
    approval_status: "Pending", transferred_date: "", approval_notes: "",
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

const handleApprovalChange = (row: InfluencerRow, newStatus: string): InfluencerRow => {
  const r = { ...row }
  if (newStatus === "Approved" && row.approval_status !== "Approved") {
    const t = new Date()
    r.transferred_date = [t.getFullYear(), String(t.getMonth() + 1).padStart(2, "0"), String(t.getDate()).padStart(2, "0")].join("-")
  } else if (newStatus !== "Approved") { r.transferred_date = "" }
  r.approval_status = newStatus as "Approved" | "Declined" | "Pending"
  return r
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
   DETAIL SECTION
   ═══════════════════════════════════════════════════════════════════════════════ */
interface DetailSectionProps {
  row: InfluencerRow | null; customCols: CustomColumn[]; onUpdate: (r: InfluencerRow) => void; onClose: () => void; readOnly?: boolean; showEmptyState?: boolean; emptyStateMessage?: string
}

function DetailSection({ row, customCols, onUpdate, onClose, readOnly=false, showEmptyState=true, emptyStateMessage="Select a row to view details" }: DetailSectionProps) {
  const [editMode, setEditMode] = useState(false)
  const [editedRow, setEditedRow] = useState<InfluencerRow|null>(row?{...row}:null)
  useEffect(() => { if(row){setEditedRow({...row});setEditMode(false)} }, [row])

  if (!row || !editedRow) {
    if (!showEmptyState) return null
    return <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center"><div className="flex flex-col items-center gap-3"><IconUserCircle size={48} className="text-gray-300"/><p className="text-gray-400">{emptyStateMessage}</p><p className="text-xs text-gray-300 mt-1">Click on any row to see influencer details</p></div></div>
  }

  const handleFieldChange = (field: string, value: string) => {
    if (!editedRow) return
    if (field.startsWith("custom.")) {
      setEditedRow({...editedRow,custom:{...editedRow.custom,[field.slice(7)]:value}})
    } else if (field === "approval_status") {
      setEditedRow(handleApprovalChange(editedRow, value))
    } else if (field === "handle" || field === "platform") {
      // Auto-update social_link when handle/platform changes in detail panel
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

  const handleSave = () => { onUpdate(editedRow); setEditMode(false) }
  const handleCancel = () => { if(row) setEditedRow({...row}); setEditMode(false) }

  return (
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
            <div><label className="text-xs text-gray-400 block mb-1">Social Link</label>{editMode?<input type="url" value={editedRow.social_link||""} onChange={e=>handleFieldChange("social_link",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" placeholder="https://..."/>:(editedRow.social_link?<a href={normalizeUrl(editedRow.social_link)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline"><IconLink size={14}/>{editedRow.social_link}</a>:<span className="text-sm text-gray-400">—</span>)}</div>
            <div><label className="text-xs text-gray-400 block mb-1">First Name</label>{editMode?<input type="text" value={editedRow.first_name||""} onChange={e=>handleFieldChange("first_name",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/>:<div className="flex items-center gap-2"><IconUser size={14} className="text-gray-400"/><span className="text-sm text-gray-800">{editedRow.first_name||"—"}</span></div>}</div>
            <div><label className="text-xs text-gray-400 block mb-1">Contact Info</label>{editMode?<input type="text" value={editedRow.contact_info||""} onChange={e=>handleFieldChange("contact_info",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/>:<div className="flex items-center gap-2"><IconAddressBook size={14} className="text-gray-400"/><span className="text-sm text-gray-800">{editedRow.contact_info||"—"}</span></div>}</div>
          </div>
          <div className="space-y-3">
            {/* Approval Details */}
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100"><IconChecklist size={14} className="text-purple-500"/><h4 className="font-medium text-sm text-gray-700">Approval Details</h4></div>
            <div><label className="text-xs text-gray-400 block mb-1">Approve/Decline</label>{editMode?<select value={editedRow.approval_status||"Pending"} onChange={e=>handleFieldChange("approval_status",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Declined">Declined</option></select>:<ApprovalBadge value={editedRow.approval_status||"Pending"}/>}</div>
            <div><label className="text-xs text-gray-400 block mb-1">Transferred Date</label>{editMode?<input type="date" value={editedRow.transferred_date||""} onChange={e=>handleFieldChange("transferred_date",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/>:<div className="flex items-center gap-2"><IconClock size={14} className="text-gray-400"/><span className="text-sm text-gray-800">{editedRow.transferred_date?new Date(editedRow.transferred_date).toLocaleDateString():"—"}</span></div>}</div>
            <div><label className="text-xs text-gray-400 block mb-1">Notes</label>{editMode?<textarea value={editedRow.approval_notes||""} onChange={e=>handleFieldChange("approval_notes",e.target.value)} rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none resize-none" placeholder="Add approval notes..."/>:<p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg min-h-[60px]">{editedRow.approval_notes||"No notes added"}</p>}</div>
            {/* Outreach Details */}
            <div className="flex items-center gap-2 pt-2 pb-1 border-b border-gray-100"><IconChartBar size={14} className="text-emerald-500"/><h4 className="font-medium text-sm text-gray-700">Outreach Details</h4></div>
            <div><label className="text-xs text-gray-400 block mb-1">Status</label>{editMode?<select value={editedRow.contact_status} onChange={e=>handleFieldChange("contact_status",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"><option value="not_contacted">Not Contacted</option><option value="contacted">Contacted</option><option value="interested">Interested</option><option value="agreed">Agreed</option></select>:<StatusBadge value={editedRow.contact_status}/>}</div>
            <div><label className="text-xs text-gray-400 block mb-1">Stage</label>{editMode?<input type="number" min="1" max="5" value={editedRow.stage} onChange={e=>handleFieldChange("stage",e.target.value)} className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/>:<div className="flex items-center gap-2"><div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width:`${(parseInt(editedRow.stage)||1)*20}%`}}/></div><span className="text-sm text-gray-600">Stage {editedRow.stage}/5</span></div>}</div>
            <div><label className="text-xs text-gray-400 block mb-1">Outreach Method</label>{editMode?<select value={editedRow.outreach_method} onChange={e=>handleFieldChange("outreach_method",e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"><option value="">Select method</option><option value="email">Email</option><option value="dm">Direct Message</option><option value="phone">Phone</option><option value="whatsapp">WhatsApp</option></select>:<div className="flex items-center gap-2"><IconPhone size={14} className="text-gray-400"/><span className="text-sm text-gray-800 capitalize">{editedRow.outreach_method||"—"}</span></div>}</div>
            <div><label className="text-xs text-gray-400 block mb-1">Agreed Rate</label>{editMode?<input type="number" value={editedRow.agreed_rate} onChange={e=>handleFieldChange("agreed_rate",e.target.value)} className="w-32 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/>:<div className="flex items-center gap-2"><IconCurrencyDollar size={14} className="text-gray-400"/><span className="text-sm text-gray-800">{editedRow.agreed_rate?`$${Number(editedRow.agreed_rate).toLocaleString()}`:"—"}</span></div>}</div>
            <div><label className="text-xs text-gray-400 block mb-1">Notes</label>{editMode?<textarea value={editedRow.notes} onChange={e=>handleFieldChange("notes",e.target.value)} rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none resize-none" placeholder="Add notes..."/>:<p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg min-h-[60px]">{editedRow.notes||"No notes added"}</p>}</div>
            {/* Custom Fields */}
            {customCols.length > 0 && (<>
              <div className="flex items-center gap-2 pt-2 pb-1 border-b border-gray-100"><IconFileText size={14} className="text-gray-500"/><h4 className="font-medium text-sm text-gray-700">Custom Fields</h4></div>
              {customCols.map((col) => {
                const val = editedRow.custom[col.field_key]||""
                return <div key={col.id}><label className="text-xs text-gray-400 block mb-1">{col.field_name}</label>
                  {editMode ? (
                    col.field_type==="boolean"?<select value={val} onChange={e=>handleFieldChange(`custom.${col.field_key}`,e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"><option value="No">No</option><option value="Yes">Yes</option></select>
                    :col.field_type==="dropdown"?<select value={val} onChange={e=>handleFieldChange(`custom.${col.field_key}`,e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"><option value="">— Select —</option>{col.field_options?.map(o=><option key={o} value={o}>{o}</option>)}</select>
                    :col.field_type==="multi-select"?<input type="text" value={val} placeholder="Comma-separated values" onChange={e=>handleFieldChange(`custom.${col.field_key}`,e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/>
                    :col.field_type==="date"?<input type="date" value={val} onChange={e=>handleFieldChange(`custom.${col.field_key}`,e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/>
                    :<input type={col.field_type==="number"?"number":"text"} value={val} onChange={e=>handleFieldChange(`custom.${col.field_key}`,e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/>
                  ) : (
                    <div className="flex items-center gap-2">
                      {col.field_type==="boolean"?<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${val==="Yes"?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>{val||"No"}</span>
                      :col.field_type==="multi-select"?<MultiSelectDisplay value={val}/>
                      :col.field_type==="url"&&val?<a href={normalizeUrl(val)} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">{val}</a>
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
  { id:"mock-1", handle:"@prettyliv", platform:"instagram", full_name:"Liv Santos", email:"liv@example.com", follower_count:"245000", engagement_rate:"3.2", niche:"Beauty", contact_status:"contacted", stage:"2", outreach_method:"dm", agreed_rate:"500", notes:"Very responsive. Sent product for review.", custom:{}, gender:"Female", location:"Los Angeles, CA", social_link:"https://instagram.com/prettyliv", first_name:"Olivia", contact_info:"liv@example.com | +1 555-123-4567", approval_status:"Pending", transferred_date:"", approval_notes:"Awaiting contract signing" },
  { id:"mock-2", handle:"@fitwithjay", platform:"tiktok", full_name:"Jay Kim", email:"jay@example.com", follower_count:"890000", engagement_rate:"5.8", niche:"Fitness", contact_status:"interested", stage:"3", outreach_method:"email", agreed_rate:"1200", notes:"Discussing deliverables for Q1 campaign", custom:{}, gender:"Male", location:"New York, NY", social_link:"https://tiktok.com/@fitwithjay", first_name:"Jay", contact_info:"jay@example.com | +1 555-987-6543", approval_status:"Approved", transferred_date:"2024-03-15", approval_notes:"Approved for Q1 campaign - contract signed" },
  { id:"mock-3", handle:"@travelwithmar", platform:"youtube", full_name:"Marco Reyes", email:"marco@example.com", follower_count:"1200000", engagement_rate:"2.1", niche:"Travel", contact_status:"agreed", stage:"4", outreach_method:"email", agreed_rate:"2500", notes:"Contract signed for summer campaign", custom:{}, gender:"Male", location:"Miami, FL", social_link:"https://youtube.com/@travelwithmar", first_name:"Marco", contact_info:"marco@example.com | +1 555-456-7890", approval_status:"Declined", transferred_date:"", approval_notes:"Budget constraints for Q1 - reconsider for Q2" },
  { id:"mock-4", handle:"@techsavvy", platform:"twitter", full_name:"Alex Chen", email:"alex@example.com", follower_count:"45000", engagement_rate:"4.5", niche:"Technology", contact_status:"not_contacted", stage:"1", outreach_method:"", agreed_rate:"", notes:"Potential for product review", custom:{}, gender:"Non-binary", location:"San Francisco, CA", social_link:"https://twitter.com/techsavvy", first_name:"Alex", contact_info:"alex@example.com", approval_status:"Pending", transferred_date:"", approval_notes:"" },
  {
    id: "mock-5",
    handle: "@chefmaria",
    platform: "instagram",
    full_name: "Maria Garcia",
    email: "maria@chefmaria.com",
    follower_count: "125000",
    engagement_rate: "4.2",
    niche: "Food",
    contact_status: "contacted",
    stage: "2",
    outreach_method: "email",
    agreed_rate: "800",
    notes: "Interested in recipe collaboration",
    custom: {},
    gender: "Female",
    location: "Mexico City, MX",
    social_link: "https://instagram.com/chefmaria",
    first_name: "Maria",
    contact_info: "maria@chefmaria.com | +52 55 1234 5678",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "Waiting for contract",
  },
  {
    id: "mock-6",
    handle: "@gamermike",
    platform: "youtube",
    full_name: "Mike Johnson",
    email: "mike@gamermike.com",
    follower_count: "520000",
    engagement_rate: "6.7",
    niche: "Gaming",
    contact_status: "interested",
    stage: "3",
    outreach_method: "dm",
    agreed_rate: "1500",
    notes: "Great fit for gaming peripherals",
    custom: {},
    gender: "Male",
    location: "Austin, TX",
    social_link: "https://youtube.com/@gamermike",
    first_name: "Michael",
    contact_info: "mike@gamermike.com | +1 512-555-1234",
    approval_status: "Approved",
    transferred_date: "2024-03-20",
    approval_notes: "Approved for Q2 campaign",
  },
  {
    id: "mock-7",
    handle: "@fashionnova",
    platform: "instagram",
    full_name: "Nova Williams",
    email: "nova@fashionnova.com",
    follower_count: "890000",
    engagement_rate: "3.9",
    niche: "Fashion",
    contact_status: "agreed",
    stage: "4",
    outreach_method: "email",
    agreed_rate: "2200",
    notes: "Signed for spring collection",
    custom: {},
    gender: "Female",
    location: "New York, NY",
    social_link: "https://instagram.com/fashionnova",
    first_name: "Nova",
    contact_info: "nova@fashionnova.com | +1 212-555-9876",
    approval_status: "Approved",
    transferred_date: "2024-03-10",
    approval_notes: "Spring campaign confirmed",
  },
  {
    id: "mock-8",
    handle: "@dadlife",
    platform: "tiktok",
    full_name: "David Chen",
    email: "david@dadlife.com",
    follower_count: "345000",
    engagement_rate: "8.2",
    niche: "Parenting",
    contact_status: "contacted",
    stage: "2",
    outreach_method: "dm",
    agreed_rate: "600",
    notes: "Family-friendly content creator",
    custom: {},
    gender: "Male",
    location: "Seattle, WA",
    social_link: "https://tiktok.com/@dadlife",
    first_name: "David",
    contact_info: "david@dadlife.com | +1 206-555-4567",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "Negotiating rates",
  },
  {
    id: "mock-9",
    handle: "@greenliving",
    platform: "youtube",
    full_name: "Emma Green",
    email: "emma@greenliving.com",
    follower_count: "210000",
    engagement_rate: "5.4",
    niche: "Sustainability",
    contact_status: "interested",
    stage: "3",
    outreach_method: "email",
    agreed_rate: "950",
    notes: "Passionate about eco-friendly products",
    custom: {},
    gender: "Female",
    location: "Portland, OR",
    social_link: "https://youtube.com/@greenliving",
    first_name: "Emma",
    contact_info: "emma@greenliving.com | +1 503-555-7890",
    approval_status: "Approved",
    transferred_date: "2024-03-18",
    approval_notes: "Earth Day campaign",
  },
  {
    id: "mock-10",
    handle: "@petlover",
    platform: "instagram",
    full_name: "Sarah Martinez",
    email: "sarah@petlover.com",
    follower_count: "567000",
    engagement_rate: "7.1",
    niche: "Pets",
    contact_status: "agreed",
    stage: "4",
    outreach_method: "email",
    agreed_rate: "1100",
    notes: "Multiple pets, great engagement",
    custom: {},
    gender: "Female",
    location: "Denver, CO",
    social_link: "https://instagram.com/petlover",
    first_name: "Sarah",
    contact_info: "sarah@petlover.com | +1 303-555-2345",
    approval_status: "Approved",
    transferred_date: "2024-03-05",
    approval_notes: "Pet food campaign",
  },
  {
    id: "mock-11",
    handle: "@fitnessguru",
    platform: "youtube",
    full_name: "Chris Evans",
    email: "chris@fitnessguru.com",
    follower_count: "1250000",
    engagement_rate: "4.8",
    niche: "Fitness",
    contact_status: "contacted",
    stage: "1",
    outreach_method: "email",
    agreed_rate: "3000",
    notes: "Top fitness influencer",
    custom: {},
    gender: "Male",
    location: "Los Angeles, CA",
    social_link: "https://youtube.com/@fitnessguru",
    first_name: "Christopher",
    contact_info: "chris@fitnessguru.com | +1 310-555-8765",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "High budget campaign",
  },
  {
    id: "mock-12",
    handle: "@bookworm",
    platform: "tiktok",
    full_name: "Rachel Kim",
    email: "rachel@bookworm.com",
    follower_count: "89000",
    engagement_rate: "9.3",
    niche: "Books",
    contact_status: "interested",
    stage: "2",
    outreach_method: "dm",
    agreed_rate: "300",
    notes: "Book reviewer, high engagement",
    custom: {},
    gender: "Female",
    location: "Chicago, IL",
    social_link: "https://tiktok.com/@bookworm",
    first_name: "Rachel",
    contact_info: "rachel@bookworm.com | +1 312-555-3456",
    approval_status: "Approved",
    transferred_date: "2024-03-22",
    approval_notes: "Book launch campaign",
  },
  {
    id: "mock-13",
    handle: "@travelbug",
    platform: "instagram",
    full_name: "James Wilson",
    email: "james@travelbug.com",
    follower_count: "432000",
    engagement_rate: "3.5",
    niche: "Travel",
    contact_status: "contacted",
    stage: "2",
    outreach_method: "email",
    agreed_rate: "1800",
    notes: "Luxury travel content",
    custom: {},
    gender: "Male",
    location: "London, UK",
    social_link: "https://instagram.com/travelbug",
    first_name: "James",
    contact_info: "james@travelbug.com | +44 20 1234 5678",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "Discussing collaboration",
  },
  {
    id: "mock-14",
    handle: "@makeupqueen",
    platform: "youtube",
    full_name: "Isabella Rose",
    email: "isa@makeupqueen.com",
    follower_count: "678000",
    engagement_rate: "6.2",
    niche: "Beauty",
    contact_status: "agreed",
    stage: "4",
    outreach_method: "email",
    agreed_rate: "2000",
    notes: "Makeup tutorials and reviews",
    custom: {},
    gender: "Female",
    location: "Miami, FL",
    social_link: "https://youtube.com/@makeupqueen",
    first_name: "Isabella",
    contact_info: "isa@makeupqueen.com | +1 305-555-9876",
    approval_status: "Approved",
    transferred_date: "2024-03-12",
    approval_notes: "Cosmetics line campaign",
  },
  {
    id: "mock-15",
    handle: "@techreviews",
    platform: "twitter",
    full_name: "Alex Turner",
    email: "alex@techreviews.com",
    follower_count: "234000",
    engagement_rate: "4.1",
    niche: "Technology",
    contact_status: "interested",
    stage: "3",
    outreach_method: "email",
    agreed_rate: "750",
    notes: "Gadget reviewer",
    custom: {},
    gender: "Male",
    location: "San Jose, CA",
    social_link: "https://twitter.com/techreviews",
    first_name: "Alexander",
    contact_info: "alex@techreviews.com | +1 408-555-6543",
    approval_status: "Approved",
    transferred_date: "2024-03-19",
    approval_notes: "New product launch",
  },
  {
    id: "mock-16",
    handle: "@mindfulness",
    platform: "instagram",
    full_name: "Priya Patel",
    email: "priya@mindfulness.com",
    follower_count: "156000",
    engagement_rate: "5.9",
    niche: "Wellness",
    contact_status: "contacted",
    stage: "1",
    outreach_method: "dm",
    agreed_rate: "500",
    notes: "Meditation and wellness content",
    custom: {},
    gender: "Female",
    location: "Toronto, ON",
    social_link: "https://instagram.com/mindfulness",
    first_name: "Priya",
    contact_info: "priya@mindfulness.com | +1 416-555-7890",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "Wellness campaign",
  },
  {
    id: "mock-17",
    handle: "@homechef",
    platform: "tiktok",
    full_name: "Lucas Rodriguez",
    email: "lucas@homechef.com",
    follower_count: "345000",
    engagement_rate: "7.8",
    niche: "Cooking",
    contact_status: "agreed",
    stage: "4",
    outreach_method: "email",
    agreed_rate: "900",
    notes: "Quick recipe videos",
    custom: {},
    gender: "Male",
    location: "Barcelona, Spain",
    social_link: "https://tiktok.com/@homechef",
    first_name: "Lucas",
    contact_info: "lucas@homechef.com | +34 93 1234 5678",
    approval_status: "Approved",
    transferred_date: "2024-03-08",
    approval_notes: "Kitchen appliance campaign",
  },
  {
    id: "mock-18",
    handle: "@momlife",
    platform: "instagram",
    full_name: "Jessica Taylor",
    email: "jessica@momlife.com",
    follower_count: "287000",
    engagement_rate: "6.5",
    niche: "Parenting",
    contact_status: "interested",
    stage: "2",
    outreach_method: "dm",
    agreed_rate: "650",
    notes: "Mom blogger with loyal following",
    custom: {},
    gender: "Female",
    location: "Dallas, TX",
    social_link: "https://instagram.com/momlife",
    first_name: "Jessica",
    contact_info: "jessica@momlife.com | +1 214-555-2345",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "Baby products campaign",
  },
  {
    id: "mock-19",
    handle: "@artbymia",
    platform: "youtube",
    full_name: "Mia Wong",
    email: "mia@artbymia.com",
    follower_count: "98000",
    engagement_rate: "8.9",
    niche: "Art",
    contact_status: "contacted",
    stage: "1",
    outreach_method: "email",
    agreed_rate: "400",
    notes: "Digital art tutorials",
    custom: {},
    gender: "Female",
    location: "Vancouver, BC",
    social_link: "https://youtube.com/@artbymia",
    first_name: "Mia",
    contact_info: "mia@artbymia.com | +1 604-555-4567",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "Art supply partnership",
  },
  {
    id: "mock-20",
    handle: "@outdooradventures",
    platform: "instagram",
    full_name: "Ryan Murphy",
    email: "ryan@outdooradventures.com",
    follower_count: "423000",
    engagement_rate: "4.7",
    niche: "Outdoor",
    contact_status: "agreed",
    stage: "4",
    outreach_method: "email",
    agreed_rate: "1400",
    notes: "Hiking and camping content",
    custom: {},
    gender: "Male",
    location: "Boulder, CO",
    social_link: "https://instagram.com/outdooradventures",
    first_name: "Ryan",
    contact_info: "ryan@outdooradventures.com | +1 720-555-6789",
    approval_status: "Approved",
    transferred_date: "2024-03-14",
    approval_notes: "Outdoor gear campaign",
  },
  {
    id: "mock-21",
    handle: "@streetstyle",
    platform: "tiktok",
    full_name: "Jordan Lee",
    email: "jordan@streetstyle.com",
    follower_count: "512000",
    engagement_rate: "5.2",
    niche: "Fashion",
    contact_status: "interested",
    stage: "3",
    outreach_method: "dm",
    agreed_rate: "1100",
    notes: "Streetwear influencer",
    custom: {},
    gender: "Non-binary",
    location: "Brooklyn, NY",
    social_link: "https://tiktok.com/@streetstyle",
    first_name: "Jordan",
    contact_info: "jordan@streetstyle.com | +1 718-555-3456",
    approval_status: "Approved",
    transferred_date: "2024-03-21",
    approval_notes: "Streetwear collection",
  },
  {
    id: "mock-22",
    handle: "@plantmom",
    platform: "instagram",
    full_name: "Emma Watson",
    email: "emma@plantmom.com",
    follower_count: "187000",
    engagement_rate: "7.3",
    niche: "Gardening",
    contact_status: "contacted",
    stage: "2",
    outreach_method: "email",
    agreed_rate: "550",
    notes: "Plant care and home decor",
    custom: {},
    gender: "Female",
    location: "Austin, TX",
    social_link: "https://instagram.com/plantmom",
    first_name: "Emma",
    contact_info: "emma@plantmom.com | +1 512-555-9876",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "Home decor campaign",
  },
  {
    id: "mock-23",
    handle: "@fitnessfoodie",
    platform: "youtube",
    full_name: "Natalie Brooks",
    email: "natalie@fitnessfoodie.com",
    follower_count: "298000",
    engagement_rate: "6.1",
    niche: "Health",
    contact_status: "agreed",
    stage: "4",
    outreach_method: "email",
    agreed_rate: "850",
    notes: "Healthy recipes and workouts",
    custom: {},
    gender: "Female",
    location: "San Diego, CA",
    social_link: "https://youtube.com/@fitnessfoodie",
    first_name: "Natalie",
    contact_info: "natalie@fitnessfoodie.com | +1 619-555-2345",
    approval_status: "Approved",
    transferred_date: "2024-03-11",
    approval_notes: "Health food campaign",
  },
  {
    id: "mock-24",
    handle: "@musicproducer",
    platform: "twitter",
    full_name: "DJ K-Swift",
    email: "dj@musicproducer.com",
    follower_count: "345000",
    engagement_rate: "3.8",
    niche: "Music",
    contact_status: "interested",
    stage: "3",
    outreach_method: "dm",
    agreed_rate: "950",
    notes: "Electronic music producer",
    custom: {},
    gender: "Male",
    location: "Atlanta, GA",
    social_link: "https://twitter.com/musicproducer",
    first_name: "Kevin",
    contact_info: "dj@musicproducer.com | +1 404-555-7890",
    approval_status: "Approved",
    transferred_date: "2024-03-17",
    approval_notes: "Music equipment campaign",
  },
  {
    id: "mock-25",
    handle: "@diycrafts",
    platform: "instagram",
    full_name: "Laura Martinez",
    email: "laura@diycrafts.com",
    follower_count: "234000",
    engagement_rate: "8.1",
    niche: "DIY",
    contact_status: "contacted",
    stage: "2",
    outreach_method: "email",
    agreed_rate: "600",
    notes: "Craft tutorials and projects",
    custom: {},
    gender: "Female",
    location: "Phoenix, AZ",
    social_link: "https://instagram.com/diycrafts",
    first_name: "Laura",
    contact_info: "laura@diycrafts.com | +1 602-555-4567",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "Craft supplies campaign",
  },
  {
    id: "mock-26",
    handle: "@fitnessmotivation",
    platform: "tiktok",
    full_name: "Marcus Johnson",
    email: "marcus@fitnessmotivation.com",
    follower_count: "678000",
    engagement_rate: "4.9",
    niche: "Fitness",
    contact_status: "agreed",
    stage: "4",
    outreach_method: "dm",
    agreed_rate: "1300",
    notes: "Workout motivation and tips",
    custom: {},
    gender: "Male",
    location: "Chicago, IL",
    social_link: "https://tiktok.com/@fitnessmotivation",
    first_name: "Marcus",
    contact_info: "marcus@fitnessmotivation.com | +1 312-555-1234",
    approval_status: "Approved",
    transferred_date: "2024-03-09",
    approval_notes: "Fitness apparel campaign",
  },
  {
    id: "mock-27",
    handle: "@luxurytraveler",
    platform: "instagram",
    full_name: "Sophia Anderson",
    email: "sophia@luxurytraveler.com",
    follower_count: "456000",
    engagement_rate: "3.2",
    niche: "Travel",
    contact_status: "interested",
    stage: "3",
    outreach_method: "email",
    agreed_rate: "2100",
    notes: "Luxury hotels and resorts",
    custom: {},
    gender: "Female",
    location: "Dubai, UAE",
    social_link: "https://instagram.com/luxurytraveler",
    first_name: "Sophia",
    contact_info: "sophia@luxurytraveler.com | +971 50 123 4567",
    approval_status: "Approved",
    transferred_date: "2024-03-16",
    approval_notes: "Luxury travel campaign",
  },
  {
    id: "mock-28",
    handle: "@codinglife",
    platform: "youtube",
    full_name: "CodeMaster",
    email: "code@codinglife.com",
    follower_count: "167000",
    engagement_rate: "4.5",
    niche: "Education",
    contact_status: "contacted",
    stage: "1",
    outreach_method: "email",
    agreed_rate: "700",
    notes: "Programming tutorials",
    custom: {},
    gender: "Male",
    location: "Berlin, Germany",
    social_link: "https://youtube.com/@codinglife",
    first_name: "Thomas",
    contact_info: "code@codinglife.com | +49 30 12345678",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "Tech education campaign",
  },
  {
    id: "mock-29",
    handle: "@beautysecrets",
    platform: "instagram",
    full_name: "Linda Zhang",
    email: "linda@beautysecrets.com",
    follower_count: "789000",
    engagement_rate: "5.6",
    niche: "Beauty",
    contact_status: "agreed",
    stage: "4",
    outreach_method: "email",
    agreed_rate: "1800",
    notes: "Skincare routine videos",
    custom: {},
    gender: "Female",
    location: "Seoul, South Korea",
    social_link: "https://instagram.com/beautysecrets",
    first_name: "Linda",
    contact_info: "linda@beautysecrets.com | +82 10 1234 5678",
    approval_status: "Approved",
    transferred_date: "2024-03-07",
    approval_notes: "Skincare campaign",
  },
  {
    id: "mock-30",
    handle: "@sportsfan",
    platform: "twitter",
    full_name: "Anthony Davis",
    email: "anthony@sportsfan.com",
    follower_count: "234000",
    engagement_rate: "3.4",
    niche: "Sports",
    contact_status: "interested",
    stage: "2",
    outreach_method: "dm",
    agreed_rate: "500",
    notes: "Sports commentary and analysis",
    custom: {},
    gender: "Male",
    location: "Boston, MA",
    social_link: "https://twitter.com/sportsfan",
    first_name: "Anthony",
    contact_info: "anthony@sportsfan.com | +1 617-555-9876",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "Sports merchandise campaign",
  },
  {
    id: "mock-31",
    handle: "@veganeats",
    platform: "tiktok",
    full_name: "Grace Park",
    email: "grace@veganeats.com",
    follower_count: "345000",
    engagement_rate: "7.2",
    niche: "Food",
    contact_status: "contacted",
    stage: "2",
    outreach_method: "email",
    agreed_rate: "750",
    notes: "Vegan recipes and lifestyle",
    custom: {},
    gender: "Female",
    location: "Los Angeles, CA",
    social_link: "https://tiktok.com/@veganeats",
    first_name: "Grace",
    contact_info: "grace@veganeats.com | +1 323-555-4567",
    approval_status: "Approved",
    transferred_date: "2024-03-23",
    approval_notes: "Plant-based campaign",
  },
  {
    id: "mock-32",
    handle: "@yogawithme",
    platform: "youtube",
    full_name: "Anita Sharma",
    email: "anita@yogawithme.com",
    follower_count: "456000",
    engagement_rate: "5.3",
    niche: "Wellness",
    contact_status: "agreed",
    stage: "4",
    outreach_method: "email",
    agreed_rate: "1100",
    notes: "Yoga instructor and wellness coach",
    custom: {},
    gender: "Female",
    location: "Mumbai, India",
    social_link: "https://youtube.com/@yogawithme",
    first_name: "Anita",
    contact_info: "anita@yogawithme.com | +91 22 1234 5678",
    approval_status: "Approved",
    transferred_date: "2024-03-13",
    approval_notes: "Wellness retreat campaign",
  },
  {
    id: "mock-33",
    handle: "@cryptoknight",
    platform: "twitter",
    full_name: "Crypto King",
    email: "crypto@cryptoknight.com",
    follower_count: "567000",
    engagement_rate: "4.2",
    niche: "Finance",
    contact_status: "interested",
    stage: "3",
    outreach_method: "dm",
    agreed_rate: "950",
    notes: "Cryptocurrency insights",
    custom: {},
    gender: "Male",
    location: "Singapore",
    social_link: "https://twitter.com/cryptoknight",
    first_name: "David",
    contact_info: "crypto@cryptoknight.com | +65 9123 4567",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "Crypto platform campaign",
  },
  {
    id: "mock-34",
    handle: "@homeimprovement",
    platform: "instagram",
    full_name: "Mike Thompson",
    email: "mike@homeimprovement.com",
    follower_count: "178000",
    engagement_rate: "5.8",
    niche: "Home",
    contact_status: "contacted",
    stage: "1",
    outreach_method: "email",
    agreed_rate: "600",
    notes: "DIY home renovation",
    custom: {},
    gender: "Male",
    location: "Nashville, TN",
    social_link: "https://instagram.com/homeimprovement",
    first_name: "Michael",
    contact_info: "mike@homeimprovement.com | +1 615-555-2345",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "Home improvement tools",
  },
  {
    id: "mock-35",
    handle: "@fashionstylist",
    platform: "tiktok",
    full_name: "Elena Rodriguez",
    email: "elena@fashionstylist.com",
    follower_count: "389000",
    engagement_rate: "6.9",
    niche: "Fashion",
    contact_status: "agreed",
    stage: "4",
    outreach_method: "dm",
    agreed_rate: "1200",
    notes: "Fashion styling tips",
    custom: {},
    gender: "Female",
    location: "Milan, Italy",
    social_link: "https://tiktok.com/@fashionstylist",
    first_name: "Elena",
    contact_info: "elena@fashionstylist.com | +39 02 1234 5678",
    approval_status: "Approved",
    transferred_date: "2024-03-06",
    approval_notes: "Fashion week campaign",
  },
  {
    id: "mock-36",
    handle: "@foodcritic",
    platform: "youtube",
    full_name: "James Thompson",
    email: "james@foodcritic.com",
    follower_count: "267000",
    engagement_rate: "4.6",
    niche: "Food",
    contact_status: "interested",
    stage: "3",
    outreach_method: "email",
    agreed_rate: "800",
    notes: "Restaurant reviews",
    custom: {},
    gender: "Male",
    location: "Paris, France",
    social_link: "https://youtube.com/@foodcritic",
    first_name: "James",
    contact_info: "james@foodcritic.com | +33 1 2345 6789",
    approval_status: "Approved",
    transferred_date: "2024-03-24",
    approval_notes: "Food delivery campaign",
  },
  {
    id: "mock-37",
    handle: "@photographypro",
    platform: "instagram",
    full_name: "Nina Chen",
    email: "nina@photographypro.com",
    follower_count: "456000",
    engagement_rate: "5.1",
    niche: "Photography",
    contact_status: "contacted",
    stage: "2",
    outreach_method: "email",
    agreed_rate: "950",
    notes: "Landscape photography",
    custom: {},
    gender: "Female",
    location: "Sydney, Australia",
    social_link: "https://instagram.com/photographypro",
    first_name: "Nina",
    contact_info: "nina@photographypro.com | +61 2 1234 5678",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "Camera equipment campaign",
  },
  {
    id: "mock-38",
    handle: "@mentalhealthmatters",
    platform: "tiktok",
    full_name: "Dr. Sarah Lee",
    email: "sarah@mentalhealthmatters.com",
    follower_count: "567000",
    engagement_rate: "8.4",
    niche: "Health",
    contact_status: "agreed",
    stage: "4",
    outreach_method: "dm",
    agreed_rate: "850",
    notes: "Mental health awareness",
    custom: {},
    gender: "Female",
    location: "Melbourne, Australia",
    social_link: "https://tiktok.com/@mentalhealthmatters",
    first_name: "Sarah",
    contact_info: "sarah@mentalhealthmatters.com | +61 3 1234 5678",
    approval_status: "Approved",
    transferred_date: "2024-03-19",
    approval_notes: "Wellness app campaign",
  },
  {
    id: "mock-39",
    handle: "@comedyclub",
    platform: "youtube",
    full_name: "Kevin Hartman",
    email: "kevin@comedyclub.com",
    follower_count: "890000",
    engagement_rate: "7.8",
    niche: "Comedy",
    contact_status: "interested",
    stage: "3",
    outreach_method: "email",
    agreed_rate: "2000",
    notes: "Stand-up comedy clips",
    custom: {},
    gender: "Male",
    location: "Las Vegas, NV",
    social_link: "https://youtube.com/@comedyclub",
    first_name: "Kevin",
    contact_info: "kevin@comedyclub.com | +1 702-555-1234",
    approval_status: "Approved",
    transferred_date: "2024-03-20",
    approval_notes: "Entertainment campaign",
  },
  {
    id: "mock-40",
    handle: "@weddingplanner",
    platform: "instagram",
    full_name: "Bridget Jones",
    email: "bridget@weddingplanner.com",
    follower_count: "234000",
    engagement_rate: "6.3",
    niche: "Events",
    contact_status: "contacted",
    stage: "1",
    outreach_method: "dm",
    agreed_rate: "700",
    notes: "Wedding planning tips",
    custom: {},
    gender: "Female",
    location: "Charleston, SC",
    social_link: "https://instagram.com/weddingplanner",
    first_name: "Bridget",
    contact_info: "bridget@weddingplanner.com | +1 843-555-4567",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "Wedding services campaign",
  },
  {
    id: "mock-41",
    handle: "@esportspro",
    platform: "twitch",
    full_name: "GamerX",
    email: "pro@esportspro.com",
    follower_count: "678000",
    engagement_rate: "5.9",
    niche: "Gaming",
    contact_status: "agreed",
    stage: "4",
    outreach_method: "email",
    agreed_rate: "2500",
    notes: "Professional esports player",
    custom: {},
    gender: "Male",
    location: "Seoul, South Korea",
    social_link: "https://twitch.tv/esportspro",
    first_name: "Minho",
    contact_info: "pro@esportspro.com | +82 10 9876 5432",
    approval_status: "Approved",
    transferred_date: "2024-03-04",
    approval_notes: "Gaming peripherals campaign",
  },
  {
    id: "mock-42",
    handle: "@sustainablefashion",
    platform: "instagram",
    full_name: "Emma Greenfield",
    email: "emma@sustainablefashion.com",
    follower_count: "156000",
    engagement_rate: "7.1",
    niche: "Fashion",
    contact_status: "interested",
    stage: "2",
    outreach_method: "email",
    agreed_rate: "650",
    notes: "Eco-friendly clothing",
    custom: {},
    gender: "Female",
    location: "Copenhagen, Denmark",
    social_link: "https://instagram.com/sustainablefashion",
    first_name: "Emma",
    contact_info: "emma@sustainablefashion.com | +45 12 34 56 78",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "Sustainable brand campaign",
  },
  {
    id: "mock-43",
    handle: "@fitnessdad",
    platform: "tiktok",
    full_name: "Tom Wilson",
    email: "tom@fitnessdad.com",
    follower_count: "289000",
    engagement_rate: "6.7",
    niche: "Fitness",
    contact_status: "contacted",
    stage: "1",
    outreach_method: "dm",
    agreed_rate: "550",
    notes: "Dad fitness journey",
    custom: {},
    gender: "Male",
    location: "Manchester, UK",
    social_link: "https://tiktok.com/@fitnessdad",
    first_name: "Thomas",
    contact_info: "tom@fitnessdad.com | +44 161 123 4567",
    approval_status: "Pending",
    transferred_date: "",
    approval_notes: "Family fitness campaign",
  },
  {
    id: "mock-44",
    handle: "@digitalmarketer",
    platform: "youtube",
    full_name: "Marketing Guru",
    email: "guru@digitalmarketer.com",
    follower_count: "345000",
    engagement_rate: "4.3",
    niche: "Business",
    contact_status: "agreed",
    stage: "4",
    outreach_method: "email",
    agreed_rate: "1500",
    notes: "Marketing strategies",
    custom: {},
    gender: "Male",
    location: "New York, NY",
    social_link: "https://youtube.com/@digitalmarketer",
    first_name: "Brian",
    contact_info: "guru@digitalmarketer.com | +1 212-555-7890",
    approval_status: "Approved",
    transferred_date: "2024-03-18",
    approval_notes: "Marketing software campaign",
  },
  {
    id: "mock-45",
    handle: "@doglovers",
    platform: "instagram",
    full_name: "Rachel Adams",
    email: "rachel@doglovers.com",
    follower_count: "567000",
    engagement_rate: "8.2",
    niche: "Pets",
    contact_status: "interested",
    stage: "3",
    outreach_method: "email",
    agreed_rate: "900",
    notes: "Dog training and care",
    custom: {},
    gender: "Female",
    location: "Portland, OR",
    social_link: "https://instagram.com/doglovers",
    first_name: "Rachel",
    contact_info: "rachel@doglovers.com | +1 503-555-8901",
    approval_status: "Approved",
    transferred_date: "2024-03-21",
    approval_notes: "Pet products campaign",
  },
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
  const [newColType, setNewColType] = useState<CustomColumn["field_type"]>("text")
  const [newColOpts, setNewColOpts] = useState("")
  const [colOrder, setColOrder] = useState<number[]|null>(null)
  const [dragIdx, setDragIdx] = useState<number|null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number|null>(null)
  const [dragOverGroup, setDragOverGroup] = useState<string|null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterColumn, setFilterColumn] = useState("")
  const [filterValue, setFilterValue] = useState("")
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState<string|null>(null)
  const [showDetailPanel, setShowDetailPanel] = useState(showDetailPanelByDefault)

  const editInputRef = useRef<HTMLInputElement|HTMLSelectElement|null>(null)
  const newColInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tabPendingRef = useRef(false)

  const getEffectiveGroup = useCallback((cc: CustomColumn): "Influencer Details"|"Approval Details"|"Outreach Details"|"Custom Fields" => {
    if (cc.assignedGroup==="Influencer Details") return "Influencer Details"
    if (cc.assignedGroup==="Approval Details") return "Approval Details"
    if (cc.assignedGroup==="Outreach Details") return "Outreach Details"
    return "Custom Fields"
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

  const handleRowSelect = (id: string) => setSelectedRowId(prev=>prev===id?null:id)
  const handleUpdateRow = (r: InfluencerRow) => { setRows(prev=>{const next=prev.map(x=>x.id===r.id?r:x);onRowsChange?.(next);return next}) }
  const handleApplyFilter = (c: string,v: string) => { setFilterColumn(c);setFilterValue(v);setCurrentPage(1) }
  const handleClearFilter = () => { setFilterColumn("");setFilterValue("");setCurrentPage(1) }

  // Column drag
  const onColDragStart = (vi: number,e: DragEvent) => { setDragIdx(vi);e.dataTransfer.effectAllowed="move";e.dataTransfer.setDragImage(e.currentTarget as HTMLElement,40,18) }
  const onColDragOver = (vi: number,e: DragEvent) => { e.preventDefault();e.dataTransfer.dropEffect="move";setDragOverIdx(vi);const tc=allCols[vi];if(tc&&(tc.group==="Influencer Details"||tc.group==="Approval Details"||tc.group==="Outreach Details")){setDragOverGroup(tc.group)}else{setDragOverGroup(null)} }
  const onColDragEnd = () => {
    if(dragIdx!==null&&dragOverIdx!==null&&dragIdx!==dragOverIdx){
      const dc=allCols[dragIdx]
      if(dc.isCustom&&dragOverGroup&&(dragOverGroup==="Influencer Details"||dragOverGroup==="Approval Details"||dragOverGroup==="Outreach Details")){
        const fk=(dc as CustomColDef).fieldKey
        setCustomCols(prev=>{const next=prev.map(c=>c.field_key===fk?{...c,assignedGroup:dragOverGroup as "Influencer Details"|"Approval Details"|"Outreach Details"}:c);onCustomColumnsChange?.(next);return next})
      }
      setColOrder(prev=>{const arr=[...(prev??rawCols.map((_,i)=>i))];const[moved]=arr.splice(dragIdx,1);arr.splice(dragOverIdx!,0,moved);return arr})
    }
    setDragIdx(null);setDragOverIdx(null);setDragOverGroup(null)
  }

  const getCellValue = useCallback((row: InfluencerRow,key: string): string => {
    if(key.startsWith("custom."))return row.custom[key.slice(7)]??""; return String((row as Record<string,unknown>)[key]??"")
  }, [])

  /* ═══════════════════════════════════════════════════════════════════════
     KEY FIX: Auto-update social_link when handle or platform changes
     ═══════════════════════════════════════════════════════════════════════ */
  const applyCellValue = useCallback((rowIdx: number,colKey: string,value: string) => {
    const actualRow = filteredRows[rowIdx]
    const actualRowIdx = rows.findIndex(r=>r.id===actualRow.id)
    if(actualRowIdx===-1)return
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
      // ★ AUTO SOCIAL LINK: when handle or platform changes, update social_link automatically
      if(colKey==="handle"||colKey==="platform"){
        const newHandle = colKey==="handle"?value:row.handle
        const newPlatform = colKey==="platform"?value:row.platform
        const oldUrl = getProfileUrl(
          colKey==="platform"?prev[actualRowIdx].platform:row.platform,
          colKey==="handle"?prev[actualRowIdx].handle:row.handle
        )
        const freshUrl = getProfileUrl(newPlatform, newHandle)
        // Auto-update built-in social_link if empty or matches the old auto-generated URL
        const curSocialLink = row.social_link ?? ""
        if(!curSocialLink || curSocialLink===oldUrl){
          row.social_link = freshUrl
        }
        // Also update custom URL columns
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
  }, [onRowsChange, customCols, filteredRows, rows])

  const addOptionToCol = useCallback((fk: string,newOpt: string) => {
    setCustomCols(prev=>{const next=prev.map(c=>c.field_key!==fk?c:{...c,field_options:[...(c.field_options??[]),newOpt]});onCustomColumnsChange?.(next);return next})
  }, [onCustomColumnsChange])

  const startEdit = useCallback((ri: number,ci: number) => {
    if(readOnly)return
    const col=allCols[ci]; const row=filteredRows[ri]
    if(col.type==="boolean"){applyCellValue(ri,col.key,getCellValue(row,col.key)==="Yes"?"No":"Yes");setActiveCell({rowIdx:ri,colIdx:ci});return}
    if(col.key==="platform"||col.type==="dropdown"||col.type==="multi-select"||col.type==="date"){setActiveCell({rowIdx:ri,colIdx:ci});setEditCell(null);setPopupCell({rowIdx:ri,colIdx:ci});return}
    setActiveCell({rowIdx:ri,colIdx:ci});setPopupCell(null);setEditCell({rowIdx:ri,colIdx:ci});setEditValue(getCellValue(row,col.key))
  }, [allCols, getCellValue, readOnly, filteredRows, applyCellValue])

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

  const addRow = () => { const r=newEmptyRow(customCols);setRows(prev=>{const next=[...prev,r];onRowsChange?.(next);return next});setCurrentPage(Math.ceil((rows.length+1)/rowsPerPage));setActiveCell({rowIdx:rows.length,colIdx:0});containerRef.current?.focus() }
  const deleteRow = (id: string) => { setRows(prev=>{const next=prev.filter(r=>r.id!==id);onRowsChange?.(next);return next});if(selectedRowId===id)setSelectedRowId(null) }

  const confirmAddCol = () => {
    const name=newColName.trim();if(!name)return
    const fk=name.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"")
    const hasOpts=newColType==="dropdown"||newColType==="multi-select"
    const col:CustomColumn={id:crypto.randomUUID(),field_key:fk,field_name:name,field_type:newColType,field_options:hasOpts?newColOpts.split(",").map(s=>s.trim()).filter(Boolean):undefined}
    setCustomCols(prev=>{const next=[...prev,col];onCustomColumnsChange?.(next);return next})
    setRows(prev=>prev.map(r=>{let dv="";if(newColType==="boolean")dv="No";else if(newColType==="url")dv=getProfileUrl(r.platform,r.handle);return{...r,custom:{...r.custom,[fk]:dv}}}))
    setNewColName("");setNewColType("text");setNewColOpts("");setAddingCol(false);containerRef.current?.focus()
  }
  const deleteCustomCol = (fk: string) => {
    setCustomCols(prev=>{const next=prev.filter(c=>c.field_key!==fk);onCustomColumnsChange?.(next);return next})
    setRows(prev=>prev.map(r=>{const custom={...r.custom};delete custom[fk];return{...r,custom}}))
    setActiveCell(null);setEditCell(null);setPopupCell(null)
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
    if(col.type==="url"){const valid=isValidUrl(value);return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}>{value?(valid?<a href={normalizeUrl(value)} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline truncate max-w-full" title={value}><span className="truncate">{value}</span><IconExternalLink size={12} className="flex-shrink-0 opacity-60"/></a>:<span className="text-red-400 truncate block">{value}</span>):<span className="text-gray-300">—</span>}</td>}
    if(col.type==="dropdown"){return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}>{value?<span className="inline-block px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium truncate max-w-full">{value}</span>:<span className="text-gray-300">—</span>}</td>}
    if(col.key==="approval_status"){return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}><ApprovalBadge value={value}/></td>}
    return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}>{col.key==="contact_status"?<StatusBadge value={value}/>:<span className="block truncate">{value}</span>}</td>
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search by handle, name, email, niche, location, notes..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"/>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setShowFilterModal(true)} className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition ${filterColumn?"bg-blue-100 text-blue-700":"text-gray-600 hover:bg-gray-100"}`}><IconFilter size={16}/>Filter{filterColumn&&<span className="w-2 h-2 bg-blue-500 rounded-full"/>}</button>
          <button onClick={()=>setShowDetailPanel(!showDetailPanel)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition">{showDetailPanel?<IconEyeOff size={16}/>:<IconEye size={16}/>}{showDetailPanel?"Hide Details":"Show Details"}</button>
        </div>
      </div>

      {getActiveFilterText()&&<div className="flex items-center gap-2"><span className="text-xs text-gray-500">Active filter:</span><div className="flex items-center gap-1.5 bg-blue-50 rounded-full px-3 py-1 text-xs"><IconFilter size={12} className="text-blue-500"/><span className="text-blue-700">{getActiveFilterText()}</span><button onClick={handleClearFilter} className="ml-1 text-blue-400 hover:text-blue-600"><IconX size={12}/></button></div></div>}

      <FilterModal isOpen={showFilterModal} onClose={()=>setShowFilterModal(false)} onApplyFilter={handleApplyFilter} onClearFilter={handleClearFilter} currentFilterColumn={filterColumn} currentFilterValue={filterValue} columns={allCols}/>

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
                  {!readOnly&&<th rowSpan={2} className="border border-gray-200 bg-gray-50 w-10 min-w-[2.5rem] text-center"><button onClick={()=>setAddingCol(true)} title="Add column" className="w-6 h-6 mx-auto flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition"><IconPlus size={14}/></button></th>}
                  <th rowSpan={2} className="border border-gray-200 bg-gray-50 w-10 min-w-[2.5rem]"/>
                </tr>
                <tr>
                  {allCols.map((col,vi)=>{
                    const isDragging=dragIdx===vi;const isOver=dragOverIdx===vi&&dragIdx!==vi
                    return <th key={col.key} draggable={!readOnly} onDragStart={e=>onColDragStart(vi,e)} onDragOver={e=>onColDragOver(vi,e)} onDragEnd={onColDragEnd}
                      className={`border border-gray-200 px-2 py-1.5 text-left text-xs font-semibold text-gray-600 whitespace-nowrap group/col transition-all ${getColHeaderBgClass(col.group)} ${isDragging?"opacity-40":""} ${isOver?"border-l-2 !border-l-blue-500":""}`}
                      style={{minWidth:col.minWidth,cursor:readOnly?"default":"grab"}}>
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">{!readOnly&&<IconGripVertical size={12} className="text-gray-300 flex-shrink-0 opacity-0 group-hover/col:opacity-100 transition"/>}<span>{col.label}</span></div>
                        {!readOnly&&col.isCustom&&<button onClick={()=>deleteCustomCol((col as CustomColDef).fieldKey)} title="Remove column" className="opacity-0 group-hover/col:opacity-100 p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><IconX size={12}/></button>}
                      </div></th>
                  })}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row,li)=>{const ri=pageStart+li;const isSel=selectedRowId===row.id;return(
                  <tr key={row.id} className={`group cursor-pointer transition-colors ${isSel?"bg-blue-50":"hover:bg-gray-50/60"}`} onClick={()=>handleRowSelect(row.id)}>
                    <td className="border border-gray-200 text-center text-xs text-gray-400 bg-gray-50/40 select-none">{ri+1}</td>
                    {allCols.map((col,ci)=>renderCell(row,ri,col,ci))}
                    {!readOnly&&<td className="border border-gray-200 bg-gray-50/40"/>}
                    <td className="border border-gray-200 text-center bg-gray-50/40">{!readOnly&&<button onClick={e=>{e.stopPropagation();deleteRow(row.id)}} title="Delete row" className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition"><IconTrash size={14}/></button>}</td>
                  </tr>
                )})}
                {totalRows===0&&<tr><td colSpan={totalCols+3} className="py-10 text-center text-sm text-gray-400">No influencers found. Try adjusting your search or filters, or click &quot;+ Add row&quot; to get started.</td></tr>}
              </tbody>
              {!readOnly&&<tfoot><tr><td colSpan={totalCols+3} className="border-t border-gray-200"><button onClick={addRow} className="flex items-center gap-1.5 w-full px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition"><IconPlus size={14}/> Add row</button></td></tr></tfoot>}
            </table>
          </div>

          {totalRows>0&&(
            <div className="flex items-center justify-between gap-4 text-sm text-gray-600 px-1 mt-3 flex-wrap">
              <div className="flex items-center gap-2"><span className="text-gray-500">Rows per page:</span>
                <select value={rowsPerPage} onChange={e=>{setRowsPerPage(Number(e.target.value));setCurrentPage(1)}} className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white outline-none focus:ring-2 ring-blue-400"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select></div>
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

        {showDetailPanel&&<div className="lg:w-[420px] flex-shrink-0"><DetailSection row={selectedRow} customCols={customCols} onUpdate={handleUpdateRow} onClose={()=>setSelectedRowId(null)} readOnly={readOnly} showEmptyState={showEmptyDetailState} emptyStateMessage={emptyDetailStateMessage}/></div>}
      </div>

      {!readOnly&&(
        <div className="flex items-center gap-4 px-1 flex-wrap">
          {[{keys:["↑","↓","←","→"],label:"Navigate"},{keys:["Enter"],label:"Edit"},{keys:["Tab"],label:"Next cell"},{keys:["Shift","Tab"],label:"Prev cell"},{keys:["←","→"],label:"Edit mode navigation"},{keys:["↑","↓"],label:"Edit mode row navigation"},{keys:["Esc"],label:"Cancel"},{keys:["Del"],label:"Clear"},{keys:["F2"],label:"Edit (alt)"}].map(({keys,label})=>(
            <div key={label} className="flex items-center gap-1">{keys.map(k=><kbd key={k} className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-[10px] font-mono text-gray-500 shadow-sm leading-none">{k}</kbd>)}<span className="text-[11px] text-gray-400 ml-0.5">{label}</span></div>
          ))}
          <div className="flex items-center gap-1 ml-2 border-l border-gray-200 pl-3"><IconGripVertical size={12} className="text-gray-400"/><span className="text-[11px] text-gray-400">Drag custom columns into any group to absorb them</span></div>
        </div>
      )}

      {!readOnly&&addingCol&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e=>{if(e.target===e.currentTarget)setAddingCol(false)}}>
          <div className="bg-white rounded-2xl shadow-xl w-[360px] p-6 flex flex-col gap-4">
            <div><h3 className="text-base font-semibold text-gray-900">Add custom column</h3><p className="text-xs text-gray-400 mt-0.5">Drag column into any group to absorb it</p></div>
            <input ref={newColInputRef} type="text" value={newColName} onChange={e=>setNewColName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")confirmAddCol();if(e.key==="Escape")setAddingCol(false)}} placeholder="Column name (e.g. Dog Breed)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-400 w-full"/>
            <select value={newColType} onChange={e=>setNewColType(e.target.value as CustomColumn["field_type"])} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-400 w-full bg-white"><option value="text">Text</option><option value="number">Number</option><option value="dropdown">Dropdown</option><option value="multi-select">Multi-select</option><option value="date">Date</option><option value="boolean">Yes / No</option><option value="url">URL</option></select>
            {(newColType==="dropdown"||newColType==="multi-select")&&<input type="text" value={newColOpts} onChange={e=>setNewColOpts(e.target.value)} placeholder="Options: Option A, Option B, Option C" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-400 w-full"/>}
            <div className="flex gap-2 pt-1"><button onClick={()=>setAddingCol(false)} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-red-500 hover:bg-gray-50 transition">Cancel</button><button onClick={confirmAddCol} disabled={!newColName.trim()} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-40 transition">Add</button></div>
          </div>
        </div>
      )}
    </div>
  )
}