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
import AddInfluencerModal from "@/app/dashboard/manage-influencers/modal/AddInfluencerModal"
import AddManualInfluencer from "@/app/dashboard/manage-influencers/modal/AddManualInfluencer"
import AddInstagramInfluencer from "@/app/dashboard/manage-influencers/modal/AddInstagramInfluencer"
import AddTiktokCreator from "@/app/dashboard/manage-influencers/modal/AddTiktokCreator"
import { LimitExceededDialog } from "@/components/limit-exceeded-dialog"
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
  IconDownload,
  IconUpload,
  IconSettings,
  IconChevronDown,
  IconLoader2,
} from "@tabler/icons-react"

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════════ */
export type InfluencerRow = {
  id: string; handle: string; platform: string; full_name: string; email: string;
  follower_count: string | number; engagement_rate: string | number; niche: string; contact_status: string;
  stage: string; agreed_rate: string; notes: string; custom: Record<string, string>;
  gender?: string; location?: string; social_link?: string; first_name?: string;
  contact_info?: string; approval_status?: "Approved" | "Declined" | "Pending";
  transferred_date?: string; approval_notes?: string; decline_reason?: string;
  tier?: string; community_status?: string; bio?: string; profile_image_url?: string;
  avg_likes?: string | number; avg_comments?: string | number; avg_views?: string | number;
}

export type CustomColumn = {
  id: string; field_key: string; field_name: string;
  field_type: "text" | "number" | "dropdown" | "multi-select" | "date" | "boolean" | "url";
  field_options?: string[];
  assignedGroup: "Influencer Details" | "Approval Details" | "Outreach Details";
  description?: string
}

type CellAddress = { rowIdx: number; colIdx: number }
type ColDef = { key: string; label: string; group: "Influencer Details" | "Approval Details" | "Outreach Details"; minWidth: number; type: "text" | "number" | "select" | "url" | "date"; options?: string[]; isCustom?: false }
type CustomColDef = { key: string; label: string; group: "Influencer Details" | "Approval Details" | "Outreach Details" | "Custom Fields"; minWidth: number; type: "text" | "number" | "dropdown" | "multi-select" | "date" | "boolean" | "url"; options?: string[]; isCustom: true; customId: string; fieldKey: string; assignedGroup: "Influencer Details" | "Approval Details" | "Outreach Details" }
type AnyColDef = ColDef | CustomColDef
type FilterState = { tier: string; platform: string; niche: string; location: string; community: string }

// ★ Toast notification type
type ToastNotification = { id: string; type: "success" | "error" | "warning" | "info"; message: string }

/* ═══════════════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════════ */
const DEFAULT_TIERS = ["Gold", "Silver", "Bronze"]
const DEFAULT_PLATFORMS = ["Instagram", "YouTube", "TikTok", "X (Twitter)"]
const DEFAULT_NICHES = ["Beauty", "Fitness", "Lifestyle", "Food", "Tech", "Travel", "Fashion", "Gaming"]
const DEFAULT_LOCATIONS = ["Philippines","Singapore","United States","Australia","United Kingdom","Malaysia","Indonesia","Thailand","Vietnam"]
const DEFAULT_CONTACT_STATUSES = [{ value: "not_contacted", label: "Not Contacted" },{ value: "contacted", label: "Contacted" },{ value: "interested", label: "Interested" },{ value: "agreed", label: "Agreed" }]
const DEFAULT_COMMUNITY_STATUSES = ["Pending", "Invited", "Joined", "Not Interested", "Left"]

/* ═══════════════════════════════════════════════════════════════════════════════
   PLATFORM ICONS & URL MAP
   ═══════════════════════════════════════════════════════════════════════════════ */
const platforms = [
  { name: "Instagram", value: "instagram", icon: (<img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram" className="w-6 h-6" />) },
  { name: "TikTok", value: "tiktok", icon: (<svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.89 2.89 2.896 2.896 0 0 1-2.889-2.89 2.896 2.896 0 0 1 2.89-2.889c.302 0 .595.05.872.137V9.257a6.339 6.339 0 0 0-5.053 2.212 6.339 6.339 0 0 0-1.33 5.52 6.34 6.34 0 0 0 5.766 4.731 6.34 6.34 0 0 0 6.34-6.34V8.898a7.756 7.756 0 0 0 4.422 1.393V6.825a4.8 4.8 0 0 1-2.443-.139z" /></svg>) },
  { name: "YouTube", value: "youtube", icon: (<svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>) },
  { name: "X (Twitter)", value: "twitter", icon: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>) },
]

const PLATFORM_ICONS: Record<string, React.ReactNode> = {}
platforms.forEach(p => { PLATFORM_ICONS[p.value] = p.icon })

function PlatformIcon({ platform, size = 16, className = "" }: { platform: string; size?: number; className?: string }) {
  const icon = PLATFORM_ICONS[platform]
  if (!icon) return <IconWorld size={size} className={className} />
  return <span className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>{React.cloneElement(icon as React.ReactElement, { className: `w-full h-full`, style: { width: size, height: size } } as any)}</span>
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
  const fn = PLATFORM_URL_MAP[platform]; return fn ? fn(handle) : ""
}

function newEmptyRow(customCols: CustomColumn[]): InfluencerRow {
  const custom: Record<string, string> = {}
  customCols.forEach((c) => { custom[c.field_key] = c.field_type === "boolean" ? "No" : "" })
  return { id: crypto.randomUUID(), handle: "@", platform: "instagram", full_name: "", email: "", follower_count: "", engagement_rate: "", niche: "", contact_status: "not_contacted", stage: "1", agreed_rate: "", notes: "", custom, gender: "", location: "", social_link: "", first_name: "", contact_info: "", approval_status: "Pending", transferred_date: "", approval_notes: "", decline_reason: "", tier: "Bronze", community_status: "Pending" }
}

const STATUS_STYLE: Record<string, string> = { not_contacted: "bg-gray-100 text-gray-600", contacted: "bg-blue-100 text-blue-700", interested: "bg-yellow-100 text-yellow-700", agreed: "bg-green-100 text-green-700" }
const STATUS_LABEL: Record<string, string> = { not_contacted: "Not Contacted", contacted: "Contacted", interested: "Interested", agreed: "Agreed" }
const APPROVAL_STYLE: Record<string, string> = { Approved: "bg-green-100 text-green-700", Declined: "bg-red-100 text-red-600", Pending: "bg-yellow-100 text-yellow-700" }
const TIER_STYLE: Record<string, string> = { Gold: "bg-yellow-100 text-yellow-800", Silver: "bg-gray-200 text-gray-700", Bronze: "bg-amber-100 text-amber-800" }
const COMMUNITY_STYLE: Record<string, string> = { Pending: "bg-yellow-100 text-yellow-700", Invited: "bg-blue-100 text-blue-700", Joined: "bg-green-100 text-green-700", "Not Interested": "bg-red-100 text-red-600", Left: "bg-gray-100 text-gray-600" }

function StatusBadge({ value }: { value: string }) { return <span className={`inline-block truncate max-w-full px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[value] ?? "bg-gray-100 text-gray-500"}`}>{STATUS_LABEL[value] || value || "—"}</span> }
function ApprovalBadge({ value }: { value: string }) { return <span className={`inline-block truncate max-w-full px-2 py-0.5 rounded-full text-xs font-medium ${APPROVAL_STYLE[value] ?? "bg-gray-100 text-gray-500"}`}>{value || "Pending"}</span> }
function TierBadge({ value }: { value: string }) { const icon = value === "Gold" ? "🥇" : value === "Silver" ? "🥈" : value === "Bronze" ? "🥉" : ""; return <span className={`inline-flex items-center gap-0.5 truncate max-w-full px-2 py-0.5 rounded-full text-xs font-medium ${TIER_STYLE[value] ?? "bg-gray-100 text-gray-500"}`}>{icon} {value || "—"}</span> }
function CommunityBadge({ value }: { value: string }) { return <span className={`inline-block truncate max-w-full px-2 py-0.5 rounded-full text-xs font-medium ${COMMUNITY_STYLE[value] ?? "bg-gray-100 text-gray-500"}`}>{value || "—"}</span> }

function isValidUrl(str: string): boolean { if (!str) return false; try { const u = new URL(str.startsWith("http") ? str : `https://${str}`); return u.hostname.includes(".") } catch { return false } }
function normalizeUrl(str: string): string { if (!str) return ""; return str.startsWith("http") ? str : `https://${str}` }

const handleApprovalChange = (row: InfluencerRow, newStatus: string, declineReason?: string): InfluencerRow => {
  const r = { ...row }
  if (newStatus === "Approved" && row.approval_status !== "Approved") { const t = new Date(); r.transferred_date = [t.getFullYear(), String(t.getMonth() + 1).padStart(2, "0"), String(t.getDate()).padStart(2, "0")].join("-") } else if (newStatus !== "Approved") { r.transferred_date = "" }
  if (newStatus === "Declined" && row.approval_status !== "Declined") { r.contact_status = "not_contacted"; r.stage = "1"; r.agreed_rate = ""; r.notes = ""; if (declineReason) { r.approval_notes = declineReason; r.decline_reason = declineReason } }
  r.approval_status = newStatus as "Approved" | "Declined" | "Pending"; return r
}

function getStaticCols(niches: string[], locations: string[]): ColDef[] {
  return [
    { key: "handle", label: "Handle", group: "Influencer Details", minWidth: 140, type: "text" },
    { key: "platform", label: "Platform", group: "Influencer Details", minWidth: 110, type: "select", options: ["instagram", "tiktok", "youtube", "twitter", "other"] },
    { key: "niche", label: "Niche", group: "Influencer Details", minWidth: 120, type: "select", options: niches },
    { key: "gender", label: "Gender", group: "Influencer Details", minWidth: 110, type: "select", options: ["Male", "Female", "Non-binary", "Other"] },
    { key: "location", label: "Location", group: "Influencer Details", minWidth: 130, type: "select", options: locations },
    { key: "follower_count", label: "Follower Count", group: "Influencer Details", minWidth: 120, type: "number" },
    { key: "engagement_rate", label: "Engagement Rate (%)", group: "Influencer Details", minWidth: 140, type: "number" },
    { key: "social_link", label: "Social Link", group: "Influencer Details", minWidth: 150, type: "url" },
    { key: "first_name", label: "First Name", group: "Influencer Details", minWidth: 110, type: "text" },
    { key: "contact_info", label: "Email", group: "Influencer Details", minWidth: 160, type: "text" },
    { key: "approval_status", label: "Approve/Decline", group: "Approval Details", minWidth: 130, type: "select", options: ["Approved", "Declined", "Pending"] },
    { key: "transferred_date", label: "Transferred Date", group: "Approval Details", minWidth: 140, type: "date" },
    { key: "approval_notes", label: "Notes", group: "Approval Details", minWidth: 200, type: "text" },
    { key: "contact_status", label: "Status", group: "Outreach Details", minWidth: 120, type: "select", options: ["not_contacted", "contacted", "interested", "agreed"] },
    { key: "agreed_rate", label: "Rate ($)", group: "Outreach Details", minWidth: 100, type: "number" },
    { key: "notes", label: "Notes", group: "Outreach Details", minWidth: 200, type: "text" },
  ]
}

const OUTREACH_FIELDS = new Set(["contact_status", "stage", "agreed_rate", "notes"])

/* ═══════════════════════════════════════════════════════════════════════════════
   ★ INSTROOM API — Auto-fetch influencer data
   ═══════════════════════════════════════════════════════════════════════════════ */
const INSTROOM_API: Record<string, (u: string) => string> = {
  instagram: (u: string) => `https://api.instroom.io/v2/${u}/instagram`,
  tiktok: (u: string) => `https://api.instroom.io/${u}/tiktok`,
}

async function fetchInfluencerFromAPI(handle: string, platform: string): Promise<Partial<InfluencerRow> | null> {
  const clean = handle.trim().replace(/^@/, "").toLowerCase()
  if (!clean || clean.length < 2) return null
  const endpointFn = INSTROOM_API[platform]
  if (!endpointFn) return null
  try {
    const res = await fetch(endpointFn(clean))
    if (!res.ok) return null
    const json = await res.json()
    const d = json.data || json.user || json
    if (!d || typeof d !== "object") return null
    const followerCount = Number(d.follower_count || d.followers || 0)
    const avgLikes = Number(d.avg_likes || d.average_likes || 0)
    const avgComments = Number(d.avg_comments || d.average_comments || 0)
    let engRate = 0
    if (followerCount > 0) { const raw = ((avgLikes + avgComments) / followerCount) * 100; engRate = isNaN(raw) || !isFinite(raw) ? 0 : parseFloat(raw.toFixed(2)) }
    const profileUrl = platform === "tiktok" ? `https://tiktok.com/@${clean}` : `https://instagram.com/${clean}`
    return {
      full_name: d.full_name || d.name || "",
      first_name: (d.full_name || d.name || "").split(" ")[0] || "",
      follower_count: String(followerCount),
      engagement_rate: String(engRate),
      email: d.business_email || d.email || "",
      contact_info: d.business_email || d.email || "",
      social_link: d.profile_url || profileUrl,
      location: d.location || d.city || "",
      niche: d.category || d.business_category || "",
      gender: d.gender || "",
    }
  } catch (err) { console.error(`API fetch error for ${handle}:`, err); return null }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ★ TOAST NOTIFICATION COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
function ToastContainer({ toasts, onDismiss }: { toasts: ToastNotification[]; onDismiss: (id: string) => void }) {
  if (!toasts.length) return null
  const styles: Record<string, string> = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  }
  const icons: Record<string, React.ReactNode> = {
    success: <IconCheck size={16} className="text-green-600" />,
    error: <IconAlertCircle size={16} className="text-red-600" />,
    warning: <IconAlertTriangle size={16} className="text-amber-600" />,
    info: <IconAlertCircle size={16} className="text-blue-600" />,
  }
  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-start gap-2 px-4 py-3 rounded-xl border shadow-lg animate-in slide-in-from-right ${styles[t.type]}`}>
          <span className="flex-shrink-0 mt-0.5">{icons[t.type]}</span>
          <span className="text-sm font-medium flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="flex-shrink-0 opacity-60 hover:opacity-100"><IconX size={14} /></button>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   REUSABLE UI COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════════ */
function ConfirmationDialog({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", variant = "danger" }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: ReactNode; confirmText?: string; cancelText?: string; variant?: "danger"|"warning"|"info" }) {
  const vs = { danger: { icon: IconAlertTriangle, iconBg: "bg-red-100", iconColor: "text-red-600", buttonBg: "bg-red-600 hover:bg-red-700" }, warning: { icon: IconAlertCircle, iconBg: "bg-amber-100", iconColor: "text-amber-600", buttonBg: "bg-amber-600 hover:bg-amber-700" }, info: { icon: IconAlertCircle, iconBg: "bg-blue-100", iconColor: "text-blue-600", buttonBg: "bg-blue-600 hover:bg-blue-700" } }
  const s = vs[variant]; const IC = s.icon
  useEffect(() => { if (isOpen) { const h = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") onClose() }; document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h) } }, [isOpen, onClose])
  if (!isOpen) return null
  return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e => { if (e.target === e.currentTarget) onClose() }}><div className="bg-white rounded-2xl shadow-xl w-[420px] p-6"><div className="flex items-start gap-3 mb-4"><div className={`p-2 ${s.iconBg} rounded-full flex-shrink-0`}><IC size={24} className={s.iconColor} /></div><div className="flex-1"><h3 className="text-lg font-semibold text-gray-900">{title}</h3><div className="text-sm text-gray-500 mt-1">{message}</div></div></div><div className="flex gap-3 mt-6"><button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">{cancelText}</button><button onClick={() => { onConfirm(); onClose() }} className={`flex-1 px-4 py-2 rounded-lg text-white text-sm transition ${s.buttonBg}`}>{confirmText}</button></div></div></div>)
}

function MultiSelectDisplay({ value }: { value: string }) { const tags = value ? value.split(",").map(s => s.trim()).filter(Boolean) : []; if (!tags.length) return <span className="text-gray-300">—</span>; return <div className="flex flex-wrap gap-1">{tags.map(t => <span key={t} className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[11px] font-medium leading-none">{t}</span>)}</div> }

function FloatingPopup({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null); useEffect(() => { ref.current?.focus() }, [])
  return (<div ref={ref} tabIndex={0} onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); onClose() } }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) onClose() }} onMouseDown={e => e.stopPropagation()} className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl">{children}</div>)
}

function DropdownEditor({ value, options, onChange, onClose, onAddOption }: { value: string; options: string[]; onChange: (v: string) => void; onClose: () => void; onAddOption?: (v: string) => void }) {
  const [newOpt, setNewOpt] = useState("")
  const addNew = () => { const v = newOpt.trim(); if (!v || options.includes(v)) return; onAddOption?.(v); onChange(v); setNewOpt(""); onClose() }
  return (<FloatingPopup onClose={onClose}><div className="w-52 max-h-60 overflow-auto py-1"><button onMouseDown={e => e.preventDefault()} onClick={() => { onChange(""); onClose() }} className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition ${!value ? "text-indigo-600 font-medium" : "text-gray-400"}`}>— None —</button>{options.map(o => (<button key={o} onMouseDown={e => e.preventDefault()} onClick={() => { onChange(o); onClose() }} className={`flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition ${value === o ? "text-indigo-700 font-medium bg-indigo-50" : "text-gray-700"}`}>{value === o && <IconCheck size={14} className="text-indigo-600 flex-shrink-0" />}{o}</button>))}</div>{onAddOption && (<div className="border-t border-gray-100 px-2 py-2"><div className="flex gap-1"><input type="text" value={newOpt} placeholder="Add new…" onChange={e => setNewOpt(e.target.value)} onKeyDown={e => { e.stopPropagation(); if (e.key === "Enter") addNew() }} onMouseDown={e => e.stopPropagation()} className="flex-1 text-sm px-2 py-1 border border-gray-200 rounded outline-none focus:ring-1 ring-indigo-400 min-w-0" /><button onClick={addNew} disabled={!newOpt.trim()} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-40 transition"><IconPlus size={12} /></button></div></div>)}</FloatingPopup>)
}

function MultiSelectEditor({ value, options, onChange, onClose, onAddOption }: { value: string; options: string[]; onChange: (v: string) => void; onClose: () => void; onAddOption: (v: string) => void }) {
  const selected = value ? value.split(",").map(s => s.trim()).filter(Boolean) : []; const [newOpt, setNewOpt] = useState("")
  const toggle = (opt: string) => { const next = selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]; onChange(next.join(",")) }
  const addNew = () => { const v = newOpt.trim(); if (!v || options.includes(v)) return; onAddOption(v); onChange([...selected, v].join(",")); setNewOpt("") }
  return (<FloatingPopup onClose={onClose}><div className="w-56 max-h-52 overflow-auto py-1">{options.map(opt => { const isOn = selected.includes(opt); return (<button key={opt} onMouseDown={e => e.preventDefault()} onClick={() => toggle(opt)} className={`flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition ${isOn ? "text-purple-700 font-medium" : "text-gray-700"}`}><span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isOn ? "bg-purple-600 border-purple-600" : "border-gray-300"}`}>{isOn && <IconCheck size={12} className="text-white" />}</span>{opt}</button>) })}{!options.length && <div className="px-3 py-2 text-xs text-gray-400">No options yet</div>}</div><div className="border-t border-gray-100 px-2 py-2"><div className="flex gap-1"><input type="text" value={newOpt} placeholder="Add new…" onChange={e => setNewOpt(e.target.value)} onKeyDown={e => { e.stopPropagation(); if (e.key === "Enter") addNew() }} onMouseDown={e => e.stopPropagation()} className="flex-1 text-sm px-2 py-1 border border-gray-200 rounded outline-none focus:ring-1 ring-purple-400 min-w-0" /><button onClick={addNew} disabled={!newOpt.trim()} className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-40 transition"><IconPlus size={12} /></button></div></div></FloatingPopup>)
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DAY_NAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"]

function DatePicker({ value, onChange, onClose }: { value: string; onChange: (v: string) => void; onClose: () => void }) {
  const init = value ? new Date(value + "T00:00:00") : new Date(); const [viewYear, setViewYear] = useState(init.getFullYear()); const [viewMonth, setViewMonth] = useState(init.getMonth()); const today = new Date(); const todayStr = [today.getFullYear(), String(today.getMonth()+1).padStart(2,"0"), String(today.getDate()).padStart(2,"0")].join("-"); const firstDow = new Date(viewYear, viewMonth, 1).getDay(); const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate(); const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()
  type DayCell = { day: number; current: boolean; dateStr: string }; const cells: DayCell[] = []
  for (let i=0; i<firstDow; i++) { const d=prevMonthDays-firstDow+1+i; const m=viewMonth===0?12:viewMonth; const y=viewMonth===0?viewYear-1:viewYear; cells.push({day:d,current:false,dateStr:`${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`}) }
  for (let d=1; d<=daysInMonth; d++) { cells.push({day:d,current:true,dateStr:`${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`}) }
  while (cells.length<42) { const d=cells.length-firstDow-daysInMonth+1; const m=viewMonth===11?1:viewMonth+2; const y=viewMonth===11?viewYear+1:viewYear; cells.push({day:d,current:false,dateStr:`${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`}) }
  const prevMo = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1)}else{setViewMonth(m=>m-1)} }; const nextMo = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1)}else{setViewMonth(m=>m+1)} }; const pick = (s: string) => { onChange(s); onClose() }
  return (<FloatingPopup onClose={onClose}><div className="w-[280px] p-3 select-none"><div className="flex items-center justify-between mb-3"><button onMouseDown={e=>e.preventDefault()} onClick={prevMo} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition"><IconChevronLeft size={16}/></button><span className="text-sm font-semibold text-gray-800">{MONTH_NAMES[viewMonth]} {viewYear}</span><button onMouseDown={e=>e.preventDefault()} onClick={nextMo} className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition"><IconChevronRight size={16}/></button></div><div className="grid grid-cols-7 mb-1">{DAY_NAMES.map(d=><div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>)}</div><div className="grid grid-cols-7">{cells.map((c,i)=>{const isSelected=c.dateStr===value; const isToday=c.dateStr===todayStr; return <button key={i} onMouseDown={e=>e.preventDefault()} onClick={()=>pick(c.dateStr)} className={`w-[36px] h-[36px] mx-auto rounded-lg text-xs flex items-center justify-center transition-colors ${!c.current?"text-gray-300 hover:bg-gray-50":"text-gray-700 hover:bg-blue-50"} ${isSelected?"!bg-blue-600 !text-white font-bold hover:!bg-blue-700":""} ${isToday&&!isSelected?"ring-1 ring-inset ring-blue-400 font-semibold text-blue-600":""}`}>{c.day}</button>})}</div><div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100"><button onMouseDown={e=>e.preventDefault()} onClick={()=>pick(todayStr)} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition">Today</button><button onMouseDown={e=>e.preventDefault()} onClick={()=>{onChange("");onClose()}} className="text-xs text-gray-400 hover:text-red-500 transition">Clear</button></div></div></FloatingPopup>)
}

function PlatformEditor({ value, onChange, onClose }: { value: string; onChange: (v: string) => void; onClose: () => void }) {
  return (<FloatingPopup onClose={onClose}><div className="w-52 max-h-60 overflow-auto py-1">{platforms.map(plat => { const sel = value === plat.value; return (<button key={plat.value} onMouseDown={e=>e.preventDefault()} onClick={()=>{onChange(plat.value);onClose()}} className={`flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition ${sel?"text-blue-700 font-medium bg-blue-50":"text-gray-700"}`}><span className="w-5 h-5 flex items-center justify-center flex-shrink-0">{React.cloneElement(plat.icon as React.ReactElement, { className: `w-5 h-5`, style: { width: 20, height: 20 } } as any)}</span><span>{plat.name}</span>{sel && <IconCheck size={14} className="text-blue-600 ml-auto flex-shrink-0" />}</button>) })}</div></FloatingPopup>)
}

function AddRowsModal({ isOpen, onClose, onAdd, selectedCount }: { isOpen: boolean; onClose: () => void; onAdd: (count: number) => void; selectedCount: number }) {
  const [count, setCount] = useState(5); const [insertPosition, setInsertPosition] = useState<"end"|"after-selection">(selectedCount > 0 ? "after-selection" : "end"); if (!isOpen) return null
  return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className="bg-white rounded-2xl shadow-xl w-[400px] p-6"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900">Add Multiple Rows</h3><button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><IconX size={20}/></button></div><div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-2">Number of rows</label><div className="flex items-center gap-2"><input type="number" min="1" max="100" value={count} onChange={e=>setCount(Math.min(100,Math.max(1,parseInt(e.target.value)||1)))} className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-center"/><span className="text-sm text-gray-500">rows</span></div></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Insert position</label><div className="space-y-2"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="position" value="end" checked={insertPosition==="end"} onChange={()=>setInsertPosition("end")} className="w-4 h-4 text-blue-600"/><span className="text-sm text-gray-700">At the end</span></label><label className={`flex items-center gap-2 ${selectedCount===0?'opacity-50':'cursor-pointer'}`}><input type="radio" name="position" value="after-selection" checked={insertPosition==="after-selection"} onChange={()=>setInsertPosition("after-selection")} disabled={selectedCount===0} className="w-4 h-4 text-blue-600"/><span className="text-sm text-gray-700">After selected rows</span></label></div></div></div><div className="flex gap-3 mt-6"><button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button><button onClick={()=>{onAdd(count);onClose()}} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"><IconPlus size={16}/> Add {count} Rows</button></div></div></div>)
}

function DeclineConfirmationModal({ isOpen, onClose, onConfirm, influencerName }: { isOpen: boolean; onClose: () => void; onConfirm: (reason: string) => void; influencerName: string }) {
  const [declineReason, setDeclineReason] = useState(""); const [error, setError] = useState(""); const inputRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { if (isOpen) { setDeclineReason(""); setError(""); setTimeout(() => inputRef.current?.focus(), 100) } }, [isOpen])
  if (!isOpen) return null
  const handleConfirm = () => { if (!declineReason.trim()) { setError("Please provide a reason"); return }; onConfirm(declineReason.trim()); onClose() }
  return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className="bg-white rounded-2xl shadow-xl w-[450px] p-6"><div className="flex items-center gap-3 mb-4"><div className="p-2 bg-red-100 rounded-full"><IconAlertTriangle size={24} className="text-red-600"/></div><div><h3 className="text-lg font-semibold text-gray-900">Decline Influencer</h3><p className="text-sm text-gray-500">Declining <span className="font-medium text-gray-700">{influencerName}</span></p></div></div><div className="space-y-3"><div><label className="block text-sm font-medium text-gray-700 mb-2">Reason <span className="text-red-500">*</span></label><textarea ref={inputRef} value={declineReason} onChange={e=>{setDeclineReason(e.target.value);setError("")}} onKeyDown={e=>{if(e.key==="Enter"&&e.ctrlKey){e.preventDefault();handleConfirm()};if(e.key==="Escape")onClose()}} placeholder="e.g., Budget constraints..." rows={4} className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-red-400 outline-none resize-none ${error?"border-red-300 bg-red-50":"border-gray-200"}`}/>{error&&<p className="text-xs text-red-500 mt-1"><IconAlertCircle size={12}/> {error}</p>}</div><div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><p className="text-xs text-amber-800"><strong>Note:</strong> Declining disables outreach fields and clears outreach data.</p></div></div><div className="flex gap-3 mt-6"><button onClick={()=>{onConfirm("");onClose()}} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg transition">Skip</button><button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button><button onClick={handleConfirm} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition"><IconX size={16}/> Confirm Decline</button></div></div></div>)
}

function FilterPopover({ isOpen, onClose, filters, onApplyFilters, onClearFilters, niches, locations, anchorRef }: { isOpen: boolean; onClose: () => void; filters: FilterState; onApplyFilters: (f: FilterState) => void; onClearFilters: () => void; niches: string[]; locations: string[]; anchorRef: React.RefObject<HTMLButtonElement|null> }) {
  const [lf, setLf] = useState<FilterState>(filters); const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (isOpen) setLf(filters) }, [isOpen, filters])
  useEffect(() => { if (!isOpen) return; const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node) && anchorRef.current && !anchorRef.current.contains(e.target as Node)) onClose() }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h) }, [isOpen, onClose, anchorRef])
  if (!isOpen) return null
  return (<div ref={ref} className="absolute top-full right-0 mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-xl w-[340px]" onClick={e=>e.stopPropagation()}><div className="px-4 pt-4 pb-2"><h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter by</h4></div><div className="px-4 pb-3 space-y-3"><div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium text-gray-500 mb-1">Tier</label><select value={lf.tier} onChange={e=>setLf(p=>({...p,tier:e.target.value}))} className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg outline-none bg-white"><option value="all">All</option><option value="Gold">🥇 Gold</option><option value="Silver">🥈 Silver</option><option value="Bronze">🥉 Bronze</option></select></div><div><label className="block text-xs font-medium text-gray-500 mb-1">Platform</label><select value={lf.platform} onChange={e=>setLf(p=>({...p,platform:e.target.value}))} className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg outline-none bg-white"><option value="all">All</option>{DEFAULT_PLATFORMS.map(p=><option key={p} value={p}>{p}</option>)}</select></div></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium text-gray-500 mb-1">Niche</label><select value={lf.niche} onChange={e=>setLf(p=>({...p,niche:e.target.value}))} className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg outline-none bg-white"><option value="all">All</option>{niches.map(n=><option key={n} value={n}>{n}</option>)}</select></div><div><label className="block text-xs font-medium text-gray-500 mb-1">Location</label><select value={lf.location} onChange={e=>setLf(p=>({...p,location:e.target.value}))} className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg outline-none bg-white"><option value="all">All</option>{locations.map(l=><option key={l} value={l}>{l}</option>)}</select></div></div><div><label className="block text-xs font-medium text-gray-500 mb-1">Community</label><select value={lf.community} onChange={e=>setLf(p=>({...p,community:e.target.value}))} className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg outline-none bg-white"><option value="all">All</option>{DEFAULT_COMMUNITY_STATUSES.map(c=><option key={c} value={c}>{c}</option>)}</select></div></div><div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100"><button onClick={()=>{setLf({tier:"all",platform:"all",niche:"all",location:"all",community:"all"});onClearFilters()}} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 rounded-lg transition">Clear all</button><button onClick={()=>{onApplyFilters(lf);onClose()}} className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">Apply</button></div></div>)
}

function ManageOptionsModal({ isOpen, onClose, title, options, onSave }: { isOpen: boolean; onClose: () => void; title: string; options: string[]; onSave: (o: string[]) => void }) {
  const [lo, setLo] = useState<string[]>(options); const [no, setNo] = useState(""); const [ei, setEi] = useState<number|null>(null); const [ev, setEv] = useState(""); const ir = useRef<HTMLInputElement>(null)
  useEffect(() => { if (isOpen) { setLo([...options]); setNo(""); setEi(null) } }, [isOpen, options]); if (!isOpen) return null
  const add = () => { const v=no.trim(); if(!v||lo.includes(v))return; setLo(p=>[...p,v]); setNo(""); ir.current?.focus() }
  return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className="bg-white rounded-2xl shadow-xl w-[400px] p-6 max-h-[80vh] flex flex-col"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900">Manage {title}</h3><button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><IconX size={20}/></button></div><div className="flex gap-2 mb-4"><input ref={ir} type="text" value={no} onChange={e=>setNo(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")add()}} placeholder={`Add new ${title.toLowerCase()}…`} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"/><button onClick={add} disabled={!no.trim()} className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition"><IconPlus size={16}/></button></div><div className="flex-1 overflow-y-auto space-y-1 min-h-0">{lo.map((opt,idx)=>(<div key={idx} className="flex items-center gap-2 group px-2 py-1.5 rounded-lg hover:bg-gray-50">{ei===idx?(<><input type="text" value={ev} onChange={e=>setEv(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){const v=ev.trim();if(v)setLo(p=>p.map((o,i)=>i===ei?v:o));setEi(null)};if(e.key==="Escape")setEi(null)}} className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded outline-none" autoFocus/><button onClick={()=>{const v=ev.trim();if(v)setLo(p=>p.map((o,i)=>i===ei?v:o));setEi(null)}} className="p-1 text-green-600"><IconCheck size={14}/></button><button onClick={()=>setEi(null)} className="p-1 text-gray-400"><IconX size={14}/></button></>):(<><span className="flex-1 text-sm text-gray-700">{opt}</span><button onClick={()=>{setEi(idx);setEv(lo[idx])}} className="p-1 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100"><IconEdit size={14}/></button><button onClick={()=>setLo(p=>p.filter((_,i)=>i!==idx))} className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100"><IconTrash size={14}/></button></>)}</div>))}{lo.length===0&&<p className="text-center text-sm text-gray-400 py-4">No options yet</p>}</div><div className="flex gap-3 mt-4 pt-4 border-t border-gray-100"><button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button><button onClick={()=>{onSave(lo);onClose()}} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition">Save</button></div></div></div>)
}

/* ═══════════════════════════════════════════════════════════════════════════════
   IMPORT / EXPORT
   ═══════════════════════════════════════════════════════════════════════════════ */
const CSV_EXPORT_FIELDS = [{ key: "handle", label: "Handle" },{ key: "platform", label: "Platform" },{ key: "full_name", label: "Full Name" },{ key: "first_name", label: "First Name" },{ key: "email", label: "Email" },{ key: "niche", label: "Niche" },{ key: "gender", label: "Gender" },{ key: "location", label: "Location" },{ key: "follower_count", label: "Follower Count" },{ key: "engagement_rate", label: "Engagement Rate (%)" },{ key: "social_link", label: "Social Link" },{ key: "contact_info", label: "Email" },{ key: "tier", label: "Tier" },{ key: "community_status", label: "Community Status" },{ key: "approval_status", label: "Approval Status" },{ key: "transferred_date", label: "Transferred Date" },{ key: "approval_notes", label: "Approval Notes" },{ key: "contact_status", label: "Contact Status" },{ key: "agreed_rate", label: "Agreed Rate ($)" },{ key: "notes", label: "Notes" }]

function escapeCSV(val: string): string { if (!val) return ""; if (val.includes(",") || val.includes('"') || val.includes("\n")) return `"${val.replace(/"/g, '""')}"`; return val }
function exportToCSV(rows: InfluencerRow[], cc: CustomColumn[]): void { const af=[...CSV_EXPORT_FIELDS,...cc.map(c=>({key:`custom.${c.field_key}`,label:c.field_name}))]; const h=af.map(f=>escapeCSV(f.label)).join(","); const l=rows.map(r=>af.map(f=>{let v="";if(f.key.startsWith("custom."))v=r.custom[f.key.slice(7)]??"";else v=String((r as Record<string,unknown>)[f.key]??"");return escapeCSV(v)}).join(",")); const csv=[h,...l].join("\n"); const b=new Blob([csv],{type:"text/csv;charset=utf-8;"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download=`influencers_export_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(u) }
function downloadTemplate(cc: CustomColumn[]): void { const af=[...CSV_EXPORT_FIELDS,...cc.map(c=>({key:`custom.${c.field_key}`,label:c.field_name}))]; const h=af.map(f=>escapeCSV(f.label)).join(","); const ex=["@example_handle","instagram","Jane Doe","Jane","jane@example.com","Beauty","Female","United States","50000","3.5","https://instagram.com/example_handle","jane@example.com","Bronze","Pending","Pending","","","not_contacted","","",...cc.map(()=>"")].map(v=>escapeCSV(v)).join(","); const csv=[h,ex].join("\n"); const b=new Blob([csv],{type:"text/csv;charset=utf-8;"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download="influencers_import_template.csv"; a.click(); URL.revokeObjectURL(u) }
function parseCSV(text: string): string[][] { const rows: string[][]=[]; let cur: string[]=[]; let cell=""; let inQ=false; for(let i=0;i<text.length;i++){const ch=text[i]; if(inQ){if(ch==='"'&&text[i+1]==='"'){cell+='"';i++}else if(ch==='"')inQ=false;else cell+=ch}else{if(ch==='"')inQ=true;else if(ch===','){cur.push(cell);cell=""}else if(ch==='\n'||(ch==='\r'&&text[i+1]==='\n')){cur.push(cell);cell="";rows.push(cur);cur=[];if(ch==='\r')i++}else cell+=ch}}; if(cell||cur.length){cur.push(cell);rows.push(cur)}; return rows }
function importFromCSV(text: string, cc: CustomColumn[]): InfluencerRow[] { const p=parseCSV(text); if(p.length<2)return[]; const hd=p[0].map(h=>h.trim().toLowerCase()); const fm:Record<string,string>={}; CSV_EXPORT_FIELDS.forEach(f=>{fm[f.label.toLowerCase()]=f.key}); cc.forEach(c=>{fm[c.field_name.toLowerCase()]=`custom.${c.field_key}`}); const rows:InfluencerRow[]=[]; for(let i=1;i<p.length;i++){const vals=p[i]; if(vals.every(v=>!v.trim()))continue; const row=newEmptyRow(cc); hd.forEach((h,ci)=>{const key=fm[h]; if(!key||ci>=vals.length)return; const val=vals[ci].trim(); if(key.startsWith("custom."))row.custom[key.slice(7)]=val; else (row as Record<string,unknown>)[key]=val}); if(!["Approved","Declined","Pending"].includes(row.approval_status||""))row.approval_status="Pending"; rows.push(row)}; return rows }

/* ═══════════════════════════════════════════════════════════════════════════════
   PROFILE SIDEBAR
   ═══════════════════════════════════════════════════════════════════════════════ */
function formatFollowers(n: number): string { return n >= 1_000_000 ? (n/1_000_000).toFixed(1)+"M" : n >= 1000 ? (n/1000).toFixed(1)+"K" : String(n) }

function ProfileSidebar({ row, customCols, onUpdate, onClose, readOnly=false, niches, locations, onAddNiche, onAddLocation, onToast, brandId }: { row: InfluencerRow|null; customCols: CustomColumn[]; onUpdate: (r: InfluencerRow) => void; onClose: () => void; readOnly?: boolean; niches: string[]; locations: string[]; onAddNiche: (v: string) => void; onAddLocation: (v: string) => void; onToast?: (type: "success"|"error"|"info"|"warning", message: string) => void; brandId?: string }) {
  const [profileTab, setProfileTab] = useState(0)
  const [editedRow, setEditedRow] = useState<InfluencerRow|null>(row?{...row}:null)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [orderData, setOrderData] = useState({ productName: "", orderNumber: "", productCost: "", discountCode: row ? "CODE" + (row.first_name||row.handle).toUpperCase().replace(/[^A-Z]/g,"") : "", affiliateLink: row ? "https://instroom.io/ref/" + (row.first_name||row.handle).toLowerCase().replace(/[^a-z]/g,"") : "", shippingAddress: "", trackingLink: "" })
  const [postData, setPostData] = useState({ postLink: "", likes: "", sales: "", driveLink: "", comments: "", amount: "", usageRights: "", views: "", clicks: "" })
  useEffect(() => { if(row){ setEditedRow({...row}); setProfileTab(0); setOrderData(d => ({...d, discountCode: "CODE" + (row.first_name||row.handle).toUpperCase().replace(/[^A-Z]/g,""), affiliateLink: "https://instroom.io/ref/" + (row.first_name||row.handle).toLowerCase().replace(/[^a-z]/g,"")})); setPostData({ postLink:"",likes:"",sales:"",driveLink:"",comments:"",amount:"",usageRights:"",views:"",clicks:"" }) } }, [row])
  if (!row || !editedRow) return null
  const platformLabel = platforms.find(p=>p.value===editedRow.platform)?.name || editedRow.platform
  const postCVR = postData.clicks && parseFloat(postData.clicks)>0 ? ((parseFloat(postData.sales||"0")/parseFloat(postData.clicks))*100).toFixed(2)+"%" : ""
  const handleFieldChange = (field: string, value: string) => {
    if (!editedRow) return;
    if (field === "approval_status") {
      if (value === "Declined") { setShowDeclineModal(true); return; }
      else { setEditedRow(handleApprovalChange(editedRow, value)); }
    } else if (field.startsWith("custom.")) {
      setEditedRow({...editedRow, custom: {...editedRow.custom, [field.slice(7)]: value}});
    } else if (field === "handle" || field === "platform") {
      const nH = field === "handle" ? value : editedRow.handle;
      const nP = field === "platform" ? value : editedRow.platform;
      const oU = getProfileUrl(editedRow.platform, editedRow.handle);
      const fU = getProfileUrl(nP, nH);
      const cL = editedRow.social_link ?? "";
      const u = { ...editedRow, [field]: value };
      if (!cL || cL === oU) { u.social_link = fU; }
      setEditedRow(u);
    } else {
      setEditedRow({...editedRow, [field]: value});
    }
  }
  const handleSave = async () => {
    if (!editedRow || !row?.id) return
    
    if (!row.id || row.id.trim() === "") {
      onToast?.("error", "Cannot save: Influencer ID is missing. Try refreshing the page.")
      return
    }
    
    if (row.id.startsWith("mock-")) {
      onToast?.("info", "This is a sample row. Please create an influencer first.")
      return
    }
    
    setIsSaving(true)

    try {
      const url = brandId 
        ? `/api/brand/${brandId}/influencers/${row.id}`
        : `/api/influencers/${row.id}`
      
      const payload: any = {
        handle: editedRow.handle,
        platform: editedRow.platform,
        ...(editedRow.full_name && { full_name: editedRow.full_name }),
        ...(editedRow.email && { email: editedRow.email }),
        ...(editedRow.gender && { gender: editedRow.gender }),
        ...(editedRow.niche && { niche: editedRow.niche }),
        ...(editedRow.location && { location: editedRow.location }),
        ...(editedRow.bio && { bio: editedRow.bio }),
        ...(editedRow.profile_image_url && { profile_image_url: editedRow.profile_image_url }),
        ...(editedRow.social_link && { social_link: editedRow.social_link }),
        ...(editedRow.follower_count !== undefined && { follower_count: parseInt(String(editedRow.follower_count)) || 0 }),
        ...(editedRow.engagement_rate !== undefined && { engagement_rate: parseFloat(String(editedRow.engagement_rate)) || 0 }),
        ...(editedRow.avg_likes !== undefined && { avg_likes: parseInt(String(editedRow.avg_likes)) || 0 }),
        ...(editedRow.avg_comments !== undefined && { avg_comments: parseInt(String(editedRow.avg_comments)) || 0 }),
        ...(editedRow.avg_views !== undefined && { avg_views: parseInt(String(editedRow.avg_views)) || 0 }),
        approval_status: editedRow.approval_status,
        ...(editedRow.approval_notes && { approval_notes: editedRow.approval_notes }),
        contact_status: editedRow.contact_status,
        ...(editedRow.agreed_rate && { agreed_rate: editedRow.agreed_rate }),
        ...(editedRow.notes && { notes: editedRow.notes }),
        stage: editedRow.stage,
        ...(editedRow.transferred_date && { transferred_date: editedRow.transferred_date }),
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onUpdate(editedRow)
        onToast?.("success", "Influencer saved successfully")
      } else if (response.status === 404) {
        onToast?.("error", `Influencer not found. Please try refreshing the page.`)
      } else {
        const error = await response.json()
        onToast?.("error", error.error || "Failed to save influencer")
      }
    } catch (err) {
      onToast?.("error", "Failed to save influencer. Check your connection.")
    } finally {
      setIsSaving(false)
    }
  }
  const S = { overlay:{position:"fixed" as const,inset:0,background:"rgba(0,0,0,0.3)",zIndex:400}, panel:{position:"fixed" as const,top:0,right:0,width:520,maxWidth:"100vw",height:"100%",background:"#fff",boxShadow:"-4px 0 24px rgba(0,0,0,0.12)",zIndex:500,display:"flex",flexDirection:"column" as const,fontFamily:"'Inter',system-ui,sans-serif"}, header:{padding:"16px 20px",borderBottom:"0.5px solid rgba(0,0,0,0.08)"}, avatar:{width:44,height:44,borderRadius:"50%",background:"#1fae5b",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"#fff",flexShrink:0}, name:{fontSize:15,fontWeight:600,color:"#1e1e1e"}, handle:{fontSize:12,color:"#888",marginTop:2}, pipeSel:{fontSize:11,padding:"5px 10px",borderRadius:8,border:"0.5px solid #f4b740",background:"#fffbeb",color:"#854f0b",cursor:"pointer",fontWeight:500}, atag:{fontSize:12,fontWeight:500,padding:"6px 14px",borderRadius:20,cursor:"pointer",border:"1px solid rgba(0,0,0,0.15)",background:"#f7f9f8",color:"#555"}, atagPlat:{fontSize:12,fontWeight:500,padding:"6px 14px",borderRadius:20,cursor:"pointer",border:"1px solid #1fae5b",background:"#1fae5b",color:"#fff"}, tabBar:{display:"flex",gap:0,padding:"0 20px",borderBottom:"0.5px solid rgba(0,0,0,0.08)"}, tab:(a:boolean)=>({fontSize:12,fontWeight:500,padding:"10px 14px",cursor:"pointer",color:a?"#1fae5b":"#888",borderBottom:a?"2px solid #1fae5b":"2px solid transparent",whiteSpace:"nowrap" as const}), body:{flex:1,overflowY:"auto" as const,padding:"16px 20px"}, statRow:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,background:"#f7f9f8",borderRadius:10,padding:12,marginBottom:14}, statBox:{textAlign:"center" as const}, statLabel:{fontSize:10,color:"#888"}, statVal:{fontSize:15,fontWeight:600,color:"#1e1e1e",marginTop:2}, fieldGrid:{display:"grid",gridTemplateColumns:"1fr 1fr"}, fieldRow:{padding:"8px 0",borderBottom:"0.5px solid rgba(0,0,0,0.05)"}, fieldLabel:{fontSize:10,color:"#888",marginBottom:2}, fieldVal:{fontSize:12,color:"#1e1e1e",fontWeight:500}, formRow:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}, formGroup:{display:"flex",flexDirection:"column" as const,gap:4,marginBottom:10}, formLabel:{fontSize:10,color:"#888"}, formInput:{width:"100%",fontSize:12,padding:"8px 10px",borderRadius:8,border:"0.5px solid rgba(0,0,0,0.15)",background:"#fff",color:"#1e1e1e"}, saveBtn:{background:"#1fae5b",color:"#fff",border:"none",padding:"6px 14px",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:500}, sectionTitle:{fontSize:11,fontWeight:600,color:"#555",textTransform:"uppercase" as const,letterSpacing:"0.05em",padding:"10px 0 6px",borderBottom:"0.5px solid rgba(0,0,0,0.06)",marginBottom:10} }
  return (
    <><DeclineConfirmationModal isOpen={showDeclineModal} onClose={()=>setShowDeclineModal(false)} onConfirm={(r)=>{if(editedRow)setEditedRow(handleApprovalChange(editedRow,"Declined",r))}} influencerName={editedRow.full_name||editedRow.handle||"this influencer"}/><div style={S.overlay} onClick={onClose}/><div style={S.panel}>
      <div style={S.header}><div style={{fontSize:15,fontWeight:600,color:"#1e1e1e",marginBottom:12}}>Influencer Profile</div><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}><div style={S.avatar}>{editedRow.first_name?editedRow.first_name[0]:editedRow.handle[1]?.toUpperCase()}</div><div style={{flex:1}}><div style={S.name}>{editedRow.full_name||editedRow.first_name||""}</div><div style={S.handle}>{editedRow.handle}</div></div><div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"flex-start"}}><div style={{display:"flex",flexDirection:"column",gap:2}}><span style={{fontSize:10,color:"#888"}}>Pipeline</span><select style={S.pipeSel} value={editedRow.contact_status} onChange={e=>handleFieldChange("contact_status",e.target.value)}><option value="not_contacted">For Outreach</option><option value="contacted">In Conversation</option><option value="interested">Interested</option><option value="agreed">Agreed</option></select></div><div style={{display:"flex",flexDirection:"column",gap:2}}><span style={{fontSize:10,color:"#888"}}>Approval</span><select style={{...S.pipeSel,borderColor:editedRow.approval_status==="Approved"?"#16a34a":editedRow.approval_status==="Declined"?"#dc2626":"#f4b740",background:editedRow.approval_status==="Approved"?"#f0fdf4":editedRow.approval_status==="Declined"?"#fef2f2":"#fffbeb",color:editedRow.approval_status==="Approved"?"#166534":editedRow.approval_status==="Declined"?"#991b1b":"#854f0b"}} value={editedRow.approval_status||"Pending"} onChange={e=>handleFieldChange("approval_status",e.target.value)}><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Declined">Declined</option></select></div><button style={{background:"none",border:"none",fontSize:20,color:"#888",cursor:"pointer",alignSelf:"flex-end",paddingBottom:4}} onClick={onClose}>×</button></div></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button style={S.atagPlat}>{platformLabel}</button><button style={S.atag}>Send Email</button><button style={S.atag}>Send DM</button><button style={S.atag}>Follow up</button></div></div>
      <div style={S.tabBar}>{["Basic","Order","Post","Stats"].map((tab,idx)=><div key={idx} style={S.tab(profileTab===idx)} onClick={()=>setProfileTab(idx)}>{tab}</div>)}</div>
      <div style={S.body}>
        {profileTab===0&&(<div style={{display:"flex",flexDirection:"column",gap:14}}><div style={S.statRow}><div style={S.statBox}><div style={S.statLabel}>Followers</div><div style={S.statVal}>{formatFollowers(Number(editedRow.follower_count)||0)}</div></div><div style={S.statBox}><div style={S.statLabel}>Eng Rate</div><div style={S.statVal}>{editedRow.engagement_rate||"0"}%</div></div><div style={S.statBox}><div style={S.statLabel}>Tier</div><div style={S.statVal}>{editedRow.tier||"Bronze"}</div></div><div style={S.statBox}><div style={S.statLabel}>Rate</div><div style={{...S.statVal,color:"#1fae5b"}}>{editedRow.agreed_rate?"$"+Number(editedRow.agreed_rate).toLocaleString():"—"}</div></div></div><div style={S.fieldGrid}><div style={S.fieldRow}><div style={S.fieldLabel}>Location</div>{readOnly?<div style={S.fieldVal}>{editedRow.location||"—"}</div>:<select style={{...S.formInput,padding:"4px 8px"}} value={editedRow.location||""} onChange={e=>handleFieldChange("location",e.target.value)}><option value="">—</option>{locations.map(l=><option key={l} value={l}>{l}</option>)}</select>}</div><div style={S.fieldRow}><div style={S.fieldLabel}>Niche</div>{readOnly?<div style={S.fieldVal}>{editedRow.niche||"—"}</div>:<select style={{...S.formInput,padding:"4px 8px"}} value={editedRow.niche||""} onChange={e=>handleFieldChange("niche",e.target.value)}><option value="">—</option>{niches.map(n=><option key={n} value={n}>{n}</option>)}</select>}</div><div style={S.fieldRow}><div style={S.fieldLabel}>Gender</div>{readOnly?<div style={S.fieldVal}>{editedRow.gender||"—"}</div>:<select style={{...S.formInput,padding:"4px 8px"}} value={editedRow.gender||""} onChange={e=>handleFieldChange("gender",e.target.value)}><option value="">—</option><option>Male</option><option>Female</option><option>Non-binary</option><option>Other</option></select>}</div><div style={S.fieldRow}><div style={S.fieldLabel}>Platform</div>{readOnly?<div style={S.fieldVal}>{platformLabel}</div>:<select style={{...S.formInput,padding:"4px 8px"}} value={editedRow.platform} onChange={e=>handleFieldChange("platform",e.target.value)}><option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="youtube">YouTube</option><option value="twitter">X (Twitter)</option></select>}</div><div style={S.fieldRow}><div style={S.fieldLabel}>Email</div><div style={S.fieldVal}>{editedRow.contact_info||"—"}</div></div><div style={S.fieldRow}><div style={S.fieldLabel}>Tier</div>{readOnly?<div style={S.fieldVal}>{editedRow.tier||"Bronze"}</div>:<select style={{...S.formInput,padding:"4px 8px"}} value={editedRow.tier||"Bronze"} onChange={e=>handleFieldChange("tier",e.target.value)}><option value="Gold">🥇 Gold</option><option value="Silver">🥈 Silver</option><option value="Bronze">🥉 Bronze</option></select>}</div><div style={S.fieldRow}><div style={S.fieldLabel}>Community</div>{readOnly?<div style={S.fieldVal}>{editedRow.community_status||"Pending"}</div>:<select style={{...S.formInput,padding:"4px 8px"}} value={editedRow.community_status||"Pending"} onChange={e=>handleFieldChange("community_status",e.target.value)}><option value="Pending">Pending</option><option value="Invited">Invited</option><option value="Joined">Joined</option><option value="Not Interested">Not Interested</option><option value="Left">Left</option></select>}</div><div style={S.fieldRow}><div style={S.fieldLabel}>Social Link</div><div style={S.fieldVal}>{editedRow.social_link?<a href={normalizeUrl(editedRow.social_link)} target="_blank" rel="noopener noreferrer" style={{color:"#2C8EC4",textDecoration:"none"}}>{editedRow.social_link.replace(/^https?:\/\//,"").slice(0,30)}</a>:"—"}</div></div></div><div style={{marginTop:8}}><div style={S.fieldLabel}>Approval Notes</div>{readOnly?<div style={{fontSize:12,color:"#555",background:"#f7f9f8",borderRadius:8,padding:8,minHeight:40,marginTop:4}}>{editedRow.approval_notes||"No notes"}</div>:<textarea style={{...S.formInput,minHeight:60,resize:"vertical",marginTop:4}} value={editedRow.approval_notes||""} onChange={e=>{handleFieldChange("approval_notes",e.target.value);handleFieldChange("decline_reason",e.target.value)}} placeholder="Add approval notes..."/>}</div><div style={{marginTop:4}}><div style={S.fieldLabel}>Notes</div>{readOnly?<div style={{fontSize:12,color:"#555",background:"#f7f9f8",borderRadius:8,padding:8,minHeight:60,marginTop:4}}>{editedRow.notes||"No notes"}</div>:<textarea style={{...S.formInput,minHeight:80,resize:"vertical",marginTop:4}} value={editedRow.notes} onChange={e=>handleFieldChange("notes",e.target.value)} placeholder="Add notes..."/>}</div>{customCols.length>0&&(<div style={{marginTop:4}}><div style={S.sectionTitle}>Custom Fields</div><div style={S.fieldGrid}>{customCols.map(col=>{const val=editedRow.custom[col.field_key]||"";return(<div key={col.id} style={S.fieldRow}><div style={S.fieldLabel}>{col.field_name}</div>{readOnly?<div style={S.fieldVal}>{val||"—"}</div>:col.field_type==="boolean"?<select style={{...S.formInput,padding:"4px 8px"}} value={val} onChange={e=>handleFieldChange(`custom.${col.field_key}`,e.target.value)}><option value="No">No</option><option value="Yes">Yes</option></select>:col.field_type==="dropdown"?<select style={{...S.formInput,padding:"4px 8px"}} value={val} onChange={e=>handleFieldChange(`custom.${col.field_key}`,e.target.value)}><option value="">—</option>{col.field_options?.map(o=><option key={o} value={o}>{o}</option>)}</select>:<input style={{...S.formInput,padding:"4px 8px"}} type={col.field_type==="number"?"number":"text"} value={val} onChange={e=>handleFieldChange(`custom.${col.field_key}`,e.target.value)}/>}</div>)})}</div></div>)}{!readOnly&&<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button style={{...S.saveBtn,opacity:isSaving?0.6:1,cursor:isSaving?"not-allowed":"pointer"}} onClick={handleSave} disabled={isSaving}>{isSaving?"Saving...":"Save"}</button></div>}</div>)}
        {profileTab===1&&(<div style={{display:"flex",flexDirection:"column",gap:10}}><div style={S.formRow}><div style={S.formGroup}><div style={S.formLabel}>First name</div><input style={S.formInput} value={editedRow.first_name||""} onChange={e=>handleFieldChange("first_name",e.target.value)}/></div><div style={S.formGroup}><div style={S.formLabel}>Last name</div><input style={S.formInput} value={editedRow.full_name?.split(" ").slice(1).join(" ")||""} readOnly/></div></div><div style={S.formGroup}><div style={S.formLabel}>Email</div><input style={S.formInput} value={editedRow.contact_info||""} onChange={e=>handleFieldChange("contact_info",e.target.value)}/></div><div style={S.formGroup}><div style={S.formLabel}>Product Name</div><input style={S.formInput} value={orderData.productName} onChange={e=>setOrderData(d=>({...d,productName:e.target.value}))}/></div><div style={S.formGroup}><div style={S.formLabel}>Order Number</div><input style={S.formInput} value={orderData.orderNumber} onChange={e=>setOrderData(d=>({...d,orderNumber:e.target.value}))}/></div><div style={S.formRow}><div style={S.formGroup}><div style={S.formLabel}>Product Cost</div><input style={S.formInput} value={orderData.productCost} onChange={e=>setOrderData(d=>({...d,productCost:e.target.value}))}/></div><div style={S.formGroup}><div style={S.formLabel}>Discount Code</div><input style={S.formInput} value={orderData.discountCode} onChange={e=>setOrderData(d=>({...d,discountCode:e.target.value}))}/></div></div><div style={S.formGroup}><div style={S.formLabel}>Affiliate Link</div><input style={S.formInput} value={orderData.affiliateLink} onChange={e=>setOrderData(d=>({...d,affiliateLink:e.target.value}))}/></div><div style={S.formGroup}><div style={S.formLabel}>Shipping Address</div><input style={S.formInput} value={orderData.shippingAddress} onChange={e=>setOrderData(d=>({...d,shippingAddress:e.target.value}))}/></div><div style={S.formGroup}><div style={S.formLabel}>Tracking Link</div><input style={S.formInput} value={orderData.trackingLink} onChange={e=>setOrderData(d=>({...d,trackingLink:e.target.value}))}/></div><div style={{display:"flex",justifyContent:"flex-end"}}><button style={{...S.saveBtn,opacity:isSaving?0.6:1,cursor:isSaving?"not-allowed":"pointer"}} onClick={handleSave} disabled={isSaving}>{isSaving?"Saving...":"Save"}</button></div></div>)}
        {profileTab===2&&(<div style={{display:"flex",flexDirection:"column",gap:10}}><div style={S.formRow}><div style={S.formGroup}><div style={S.formLabel}>Post Link</div><input style={S.formInput} value={postData.postLink} onChange={e=>setPostData(d=>({...d,postLink:e.target.value}))}/></div><div style={S.formGroup}><div style={S.formLabel}>Likes</div><input style={S.formInput} value={postData.likes} onChange={e=>setPostData(d=>({...d,likes:e.target.value}))}/></div></div><div style={S.formRow}><div style={S.formGroup}><div style={S.formLabel}>Sales</div><input style={S.formInput} value={postData.sales} onChange={e=>setPostData(d=>({...d,sales:e.target.value}))}/></div><div style={S.formGroup}><div style={S.formLabel}>Drive Link</div><input style={S.formInput} value={postData.driveLink} onChange={e=>setPostData(d=>({...d,driveLink:e.target.value}))}/></div></div><div style={S.formRow}><div style={S.formGroup}><div style={S.formLabel}>Comments</div><input style={S.formInput} value={postData.comments} onChange={e=>setPostData(d=>({...d,comments:e.target.value}))}/></div><div style={S.formGroup}><div style={S.formLabel}>Amount ($)</div><input style={S.formInput} value={postData.amount} onChange={e=>setPostData(d=>({...d,amount:e.target.value}))}/></div></div><div style={S.formRow}><div style={S.formGroup}><div style={S.formLabel}>Usage Rights</div><select style={S.formInput} value={postData.usageRights} onChange={e=>setPostData(d=>({...d,usageRights:e.target.value}))}><option value="">Select...</option><option>Granted</option><option>Not Granted</option><option>Pending</option></select></div><div style={S.formGroup}><div style={S.formLabel}>Views</div><input style={S.formInput} value={postData.views} onChange={e=>setPostData(d=>({...d,views:e.target.value}))}/></div></div><div style={S.formRow}><div style={S.formGroup}><div style={S.formLabel}>Clicks</div><input style={S.formInput} value={postData.clicks} onChange={e=>setPostData(d=>({...d,clicks:e.target.value}))}/></div><div style={S.formGroup}><div style={S.formLabel}>CVR (auto)</div><input style={{...S.formInput,background:"#f7f9f8",color:"#2C8EC4"}} readOnly value={postCVR}/></div></div><div style={{display:"flex",justifyContent:"flex-end"}}><button style={{...S.saveBtn,opacity:isSaving?0.6:1,cursor:isSaving?"not-allowed":"pointer"}} onClick={handleSave} disabled={isSaving}>{isSaving?"Saving...":"Save"}</button></div></div>)}
        {profileTab===3&&(<div style={{display:"flex",flexDirection:"column",gap:0}}><div style={S.sectionTitle}>Performance</div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}><div style={{background:"#f7f9f8",borderRadius:8,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:16,fontWeight:600,color:"#1e1e1e"}}>{formatFollowers(Number(editedRow.follower_count)||0)}</div><div style={{fontSize:10,color:"#888",marginTop:2}}>Followers</div></div><div style={{background:"#f7f9f8",borderRadius:8,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:16,fontWeight:600,color:"#2c8ec4"}}>{editedRow.engagement_rate||0}%</div><div style={{fontSize:10,color:"#888",marginTop:2}}>Eng. Rate</div></div><div style={{background:"#f7f9f8",borderRadius:8,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:16,fontWeight:600,color:"#1fae5b"}}>{editedRow.agreed_rate?"$"+Number(editedRow.agreed_rate).toLocaleString():"—"}</div><div style={{fontSize:10,color:"#888",marginTop:2}}>Agreed Rate</div></div></div><div style={S.sectionTitle}>Status</div><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}><div style={{background:"#f7f9f8",borderRadius:8,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:600}}>{editedRow.tier||"Bronze"}</div><div style={{fontSize:10,color:"#888",marginTop:2}}>Tier</div></div><div style={{background:"#f7f9f8",borderRadius:8,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:600,color:editedRow.approval_status==="Approved"?"#1fae5b":editedRow.approval_status==="Declined"?"#e24b4a":"#854f0b"}}>{editedRow.approval_status||"Pending"}</div><div style={{fontSize:10,color:"#888",marginTop:2}}>Approval</div></div><div style={{background:"#f7f9f8",borderRadius:8,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:600}}>{STATUS_LABEL[editedRow.contact_status]||editedRow.contact_status}</div><div style={{fontSize:10,color:"#888",marginTop:2}}>Pipeline</div></div></div><div style={S.sectionTitle}>Outreach</div><div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}><div style={{background:"#f7f9f8",borderRadius:8,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:600}}>Stage {editedRow.stage||1}/5</div><div style={{fontSize:10,color:"#888",marginTop:2}}>Outreach Stage</div></div><div style={{background:"#f7f9f8",borderRadius:8,padding:"10px 12px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:600}}>{editedRow.community_status||"Pending"}</div><div style={{fontSize:10,color:"#888",marginTop:2}}>Community</div></div></div>{editedRow.transferred_date&&(<div style={{background:"#e6f9ee",borderRadius:8,padding:10,marginTop:12,fontSize:11,color:"#166534"}}><strong>Transferred:</strong> {new Date(editedRow.transferred_date).toLocaleDateString()}</div>)}</div>)}
      </div>
    </div></>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════════════════════ */
const MOCK_ROWS: InfluencerRow[] = [
  { id:"mock-1", handle:"@prettyliv", platform:"instagram", full_name:"Liv Santos", email:"liv@example.com", follower_count:"245000", engagement_rate:"3.2", niche:"Beauty", contact_status:"contacted", stage:"2", agreed_rate:"500", notes:"Very responsive.", custom:{}, gender:"Female", location:"United States", social_link:"https://instagram.com/prettyliv", first_name:"Olivia", contact_info:"liv@example.com", approval_status:"Pending", transferred_date:"", approval_notes:"", decline_reason:"", tier:"Gold", community_status:"Invited" },
  { id:"mock-2", handle:"@fitwithjay", platform:"tiktok", full_name:"Jay Kim", email:"jay@example.com", follower_count:"890000", engagement_rate:"5.8", niche:"Fitness", contact_status:"interested", stage:"3", agreed_rate:"1200", notes:"Discussing deliverables", custom:{}, gender:"Male", location:"Singapore", social_link:"https://tiktok.com/@fitwithjay", first_name:"Jay", contact_info:"jay@example.com", approval_status:"Approved", transferred_date:"2024-03-15", approval_notes:"Approved for Q1", decline_reason:"", tier:"Gold", community_status:"Joined" },
  { id:"mock-3", handle:"@travelwithmar", platform:"youtube", full_name:"Marco Reyes", email:"marco@example.com", follower_count:"1200000", engagement_rate:"2.1", niche:"Travel", contact_status:"agreed", stage:"4", agreed_rate:"2500", notes:"Contract signed", custom:{}, gender:"Male", location:"Philippines", social_link:"https://youtube.com/@travelwithmar", first_name:"Marco", contact_info:"marco@example.com", approval_status:"Declined", transferred_date:"", approval_notes:"Budget constraints", decline_reason:"Budget constraints", tier:"Silver", community_status:"Not Interested" },
]

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN TABLE SHEET
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function TableSheet({ initialRows = MOCK_ROWS, initialCustomColumns = [], onRowsChange, onCustomColumnsChange, readOnly = false, brandId }: { initialRows?: InfluencerRow[]; initialCustomColumns?: CustomColumn[]; onRowsChange?: (rows: InfluencerRow[]) => void; onCustomColumnsChange?: (cols: CustomColumn[]) => void; readOnly?: boolean; brandId?: string }) {
  const [rows, setRows] = useState<InfluencerRow[]>(initialRows)
  const [customCols, setCustomCols] = useState<CustomColumn[]>(initialCustomColumns)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
  const [newColGroup, setNewColGroup] = useState<"Influencer Details"|"Approval Details"|"Outreach Details">("Influencer Details")
  const [newColOpts, setNewColOpts] = useState("")
  const [colOrder, setColOrder] = useState<number[]|null>(null)
  const [dragIdx, setDragIdx] = useState<number|null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number|null>(null)
  const [dragOverGroup, setDragOverGroup] = useState<string|null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilterPopover, setShowFilterPopover] = useState(false)
  const [filters, setFilters] = useState<FilterState>({ tier:"all", platform:"all", niche:"all", location:"all", community:"all" })
  const [showAddRowsModal, setShowAddRowsModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [pendingDeclineRowIdx, setPendingDeclineRowIdx] = useState<number|null>(null)
  const [selectedRowId, setSelectedRowId] = useState<string|null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set())
  const [showImportExportMenu, setShowImportExportMenu] = useState(false)
  const [sidebarRowId, setSidebarRowId] = useState<string|null>(null)
  const [nicheOptions, setNicheOptions] = useState<string[]>(DEFAULT_NICHES)
  const [locationOptions, setLocationOptions] = useState<string[]>(DEFAULT_LOCATIONS)
  const [showManageNiches, setShowManageNiches] = useState(false)
  const [showManageLocations, setShowManageLocations] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{isOpen:boolean;title:string;message:ReactNode;onConfirm:()=>void;variant:"danger"|"warning"|"info"}>({isOpen:false,title:"",message:"",onConfirm:()=>{},variant:"danger"})

  // ★ API auto-fetch state
  const [fetchingRows, setFetchingRows] = useState<Set<string>>(new Set())
  const [duplicateRowIds, setDuplicateRowIds] = useState<Set<string>>(new Set())
  const [pendingDuplicateInfo, setPendingDuplicateInfo] = useState<{ rowId: string; handle: string; existingName: string } | null>(null)
  const commitGuardRef = useRef(false)

  // ★ Toast notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([])
  const addToast = useCallback((type: ToastNotification["type"], message: string) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])
  const dismissToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), [])

  const editInputRef = useRef<HTMLInputElement|HTMLSelectElement|null>(null)
  const newColInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tabPendingRef = useRef(false)
  const filterBtnRef = useRef<HTMLButtonElement>(null)
  const importExportBtnRef = useRef<HTMLButtonElement>(null)
  const importExportRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (!showImportExportMenu) return; const h = (e: MouseEvent) => { if (importExportRef.current && !importExportRef.current.contains(e.target as Node) && importExportBtnRef.current && !importExportBtnRef.current.contains(e.target as Node)) setShowImportExportMenu(false) }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h) }, [showImportExportMenu])

  const getEffectiveGroup = useCallback((cc: CustomColumn) => cc.assignedGroup, [])
  const STATIC_COLS = getStaticCols(nicheOptions, locationOptions)
  const rawCols: AnyColDef[] = [...STATIC_COLS, ...customCols.map<CustomColDef>(c => ({ key:`custom.${c.field_key}`, label:c.field_name, group:getEffectiveGroup(c), minWidth:c.field_type==="date"?160:c.field_type==="boolean"?100:140, type:c.field_type, options:c.field_options, isCustom:true, customId:c.id, fieldKey:c.field_key, assignedGroup:c.assignedGroup }))]
  useEffect(() => { setColOrder(prev => (!prev||prev.length!==rawCols.length)?rawCols.map((_,i)=>i):prev) }, [rawCols.length])
  const order = colOrder&&colOrder.length===rawCols.length ? colOrder : rawCols.map((_,i)=>i)
  const allCols = order.map(i=>rawCols[i])
  const totalCols = allCols.length

  const filteredRows = rows.filter(row => {
    if (searchQuery.trim()) { const q=searchQuery.toLowerCase(); if (!(row.handle.toLowerCase().includes(q)||row.full_name.toLowerCase().includes(q)||row.email.toLowerCase().includes(q)||row.niche.toLowerCase().includes(q)||row.notes.toLowerCase().includes(q)||(row.first_name&&row.first_name.toLowerCase().includes(q))||(row.location&&row.location.toLowerCase().includes(q)))) return false }
    if (filters.tier!=="all"&&row.tier!==filters.tier) return false
    if (filters.platform!=="all") { const pm:Record<string,string>={"Instagram":"instagram","YouTube":"youtube","TikTok":"tiktok","X (Twitter)":"twitter"}; if(pm[filters.platform]!==row.platform) return false }
    if (filters.niche!=="all"&&row.niche!==filters.niche) return false
    if (filters.location!=="all"&&row.location!==filters.location) return false
    if (filters.community!=="all"&&row.community_status!==filters.community) return false
    return true
  })

  const totalRows=filteredRows.length; const totalPages=Math.max(1,Math.ceil(totalRows/rowsPerPage)); const pageStart=(currentPage-1)*rowsPerPage; const pageEnd=Math.min(pageStart+rowsPerPage,totalRows); const pageRows=filteredRows.slice(pageStart,pageEnd)
  useEffect(() => { const mx=Math.max(1,Math.ceil(filteredRows.length/rowsPerPage)); if(currentPage>mx)setCurrentPage(mx) }, [filteredRows.length,rowsPerPage,currentPage])
  const sidebarRow = rows.find(r=>r.id===sidebarRowId)||null

  const handleRowSelect = (id: string, e?: React.MouseEvent) => { if (e?.ctrlKey||e?.metaKey) { setSelectedRowIds(prev=>{const n=new Set(prev);if(n.has(id))n.delete(id);else n.add(id);return n}); setSelectedRowId(id) } else if (e?.shiftKey&&selectedRowId) { const ci=filteredRows.findIndex(r=>r.id===selectedRowId); const ti=filteredRows.findIndex(r=>r.id===id); if(ci!==-1&&ti!==-1){const s=Math.min(ci,ti);const e2=Math.max(ci,ti);setSelectedRowIds(new Set(filteredRows.slice(s,e2+1).map(r=>r.id)))}; setSelectedRowId(id) } else { setSelectedRowId(id); setSelectedRowIds(new Set([id])) } }
  const handleRowDoubleClick = (id: string) => { setSidebarRowId(id) }
  const handleUpdateRow = (r: InfluencerRow) => { setRows(prev=>{const n=prev.map(x=>x.id===r.id?r:x);onRowsChange?.(n);return n}) }
  const handleApplyFilters = (nf: FilterState) => { setFilters(nf); setCurrentPage(1) }
  const handleClearFilters = () => { setFilters({tier:"all",platform:"all",niche:"all",location:"all",community:"all"}); setCurrentPage(1) }

  /* ═══════════════════════════════════════════════════════════════════════════
     ★ AUTO-FETCH with DUPLICATE CHECK
     ═══════════════════════════════════════════════════════════════════════════ */
  const autoFetchInfluencer = useCallback(async (rowId: string, handle: string, platform: string) => {
    const clean = handle.trim().replace(/^@/, "").toLowerCase()
    if (!clean || clean.length < 2) return
    if (platform !== "instagram" && platform !== "tiktok") return

    // ★ DUPLICATE CHECK — show popup and gray out the row
    const duplicate = rows.find(r => r.id !== rowId && r.handle.replace(/^@/, "").toLowerCase() === clean)
    if (duplicate) {
      setPendingDuplicateInfo({ rowId, handle: clean, existingName: duplicate.full_name || duplicate.handle })
      setDuplicateRowIds(prev => { const n = new Set(prev); n.add(rowId); return n })
      return
    }

    // Clear duplicate status if previously marked
    setDuplicateRowIds(prev => { if (!prev.has(rowId)) return prev; const n = new Set(prev); n.delete(rowId); return n })

    setFetchingRows(prev => { const n = new Set(prev); n.add(rowId); return n })
    try {
      const data = await fetchInfluencerFromAPI(handle, platform)
      if (!data) { addToast("error", `@${clean} not found on ${platform}`); return }

      setRows(prev => {
        const next = prev.map(row => {
          if (row.id !== rowId) return row
          const u = { ...row }
          if (!u.full_name && data.full_name) u.full_name = data.full_name
          if (!u.first_name && data.first_name) u.first_name = data.first_name
          if (!u.follower_count && data.follower_count && data.follower_count !== "0") u.follower_count = data.follower_count
          if (!u.engagement_rate && data.engagement_rate && data.engagement_rate !== "0") u.engagement_rate = data.engagement_rate
          if (!u.email && data.email) u.email = data.email
          if (!u.contact_info && data.contact_info) u.contact_info = data.contact_info
          if (!u.social_link && data.social_link) u.social_link = data.social_link
          if (!u.location && data.location) u.location = data.location
          if (!u.niche && data.niche) u.niche = data.niche
          if (!u.gender && data.gender) u.gender = data.gender
          return u
        })
        onRowsChange?.(next); return next
      })
    } catch (err) { console.error("Auto-fetch failed:", err) }
    finally { setFetchingRows(prev => { const n = new Set(prev); n.delete(rowId); return n }) }
  }, [onRowsChange, rows, addToast])

  // (debounce removed — fetch fires directly on commit)

  const handleAddMultipleRows = (count: number) => { const nr:InfluencerRow[]=[];for(let i=0;i<count;i++)nr.push(newEmptyRow(customCols)); setRows(prev=>{let n:InfluencerRow[];if(selectedRowIds.size>0){const si=filteredRows.map((r,i)=>selectedRowIds.has(r.id)?i:-1).filter(i=>i!==-1);const li=Math.max(...si);const lid=filteredRows[li].id;const ii=prev.findIndex(r=>r.id===lid)+1;n=[...prev.slice(0,ii),...nr,...prev.slice(ii)]}else{n=[...prev,...nr]};onRowsChange?.(n);return n}); setCurrentPage(Math.ceil((rows.length+count)/rowsPerPage)); containerRef.current?.focus() }
  const addRow = () => { const r=newEmptyRow(customCols); setRows(prev=>{const n=[...prev,r];onRowsChange?.(n);return n}); setCurrentPage(Math.ceil((rows.length+1)/rowsPerPage)); setActiveCell({rowIdx:rows.length,colIdx:0}); containerRef.current?.focus() }
  const deleteRow = (id: string) => { const r=rows.find(x=>x.id===id); setConfirmDialog({isOpen:true,title:"Delete Row",message:<span>Delete <strong>{r?.full_name||r?.handle||"this row"}</strong>?</span>,onConfirm:()=>{setRows(prev=>{const n=prev.filter(x=>x.id!==id);onRowsChange?.(n);return n});if(selectedRowId===id)setSelectedRowId(null);if(sidebarRowId===id)setSidebarRowId(null);setSelectedRowIds(prev=>{const n=new Set(prev);n.delete(id);return n})},variant:"danger"}) }
  const deleteSelectedRows = () => { if(!selectedRowIds.size)return; setConfirmDialog({isOpen:true,title:"Delete Selected Rows",message:<span>Delete <strong>{selectedRowIds.size} rows</strong>?</span>,onConfirm:()=>{setRows(prev=>{const n=prev.filter(r=>!selectedRowIds.has(r.id));onRowsChange?.(n);return n});setSelectedRowId(null);setSelectedRowIds(new Set());if(sidebarRowId&&selectedRowIds.has(sidebarRowId))setSidebarRowId(null)},variant:"danger"}) }
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => { const f=e.target.files?.[0]; if(!f)return; const r=new FileReader(); r.onload=(ev)=>{const t=ev.target?.result as string;if(!t)return;const im=importFromCSV(t,customCols);if(!im.length){alert("No valid rows");return};setRows(prev=>{const n=[...prev,...im];onRowsChange?.(n);return n});setCurrentPage(1)}; r.readAsText(f); e.target.value=""; setShowImportExportMenu(false) }

  const onColDragStart=(vi:number,e:DragEvent)=>{setDragIdx(vi);e.dataTransfer.effectAllowed="move";e.dataTransfer.setDragImage(e.currentTarget as HTMLElement,40,18)}
  const onColDragOver=(vi:number,e:DragEvent)=>{e.preventDefault();e.dataTransfer.dropEffect="move";setDragOverIdx(vi);const tc=allCols[vi];if(tc&&(tc.group==="Influencer Details"||tc.group==="Approval Details"||tc.group==="Outreach Details"))setDragOverGroup(tc.group);else setDragOverGroup(null)}
  const onColDragEnd=()=>{if(dragIdx!==null&&dragOverIdx!==null&&dragIdx!==dragOverIdx){const dc=allCols[dragIdx];if(dc.isCustom&&dragOverGroup&&(dragOverGroup==="Influencer Details"||dragOverGroup==="Approval Details"||dragOverGroup==="Outreach Details")){const fk=(dc as CustomColDef).fieldKey;setCustomCols(prev=>{const n=prev.map(c=>c.field_key===fk?{...c,assignedGroup:dragOverGroup as any}:c);onCustomColumnsChange?.(n);return n})};setColOrder(prev=>{const a=[...(prev??rawCols.map((_,i)=>i))];const[m]=a.splice(dragIdx,1);a.splice(dragOverIdx!,0,m);return a})};setDragIdx(null);setDragOverIdx(null);setDragOverGroup(null)}

  const getCellValue = useCallback((row: InfluencerRow, key: string): string => { if(key.startsWith("custom."))return row.custom[key.slice(7)]??""; return String((row as Record<string,unknown>)[key]??"") }, [])
  const isOutreachField = useCallback((colKey: string): boolean => { if(colKey.startsWith("custom.")){const fk=colKey.slice(7);const cc=customCols.find(c=>c.field_key===fk);return cc?.assignedGroup==="Outreach Details"}; return OUTREACH_FIELDS.has(colKey) }, [customCols])

  const handleDeclineConfirm = (reason: string) => { if(pendingDeclineRowIdx===null)return; const ar=filteredRows[pendingDeclineRowIdx]; const ai=rows.findIndex(r=>r.id===ar.id); if(ai===-1)return; setRows(prev=>{const n=[...prev];n[ai]=handleApprovalChange(prev[ai],"Declined",reason);onRowsChange?.(n);return n}); setShowDeclineModal(false); setPendingDeclineRowIdx(null); containerRef.current?.focus() }

  /* ═══════════════════════════════════════════════════════════════════════════
     ★ APPLY CELL VALUE — auto-fetches on handle/platform commit
     ═══════════════════════════════════════════════════════════════════════════ */
  const applyCellValue = useCallback((rowIdx: number, colKey: string, value: string) => {
    const actualRow = filteredRows[rowIdx]; const actualRowIdx = rows.findIndex(r=>r.id===actualRow.id); if(actualRowIdx===-1)return;
    if (actualRow.approval_status==="Declined"&&isOutreachField(colKey)) return;
    if (colKey==="approval_status"&&value==="Declined") { setPendingDeclineRowIdx(rowIdx); setShowDeclineModal(true); return; }

    // ★ Capture fetch info BEFORE setRows (so we know what to fetch after state updates)
    const currentRow = rows[actualRowIdx];
    let shouldFetch = false;
    let fetchRowId = currentRow.id;
    let fetchHandle = "";
    let fetchPlatform = "";

    if (colKey === "handle" && value && value !== "@") {
      shouldFetch = true;
      fetchHandle = value;
      fetchPlatform = currentRow.platform;
    }
    if (colKey === "platform" && currentRow.handle && currentRow.handle !== "@") {
      shouldFetch = true;
      fetchHandle = currentRow.handle;
      fetchPlatform = value;
    }

    setRows(prev=>{
      const next=[...prev]; let row={...next[actualRowIdx]};
      if(colKey==="approval_status") { row=handleApprovalChange(row,value); }
      else if(colKey.startsWith("custom.")) { row.custom={...row.custom,[colKey.slice(7)]:value}; }
      else { (row as Record<string,unknown>)[colKey]=value; }

      if(colKey==="handle"||colKey==="platform"){
        const nH=colKey==="handle"?value:row.handle; const nP=colKey==="platform"?value:row.platform;
        const oU=getProfileUrl(colKey==="platform"?prev[actualRowIdx].platform:row.platform,colKey==="handle"?prev[actualRowIdx].handle:row.handle);
        const fU=getProfileUrl(nP,nH); const cL=row.social_link??"";
        if(!cL||cL===oU) { row.social_link=fU; }
        const uk=customCols.filter(c=>c.field_type==="url").map(c=>c.field_key);
        if(uk.length){row.custom={...row.custom};uk.forEach(fk=>{const c=row.custom[fk]??"";if(!c||c===oU){row.custom[fk]=fU;}});}
      }

      if(colKey==="niche"&&value&&!nicheOptions.includes(value)) { setNicheOptions(p=>[...p,value]); }
      if(colKey==="location"&&value&&!locationOptions.includes(value)) { setLocationOptions(p=>[...p,value]); }
      next[actualRowIdx]=row; onRowsChange?.(next); return next;
    })

    // ★ Fire fetch DIRECTLY after commit — no debounce needed
    if (shouldFetch) {
      autoFetchInfluencer(fetchRowId, fetchHandle, fetchPlatform);
    }
  }, [onRowsChange,customCols,filteredRows,rows,isOutreachField,nicheOptions,locationOptions,autoFetchInfluencer])

  const addOptionToCol = useCallback((fk:string,no:string) => { setCustomCols(prev=>{const n=prev.map(c=>c.field_key!==fk?c:{...c,field_options:[...(c.field_options??[]),no]});onCustomColumnsChange?.(n);return n}) }, [onCustomColumnsChange])

  const startEdit = useCallback((ri:number,ci:number) => {
    if(readOnly)return; const col=allCols[ci]; const row=filteredRows[ri]
    if(row.approval_status==="Declined"&&isOutreachField(col.key))return
    if(col.type==="boolean"){applyCellValue(ri,col.key,getCellValue(row,col.key)==="Yes"?"No":"Yes");setActiveCell({rowIdx:ri,colIdx:ci});return}
    if(col.key==="platform"||col.key==="niche"||col.key==="location"||col.type==="dropdown"||col.type==="multi-select"||col.type==="date"){setActiveCell({rowIdx:ri,colIdx:ci});setEditCell(null);setPopupCell({rowIdx:ri,colIdx:ci});return}
    if(col.type==="select"&&col.key!=="contact_status"&&col.key!=="approval_status"){setActiveCell({rowIdx:ri,colIdx:ci});setEditCell(null);setPopupCell({rowIdx:ri,colIdx:ci});return}
    setActiveCell({rowIdx:ri,colIdx:ci});setPopupCell(null);setEditCell({rowIdx:ri,colIdx:ci});setEditValue(getCellValue(row,col.key))
  }, [allCols,getCellValue,readOnly,filteredRows,applyCellValue,isOutreachField])

  const commitEdit = useCallback(() => {
    if (!editCell || commitGuardRef.current) return;
    commitGuardRef.current = true;
    applyCellValue(editCell.rowIdx, allCols[editCell.colIdx].key, editValue);
    setEditCell(null);
    setTimeout(() => { commitGuardRef.current = false; }, 50);
  }, [editCell, editValue, allCols, applyCellValue])
  const cancelEdit = useCallback(() => { setEditCell(null);setPopupCell(null) }, [])

  useEffect(() => { if(!editCell)return; requestAnimationFrame(()=>{const el=editInputRef.current;if(!el)return;el.focus();if(el instanceof HTMLInputElement)el.select()}) }, [editCell])
  useEffect(() => { if(addingCol)newColInputRef.current?.focus() }, [addingCol])

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement|HTMLSelectElement>) => {
    if(e.key==="Enter"){e.preventDefault();commitEdit();if(activeCell&&activeCell.rowIdx<pageEnd-1)setActiveCell({rowIdx:activeCell.rowIdx+1,colIdx:activeCell.colIdx});containerRef.current?.focus()}
    else if(e.key==="Escape"){cancelEdit();containerRef.current?.focus()}
    else if(e.key==="Tab"){e.preventDefault();tabPendingRef.current=true;commitEdit();if(activeCell){const nc=e.shiftKey?Math.max(0,activeCell.colIdx-1):Math.min(totalCols-1,activeCell.colIdx+1);const n={rowIdx:activeCell.rowIdx,colIdx:nc};setActiveCell(n);setTimeout(()=>{startEdit(n.rowIdx,n.colIdx);tabPendingRef.current=false},0)}}
  }
  const handleEditBlur = () => { if(tabPendingRef.current)return; commitEdit() }
  const handleContainerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => { if(editCell||popupCell||!activeCell)return; const{rowIdx:ri,colIdx:ci}=activeCell; switch(e.key){case"ArrowUp":e.preventDefault();if(ri>pageStart)setActiveCell({rowIdx:ri-1,colIdx:ci});break;case"ArrowDown":e.preventDefault();if(ri<pageEnd-1)setActiveCell({rowIdx:ri+1,colIdx:ci});break;case"ArrowLeft":e.preventDefault();if(ci>0)setActiveCell({rowIdx:ri,colIdx:ci-1});break;case"ArrowRight":e.preventDefault();if(ci<totalCols-1)setActiveCell({rowIdx:ri,colIdx:ci+1});break;case"Tab":e.preventDefault();setActiveCell({rowIdx:ri,colIdx:e.shiftKey?Math.max(0,ci-1):Math.min(totalCols-1,ci+1)});break;case"Enter":case"F2":e.preventDefault();startEdit(ri,ci);break;case"Delete":case"Backspace":e.preventDefault();applyCellValue(ri,allCols[ci].key,"");break} }

  const confirmAddCol = () => { const name=newColName.trim();if(!name)return; const fk=name.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,""); const ho=newColType==="dropdown"||newColType==="multi-select"; const col:CustomColumn={id:crypto.randomUUID(),field_key:fk,field_name:name,field_type:newColType,field_options:ho?newColOpts.split(",").map(s=>s.trim()).filter(Boolean):undefined,assignedGroup:newColGroup,description:newColDescription.trim()||undefined}; setCustomCols(prev=>{const n=[...prev,col];onCustomColumnsChange?.(n);return n}); setRows(prev=>prev.map(r=>{let dv="";if(newColType==="boolean")dv="No";else if(newColType==="url")dv=getProfileUrl(r.platform,r.handle);return{...r,custom:{...r.custom,[fk]:dv}}})); setNewColName("");setNewColDescription("");setNewColType("text");setNewColGroup("Influencer Details");setNewColOpts("");setAddingCol(false);containerRef.current?.focus() }
  const deleteCustomCol = (fk: string) => { setConfirmDialog({isOpen:true,title:"Delete Custom Column",message:"Delete this column? All data will be lost.",onConfirm:()=>{setCustomCols(prev=>{const n=prev.filter(c=>c.field_key!==fk);onCustomColumnsChange?.(n);return n});setRows(prev=>prev.map(r=>{const custom={...r.custom};delete custom[fk];return{...r,custom}}));setActiveCell(null);setEditCell(null);setPopupCell(null)},variant:"danger"}) }

  const getGroupBgClass = (g: string) => { switch(g){case"Influencer Details":return"bg-blue-50 text-blue-700";case"Approval Details":return"bg-purple-50 text-purple-700";case"Outreach Details":return"bg-emerald-50 text-emerald-700";default:return"bg-gray-50 text-gray-500 border-dashed"} }
  const getColHeaderBgClass = (g: string) => { switch(g){case"Influencer Details":return"bg-blue-50/60";case"Approval Details":return"bg-purple-50/60";case"Outreach Details":return"bg-emerald-50/60";default:return"bg-gray-50/40 border-dashed"} }
  const groupSpans:{group:string;span:number}[]=[]; allCols.forEach(col=>{const l=groupSpans[groupSpans.length-1];if(l&&l.group===col.group)l.span++;else groupSpans.push({group:col.group,span:1})})
  const hasActiveFilters = filters.tier!=="all"||filters.platform!=="all"||filters.niche!=="all"||filters.location!=="all"||filters.community!=="all"

  const renderCell = (row: InfluencerRow, rowIdx: number, col: AnyColDef, colIdx: number) => {
    const isActive=activeCell?.rowIdx===rowIdx&&activeCell?.colIdx===colIdx; const isEditing=editCell?.rowIdx===rowIdx&&editCell?.colIdx===colIdx; const isPopup=popupCell?.rowIdx===rowIdx&&popupCell?.colIdx===colIdx; const value=getCellValue(row,col.key); const ringCls=isActive?"ring-2 ring-inset ring-blue-500 z-[1]":"";
    const isDuplicate = duplicateRowIds.has(row.id);
    const disabled = (row.approval_status==="Declined"&&isOutreachField(col.key)) || isDuplicate;
    if(disabled) return <td key={col.key} className={`border border-gray-200 px-2 py-1.5 text-sm bg-gray-100 text-gray-400 cursor-not-allowed`} style={{minWidth:col.minWidth}}>{col.key==="contact_status"?<StatusBadge value={value}/>:col.key==="approval_status"?<ApprovalBadge value={value}/>:<span className="block truncate text-gray-400">{value||"—"}</span>}</td>
    if(isEditing){
      if(col.type==="select"&&col.options&&col.key!=="platform"&&col.key!=="niche"&&col.key!=="location") return <td key={col.key} className={`border border-gray-200 p-0 relative ${ringCls}`} style={{minWidth:col.minWidth}}><select ref={editInputRef as any} value={editValue} onChange={e=>setEditValue(e.target.value)} onBlur={handleEditBlur} onKeyDown={handleEditKeyDown} onMouseDown={e=>e.stopPropagation()} className="w-full h-full px-2 py-1.5 text-sm outline-none bg-white appearance-none">{col.options.map(o=><option key={o} value={o}>{o||"—"}</option>)}</select></td>
      if(col.type==="url"){ const inv=editValue!==""&&!isValidUrl(editValue); return <td key={col.key} className={`border border-gray-200 p-0 relative ${ringCls}`} style={{minWidth:col.minWidth}}><input ref={editInputRef as any} type="text" value={editValue} placeholder="https://…" onChange={e=>setEditValue(e.target.value)} onBlur={handleEditBlur} onKeyDown={handleEditKeyDown} onMouseDown={e=>e.stopPropagation()} className={`w-full h-full px-2 py-1.5 text-sm outline-none bg-white ${inv?"text-red-500":"text-blue-600"}`}/>{inv&&<div className="absolute -bottom-5 left-1 text-[10px] text-red-400 whitespace-nowrap z-50">Invalid URL</div>}</td> }
      return <td key={col.key} className={`border border-gray-200 p-0 relative ${ringCls}`} style={{minWidth:col.minWidth}}><input ref={editInputRef as any} type={col.type==="number"?"number":"text"} value={editValue} onChange={e=>setEditValue(e.target.value)} onBlur={handleEditBlur} onKeyDown={handleEditKeyDown} onMouseDown={e=>e.stopPropagation()} className="w-full h-full px-2 py-1.5 text-sm outline-none bg-white"/></td>
    }
    if(isPopup){ const closeP=()=>{setPopupCell(null);containerRef.current?.focus()}
      if(col.key==="platform") return <td key={col.key} className={`border border-gray-200 px-2 py-1.5 text-sm relative ${ringCls}`} style={{minWidth:col.minWidth}}><div className="flex items-center justify-center"><PlatformIcon platform={value} size={20}/></div><PlatformEditor value={value} onChange={v=>applyCellValue(rowIdx,col.key,v)} onClose={closeP}/></td>
      if(col.key==="niche") return <td key={col.key} className={`border border-gray-200 px-2 py-1.5 text-sm relative ${ringCls}`} style={{minWidth:col.minWidth}}>{value?<span className="inline-block px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium truncate max-w-full">{value}</span>:<span className="text-gray-300">—</span>}<DropdownEditor value={value} options={nicheOptions} onChange={v=>applyCellValue(rowIdx,col.key,v)} onClose={closeP} onAddOption={v=>setNicheOptions(p=>[...p,v])}/></td>
      if(col.key==="location") return <td key={col.key} className={`border border-gray-200 px-2 py-1.5 text-sm relative ${ringCls}`} style={{minWidth:col.minWidth}}>{value?<span className="truncate block text-sm">{value}</span>:<span className="text-gray-300">—</span>}<DropdownEditor value={value} options={locationOptions} onChange={v=>applyCellValue(rowIdx,col.key,v)} onClose={closeP} onAddOption={v=>setLocationOptions(p=>[...p,v])}/></td>
      if(col.type==="dropdown"&&col.isCustom) return <td key={col.key} className={`border border-gray-200 px-2 py-1.5 text-sm relative ${ringCls}`} style={{minWidth:col.minWidth}}>{value?<span className="inline-block px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium truncate max-w-full">{value}</span>:<span className="text-gray-300">—</span>}<DropdownEditor value={value} options={col.options??[]} onChange={v=>applyCellValue(rowIdx,col.key,v)} onClose={closeP} onAddOption={o=>addOptionToCol((col as CustomColDef).fieldKey,o)}/></td>
      if(col.type==="multi-select"&&col.isCustom) return <td key={col.key} className={`border border-gray-200 px-2 py-1.5 text-sm relative ${ringCls}`} style={{minWidth:col.minWidth}}><MultiSelectDisplay value={value}/><MultiSelectEditor value={value} options={col.options??[]} onChange={v=>applyCellValue(rowIdx,col.key,v)} onClose={closeP} onAddOption={o=>addOptionToCol((col as CustomColDef).fieldKey,o)}/></td>
      if(col.type==="date"){const disp=value?new Date(value+"T00:00:00").toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}):"";return <td key={col.key} className={`border border-gray-200 px-2 py-1.5 text-sm relative ${ringCls}`} style={{minWidth:col.minWidth}}><div className="flex items-center gap-1.5"><IconCalendar size={14} className="text-blue-500 flex-shrink-0"/><span>{disp||<span className="text-gray-300">Pick a date</span>}</span></div><DatePicker value={value} onChange={v=>applyCellValue(rowIdx,col.key,v)} onClose={closeP}/></td>}
    }
    const tdCls=`border border-gray-200 px-2 py-1.5 text-sm cursor-cell select-none relative hover:bg-blue-50/20 ${ringCls}`; const onClick=()=>startEdit(rowIdx,colIdx); const onFocus=()=>setActiveCell({rowIdx,colIdx})
    if(col.key==="platform") return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}><div className="flex items-center justify-center"><PlatformIcon platform={value} size={20}/></div></td>
    if(col.type==="boolean"){const y=value==="Yes";return <td key={col.key} className={`${tdCls} cursor-pointer`} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}><span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${y?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>{y?"Yes":"No"}</span></td>}
    if(col.type==="multi-select") return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}><MultiSelectDisplay value={value}/></td>
    if(col.type==="date"){const disp=value?new Date(value+"T00:00:00").toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}):"";return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}><div className="flex items-center gap-1.5"><IconCalendar size={14} className="text-gray-400 flex-shrink-0"/><span className="truncate">{disp||<span className="text-gray-300">—</span>}</span></div></td>}
    if(col.type==="url"){const valid=isValidUrl(value);return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}>{value?(valid?<a href={normalizeUrl(value)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center justify-center"><IconExternalLink size={16}/></a>:<span className="text-red-400 truncate block">{value}</span>):<span className="text-gray-300">—</span>}</td>}
    if(col.type==="dropdown") return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}>{value?<span className="inline-block px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium truncate max-w-full">{value}</span>:<span className="text-gray-300">—</span>}</td>
    if(col.key==="niche") return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}>{value?<span className="inline-block px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium truncate max-w-full">{value}</span>:<span className="text-gray-300">—</span>}</td>
    if(col.key==="approval_status") return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}><ApprovalBadge value={value}/></td>
    return <td key={col.key} className={tdCls} style={{minWidth:col.minWidth}} onClick={onClick} onFocus={onFocus}>{col.key==="contact_status"?<StatusBadge value={value}/>:<span className="block truncate">{value}</span>}</td>
  }

  const declineModalName = pendingDeclineRowIdx!==null ? filteredRows[pendingDeclineRowIdx]?.full_name||filteredRows[pendingDeclineRowIdx]?.handle||"this influencer" : "this influencer"

  return (
    <div className="flex flex-col gap-4">
      {/* ★ TOAST NOTIFICATIONS */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <ConfirmationDialog isOpen={confirmDialog.isOpen} onClose={()=>setConfirmDialog(p=>({...p,isOpen:false}))} onConfirm={confirmDialog.onConfirm} title={confirmDialog.title} message={confirmDialog.message} variant={confirmDialog.variant}/>

      {/* ★ DUPLICATE POPUP */}
      {pendingDuplicateInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e=>{if(e.target===e.currentTarget){setPendingDuplicateInfo(null)}}}>
          <div className="bg-white rounded-2xl shadow-xl w-[440px] p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-full flex-shrink-0"><IconAlertTriangle size={24} className="text-amber-600" /></div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Duplicate Handle Detected</h3>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium text-gray-700">@{pendingDuplicateInfo.handle}</span> already exists in the table<span className="font-medium text-gray-700"></span>.
                </p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-amber-800">This row has been grayed out and locked. To edit it, change the handle to a unique username or delete this row.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>{
                // Clear handle back to @ and remove duplicate status
                const rid = pendingDuplicateInfo.rowId;
                setRows(prev => {
                  const next = prev.map(r => r.id === rid ? {...r, handle: "@"} : r);
                  onRowsChange?.(next);
                  return next;
                });
                setDuplicateRowIds(prev => { const n = new Set(prev); n.delete(rid); return n; });
                setPendingDuplicateInfo(null);
              }} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">Clear Handle</button>
              <button onClick={()=>setPendingDuplicateInfo(null)} className="flex-1 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm hover:bg-amber-700 transition">Keep as Duplicate</button>
            </div>
          </div>
        </div>
      )}
      <DeclineConfirmationModal isOpen={showDeclineModal} onClose={()=>{setShowDeclineModal(false);setPendingDeclineRowIdx(null)}} onConfirm={handleDeclineConfirm} influencerName={declineModalName}/>
      <ManageOptionsModal isOpen={showManageNiches} onClose={()=>setShowManageNiches(false)} title="Niches" options={nicheOptions} onSave={setNicheOptions}/>
      <ManageOptionsModal isOpen={showManageLocations} onClose={()=>setShowManageLocations(false)} title="Locations" options={locationOptions} onSave={setLocationOptions}/>
      <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden"/>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md"><IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search creators..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"/></div>
        <div className="flex items-center gap-2">
          {selectedRowIds.size>0&&!readOnly&&(<button onClick={deleteSelectedRows} className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"><IconTrash size={16}/> Delete {selectedRowIds.size}</button>)}
          {!readOnly&&(<div className="relative"><button ref={importExportBtnRef} onClick={()=>setShowImportExportMenu(!showImportExportMenu)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"><IconDownload size={16}/> Import/Export <IconChevronDown size={14}/></button>{showImportExportMenu&&(<div ref={importExportRef} className="absolute top-full right-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl w-[220px] py-1"><button onClick={()=>fileInputRef.current?.click()} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><IconUpload size={16} className="text-gray-400"/> Import CSV</button><button onClick={()=>{downloadTemplate(customCols);setShowImportExportMenu(false)}} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><IconDownload size={16} className="text-gray-400"/> Download Template</button><div className="border-t border-gray-100 my-1"/><button onClick={()=>{exportToCSV(filteredRows,customCols);setShowImportExportMenu(false)}} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><IconDownload size={16} className="text-gray-400"/> Export CSV</button></div>)}</div>)}
          {!readOnly&&(<div className="relative group"><button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"><IconSettings size={16}/> Manage</button><div className="absolute top-full right-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl w-[180px] py-1 hidden group-hover:block"><button onClick={()=>setShowManageNiches(true)} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><IconTags size={16} className="text-gray-400"/> Niches</button><button onClick={()=>setShowManageLocations(true)} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><IconMapPin size={16} className="text-gray-400"/> Locations</button></div></div>)}
          <div className="relative"><button ref={filterBtnRef} onClick={()=>setShowFilterPopover(!showFilterPopover)} className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition border ${hasActiveFilters?"bg-green-50 text-green-700 border-green-200":"text-gray-600 hover:bg-gray-100 border-gray-200"}`}><IconFilter size={16}/> Filters {hasActiveFilters&&<span className="w-2 h-2 bg-green-500 rounded-full"/>}</button><FilterPopover isOpen={showFilterPopover} onClose={()=>setShowFilterPopover(false)} filters={filters} onApplyFilters={handleApplyFilters} onClearFilters={handleClearFilters} niches={nicheOptions} locations={locationOptions} anchorRef={filterBtnRef}/></div>
        </div>
      </div>

      {hasActiveFilters&&(<div className="flex items-center gap-2 flex-wrap"><span className="text-xs text-gray-500">Active filters:</span>{filters.tier!=="all"&&<div className="flex items-center gap-1.5 bg-blue-50 rounded-full px-3 py-1 text-xs"><span className="text-blue-700">Tier: {filters.tier}</span><button onClick={()=>setFilters(p=>({...p,tier:"all"}))} className="text-blue-400 hover:text-blue-600"><IconX size={12}/></button></div>}{filters.platform!=="all"&&<div className="flex items-center gap-1.5 bg-blue-50 rounded-full px-3 py-1 text-xs"><span className="text-blue-700">Platform: {filters.platform}</span><button onClick={()=>setFilters(p=>({...p,platform:"all"}))} className="text-blue-400 hover:text-blue-600"><IconX size={12}/></button></div>}{filters.niche!=="all"&&<div className="flex items-center gap-1.5 bg-blue-50 rounded-full px-3 py-1 text-xs"><span className="text-blue-700">Niche: {filters.niche}</span><button onClick={()=>setFilters(p=>({...p,niche:"all"}))} className="text-blue-400 hover:text-blue-600"><IconX size={12}/></button></div>}{filters.location!=="all"&&<div className="flex items-center gap-1.5 bg-blue-50 rounded-full px-3 py-1 text-xs"><span className="text-blue-700">Location: {filters.location}</span><button onClick={()=>setFilters(p=>({...p,location:"all"}))} className="text-blue-400 hover:text-blue-600"><IconX size={12}/></button></div>}{filters.community!=="all"&&<div className="flex items-center gap-1.5 bg-blue-50 rounded-full px-3 py-1 text-xs"><span className="text-blue-700">Community: {filters.community}</span><button onClick={()=>setFilters(p=>({...p,community:"all"}))} className="text-blue-400 hover:text-blue-600"><IconX size={12}/></button></div>}<button onClick={handleClearFilters} className="text-xs text-gray-400 hover:text-gray-600">Clear all</button></div>)}

      <AddRowsModal isOpen={showAddRowsModal} onClose={()=>setShowAddRowsModal(false)} onAdd={handleAddMultipleRows} selectedCount={selectedRowIds.size}/>
      {sidebarRow&&<ProfileSidebar row={sidebarRow} customCols={customCols} onUpdate={handleUpdateRow} onClose={()=>setSidebarRowId(null)} readOnly={readOnly} niches={nicheOptions} locations={locationOptions} onAddNiche={v=>setNicheOptions(p=>[...p,v])} onAddLocation={v=>setLocationOptions(p=>[...p,v])} onToast={addToast} brandId={brandId}/>}

      <div className="w-full min-w-0">
        <div ref={containerRef} tabIndex={0} className="overflow-auto border border-gray-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-200" onKeyDown={handleContainerKeyDown} onMouseDown={e=>{const t=e.target as HTMLElement;if(t.closest("input, select, button, [tabindex]")&&t!==containerRef.current)return;setTimeout(()=>containerRef.current?.focus(),0)}}>
          <table className="text-sm border-collapse" style={{minWidth:"max-content"}}>
            <thead className="sticky top-0 z-10">
              <tr><th rowSpan={2} className="border border-gray-200 bg-gray-50 w-10 min-w-[2.5rem] text-center text-xs text-gray-400 font-normal">#</th>{groupSpans.map((g,i)=><th key={`${g.group}-${i}`} colSpan={g.span} className={`border border-gray-200 text-center text-xs font-semibold py-1.5 px-3 whitespace-nowrap ${getGroupBgClass(g.group)}`}>{g.group}</th>)}{!readOnly&&<th rowSpan={2} className="border border-gray-200 bg-gray-50 text-center"><button onClick={()=>setAddingCol(true)} className="px-2 py-1 mx-auto flex items-center justify-center gap-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition text-xs"><IconPlus size={12}/><span>Add column</span></button></th>}<th rowSpan={2} className="border border-gray-200 bg-gray-50 w-10 min-w-[2.5rem]"/></tr>
              <tr>{allCols.map((col,vi)=>{const isDragging=dragIdx===vi;const isOver=dragOverIdx===vi&&dragIdx!==vi;return <th key={col.key} draggable={!readOnly} onDragStart={e=>onColDragStart(vi,e)} onDragOver={e=>onColDragOver(vi,e)} onDragEnd={onColDragEnd} className={`border border-gray-200 px-2 py-1.5 text-left text-xs font-semibold text-gray-600 whitespace-nowrap group/col transition-all ${getColHeaderBgClass(col.group)} ${isDragging?"opacity-40":""} ${isOver?"border-l-2 !border-l-blue-500":""}`} style={{minWidth:col.minWidth,cursor:readOnly?"default":"grab"}}><div className="flex items-center justify-between gap-1"><div className="flex items-center gap-1">{!readOnly&&<IconGripVertical size={12} className="text-gray-300 flex-shrink-0 opacity-0 group-hover/col:opacity-100 transition"/>}<span>{col.label}</span></div>{!readOnly&&col.isCustom&&<button onClick={()=>deleteCustomCol((col as CustomColDef).fieldKey)} className="opacity-0 group-hover/col:opacity-100 p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><IconX size={12}/></button>}</div></th>})}</tr>
            </thead>
            <tbody>
              {pageRows.map((row,li)=>{const ri=pageStart+li;const isSel=selectedRowIds.has(row.id);const isDeclined=row.approval_status==="Declined";const isFetching=fetchingRows.has(row.id);const isDup=duplicateRowIds.has(row.id);return(
                <tr key={row.id} className={`group cursor-pointer transition-colors ${isSel?"bg-blue-100":"hover:bg-gray-50/60"} ${isDeclined?"bg-red-50/30":""} ${isDup?"bg-amber-50/50 opacity-60":""}`} onClick={e=>handleRowSelect(row.id,e)} onDoubleClick={()=>handleRowDoubleClick(row.id)}>
                  {/* ★ ROW NUMBER with loading spinner */}
                  <td className="border border-gray-200 text-center text-xs text-gray-400 bg-gray-50/40 select-none"><div className="flex items-center justify-center gap-1">{isFetching?<IconLoader2 size={14} className="text-green-600 animate-spin"/>:<>{isSel&&<IconCheck size={12} className="text-blue-600"/>}{ri+1}</>}</div></td>
                  {allCols.map((col,ci)=>renderCell(row,ri,col,ci))}
                  {!readOnly&&<td className="border border-gray-200 bg-gray-50/40"/>}
                  <td className="border border-gray-200 text-center bg-gray-50/40">{!readOnly&&<button onClick={e=>{e.stopPropagation();deleteRow(row.id)}} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition"><IconTrash size={14}/></button>}</td>
                </tr>)})}
              {totalRows===0&&<tr><td colSpan={totalCols+3} className="py-10 text-center text-sm text-gray-400">No influencers found.</td></tr>}
            </tbody>
            {!readOnly&&<tfoot><tr><td colSpan={totalCols+3} className="border-t border-gray-200"><div className="flex items-center"><button onClick={addRow} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 transition"><IconPlus size={14}/> Add row</button><button onClick={()=>setShowAddRowsModal(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition border-l border-gray-200"><IconCopy size={14}/> Add multiple rows</button></div></td></tr></tfoot>}
          </table>
        </div>
        {totalRows>0&&(<div className="flex items-center justify-between gap-4 text-sm text-gray-600 px-1 mt-3 flex-wrap"><div className="flex items-center gap-2"><span className="text-gray-500">Rows per page:</span><select value={rowsPerPage} onChange={e=>{setRowsPerPage(Number(e.target.value));setCurrentPage(1)}} className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white outline-none"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select>{selectedRowIds.size>0&&<span className="ml-4 text-xs text-blue-600">{selectedRowIds.size} selected</span>}</div><div className="flex items-center gap-2"><span className="text-gray-400 text-xs">{pageStart+1}–{pageEnd} of {totalRows}</span><div className="flex gap-1"><button onClick={()=>setCurrentPage(1)} disabled={currentPage===1} className="px-2 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50 transition">«</button><button onClick={()=>setCurrentPage(p=>Math.max(p-1,1))} disabled={currentPage===1} className="px-3 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50 transition">Prev</button><span className="px-3 py-1 border border-gray-200 rounded-lg text-xs bg-white min-w-[70px] text-center">{currentPage}/{totalPages}</span><button onClick={()=>setCurrentPage(p=>Math.min(p+1,totalPages))} disabled={currentPage===totalPages} className="px-3 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50 transition">Next</button><button onClick={()=>setCurrentPage(totalPages)} disabled={currentPage===totalPages} className="px-2 py-1 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50 transition">»</button></div></div></div>)}
      </div>

      {!readOnly&&(<div className="flex items-center gap-4 px-1 flex-wrap">{[{keys:["Ctrl","Click"],label:"Multi-select"},{keys:["Shift","Click"],label:"Range select"},{keys:["↑","↓","←","→"],label:"Navigate"},{keys:["Enter"],label:"Edit"},{keys:["Tab"],label:"Next cell"},{keys:["Esc"],label:"Cancel"},{keys:["Del"],label:"Clear"},{keys:["Dbl-click"],label:"View Profile"}].map(({keys,label})=>(<div key={label} className="flex items-center gap-1">{keys.map(k=><kbd key={k} className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-[10px] font-mono text-gray-500 shadow-sm leading-none">{k}</kbd>)}<span className="text-[11px] text-gray-400 ml-0.5">{label}</span></div>))}<div className="flex items-center gap-1 ml-2 border-l border-gray-200 pl-3"><IconGripVertical size={12} className="text-gray-400"/><span className="text-[11px] text-gray-400">Drag custom columns to assign groups</span></div></div>)}

      {!readOnly&&addingCol&&(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={e=>{if(e.target===e.currentTarget)setAddingCol(false)}}><div className="bg-white rounded-2xl shadow-xl w-[420px] p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"><div><h3 className="text-base font-semibold text-gray-900">Add custom column</h3></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Column Name *</label><input ref={newColInputRef} type="text" value={newColName} onChange={e=>setNewColName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")confirmAddCol();if(e.key==="Escape")setAddingCol(false)}} placeholder="e.g., Preferred Contact Time" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-400 w-full"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><input type="text" value={newColDescription} onChange={e=>setNewColDescription(e.target.value)} placeholder="Optional" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-400 w-full"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label><select value={newColType} onChange={e=>setNewColType(e.target.value as any)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-400 w-full bg-white"><option value="text">Text</option><option value="number">Number</option><option value="dropdown">Dropdown</option><option value="multi-select">Multi-select</option><option value="date">Date</option><option value="boolean">Yes/No</option><option value="url">URL</option></select></div>{(newColType==="dropdown"||newColType==="multi-select")&&(<div><label className="block text-sm font-medium text-gray-700 mb-1">Options</label><input type="text" value={newColOpts} onChange={e=>setNewColOpts(e.target.value)} placeholder="A, B, C" className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-400 w-full"/></div>)}<div><label className="block text-sm font-medium text-gray-700 mb-1">Section</label><select value={newColGroup} onChange={e=>setNewColGroup(e.target.value as any)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-blue-400 w-full bg-white"><option value="Influencer Details">Influencer Details</option><option value="Approval Details">Approval Details</option><option value="Outreach Details">Outreach Details</option></select></div><div className="flex gap-2 pt-1"><button onClick={()=>setAddingCol(false)} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button><button onClick={confirmAddCol} disabled={!newColName.trim()} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-40 transition">Add Column</button></div></div></div>)}
    </div>
  )
}