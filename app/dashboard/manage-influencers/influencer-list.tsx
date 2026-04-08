"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import {
  IconSearch,
  IconTrash,
  IconLayoutKanban,
} from "@tabler/icons-react"

import AddInfluencerModal from "./modal/AddInfluencerModal"
import AddManualInfluencer from "./modal/AddManualInfluencer"
import AddInstagramInfluencer from "./modal/AddInstagramInfluencer"
import AddTiktokCreator from "./modal/AddTiktokCreator"
import ImportInfluencerList from "./modal/ImportInfluencerList"
import InfluencerProfileSidebar, {
  type Partner,
  type Campaign,
} from "@/components/InfluencerProfileSidebar"

// Import the JSON data
import jsonData from "@/app/dashboard/data.json"

// ─── Map raw JSON influencer → Partner (nulls/zeros for missing data) ───────
const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"]

function parseFollowers(raw: string): number {
  if (!raw) return 0
  const cleaned = raw.replace(/,/g, "").trim().toLowerCase()
  if (cleaned.endsWith("m")) return parseFloat(cleaned) * 1_000_000
  if (cleaned.endsWith("k")) return parseFloat(cleaned) * 1_000
  return parseInt(cleaned, 10) || 0
}

function parseEngagement(raw: string): number {
  if (!raw) return 0
  return parseFloat(raw.replace("%", "").trim()) || 0
}

function toPartner(inf: any): Partner {
  const nameParts = (inf.influencer || "").split(" ")
  const firstName = nameParts[0] || (inf.instagramHandle || "").replace("@", "").slice(0, 6) || ""
  const lastName = nameParts.slice(1).join(" ") || ""
  const fol = parseFollowers(inf.followers || "")
  const eng = parseEngagement(inf.engagementRate || "")

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

// ─── Component ──────────────────────────────────────────────────────────────
export default function InfluencerList() {
  const [view, setView] = useState<"table" | "kanban">("table")
  const [influencers, setInfluencers] = useState<any[]>([])

  // Sidebar state (replaces old profile modal)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)

  const [openModal, setOpenModal] = useState(false)
  const [openImport, setOpenImport] = useState(false)
  const [modalType, setModalType] = useState<"select" | "manual" | "instagram" | "tiktok">("select")

  // Load data from JSON file on component mount
  useEffect(() => {
    if (jsonData && Array.isArray(jsonData)) {
      setInfluencers(jsonData)
    }
  }, [])

  // Open the shared sidebar for any influencer row/card
  const openProfile = (item: any) => {
    setSelectedPartner(toPartner(item))
    setSidebarOpen(true)
  }

  const deleteInfluencer = (id: number) => {
    setInfluencers((prev) => prev.filter((item) => item.id !== id))
  }

  const addInfluencer = (newInfluencer: any) => {
    const newId = influencers.length > 0 ? Math.max(...influencers.map((i) => i.id)) + 1 : 1
    setInfluencers((prev) => [...prev, { ...newInfluencer, id: newId }])
  }

  const getDisplayStatus = (pipelineStatus: string) => {
    switch (pipelineStatus) {
      case "Onboarded": return "Active"
      case "In Conversation": return "Negotiation"
      case "Reached Out": return "For Outreach"
      case "Prospect": return "For Outreach"
      case "Rejected": return "Closed"
      default: return pipelineStatus || "For Outreach"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "For Outreach": return "bg-[#1FAE5B]/15 text-[#0F6B3E]"
      case "Negotiation": return "bg-blue-100 text-blue-700"
      case "Active": return "bg-green-100 text-green-700"
      case "Closed": return "bg-gray-100 text-gray-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="relative">
      <div className="p-6 flex flex-col gap-6">

        {/* HEADER */}
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-[320px] max-w-[650px] relative">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search influencer" className="pl-9 h-10 w-full" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { setModalType("select"); setOpenModal(true) }} className="bg-[#1FAE5B] text-white px-4 py-2 rounded-lg text-sm">+ New Influencer</button>
            <button onClick={() => setOpenImport(true)} className="h-10 px-4 border rounded-lg text-sm">Import</button>
            <button className="h-10 px-4 border rounded-lg text-sm">Export</button>
            <button className="h-10 px-4 border rounded-lg text-sm">Filter</button>
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="flex justify-end items-center gap-2">
          <button onClick={() => setView(view === "table" ? "kanban" : "table")} className="h-9 w-9 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100 transition">
            <IconLayoutKanban size={18} />
          </button>
          <button className="h-9 px-3 flex items-center border border-[#0F6B3E]/20 rounded-md text-sm hover:bg-[#0F6B3E]/10 transition">Add to Pipeline</button>
          <button className="h-9 px-3 flex items-center border border-red-300 rounded-md text-sm text-red-500 hover:bg-red-50 transition">Remove</button>
        </div>

        {/* TABLE VIEW */}
        {view === "table" && (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2">Profile</th>
                  <th className="px-3 py-2">Influencer</th>
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Followers</th>
                  <th className="px-3 py-2">ENG</th>
                  <th className="px-3 py-2">Niche</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {influencers.map((item) => {
                  const displayStatus = getDisplayStatus(item.pipelineStatus)
                  return (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2"><input type="checkbox" /></td>
                      <td className="px-3 py-2 cursor-pointer" onClick={() => openProfile(item)}>
                        <div className="w-9 h-9 rounded-full bg-[#1FAE5B]/20 flex items-center justify-center">
                          <span className="text-sm font-medium">{item.influencer?.charAt(0) || "?"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 font-medium cursor-pointer" onClick={() => openProfile(item)}>{item.influencer}</td>
                      <td className="px-3 py-2 text-[#0F6B3E] font-medium">{item.instagramHandle}</td>
                      <td className="px-3 py-2">{item.followers}</td>
                      <td className="px-3 py-2">{item.engagementRate}</td>
                      <td className="px-3 py-2">{item.niche}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-[2px] rounded text-xs ${getStatusColor(displayStatus)}`}>{displayStatus}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs">JD</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <button onClick={() => deleteInfluencer(item.id)} className="text-red-500 hover:text-red-700 transition">
                          <IconTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {influencers.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-500">
                      No influencers found. Click &quot;+ New Influencer&quot; to add some.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* KANBAN VIEW */}
        {view === "kanban" && (
          <div className="grid grid-cols-4 gap-4">
            {["For Outreach", "Negotiation", "Active", "Closed"].map((stage) => {
              const stageInfluencers = influencers.filter((item) => getDisplayStatus(item.pipelineStatus) === stage)
              return (
                <div key={stage} className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3">{stage} ({stageInfluencers.length})</h3>
                  <div className="flex flex-col gap-3">
                    {stageInfluencers.map((item) => (
                      <div key={item.id} className="bg-white border rounded-lg p-3 cursor-pointer hover:shadow-md transition" onClick={() => openProfile(item)}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-[#1FAE5B]/20 flex items-center justify-center">
                            <span className="text-xs font-medium">{item.influencer?.charAt(0) || "?"}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.influencer}</p>
                            <p className="text-xs text-gray-500">{item.instagramHandle}</p>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>📊 {item.followers}</span>
                          <span>💬 {item.engagementRate}</span>
                        </div>
                        <div className="text-xs text-gray-400">🏷️ {item.niche}</div>
                      </div>
                    ))}
                    {stageInfluencers.length === 0 && (
                      <div className="text-center py-4 text-gray-400 text-sm">No influencers in {stage}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Profile Sidebar (shared component) ── */}
      {sidebarOpen && selectedPartner && (
        <InfluencerProfileSidebar
          partner={selectedPartner}
          campaigns={[] as Campaign[]}
          allPartners={[]}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* ADD INFLUENCER MODALS */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[560px] rounded-2xl shadow-xl p-8">
            {modalType === "select" && <AddInfluencerModal setType={setModalType} onClose={() => setOpenModal(false)} />}
            {modalType === "manual" && <AddManualInfluencer close={() => setModalType("select")} onAdd={addInfluencer} />}
            {modalType === "instagram" && <AddInstagramInfluencer close={() => setModalType("select")} onAdd={addInfluencer} />}
            {modalType === "tiktok" && <AddTiktokCreator close={() => setModalType("select")} onAdd={addInfluencer} />}
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {openImport && <ImportInfluencerList close={() => setOpenImport(false)} onImport={setInfluencers} />}
    </div>
  )
}